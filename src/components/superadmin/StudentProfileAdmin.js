import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  Users, BookOpen, User, Mail, Phone, Calendar, 
  Award, TrendingUp, Eye, ChevronLeft, Search, 
  RefreshCw, X, Download, Printer, Edit2, 
  GraduationCap, Home, School, MapPin, Clock,
  Save, Trash2, ChevronDown, ChevronUp, ArrowLeft
} from 'lucide-react';
import api from '../../services/api';

// ============================================
// 🎯 REUSABLE COMPONENTS
// ============================================

const StatCard = ({ icon: Icon, label, value, color = 'blue' }) => {
  const colorMap = {
    blue: 'bg-blue-50 border-blue-200 text-blue-600',
    green: 'bg-green-50 border-green-200 text-green-600',
    purple: 'bg-purple-50 border-purple-200 text-purple-600',
    orange: 'bg-orange-50 border-orange-200 text-orange-600',
    red: 'bg-red-50 border-red-200 text-red-600',
  };

  return (
    <div className={`stat-card border rounded-lg p-3 ${colorMap[color]}`}>
      <div className="stat-card-inner flex items-center justify-between">
        <div className="stat-card-content">
          <p className="stat-card-label text-xs font-medium opacity-75">{label}</p>
          <p className="stat-card-value text-xl font-bold mt-1">{value}</p>
        </div>
        <Icon className="stat-card-icon w-8 h-8 opacity-30" />
      </div>
    </div>
  );
};

const Badge = ({ text, color = 'blue' }) => {
  const colorMap = {
    blue: 'bg-blue-100 text-blue-700',
    green: 'bg-green-100 text-green-700',
    yellow: 'bg-yellow-100 text-yellow-700',
    red: 'bg-red-100 text-red-700',
    purple: 'bg-purple-100 text-purple-700',
  };

  return (
    <span className={`badge px-2.5 py-1 rounded-md text-xs font-semibold ${colorMap[color]}`}>
      {text}
    </span>
  );
};

const ActionButton = ({ onClick, label, icon: Icon, variant = 'primary' }) => {
  const variantMap = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-700 hover:bg-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    success: 'bg-green-600 text-white hover:bg-green-700',
    warning: 'bg-yellow-600 text-white hover:bg-yellow-700',
  };

  return (
    <button
      onClick={onClick}
      className={`action-button px-3 py-1.5 text-sm font-semibold rounded-lg transition flex items-center gap-1.5 ${variantMap[variant]}`}
    >
      {Icon && <Icon className="action-button-icon w-4 h-4" />}
      {label}
    </button>
  );
};

