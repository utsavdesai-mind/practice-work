const mongoose = require("mongoose");

const credentialShareTokenSchema = new mongoose.Schema(
  {
    credentialId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Credentials",
      required: true,
    },
    shareToken: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    recipientEmail: {
      type: String,
      required: false,
    },
    recipientUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: false,
      index: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    accessed: {
      type: Boolean,
      default: false,
    },
    accessedBy: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        accessedAt: {
          type: Date,
        },
      },
    ],
    accessedAt: {
      type: Date,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CredentialShareToken", credentialShareTokenSchema);
