import express from 'express';
import AuditLog from '../models/AuditLog.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// Get audit logs
router.get('/', authenticateToken, authorizeRole('admin', 'manager'), async (req, res) => {
  try {
    const { action, entityType, userId, startDate, endDate } = req.query;
    let filter = {};

    if (action) filter.action = action;
    if (entityType) filter.entityType = entityType;
    if (userId) filter.user = userId;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const logs = await AuditLog.find(filter)
      .populate('user', 'username email')
      .sort({ createdAt: -1 })
      .limit(1000);

    res.json(logs);
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get audit log by ID
router.get('/:id', authenticateToken, authorizeRole('admin', 'manager'), async (req, res) => {
  try {
    const log = await AuditLog.findById(req.params.id)
      .populate('user', 'username email');

    if (!log) {
      return res.status(404).json({ message: 'Audit log not found' });
    }

    res.json(log);
  } catch (error) {
    console.error('Get audit log error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get recent activity
router.get('/activity/recent', authenticateToken, async (req, res) => {
  try {
    const recentActivity = await AuditLog.find()
      .populate('user', 'username')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(recentActivity);
  } catch (error) {
    console.error('Get recent activity error:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
