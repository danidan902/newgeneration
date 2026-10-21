import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  Calendar, Users, BookOpen, CheckCircle, XCircle, Clock,
  Search, Save, RefreshCw, ChevronLeft, Eye, History,
  Award, TrendingUp, User, Mail, Phone, AlertCircle,
  Download, Printer, ChevronRight, Filter, BarChart3,
  ArrowUpDown, ArrowUp, ArrowDown, Trash2, Edit2,
  X, Check, Plus, Minus, Calendar as CalendarIcon,
  School, GraduationCap, MapPin, FileSpreadsheet
} from 'lucide-react';
import api from '../../services/api';
import * as XLSX from 'xlsx';

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
    <div className={`border rounded-lg p-3 ${colorMap[color]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium opacity-75">{label}</p>
          <p className="text-xl font-bold mt-1">{value}</p>
        </div>
        <Icon className="w-8 h-8 opacity-30" />
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
  };

  return (
    <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${colorMap[color]}`}>
      {text}
    </span>
  );
};

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

// ============================================
// 📋 ATTENDANCE MANAGER - CARD DESIGN
// ============================================

const AttendanceManager = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [activeTab, setActiveTab] = useState('mark');
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [historyDateRange, setHistoryDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [viewMode, setViewMode] = useState('all');
  const [allStudentAttendance, setAllStudentAttendance] = useState([]);
  const [attendanceSearchTerm, setAttendanceSearchTerm] = useState('');
  const [teacherId, setTeacherId] = useState(null);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [allStudentsData, setAllStudentsData] = useState([]);
  const [sortOrder, setSortOrder] = useState('asc');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedStudentDetail, setSelectedStudentDetail] = useState(null);

  useEffect(() => { 
    fetchClasses(); 
    fetchAllStudents();
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setTeacherId(user._id || user.id);
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
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
    setLoadingClasses(true);
    try {
      let response;
      try {
        response = await api.get('/classes/my-classes');
      } catch (err) {
        response = await api.get('/classes');
      }
      
      let classesData = [];
      if (Array.isArray(response.data)) {
        classesData = response.data;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        classesData = response.data.data;
      } else if (response.data.classes && Array.isArray(response.data.classes)) {
        classesData = response.data.classes;
      }
      
      setClasses(classesData);
      
      if (classesData.length === 0) {
        toast.info('No classes found.');
      } else {
        toast.success(`Loaded ${classesData.length} classes`);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
      toast.error('Failed to fetch classes');
    } finally {
      setLoadingClasses(false);
    }
  };

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

  const handleClassSelect = async (classId) => {
    try {
      const cls = classes.find(c => (c._id || c.id) === classId);
      if (!cls) {
        toast.error('Class not found');
        return;
      }
      
      setSelectedClass(cls);
      
      const response = await api.get(`/classes/${classId}`);
      
      let classData = response.data;
      if (response.data.data) classData = response.data.data;
      if (response.data.class) classData = response.data.class;
      
      let studentsList = [];
      if (classData.students && Array.isArray(classData.students)) {
        studentsList = classData.students;
      } else if (classData.enrolledStudents && Array.isArray(classData.enrolledStudents)) {
        studentsList = classData.enrolledStudents;
      }
      
      if (studentsList.length > 0 && typeof studentsList[0] === 'string') {
        const studentDetails = await Promise.all(
          studentsList.map(async (studentId) => {
            try {
              const studentRes = await api.get(`/users/${studentId}`);
              return studentRes.data;
            } catch (err) {
              console.error('Error fetching student:', studentId, err);
              return null;
            }
          })
        );
        studentsList = studentDetails.filter(s => s !== null);
      }
      
      const enrichedStudents = studentsList.map(student => {
        const fullStudent = allStudentsData.find(s => s._id === student._id);
        return {
          ...student,
          sex: fullStudent?.sex || student?.sex || null,
          age: fullStudent?.age || student?.age || null,
          profileImage: fullStudent?.profileImage || student?.profileImage || null
        };
      });
      
      const sortedStudents = [...enrichedStudents].sort((a, b) => 
        a.name?.localeCompare(b.name) || 0
      );
      
      setStudents(sortedStudents);
      
      const subjectName = getSubjectDisplay(cls.subject);
      const existingAttendanceData = await checkExistingAttendance(classId, date, subjectName);
      
      const initialAttendance = {};
      sortedStudents.forEach(student => {
        const studentId = student._id || student.id;
        initialAttendance[studentId] = existingAttendanceData[studentId] || 'present';
      });
      setAttendanceRecords(initialAttendance);
      
      toast.success(`Loaded ${sortedStudents.length} students`);
    } catch (error) {
      console.error('Error loading class data:', error);
      toast.error('Failed to load class data');
    }
  };

  const getSubjectDisplay = (subject) => {
    if (!subject) return 'Class';
    if (typeof subject === 'string') return subject;
    if (typeof subject === 'object') {
      return subject.name || subject.subject || 'Class';
    }
    return 'Class';
  };

  const getGradeDisplay = (grade) => {
    if (!grade) return '';
    if (typeof grade === 'string') return grade;
    if (typeof grade === 'object') {
      return grade.name || grade.grade || '';
    }
    return String(grade);
  };

  const getSectionDisplay = (section) => {
    if (!section) return '';
    if (typeof section === 'string') return section;
    if (typeof section === 'object') {
      return section.name || section.section || '';
    }
    return String(section);
  };

  const checkExistingAttendance = async (classId, selectedDate, subject) => {
    try {
      const userId = teacherId || localStorage.getItem('userId');
      if (!userId) {
        return {};
      }
      
      const formattedDate = selectedDate.split('T')[0];
      
      try {
        const response = await api.get(`/attendance/class/${classId}/date/${formattedDate}`);
        
        const attendanceMap = {};
        
        if (response.data && Array.isArray(response.data)) {
          response.data.forEach(record => {
            const studentId = record.studentId?._id || record.studentId;
            if (record.subject === subject && 
                (record.teacherId === userId || record.teacherId?._id === userId)) {
              attendanceMap[studentId] = record.status;
            }
          });
        }
        
        return attendanceMap;
      } catch (error) {
        return {};
      }
    } catch (error) {
      console.error('Error checking existing attendance:', error);
      return {};
    }
  };

  const fetchAllStudentsAttendance = async () => {
    if (!selectedClass) {
      toast.error('Please select a class first');
      return;
    }
    
    setIsLoadingHistory(true);
    setViewMode('all');
    setSelectedStudent(null);
    
    try {
      const startDate = historyDateRange.startDate;
      const endDate = historyDateRange.endDate;
      const subjectName = getSubjectDisplay(selectedClass.subject);
      const classId = selectedClass._id || selectedClass.id;
      
      let historyData = [];
      let response = null;
      
      try {
        response = await api.get(`/attendance/class/${classId}`, {
          params: { 
            startDate: startDate, 
            endDate: endDate,
            subject: subjectName 
          }
        });
      } catch (error) {
        try {
          response = await api.get(`/attendance/subject/${subjectName}`, {
            params: { 
              startDate: startDate, 
              endDate: endDate,
              classId: classId
            }
          });
        } catch (error2) {
          try {
            response = await api.get(`/attendance`, {
              params: { 
                classId: classId,
                startDate: startDate, 
                endDate: endDate
              }
            });
          } catch (error3) {
            throw new Error('Failed to fetch attendance data');
          }
        }
      }
      
      if (response && response.data) {
        if (Array.isArray(response.data)) {
          historyData = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          historyData = response.data.data;
        } else if (response.data.attendance && Array.isArray(response.data.attendance)) {
          historyData = response.data.attendance;
        } else if (response.data.records && Array.isArray(response.data.records)) {
          historyData = response.data.records;
        }
      }
      
      const groupedAttendance = {};
      
      students.forEach(student => {
        const studentId = student._id || student.id;
        groupedAttendance[studentId] = {
          studentId: studentId,
          studentName: student.name,
          rollNumber: student.rollNumber || 'N/A',
          profileImage: student.profileImage || null,
          sex: student.sex || null,
          age: student.age || null,
          records: [],
          present: 0,
          absent: 0,
          late: 0,
          total: 0
        };
      });
      
      historyData.forEach(record => {
        const studentId = record.studentId?._id || record.studentId;
        if (groupedAttendance[studentId]) {
          groupedAttendance[studentId].records.push({
            date: record.date,
            status: record.status,
            subject: record.subject,
            _id: record._id
          });
          groupedAttendance[studentId][record.status]++;
          groupedAttendance[studentId].total++;
        }
      });
      
      const allAttendanceArray = Object.values(groupedAttendance).map(student => ({
        ...student,
        attendancePercentage: student.total > 0 
          ? ((student.present + (student.late * 0.5)) / student.total * 100).toFixed(1) 
          : 0
      }));
      
      setAllStudentAttendance(allAttendanceArray);
      setAttendanceHistory([]);
      
      const studentsWithRecords = allAttendanceArray.filter(s => s.total > 0);
      if (studentsWithRecords.length === 0) {
        toast.info('No attendance records found for this period');
      } else {
        toast.success(`Found attendance data for ${studentsWithRecords.length} students`);
      }
    } catch (error) {
      console.error('Error fetching attendance history:', error);
      toast.error('Failed to fetch attendance history');
      setAllStudentAttendance([]);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const fetchStudentAttendanceHistory = async (studentId, studentName) => {
    setIsLoadingHistory(true);
    setSelectedStudent({ id: studentId, name: studentName });
    setViewMode('student');
    setAllStudentAttendance([]);
    
    try {
      if (!studentId) {
        toast.error('Invalid student ID');
        setIsLoadingHistory(false);
        return;
      }
      
      let historyData = [];
      let response = null;
      
      const endpoints = [
        `/attendance/student/${studentId}`,
        `/attendance/student/${studentId}/history`,
        `/attendance/student/${studentId}/all`
      ];
      
      for (const endpoint of endpoints) {
        try {
          response = await api.get(endpoint);
          if (response && response.data) {
            if (Array.isArray(response.data) && response.data.length > 0) {
              historyData = response.data;
              break;
            } else if (response.data.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
              historyData = response.data.data;
              break;
            } else if (response.data.attendance && Array.isArray(response.data.attendance) && response.data.attendance.length > 0) {
              historyData = response.data.attendance;
              break;
            } else if (response.data.records && Array.isArray(response.data.records) && response.data.records.length > 0) {
              historyData = response.data.records;
              break;
            }
          }
        } catch (err) {
          continue;
        }
      }
      
      if (historyData.length === 0 && selectedClass) {
        try {
          const classId = selectedClass._id || selectedClass.id;
          const classResponse = await api.get(`/attendance/class/${classId}`, {
            params: { 
              startDate: historyDateRange.startDate, 
              endDate: historyDateRange.endDate 
            }
          });
          
          let classData = [];
          if (classResponse.data) {
            if (Array.isArray(classResponse.data)) {
              classData = classResponse.data;
            } else if (classResponse.data.data && Array.isArray(classResponse.data.data)) {
              classData = classResponse.data.data;
            } else if (classResponse.data.attendance && Array.isArray(classResponse.data.attendance)) {
              classData = classResponse.data.attendance;
            }
          }
          
          historyData = classData.filter(record => {
            const recordStudentId = record.studentId?._id || record.studentId;
            return recordStudentId === studentId;
          });
        } catch (err) {}
      }
      
      const subjectName = getSubjectDisplay(selectedClass?.subject);
      if (subjectName && subjectName !== 'Class' && historyData.length > 0) {
        historyData = historyData.filter(record => record.subject === subjectName);
      }
      
      if (historyData.length > 0) {
        historyData = historyData.filter(record => {
          if (!record.date) return false;
          const recordDate = new Date(record.date).toISOString().split('T')[0];
          return recordDate >= historyDateRange.startDate && recordDate <= historyDateRange.endDate;
        });
      }
      
      historyData.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      setAttendanceHistory(historyData);
      
      if (historyData.length === 0) {
        toast.info(`No attendance records found for ${studentName} in this period`);
      } else {
        toast.success(`Found ${historyData.length} attendance records for ${studentName}`);
      }
    } catch (error) {
      console.error('Error fetching student attendance:', error);
      toast.error('Failed to fetch student attendance');
      setAttendanceHistory([]);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleEditRecord = async (recordId, newStatus) => {
    try {
      await api.put(`/attendance/${recordId}`, { status: newStatus });
      toast.success('Attendance record updated successfully');
      
      if (viewMode === 'student' && selectedStudent) {
        await fetchStudentAttendanceHistory(selectedStudent.id, selectedStudent.name);
      } else if (viewMode === 'all') {
        await fetchAllStudentsAttendance();
      }
      
      setEditingRecord(null);
    } catch (error) {
      console.error('Error updating attendance:', error);
      toast.error('Failed to update attendance');
    }
  };

  const handleDeleteRecord = async (recordId) => {
    try {
      await api.delete(`/attendance/${recordId}`);
      toast.success('Attendance record deleted successfully');
      
      if (viewMode === 'student' && selectedStudent) {
        await fetchStudentAttendanceHistory(selectedStudent.id, selectedStudent.name);
      } else if (viewMode === 'all') {
        await fetchAllStudentsAttendance();
      }
      
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting attendance:', error);
      toast.error('Failed to delete attendance record');
    }
  };

  const handleStatusChange = (studentId, status) => {
    setAttendanceRecords(prev => ({ ...prev, [studentId]: status }));
  };

  const handleBulkStatusChange = (status) => {
    const updatedRecords = {};
    students.forEach(student => {
      const studentId = student._id || student.id;
      updatedRecords[studentId] = status;
    });
    setAttendanceRecords(updatedRecords);
    toast.success(`All students marked as ${status}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedClass) {
      toast.error('No class selected');
      return;
    }
    
    setIsSubmitting(true);
    
    const userId = teacherId || localStorage.getItem('userId');
    const formattedDate = date.split('T')[0];
    const subjectName = getSubjectDisplay(selectedClass.subject);
    
    const attendanceData = Object.entries(attendanceRecords).map(([studentId, status]) => ({
      studentId: studentId,
      classId: selectedClass._id || selectedClass.id,
      subject: subjectName,
      status: status,
      date: formattedDate,
      teacherId: userId
    }));
    
    try {
      await api.post('/attendance/bulk', { records: attendanceData });
      toast.success(`Attendance saved successfully`);
      
      const existingAttendanceData = await checkExistingAttendance(selectedClass._id || selectedClass.id, date, subjectName);
      const updatedRecords = {};
      students.forEach(student => {
        const studentId = student._id || student.id;
        updatedRecords[studentId] = existingAttendanceData[studentId] || attendanceRecords[studentId] || 'present';
      });
      setAttendanceRecords(updatedRecords);
    } catch (error) {
      console.error('Error saving attendance:', error);
      toast.error(error.response?.data?.message || 'Failed to save attendance');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800';
      case 'absent': return 'bg-red-100 text-red-800';
      case 'late': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'present': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'absent': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'late': return <Clock className="w-4 h-4 text-yellow-600" />;
      default: return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present': return 'green';
      case 'absent': return 'red';
      case 'late': return 'yellow';
      default: return 'gray';
    }
  };

  const openDetailModal = (student) => {
    setSelectedStudentDetail(student);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedStudentDetail(null);
  };

  const filteredAllAttendance = allStudentAttendance.filter(student => 
    student.studentName?.toLowerCase().includes(attendanceSearchTerm.toLowerCase()) ||
    student.rollNumber?.toString().includes(attendanceSearchTerm)
  );

  const sortedAllAttendance = [...filteredAllAttendance].sort((a, b) => {
    const comparison = a.studentName?.localeCompare(b.studentName) || 0;
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const filteredStudentsList = students.filter(student => {
    const studentId = student._id || student.id;
    const matchesSearch = student.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         student.rollNumber?.toString().includes(searchTerm);
    const matchesFilter = filterStatus === 'all' || attendanceRecords[studentId] === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const sortedFilteredStudents = [...filteredStudentsList].sort((a, b) => {
    const comparison = a.name?.localeCompare(b.name) || 0;
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  if (loadingClasses) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-200 border-t-cyan-600"></div>
        </div>
      </div>
    );
  }

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
              <Calendar size={40} />
              <div>
                <h2 className="hero-title">📋 Attendance Management</h2>
                <p className="hero-subtitle">Select a class to manage attendance</p>
              </div>
            </div>
          </div>

          {classes.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-200">
              <Users className="w-12 h-12 mx-auto text-gray-400 mb-3" />
              <p className="text-gray-500 text-lg font-semibold">No classes assigned to you</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {classes.map((cls) => {
                const displaySubject = getSubjectDisplay(cls.subject);
                const displayGrade = getGradeDisplay(cls.grade);
                const displaySection = getSectionDisplay(cls.section);
                const studentCount = cls.students?.length || cls.enrolledStudents?.length || 0;
                const classId = cls._id || cls.id;
                
                return (
                  <div key={classId} className="class-card">
                    <div className="class-icon">📖</div>
                    <h4 className="class-title">{displaySubject}</h4>
                    <p className="class-info">
                      {displayGrade && `Grade ${displayGrade}`} 
                      {displayGrade && displaySection && ' - '}
                      {displaySection && `Section ${displaySection}`}
                    </p>
                    <div className="class-stats">
                      <div className="class-stat-item">
                        <div className="class-stat-number">{studentCount}</div>
                        <div className="class-stat-label">Students</div>
                      </div>
                      <div className="class-stat-item">
                        <div className="class-stat-number">{cls.subjects?.length || 0}</div>
                        <div className="class-stat-label">Subjects</div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleClassSelect(classId)}
                      className="class-view-btn"
                    >
                      Manage Attendance →
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  const displaySubject = getSubjectDisplay(selectedClass.subject);
  const displayGrade = getGradeDisplay(selectedClass.grade);
  const displaySection = getSectionDisplay(selectedClass.section);
  
  const stats = { present: 0, absent: 0, late: 0 };
  Object.values(attendanceRecords).forEach(status => {
    if (stats[status] !== undefined) stats[status]++;
  });

  return (
    <div className="max-w-full mx-auto p-4 md:p-6">
      <style>{`
        .attendance-container { animation: fadeIn 0.5s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .attendance-header {
          background: linear-gradient(135deg, #0e7490 0%, #0891b2 50%, #22d3ee 100%);
          color: white;
          padding: 30px;
          border-radius: 15px;
          margin-bottom: 30px;
          box-shadow: 0 10px 40px rgba(8, 145, 178, 0.3);
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
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
        .status-present { background: #d1fae5; color: #059669; }
        .status-absent { background: #fee2e2; color: #dc2626; }
        .status-late { background: #fef3c7; color: #f59e0b; }
        .tab-btn {
          padding: 10px 20px;
          border-radius: 8px 8px 0 0;
          font-weight: 600;
          font-size: 14px;
          transition: all 0.3s;
          border: none;
          cursor: pointer;
        }
        .tab-btn-active {
          background: white;
          color: #0e7490;
          border-bottom: 3px solid #0e7490;
        }
        .tab-btn-inactive {
          background: transparent;
          color: #6b7280;
          border-bottom: 3px solid transparent;
        }
        .tab-btn-inactive:hover {
          color: #1f2937;
          background: #f3f4f6;
        }
        .btn-status {
          padding: 6px 14px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: all 0.3s;
        }
        .btn-status-present { background: #d1fae5; color: #059669; }
        .btn-status-present:hover { background: #a7f3d0; }
        .btn-status-present-active { background: #059669; color: white; }
        .btn-status-absent { background: #fee2e2; color: #dc2626; }
        .btn-status-absent:hover { background: #fca5a5; }
        .btn-status-absent-active { background: #dc2626; color: white; }
        .btn-status-late { background: #fef3c7; color: #f59e0b; }
        .btn-status-late:hover { background: #fcd34d; }
        .btn-status-late-active { background: #f59e0b; color: white; }
      `}</style>

      <div className="attendance-container">
        <div className="attendance-header">
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
              <h2 className="text-2xl font-bold">{displaySubject}</h2>
              <p className="text-cyan-100 mt-1">
                {displayGrade && `Grade ${displayGrade}`} 
                {displayGrade && displaySection && ' - '}
                {displaySection && `Section ${displaySection}`} | Total Students: {students.length}
              </p>
              <p className="text-cyan-100/80 text-sm mt-1">
                Date: {new Date(date).toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => {
                  setDate(new Date().toISOString().split('T')[0]);
                }}
                className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition font-semibold flex items-center gap-2"
              >
                <RefreshCw size={18} />
                Today
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200 flex gap-1">
          <button 
            onClick={() => setActiveTab('mark')} 
            className={`tab-btn ${activeTab === 'mark' ? 'tab-btn-active' : 'tab-btn-inactive'}`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Mark Attendance
            </div>
          </button>
          <button 
            onClick={() => setActiveTab('view')} 
            className={`tab-btn ${activeTab === 'view' ? 'tab-btn-active' : 'tab-btn-inactive'}`}
          >
            <div className="flex items-center gap-2">
              <History className="w-4 h-4" />
              View History
            </div>
          </button>
        </div>

        {/* Mark Attendance Tab */}
        {activeTab === 'mark' && (
          <form onSubmit={handleSubmit}>
            <div className="filter-box">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Date</label>
                  <input 
                    type="date" 
                    value={date} 
                    onChange={async (e) => {
                      const newDate = e.target.value;
                      setDate(newDate);
                      if (selectedClass) {
                        const subjectName = getSubjectDisplay(selectedClass.subject);
                        const existingData = await checkExistingAttendance(selectedClass._id || selectedClass.id, newDate, subjectName);
                        const updatedRecords = {};
                        students.forEach(student => {
                          const studentId = student._id || student.id;
                          updatedRecords[studentId] = existingData[studentId] || attendanceRecords[studentId] || 'present';
                        });
                        setAttendanceRecords(updatedRecords);
                      }
                    }} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Quick Actions</label>
                  <div className="flex gap-2">
                    <button 
                      type="button" 
                      onClick={() => handleBulkStatusChange('present')} 
                      className="flex-1 px-3 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-semibold"
                    >
                      All Present
                    </button>
                    <button 
                      type="button" 
                      onClick={() => handleBulkStatusChange('absent')} 
                      className="flex-1 px-3 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-semibold"
                    >
                      All Absent
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Sort Students</label>
                  <button
                    type="button"
                    onClick={toggleSortOrder}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  >
                    <span className="font-medium text-gray-700">
                      {sortOrder === 'asc' ? 'A → Z' : 'Z → A'}
                    </span>
                    {sortOrder === 'asc' ? (
                      <ArrowUp className="w-4 h-4 text-gray-500" />
                    ) : (
                      <ArrowDown className="w-4 h-4 text-gray-500" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
              <div className="stat-card" style={{borderTopColor: '#3b82f6'}}>
                <div className="stat-label">Total Students</div>
                <div className="stat-value" style={{color: '#3b82f6'}}>{students.length}</div>
              </div>
              <div className="stat-card" style={{borderTopColor: '#10b981'}}>
                <div className="stat-label">Present</div>
                <div className="stat-value" style={{color: '#10b981'}}>{stats.present}</div>
              </div>
              <div className="stat-card" style={{borderTopColor: '#ef4444'}}>
                <div className="stat-label">Absent</div>
                <div className="stat-value" style={{color: '#ef4444'}}>{stats.absent}</div>
              </div>
              <div className="stat-card" style={{borderTopColor: '#f59e0b'}}>
                <div className="stat-label">Late</div>
                <div className="stat-value" style={{color: '#f59e0b'}}>{stats.late}</div>
              </div>
            </div>

            {/* Search Bar */}
            <div className="bg-white border border-gray-200 rounded-lg p-3 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Search Students</label>
                  <input 
                    type="text" 
                    placeholder="Search by name or roll number..." 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Filter by Status</label>
                  <select 
                    value={filterStatus} 
                    onChange={(e) => setFilterStatus(e.target.value)} 
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  >
                    <option value="all">All Status</option>
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                    <option value="late">Late</option>
                  </select>
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-500 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Showing {sortedFilteredStudents.length} of {students.length} students
                <Badge text={`${sortOrder === 'asc' ? 'A-Z' : 'Z-A'}`} color="blue" />
              </div>
            </div>

            {/* Attendance Table */}
            <div className="table-container">
              {students.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No students found in this class.</p>
                </div>
              ) : sortedFilteredStudents.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No students match your search.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead className="table-header">
                      <tr>
                        <th className="text-center">Roll No</th>
                        <th className="text-center">Photo</th>
                        <th className="text-left">Student Name</th>
                        <th className="text-center">Gender</th>
                        <th className="text-center">Age</th>
                        <th className="text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedFilteredStudents.map((student, index) => {
                        const studentId = student._id || student.id;
                        const studentImage = getStudentImage(student);
                        const currentStatus = attendanceRecords[studentId] || 'present';
                        
                        return (
                          <tr key={studentId} className={`table-row ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                            <td className="text-center font-medium text-gray-700">
                              {student.rollNumber || '-'}
                            </td>
                            <td className="text-center">
                              <Avatar name={student.name} image={studentImage} size={40} />
                            </td>
                            <td className="font-medium text-gray-900">
                              {student.name}
                            </td>
                            <td className="text-center text-gray-700">
                              {student.sex || '-'}
                            </td>
                            <td className="text-center text-gray-700">
                              {student.age || '-'}
                            </td>
                            <td className="text-center">
                              <div className="flex gap-1.5 justify-center">
                                <button
                                  type="button"
                                  className={`btn-status ${currentStatus === 'present' ? 'btn-status-present-active' : 'btn-status-present'}`}
                                  onClick={() => handleStatusChange(studentId, 'present')}
                                >
                                  <CheckCircle className="w-3.5 h-3.5 inline mr-1" />
                                  Present
                                </button>
                                <button
                                  type="button"
                                  className={`btn-status ${currentStatus === 'absent' ? 'btn-status-absent-active' : 'btn-status-absent'}`}
                                  onClick={() => handleStatusChange(studentId, 'absent')}
                                >
                                  <XCircle className="w-3.5 h-3.5 inline mr-1" />
                                  Absent
                                </button>
                                <button
                                  type="button"
                                  className={`btn-status ${currentStatus === 'late' ? 'btn-status-late-active' : 'btn-status-late'}`}
                                  onClick={() => handleStatusChange(studentId, 'late')}
                                >
                                  <Clock className="w-3.5 h-3.5 inline mr-1" />
                                  Late
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Save Button */}
            <div className="flex justify-end mt-6">
              <button 
                type="submit" 
                disabled={isSubmitting || students.length === 0} 
                className="flex items-center gap-2 px-6 py-2.5 bg-cyan-600 text-white text-sm font-semibold rounded-lg hover:bg-cyan-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                <span>{isSubmitting ? 'Saving...' : 'Save Attendance'}</span>
              </button>
            </div>
          </form>
        )}

        {/* View History Tab */}
        {activeTab === 'view' && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Attendance History</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Start Date</label>
                <input 
                  type="date" 
                  value={historyDateRange.startDate} 
                  onChange={(e) => setHistoryDateRange(prev => ({ ...prev, startDate: e.target.value }))} 
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">End Date</label>
                <input 
                  type="date" 
                  value={historyDateRange.endDate} 
                  onChange={(e) => setHistoryDateRange(prev => ({ ...prev, endDate: e.target.value }))} 
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400" 
                />
              </div>
              <div className="flex items-end gap-2">
                <button 
                  onClick={fetchAllStudentsAttendance} 
                  className="flex-1 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition font-semibold text-sm flex items-center justify-center gap-2"
                >
                  <Users className="w-4 h-4" />
                  View All Students
                </button>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Search Individual Student</label>
              <select 
                onChange={(e) => { 
                  if(e.target.value) { 
                    const student = students.find(s => (s._id || s.id) === e.target.value); 
                    if(student) fetchStudentAttendanceHistory(student._id || student.id, student.name); 
                  } 
                }} 
                className="w-full md:w-96 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400" 
                defaultValue=""
              >
                <option value="">Select a student...</option>
                {students.map(student => {
                  const studentId = student._id || student.id;
                  return (
                    <option key={studentId} value={studentId}>
                      {student.rollNumber || 'N/A'} - {student.name}
                    </option>
                  );
                })}
              </select>
            </div>
            
            {isLoadingHistory && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-200 border-t-cyan-600 mx-auto"></div>
                <p className="mt-4 text-gray-600 font-medium">Loading attendance data...</p>
              </div>
            )}
            
            {!isLoadingHistory && viewMode === 'all' && (
              <div>
                <div className="mb-4 p-4 bg-cyan-50 border border-cyan-200 rounded-lg">
                  <h4 className="font-semibold text-gray-900">All Students Attendance Summary</h4>
                  <p className="text-sm text-gray-600">{displaySubject} {displayGrade && `- Grade ${displayGrade}`} {displaySection && `- Section ${displaySection}`}</p>
                  <p className="text-sm text-gray-500">Period: {historyDateRange.startDate} to {historyDateRange.endDate}</p>
                </div>
                
                <div className="mb-4">
                  <input 
                    type="text" 
                    placeholder="Search student by name or roll number..." 
                    value={attendanceSearchTerm} 
                    onChange={(e) => setAttendanceSearchTerm(e.target.value)} 
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400" 
                  />
                </div>
                
                {sortedAllAttendance.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No attendance records found for this period.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead className="table-header">
                        <tr>
                          <th className="text-center">Roll No</th>
                          <th className="text-center">Photo</th>
                          <th className="text-left">Name</th>
                          <th className="text-center">Present</th>
                          <th className="text-center">Absent</th>
                          <th className="text-center">Late</th>
                          <th className="text-center">Total</th>
                          <th className="text-center">Attendance %</th>
                          <th className="text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedAllAttendance.map((student, index) => {
                          const studentImage = student.profileImage || null;
                          return (
                            <tr key={student.studentId} className={`table-row ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                              <td className="text-center font-medium text-gray-700">
                                {student.rollNumber}
                              </td>
                              <td className="text-center">
                                <Avatar name={student.studentName} image={studentImage} size={35} />
                              </td>
                              <td className="font-medium text-gray-900">
                                {student.studentName}
                              </td>
                              <td className="text-center text-green-600 font-semibold">
                                {student.present}
                              </td>
                              <td className="text-center text-red-600 font-semibold">
                                {student.absent}
                              </td>
                              <td className="text-center text-yellow-600 font-semibold">
                                {student.late}
                              </td>
                              <td className="text-center font-semibold">
                                {student.total}
                              </td>
                              <td className="text-center">
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                  student.attendancePercentage >= 75 
                                    ? 'bg-green-100 text-green-800' 
                                    : student.attendancePercentage >= 60 
                                      ? 'bg-yellow-100 text-yellow-800' 
                                      : 'bg-red-100 text-red-800'
                                }`}>
                                  {student.attendancePercentage}%
                                </span>
                              </td>
                              <td className="text-center">
                                <div className="flex gap-2 justify-center">
                                  <button 
                                    onClick={() => openDetailModal(student)} 
                                    className="px-3 py-1 bg-cyan-600 text-white text-xs font-semibold rounded-lg hover:bg-cyan-700 transition flex items-center gap-1"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                    Details
                                  </button>
                                  <button 
                                    onClick={() => fetchStudentAttendanceHistory(student.studentId, student.studentName)} 
                                    className="px-3 py-1 bg-gray-600 text-white text-xs font-semibold rounded-lg hover:bg-gray-700 transition flex items-center gap-1"
                                  >
                                    <History className="w-3.5 h-3.5" />
                                    History
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
            
            {!isLoadingHistory && viewMode === 'student' && selectedStudent && (
              <div>
                <div className="mb-4 p-4 bg-cyan-50 border border-cyan-200 rounded-lg flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold text-gray-900">Attendance History: {selectedStudent.name}</h4>
                    <p className="text-sm text-gray-600">Total Records: {attendanceHistory.length}</p>
                    <p className="text-sm text-gray-500">Period: {historyDateRange.startDate} to {historyDateRange.endDate}</p>
                  </div>
                  <button 
                    onClick={() => { 
                      setViewMode('all'); 
                      setSelectedStudent(null); 
                      fetchAllStudentsAttendance(); 
                    }} 
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-sm font-semibold flex items-center gap-2"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Back to All Students
                  </button>
                </div>
                
                {attendanceHistory.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <StatCard 
                      icon={CheckCircle} 
                      label="Present" 
                      value={attendanceHistory.filter(r => r.status === 'present').length} 
                      color="green" 
                    />
                    <StatCard 
                      icon={XCircle} 
                      label="Absent" 
                      value={attendanceHistory.filter(r => r.status === 'absent').length} 
                      color="red" 
                    />
                    <StatCard 
                      icon={Clock} 
                      label="Late" 
                      value={attendanceHistory.filter(r => r.status === 'late').length} 
                      color="yellow" 
                    />
                    <StatCard 
                      icon={TrendingUp} 
                      label="Attendance %" 
                      value={(() => {
                        const total = attendanceHistory.length;
                        const present = attendanceHistory.filter(r => r.status === 'present').length;
                        const late = attendanceHistory.filter(r => r.status === 'late').length;
                        const pct = total > 0 ? ((present + (late * 0.5)) / total * 100).toFixed(1) : 0;
                        return `${pct}%`;
                      })()} 
                      color={(() => {
                        const total = attendanceHistory.length;
                        const present = attendanceHistory.filter(r => r.status === 'present').length;
                        const late = attendanceHistory.filter(r => r.status === 'late').length;
                        const pct = total > 0 ? ((present + (late * 0.5)) / total * 100) : 0;
                        return pct >= 75 ? 'green' : pct >= 60 ? 'yellow' : 'red';
                      })()} 
                    />
                  </div>
                )}
                
                {attendanceHistory.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No attendance records found for this student.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead className="table-header">
                        <tr>
                          <th className="text-center">#</th>
                          <th className="text-left">Date</th>
                          <th className="text-center">Status</th>
                          <th className="text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attendanceHistory.map((record, index) => (
                          <tr key={record._id} className={`table-row ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                            <td className="text-center font-medium text-gray-500">
                              {index + 1}
                            </td>
                            <td className="font-medium text-gray-700">
                              {new Date(record.date).toLocaleDateString('en-US', { 
                                weekday: 'short', 
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric' 
                              })}
                            </td>
                            <td className="text-center">
                              {editingRecord === record._id ? (
                                <select 
                                  value={record.status} 
                                  onChange={(e) => handleEditRecord(record._id, e.target.value)} 
                                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
                                  autoFocus
                                >
                                  <option value="present">Present</option>
                                  <option value="absent">Absent</option>
                                  <option value="late">Late</option>
                                </select>
                              ) : (
                                <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 ${getStatusBadgeClass(record.status)}`}>
                                  {getStatusIcon(record.status)}
                                  {record.status.toUpperCase()}
                                </span>
                              )}
                            </td>
                            <td className="text-center">
                              <div className="flex gap-2 justify-center">
                                {editingRecord === record._id ? (
                                  <button 
                                    onClick={() => setEditingRecord(null)} 
                                    className="px-3 py-1 bg-gray-400 text-white text-xs font-semibold rounded-lg hover:bg-gray-500 transition"
                                  >
                                    Cancel
                                  </button>
                                ) : (
                                  <>
                                    <button 
                                      onClick={() => setEditingRecord(record._id)} 
                                      className="px-3 py-1 bg-cyan-600 text-white text-xs font-semibold rounded-lg hover:bg-cyan-700 transition flex items-center gap-1"
                                    >
                                      <Edit2 className="w-3 h-3" />
                                      Edit
                                    </button>
                                    <button 
                                      onClick={() => setShowDeleteConfirm(record._id)} 
                                      className="px-3 py-1 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 transition flex items-center gap-1"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                      Delete
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedStudentDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-cyan-600 to-blue-600 text-white p-4 rounded-t-xl flex justify-between items-center">
              <h3 className="text-xl font-bold">Student Attendance Details</h3>
              <button 
                onClick={closeDetailModal} 
                className="p-2 hover:bg-white/20 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200">
                <Avatar 
                  name={selectedStudentDetail.studentName} 
                  image={selectedStudentDetail.profileImage} 
                  size={100} 
                />
                <div>
                  <h4 className="text-lg font-bold text-gray-900">{selectedStudentDetail.studentName}</h4>
                  <p className="text-sm text-gray-600">Roll No: {selectedStudentDetail.rollNumber}</p>
                  <p className="text-sm text-gray-600">Gender: {selectedStudentDetail.sex || '-'}</p>
                  <p className="text-sm text-gray-600">Age: {selectedStudentDetail.age || '-'}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                  <p className="text-xs font-bold text-green-700 uppercase">Present</p>
                  <p className="text-2xl font-bold text-green-700">{selectedStudentDetail.present}</p>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                  <p className="text-xs font-bold text-red-700 uppercase">Absent</p>
                  <p className="text-2xl font-bold text-red-700">{selectedStudentDetail.absent}</p>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
                  <p className="text-xs font-bold text-yellow-700 uppercase">Late</p>
                  <p className="text-2xl font-bold text-yellow-700">{selectedStudentDetail.late}</p>
                </div>
                <div className={`border rounded-lg p-3 text-center ${
                  selectedStudentDetail.attendancePercentage >= 75 ? 'bg-green-50 border-green-200' : 
                  selectedStudentDetail.attendancePercentage >= 60 ? 'bg-yellow-50 border-yellow-200' : 
                  'bg-red-50 border-red-200'
                }`}>
                  <p className={`text-xs font-bold uppercase ${
                    selectedStudentDetail.attendancePercentage >= 75 ? 'text-green-700' : 
                    selectedStudentDetail.attendancePercentage >= 60 ? 'text-yellow-700' : 
                    'text-red-700'
                  }`}>Attendance %</p>
                  <p className={`text-2xl font-bold ${
                    selectedStudentDetail.attendancePercentage >= 75 ? 'text-green-700' : 
                    selectedStudentDetail.attendancePercentage >= 60 ? 'text-yellow-700' : 
                    'text-red-700'
                  }`}>{selectedStudentDetail.attendancePercentage}%</p>
                </div>
              </div>
              
              <h5 className="font-semibold text-gray-900 mb-3">Recent Records</h5>
              {selectedStudentDetail.records.length === 0 ? (
                <p className="text-gray-500 text-sm">No records found</p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {selectedStudentDetail.records.slice(0, 10).map((record, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-200">
                      <span className="text-sm text-gray-700">
                        {new Date(record.date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </span>
                      <Badge 
                        text={record.status.toUpperCase()} 
                        color={getStatusColor(record.status)} 
                      />
                    </div>
                  ))}
                  {selectedStudentDetail.records.length > 10 && (
                    <p className="text-xs text-gray-500 text-center">
                      Showing 10 of {selectedStudentDetail.records.length} records
                    </p>
                  )}
                </div>
              )}
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => {
                    closeDetailModal();
                    fetchStudentAttendanceHistory(
                      selectedStudentDetail.studentId, 
                      selectedStudentDetail.studentName
                    );
                  }}
                  className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition font-semibold text-sm"
                >
                  View Full History
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-red-600" />
              <h3 className="text-lg font-semibold text-gray-900">Confirm Delete</h3>
            </div>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this attendance record? This action cannot be undone.</p>
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setShowDeleteConfirm(null)} 
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-semibold text-sm"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleDeleteRecord(showDeleteConfirm)} 
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold text-sm flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceManager;