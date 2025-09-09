const express = require('express');
const router = express.Router();
const { getHomeContent } = require('../controllers/homeController');

// Public homepage aggregated content
router.get('/', getHomeContent);

module.exports = router;
