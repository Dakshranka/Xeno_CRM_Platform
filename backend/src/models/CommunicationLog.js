const mongoose = require('mongoose');

const CommunicationLogSchema = new mongoose.Schema({
  campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  channel: { type: String, enum: ['email', 'sms', 'push'], required: true },
  status: { type: String, enum: ['SENT', 'FAILED'], required: true },
  message: String,
  receiptId: String,
  sentAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  openedAt: { type: Date },
  clickedAt: { type: Date }
});

module.exports = mongoose.model('CommunicationLog', CommunicationLogSchema);
