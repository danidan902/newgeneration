// import React, { useState, useEffect } from 'react';
// import toast from 'react-hot-toast';
// import api from '../services/api';
// import Papa from 'papaparse';
// import * as XLSX from 'xlsx';
// import { ChevronDown, ChevronUp, Plus, Edit2, Trash2, Users, BookOpen, User, Mail, Phone, Calendar, Award, Eye, X, GraduationCap, Archive, RefreshCw, Search, AlertCircle, UserCog, ArrowLeft, FileSpreadsheet, Printer, ChevronLeft, Lock } from 'lucide-react';

// // ============================================
// // 🎯 REUSABLE COMPONENTS
// // ============================================

// const Avatar = ({ name, image, size = 40 }) => {
//   const [imageError, setImageError] = useState(false);

//   if (image && !imageError) {
//     return (
//       <img 
//         src={image} 
//         alt={name} 
//         className="rounded-full object-cover border-2 border-cyan-200"
//         style={{ width: size, height: size }}
//         onError={() => setImageError(true)}
//       />
//     );
//   }

//   const initials = name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
//   const colors = ['#0e7490', '#0891b2', '#06b6d4', '#22d3ee'];
//   const colorIndex = (name?.length || 0) % colors.length;
  
//   return (
//     <div 
//       className="rounded-full flex items-center justify-center font-bold text-white flex-shrink-0"
//       style={{ 
//         width: size, 
//         height: size,
//         background: colors[colorIndex],
//         fontSize: `${size * 0.4}px`,
//       }}
//     >
//       {initials}
//     </div>
//   );
// };

// const Badge = ({ text, color = 'blue' }) => {
//   const colorMap = {
//     blue: 'bg-cyan-100 text-cyan-700',
//     green: 'bg-green-100 text-green-700',
//     yellow: 'bg-yellow-100 text-yellow-700',
//     red: 'bg-red-100 text-red-700',
//     purple: 'bg-purple-100 text-purple-700',
//     gray: 'bg-gray-100 text-gray-700',
//   };

//   return (
//     <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${colorMap[color]}`}>
//       {text}
//     </span>
//   );
// };

// // ============================================
// // 📊 MAIN COMPONENT
// // ============================================

// const ManageClasses = ({ isSuperAdmin = false }) => {
//   const [classes, setClasses] = useState([]);
//   const [graduatedClasses, setGraduatedClasses] = useState([]);
//   const [teachers, setTeachers] = useState([]);
//   const [students, setStudents] = useState([]);
//   const [graduatedStudents, setGraduatedStudents] = useState([]);
//   const [showForm, setShowForm] = useState(false);
//   const [showEditForm, setShowEditForm] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [bulkLoading, setBulkLoading] = useState(false);
//   const [editingClass, setEditingClass] = useState(null);
//   const [editingStudent, setEditingStudent] = useState(null);
//   const [showEditStudentForm, setShowEditStudentForm] = useState(false);
//   const [showDetailModal, setShowDetailModal] = useState(false);
//   const [detailModalType, setDetailModalType] = useState('');
//   const [detailModalData, setDetailModalData] = useState(null);
//   const [formData, setFormData] = useState({ 
//     grade: '', 
//     section: '', 
//     subjects: [{ name: '', teacher: '' }], 
//     classTeacher: '', 
//     program: '' 
//   });
//   const [studentFormData, setStudentFormData] = useState({
//     name: '',
//     email: '',
//     rollNumber: '',
//     sex: '',
//     grade: '',
//     section: '',
//     programs: ''
//   });
//   const [bulkAssignData, setBulkAssignData] = useState({ classId: '', file: null });
//   const [expandedClass, setExpandedClass] = useState(null);
//   const [expandedGraduatedClass, setExpandedGraduatedClass] = useState(null);
//   const [showAssignModal, setShowAssignModal] = useState(false);
//   const [selectedClass, setSelectedClass] = useState(null);
//   const [selectedStudents, setSelectedStudents] = useState([]);
//   const [selectAll, setSelectAll] = useState(false);
//   const [gradeFilter, setGradeFilter] = useState('');
//   const [programFilter, setProgramFilter] = useState('');
//   const [showBulkAssign, setShowBulkAssign] = useState(false);
//   const [activeTab, setActiveTab] = useState('active');
  
//   // Search and Filter states
//   const [searchTerm, setSearchTerm] = useState('');
//   const [filterGrade, setFilterGrade] = useState('');
//   const [filterProgram, setFilterProgram] = useState('');
//   const [filterSection, setFilterSection] = useState('');
//   const [sortBy, setSortBy] = useState('newest');

//   // Duplicate class error state
//   const [duplicateError, setDuplicateError] = useState('');

//   // Teacher re-assignment modal
//   const [showTeacherAssignModal, setShowTeacherAssignModal] = useState(false);
//   const [teacherAssignData, setTeacherAssignData] = useState({
//     classId: null,
//     subjectIndex: null,
//     teacherId: ''
//   });

//   // ========== PAGINATION ==========
//   const [currentPage, setCurrentPage] = useState(1);
//   const [classesPerPage] = useState(5);
//   const [studentPage, setStudentPage] = useState({});
//   const [graduatedStudentPage, setGraduatedStudentPage] = useState({});
//   const [studentsPerPage] = useState(5);
//   const [graduatedClassPage, setGraduatedClassPage] = useState(1);
//   const [graduatedClassPerPage] = useState(5);
//   const [graduatedStudentListPage, setGraduatedStudentListPage] = useState(1);
//   const [graduatedStudentListPerPage] = useState(10);

//   const toggleDropdown = (classId) => {
//     setExpandedClass(expandedClass === classId ? null : classId);
//     if (expandedClass !== classId) {
//       setStudentPage(prev => ({ ...prev, [classId]: 1 }));
//     }
//   };

//   const toggleGraduatedDropdown = (classId) => {
//     setExpandedGraduatedClass(expandedGraduatedClass === classId ? null : classId);
//     if (expandedGraduatedClass !== classId) {
//       setGraduatedStudentPage(prev => ({ ...prev, [classId]: 1 }));
//     }
//   };

//   const addSubjectField = () => {
//     setFormData({
//       ...formData,
//       subjects: [...formData.subjects, { name: '', teacher: '' }]
//     });
//   };

//   const removeSubjectField = (index) => {
//     const newSubjects = formData.subjects.filter((_, i) => i !== index);
//     setFormData({ ...formData, subjects: newSubjects });
//   };

//   const handleSubjectChange = (index, field, value) => {
//     const newSubjects = [...formData.subjects];
//     newSubjects[index][field] = value;
//     setFormData({ ...formData, subjects: newSubjects });
//   };

//   useEffect(() => {
//     fetchAllData();
//   }, []);
  
//   const fetchAllData = async () => {
//     await fetchClasses();
//     await fetchTeachers();
//     await fetchStudents();
//   };

//   const fetchClasses = async () => {
//     try {
//       const studentsResponse = await api.get('/users/role/student');
//       const allStudents = studentsResponse.data;
      
//       const graduatedStudentsList = allStudents.filter(s => s.academicStatus === 'graduated' || s.grade === 'Graduated');
//       const activeStudentsList = allStudents.filter(s => s.academicStatus !== 'graduated' && s.grade !== 'Graduated');
      
//       setGraduatedStudents(graduatedStudentsList);
//       setStudents(activeStudentsList);
      
//       const response = await api.get('/classes/all');
//       if (response.data && Array.isArray(response.data)) {
//         const classesWithFullData = await Promise.all(response.data.map(async (cls) => {
//           if (cls.students && cls.students.length > 0) {
//             const fullStudents = cls.students.map(student => {
//               const studentId = student._id || student;
//               const fullStudent = allStudents.find(s => s._id === studentId);
//               return {
//                 ...(fullStudent || student),
//                 profileImage: fullStudent?.profileImage || student?.profileImage || null
//               };
//             });
            
//             return { ...cls, students: fullStudents };
//           }
//           return cls;
//         }));
        
//         const active = classesWithFullData
//           .filter(cls => cls.academicStatus !== 'Graduated')
//           .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
//         const graduated = classesWithFullData.filter(cls => cls.academicStatus === 'Graduated');
        
//         setClasses(active);
//         setGraduatedClasses(graduated);
//       } else {
//         setClasses([]);
//         setGraduatedClasses([]);
//       }
//     } catch (error) {
//       console.error('Fetch classes error:', error);
//       try {
//         const fallbackResponse = await api.get('/classes');
//         if (fallbackResponse.data && Array.isArray(fallbackResponse.data)) {
//           const classesWithFullData = await Promise.all(fallbackResponse.data.map(async (cls) => {
//             if (cls.students && cls.students.length > 0) {
//               const studentsResponse = await api.get('/users/role/student');
//               const allStudents = studentsResponse.data;
              
//               const fullStudents = cls.students.map(student => {
//                 const studentId = student._id || student;
//                 const fullStudent = allStudents.find(s => s._id === studentId);
//                 return {
//                   ...(fullStudent || student),
//                   profileImage: fullStudent?.profileImage || student?.profileImage || null
//                 };
//               });
              
//               return { ...cls, students: fullStudents };
//             }
//             return cls;
//           }));
          
//           const active = classesWithFullData
//             .filter(cls => cls.academicStatus !== 'graduated')
//             .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
//           const graduated = classesWithFullData.filter(cls => cls.academicStatus === 'graduated');
//           setClasses(active);
//           setGraduatedClasses(graduated);
//         }
//       } catch (fallbackError) {
//         if (fallbackError.response?.status === 403 || fallbackError.response?.status === 401) {
//           toast.error('Session expired. Please login again.');
//           localStorage.clear();
//           window.location.href = '/login';
//         } else {
//           toast.error('Failed to fetch classes');
//         }
//         setClasses([]);
//         setGraduatedClasses([]);
//       }
//     }
//   };

//   const isClassAlreadyOpen = (grade, section, excludeClassId = null) => {
//     return classes.some(cls => 
//       String(cls.grade) === String(grade) && 
//       cls.section?.toLowerCase() === section?.toLowerCase() &&
//       cls._id !== excludeClassId
//     );
//   };

//   const isStudentAlreadyAssigned = (studentId, currentClassId = null) => {
//     for (const cls of classes) {
//       if (currentClassId && cls._id === currentClassId) continue;
//       if (cls.students?.some(s => (s._id || s) === studentId)) {
//         return { assigned: true, className: `Grade ${cls.grade} - Section ${cls.section}` };
//       }
//     }
//     return { assigned: false, className: null };
//   };

//   const fetchTeachers = async () => {
//     try {
//       const response = await api.get('/users/role/teacher');
//       setTeachers(response.data);
//     } catch (error) {
//       toast.error('Failed to fetch teachers');
//     }
//   };
  
//   const fetchStudents = async () => {
//     try {
//       const response = await api.get('/users/role/student');
//       const allStudents = response.data;
      
//       const graduated = allStudents.filter(s => s.academicStatus === 'graduated' || s.grade === 'Graduated');
//       const active = allStudents.filter(s => s.academicStatus !== 'graduated' && s.grade !== 'Graduated');
      
//       setGraduatedStudents(graduated);
//       setStudents(active);
//     } catch (error) {
//       toast.error('Failed to fetch students');
//     }
//   };
  
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setDuplicateError('');
    
//     if (!formData.grade || !formData.section || !formData.program) {
//       toast.error('Please fill all required fields');
//       setLoading(false);
//       return;
//     }

//     if (isClassAlreadyOpen(formData.grade, formData.section)) {
//       setDuplicateError(`⚠️ Class Grade ${formData.grade} - Section ${formData.section} is already open! Cannot create duplicate class.`);
//       toast.error(`Class Grade ${formData.grade} - Section ${formData.section} is already open`);
//       setLoading(false);
//       return;
//     }

//     const validSubjects = formData.subjects.filter(sub => sub.name && sub.teacher);
    
//     if (validSubjects.length === 0) {
//       toast.error('Please add at least one subject with teacher');
//       setLoading(false);
//       return;
//     }
    
//     const submitData = {
//       grade: formData.grade,
//       section: formData.section,
//       program: formData.program,
//       classTeacher: formData.classTeacher || null,
//       subjects: validSubjects,
//       academicStatus: 'Active'
//     };
    
