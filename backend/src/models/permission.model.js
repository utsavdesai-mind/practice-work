const mongoose = require("mongoose");

const permissionSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    key: { type: String, required: true, unique: true },
    module: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Permission", permissionSchema);