// ManageStudents/index.jsx - Updated version with Student ID support

import React, { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import Papa from 'papaparse';
import api from '../../services/api';
import { ICONS } from './Profile/constants';
import { Avatar } from './Profile/Avatar';
import { Badge } from './Profile/Badge';
import { ImageUpload } from './Profile/ImageUpload';
import { StatCard } from './Profile/StatCard';
import { Pagination } from './Profile/Pagination';
import { StudentTable } from './Profile/StudentTable';
import { StudentCard } from './Profile/StudentCard';
import { StudentForm } from './Profile/StudentForm';
import { EditStudentModal } from './Profile/EditStudentModal';
import { BulkUpload } from './Profile/BulkUpload';
import { PromotionModal } from './Profile/PromotionModal';
import { GraduateTable } from './Profile/GraduateTable';
import { useStudents } from '../../hooks/useStudents';
import { getDisplayGrade } from '../../utils/computeCurrentGrade';
import { exportExcel } from '../../utils/exportExcel';
import { exportCSV } from '../../utils/exportCSV';
import './styles.css';

export const Icon = ({ d, size = 18, strokeWidth = 1.5, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"
    className={className}>
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);

const globalStyles = `
  @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes scaleIn { from { opacity: 0; transform: scale(0.9) rotate(-2deg); } to { opacity: 1; transform: scale(1) rotate(0); } }
  @keyframes slideInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
  @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
  @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
  @keyframes gradientShift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
  @keyframes bounceIn { 0% { transform: scale(0.3); opacity: 0; } 50% { transform: scale(1.05); } 70% { transform: scale(0.9); } 100% { transform: scale(1); opacity: 1; } }
  
  .glass-card {
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.3);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.06);
  }
  
  .btn-primary {
    background: #2563eb;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 8px;
    font-weight: 600;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s ease;
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  
  .btn-primary:hover {
    background: #1d4ed8;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
  }
  
  .btn-primary:active {
    transform: translateY(0);
  }
  
  .btn-success {
    background: #10b981;
  }
  
  .btn-success:hover {
    background: #059669;
  }
  
  .btn-danger {
    background: #dc2626;
  }
  
  .btn-danger:hover {
    background: #b91c1c;
  }
  
  .btn-warning {
    background: #d97706;
  }
  
  .btn-warning:hover {
    background: #b45309;
  }
  
  .btn-outline {
    background: transparent;
    color: #2563eb;
    border: 1.5px solid #2563eb;
  }
  
  .btn-outline:hover {
    background: #2563eb;
    color: white;
  }
  
  .pagination-btn {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
    background: white;
    color: #475569;
    font-weight: 600;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .pagination-btn:hover {
    border-color: #2563eb;
    color: #2563eb;
    background: #eff6ff;
  }
  
  .pagination-btn.active {
    background: #2563eb;
    color: white;
    border-color: transparent;
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
  }
  
  .compact-table td, .compact-table th {
    padding: 8px 10px;
  }
  
  .compact-table th {
    font-size: 10.5px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: #475569;
    padding: 8px 10px;
    border-bottom: 2px solid #cbd5e1;
    background: #f8fafc;
    white-space: nowrap;
    position: sticky;
    top: 0;
    z-index: 10;
  }
  
  .compact-table td {
    padding: 8px 10px;
    border-bottom: 1px solid #f1f5f9;
    font-size: 12.5px;
  }
  
  .compact-table tbody tr:hover {
    background: #f8fafc;
  }
  
  .grid-view {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
  }
  
  .student-card {
    background: white;
    border-radius: 12px;
    padding: 16px;
    border: 1px solid #e2e8f0;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    animation: fadeInUp 0.3s ease;
  }
  
  .student-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.08);
    border-color: #2563eb;
  }
  
  .skeleton {
    background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
  }
  
  .promo-card {
    background: #fef3c7;
    border-left: 4px solid #d97706;
  }
  
  .graduated-card {
    background: #eff6ff;
  }
  
  .pi {
    width: 100%;
    padding: 10px 14px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    background: #fff;
    font-size: 13px;
    color: #1e293b;
    outline: none;
    transition: all 0.3s;
  }
  
  .pi:focus {
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }
  
  .ps {
    width: 100%;
    padding: 10px 14px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    background: #fff;
    font-size: 13px;
    color: #1e293b;
    outline: none;
    cursor: pointer;
    appearance: none;
    transition: all 0.3s;
  }
  
  .ps:focus {
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }
`;

const ManageStudents = ({ isSuperAdmin = false }) => {
  const {
    students,
    graduatedStudents,
    loading,
    setLoading,
    fetching,
    promoting,
    setPromoting,
    searchTerm,
    setSearchTerm,
    selectedGrade,
    setSelectedGrade,
    selectedProgram,
    setSelectedProgram,
    selectedAcademicYear,
    setSelectedAcademicYear,
    currentPage,
    setCurrentPage,
    studentsPerPage,
    setStudentsPerPage,
    stats,
    getPromotionStats,
    fetchStudents,
    filteredStudents,
    paginatedStudents,
    totalPages,
    grades,
    programs,
    ages
  } = useStudents(isSuperAdmin);

  const [showForm, setShowForm] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [graduatedSearchTerm, setGraduatedSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [editingStudent, setEditingStudent] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [editProfileImage, setEditProfileImage] = useState(null);
  const [graduatedCurrentPage, setGraduatedCurrentPage] = useState(1);
  const [graduatedPerPage] = useState(50);
  const [viewMode, setViewMode] = useState('table');
  const [showPromotionConfirm, setShowPromotionConfirm] = useState(false);
  const [showGraduatedList, setShowGraduatedList] = useState(false);

  const fileInputRef = useRef(null);
  const searchInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '', 
    studentId: '',     // Student ID is REQUIRED for login
    password: '', 
    rollNumber: '',
    sex: '', 
    grade: '', 
    programs: '', 
    section: '', 
    academicYear: '2019/2020', 
    parentPhone: '', 
    age: ''
  });

  const [editFormData, setEditFormData] = useState({
    name: '', 
    studentId: '',     // Student ID is REQUIRED for login
    sex: '', 
    rollNumber: '',
    grade: '', 
    programs: '', 
    section: '', 
    password: '', 
    academicYear: '2019/2020', 
    parentPhone: '', 
    age: ''
  });

  // Reset form function
  const resetForm = () => {
    setFormData({
      name: '', 
      studentId: '', 
      password: '', 
      rollNumber: '',
      sex: '', 
      grade: '', 
      programs: '', 
      section: '', 
      academicYear: '2019/2020', 
      parentPhone: '', 
      age: ''
    });
    setProfileImage(null);
  };

  // Handle Cancel
  const handleCancelForm = () => {
    if (showForm) {
      const hasValues = Object.values(formData).some(val => val !== '' && val !== '2019/2020');
      if (hasValues) {
        if (window.confirm('Are you sure you want to cancel? All entered data will be lost.')) {
          resetForm();
          setShowForm(false);
          toast.info('Form cancelled');
        }
      } else {
        resetForm();
        setShowForm(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    
    // Validate required fields - Student ID is now REQUIRED
    if (!formData.name || !formData.studentId || !formData.password || !formData.rollNumber || !formData.parentPhone || !formData.age) {
      toast.error('Please fill all required fields including Student ID');
      return;
    }
    
    setLoading(true);
    try {
      const formDataToSend = new FormData();
      
      Object.keys(formData).forEach(key => {
        if (key !== 'grade' && key !== 'programs' && key !== 'section' && key !== 'academicYear' && formData[key] && key !== 'age') {
          formDataToSend.append(key, formData[key]);
        }
      });
      formDataToSend.append('role', 'student');
      formDataToSend.append('baseGrade', formData.grade);
      formDataToSend.append('baseAcademicYear', formData.academicYear);
      
      if (formData.grade) formDataToSend.append('grade', `Grade ${formData.grade}`);
      if (formData.programs) formDataToSend.append('programs', formData.programs);
      if (formData.section) formDataToSend.append('section', formData.section);
      if (formData.academicYear) formDataToSend.append('academicYear', formData.academicYear);
      if (formData.parentPhone) formDataToSend.append('parentPhone', formData.parentPhone);
      if (profileImage) formDataToSend.append('profileImage', profileImage);
      if (formData.age) formDataToSend.append('age', formData.age);

      await api.post('/users', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      toast.success(`🚀 Student added successfully! Student ID: ${formData.studentId}`);
      resetForm();
      setShowForm(false);
      setCurrentPage(1);
      await fetchStudents();
    } catch (error) {
      if (error.response?.status === 403) {
        toast.error('Access denied.');
        localStorage.clear();
        setTimeout(() => window.location.href = '/login', 2000);
      } else {
        toast.error(error.response?.data?.error || 'Failed to add student');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = async (student) => {
    setEditingStudent(student);
    try {
      const response = await api.get(`/enrollments/student/${student._id}/current?academicYear=${selectedAcademicYear}`);
      const currentEnrollment = response.data.enrollment;
      
      let gradeNum = currentEnrollment?.grade || student.grade || '';
      if (gradeNum && gradeNum.includes('Grade')) {
        gradeNum = gradeNum.split(' ')[1];
      }
      
      setEditFormData({
        name: student.name || '',
        studentId: student.studentId || '',  // Get existing Student ID
        sex: student.sex || '',
        rollNumber: student.rollNumber || '',
        grade: gradeNum,
        programs: currentEnrollment?.program || student.program || '',
        section: currentEnrollment?.section || student.section || '',
        password: '',
        age: student.age || '',
        academicYear: selectedAcademicYear,
        parentPhone: student.parentPhone || ''
      });
    } catch (error) {
      let gradeNum = student.grade || '';
      if (gradeNum && gradeNum.includes('Grade')) {
        gradeNum = gradeNum.split(' ')[1];
      }
      setEditFormData({
        name: student.name || '',
        studentId: student.studentId || '',  // Get existing Student ID
        sex: student.sex || '',
        rollNumber: student.rollNumber || '',
        grade: gradeNum,
        programs: student.program || student.programs || '',
        section: student.section || '',
        password: '',
        age: student.age || '',
        academicYear: selectedAcademicYear,
        parentPhone: student.parentPhone || ''
      });
    }
    setEditProfileImage(null);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    
    try {
      const updateData = {
        name: editFormData.name,
        studentId: editFormData.studentId,  // Send Student ID to update
        sex: editFormData.sex,
        rollNumber: editFormData.rollNumber,
        baseGrade: editingStudent.baseGrade || editFormData.grade,
        baseAcademicYear: editingStudent.baseAcademicYear || editFormData.academicYear || '2019/2020',
        grade: `Grade ${editFormData.grade}`,
        programs: editFormData.programs,
        section: editFormData.section,
        academicYear: editFormData.academicYear || '2019/2020',
        parentPhone: editFormData.parentPhone,
        age: editFormData.age
      };
      
      if (editFormData.password) {
        updateData.password = editFormData.password;
      }
      
      await api.put(`/users/${editingStudent._id}`, updateData);
      
      toast.success('✨ Student updated successfully!');
      setEditingStudent(null);
      setEditProfileImage(null);
      await fetchStudents();
      
    } catch (error) {
      console.error('Edit error:', error);
      toast.error(error.response?.data?.error || 'Failed to update student');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('⚠️ Are you sure you want to delete this student? This action cannot be undone.')) return;
    try {
      await api.delete(`/users/${id}`);
      toast.success('🗑️ Student deleted');
      await fetchStudents();
    } catch (error) {
      if (error.response?.status === 403) {
        localStorage.clear();
        window.location.href = '/login';
      } else {
        toast.error('Failed to delete student');
      }
    }
  };

  const handleMoveToGraduated = async (student) => {
    if (!window.confirm(`🎓 Move ${student.name} to Graduated Students list?`)) return;
    setLoading(true);
    try {
      await api.put(`/enrollments/student/${student._id}`, {
        academicYear: selectedAcademicYear,
        status: 'graduated',
        grade: 'Graduated'
      });
      toast.success(`🎓 ${student.name} has been moved to Graduated Students`);
      await fetchStudents();
    } catch (error) {
      toast.error('Failed to move student');
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreFromGraduated = async (student) => {
    if (!window.confirm(`↺ Restore ${student.name} to active students?`)) return;
    setLoading(true);
    try {
      await api.post(`/users/${student._id}/restore`, { newGrade: '12' });
      toast.success(`✅ ${student.name} restored to active students`);
      await fetchStudents();
      setShowGraduatedList(false);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to restore student');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const ext = file.name.split('.').pop().toLowerCase();
    if (ext === 'csv') {
      Papa.parse(file, { header: true, complete: async (r) => { await processBulkStudents(r.data); }, error: () => toast.error('Error parsing CSV file') });
    } else if (ext === 'xlsx' || ext === 'xls') {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const wb = XLSX.read(new Uint8Array(ev.target.result), { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        await processBulkStudents(XLSX.utils.sheet_to_json(ws));
      };
      reader.readAsArrayBuffer(file);
    } else toast.error('Please upload CSV or Excel file');
    e.target.value = '';
  };

  const processBulkStudents = async (data) => {
    setBulkLoading(true);
    let ok = 0, fail = 0;
    for (const s of data) {
      // Student ID is now REQUIRED
      if (!s.name || !s.studentId || !s.password) {
        console.warn('Missing required fields:', s);
        fail++;
        continue;
      }
      try {
        await api.post('/users', {
          name: s.name,
          studentId: s.studentId,  // Student ID is REQUIRED
          password: s.password,
          sex: s.sex || '',
          role: 'student',
          rollNumber: s.rollNumber || s.rollnumber || s.roll_no || '',
          baseGrade: s.grade || 9,
          baseAcademicYear: selectedAcademicYear,
          grade: s.grade ? `Grade ${s.grade}` : '',
          program: s.programs || s.program || '',
          section: s.section || '',
          age: s.age || '',
          academicYear: selectedAcademicYear,
          parentPhone: s.parentPhone || ''
        });
        ok++;
      } catch (error) {
        console.error('Failed to add student:', error.response?.data?.error || error.message);
        fail++;
      }
    }
    if (ok > 0) {
      toast.success(`✅ Added ${ok} students`);
      setCurrentPage(1);
      await fetchStudents();
    }
    if (fail > 0) toast.error(`❌ ${fail} students failed`);
    setBulkLoading(false);
    setShowBulkUpload(false);
  };

  const downloadTemplate = () => {
    const t = [
      { 
        name: 'John Doe', 
        studentId: 'STU2024001',  // Student ID is REQUIRED
        email: 'john@school.com', 
        password: 'pass123', 
        rollNumber: '2024001', 
        sex: 'Male', 
        grade: '10', 
        programs: 'Natural Science', 
        section: 'A', 
        academicYear: selectedAcademicYear,
        age: '16',
        parentPhone: '0912345678'
      },
      { 
        name: 'Jane Smith', 
        studentId: 'STU2024002',  // Student ID is REQUIRED
        email: 'jane@school.com', 
        password: 'pass123', 
        rollNumber: '2024002', 
        sex: 'Female', 
        grade: '9', 
        programs: 'Social Science', 
        section: 'B', 
        academicYear: selectedAcademicYear,
        age: '15',
        parentPhone: '0923456789'
      },
    ];
    const ws = XLSX.utils.json_to_sheet(t);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, 'student_template.xlsx');
    toast.success('📥 Template downloaded');
  };

  const handlePromoteAll = async () => {
    if (!isSuperAdmin) {
      toast.error('Only Super Admin can promote students');
      return;
    }
    
    const nextYear = (() => {
      if (selectedAcademicYear.includes('/')) {
        const [start, end] = selectedAcademicYear.split('/');
        return `${parseInt(start) + 1}/${parseInt(end) + 1}`;
      } else {
        const start = parseInt(selectedAcademicYear);
        return `${start + 1}/${start + 2}`;
      }
    })();
    
    const promotionStats = getPromotionStats();
    const confirmMessage = `⚠️ PROMOTE ALL STUDENTS\n\nFrom: ${selectedAcademicYear}\nTo: ${nextYear}\n\n` +
      `📊 Current Active Students:\n` +
      `• Grade 9: ${promotionStats.grade9} → Grade 10\n` +
      `• Grade 10: ${promotionStats.grade10} → Grade 11\n` +
      `• Grade 11: ${promotionStats.grade11} → Grade 12\n` +
      `• Grade 12: ${promotionStats.grade12} → Graduated\n\n` +
      `Total: ${students.length} active students\n\nAre you sure?`;
    
    if (!window.confirm(confirmMessage)) return;
    
    setPromoting(true);
    try {
      const response = await api.post('/users/promote-all', {
        fromYear: selectedAcademicYear,
        toYear: nextYear
      });
      
      if (response.data.success) {
        toast.success(`🎉 ${response.data.message}`);
        await fetchStudents();
        setSelectedAcademicYear(nextYear);
      }
    } catch (error) {
      console.error('Promotion error:', error);
      toast.error(error.response?.data?.error || 'Failed to promote students');
    } finally {
      setPromoting(false);
      setShowPromotionConfirm(false);
    }
  };

  const exportData = filteredStudents.map(s => {
    const computedGrade = getDisplayGrade(s, selectedAcademicYear);
    return {
      'Student ID': s.studentId || '-',  // Show Student ID
      'Roll Number': s.rollNumber || '-',
      Name: s.name,
      Sex: s.sex || '-',
      Password: isSuperAdmin ? (s.password || '-') : 'Hidden',
      'Current Grade': computedGrade,
      'Base Grade': s.baseGrade || '-',
      Program: s.program || s.programs || '-',
      Section: s.section || '-',
      Age: s.age || '-',
      'Parent Phone': s.parentPhone || '-',
      'Academic Year': s.academicYear || selectedAcademicYear,
    };
  });

  const exportGraduatedData = graduatedStudents.map(s => ({
    'Student ID': s.studentId || '-',  // Show Student ID
    'Roll Number': s.rollNumber || '-',
    Name: s.name,
    Sex: s.sex || '-',
    'Graduated Grade': s.grade || 'graduated',
    Program: s.program || s.programs || '-',
    Section: s.section || '-',
    Age: s.age || '-',
    'Parent Phone': s.parentPhone || '-',
    'Graduation Year': s.academicYear || selectedAcademicYear,
  }));

  const copyAll = () => {
    if (!filteredStudents.length) { toast.error('No data to copy'); return; }
    navigator.clipboard.writeText(JSON.stringify(exportData, null, 2));
    toast.success(`📋 ${filteredStudents.length} records copied`);
  };

  const printTable = () => {
    if (!filteredStudents.length) { toast.error('No data to print'); return; }
    const w = window.open('', '_blank');
    w.document.write(`<!DOCTYPE html><html><head><title>Students List</title><style>body{font-family:system-ui;margin:30px;color:#1e293b}h1{font-size:24px;margin-bottom:6px}.meta{font-size:13px;color:#475569;margin-bottom:24px}table{width:100%;border-collapse:collapse;font-size:12px}th{background:#2563eb;color:#fff;padding:10px 14px;text-align:left}td{padding:8px 14px;border-bottom:1px solid #cbd5e1}tr:nth-child(even) td{background:#f8fafc}</style></head><body><h1>🎓 Students List</h1><p class="meta">Grade: ${selectedGrade || 'All'} · Total: ${filteredStudents.length} · ${new Date().toLocaleString()}</p><table><thead><tr><th>Student ID</th><th>Roll No</th><th>Name</th><th>Age</th><th>Sex</th>${isSuperAdmin ? '<th>Password</th>' : ''}<th>Current Grade</th><th>Program</th><th>Section</th><th>Academic Year</th></tr></thead><tbody>${filteredStudents.map(s => {
      const computedGrade = getDisplayGrade(s, selectedAcademicYear);
      return `<tr><td>${s.studentId || '-'}</td><td>${s.rollNumber || '-'}</td><td>${s.name}</td><td>${s.age || '-'}</td><td>${s.sex || '-'}</td>${isSuperAdmin ? `<td style="font-family:monospace">${s.password || '-'}</td>` : ''}<td>${computedGrade}</td><td>${s.program || s.programs || '-'}</td><td>${s.section || '-'}</td><td>${s.academicYear || selectedAcademicYear}</td></tr>`;
    }).join('')}</tbody></table><script>window.onload=()=>{window.print();setTimeout(()=>window.close(),1000)}<\/script></body></html>`);
  };

  const filteredGraduated = graduatedStudents.filter(s => {
    const q = graduatedSearchTerm.toLowerCase();
    return !q || (s.name?.toLowerCase().includes(q) || s.studentId?.toLowerCase().includes(q) || s.rollNumber?.toString().includes(q));
  });

  const totalGraduatedPages = Math.ceil(filteredGraduated.length / graduatedPerPage);
  const paginatedGraduated = filteredGraduated.slice((graduatedCurrentPage - 1) * graduatedPerPage, graduatedCurrentPage * graduatedPerPage);

  return (
    <>
      <style>{`
        ${globalStyles}
      `}</style>

      <div style={{ 
        maxWidth: 1400, 
        margin: '0 auto', 
        padding: '24px 32px', 
        background: '#f0f4ff',
        minHeight: '100vh',
      }}>
        {/* Loading Bar */}
        {(loading || promoting) && (
          <div style={{ 
            position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, 
            height: '3px', 
            background: '#2563eb',
          }} />
        )}

        {/* Header Section */}
        <div style={{ marginBottom: 24, animation: 'fadeInUp 0.6s ease' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 700, color: '#1e3a5f', margin: 0 }}>
                Student Management
              </h1>
              <p style={{ fontSize: 14, color: '#64748b', margin: '4px 0 0 0' }}>
                Manage all students across the school
              </p>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button 
                className="btn-primary" 
                onClick={() => setShowGraduatedList(!showGraduatedList)}
                style={{ 
                  background: showGraduatedList ? '#2563eb' : '#64748b',
                }}
              >
                <Icon d="M12 14l9-5-9-5-9 5 9 5z" size={15} color="#fff" />
                {showGraduatedList ? '📚 Active Students' : `🎓 Graduated (${stats.graduated})`}
              </button>
              
              {isSuperAdmin && !showGraduatedList && (
                <button className="btn-primary" onClick={() => { setShowBulkUpload(!showBulkUpload); setShowForm(false); }}
                  style={{ background: showBulkUpload ? '#64748b' : '#2563eb' }}>
                  <Icon d="M19 10v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" size={15} color="#fff" />
                  {showBulkUpload ? 'Cancel' : 'Bulk Import'}
                </button>
              )}
              {!showGraduatedList && (
                <button className="btn-primary" onClick={() => { 
                  if (showForm) {
                    handleCancelForm();
                  } else {
                    setShowForm(true);
                    setShowBulkUpload(false);
                    resetForm();
                  }
                }}
                style={{ 
                  background: showForm ? '#dc2626' : '#2563eb'
                }}>
                  <Icon d={showForm ? "M18 6L6 18M6 6l12 12" : "M12 5v14M5 12h14"} size={15} color="#fff" strokeWidth={2} />
                  {showForm ? 'Cancel' : 'Add Student'}
                </button>
              )}
            </div>
          </div>
        </div>

        {!showGraduatedList ? (
          <>
            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
              <div style={{ background: 'white', padding: '16px 20px', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ background: '#2563eb', width: 40, height: 40, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" size={18} color="#fff" />
                  </div>
                  <div>
                    <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>Active Students</p>
                    <p style={{ fontSize: 20, fontWeight: 700, color: '#1e3a5f', margin: 0 }}>{stats.total}</p>
                  </div>
                </div>
              </div>
              <div style={{ background: 'white', padding: '16px 20px', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ background: '#10b981', width: 40, height: 40, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" size={18} color="#fff" />
                  </div>
                  <div>
                    <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>Male</p>
                    <p style={{ fontSize: 20, fontWeight: 700, color: '#1e3a5f', margin: 0 }}>{stats.male}</p>
                  </div>
                </div>
              </div>
              <div style={{ background: 'white', padding: '16px 20px', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ background: '#8b5cf6', width: 40, height: 40, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" size={18} color="#fff" />
                  </div>
                  <div>
                    <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>Female</p>
                    <p style={{ fontSize: 20, fontWeight: 700, color: '#1e3a5f', margin: 0 }}>{stats.female}</p>
                  </div>
                </div>
              </div>
              <div style={{ background: 'white', padding: '16px 20px', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ background: '#d97706', width: 40, height: 40, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon d="M4 6h16M4 12h16M4 18h16" size={18} color="#fff" />
                  </div>
                  <div>
                    <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>Grades</p>
                    <p style={{ fontSize: 20, fontWeight: 700, color: '#1e3a5f', margin: 0 }}>{stats.grades}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Add Student Form */}
            {showForm && (
              <StudentForm 
                formData={formData}
                setFormData={setFormData}
                profileImage={profileImage}
                setProfileImage={setProfileImage}
                loading={loading}
                onSubmit={handleSubmit}
                onClose={handleCancelForm}
              />
            )}

            {/* Bulk Upload */}
            <BulkUpload 
              showBulkUpload={showBulkUpload}
              bulkLoading={bulkLoading}
              handleBulkUpload={handleBulkUpload}
              downloadTemplate={downloadTemplate}
              onClose={() => setShowBulkUpload(false)}
            />

 {/* Search & Filter Bar - NOT STICKY, scrolls with page */}
<div style={{ 
  background: 'white', 
  marginBottom: 16, 
  padding: '16px 20px', 
  display: 'flex', 
  gap: 12, 
  alignItems: 'center', 
  flexWrap: 'wrap', 
  borderRadius: 12, 
  border: '1px solid #e2e8f0',
  // REMOVE position: sticky
  // REMOVE top: 0
  // REMOVE zIndex: 100
  // REMOVE boxShadow
  // REMOVE backdropFilter
  // REMOVE backgroundColor
}}>
  <div style={{ position: 'relative', flex: 3, minWidth: 200 }}>
    <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', zIndex: 1 }}>
      <Icon d="M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0z" size={16} color="#64748b" strokeWidth={2} />
    </div>
    <input 
      ref={searchInputRef} 
      className="pi" 
      type="text" 
      placeholder="Search by name, Student ID, roll number..." 
      value={searchTerm} 
      onChange={e => setSearchTerm(e.target.value)} 
      style={{ paddingLeft: 38, fontSize: 13 }} 
    />
    {searchTerm && (
      <button 
        onClick={() => { 
          setSearchTerm(''); 
          searchInputRef.current?.focus(); 
        }} 
        style={{ 
          position: 'absolute', 
          right: 12, 
          top: '50%', 
          transform: 'translateY(-50%)', 
          background: '#f1f5f9', 
          border: 'none', 
          cursor: 'pointer', 
          padding: '4px 8px', 
          borderRadius: 6 
        }}
      >
        <Icon d="M18 6L6 18M6 6l12 12" size={14} color="#64748b" strokeWidth={2} />
      </button>
    )}
  </div>
  
  <div style={{ position: 'relative', minWidth: 140 }}>
    <select 
      className="ps" 
      value={selectedGrade} 
      onChange={e => setSelectedGrade(e.target.value)} 
      style={{ paddingRight: 32, fontSize: 13 }}
    >
      <option value=""> All Grades</option>
      {[9,10,11,12].map(g => <option key={g} value={g}>Grade {g}</option>)}
    </select>
    <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
      <Icon d="M6 9l6 6 6-6" size={14} color="#64748b" strokeWidth={2} />
    </div>
  </div>
  
  <div style={{ position: 'relative', minWidth: 150 }}>
    <select 
      className="ps" 
      value={selectedProgram} 
      onChange={e => setSelectedProgram(e.target.value)} 
      style={{ paddingRight: 32, fontSize: 13 }}
    >
      <option value=""> All Programs</option>
      {programs.map(p => <option key={p} value={p}>{p}</option>)}
    </select>
    <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
      <Icon d="M6 9l6 6 6-6" size={14} color="#64748b" strokeWidth={2} />
    </div>
  </div>
  
  <div style={{ position: 'relative', minWidth: 150 }}>
    <select 
      className="ps" 
      value={selectedAcademicYear} 
      onChange={e => setSelectedAcademicYear(e.target.value)} 
      style={{ paddingRight: 32, fontSize: 13 }}
    >
      <option value="2019/2020">2019/2020</option>
      <option value="2020/2021">2020/2021</option>
      <option value="2021/2022">2021/2022</option>
      <option value="2022/2023">2022/2023</option>
      <option value="2023/2024">2023/2024</option>
      <option value="2024/2025">2024/2025</option>
      <option value="2025/2026">2025/2026</option>
    </select>
    <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
      <Icon d="M6 9l6 6 6-6" size={14} color="#64748b" strokeWidth={2} />
    </div>
  </div>
  
  {isSuperAdmin && (
    <button 
      className="btn-primary btn-success" 
      onClick={() => setShowPromotionConfirm(true)} 
      disabled={promoting}
      style={{ fontSize: 12, padding: '8px 16px' }}
    >
      {promoting ? (
        <><div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'rotate 0.6s linear infinite' }} /> Promoting...</>
      ) : (
        <><Icon d="M12 14l9-5-9-5-9 5 9 5z" size={13} color="#fff" /> Promote All</>
      )}
    </button>
  )}
  
  <div style={{ display: 'flex', gap: 6, marginLeft: 'auto', flexWrap: 'wrap' }}>
    <div style={{ display: 'flex', borderRadius: 8, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
      <button 
        onClick={() => setViewMode('table')} 
        style={{ 
          padding: '6px 12px', 
          border: 'none', 
          cursor: 'pointer', 
          background: viewMode === 'table' ? '#2563eb' : '#fff', 
          color: viewMode === 'table' ? '#fff' : '#475569', 
          fontWeight: 600, 
          fontSize: 12 
        }}
      >
        Table
      </button>
      <button 
        onClick={() => setViewMode('grid')} 
        style={{ 
          padding: '6px 12px', 
          border: 'none', 
          cursor: 'pointer', 
          background: viewMode === 'grid' ? '#2563eb' : '#fff', 
          color: viewMode === 'grid' ? '#fff' : '#475569', 
          fontWeight: 600, 
          fontSize: 12 
        }}
      >
        Grid
      </button>
    </div>
    <button 
      className="btn-primary" 
      onClick={copyAll} 
      style={{ background: '#64748b', fontSize: 12, padding: '6px 12px' }}
    >
      <Icon d="M8 7v8a2 2 0 0 0 2 2h6M8 7V5a2 2 0 0 1 2-2h4.586a1 1 0 0 1 .707.293l4.414 4.414a1 1 0 0 1 .293.707V15a2 2 0 0 1-2 2h-2M8 7H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-2" size={13} color="#fff" strokeWidth={2} />
      Copy
    </button>
    <button 
      className="btn-primary" 
      onClick={() => exportExcel(exportData, 'students')} 
      style={{ background: '#10b981', fontSize: 12, padding: '6px 12px' }}
    >
      <Icon d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" size={13} color="#fff" strokeWidth={2} />
      Excel
    </button>
    <button 
      className="btn-primary" 
      onClick={() => exportCSV(exportData, 'students')} 
      style={{ background: '#2563eb', fontSize: 12, padding: '6px 12px' }}
    >
      <Icon d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" size={13} color="#fff" strokeWidth={2} />
      CSV
    </button>
    <button 
      className="btn-primary" 
      onClick={printTable} 
      style={{ background: '#2563eb', fontSize: 12, padding: '6px 12px' }}
    >
      <Icon d="M19 8H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2zm-2 0V4a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v4m8 8h.01" size={13} color="#fff" strokeWidth={2} />
      Print
    </button>
  </div>
</div>
 
            {/* Students Per Page */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, padding: '0 4px', fontSize: 13, color: '#64748b' }}>
              <div>Showing <strong style={{ color: '#1e3a5f' }}>{paginatedStudents.length}</strong> of <strong style={{ color: '#1e3a5f' }}>{filteredStudents.length}</strong> active students</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>Rows per page:</span>
                <select value={studentsPerPage} onChange={e => { setStudentsPerPage(Number(e.target.value)); setCurrentPage(1); }} style={{ padding: '4px 8px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, fontWeight: 600, color: '#1e3a5f', cursor: 'pointer' }}>
                  <option value={100}>100</option><option value={200}>200</option><option value={500}>500</option><option value={1000}>1000</option><option value={2000}>2000</option>
                </select>
              </div>
            </div>

            {/* Active Students View */}
            {viewMode === 'table' ? (
              <StudentTable 
                students={paginatedStudents}
                fetching={fetching}
                studentsPerPage={studentsPerPage}
                getDisplayGrade={(student) => getDisplayGrade(student, selectedAcademicYear)}
                onView={setSelectedStudent}
                onEdit={handleEditClick}
                onGraduate={handleMoveToGraduated}
                onDelete={handleDelete}
                isSuperAdmin={isSuperAdmin}
                selectedAcademicYear={selectedAcademicYear}
              />
            ) : (
              <div className="grid-view">
                {paginatedStudents.map((student) => (
                  <StudentCard 
                    key={student._id}
                    student={student}
                    getDisplayGrade={(student) => getDisplayGrade(student, selectedAcademicYear)}
                    onView={setSelectedStudent}
                    onEdit={handleEditClick}
                    onGraduate={handleMoveToGraduated}
                    isSuperAdmin={isSuperAdmin}
                  />
                ))}
              </div>
            )}

            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />

            {!fetching && (<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, fontSize: 12, color: '#64748b', padding: '0 4px' }}>
              <div>Updated: <strong style={{ color: '#1e3a5f' }}>{new Date().toLocaleTimeString()}</strong></div>
              <div>Total: <strong style={{ color: '#1e3a5f' }}>{students.length}</strong> active students</div>
            </div>)}
          </>
        ) : (
          <GraduateTable 
            graduatedStudents={graduatedStudents}
            paginatedGraduated={paginatedGraduated}
            selectedAcademicYear={selectedAcademicYear}
            onView={setSelectedStudent}
            onRestore={handleRestoreFromGraduated}
            isSuperAdmin={isSuperAdmin}
            exportGraduatedExcel={() => exportExcel(exportGraduatedData, 'graduated_students')}
            onBack={() => setShowGraduatedList(false)}
          />
        )}

        {/* Modals */}
        <PromotionModal 
          showPromotionConfirm={showPromotionConfirm}
          selectedAcademicYear={selectedAcademicYear}
          promotionStats={getPromotionStats()}
          promoting={promoting}
          onConfirm={handlePromoteAll}
          onCancel={() => setShowPromotionConfirm(false)}
        />

        {/* View Student Modal */}
        {selectedStudent && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, padding: 16 }}>
            <div style={{ background: 'white', width: '100%', maxWidth: 760, borderRadius: 12, padding: 0, overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: '1px solid #e2e8f0', background: '#2563eb' }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: 'white' }}>Student Profile</div>
                  <div style={{ fontSize: 12, color: '#bfdbfe' }}>Quick overview of the selected student</div>
                </div>
                <button onClick={() => setSelectedStudent(null)} style={{ border: 'none', background: '#f1f5f9', color: '#1e3a5f', width: 36, height: 36, borderRadius: 8, cursor: 'pointer', fontSize: 18, fontWeight: 700 }}>×</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: 18, padding: 20 }}>
                <div style={{ background: '#2563eb', borderRadius: 12, padding: 18, textAlign: 'center' }}>
                  <Avatar name={selectedStudent.name} image={selectedStudent.profileImage} size={88} />
                  <div style={{ fontSize: 18, fontWeight: 700, color: 'white', marginTop: 12 }}>{selectedStudent.name}</div>
                  <div style={{ fontSize: 12, color: '#bfdbfe', marginTop: 4 }}>Student ID: {selectedStudent.studentId || 'N/A'}</div>
                  <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap', marginTop: 10 }}>
                    <Badge variant="primary">Roll {selectedStudent.rollNumber || '—'}</Badge>
                    <Badge variant="gradient">{getDisplayGrade(selectedStudent, selectedAcademicYear)}</Badge>
                    <Badge variant="success">{selectedStudent.program || selectedStudent.programs || '—'}</Badge>
                  </div>
                </div>
                <div style={{ display: 'grid', gap: 10 }}>
                  {[
                    ['Student ID', selectedStudent.studentId || '—'],
                    ['Gender', selectedStudent.sex || '—'],
                    ['Section', selectedStudent.section || '—'],
                    ['Academic Year', selectedStudent.academicYear || selectedAcademicYear],
                    ['Age', selectedStudent.age || '—'],
                    ['Parent Phone', selectedStudent.parentPhone || '—'],
                  ].map(([label, value]) => (
                    <div key={label} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px 12px' }}>
                      <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b', fontWeight: 700 }}>{label}</div>
                      <div style={{ fontSize: 13, color: '#1e3a5f', fontWeight: 600, marginTop: 4 }}>{value}</div>
                    </div>
                  ))}
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
                    <button className="btn-primary" onClick={() => { setSelectedStudent(null); handleEditClick(selectedStudent); }} style={{ background: '#d97706' }}>Edit Student</button>
                    <button className="btn-primary" onClick={() => setSelectedStudent(null)} style={{ background: '#64748b' }}>Close</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Student Modal */}
        <EditStudentModal 
          editingStudent={editingStudent}
          editFormData={editFormData}
          setEditFormData={setEditFormData}
          editProfileImage={editProfileImage}
          setEditProfileImage={setEditProfileImage}
          loading={loading}
          onSubmit={handleEditSubmit}
          onClose={() => {
            setEditingStudent(null);
            setEditProfileImage(null);
          }}
        />
      </div>
    </>
  );
};

export default ManageStudents;