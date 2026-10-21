import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  Users, BookOpen, User, Mail, Phone, Calendar, 
  Award, TrendingUp, Eye, ChevronLeft, Search, 
  RefreshCw, X, Download, Printer, Edit2, 
  GraduationCap, Home, School, MapPin, Clock,
  Save, Trash2, ChevronDown, ChevronUp,
  ArrowLeft, FileSpreadsheet, AlertCircle,
  ArrowUpDown, ArrowUp, ArrowDown, Filter,
  Shield, Lock
} from 'lucide-react';
import api from '../../services/api';
import * as XLSX from 'xlsx';

// ============================================
// 🎯 REUSABLE COMPONENTS
// ============================================

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
  const colors = ['#0e7490', '#0891b2', '#06b6d4', '#22d3ee', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7'];
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

const Badge = ({ text, color = 'blue' }) => {
  const colorMap = {
    blue: 'bg-cyan-100 text-cyan-700',
    green: 'bg-green-100 text-green-700',
    yellow: 'bg-yellow-100 text-yellow-700',
    red: 'bg-red-100 text-red-700',
    purple: 'bg-purple-100 text-purple-700',
    gray: 'bg-gray-100 text-gray-700',
  };

  return (
    <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${colorMap[color]}`}>
      {text}
    </span>
  );
};

// ============================================
// 📊 ACCESS DENIED COMPONENT
// ============================================
const AccessDenied = ({ onBack }) => {
  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6">
      <div className="bg-white rounded-xl shadow-lg border border-red-200 p-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
            <Lock className="w-10 h-10 text-red-600" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h2>
        <p className="text-gray-600 mb-6">
          You do not have permission to edit this student profile.
          <br />
          Please contact your administrator if you believe this is an error.
        </p>
        <button
          onClick={onBack}
          className="px-6 py-2.5 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition font-semibold flex items-center gap-2 mx-auto"
        >
          <ArrowLeft size={18} /> Back to Students
        </button>
      </div>
    </div>
  );
};

// ============================================
// 📊 STUDENT DETAIL PAGE
// ============================================
const StudentDetailPage = ({ student, onBack, onEdit, hasEditPermission }) => {
  if (!student) return null;

  const studentImage = student.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=0E7490&color=fff&size=120&font-size=0.5&bold=true`;
  const isGraduated = student.academicStatus === 'Graduated' || student.grade === 'Graduated';

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const personalInfo = [
    { label: 'Full Name', value: student.name, icon: User },
    { label: 'Email', value: student.email || '-', icon: Mail },
    { label: 'Phone', value: student.phone || student.parentPhone || '-', icon: Phone },
    { label: 'Gender', value: student.sex || '-', icon: Users },
    { label: 'Age', value: student.age || '-', icon: Calendar },
    { label: 'Address', value: student.address || '-', icon: MapPin },
    { label: 'Date of Birth', value: student.dob || '-', icon: Calendar },
  ];

  const academicInfo = [
    { label: 'Roll Number', value: student.rollNumber || '-', icon: BookOpen },
    { label: 'Grade', value: student.grade || '-', icon: School },
    { label: 'Section', value: student.section || '-', icon: MapPin },
    { label: 'Program', value: student.programs || '-', icon: TrendingUp },
    { label: 'Academic Status', value: student.academicStatus || 'Active', icon: GraduationCap },
    { label: 'Parent Name', value: student.parentName || '-', icon: User },
    { label: 'Parent Phone', value: student.parentPhone || '-', icon: Phone },
  ];

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6">
      <style>{`
        .detail-page-container { animation: fadeIn 0.5s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .detail-header {
          background: linear-gradient(135deg, #0e7490 0%, #0891b2 50%, #22d3ee 100%);
          color: white;
          padding: 35px;
          border-radius: 15px;
          margin-bottom: 30px;
          box-shadow: 0 10px 40px rgba(8, 145, 178, 0.3);
        }
        .detail-badge {
          display: inline-block;
          background: rgba(255,255,255,0.2);
          padding: 4px 14px;
          border-radius: 20px;
          font-size: 12px;
          margin-right: 6px;
          margin-top: 4px;
        }
        .detail-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 16px;
          margin-bottom: 30px;
        }
        .detail-stat-card {
          background: white;
          padding: 18px;
          border-radius: 12px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.06);
          text-align: center;
          border-top: 4px solid #0891b2;
          border: 1px solid #e2e8f0;
          transition: all 0.3s;
        }
        .detail-stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(8, 145, 178, 0.12);
        }
        .detail-stat-value { font-size: 26px; font-weight: 700; color: #0e7490; margin: 6px 0; }
        .detail-stat-label { font-size: 11px; color: #999; text-transform: uppercase; letter-spacing: 0.5px; }
        .detail-back-btn {
          background: white;
          color: #0e7490;
          border: 2px solid #0e7490;
          padding: 10px 24px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .detail-back-btn:hover {
          background: #0e7490;
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(8, 145, 178, 0.3);
        }
        .detail-info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
          margin-bottom: 30px;
        }
        .detail-info-item {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 16px 20px;
          display: flex;
          align-items: center;
          gap: 14px;
          transition: all 0.3s;
        }
        .detail-info-item:hover {
          box-shadow: 0 4px 15px rgba(8, 145, 178, 0.08);
          border-color: #0891b2;
        }
        .detail-info-icon {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #0e7490, #0891b2);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
        }
        .detail-info-label {
          font-size: 12px;
          color: #999;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 600;
        }
        .detail-info-value {
          font-size: 16px;
          font-weight: 600;
          color: #1e293b;
        }
        .detail-section-title {
          font-size: 20px;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .detail-section-title .icon {
          color: #0891b2;
        }
        .detail-edit-btn {
          background: white;
          color: #f59e0b;
          border: 2px solid #f59e0b;
          padding: 10px 24px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .detail-edit-btn:hover {
          background: #f59e0b;
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(245, 158, 11, 0.3);
        }
        .detail-edit-btn-disabled {
          background: #f3f4f6;
          color: #9ca3af;
          border: 2px solid #e5e7eb;
          padding: 10px 24px;
          border-radius: 8px;
          font-weight: 600;
          cursor: not-allowed;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
      `}</style>

      <div className="detail-page-container">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <button onClick={onBack} className="detail-back-btn">
            <ArrowLeft size={18} /> Back to Students
          </button>
          {hasEditPermission ? (
            <button onClick={() => onEdit(student)} className="detail-edit-btn">
              <Edit2 size={18} /> Edit Student
            </button>
          ) : (
            <button className="detail-edit-btn-disabled" disabled>
              <Lock size={18} /> Edit Restricted
            </button>
          )}
        </div>

        <div className="detail-header">
          <div className="flex flex-wrap items-center gap-6">
            <Avatar name={student.name} image={studentImage} size={120} />
            <div>
              <h2 className="text-3xl font-bold">{student.name}</h2>
              <div className="flex flex-wrap gap-1 mt-2">
                <span className="detail-badge">Roll No: {student.rollNumber}</span>
                <span className="detail-badge">Grade: {student.grade}</span>
                <span className="detail-badge">Section: {student.section}</span>
                <span className="detail-badge">Status: {student.academicStatus || 'Active'}</span>
                {isGraduated && <span className="detail-badge">🎓 Graduated</span>}
              </div>
            </div>
          </div>
        </div>

        <div className="detail-stats-grid">
          <div className="detail-stat-card" style={{borderTopColor: '#3b82f6'}}>
            <div className="detail-stat-label">Age</div>
            <div className="detail-stat-value" style={{color: '#3b82f6'}}>{student.age || '-'}</div>
          </div>
          <div className="detail-stat-card" style={{borderTopColor: '#10b981'}}>
            <div className="detail-stat-label">Status</div>
            <div className="detail-stat-value" style={{color: '#10b981'}}>{student.academicStatus || 'Active'}</div>
          </div>
          <div className="detail-stat-card" style={{borderTopColor: '#8b5cf6'}}>
            <div className="detail-stat-label">Program</div>
            <div className="detail-stat-value" style={{color: '#8b5cf6'}}>{student.programs || '-'}</div>
          </div>
          <div className="detail-stat-card" style={{borderTopColor: '#f59e0b'}}>
            <div className="detail-stat-label">Joined</div>
            <div className="detail-stat-value" style={{color: '#f59e0b'}}>{formatDate(student.createdAt)}</div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="mb-8">
          <h3 className="detail-section-title">
            <User className="icon" size={24} />
            Personal Information
          </h3>
          <div className="detail-info-grid">
            {personalInfo.map((item, idx) => {
              const IconComponent = item.icon;
              return (
                <div key={idx} className="detail-info-item">
                  <div className="detail-info-icon">
                    <IconComponent size={20} />
                  </div>
                  <div>
                    <p className="detail-info-label">{item.label}</p>
                    <p className="detail-info-value">{item.value}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Academic Information */}
        <div>
          <h3 className="detail-section-title">
            <GraduationCap className="icon" size={24} />
            Academic Information
          </h3>
          <div className="detail-info-grid">
            {academicInfo.map((item, idx) => {
              const IconComponent = item.icon;
              return (
                <div key={idx} className="detail-info-item">
                  <div className="detail-info-icon">
                    <IconComponent size={20} />
                  </div>
                  <div>
                    <p className="detail-info-label">{item.label}</p>
                    <p className="detail-info-value">{item.value}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap justify-end gap-3">
          {hasEditPermission ? (
            <button 
              onClick={() => onEdit(student)} 
              className="px-8 py-2.5 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition font-semibold shadow-md flex items-center gap-2"
            >
              <Edit2 size={18} /> Edit Student
            </button>
          ) : (
            <button 
              className="px-8 py-2.5 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed font-semibold shadow-md flex items-center gap-2"
              disabled
            >
              <Lock size={18} /> Edit Restricted
            </button>
          )}
          <button 
            onClick={onBack} 
            className="px-8 py-2.5 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition font-semibold shadow-md flex items-center gap-2"
          >
            <ArrowLeft size={18} /> Back to Students
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// 📊 STUDENT PROFILE PAGE - CARD DESIGN
// ============================================

const StudentProfilePage = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [allStudentsData, setAllStudentsData] = useState([]);
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
  const [studentsPerPage] = useState(10);
  const [sortOrder, setSortOrder] = useState('asc');
  const [hasEditPermission, setHasEditPermission] = useState(true);
  const [showAccessDenied, setShowAccessDenied] = useState(false);

  // Check user role for edit permission
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        // Check if user has admin or teacher role with edit permissions
        const allowedRoles = ['admin', 'superadmin', 'teacher'];
        if (user.role && !allowedRoles.includes(user.role.toLowerCase())) {
          setHasEditPermission(false);
        }
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  }, []);

  useEffect(() => {
    fetchClasses();
    fetchAllStudents();
  }, []);

  const fetchAllStudents = async () => {
    try {
      const response = await api.get('/users/role/student');
      setAllStudentsData(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const response = await api.get('/classes/my-classes');
      setClasses(response.data);
    } catch (error) {
      console.error('Error fetching classes:', error);
      toast.error('Failed to fetch classes');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async (classId) => {
    try {
      setLoading(true);
      const response = await api.get(`/classes/${classId}`);
      const studentsList = response.data.students || [];
      
      const enrichedStudents = studentsList.map(student => {
        const fullStudent = allStudentsData.find(s => s._id === student._id);
        return {
          ...student,
          ...fullStudent,
          profileImage: fullStudent?.profileImage || student?.profileImage || null,
          sex: fullStudent?.sex || student?.sex || null,
          age: fullStudent?.age || student?.age || null,
          email: fullStudent?.email || student?.email || null,
          phone: fullStudent?.phone || student?.phone || null,
          address: fullStudent?.address || student?.address || null,
          parentPhone: fullStudent?.parentPhone || student?.parentPhone || null,
        };
      });
      
      const sortedStudents = enrichedStudents.sort((a, b) => a.name?.localeCompare(b.name));
      setStudents(sortedStudents);
      return sortedStudents;
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to fetch students');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const handleClassSelect = async (cls) => {
    setSelectedClass(cls);
    setSelectedStudent(null);
    setShowDetailPage(false);
    setSearchTerm('');
    setCurrentPage(1);
    await fetchStudents(cls._id);
    toast.success(`Loaded ${students.length} students from ${cls.grade} - ${cls.section}`);
  };

  const refreshData = async () => {
    if (selectedClass) {
      await fetchStudents(selectedClass._id);
      toast.success('Data refreshed');
    } else {
      await fetchClasses();
      toast.success('Classes refreshed');
    }
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
    const fullStudent = allStudentsData.find(s => s._id === student._id);
    if (fullStudent?.profileImage) {
      return fullStudent.profileImage;
    }
    return null;
  };

  const handleViewDetails = (student) => {
    const fullStudent = allStudentsData.find(s => s._id === student._id) || student;
    setSelectedStudent(fullStudent);
    setShowDetailPage(true);
    setShowAccessDenied(false);
  };

  const handleBackToList = () => {
    setShowDetailPage(false);
    setSelectedStudent(null);
    setShowAccessDenied(false);
  };

  const handleEdit = (student) => {
    // Check if user has edit permission before opening edit modal
    if (!hasEditPermission) {
      setShowAccessDenied(true);
      toast.error('Access Denied: You do not have permission to edit student records');
      return;
    }
    setEditingStudent(student);
    setShowEditModal(true);
  };

  const handleUpdateStudent = async (studentId, formData) => {
    // Double-check permission before update
    if (!hasEditPermission) {
      setShowAccessDenied(true);
      toast.error('Access Denied: You do not have permission to edit student records');
      setShowEditModal(false);
      setEditingStudent(null);
      return;
    }

    setLoading(true);
    try {
      await api.put(`/users/${studentId}`, formData);
      toast.success('Student updated successfully!');
      setShowEditModal(false);
      setEditingStudent(null);
      if (selectedClass) {
        await fetchStudents(selectedClass._id);
      }
      // Update selected student if in detail view
      if (selectedStudent && selectedStudent._id === studentId) {
        const updatedStudent = allStudentsData.find(s => s._id === studentId);
        if (updatedStudent) {
          setSelectedStudent(updatedStudent);
        }
      }
    } catch (error) {
      console.error('Update error:', error);
      if (error.response?.status === 403 || error.response?.status === 401) {
        setShowAccessDenied(true);
        toast.error('Access Denied: You do not have permission to edit this student');
        setHasEditPermission(false);
      } else {
        toast.error(error.response?.data?.error || 'Failed to update student');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (studentId) => {
    if (!hasEditPermission) {
      setShowAccessDenied(true);
      toast.error('Access Denied: You do not have permission to delete student records');
      return;
    }
    
    if (!window.confirm('Are you sure you want to delete this student? This action cannot be undone.')) return;
    
    setLoading(true);
    try {
      await api.delete(`/users/${studentId}`);
      toast.success('Student deleted successfully');
      if (selectedClass) {
        await fetchStudents(selectedClass._id);
      }
    } catch (error) {
      console.error('Delete error:', error);
      if (error.response?.status === 403 || error.response?.status === 401) {
        setShowAccessDenied(true);
        toast.error('Access Denied: You do not have permission to delete this student');
        setHasEditPermission(false);
      } else {
        toast.error(error.response?.data?.error || 'Failed to delete student');
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleSortOrder = () => {
    const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    setSortOrder(newOrder);
    const sorted = [...students].sort((a, b) => {
      const comparison = a.name?.localeCompare(b.name) || 0;
      return newOrder === 'asc' ? comparison : -comparison;
    });
    setStudents(sorted);
  };

  // Edit Student Modal
  const EditStudentModal = ({ student, onClose, onUpdate, loading }) => {
    const [formData, setFormData] = useState({
      name: '',
      email: '',
      rollNumber: '',
      sex: '',
      age: '',
      grade: '',
      section: '',
      programs: '',
      phone: '',
      parentPhone: '',
      academicStatus: ''
    });

    useEffect(() => {
      if (student) {
        setFormData({
          name: student.name || '',
          email: student.email || '',
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
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-4 rounded-t-xl flex justify-between items-center">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Edit2 className="w-5 h-5" />
              Edit Student
            </h2>
            <button onClick={onClose} className="p-1 hover:bg-yellow-700 rounded-lg transition">
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Roll Number</label>
                <input
                  type="text"
                  name="rollNumber"
                  value={formData.rollNumber}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Gender</label>
                <select
                  name="sex"
                  value={formData.sex}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Age</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Parent Phone</label>
                <input
                  type="text"
                  name="parentPhone"
                  value={formData.parentPhone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Grade</label>
                <input
                  type="text"
                  name="grade"
                  value={formData.grade}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Section</label>
                <input
                  type="text"
                  name="section"
                  value={formData.section}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Program</label>
                <input
                  type="text"
                  name="programs"
                  value={formData.programs}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Academic Status</label>
                <select
                  name="academicStatus"
                  value={formData.academicStatus}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                >
                  <option value="Active">Active</option>
                  <option value="Graduated">Graduated</option>
                  <option value="Transferred">Transferred</option>
                  <option value="Dropped">Dropped</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition font-semibold flex items-center gap-2"
              >
                {loading ? 'Saving...' : <><Save className="w-4 h-4" /> Save Changes</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Show Detail Page if selected
  if (showDetailPage && selectedStudent) {
    return (
      <StudentDetailPage 
        student={selectedStudent}
        onBack={handleBackToList}
        onEdit={handleEdit}
        hasEditPermission={hasEditPermission}
      />
    );
  }

  // Show Access Denied Page
  if (showAccessDenied) {
    return <AccessDenied onBack={handleBackToList} />;
  }

  // Class selector view
  if (!selectedClass) {
    return (
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=Poppins:wght@300;400;500;600;700&display=swap');
          .class-selector-container { animation: fadeIn 0.5s ease-out; }
          @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
          .hero-section {
            background: linear-gradient(135deg, #0e7490 0%, #0891b2 50%, #22d3ee 100%);
            color: white;
            padding: 40px;
            border-radius: 15px;
            margin-bottom: 30px;
            box-shadow: 0 10px 40px rgba(8, 145, 178, 0.3);
          }
          .hero-title { font-family: 'Playfair Display', serif; font-size: 36px; font-weight: 800; margin-bottom: 10px; }
          .hero-subtitle { font-size: 16px; opacity: 0.9; }
          .class-card {
            background: white;
            padding: 24px;
            border-radius: 12px;
            cursor: pointer;
            transition: all 0.3s ease;
            border: 2px solid #e2e8f0;
            box-shadow: 0 4px 15px rgba(0,0,0,0.06);
            position: relative;
            overflow: hidden;
          }
          .class-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #0e7490, #22d3ee);
          }
          .class-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 12px 30px rgba(8, 145, 178, 0.15);
            border-color: #0891b2;
          }
          .class-icon { font-size: 40px; margin-bottom: 12px; }
          .class-title { font-size: 20px; font-weight: 700; color: #1a202c; margin-bottom: 8px; }
          .class-info { color: #666; font-size: 14px; }
          .class-stats {
            display: flex;
            gap: 20px;
            margin-top: 12px;
            padding-top: 12px;
            border-top: 1px solid #e5e7eb;
          }
          .class-stat-item { flex: 1; text-align: center; }
          .class-stat-number { font-size: 18px; font-weight: 700; color: #0891b2; }
          .class-stat-label { font-size: 11px; color: #999; text-transform: uppercase; letter-spacing: 0.5px; }
          .class-view-btn {
            width: 100%;
            background: linear-gradient(135deg, #0e7490, #0891b2);
            color: white;
            border: none;
            padding: 10px;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            margin-top: 12px;
            transition: all 0.3s;
          }
          .class-view-btn:hover { transform: scale(1.02); box-shadow: 0 6px 20px rgba(8, 145, 178, 0.3); }
        `}</style>

        <div className="class-selector-container">
          <div className="hero-section">
            <div className="flex items-center gap-4 mb-2">
              <Users size={40} />
              <div>
                <h2 className="hero-title">👨‍🎓 Student Profiles</h2>
                <p className="hero-subtitle">Select a class to view and manage student profiles</p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-200 border-t-cyan-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 font-medium">Loading classes...</p>
            </div>
          ) : classes.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-200">
              <BookOpen className="w-12 h-12 mx-auto text-gray-400 mb-3" />
              <p className="text-gray-500 text-lg font-semibold">No classes assigned to you</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {classes.map((cls) => (
                <div key={cls._id} className="class-card">
                  <div className="class-icon">📖</div>
                  <h4 className="class-title">Grade {cls.grade}</h4>
                  <p className="class-info">Section {cls.section}</p>
                  {cls.subject?.name && (
                    <div className="inline-block bg-cyan-100 text-cyan-800 text-xs px-3 py-1 rounded-full mt-2">
                      {cls.subject.name}
                    </div>
                  )}
                  <div className="class-stats">
                    <div className="class-stat-item">
                      <div className="class-stat-number">{cls.students?.length || 0}</div>
                      <div className="class-stat-label">Students</div>
                    </div>
                    <div className="class-stat-item">
                      <div className="class-stat-number">{cls.subjects?.length || 0}</div>
                      <div className="class-stat-label">Subjects</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleClassSelect(cls)}
                    className="class-view-btn"
                  >
                    View Students →
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Student list view
  return (
    <div className="max-w-full mx-auto p-4 md:p-6">
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

      <style>{`
        .profile-container { animation: fadeIn 0.5s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .profile-header {
          background: linear-gradient(135deg, #0e7490 0%, #0891b2 50%, #22d3ee 100%);
          color: white;
          padding: 30px;
          border-radius: 15px;
          margin-bottom: 30px;
          box-shadow: 0 10px 40px rgba(8, 145, 178, 0.3);
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }
        .stat-card {
          background: white;
          padding: 18px;
          border-radius: 12px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.06);
          text-align: center;
          border-top: 4px solid #0891b2;
          border: 1px solid #e2e8f0;
          transition: all 0.3s;
        }
        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(8, 145, 178, 0.12);
        }
        .stat-value { font-size: 26px; font-weight: 700; color: #0e7490; margin: 6px 0; }
        .stat-label { font-size: 11px; color: #999; text-transform: uppercase; letter-spacing: 0.5px; }
        .filter-box {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 24px;
        }
        .table-container {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          overflow: hidden;
        }
        .table-header {
          background: linear-gradient(135deg, #0e7490, #0891b2);
          color: white;
        }
        .table-header th {
          padding: 12px 16px;
          text-align: left;
          font-weight: 600;
          font-size: 13px;
          border: 1px solid #0c6a82;
        }
        .table-row td {
          padding: 10px 16px;
          border: 1px solid #e2e8f0;
          font-size: 13px;
        }
        .table-row:nth-child(even) td {
          background: #f8fafc;
        }
        .table-row:hover td {
          background: #f0f9ff;
        }
        .status-badge {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
        }
        .status-active { background: #d1fae5; color: #059669; }
        .status-graduated { background: #ede9fe; color: #7c3aed; }
        .status-transferred { background: #fef3c7; color: #f59e0b; }
        .status-dropped { background: #fee2e2; color: #dc2626; }
        .edit-disabled-btn {
          background: #e5e7eb;
          color: #9ca3af;
          cursor: not-allowed;
          padding: 4px 10px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }
      `}</style>

      <div className="profile-container">
        <div className="profile-header">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div>
              <button
                onClick={() => {
                  setSelectedClass(null);
                  setStudents([]);
                }}
                className="text-white/80 hover:text-white mb-2 flex items-center gap-1 transition"
              >
                <ChevronLeft size={20} /> Back to Classes
              </button>
              <h2 className="text-2xl font-bold">Grade {selectedClass.grade} - {selectedClass.section}</h2>
              <p className="text-cyan-100 mt-1">
                Subject: {selectedClass.subject?.name || 'N/A'} | Total Students: {students.length}
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={refreshData}
                className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition font-semibold flex items-center gap-2"
              >
                <RefreshCw size={18} />
                Refresh
              </button>
              <button
                onClick={() => {
                  const exportData = students.map(s => ({
                    'Roll No': s.rollNumber || '-',
                    'Student Name': s.name,
                    'Email': s.email || '-',
                    'Gender': s.sex || '-',
                    'Age': s.age || '-',
                    'Grade': s.grade || '-',
                    'Section': s.section || '-',
                    'Program': s.programs || '-',
                    'Phone': s.phone || '-',
                    'Parent Phone': s.parentPhone || '-',
                    'Status': s.academicStatus || 'Active'
                  }));
                  const ws = XLSX.utils.json_to_sheet(exportData);
                  const wb = XLSX.utils.book_new();
                  XLSX.utils.book_append_sheet(wb, ws, 'Students');
                  XLSX.writeFile(wb, `Students_${selectedClass.grade}_${selectedClass.section}.xlsx`);
                  toast.success('Export successful!');
                }}
                className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition font-semibold flex items-center gap-2"
              >
                <FileSpreadsheet size={18} />
                Export
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition font-semibold flex items-center gap-2"
              >
                <Printer size={18} />
                Print
              </button>
            </div>
          </div>
        </div>

        <div className="filter-box">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
            <div className="lg:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, roll..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Grade</label>
              <select
                value={filterGrade}
                onChange={(e) => {
                  setFilterGrade(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
              >
                <option value="">All Grades</option>
                {grades.map(grade => (
                  <option key={grade} value={grade}>{grade}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Program</label>
              <select
                value={filterProgram}
                onChange={(e) => {
                  setFilterProgram(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
              >
                <option value="">All Programs</option>
                {programs.map(program => (
                  <option key={program} value={program}>{program}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Section</label>
              <select
                value={filterSection}
                onChange={(e) => {
                  setFilterSection(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
              >
                <option value="">All Sections</option>
                {sections.map(section => (
                  <option key={section} value={section}>{section}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Gender</label>
              <select
                value={filterSex}
                onChange={(e) => {
                  setFilterSex(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
              >
                <option value="">All Genders</option>
                {sexes.map(sex => (
                  <option key={sex} value={sex}>{sex}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-3 flex justify-between items-center">
            <span className="text-sm text-gray-500">
              Found {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''}
            </span>
            <button
              onClick={toggleSortOrder}
              className="flex items-center gap-1 text-sm text-cyan-600 hover:text-cyan-700 font-semibold"
            >
              <ArrowUpDown className="w-4 h-4" />
              {sortOrder === 'asc' ? 'A → Z' : 'Z → A'}
            </button>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card" style={{borderTopColor: '#3b82f6'}}>
            <div className="stat-label">Total Students</div>
            <div className="stat-value" style={{color: '#3b82f6'}}>{students.length}</div>
          </div>
          <div className="stat-card" style={{borderTopColor: '#10b981'}}>
            <div className="stat-label">Active</div>
            <div className="stat-value" style={{color: '#10b981'}}>
              {students.filter(s => s.academicStatus !== 'Graduated' && s.grade !== 'Graduated').length}
            </div>
          </div>
          <div className="stat-card" style={{borderTopColor: '#8b5cf6'}}>
            <div className="stat-label">Graduated</div>
            <div className="stat-value" style={{color: '#8b5cf6'}}>
              {students.filter(s => s.academicStatus === 'Graduated' || s.grade === 'Graduated').length}
            </div>
          </div>
          <div className="stat-card" style={{borderTopColor: '#f59e0b'}}>
            <div className="stat-label">Sections</div>
            <div className="stat-value" style={{color: '#f59e0b'}}>
              {[...new Set(students.map(s => s.section).filter(Boolean))].length}
            </div>
          </div>
        </div>

        <div className="table-container">
          {loading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-200 border-t-cyan-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 font-medium">Loading students...</p>
            </div>
          ) : currentStudents.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No students found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="table-header">
                  <tr>
                    <th className="text-center">Roll</th>
                    <th className="text-center">Photo</th>
                    <th className="text-left">Student Name</th>
                    <th className="text-center">Gender</th>
                    <th className="text-center">Age</th>
                    <th className="text-center">Grade</th>
                    <th className="text-center">Section</th>
                    <th className="text-center">Program</th>
                    <th className="text-center">Status</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentStudents.map((student, index) => {
                    const studentImage = getStudentImage(student);
                    const isGraduated = student.academicStatus === 'Graduated' || student.grade === 'Graduated';
                    let statusClass = 'status-active';
                    if (isGraduated) statusClass = 'status-graduated';
                    else if (student.academicStatus === 'Transferred') statusClass = 'status-transferred';
                    else if (student.academicStatus === 'Dropped') statusClass = 'status-dropped';
                    
                    return (
                      <tr key={student._id} className={`table-row ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                        <td className="text-center font-medium text-gray-700">
                          {student.rollNumber || '-'}
                        </td>
                        <td className="text-center">
                          <Avatar name={student.name} image={studentImage} size={40} />
                        </td>
                        <td className="font-medium text-gray-900">
                          <button
                            onClick={() => handleViewDetails(student)}
                            className="hover:text-cyan-600 hover:underline transition"
                          >
                            {student.name}
                          </button>
                        </td>
                        <td className="text-center text-gray-700">
                          {student.sex || '-'}
                        </td>
                        <td className="text-center text-gray-700">
                          {student.age || '-'}
                        </td>
                        <td className="text-center text-gray-700">
                          {student.grade || '-'}
                        </td>
                        <td className="text-center text-gray-700">
                          {student.section || '-'}
                        </td>
                        <td className="text-center text-gray-700">
                          {student.programs || '-'}
                        </td>
                        <td className="text-center">
                          <span className={`status-badge ${statusClass}`}>
                            {isGraduated ? '🎓 Graduated' : student.academicStatus || 'Active'}
                          </span>
                        </td>
                        <td className="text-center">
                          <div className="flex gap-1 justify-center">
                            <button
                              onClick={() => handleViewDetails(student)}
                              className="px-2 py-1 bg-cyan-600 text-white text-xs font-semibold rounded-lg hover:bg-cyan-700 transition flex items-center gap-1"
                            >
                              <Eye size={14} />
                            </button>
                            {hasEditPermission ? (
                              <button
                                onClick={() => handleEdit(student)}
                                className="px-2 py-1 bg-yellow-500 text-white text-xs font-semibold rounded-lg hover:bg-yellow-600 transition flex items-center gap-1"
                              >
                                <Edit2 size={14} />
                              </button>
                            ) : (
                              <span className="edit-disabled-btn">
                                <Lock size={12} /> Locked
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-gray-100 border-t-2 border-gray-300">
                  <tr>
                    <td colSpan="5" className="px-4 py-3 text-sm font-bold text-gray-700">
                      Total Students
                    </td>
                    <td colSpan="5" className="px-4 py-3 text-center">
                      <span className="text-sm font-bold text-cyan-700">
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
          <div className="flex justify-center gap-3 mt-6">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 font-semibold hover:bg-gray-300 transition"
            >
              Previous
            </button>
            <span className="px-4 py-2 font-bold text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 font-semibold hover:bg-gray-300 transition"
            >
              Next
            </button>
          </div>
        )}

        {/* Access Denied Info */}
        {!hasEditPermission && (
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
            <Lock className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-yellow-800">Limited Access</p>
              <p className="text-sm text-yellow-700">
                You are viewing student profiles in read-only mode. 
                Editing and deletion are restricted to admin users only.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentProfilePage;