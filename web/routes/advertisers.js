const express = require('express');
const router = express.Router();
const Advertiser = require('../models/Advertiser');
const { auth, editorAuth, adminAuth } = require('../middleware/auth');
const { uploadSingle } = require('../middleware/upload');

// Get all advertisers (public - for sidebar display)
router.get('/', async (req, res) => {
  try {
    const { active, adType, placement } = req.query;
    let query = {};
    
    if (active === 'true') {
      const now = new Date();
      query = {
        isActive: true,
        $or: [
          { startDate: { $exists: false } },
          { startDate: { $lte: now } }
        ]
      };
      
      // Add end date filter
      const endDateQuery = {
        $or: [
          { endDate: { $exists: false } },
          { endDate: { $gte: now } }
        ]
      };
      
      query = { ...query, ...endDateQuery };
    }

    // Filter by ad type if specified
    if (adType) {
      query.adType = adType;
    }

    // Filter by placement if specified
    if (placement) {
      query.placement = placement;
    }
    
    const advertisers = await Advertiser.find(query)
      .sort({ displayOrder: 1, name: 1 })
      .select('-contactEmail -clickCount -impressionCount');
    
    res.json({
      success: true,
      data: advertisers
    });
  } catch (error) {
    console.error('Error fetching advertisers:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching advertisers',
      error: error.message
    });
  }
});

// Get all advertisers (admin only - with full details)
// NOTE: Restrict admin listing to editor/admin roles (was any authenticated user)
router.get('/admin', editorAuth, async (req, res) => {
  try {
    const advertisers = await Advertiser.find()
      .sort({ displayOrder: 1, name: 1 });
    
    res.json({
      success: true,
      data: advertisers
    });
  } catch (error) {
    console.error('Error fetching advertisers for admin:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching advertisers',
      error: error.message
    });
  }
});

// Get single advertiser
router.get('/:id', async (req, res) => {
  try {
    const advertiser = await Advertiser.findById(req.params.id);
    
    if (!advertiser) {
      return res.status(404).json({
        success: false,
        message: 'Advertiser not found'
      });
    }
    
    res.json({
      success: true,
      data: advertiser
    });
  } catch (error) {
    console.error('Error fetching advertiser:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching advertiser',
      error: error.message
    });
  }
});

// Track ad click (public)
router.post('/:id/click', async (req, res) => {
  try {
    const advertiser = await Advertiser.findById(req.params.id);
    if (!advertiser) {
      return res.status(404).json({
        success: false,
        message: 'Advertiser not found'
      });
    }

    await advertiser.incrementClick();
    
    res.json({
      success: true,
      message: 'Click tracked successfully'
    });
  } catch (error) {
    console.error('Error tracking click:', error);
    res.status(500).json({
      success: false,
      message: 'Error tracking click',
      error: error.message
    });
  }
});

// Track ad impression (public)
router.post('/:id/impression', async (req, res) => {
  try {
    const advertiser = await Advertiser.findById(req.params.id);
    if (!advertiser) {
      return res.status(404).json({
        success: false,
        message: 'Advertiser not found'
      });
    }

    await advertiser.incrementImpression();
    
    res.json({
      success: true,
      message: 'Impression tracked successfully'
    });
  } catch (error) {
    console.error('Error tracking impression:', error);
    res.status(500).json({
      success: false,
      message: 'Error tracking impression',
      error: error.message
    });
  }
});

// Create new advertiser (admin only)
// Create new advertiser (editor/admin)
router.post('/', editorAuth, uploadSingle('logo'), async (req, res) => {
  try {
    const advertiserData = {
      name: req.body.name,
      link: req.body.link || '',
      description: req.body.description || '',
      contactEmail: req.body.contactEmail || '',
      displayOrder: parseInt(req.body.displayOrder) || 0,
      isActive: req.body.isActive !== 'false',
      startDate: req.body.startDate ? new Date(req.body.startDate) : undefined,
      endDate: req.body.endDate ? new Date(req.body.endDate) : undefined,
      adType: req.body.adType || 'sidebar',
      placement: req.body.placement || 'right',
      size: {
        width: req.body['size.width'] || req.body.sizeWidth || '300px',
        height: req.body['size.height'] || req.body.sizeHeight || '250px'
      }
    };
    
    // Handle logo upload
    if (req.file) {
      advertiserData.logo = {
        url: `/uploads/${req.file.filename}`,
        alt: req.body.logoAlt || `${req.body.name} logo`,
        filename: req.file.filename
      };
    }
    
    const advertiser = new Advertiser(advertiserData);
    await advertiser.save();
    
    res.status(201).json({
      success: true,
      message: 'Advertiser created successfully',
      data: advertiser
    });
  } catch (error) {
    console.error('Error creating advertiser:', error);
    res.status(400).json({
      success: false,
      message: 'Error creating advertiser',
      error: error.message
    });
  }
});

// Update advertiser (admin only)
// Update advertiser (editor/admin)
router.put('/:id', editorAuth, uploadSingle('logo'), async (req, res) => {
  try {
    const advertiser = await Advertiser.findById(req.params.id);
    
    if (!advertiser) {
      return res.status(404).json({
        success: false,
        message: 'Advertiser not found'
      });
    }
    
    // Update basic fields
    advertiser.name = req.body.name || advertiser.name;
    advertiser.link = req.body.link !== undefined ? req.body.link : advertiser.link;
    advertiser.description = req.body.description !== undefined ? req.body.description : advertiser.description;
    advertiser.contactEmail = req.body.contactEmail !== undefined ? req.body.contactEmail : advertiser.contactEmail;
    advertiser.displayOrder = req.body.displayOrder !== undefined ? parseInt(req.body.displayOrder) : advertiser.displayOrder;
    advertiser.isActive = req.body.isActive !== undefined ? req.body.isActive !== 'false' : advertiser.isActive;
    
    // Update advertisement type and placement
    if (req.body.adType) {
      advertiser.adType = req.body.adType;
    }
    if (req.body.placement) {
      advertiser.placement = req.body.placement;
    }
    
    // Update size if provided
    if (req.body['size.width'] || req.body['size.height']) {
      if (!advertiser.size) {
        advertiser.size = {};
      }
      if (req.body['size.width']) {
        advertiser.size.width = req.body['size.width'];
      }
      if (req.body['size.height']) {
        advertiser.size.height = req.body['size.height'];
      }
    }
    
    if (req.body.startDate) {
      advertiser.startDate = new Date(req.body.startDate);
    }
    if (req.body.endDate) {
      advertiser.endDate = new Date(req.body.endDate);
    }
    
    // Handle logo upload
    if (req.file) {
      advertiser.logo = {
        url: `/uploads/${req.file.filename}`,
        alt: req.body.logoAlt || `${advertiser.name} logo`,
        filename: req.file.filename
      };
    }
    
    await advertiser.save();
    
    res.json({
      success: true,
      message: 'Advertiser updated successfully',
      data: advertiser
    });
  } catch (error) {
    console.error('Error updating advertiser:', error);
    res.status(400).json({
      success: false,
      message: 'Error updating advertiser',
      error: error.message
    });
  }
});

// Delete advertiser (admin only)
// Delete advertiser (admin only for stronger safety)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const advertiser = await Advertiser.findById(req.params.id);
    
    if (!advertiser) {
      return res.status(404).json({
        success: false,
        message: 'Advertiser not found'
      });
    }
    
    await Advertiser.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: 'Advertiser deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting advertiser:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting advertiser',
      error: error.message
    });
  }
});

// Track click (public)
router.post('/:id/click', async (req, res) => {
  try {
    const advertiser = await Advertiser.findById(req.params.id);
    
    if (!advertiser) {
      return res.status(404).json({
        success: false,
        message: 'Advertiser not found'
      });
    }
    
    await advertiser.incrementClick();
    
    res.json({
      success: true,
      message: 'Click tracked'
    });
  } catch (error) {
    console.error('Error tracking click:', error);
    res.status(500).json({
      success: false,
      message: 'Error tracking click',
      error: error.message
    });
  }
});

// Track impression (public)
router.post('/:id/impression', async (req, res) => {
  try {
    const advertiser = await Advertiser.findById(req.params.id);
    
    if (!advertiser) {
      return res.status(404).json({
        success: false,
        message: 'Advertiser not found'
      });
    }
    
    await advertiser.incrementImpression();
    
    res.json({
      success: true,
      message: 'Impression tracked'
    });
  } catch (error) {
    console.error('Error tracking impression:', error);
    res.status(500).json({
      success: false,
      message: 'Error tracking impression',
      error: error.message
    });
  }
});

module.exports = router;
