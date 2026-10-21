// components/admin/LinkParentStudent.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const LinkParentStudent = ({ token }) => {
  const [parents, setParents] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedParent, setSelectedParent] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchParents();
    fetchStudents();
  }, []);

  const fetchParents = async () => {
    try {
      const res = await axios.get('/api/superadmin/parents', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setParents(res.data.data);
    } catch (err) {
      console.error('Error fetching parents:', err);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await axios.get('/api/students', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStudents(res.data.data);
    } catch (err) {
      console.error('Error fetching students:', err);
    }
  };

  const handleLink = async () => {
    if (!selectedParent || !selectedStudent) {
      setMessage('Please select both parent and student');
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        '/api/admin/link-parent-student',
        { parentId: selectedParent, studentId: selectedStudent },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setMessage('✓ Parent linked to student successfully!');
      setSelectedParent('');
      setSelectedStudent('');
      
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Error linking parent to student');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">Link Parent to Student</h2>
      
      {message && (
        <div className={`p-3 rounded mb-4 ${
          message.includes('✓') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {message}
        </div>
      )}

      <div className="space-y-4">
        {/* Parent Selection */}
        <div>
          <label className="block text-gray-700 font-bold mb-2">
            Select Parent
          </label>
          <select
            value={selectedParent}
            onChange={(e) => setSelectedParent(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded"
          >
            <option value="">-- Choose Parent --</option>
            {parents.map(parent => (
              <option key={parent._id} value={parent._id}>
                {parent.name} - {parent.email}
              </option>
            ))}
          </select>
        </div>

        {/* Student Selection */}
        <div>
          <label className="block text-gray-700 font-bold mb-2">
            Select Student
          </label>
          <select
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded"
          >
            <option value="">-- Choose Student --</option>
            {students.map(student => (
              <option key={student._id} value={student._id}>
                {student.name} (Roll: {student.rollNumber})
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleLink}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          {loading ? 'Linking...' : 'Link Parent to Student'}
        </button>
      </div>
    </div>
  );
};

export default LinkParentStudent;