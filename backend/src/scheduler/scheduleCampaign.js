// backend/src/scheduler/scheduleCampaign.js
const schedule = require('node-schedule');
const Campaign = require('../models/Campaign');
const User = require('../models/User');
const CommunicationLog = require('../models/CommunicationLog');

/**
 * Schedules a campaign to be sent at a specific date/time
 * @param {string} campaignId - The campaign's MongoDB _id
 * @param {Date} scheduledAt - The date/time to send the campaign
 */
function scheduleCampaignSend(campaignId, scheduledAt) {
  schedule.scheduleJob(scheduledAt, async function() {
    try {
      const campaign = await Campaign.findById(campaignId);
      if (!campaign) return;
      const users = await User.find();
      await Promise.all(users.map(async user => {
        const status = Math.random() < 0.9 ? 'SENT' : 'FAILED';
        const message = `Hi ${user.name}, here’s 10% off on your next order!`;
        await CommunicationLog.create({
          campaignId,
          userId: user._id,
          channel: campaign.type || 'email',
          status,
          message,
          sentAt: new Date(),
        });
      }));
      console.log(`Campaign ${campaignId} sent at ${new Date().toISOString()}`);
    } catch (err) {
      console.error('Scheduled campaign send failed:', err);
    }
  });
}

module.exports = { scheduleCampaignSend };
