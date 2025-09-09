const Newsletter = require('../models/Newsletter');

// Subscribe to newsletter
const subscribe = async (req, res) => {
  try {
    const { email, preferences } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required' 
      });
    }

    // Check if email already exists
    const existingSubscription = await Newsletter.findOne({ email });
    if (existingSubscription) {
      if (existingSubscription.isActive) {
        return res.status(400).json({ 
          success: false, 
          message: 'Email is already subscribed to our newsletter' 
        });
      } else {
        // Reactivate subscription
        existingSubscription.isActive = true;
        existingSubscription.subscribedAt = new Date();
        if (preferences) {
          existingSubscription.preferences = { ...existingSubscription.preferences, ...preferences };
        }
        await existingSubscription.save();
        
        return res.status(200).json({ 
          success: true, 
          message: 'Successfully reactivated your newsletter subscription!' 
        });
      }
    }

    // Create new subscription
    const newSubscription = new Newsletter({
      email,
      preferences: preferences || {
        dailyNews: true,
        breakingNews: true,
        weeklyDigest: true
      }
    });

    await newSubscription.save();

    res.status(201).json({ 
      success: true, 
      message: 'Successfully subscribed to newsletter!' 
    });

  } catch (error) {
    console.error('Newsletter subscription error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to subscribe. Please try again later.' 
    });
  }
};

// Unsubscribe from newsletter
const unsubscribe = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required' 
      });
    }

    const subscription = await Newsletter.findOne({ email });
    if (!subscription) {
      return res.status(404).json({ 
        success: false, 
        message: 'Email not found in our newsletter list' 
      });
    }

    subscription.isActive = false;
    await subscription.save();

    res.status(200).json({ 
      success: true, 
      message: 'Successfully unsubscribed from newsletter' 
    });

  } catch (error) {
    console.error('Newsletter unsubscription error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to unsubscribe. Please try again later.' 
    });
  }
};

// Get newsletter stats (admin only)
const getStats = async (req, res) => {
  try {
    const totalSubscribers = await Newsletter.countDocuments({ isActive: true });
    const totalUnsubscribed = await Newsletter.countDocuments({ isActive: false });
    const recentSubscribers = await Newsletter.find({ isActive: true })
      .sort({ subscribedAt: -1 })
      .limit(10)
      .select('email subscribedAt');

    res.status(200).json({
      success: true,
      data: {
        totalSubscribers,
        totalUnsubscribed,
        recentSubscribers
      }
    });

  } catch (error) {
    console.error('Newsletter stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get newsletter stats' 
    });
  }
};

module.exports = {
  subscribe,
  unsubscribe,
  getStats
};