// Avatar component
const Avatar = ({ name, image, size = 80 }) => {
  if (image) {
    return (
      <img 
        src={image} 
        alt={name} 
        className="avatar-image rounded-full object-cover border-4 border-blue-200"
        style={{ width: size, height: size }}
        onError={(e) => {
          e.target.style.display = 'none';
          e.target.parentElement.querySelector('.avatar-fallback').style.display = 'flex';
        }}
      />
    );
  }

  const initials = name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
  const colors = ['#4F46E5', '#7C3AED', '#EC4899', '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6'];
  const colorIndex = (name?.length || 0) % colors.length;
  
  return (
    <div 
      className="avatar-fallback rounded-full flex items-center justify-center font-bold text-white"
      style={{ 
        width: size, 
        height: size,
        background: colors[colorIndex],
        fontSize: `${size * 0.4}px`,
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
};

// Edit Student Modal
const EditStudentModal = ({ student, onClose, onUpdate, loading }) => {
  const [formData, setFormData] = useState({
    name: '',
    studentId: '',
    rollNumber: '',
    sex: '',
    age: '',
    grade: '',
    section: '',
    programs: '',
    
    parentPhone: '',
    academicStatus: ''
  });

  useEffect(() => {
    if (student) {
      setFormData({
        name: student.name || '',
        studentId: student.studentId || '',
        rollNumber: student.rollNumber || '',
        sex: student.sex || '',
        age: student.age || '',
        grade: student.grade || '',
        section: student.section || '',
        programs: student.programs || '',
        phone: student.phone || '',
        parentPhone: student.parentPhone || '',
        academicStatus: student.academicStatus || 'Active'
      });
    }
  }, [student]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(student._id, formData);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (!student) return null;

  return (
    <div className="edit-modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="edit-modal bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="edit-modal-header sticky top-0 bg-blue-600 text-white p-4 rounded-t-xl flex justify-between items-center">
          <h2 className="edit-modal-title text-xl font-bold flex items-center gap-2">
            <Edit2 className="edit-modal-title-icon w-5 h-5" />
            Edit Student
          </h2>
          <button onClick={onClose} className="edit-modal-close-btn p-1 hover:bg-blue-700 rounded-lg transition">
            <X className="edit-modal-close-icon w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="edit-modal-form p-6">
          <div className="edit-form-grid grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="edit-form-field">
              <label className="edit-form-label block text-sm font-semibold text-gray-700 mb-1">Full Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="edit-form-input w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>
            <div className="edit-form-field">
              <label className="edit-form-label block text-sm font-semibold text-gray-700 mb-1">StudentId *</label>
              <input
                type="text"
                name="studentId"
                value={formData.studentId}
                onChange={handleChange}
                className="edit-form-input w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>
            <div className="edit-form-field">
              <label className="edit-form-label block text-sm font-semibold text-gray-700 mb-1">Roll Number</label>
              <input
                type="text"
                name="rollNumber"
                value={formData.rollNumber}
                onChange={handleChange}
                className="edit-form-input w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div className="edit-form-field">
              <label className="edit-form-label block text-sm font-semibold text-gray-700 mb-1">Gender</label>
              <select
                name="sex"
                value={formData.sex}
                onChange={handleChange}
                className="edit-form-select w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="edit-form-field">
              <label className="edit-form-label block text-sm font-semibold text-gray-700 mb-1">Age</label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                className="edit-form-input w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                min="0"
              />
            </div>
          
            <div className="edit-form-field">
              <label className="edit-form-label block text-sm font-semibold text-gray-700 mb-1">Parent Phone</label>
              <input
                type="text"
                name="parentPhone"
                value={formData.parentPhone}
                onChange={handleChange}
                className="edit-form-input w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div className="edit-form-field">
              <label className="edit-form-label block text-sm font-semibold text-gray-700 mb-1">Grade</label>
              <input
                type="text"
                name="grade"
                value={formData.grade}
                onChange={handleChange}
                className="edit-form-input w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div className="edit-form-field">
              <label className="edit-form-label block text-sm font-semibold text-gray-700 mb-1">Section</label>
              <input
                type="text"
                name="section"
                value={formData.section}
                onChange={handleChange}
                className="edit-form-input w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div className="edit-form-field">
              <label className="edit-form-label block text-sm font-semibold text-gray-700 mb-1">Program</label>
              <input
                type="text"
                name="programs"
                value={formData.programs}
                onChange={handleChange}
                className="edit-form-input w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div className="edit-form-field">
              <label className="edit-form-label block text-sm font-semibold text-gray-700 mb-1">Academic Status</label>
              <select
                name="academicStatus"
                value={formData.academicStatus}
                onChange={handleChange}
                className="edit-form-select w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="Active">Active</option>
                <option value="Graduated">Graduated</option>
                <option value="transferred">Transferred</option>
                <option value="dropped">Dropped</option>
              </select>
            </div>
          </div>

          <div className="edit-form-actions mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="edit-form-cancel-btn px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="edit-form-submit-btn px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold flex items-center gap-2"
            >
              {loading ? 'Saving...' : <><Save className="edit-form-submit-icon w-4 h-4" /> Save Changes</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ============================================
// 📊 STUDENT DETAIL PAGE (NEW PAGE)
// ============================================

const StudentDetailPage = ({ student, onBack }) => {
  if (!student) return null;

  const studentImage = student?.profileImage || 
    `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name || 'Student')}&background=4F46E5&color=fff&size=120&font-size=0.5&bold=true`;

  const isGraduated = student.academicStatus === 'Graduated' || student.grade === 'Graduated';

  const personalInfo = [
    { label: 'Full Name', value: student.name, icon: User },
    { label: 'StudentId', value: student.studentId, icon: Mail },
    { label: 'Phone', value: student.parentPhone || '-', icon: Phone },
    { label: 'Gender', value: student.sex || '-', icon: Users },
    { label: 'Age', value: student.age || '-', icon: Calendar },
  ];

  const academicInfo = [
    { label: 'Roll Number', value: student.rollNumber || '-', icon: BookOpen },
    { label: 'Grade', value: student.grade || '-', icon: School },
    { label: 'Section', value: student.section || '-', icon: MapPin },
    { label: 'Program', value: student.programs || '-', icon: TrendingUp },
    { label: 'Academic Status', value: student.academicStatus || 'Active', icon: GraduationCap },
  ];

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="student-detail-page min-h-screen bg-[#f8fafc] p-6">
      <div className="student-detail-wrapper max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="student-detail-back-btn flex items-center gap-2 text-blue-600 hover:text-blue-800 transition font-semibold mb-6"
        >
          <ArrowLeft className="student-detail-back-icon w-5 h-5" />
          Back to Student List
        </button>

        <div className="student-detail-card bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="student-detail-header bg-blue-600 text-white p-6">
            <h2 className="student-detail-title text-2xl font-bold">Student Profile</h2>
            <p className="student-detail-subtitle text-blue-100">Complete student information</p>
          </div>

          <div className="student-detail-body p-6">
            {/* Profile Header */}
            <div className="detail-profile-header flex items-center gap-6 mb-6 pb-6 border-b border-gray-200">
              <img
                src={studentImage}
                alt={student.name}
                className="detail-profile-image w-32 h-32 rounded-full object-cover border-4 border-blue-200"
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=4F46E5&color=fff&size=120&font-size=0.5&bold=true`;
                }}
              />
              <div className="detail-profile-info">
                <h3 className="detail-profile-name text-2xl font-bold text-gray-900">{student.name}</h3>
                <p className="detail-profile-roll text-gray-600">Roll No: {student.rollNumber || '-'}</p>
                <div className="detail-profile-badges flex gap-2 mt-2 flex-wrap">
                  <Badge text={student.grade || 'No Grade'} color="blue" />
                  {isGraduated && <Badge text="🎓 Graduated" color="purple" />}
                  {student.academicStatus === 'Active' && <Badge text="Active" color="green" />}
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="detail-stats-grid grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <StatCard icon={User} label="Age" value={student.age || '-'} color="blue" />
              <StatCard icon={GraduationCap} label="Status" value={student.academicStatus || 'Active'} color={isGraduated ? 'purple' : 'green'} />
              <StatCard icon={Calendar} label="Joined" value={formatDate(student.createdAt)} color="orange" />
            </div>

            {/* Personal Information */}
            <div className="detail-personal-info mb-6">
              <h4 className="detail-section-title text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <User className="detail-section-icon w-5 h-5 text-blue-600" />
                Personal Information
              </h4>
              <div className="detail-table-container overflow-x-auto">
                <table className="detail-table w-full border-collapse text-sm">
                  <thead className="detail-table-header">
                    <tr className="detail-table-header-row bg-blue-600 text-white">
                      <th className="detail-table-header-cell px-4 py-2 text-left font-bold border border-blue-700">Field</th>
                      <th className="detail-table-header-cell px-4 py-2 text-left font-bold border border-blue-700">Value</th>
                    </tr>
                  </thead>
                  <tbody className="detail-table-body">
                    {personalInfo.map((item, idx) => {
                      const IconComponent = item.icon;
                      return (
                        <tr key={idx} className="detail-table-row hover:bg-blue-50 transition even:bg-gray-50">
                          <td className="detail-table-cell px-4 py-2 font-medium text-gray-700 border border-gray-200">
                            <div className="detail-table-cell-content flex items-center gap-2">
                              <IconComponent className="detail-table-cell-icon w-4 h-4 text-blue-600" />
                              {item.label}
                            </div>
                          </td>
                          <td className="detail-table-cell px-4 py-2 text-gray-900 border border-gray-200">
                            {item.value}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Academic Information */}
            <div className="detail-academic-info mb-6">
              <h4 className="detail-section-title text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <BookOpen className="detail-section-icon w-5 h-5 text-blue-600" />
                Academic Information
              </h4>
              <div className="detail-table-container overflow-x-auto">
                <table className="detail-table w-full border-collapse text-sm">
                  <thead className="detail-table-header">
                    <tr className="detail-table-header-row bg-blue-600 text-white">
                      <th className="detail-table-header-cell px-4 py-2 text-left font-bold border border-blue-700">Field</th>
                      <th className="detail-table-header-cell px-4 py-2 text-left font-bold border border-blue-700">Value</th>
                    </tr>
                  </thead>
                  <tbody className="detail-table-body">
                    {academicInfo.map((item, idx) => {
                      const IconComponent = item.icon;
                      return (
                        <tr key={idx} className="detail-table-row hover:bg-blue-50 transition even:bg-gray-50">
                          <td className="detail-table-cell px-4 py-2 font-medium text-gray-700 border border-gray-200">
                            <div className="detail-table-cell-content flex items-center gap-2">
                              <IconComponent className="detail-table-cell-icon w-4 h-4 text-blue-600" />
                              {item.label}
                            </div>
                          </td>
                          <td className="detail-table-cell px-4 py-2 text-gray-900 border border-gray-200">
                            {item.value}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// 📊 STUDENT PROFILE PAGE - ONLY ACTIVE STUDENTS (A-Z SORTED)
// ============================================

const StudentProfilePage = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showDetailPage, setShowDetailPage] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [filterGrade, setFilterGrade] = useState('');
  const [filterProgram, setFilterProgram] = useState('');
  const [filterSex, setFilterSex] = useState('');
  const [filterSection, setFilterSection] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [studentsPerPage] = useState(50);
  const [sortOrder, setSortOrder] = useState('asc');

  useEffect(() => {
    fetchAllStudents();
  }, []);

  const fetchAllStudents = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users/role/student');
      
      const activeStudents = response.data.filter(student => 
        student.academicStatus !== 'Graduated' && 
        student.grade !== 'Graduated' &&
        student.academicStatus !== 'graduated'
      );
      
      const sortedStudents = activeStudents.sort((a, b) => {
        const nameA = a.name?.toLowerCase() || '';
        const nameB = b.name?.toLowerCase() || '';
        return nameA.localeCompare(nameB);
      });
      
      setStudents(sortedStudents);
      toast.success(`Loaded ${sortedStudents.length} active students`);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to fetch students');
     
      setStudents(mockData);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    await fetchAllStudents();
    toast.success('Data refreshed');
  };

  const toggleSortOrder = () => {
    const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    setSortOrder(newOrder);
    const sorted = [...students].sort((a, b) => {
      const nameA = a.name?.toLowerCase() || '';
      const nameB = b.name?.toLowerCase() || '';
      if (newOrder === 'asc') {
        return nameA.localeCompare(nameB);
      } else {
        return nameB.localeCompare(nameA);
      }
    });
    setStudents(sorted);
  };

  const grades = [...new Set(students.map(s => s.grade).filter(Boolean))].sort();
  const programs = [...new Set(students.map(s => s.programs).filter(Boolean))].sort();
  const sections = [...new Set(students.map(s => s.section).filter(Boolean))].sort();
  const sexes = ['Male', 'Female', 'Other'];

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         s.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         s.rollNumber?.toString().includes(searchTerm);
    const matchesGrade = filterGrade ? s.grade === filterGrade : true;
    const matchesProgram = filterProgram ? s.programs === filterProgram : true;
    const matchesSection = filterSection ? s.section === filterSection : true;
    const matchesSex = filterSex ? s.sex === filterSex : true;
    return matchesSearch && matchesGrade && matchesProgram && matchesSection && matchesSex;
  });

  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent);
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);

  const getStudentImage = (student) => {
    if (student?.profileImage) {
      return student.profileImage;
    }
    const name = student.name || 'Student';
    const colorPalette = ['4F46E5', '7C3AED', 'EC4899', 'EF4444', 'F59E0B', '10B981', '3B82F6', '8B5CF6'];
    const colorIndex = name.length % colorPalette.length;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${colorPalette[colorIndex]}&color=fff&size=40&font-size=0.5&bold=true`;
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleViewDetails = (student) => {
    setSelectedStudent(student);
    setShowDetailPage(true);
  };

  const handleBackToList = () => {
    setShowDetailPage(false);
    setSelectedStudent(null);
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setShowEditModal(true);
  };

  const handleUpdateStudent = async (studentId, formData) => {
    setLoading(true);
    try {
      await api.put(`/users/${studentId}`, formData);
      toast.success('Student updated successfully!');
      setShowEditModal(false);
      setEditingStudent(null);
      await fetchAllStudents();
    } catch (error) {
      console.error('Update error:', error);
      toast.error(error.response?.data?.error || 'Failed to update student');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (studentId) => {
    if (!window.confirm('Are you sure you want to delete this student? This action cannot be undone.')) return;
    
    setLoading(true);
    try {
      await api.delete(`/users/${studentId}`);
      toast.success('Student deleted successfully');
      await fetchAllStudents();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error.response?.data?.error || 'Failed to delete student');
    } finally {
      setLoading(false);
    }
  };

  // Show detail page if selected
  if (showDetailPage && selectedStudent) {
    return <StudentDetailPage student={selectedStudent} onBack={handleBackToList} />;
  }

  // Main view - All Active Students
  return (
    <div className="student-list-container min-h-screen bg-[#f8fafc] p-6">
      {showEditModal && (
        <EditStudentModal 
          student={editingStudent}
          onClose={() => {
            setShowEditModal(false);
            setEditingStudent(null);
          }}
          onUpdate={handleUpdateStudent}
          loading={loading}
        />
      )}

      <div className="student-list-wrapper max-w-full mx-auto">
        {/* Header Section */}
        <div className="student-list-header mb-6">
          <div className="student-list-header-inner flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="student-list-header-left">
              <div className="student-list-title-group">
                <h1 className="student-list-title text-3xl font-bold text-gray-900">Active Students</h1>
                <p className="student-list-subtitle text-gray-600 mt-1">
                  View and manage all active student profiles (A-Z sorted)
                </p>
                <p className="student-list-total text-sm text-gray-500 mt-1">
                  Total Active Students: <span className="student-list-total-count font-semibold text-green-600">{students.length}</span>
                </p>
              </div>
            </div>
            <div className="student-list-header-actions flex gap-2 flex-wrap">
              <button 
                onClick={toggleSortOrder}
                className="student-sort-btn px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold flex items-center gap-2"
              >
                {sortOrder === 'asc' ? '↑ A-Z' : '↓ Z-A'}
              </button>
              <button 
                onClick={refreshData} 
                className="student-refresh-btn px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold flex items-center gap-2"
              >
                <RefreshCw className="student-refresh-btn-icon w-4 h-4" />
                Refresh
              </button>
              <button 
                onClick={() => window.print()} 
                className="student-print-btn px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-semibold flex items-center gap-2"
              >
                <Printer className="student-print-btn-icon w-4 h-4" />
                Print
              </button>
            </div>
          </div>
        </div>

        {/* Search & Filter Section */}
        <div className="student-search-filter bg-white border border-gray-200 rounded-lg p-4 mb-6">
          <div className="student-search-filter-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
            <div className="student-search-field lg:col-span-2">
              <label className="student-search-label block text-xs font-semibold text-gray-700 mb-1.5">Search</label>
              <div className="student-search-input-wrapper relative">
                <Search className="student-search-icon absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, roll..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="student-search-input w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>
            <div className="student-filter-field">
              <label className="student-filter-label block text-xs font-semibold text-gray-700 mb-1.5">Grade</label>
              <select
                value={filterGrade}
                onChange={(e) => {
                  setFilterGrade(e.target.value);
                  setCurrentPage(1);
                }}
                className="student-filter-select w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="">All Grades</option>
                {grades.map(grade => (
                  <option key={grade} value={grade}>{grade}</option>
                ))}
              </select>
            </div>
            <div className="student-filter-field">
              <label className="student-filter-label block text-xs font-semibold text-gray-700 mb-1.5">Program</label>
              <select
                value={filterProgram}
                onChange={(e) => {
                  setFilterProgram(e.target.value);
                  setCurrentPage(1);
                }}
                className="student-filter-select w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="">All Programs</option>
                {programs.map(program => (
                  <option key={program} value={program}>{program}</option>
                ))}
              </select>
            </div>
            <div className="student-filter-field">
              <label className="student-filter-label block text-xs font-semibold text-gray-700 mb-1.5">Section</label>
              <select
                value={filterSection}
                onChange={(e) => {
                  setFilterSection(e.target.value);
                  setCurrentPage(1);
                }}
                className="student-filter-select w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="">All Sections</option>
                {sections.map(section => (
                  <option key={section} value={section}>{section}</option>
                ))}
              </select>
            </div>
            <div className="student-filter-field">
              <label className="student-filter-label block text-xs font-semibold text-gray-700 mb-1.5">Gender</label>
              <select
                value={filterSex}
                onChange={(e) => {
                  setFilterSex(e.target.value);
                  setCurrentPage(1);
                }}
                className="student-filter-select w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="">All Genders</option>
                {sexes.map(sex => (
                  <option key={sex} value={sex}>{sex}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="student-search-results mt-3 text-sm text-gray-500">
            Found {filteredStudents.length} active student{filteredStudents.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Students Table */}
        <div className="student-table-container bg-white border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="student-table-loading flex justify-center items-center py-12">
              <div className="student-table-loading-spinner animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            </div>
          ) : currentStudents.length === 0 ? (
            <div className="student-table-empty text-center py-12 text-gray-500">
              <Users className="student-table-empty-icon w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="student-table-empty-text">No active students found</p>
              <p className="student-table-empty-subtext text-sm text-gray-400 mt-1">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="student-table-scroll overflow-x-auto">
              <table className="student-table w-full border-collapse">
                <thead className="student-table-header">
                  <tr className="student-table-header-row bg-blue-600 text-white">               
                    <th className="student-table-header-cell px-3 py-2 text-left text-sm font-bold border border-blue-700">Roll No</th>
                    <th className="student-table-header-cell px-3 py-2 text-center text-sm font-bold border border-blue-700">Photo</th>
                    <th className="student-table-header-cell px-3 py-2 text-left text-sm font-bold border border-blue-700 cursor-pointer hover:bg-blue-700 transition" onClick={toggleSortOrder}>
                      Student Name {sortOrder === 'asc' ? '↑' : '↓'}
                    </th>
                    <th className="student-table-header-cell px-3 py-2 text-left text-sm font-bold border border-blue-700">StudentId</th>
                    <th className="student-table-header-cell px-3 py-2 text-center text-sm font-bold border border-blue-700">Gender</th>
                    <th className="student-table-header-cell px-3 py-2 text-center text-sm font-bold border border-blue-700">Age</th>
                    <th className="student-table-header-cell px-3 py-2 text-center text-sm font-bold border border-blue-700">Grade</th>
                    <th className="student-table-header-cell px-3 py-2 text-center text-sm font-bold border border-blue-700">Section</th>
                    <th className="student-table-header-cell px-3 py-2 text-center text-sm font-bold border border-blue-700">Program</th>
                        <th className="student-table-header-cell px-3 py-2 text-center text-sm font-bold border border-blue-700 whitespace-nowrap min-w-[42px]">Parent Phone</th>
                    <th className="student-table-header-cell px-3 py-2 text-center text-sm font-bold border border-blue-700">Status</th>
                    <th className="student-table-header-cell px-3 py-2 text-center text-sm font-bold border border-blue-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="student-table-body">
                  {currentStudents.map((student, index) => {
                    const studentImage = getStudentImage(student);
                    const serialNumber = indexOfFirstStudent + index + 1;
                    
                    return (
                      <tr key={student._id || index} className="student-table-row hover:bg-blue-50 transition even:bg-gray-50">
                        <td className="student-table-cell px-3 py-2 text-sm text-gray-700 border border-gray-200">
                          {student.rollNumber || '-'}
                        </td>
                        <td className="student-table-cell px-3 py-2 text-center border border-gray-200">
                          <img 
                            src={studentImage} 
                            alt={student.name}
                            className="student-table-avatar w-10 h-10 rounded-full object-cover border-2 border-blue-200 mx-auto cursor-pointer"
                            onClick={() => handleViewDetails(student)}
                            onError={(e) => {
                              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=4F46E5&color=fff&size=40&font-size=0.5&bold=true`;
                            }}
                          />
                        </td>
                        <td className="student-table-cell px-3 py-2 text-sm font-medium text-gray-900 border border-gray-200 whitespace-nowrap min-w-[42px]">
                          <button
                            onClick={() => handleViewDetails(student)}
                            className="student-name-btn hover:text-blue-600 hover:underline transition"
                          >
                            {student.name}
                          </button>
                        </td>
                        <td className="student-table-cell px-3 py-2 text-sm text-gray-700 border border-gray-200">
                          {student.studentId || '-'}
                        </td>
                        <td className="student-table-cell px-3 py-2 text-center text-sm text-gray-700 border border-gray-200">
                          {student.sex || '-'}
                        </td>
                        <td className="student-table-cell px-3 py-2 text-center text-sm text-gray-700 border border-gray-200">
                          {student.age || '-'}
                        </td>
                        <td className="student-table-cell px-3 py-2 text-center text-sm text-gray-700 border border-gray-200 whitespace-nowrap min-w-[42px]">
                          {student.grade || '-'}
                        </td>
                        <td className="student-table-cell px-3 py-2 text-center text-sm text-gray-700 border border-gray-200">
                          {student.section || '-'}
                        </td>
                        <td className="student-table-cell px-3 py-4 text-center text-sm text-gray-700 border border-gray-200 whitespace-nowrap min-w-[42px]">
                          {student.programs || '-'}
                        </td>
                        <td className="student-table-cell px-3 py-2 text-center text-sm text-gray-700 border border-gray-200 whitespace-nowrap min-w-[42px]">
                          {student.parentPhone || '-'}
                        </td>
                        <td className="student-table-cell px-3 py-2 text-center border border-gray-200">
                          <Badge text="Active" color="green" />
                        </td>
                        <td className="student-table-cell px-3 py-2 text-center border border-gray-200">
                          <div className="student-actions flex gap-1 justify-center">
                            <button
                              onClick={() => handleViewDetails(student)}
                              className="student-view-btn px-2 py-1 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition flex items-center gap-1"
                            >
                              <Eye className="student-view-btn-icon w-3 h-3" /> View
                            </button>
                            <button
                              onClick={() => handleEdit(student)}
                              className="student-edit-btn px-2 py-1 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700 transition flex items-center gap-1"
                            >
                              <Edit2 className="student-edit-btn-icon w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleDelete(student._id)}
                              className="student-delete-btn px-2 py-1 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 transition flex items-center gap-1"
                            >
                              <Trash2 className="student-delete-btn-icon w-3 h-3" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="student-table-footer bg-gray-100 border-t-2 border-gray-300">
                  <tr className="student-table-footer-row">
                    <td colSpan="6" className="student-table-footer-cell px-3 py-2 text-sm font-semibold text-gray-700">
                      Total Active Students
                    </td>
                    <td colSpan="5" className="student-table-footer-cell px-3 py-2 text-center border border-gray-200">
                      <span className="student-table-footer-total text-sm font-semibold text-green-600">
                        {filteredStudents.length} Students
                      </span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="student-pagination flex justify-center gap-3 mt-6">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="student-pagination-prev px-4 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 font-semibold hover:bg-gray-300 transition"
            >
              Previous
            </button>
            <span className="student-pagination-current px-4 py-2 font-bold text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="student-pagination-next px-4 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 font-semibold hover:bg-gray-300 transition"
            >
              Next
            </button>
          </div>
        )}

        {/* Summary Cards - Only Active Students */}
        <div className="student-summary-grid mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="student-summary-card bg-white border border-green-200 rounded-lg p-4">
            <p className="student-summary-label text-xs font-medium text-green-600">Active Students</p>
            <p className="student-summary-value text-2xl font-bold text-green-600">{students.length}</p>
          </div>
          <div className="student-summary-card bg-white border border-blue-200 rounded-lg p-4">
            <p className="student-summary-label text-xs font-medium text-blue-600">Grades</p>
            <p className="student-summary-value text-2xl font-bold text-blue-600">
              {[...new Set(students.map(s => s.grade).filter(Boolean))].length}
            </p>
          </div>
          <div className="student-summary-card bg-white border border-purple-200 rounded-lg p-4">
            <p className="student-summary-label text-xs font-medium text-purple-600">Programs</p>
            <p className="student-summary-value text-2xl font-bold text-purple-600">
              {[...new Set(students.map(s => s.programs).filter(Boolean))].length}
            </p>
          </div>
          <div className="student-summary-card bg-white border border-orange-200 rounded-lg p-4">
            <p className="student-summary-label text-xs font-medium text-orange-600">Sections</p>
            <p className="student-summary-value text-2xl font-bold text-orange-600">
              {[...new Set(students.map(s => s.section).filter(Boolean))].length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfilePage;