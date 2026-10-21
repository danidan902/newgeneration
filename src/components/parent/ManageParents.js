import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { 
  UserPlus, Link, Trash2, Key, RefreshCw, X, Search, Copy, Users, 
  Phone, Mail, UserMinus, Eye, GraduationCap, Award, Shield, Heart, Star,
  BookOpen, Calendar, Clock, ChevronRight, Filter, Download, Printer,
  ArrowRight, CheckCircle, AlertCircle, TrendingUp, Target,
  ArrowLeft, School, MapPin
} from 'lucide-react';
import api from '../../services/api';
import * as XLSX from 'xlsx';

// ============================================
// 📊 REUSABLE COMPONENTS
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
    pink: 'bg-pink-100 text-pink-700',
  };

  return (
    <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${colorMap[color]}`}>
      {text}
    </span>
  );
};

// ============================================
// 📊 RELATIONSHIP BADGE
// ============================================
const RelationshipBadge = ({ relationship }) => {
  const styles = {
    father: { bg: 'bg-cyan-100', text: 'text-cyan-700', label: '👨 Father' },
    mother: { bg: 'bg-pink-100', text: 'text-pink-700', label: '👩 Mother' },
    guardian: { bg: 'bg-purple-100', text: 'text-purple-700', label: '🛡️ Guardian' }
  };
  
  const style = styles[relationship?.toLowerCase()] || styles.guardian;
  
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${style.bg} ${style.text}`}>
      {style.label}
    </span>
  );
};

// ============================================
// 📊 STAT CARD
// ============================================
const StatCard = ({ icon: Icon, label, value, color = 'blue' }) => {
  const colorMap = {
    blue: 'border-cyan-200 text-cyan-700 bg-cyan-50',
    green: 'border-green-200 text-green-700 bg-green-50',
    purple: 'border-purple-200 text-purple-700 bg-purple-50',
    orange: 'border-orange-200 text-orange-700 bg-orange-50',
    red: 'border-red-200 text-red-700 bg-red-50',
  };

  return (
    <div className={`border rounded-xl p-5 text-center ${colorMap[color]} transition-all hover:shadow-md`}>
      <Icon className="w-8 h-8 mx-auto mb-2 opacity-50" />
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs font-semibold uppercase tracking-wider opacity-75">{label}</p>
    </div>
  );
};

