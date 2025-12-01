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
      required: true,
    },
    recipientUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
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
