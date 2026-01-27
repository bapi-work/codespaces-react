import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Assignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [assets, setAssets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '' });
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    asset: '',
    employee: '',
    notes: ''
  });
  const [returnData, setReturnData] = useState({});
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    try {
      const [assignRes, assetRes, empRes] = await Promise.all([
        axios.get(`/api/assignments?status=${filters.status}`),
        axios.get('/api/assets?status=available'),
        axios.get('/api/employees')
      ]);

      setAssignments(assignRes.data);
      setAssets(assetRes.data);
      setEmployees(empRes.data);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignAsset = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/assignments', formData);
      setAssignments([response.data, ...assignments]);
      setShowForm(false);
      setFormData({ asset: '', employee: '', notes: '' });
      fetchData();
    } catch (err) {
      console.error('Failed to assign asset:', err);
    }
  };

  const handleReturnAsset = async (assignmentId) => {
    try {
      const response = await axios.post(`/api/assignments/${assignmentId}/return`, returnData[assignmentId] || {});
      setAssignments(assignments.map(a => a._id === assignmentId ? response.data : a));
      setReturnData({ ...returnData, [assignmentId]: {} });
    } catch (err) {
      console.error('Failed to return asset:', err);
    }
  };

  if (loading) {
    return <div className="p-6">Loading assignments...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Assignments</h1>
        {['admin', 'manager'].includes(user?.role) && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            + New Assignment
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex gap-4 flex-wrap">
        <select
          value={filters.status}
          onChange={(e) => setFilters({ status: e.target.value })}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="returned">Returned</option>
          <option value="lost">Lost</option>
        </select>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Assign Asset to Employee</h2>
          <form onSubmit={handleAssignAsset} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              value={formData.asset}
              onChange={(e) => setFormData({ ...formData, asset: e.target.value })}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              required
            >
              <option value="">Select Asset</option>
              {assets.map(asset => (
                <option key={asset._id} value={asset._id}>
                  {asset.assetTag} - {asset.name}
                </option>
              ))}
            </select>
            <select
              value={formData.employee}
              onChange={(e) => setFormData({ ...formData, employee: e.target.value })}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              required
            >
              <option value="">Select Employee</option>
              {employees.map(emp => (
                <option key={emp._id} value={emp._id}>
                  {emp.firstName} {emp.lastName}
                </option>
              ))}
            </select>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Notes (optional)"
              className="md:col-span-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              rows="3"
            />
            <div className="md:col-span-2 flex gap-2">
              <button
                type="submit"
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Assign Asset
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 py-2 px-4 bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Assignments Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Asset</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Employee</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Date</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody>
            {assignments.map(assignment => (
              <tr key={assignment._id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-3 text-gray-900 dark:text-gray-100 font-medium">
                  {assignment.asset?.name}
                </td>
                <td className="px-6 py-3 text-gray-900 dark:text-gray-100">
                  {assignment.employee?.firstName} {assignment.employee?.lastName}
                </td>
                <td className="px-6 py-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    assignment.status === 'active' ? 'bg-blue-100 text-blue-800' :
                    assignment.status === 'returned' ? 'bg-gray-100 text-gray-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {assignment.status}
                  </span>
                </td>
                <td className="px-6 py-3 text-gray-600 dark:text-gray-400">
                  {new Date(assignment.assignedDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-3 flex gap-2">
                  {assignment.status === 'active' && ['admin', 'manager'].includes(user?.role) && (
                    <button
                      onClick={() => handleReturnAsset(assignment._id)}
                      className="text-orange-600 hover:text-orange-800 text-sm font-medium"
                    >
                      Return
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Assignments;
