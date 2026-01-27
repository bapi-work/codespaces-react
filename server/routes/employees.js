import express from 'express';
import Employee from '../models/Employee.js';
import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// Get all employees
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { department, isActive, search } = req.query;
    let filter = {};

    if (department) filter.department = department;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } }
      ];
    }

    const employees = await Employee.find(filter)
      .populate('manager', 'firstName lastName')
      .populate('user', 'username email role');

    res.json(employees);
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get employee by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate('manager', 'firstName lastName')
      .populate('user', 'username email role')
      .populate('assignedAssets');

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json(employee);
  } catch (error) {
    console.error('Get employee error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Create employee
router.post('/', authenticateToken, authorizeRole('admin', 'manager'), async (req, res) => {
  try {
    const employee = new Employee(req.body);
    await employee.save();

    await AuditLog.create({
      user: req.user.userId,
      action: 'employee_created',
      entityType: 'employee',
      entityId: employee._id,
      entityName: `${employee.firstName} ${employee.lastName}`
    });

    await employee.populate('manager user');
    res.status(201).json(employee);
  } catch (error) {
    console.error('Create employee error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update employee
router.put('/:id', authenticateToken, authorizeRole('admin', 'manager'), async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const oldData = employee.toObject();
    Object.assign(employee, req.body);
    await employee.save();

    await AuditLog.create({
      user: req.user.userId,
      action: 'employee_updated',
      entityType: 'employee',
      entityId: employee._id,
      entityName: `${employee.firstName} ${employee.lastName}`,
      changes: { before: oldData, after: employee.toObject() }
    });

    await employee.populate('manager user');
    res.json(employee);
  } catch (error) {
    console.error('Update employee error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Delete employee
router.delete('/:id', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    await AuditLog.create({
      user: req.user.userId,
      action: 'employee_deleted',
      entityType: 'employee',
      entityId: employee._id,
      entityName: `${employee.firstName} ${employee.lastName}`
    });

    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Delete employee error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Bulk upload employees from CSV
router.post('/bulk-upload/csv', authenticateToken, authorizeRole('admin', 'manager'), async (req, res) => {
  try {
    const { data } = req.body;

    if (!Array.isArray(data)) {
      return res.status(400).json({ message: 'Data must be an array' });
    }

    const uploadedEmployees = [];
    for (const item of data) {
      const employee = new Employee({
        employeeId: item.employeeId,
        firstName: item.firstName,
        lastName: item.lastName,
        email: item.email,
        department: item.department,
        designation: item.designation,
        employmentType: item.employmentType || 'full_time'
      });

      await employee.save();
      uploadedEmployees.push(employee);
    }

    await AuditLog.create({
      user: req.user.userId,
      action: 'csv_imported',
      entityType: 'employee',
      entityName: `Bulk employee upload: ${uploadedEmployees.length} employees`
    });

    res.status(201).json({ count: uploadedEmployees.length, employees: uploadedEmployees });
  } catch (error) {
    console.error('Bulk upload error:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
