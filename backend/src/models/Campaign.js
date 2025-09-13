const mongoose = require('mongoose');

const CampaignSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: String,
  status: String,
  type: String,
  audienceSize: Number,
  deliveryRate: Number,
  openRate: Number,
  clickRate: Number,
  createdAt: Date,
  scheduledAt: Date,
  content: {
    subject: String,
    message: String,
    template: String
  },
  targeting: {
    segments: [String],
    filters: Object
  }
});

module.exports = mongoose.model('Campaign', CampaignSchema);
