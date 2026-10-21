// components/CreateClass.js
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { Plus, Edit2, Trash2, AlertCircle, X } from 'lucide-react';

const CreateClass = ({ classes = [], onClassCreated, onCancel, editingClass = null }) => {
  const [loading, setLoading] = useState(false);
  const [duplicateError, setDuplicateError] = useState('');
  const [teachers, setTeachers] = useState([]);
  const [loadingTeachers, setLoadingTeachers] = useState(false);
  
  // Initialize form data with safe defaults
  const [formData, setFormData] = useState({
    grade: editingClass?.grade || '',
    section: editingClass?.section || '',
    subjects: (editingClass?.subjects || []).map(sub => ({
      name: sub.name || '',
      teacher: sub.teacher?._id || sub.teacher || ''
    })),
    classTeacher: editingClass?.classTeacher?._id || editingClass?.classTeacher || '',
    program: editingClass?.program || ''
  });

  // Fetch teachers when component mounts
  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    setLoadingTeachers(true);
    try {
      const response = await api.get('/users/role/teacher');
      setTeachers(response.data);
    } catch (error) {
      console.error('Error fetching teachers:', error);
      toast.error('Failed to fetch teachers');
    } finally {
      setLoadingTeachers(false);
    }
  };

  // If subjects is empty, add a default subject field
  if (formData.subjects.length === 0) {
    formData.subjects = [{ name: '', teacher: '' }];
  }

  const isEdit = !!editingClass;

  const isClassAlreadyOpen = (grade, section, excludeClassId = null) => {
    if (!classes || !Array.isArray(classes)) return false;
    return classes.some(cls =>
      String(cls.grade) === String(grade) &&
      cls.section?.toLowerCase() === section?.toLowerCase() &&
      cls._id !== excludeClassId
    );
  };

  const hasGradeOrSectionChanged = () => {
    if (!editingClass) return false;
    return String(formData.grade) !== String(editingClass.grade) ||
      String(formData.section) !== String(editingClass.section);
  };

  const isUpdateDisabled = () => {
    if (loading) return true;
    if (!formData.grade || !formData.section || !formData.program) return true;
    if (hasGradeOrSectionChanged()) {
      return isClassAlreadyOpen(formData.grade, formData.section, editingClass?._id);
    }
    return false;
  };

  const addSubjectField = () => {
    setFormData({
      ...formData,
      subjects: [...formData.subjects, { name: '', teacher: '' }]
    });
  };

  const removeSubjectField = (index) => {
    const newSubjects = formData.subjects.filter((_, i) => i !== index);
    setFormData({ ...formData, subjects: newSubjects });
  };

  const handleSubjectChange = (index, field, value) => {
    const newSubjects = [...formData.subjects];
    newSubjects[index][field] = value;
    setFormData({ ...formData, subjects: newSubjects });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setDuplicateError('');

    if (!formData.grade || !formData.section || !formData.program) {
      toast.error('Please fill all required fields');
      setLoading(false);
      return;
    }

    if (!isEdit && isClassAlreadyOpen(formData.grade, formData.section)) {
      setDuplicateError(`⚠️ Class Grade ${formData.grade} - Section ${formData.section} is already open!`);
      toast.error(`Class Grade ${formData.grade} - Section ${formData.section} is already open`);
      setLoading(false);
      return;
    }

    const validSubjects = formData.subjects.filter(sub => sub.name && sub.teacher);
    if (validSubjects.length === 0) {
      toast.error('Please add at least one subject with teacher');
      setLoading(false);
      return;
    }

    const submitData = {
      grade: formData.grade,
      section: formData.section,
      program: formData.program,
      classTeacher: formData.classTeacher || null,
      subjects: validSubjects,
      academicStatus: 'Active'
    };

    try {
      if (isEdit) {
        await api.put(`/classes/${editingClass._id}`, submitData);
        toast.success('Class updated successfully');
      } else {
        await api.post('/classes', submitData);
        toast.success('Class created successfully');
      }
      if (onClassCreated) onClassCreated();
      if (!isEdit) {
        setFormData({
          grade: '',
          section: '',
          subjects: [{ name: '', teacher: '' }],
          classTeacher: '',
          program: ''
        });
      }
    } catch (error) {
      console.error('Class operation error:', error);
      if (error.response?.data?.error?.includes('duplicate') || error.response?.data?.error?.includes('already exists')) {
        setDuplicateError(`⚠️ Class Grade ${formData.grade} - Section ${formData.section} is already open!`);
        toast.error(`Class Grade ${formData.grade} - Section ${formData.section} is already open`);
      } else {
        toast.error(error.response?.data?.error || `Failed to ${isEdit ? 'update' : 'create'} class`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-8 bg-white rounded-xl shadow-xl p-6 sm:p-8 border-l-4 border-cyan-600">
      <h3 className="text-2xl font-bold mb-6 text-gray-800">
        {isEdit ? 'Edit Class' : 'Create New Class'}
      </h3>

      {duplicateError && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-center gap-3">
          <AlertCircle size={20} className="text-red-600" />
          <span className="text-red-700 font-semibold">{duplicateError}</span>
          <button onClick={() => setDuplicateError('')} className="ml-auto text-red-600 hover:text-red-800">
            <X size={18} />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Grade <span className="text-red-500">*</span></label>
            <input
              type="text"
              placeholder="e.g., 9, 10, 11, 12"
              value={formData.grade}
              onChange={(e) => {
                setFormData({ ...formData, grade: e.target.value });
                if (duplicateError) setDuplicateError('');
              }}
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-cyan-500 focus:outline-none transition"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Section <span className="text-red-500">*</span></label>
            <input
              type="text"
              placeholder="e.g., A, B, C"
              value={formData.section}
              onChange={(e) => {
                setFormData({ ...formData, section: e.target.value });
                if (duplicateError) setDuplicateError('');
              }}
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-cyan-500 focus:outline-none transition"
              required
            />
            {formData.grade && formData.section && !isEdit && isClassAlreadyOpen(formData.grade, formData.section) && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle size={12} /> Class already exists!
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Program <span className="text-red-500">*</span></label>
            <select
              value={formData.program}
              onChange={(e) => setFormData({ ...formData, program: e.target.value })}
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-cyan-500 focus:outline-none transition"
              required
            >
              <option value="">Select Program</option>
              <option value="Social">Social Sciences</option>
              <option value="Natural">Natural Sciences</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Class Teacher</label>
            <select
              value={formData.classTeacher}
              onChange={(e) => setFormData({ ...formData, classTeacher: e.target.value })}
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-cyan-500 focus:outline-none transition"
              disabled={loadingTeachers}
            >
              <option value="">{loadingTeachers ? 'Loading teachers...' : 'Select Teacher'}</option>
              {teachers && teachers.map(teacher => (
                <option key={teacher._id} value={teacher._id}>{teacher.name}</option>
              ))}
            </select>
            {loadingTeachers && (
              <p className="text-xs text-gray-500 mt-1">Loading teachers...</p>
            )}
          </div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <label className="block text-sm font-semibold text-gray-700">Subjects & Teachers <span className="text-red-500">*</span></label>
            <button
              type="button"
              onClick={addSubjectField}
              className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-green-600 transition"
            >
              <Plus size={16} /> Add Subject
            </button>
          </div>
          {formData.subjects && formData.subjects.map((subject, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 border-2 border-gray-200 rounded-lg bg-gray-50">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">Subject Name</label>
                <input
                  type="text"
                  placeholder="e.g., Mathematics"
                  value={subject.name}
                  onChange={(e) => handleSubjectChange(index, 'name', e.target.value)}
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-cyan-500 focus:outline-none transition"
                  required
                />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-gray-600 mb-2">Subject Teacher</label>
                  <select
                    value={subject.teacher}
                    onChange={(e) => handleSubjectChange(index, 'teacher', e.target.value)}
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-cyan-500 focus:outline-none transition"
                    required
                    disabled={loadingTeachers}
                  >
                    <option value="">{loadingTeachers ? 'Loading teachers...' : 'Select Teacher'}</option>
                    {teachers && teachers.map(teacher => (
                      <option key={teacher._id} value={teacher._id}>{teacher.name}</option>
                    ))}
                  </select>
                </div>
                {formData.subjects.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSubjectField(index)}
                    className="bg-red-500 text-white px-4 py-3 rounded-lg text-sm font-semibold hover:bg-red-600 transition mt-6"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isEdit ? isUpdateDisabled() : (formData.grade && formData.section && isClassAlreadyOpen(formData.grade, formData.section))}
            className="bg-cyan-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 hover:bg-cyan-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (isEdit ? 'Updating...' : 'Creating...') : (isEdit ? <><Edit2 size={18} /> Update Class</> : <><Plus size={18} /> Create Class</>)}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateClass;