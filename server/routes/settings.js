import express from 'express';
import Settings from '../models/Settings.js';
import AuditLog from '../models/AuditLog.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// Get settings
router.get('/', authenticateToken, async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
      await settings.save();
    }
    res.json(settings);
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update settings
router.put('/', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }

    const oldSettings = settings.toObject();
    Object.assign(settings, req.body);
    settings.updatedAt = new Date();
    await settings.save();

    await AuditLog.create({
      user: req.user.userId,
      action: 'settings_updated',
      entityType: 'settings',
      changes: { before: oldSettings, after: settings.toObject() }
    });

    res.json(settings);
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
