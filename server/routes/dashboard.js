import express from 'express';
import Asset from '../models/Asset.js';
import Assignment from '../models/Assignment.js';
import Employee from '../models/Employee.js';
import User from '../models/User.js';
import { authenticateToken } from '../middleware/auth.js';
import mongoose from 'mongoose';

const router = express.Router();

// Get dashboard stats
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const totalAssets = await Asset.countDocuments();
    const assignedAssets = await Asset.countDocuments({ status: 'assigned' });
    const availableAssets = await Asset.countDocuments({ status: 'available' });
    const maintenanceAssets = await Asset.countDocuments({ status: 'in_maintenance' });
    const retiredAssets = await Asset.countDocuments({ status: 'retired' });
    const lostAssets = await Asset.countDocuments({ status: 'lost' });

    const totalEmployees = await Employee.countDocuments();
    const activeEmployees = await Employee.countDocuments({ isActive: true });

    const totalUsers = await User.countDocuments();

    const assetsByType = await Asset.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    const assetsByStatus = [
      { status: 'available', count: availableAssets },
      { status: 'assigned', count: assignedAssets },
      { status: 'in_maintenance', count: maintenanceAssets },
      { status: 'retired', count: retiredAssets },
      { status: 'lost', count: lostAssets }
    ];

    res.json({
      totalAssets,
      assignedAssets,
      availableAssets,
      maintenanceAssets,
      retiredAssets,
      lostAssets,
      totalEmployees,
      activeEmployees,
      totalUsers,
      assetsByType,
      assetsByStatus
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get asset depreciation summary
router.get('/depreciation', authenticateToken, async (req, res) => {
  try {
    const assets = await Asset.find({
      purchasePrice: { $exists: true, $gt: 0 }
    });

    let totalPurchaseValue = 0;
    let totalCurrentValue = 0;

    assets.forEach(asset => {
      totalPurchaseValue += asset.purchasePrice || 0;
      totalCurrentValue += asset.calculateDepreciation();
    });

    const totalDepreciation = totalPurchaseValue - totalCurrentValue;
    const depreciationPercentage = ((totalDepreciation / totalPurchaseValue) * 100).toFixed(2);

    res.json({
      totalPurchaseValue,
      totalCurrentValue,
      totalDepreciation,
      depreciationPercentage,
      assetCount: assets.length
    });
  } catch (error) {
    console.error('Get depreciation error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get recent assignments
router.get('/recent-assignments', authenticateToken, async (req, res) => {
  try {
    const recentAssignments = await Assignment.find()
      .populate('asset', 'name assetTag')
      .populate('employee', 'firstName lastName')
      .sort({ assignedDate: -1 })
      .limit(10);

    res.json(recentAssignments);
  } catch (error) {
    console.error('Get recent assignments error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get system health
router.get('/health', authenticateToken, async (req, res) => {
  try {
    const dbConnection = mongoose.connection.readyState === 1;
    const timestamp = new Date();

    res.json({
      status: dbConnection ? 'healthy' : 'unhealthy',
      database: dbConnection ? 'connected' : 'disconnected',
      timestamp
    });
  } catch (error) {
    console.error('Get health error:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