// ============================================
// 📊 STUDENT PILL COMPONENT
// ============================================
const StudentPill = ({ student, onView, onUnlink }) => {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-xl hover:border-cyan-300 transition-all hover:shadow-sm">
      <Avatar name={student.name} image={student.profileImage} size={28} />
      <div>
        <div className="font-semibold text-gray-800 text-sm">{student.name}</div>
        <div className="text-xs text-gray-500">Roll: {student.rollNumber}</div>
      </div>
      <div className="flex gap-1">
        <button 
          onClick={() => onView(student)} 
          className="p-1.5 text-cyan-600 hover:bg-cyan-100 rounded-lg transition" 
          title="View details"
        >
          <Eye className="w-4 h-4" />
        </button>
        <button 
          onClick={() => onUnlink(student)} 
          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition" 
          title="Unlink"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// ============================================
// 📊 MAIN COMPONENT
// ============================================

const ManageParents = () => {
  const [parents, setParents] = useState([]);
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [linkedStudentsMap, setLinkedStudentsMap] = useState({});
  
  // Bulk link search states
  const [parentSearchTerm, setParentSearchTerm] = useState('');
  const [studentSearchTerm, setStudentSearchTerm] = useState('');
  
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [availableGrades, setAvailableGrades] = useState([]);
  const [availableSections, setAvailableSections] = useState([]);
  
  const [selectedParents, setSelectedParents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectAllParents, setSelectAllParents] = useState(false);
  const [selectAllStudents, setSelectAllStudents] = useState(false);
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showStudentDetailsModal, setShowStudentDetailsModal] = useState(false);
  const [selectedStudentDetails, setSelectedStudentDetails] = useState(null);
  
  const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '', relationship: 'guardian' });
  const [fetchPasswordData, setFetchPasswordData] = useState({ email: '', phone: '' });
  const [fetchedPassword, setFetchedPassword] = useState('');
  const [loadingAction, setLoadingAction] = useState(false);

  const getToken = () => localStorage.getItem('token');

  // Fetch full student data including profile image
  const fetchStudentWithImage = async (studentId) => {
    try {
      const response = await api.get(`/users/${studentId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching student:', error);
      return null;
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const parentsRes = await api.get('/superadmin/parents');
      console.log('Parents response:', parentsRes.data);
      
      if (parentsRes.data.success) {
        const parentsData = parentsRes.data.data || [];
        setParents(parentsData);
        
        // Fetch full student data for each linked student
        const linkedMap = {};
        for (const parent of parentsData) {
          const linkedStudents = [];
          if (parent.students && parent.students.length > 0) {
            for (const student of parent.students) {
              const fullStudent = await fetchStudentWithImage(student._id);
              if (fullStudent) {
                linkedStudents.push({
                  _id: fullStudent._id,
                  name: fullStudent.name,
                  rollNumber: fullStudent.rollNumber,
                  profileImage: fullStudent.profileImage || null,
                  grade: fullStudent.grade,
                  section: fullStudent.section,
                  email: fullStudent.email,
                  sex: fullStudent.sex,
                  programs: fullStudent.programs
                });
              } else {
                // Fallback to existing data
                linkedStudents.push({
                  _id: student._id,
                  name: student.name || 'Unknown',
                  rollNumber: student.rollNumber || 'N/A',
                  profileImage: null,
                  grade: student.grade,
                  section: student.section
                });
              }
            }
          }
          linkedMap[parent._id] = linkedStudents;
        }
        setLinkedStudentsMap(linkedMap);
        console.log('Linked students map with images:', linkedMap);
      }
      
      const studentsRes = await api.get('/users/role/student');
      console.log('Students response:', studentsRes.data);
      
      if (Array.isArray(studentsRes.data)) {
        const formattedStudents = studentsRes.data.map(s => ({ 
          _id: s._id, 
          name: s.name, 
          rollNumber: s.rollNumber,
          grade: s.grade || 'N/A',
          section: s.section || 'N/A',
          email: s.email,
          sex: s.sex,
          programs: s.programs,
          profileImage: s.profileImage || null
        }));
        setStudents(formattedStudents);
        setFilteredStudents(formattedStudents);
        
        const grades = [...new Set(formattedStudents.map(s => s.grade).filter(g => g && g !== 'N/A'))];
        const sections = [...new Set(formattedStudents.map(s => s.section).filter(sec => sec && sec !== 'N/A'))];
        setAvailableGrades(grades.sort());
        setAvailableSections(sections.sort());
      }
      
    } catch (error) { 
      console.error('Error loading data:', error);
      toast.error('Failed to load data'); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { 
    loadData(); 
  }, []);

  useEffect(() => {
    let filtered = [...students];
    if (selectedGrade) filtered = filtered.filter(s => s.grade === selectedGrade);
    if (selectedSection) filtered = filtered.filter(s => s.section === selectedSection);
    setFilteredStudents(filtered);
    setSelectedStudents([]);
    setSelectAllStudents(false);
  }, [selectedGrade, selectedSection, students]);

  useEffect(() => {
    if (selectAllParents) setSelectedParents(parents.map(p => p._id));
    else setSelectedParents([]);
  }, [selectAllParents, parents]);

  useEffect(() => {
    if (selectAllStudents) setSelectedStudents(filteredStudents.map(s => s._id));
    else setSelectedStudents([]);
  }, [selectAllStudents, filteredStudents]);

  const toggleParent = (id) => {
    setSelectedParents(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    setSelectAllParents(false);
  };

  const toggleStudent = (id) => {
    setSelectedStudents(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    setSelectAllStudents(false);
  };

  const clearFilters = () => {
    setSelectedGrade('');
    setSelectedSection('');
  };

  const handleCreateParent = async (e) => {
    e.preventDefault();
    setLoadingAction(true);
    try {
      const response = await api.post('/superadmin/create-parent', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        relationship: formData.relationship
      });
      
      if (response.data.success) {
        toast.success(`✅ Parent created! Password: ${formData.password}`);
        setShowCreateModal(false);
        setFormData({ 
          name: '', 
          email: '', 
          password: '', 
          phone: '', 
          relationship: 'guardian' 
        });    
        loadData();
      } else {
        toast.error(response.data.message || 'Error creating parent');
      }
    } catch (error) {
      console.error('Create parent error:', error);
      toast.error(error.response?.data?.message || 'Error creating parent');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleBulkLink = async () => {
    if (selectedParents.length === 0) return toast.error('Select at least one parent');
    if (selectedStudents.length === 0) return toast.error('Select at least one student');
    
    setLoadingAction(true);
    let success = 0;
    let failed = 0;
    let alreadyLinked = 0;
    
    for (const parentId of selectedParents) {
      for (const studentId of selectedStudents) {
        try {
          await api.post('/admin/link-parent-student', { parentId, studentId });
          success++;
        } catch (err) {
          if (err.response?.data?.message === 'Parent already linked to this student') {
            alreadyLinked++;
          } else {
            failed++;
          }
          console.error('Link error:', err.response?.data);
        }
      }
    }
    
    if (success === 0 && failed === 0 && alreadyLinked > 0) {
      toast.error(`⚠️ All ${alreadyLinked} student(s) are already linked to these parents`);
    } 
    else if (success === 0 && failed === 1 && alreadyLinked === 0) {
      toast.error(`❌ Failed to link ${failed} connection. Please check if students are already linked.`);
    }
    else if (success === 0 && failed > 1 && alreadyLinked === 0) {
      toast.error(`❌ Failed to link ${failed} connections. Please check if students are already linked.`);
    }
    else if (success === 0 && failed > 0 && alreadyLinked > 0) {
      toast.error(`❌ Failed to link ${failed} connection${failed !== 1 ? 's' : ''}, ⚠️ ${alreadyLinked} already linked`);
    }
    else if (success > 0 && failed === 0 && alreadyLinked === 0) {
      toast.success(`✅ Successfully linked ${success} connection${success !== 1 ? 's' : ''}!`);
      await loadData();
    }
    else if (success > 0 && failed === 0 && alreadyLinked > 0) {
      toast.success(`✅ Linked ${success} new connection${success !== 1 ? 's' : ''}, ⚠️ ${alreadyLinked} already linked`);
      await loadData();
    }
    else if (success > 0 && failed > 0) {
      toast.warning(`✅ Linked ${success} connection${success !== 1 ? 's' : ''}, ❌ ${failed} failed, ⚠️ ${alreadyLinked} already linked`);
      await loadData();
    }
       
    setShowLinkModal(false);
    setSelectedParents([]);
    setSelectedStudents([]);
    setSelectAllParents(false);
    setSelectAllStudents(false);
    setLoadingAction(false);
  };

  const handleFetchPassword = async () => {
    if (!fetchPasswordData.email && !fetchPasswordData.phone) {
      return toast.error('Enter email or phone');
    }
    setLoadingAction(true);
    try {
      const response = await api.post('/superadmin/fetch-parent-password', fetchPasswordData);
      if (response.data.success) {
        setFetchedPassword(response.data.password);
        toast.success('✅ Password found!');
      } else {
        toast.error(response.data.message || 'Parent not found');
      }
    } catch (error) {
      console.error('Fetch password error:', error);
      toast.error(error.response?.data?.message || 'Error fetching password');
    } finally {
      setLoadingAction(false);
    }
  };

  const copyPassword = () => {
    navigator.clipboard.writeText(fetchedPassword);
    toast.success('✅ Password copied!');
  };

  const handleResetPassword = async (parentId) => {
    const newPassword = prompt('Enter new password (min 6 characters):');
    if (!newPassword || newPassword.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }
    
    setLoadingAction(true);
    try {
      const response = await api.post(`/superadmin/parent/${parentId}/reset-password`, { 
        newPassword: newPassword 
      });
      if (response.data.success) {
        toast.success(`✅ Password reset successfully! New password: ${newPassword}`);
      } else {
        toast.error(response.data.message || 'Failed to reset password');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      toast.error('Failed to reset password');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleDeleteParent = async (parentId, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;
    
    setLoadingAction(true);
    try {
      const response = await api.delete(`/superadmin/parent/${parentId}`);
      if (response.data.success) {
        toast.success('✅ Parent deleted successfully');
        await loadData();
      } else {
        toast.error(response.data.message || 'Failed to delete parent');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete parent');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleUnlinkStudent = async (parentId, studentId, studentName) => {
    if (!window.confirm(`Remove ${studentName} from this parent?`)) return;
    
    setLoadingAction(true);
    try {
      const response = await api.delete('/admin/unlink-parent-student', { 
        data: { parentId, studentId } 
      });
      if (response.data.success) {
        toast.success('✅ Student unlinked successfully');
        await loadData();
      } else {
        toast.error(response.data.message || 'Failed to unlink student');
      }
    } catch (error) {
      console.error('Unlink error:', error);
      toast.error('Failed to unlink student');
    } finally {
      setLoadingAction(false);
    }
  };

  const viewStudentDetails = (student) => {
    setSelectedStudentDetails(student);
    setShowStudentDetailsModal(true);
  };

  // Filter parents for bulk link modal
  const filteredParentsForBulk = parents.filter(p =>
    p.name?.toLowerCase().includes(parentSearchTerm.toLowerCase()) ||
    p.email?.toLowerCase().includes(parentSearchTerm.toLowerCase()) ||
    p.phone?.includes(parentSearchTerm)
  );

  // Filter students for bulk link modal
  const filteredStudentsForBulk = filteredStudents.filter(s =>
    s.name?.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
    s.rollNumber?.toString().includes(studentSearchTerm) ||
    s.email?.toLowerCase().includes(studentSearchTerm.toLowerCase())
  );

  const filteredParents = parents.filter(p =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.phone?.includes(searchTerm)
  );

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-cyan-200 border-t-cyan-600 mx-auto mb-4"></div>
        <p className="text-gray-600 font-semibold text-lg">Loading parent management...</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=Poppins:wght@300;400;500;600;700&display=swap');
        
        .manage-container { animation: fadeIn 0.5s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        
        .manage-hero {
          background: linear-gradient(135deg, #0e7490 0%, #0891b2 50%, #22d3ee 100%);
          color: white;
          padding: 35px;
          border-radius: 15px;
          margin-bottom: 30px;
          box-shadow: 0 10px 40px rgba(8, 145, 178, 0.3);
        }
        .manage-hero-title { font-family: 'Playfair Display', serif; font-size: 36px; font-weight: 800; margin-bottom: 10px; }
        .manage-hero-subtitle { font-size: 16px; opacity: 0.9; }
        
        .manage-filter-box {
          background: white;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 24px;
          transition: all 0.3s;
        }
        .manage-filter-box:focus-within {
          border-color: #0891b2;
          box-shadow: 0 0 0 3px rgba(8, 145, 178, 0.1);
        }
        
        .parent-card {
          background: white;
          border: 2px solid #e2e8f0;
          border-radius: 16px;
          padding: 24px;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(0,0,0,0.06);
          position: relative;
          overflow: hidden;
          margin-bottom: 20px;
        }
        .parent-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #0e7490, #22d3ee);
        }
        .parent-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 30px rgba(8, 145, 178, 0.15);
          border-color: #0891b2;
        }
        
        .parent-avatar-wrapper {
          width: 56px;
          height: 56px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #0e7490, #0891b2);
          flex-shrink: 0;
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }
        
        .btn-hero {
          background: white;
          color: #0e7490;
          border: 2px solid white;
          padding: 10px 20px;
          border-radius: 12px;
          font-weight: 700;
          transition: all 0.3s;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          cursor: pointer;
        }
        .btn-hero:hover {
          background: rgba(255,255,255,0.15);
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(255,255,255,0.2);
        }
        
        .btn-primary-class {
          background: linear-gradient(135deg, #0e7490, #0891b2);
          color: white;
          padding: 8px 16px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 13px;
          transition: all 0.3s;
          border: none;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .btn-primary-class:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(8, 145, 178, 0.3);
        }
        
        .btn-success-class {
          background: linear-gradient(135deg, #059669, #10b981);
          color: white;
          padding: 8px 16px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 13px;
          transition: all 0.3s;
          border: none;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .btn-success-class:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(16, 185, 129, 0.3);
        }
        
        .btn-warning-class {
          background: linear-gradient(135deg, #d97706, #f59e0b);
          color: white;
          padding: 8px 16px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 13px;
          transition: all 0.3s;
          border: none;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .btn-warning-class:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(245, 158, 11, 0.3);
        }
        
        .btn-danger-class {
          background: linear-gradient(135deg, #dc2626, #ef4444);
          color: white;
          padding: 8px 16px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 13px;
          transition: all 0.3s;
          border: none;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .btn-danger-class:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(239, 68, 68, 0.3);
        }
        
        .btn-purple-class {
          background: linear-gradient(135deg, #7c3aed, #8b5cf6);
          color: white;
          padding: 8px 16px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 13px;
          transition: all 0.3s;
          border: none;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .btn-purple-class:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(124, 58, 237, 0.3);
        }
        
        .modal-backdrop {
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(4px);
        }
        .modal-content {
          animation: slideUp 0.3s ease-out;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        
        .search-input-wrapper {
          position: relative;
        }
        .search-input-wrapper input {
          width: 100%;
          padding: 10px 16px 10px 42px;
          border: 2px solid #e2e8f0;
          border-radius: 10px;
          transition: all 0.3s;
          font-size: 14px;
        }
        .search-input-wrapper input:focus {
          border-color: #0891b2;
          outline: none;
          box-shadow: 0 0 0 3px rgba(8, 145, 178, 0.1);
        }
        .search-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
        }
        
        .student-pill {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 8px 14px;
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 12px;
          transition: all 0.3s;
        }
        .student-pill:hover {
          box-shadow: 0 4px 15px rgba(8, 145, 178, 0.08);
          border-color: #0891b2;
        }
        
        .selection-list-item {
          padding: 10px 14px;
          border-bottom: 1px solid #e2e8f0;
          transition: all 0.2s;
          cursor: pointer;
        }
        .selection-list-item:hover {
          background: #f0f9ff;
        }
        .selection-list-item:last-child {
          border-bottom: none;
        }
      `}</style>

      <div className="manage-container">
        {/* ========== HERO SECTION ========== */}
        <div className="manage-hero">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <Users className="w-8 h-8" />
                <h2 className="manage-hero-title">👨‍👩‍👧‍👦 Parent Management</h2>
              </div>
              <p className="manage-hero-subtitle">Manage parent accounts and student relationships</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => setShowPasswordModal(true)} className="btn-hero" style={{background: 'white', color: '#7c3aed', borderColor: '#7c3aed'}}>
                <Key size={18} /> Fetch Password
              </button>
              <button onClick={() => setShowLinkModal(true)} className="btn-hero" style={{background: 'white', color: '#059669', borderColor: '#059669'}}>
                <Link size={18} /> Bulk Link
              </button>
              <button onClick={() => setShowCreateModal(true)} className="btn-hero">
                <UserPlus size={18} /> Create Parent
              </button>
              <button onClick={() => loadData()} className="btn-hero" style={{background: 'rgba(255,255,255,0.2)', color: 'white', borderColor: 'rgba(255,255,255,0.3)'}}>
                <RefreshCw size={18} /> Refresh
              </button>
            </div>
          </div>
        </div>

        {/* ========== STATS GRID ========== */}
        <div className="stats-grid">
          <StatCard icon={Users} label="Total Parents" value={parents.length} color="blue" />
          <StatCard icon={GraduationCap} label="Total Students" value={students.length} color="green" />
          <StatCard icon={Link} label="Total Links" value={Object.values(linkedStudentsMap).reduce((sum, s) => sum + s.length, 0)} color="purple" />
          <StatCard icon={TrendingUp} label="Avg Links/Parent" value={parents.length > 0 ? (Object.values(linkedStudentsMap).reduce((sum, s) => sum + s.length, 0) / parents.length).toFixed(1) : 0} color="orange" />
        </div>

        {/* ========== SEARCH & FILTER ========== */}
        <div className="manage-filter-box">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 search-input-wrapper">
              <Search size={18} className="search-icon" />
              <input 
                type="text" 
                placeholder="Search by name, email or phone..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
              />
            </div>
            {availableGrades.length > 0 && (
              <select 
                value={selectedGrade} 
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-cyan-500 focus:outline-none bg-white transition"
              >
                <option value="">All Grades</option>
                {availableGrades.map(g => <option key={g} value={g}>Grade {g}</option>)}
              </select>
            )}
            {availableSections.length > 0 && (
              <select 
                value={selectedSection} 
                onChange={(e) => setSelectedSection(e.target.value)}
                className="px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-cyan-500 focus:outline-none bg-white transition"
              >
                <option value="">All Sections</option>
                {availableSections.map(s => <option key={s} value={s}>Section {s}</option>)}
              </select>
            )}
            {(selectedGrade || selectedSection) && (
              <button onClick={clearFilters} className="px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-xl transition font-medium border-2 border-red-200">
                ✕ Clear Filters
              </button>
            )}
          </div>
          <div className="mt-3 text-sm text-gray-500">
            Found {filteredParents.length} parent{filteredParents.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* ========== PARENTS LIST ========== */}
        <div className="space-y-4">
          {filteredParents.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-16 text-center border-2 border-gray-200">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-xl font-semibold">No parents found</p>
              <p className="text-gray-400 text-sm mt-2">Try adjusting your search or create a new parent</p>
            </div>
          ) : (
            filteredParents.map((parent) => {
              const linkedStudents = linkedStudentsMap[parent._id] || [];
              
              return (
                <div key={parent._id} className="parent-card">
                  <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
                    {/* Parent Info */}
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="parent-avatar-wrapper">
                        <Avatar name={parent.name} size={48} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-3 mb-1">
                          <h3 className="font-bold text-gray-900 text-xl">{parent.name}</h3>
                          <RelationshipBadge relationship={parent.relationship} />
                          <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full font-semibold">
                            {linkedStudents.length} student{linkedStudents.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm">
                          <div className="flex items-center gap-1.5 text-gray-600">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span className="truncate">{parent.email}</span>
                          </div>
                          {parent.phone && (
                            <div className="flex items-center gap-1.5 text-gray-600">
                              <Phone className="w-4 h-4 text-gray-400" />
                              <span>{parent.phone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 flex-wrap">
                      <button onClick={() => handleResetPassword(parent._id)} className="btn-warning-class">
                        <RefreshCw size={15} /> Reset
                      </button>
                      <button onClick={() => handleDeleteParent(parent._id, parent.name)} className="btn-danger-class">
                        <Trash2 size={15} /> Delete
                      </button>
                    </div>
                  </div>

                  {/* Linked Students */}
                  {linkedStudents.length > 0 && (
                    <div className="mt-4 pt-4 border-t-2 border-gray-100">
                      <div className="flex items-center gap-2 mb-3">
                        <GraduationCap className="w-5 h-5 text-green-600" />
                        <p className="font-semibold text-gray-800">Linked Students</p>
                        <span className="text-xs bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full font-bold">{linkedStudents.length}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {linkedStudents.map(student => (
                          <StudentPill 
                            key={student._id}
                            student={student}
                            onView={viewStudentDetails}
                            onUnlink={() => handleUnlinkStudent(parent._id, student._id, student.name)}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {linkedStudents.length === 0 && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 text-center">
                      <p className="text-gray-500 text-sm font-medium">No students linked yet</p>
                      <p className="text-gray-400 text-xs mt-1">Use Bulk Link to connect this parent with students</p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* ========== CREATE PARENT MODAL ========== */}
      {/* ========================================================= */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 modal-backdrop">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto modal-content">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-600 to-cyan-700 rounded-xl flex items-center justify-center">
                  <UserPlus className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Create Parent</h2>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleCreateParent} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                <input 
                  type="text" 
                  placeholder="e.g., John Doe" 
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-cyan-500 focus:outline-none transition" 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address *</label>
                <input 
                  type="email" 
                  placeholder="parent@example.com" 
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-cyan-500 focus:outline-none transition" 
                  value={formData.email} 
                  onChange={(e) => setFormData({...formData, email: e.target.value})} 
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Password *</label>
                <input 
                  type="text" 
                  placeholder="Enter password (min 6 chars)" 
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-cyan-500 focus:outline-none transition" 
                  value={formData.password} 
                  onChange={(e) => setFormData({...formData, password: e.target.value})} 
                  required
                  minLength={6}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                <input 
                  type="tel" 
                  placeholder="+1234567890" 
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-cyan-500 focus:outline-none transition" 
                  value={formData.phone} 
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Relationship</label>
                <select 
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-cyan-500 focus:outline-none bg-white transition" 
                  value={formData.relationship} 
                  onChange={(e) => setFormData({...formData, relationship: e.target.value})}
                >
                  <option value="father">👨 Father</option>
                  <option value="mother">👩 Mother</option>
                  <option value="guardian">🛡️ Guardian</option>
                </select>
              </div>
              <button 
                type="submit" 
                disabled={loadingAction}
                className="w-full bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 text-white py-3.5 rounded-xl flex items-center justify-center gap-2 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 transition"
              >
                <UserPlus size={18} /> Create Parent Account
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* ========== BULK LINK MODAL ========== */}
      {/* ========================================================= */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto p-4 modal-backdrop">
          <div className="bg-white rounded-2xl p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto modal-content">
            <div className="flex justify-between items-center mb-6 sticky top-0 bg-white pb-4 border-b-2 border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-green-700 rounded-xl flex items-center justify-center">
                  <Link className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Bulk Link Parents ↔ Students</h2>
              </div>
              <button onClick={() => setShowLinkModal(false)} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition">
                <X size={24} />
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Parents Column */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                    <Users className="w-5 h-5 text-cyan-600" />
                    Parents ({parents.length})
                  </h3>
                  <label className="text-sm flex items-center gap-2 cursor-pointer font-medium">
                    <input 
                      type="checkbox" 
                      checked={selectAllParents} 
                      onChange={() => setSelectAllParents(!selectAllParents)} 
                      className="w-4 h-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                    />
                    <span className="text-gray-600">Select All</span>
                  </label>
                </div>
                {/* Parent Search */}
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input 
                    type="text" 
                    placeholder="Search parents by name, email or phone..." 
                    value={parentSearchTerm} 
                    onChange={(e) => setParentSearchTerm(e.target.value)} 
                    className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-cyan-500 focus:outline-none transition text-sm"
                  />
                </div>
                <div className="border-2 border-gray-200 rounded-xl overflow-hidden max-h-72 overflow-y-auto">
                  {filteredParentsForBulk.length === 0 ? (
                    <div className="p-6 text-center text-gray-500 text-sm">No parents found</div>
                  ) : (
                    filteredParentsForBulk.map(p => (
                      <label key={p._id} className="selection-list-item flex items-center gap-3 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={selectedParents.includes(p._id)} 
                          onChange={() => toggleParent(p._id)} 
                          className="w-4 h-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                        />
                        <div className="flex-1">
                          <div className="font-semibold text-gray-800">{p.name}</div>
                          <div className="text-xs text-gray-500">{p.email}</div>
                        </div>
                        <RelationshipBadge relationship={p.relationship} />
                      </label>
                    ))
                  )}
                </div>
              </div>

              {/* Students Column */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-green-600" />
                    Students ({filteredStudents.length})
                  </h3>
                  <label className="text-sm flex items-center gap-2 cursor-pointer font-medium">
                    <input 
                      type="checkbox" 
                      checked={selectAllStudents} 
                      onChange={() => setSelectAllStudents(!selectAllStudents)} 
                      className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="text-gray-600">Select All</span>
                  </label>
                </div>
                {/* Student Search */}
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input 
                    type="text" 
                    placeholder="Search students by name, roll or email..." 
                    value={studentSearchTerm} 
                    onChange={(e) => setStudentSearchTerm(e.target.value)} 
                    className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition text-sm"
                  />
                </div>
                <div className="border-2 border-gray-200 rounded-xl overflow-hidden max-h-72 overflow-y-auto">
                  {filteredStudentsForBulk.length === 0 ? (
                    <div className="p-6 text-center text-gray-500 text-sm">No students found</div>
                  ) : (
                    filteredStudentsForBulk.map(s => (
                      <label key={s._id} className="selection-list-item flex items-center gap-3 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={selectedStudents.includes(s._id)} 
                          onChange={() => toggleStudent(s._id)} 
                          className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                        <Avatar name={s.name} image={s.profileImage} size={32} />
                        <div className="flex-1">
                          <div className="font-semibold text-gray-800">{s.name}</div>
                          <div className="text-xs text-gray-500">
                            Roll: {s.rollNumber} | Grade {s.grade} - Section {s.section}
                          </div>
                        </div>
                        <Eye 
                          className="w-4 h-4 text-gray-400 hover:text-cyan-600 cursor-pointer transition" 
                          onClick={(e) => { e.preventDefault(); viewStudentDetails(s); }}
                        />
                      </label>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Summary & Action */}
            <div className="mt-6 p-6 bg-gradient-to-r from-cyan-50 via-blue-50 to-green-50 rounded-xl border-2 border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-gray-600 font-medium">Selected Parents:</span>
                    <span className="text-2xl font-bold text-cyan-600">{selectedParents.length}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-600 font-medium">Selected Students:</span>
                    <span className="text-2xl font-bold text-green-600">{selectedStudents.length}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-gray-600 text-sm font-medium">Total links to create:</p>
                  <p className="text-3xl font-bold text-purple-600">{selectedParents.length * selectedStudents.length}</p>
                </div>
              </div>
              
              <button 
                onClick={handleBulkLink} 
                disabled={loadingAction || selectedParents.length === 0 || selectedStudents.length === 0} 
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3.5 rounded-xl flex items-center justify-center gap-3 font-bold text-lg shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {loadingAction ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Creating Links...
                  </>
                ) : (
                  <>
                    <Link size={20} />
                    Link {selectedParents.length} Parent(s) → {selectedStudents.length} Student(s)
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* ========== FETCH PASSWORD MODAL ========== */}
      {/* ========================================================= */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 modal-backdrop">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto modal-content">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl flex items-center justify-center">
                  <Key className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Fetch Password</h2>
              </div>
              <button 
                onClick={() => { 
                  setShowPasswordModal(false); 
                  setFetchedPassword(''); 
                  setFetchPasswordData({ email: '', phone: '' }); 
                }} 
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                <input 
                  type="email" 
                  placeholder="parent@example.com" 
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition" 
                  value={fetchPasswordData.email} 
                  onChange={(e) => setFetchPasswordData({...fetchPasswordData, email: e.target.value})}
                />
              </div>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t-2 border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 bg-white text-gray-500 font-semibold">OR</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                <input 
                  type="tel" 
                  placeholder="+1234567890" 
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition" 
                  value={fetchPasswordData.phone} 
                  onChange={(e) => setFetchPasswordData({...fetchPasswordData, phone: e.target.value})}
                />
              </div>
              
              <button 
                onClick={handleFetchPassword} 
                disabled={loadingAction} 
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3.5 rounded-xl flex items-center justify-center gap-2 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 transition"
              >
                {loadingAction ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Searching...
                  </>
                ) : (
                  <>
                    <Key size={18} />
                    Fetch Password
                  </>
                )}
              </button>
              
              {fetchedPassword && (
                <div className="mt-4 p-5 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-300">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <p className="text-sm font-bold text-green-700">Password Found!</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <code className="text-xl font-mono font-bold text-green-800 bg-white px-4 py-3 rounded-lg flex-1 text-center border-2 border-green-200">
                      {fetchedPassword}
                    </code>
                    <button 
                      onClick={copyPassword} 
                      className="p-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition shadow-lg hover:shadow-xl" 
                      title="Copy password"
                    >
                      <Copy size={18} />
                    </button>
                  </div>
                  <p className="text-xs text-green-600 mt-3 font-medium">✓ Share this password securely with the parent</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* ========== STUDENT DETAILS MODAL ========== */}
      {/* ========================================================= */}
      {showStudentDetailsModal && selectedStudentDetails && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 modal-backdrop">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto modal-content">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-green-700 rounded-xl flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Student Details</h2>
              </div>
              <button 
                onClick={() => setShowStudentDetailsModal(false)} 
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="text-center mb-6">
              <Avatar name={selectedStudentDetails.name} image={selectedStudentDetails.profileImage} size={80} />
              <h3 className="text-xl font-bold text-gray-800 mt-3">{selectedStudentDetails.name}</h3>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 font-medium text-sm">Roll Number</span>
                <span className="font-bold text-gray-800">{selectedStudentDetails.rollNumber}</span>
              </div>
              <div className="h-px bg-gray-200"></div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 font-medium text-sm">Grade</span>
                <span className="font-bold text-cyan-600">{selectedStudentDetails.grade || 'N/A'}</span>
              </div>
              <div className="h-px bg-gray-200"></div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 font-medium text-sm">Section</span>
                <span className="font-bold text-green-600">{selectedStudentDetails.section || 'N/A'}</span>
              </div>
              {selectedStudentDetails.email && (
                <>
                  <div className="h-px bg-gray-200"></div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 font-medium text-sm">Email</span>
                    <span className="font-medium text-gray-800 text-sm truncate">{selectedStudentDetails.email}</span>
                  </div>
                </>
              )}
              {selectedStudentDetails.programs && (
                <>
                  <div className="h-px bg-gray-200"></div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 font-medium text-sm">Program</span>
                    <span className="font-medium text-gray-800">{selectedStudentDetails.programs}</span>
                  </div>
                </>
              )}
              {selectedStudentDetails.sex && (
                <>
                  <div className="h-px bg-gray-200"></div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 font-medium text-sm">Gender</span>
                    <span className="font-medium text-gray-800">{selectedStudentDetails.sex}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageParents;