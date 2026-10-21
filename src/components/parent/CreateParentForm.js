// components/superadmin/CreateParentForm.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CreateParentForm = ({ token, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    relationship: 'guardian',
    studentIds: []
  });
  
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch all students for linking
  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await axios.get('/api/students', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStudents(res.data.data || []);
    } catch (err) {
      console.error('Error fetching students:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleStudentSelect = (studentId) => {
    setFormData(prev => ({
      ...prev,
      studentIds: prev.studentIds.includes(studentId)
        ? prev.studentIds.filter(id => id !== studentId)
        : [...prev.studentIds, studentId]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await axios.post(
        '/api/superadmin/create-parent',
        formData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (res.data.success) {
        setSuccess(`Parent "${formData.name}" created successfully! Password: ${res.data.data.parent.password}`);
        setFormData({
          name: '',
          email: '',
          password: '',
          phone: '',
          address: '',
          relationship: 'guardian',
          studentIds: []
        });
        if (onSuccess) onSuccess();
        
        // Clear success message after 5 seconds
        setTimeout(() => setSuccess(''), 5000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating parent account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        👨‍👩‍👧 Create Parent Account (Super Admin)
      </h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left Column */}
          <div>
            <div className="mb-4">
              <label className="block text-gray-700 font-bold mb-2">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                placeholder="e.g., John Doe"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-bold mb-2">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                placeholder="parent@example.com"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-bold mb-2">
                Password *
              </label>
              <input
                type="text"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                placeholder="Create a password"
              />
              <p className="text-xs text-gray-500 mt-1">
                Share this password with the parent
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-bold mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                placeholder="+251 912 345678"
              />
            </div>
          </div>

          {/* Right Column */}
          <div>
            <div className="mb-4">
              <label className="block text-gray-700 font-bold mb-2">
                Address
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                placeholder="Full address"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-bold mb-2">
                Relationship to Student
              </label>
              <select
                name="relationship"
                value={formData.relationship}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              >
                <option value="father">Father</option>
                <option value="mother">Mother</option>
                <option value="guardian">Guardian</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Link Students Section */}
        <div className="mb-6 mt-4">
          <label className="block text-gray-700 font-bold mb-3">
            Link to Students *
          </label>
          <div className="border border-gray-300 rounded p-4 max-h-60 overflow-y-auto">
            {students.length === 0 ? (
              <p className="text-gray-500 text-center">No students found. Create students first.</p>
            ) : (
              students.map(student => (
                <label key={student._id} className="flex items-center mb-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.studentIds.includes(student._id)}
                    onChange={() => handleStudentSelect(student._id)}
                    className="mr-2"
                  />
                  <span>
                    {student.name} - {student.rollNumber} 
                    {student.classId && ` (${student.classId.name})`}
                  </span>
                </label>
              ))
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Select one or more students that belong to this parent
          </p>
        </div>

        <button
          type="submit"
          disabled={loading || students.length === 0}
          className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 transition duration-300 disabled:bg-gray-400"
        >
          {loading ? 'Creating Parent Account...' : 'Create Parent Account'}
        </button>
      </form>
    </div>
  );
};

export default CreateParentForm;