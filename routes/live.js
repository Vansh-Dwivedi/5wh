const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');

// Mock database for live streams - replace with actual database
let liveStreams = [
  {
    id: 1,
    title: 'Breaking News: Punjab Assembly Session Live',
    description: 'Live coverage of the Punjab Assembly session with real-time updates and analysis.',
    streamUrl: 'https://example.com/stream/punjab-assembly',
    thumbnailUrl: 'https://via.placeholder.com/640x360/c41e3a/ffffff?text=Live+Stream',
    isLive: true,
    viewerCount: 1245,
    startTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
    category: 'News',
    presenter: 'News Anchor',
    language: 'Punjabi',
    createdBy: 'admin',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// GET /api/live - Get all live streams
router.get('/', async (req, res) => {
  try {
    // Sort by live status and start time
    const sortedStreams = liveStreams.sort((a, b) => {
      if (a.isLive && !b.isLive) return -1;
      if (!a.isLive && b.isLive) return 1;
      return new Date(b.startTime || b.scheduledTime) - new Date(a.startTime || a.scheduledTime);
    });

    res.json({
      success: true,
      data: sortedStreams,
      count: sortedStreams.length
    });
  } catch (error) {
    console.error('Error fetching live streams:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching live streams'
    });
  }
});

// GET /api/live/active - Get currently live streams
router.get('/active', async (req, res) => {
  try {
    const activeStreams = liveStreams.filter(stream => stream.isLive);
    
    res.json({
      success: true,
      data: activeStreams,
      count: activeStreams.length
    });
  } catch (error) {
    console.error('Error fetching active streams:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching active streams'
    });
  }
});

// GET /api/live/:id - Get specific live stream
router.get('/:id', async (req, res) => {
  try {
    const stream = liveStreams.find(s => s.id === parseInt(req.params.id));
    
    if (!stream) {
      return res.status(404).json({
        success: false,
        message: 'Live stream not found'
      });
    }

    res.json({
      success: true,
      data: stream
    });
  } catch (error) {
    console.error('Error fetching live stream:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching live stream'
    });
  }
});

// POST /api/live - Create new live stream (Admin only)
router.post('/', auth, async (req, res) => {
  try {
    const {
      title,
      description,
      streamUrl,
      thumbnailUrl,
      category,
      presenter,
      language,
      scheduledTime,
      isLive = false
    } = req.body;

    // Validation
    if (!title || !description || !streamUrl) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, and stream URL are required'
      });
    }

    const newStream = {
      id: liveStreams.length + 1,
      title,
      description,
      streamUrl,
      thumbnailUrl: thumbnailUrl || 'https://via.placeholder.com/640x360/c41e3a/ffffff?text=Live+Stream',
      category: category || 'General',
      presenter: presenter || 'Host',
      language: language || 'Punjabi',
      isLive,
      viewerCount: 0,
      startTime: isLive ? new Date() : null,
      scheduledTime: scheduledTime ? new Date(scheduledTime) : null,
      createdBy: req.user.id,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    liveStreams.push(newStream);

    res.status(201).json({
      success: true,
      message: 'Live stream created successfully',
      data: newStream
    });
  } catch (error) {
    console.error('Error creating live stream:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating live stream'
    });
  }
});

// PUT /api/live/:id - Update live stream (Admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    const streamIndex = liveStreams.findIndex(s => s.id === parseInt(req.params.id));
    
    if (streamIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Live stream not found'
      });
    }

    const updates = req.body;
    const currentStream = liveStreams[streamIndex];

    // Handle going live
    if (updates.isLive && !currentStream.isLive) {
      updates.startTime = new Date();
      updates.viewerCount = 0;
    }

    // Handle stopping live stream
    if (!updates.isLive && currentStream.isLive) {
      updates.endTime = new Date();
    }

    liveStreams[streamIndex] = {
      ...currentStream,
      ...updates,
      updatedAt: new Date()
    };

    res.json({
      success: true,
      message: 'Live stream updated successfully',
      data: liveStreams[streamIndex]
    });
  } catch (error) {
    console.error('Error updating live stream:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating live stream'
    });
  }
});

// DELETE /api/live/:id - Delete live stream (Admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const streamIndex = liveStreams.findIndex(s => s.id === parseInt(req.params.id));
    
    if (streamIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Live stream not found'
      });
    }

    liveStreams.splice(streamIndex, 1);

    res.json({
      success: true,
      message: 'Live stream deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting live stream:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting live stream'
    });
  }
});

// POST /api/live/:id/viewer-count - Update viewer count
router.post('/:id/viewer-count', async (req, res) => {
  try {
    const streamIndex = liveStreams.findIndex(s => s.id === parseInt(req.params.id));
    
    if (streamIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Live stream not found'
      });
    }

    const { count } = req.body;
    
    if (typeof count !== 'number') {
      return res.status(400).json({
        success: false,
        message: 'Viewer count must be a number'
      });
    }

    liveStreams[streamIndex].viewerCount = count;
    liveStreams[streamIndex].updatedAt = new Date();

    res.json({
      success: true,
      message: 'Viewer count updated',
      data: { viewerCount: count }
    });
  } catch (error) {
    console.error('Error updating viewer count:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating viewer count'
    });
  }
});

module.exports = router;
