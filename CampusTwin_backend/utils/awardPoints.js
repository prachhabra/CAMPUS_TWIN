const User = require('../models/User');
const Notification = require('../models/Notification');

const awardPointsAndBadge = async (userId, pointsToAdd, badgeData = null, reason = '') => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    user.points = (user.points || 0) + pointsToAdd;

    if (badgeData && (!user.badges || !user.badges.some((b) => b.badgeId === badgeData.badgeId))) {
      user.badges.push({
        badgeId: badgeData.badgeId,
        name: badgeData.name,
        icon: badgeData.icon || 'Award',
        awardedAt: new Date()
      });

      // Send badge notification
      await Notification.create({
        recipient: userId,
        title: 'New Badge Unlocked!',
        message: `Congratulations! You unlocked the "${badgeData.name}" badge and earned +${pointsToAdd} points!`,
        type: 'system'
      });
    } else if (pointsToAdd > 0) {
      await Notification.create({
        recipient: userId,
        title: 'Points Earned!',
        message: `You earned +${pointsToAdd} Campus Points for ${reason || 'activity'}!`,
        type: 'system'
      });
    }

    await user.save();
  } catch (err) {
    console.error('Error awarding points/badge:', err.message);
  }
};

module.exports = { awardPointsAndBadge };
