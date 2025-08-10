const express = require('express');
const router = express.Router();

// Placeholder routes - will be implemented
router.get('/health', (req, res) => {
    res.json({ success: true, message: 'Addresses service is running' });
});

module.exports = router;