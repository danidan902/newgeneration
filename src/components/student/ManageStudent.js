// ManageStudents/index.jsx — Fixed upload, responsive, image display working
import React, { useState, useRef, useEffect } from 'react';
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

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth <= 768 : false
  );
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return isMobile;
};

export const Icon = ({ d, size = 18, strokeWidth = 1.5, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"
    className={className}>
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);

const globalStyles = `
  @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

  .btn-primary {
    background: #2563eb; color: white; border: none; padding: 10px 18px;
    border-radius: 8px; font-weight: 600; font-size: 13px; cursor: pointer;
    transition: all 0.2s ease; display: inline-flex; align-items: center;
    justify-content: center; gap: 6px; min-height: 40px;
  }
  .btn-primary:hover { background: #1d4ed8; }
  .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
  .btn-success { background: #10b981; }
  .btn-success:hover { background: #059669; }
  .btn-danger { background: #dc2626; }

  .pi { width: 100%; padding: 10px 14px; border: 1px solid #e2e8f0;
    border-radius: 8px; background: #fff; font-size: 13px; color: #1e293b;
    outline: none; min-height: 42px; }
  .pi:focus { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1); }

  .ps { width: 100%; padding: 10px 14px; border: 1px solid #e2e8f0;
    border-radius: 8px; background: #fff; font-size: 13px; color: #1e293b;
    outline: none; cursor: pointer; min-height: 42px; }
  .ps:focus { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1); }

  .grid-view { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 14px; }

  @media (max-width: 768px) {
    input, select, textarea { font-size: 16px !important; }
  }
  @media (max-width: 640px) {
    .ms-stats { grid-template-columns: 1fr 1fr !important; gap: 10px !important; }
    .ms-page { padding: 12px !important; }
  }
`;

const ManageStudents = ({ isSuperAdmin = false }) => {
  const isMobile = useIsMobile();

  const {
    students, graduatedStudents, loading, setLoading, fetching, promoting, setPromoting,
    searchTerm, setSearchTerm, selectedGrade, setSelectedGrade,
    selectedProgram, setSelectedProgram, selectedAcademicYear, setSelectedAcademicYear,
    currentPage, setCurrentPage, studentsPerPage, setStudentsPerPage,
    stats, getPromotionStats, fetchStudents, filteredStudents, paginatedStudents,
    totalPages, programs
  } = useStudents(isSuperAdmin);

  const [imageCache, setImageCache] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [editingStudent, setEditingStudent] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [editProfileImage, setEditProfileImage] = useState(null);
  const [viewMode, setViewMode] = useState('table');
  const [showPromotionConfirm, setShowPromotionConfirm] = useState(false);
  const [showGraduatedList, setShowGraduatedList] = useState(false);

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
        if (window.confirm('Cancel? All entered data will be lost.')) {
          resetForm();
          setShowForm(false);
        }
      } else {
        resetForm();
        setShowForm(false);
      }
    }
  };

  // ═══════════════════════════════════════════════════════
  // ✅ FIXED handleSubmit — parentPhone appended ONCE, file appended ONCE
  // ═══════════════════════════════════════════════════════
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (!formData.name || !formData.studentId || !formData.password ||
        !formData.rollNumber || !formData.parentPhone || !formData.age) {
      toast.error('Please fill all required fields including Student ID');
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();

      // Append all text fields ONCE. parentPhone is included here.
      Object.keys(formData).forEach(key => {
        if (['grade', 'programs', 'section', 'academicYear', 'age'].includes(key)) return;
        if (formData[key]) fd.append(key, formData[key]);
      });

      fd.append('role', 'student');
      fd.append('baseGrade', formData.grade);
      fd.append('baseAcademicYear', formData.academicYear);

      if (formData.grade) fd.append('grade', `Grade ${formData.grade}`);
      if (formData.programs) fd.append('programs', formData.programs);
      if (formData.section) fd.append('section', formData.section);
      if (formData.academicYear) fd.append('academicYear', formData.academicYear);
      if (formData.age) fd.append('age', formData.age);

      // ⚠️ parentPhone is already appended by the loop above — do NOT append again
      // ⚠️ profileImage appended ONLY once, right here:
      if (profileImage) {
        fd.append('profileImage', profileImage);
        console.log('[UPLOAD] File:', profileImage.name, profileImage.size);
      } else {
        console.warn('[UPLOAD] profileImage is null');
      }

      // ✅ NO Content-Type header
      const res = await api.post('/users', fd);
      const createdUser = res.data?.user;

      if (createdUser?._id && createdUser?.profileImage) {
        setImageCache(prev => ({ ...prev, [createdUser._id]: createdUser.profileImage }));
      }

      console.log('[UPLOAD] Server saved:', createdUser?.profileImage);

      toast.success(`🚀 Student added! Student ID: ${formData.studentId}`);
      resetForm();
      setShowForm(false);
      setCurrentPage(1);
      await fetchStudents();
    } catch (error) {
      console.error('Add error:', error.response?.data || error);
      if (error.response?.status === 403) {
        toast.error('Access denied.');
        localStorage.clear();
        setTimeout(() => (window.location.href = '/login'), 2000);
      } else {
        toast.error(
          error.response?.data?.error ||
          error.response?.data?.message ||
          error.userMessage ||
          error.message ||
          'Failed to add student'
        );
      }
    } finally {
      setLoading(false);
    }
  };

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
        parentPhone: student.parentPhone || ''
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
        studentId: editFormData.studentId,
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
      if (editFormData.password) updateData.password = editFormData.password;

      let res;
      if (editProfileImage) {
        const fd = new FormData();
        Object.entries(updateData).forEach(([k, v]) => {
          if (v !== undefined && v !== null && v !== '') fd.append(k, v);
        });
        fd.append('profileImage', editProfileImage);
        res = await api.put(`/users/${editingStudent._id}`, fd);
      } else {
        res = await api.put(`/users/${editingStudent._id}`, updateData);
      }

      const updated = res?.data?.user;
      if (updated?._id && updated?.profileImage) {
        setImageCache(prev => ({ ...prev, [updated._id]: updated.profileImage }));
      }

      toast.success('✨ Student updated!');
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
    if (!window.confirm('Delete this student? This cannot be undone.')) return;
    try {
      await api.delete(`/users/${id}`);
      toast.success('🗑️ Student deleted');
      setImageCache(prev => { const n = { ...prev }; delete n[id]; return n; });
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
    if (!window.confirm(`Move ${student.name} to Graduated?`)) return;
    setLoading(true);
    try {
      await api.post(`/users/${student._id}/graduate`);
      toast.success(`${student.name} moved to Graduated`);
      await fetchStudents();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to move student');
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreFromGraduated = async (student) => {
    if (!window.confirm(`Restore ${student.name}?`)) return;
    setLoading(true);
    try {
      await api.post(`/users/${student._id}/restore`, { newGrade: '12' });
      toast.success(`${student.name} restored`);
      await fetchStudents();
      setShowGraduatedList(false);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to restore');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const ext = file.name.split('.').pop().toLowerCase();
    if (ext === 'csv') {
      Papa.parse(file, {
        header: true,
        complete: async (r) => processBulkStudents(r.data),
        error: () => toast.error('CSV parse error')
      });
    } else if (ext === 'xlsx' || ext === 'xls') {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const wb = XLSX.read(new Uint8Array(ev.target.result), { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        await processBulkStudents(XLSX.utils.sheet_to_json(ws));
      };
      reader.readAsArrayBuffer(file);
    } else {
      toast.error('Upload CSV or Excel');
    }
    e.target.value = '';
  };

  const processBulkStudents = async (data) => {
    setBulkLoading(true);
    let ok = 0, fail = 0;
    for (const s of data) {
      if (!s.name || !s.studentId || !s.password) { fail++; continue; }
      try {
        await api.post('/users', {
          name: s.name, studentId: s.studentId, password: s.password,
          sex: s.sex || '', role: 'student',
          rollNumber: s.rollNumber || s.rollnumber || '',
          baseGrade: s.grade || 9, baseAcademicYear: selectedAcademicYear,
          grade: s.grade ? `Grade ${s.grade}` : '',
          program: s.programs || s.program || '',
          section: s.section || '', age: s.age || '',
          academicYear: selectedAcademicYear,
          parentPhone: s.parentPhone || ''
        });
        ok++;
      } catch { fail++; }
    }
    if (ok > 0) { toast.success(`Added ${ok} students`); setCurrentPage(1); await fetchStudents(); }
    if (fail > 0) toast.error(`${fail} failed`);
    setBulkLoading(false);
    setShowBulkUpload(false);
  };

  const downloadTemplate = () => {
    const t = [{
      name: 'John Doe', studentId: 'STU001', email: 'john@school.com',
      password: 'pass123', rollNumber: '001', sex: 'Male', grade: '10',
      programs: 'Natural Science', section: 'A', academicYear: selectedAcademicYear,
      age: '16', parentPhone: '0912345678'
    }];
    const ws = XLSX.utils.json_to_sheet(t);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, 'student_template.xlsx');
    toast.success('Template downloaded');
  };

  const handlePromoteAll = async () => {
    if (!isSuperAdmin) { toast.error('Super Admin only'); return; }
    const nextYear = (() => {
      if (selectedAcademicYear.includes('/')) {
        const [a, b] = selectedAcademicYear.split('/');
        return `${parseInt(a) + 1}/${parseInt(b) + 1}`;
      }
      const s = parseInt(selectedAcademicYear);
      return `${s + 1}/${s + 2}`;
    })();
    const ps = getPromotionStats();
    if (!window.confirm(
      `Promote all? ${selectedAcademicYear} → ${nextYear}\n\n` +
      `Grade 9: ${ps.grade9}\nGrade 10: ${ps.grade10}\n` +
      `Grade 11: ${ps.grade11}\nGrade 12 → Graduated: ${ps.grade12}`
    )) return;

    setPromoting(true);
    try {
      const r = await api.post('/users/promote-all', { fromYear: selectedAcademicYear, toYear: nextYear });
      if (r.data.success) {
        toast.success(r.data.message);
        await fetchStudents();
        setSelectedAcademicYear(nextYear);
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to promote');
    } finally {
      setPromoting(false);
      setShowPromotionConfirm(false);
    }
  };

  const exportData = filteredStudents.map(s => ({
    'Student ID': s.studentId || '-',
    'Roll Number': s.rollNumber || '-',
    Name: s.name,
    Sex: s.sex || '-',
    'Current Grade': getDisplayGrade(s, selectedAcademicYear),
    Program: s.program || s.programs || '-',
    Section: s.section || '-',
    Age: s.age || '-',
    'Parent Phone': s.parentPhone || '-',
    'Academic Year': s.academicYear || selectedAcademicYear
  }));

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
    'Graduation Year': s.academicYear || selectedAcademicYear
  }));

  const copyAll = () => {
    if (!filteredStudents.length) { toast.error('No data'); return; }
    navigator.clipboard.writeText(JSON.stringify(exportData, null, 2));
    toast.success(`${filteredStudents.length} records copied`);
  };

  const printTable = () => {
    if (!filteredStudents.length) { toast.error('No data'); return; }
    const w = window.open('', '_blank');
    w.document.write(`<!DOCTYPE html><html><head><title>Students</title>
    <style>body{font-family:system-ui;margin:24px;color:#1e293b}
    h1{font-size:22px}table{width:100%;border-collapse:collapse;font-size:12px}
    th{background:#2563eb;color:#fff;padding:10px;text-align:left}
    td{padding:8px 10px;border-bottom:1px solid #cbd5e1}</style></head><body>
    <h1>Students List</h1><p>${filteredStudents.length} records · ${new Date().toLocaleString()}</p>
    <table><thead><tr><th>ID</th><th>Name</th><th>Grade</th></tr></thead>
    <tbody>${filteredStudents.map(s => `<tr>
      <td>${s.studentId || '-'}</td><td>${s.name}</td>
      <td>${getDisplayGrade(s, selectedAcademicYear)}</td></tr>`).join('')}
    </tbody></table><script>window.onload=()=>{window.print();setTimeout(()=>window.close(),800)}<\/script>
    </body></html>`);
  };

  const withCachedImage = (s) => ({
    ...s,
    profileImage: s.profileImage || imageCache[s._id] || null
  });

  const paginatedGraduated = graduatedStudents.slice(0, 50);

  return (
    <>
      <style>{globalStyles}</style>

      <div className="ms-page" style={{
        maxWidth: 1400, margin: '0 auto',
        padding: isMobile ? 12 : '24px 32px',
        background: '#f0f4ff', minHeight: '100vh'
      }}>
        {(loading || promoting) && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, height: 3,
            background: '#2563eb', zIndex: 1000
          }} />
        )}

        <div style={{ marginBottom: isMobile ? 12 : 24 }}>
          <div style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: isMobile ? 'stretch' : 'center',
            gap: 12
          }}>
            <div>
              <h1 style={{ fontSize: isMobile ? 20 : 28, fontWeight: 700, color: '#1e3a5f', margin: 0 }}>
                Student Management
              </h1>
              <p style={{ fontSize: isMobile ? 12 : 14, color: '#64748b', margin: '4px 0 0 0' }}>
                Manage all students
              </p>
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button
                className="btn-primary"
                onClick={() => setShowGraduatedList(!showGraduatedList)}
                style={{ background: showGraduatedList ? '#2563eb' : '#64748b', flex: isMobile ? '1 1 calc(50% - 4px)' : '0 0 auto' }}
              >
                {showGraduatedList ? 'Active' : `Graduated (${stats.graduated})`}
              </button>

              {isSuperAdmin && !showGraduatedList && (
                <button
                  className="btn-primary"
                  onClick={() => { setShowBulkUpload(!showBulkUpload); setShowForm(false); }}
                  style={{ background: showBulkUpload ? '#64748b' : '#2563eb', flex: isMobile ? '1 1 calc(50% - 4px)' : '0 0 auto' }}
                >
                  Bulk Import
                </button>
              )}

              {!showGraduatedList && (
                <button
                  className="btn-primary"
                  onClick={() => {
                    if (showForm) handleCancelForm();
                    else { setShowForm(true); setShowBulkUpload(false); resetForm(); }
                  }}
                  style={{ background: showForm ? '#dc2626' : '#2563eb', flex: isMobile ? '1 1 100%' : '0 0 auto' }}
                >
                  {showForm ? 'Cancel' : 'Add Student'}
                </button>
              )}
            </div>
          </div>
        </div>

        {!showGraduatedList ? (
          <>
            <div className="ms-stats" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: isMobile ? 10 : 16,
              marginBottom: isMobile ? 12 : 24
            }}>
              {[
                { label: 'Active', value: stats.total, color: '#2563eb' },
                { label: 'Male', value: stats.male, color: '#10b981' },
                { label: 'Female', value: stats.female, color: '#8b5cf6' },
                { label: 'Grades', value: stats.grades, color: '#d97706' }
              ].map(({ label, value, color }) => (
                <div key={label} style={{
                  background: 'white',
                  padding: isMobile ? '10px 12px' : '16px 20px',
                  borderRadius: 12, border: '1px solid #e2e8f0'
                }}>
                  <p style={{ fontSize: 11, color: '#64748b', margin: 0 }}>{label}</p>
                  <p style={{ fontSize: isMobile ? 18 : 22, fontWeight: 700, color, margin: '2px 0 0 0' }}>
                    {value}
                  </p>
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
              background: 'white', marginBottom: 12,
              padding: isMobile ? 10 : 16, borderRadius: 12,
              border: '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              gap: 10, flexWrap: 'wrap'
            }}>
              <div style={{ position: 'relative', flex: '1 1 200px' }}>
                <input
                  ref={searchInputRef}
                  className="pi"
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>

              <select className="ps" value={selectedGrade} onChange={e => setSelectedGrade(e.target.value)} style={{ flex: isMobile ? '1 1 100%' : '0 0 130px' }}>
                <option value="">All Grades</option>
                {[9, 10, 11, 12].map(g => <option key={g} value={g}>Grade {g}</option>)}
              </select>

              <select className="ps" value={selectedProgram} onChange={e => setSelectedProgram(e.target.value)} style={{ flex: isMobile ? '1 1 100%' : '0 0 150px' }}>
                <option value="">All Programs</option>
                {programs.map(p => <option key={p} value={p}>{p}</option>)}
              </select>

              <select className="ps" value={selectedAcademicYear} onChange={e => setSelectedAcademicYear(e.target.value)} style={{ flex: isMobile ? '1 1 100%' : '0 0 130px' }}>
                {['2019/2020','2020/2021','2021/2022','2022/2023','2023/2024','2024/2025','2025/2026'].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>

              {isSuperAdmin && (
                <button
                  className="btn-primary btn-success"
                  onClick={() => setShowPromotionConfirm(true)}
                  disabled={promoting}
                  style={{ flex: isMobile ? '1 1 100%' : '0 0 auto' }}
                >
                  {promoting ? 'Promoting...' : 'Promote All'}
                </button>
              )}
            </div>

            <div style={{
              background: 'white', marginBottom: 12,
              padding: isMobile ? 10 : 14, borderRadius: 12,
              border: '1px solid #e2e8f0',
              display: 'flex', flexWrap: 'wrap',
              alignItems: 'center', gap: 8
            }}>
              <div style={{
                display: 'flex', borderRadius: 8, overflow: 'hidden',
                border: '1px solid #e2e8f0', flex: isMobile ? '1 1 100%' : '0 0 auto'
              }}>
                <button onClick={() => setViewMode('table')} style={{
                  flex: 1, padding: '8px 12px', border: 'none', cursor: 'pointer',
                  background: viewMode === 'table' ? '#2563eb' : '#fff',
                  color: viewMode === 'table' ? '#fff' : '#475569',
                  fontWeight: 600, fontSize: 12
                }}>Table</button>
                <button onClick={() => setViewMode('grid')} style={{
                  flex: 1, padding: '8px 12px', border: 'none', cursor: 'pointer',
                  background: viewMode === 'grid' ? '#2563eb' : '#fff',
                  color: viewMode === 'grid' ? '#fff' : '#475569',
                  fontWeight: 600, fontSize: 12
                }}>Grid</button>
              </div>

              <button className="btn-primary" onClick={copyAll} style={{ background: '#64748b', flex: isMobile ? '1 1 calc(50% - 4px)' : '0 0 auto', fontSize: 12, padding: '8px 12px' }}>Copy</button>
              <button className="btn-primary" onClick={() => exportExcel(exportData, 'students')} style={{ background: '#10b981', flex: isMobile ? '1 1 calc(50% - 4px)' : '0 0 auto', fontSize: 12, padding: '8px 12px' }}>Excel</button>
              <button className="btn-primary" onClick={() => exportCSV(exportData, 'students')} style={{ background: '#2563eb', flex: isMobile ? '1 1 calc(50% - 4px)' : '0 0 auto', fontSize: 12, padding: '8px 12px' }}>CSV</button>
              <button className="btn-primary" onClick={printTable} style={{ background: '#2563eb', flex: isMobile ? '1 1 calc(50% - 4px)' : '0 0 auto', fontSize: 12, padding: '8px 12px' }}>Print</button>
            </div>

            <div style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              justifyContent: 'space-between',
              alignItems: isMobile ? 'stretch' : 'center',
              marginBottom: 10, fontSize: 12, color: '#64748b',
              padding: '0 4px', gap: 8
            }}>
              <div>
                Showing <strong style={{ color: '#1e3a5f' }}>{paginatedStudents.length}</strong> of{' '}
                <strong style={{ color: '#1e3a5f' }}>{filteredStudents.length}</strong> students
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>Rows:</span>
                <select
                  value={studentsPerPage}
                  onChange={e => { setStudentsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                  style={{
                    padding: '6px 8px', borderRadius: 8, border: '1px solid #e2e8f0',
                    fontSize: 12, fontWeight: 600, color: '#1e3a5f', cursor: 'pointer'
                  }}
                >
                  <option value={100}>100</option>
                  <option value={200}>200</option>
                  <option value={500}>500</option>
                  <option value={1000}>1000</option>
                </select>
              </div>
            </div>

            {viewMode === 'table' ? (
              <StudentTable
                students={paginatedStudents.map(withCachedImage)}
                fetching={fetching}
                studentsPerPage={studentsPerPage}
                getDisplayGrade={(s) => getDisplayGrade(s, selectedAcademicYear)}
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
                    getDisplayGrade={(s) => getDisplayGrade(s, selectedAcademicYear)}
                    onView={setSelectedStudent}
                    onEdit={handleEditClick}
                    onGraduate={handleMoveToGraduated}
                    isSuperAdmin={isSuperAdmin}
                  />
                ))}
              </div>
            )}

            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
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

        {selectedStudent && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.55)',
            display: 'flex', alignItems: isMobile ? 'flex-start' : 'center',
            justifyContent: 'center', zIndex: 1200,
            padding: isMobile ? 0 : 16, overflowY: 'auto'
          }}>
            <div style={{
              background: 'white', width: '100%',
              maxWidth: isMobile ? '100%' : 760,
              borderRadius: isMobile ? 0 : 12,
              maxHeight: isMobile ? '100vh' : '92vh',
              overflow: 'auto'
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 16px', borderBottom: '1px solid #e2e8f0',
                background: '#2563eb', position: 'sticky', top: 0, zIndex: 1
              }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'white' }}>Student Profile</div>
                  <div style={{ fontSize: 11, color: '#bfdbfe' }}>Quick overview</div>
                </div>
                <button
                  onClick={() => setSelectedStudent(null)}
                  style={{
                    border: 'none', background: '#f1f5f9', color: '#1e3a5f',
                    width: 36, height: 36, borderRadius: 8, cursor: 'pointer',
                    fontSize: 18, fontWeight: 700
                  }}
                >×</button>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '1fr 1.1fr',
                gap: 14, padding: 16
              }}>
                <div style={{ background: '#2563eb', borderRadius: 12, padding: 16, textAlign: 'center' }}>
                  <Avatar
                    name={selectedStudent.name}
                    image={sanitizeImage(selectedStudent.profileImage || imageCache[selectedStudent._id])}
                    size={isMobile ? 72 : 88}
                  />
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'white', marginTop: 10 }}>
                    {selectedStudent.name}
                  </div>
                  <div style={{ fontSize: 11, color: '#bfdbfe', marginTop: 4 }}>
                    Student ID: {selectedStudent.studentId || 'N/A'}
                  </div>
                </div>

                <div style={{ display: 'grid', gap: 8 }}>
                  {[
                    ['Student ID', selectedStudent.studentId || '—'],
                    ['Gender', selectedStudent.sex || '—'],
                    ['Section', selectedStudent.section || '—'],
                    ['Academic Year', selectedStudent.academicYear || selectedAcademicYear],
                    ['Age', selectedStudent.age || '—'],
                    ['Parent Phone', selectedStudent.parentPhone || '—']
                  ].map(([label, value]) => (
                    <div key={label} style={{
                      background: '#f8fafc', border: '1px solid #e2e8f0',
                      borderRadius: 10, padding: '10px 12px'
                    }}>
                      <div style={{
                        fontSize: 10, textTransform: 'uppercase',
                        letterSpacing: '0.06em', color: '#64748b', fontWeight: 700
                      }}>{label}</div>
                      <div style={{
                        fontSize: 13, color: '#1e3a5f',
                        fontWeight: 600, marginTop: 3, wordBreak: 'break-word'
                      }}>{value}</div>
                    </div>
                  ))}

                  <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                    <button
                      className="btn-primary"
                      onClick={() => { setSelectedStudent(null); handleEditClick(selectedStudent); }}
                      style={{ background: '#d97706', flex: 1 }}
                    >Edit</button>
                    <button
                      className="btn-primary"
                      onClick={() => setSelectedStudent(null)}
                      style={{ background: '#64748b', flex: 1 }}
                    >Close</button>
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
