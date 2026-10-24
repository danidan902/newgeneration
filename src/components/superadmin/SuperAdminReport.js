import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, PieChart, Pie, LineChart, Line } from 'recharts';
import toast from 'react-hot-toast';
import api from '../../services/api';
import * as XLSX from 'xlsx';
import { X, User, Mail, Phone, Calendar, BookOpen, Award, TrendingUp, Eye, ChevronLeft, Settings, Search, Download, FileSpreadsheet, RefreshCw, Trophy, BarChart3, ArrowLeft, Users, CheckCircle, XCircle, AlertCircle, GraduationCap, MapPin, Clock, Edit2, Trash2, Printer, Home, School } from 'lucide-react';

const COLORS = ['#0e7490', '#0891b2', '#22d3ee', '#06b6d4', '#67e8f9', '#a5f3fc'];

// ============================================
// 📊 AVATAR COMPONENT
// ============================================
const Avatar = ({ name, image, size = 40 }) => {
  const [imgError, setImgError] = useState(false);
  
  if (image && !imgError) {
    return (
      <img 
        src={image} 
        alt={name || 'Student'} 
        className="rounded-full object-cover border-2 border-cyan-200"
        style={{ width: size, height: size }}
        onError={() => setImgError(true)}
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
// 📊 STUDENT PROFILE PAGE (Full Page) — responsive
// ============================================
const StudentProfilePage = ({ student, reportData, onBack }) => {
  if (!student) return null;

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
    { label: 'Email', value: student.email, icon: Mail },
    { label: 'Phone', value: student.phone || student.parentPhone || '-', icon: Phone },
    { label: 'Gender', value: student.sex || '-', icon: Users },
    { label: 'Age', value: student.age || '-', icon: Calendar },
    { label: 'Date of Birth', value: student.dob || '-', icon: Calendar },
    { label: 'Address', value: student.address || '-', icon: MapPin },
    { label: 'Parent Name', value: student.parentName || '-', icon: User },
    { label: 'Parent Phone', value: student.parentPhone || '-', icon: Phone },
  ];

  const academicInfo = [
    { label: 'Roll Number', value: student.rollNumber || '-', icon: BookOpen },
    { label: 'Class', value: reportData?.classInfo || student.grade || '-', icon: School },
    { label: 'Section', value: student.section || '-', icon: MapPin },
    { label: 'Program', value: student.programs || student.program || '-', icon: GraduationCap },
    { label: 'Academic Year', value: student.academicYear || '-', icon: Calendar },
    { label: 'Total Subjects', value: student.totalSubjects || 0, icon: BookOpen },
    { label: 'Total Marks', value: student.totalMarks || 0, icon: Award },
    { label: 'Percentage', value: `${student.academicPercentage || 0}%`, icon: TrendingUp },
    { label: 'Result', value: student.status || 'N/A', icon: CheckCircle },
    { label: 'Grade', value: student.grade || 'N/A', icon: Trophy },
  ];

  return (
    <div className="max-w-7xl mx-auto p-3 sm:p-4 md:p-6">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=Poppins:wght@300;400;500;600;700&display=swap');
        .profile-container { animation: fadeIn 0.5s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .profile-header {
          background: linear-gradient(135deg, #0e7490 0%, #0891b2 50%, #22d3ee 100%);
          color: white;
          padding: 20px;
          border-radius: 15px;
          margin-bottom: 20px;
          box-shadow: 0 10px 40px rgba(8, 145, 178, 0.3);
        }
        @media (min-width: 768px) {
          .profile-header { padding: 35px; margin-bottom: 30px; }
        }
        .profile-badge {
          display: inline-block;
          background: rgba(255,255,255,0.2);
          padding: 3px 10px;
          border-radius: 20px;
          font-size: 11px;
          margin-right: 4px;
          margin-top: 4px;
          word-break: break-word;
          max-width: 100%;
        }
        @media (min-width: 768px) {
          .profile-badge { padding: 4px 14px; font-size: 12px; }
        }
        .profile-stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
          margin-bottom: 20px;
        }
        @media (min-width: 640px) {
          .profile-stats-grid { grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 30px; }
        }
        .profile-stat-card {
          background: white;
          padding: 14px;
          border-radius: 12px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.06);
          text-align: center;
          border-top: 4px solid #0891b2;
          border: 1px solid #e2e8f0;
          transition: all 0.3s;
        }
        @media (min-width: 768px) { .profile-stat-card { padding: 18px; } }
        .profile-stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(8, 145, 178, 0.12);
        }
        .profile-stat-value { font-size: 20px; font-weight: 700; color: #0e7490; margin: 6px 0; word-break: break-word; }
        .profile-stat-label { font-size: 10px; color: #999; text-transform: uppercase; letter-spacing: 0.5px; }
        @media (min-width: 768px) {
          .profile-stat-value { font-size: 26px; }
          .profile-stat-label { font-size: 11px; }
        }
        .profile-info-table {
          width: 100%;
          border-collapse: collapse;
          background: white;
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid #e2e8f0;
          font-size: 12px;
        }
        @media (min-width: 768px) { .profile-info-table { font-size: 14px; } }
        .profile-info-table th {
          background: linear-gradient(135deg, #0e7490, #0891b2);
          color: white;
          padding: 8px 10px;
          text-align: left;
          font-weight: 600;
          border: 1px solid #0c6a82;
        }
        @media (min-width: 768px) { .profile-info-table th { padding: 12px 16px; } }
        .profile-info-table td {
          padding: 8px 10px;
          border: 1px solid #e2e8f0;
          word-break: break-word;
        }
        @media (min-width: 768px) { .profile-info-table td { padding: 12px 16px; } }
        .profile-info-table tr:nth-child(even) td { background: #f8fafc; }
        .profile-info-table tr:hover td { background: #f0f9ff; }
        .profile-back-btn {
          background: white;
          color: #0e7490;
          border: 2px solid #0e7490;
          padding: 9px 16px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
        }
        @media (min-width: 768px) { .profile-back-btn { padding: 10px 24px; font-size: 14px; } }
        .profile-back-btn:hover {
          background: #0e7490;
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(8, 145, 178, 0.3);
        }
        .profile-subject-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 12px;
          margin-bottom: 12px;
          transition: all 0.3s;
        }
        @media (min-width: 768px) { .profile-subject-card { padding: 16px; } }
        .profile-subject-card:hover {
          box-shadow: 0 4px 15px rgba(8, 145, 178, 0.1);
          border-color: #0891b2;
        }
        .profile-grade-badge {
          padding: 3px 10px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 700;
        }
        @media (min-width: 768px) { .profile-grade-badge { padding: 4px 12px; font-size: 14px; } }
        .profile-section-title {
          font-size: 16px;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        @media (min-width: 768px) { .profile-section-title { font-size: 20px; margin-bottom: 16px; gap: 10px; } }
        .profile-section-title .icon { color: #0891b2; flex-shrink: 0; }
      `}</style>

      <div className="profile-container">
        <button onClick={onBack} className="profile-back-btn mb-4 sm:mb-6">
          <ArrowLeft size={16} /> Back to Reports
        </button>

        <div className="profile-header">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 text-center sm:text-left">
            <Avatar name={student.name} image={student.profileImage} size={90} />
            <div className="min-w-0 w-full">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold break-words">{student.name}</h2>
              <div className="flex flex-wrap gap-1 mt-2 justify-center sm:justify-start">
                <span className="profile-badge">Roll No: {student.rollNumber}</span>
                <span className="profile-badge">Email: {student.email}</span>
                <span className="profile-badge">Class: {reportData?.classInfo}</span>
                <span className="profile-badge">Status: {student.status}</span>
                <span className="profile-badge">Grade: {student.grade}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="profile-stats-grid">
          <div className="profile-stat-card" style={{borderTopColor: '#3b82f6'}}>
            <div className="profile-stat-label">Total Subjects</div>
            <div className="profile-stat-value" style={{color: '#3b82f6'}}>{student.totalSubjects}</div>
          </div>
          <div className="profile-stat-card" style={{borderTopColor: '#10b981'}}>
            <div className="profile-stat-label">Total Marks</div>
            <div className="profile-stat-value" style={{color: '#10b981'}}>{student.totalMarks}</div>
          </div>
          <div className="profile-stat-card" style={{borderTopColor: '#8b5cf6'}}>
            <div className="profile-stat-label">Percentage</div>
            <div className="profile-stat-value" style={{color: '#8b5cf6'}}>{student.academicPercentage}%</div>
          </div>
          <div className="profile-stat-card" style={{borderTopColor: student.status === 'Passed' ? '#10b981' : '#ef4444'}}>
            <div className="profile-stat-label">Result</div>
            <div className="profile-stat-value" style={{color: student.status === 'Passed' ? '#10b981' : '#ef4444'}}>
              {student.status} - {student.grade}
            </div>
          </div>
        </div>

        <div className="mb-6 sm:mb-8">
          <h3 className="profile-section-title">
            <User className="icon" size={20} />
            Personal Information
          </h3>
          <div className="overflow-x-auto rounded-xl">
            <table className="profile-info-table min-w-[320px]">
              <thead>
                <tr>
                  <th>Field</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                {personalInfo.map((item, idx) => {
                  const IconComponent = item.icon;
                  return (
                    <tr key={idx}>
                      <td className="font-medium text-gray-700">
                        <div className="flex items-center gap-2">
                          <IconComponent className="text-cyan-600 flex-shrink-0" size={16} />
                          {item.label}
                        </div>
                      </td>
                      <td>{item.value}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mb-6 sm:mb-8">
          <h3 className="profile-section-title">
            <GraduationCap className="icon" size={20} />
            Academic Information
          </h3>
          <div className="overflow-x-auto rounded-xl">
            <table className="profile-info-table min-w-[320px]">
              <thead>
                <tr>
                  <th>Field</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                {academicInfo.map((item, idx) => {
                  const IconComponent = item.icon;
                  return (
                    <tr key={idx}>
                      <td className="font-medium text-gray-700">
                        <div className="flex items-center gap-2">
                          <IconComponent className="text-cyan-600 flex-shrink-0" size={16} />
                          {item.label}
                        </div>
                      </td>
                      <td>{item.value}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {student.subjectWiseMarks && Object.keys(student.subjectWiseMarks).length > 0 && (
          <div>
            <h3 className="profile-section-title">
              <Award className="icon" size={20} />
              Subject-wise Marks Breakdown
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {Object.keys(student.subjectWiseMarks).map((subject, idx) => {
                const marks = student.subjectWiseMarks[subject];
                const percentage = ((marks.total / 100) * 100).toFixed(2);
                const grade = percentage >= 90 ? 'A+' : 
                              percentage >= 80 ? 'A' : 
                              percentage >= 70 ? 'B' : 
                              percentage >= 60 ? 'C' : 
                              percentage >= 50 ? 'D' : 'F';
                const gradeColor = percentage >= 80 ? '#10b981' :
                                  percentage >= 60 ? '#f59e0b' :
                                  '#ef4444';
                
                return (
                  <div key={idx} className="profile-subject-card">
                    <div className="flex justify-between items-start mb-3 gap-2">
                      <h4 className="font-bold text-gray-800 text-sm sm:text-base break-words">{subject}</h4>
                      <span 
                        className="profile-grade-badge flex-shrink-0"
                        style={{background: gradeColor + '20', color: gradeColor}}
                      >
                        {grade}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5 sm:gap-2 text-xs sm:text-sm">
                      <div className="text-center p-1.5 sm:p-2 bg-gray-50 rounded">
                        <p className="text-gray-500 text-[10px] sm:text-xs">Quiz</p>
                        <p className="font-bold text-gray-700">{marks.quiz || 0}/10</p>
                      </div>
                      <div className="text-center p-1.5 sm:p-2 bg-gray-50 rounded">
                        <p className="text-gray-500 text-[10px] sm:text-xs">Test</p>
                        <p className="font-bold text-gray-700">{marks.test || 0}/10</p>
                      </div>
                      <div className="text-center p-1.5 sm:p-2 bg-gray-50 rounded">
                        <p className="text-gray-500 text-[10px] sm:text-xs">Midterm</p>
                        <p className="font-bold text-gray-700">{marks.midterm || 0}/20</p>
                      </div>
                      <div className="text-center p-1.5 sm:p-2 bg-gray-50 rounded">
                        <p className="text-gray-500 text-[10px] sm:text-xs">Textbook</p>
                        <p className="font-bold text-gray-700">{marks.textbook || 0}/20</p>
                      </div>
                      <div className="text-center p-1.5 sm:p-2 bg-gray-50 rounded">
                        <p className="text-gray-500 text-[10px] sm:text-xs">Final</p>
                        <p className="font-bold text-gray-700">{marks.final || 0}/50</p>
                      </div>
                      <div className="text-center p-1.5 sm:p-2 bg-cyan-50 rounded border border-cyan-200">
                        <p className="text-gray-500 text-[10px] sm:text-xs">Total</p>
                        <p className="font-bold text-cyan-700">{marks.total}/100</p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="w-full bg-gray-200 rounded-full h-2 sm:h-2.5">
                        <div 
                          className="h-2 sm:h-2.5 rounded-full transition-all duration-1000"
                          style={{ 
                            width: `${percentage}%`,
                            background: `linear-gradient(90deg, #0e7490, ${gradeColor})`
                          }}
                        />
                      </div>
                      <p className="text-right text-[10px] sm:text-xs text-gray-500 mt-1">{percentage}%</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================
// 📊 MAIN REPORTS COMPONENT
// ============================================

const SuperAdminReports = () => {
  const [classes, setClasses] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [reportType, setReportType] = useState('attendance');
  const [allGradesSummary, setAllGradesSummary] = useState([]);
  const [isLoadingAll, setIsLoadingAll] = useState(false);
  const [showCharts, setShowCharts] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showProfilePage, setShowProfilePage] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchAllClasses();
    fetchAllStudentsData();
  }, []);

  const fetchAllClasses = async () => {
    try {
      const response = await api.get('/classes');
      setClasses(response.data);
    } catch (error) {
      toast.error('Failed to fetch classes');
      console.error('Fetch classes error:', error);
    }
  };

  // ✅ Fetch all students data with complete profile information
  const fetchAllStudentsData = async () => {
    try {
      const response = await api.get('/users/role/student');
      setAllStudents(response.data);
      console.log('All students fetched:', response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchStudentAttendance = async (studentId) => {
    try {
      const response = await api.get(`/attendance/student/${studentId}`);
      let attendanceRecords = response.data || [];
      
      if (!Array.isArray(attendanceRecords)) {
        attendanceRecords = [];
      }
      
      attendanceRecords = attendanceRecords.filter(record => {
        if (!record.date) return false;
        const recordDate = new Date(record.date).toISOString().split('T')[0];
        return recordDate >= dateRange.startDate && recordDate <= dateRange.endDate;
      });
      
      const totalDays = attendanceRecords.length;
      const presentDays = attendanceRecords.filter(a => a.status === 'present').length;
      const lateDays = attendanceRecords.filter(a => a.status === 'late').length;
      const absentDays = attendanceRecords.filter(a => a.status === 'absent').length;
      const attendancePercentage = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;
      
      return { 
        totalDays, 
        presentDays, 
        lateDays, 
        absentDays, 
        percentage: attendancePercentage.toFixed(2) 
      };
    } catch (error) {
      console.error('Error fetching attendance:', error);
      return { totalDays: 0, presentDays: 0, lateDays: 0, absentDays: 0, percentage: 0 };
    }
  };

  const fetchStudentMarks = async (studentId) => {
    let quizScore = 0, testScore = 0, midtermScore = 0, textbookScore = 0, finalScore = 0;
    let subjectWiseMarks = {};
    let totalMarks = 0;
    let totalSubjects = 0;
    
    try {
      const marksResponse = await api.get(`/marks/student/${studentId}`);
      
      let marks = marksResponse.data || [];
      
      if (!Array.isArray(marks)) {
        marks = [];
      }
      
      marks.forEach(mark => {
        const subject = mark.subject || 'Unknown';
        const examType = mark.examType;
        const score = mark.score || 0;
        
        if (!subjectWiseMarks[subject]) {
          subjectWiseMarks[subject] = {
            quiz: 0,
            test: 0,
            midterm: 0,
            textbook: 0,
            final: 0,
            total: 0
          };
        }
        
        switch(examType) {
          case 'quiz':
            subjectWiseMarks[subject].quiz += score;
            quizScore += score;
            break;
          case 'test':
            subjectWiseMarks[subject].test += score;
            testScore += score;
            break;
          case 'midterm':
            subjectWiseMarks[subject].midterm += score;
            midtermScore += score;
            break;
          case 'textbook':
            subjectWiseMarks[subject].textbook += score;
            textbookScore += score;
            break;
          case 'final':
            subjectWiseMarks[subject].final += score;
            finalScore += score;
            break;
          default: break;
        }
      });
      
      Object.keys(subjectWiseMarks).forEach(subject => {
        const subj = subjectWiseMarks[subject];
        subj.total = subj.quiz + subj.test + subj.midterm + subj.textbook + subj.final;
        totalMarks += subj.total;
        totalSubjects++;
      });
      
      const overallPercentage = totalSubjects > 0 ? (totalMarks / totalSubjects).toFixed(2) : 0;
      
      return { 
        quizScore, testScore, midtermScore, textbookScore, finalScore,
        totalMarks, 
        totalSubjects,
        overallPercentage,
        subjectWiseMarks 
      };
    } catch (error) {
      console.error('Error fetching marks:', error);
      return { 
        quizScore: 0, testScore: 0, midtermScore: 0, textbookScore: 0, finalScore: 0,
        totalMarks: 0, totalSubjects: 0, overallPercentage: 0, subjectWiseMarks: {} 
      };
    }
  };

  // ✅ Get full student data by ID from allStudents
  const getFullStudentData = (studentId) => {
    return allStudents.find(s => s._id === studentId);
  };

  const generateClassReport = async (classData) => {
    try {
      const classResponse = await api.get(`/classes/${classData._id}`);
      const classInfo = classResponse.data;
      const students = classInfo.students || [];
      
      if (!students || students.length === 0) {
        console.log(`No students found for class ${classData.grade} - ${classData.section}`);
        return null;
      }
      
      console.log(`Processing ${students.length} students for class ${classData.grade} - ${classData.section}`);
      
      const studentsData = [];
      
      for (const student of students) {
        // ✅ Get full student data from allStudents array
        const fullStudent = getFullStudentData(student._id) || student;
        
        console.log(`Fetching data for student: ${fullStudent.name} (${fullStudent._id})`);
        
        const [attendance, marks] = await Promise.all([
          fetchStudentAttendance(fullStudent._id),
          fetchStudentMarks(fullStudent._id)
        ]);
        
        const totalScore = marks.totalMarks || 0;
        const maxPossibleMarks = marks.totalSubjects * 100;
        const academicPercentage = maxPossibleMarks > 0 ? ((totalScore / maxPossibleMarks) * 100).toFixed(2) : 0;
        
        let status = 'Failed', grade = 'F';
        if (academicPercentage >= 90) { status = 'Passed'; grade = 'A+'; }
        else if (academicPercentage >= 80) { status = 'Passed'; grade = 'A'; }
        else if (academicPercentage >= 70) { status = 'Passed'; grade = 'B'; }
        else if (academicPercentage >= 60) { status = 'Passed'; grade = 'C'; }
        else if (academicPercentage >= 50) { status = 'Passed'; grade = 'D'; }
        
        // ✅ Correctly map all student data from fullStudent
        studentsData.push({
          _id: fullStudent._id,
          name: fullStudent.name,
          rollNumber: fullStudent.rollNumber || 'N/A',
          email: fullStudent.email || '',
          // ✅ PROFILE IMAGE
          profileImage: fullStudent.profileImage || null,
          // ✅ AGE
          age: fullStudent.age || '',
          // ✅ SECTION
          section: fullStudent.section || '',
          // ✅ PROGRAM
          programs: fullStudent.programs || fullStudent.program || '',
          sex: fullStudent.sex || '',
          grade: fullStudent.grade || '',
          academicYear: fullStudent.academicYear || '',
          parentPhone: fullStudent.parentPhone || '',
          address: fullStudent.address || '',
          dob: fullStudent.dob || '',
          parentName: fullStudent.parentName || '',
          phone: fullStudent.phone || '',
          attendance: attendance,
          quizScore: marks.quizScore,
          testScore: marks.testScore,
          midtermScore: marks.midtermScore,
          textbookScore: marks.textbookScore,
          finalScore: marks.finalScore,
          totalMarks: marks.totalMarks,
          totalSubjects: marks.totalSubjects,
          overallPercentage: marks.overallPercentage,
          academicPercentage: academicPercentage,
          subjectWiseMarks: marks.subjectWiseMarks,
          totalScore: totalScore,
          status: status,
          grade: grade
        });
      }
      
      // ✅ SORT STUDENTS BY NAME A-Z
      studentsData.sort((a, b) => {
        const nameA = a.name?.toLowerCase() || '';
        const nameB = b.name?.toLowerCase() || '';
        return nameA.localeCompare(nameB);
      });
      
      const passedStudents = studentsData.filter(s => s.status === 'Passed').length;
      const averageAttendance = studentsData.length > 0 
        ? (studentsData.reduce((sum, s) => sum + parseFloat(s.attendance.percentage), 0) / studentsData.length).toFixed(1)
        : 0;
      const averageScore = studentsData.length > 0
        ? (studentsData.reduce((sum, s) => sum + parseFloat(s.academicPercentage), 0) / studentsData.length).toFixed(1)
        : 0;
      
      const allSubjects = new Set();
      studentsData.forEach(student => {
        Object.keys(student.subjectWiseMarks).forEach(subject => {
          allSubjects.add(subject);
        });
      });
      
      return {
        classId: classData._id,
        classInfo: `${classData.grade} - ${classData.section}`,
        students: studentsData,
        totalStudents: studentsData.length,
        passedStudents: passedStudents,
        failedStudents: studentsData.length - passedStudents,
        averageAttendance: averageAttendance,
        averageScore: averageScore,
        passRate: studentsData.length > 0 ? ((passedStudents / studentsData.length) * 100).toFixed(1) : 0,
        allSubjects: Array.from(allSubjects)
      };
    } catch (error) {
      console.error(`Error generating report for class ${classData.grade}:`, error);
      toast.error(`Failed to generate report for ${classData.grade} - ${classData.section}`);
      return null;
    }
  };

  const fetchAllClassesSummary = async () => {
    if (!classes || classes.length === 0) {
      toast.error('No classes available to fetch');
      return;
    }
    
    setIsLoadingAll(true);
    toast.loading(`Fetching data for ${classes.length} classes...`, { id: 'allClasses' });
    
    try {
      const summaries = [];
      
      for (const classData of classes) {
        const report = await generateClassReport(classData);
        if (report && report.students.length > 0) {
          summaries.push(report);
        }
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      setAllGradesSummary(summaries);
      toast.success(`Loaded data for ${summaries.length} classes`, { id: 'allClasses' });
    } catch (error) {
      console.error('Error fetching all classes summary:', error);
      toast.error('Failed to fetch all classes data', { id: 'allClasses' });
    } finally {
      setIsLoadingAll(false);
    }
  };

  const generateReport = async () => {
    if (!selectedClass) {
      toast.error('Please select a class');
      return;
    }
    
    setIsLoading(true);
    toast.loading(`Generating report for ${selectedClass.grade} - ${selectedClass.section}...`, { id: 'report' });
    
    try {
      const report = await generateClassReport(selectedClass);
      
      if (report && report.students.length > 0) {
        setReportData(report);
        toast.success(`Report generated successfully`, { id: 'report' });
      } else if (report && report.students.length === 0) {
        toast.error(`No students found`, { id: 'report' });
        setReportData(report);
      } else {
        toast.error('Failed to generate report', { id: 'report' });
      }
    } catch (error) {
      console.error('Generate report error:', error);
      toast.error('An error occurred while generating the report', { id: 'report' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewProfile = (student) => {
    setSelectedStudent(student);
    setShowProfilePage(true);
  };

  const handleBackToReports = () => {
    setShowProfilePage(false);
    setSelectedStudent(null);
  };

  const getMarksDistributionData = () => {
    if (!reportData || !reportData.students) return [];
    
    const ranges = {
      '90-100%': 0,
      '80-89%': 0,
      '70-79%': 0,
      '60-69%': 0,
      '50-59%': 0,
      'Below 50%': 0
    };
    
    reportData.students.forEach(student => {
      const percentage = parseFloat(student.academicPercentage);
      if (percentage >= 90) ranges['90-100%']++;
      else if (percentage >= 80) ranges['80-89%']++;
      else if (percentage >= 70) ranges['70-79%']++;
      else if (percentage >= 60) ranges['60-69%']++;
      else if (percentage >= 50) ranges['50-59%']++;
      else ranges['Below 50%']++;
    });
    
    return Object.entries(ranges).map(([range, count]) => ({ range, count }));
  };

  const getAttendanceDistributionData = () => {
    if (!reportData || !reportData.students) return [];
    
    const ranges = {
      '90-100%': 0,
      '75-89%': 0,
      '60-74%': 0,
      'Below 60%': 0
    };
    
    reportData.students.forEach(student => {
      const attendance = parseFloat(student.attendance.percentage);
      if (attendance >= 90) ranges['90-100%']++;
      else if (attendance >= 75) ranges['75-89%']++;
      else if (attendance >= 60) ranges['60-74%']++;
      else ranges['Below 60%']++;
    });
    
    return Object.entries(ranges).map(([range, count]) => ({ range, count }));
  };

  const getPassFailData = () => {
    if (!reportData) return [];
    
    return [
      { name: 'Passed', value: reportData.passedStudents || 0 },
      { name: 'Failed', value: reportData.failedStudents || 0 }
    ];
  };

  const getExamWiseData = () => {
    if (!reportData || !reportData.students || reportData.students.length === 0) return [];
    
    const exams = ['Quiz', 'Test', 'Midterm', 'Textbook', 'Final'];
    const avgScores = [
      reportData.students.reduce((sum, s) => sum + (s.quizScore || 0), 0) / reportData.students.length,
      reportData.students.reduce((sum, s) => sum + (s.testScore || 0), 0) / reportData.students.length,
      reportData.students.reduce((sum, s) => sum + (s.midtermScore || 0), 0) / reportData.students.length,
      reportData.students.reduce((sum, s) => sum + (s.textbookScore || 0), 0) / reportData.students.length,
      reportData.students.reduce((sum, s) => sum + (s.finalScore || 0), 0) / reportData.students.length,
    ];
    
    return exams.map((exam, index) => ({
      exam,
      average: parseFloat(avgScores[index].toFixed(2))
    }));
  };

  const getGradeDistributionData = () => {
    if (!reportData || !reportData.students) return [];
    
    const grades = ['A+', 'A', 'B', 'C', 'D', 'F'];
    const gradeCounts = grades.map(grade => 
      reportData.students.filter(s => s.grade === grade).length
    );
    
    return grades.map((grade, index) => ({
      grade,
      count: gradeCounts[index]
    }));
  };

  const getSubjectWisePerformanceData = () => {
    if (!reportData || !reportData.students || !reportData.allSubjects) return [];
    
    const subjectPerformance = {};
    
    reportData.allSubjects.forEach(subject => {
      subjectPerformance[subject] = {
        total: 0,
        count: 0,
        average: 0
      };
    });
    
    reportData.students.forEach(student => {
      Object.keys(student.subjectWiseMarks).forEach(subject => {
        if (subjectPerformance[subject]) {
          subjectPerformance[subject].total += student.subjectWiseMarks[subject].total;
          subjectPerformance[subject].count++;
        }
      });
    });
    
    return Object.keys(subjectPerformance).map(subject => ({
      subject: subject,
      average: subjectPerformance[subject].count > 0 
        ? (subjectPerformance[subject].total / subjectPerformance[subject].count).toFixed(2)
        : 0
    }));
  };

  const handleExportToExcel = () => {
    let exportData = [];
    
    if (reportType === 'attendance' && reportData && reportData.students) {
      exportData = reportData.students.map(student => ({
        'Roll Number': student.rollNumber,
        'Student Name': student.name,
        'Present Days': student.attendance.presentDays,
        'Absent Days': student.attendance.absentDays,
        'Late Days': student.attendance.lateDays,
        'Total Days': student.attendance.totalDays,
        'Attendance Percentage': `${student.attendance.percentage}%`
      }));
    } else if (reportType === 'marklist' && reportData && reportData.students) {
      exportData = reportData.students.map(student => ({
        'Roll Number': student.rollNumber,
        'Student Name': student.name,
        'Total Subjects': student.totalSubjects,
        'Total Marks': student.totalMarks,
        'Overall Percentage': `${student.overallPercentage}%`,
        'Final Percentage': `${student.academicPercentage}%`,
        'Result': student.status,
        'Grade': student.grade
      }));
    }
    
    if (exportData.length === 0) {
      toast.error('No data to export');
      return;
    }
    
    const filename = `${reportType}_${reportData?.classInfo}_${dateRange.startDate}_to_${dateRange.endDate}`;
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, reportType === 'attendance' ? 'Attendance' : 'Marklist');
    XLSX.writeFile(workbook, `${filename}.xlsx`);
    toast.success(`Exported ${exportData.length} records to Excel`);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const currentDate = new Date().toLocaleDateString();
    
    let printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${reportType === 'attendance' ? 'Attendance' : 'Marklist'} Report - ${reportData?.classInfo}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          * { box-sizing: border-box; }
          body { font-family: Arial, sans-serif; margin: 20px; color: #333; background: #f8fafc; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #0e7490; padding-bottom: 20px; }
          .header h1 { margin: 0; color: #0e7490; }
          .header p { margin: 5px 0; color: #666; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; background: white; border-radius: 8px; overflow: hidden; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #0e7490; color: white; font-weight: bold; }
          .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #ddd; padding-top: 20px; }
          @media print { body { margin: 0; padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${reportType === 'attendance' ? 'Attendance Report' : 'Marklist Report'}</h1>
          <p><strong>Class:</strong> ${reportData?.classInfo}</p>
          <p><strong>Date Range:</strong> ${dateRange.startDate} to ${dateRange.endDate}</p>
          <p><strong>Generated on:</strong> ${currentDate}</p>
        </div>
    `;
    
    if (reportType === 'attendance') {
      printContent += `<table><thead><tr><th>Roll No</th><th>Student Name</th><th>Present</th><th>Absent</th><th>Late</th><th>Total</th><th>Percentage</th></tr></thead><tbody>`;
      reportData?.students.forEach(student => {
        printContent += `<tr>
          <td>${student.rollNumber}</td>
          <td>${student.name}</td>
          <td>${student.attendance.presentDays}</td>
          <td>${student.attendance.absentDays}</td>
          <td>${student.attendance.lateDays}</td>
          <td>${student.attendance.totalDays}</td>
          <td>${student.attendance.percentage}%</td>
        </tr>`;
      });
    } else {
      printContent += `<table><thead><tr>
        <th>Roll No</th>
        <th>Student Name</th>
        <th>Total Subjects</th>
        <th>Total Marks</th>
        <th>Overall %</th>
        <th>Final %</th>
        <th>Result</th>
        <th>Grade</th>
      </thead><tbody>`;
      
      reportData?.students.forEach(student => {
        printContent += `<tr>
          <td>${student.rollNumber}</td>
          <td>${student.name}</td>
          <td>${student.totalSubjects}</td>
          <td>${student.totalMarks}</td>
          <td>${student.overallPercentage}%</td>
          <td>${student.academicPercentage}%</td>
          <td>${student.status}</td>
          <td>${student.grade}</td>
        </tr>`;
      });
    }
    
    printContent += `</tbody></table>
        <div class="footer">
          <p>This is a system-generated report.</p>
        </div>
      </body>
      </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  // Show Profile Page if selected
  if (showProfilePage && selectedStudent) {
    return <StudentProfilePage student={selectedStudent} reportData={reportData} onBack={handleBackToReports} />;
  }

  // Render class selection screen
  if (!selectedClass) {
    return (
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=Poppins:wght@300;400;500;600;700&display=swap');
          .reports-container { animation: fadeIn 0.5s ease-out; }
          @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
          .hero-section {
            background: linear-gradient(135deg, #0e7490 0%, #0891b2 50%, #22d3ee 100%);
            color: white;
            padding: 20px;
            border-radius: 15px;
            margin-bottom: 20px;
            box-shadow: 0 10px 40px rgba(8, 145, 178, 0.3);
          }
          @media (min-width: 768px) {
            .hero-section { padding: 40px; margin-bottom: 30px; }
          }
          .hero-title { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 800; margin-bottom: 6px; }
          .hero-subtitle { font-size: 13px; opacity: 0.9; }
          @media (min-width: 768px) {
            .hero-title { font-size: 36px; margin-bottom: 10px; }
            .hero-subtitle { font-size: 16px; }
          }
          .class-card {
            background: white;
            padding: 16px;
            border-radius: 12px;
            cursor: pointer;
            transition: all 0.3s ease;
            border: 2px solid #e2e8f0;
            box-shadow: 0 4px 15px rgba(0,0,0,0.06);
            position: relative;
            overflow: hidden;
          }
          @media (min-width: 768px) { .class-card { padding: 24px; } }
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
          .class-icon { font-size: 32px; margin-bottom: 10px; }
          .class-title { font-size: 17px; font-weight: 700; color: #1a202c; margin-bottom: 6px; }
          .class-info { color: #666; font-size: 13px; }
          @media (min-width: 768px) {
            .class-icon { font-size: 40px; margin-bottom: 12px; }
            .class-title { font-size: 20px; margin-bottom: 8px; }
            .class-info { font-size: 14px; }
          }
          .class-stats {
            display: flex;
            gap: 12px;
            margin-top: 10px;
            padding-top: 10px;
            border-top: 1px solid #e5e7eb;
          }
          @media (min-width: 768px) { .class-stats { gap: 20px; margin-top: 12px; padding-top: 12px; } }
          .class-stat-item { flex: 1; text-align: center; }
          .class-stat-number { font-size: 15px; font-weight: 700; color: #0891b2; }
          .class-stat-label { font-size: 10px; color: #999; text-transform: uppercase; letter-spacing: 0.5px; }
          @media (min-width: 768px) {
            .class-stat-number { font-size: 18px; }
            .class-stat-label { font-size: 11px; }
          }
          .class-view-btn {
            width: 100%;
            background: linear-gradient(135deg, #0e7490, #0891b2);
            color: white;
            border: none;
            padding: 9px;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            margin-top: 10px;
            transition: all 0.3s;
            font-size: 13px;
          }
          @media (min-width: 768px) { .class-view-btn { padding: 10px; margin-top: 12px; font-size: 14px; } }
          .class-view-btn:hover { transform: scale(1.02); box-shadow: 0 6px 20px rgba(8, 145, 178, 0.3); }
        `}</style>

        <div className="reports-container">
          <div className="hero-section">
            <div className="flex items-center gap-3 sm:gap-4 mb-2">
              <BarChart3 size={28} className="sm:w-10 sm:h-10 flex-shrink-0" />
              <div className="min-w-0">
                <h2 className="hero-title">📊 Reports & Analytics</h2>
                <p className="hero-subtitle">View attendance and marklist reports for all classes</p>
              </div>
            </div>
          </div>

          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:flex-wrap sm:justify-between sm:items-center gap-3 mb-4">
              <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 flex items-center gap-2">
                <Award className="text-cyan-600 flex-shrink-0" size={22} />
                All Classes Summary
              </h3>
              <button
                onClick={fetchAllClassesSummary}
                disabled={isLoadingAll}
                className="w-full sm:w-auto px-4 sm:px-5 py-2.5 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50 transition font-semibold flex items-center justify-center gap-2 text-sm"
              >
                {isLoadingAll ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Loading...
                  </>
                ) : (
                  <>
                    <RefreshCw size={18} />
                    Load All Classes Data
                  </>
                )}
              </button>
            </div>
            
            {isLoadingAll && (
              <div className="text-center py-10 sm:py-12 bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto"></div>
                <p className="mt-4 text-gray-600 font-medium text-sm sm:text-base">Fetching data for all classes...</p>
              </div>
            )}
            
            {allGradesSummary.length > 0 && !isLoadingAll && (
              <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
                <div className="overflow-x-auto">
                  <table className="min-w-[700px] w-full text-xs sm:text-sm">
                    <thead className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white">
                      <tr>
                        <th className="py-2 sm:py-3 px-2 sm:px-4 text-left border border-cyan-700 whitespace-nowrap">Class</th>
                        <th className="py-2 sm:py-3 px-2 sm:px-4 text-center border border-cyan-700 whitespace-nowrap">Students</th>
                        <th className="py-2 sm:py-3 px-2 sm:px-4 text-center border border-cyan-700 whitespace-nowrap">Passed</th>
                        <th className="py-2 sm:py-3 px-2 sm:px-4 text-center border border-cyan-700 whitespace-nowrap">Failed</th>
                        <th className="py-2 sm:py-3 px-2 sm:px-4 text-center border border-cyan-700 whitespace-nowrap">Pass Rate</th>
                        <th className="py-2 sm:py-3 px-2 sm:px-4 text-center border border-cyan-700 whitespace-nowrap">Avg Attend</th>
                        <th className="py-2 sm:py-3 px-2 sm:px-4 text-center border border-cyan-700 whitespace-nowrap">Avg Score</th>
                        <th className="py-2 sm:py-3 px-2 sm:px-4 text-center border border-cyan-700 whitespace-nowrap">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allGradesSummary.map((summary, idx) => (
                        <tr key={idx} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-cyan-50 transition`}>
                          <td className="py-2 sm:py-3 px-2 sm:px-4 font-medium text-gray-700 border border-gray-200 whitespace-nowrap">{summary.classInfo}</td>
                          <td className="py-2 sm:py-3 px-2 sm:px-4 text-center border border-gray-200">{summary.totalStudents}</td>
                          <td className="py-2 sm:py-3 px-2 sm:px-4 text-center text-green-600 font-semibold border border-gray-200">{summary.passedStudents}</td>
                          <td className="py-2 sm:py-3 px-2 sm:px-4 text-center text-red-600 font-semibold border border-gray-200">{summary.failedStudents}</td>
                          <td className="py-2 sm:py-3 px-2 sm:px-4 text-center font-bold text-cyan-700 border border-gray-200">{summary.passRate}%</td>
                          <td className="py-2 sm:py-3 px-2 sm:px-4 text-center border border-gray-200">{summary.averageAttendance}%</td>
                          <td className="py-2 sm:py-3 px-2 sm:px-4 text-center border border-gray-200">{summary.averageScore}%</td>
                          <td className="py-2 sm:py-3 px-2 sm:px-4 text-center border border-gray-200">
                            <button
                              onClick={() => {
                                const cls = classes.find(c => `${c.grade} - ${c.section}` === summary.classInfo);
                                if (cls) {
                                  setSelectedClass(cls);
                                  setTimeout(() => generateReport(), 100);
                                }
                              }}
                              className="px-2 sm:px-3 py-1 sm:py-1.5 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition text-xs font-medium whitespace-nowrap"
                            >
                              <Eye size={12} className="inline mr-1" /> View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
            <BookOpen className="text-cyan-600 flex-shrink-0" size={22} />
            Select a Class to View Detailed Report
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
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
                  onClick={() => setSelectedClass(cls)}
                  className="class-view-btn"
                >
                  View Reports →
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Render report view
  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
      <style>{`
        .report-container { animation: fadeIn 0.5s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div className="report-container">
        <div className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white p-4 sm:p-6 rounded-xl mb-4 sm:mb-6 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:flex-wrap sm:justify-between sm:items-center gap-3 sm:gap-4">
            <div className="min-w-0">
              <button
                onClick={() => {
                  setSelectedClass(null);
                  setReportData(null);
                }}
                className="text-white/80 hover:text-white mb-2 flex items-center gap-1 transition text-sm"
              >
                <ChevronLeft size={18} /> Back to Classes
              </button>
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold break-words">{reportData?.classInfo || `${selectedClass.grade} - ${selectedClass.section}`}</h2>
              <p className="text-cyan-100 mt-1 text-xs sm:text-sm">Total Students: {selectedClass.students?.length || 0}</p>
            </div>
            <div className="grid grid-cols-2 gap-2 w-full sm:flex sm:w-auto sm:flex-wrap">
              <button
                onClick={() => setReportType('attendance')}
                className={`px-3 sm:px-4 py-2 rounded-lg font-semibold transition text-xs sm:text-sm ${
                  reportType === 'attendance' 
                    ? 'bg-white text-cyan-700' 
                    : 'bg-cyan-700/50 text-white hover:bg-cyan-700'
                }`}
              >
                Attendance Report
              </button>
              <button
                onClick={() => setReportType('marklist')}
                className={`px-3 sm:px-4 py-2 rounded-lg font-semibold transition text-xs sm:text-sm ${
                  reportType === 'marklist' 
                    ? 'bg-white text-cyan-700' 
                    : 'bg-cyan-700/50 text-white hover:bg-cyan-700'
                }`}
              >
                Complete Marklist
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-4 sm:mb-6 border border-gray-200">
          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-4 sm:items-center">
            <button
              onClick={generateReport}
              disabled={isLoading}
              className="w-full sm:w-auto px-4 sm:px-5 py-2.5 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50 transition font-semibold flex items-center justify-center gap-2 text-sm"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Generating...
                </>
              ) : (
                <>
                  <RefreshCw size={18} />
                  Generate Report
                </>
              )}
            </button>
            {reportData && (
              <div className="grid grid-cols-1 sm:flex sm:flex-wrap gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setShowCharts(!showCharts)}
                  className="w-full sm:w-auto px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold text-sm"
                >
                  {showCharts ? 'Hide Charts' : 'Show Charts'}
                </button>
                <button
                  onClick={handleExportToExcel}
                  className="w-full sm:w-auto px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold flex items-center justify-center gap-2 text-sm"
                >
                  <FileSpreadsheet size={18} />
                  Export Excel
                </button>
                <button
                  onClick={handlePrint}
                  className="w-full sm:w-auto px-4 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-semibold flex items-center justify-center gap-2 text-sm"
                >
                  <Printer size={18} />
                  Print
                </button>
              </div>
            )}
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">Start Date</label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">End Date</label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-sm"
              />
            </div>
          </div>
        </div>

        {reportData && (
          <div className="bg-white rounded-xl shadow-md p-3 sm:p-6 overflow-x-auto border border-gray-200">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
              <div className="bg-cyan-50 rounded-xl p-3 sm:p-4 text-center border border-cyan-200">
                <p className="text-xs sm:text-sm text-cyan-700 font-semibold">Total Students</p>
                <p className="text-lg sm:text-2xl font-bold text-cyan-700">{reportData.totalStudents}</p>
              </div>
              <div className="bg-green-50 rounded-xl p-3 sm:p-4 text-center border border-green-200">
                <p className="text-xs sm:text-sm text-green-700 font-semibold">Passed</p>
                <p className="text-lg sm:text-2xl font-bold text-green-600">{reportData.passedStudents}</p>
              </div>
              <div className="bg-red-50 rounded-xl p-3 sm:p-4 text-center border border-red-200">
                <p className="text-xs sm:text-sm text-red-700 font-semibold">Failed</p>
                <p className="text-lg sm:text-2xl font-bold text-red-600">{reportData.failedStudents}</p>
              </div>
              <div className="bg-purple-50 rounded-xl p-3 sm:p-4 text-center border border-purple-200">
                <p className="text-xs sm:text-sm text-purple-700 font-semibold">Pass Rate</p>
                <p className="text-lg sm:text-2xl font-bold text-purple-700">{reportData.passRate}%</p>
              </div>
            </div>

            {showCharts && reportData.students && reportData.students.length > 0 && (
              <div className="mb-4 sm:mb-6">
                <h3 className="text-base sm:text-lg md:text-xl font-bold mb-3 sm:mb-4 text-gray-800 flex items-center gap-2">
                  <BarChart3 className="text-cyan-600 flex-shrink-0" size={22} />
                  Visual Analytics
                </h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6">
                  <div className="bg-gray-50 rounded-xl p-3 sm:p-4 border border-gray-200">
                    <h4 className="text-sm sm:text-lg font-semibold mb-3 text-center text-gray-700">Pass/Fail Distribution</h4>
                    <ResponsiveContainer width="100%" height={240}>
                      <PieChart>
                        <Pie
                          data={getPassFailData()}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={75}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {getPassFailData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : '#ef4444'} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-3 sm:p-4 border border-gray-200">
                    <h4 className="text-sm sm:text-lg font-semibold mb-3 text-center text-gray-700">Grade Distribution</h4>
                    <ResponsiveContainer width="100%" height={240}>
                      <BarChart data={getGradeDistributionData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="grade" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" fill="#0891b2" name="Number of Students" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-3 sm:p-4 border border-gray-200">
                    <h4 className="text-sm sm:text-lg font-semibold mb-3 text-center text-gray-700">Exam-wise Average Performance</h4>
                    <ResponsiveContainer width="100%" height={240}>
                      <BarChart data={getExamWiseData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="exam" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="average" fill="#22d3ee" name="Class Average Score" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {reportData.allSubjects && reportData.allSubjects.length > 0 && (
                    <div className="bg-gray-50 rounded-xl p-3 sm:p-4 border border-gray-200">
                      <h4 className="text-sm sm:text-lg font-semibold mb-3 text-center text-gray-700">Subject-wise Performance</h4>
                      <ResponsiveContainer width="100%" height={240}>
                        <BarChart data={getSubjectWisePerformanceData()}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="subject" tick={{ fontSize: 11 }} />
                          <YAxis tick={{ fontSize: 11 }} />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="average" fill="#f59e0b" name="Class Average (out of 100)" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  <div className="bg-gray-50 rounded-xl p-3 sm:p-4 border border-gray-200">
                    <h4 className="text-sm sm:text-lg font-semibold mb-3 text-center text-gray-700">Overall Percentage Distribution</h4>
                    <ResponsiveContainer width="100%" height={240}>
                      <BarChart data={getMarksDistributionData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="range" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" fill="#10b981" name="Number of Students" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-3 sm:p-4 border border-gray-200">
                    <h4 className="text-sm sm:text-lg font-semibold mb-3 text-center text-gray-700">Attendance Distribution</h4>
                    <ResponsiveContainer width="100%" height={240}>
                      <BarChart data={getAttendanceDistributionData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="range" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" fill="#0e7490" name="Number of Students" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            <h3 className="text-base sm:text-lg md:text-xl font-bold mb-3 sm:mb-4 text-gray-800">
              {reportType === 'attendance' ? 'Attendance Details' : 'Student Summary'}
            </h3>
            
            <div className="overflow-x-auto">
              {reportType === 'attendance' ? (
                <table className="min-w-[720px] w-full border rounded-lg overflow-hidden text-xs sm:text-sm">
                  <thead className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white">
                    <tr>
                      <th className="py-2 sm:py-3 px-2 sm:px-4 text-center border border-cyan-700 whitespace-nowrap">Photo</th>
                      <th className="py-2 sm:py-3 px-2 sm:px-4 text-left border border-cyan-700 whitespace-nowrap">Roll No</th>
                      <th className="py-2 sm:py-3 px-2 sm:px-4 text-left border border-cyan-700 whitespace-nowrap">Student Name</th>
                      <th className="py-2 sm:py-3 px-2 sm:px-4 text-center border border-cyan-700 whitespace-nowrap">Present</th>
                      <th className="py-2 sm:py-3 px-2 sm:px-4 text-center border border-cyan-700 whitespace-nowrap">Absent</th>
                      <th className="py-2 sm:py-3 px-2 sm:px-4 text-center border border-cyan-700 whitespace-nowrap">Late</th>
                      <th className="py-2 sm:py-3 px-2 sm:px-4 text-center border border-cyan-700 whitespace-nowrap">Total Days</th>
                      <th className="py-2 sm:py-3 px-2 sm:px-4 text-center border border-cyan-700 whitespace-nowrap">Percentage</th>
                      <th className="py-2 sm:py-3 px-2 sm:px-4 text-center border border-cyan-700 whitespace-nowrap">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.students.map((student, idx) => (
                      <tr key={idx} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-cyan-50 transition`}>
                        <td className="py-2 sm:py-3 px-2 sm:px-4 text-center border border-gray-200">
                          <Avatar name={student.name} image={student.profileImage} size={32} />
                        </td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4 border border-gray-200 whitespace-nowrap">{student.rollNumber}</td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4 font-medium text-gray-700 border border-gray-200 whitespace-nowrap">{student.name}</td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4 text-center text-green-600 font-semibold border border-gray-200">{student.attendance.presentDays}</td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4 text-center text-red-600 font-semibold border border-gray-200">{student.attendance.absentDays}</td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4 text-center text-yellow-600 font-semibold border border-gray-200">{student.attendance.lateDays}</td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4 text-center border border-gray-200">{student.attendance.totalDays}</td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4 text-center font-bold text-cyan-700 border border-gray-200">{student.attendance.percentage}%</td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4 text-center border border-gray-200">
                          <button
                            onClick={() => handleViewProfile(student)}
                            className="px-2 sm:px-3 py-1 sm:py-1.5 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition text-xs font-medium whitespace-nowrap"
                          >
                            <Eye size={12} className="inline mr-1" /> Profile
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-cyan-50 font-semibold border-t-2 border-cyan-300">
                    <tr>
                      <td colSpan="7" className="py-2 sm:py-3 px-2 sm:px-4 text-right text-cyan-700">Class Average:</td>
                      <td className="py-2 sm:py-3 px-2 sm:px-4 text-center text-cyan-700">{reportData.averageAttendance}%</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              ) : (
                <table className="min-w-[760px] w-full border rounded-lg overflow-hidden text-xs sm:text-sm">
                  <thead className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white">
                    <tr>
                      <th className="py-2 sm:py-3 px-2 sm:px-4 text-center border border-cyan-700 whitespace-nowrap">Photo</th>
                      <th className="py-2 sm:py-3 px-2 sm:px-4 text-left border border-cyan-700 whitespace-nowrap">Roll No</th>
                      <th className="py-2 sm:py-3 px-2 sm:px-4 text-left border border-cyan-700 whitespace-nowrap">Student Name</th>
                      <th className="py-2 sm:py-3 px-2 sm:px-4 text-center border border-cyan-700 whitespace-nowrap">Total Subjects</th>
                      <th className="py-2 sm:py-3 px-2 sm:px-4 text-center border border-cyan-700 whitespace-nowrap">Total Marks</th>
                      <th className="py-2 sm:py-3 px-2 sm:px-4 text-center border border-cyan-700 whitespace-nowrap">Percentage</th>
                      <th className="py-2 sm:py-3 px-2 sm:px-4 text-center border border-cyan-700 whitespace-nowrap">Result</th>
                      <th className="py-2 sm:py-3 px-2 sm:px-4 text-center border border-cyan-700 whitespace-nowrap">Grade</th>
                      <th className="py-2 sm:py-3 px-2 sm:px-4 text-center border border-cyan-700 whitespace-nowrap">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.students.map((student, idx) => (
                      <tr key={idx} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-cyan-50 transition`}>
                        <td className="py-2 sm:py-3 px-2 sm:px-4 text-center border border-gray-200">
                          <Avatar name={student.name} image={student.profileImage} size={32} />
                        </td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4 border border-gray-200 whitespace-nowrap">{student.rollNumber}</td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4 font-medium text-gray-700 border border-gray-200 whitespace-nowrap">{student.name}</td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4 text-center border border-gray-200">{student.totalSubjects}</td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4 text-center font-bold text-cyan-700 border border-gray-200">{student.totalMarks}</td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4 text-center border border-gray-200">
                          <span className={`font-bold ${student.academicPercentage >= 50 ? 'text-green-600' : 'text-red-600'}`}>
                            {student.academicPercentage}%
                          </span>
                        </td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4 text-center border border-gray-200">
                          <span className={`px-2 py-1 rounded text-xs font-bold whitespace-nowrap ${
                            student.status === 'Passed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {student.status}
                          </span>
                        </td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4 text-center font-bold border border-gray-200">{student.grade}</td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4 text-center border border-gray-200">
                          <button
                            onClick={() => handleViewProfile(student)}
                            className="px-2 sm:px-3 py-1 sm:py-1.5 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition text-xs font-medium whitespace-nowrap"
                          >
                            <Eye size={12} className="inline mr-1" /> Profile
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-cyan-50 font-semibold border-t-2 border-cyan-300">
                    <tr>
                      <td colSpan="5" className="py-2 sm:py-3 px-2 sm:px-4 text-right text-cyan-700">Class Average Percentage:</td>
                      <td className="py-2 sm:py-3 px-2 sm:px-4 text-center text-cyan-700">{reportData.averageScore}%</td>
                      <td colSpan="3"></td>
                    </tr>
                  </tfoot>
                </table>
              )}
            </div>

            <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-cyan-50 rounded-lg border border-cyan-200">
              <p className="text-xs sm:text-sm text-gray-600">Generated on: {new Date().toLocaleString()}</p>
              <p className="text-xs sm:text-sm text-gray-600">Period: {dateRange.startDate} to {dateRange.endDate}</p>
              <p className="text-xs sm:text-sm text-cyan-700 mt-2 flex items-start gap-1">
                <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                <strong>Note:</strong> Click "Profile" to see complete student profile with subject-wise marks breakdown.
              </p>
            </div>
          </div>
        )}

        {!reportData && !isLoading && (
          <div className="bg-white rounded-xl shadow-md p-8 sm:p-12 text-center border border-gray-200">
            <BarChart3 size={40} className="mx-auto text-gray-400 mb-3 sm:mb-4" />
            <p className="text-gray-600 text-sm sm:text-lg font-semibold px-2">Click "Generate Report" to view {reportType === 'attendance' ? 'attendance' : 'complete marklist'} data</p>
          </div>
        )}

        {isLoading && (
          <div className="bg-white rounded-xl shadow-md p-8 sm:p-12 text-center border border-gray-200">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 font-medium text-sm sm:text-base">Generating report...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuperAdminReports;
