import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  Users, BookOpen, User, Mail, Phone, Calendar, 
  Award, TrendingUp, Eye, ChevronLeft, Search, 
  RefreshCw, X, Download, Printer, Edit2, 
  GraduationCap, Home, School, MapPin, Clock,
  Save, Trash2, ChevronDown, ChevronUp, RotateCcw,
  Archive, Filter, Plus, CheckCircle, AlertCircle,
  UserCheck, UserX, BarChart3, ArrowLeft
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
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-600',
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
    gray: 'bg-gray-100 text-gray-700',
    orange: 'bg-orange-100 text-orange-700',
  };

  return (
    <span className={`badge px-2.5 py-1 rounded-md text-xs font-semibold ${colorMap[color]}`}>
      {text}
    </span>
  );
};

// ============================================
// 📊 GRADUATED STUDENTS PAGE
// ============================================

const StudentProfilePage = () => {
  const [graduatedStudents, setGraduatedStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'detail'
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [filterGrade, setFilterGrade] = useState('');
  const [filterProgram, setFilterProgram] = useState('');
  const [filterSex, setFilterSex] = useState('');
  const [filterSection, setFilterSection] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [studentsPerPage] = useState(50);
  const [sortOrder, setSortOrder] = useState('asc');
  const [statistics, setStatistics] = useState({
    totalGraduated: 0,
    totalMale: 0,
    totalFemale: 0,
    gradeCount: {},
    programCount: {},
    sectionCount: {}
  });

  useEffect(() => {
    fetchGraduatedStudents();
  }, []);

  // ============================================
  // FETCH ALL GRADUATED STUDENTS
  // ============================================
  const fetchGraduatedStudents = async () => {
    try {
      setLoading(true);
      
      const response = await api.get('/users/role/student');
      const allStudents = response.data;
      
      const graduated = allStudents.filter(student => 
        student.academicStatus === 'Graduated' || 
        student.academicStatus === 'graduated' ||
        student.grade === 'Graduated' ||
        student.academicStatus === 'Archived' ||
        student.academicStatus === 'archived'
      );
      
      const sortedGraduated = graduated.sort((a, b) => {
        const nameA = a.name?.toLowerCase() || '';
        const nameB = b.name?.toLowerCase() || '';
        return nameA.localeCompare(nameB);
      });
      
      setGraduatedStudents(sortedGraduated);
      calculateStatistics(sortedGraduated);
      
      toast.success(`Loaded ${sortedGraduated.length} graduated students`);
    } catch (error) {
      console.error('Error fetching graduated students:', error);
      toast.error('Failed to fetch graduated students');
      
      // Mock data
      const mockGraduated = [
        { 
          _id: '1', 
          name: 'Abebe Kebede', 
          email: 'abebe@example.com', 
          grade: '12', 
          section: 'A', 
          sex: 'Male', 
          age: 18, 
          programs: 'Science', 
          academicStatus: 'Graduated', 
          rollNumber: '001',
          phone: '0912345678',
          parentPhone: '0912345679',
          dateOfBirth: '2005-06-15',
          address: 'Addis Ababa, Ethiopia'
        },
        { 
          _id: '2', 
          name: 'Tigist Haile', 
          email: 'tigist@example.com', 
          grade: '12', 
          section: 'B', 
          sex: 'Female', 
          age: 18, 
          programs: 'Mathematics', 
          academicStatus: 'Graduated', 
          rollNumber: '002',
          phone: '0912345680',
          parentPhone: '0912345681',
          dateOfBirth: '2005-08-20',
          address: 'Addis Ababa, Ethiopia'
        },
        { 
          _id: '3', 
          name: 'Yonas Tesfaye', 
          email: 'yonas@example.com', 
          grade: '12', 
          section: 'A', 
          sex: 'Male', 
          age: 19, 
          programs: 'Physics', 
          academicStatus: 'Graduated', 
          rollNumber: '003',
          phone: '0912345682',
          parentPhone: '0912345683',
          dateOfBirth: '2004-11-10',
          address: 'Addis Ababa, Ethiopia'
        },
        { 
          _id: '4', 
          name: 'Meron Assefa', 
          email: 'meron@example.com', 
          grade: '12', 
          section: 'C', 
          sex: 'Female', 
          age: 18, 
          programs: 'Biology', 
          academicStatus: 'Graduated', 
          rollNumber: '004',
          phone: '0912345684',
          parentPhone: '0912345685',
          dateOfBirth: '2005-03-25',
          address: 'Addis Ababa, Ethiopia'
        },
        { 
          _id: '5', 
          name: 'Samuel Getachew', 
          email: 'samuel@example.com', 
          grade: '12', 
          section: 'B', 
          sex: 'Male', 
          age: 18, 
          programs: 'Chemistry', 
          academicStatus: 'Graduated', 
          rollNumber: '005',
          phone: '0912345686',
          parentPhone: '0912345687',
          dateOfBirth: '2005-07-30',
          address: 'Addis Ababa, Ethiopia'
        },
      ];
      
      setGraduatedStudents(mockGraduated);
      calculateStatistics(mockGraduated);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // CALCULATE STATISTICS
  // ============================================
  const calculateStatistics = (students) => {
    const totalGraduated = students.length;
    const totalMale = students.filter(s => s.sex === 'Male').length;
    const totalFemale = students.filter(s => s.sex === 'Female').length;
    
    const gradeCount = {};
    const programCount = {};
    const sectionCount = {};
    
    students.forEach(s => {
      if (s.grade) gradeCount[s.grade] = (gradeCount[s.grade] || 0) + 1;
      if (s.programs) programCount[s.programs] = (programCount[s.programs] || 0) + 1;
      if (s.section) sectionCount[s.section] = (sectionCount[s.section] || 0) + 1;
    });
    
    setStatistics({
      totalGraduated,
      totalMale,
      totalFemale,
      gradeCount,
      programCount,
      sectionCount
    });
  };

  // ============================================
  // RESTORE STUDENT TO ACTIVE
  // ============================================
  const restoreStudent = async (studentId) => {
    if (!window.confirm('Are you sure you want to restore this student to Active status?')) return;
    
    setLoading(true);
    try {
      await api.put(`/users/${studentId}`, { academicStatus: 'Active' });
      toast.success('Student restored to Active status successfully!');
      await fetchGraduatedStudents();
      if (viewMode === 'detail') {
        setViewMode('list');
        setSelectedStudent(null);
      }
    } catch (error) {
      console.error('Restore error:', error);
      toast.error(error.response?.data?.error || 'Failed to restore student');
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // RESTORE ALL GRADUATED STUDENTS
  // ============================================
  const restoreAllGraduated = async () => {
    if (graduatedStudents.length === 0) {
      toast.error('No graduated students to restore');
      return;
    }
    
    if (!window.confirm(`Are you sure you want to restore all ${graduatedStudents.length} graduated students to Active status?`)) return;
    
    setLoading(true);
    let restoredCount = 0;
    let failedCount = 0;
    
    for (const student of graduatedStudents) {
      try {
        await api.put(`/users/${student._id}`, { academicStatus: 'Active' });
        restoredCount++;
      } catch (error) {
        failedCount++;
        console.error(`Failed to restore student ${student.name}:`, error);
      }
    }
    
    await fetchGraduatedStudents();
    toast.success(`Restored ${restoredCount} students to Active status${failedCount > 0 ? `, ${failedCount} failed` : ''}`);
    setLoading(false);
  };

  const refreshData = async () => {
    await fetchGraduatedStudents();
    toast.success('Data refreshed');
  };

  // Toggle sort order
  const toggleSortOrder = () => {
    const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    setSortOrder(newOrder);
    const sorted = [...graduatedStudents].sort((a, b) => {
      const nameA = a.name?.toLowerCase() || '';
      const nameB = b.name?.toLowerCase() || '';
      if (newOrder === 'asc') {
        return nameA.localeCompare(nameB);
      } else {
        return nameB.localeCompare(nameA);
      }
    });
    setGraduatedStudents(sorted);
  };

  // Get unique values for filters
  const grades = [...new Set(graduatedStudents.map(s => s.grade).filter(Boolean))].sort();
  const programs = [...new Set(graduatedStudents.map(s => s.programs).filter(Boolean))].sort();
  const sections = [...new Set(graduatedStudents.map(s => s.section).filter(Boolean))].sort();
  const sexes = ['Male', 'Female', 'Other'];

  // Filter students
  const filteredStudents = graduatedStudents.filter(s => {
    const matchesSearch = s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         s.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         s.rollNumber?.toString().includes(searchTerm);
    const matchesGrade = filterGrade ? s.grade === filterGrade : true;
    const matchesProgram = filterProgram ? s.programs === filterProgram : true;
    const matchesSection = filterSection ? s.section === filterSection : true;
    const matchesSex = filterSex ? s.sex === filterSex : true;
    return matchesSearch && matchesGrade && matchesProgram && matchesSection && matchesSex;
  });

  // Pagination
  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent);
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);

  // Get student profile image
  const getStudentImage = (student) => {
    if (student?.profileImage) {
      return student.profileImage;
    }
    const name = student.name || 'Student';
    const colorPalette = ['7C3AED', '4F46E5', 'EC4899', 'EF4444', 'F59E0B', '10B981', '3B82F6', '8B5CF6'];
    const colorIndex = name.length % colorPalette.length;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${colorPalette[colorIndex]}&color=fff&size=40&font-size=0.5&bold=true`;
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Handle view details - opens as new page/component
  const handleViewDetails = (student) => {
    setSelectedStudent(student);
    setViewMode('detail');
  };

  // Handle back to list
  const handleBackToList = () => {
    setSelectedStudent(null);
    setViewMode('list');
  };

  // Handle edit
  const handleEdit = (student) => {
    setEditingStudent(student);
    setShowEditModal(true);
  };

  // Handle update student
  const handleUpdateStudent = async (studentId, formData) => {
    setLoading(true);
    try {
      await api.put(`/users/${studentId}`, formData);
      toast.success('Student updated successfully!');
      setShowEditModal(false);
      setEditingStudent(null);
      await fetchGraduatedStudents();
      // Refresh selected student data if in detail view
      if (viewMode === 'detail' && selectedStudent) {
        const updated = graduatedStudents.find(s => s._id === studentId);
        if (updated) setSelectedStudent(updated);
      }
    } catch (error) {
      console.error('Update error:', error);
      toast.error(error.response?.data?.error || 'Failed to update student');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete student
  const handleDelete = async (studentId) => {
    if (!window.confirm('Are you sure you want to delete this student? This action cannot be undone.')) return;
    
    setLoading(true);
    try {
      await api.delete(`/users/${studentId}`);
      toast.success('Student deleted successfully');
      await fetchGraduatedStudents();
      if (viewMode === 'detail') {
        setViewMode('list');
        setSelectedStudent(null);
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error.response?.data?.error || 'Failed to delete student');
    } finally {
      setLoading(false);
    }
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
                <label className="edit-form-label block text-sm font-semibold text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
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
                  <option value="Transferred">Transferred</option>
                  <option value="Dropped">Dropped</option>
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
  // STUDENT DETAIL VIEW (Separate Page/Component)
  // ============================================
  if (viewMode === 'detail' && selectedStudent) {
    const student = selectedStudent;
    const studentImage = getStudentImage(student);

    const personalInfo = [
      { label: 'Full Name', value: student.name, icon: User },
      { label: 'Email', value: student.email, icon: Mail },
      { label: 'Phone', value: student.phone || '-', icon: Phone },
      { label: 'Gender', value: student.sex || '-', icon: Users },
      { label: 'Age', value: student.age || '-', icon: Calendar },
      { label: 'Date of Birth', value: formatDate(student.dateOfBirth), icon: Calendar },
      { label: 'Address', value: student.address || '-', icon: Home },
      { label: 'Parent Phone', value: student.parentPhone || '-', icon: Phone },
    ];

    const academicInfo = [
      { label: 'Roll Number', value: student.rollNumber || '-', icon: BookOpen },
      { label: 'Grade', value: student.grade || '-', icon: School },
      { label: 'Section', value: student.section || '-', icon: MapPin },
      { label: 'Program', value: student.programs || '-', icon: TrendingUp },
      { label: 'Academic Status', value: student.academicStatus || 'Graduated', icon: GraduationCap },
      { label: 'Graduation Year', value: student.graduationYear || student.academicYear || '-', icon: Calendar },
    ];

    return (
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <style>{`
          .detail-header {
            background: linear-gradient(135deg, #7C3AED, #6D28D9);
            color: white;
            padding: 30px 40px;
            border-radius: 15px;
            margin-bottom: 30px;
            box-shadow: 0 10px 40px rgba(124, 58, 237, 0.2);
          }
          .detail-header-content {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            flex-wrap: wrap;
            gap: 20px;
          }
          .student-header-info h3 { font-size: 28px; font-weight: 700; margin-bottom: 10px; }
          .detail-badge {
            display: inline-block;
            background: rgba(255,255,255,0.2);
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            margin-right: 8px;
          }
          .action-buttons { display: flex; gap: 10px; flex-wrap: wrap; }
          .cert-btn {
            background: #22d3ee;
            color: #0f172a;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
            font-size: 14px;
          }
          .cert-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(34, 211, 238, 0.3); }
          .cert-btn-back { background: #6b7280; color: white; }
          .cert-btn-back:hover { background: #4b5563; }
          .cert-btn-restore { background: #22c55e; color: white; }
          .cert-btn-restore:hover { background: #16a34a; }
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
          }
          .stat-card {
            background: white;
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.08);
            text-align: center;
            border-top: 4px solid #7C3AED;
          }
          .stat-card-value { font-size: 32px; font-weight: 700; color: #7C3AED; margin: 10px 0; }
          .stat-card-label { font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 1px; }
          .profile-info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 15px;
            margin: 20px 0;
          }
          .profile-info-item {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 12px 16px;
            background: #f8fafc;
            border-radius: 10px;
            border: 1px solid #e2e8f0;
          }
          .profile-info-item .label {
            font-size: 12px;
            font-weight: 600;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .profile-info-item .value {
            font-size: 14px;
            font-weight: 600;
            color: #0f172a;
          }
        `}</style>

        <div className="detail-header">
          <div className="detail-header-content">
            <div className="student-header-info flex items-center gap-4">
              <img
                src={studentImage}
                alt={student.name}
                className="w-48 h-48 object-cover border-4 border-white shadow-lg"
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=7C3AED&color=fff&size=120&font-size=0.5&bold=true`;
                }}
              />
              <div>
                <h3 style={{ whiteSpace: 'nowrap' }}>{student.name}</h3>
                <div className="flex flex-wrap gap-2 mt-1">
                  <span className="detail-badge">Roll No: {student.rollNumber || '-'}</span>
                  <span className="detail-badge">Grade: {student.grade || '-'}</span>
                  <span className="detail-badge">Section: {student.section || '-'}</span>
                  <span className="detail-badge">Gender: {student.sex || 'N/A'}</span>
                  <span className="detail-badge">Age: {student.age || 'N/A'}</span>
                  <span className="detail-badge">🎓 Graduated</span>
                </div>
              </div>
            </div>
            <div className="action-buttons">
              <button 
                onClick={handleBackToList}
                className="cert-btn cert-btn-back flex items-center gap-2"
              >
                <ArrowLeft size={18} /> Back to Graduated Students
              </button>
              <button 
                onClick={() => restoreStudent(student._id)}
                className="cert-btn cert-btn-restore flex items-center gap-2"
              >
                <RotateCcw size={18} /> Restore to Active
              </button>
              <button 
                onClick={() => handleEdit(student)}
                className="cert-btn flex items-center gap-2"
                style={{ background: '#eab308', color: 'white' }}
              >
                <Edit2 size={18} /> Edit
              </button>
            </div>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card" style={{borderTopColor: '#3b82f6'}}>
            <div className="stat-card-label">Age</div>
            <div className="stat-card-value" style={{color: '#3b82f6'}}>{student.age || '-'}</div>
          </div>
          <div className="stat-card" style={{borderTopColor: '#7C3AED'}}>
            <div className="stat-card-label">Status</div>
            <div className="stat-card-value" style={{color: '#7C3AED'}}>Graduated</div>
          </div>
          <div className="stat-card" style={{borderTopColor: '#f59e0b'}}>
            <div className="stat-card-label">Program</div>
            <div className="stat-card-value" style={{color: '#f59e0b', fontSize: '24px'}}>{student.programs || '-'}</div>
          </div>
          <div className="stat-card" style={{borderTopColor: '#22c55e'}}>
            <div className="stat-card-label">Grade</div>
            <div className="stat-card-value" style={{color: '#22c55e'}}>{student.grade || '-'}</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white p-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <User size={20} /> Personal Information
            </h3>
          </div>
          <div className="p-6">
            <div className="profile-info-grid">
              {personalInfo.map((item, idx) => {
                const IconComponent = item.icon;
                return (
                  <div key={idx} className="profile-info-item">
                    <IconComponent size={18} className="text-indigo-500" />
                    <div>
                      <div className="label">{item.label}</div>
                      <div className="value">{item.value}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <BookOpen size={20} /> Academic Information
            </h3>
          </div>
          <div className="p-6">
            <div className="profile-info-grid">
              {academicInfo.map((item, idx) => {
                const IconComponent = item.icon;
                return (
                  <div key={idx} className="profile-info-item">
                    <IconComponent size={18} className="text-purple-500" />
                    <div>
                      <div className="label">{item.label}</div>
                      <div className="value">{item.value}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // MAIN LIST VIEW
  // ============================================
  return (
    <div className="student-list-container min-h-screen bg-gradient-to-br from-purple-50 to-gray-100 p-6">
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
                <h1 className="student-list-title text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <GraduationCap className="w-8 h-8 text-purple-600" />
                  Graduated Students
                </h1>
                <p className="student-list-subtitle text-gray-600 mt-1">
                  View and manage all graduated student profiles with complete information
                </p>
                <p className="student-list-total text-sm text-gray-500 mt-1">
                  Total Graduated Students: 
                  <span className="student-list-total-count font-semibold text-purple-600">
                    {' '}{graduatedStudents.length}
                  </span>
                </p>
              </div>
            </div>
            <div className="student-list-header-actions flex gap-2 flex-wrap">
              {graduatedStudents.length > 0 && (
                <button 
                  onClick={restoreAllGraduated}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" /> Restore All
                </button>
              )}
              <button 
                onClick={toggleSortOrder}
                className="student-sort-btn px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold flex items-center gap-2"
              >
                {sortOrder === 'asc' ? '↑ A-Z' : '↓ Z-A'}
              </button>
              <button 
                onClick={refreshData} 
                className="student-refresh-btn px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-semibold flex items-center gap-2"
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

        {/* Statistics Cards */}
        <div className="student-summary-grid grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="student-summary-card bg-white border border-purple-200 rounded-lg p-4">
            <p className="student-summary-label text-xs font-medium text-purple-600">Total Graduated</p>
            <p className="student-summary-value text-2xl font-bold text-purple-600">
              {statistics.totalGraduated}
            </p>
          </div>
          <div className="student-summary-card bg-white border border-blue-200 rounded-lg p-4">
            <p className="student-summary-label text-xs font-medium text-blue-600">Male</p>
            <p className="student-summary-value text-2xl font-bold text-blue-600">
              {statistics.totalMale}
            </p>
          </div>
          <div className="student-summary-card bg-white border border-pink-200 rounded-lg p-4">
            <p className="student-summary-label text-xs font-medium text-pink-600">Female</p>
            <p className="student-summary-value text-2xl font-bold text-pink-600">
              {statistics.totalFemale}
            </p>
          </div>
          <div className="student-summary-card bg-white border border-orange-200 rounded-lg p-4">
            <p className="student-summary-label text-xs font-medium text-orange-600">Sections</p>
            <p className="student-summary-value text-2xl font-bold text-orange-600">
              {Object.keys(statistics.sectionCount).length}
            </p>
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
                  className="student-search-input w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
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
                className="student-filter-select w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
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
                className="student-filter-select w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
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
                className="student-filter-select w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
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
                className="student-filter-select w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
              >
                <option value="">All Genders</option>
                {sexes.map(sex => (
                  <option key={sex} value={sex}>{sex}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="student-search-results mt-3 text-sm text-gray-500">
            Found {filteredStudents.length} graduated student{filteredStudents.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Students Table */}
        <div className="student-table-container bg-white border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="student-table-loading flex justify-center items-center py-12">
              <div className="student-table-loading-spinner animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
            </div>
          ) : currentStudents.length === 0 ? (
            <div className="student-table-empty text-center py-12 text-gray-500">
              <GraduationCap className="student-table-empty-icon w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="student-table-empty-text">No graduated students found</p>
              <p className="student-table-empty-subtext text-sm text-gray-400 mt-1">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="student-table-scroll overflow-x-auto">
              <table className="student-table w-full border-collapse">
                <thead className="student-table-header">
                  <tr className="student-table-header-row bg-purple-600 text-white">
                    <th className="student-table-header-cell px-3 py-2 text-left text-sm font-bold border border-purple-700">Roll No</th>
                    <th className="student-table-header-cell px-3 py-2 text-center text-sm font-bold border border-purple-700">Photo</th>
                    <th className="student-table-header-cell px-3 py-2 text-left text-sm font-bold border border-purple-700 cursor-pointer hover:bg-purple-700 transition" onClick={toggleSortOrder} style={{ whiteSpace: 'nowrap' }}>
                      Student Name {sortOrder === 'asc' ? '↑' : '↓'}
                    </th>
                    <th className="student-table-header-cell px-3 py-2 text-left text-sm font-bold border border-purple-700">Email</th>
                    <th className="student-table-header-cell px-3 py-2 text-center text-sm font-bold border border-purple-700">Gender</th>
                    <th className="student-table-header-cell px-3 py-2 text-center text-sm font-bold border border-purple-700">Age</th>
                    <th className="student-table-header-cell px-3 py-2 text-center text-sm font-bold border border-purple-700">Grade</th>
                    <th className="student-table-header-cell px-3 py-2 text-center text-sm font-bold border border-purple-700">Section</th>
                    <th className="student-table-header-cell px-3 py-2 text-center text-sm font-bold border border-purple-700">Program</th>
                    <th className="student-table-header-cell px-3 py-2 text-center text-sm font-bold border border-purple-700">Status</th>
                    <th className="student-table-header-cell px-3 py-2 text-center text-sm font-bold border border-purple-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="student-table-body">
                  {currentStudents.map((student, index) => {
                    const studentImage = getStudentImage(student);
                    
                    return (
                      <tr key={student._id || index} className="student-table-row hover:bg-purple-50 transition even:bg-gray-50">
                        <td className="student-table-cell px-3 py-2 text-sm text-gray-700 border border-gray-200">
                          {student.rollNumber || '-'}
                        </td>
                        <td className="student-table-cell px-3 py-2 text-center border border-gray-200">
                          <img 
                            src={studentImage} 
                            alt={student.name}
                            className="student-table-avatar w-10 h-10 rounded-full object-cover border-2 border-purple-200 mx-auto cursor-pointer"
                            onClick={() => handleViewDetails(student)}
                            onError={(e) => {
                              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=7C3AED&color=fff&size=40&font-size=0.5&bold=true`;
                            }}
                          />
                        </td>
                        <td className="student-table-cell px-3 py-2 text-sm font-medium text-gray-900 border border-gray-200" style={{ whiteSpace: 'nowrap' }}>
                          <button
                            onClick={() => handleViewDetails(student)}
                            className="student-name-btn hover:text-purple-600 hover:underline transition"
                          >
                            {student.name}
                          </button>
                        </td>
                        <td className="student-table-cell px-3 py-2 text-sm text-gray-700 border border-gray-200">
                          {student.email || '-'}
                        </td>
                        <td className="student-table-cell px-3 py-2 text-center text-sm text-gray-700 border border-gray-200">
                          {student.sex || '-'}
                        </td>
                        <td className="student-table-cell px-3 py-2 text-center text-sm text-gray-700 border border-gray-200">
                          {student.age || '-'}
                        </td>
                        <td className="student-table-cell px-3 py-2 text-center text-sm text-gray-700 border border-gray-200">
                          {student.grade || '-'}
                        </td>
                        <td className="student-table-cell px-3 py-2 text-center text-sm text-gray-700 border border-gray-200">
                          {student.section || '-'}
                        </td>
                        <td className="student-table-cell px-3 py-2 text-center text-sm text-gray-700 border border-gray-200">
                          {student.programs || '-'}
                        </td>
                        <td className="student-table-cell px-3 py-2 text-center border border-gray-200">
                          <Badge text="Graduated" color="purple" />
                        </td>
                        <td className="student-table-cell px-3 py-2 text-center border border-gray-200">
                          <div className="student-actions flex gap-1 justify-center flex-wrap">
                            <button
                              onClick={() => handleViewDetails(student)}
                              className="student-view-btn px-2 py-1 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition flex items-center gap-1"
                            >
                              <Eye className="student-view-btn-icon w-3 h-3" /> View
                            </button>
                          
                            <button
                              onClick={() => restoreStudent(student._id)}
                              className="student-restore-btn px-2 py-1 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700 transition flex items-center gap-1"
                            >
                              <RotateCcw className="student-restore-btn-icon w-3 h-3" /> 
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
                    <td colSpan="7" className="student-table-footer-cell px-3 py-2 text-sm font-semibold text-gray-700">
                      Total Graduated Students
                    </td>
                    <td colSpan="5" className="student-table-footer-cell px-3 py-2 text-center border border-gray-200">
                      <span className="student-table-footer-total text-sm font-semibold text-purple-600">
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
      </div>
    </div>
  );
};

export default StudentProfilePage;