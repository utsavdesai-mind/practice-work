const Credentials = require("../models/credentials.model");
const User = require("../models/user.model");
const Company = require("../models/company.model");
const Department = require("../models/department.model");
const ApiError = require("../utils/ApiError");
const crypto = require("crypto");
const CredentialShareToken = require("../models/credentialShareToken.model");
const nodemailer = require("nodemailer");

require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const generateShareToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

exports.createCredential = async (userId, data) => {
  const company = await Company.findById(data.company);
  if (!company) {
    throw new ApiError(404, "Company not found");
  }

  const credential = new Credentials({
    ...data,
    userId,
  });

  return await credential.save();
};

exports.getCredentials = async (query = {}) => {
  if(!query.company) {
    throw new ApiError(404, "Company is required");
  }

  let filter = { company: query.company };

  if(query.userId) {
    filter = { userId: query.userId };
  }

  if (query.search) {
    filter.$or = [
      { name: { $regex: query.search, $options: "i" } },
      { url: { $regex: query.search, $options: "i" } },
    ];
  }

  return await Credentials.find(filter).populate("userId").sort({ createdAt: -1 });
};

exports.getCredentialById = async (credentialId, userId) => {
  const credential = await Credentials.findById(credentialId);

  if (!credential) {
    throw new ApiError(404, "Credential not found");
  }

  if (credential.userId.toString() !== userId.toString()) {
    throw new ApiError(403, "Unauthorized access to this credential");
  }

  return credential;
};

exports.updateCredential = async (credentialId, data) => {
  const credential = await Credentials.findByIdAndUpdate(credentialId, data, {
    new: true,
    runValidators: true,
  });

  if (!credential) {
    throw new ApiError(404, "Credential not found");
  }

  return credential;
};

exports.deleteCredential = async (credentialId) => {
  const credential = await Credentials.findByIdAndDelete(credentialId);

  if (!credential) {
    throw new ApiError(404, "Credential not found");
  }

  return credential;
};

exports.shareCredential = async (credentialId, userId, shareData) => {
  const credential = await Credentials.findById(credentialId);

  if (!credential) {
    throw new ApiError(404, "Credential not found");
  }

  // Handle individual sharing by email
  if (shareData.email) {
    const recipient = await User.findOne({ email: shareData.email, company: shareData.company });
    if (!recipient) {
      throw new ApiError(404, "Recipient user not found");
    }

    const shareToken = generateShareToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const shareRecord = new CredentialShareToken({
      credentialId,
      shareToken,
      recipientEmail: shareData.email,
      recipientUserId: recipient._id,
      ownerId: userId,
      expiresAt,
    });

    await shareRecord.save();

    await sendShareEmail(
      shareData.email,
      recipient.name,
      credential.name,
      shareToken,
      expiresAt
    );

    return {
      message: `Credential shared successfully with 1 recipient`,
      recipients: [{ email: shareData.email, name: recipient.name }],
    };
  }

  if (shareData.department) {
    const department = await Department.findById(shareData.department);
    if (!department) {
      throw new ApiError(404, "Department not found");
    }

    const departmentUsers = await User.find({
      department: shareData.department,
    });

    if (departmentUsers.length === 0) {
      throw new ApiError(404, "No users found in the specified department");
    }

    const shareToken = generateShareToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Save share token to database
    const shareRecord = new CredentialShareToken({
      credentialId,
      shareToken,
      departmentId: shareData.department,
      ownerId: userId,
      expiresAt,
    });

    await shareRecord.save();

    for (const user of departmentUsers) {
      try {
        await sendShareEmail(
          user.email,
          user.name,
          credential.name,
          shareToken,
          expiresAt
        );
      } catch (err) {
        console.error(
          `Failed to send department share email to ${user.email}:`,
          err
        );
      }
    }

    return {
      message: `Credential shared successfully with ${departmentUsers.length} recipient(s) via department`,
      recipients: departmentUsers.map((u) => ({
        email: u.email,
        name: u.name,
      })),
    };
  }

  throw new ApiError(400, "No valid share target provided");
};

exports.accessSharedCredential = async (shareToken, userId) => {
  const shareRecord = await CredentialShareToken.findOne({ shareToken });

  if (!shareRecord) {
    throw new ApiError(404, "Invalid share token or access denied");
  }

  if (shareRecord.expiresAt < new Date()) {
    throw new ApiError(401, "Share token has expired");
  }

  const credential = await Credentials.findById(
    shareRecord.credentialId
  ).populate("userId");

  if (!credential) {
    throw new ApiError(404, "Shared credential not found");
  }

  if (shareRecord.departmentId) {
    const requestingUser = await User.findById(userId);
    if (!requestingUser) {
      throw new ApiError(404, "Requesting user not found");
    }

    if (
      !requestingUser.department ||
      requestingUser.department.toString() !==
        shareRecord.departmentId.toString()
    ) {
      throw new ApiError(
        403,
        "Access denied: not a member of the shared department"
      );
    }

    // If this department-share hasn't recorded this user's access yet, add it
    shareRecord.accessedBy = shareRecord.accessedBy || [];
    const alreadyAccessed = shareRecord.accessedBy.some(
      (a) => a.userId && a.userId.toString() === userId.toString()
    );

    if (!alreadyAccessed) {
      shareRecord.accessedBy.push({ userId: requestingUser._id, accessedAt: new Date() });

      // Check if all users in the department have accessed
      const departmentUsers = await User.find({ department: shareRecord.departmentId });
      const uniqueAccessCount = new Set(
        shareRecord.accessedBy.map((a) => a.userId.toString())
      ).size;

      if (departmentUsers.length > 0 && uniqueAccessCount >= departmentUsers.length) {
        shareRecord.accessed = true;
        shareRecord.accessedAt = new Date();
      }

      await shareRecord.save();
    }

    return credential;
  }

  if (
    !shareRecord.recipientUserId ||
    shareRecord.recipientUserId.toString() !== userId.toString()
  ) {
    throw new ApiError(404, "Invalid share token or access denied");
  }

  if (shareRecord.accessed) {
    throw new ApiError(403, "This credential share has already been accessed");
  }

  shareRecord.accessed = true;
  shareRecord.accessedAt = new Date();
  await shareRecord.save();

  return credential;
};

