import express from 'express';
import Asset from '../models/Asset.js';
import AuditLog from '../models/AuditLog.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';
import qrcode from 'qrcode';
import { stringify } from 'csv-stringify';
import fs from 'fs';

const router = express.Router();

// Get all assets
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, type, location, assignedTo, search } = req.query;
    let filter = {};

    if (status) filter.status = status;
    if (type) filter.type = type;
    if (location) filter.location = location;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { assetTag: { $regex: search, $options: 'i' } },
        { serialNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const assets = await Asset.find(filter)
      .populate('location')
      .populate('assignedTo')
      .populate('createdBy', 'username');

    // Calculate depreciation for each asset
    const assetsWithDepreciation = assets.map(asset => {
      const assetObj = asset.toObject();
      assetObj.currentValue = asset.calculateDepreciation();
      return assetObj;
    });

    res.json(assetsWithDepreciation);
  } catch (error) {
    console.error('Get assets error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get asset by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id)
      .populate('location')
      .populate('assignedTo')
      .populate('createdBy', 'username')
      .populate('notes.author', 'username');

    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    const assetObj = asset.toObject();
    assetObj.currentValue = asset.calculateDepreciation();

    res.json(assetObj);
  } catch (error) {
    console.error('Get asset error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Create asset
router.post('/', authenticateToken, authorizeRole('admin', 'manager'), async (req, res) => {
  try {
    const assetData = {
      ...req.body,
      createdBy: req.user.userId
    };

    // Generate QR code
    const qrData = req.body.assetTag || req.body.name;
    assetData.qrCode = await qrcode.toDataURL(qrData);

    const asset = new Asset(assetData);
    await asset.save();

    await AuditLog.create({
      user: req.user.userId,
      action: 'asset_created',
      entityType: 'asset',
      entityId: asset._id,
      entityName: asset.name
    });

    const populatedAsset = await asset.populate('location createdBy', 'username');
    res.status(201).json(populatedAsset);
  } catch (error) {
    console.error('Create asset error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update asset
router.put('/:id', authenticateToken, authorizeRole('admin', 'manager'), async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);
    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    const oldData = asset.toObject();

    Object.assign(asset, req.body);
    asset.updatedAt = new Date();

    if (req.body.assetTag && req.body.assetTag !== oldData.assetTag) {
      asset.qrCode = await qrcode.toDataURL(req.body.assetTag);
    }

    await asset.save();

    await AuditLog.create({
      user: req.user.userId,
      action: 'asset_updated',
      entityType: 'asset',
      entityId: asset._id,
      entityName: asset.name,
      changes: { before: oldData, after: asset.toObject() }
    });

    await asset.populate('location assignedTo createdBy', 'username');
    res.json(asset);
  } catch (error) {
    console.error('Update asset error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Delete asset
router.delete('/:id', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const asset = await Asset.findByIdAndDelete(req.params.id);
    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    await AuditLog.create({
      user: req.user.userId,
      action: 'asset_deleted',
      entityType: 'asset',
      entityId: asset._id,
      entityName: asset.name
    });

    res.json({ message: 'Asset deleted successfully' });
  } catch (error) {
    console.error('Delete asset error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Export assets to CSV
router.get('/:id/qrcode', authenticateToken, async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);
    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    res.json({ qrCode: asset.qrCode });
  } catch (error) {
    console.error('Get QR code error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Export assets to CSV
router.post('/export/csv', authenticateToken, async (req, res) => {
  try {
    const assets = await Asset.find()
      .populate('location', 'name')
      .populate('assignedTo', 'firstName lastName');

    const columns = {
      assetTag: 'Asset Tag',
      name: 'Name',
      type: 'Type',
      serialNumber: 'Serial Number',
      status: 'Status',
      purchasePrice: 'Purchase Price',
      location: 'Location',
      assignedTo: 'Assigned To',
      currentValue: 'Current Value'
    };

    const output = assets.map(asset => ({
      assetTag: asset.assetTag,
      name: asset.name,
      type: asset.type,
      serialNumber: asset.serialNumber,
      status: asset.status,
      purchasePrice: asset.purchasePrice,
      location: asset.location?.name || '',
      assignedTo: asset.assignedTo ? `${asset.assignedTo.firstName} ${asset.assignedTo.lastName}` : '',
      currentValue: asset.calculateDepreciation()
    }));

    stringify(output, { header: true }, (err, csvOutput) => {
      if (err) throw err;

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=assets.csv');
      res.send(csvOutput);
    });
  } catch (error) {
    console.error('Export CSV error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Import assets from CSV
router.post('/import/csv', authenticateToken, authorizeRole('admin', 'manager'), async (req, res) => {
  try {
    const { data } = req.body;

    if (!Array.isArray(data)) {
      return res.status(400).json({ message: 'Data must be an array' });
    }

    const importedAssets = [];
    for (const item of data) {
      const assetData = {
        assetTag: item.assetTag,
        name: item.name,
        type: item.type,
        serialNumber: item.serialNumber,
        purchasePrice: parseFloat(item.purchasePrice),
        vendor: item.vendor,
        createdBy: req.user.userId
      };

      const asset = new Asset(assetData);
      asset.qrCode = await qrcode.toDataURL(asset.assetTag);
      await asset.save();
      importedAssets.push(asset);
    }

    await AuditLog.create({
      user: req.user.userId,
      action: 'csv_imported',
      entityType: 'asset',
      entityName: `Bulk import: ${importedAssets.length} assets`
    });

    res.status(201).json({ count: importedAssets.length, assets: importedAssets });
  } catch (error) {
    console.error('Import CSV error:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