//     try {
//       const response = await api.post('/classes', submitData);
//       toast.success('Class created successfully');
//       setFormData({ 
//         grade: '', 
//         section: '', 
//         subjects: [{ name: '', teacher: '' }], 
//         classTeacher: '', 
//         program: '' 
//       });
//       setShowForm(false);
//       await fetchClasses();
//       setCurrentPage(1);
//     } catch (error) {
//       console.error('Create class error:', error);
//       if (error.response?.data?.error?.includes('duplicate') || error.response?.data?.error?.includes('already exists')) {
//         setDuplicateError(`⚠️ Class Grade ${formData.grade} - Section ${formData.section} is already open!`);
//         toast.error(`Class Grade ${formData.grade} - Section ${formData.section} is already open`);
//       } else {
//         toast.error(error.response?.data?.error || 'Failed to create class');
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleEdit = (cls) => {
//     const classId = cls._id || cls.id;
    
//     setEditingClass({ ...cls, _id: classId });
//     setFormData({
//       grade: cls.grade || '',
//       section: cls.section || '',
//       subjects: cls.subjects?.map(sub => ({ 
//         name: sub.name || '', 
//         teacher: sub.teacher?._id || sub.teacher || '' 
//       })) || [{ name: '', teacher: '' }],
//       classTeacher: cls.classTeacher?._id || cls.classTeacher || '',
//       program: cls.program || ''
//     });
//     setDuplicateError('');
//     setShowEditForm(true);
//     setShowForm(false);
//   };

//   const handleUpdate = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setDuplicateError('');
    
//     if (!formData.grade || !formData.section || !formData.program) {
//       toast.error('Please fill all required fields');
//       setLoading(false);
//       return;
//     }

//     if (isClassAlreadyOpen(formData.grade, formData.section, editingClass?._id)) {
//       setDuplicateError(`⚠️ Class Grade ${formData.grade} - Section ${formData.section} is already open! Cannot update to duplicate class.`);
//       toast.error(`Class Grade ${formData.grade} - Section ${formData.section} is already open`);
//       setLoading(false);
//       return;
//     }

//     const validSubjects = formData.subjects.filter(sub => sub.name && sub.teacher);
    
//     if (validSubjects.length === 0) {
//       toast.error('Please add at least one subject with teacher');
//       setLoading(false);
//       return;
//     }
    
//     const updateData = {
//       grade: formData.grade,
//       section: formData.section,
//       program: formData.program,
//       classTeacher: formData.classTeacher || null,
//       subjects: validSubjects
//     };
    
//     try {
//       await api.put(`/classes/${editingClass._id}`, updateData);
//       toast.success('Class updated successfully');
//       setShowEditForm(false);
//       setEditingClass(null);
//       setFormData({ 
//         grade: '', 
//         section: '', 
//         subjects: [{ name: '', teacher: '' }], 
//         classTeacher: '', 
//         program: '' 
//       });
//       await fetchClasses();
//     } catch (error) {
//       console.error('Update class error:', error);
//       if (error.response?.data?.error?.includes('duplicate') || error.response?.data?.error?.includes('already exists')) {
//         setDuplicateError(`⚠️ Class Grade ${formData.grade} - Section ${formData.section} is already open!`);
//         toast.error(`Class Grade ${formData.grade} - Section ${formData.section} is already open`);
//       } else {
//         toast.error(error.response?.data?.error || 'Failed to update class');
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   const hasGradeOrSectionChanged = () => {
//     if (!editingClass) return false;
//     return String(formData.grade) !== String(editingClass.grade) || 
//            String(formData.section) !== String(editingClass.section);
//   };

//   const isUpdateDisabled = () => {
//     if (loading) return true;
//     if (!formData.grade || !formData.section || !formData.program) return true;
    
//     if (hasGradeOrSectionChanged()) {
//       return isClassAlreadyOpen(formData.grade, formData.section, editingClass?._id);
//     }
    
//     return false;
//   };

//   const handleTeacherAssign = (classId, subjectIndex) => {
//     const cls = classes.find(c => c._id === classId);
//     if (!cls) return;
    
//     const subject = cls.subjects?.[subjectIndex];
//     if (!subject) return;
    
//     setTeacherAssignData({
//       classId: classId,
//       subjectIndex: subjectIndex,
//       teacherId: subject.teacher?._id || subject.teacher || ''
//     });
//     setShowTeacherAssignModal(true);
//   };

//   const handleTeacherReassign = async () => {
//     if (!teacherAssignData.classId || teacherAssignData.subjectIndex === null) {
//       toast.error('Invalid data');
//       return;
//     }

//     if (!teacherAssignData.teacherId) {
//       toast.error('Please select a teacher');
//       return;
//     }

//     setLoading(true);
//     try {
//       const cls = classes.find(c => c._id === teacherAssignData.classId);
//       if (!cls) {
//         toast.error('Class not found');
//         setLoading(false);
//         return;
//       }

//       const updatedSubjects = cls.subjects.map((sub, index) => {
//         if (index === teacherAssignData.subjectIndex) {
//           return { ...sub, teacher: teacherAssignData.teacherId };
//         }
//         return sub;
//       });

//       await api.put(`/classes/${teacherAssignData.classId}`, {
//         ...cls,
//         subjects: updatedSubjects
//       });

//       toast.success('Teacher reassigned successfully!');
//       setShowTeacherAssignModal(false);
//       setTeacherAssignData({
//         classId: null,
//         subjectIndex: null,
//         teacherId: ''
//       });
//       await fetchClasses();
//     } catch (error) {
//       console.error('Teacher reassign error:', error);
//       toast.error(error.response?.data?.error || 'Failed to reassign teacher');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleEditStudent = (student) => {
//     setEditingStudent(student);
//     setStudentFormData({
//       name: student.name || '',
//       email: student.email || '',
//       rollNumber: student.rollNumber || '',
//       sex: student.sex || '',
//       grade: student.grade || '',
//       section: student.section || student.classSection || student.class || '',
//       programs: student.programs || ''
//     });
//     setShowEditStudentForm(true);
//   };

//   const handleUpdateStudent = async (e) => {
//     e.preventDefault();
//     setLoading(true);
    
//     try {
//       await api.put(`/users/${editingStudent._id}`, studentFormData);
//       toast.success('Student updated successfully');
//       setShowEditStudentForm(false);
//       setEditingStudent(null);
//       setStudentFormData({
//         name: '',
//         email: '',
//         rollNumber: '',
//         sex: '',
//         grade: '',
//         section: '',
//         programs: ''
//       });
//       await fetchStudents();
//       await fetchClasses();
//     } catch (error) {
//       console.error('Update student error:', error);
//       toast.error(error.response?.data?.error || 'Failed to update student');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const openClassDetail = (cls) => {
//     setDetailModalType('class');
//     setDetailModalData(cls);
//     setShowDetailModal(true);
//   };

//   const openStudentDetail = (student) => {
//     setDetailModalType('student');
//     setDetailModalData(student);
//     setShowDetailModal(true);
//   };

//   const openTeacherDetail = (teacher) => {
//     setDetailModalType('teacher');
//     setDetailModalData(teacher);
//     setShowDetailModal(true);
//   };
  
//   const handleRemoveStudent = async (classId, studentId) => {
//     if (!window.confirm('Are you sure you want to remove this student from the class?')) return;
    
//     setLoading(true);
//     try {
//       await api.post('/classes/bulk-remove-students', {
//         classId: classId,
//         studentIds: [studentId]
//       });
      
//       toast.success('Student removed from class successfully');
//       await fetchClasses();
//     } catch (error) {
//       console.error('Remove student error:', error);
//       toast.error(error.response?.data?.message || 'Failed to remove student');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleRemoveMultipleStudents = async (classId, studentIds) => {
//     if (!window.confirm(`Are you sure you want to remove ${studentIds.length} student(s) from this class?`)) return;
    
//     setLoading(true);
//     try {
//       await api.post('/classes/bulk-remove-students', {
//         classId: classId,
//         studentIds: studentIds
//       });
      
//       toast.success(`Removed ${studentIds.length} student(s) from class`);
//       await fetchClasses();
//     } catch (error) {
//       console.error('Bulk remove error:', error);
//       toast.error('Failed to remove students');
//     } finally {
//       setLoading(false);
//     }
//   };
  
//   const handleBulkAssign = async (e) => {
//     e.preventDefault();
//     if (!bulkAssignData.classId || !bulkAssignData.file) {
//       toast.error('Please select a class and file');
//       return;
//     }
    
//     setBulkLoading(true);
//     const file = bulkAssignData.file;
//     const fileType = file.name.split('.').pop().toLowerCase();
    
//     const processAssignments = async (studentsList) => {
//       let successCount = 0;
//       let errorCount = 0;
//       const errors = [];
      
//       const selectedClassData = classes.find(c => c._id === bulkAssignData.classId);
      
//       for (const studentItem of studentsList) {
//         const rollNumber = studentItem.rollNumber || studentItem.rollnumber || studentItem.roll_no;
        
//         if (!rollNumber) {
//           errorCount++;
//           errors.push('Missing roll number');
//           continue;
//         }
        
//         const student = students.find(s => String(s.rollNumber) === String(rollNumber));
        
//         if (!student) {
//           errorCount++;
//           errors.push(`Student with roll number ${rollNumber} not found`);
//           continue;
//         }
        
//         const studentSection = student.section || student.classSection || student.class;
//         const classSection = selectedClassData?.section;
        
//         const alreadyAssigned = isStudentAlreadyAssigned(student._id, selectedClassData?._id);
//         if (alreadyAssigned.assigned) {
//           errorCount++;
//           errors.push(`${rollNumber}: Student ${student.name} is already assigned to class ${alreadyAssigned.className}`);
//           continue;
//         }
        
//         if (selectedClassData && studentSection && classSection && studentSection !== classSection) {
//           errorCount++;
//           errors.push(`${rollNumber}: Student from section "${studentSection}" cannot be assigned to class section "${classSection}"`);
//           continue;
//         }
        
//         try {
//           await api.post('/classes/add-student', {
//             classId: bulkAssignData.classId,
//             studentId: student._id
//           });
//           successCount++;
//         } catch (error) {
//           errorCount++;
//           errors.push(`${rollNumber}: ${error.response?.data?.error || error.message}`);
//         }
//       }
      
//       if (successCount > 0) {
//         toast.success(`Successfully assigned ${successCount} students`);
//         fetchClasses();
//       }
      
//       if (errorCount > 0) {
//         toast.error(`Failed to assign ${errorCount} students`);
//         console.error('Bulk assignment errors:', errors);
//       }
      
//       setBulkLoading(false);
//       setShowBulkAssign(false);
//       setBulkAssignData({ classId: '', file: null });
//     };
    
//     if (fileType === 'csv') {
//       Papa.parse(file, {
//         header: true,
//         complete: async (results) => {
//           await processAssignments(results.data);
//         },
//         error: () => {
//           toast.error('Error parsing CSV file');
//           setBulkLoading(false);
//         }
//       });
//     } else if (fileType === 'xlsx' || fileType === 'xls') {
//       const reader = new FileReader();
//       reader.onload = async (e) => {
//         const data = new Uint8Array(e.target.result);
//         const workbook = XLSX.read(data, { type: 'array' });
//         const sheetName = workbook.SheetNames[0];
//         const worksheet = workbook.Sheets[sheetName];
//         const jsonData = XLSX.utils.sheet_to_json(worksheet);
//         await processAssignments(jsonData);
//       };
//       reader.readAsArrayBuffer(file);
//     } else {
//       toast.error('Please upload CSV or Excel file');
//       setBulkLoading(false);
//     }
//   };
  
//   const handleDelete = async (id) => {
//     if (window.confirm('Are you sure you want to delete this class?')) {
//       try {
//         await api.delete(`/classes/${id}`);
//         toast.success('Class deleted successfully');
//         await fetchClasses();
//       } catch (error) {
//         console.error('Delete class error:', error);
//         toast.error('Failed to delete class');
//       }
//     }
//   };
  
//   const handleMarkClassAsGraduated = async (cls) => {
//     if (String(cls.grade) !== '12') {
//       toast.error('Only Grade 12 classes can be marked as graduated');
//       return;
//     }
    
//     if (!window.confirm(`Are you sure you want to mark Grade ${cls.grade} - Section ${cls.section} as graduated? This will move it to graduated classes.`)) return;
    
//     setLoading(true);
//     try {
//       await api.put(`/classes/${cls._id}/graduate`);
//       toast.success(`Class Grade ${cls.grade} - Section ${cls.section} marked as graduated`);
//       await fetchAllData();
//     } catch (error) {
//       console.error('Error marking class as graduated:', error);
//       toast.error(error.response?.data?.error || 'Failed to mark class as graduated');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleRestoreGraduatedClass = async (cls) => {
//     if (!window.confirm(`Are you sure you want to restore Grade ${cls.grade} - Section ${cls.section} as an active class?`)) return;
    
//     setLoading(true);
//     try {
//       await api.put(`/classes/${cls._id}/restore`);
//       toast.success(`Class Grade ${cls.grade} - Section ${cls.section} restored to active classes`);
//       await fetchAllData();
//     } catch (error) {
//       console.error('Error restoring class:', error);
//       toast.error('Failed to restore class');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getAvailableStudents = (classId) => {
//     const currentClass = classes.find(c => c._id === classId);
//     if (!currentClass) return [];
    
//     const enrolledStudentIds = currentClass.students?.map(s => s._id) || [];
//     const classSection = currentClass.section;
    
//     return students.filter(s => {
//       if (enrolledStudentIds.includes(s._id)) return false;
      
//       const assignedToOther = isStudentAlreadyAssigned(s._id, classId);
//       if (assignedToOther.assigned) return false;
      
//       if (s.academicStatus === 'graduated' || s.grade === 'Graduated') return false;
      
//       const studentSection = s.section || s.classSection || s.class || '';
//       if (studentSection && classSection) {
//         if (studentSection.toLowerCase() !== classSection.toLowerCase()) {
//           return false;
//         }
//       } else {
//         if (studentSection || classSection) {
//           return false;
//         }
//       }
      
//       return true;
//     });
//   };

//   const handleMultiSelect = (studentId) => {
//     if (selectedStudents.includes(studentId)) {
//       setSelectedStudents(selectedStudents.filter(id => id !== studentId));
//     } else {
//       setSelectedStudents([...selectedStudents, studentId]);
//     }
//   };

//   const handleSelectAll = () => {
//     if (selectAll) {
//       setSelectedStudents([]);
//     } else {
//       const availableStudents = getAvailableStudents(selectedClass?._id);
//       setSelectedStudents(availableStudents.map(s => s._id));
//     }
//     setSelectAll(!selectAll);
//   };

//   const handleMultiAssign = async () => {
//     if (!selectedClass || selectedStudents.length === 0) {
//       toast.error('Please select at least one student');
//       return;
//     }
    
//     const invalidStudents = [];
//     const alreadyAssignedStudents = [];
//     const validStudents = [];
    
//     for (const studentId of selectedStudents) {
//       const student = students.find(s => s._id === studentId);
//       const studentSection = student?.section || student?.classSection || student?.class || '';
//       const classSection = selectedClass.section || '';
      
//       const alreadyAssigned = isStudentAlreadyAssigned(studentId, selectedClass._id);
//       if (alreadyAssigned.assigned) {
//         alreadyAssignedStudents.push({ student, className: alreadyAssigned.className });
//         continue;
//       }
      
//       if (student && studentSection && classSection && studentSection.toLowerCase() !== classSection.toLowerCase()) {
//         invalidStudents.push(student);
//         continue;
//       }
      
//       validStudents.push(studentId);
//     }
    
//     if (invalidStudents.length > 0) {
//       toast.error(`${invalidStudents.length} student(s) cannot be assigned because they are from different sections`);
//     }
    
//     if (alreadyAssignedStudents.length > 0) {
//       toast.error(`${alreadyAssignedStudents.length} student(s) are already assigned to another class`);
//     }
    
//     if (validStudents.length === 0) {
//       setLoading(false);
//       return;
//     }
    
//     setLoading(true);
//     let successCount = 0;
//     let failCount = 0;
    
//     for (const studentId of validStudents) {
//       try {
//         await api.post('/classes/add-student', {
//           classId: selectedClass._id,
//           studentId: studentId
//         });
//         successCount++;
//       } catch (error) {
//         console.error(`Failed to assign student ${studentId}:`, error);
//         failCount++;
//       }
//     }
    
//     if (successCount > 0) {
//       toast.success(`Successfully assigned ${successCount} student(s)`);
//       fetchClasses();
//     }
    
//     if (failCount > 0) {
//       toast.error(`Failed to assign ${failCount} student(s)`);
//     }
    
//     setShowAssignModal(false);
//     setSelectedClass(null);
//     setSelectedStudents([]);
//     setSelectAll(false);
//     setLoading(false);
//   };

//   const handleMarkAsGraduated = async (student) => {
//     if (!window.confirm(`Are you sure you want to mark ${student.name} as graduated? This will remove them from all classes.`)) return;
    
//     setLoading(true);
//     try {
//       for (const cls of classes) {
//         if (cls.students?.some(s => s._id === student._id)) {
//           await api.post('/classes/bulk-remove-students', {
//             classId: cls._id,
//             studentIds: [student._id]
//           });
//         }
//       }
      
//       await api.put(`/users/${student._id}`, { ...student, academicStatus: 'graduated', grade: 'Graduated' });
      
//       toast.success(`${student.name} marked as graduated`);
//       await fetchStudents();
//       await fetchClasses();
//     } catch (error) {
//       console.error('Error marking as graduated:', error);
//       toast.error('Failed to mark student as graduated');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleRestoreFromGraduated = async (student) => {
//     if (!window.confirm(`Are you sure you want to restore ${student.name} as an active student?`)) return;
    
//     setLoading(true);
//     try {
//       await api.put(`/users/${student._id}`, { ...student, academicStatus: 'Active', grade: '12' });
//       toast.success(`${student.name} restored as active student`);
//       await fetchStudents();
//       await fetchClasses();
//     } catch (error) {
//       console.error('Error restoring student:', error);
//       toast.error('Failed to restore student');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const isGrade12 = (grade) => {
//     return String(grade) === '12';
//   };

//   const getFilteredAndSortedClasses = () => {
//     let filtered = [...classes];
    
//     if (searchTerm) {
//       const term = searchTerm.toLowerCase();
//       filtered = filtered.filter(cls => 
//         cls.grade?.toString().toLowerCase().includes(term) ||
//         cls.section?.toLowerCase().includes(term) ||
//         cls.program?.toLowerCase().includes(term) ||
//         cls.classTeacher?.name?.toLowerCase().includes(term)
//       );
//     }
    
//     if (filterGrade) {
//       filtered = filtered.filter(cls => String(cls.grade) === String(filterGrade));
//     }
    
//     if (filterProgram) {
//       filtered = filtered.filter(cls => cls.program === filterProgram);
//     }
    
//     if (filterSection) {
//       filtered = filtered.filter(cls => cls.section?.toLowerCase().includes(filterSection.toLowerCase()));
//     }
    
//     if (sortBy === 'newest') {
//       filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
//     } else if (sortBy === 'oldest') {
//       filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
//     } else if (sortBy === 'grade') {
//       filtered.sort((a, b) => Number(a.grade) - Number(b.grade));
//     }
    
//     return filtered;
//   };

//   const filteredActiveClasses = getFilteredAndSortedClasses();

//   const indexOfLastClass = currentPage * classesPerPage;
//   const indexOfFirstClass = indexOfLastClass - classesPerPage;
//   const currentClasses = filteredActiveClasses.slice(indexOfFirstClass, indexOfLastClass);
//   const totalPages = Math.ceil(filteredActiveClasses.length / classesPerPage);

//   const indexOfLastGClass = graduatedClassPage * graduatedClassPerPage;
//   const indexOfFirstGClass = indexOfLastGClass - graduatedClassPerPage;
//   const currentGraduatedClasses = graduatedClasses.slice(indexOfFirstGClass, indexOfLastGClass);
//   const totalGClassPages = Math.ceil(graduatedClasses.length / graduatedClassPerPage);

//   const indexOfLastGStudent = graduatedStudentListPage * graduatedStudentListPerPage;
//   const indexOfFirstGStudent = indexOfLastGStudent - graduatedStudentListPerPage;
//   const currentGraduatedStudents = graduatedStudents.slice(indexOfFirstGStudent, indexOfLastGStudent);
//   const totalGStudentPages = Math.ceil(graduatedStudents.length / graduatedStudentListPerPage);

//   const getCurrentStudents = (classId) => {
//     const cls = classes.find(c => c._id === classId);
//     if (!cls || !cls.students) return [];
//     const activeStudentsInClass = cls.students.filter(s => s.academicStatus !== 'graduated' && s.grade !== 'Graduated');
//     const currentStudentPage = studentPage[classId] || 1;
//     const indexOfLastStudent = currentStudentPage * studentsPerPage;
//     const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
//     return activeStudentsInClass.slice(indexOfFirstStudent, indexOfLastStudent);
//   };

//   const getTotalStudentPages = (classId) => {
//     const cls = classes.find(c => c._id === classId);
//     if (!cls || !cls.students) return 1;
//     const activeCount = cls.students.filter(s => s.academicStatus !== 'graduated' && s.grade !== 'Graduated').length;
//     return Math.ceil(activeCount / studentsPerPage);
//   };

//   const getGraduatedClassStudents = (classId) => {
//     const cls = graduatedClasses.find(c => c._id === classId);
//     if (!cls || !cls.students) return [];
    
//     const studentsWithFullData = cls.students.map(student => {
//       const studentId = student._id || student;
//       const fullStudent = graduatedStudents.find(s => s._id === studentId);
//       if (fullStudent) {
//         return fullStudent;
//       }
//       const activeStudent = students.find(s => s._id === studentId);
//       if (activeStudent && (activeStudent.academicStatus === 'graduated' || activeStudent.grade === 'Graduated')) {
//         return activeStudent;
//       }
//       return student;
//     });
    
//     const currentPageNum = graduatedStudentPage[classId] || 1;
//     const indexOfLast = currentPageNum * studentsPerPage;
//     const indexOfFirst = indexOfLast - studentsPerPage;
//     return studentsWithFullData.slice(indexOfFirst, indexOfLast);
//   };

//   const getTotalGraduatedClassStudentPages = (classId) => {
//     const cls = graduatedClasses.find(c => c._id === classId);
//     if (!cls || !cls.students) return 1;
//     return Math.ceil(cls.students.length / studentsPerPage);
//   };

//   const clearFilters = () => {
//     setSearchTerm('');
//     setFilterGrade('');
//     setFilterProgram('');
//     setFilterSection('');
//     setSortBy('newest');
//     setCurrentPage(1);
//   };

//   return (
//     <div className="max-w-full mx-auto p-4 md:p-6">
//       <style>{`
//         .manage-container { animation: fadeIn 0.5s ease-out; }
//         @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
//         .manage-header {
//           background: linear-gradient(135deg, #0e7490 0%, #0891b2 50%, #22d3ee 100%);
//           color: white;
//           padding: 30px;
//           border-radius: 15px;
//           margin-bottom: 30px;
//           box-shadow: 0 10px 40px rgba(8, 145, 178, 0.3);
//         }
//         .stats-grid {
//           display: grid;
//           grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
//           gap: 16px;
//           margin-bottom: 24px;
//         }
//         .stat-card {
//           background: white;
//           padding: 18px;
//           border-radius: 12px;
//           box-shadow: 0 4px 15px rgba(0,0,0,0.06);
//           text-align: center;
//           border-top: 4px solid #0891b2;
//           border: 1px solid #e2e8f0;
//           transition: all 0.3s;
//         }
//         .stat-card:hover {
//           transform: translateY(-2px);
//           box-shadow: 0 8px 25px rgba(8, 145, 178, 0.12);
//         }
//         .stat-value { font-size: 26px; font-weight: 700; color: #0e7490; margin: 6px 0; }
//         .stat-label { font-size: 11px; color: #999; text-transform: uppercase; letter-spacing: 0.5px; }
//         .filter-box {
//           background: white;
//           border: 1px solid #e2e8f0;
//           border-radius: 12px;
//           padding: 20px;
//           margin-bottom: 24px;
//         }
//         .class-card {
//           background: white;
//           border: 1px solid #e2e8f0;
//           border-radius: 12px;
//           padding: 20px;
//           transition: all 0.3s;
//           box-shadow: 0 4px 15px rgba(0,0,0,0.06);
//         }
//         .class-card:hover {
//           box-shadow: 0 8px 25px rgba(8, 145, 178, 0.12);
//           border-color: #0891b2;
//         }
//         .table-container {
//           background: white;
//           border: 1px solid #e2e8f0;
//           border-radius: 12px;
//           overflow: hidden;
//         }
//         .table-header {
//           background: linear-gradient(135deg, #0e7490, #0891b2);
//           color: white;
//         }
//         .table-header th {
//           padding: 12px 16px;
//           text-align: left;
//           font-weight: 600;
//           font-size: 13px;
//           border: 1px solid #0c6a82;
//         }
//         .table-row td {
//           padding: 10px 16px;
//           border: 1px solid #e2e8f0;
//           font-size: 13px;
//         }
//         .table-row:nth-child(even) td {
//           background: #f8fafc;
//         }
//         .table-row:hover td {
//           background: #f0f9ff;
//         }
//         .btn-primary {
//           background: linear-gradient(135deg, #0e7490, #0891b2);
//           color: white;
//           transition: all 0.3s;
//         }
//         .btn-primary:hover {
//           transform: translateY(-2px);
//           box-shadow: 0 6px 20px rgba(8, 145, 178, 0.3);
//         }
//         .btn-secondary {
//           background: #e2e8f0;
//           color: #475569;
//           transition: all 0.3s;
//         }
//         .btn-secondary:hover {
//           background: #cbd5e1;
//         }
//         .btn-danger {
//           background: #ef4444;
//           color: white;
//           transition: all 0.3s;
//         }
//         .btn-danger:hover {
//           background: #dc2626;
//           transform: translateY(-2px);
//         }
//         .btn-success {
//           background: #10b981;
//           color: white;
//           transition: all 0.3s;
//         }
//         .btn-success:hover {
//           background: #059669;
//           transform: translateY(-2px);
//         }
//         .btn-warning {
//           background: #f59e0b;
//           color: white;
//           transition: all 0.3s;
//         }
//         .btn-warning:hover {
//           background: #d97706;
//           transform: translateY(-2px);
//         }
//         .tab-btn {
//           padding: 10px 20px;
//           border-radius: 8px 8px 0 0;
//           font-weight: 600;
//           font-size: 14px;
//           transition: all 0.3s;
//           border: none;
//           cursor: pointer;
//         }
//         .tab-btn-active {
//           background: white;
//           color: #0e7490;
//           border-bottom: 3px solid #0e7490;
//         }
//         .tab-btn-inactive {
//           background: transparent;
//           color: #6b7280;
//           border-bottom: 3px solid transparent;
//         }
//         .tab-btn-inactive:hover {
//           color: #1f2937;
//           background: #f3f4f6;
//         }
//         .badge-program {
//           padding: 4px 12px;
//           border-radius: 20px;
//           font-size: 11px;
//           font-weight: 600;
//         }
//         .badge-social { background: #fef3c7; color: #d97706; }
//         .badge-natural { background: #d1fae5; color: #059669; }
//         .badge-graduated { background: #ede9fe; color: #7c3aed; }
//         .badge-active { background: #dbeafe; color: #2563eb; }
//       `}</style>

//       <div className="manage-container">
//         {/* Header */}
//         <div className="manage-header">
//           <div className="flex flex-wrap justify-between items-center gap-4">
//             <div>
//               <h1 className="text-2xl md:text-3xl font-bold">📚 Manage Classes</h1>
//               <p className="text-cyan-100 mt-1">View and manage all classes and student enrollments</p>
//             </div>
//             {activeTab === 'active' && (
//               <button
//                 onClick={() => {
//                   setShowEditForm(false);
//                   setShowForm(!showForm);
//                   setEditingClass(null);
//                   setDuplicateError('');
//                 }}
//                 className="btn-primary px-6 py-3 rounded-lg font-semibold flex items-center gap-2 shadow-lg"
//               >
//                 <Plus size={20} /> {showForm ? 'Cancel' : 'Add New Class'}
//               </button>
//             )}
//           </div>
//         </div>

//         {/* Tabs */}
//         <div className="flex gap-1 mb-6 border-b border-gray-200">
//           <button
//             onClick={() => {
//               setActiveTab('active');
//               setCurrentPage(1);
//               setExpandedClass(null);
//               clearFilters();
//             }}
//             className={`tab-btn ${activeTab === 'active' ? 'tab-btn-active' : 'tab-btn-inactive'}`}
//           >
//             <BookOpen size={18} className="inline mr-2" />
//             Active Classes
//             <span className="ml-2 bg-cyan-100 text-cyan-800 px-2 py-0.5 rounded-full text-xs">{classes.length}</span>
//           </button>
//           <button
//             onClick={() => {
//               setActiveTab('graduated');
//               setGraduatedClassPage(1);
//               setExpandedGraduatedClass(null);
//             }}
//             className={`tab-btn ${activeTab === 'graduated' ? 'tab-btn-active' : 'tab-btn-inactive'}`}
//           >
//             <Archive size={18} className="inline mr-2" />
//             Graduated Classes
//             <span className="ml-2 bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full text-xs">{graduatedClasses.length}</span>
//           </button>
//         </div>

//         {/* Create Class Form */}
//         {activeTab === 'active' && showForm && (
//           <div className="mb-8 bg-white rounded-xl shadow-xl p-6 sm:p-8 border-l-4 border-cyan-600">
//             <h3 className="text-2xl font-bold mb-6 text-gray-800">Create New Class</h3>
            
//             {duplicateError && (
//               <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-center gap-3">
//                 <AlertCircle size={20} className="text-red-600" />
//                 <span className="text-red-700 font-semibold">{duplicateError}</span>
//                 <button onClick={() => setDuplicateError('')} className="ml-auto text-red-600 hover:text-red-800">
//                   <X size={18} />
//                 </button>
//               </div>
//             )}
            
//             <form onSubmit={handleSubmit}>
//               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
//                 <div>
//                   <label className="block text-sm font-semibold text-gray-700 mb-2">Grade <span className="text-red-500">*</span></label>
//                   <input
//                     type="text"
//                     placeholder="e.g., 9, 10, 11, 12"
//                     value={formData.grade}
//                     onChange={(e) => {
//                       setFormData({ ...formData, grade: e.target.value });
//                       if (duplicateError) setDuplicateError('');
//                     }}
//                     className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-cyan-500 focus:outline-none transition"
//                     required
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-semibold text-gray-700 mb-2">Section <span className="text-red-500">*</span></label>
//                   <input
//                     type="text"
//                     placeholder="e.g., A, B, C"
//                     value={formData.section}
//                     onChange={(e) => {
//                       setFormData({ ...formData, section: e.target.value });
//                       if (duplicateError) setDuplicateError('');
//                     }}
//                     className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-cyan-500 focus:outline-none transition"
//                     required
//                   />
//                   {formData.grade && formData.section && isClassAlreadyOpen(formData.grade, formData.section) && (
//                     <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
//                       <AlertCircle size={12} /> Class already exists!
//                     </p>
//                   )}
//                 </div>
//                 <div>
//                   <label className="block text-sm font-semibold text-gray-700 mb-2">Program <span className="text-red-500">*</span></label>
//                   <select
//                     value={formData.program}
//                     onChange={(e) => setFormData({ ...formData, program: e.target.value })}
//                     className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-cyan-500 focus:outline-none transition"
//                     required
//                   >
//                     <option value="">Select Program</option>
//                     <option value="Social">Social Sciences</option>
//                     <option value="Natural">Natural Sciences</option>
//                   </select>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-semibold text-gray-700 mb-2">Class Teacher</label>
//                   <select
//                     value={formData.classTeacher}
//                     onChange={(e) => setFormData({ ...formData, classTeacher: e.target.value })}
//                     className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-cyan-500 focus:outline-none transition"
//                   >
//                     <option value="">Select Teacher</option>
//                     {teachers.map(teacher => (
//                       <option key={teacher._id} value={teacher._id}>{teacher.name}</option>
//                     ))}
//                   </select>
//                 </div>
//               </div>
              
//               <div className="mb-6">
//                 <div className="flex justify-between items-center mb-4">
//                   <label className="block text-sm font-semibold text-gray-700">Subjects & Teachers <span className="text-red-500">*</span></label>
//                   <button
//                     type="button"
//                     onClick={addSubjectField}
//                     className="btn-success px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2"
//                   >
//                     <Plus size={16} /> Add Subject
//                   </button>
//                 </div>
//                 {formData.subjects.map((subject, index) => (
//                   <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 border-2 border-gray-200 rounded-lg bg-gray-50">
//                     <div>
//                       <label className="block text-xs font-semibold text-gray-600 mb-2">Subject Name</label>
//                       <input
//                         type="text"
//                         placeholder="e.g., Mathematics"
//                         value={subject.name}
//                         onChange={(e) => handleSubjectChange(index, 'name', e.target.value)}
//                         className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-cyan-500 focus:outline-none transition"
//                         required
//                       />
//                     </div>
//                     <div className="flex gap-2">
//                       <div className="flex-1">
//                         <label className="block text-xs font-semibold text-gray-600 mb-2">Subject Teacher</label>
//                         <select
//                           value={subject.teacher}
//                           onChange={(e) => handleSubjectChange(index, 'teacher', e.target.value)}
//                           className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-cyan-500 focus:outline-none transition"
//                           required
//                         >
//                           <option value="">Select Teacher</option>
//                           {teachers.map(teacher => (
//                             <option key={teacher._id} value={teacher._id}>{teacher.name}</option>
//                           ))}
//                         </select>
//                       </div>
//                       {formData.subjects.length > 1 && (
//                         <button
//                           type="button"
//                           onClick={() => removeSubjectField(index)}
//                           className="btn-danger px-4 py-3 rounded-lg text-sm font-semibold mt-6"
//                         >
//                           <Trash2 size={16} />
//                         </button>
//                       )}
//                     </div>
//                   </div>
//                 ))}
//               </div>
              
//               <div className="flex gap-3">
//                 <button 
//                   type="submit" 
//                   disabled={loading || (formData.grade && formData.section && isClassAlreadyOpen(formData.grade, formData.section))} 
//                   className={`btn-primary px-6 py-3 rounded-lg font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`}
//                 >
//                   {loading ? 'Creating...' : <><Plus size={18} /> Create Class</>}
//                 </button>
//                 <button 
//                   type="button" 
//                   onClick={() => {
//                     setShowForm(false);
//                     setDuplicateError('');
//                   }} 
//                   className="btn-secondary px-6 py-3 rounded-lg font-semibold"
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </form>
//           </div>
//         )}

//         {/* Edit Class Form */}
//         {activeTab === 'active' && showEditForm && editingClass && (
//           <div className="mb-8 bg-white rounded-xl shadow-xl p-6 sm:p-8 border-l-4 border-yellow-500">
//             <h3 className="text-2xl font-bold mb-6 text-gray-800">Edit Class</h3>
            
//             {duplicateError && (
//               <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-center gap-3">
//                 <AlertCircle size={20} className="text-red-600" />
//                 <span className="text-red-700 font-semibold">{duplicateError}</span>
//                 <button onClick={() => setDuplicateError('')} className="ml-auto text-red-600 hover:text-red-800">
//                   <X size={18} />
//                 </button>
//               </div>
//             )}
            
//             <form onSubmit={handleUpdate}>
//               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
//                 <div>
//                   <label className="block text-sm font-semibold text-gray-700 mb-2">Grade <span className="text-red-500">*</span></label>
//                   <input
//                     type="text"
//                     value={formData.grade}
//                     onChange={(e) => {
//                       setFormData({ ...formData, grade: e.target.value });
//                       if (duplicateError) setDuplicateError('');
//                     }}
//                     className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-yellow-500 focus:outline-none transition"
//                     required
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-semibold text-gray-700 mb-2">Section <span className="text-red-500">*</span></label>
//                   <input
//                     type="text"
//                     value={formData.section}
//                     onChange={(e) => {
//                       setFormData({ ...formData, section: e.target.value });
//                       if (duplicateError) setDuplicateError('');
//                     }}
//                     className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-yellow-500 focus:outline-none transition"
//                     required
//                   />
//                   {hasGradeOrSectionChanged() && 
//                    formData.grade && formData.section && 
//                    isClassAlreadyOpen(formData.grade, formData.section, editingClass?._id) && (
//                     <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
//                       <AlertCircle size={12} /> Class already exists!
//                     </p>
//                   )}
//                 </div>
//                 <div>
//                   <label className="block text-sm font-semibold text-gray-700 mb-2">Program <span className="text-red-500">*</span></label>
//                   <select
//                     value={formData.program}
//                     onChange={(e) => setFormData({ ...formData, program: e.target.value })}
//                     className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-yellow-500 focus:outline-none transition"
//                     required
//                   >
//                     <option value="">Select Program</option>
//                     <option value="Social">Social Sciences</option>
//                     <option value="Natural">Natural Sciences</option>
//                   </select>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-semibold text-gray-700 mb-2">Class Teacher</label>
//                   <select
//                     value={formData.classTeacher}
//                     onChange={(e) => setFormData({ ...formData, classTeacher: e.target.value })}
//                     className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-yellow-500 focus:outline-none transition"
//                   >
//                     <option value="">Select Teacher</option>
//                     {teachers.map(teacher => (
//                       <option key={teacher._id} value={teacher._id}>{teacher.name}</option>
//                     ))}
//                   </select>
//                 </div>
//               </div>
              
//               <div className="mb-6">
//                 <div className="flex justify-between items-center mb-4">
//                   <label className="block text-sm font-semibold text-gray-700">Subjects & Teachers <span className="text-red-500">*</span></label>
//                   <button
//                     type="button"
//                     onClick={addSubjectField}
//                     className="btn-success px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2"
//                   >
//                     <Plus size={16} /> Add Subject
//                   </button>
//                 </div>
//                 {formData.subjects.map((subject, index) => (
//                   <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 border-2 border-gray-200 rounded-lg bg-gray-50">
//                     <div>
//                       <label className="block text-xs font-semibold text-gray-600 mb-2">Subject Name</label>
//                       <input
//                         type="text"
//                         value={subject.name}
//                         onChange={(e) => handleSubjectChange(index, 'name', e.target.value)}
//                         className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-yellow-500 focus:outline-none transition"
//                         required
//                       />
//                     </div>
//                     <div className="flex gap-2">
//                       <div className="flex-1">
//                         <label className="block text-xs font-semibold text-gray-600 mb-2">Subject Teacher</label>
//                         <select
//                           value={subject.teacher}
//                           onChange={(e) => handleSubjectChange(index, 'teacher', e.target.value)}
//                           className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-yellow-500 focus:outline-none transition"
//                           required
//                         >
//                           <option value="">Select Teacher</option>
//                           {teachers.map(teacher => (
//                             <option key={teacher._id} value={teacher._id}>{teacher.name}</option>
//                           ))}
//                         </select>
//                       </div>
//                       {formData.subjects.length > 1 && (
//                         <button
//                           type="button"
//                           onClick={() => removeSubjectField(index)}
//                           className="btn-danger px-4 py-3 rounded-lg text-sm font-semibold mt-6"
//                         >
//                           <Trash2 size={16} />
//                         </button>
//                       )}
//                     </div>
//                   </div>
//                 ))}
//               </div>
              
//               <div className="flex gap-3">
//                 <button 
//                   type="submit" 
//                   disabled={isUpdateDisabled()} 
//                   className={`btn-primary px-6 py-3 rounded-lg font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`}
//                 >
//                   {loading ? 'Updating...' : <><Edit2 size={18} /> Update Class</>}
//                 </button>
//                 <button 
//                   type="button" 
//                   onClick={() => {
//                     setShowEditForm(false);
//                     setEditingClass(null);
//                     setDuplicateError('');
//                   }} 
//                   className="btn-secondary px-6 py-3 rounded-lg font-semibold"
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </form>
//           </div>
//         )}

//         {/* Search and Filter Bar */}
//         {activeTab === 'active' && (
//           <div className="filter-box">
//             <div className="flex flex-col md:flex-row gap-3">
//               <div className="flex-1 relative">
//                 <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
//                 <input
//                   type="text"
//                   placeholder="Search by grade, section, program, or teacher..."
//                   value={searchTerm}
//                   onChange={(e) => {
//                     setSearchTerm(e.target.value);
//                     setCurrentPage(1);
//                   }}
//                   className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-cyan-500 focus:outline-none transition"
//                 />
//               </div>
//               <select
//                 value={filterGrade}
//                 onChange={(e) => {
//                   setFilterGrade(e.target.value);
//                   setCurrentPage(1);
//                 }}
//                 className="px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-cyan-500 focus:outline-none bg-white"
//               >
//                 <option value="">All Grades</option>
//                 <option value="9">Grade 9</option>
//                 <option value="10">Grade 10</option>
//                 <option value="11">Grade 11</option>
//                 <option value="12">Grade 12</option>
//               </select>
//               <select
//                 value={filterProgram}
//                 onChange={(e) => {
//                   setFilterProgram(e.target.value);
//                   setCurrentPage(1);
//                 }}
//                 className="px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-cyan-500 focus:outline-none bg-white"
//               >
//                 <option value="">All Programs</option>
//                 <option value="Social">Social Sciences</option>
//                 <option value="Natural">Natural Sciences</option>
//               </select>
//               <input
//                 type="text"
//                 placeholder="Filter by section..."
//                 value={filterSection}
//                 onChange={(e) => {
//                   setFilterSection(e.target.value);
//                   setCurrentPage(1);
//                 }}
//                 className="px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-cyan-500 focus:outline-none w-32"
//               />
//               <select
//                 value={sortBy}
//                 onChange={(e) => setSortBy(e.target.value)}
//                 className="px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-cyan-500 focus:outline-none bg-white"
//               >
//                 <option value="newest">Newest First</option>
//                 <option value="oldest">Oldest First</option>
//                 <option value="grade">Sort by Grade</option>
//               </select>
//               {(searchTerm || filterGrade || filterProgram || filterSection) && (
//                 <button
//                   onClick={clearFilters}
//                   className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition"
//                 >
//                   Clear Filters
//                 </button>
//               )}
//             </div>
//             <div className="mt-3 text-sm text-gray-500">
//               Found {filteredActiveClasses.length} class{filteredActiveClasses.length !== 1 ? 'es' : ''}
//             </div>
//           </div>
//         )}

//         {/* Active Classes List */}
//         {activeTab === 'active' && (
//           <div className="space-y-6">
//             {filteredActiveClasses.length === 0 ? (
//               <div className="bg-white rounded-xl shadow-lg p-12 text-center border border-gray-200">
//                 <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
//                 <p className="text-gray-600 text-lg">No active classes found.</p>
//                 {(searchTerm || filterGrade || filterProgram || filterSection) && (
//                   <button onClick={clearFilters} className="mt-4 text-cyan-600 hover:text-cyan-700 font-semibold">
//                     Clear filters to see all classes
//                   </button>
//                 )}
//               </div>
//             ) : (
//               <>
//                 {currentClasses.map((cls) => {
//                   const canGraduate = isGrade12(cls.grade);
//                   return (
//                     <div key={cls._id} className="class-card">
//                       <div className="flex flex-col lg:flex-row justify-between items-start gap-6 mb-6">
//                         <div className="flex-1">
//                           <div className="flex items-center gap-4 mb-4 flex-wrap">
//                             <div className="w-14 h-14 bg-gradient-to-br from-cyan-600 to-cyan-700 rounded-xl flex items-center justify-center text-white font-bold text-xl">
//                               {cls.grade}
//                             </div>
//                             <div>
//                               <h3 className="text-2xl font-bold text-gray-800">Grade {cls.grade} - Section {cls.section}</h3>
//                               <p className="text-sm text-gray-600">{cls.program || 'Program Not Set'}</p>
//                             </div>
//                             <span className={`badge-program ${cls.program === 'Social' ? 'badge-social' : 'badge-natural'}`}>
//                               {cls.program || 'N/A'}
//                             </span>
//                             {canGraduate && (
//                               <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">Eligible for Graduation</span>
//                             )}
//                           </div>
                          
//                           <div className="bg-gray-50 rounded-lg p-4 mb-4">
//                             <p className="text-gray-700 font-semibold mb-2">
//                               Class Teacher: <span className="text-cyan-600">{cls.classTeacher?.name || 'Not assigned'}</span>
//                             </p>
//                             <p className="text-gray-700 font-semibold">
//                               Total Students: <span className="text-cyan-600 text-lg">{cls.students?.filter(s => s.academicStatus !== 'graduated' && s.grade !== 'Graduated').length || 0}</span>
//                             </p>
//                           </div>
//                         </div>
                        
//                         <div className="flex gap-2 flex-wrap w-full lg:w-auto">
//                           <button onClick={() => openClassDetail(cls)} className="btn-primary px-4 py-2 rounded-lg font-semibold flex items-center gap-2 text-sm">
//                             <Eye size={18} /> Details
//                           </button>
//                           <button onClick={() => { setSelectedClass(cls); setShowAssignModal(true); setSelectedStudents([]); setSelectAll(false); }} className="btn-success px-4 py-2 rounded-lg font-semibold flex items-center gap-2 text-sm">
//                             <Users size={18} /> Assign
//                           </button>
//                           <button onClick={() => handleEdit(cls)} className="btn-warning px-4 py-2 rounded-lg font-semibold flex items-center gap-2 text-sm">
//                             <Edit2 size={18} /> Edit
//                           </button>
//                           {canGraduate && (
//                             <button onClick={() => handleMarkClassAsGraduated(cls)} className="bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 text-sm hover:bg-purple-700 transition">
//                               <GraduationCap size={18} /> Graduate
//                             </button>
//                           )}
//                           {cls.students && cls.students.filter(s => s.academicStatus !== 'graduated' && s.grade !== 'Graduated').length > 0 && (
//                             <button onClick={() => toggleDropdown(cls._id)} className="btn-secondary px-4 py-2 rounded-lg font-semibold flex items-center gap-2 text-sm">
//                               {expandedClass === cls._id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
//                               {expandedClass === cls._id ? 'Hide' : 'Show'} Students
//                             </button>
//                           )}
//                           <button onClick={() => handleDelete(cls._id)} className="btn-danger px-4 py-2 rounded-lg font-semibold flex items-center gap-2 text-sm">
//                             <Trash2 size={18} />
//                           </button>
//                         </div>
//                       </div>
                      
//                       {/* Expanded Student List */}
//                       {expandedClass === cls._id && cls.students && cls.students.filter(s => s.academicStatus !== 'graduated' && s.grade !== 'Graduated').length > 0 && (
//                         <div className="mt-6 border-t-2 border-gray-200 pt-6">
//                           <div className="flex justify-between items-center mb-4">
//                             <h4 className="font-bold text-lg text-gray-800">Enrolled Students</h4>
//                             <button onClick={() => handleRemoveMultipleStudents(cls._id, cls.students.filter(s => s.academicStatus !== 'graduated' && s.grade !== 'Graduated').map(s => s._id))} className="btn-danger px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2">
//                               <Trash2 size={16} /> Remove All
//                             </button>
//                           </div>
                          
//                           <div className="table-container">
//                             <div className="overflow-x-auto">
//                               <table className="w-full border-collapse">
//                                 <thead className="table-header">
//                                   <tr>
//                                     <th className="text-center">Roll</th>
//                                     <th className="text-center">Photo</th>
//                                     <th className="text-left">Student</th>
//                                     <th className="text-center">Grade</th>
//                                     <th className="text-center">Section</th>
//                                     <th className="text-center">Program</th>
//                                     <th className="text-center">Status</th>
//                                     <th className="text-center">Actions</th>
//                                   </tr>
//                                 </thead>
//                                 <tbody>
//                                   {getCurrentStudents(cls._id).map((student, idx) => {
//                                     const fullStudentData = students.find(s => s._id === student._id) || student;
//                                     return (
//                                       <tr key={student._id} className="table-row">
//                                         <td className="text-center font-medium text-gray-700">{fullStudentData.rollNumber || '-'}</td>
//                                         <td className="text-center">
//                                           <Avatar name={fullStudentData.name} image={fullStudentData.profileImage} size={35} />
//                                         </td>
//                                         <td className="font-medium text-gray-900">{fullStudentData.name}</td>
//                                         <td className="text-center text-gray-700">{fullStudentData.grade || '-'}</td>
//                                         <td className="text-center text-gray-700">{fullStudentData.section || '-'}</td>
//                                         <td className="text-center text-gray-700">{fullStudentData.programs || '-'}</td>
//                                         <td className="text-center">
//                                           <Badge text={fullStudentData.academicStatus || 'Active'} color={fullStudentData.academicStatus === 'graduated' ? 'purple' : 'green'} />
//                                         </td>
//                                         <td className="text-center">
//                                           <div className="flex gap-1 justify-center">
//                                             <button onClick={() => openStudentDetail(fullStudentData)} className="btn-primary px-2 py-1 rounded text-xs font-semibold flex items-center gap-1">
//                                               <Eye size={14} />
//                                             </button>
//                                             <button onClick={() => handleEditStudent(fullStudentData)} className="btn-warning px-2 py-1 rounded text-xs font-semibold flex items-center gap-1">
//                                               <Edit2 size={14} />
//                                             </button>
//                                             <button onClick={() => handleMarkAsGraduated(fullStudentData)} className="bg-purple-600 text-white px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 hover:bg-purple-700 transition">
//                                               <GraduationCap size={14} />
//                                             </button>
//                                             <button onClick={() => handleRemoveStudent(cls._id, student._id)} className="btn-danger px-2 py-1 rounded text-xs font-semibold flex items-center gap-1">
//                                               <Trash2 size={14} />
//                                             </button>
//                                           </div>
//                                         </td>
//                                       </tr>
//                                     );
//                                   })}
//                                 </tbody>
//                               </table>
//                             </div>
//                           </div>

//                           {getTotalStudentPages(cls._id) > 1 && (
//                             <div className="flex justify-center mt-6 gap-2">
//                               <button onClick={() => { const newPage = Math.max(1, (studentPage[cls._id] || 1) - 1); setStudentPage(prev => ({ ...prev, [cls._id]: newPage })); }} disabled={(studentPage[cls._id] || 1) === 1} className="btn-secondary px-4 py-2 rounded-lg disabled:opacity-50 font-semibold">
//                                 Previous
//                               </button>
//                               <span className="px-4 py-2 font-semibold text-gray-700">Page {(studentPage[cls._id] || 1)} of {getTotalStudentPages(cls._id)}</span>
//                               <button onClick={() => { const newPage = Math.min(getTotalStudentPages(cls._id), (studentPage[cls._id] || 1) + 1); setStudentPage(prev => ({ ...prev, [cls._id]: newPage })); }} disabled={(studentPage[cls._id] || 1) === getTotalStudentPages(cls._id)} className="btn-secondary px-4 py-2 rounded-lg disabled:opacity-50 font-semibold">
//                                 Next
//                               </button>
//                             </div>
//                           )}
//                         </div>
//                       )}
//                     </div>
//                   );
//                 })}

//                 {totalPages > 1 && (
//                   <div className="flex justify-center gap-3 mt-8">
//                     <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1} className="btn-secondary px-6 py-3 rounded-lg disabled:opacity-50 font-semibold">
//                       Previous
//                     </button>
//                     <span className="px-6 py-3 font-bold text-gray-700">Page {currentPage} of {totalPages}</span>
//                     <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages} className="btn-secondary px-6 py-3 rounded-lg disabled:opacity-50 font-semibold">
//                       Next
//                     </button>
//                   </div>
//                 )}
//               </>
//             )}
//           </div>
//         )}

//         {/* Graduated Classes */}
//         {activeTab === 'graduated' && (
//           <div className="space-y-6">
//             <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200">
//               <div className="bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-4">
//                 <h2 className="text-xl font-bold text-white flex items-center gap-2">
//                   <Archive size={24} /> Graduated Classes
//                 </h2>
//                 <p className="text-cyan-100 text-sm mt-1">Classes that have completed their academic program</p>
//               </div>

//               {graduatedClasses.length === 0 ? (
//                 <div className="text-center py-12">
//                   <Archive size={48} className="mx-auto text-gray-400 mb-4" />
//                   <p className="text-gray-500 text-lg">No graduated classes found.</p>
//                 </div>
//               ) : (
//                 <>
//                   {currentGraduatedClasses.map((cls) => (
//                     <div key={cls._id} className="class-card m-4 border-purple-200">
//                       <div className="flex flex-col lg:flex-row justify-between items-start gap-6 mb-6">
//                         <div className="flex-1">
//                           <div className="flex items-center gap-4 mb-4 flex-wrap">
//                             <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl flex items-center justify-center text-white font-bold text-xl">
//                               {cls.grade}
//                             </div>
//                             <div>
//                               <h3 className="text-2xl font-bold text-gray-800">Grade {cls.grade} - Section {cls.section}</h3>
//                               <p className="text-sm text-gray-600">{cls.program || 'Program Not Set'}</p>
//                             </div>
//                             <span className="badge-program badge-graduated">Graduated</span>
//                           </div>
                          
//                           <div className="bg-gray-50 rounded-lg p-4 mb-4">
//                             <p className="text-gray-700 font-semibold mb-2">Class Teacher: <span className="text-cyan-600">{cls.classTeacher?.name || 'Not assigned'}</span></p>
//                             <p className="text-gray-700 font-semibold">Total Students: <span className="text-purple-600 text-lg">{cls.students?.length || 0}</span></p>
//                             <p className="text-gray-600 text-sm mt-2">Graduated on: {new Date(cls.updatedAt).toLocaleDateString()}</p>
//                           </div>
//                         </div>
                        
//                         <div className="flex gap-2 flex-wrap w-full lg:w-auto">
//                           <button onClick={() => openClassDetail(cls)} className="btn-primary px-4 py-2 rounded-lg font-semibold flex items-center gap-2 text-sm">
//                             <Eye size={18} /> Details
//                           </button>
//                           <button onClick={() => handleRestoreGraduatedClass(cls)} className="btn-success px-4 py-2 rounded-lg font-semibold flex items-center gap-2 text-sm">
//                             <RefreshCw size={18} /> Restore
//                           </button>
//                           <button onClick={() => handleDelete(cls._id)} className="btn-danger px-4 py-2 rounded-lg font-semibold flex items-center gap-2 text-sm">
//                             <Trash2 size={18} />
//                           </button>
//                           {cls.students && cls.students.length > 0 && (
//                             <button onClick={() => toggleGraduatedDropdown(cls._id)} className="btn-secondary px-4 py-2 rounded-lg font-semibold flex items-center gap-2 text-sm">
//                               {expandedGraduatedClass === cls._id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
//                               {expandedGraduatedClass === cls._id ? 'Hide' : 'Show'} Students
//                             </button>
//                           )}
//                         </div>
//                       </div>

//                       {expandedGraduatedClass === cls._id && cls.students && cls.students.length > 0 && (
//                         <div className="mt-6 border-t-2 border-purple-200 pt-6">
//                           <h4 className="font-bold text-lg text-gray-800 mb-4">Graduated Students</h4>
//                           <div className="table-container">
//                             <div className="overflow-x-auto">
//                               <table className="w-full border-collapse">
//                                 <thead className="table-header">
//                                   <tr>
//                                     <th className="text-center">Roll</th>
//                                     <th className="text-center">Photo</th>
//                                     <th className="text-left">Student</th>
//                                     <th className="text-center">Grade</th>
//                                     <th className="text-center">Section</th>
//                                     <th className="text-center">Program</th>
//                                     <th className="text-center">Actions</th>
//                                   </tr>
//                                 </thead>
//                                 <tbody>
//                                   {getGraduatedClassStudents(cls._id).map((student, idx) => (
//                                     <tr key={student._id} className="table-row">
//                                       <td className="text-center font-medium text-gray-700">{student.rollNumber || '-'}</td>
//                                       <td className="text-center">
//                                         <Avatar name={student.name} image={student.profileImage} size={35} />
//                                       </td>
//                                       <td className="font-medium text-gray-900">{student.name}</td>
//                                       <td className="text-center text-gray-700">{student.grade || '-'}</td>
//                                       <td className="text-center text-gray-700">{student.section || student.classSection || student.class || '-'}</td>
//                                       <td className="text-center text-gray-700">{student.programs || '-'}</td>
//                                       <td className="text-center">
//                                         <div className="flex gap-1 justify-center">
//                                           <button onClick={() => openStudentDetail(student)} className="btn-primary px-2 py-1 rounded text-xs font-semibold flex items-center gap-1">
//                                             <Eye size={14} />
//                                           </button>
//                                           <button onClick={() => handleRestoreFromGraduated(student)} className="btn-success px-2 py-1 rounded text-xs font-semibold flex items-center gap-1">
//                                             <RefreshCw size={14} /> Restore
//                                           </button>
//                                         </div>
//                                       </td>
//                                     </tr>
//                                   ))}
//                                 </tbody>
//                               </table>
//                             </div>
//                           </div>

//                           {getTotalGraduatedClassStudentPages(cls._id) > 1 && (
//                             <div className="flex justify-center mt-6 gap-2">
//                               <button onClick={() => { const newPage = Math.max(1, (graduatedStudentPage[cls._id] || 1) - 1); setGraduatedStudentPage(prev => ({ ...prev, [cls._id]: newPage })); }} disabled={(graduatedStudentPage[cls._id] || 1) === 1} className="btn-secondary px-4 py-2 rounded-lg disabled:opacity-50 font-semibold">
//                                 Previous
//                               </button>
//                               <span className="px-4 py-2 font-semibold text-gray-700">Page {(graduatedStudentPage[cls._id] || 1)} of {getTotalGraduatedClassStudentPages(cls._id)}</span>
//                               <button onClick={() => { const newPage = Math.min(getTotalGraduatedClassStudentPages(cls._id), (graduatedStudentPage[cls._id] || 1) + 1); setGraduatedStudentPage(prev => ({ ...prev, [cls._id]: newPage })); }} disabled={(graduatedStudentPage[cls._id] || 1) === getTotalGraduatedClassStudentPages(cls._id)} className="btn-secondary px-4 py-2 rounded-lg disabled:opacity-50 font-semibold">
//                                 Next
//                               </button>
//                             </div>
//                           )}
//                         </div>
//                       )}
//                     </div>
//                   ))}

//                   {totalGClassPages > 1 && (
//                     <div className="flex justify-center gap-3 mt-8 pb-6">
//                       <button onClick={() => setGraduatedClassPage(graduatedClassPage - 1)} disabled={graduatedClassPage === 1} className="btn-secondary px-6 py-3 rounded-lg disabled:opacity-50 font-semibold">
//                         Previous
//                       </button>
//                       <span className="px-6 py-3 font-bold text-gray-700">Page {graduatedClassPage} of {totalGClassPages}</span>
//                       <button onClick={() => setGraduatedClassPage(graduatedClassPage + 1)} disabled={graduatedClassPage === totalGClassPages} className="btn-secondary px-6 py-3 rounded-lg disabled:opacity-50 font-semibold">
//                         Next
//                       </button>
//                     </div>
//                   )}
//                 </>
//               )}
//             </div>

//             {/* All Graduated Students Section */}
//             <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200">
//               <div className="bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-4">
//                 <h2 className="text-xl font-bold text-white flex items-center gap-2">
//                   <GraduationCap size={24} /> All Graduated Students
//                 </h2>
//                 <p className="text-cyan-100 text-sm mt-1">All students who have completed their academic program</p>
//               </div>

//               {graduatedStudents.length === 0 ? (
//                 <div className="text-center py-12">
//                   <GraduationCap size={48} className="mx-auto text-gray-400 mb-4" />
//                   <p className="text-gray-500 text-lg">No graduated students found.</p>
//                 </div>
//               ) : (
//                 <>
//                   <div className="table-container">
//                     <div className="overflow-x-auto">
//                       <table className="w-full border-collapse">
//                         <thead className="table-header">
//                           <tr>
//                             <th className="text-center">Roll</th>
//                             <th className="text-center">Photo</th>
//                             <th className="text-left">Student</th>
//                             <th className="text-center">Grade</th>
//                             <th className="text-center">Section</th>
//                             <th className="text-center">Program</th>
//                             <th className="text-center">Actions</th>
//                           </tr>
//                         </thead>
//                         <tbody>
//                           {currentGraduatedStudents.map((student, idx) => (
//                             <tr key={student._id} className="table-row">
//                               <td className="text-center font-medium text-gray-700">{student.rollNumber || '-'}</td>
//                               <td className="text-center">
//                                 <Avatar name={student.name} image={student.profileImage} size={35} />
//                               </td>
//                               <td className="font-medium text-gray-900">{student.name}</td>
//                               <td className="text-center text-gray-700">{student.grade || 'Graduated'}</td>
//                               <td className="text-center text-gray-700">{student.section || student.classSection || student.class || '-'}</td>
//                               <td className="text-center text-gray-700">{student.programs || '-'}</td>
//                               <td className="text-center">
//                                 <div className="flex gap-1 justify-center">
//                                   <button onClick={() => openStudentDetail(student)} className="btn-primary px-2 py-1 rounded text-xs font-semibold flex items-center gap-1">
//                                     <Eye size={14} />
//                                   </button>
//                                   <button onClick={() => handleRestoreFromGraduated(student)} className="btn-success px-2 py-1 rounded text-xs font-semibold flex items-center gap-1">
//                                     <RefreshCw size={14} /> Restore
//                                   </button>
//                                 </div>
//                               </td>
//                             </tr>
//                           ))}
//                         </tbody>
//                       </table>
//                     </div>
//                   </div>

//                   {totalGStudentPages > 1 && (
//                     <div className="flex justify-center gap-3 py-6 border-t-2 border-gray-200">
//                       <button onClick={() => setGraduatedStudentListPage(graduatedStudentListPage - 1)} disabled={graduatedStudentListPage === 1} className="btn-secondary px-6 py-3 rounded-lg disabled:opacity-50 font-semibold">
//                         Previous
//                       </button>
//                       <span className="px-6 py-3 font-bold text-gray-700">Page {graduatedStudentListPage} of {totalGStudentPages}</span>
//                       <button onClick={() => setGraduatedStudentListPage(graduatedStudentListPage + 1)} disabled={graduatedStudentListPage === totalGStudentPages} className="btn-secondary px-6 py-3 rounded-lg disabled:opacity-50 font-semibold">
//                         Next
//                       </button>
//                     </div>
//                   )}
//                 </>
//               )}
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Detail Modal */}
//       {showDetailModal && detailModalData && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 modal-backdrop">
//           <div className="bg-white rounded-2xl p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto modal-content">
//             <div className="flex justify-between items-center mb-8">
//               <h2 className="text-3xl font-bold text-cyan-700">
//                 {detailModalType === 'class' ? 'Class Details' : detailModalType === 'student' ? 'Student Details' : 'Teacher Details'}
//               </h2>
//               <button onClick={() => setShowDetailModal(false)} className="text-gray-500 hover:text-gray-700">
//                 <X size={28} />
//               </button>
//             </div>

//             {detailModalType === 'class' && (
//               <div>
//                 <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl p-6 mb-6">
//                   <div className="flex items-center gap-4 mb-4">
//                     <div className="w-12 h-12 bg-gradient-to-br from-cyan-600 to-cyan-700 rounded-xl flex items-center justify-center text-white font-bold text-xl">
//                       {detailModalData.grade}
//                     </div>
//                     <div>
//                       <h3 className="text-2xl font-bold text-gray-800">Grade {detailModalData.grade} - Section {detailModalData.section}</h3>
//                       <p className="text-gray-600">{detailModalData.program || 'N/A'} Program</p>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="detail-row">
//                   <span className="font-semibold text-cyan-600 w-36">Class Teacher:</span>
//                   <span className="font-semibold text-gray-800">{detailModalData.classTeacher?.name || 'Not assigned'}</span>
//                 </div>

//                 <div className="border-t-2 border-cyan-200 my-6"></div>
//                 <h4 className="text-lg font-bold text-cyan-700 mb-4 flex items-center gap-2"><BookOpen size={20} /> Subjects</h4>

//                 {detailModalData.subjects && detailModalData.subjects.length > 0 ? (
//                   <div className="space-y-3">
//                     {detailModalData.subjects.map((subject, idx) => (
//                       <div key={idx} className="bg-gray-50 rounded-lg p-4 border-l-4 border-cyan-500">
//                         <div className="flex justify-between items-center">
//                           <div>
//                             <p className="font-bold text-gray-800 text-lg">{subject.name}</p>
//                             <p className="text-gray-600 text-sm">Teacher: <span className="font-semibold">{subject.teacher?.name || 'Not assigned'}</span></p>
//                           </div>
//                           <div className="flex gap-2">
//                             <button onClick={() => openTeacherDetail(subject.teacher)} className="btn-primary px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-2">
//                               <Eye size={16} /> View
//                             </button>
//                             <button onClick={() => { const classId = detailModalData._id; const subjectIndex = idx; handleTeacherAssign(classId, subjectIndex); setShowDetailModal(false); }} className="bg-orange-500 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-orange-600 transition flex items-center gap-2">
//                               <UserCog size={16} /> Reassign
//                             </button>
//                           </div>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 ) : (
//                   <p className="text-gray-500 italic">No subjects assigned</p>
//                 )}

//                 <div className="border-t-2 border-cyan-200 my-6"></div>
//                 <h4 className="text-lg font-bold text-cyan-700 mb-4 flex items-center gap-2"><Users size={20} /> Enrolled Students ({detailModalData.students?.filter(s => s.academicStatus !== 'graduated' && s.grade !== 'Graduated').length || 0})</h4>

//                 {detailModalData.students && detailModalData.students.filter(s => s.academicStatus !== 'graduated' && s.grade !== 'Graduated').length > 0 ? (
//                   <div className="space-y-2 max-h-96 overflow-y-auto">
//                     {detailModalData.students.filter(s => s.academicStatus !== 'graduated' && s.grade !== 'Graduated').map((student) => (
//                       <div key={student._id} className="flex justify-between items-center bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition">
//                         <div className="flex-1 flex items-center gap-3">
//                           <Avatar name={student.name} image={student.profileImage} size={35} />
//                           <div>
//                             <p className="font-semibold text-gray-800">{student.name}</p>
//                             <p className="text-sm text-gray-600">Roll: {student.rollNumber || '-'} | Email: {student.email || '-'}</p>
//                           </div>
//                         </div>
//                         <div className="flex gap-2">
//                           <button onClick={() => openStudentDetail(student)} className="btn-success px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-2">
//                             <Eye size={16} /> View
//                           </button>
//                           <button onClick={() => handleMarkAsGraduated(student)} className="bg-purple-600 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-purple-700 transition flex items-center gap-2">
//                             <GraduationCap size={16} /> Graduate
//                           </button>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 ) : (
//                   <p className="text-gray-500 italic">No active students enrolled</p>
//                 )}
//               </div>
//             )}

//             {detailModalType === 'student' && (
//               <div>
//                 <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl p-6 mb-6">
//                   <div className="flex items-center gap-4 mb-4">
//                     <Avatar name={detailModalData.name} image={detailModalData.profileImage} size={80} />
//                     <div>
//                       <h3 className="text-2xl font-bold text-gray-800">{detailModalData.name}</h3>
//                       <p className="text-gray-600">Roll No: {detailModalData.rollNumber || 'N/A'}</p>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="space-y-2 mb-6">
//                   <div className="flex items-center py-2 border-b border-gray-100">
//                     <span className="font-semibold text-cyan-600 w-36">Email:</span>
//                     <span className="font-semibold text-gray-800 flex items-center gap-2"><Mail size={16} /> {detailModalData.email || 'N/A'}</span>
//                   </div>
//                   <div className="flex items-center py-2 border-b border-gray-100">
//                     <span className="font-semibold text-cyan-600 w-36">Gender:</span>
//                     <span className="font-semibold text-gray-800">{detailModalData.sex || 'N/A'}</span>
//                   </div>
//                   <div className="flex items-center py-2 border-b border-gray-100">
//                     <span className="font-semibold text-cyan-600 w-36">Grade:</span>
//                     <span className="font-semibold text-gray-800">{detailModalData.grade || 'N/A'}</span>
//                   </div>
//                   <div className="flex items-center py-2 border-b border-gray-100">
//                     <span className="font-semibold text-cyan-600 w-36">Section:</span>
//                     <span className="font-semibold text-gray-800">{detailModalData.section || detailModalData.classSection || detailModalData.class || 'N/A'}</span>
//                   </div>
//                   <div className="flex items-center py-2 border-b border-gray-100">
//                     <span className="font-semibold text-cyan-600 w-36">Program:</span>
//                     <span className="font-semibold text-gray-800">{detailModalData.programs || 'N/A'}</span>
//                   </div>
//                   <div className="flex items-center py-2 border-b border-gray-100">
//                     <span className="font-semibold text-cyan-600 w-36">Status:</span>
//                     <span className={`font-semibold ${detailModalData.academicStatus === 'graduated' || detailModalData.grade === 'Graduated' ? 'text-purple-600' : 'text-green-600'}`}>
//                       {detailModalData.academicStatus === 'graduated' || detailModalData.grade === 'Graduated' ? 'Graduated' : 'Active'}
//                     </span>
//                   </div>
//                 </div>

//                 <div className="flex gap-3">
//                   <button onClick={() => handleEditStudent(detailModalData)} className="btn-primary px-6 py-3 rounded-lg font-semibold flex items-center gap-2 flex-1 justify-center">
//                     <Edit2 size={18} /> Edit Student
//                   </button>
//                   {(detailModalData.academicStatus !== 'graduated' && detailModalData.grade !== 'Graduated') && (
//                     <button onClick={() => handleMarkAsGraduated(detailModalData)} className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 flex-1 justify-center hover:bg-purple-700 transition">
//                       <GraduationCap size={18} /> Mark as Graduated
//                     </button>
//                   )}
//                 </div>
//               </div>
//             )}

//             {detailModalType === 'teacher' && (
//               <div>
//                 <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl p-6 mb-6">
//                   <div className="flex items-center gap-4 mb-4">
//                     <div className="w-14 h-14 bg-gradient-to-br from-cyan-600 to-cyan-700 rounded-xl flex items-center justify-center text-white font-bold text-xl">
//                       <Award size={28} />
//                     </div>
//                     <div>
//                       <h3 className="text-2xl font-bold text-gray-800">{detailModalData.name}</h3>
//                       <p className="text-gray-600">Teacher</p>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="space-y-2">
//                   <div className="flex items-center py-2 border-b border-gray-100">
//                     <span className="font-semibold text-cyan-600 w-36">Email:</span>
//                     <span className="font-semibold text-gray-800 flex items-center gap-2"><Mail size={16} /> {detailModalData.email || 'N/A'}</span>
//                   </div>
//                   <div className="flex items-center py-2 border-b border-gray-100">
//                     <span className="font-semibold text-cyan-600 w-36">Phone:</span>
//                     <span className="font-semibold text-gray-800 flex items-center gap-2"><Phone size={16} /> {detailModalData.phone || 'N/A'}</span>
//                   </div>
//                   <div className="flex items-center py-2 border-b border-gray-100">
//                     <span className="font-semibold text-cyan-600 w-36">Joining Date:</span>
//                     <span className="font-semibold text-gray-800 flex items-center gap-2"><Calendar size={16} /> {detailModalData.joiningDate ? new Date(detailModalData.joiningDate).toLocaleDateString() : 'N/A'}</span>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       )}

//       {/* Teacher Re-assignment Modal */}
//       {showTeacherAssignModal && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 modal-backdrop">
//           <div className="bg-white rounded-2xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto modal-content">
//             <div className="flex justify-between items-center mb-6">
//               <h3 className="text-2xl font-bold text-gray-800">Reassign Teacher</h3>
//               <button onClick={() => { setShowTeacherAssignModal(false); setTeacherAssignData({ classId: null, subjectIndex: null, teacherId: '' }); }} className="text-gray-500 hover:text-gray-700">
//                 <X size={24} />
//               </button>
//             </div>
            
//             <div className="mb-6">
//               <label className="block text-sm font-semibold text-gray-700 mb-2">Select New Teacher <span className="text-red-500">*</span></label>
//               <select
//                 value={teacherAssignData.teacherId}
//                 onChange={(e) => setTeacherAssignData({ ...teacherAssignData, teacherId: e.target.value })}
//                 className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-cyan-500 focus:outline-none transition"
//               >
//                 <option value="">Select a teacher...</option>
//                 {teachers.map(teacher => (
//                   <option key={teacher._id} value={teacher._id}>{teacher.name}</option>
//                 ))}
//               </select>
//             </div>
            
//             <div className="flex justify-end gap-3">
//               <button onClick={() => { setShowTeacherAssignModal(false); setTeacherAssignData({ classId: null, subjectIndex: null, teacherId: '' }); }} className="btn-secondary px-6 py-3 rounded-lg font-semibold">
//                 Cancel
//               </button>
//               <button onClick={handleTeacherReassign} disabled={!teacherAssignData.teacherId || loading} className="btn-primary px-6 py-3 rounded-lg disabled:opacity-50 font-semibold flex items-center gap-2">
//                 {loading ? 'Reassigning...' : <><UserCog size={18} /> Reassign</>}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Edit Student Modal */}
//       {showEditStudentForm && editingStudent && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 modal-backdrop">
//           <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto modal-content">
//             <div className="flex justify-between items-center mb-6">
//               <h3 className="text-2xl font-bold text-gray-800">Edit Student</h3>
//               <button onClick={() => setShowEditStudentForm(false)} className="text-gray-500 hover:text-gray-700">
//                 <X size={24} />
//               </button>
//             </div>
//             <form onSubmit={handleUpdateStudent}>
//               <div className="space-y-4">
//                 <div>
//                   <label className="block text-sm font-semibold text-gray-700 mb-2">Student Name *</label>
//                   <input
//                     type="text"
//                     value={studentFormData.name}
//                     onChange={(e) => setStudentFormData({ ...studentFormData, name: e.target.value })}
//                     className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-cyan-500 focus:outline-none transition"
//                     required
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
//                   <input
//                     type="email"
//                     value={studentFormData.email}
//                     onChange={(e) => setStudentFormData({ ...studentFormData, email: e.target.value })}
//                     className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-cyan-500 focus:outline-none transition"
//                     required
//                   />
//                 </div>
//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-sm font-semibold text-gray-700 mb-2">Roll Number</label>
//                     <input
//                       type="text"
//                       value={studentFormData.rollNumber}
//                       onChange={(e) => setStudentFormData({ ...studentFormData, rollNumber: e.target.value })}
//                       className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-cyan-500 focus:outline-none transition"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-semibold text-gray-700 mb-2">Gender</label>
//                     <select
//                       value={studentFormData.sex}
//                       onChange={(e) => setStudentFormData({ ...studentFormData, sex: e.target.value })}
//                       className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-cyan-500 focus:outline-none transition"
//                     >
//                       <option value="">Select Gender</option>
//                       <option value="Male">Male</option>
//                       <option value="Female">Female</option>
//                       <option value="Other">Other</option>
//                     </select>
//                   </div>
//                 </div>
//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-sm font-semibold text-gray-700 mb-2">Grade</label>
//                     <select
//                       value={studentFormData.grade}
//                       onChange={(e) => setStudentFormData({ ...studentFormData, grade: e.target.value })}
//                       className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-cyan-500 focus:outline-none transition"
//                     >
//                       <option value="">Select Grade</option>
//                       <option value="9">Grade 9</option>
//                       <option value="10">Grade 10</option>
//                       <option value="11">Grade 11</option>
//                       <option value="12">Grade 12</option>
//                     </select>
//                   </div>
//                   <div>
//                     <label className="block text-sm font-semibold text-gray-700 mb-2">Section</label>
//                     <input
//                       type="text"
//                       placeholder="e.g., A, B, C"
//                       value={studentFormData.section}
//                       onChange={(e) => setStudentFormData({ ...studentFormData, section: e.target.value })}
//                       className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-cyan-500 focus:outline-none transition"
//                     />
//                   </div>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-semibold text-gray-700 mb-2">Program</label>
//                   <select
//                     value={studentFormData.programs}
//                     onChange={(e) => setStudentFormData({ ...studentFormData, programs: e.target.value })}
//                     className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-cyan-500 focus:outline-none transition"
//                   >
//                     <option value="">Select Program</option>
//                     <option value="Social">Social Sciences</option>
//                     <option value="Natural">Natural Sciences</option>
//                   </select>
//                 </div>
//               </div>
//               <div className="mt-6 flex justify-end gap-3">
//                 <button type="button" onClick={() => setShowEditStudentForm(false)} className="btn-secondary px-6 py-3 rounded-lg font-semibold">Cancel</button>
//                 <button type="submit" disabled={loading} className="btn-primary px-6 py-3 rounded-lg font-semibold disabled:opacity-50">Update Student</button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* Assign Students Modal */}
//       {showAssignModal && selectedClass && activeTab === 'active' && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 modal-backdrop">
//           <div className="bg-white rounded-2xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto modal-content">
//             <div className="flex justify-between items-center mb-6">
//               <h3 className="text-2xl font-bold text-gray-800">Assign Students to Class</h3>
//               <button onClick={() => { setShowAssignModal(false); setSelectedClass(null); setSelectedStudents([]); setSelectAll(false); }} className="text-gray-500 hover:text-gray-700">
//                 <X size={24} />
//               </button>
//             </div>
            
//             <div className="mb-4 p-4 bg-cyan-50 rounded-lg border-l-4 border-cyan-600">
//               <p className="text-sm text-cyan-800 font-semibold">Class: <span className="text-cyan-600">Grade {selectedClass.grade} - Section {selectedClass.section}</span></p>
//             </div>
            
//             <div className="mb-6 p-4 bg-purple-50 rounded-lg border-l-4 border-purple-600">
//               <p className="text-sm text-purple-800"><span className="font-bold">{selectedStudents.length}</span> student(s) selected</p>
//               <p className="text-sm text-purple-800 mt-2">⚠️ <span className="font-bold">ONLY students from Section {selectedClass.section} can be assigned!</span></p>
//             </div>
            
//             <div className="mb-6 flex justify-between items-center">
//               <label className="flex items-center cursor-pointer">
//                 <input type="checkbox" checked={selectAll} onChange={handleSelectAll} className="mr-3 w-5 h-5 rounded" />
//                 <span className="text-sm font-semibold text-gray-700">Select All Available Students (Section {selectedClass.section})</span>
//               </label>
//               <button onClick={() => { setSelectedStudents([]); setSelectAll(false); }} className="text-sm text-red-600 hover:text-red-800 font-semibold">Clear All</button>
//             </div>

//             <div className="table-container mb-6">
//               <div className="p-4 bg-gray-100 border-b-2 border-gray-200">
//                 <div className="flex gap-2 flex-wrap">
//                   <button onClick={() => setGradeFilter('')} className={`px-4 py-2 text-sm font-semibold rounded-lg transition ${!gradeFilter ? 'btn-primary text-white' : 'btn-secondary'}`}>All Grades</button>
//                   {['9', '10', '11', '12'].map(grade => (
//                     <button key={grade} onClick={() => setGradeFilter(grade)} className={`px-4 py-2 text-sm font-semibold rounded-lg transition ${gradeFilter === grade ? 'btn-primary text-white' : 'btn-secondary'}`}>Grade {grade}</button>
//                   ))}
//                 </div>
//                 <div className="flex gap-2 flex-wrap mt-2">
//                   <button onClick={() => setProgramFilter('')} className={`px-4 py-2 text-sm font-semibold rounded-lg transition ${!programFilter ? 'btn-success text-white' : 'btn-secondary'}`}>All Programs</button>
//                   <button onClick={() => setProgramFilter('Natural')} className={`px-4 py-2 text-sm font-semibold rounded-lg transition ${programFilter === 'Natural' ? 'btn-success text-white' : 'btn-secondary'}`}>Natural Science</button>
//                   <button onClick={() => setProgramFilter('Social')} className={`px-4 py-2 text-sm font-semibold rounded-lg transition ${programFilter === 'Social' ? 'btn-success text-white' : 'btn-secondary'}`}>Social Science</button>
//                 </div>
//               </div>
              
//               <div className="overflow-x-auto">
//                 <table className="w-full border-collapse">
//                   <thead className="table-header">
//                     <tr>
//                       <th className="text-center">Select</th>
//                       <th className="text-center">Roll</th>
//                       <th className="text-left">Student</th>
//                       <th className="text-center">Grade</th>
//                       <th className="text-center">Section</th>
//                       <th className="text-center">Program</th>
//                       <th className="text-center">Status</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {getAvailableStudents(selectedClass._id)
//                       .filter(student => {
//                         if (gradeFilter && String(student.grade) !== gradeFilter) return false;
//                         if (programFilter && student.programs !== programFilter) return false;
//                         return true;
//                       })
//                       .map((student, idx) => {
//                         const alreadyAssigned = isStudentAlreadyAssigned(student._id, selectedClass._id);
//                         return (
//                           <tr key={student._id} className="table-row">
//                             <td className="text-center">
//                               <input type="checkbox" checked={selectedStudents.includes(student._id)} onChange={() => handleMultiSelect(student._id)} disabled={alreadyAssigned.assigned} className="w-4 h-4 rounded cursor-pointer" />
//                             </td>
//                             <td className="text-center font-medium text-gray-700">{student.rollNumber || '-'}</td>
//                             <td className="font-medium text-gray-900">
//                               <div className="flex items-center gap-2">
//                                 <Avatar name={student.name} image={student.profileImage} size={28} />
//                                 <span>{student.name}</span>
//                               </div>
//                             </td>
//                             <td className="text-center text-gray-700">{student.grade || '-'}</td>
//                             <td className="text-center text-gray-700">{student.section || student.classSection || student.class || '-'}</td>
//                             <td className="text-center text-gray-700">{student.programs || '-'}</td>
//                             <td className="text-center">
//                               {alreadyAssigned.assigned ? (
//                                 <span className="text-xs text-red-600 font-semibold bg-red-50 px-2 py-1 rounded-full">Already in {alreadyAssigned.className}</span>
//                               ) : (
//                                 <span className="text-xs text-green-600 font-semibold bg-green-50 px-2 py-1 rounded-full">Available</span>
//                               )}
//                             </td>
//                           </tr>
//                         );
//                       })}
//                   </tbody>
//                 </table>
//               </div>
//             </div>

//             {getAvailableStudents(selectedClass._id).length === 0 && (
//               <div className="text-center py-12 text-gray-500">
//                 <Users size={48} className="mx-auto mb-4 text-gray-400" />
//                 <p>No available students from Section {selectedClass.section} to assign.</p>
//               </div>
//             )}
            
//             <div className="flex justify-end gap-3 mt-6">
//               <button onClick={() => { setShowAssignModal(false); setSelectedClass(null); setSelectedStudents([]); setSelectAll(false); setGradeFilter(''); setProgramFilter(''); }} className="btn-secondary px-6 py-3 rounded-lg font-semibold">Cancel</button>
//               <button onClick={handleMultiAssign} disabled={selectedStudents.length === 0 || loading} className="btn-primary px-6 py-3 rounded-lg disabled:opacity-50 font-semibold flex items-center gap-2">
//                 {loading ? 'Assigning...' : <><Users size={18} /> Assign {selectedStudents.length} Student(s)</>}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ManageClasses;





// pages/ManageClasses.js
import React, { useState } from 'react';
import ClassList from '../pages/class/ClassDisplay';
import CreateClass from '../pages/class/ClassCreation';

const ManageClasses = ({ isSuperAdmin = false }) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);

  // These functions would be passed to ClassList and used internally
  // Or you can use a state management solution

  return (
    <div>
      {showCreateForm || editingClass ? (
        <CreateClass
          teachers={teachers}
          classes={classes}
          onClassCreated={() => {
            setShowCreateForm(false);
            setEditingClass(null);
            // Refresh class list
          }}
          onCancel={() => {
            setShowCreateForm(false);
            setEditingClass(null);
          }}
          editingClass={editingClass}
        />
      ) : (
        <ClassList 
          onEditClass={(cls) => {
            if (cls) {
              setEditingClass(cls);
            } else {
              setShowCreateForm(true);
            }
          }}
        />
      )}
    </div>
  );
};

export default ManageClasses;