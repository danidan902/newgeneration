
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';



const ManageTeachers = ({ isSuperAdmin = false }) => {
  const [teachers, setTeachers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  
  useEffect(() => {
    fetchTeachers();
  }, []);
  
  const fetchTeachers = async () => {
    try {
      const response = await api.get('/users/role/teacher');
      setTeachers(response.data);
    } catch (error) {
      if (error.response?.status === 403) {
        toast.error('Session expired. Please login again.');
        localStorage.clear();
        window.location.href = '/login';
      } else {
        toast.error('Failed to fetch teachers');
      }
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    if (!formData.name || !formData.email || !formData.password) {
      toast.error('Please fill all fields');
      setLoading(false);
      return;
    }
    
    try {
      const response = await api.post('/users', { ...formData, role: 'teacher' });
      toast.success('Teacher added successfully');
      setFormData({ name: '', email: '', password: '' });
      setShowForm(false);
      if (response.data.user) {
        setTeachers([...teachers, response.data.user]);
      } else {
        fetchTeachers();
      }
    } catch (error) {
      if (error.response?.status === 403) {
        toast.error('Access denied. Please login again.');
        localStorage.clear();
        window.location.href = '/login';
      } else {
        toast.error(error.response?.data?.error || 'Failed to add teacher');
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this teacher?')) {
      try {
        await api.delete(`/users/${id}`);
        toast.success('Teacher deleted successfully');
        setTeachers(teachers.filter(teacher => teacher._id !== id));
      } catch (error) {
        if (error.response?.status === 403) {
          toast.error('Access denied. Please login again.');
          localStorage.clear();
          window.location.href = '/login';
        } else {
          toast.error('Failed to delete teacher');
        }
      }
    }
  };
  
  return (
    <div>
      {isSuperAdmin && (
        <div className="bg-purple-100 border-l-4 border-purple-500 text-purple-700 p-4 mb-6 rounded">
          <strong>Super Admin Mode</strong> - You have full access to manage teachers
        </div>
      )}
      <div className="flex justify-between mb-6">
        <h2 className="text-2xl font-bold">Manage Teachers</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          {showForm ? 'Cancel' : 'Add Teacher'}
        </button>
      </div>
      
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-100 p-4 rounded mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Full Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="p-2 border rounded"
              required
            />
            <input
              type="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="p-2 border rounded"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="p-2 border rounded"
              required
            />
          </div>
          <button type="submit" disabled={loading} className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-400">
            {loading ? 'Creating...' : 'Create Teacher'}
          </button>
        </form>
      )}
      
      <div className="overflow-x-auto">
        <table className="w-full bg-white rounded-lg shadow">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {teachers.length === 0 ? (
              <tr>
                <td colSpan="3" className="p-3 text-center text-gray-500">No teachers found</td>
              </tr>
            ) : (
              teachers.map((teacher) => (
                <tr key={teacher._id} className="border-b">
                  <td className="p-3">{teacher.name}</td>
                  <td className="p-3">{teacher.email}</td>
                  <td className="p-3">
                    <button
                      onClick={() => handleDelete(teacher._id)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};


export default ManageTeachers;