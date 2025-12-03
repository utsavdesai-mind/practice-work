const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: false },
    password: { type: String },
    invitationOTP: { type: String },
    invitationToken: { type: String },
    invitationTokenExpiry: { type: Date },
    isAccepted: { type: Boolean, default: false },
    is_first_login: { type: Boolean, default: true },
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
    },
  },
  { timestamps: true }
);

// This ensures that no two documents can have the same combination of role, company, and email.
userSchema.index(
    { role: 1, company: 1, email: 1 }, 
    { unique: true, partialFilterExpression: { role: { $exists: true }, company: { $exists: true } } }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Remove password from the returned user object
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model("User", userSchema);
