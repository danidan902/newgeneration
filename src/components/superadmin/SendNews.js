import React, { useState } from 'react';
import { newsAPI } from '../../services/api';

const SendNews = () => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    targetRoles: []
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const roles = [
    { value: 'superadmin', label: 'Super Admin' },
    { value: 'admin', label: 'Admin' },
    { value: 'teacher', label: 'Teacher' },
    { value: 'student', label: 'Student' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (role) => {
    setFormData(prev => {
      const roles = prev.targetRoles.includes(role)
        ? prev.targetRoles.filter(r => r !== role)
        : [...prev.targetRoles, role];
      return { ...prev, targetRoles: roles };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.targetRoles.length === 0) {
      setMessage({ type: 'error', text: 'Please select at least one role' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await newsAPI.createNews(formData);
      console.log('News sent:', response.data);
      
      setMessage({ type: 'success', text: '✅ News sent successfully!' });
      setFormData({ title: '', content: '', targetRoles: [] });
      
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to send news. Please check if backend server is running.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6 mt-16">📢 Send News Announcement</h2>
      
      {message && (
        <div className={`mb-4 p-3 rounded ${
          message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {message.text}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Title *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Enter news title"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Content *</label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            required
            rows="6"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Enter news content"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Send to (Select roles) *</label>
          <div className="flex gap-4 flex-wrap">
            {roles.map(role => (
              <label key={role.value} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.targetRoles.includes(role.value)}
                  onChange={() => handleRoleChange(role.value)}
                  className="w-4 h-4"
                />
                <span>{role.label}</span>
              </label>
            ))}
          </div>
          {formData.targetRoles.length > 0 && (
            <p className="text-sm text-green-600 mt-2">
              Will be sent to: {formData.targetRoles.join(', ')}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || formData.targetRoles.length === 0}
          className={`w-full py-2 px-4 rounded-lg text-white font-medium ${
            loading || formData.targetRoles.length === 0
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90'
          }`}
        >
          {loading ? 'Sending...' : 'Send News'}
        </button>
      </form>
    </div>
  );
};

export default SendNews;