// Email template and sending function
const sendShareEmail = async (
  recipientEmail,
  recipientName,
  credentialName,
  shareToken,
  expiresAt
) => {
  const shareUrl = `${process.env.FRONTEND_URL}/shared-credentials/${shareToken}`;

  const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Secure Credential Sharing</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                background-color: #f9fafb;
                margin: 0;
                padding: 0;
            }
            .email-container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                border-radius: 8px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                overflow: hidden;
            }
            .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: #ffffff;
                padding: 40px 20px;
                text-align: center;
            }
            .header h1 {
                margin: 0;
                font-size: 28px;
                font-weight: 600;
            }
            .content {
                padding: 40px 30px;
            }
            .content h2 {
                color: #667eea;
                font-size: 22px;
                margin-bottom: 20px;
            }
            .greeting {
                font-size: 16px;
                margin-bottom: 20px;
                color: #555;
            }
            .credential-info {
                background-color: #f3f4f6;
                border-left: 4px solid #667eea;
                padding: 15px;
                margin: 20px 0;
                border-radius: 4px;
            }
            .credential-info p {
                margin: 8px 0;
                color: #444;
            }
            .credential-name {
                font-weight: 600;
                color: #667eea;
                font-size: 16px;
            }
            .cta-section {
                text-align: center;
                margin: 30px 0;
            }
            .cta-button {
                display: inline-block;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: #ffffff;
                padding: 14px 35px;
                text-decoration: none;
                border-radius: 6px;
                font-weight: 600;
                font-size: 16px;
                transition: transform 0.2s;
            }
            .cta-button:hover {
                transform: translateY(-2px);
            }
            .security-notice {
                background-color: #fffbeb;
                border: 1px solid #fbbf24;
                border-radius: 6px;
                padding: 15px;
                margin: 20px 0;
                font-size: 14px;
                color: #92400e;
            }
            .security-notice strong {
                display: block;
                margin-bottom: 8px;
            }
            .expiry-info {
                background-color: #f0f9ff;
                border: 1px solid #0ea5e9;
                border-radius: 6px;
                padding: 12px;
                margin: 15px 0;
                font-size: 13px;
                color: #0369a1;
            }
            .footer {
                background-color: #f9fafb;
                border-top: 1px solid #e5e7eb;
                padding: 20px;
                text-align: center;
                font-size: 12px;
                color: #6b7280;
            }
            .footer p {
                margin: 5px 0;
            }
            .divider {
                height: 1px;
                background-color: #e5e7eb;
                margin: 30px 0;
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="header">
                <h1>🔐 Secure Credential Access</h1>
            </div>
            
            <div class="content">
                <h2>Hello ${recipientName},</h2>
                
                <p class="greeting">
                    A colleague has securely shared a credential with you. Click the button below to access it.
                </p>
                
                <div class="credential-info">
                    <p><strong>Credential Name:</strong></p>
                    <p class="credential-name">${credentialName}</p>
                </div>
                
                <div class="security-notice">
                    <strong>🔒 Security Notice:</strong>
                    This link is unique and can only be accessed by you. This share will expire in 24 hours.
                </div>
                
                <div class="cta-section">
                    <a href="${shareUrl}" class="cta-button">Access Credential Securely</a>
                </div>
                
                <div class="divider"></div>
                
                <p style="color: #666; font-size: 14px; margin: 15px 0;">
                    If you cannot click the button above, copy and paste this link in your browser:
                </p>
                <p style="background-color: #f3f4f6; padding: 12px; border-radius: 4px; word-break: break-all; font-size: 12px; color: #555;">
                    ${shareUrl}
                </p>
                
                <div class="expiry-info">
                    <strong>⏰ Expiration:</strong> This link will expire on ${expiresAt.toLocaleString()}
                </div>
            </div>
            
            <div class="footer">
                <p>This is an automated message. Please do not reply to this email.</p>
                <p style="margin-top: 15px; color: #9ca3af;">
                    © 2025 Pre-Mind. All rights reserved.
                </p>
            </div>
        </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: recipientEmail,
      subject: `Secure Credential Shared: ${credentialName}`,
      html: htmlTemplate,
    });
  } catch (error) {
    console.error("Error sending email:", error);
    throw new ApiError(500, "Failed to send sharing email");
  }
};
