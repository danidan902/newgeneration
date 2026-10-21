// components/AssignStudentsModal.js
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { Users, X } from 'lucide-react';

const Avatar = ({ name, image, size = 40 }) => {
  const [imageError, setImageError] = useState(false);

  if (image && !imageError) {
    return (
      <img
        src={image}
        alt={name}
        className="rounded-full object-cover border-2 border-cyan-200"
        style={{ width: size, height: size }}
        onError={() => setImageError(true)}
      />
    );
  }

  const initials = name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
  const colors = ['#0e7490', '#0891b2', '#06b6d4', '#22d3ee'];
  const colorIndex = (name?.length || 0) % colors.length;

  return (
    <div
      className="rounded-full flex items-center justify-center font-bold text-white flex-shrink-0"
      style={{
        width: size,
        height: size,
        background: colors[colorIndex],
        fontSize: `${size * 0.4}px`,
      }}
    >
      {initials}
    </div>
  );
};

const AssignStudentsModal = ({
  isOpen,
  onClose,
  selectedClass,
  students = [],
  classes = [],
  onStudentsAssigned
}) => {
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [gradeFilter, setGradeFilter] = useState('');
  const [programFilter, setProgramFilter] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedStudents([]);
      setSelectAll(false);
      setGradeFilter('');
      setProgramFilter('');
    }
  }, [isOpen]);

  if (!isOpen || !selectedClass) return null;

  const isStudentAlreadyAssigned = (studentId, currentClassId = null) => {
    if (!classes || !Array.isArray(classes)) return { assigned: false, className: null };
    
    for (const cls of classes) {
      if (currentClassId && cls._id === currentClassId) continue;
      if (cls.students?.some(s => (s._id || s) === studentId)) {
        return { assigned: true, className: `Grade ${cls.grade} - Section ${cls.section}` };
      }
    }
    return { assigned: false, className: null };
  };

  const getAvailableStudents = () => {
    if (!selectedClass || !classes || !students) return [];
    
    const currentClass = classes.find(c => c._id === selectedClass._id);
    if (!currentClass) return [];

    const enrolledStudentIds = currentClass.students?.map(s => s._id) || [];
    const classSection = currentClass.section;

    return students.filter(s => {
      if (enrolledStudentIds.includes(s._id)) return false;
      const assignedToOther = isStudentAlreadyAssigned(s._id, selectedClass._id);
      if (assignedToOther.assigned) return false;
      if (s.academicStatus === 'graduated' || s.grade === 'Graduated') return false;

      const studentSection = s.section || s.classSection || s.class || '';
      if (studentSection && classSection) {
        if (studentSection.toLowerCase() !== classSection.toLowerCase()) {
          return false;
        }
      } else {
        if (studentSection || classSection) {
          return false;
        }
      }
      return true;
    });
  };

  const handleMultiSelect = (studentId) => {
    if (selectedStudents.includes(studentId)) {
      setSelectedStudents(selectedStudents.filter(id => id !== studentId));
    } else {
      setSelectedStudents([...selectedStudents, studentId]);
    }
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedStudents([]);
    } else {
      const availableStudents = getAvailableStudents();
      setSelectedStudents(availableStudents.map(s => s._id));
    }
    setSelectAll(!selectAll);
  };

  const handleMultiAssign = async () => {
    if (!selectedClass || selectedStudents.length === 0) {
      toast.error('Please select at least one student');
      return;
    }

    const invalidStudents = [];
    const alreadyAssignedStudents = [];
    const validStudents = [];

    for (const studentId of selectedStudents) {
      const student = students.find(s => s._id === studentId);
      const studentSection = student?.section || student?.classSection || student?.class || '';
      const classSection = selectedClass.section || '';

      const alreadyAssigned = isStudentAlreadyAssigned(studentId, selectedClass._id);
      if (alreadyAssigned.assigned) {
        alreadyAssignedStudents.push({ student, className: alreadyAssigned.className });
        continue;
      }

      if (student && studentSection && classSection && studentSection.toLowerCase() !== classSection.toLowerCase()) {
        invalidStudents.push(student);
        continue;
      }

      validStudents.push(studentId);
    }

    if (invalidStudents.length > 0) {
      toast.error(`${invalidStudents.length} student(s) cannot be assigned because they are from different sections`);
    }

    if (alreadyAssignedStudents.length > 0) {
      toast.error(`${alreadyAssignedStudents.length} student(s) are already assigned to another class`);
    }

    if (validStudents.length === 0) {
      return;
    }

    setLoading(true);
    let successCount = 0;
    let failCount = 0;

    for (const studentId of validStudents) {
      try {
        await api.post('/classes/add-student', {
          classId: selectedClass._id,
          studentId: studentId
        });
        successCount++;
      } catch (error) {
        console.error(`Failed to assign student ${studentId}:`, error);
        failCount++;
      }
    }

    if (successCount > 0) {
      toast.success(`Successfully assigned ${successCount} student(s)`);
      if (onStudentsAssigned) onStudentsAssigned();
    }

    if (failCount > 0) {
      toast.error(`Failed to assign ${failCount} student(s)`);
    }

    setLoading(false);
    onClose();
  };

  const availableStudents = getAvailableStudents();
  const filteredStudents = availableStudents.filter(student => {
    if (gradeFilter && String(student.grade) !== gradeFilter) return false;
    if (programFilter && student.programs !== programFilter) return false;
    return true;
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 modal-backdrop">
      <div className="bg-white rounded-2xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto modal-content">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800">Assign Students to Class</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <div className="mb-4 p-4 bg-cyan-50 rounded-lg border-l-4 border-cyan-600">
          <p className="text-sm text-cyan-800 font-semibold">
            Class: <span className="text-cyan-600">Grade {selectedClass.grade} - Section {selectedClass.section}</span>
          </p>
        </div>

        <div className="mb-6 p-4 bg-purple-50 rounded-lg border-l-4 border-purple-600">
          <p className="text-sm text-purple-800">
            <span className="font-bold">{selectedStudents.length}</span> student(s) selected
          </p>
          <p className="text-sm text-purple-800 mt-2">
            ⚠️ <span className="font-bold">ONLY students from Section {selectedClass.section} can be assigned!</span>
          </p>
        </div>

        <div className="mb-6 flex justify-between items-center">
          <label className="flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={selectAll} 
              onChange={handleSelectAll} 
              className="mr-3 w-5 h-5 rounded" 
            />
            <span className="text-sm font-semibold text-gray-700">
              Select All Available Students (Section {selectedClass.section})
            </span>
          </label>
          <button 
            onClick={() => { setSelectedStudents([]); setSelectAll(false); }} 
            className="text-sm text-red-600 hover:text-red-800 font-semibold"
          >
            Clear All
          </button>
        </div>

        <div className="table-container mb-6">
          <div className="p-4 bg-gray-100 border-b-2 border-gray-200">
            <div className="flex gap-2 flex-wrap">
              <button 
                onClick={() => setGradeFilter('')} 
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition ${!gradeFilter ? 'bg-cyan-600 text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                All Grades
              </button>
              {['9', '10', '11', '12'].map(grade => (
                <button 
                  key={grade} 
                  onClick={() => setGradeFilter(grade)} 
                  className={`px-4 py-2 text-sm font-semibold rounded-lg transition ${gradeFilter === grade ? 'bg-cyan-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                  Grade {grade}
                </button>
              ))}
            </div>
            <div className="flex gap-2 flex-wrap mt-2">
              <button 
                onClick={() => setProgramFilter('')} 
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition ${!programFilter ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                All Programs
              </button>
              <button 
                onClick={() => setProgramFilter('Natural')} 
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition ${programFilter === 'Natural' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                Natural Science
              </button>
              <button 
                onClick={() => setProgramFilter('Social')} 
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition ${programFilter === 'Social' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                Social Science
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gradient-to-r from-cyan-600 to-cyan-700 text-white">
                <tr>
                  <th className="text-center p-3">Select</th>
                  <th className="text-center p-3">Roll</th>
                  <th className="text-left p-3">Student</th>
                  <th className="text-center p-3">Grade</th>
                  <th className="text-center p-3">Section</th>
                  <th className="text-center p-3">Program</th>
                  <th className="text-center p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-8 text-gray-500">
                      No available students to assign
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student) => {
                    const alreadyAssigned = isStudentAlreadyAssigned(student._id, selectedClass._id);
                    return (
                      <tr key={student._id} className="border-b hover:bg-gray-50">
                        <td className="text-center p-3">
                          <input 
                            type="checkbox" 
                            checked={selectedStudents.includes(student._id)} 
                            onChange={() => handleMultiSelect(student._id)} 
                            disabled={alreadyAssigned.assigned} 
                            className="w-4 h-4 rounded cursor-pointer" 
                          />
                        </td>
                        <td className="text-center p-3 font-medium text-gray-700">{student.rollNumber || '-'}</td>
                        <td className="p-3 font-medium text-gray-900">
                          <div className="flex items-center gap-2">
                            <Avatar name={student.name} image={student.profileImage} size={28} />
                            <span>{student.name}</span>
                          </div>
                        </td>
                        <td className="text-center p-3 text-gray-700">{student.grade || '-'}</td>
                        <td className="text-center p-3 text-gray-700">{student.section || student.classSection || student.class || '-'}</td>
                        <td className="text-center p-3 text-gray-700">{student.programs || '-'}</td>
                        <td className="text-center p-3">
                          {alreadyAssigned.assigned ? (
                            <span className="text-xs text-red-600 font-semibold bg-red-50 px-2 py-1 rounded-full">
                              Already in {alreadyAssigned.className}
                            </span>
                          ) : (
                            <span className="text-xs text-green-600 font-semibold bg-green-50 px-2 py-1 rounded-full">
                              Available
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {availableStudents.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Users size={48} className="mx-auto mb-4 text-gray-400" />
            <p>No available students from Section {selectedClass.section} to assign.</p>
          </div>
        )}

        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition">
            Cancel
          </button>
          <button 
            onClick={handleMultiAssign} 
            disabled={selectedStudents.length === 0 || loading} 
            className="bg-cyan-600 text-white px-6 py-3 rounded-lg disabled:opacity-50 font-semibold flex items-center gap-2 hover:bg-cyan-700 transition"
          >
            {loading ? 'Assigning...' : <><Users size={18} /> Assign {selectedStudents.length} Student(s)</>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignStudentsModal;