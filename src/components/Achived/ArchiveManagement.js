// ArchiveManagement.js - Complete with full student profile data
import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { 
  X, User, Mail, Phone, Calendar, BookOpen, Award, TrendingUp, Eye, 
  ChevronLeft, Settings, Search, Download, FileSpreadsheet, RefreshCw, 
  Trophy, BarChart3, ArrowLeft, Archive, GraduationCap, Filter, Clock,
  Users, Plus, CheckCircle, MapPin
} from 'lucide-react';
import api from '../../services/api';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

const ArchiveManagement = () => {
  const [graduatedClasses, setGraduatedClasses] = useState([]);
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState('all');
  const [availableYears, setAvailableYears] = useState([]);
  const [viewMode, setViewMode] = useState('list');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentDetailView, setStudentDetailView] = useState(false);
  const [allStudentsData, setAllStudentsData] = useState([]);
  const navigate = useNavigate();
  
  const [saveSpace, setSaveSpace] = useState(() => {
    return localStorage.getItem('archive_save_space') === 'true';
  });
  const [statistics, setStatistics] = useState({
    totalClasses: 0,
    totalStudents: 0,
    yearRange: ''
  });
  // Store marks for roster view
  const [semester1Marks, setSemester1Marks] = useState({});
  const [semester2Marks, setSemester2Marks] = useState({});
  const [classStudents, setClassStudents] = useState([]);
  const [classSubjects, setClassSubjects] = useState([]);

  // Define exam types
  const examTypes = ['quiz', 'test', 'midterm', 'textbook', 'final'];
  const examMax = { quiz: 10, test: 10, midterm: 20, textbook: 20, final: 50 };
  const examLabels = { 
    quiz: 'Quiz', 
    test: 'Test', 
    midterm: 'Midterm', 
    textbook: 'Textbook', 
    final: 'Final' 
  };

  const getClassSubjects = (classData) => {
    if (!classData) return [];
    return classData.subjects || [];
  };

  useEffect(() => {
    fetchAllStudents();
    fetchGraduatedClasses();
  }, []);

  useEffect(() => {
    localStorage.setItem('archive_save_space', saveSpace);
  }, [saveSpace]);

  // Fetch ALL students with complete profile data
  const fetchAllStudents = async () => {
    try {
      const response = await api.get('/users/role/student');
      setAllStudentsData(response.data);
      console.log('All students fetched:', response.data.length);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  // Fetch graduated classes with full student profiles
  const fetchGraduatedClasses = async () => {
    setLoading(true);
    try {
      // Fetch all students first to have complete profile data
      let studentsData = allStudentsData;
      if (studentsData.length === 0) {
        const response = await api.get('/users/role/student');
        studentsData = response.data;
        setAllStudentsData(studentsData);
      }

      // Get graduated classes
      let graduatedData = [];
      try {
        const response = await api.get('/classes/graduated');
        graduatedData = response.data || [];
        console.log('Graduated classes from endpoint:', graduatedData.length);
      } catch (error) {
        console.log('Graduated endpoint not found, trying alternative...');
        try {
          const allClasses = await api.get('/classes');
          graduatedData = allClasses.data.filter(cls => 
            cls.status === 'graduated' || 
            cls.isGraduated === true
          );
          console.log('Filtered graduated classes:', graduatedData.length);
        } catch (e) {
          console.log('No classes endpoint found');
        }
      }
      
      // Enrich each class with full student profiles
      const enrichedClasses = await Promise.all(graduatedData.map(async (cls) => {
        try {
          // Get students for this class
          let students = [];
          try {
            const studentsResponse = await api.get(`/classes/${cls._id}/students`);
            students = studentsResponse.data || [];
          } catch (e) {
            try {
              const classResponse = await api.get(`/classes/${cls._id}`);
              students = classResponse.data.students || [];
            } catch (err) {
              console.log(`Could not fetch students for class ${cls._id}`);
            }
          }
          
          // Enrich students with full profile data from allStudentsData
          const enrichedStudents = students.map(student => {
            // Find the full student profile by ID
            const fullStudent = studentsData.find(s => s._id === student._id);
            
            if (fullStudent) {
              // Return student with all profile data
              return {
                ...student,
                name: fullStudent.name || student.name,
                rollNumber: student.rollNumber || fullStudent.rollNumber,
                sex: fullStudent.sex || student.sex || 'Not specified',
                age: fullStudent.age || student.age || 'N/A',
                email: fullStudent.email || student.email || '',
                phone: fullStudent.phone || student.phone || '',
                profileImage: fullStudent.profileImage || student.profileImage || null,
                address: fullStudent.address || student.address || '',
                dateOfBirth: fullStudent.dateOfBirth || student.dateOfBirth || '',
                parentName: fullStudent.parentName || student.parentName || '',
                parentPhone: fullStudent.parentPhone || student.parentPhone || '',
                class: fullStudent.class || student.class || '',
                section: fullStudent.section || student.section || '',
                grade: fullStudent.grade || student.grade || '',
                academicYear: fullStudent.academicYear || student.academicYear || ''
              };
            }
            
            // If no full profile found, return the student as is
            return {
              ...student,
              sex: student.sex || 'Not specified',
              age: student.age || 'N/A',
              profileImage: student.profileImage || null
            };
          });
          
          // Get subjects for this class
          const subjects = cls.subjects || [];
          
          return {
            ...cls,
            students: enrichedStudents,
            totalStudents: enrichedStudents.length,
            subjects: subjects
          };
        } catch (error) {
          console.error(`Error enriching class ${cls._id}:`, error);
          return cls;
        }
      }));
      
      setGraduatedClasses(enrichedClasses);
      setFilteredClasses(enrichedClasses);
      calculateStatistics(enrichedClasses);
      
      // Extract available years
      const years = [...new Set(enrichedClasses.map(c => c.academicYear).filter(Boolean))];
      setAvailableYears(years.sort());
      
      if (enrichedClasses.length === 0) {
        toast('No graduated classes found. Mark a class as graduated to view here.', {
          icon: '🎓'
        });
      } else {
        toast.success(`Found ${enrichedClasses.length} graduated class(es) with ${enrichedClasses.reduce((sum, c) => sum + c.totalStudents, 0)} students`);
      }
      
    } catch (error) {
      console.error('Error fetching graduated classes:', error);
      toast.error('Failed to fetch graduated classes');
    } finally {
      setLoading(false);
    }
  };

  // Fetch marks for a class
  const fetchMarksForClass = async (classId, subjectName, semester) => {
    try {
      const params = new URLSearchParams();
      if (subjectName) params.append('subject', subjectName);
      if (semester) params.append('semester', semester);
      
      const url = `/marks/class/${classId}${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await api.get(url);
      
      let marksData = response.data;
      if (marksData && marksData.marks) marksData = marksData.marks;
      if (!Array.isArray(marksData)) marksData = [];
      
      const marksMap = {};
      marksData.forEach(mark => {
        const studentId = mark.studentId?._id || mark.studentId;
        if (studentId) {
          if (!marksMap[studentId]) marksMap[studentId] = {};
          marksMap[studentId][mark.examType] = {
            score: mark.score,
            maxScore: mark.maxScore,
            _id: mark._id
          };
        }
      });
      
      return marksMap;
    } catch (error) {
      console.error('Error fetching marks:', error);
      return {};
    }
  };

  // View class roster
  const handleViewRoster = async (cls) => {
    setLoading(true);
    setSelectedClass(cls);
    setClassStudents(cls.students || []);
    setClassSubjects(getClassSubjects(cls));
    setViewMode('roster');
    setStudentDetailView(false);
    setSelectedStudent(null);
    
    try {
      const subjects = getClassSubjects(cls);
      const s1MarksMap = {};
      const s2MarksMap = {};
      
      if (subjects.length > 0) {
        for (const subject of subjects) {
          const subjectName = subject.name || subject;
          const s1Marks = await fetchMarksForClass(cls._id, subjectName, 'Semester 1');
          const s2Marks = await fetchMarksForClass(cls._id, subjectName, 'Semester 2');
          
          Object.keys(s1Marks).forEach(studentId => {
            if (!s1MarksMap[studentId]) s1MarksMap[studentId] = {};
            s1MarksMap[studentId][subjectName] = s1Marks[studentId];
          });
          
          Object.keys(s2Marks).forEach(studentId => {
            if (!s2MarksMap[studentId]) s2MarksMap[studentId] = {};
            s2MarksMap[studentId][subjectName] = s2Marks[studentId];
          });
        }
      }
      
      setSemester1Marks(s1MarksMap);
      setSemester2Marks(s2MarksMap);
      
      toast.success(`Loaded ${cls.students?.length || 0} students with ${subjects.length} subjects`);
    } catch (error) {
      console.error('Error fetching marks:', error);
      toast.error('Failed to load marks');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToList = () => {
    setSelectedClass(null);
    setViewMode('list');
    setStudentDetailView(false);
    setSelectedStudent(null);
    setClassStudents([]);
    setSemester1Marks({});
    setSemester2Marks({});
    setClassSubjects([]);
  };

  const handleStudentDetail = (student) => {
    // Find the full student profile
    const fullStudent = allStudentsData.find(s => s._id === student._id);
    setSelectedStudent(fullStudent || student);
    setStudentDetailView(true);
  };

  const handleBackToRoster = () => {
    setStudentDetailView(false);
    setSelectedStudent(null);
  };

  const calculateSubjectTotal = (marks) => {
    if (!marks) return 0;
    let total = 0;
    if (marks.quiz?.score) total += marks.quiz.score;
    if (marks.test?.score) total += marks.test.score;
    if (marks.midterm?.score) total += marks.midterm.score;
    if (marks.textbook?.score) total += marks.textbook.score;
    if (marks.final?.score) total += marks.final.score;
    return total;
  };

  const getGrade = (total) => {
    if (total >= 90) return { letter: 'A+', color: '#059669', bg: '#d1fae5' };
    if (total >= 80) return { letter: 'A', color: '#0891b2', bg: '#cffafe' };
    if (total >= 75) return { letter: 'B+', color: '#2563eb', bg: '#dbeafe' };
    if (total >= 70) return { letter: 'B', color: '#7c3aed', bg: '#ede9fe' };
    if (total >= 60) return { letter: 'C', color: '#f59e0b', bg: '#fef3c7' };
    if (total >= 50) return { letter: 'D', color: '#f97316', bg: '#ffedd5' };
    return { letter: 'F', color: '#dc2626', bg: '#fee2e2' };
  };

  const calculateStatistics = (data) => {
    if (!data || data.length === 0) {
      setStatistics({ totalClasses: 0, totalStudents: 0, yearRange: 'N/A' });
      return;
    }

    const totalStudents = data.reduce((sum, cls) => sum + (cls.totalStudents || 0), 0);
    const years = data.map(c => c.academicYear).filter(Boolean);
    const yearRange = years.length > 0 
      ? `${Math.min(...years)} - ${Math.max(...years)}`
      : 'N/A';

    setStatistics({
      totalClasses: data.length,
      totalStudents,
      yearRange
    });
  };

  const handleSearch = () => {
    let filtered = graduatedClasses;

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(cls => 
        cls.grade?.toString().includes(searchLower) ||
        cls.section?.toLowerCase().includes(searchLower) ||
        cls.subject?.name?.toLowerCase().includes(searchLower) ||
        cls.students?.some(s => 
          s.name?.toLowerCase().includes(searchLower) ||
          s.rollNumber?.toString().includes(searchLower)
        )
      );
    }

    if (selectedYear !== 'all') {
      filtered = filtered.filter(cls => cls.academicYear === selectedYear);
    }

    setFilteredClasses(filtered);
  };

  useEffect(() => {
    handleSearch();
  }, [searchTerm, selectedYear, graduatedClasses]);

  const getStudentImage = (student) => {
    // Try to get from profileImage
    if (student?.profileImage) {
      return student.profileImage;
    }
    // Try to find in allStudentsData
    const fullStudent = allStudentsData.find(s => s._id === student._id);
    if (fullStudent?.profileImage) {
      return fullStudent.profileImage;
    }
    // Generate avatar
    const name = student.name || 'Student';
    const colors = ['#4F46E5', '#7C3AED', '#EC4899', '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6'];
    const colorIndex = name.length % colors.length;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${colors[colorIndex].replace('#', '')}&color=fff&size=80&font-size=0.5&bold=true`;
  };

  // ==========================================
  // STUDENT DETAIL VIEW - FULL PROFILE
  // ==========================================
  if (studentDetailView && selectedStudent) {
    const subjects = classSubjects;
    const studentId = selectedStudent._id;
    const s1Marks = semester1Marks[studentId] || {};
    const s2Marks = semester2Marks[studentId] || {};
    const studentImage = getStudentImage(selectedStudent);
    const numberOfSubjects = subjects.length || 1;
    
    let s1Total = 0;
    let s2Total = 0;
    
    const subjectTotals = subjects.map(subject => {
      const subjectName = subject.name || subject;
      const s1Subject = s1Marks[subjectName] || {};
      const s2Subject = s2Marks[subjectName] || {};
      const s1SubjectTotal = calculateSubjectTotal(s1Subject);
      const s2SubjectTotal = calculateSubjectTotal(s2Subject);
      s1Total += s1SubjectTotal;
      s2Total += s2SubjectTotal;
      
      return {
        subjectName,
        s1Total: s1SubjectTotal,
        s2Total: s2SubjectTotal,
        s1Marks: s1Subject,
        s2Marks: s2Subject
      };
    });
    
    const s1Average = numberOfSubjects > 0 ? s1Total / numberOfSubjects : 0;
    const s2Average = numberOfSubjects > 0 ? s2Total / numberOfSubjects : 0;
    const s1Grade = getGrade(s1Average);
    const s2Grade = getGrade(s2Average);
    const overallTotal = s1Total + s2Total;
    const overallAverage = numberOfSubjects > 0 ? (s1Average + s2Average) / 2 : 0;
    const overallGrade = getGrade(overallAverage);

    return (
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <style>{`
          .detail-header {
            background: linear-gradient(135deg, #0e7490, #0891b2);
            color: white;
            padding: 40px;
            border-radius: 15px;
            margin-bottom: 30px;
            box-shadow: 0 10px 40px rgba(8, 145, 178, 0.2);
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
            border-top: 4px solid #0891b2;
          }
          .stat-card-value { font-size: 32px; font-weight: 700; color: #0e7490; margin: 10px 0; }
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
                alt={selectedStudent.name}
                className="w-48 h-48 object-cover border-4 border-white shadow-lg"
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedStudent.name)}&background=0E7490&color=fff&size=80&font-size=0.5&bold=true`;
                }}
              />
              <div>
                <h3 style={{ whiteSpace: 'nowrap' }}>{selectedStudent.name}</h3>
                <div className="flex flex-wrap gap-2 mt-1">
                  <span className="detail-badge">Roll No: {selectedStudent.rollNumber}</span>
                  <span className="detail-badge">Class: {selectedClass?.grade}-{selectedClass?.section}</span>
                  <span className="detail-badge">Gender: {selectedStudent.sex || 'N/A'}</span>
                  <span className="detail-badge">Age: {selectedStudent.age || 'N/A'}</span>
                  <span className="detail-badge">Graduated: {selectedClass?.academicYear || 'N/A'}</span>
                </div>
              </div>
            </div>
            <div className="action-buttons">
              <button 
                onClick={handleBackToRoster}
                className="cert-btn cert-btn-back flex items-center gap-2"
              >
                <ArrowLeft size={18} /> Back to Roster
              </button>
            </div>
          </div>
        </div>

        {/* Full Profile Information */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white p-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <User size={20} /> Student Profile Information
            </h3>
          </div>
          <div className="p-6">
            <div className="profile-info-grid">
              <div className="profile-info-item">
                <User size={18} className="text-indigo-500" />
                <div>
                  <div className="label">Full Name</div>
                  <div className="value">{selectedStudent.name}</div>
                </div>
              </div>
              <div className="profile-info-item">
                <Calendar size={18} className="text-indigo-500" />
                <div>
                  <div className="label">Roll Number</div>
                  <div className="value">{selectedStudent.rollNumber || 'N/A'}</div>
                </div>
              </div>
              <div className="profile-info-item">
                <User size={18} className="text-indigo-500" />
                <div>
                  <div className="label">Gender</div>
                  <div className="value">{selectedStudent.sex || 'Not specified'}</div>
                </div>
              </div>
              <div className="profile-info-item">
                <Calendar size={18} className="text-indigo-500" />
                <div>
                  <div className="label">Age</div>
                  <div className="value">{selectedStudent.age || 'N/A'}</div>
                </div>
              </div>
              <div className="profile-info-item">
                <Mail size={18} className="text-indigo-500" />
                <div>
                  <div className="label">Email</div>
                  <div className="value">{selectedStudent.email || 'Not provided'}</div>
                </div>
              </div>
              <div className="profile-info-item">
                <Phone size={18} className="text-indigo-500" />
                <div>
                  <div className="label">Phone</div>
                  <div className="value">{selectedStudent.phone || 'Not provided'}</div>
                </div>
              </div>
              <div className="profile-info-item">
                <BookOpen size={18} className="text-indigo-500" />
                <div>
                  <div className="label">Class</div>
                  <div className="value">Grade {selectedClass?.grade || 'N/A'} - {selectedClass?.section || 'N/A'}</div>
                </div>
              </div>
              <div className="profile-info-item">
                <Calendar size={18} className="text-indigo-500" />
                <div>
                  <div className="label">Date of Birth</div>
                  <div className="value">{selectedStudent.dateOfBirth || 'N/A'}</div>
                </div>
              </div>
              <div className="profile-info-item">
                <User size={18} className="text-indigo-500" />
                <div>
                  <div className="label">Parent Name</div>
                  <div className="value">{selectedStudent.parentName || 'N/A'}</div>
                </div>
              </div>
              <div className="profile-info-item">
                <Phone size={18} className="text-indigo-500" />
                <div>
                  <div className="label">Parent Phone</div>
                  <div className="value">{selectedStudent.parentPhone || 'N/A'}</div>
                </div>
              </div>
              <div className="profile-info-item">
                <MapPin size={18} className="text-indigo-500" />
                <div>
                  <div className="label">Address</div>
                  <div className="value">{selectedStudent.address || 'N/A'}</div>
                </div>
              </div>
              <div className="profile-info-item">
                <Award size={18} className="text-indigo-500" />
                <div>
                  <div className="label">Academic Year</div>
                  <div className="value">{selectedClass?.academicYear || 'N/A'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card" style={{borderTopColor: '#3b82f6'}}>
            <div className="stat-card-label">Semester 1 Total</div>
            <div className="stat-card-value" style={{color: '#3b82f6'}}>{s1Total}</div>
            <p className="text-sm" style={{color: s1Grade.color}}>Avg: {s1Average.toFixed(1)} | Grade: {s1Grade.letter}</p>
          </div>
          <div className="stat-card" style={{borderTopColor: '#22c55e'}}>
            <div className="stat-card-label">Semester 2 Total</div>
            <div className="stat-card-value" style={{color: '#22c55e'}}>{s2Total}</div>
            <p className="text-sm" style={{color: s2Grade.color}}>Avg: {s2Average.toFixed(1)} | Grade: {s2Grade.letter}</p>
          </div>
          <div className="stat-card" style={{borderTopColor: '#8b5cf6'}}>
            <div className="stat-card-label">Overall Total</div>
            <div className="stat-card-value" style={{color: '#8b5cf6'}}>{overallTotal}</div>
            <p className="text-sm" style={{color: overallGrade.color}}>Avg: {overallAverage.toFixed(1)} | Grade: {overallGrade.letter}</p>
          </div>
          <div className="stat-card" style={{borderTopColor: '#f59e0b'}}>
            <div className="stat-card-label">Performance</div>
            <div className="stat-card-value" style={{color: '#f59e0b'}}>{((overallTotal / (subjects.length * 110)) * 100).toFixed(1)}%</div>
            <p className="text-sm text-gray-500">Overall Score</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <span>📘 Semester 1 - Detailed Marks</span>
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-blue-50 to-blue-100 border-b-2 border-blue-200">
                  <th className="p-3 text-left text-sm font-bold border border-gray-200">Subject</th>
                  {examTypes.map(exam => (
                    <th key={`s1-${exam}`} className="p-2 text-center text-xs font-bold border border-gray-200">{examLabels[exam]}</th>
                  ))}
                  <th className="p-2 text-center text-sm font-bold border border-gray-200 text-blue-700">Total</th>
                  <th className="p-2 text-center text-sm font-bold border border-gray-200 text-blue-700">Grade</th>
                </tr>
              </thead>
              <tbody>
                {subjectTotals.map((item, idx) => {
                  const grade = getGrade(item.s1Total);
                  return (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="p-3 text-sm font-medium text-gray-700 border border-gray-200">{item.subjectName}</td>
                      {examTypes.map(exam => (
                        <td key={`s1-${idx}-${exam}`} className="p-2 text-center text-sm border border-gray-200">
                          {item.s1Marks[exam]?.score || '-'}
                        </td>
                      ))}
                      <td className="p-2 text-center text-sm font-bold text-blue-600 border border-gray-200">{item.s1Total}</td>
                      <td className="p-2 text-center border border-gray-200">
                        <span className="px-2 py-1 rounded text-xs font-bold" style={{background: grade.bg, color: grade.color}}>
                          {grade.letter}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                <tr className="bg-blue-50 font-bold">
                  <td className="p-3 text-sm text-gray-700 border border-gray-200">Grand Total</td>
                  {examTypes.map(exam => {
                    const total = subjectTotals.reduce((sum, item) => sum + (item.s1Marks[exam]?.score || 0), 0);
                    return (
                      <td key={`s1-total-${exam}`} className="p-2 text-center text-sm text-blue-700 border border-gray-200">{total}</td>
                    );
                  })}
                  <td className="p-2 text-center text-sm text-blue-700 border border-gray-200">{s1Total}</td>
                  <td className="p-2 text-center border border-gray-200">
                    <span className="px-2 py-1 rounded text-xs font-bold" style={{background: s1Grade.bg, color: s1Grade.color}}>
                      {s1Grade.letter}
                    </span>
                  </td>
                </tr>
                <tr className="bg-blue-100 font-bold">
                  <td className="p-3 text-sm text-blue-700 border border-gray-200">📊 AVERAGE</td>
                  <td colSpan={examTypes.length} className="p-2 text-center text-sm text-gray-600 border border-gray-200">-</td>
                  <td className="p-2 text-center text-sm font-bold text-blue-700 border border-gray-200">{s1Average.toFixed(1)}</td>
                  <td className="p-2 text-center border border-gray-200">
                    <span className="px-2 py-1 rounded text-xs font-bold" style={{background: s1Grade.bg, color: s1Grade.color}}>
                      {s1Grade.letter}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <span>📗 Semester 2 - Detailed Marks</span>
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-green-50 to-green-100 border-b-2 border-green-200">
                  <th className="p-3 text-left text-sm font-bold border border-gray-200">Subject</th>
                  {examTypes.map(exam => (
                    <th key={`s2-${exam}`} className="p-2 text-center text-xs font-bold border border-gray-200">{examLabels[exam]}</th>
                  ))}
                  <th className="p-2 text-center text-sm font-bold border border-gray-200 text-green-700">Total</th>
                  <th className="p-2 text-center text-sm font-bold border border-gray-200 text-green-700">Grade</th>
                </tr>
              </thead>
              <tbody>
                {subjectTotals.map((item, idx) => {
                  const grade = getGrade(item.s2Total);
                  return (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="p-3 text-sm font-medium text-gray-700 border border-gray-200">{item.subjectName}</td>
                      {examTypes.map(exam => (
                        <td key={`s2-${idx}-${exam}`} className="p-2 text-center text-sm border border-gray-200">
                          {item.s2Marks[exam]?.score || '-'}
                        </td>
                      ))}
                      <td className="p-2 text-center text-sm font-bold text-green-600 border border-gray-200">{item.s2Total}</td>
                      <td className="p-2 text-center border border-gray-200">
                        <span className="px-2 py-1 rounded text-xs font-bold" style={{background: grade.bg, color: grade.color}}>
                          {grade.letter}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                <tr className="bg-green-50 font-bold">
                  <td className="p-3 text-sm text-gray-700 border border-gray-200">Grand Total</td>
                  {examTypes.map(exam => {
                    const total = subjectTotals.reduce((sum, item) => sum + (item.s2Marks[exam]?.score || 0), 0);
                    return (
                      <td key={`s2-total-${exam}`} className="p-2 text-center text-sm text-green-700 border border-gray-200">{total}</td>
                    );
                  })}
                  <td className="p-2 text-center text-sm text-green-700 border border-gray-200">{s2Total}</td>
                  <td className="p-2 text-center border border-gray-200">
                    <span className="px-2 py-1 rounded text-xs font-bold" style={{background: s2Grade.bg, color: s2Grade.color}}>
                      {s2Grade.letter}
                    </span>
                  </td>
                </tr>
                <tr className="bg-green-100 font-bold">
                  <td className="p-3 text-sm text-green-700 border border-gray-200">📊 AVERAGE</td>
                  <td colSpan={examTypes.length} className="p-2 text-center text-sm text-gray-600 border border-gray-200">-</td>
                  <td className="p-2 text-center text-sm font-bold text-green-700 border border-gray-200">{s2Average.toFixed(1)}</td>
                  <td className="p-2 text-center border border-gray-200">
                    <span className="px-2 py-1 rounded text-xs font-bold" style={{background: s2Grade.bg, color: s2Grade.color}}>
                      {s2Grade.letter}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <span>📊 Semester Comparison</span>
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 text-center">
                <p className="text-sm font-semibold text-blue-700">Semester 1</p>
                <p className="text-2xl font-bold text-blue-700">{s1Total}</p>
                <p className="text-xs text-blue-600">Avg: {s1Average.toFixed(1)} | Grade: {s1Grade.letter}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-xl border border-green-200 text-center">
                <p className="text-sm font-semibold text-green-700">Semester 2</p>
                <p className="text-2xl font-bold text-green-700">{s2Total}</p>
                <p className="text-xs text-green-600">Avg: {s2Average.toFixed(1)} | Grade: {s2Grade.letter}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-xl border border-purple-200 text-center">
                <p className="text-sm font-semibold text-purple-700">Difference</p>
                <p className={`text-2xl font-bold ${s2Total - s1Total > 0 ? 'text-green-600' : s2Total - s1Total < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                  {s2Total - s1Total > 0 ? '+' : ''}{s2Total - s1Total}
                </p>
                <p className="text-xs text-purple-600">{s2Total - s1Total > 0 ? 'Improved' : s2Total - s1Total < 0 ? 'Declined' : 'Same'}</p>
              </div>
              <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-center">
                <p className="text-sm font-semibold text-amber-700">Overall Average</p>
                <p className="text-2xl font-bold text-amber-700">{overallAverage.toFixed(1)}</p>
                <p className="text-xs text-amber-600">Grade: {overallGrade.letter}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // ROSTER VIEW
  // ==========================================
  if (viewMode === 'roster' && selectedClass) {
    const students = classStudents;
    const subjects = classSubjects;

    const filteredStudents = students.filter(s =>
      s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.rollNumber?.toString().includes(searchTerm)
    );

    return (
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <style>{`
          .dashboard-header { margin-bottom: 30px; }
          .header-top {
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 20px;
            margin-bottom: 20px;
          }
          .header-title {
            font-family: 'Playfair Display', serif;
            font-size: 32px;
            font-weight: 800;
            color: #1a202c;
          }
          .header-subtitle { color: #666; margin-top: 5px; }
          .header-controls { display: flex; gap: 10px; flex-wrap: wrap; }
          .control-btn {
            padding: 10px 20px;
            border-radius: 8px;
            border: none;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.3s;
            display: flex;
            align-items: center;
            gap: 8px;
          }
        `}</style>

        <div className="dashboard-header">
          <div className="header-top">
            <div>
              <h2 className="header-title">🎓 Graduated Class Roster</h2>
              <p className="header-subtitle">
                Grade {selectedClass.grade} - Section {selectedClass.section} | {subjects.length} Subjects | Total Students: {students.length} | Graduated: {selectedClass.academicYear}
              </p>
            </div>
            <div className="header-controls">
              <button
                onClick={() => setSaveSpace(!saveSpace)}
                className="control-btn"
                style={{
                  background: saveSpace ? '#059669' : '#e5e7eb',
                  color: saveSpace ? 'white' : '#333'
                }}
              >
                <Settings size={18} />
                {saveSpace ? 'Compact' : 'Full'}
              </button>
              <button 
                onClick={handleBackToList} 
                className="control-btn"
                style={{ background: '#f3f4f6', color: '#0891b2' }}
              >
                <ChevronLeft size={18} /> Graduated Classes
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by student name or roll number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              />
            </div>
            {searchTerm && (
              <p className="text-xs text-gray-600 mt-2 font-medium">
                Found <span className="font-bold text-gray-800">{filteredStudents.length}</span> student{filteredStudents.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 p-4 rounded-xl border border-cyan-200">
            <p className="text-sm text-cyan-700 font-semibold">Total Students</p>
            <p className="text-3xl font-bold text-cyan-700">{students.length}</p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
            <p className="text-sm text-blue-700 font-semibold">Semester 1 Average</p>
            <p className="text-3xl font-bold text-blue-700">
              {students.length > 0 ? (
                (students.reduce((sum, s) => {
                  const marks = semester1Marks[s._id] || {};
                  const total = subjects.reduce((subSum, subject) => {
                    const subjectName = subject.name || subject;
                    return subSum + calculateSubjectTotal(marks[subjectName] || {});
                  }, 0);
                  return sum + total;
                }, 0) / students.length).toFixed(1)
              ) : '−'}
            </p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
            <p className="text-sm text-green-700 font-semibold">Semester 2 Average</p>
            <p className="text-3xl font-bold text-green-700">
              {students.length > 0 ? (
                (students.reduce((sum, s) => {
                  const marks = semester2Marks[s._id] || {};
                  const total = subjects.reduce((subSum, subject) => {
                    const subjectName = subject.name || subject;
                    return subSum + calculateSubjectTotal(marks[subjectName] || {});
                  }, 0);
                  return sum + total;
                }, 0) / students.length).toFixed(1)
              ) : '−'}
            </p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
            <p className="text-sm text-purple-700 font-semibold">Subjects</p>
            <p className="text-3xl font-bold text-purple-700">{subjects.length}</p>
          </div>
        </div>

        <div className="bg-white shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white">
                <tr>
                  <th className="p-3 text-center text-sm font-bold border border-cyan-600">Roll No</th>
                  <th className="p-3 text-center text-sm font-bold border border-cyan-600">Photo</th>
                  <th className="p-3 text-left text-sm font-bold border border-cyan-600" style={{ whiteSpace: 'nowrap' }}>Student Name</th>
                  <th className="p-3 text-center text-sm font-bold border border-cyan-600" style={{ whiteSpace: 'nowrap' }}>Semester</th>
                  {!saveSpace && (
                    <>
                      <th className="p-3 text-left text-sm font-bold border border-cyan-600" style={{ whiteSpace: 'nowrap' }}>Gender</th>
                      <th className="p-3 text-left text-sm font-bold border border-cyan-600" style={{ whiteSpace: 'nowrap' }}>Age</th>
                    </>
                  )}
                  {subjects.map((subject, idx) => {
                    const subjectName = subject.name || subject;
                    return (
                      <th key={idx} className="p-3 text-center text-sm font-bold border border-cyan-600" title={subjectName} style={{ whiteSpace: 'nowrap' }}>
                        {subjectName.length > 8 ? subjectName.substring(0, 8) + '...' : subjectName}
                      </th>
                    );
                  })}
                  <th className="p-3 text-center text-sm font-bold border border-cyan-600" style={{ whiteSpace: 'nowrap' }}>Total</th>
                  <th className="p-3 text-center text-sm font-bold border border-cyan-600" style={{ whiteSpace: 'nowrap' }}>Grade</th>
                  <th className="p-3 text-center text-sm font-bold border border-cyan-600" style={{ whiteSpace: 'nowrap' }}>Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredStudents.map((student) => {
                  const s1Marks = semester1Marks[student._id] || {};
                  const s2Marks = semester2Marks[student._id] || {};
                  
                  const s1Total = subjects.reduce((sum, subject) => {
                    const subjectName = subject.name || subject;
                    return sum + calculateSubjectTotal(s1Marks[subjectName] || {});
                  }, 0);
                  
                  const s2Total = subjects.reduce((sum, subject) => {
                    const subjectName = subject.name || subject;
                    return sum + calculateSubjectTotal(s2Marks[subjectName] || {});
                  }, 0);
                  
                  const s1Grade = getGrade(s1Total);
                  const s2Grade = getGrade(s2Total);
                  const studentImage = getStudentImage(student);
                  
                  const semesters = [
                    { 
                      name: 'Semester 1', 
                      marks: s1Marks, 
                      total: s1Total, 
                      grade: s1Grade,
                      bg: 'bg-blue-50'
                    },
                    { 
                      name: 'Semester 2', 
                      marks: s2Marks, 
                      total: s2Total, 
                      grade: s2Grade,
                      bg: 'bg-green-50'
                    }
                  ];
                  
                  return semesters.map((sem, idx) => {
                    return (
                      <tr 
                        key={`${student._id}-${sem.name}`} 
                        className={`hover:bg-cyan-50 transition ${idx === 0 ? 'border-t-2 border-gray-200' : ''}`}
                      >
                        {idx === 0 ? (
                          <td className="p-3 text-center text-sm font-semibold text-gray-700 border border-gray-200" rowSpan="2">
                            {student.rollNumber}
                          </td>
                        ) : null}
                        {idx === 0 ? (
                          <td className="p-3 text-center border border-gray-200" rowSpan="2">
                            <img 
                              src={studentImage} 
                              alt={student.name}
                              className="w-10 h-10 rounded-full object-cover border-2 border-cyan-200 mx-auto cursor-pointer"
                              onClick={() => handleStudentDetail(student)}
                              onError={(e) => {
                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=0E7490&color=fff&size=40&font-size=0.5&bold=true`;
                              }}
                            />
                          </td>
                        ) : null}
                        {idx === 0 ? (
                          <td className="p-3 text-sm font-medium text-gray-900 border border-gray-200" rowSpan="2">
                            <button
                              onClick={() => handleStudentDetail(student)}
                              className="hover:text-cyan-600 hover:underline transition"
                              style={{ whiteSpace: 'nowrap' }}
                            >
                              {student.name}
                            </button>
                          </td>
                        ) : null}
                        <td className={`p-3 text-sm font-semibold text-center border border-gray-200 ${sem.bg}`} style={{ whiteSpace: 'nowrap' }}>
                          {sem.name}
                        </td>
                        {!saveSpace && (
                          <>
                            {idx === 0 ? (
                              <td className="p-3 text-sm text-center border border-gray-200" rowSpan="2" style={{ whiteSpace: 'nowrap' }}>
                                {student.sex || '-'}
                              </td>
                            ) : null}
                            {idx === 0 ? (
                              <td className="p-3 text-sm text-center border border-gray-200" rowSpan="2" style={{ whiteSpace: 'nowrap' }}>
                                {student.age || '-'}
                              </td>
                            ) : null}
                          </>
                        )}
                        
                        {subjects.map((subject, subIdx) => {
                          const subjectName = subject.name || subject;
                          const subjectMarks = sem.marks[subjectName] || {};
                          const total = calculateSubjectTotal(subjectMarks);
                          return (
                            <td key={subIdx} className="p-2 text-center border border-gray-200" style={{ whiteSpace: 'nowrap' }}>
                              <span className="text-sm font-medium text-blue-600">
                                {total > 0 ? total : '-'}
                              </span>
                            </td>
                          );
                        })}
                        
                        <td className="p-2 text-center border border-gray-200" style={{ whiteSpace: 'nowrap' }}>
                          <span className="text-sm font-bold text-cyan-700">{sem.total}</span>
                        </td>
                        <td className="p-2 text-center border border-gray-200" style={{ whiteSpace: 'nowrap' }}>
                          <span 
                            className="px-2 py-1 rounded text-xs font-bold"
                            style={{background: sem.grade.bg, color: sem.grade.color}}
                          >
                            {sem.grade.letter}
                          </span>
                        </td>
                        {idx === 0 ? (
                          <td className="p-2 text-center border border-gray-200" rowSpan="2" style={{ whiteSpace: 'nowrap' }}>
                            <button
                              onClick={() => handleStudentDetail(student)}
                              className="px-3 py-1 bg-gradient-to-r from-cyan-600 to-blue-700 text-white text-xs font-semibold rounded-lg hover:from-cyan-700 hover:to-blue-800 transition flex items-center gap-1 mx-auto"
                            >
                              <Eye size={14} /> Details
                            </button>
                          </td>
                        ) : null}
                      </tr>
                    );
                  });
                })}
              </tbody>
              <tfoot className="bg-gray-100 border-t-2 border-gray-300">
                <tr>
                  <td colSpan={saveSpace ? 4 : 6} className="p-3 text-sm font-bold text-gray-700 border border-gray-200">
                    Semester 1 Averages
                  </td>
                  {subjects.map((subject, idx) => {
                    const subjectName = subject.name || subject;
                    const scores = filteredStudents
                      .map(s => {
                        const marks = semester1Marks[s._id]?.[subjectName] || {};
                        return calculateSubjectTotal(marks);
                      })
                      .filter(s => s > 0);
                    const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
                    return (
                      <td key={`s1-avg-${idx}`} className="p-2 text-center border border-gray-200" style={{ whiteSpace: 'nowrap' }}>
                        <span className="text-xs font-medium text-gray-600">
                          {avg > 0 ? avg.toFixed(1) : '-'}
                        </span>
                      </td>
                    );
                  })}
                  <td className="p-2 text-center border border-gray-200" style={{ whiteSpace: 'nowrap' }}>
                    <span className="text-xs font-medium text-gray-600">
                      {filteredStudents.length > 0 ? 
                        (filteredStudents.reduce((sum, s) => {
                          const marks = semester1Marks[s._id] || {};
                          const total = subjects.reduce((subSum, subject) => {
                            const subjectName = subject.name || subject;
                            return subSum + calculateSubjectTotal(marks[subjectName] || {});
                          }, 0);
                          return sum + total;
                        }, 0) / filteredStudents.length).toFixed(1) 
                        : '-'}
                    </span>
                  </td>
                  <td className="p-2 text-center border border-gray-200" style={{ whiteSpace: 'nowrap' }}>
                    <span className="text-xs font-medium text-gray-600">-</span>
                  </td>
                  <td className="p-2 text-center border border-gray-200"></td>
                </tr>
                <tr>
                  <td colSpan={saveSpace ? 4 : 6} className="p-3 text-sm font-bold text-gray-700 border border-gray-200">
                    Semester 2 Averages
                  </td>
                  {subjects.map((subject, idx) => {
                    const subjectName = subject.name || subject;
                    const scores = filteredStudents
                      .map(s => {
                        const marks = semester2Marks[s._id]?.[subjectName] || {};
                        return calculateSubjectTotal(marks);
                      })
                      .filter(s => s > 0);
                    const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
                    return (
                      <td key={`s2-avg-${idx}`} className="p-2 text-center border border-gray-200" style={{ whiteSpace: 'nowrap' }}>
                        <span className="text-xs font-medium text-gray-600">
                          {avg > 0 ? avg.toFixed(1) : '-'}
                        </span>
                      </td>
                    );
                  })}
                  <td className="p-2 text-center border border-gray-200" style={{ whiteSpace: 'nowrap' }}>
                    <span className="text-xs font-medium text-gray-600">
                      {filteredStudents.length > 0 ? 
                        (filteredStudents.reduce((sum, s) => {
                          const marks = semester2Marks[s._id] || {};
                          const total = subjects.reduce((subSum, subject) => {
                            const subjectName = subject.name || subject;
                            return subSum + calculateSubjectTotal(marks[subjectName] || {});
                          }, 0);
                          return sum + total;
                        }, 0) / filteredStudents.length).toFixed(1) 
                        : '-'}
                    </span>
                  </td>
                  <td className="p-2 text-center border border-gray-200" style={{ whiteSpace: 'nowrap' }}>
                    <span className="text-xs font-medium text-gray-600">-</span>
                  </td>
                  <td className="p-2 text-center border border-gray-200"></td>
                </tr>
                <tr>
                  <td colSpan={saveSpace ? 4 : 6} className="p-3 text-sm font-bold text-gray-700 border border-gray-200">
                    Total Students
                  </td>
                  <td colSpan={subjects.length + 3} className="p-3 text-center border border-gray-200">
                    <span className="text-sm font-bold text-cyan-700" style={{ whiteSpace: 'nowrap' }}>
                      {filteredStudents.length} Students | {subjects.length} Subjects
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // GRADUATED CLASSES LIST VIEW
  // ==========================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2 tracking-tight flex items-center gap-3">
                <GraduationCap className="w-8 h-8 text-purple-600" />
                Graduated Classes
              </h1>
              <p className="text-gray-600 text-base">
                View all graduated classes with complete student profiles and marks
              </p>
            </div>
            <div className="flex gap-3 flex-wrap">
               
           <button onClick={() => navigate("/achive-student")}>
           View Mark
           </button>
               
                <button
                onClick={fetchGraduatedClasses}
                className="px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold shadow-md flex items-center gap-2"
              >
                <RefreshCw size={18} className={loading ? 'animate-spin' : ''} /> 
                Refresh
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <p className="text-xs font-bold text-gray-600 uppercase tracking-widest">Total Classes</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{statistics.totalClasses}</p>
          </div>
          <div className="bg-white border border-purple-200 rounded-xl p-6 shadow-sm">
            <p className="text-xs font-bold text-purple-700 uppercase tracking-widest">Total Students</p>
            <p className="text-3xl font-bold text-purple-900 mt-2">{statistics.totalStudents}</p>
          </div>
          <div className="bg-white border border-blue-200 rounded-xl p-6 shadow-sm">
            <p className="text-xs font-bold text-blue-700 uppercase tracking-widest">Year Range</p>
            <p className="text-3xl font-bold text-blue-900 mt-2">{statistics.yearRange}</p>
          </div>
          <div className="bg-white border border-green-200 rounded-xl p-6 shadow-sm">
            <p className="text-xs font-bold text-green-700 uppercase tracking-widest">Available Years</p>
            <p className="text-3xl font-bold text-green-900 mt-2">{availableYears.length}</p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 tracking-tight">
                <Search className="w-4 h-4 inline mr-1" /> Search Classes
              </label>
              <input
                type="text"
                placeholder="Search by grade, section, subject..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 tracking-tight">
                <Filter className="w-4 h-4 inline mr-1" /> Academic Year
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Years</option>
                {availableYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 tracking-tight">Results</label>
              <div className="flex items-center h-11 px-4 bg-gray-100 rounded-lg">
                <span className="text-sm font-semibold text-gray-700">
                  {filteredClasses.length} Class{filteredClasses.length !== 1 ? 'es' : ''} Found
                </span>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600"></div>
          </div>
        ) : filteredClasses.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
            <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-medium">No graduated classes found</p>
            <p className="text-gray-400 text-sm mt-2">
              {searchTerm || selectedYear !== 'all' 
                ? 'Try adjusting your search or filters' 
                : 'Classes will appear here when they are marked as graduated'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClasses.map((cls) => (
              <div key={cls._id} className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <GraduationCap className="w-5 h-5 text-purple-600" />
                    <h3 className="text-lg font-bold text-gray-900">
                      Grade {cls.grade} - {cls.section}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    {cls.subject?.name || 'No Subject'} 
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded">
                      {cls.academicYear || 'N/A'}
                    </span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                      {cls.totalStudents || 0} Students
                    </span>
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">
                      {cls.subjects?.length || 0} Subjects
                    </span>
                  </div>
                  <button
                    onClick={() => handleViewRoster(cls)}
                    className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-700 text-white rounded-lg hover:from-cyan-700 hover:to-blue-800 transition font-semibold flex items-center justify-center gap-2"
                  >
                    <Eye size={16} /> View Roster
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ArchiveManagement;