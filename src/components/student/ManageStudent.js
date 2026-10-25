// ManageStudents/index.jsx — FINAL: image display guaranteed to work

import React, { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
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
  @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
  @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  
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
    justify-content: center;
    gap: 6px;
    white-space: nowrap;
  }
  
  .btn-primary:hover { background: #1d4ed8; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3); }
  .btn-primary:active { transform: translateY(0); }
  .btn-success { background: #10b981; }
  .btn-success:hover { background: #059669; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3); }
  
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
  .pi:focus { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1); }
  
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
  .ps:focus { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1); }
  
  .compact-table td, .compact-table th { padding: 8px 10px; }
  .compact-table th {
    font-size: 10.5px; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.06em; color: #475569; padding: 8px 10px;
    border-bottom: 2px solid #cbd5e1; background: #f8fafc;
    white-space: nowrap; position: sticky; top: 0; z-index: 10;
  }
  .compact-table td { padding: 8px 10px; border-bottom: 1px solid #f1f5f9; font-size: 12.5px; }
  .compact-table tbody tr:hover { background: #f8fafc; }
  
  .grid-view { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px; }

  @media (max-width: 768px) {
    input, select, textarea { font-size: 16px !important; }
  }
`;

// ============= HELPERS =============
const cleanValue = (v) => {
  if (typeof v !== 'string') return v;
  return v.replace(/\u00A0/g, ' ').replace(/[\u200B-\u200D\uFEFF]/g, '').trim();
};

const sanitizeImage = (url) => {
  if (!url || typeof url !== 'string') return '';
  let u = url.trim().replace(/^["']|["']$/g, '');
  if (!u) return '';
  u = u.replace(/^http:\/\//i, 'https://');
  if (u.includes('res.cloudinary.com') && u.includes('/upload/')) {
    if (!/\/upload\/[^/]*(f_auto|q_auto)/.test(u)) {
      u = u.replace('/upload/', '/upload/f_auto,q_auto/');
    }
  }
  return u;
};

const ManageStudents = ({ isSuperAdmin = false }) => {
  const {
    students, graduatedStudents, loading, setLoading, fetching, promoting, setPromoting,
    searchTerm, setSearchTerm, selectedGrade, setSelectedGrade,
    selectedProgram, setSelectedProgram, selectedAcademicYear, setSelectedAcademicYear,
    currentPage, setCurrentPage, studentsPerPage, setStudentsPerPage,
    stats, getPromotionStats, fetchStudents, filteredStudents, paginatedStudents,
    totalPages, grades, programs, ages
  } = useStudents(isSuperAdmin);

  // ✅ NEW: cache of images returned from POST responses
  const [imageCache, setImageCache] = useState({});

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
    name: '', studentId: '', password: '', rollNumber: '',
    sex: '', grade: '', programs: '', section: '',
    academicYear: '2019/2020', parentPhone: '', age: ''
  });

  const [editFormData, setEditFormData] = useState({
    name: '', studentId: '', sex: '', rollNumber: '',
    grade: '', programs: '', section: '', password: '',
    academicYear: '2019/2020', parentPhone: '', age: ''
  });

  const resetForm = () => {
    setFormData({
      name: '', studentId: '', password: '', rollNumber: '',
      sex: '', grade: '', programs: '', section: '',
      academicYear: '2019/2020', parentPhone: '', age: ''
    });
    setProfileImage(null);
  };

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

  // ============= CREATE =============
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    const cleaned = Object.fromEntries(
      Object.entries(formData).map(([k, v]) => [k, cleanValue(v)])
    );

    if (
      !cleaned.name ||
      !cleaned.studentId ||
      !cleaned.password ||
      !cleaned.rollNumber ||
      !cleaned.parentPhone ||
      !cleaned.age
    ) {
      toast.error('Please fill all required fields including Student ID');
      return;
    }

    setLoading(true);
    try {
      const formDataToSend = new FormData();

      Object.entries(cleaned).forEach(([key, value]) => {
        if (
          key === 'grade' ||
          key === 'programs' ||
          key === 'section' ||
          key === 'academicYear' ||
          key === 'age'
        ) return;
        if (value === '' || value === undefined || value === null) return;
        formDataToSend.append(key, value);
      });

      formDataToSend.append('role', 'student');

      if (cleaned.grade) {
        formDataToSend.append('baseGrade', cleaned.grade);
        formDataToSend.append('grade', `Grade ${cleaned.grade}`);
      }
      if (cleaned.academicYear) {
        formDataToSend.append('baseAcademicYear', cleaned.academicYear);
        formDataToSend.append('academicYear', cleaned.academicYear);
      }
      if (cleaned.programs) formDataToSend.append('programs', cleaned.programs);
      if (cleaned.section) formDataToSend.append('section', cleaned.section);
      if (cleaned.parentPhone) formDataToSend.append('parentPhone', cleaned.parentPhone);
      if (cleaned.age) formDataToSend.append('age', cleaned.age);
      if (profileImage) formDataToSend.append('profileImage', profileImage);

      const res = await api.post('/users', formDataToSend);
      const createdUser = res.data?.user;

      // ✅ Cache the image URL from the POST response — will be used as fallback
      if (createdUser?._id && createdUser?.profileImage) {
        setImageCache((prev) => ({
          ...prev,
          [createdUser._id]: createdUser.profileImage,
        }));
      }

      console.log('[DEBUG] Created user:', createdUser);
      console.log('[DEBUG] profileImage:', createdUser?.profileImage);

      const tempPass = res.data?.temporary_password;
      toast.success(
        tempPass
          ? `🚀 Student added! Student ID: ${cleaned.studentId} · Temp password: ${tempPass}`
          : `🚀 Student added successfully! Student ID: ${cleaned.studentId}`,
        { duration: 8000 }
      );

      resetForm();
      setShowForm(false);
      setCurrentPage(1);
      await fetchStudents();
    } catch (error) {
      if (error.response?.status === 403) {
        toast.error('Access denied.');
        localStorage.clear();
        setTimeout(() => (window.location.href = '/login'), 2000);
      } else {
        const msg =
          error.response?.data?.error ||
          error.response?.data?.message ||
          error.userMessage ||
          error.message ||
          'Failed to add student';
        toast.error(msg);
        console.error('Add student error:', error.response?.data || error);
      }
    } finally {
      setLoading(false);
    }
  };

  // ============= EDIT OPEN =============
  const handleEditClick = async (student) => {
    setEditingStudent(student);
    try {
      const response = await api.get(
        `/enrollments/student/${student._id}/current?academicYear=${selectedAcademicYear}`
      );
      const currentEnrollment = response.data.enrollment;
      let gradeNum = currentEnrollment?.grade || student.grade || '';
      if (gradeNum && gradeNum.includes('Grade')) gradeNum = gradeNum.split(' ')[1];
      setEditFormData({
        name: student.name || '',
        studentId: student.studentId || '',
        sex: student.sex || '',
        rollNumber: student.rollNumber || '',
        grade: gradeNum,
        programs: currentEnrollment?.program || student.program || '',
        section: currentEnrollment?.section || student.section || '',
        password: '',
        age: student.age || '',
        academicYear: selectedAcademicYear,
        parentPhone: student.parentPhone || '',
      });
    } catch (error) {
      let gradeNum = student.grade || '';
      if (gradeNum && gradeNum.includes('Grade')) gradeNum = gradeNum.split(' ')[1];
      setEditFormData({
        name: student.name || '',
        studentId: student.studentId || '',
        sex: student.sex || '',
        rollNumber: student.rollNumber || '',
        grade: gradeNum,
        programs: student.program || student.programs || '',
        section: student.section || '',
        password: '',
        age: student.age || '',
        academicYear: selectedAcademicYear,
        parentPhone: student.parentPhone || '',
      });
    }
    setEditProfileImage(null);
  };

  // ============= EDIT SUBMIT =============
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    const cleaned = Object.fromEntries(
      Object.entries(editFormData).map(([k, v]) => [k, cleanValue(v)])
    );

    setLoading(true);
    try {
      const updateData = {
        name: cleaned.name,
        studentId: cleaned.studentId,
        sex: cleaned.sex,
        rollNumber: cleaned.rollNumber,
        baseGrade: editingStudent.baseGrade || cleaned.grade,
        baseAcademicYear:
          editingStudent.baseAcademicYear || cleaned.academicYear || '2019/2020',
        grade: `Grade ${cleaned.grade}`,
        programs: cleaned.programs,
        section: cleaned.section,
        academicYear: cleaned.academicYear || '2019/2020',
        parentPhone: cleaned.parentPhone,
        age: cleaned.age,
      };
      if (cleaned.password) updateData.password = cleaned.password;

      let res;
      if (editProfileImage) {
        const formDataToSend = new FormData();
        Object.entries(updateData).forEach(([k, v]) => {
          if (v !== undefined && v !== null && v !== '') formDataToSend.append(k, v);
        });
        formDataToSend.append('profileImage', editProfileImage);
        res = await api.put(`/users/${editingStudent._id}`, formDataToSend);
      } else {
        res = await api.put(`/users/${editingStudent._id}`, updateData);
      }

      // ✅ Update the cache with the new image URL if present
      const updated = res?.data?.user;
      if (updated?._id && updated?.profileImage) {
        setImageCache((prev) => ({
          ...prev,
          [updated._id]: updated.profileImage,
        }));
      }

      toast.success('✨ Student updated successfully!');
      setEditingStudent(null);
      setEditProfileImage(null);
      await fetchStudents();
    } catch (error) {
      console.error('Edit error:', error);
      const msg =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.userMessage ||
        error.message ||
        'Failed to update student';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // ============= DELETE =============
  const handleDelete = async (id) => {
    if (!window.confirm('⚠️ Are you sure you want to delete this student? This action cannot be undone.')) return;
    try {
      await api.delete(`/users/${id}`);
      toast.success('🗑️ Student deleted');
      setImageCache((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      await fetchStudents();
    } catch (error) {
      if (error.response?.status === 403) {
        localStorage.clear();
        window.location.href = '/login';
      } else {
        toast.error(error.response?.data?.error || 'Failed to delete student');
      }
    }
  };

  // ============= GRADUATE / RESTORE =============
  const handleMoveToGraduated = async (student) => {
    if (!window.confirm(`🎓 Move ${student.name} to Graduated Students list?`)) return;
    setLoading(true);
    try {
      await api.post(`/users/${student._id}/graduate`);
      toast.success(`🎓 ${student.name} has been moved to Graduated Students`);
      await fetchStudents();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to move student');
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

  // ============= BULK UPLOAD =============
  const handleBulkUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const ext = file.name.split('.').pop().toLowerCase();
    if (ext === 'csv') {
      Papa.parse(file, {
        header: true,
        complete: async (r) => { await processBulkStudents(r.data); },
        error: () => toast.error('Error parsing CSV file'),
      });
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
      const name = cleanValue(s.name);
      const studentId = cleanValue(s.studentId);
      const password = cleanValue(s.password);
      if (!name || !studentId || !password) { fail++; continue; }
      try {
        await api.post('/users', {
          name,
          studentId,
          password,
          sex: cleanValue(s.sex) || '',
          role: 'student',
          rollNumber: cleanValue(s.rollNumber || s.rollnumber || s.roll_no) || '',
          baseGrade: s.grade || 9,
          baseAcademicYear: selectedAcademicYear,
          grade: s.grade ? `Grade ${s.grade}` : '',
          program: cleanValue(s.programs || s.program) || '',
          section: cleanValue(s.section) || '',
          age: cleanValue(s.age) || '',
          academicYear: selectedAcademicYear,
          parentPhone: cleanValue(s.parentPhone) || '',
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
      { name: 'John Doe', studentId: 'STU2024001', email: 'john@school.com', password: 'pass123', rollNumber: '2024001', sex: 'Male', grade: '10', programs: 'Natural Science', section: 'A', academicYear: selectedAcademicYear, age: '16', parentPhone: '0912345678' },
      { name: 'Jane Smith', studentId: 'STU2024002', email: 'jane@school.com', password: 'pass123', rollNumber: '2024002', sex: 'Female', grade: '9', programs: 'Social Science', section: 'B', academicYear: selectedAcademicYear, age: '15', parentPhone: '0923456789' },
    ];
    const ws = XLSX.utils.json_to_sheet(t);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, 'student_template.xlsx');
    toast.success('📥 Template downloaded');
  };

  // ============= PROMOTE ALL =============
  const handlePromoteAll = async () => {
    if (!isSuperAdmin) { toast.error('Only Super Admin can promote students'); return; }
    const nextYear = (() => {
      if (selectedAcademicYear.includes('/')) {
        const [start, end] = selectedAcademicYear.split('/');
        return `${parseInt(start) + 1}/${parseInt(end) + 1}`;
      }
      const start = parseInt(selectedAcademicYear);
      return `${start + 1}/${start + 2}`;
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
        toYear: nextYear,
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

  // ============= EXPORT =============
  const exportData = filteredStudents.map(s => {
    const computedGrade = getDisplayGrade(s, selectedAcademicYear);
    return {
      'Student ID': s.studentId || '-',
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
    'Student ID': s.studentId || '-',
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
  const paginatedGraduated = filteredGraduated.slice(
    (graduatedCurrentPage - 1) * graduatedPerPage,
    graduatedCurrentPage * graduatedPerPage
  );

  // ✅ Helper: attach cached image to a student object
  const withCachedImage = (s) => ({
    ...s,
    profileImage: s.profileImage || imageCache[s._id] || null,
  });

  return (
    <>
      <style>{globalStyles}</style>

      <div style={{
        maxWidth: 1400,
        margin: '0 auto',
        padding: '16px',
        background: '#f0f4ff',
        minHeight: '100vh',
      }}>
        {(loading || promoting) && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, height: 3, background: '#2563eb' }} />
        )}

        <div style={{ marginBottom: 16, animation: 'fadeInUp 0.6s ease' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1e3a5f', margin: 0 }}>Student Management</h1>
              <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0 0' }}>Manage all students across the school</p>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              <button
                className="btn-primary"
                onClick={() => setShowGraduatedList(!showGraduatedList)}
                style={{ background: showGraduatedList ? '#2563eb' : '#10b981', flex: '1 1 140px' }}
              >
                <Icon d="M12 14l9-5-9-5-9 5 9 5z" size={15} color="#fff" />
                {showGraduatedList ? '📚 Active' : `🎓 Graduated (${stats.graduated})`}
              </button>

              {isSuperAdmin && !showGraduatedList && (
                <button
                  className="btn-primary"
                  onClick={() => { setShowBulkUpload(!showBulkUpload); setShowForm(false); }}
                  style={{ background: showBulkUpload ? '#10b981' : '#2563eb', flex: '1 1 140px' }}
                >
                  <Icon d="M19 10v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" size={15} color="#fff" />
                  {showBulkUpload ? 'Cancel' : 'Bulk Import'}
                </button>
              )}

              {!showGraduatedList && (
                <button
                  className="btn-primary"
                  onClick={() => {
                    if (showForm) handleCancelForm();
                    else { setShowForm(true); setShowBulkUpload(false); resetForm(); }
                  }}
                  style={{ background: showForm ? '#10b981' : '#2563eb', flex: '1 1 140px' }}
                >
                  <Icon d={showForm ? 'M18 6L6 18M6 6l12 12' : 'M12 5v14M5 12h14'} size={15} color="#fff" strokeWidth={2} />
                  {showForm ? 'Cancel' : 'Add Student'}
                </button>
              )}
            </div>
          </div>
        </div>

        {!showGraduatedList ? (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 16 }}>
              {[
                { label: 'Active Students', value: stats.total, color: '#2563eb', icon: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2' },
                { label: 'Male', value: stats.male, color: '#10b981', icon: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2' },
                { label: 'Female', value: stats.female, color: '#2563eb', icon: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2' },
                { label: 'Grades', value: stats.grades, color: '#10b981', icon: 'M4 6h16M4 12h16M4 18h16' },
              ].map(({ label, value, color, icon }) => (
                <div key={label} style={{ background: '#fff', padding: '14px 16px', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ background: color, width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon d={icon} size={16} color="#fff" />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 11, color: '#64748b', margin: 0 }}>{label}</p>
                      <p style={{ fontSize: 18, fontWeight: 700, color: '#1e3a5f', margin: 0 }}>{value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

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

            <BulkUpload
              showBulkUpload={showBulkUpload}
              bulkLoading={bulkLoading}
              handleBulkUpload={handleBulkUpload}
              downloadTemplate={downloadTemplate}
              onClose={() => setShowBulkUpload(false)}
            />

            <div style={{
              background: '#fff',
              marginBottom: 12,
              padding: 12,
              borderRadius: 12,
              border: '1px solid #e2e8f0',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: 10,
            }}>
              <div style={{ position: 'relative', gridColumn: '1 / -1' }}>
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
                  style={{ paddingLeft: 38 }}
                />
                {searchTerm && (
                  <button
                    onClick={() => { setSearchTerm(''); searchInputRef.current?.focus(); }}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: '#f1f5f9', border: 'none', cursor: 'pointer', padding: '4px 8px', borderRadius: 6 }}
                  >
                    <Icon d="M18 6L6 18M6 6l12 12" size={14} color="#64748b" strokeWidth={2} />
                  </button>
                )}
              </div>

              <div style={{ position: 'relative' }}>
                <select className="ps" value={selectedGrade} onChange={e => setSelectedGrade(e.target.value)} style={{ paddingRight: 32 }}>
                  <option value="">All Grades</option>
                  {[9, 10, 11, 12].map(g => <option key={g} value={g}>Grade {g}</option>)}
                </select>
                <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                  <Icon d="M6 9l6 6 6-6" size={14} color="#64748b" strokeWidth={2} />
                </div>
              </div>

              <div style={{ position: 'relative' }}>
                <select className="ps" value={selectedProgram} onChange={e => setSelectedProgram(e.target.value)} style={{ paddingRight: 32 }}>
                  <option value="">All Programs</option>
                  {programs.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                  <Icon d="M6 9l6 6 6-6" size={14} color="#64748b" strokeWidth={2} />
                </div>
              </div>

              <div style={{ position: 'relative' }}>
                <select className="ps" value={selectedAcademicYear} onChange={e => setSelectedAcademicYear(e.target.value)} style={{ paddingRight: 32 }}>
                  {['2019/2020', '2020/2021', '2021/2022', '2022/2023', '2023/2024', '2024/2025', '2025/2026'].map(y => <option key={y} value={y}>{y}</option>)}
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
                  style={{ fontSize: 12, padding: '10px 14px' }}
                >
                  {promoting ? (
                    <><div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'rotate 0.6s linear infinite' }} /> Promoting...</>
                  ) : (
                    <><Icon d="M12 14l9-5-9-5-9 5 9 5z" size={13} color="#fff" /> Promote All</>
                  )}
                </button>
              )}
            </div>

            <div style={{
              display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center',
              background: '#fff', padding: 10, borderRadius: 12, border: '1px solid #e2e8f0', marginBottom: 12,
            }}>
              <div style={{ display: 'flex', borderRadius: 8, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                <button
                  onClick={() => setViewMode('table')}
                  style={{ padding: '6px 12px', border: 'none', cursor: 'pointer', background: viewMode === 'table' ? '#2563eb' : '#fff', color: viewMode === 'table' ? '#fff' : '#475569', fontWeight: 600, fontSize: 12 }}
                >
                  Table
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  style={{ padding: '6px 12px', border: 'none', cursor: 'pointer', background: viewMode === 'grid' ? '#2563eb' : '#fff', color: viewMode === 'grid' ? '#fff' : '#475569', fontWeight: 600, fontSize: 12 }}
                >
                  Grid
                </button>
              </div>

              <div style={{ display: 'flex', gap: 6, marginLeft: 'auto', flexWrap: 'wrap' }}>
                <button className="btn-primary" onClick={copyAll} style={{ background: '#10b981', fontSize: 12, padding: '6px 12px' }}>
                  <Icon d="M8 7v8a2 2 0 0 0 2 2h6M8 7V5a2 2 0 0 1 2-2h4.586a1 1 0 0 1 .707.293l4.414 4.414a1 1 0 0 1 .293.707V15a2 2 0 0 1-2 2h-2M8 7H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-2" size={13} color="#fff" strokeWidth={2} />
                  Copy
                </button>
                <button className="btn-primary" onClick={() => exportExcel(exportData, 'students')} style={{ background: '#10b981', fontSize: 12, padding: '6px 12px' }}>
                  <Icon d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" size={13} color="#fff" strokeWidth={2} />
                  Excel
                </button>
                <button className="btn-primary" onClick={() => exportCSV(exportData, 'students')} style={{ background: '#2563eb', fontSize: 12, padding: '6px 12px' }}>
                  <Icon d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" size={13} color="#fff" strokeWidth={2} />
                  CSV
                </button>
                <button className="btn-primary" onClick={printTable} style={{ background: '#2563eb', fontSize: 12, padding: '6px 12px' }}>
                  <Icon d="M19 8H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2zm-2 0V4a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v4m8 8h.01" size={13} color="#fff" strokeWidth={2} />
                  Print
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, padding: '0 4px', fontSize: 12, color: '#64748b', gap: 8 }}>
              <div>
                Showing <strong style={{ color: '#1e3a5f' }}>{paginatedStudents.length}</strong> of{' '}
                <strong style={{ color: '#1e3a5f' }}>{filteredStudents.length}</strong> active students
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>Rows:</span>
                <select
                  value={studentsPerPage}
                  onChange={e => { setStudentsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                  style={{ padding: '4px 8px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12, fontWeight: 600, color: '#1e3a5f', cursor: 'pointer' }}
                >
                  <option value={100}>100</option>
                  <option value={200}>200</option>
                  <option value={500}>500</option>
                  <option value={1000}>1000</option>
                  <option value={2000}>2000</option>
                </select>
              </div>
            </div>

            {/* ✅ Table + Grid receive students with cached image merged in */}
            {viewMode === 'table' ? (
              <StudentTable
                students={paginatedStudents.map(withCachedImage)}
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
                    student={withCachedImage(student)}
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

            {!fetching && (
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, fontSize: 11, color: '#64748b', padding: '0 4px', gap: 8 }}>
                <div>Updated: <strong style={{ color: '#1e3a5f' }}>{new Date().toLocaleTimeString()}</strong></div>
                <div>Total: <strong style={{ color: '#1e3a5f' }}>{students.length}</strong> active students</div>
              </div>
            )}
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

        <PromotionModal
          showPromotionConfirm={showPromotionConfirm}
          selectedAcademicYear={selectedAcademicYear}
          promotionStats={getPromotionStats()}
          promoting={promoting}
          onConfirm={handlePromoteAll}
          onCancel={() => setShowPromotionConfirm(false)}
        />

        {/* View Student Modal — image reads from cache too */}
        {selectedStudent && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, padding: 12 }}>
            <div style={{ background: '#fff', width: '100%', maxWidth: 760, borderRadius: 12, overflow: 'hidden', maxHeight: '92vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid #e2e8f0', background: '#2563eb', gap: 8 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>Student Profile</div>
                  <div style={{ fontSize: 11, color: '#bfdbfe' }}>Quick overview of the selected student</div>
                </div>
                <button
                  onClick={() => setSelectedStudent(null)}
                  style={{ border: 'none', background: '#f1f5f9', color: '#1e3a5f', width: 34, height: 34, borderRadius: 8, cursor: 'pointer', fontSize: 18, fontWeight: 700, flexShrink: 0 }}
                >
                  ×
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14, padding: 16 }}>
                <div style={{ background: '#2563eb', borderRadius: 12, padding: 16, textAlign: 'center' }}>
                  <Avatar
                    name={selectedStudent.name}
                    image={sanitizeImage(
                      selectedStudent.profileImage || imageCache[selectedStudent._id]
                    )}
                    size={80}
                  />
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginTop: 10, wordBreak: 'break-word' }}>{selectedStudent.name}</div>
                  <div style={{ fontSize: 11, color: '#bfdbfe', marginTop: 4 }}>Student ID: {selectedStudent.studentId || 'N/A'}</div>
                  <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap', marginTop: 10 }}>
                    <Badge variant="primary">Roll {selectedStudent.rollNumber || '—'}</Badge>
                    <Badge variant="gradient">{getDisplayGrade(selectedStudent, selectedAcademicYear)}</Badge>
                    <Badge variant="success">{selectedStudent.program || selectedStudent.programs || '—'}</Badge>
                  </div>
                </div>
                <div style={{ display: 'grid', gap: 8 }}>
                  {[
                    ['Student ID', selectedStudent.studentId || '—'],
                    ['Gender', selectedStudent.sex || '—'],
                    ['Section', selectedStudent.section || '—'],
                    ['Academic Year', selectedStudent.academicYear || selectedAcademicYear],
                    ['Age', selectedStudent.age || '—'],
                    ['Parent Phone', selectedStudent.parentPhone || '—'],
                  ].map(([label, value]) => (
                    <div key={label} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '8px 10px' }}>
                      <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b', fontWeight: 700 }}>{label}</div>
                      <div style={{ fontSize: 12, color: '#1e3a5f', fontWeight: 600, marginTop: 3, wordBreak: 'break-word' }}>{value}</div>
                    </div>
                  ))}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
                    <button
                      className="btn-primary"
                      onClick={() => { setSelectedStudent(null); handleEditClick(selectedStudent); }}
                      style={{ background: '#10b981' }}
                    >
                      Edit Student
                    </button>
                    <button className="btn-primary" onClick={() => setSelectedStudent(null)} style={{ background: '#2563eb' }}>
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <EditStudentModal
          editingStudent={editingStudent}
          editFormData={editFormData}
          setEditFormData={setEditFormData}
          editProfileImage={editProfileImage}
          setEditProfileImage={setEditProfileImage}
          loading={loading}
          onSubmit={handleEditSubmit}
          onClose={() => { setEditingStudent(null); setEditProfileImage(null); }}
        />
      </div>
    </>
  );
};

export default ManageStudents;
