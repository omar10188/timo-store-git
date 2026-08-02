const mongoose = require("mongoose");

const emailSettingsSchema = new mongoose.Schema(
  {
    enabled: {
      type: Boolean,
      default: true,
    },
    orderConfirmation: {
      type: Boolean,
      default: true,
    },
    statusUpdates: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// We'll create a singleton pattern where only one document exists.
// We can use a pre-save hook to ensure no other documents are created, 
// but it's easier to just upsert a specific document ID.

module.exports = mongoose.model("EmailSettings", emailSettingsSchema);
