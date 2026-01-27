import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import QRCode from 'qrcode.react';

const AssetDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [asset, setAsset] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [newNote, setNewNote] = useState('');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchAssetDetail();
    fetchAssignmentHistory();
  }, [id]);

  const fetchAssetDetail = async () => {
    try {
      const response = await axios.get(`/api/assets/${id}`);
      setAsset(response.data);
      setFormData(response.data);
    } catch (err) {
      console.error('Failed to fetch asset:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignmentHistory = async () => {
    try {
      const response = await axios.get(`/api/assignments/asset/${id}/history`);
      setHistory(response.data);
    } catch (err) {
      console.error('Failed to fetch assignment history:', err);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(`/api/assets/${id}`, formData);
      setAsset(response.data);
      setEditMode(false);
    } catch (err) {
      console.error('Failed to update asset:', err);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    try {
      setAsset({
        ...asset,
        notes: [...asset.notes, { author: user, content: newNote, createdAt: new Date() }]
      });
      setNewNote('');
    } catch (err) {
      console.error('Failed to add note:', err);
    }
  };

  if (loading) {
    return <div className="p-6">Loading asset details...</div>;
  }

  if (!asset) {
    return <div className="p-6">Asset not found</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <button
          onClick={() => navigate('/assets')}
          className="text-blue-600 hover:text-blue-800"
        >
          ← Back to Assets
        </button>
        {['admin', 'manager'].includes(user?.role) && (
          <button
            onClick={() => setEditMode(!editMode)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {editMode ? 'Cancel' : 'Edit'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{asset.name}</h1>

            {editMode ? (
              <form onSubmit={handleUpdate} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Asset Tag"
                    value={formData.assetTag}
                    onChange={(e) => setFormData({ ...formData, assetTag: e.target.value })}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder="Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Asset Tag</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{asset.assetTag}</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Type</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{asset.type}</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Status</p>
                  <p className={`text-lg font-semibold ${
                    asset.status === 'available' ? 'text-green-600' :
                    asset.status === 'assigned' ? 'text-blue-600' :
                    'text-yellow-600'
                  }`}>
                    {asset.status}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Serial Number</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{asset.serialNumber || '-'}</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Current Value</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    ${(asset.currentValue || asset.purchasePrice || 0).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Assigned To</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {asset.assignedTo?.firstName || '-'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Notes Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Notes & Maintenance</h2>
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add a note..."
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
                <button
                  onClick={handleAddNote}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
              <div className="space-y-2">
                {asset.notes?.map((note, idx) => (
                  <div key={idx} className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">{note.author?.username || 'Unknown'}</p>
                    <p className="text-gray-900 dark:text-gray-100">{note.content}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {new Date(note.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* QR Code & History */}
        <div className="space-y-6">
          {asset.qrCode && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex flex-col items-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">QR Code</h3>
              <QRCode value={asset.assetTag} size={200} />
              <button
                onClick={() => {
                  const link = document.createElement('a');
                  const canvas = document.querySelector('canvas');
                  link.href = canvas.toDataURL('image/png');
                  link.download = `${asset.assetTag}-qr.png`;
                  link.click();
                }}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                Download QR
              </button>
            </div>
          )}

          {/* Assignment History */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Assignment History</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {history.length === 0 ? (
                <p className="text-gray-600 dark:text-gray-400">No assignment history</p>
              ) : (
                history.map((assignment, idx) => (
                  <div key={idx} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {assignment.employee?.firstName} {assignment.employee?.lastName}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {assignment.status === 'active' ? 'Currently assigned' : 'Returned'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {new Date(assignment.assignedDate).toLocaleDateString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetDetail;
