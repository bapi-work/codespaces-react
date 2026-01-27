import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Settings = ({ settings, onSettingsUpdate }) => {
  const [formData, setFormData] = useState(settings || {});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.put('/api/settings', formData);
      onSettingsUpdate(response.data);
      setMessage('Settings updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>

      {message && (
        <div className={`p-4 rounded-lg ${message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Company Branding */}
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Company Branding</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company Name</label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company Logo URL</label>
              <input
                type="url"
                name="companyLogo"
                value={formData.companyLogo || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company Website</label>
              <input
                type="url"
                name="companyWebsite"
                value={formData.companyWebsite || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Currency</label>
              <select
                name="currency"
                value={formData.currency || 'USD'}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="JPY">JPY (¥)</option>
                <option value="INR">INR (₹)</option>
                <option value="AUD">AUD (A$)</option>
                <option value="CAD">CAD (C$)</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Header Text</label>
              <input
                type="text"
                name="headerText"
                value={formData.headerText || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                placeholder="Text shown in header"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Footer Text</label>
              <input
                type="text"
                name="footerText"
                value={formData.footerText || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                placeholder="Text shown in footer"
              />
            </div>
          </div>
        </section>

        {/* Email Configuration */}
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Email Configuration</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Provider</label>
              <select
                name="emailProvider"
                value={formData.emailProvider || 'gmail'}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              >
                <option value="gmail">Gmail (SMTP)</option>
                <option value="sendgrid">SendGrid</option>
                <option value="office365">Office 365</option>
              </select>
            </div>

            {formData.emailProvider === 'gmail' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gmail Email</label>
                  <input
                    type="email"
                    name="gmailEmail"
                    value={formData.gmailEmail || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gmail Password</label>
                  <input
                    type="password"
                    name="gmailPassword"
                    value={formData.gmailPassword || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </>
            )}

            {formData.emailProvider === 'sendgrid' && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">SendGrid API Key</label>
                <input
                  type="password"
                  name="sendgridApiKey"
                  value={formData.sendgridApiKey || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
            )}

            {formData.emailProvider === 'office365' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Office 365 Email</label>
                  <input
                    type="email"
                    name="office365Email"
                    value={formData.office365Email || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Office 365 Password</label>
                  <input
                    type="password"
                    name="office365Password"
                    value={formData.office365Password || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </>
            )}
          </div>

          <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Email Notifications</h3>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="sendAssetAssignmentNotification"
                  checked={formData.sendAssetAssignmentNotification || false}
                  onChange={handleChange}
                  className="w-4 h-4"
                />
                <span className="ml-2 text-gray-700 dark:text-gray-300">Send asset assignment notifications</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="sendWarrantyExpiryNotification"
                  checked={formData.sendWarrantyExpiryNotification || false}
                  onChange={handleChange}
                  className="w-4 h-4"
                />
                <span className="ml-2 text-gray-700 dark:text-gray-300">Send warranty expiry notifications</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="sendReturnReminderNotification"
                  checked={formData.sendReturnReminderNotification || false}
                  onChange={handleChange}
                  className="w-4 h-4"
                />
                <span className="ml-2 text-gray-700 dark:text-gray-300">Send return reminder notifications</span>
              </label>
            </div>
          </div>
        </section>

        {/* Display Settings */}
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Display Settings</h2>
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="enableDarkMode"
                checked={formData.enableDarkMode || false}
                onChange={handleChange}
                className="w-4 h-4"
              />
              <span className="ml-2 text-gray-700 dark:text-gray-300">Enable dark mode by default</span>
            </label>
          </div>
        </section>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-semibold transition"
        >
          {loading ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
};

export default Settings;
