// components/superadmin/ParentDetails.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ParentDetails = ({ parentId, token }) => {
  const [parent, setParent] = useState(null);
  const [children, setChildren] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');

  useEffect(() => {
    fetchParentDetails();
    fetchAllStudents();
  }, [parentId]);

  const fetchParentDetails = async () => {
    try {
      const res = await axios.get(`/api/superadmin/parent/${parentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setParent(res.data.data.parent);
      setChildren(res.data.data.children);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const fetchAllStudents = async () => {
    try {
      const res = await axios.get('/api/students', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAllStudents(res.data.data);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const handleLinkStudent = async () => {
    if (!selectedStudent) return;

    try {
      await axios.post(
        '/api/admin/link-parent-student',
        { parentId, studentId: selectedStudent },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert('Student linked successfully!');
      fetchParentDetails(); // Refresh list
      setSelectedStudent('');
    } catch (err) {
      alert('Error linking student');
    }
  };

  const handleUnlinkStudent = async (studentId, studentName) => {
    if (!confirm(`Remove ${studentName} from ${parent?.name}'s children?`)) return;

    try {
      await axios.delete('/api/admin/unlink-parent-student', {
        data: { parentId, studentId },
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert('Student unlinked successfully');
      fetchParentDetails();
    } catch (err) {
      alert('Error unlinking student');
    }
  };

  if (!parent) return <div>Loading...</div>;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4">{parent.name}</h2>
      <p className="text-gray-600 mb-6">Email: {parent.email}</p>

      {/* Current Children */}
      <div className="mb-6">
        <h3 className="text-xl font-bold mb-3">Linked Children ({children.length})</h3>
        {children.length === 0 ? (
          <p className="text-gray-500">No students linked yet</p>
        ) : (
          <div className="space-y-2">
            {children.map(child => (
              <div key={child._id} className="flex justify-between items-center border p-3 rounded">
                <div>
                  <span className="font-semibold">{child.name}</span>
                  <span className="text-gray-600 ml-2">(Roll: {child.rollNumber})</span>
                  {child.classId && (
                    <span className="text-gray-500 ml-2">Class: {child.classId.name}</span>
                  )}
                </div>
                <button
                  onClick={() => handleUnlinkStudent(child._id, child.name)}
                  className="text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add New Student Link */}
      <div className="border-t pt-4">
        <h3 className="text-lg font-bold mb-3">Link New Student</h3>
        <div className="flex gap-2">
          <select
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded"
          >
            <option value="">Select student to link...</option>
            {allStudents
              .filter(s => !children.some(c => c._id === s._id))
              .map(student => (
                <option key={student._id} value={student._id}>
                  {student.name} - {student.rollNumber}
                </option>
              ))}
          </select>
          <button
            onClick={handleLinkStudent}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Link
          </button>
        </div>
      </div>
    </div>
  );
};

export default ParentDetails;