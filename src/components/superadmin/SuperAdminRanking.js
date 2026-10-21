import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { Download, Search, ChevronLeft, Eye, FileSpreadsheet, Award, Trophy, Calendar, FileText, Printer, Settings, ChevronRight, ChevronsLeft, ChevronsRight, Shield, Star, CheckCircle, Zap, BookOpen, Target, TrendingUp, BarChart3, QrCode, Stamp, PenTool, ShieldCheck, User, Mail, Phone, Users, School, MapPin, GraduationCap, Edit2, RefreshCw, X, Save, Trash2, Home, ArrowLeft } from 'lucide-react';
import api from '../../services/api';
import * as XLSX from 'xlsx';
import QRCode from 'qrcode';
import Logo from '../../assets/Logo.png'
import Logo1 from '../../assets/Logo2.png'
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const StudentReportCard = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [allMarks, setAllMarks] = useState({});
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [viewMode, setViewMode] = useState('all');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [allSubjectsList, setAllSubjectsList] = useState([]);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  const [qrCodes, setQrCodes] = useState({});
  const [digitalAssets, setDigitalAssets] = useState(null);
  const [generatingQR, setGeneratingQR] = useState(false);

  const [semester, setSemester] = useState('Semester 1');
  const [academicYear, setAcademicYear] = useState('2024-2025');

  const [digitalSignatures, setDigitalSignatures] = useState({
    classTeacher: '________________________',
    principal: '________________________',
  });
  
  const [saveSpace, setSaveSpace] = useState(() => {
    return localStorage.getItem('ranking_save_space') === 'true';
  });
  
  // Report card state
  const [reportCardData, setReportCardData] = useState(null);
  const [showReportCard, setShowReportCard] = useState(false);
  const [isYearly, setIsYearly] = useState(false);
  
  // Student profile images cache
  const [studentImages, setStudentImages] = useState({});
  
  // Student details cache (gender, age, etc.)
  const [studentDetails, setStudentDetails] = useState({});
  
  // Refs for report card pages
  const page1Ref = useRef();
  const page2Ref = useRef();
  
  useEffect(() => { 
    loadClasses(); 
  }, []);
  
  useEffect(() => {
    localStorage.setItem('ranking_save_space', saveSpace);
  }, [saveSpace]);
  
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, semester, academicYear, selectedClass]);
  
  useEffect(() => {
    if (selectedClass) {
      fetchAllMarksForClass(selectedClass._id);
    }
  }, [selectedClass, semester, academicYear]);

  useEffect(() => {
    loadDigitalAssets();
  }, []);

  const loadDigitalAssets = async () => {
    try {
      const response = await api.get('/verification/digital-assets');
      setDigitalAssets(response.data);
    } catch (error) {
      console.error('Failed to load digital assets:', error);
      setDigitalAssets({
        stamps: {
          schoolStamp: 'data:image/svg+xml,...',
          academicStamp: 'data:image/svg+xml,...'
        },
        signatures: {
          classTeacher: { name: 'Class Teacher', title: 'Subject Teacher' },
          principal: { name: 'School Principal', title: 'Head of Institution' },
          controllerExams: { name: 'Controller of Exams', title: 'Academic Affairs' }
        },
        legalText: 'This certificate is digitally generated and legally valid.'
      });
    }
  };

  const loadClasses = async () => {
    try {
      const res = await api.get('/classes');
      
      const uniqueClasses = [];
      const gradeSectionMap = new Map();
      
      for (const cls of res.data) {
        const key = `${cls.grade}-${cls.section}`;
        if (!gradeSectionMap.has(key)) {
          gradeSectionMap.set(key, cls);
          uniqueClasses.push(cls);
        }
      }
      
      setClasses(uniqueClasses);
      toast.success(`Loaded ${uniqueClasses.length} unique classes`);
    } catch (err) {
      toast.error('Failed to load classes');
    }
  };

  // Get subjects from class data
  const getClassSubjects = (classData) => {
    if (!classData) return [];
    return classData.subjects || [];
  };

  const fetchAllMarksForClass = async (classId) => {
    setLoading(true);
    try {
      const classResponse = await api.get(`/classes/${classId}`);
      const classData = classResponse.data;
      const studentsList = classData.students || [];
      setStudents(studentsList);
      
      // Get subjects from class data
      const subjects = getClassSubjects(classData);
      setAllSubjectsList(subjects);
      
      // Fetch profile images and details for all students
      const images = {};
      const details = {};
      for (const student of studentsList) {
        try {
          const userRes = await api.get(`/users/${student._id}`);
          if (userRes.data.profileImage) {
            images[student._id] = userRes.data.profileImage;
          }
          details[student._id] = {
            sex: userRes.data.sex || 'N/A',
            age: userRes.data.age || 'N/A',
            profileImage: userRes.data.profileImage || null,
            email: userRes.data.email || '',
            phone: userRes.data.phone || '',
            address: userRes.data.address || '',
            dateOfBirth: userRes.data.dateOfBirth || ''
          };
        } catch (err) {
          console.log(`No details for ${student.name}`);
          details[student._id] = { sex: 'N/A', age: 'N/A', profileImage: null };
        }
      }
      setStudentImages(images);
      setStudentDetails(details);
      
      if (!studentsList || studentsList.length === 0) {
        toast.warning('No students found in this class');
        setLoading(false);
        return;
      }
      
      // Fetch marks for all students
      const marksResponse = await api.get(`/marks/class/${classId}`, {
        params: { semester: semester, academicYear: academicYear }
      });
      const allMarksData = marksResponse.data;
      
      // Initialize marks map with all subjects from class
      const marksMap = {};
      studentsList.forEach(student => {
        marksMap[student._id] = {};
        subjects.forEach(subject => {
          const subjectName = typeof subject === 'string' ? subject : subject.name;
          marksMap[student._id][subjectName] = {
            exams: {}
          };
        });
      });
      
      // Populate marks from API
      allMarksData.forEach(mark => {
        const studentId = mark.studentId?._id || mark.studentId;
        const subject = mark.subject;
        const examType = mark.examType;
        const score = mark.score;
        
        if (!studentId || !subject) return;
        
        if (marksMap[studentId] && marksMap[studentId][subject]) {
          marksMap[studentId][subject].exams[examType] = {
            score: score
          };
        }
      });
      
      // Fetch individual student marks for more data
      for (const student of studentsList) {
        try {
          const studentMarksResponse = await api.get(`/marks/student/${student._id}`, {
            params: { semester: semester, academicYear: academicYear }
          });
          const studentMarks = studentMarksResponse.data;
          
          studentMarks.forEach(mark => {
            const subject = mark.subject;
            const examType = mark.examType;
            const score = mark.score;
            
            if (subject && marksMap[student._id] && marksMap[student._id][subject]) {
              marksMap[student._id][subject].exams[examType] = {
                score: score
              };
            }
          });
        } catch (err) {
          console.log(`No additional marks for ${student.name}`);
        }
      }
      
      setAllMarks(marksMap);
      
      toast.success(`Loaded ${subjects.length} subjects for ${studentsList.length} students (${semester}, ${academicYear})`);
      
    } catch (error) {
      console.error('Failed to fetch marks:', error);
      toast.error('Failed to fetch marks: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };
  
  const handleClassSelect = async (classId) => {
    const cls = classes.find(c => c._id === classId);
    setSelectedClass(cls);
    await fetchAllMarksForClass(classId);
  };

  const getSubjectTotal = (studentId, subjectName) => {
    const subjectData = allMarks[studentId]?.[subjectName];
    if (!subjectData) return null;
    
    const exams = subjectData.exams;
    let totalScore = 0;
    
    // Quiz marks excluded
    if (exams.test?.score) totalScore += exams.test.score;
    if (exams.midterm?.score) totalScore += exams.midterm.score;
    if (exams.textbook?.score) totalScore += exams.textbook.score;
    if (exams.notebook?.score) totalScore += exams.notebook.score;
    if (exams.assignment?.score) totalScore += exams.assignment.score;
    if (exams.final?.score) totalScore += exams.final.score;
    
    if (totalScore === 0) return null;
    
    return {
      total: totalScore,
      maxTotal: 100
    };
  };

  // Calculate overall average: Sum all subject totals, divide by TOTAL number of subjects in the class
  // This gives the average percentage (each subject is out of 100)
  const calculateOverallAverage = (studentId) => {
    let totalSubjectScores = 0;
    let subjectCount = allSubjectsList.length; // Use total number of subjects in the class
    
    allSubjectsList.forEach(subject => {
      const subjectName = typeof subject === 'string' ? subject : subject.name;
      const subjectTotal = getSubjectTotal(studentId, subjectName);
      if (subjectTotal && subjectTotal.total > 0) {
        totalSubjectScores += subjectTotal.total;
      }
    });
    
    if (subjectCount === 0) return 0;
    
    // Average = Total marks / Total number of subjects in the class
    // This gives the average percentage (each subject is out of 100)
    return totalSubjectScores / subjectCount;
  };

  const calculateTotalMarks = (studentId) => {
    let total = 0;
    allSubjectsList.forEach(subject => {
      const subjectName = typeof subject === 'string' ? subject : subject.name;
      const subjectTotal = getSubjectTotal(studentId, subjectName);
      if (subjectTotal) {
        total += subjectTotal.total;
      }
    });
    return total;
  };

  const getSubjectMarksDetails = (studentId, subjectName) => {
    return allMarks[studentId]?.[subjectName] || null;
  };

  const getGrade = (totalScore) => {
    if (totalScore >= 90) return { letter: 'A+', grade: 'First Class with Distinction', color: '#059669', bg: '#d1fae5', description: 'Outstanding Achievement' };
    if (totalScore >= 80) return { letter: 'A', grade: 'First Class', color: '#0891b2', bg: '#cffafe', description: 'Excellent' };
    if (totalScore >= 75) return { letter: 'B+', grade: 'First Class', color: '#2563eb', bg: '#dbeafe', description: 'Very Good' };
    if (totalScore >= 70) return { letter: 'B', grade: 'Second Class', color: '#7c3aed', bg: '#ede9fe', description: 'Good' };
    if (totalScore >= 60) return { letter: 'C', grade: 'Second Class', color: '#f59e0b', bg: '#fef3c7', description: 'Satisfactory' };
    if (totalScore >= 50) return { letter: 'D', grade: 'Pass Class', color: '#f97316', bg: '#ffedd5', description: 'Pass' };
    return { letter: 'F', grade: 'Fail', color: '#dc2626', bg: '#fee2e2', description: 'Needs Improvement' };
  };

  const isPromoted = (average) => {
    return average >= 50;
  };

  const getPromotionText = (promoted) => {
    return promoted ? 'Promoted' : 'Not Promoted';
  };

  const getStatus = (average) => {
    if (average >= 50) {
      return { text: 'PROMOTED', color: '#059669', bg: '#d1fae5', icon: '✓' };
    }
    return { text: 'NOT PROMOTED', color: '#dc2626', bg: '#fee2e2', icon: '✗' };
  };

  const getStudentImage = (studentId, name) => {
    const image = studentImages[studentId];
    if (image) {
      return image;
    }
    const initials = name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
    const colors = ['#4F46E5', '#7C3AED', '#EC4899', '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6'];
    const colorIndex = (name?.length || 0) % colors.length;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${colors[colorIndex].replace('#', '')}&color=fff&size=40&font-size=0.5&bold=true`;
  };

  const getStudentSex = (studentId) => {
    return studentDetails[studentId]?.sex || 'N/A';
  };

  const getStudentAge = (studentId) => {
    return studentDetails[studentId]?.age || 'N/A';
  };

  const generateAllQRCodes = async () => {
    setGeneratingQR(true);
    try {
      const response = await api.post(`/verification/generate-all-qr/${selectedClass._id}`);
      
      const qrMap = {};
      response.data.qrCodes.forEach(qr => {
        qrMap[qr.studentId] = qr.qrCode;
      });
      setQrCodes(qrMap);
      
      toast.success(`✅ Generated ${response.data.qrCodes.length} QR codes successfully!`);
    } catch (error) {
      console.error('QR generation failed:', error);
      toast.error('Failed to generate QR codes. Please try again.');
    } finally {
      setGeneratingQR(false);
    }
  };

  const downloadQRCode = (studentId, studentName) => {
    const qrImage = qrCodes[studentId];
    if (!qrImage) {
      toast.error('QR code not generated yet. Please generate first.');
      return;
    }
    
    const link = document.createElement('a');
    link.href = qrImage;
    link.download = `QR_${studentName.replace(/\s+/g, '_')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('QR code downloaded!');
  };

  // ==========================================
  // REPORT CARD COMPONENT
  // ==========================================

  const ReportCardView = ({ student, sortedStudents, yearly }) => {
    const [studentPhotoUrl, setStudentPhotoUrl] = useState('https://via.placeholder.com/150x180?text=No+Photo');
    const [studentSex, setStudentSex] = useState('N/A');
    const [studentAge, setStudentAge] = useState('N/A');
    const [subjectRows, setSubjectRows] = useState([]);
    const [totals, setTotals] = useState({ totalMarks: 0, overallAverage: 0, rank: 0, grade: null, promoted: false });

    useEffect(() => {
      const fetchStudentData = async () => {
        try {
          const studentDetailsRes = await api.get(`/users/${student._id}`);
          const completeStudentData = studentDetailsRes.data;
          
          setStudentPhotoUrl(completeStudentData.profileImage || 'https://via.placeholder.com/150x180?text=No+Photo');
          setStudentSex(completeStudentData.sex || student.sex || 'N/A');
          
          let age = completeStudentData.age || student.age;
          if (!age && completeStudentData.dateOfBirth) {
            const birthDate = new Date(completeStudentData.dateOfBirth);
            const today = new Date();
            age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
              age--;
            }
          }
          setStudentAge(age || 'N/A');
        } catch (error) {
          console.error('Error fetching student data:', error);
        }
      };
      fetchStudentData();
    }, [student]);

    useEffect(() => {
      const buildRows = async () => {
        const totalSubjects = allSubjectsList.length;
        
        if (yearly) {
          try {
            const sem1Res = await api.get(`/marks/student/${student._id}`, {
              params: { semester: 'Semester 1', academicYear: academicYear }
            });
            const sem2Res = await api.get(`/marks/student/${student._id}`, {
              params: { semester: 'Semester 2', academicYear: academicYear }
            });
            
            const sem1Marks = sem1Res.data;
            const sem2Marks = sem2Res.data;
            
            const subjectList = allSubjectsList.map(s => typeof s === 'string' ? s : s.name);
            
            const subjectScores = {};
            let totalSem1 = 0;
            let totalSem2 = 0;
            let totalFinal = 0;
            
            subjectList.forEach(subject => {
              const sem1SubjectMarks = sem1Marks.filter(m => m.subject === subject);
              const sem1Total = sem1SubjectMarks.reduce((sum, m) => sum + (m.score || 0), 0);
              
              const sem2SubjectMarks = sem2Marks.filter(m => m.subject === subject);
              const sem2Total = sem2SubjectMarks.reduce((sum, m) => sum + (m.score || 0), 0);
              
              const finalAverage = (sem1Total + sem2Total) / 2;
              
              subjectScores[subject] = {
                sem1: sem1Total,
                sem2: sem2Total,
                final: finalAverage
              };
              totalSem1 += sem1Total;
              totalSem2 += sem2Total;
              totalFinal += finalAverage;
            });
            
            // Divide by TOTAL number of subjects in the class
            const avgSem1 = totalSubjects > 0 ? totalSem1 / totalSubjects : 0;
            const avgSem2 = totalSubjects > 0 ? totalSem2 / totalSubjects : 0;
            const avgFinal = totalSubjects > 0 ? totalFinal / totalSubjects : 0;
            
            const finalGrade = getGrade(avgFinal);
            const studentRank = sortedStudents.find(s => s._id === student._id)?.rank;
            const promoted = isPromoted(avgFinal);
            
            setTotals({
              totalMarks: totalFinal,
              sem1Total: totalSem1,
              sem2Total: totalSem2,
              avgSem1: avgSem1,
              avgSem2: avgSem2,
              overallAverage: avgFinal,
              rank: studentRank || '-',
              grade: finalGrade,
              promoted: promoted
            });
            
            const rows = subjectList.map((subject, index) => {
              const sem1Score = subjectScores[subject]?.sem1 || 0;
              const sem2Score = subjectScores[subject]?.sem2 || 0;
              const finalScore = subjectScores[subject]?.final || 0;
              
              return (
                <tr key={index} className="border-b border-slate-900 h-[29px]">
                  <td className="border-r border-slate-900 text-left pl-3 font-serif text-[13px] text-slate-900 font-normal">{subject}</td>
                  <td className="border-r border-slate-900 text-center font-sans text-[14px] text-blue-900 font-medium">{sem1Score}</td>
                  <td className="border-r border-slate-900 text-center font-sans text-[14px] text-blue-900 font-medium">{sem2Score}</td>
                  <td className="text-center font-sans text-[14px] text-blue-900 font-medium">{finalScore.toFixed(1)}</td>
                </tr>
              );
            });
            
            setSubjectRows(rows);
          } catch (error) {
            console.error('Error fetching yearly marks:', error);
            toast.error('Failed to fetch yearly marks');
          }
        } else {
          let totalSem1 = 0;
          
          const rows = allSubjectsList.map((subject, index) => {
            const subjectName = typeof subject === 'string' ? subject : subject.name;
            const subjectTotal = getSubjectTotal(student._id, subjectName);
            const score = subjectTotal ? subjectTotal.total : 0;
            totalSem1 += score;
            
            return (
              <tr key={index} className="border-b border-slate-900 h-[29px]">
                <td className="border-r border-slate-900 text-left pl-3 font-serif text-[13px] text-slate-900 font-normal">{subjectName}</td>
                <td className="border-r border-slate-900 text-center font-sans text-[14px] text-blue-900 font-medium">{subjectTotal ? subjectTotal.total : '—'}</td>
                <td className="border-r border-slate-900 text-center font-sans text-[14px] text-blue-900 font-medium">—</td>
                <td className="text-center font-sans text-[14px] text-blue-900 font-medium">{subjectTotal ? subjectTotal.total : '—'}</td>
              </tr>
            );
          });
          
          // Divide by TOTAL number of subjects in the class
          const avgSem1 = totalSubjects > 0 ? totalSem1 / totalSubjects : 0;
          const overallAverage = avgSem1;
          const totalMarks = totalSem1;
          const studentRank = sortedStudents.find(s => s._id === student._id)?.rank;
          const grade = getGrade(overallAverage);
          const promoted = isPromoted(overallAverage);
          
          setTotals({
            totalMarks: totalMarks,
            sem1Total: totalMarks,
            avgSem1: avgSem1,
            overallAverage: overallAverage,
            rank: studentRank || '-',
            grade: grade,
            promoted: promoted
          });
          
          setSubjectRows(rows);
        }
      };
      
      buildRows();
    }, [student, yearly, sortedStudents]);

    const handleDownload = async () => {
      const downloadToast = toast.loading('Generating report card PDF...');
      
      try {
        const page1Element = page1Ref.current;
        const page2Element = page2Ref.current;
        
        if (!page1Element || !page2Element) {
          toast.error('Report card elements not found');
          return;
        }

        page1Element.classList.add('pdf-render-mode');
        page2Element.classList.add('pdf-render-mode');

        const canvas1 = await html2canvas(page1Element, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          logging: false,
          backgroundColor: '#ffffff',
          width: 1123,
          height: 794,
          onclone: (clonedDoc) => {
            const images = clonedDoc.querySelectorAll('img');
            return Promise.all(Array.from(images).map(img => {
              if (img.complete) return Promise.resolve();
              return new Promise((resolve) => {
                img.onload = resolve;
                img.onerror = resolve;
              });
            }));
          }
        });

        const canvas2 = await html2canvas(page2Element, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          logging: false,
          backgroundColor: '#ffffff',
          width: 1123,
          height: 794,
          onclone: (clonedDoc) => {
            const images = clonedDoc.querySelectorAll('img');
            return Promise.all(Array.from(images).map(img => {
              if (img.complete) return Promise.resolve();
              return new Promise((resolve) => {
                img.onload = resolve;
                img.onerror = resolve;
              });
            }));
          }
        });

        page1Element.classList.remove('pdf-render-mode');
        page2Element.classList.remove('pdf-render-mode');

        const pdf = new jsPDF({
          orientation: 'landscape',
          unit: 'px',
          format: [1123, 794],
          hotfixes: ['px_scaling']
        });

        const imgData1 = canvas1.toDataURL('image/jpeg', 0.95);
        pdf.addImage(imgData1, 'JPEG', 0, 0, 1123, 794);

        pdf.addPage();
        const imgData2 = canvas2.toDataURL('image/jpeg', 0.95);
        pdf.addImage(imgData2, 'JPEG', 0, 0, 1123, 794);

        const fileName = `Report_Card_${student.name.replace(/\s+/g, '_')}_${academicYear}.pdf`;
        pdf.save(fileName);

        toast.success(`✅ Report card downloaded successfully!`, { id: downloadToast });
      } catch (error) {
        console.error('Error generating PDF:', error);
        toast.error('Failed to generate report card. Please try again.', { id: downloadToast });
      }
    };

    const handleClose = () => {
      setShowReportCard(false);
    };

    const promotionText = getPromotionText(totals.promoted);
    const promotionStampText = totals.promoted ? 'Promoted!' : 'Not Promoted!';
    const promotionSubText = totals.promoted ? 'ያልፋል' : 'አያልፍም';

    const totalsRows = (
      <>
        <tr className="border-b border-slate-900 h-[29px] border-t-2 border-t-slate-900">
          <td className="border-r border-slate-900 text-left pl-3 font-serif text-[13px] text-slate-900 font-bold">Total Sum</td>
          <td className="border-r border-slate-900 text-center font-sans text-[14px] text-blue-900 font-bold">{yearly ? totals.sem1Total?.toFixed(1) : totals.totalMarks.toFixed(1)}</td>
          <td className="border-r border-slate-900 text-center font-sans text-[14px] text-blue-900 font-bold">{yearly ? totals.sem2Total?.toFixed(1) : '—'}</td>
          <td className="text-center font-sans text-[14px] text-blue-900 font-bold">{totals.totalMarks.toFixed(1)}</td>
        </tr>
        <tr className="border-b border-slate-900 h-[29px]">
          <td className="border-r border-slate-900 text-left pl-3 font-serif text-[13px] text-slate-900 font-bold">Average</td>
          <td className="border-r border-slate-900 text-center font-sans text-[14px] text-blue-900 font-bold">{yearly ? totals.avgSem1?.toFixed(2) : totals.overallAverage.toFixed(2)}</td>
          <td className="border-r border-slate-900 text-center font-sans text-[14px] text-blue-900 font-bold">{yearly ? totals.avgSem2?.toFixed(2) : '—'}</td>
          <td className="text-center font-sans text-[14px] text-blue-900 font-bold">{totals.overallAverage.toFixed(2)}</td>
        </tr>
        <tr className="border-b border-slate-900 h-[29px]">
          <td className="border-r border-slate-900 text-left pl-3 font-serif text-[13px] text-slate-900 font-bold">Rank</td>
          <td className="border-r border-slate-900 text-center font-sans text-[14px] text-blue-900 font-bold">{totals.rank}/{sortedStudents.length}</td>
          <td className="border-r border-slate-900 text-center font-sans text-[14px] text-blue-900 font-bold">{yearly ? totals.rank : '—'}/{sortedStudents.length}</td>
          <td className="text-center font-sans text-[14px] text-blue-900 font-bold">{totals.rank}/{sortedStudents.length}</td>
        </tr>
        <tr className="border-b border-slate-900 h-[29px]">
          <td className="border-r border-slate-900 text-left pl-3 font-serif text-[13px] text-slate-900 font-bold">Conduct</td>
          <td className="border-r border-slate-900 text-center font-sans text-[14px] text-blue-900 font-bold">{totals.grade?.letter || '—'}</td>
          <td className="border-r border-slate-900 text-center font-sans text-[14px] text-blue-900 font-bold">{yearly ? totals.grade?.letter : '—'}</td>
          <td className="text-center font-sans text-[14px] text-blue-900 font-bold">{totals.grade?.letter || '—'}</td>
        </tr>
        <tr className="border-b border-slate-900 h-[29px]">
          <td className="border-r border-slate-900 text-left pl-3 font-serif text-[13px] text-slate-900 font-bold">Absent</td>
          <td className="border-r border-slate-900 text-center font-sans text-[14px] text-blue-900">—</td>
          <td className="border-r border-slate-900 text-center font-sans text-[14px] text-blue-900">—</td>
          <td className="text-center font-sans text-[14px] text-blue-900">—</td>
        </tr>
        <tr className="border-b border-slate-900 h-[29px] bg-cyan-100/30">
          <td className="border-r border-slate-900 text-left pl-3 font-serif text-[13px] text-slate-900 font-bold">Promotion</td>
          <td colSpan="3" className="text-center font-sans text-[16px] font-bold" style={{ color: totals.promoted ? '#059669' : '#dc2626' }}>
            {promotionText}
          </td>
        </tr>
      </>
    );

    return (
      <div className="min-h-screen bg-slate-100 p-8 flex flex-col gap-12 justify-center items-center font-serif text-slate-900 select-none print:p-0 print:bg-white">
        
        {/* VIEW 1: FRONT AND BACK COVERS */}
        <div ref={page1Ref} className="w-[1123px] h-[794px] bg-[#31b4cc] shadow-2xl flex p-10 relative overflow-hidden border border-cyan-700 print:shadow-none print:border-none page-break">
          
          {/* LEFT PANEL: BACK COVER (Method of Marking) */}
          <div className="w-1/2 h-full pr-10 border-r  flex flex-col items-center relative text-[14px]">
            <div className="  flex items-center justify-center mb-4">
              <span className="text-[10px] text-center font-sans font-bold leading-tight px-1 text-slate-800">
                <img src={Logo1} alt="Logo" />
              </span>
            </div>
            <h2 className="text-xl font-bold tracking-wide uppercase mb-6 text-slate-800">METHOD OF MARKING</h2>
            <p className="w-full text-justify mb-8 leading-relaxed">Student achievement in each class will be assigned the following values</p>
            <div className="w-full space-y-3 px-4 mb-12">
              {[
                { range: "90%-100%", label: "Excellent" },
                { range: "80%- 89%", label: "very good" },
                { range: "60%-79%", label: "Good" },
                { range: "50%- 59%", label: "satisfactory" },
                { range: "49%- and below", label: "law" }
              ].map((item, idx) => (
                <div key={idx} className="flex justify-between items-end">
                  <span className="whitespace-nowrap text-slate-800">{item.range}</span>
                  <div className="flex-grow mx-2 border-b border-dotted border-slate-700 h-1"></div>
                  <span className="whitespace-nowrap w-24 text-left text-slate-800">{item.label}</span>
                </div>
              ))}
            </div>
            <p className="w-full text-justify leading-relaxed tracking-wide text-slate-800">
              A mark Zero (0%) should never be given, since it would mean no work has been done absolutely . If a student has been absent from class for the whole period covered and has not made up any of the work ,He/she should be marked 'AB' for 'absent'
            </p>
            <div className="absolute bottom-6 right-6 flex flex-col gap-3 font-bold text-slate-700 text-lg">
              <span>:</span><span>:</span><span>:</span>
            </div>
          </div>

          {/* RIGHT PANEL: FRONT COVER (Student Profile) */}
          <div className="w-1/2 h-full pl-10 flex flex-col items-center text-[13px] text-slate-900">
            {/* Top Header with Logo and Photo */}
            <div className="w-full flex justify-between items-start mb-4">
              <div className="w-24 h-24 flex items-center justify-center flex-shrink-0">
                <span className="text-[10px] text-center font-sans font-bold leading-tight px-1 text-slate-800">
                  <img src={Logo} alt="Logo" />
                </span>
              </div>
              <div className="flex-shrink-0">
                <img 
                  src={studentPhotoUrl} 
                  alt="Student" 
                  className="w-[150px] h-[180px] object-cover  border-3 border-[#b88728] shadow-md"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextElementSibling.style.display = 'flex';
                  }}
                />
                <div className="w-[150px] h-[180px]  bg-gray-100 flex items-center justify-center text-xs text-gray-500 hidden">
                  No Photo
                </div>
              </div>
            </div>

            <div className="text-center space-y-0.5 mb-6">
              <h1 className="text-sm font-bold tracking-wide text-slate-800 uppercase">WAAJJIRA BARNOOTA MAGAALAA SHAGGAR</h1>
              <h1 className="text-sm font-bold tracking-wide text-slate-800 uppercase">KUTAA MAGAALAA KOYYEE FACCEE</h1>
              <h2 className="text-[15px] font-sans font-semibold tracking-normal text-slate-800">በሸገር ከተማ ትምህርት ጽሕፈት ቤት የኮዬ ፈጬ ክ/ከተማ</h2>
              <h2 className="text-[15px] font-sans font-semibold tracking-normal text-slate-800 mb-2">ትምህርት ጽሕፈት ቤት</h2>
              <h3 className="text-[11px] font-bold tracking-wider text-slate-700 uppercase">KAARDII GABAASA FIRII BARATTOOTA SAD. 2FFAA</h3>
              <h3 className="text-[12px] font-sans font-semibold text-slate-700">የ2ኛ ደረጃ ተማሪዎች የውጤት ሪፖርት ካርድ</h3>
              <p className="text-[12px] font-medium text-slate-800 mt-1">Shaggar City Education Office</p>
              <p className="text-[12px] font-medium text-slate-800">Secondary School Student Report Card</p>
            </div>

            <div className="w-full space-y-4">
              <div className="flex items-end w-full">
                <span className="whitespace-nowrap mr-2">Name of School</span>
                <div className="flex-grow border-b border-slate-800 relative pb-0.5">
                  <span className="absolute left-4 bottom-0.5 font-sans text-xl text-blue-900 font-medium tracking-wide">Tulu Dimtu GSS</span>
                </div>
              </div>

              <div className="flex items-end w-full text-[12px]">
                <span className="whitespace-nowrap mr-1 font-bold">Address :</span>
                <span className="whitespace-nowrap font-bold mr-1">Oromia Region</span>
                <span className="whitespace-nowrap mr-1 text-slate-800">Shaggar City</span>
                <span className="whitespace-nowrap font-bold mr-1">Koye Feche</span>
                <span className="whitespace-nowrap text-slate-800">Sub city</span>
              </div>

              <div className="grid grid-cols-2 gap-4 w-full">
                <div className="flex items-end">
                  <span className="whitespace-nowrap mr-2">Woreda</span>
                  <div className="flex-grow border-b border-slate-800 relative pb-0.5">
                    <span className="absolute left-2 bottom-0.5 font-sans text-lg text-blue-900">Tulu Dimtu</span>
                  </div>
                </div>
                <div className="flex items-end">
                  <span className="whitespace-nowrap mr-2">Zone</span>
                  <div className="flex-grow border-b border-slate-800"></div>
                </div>
              </div>

              <h3 className="text-center font-bold text-[15px] tracking-wide pt-2">Student's Profile</h3>

              <div className="flex items-end w-full">
                <span className="whitespace-nowrap mr-2">Name of Student</span>
                <div className="flex-grow border-b border-slate-800 relative pb-0.5">
                  <span className="absolute left-4 bottom-0.5 font-sans text-2xl text-blue-900 tracking-wide font-light">{student.name}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 w-full">
                <div className="flex items-end col-span-1">
                  <span className="whitespace-nowrap mr-2">Sex</span>
                  <div className="flex-grow border-b border-slate-800 relative pb-0.5">
                    <span className="absolute left-4 bottom-0.5 font-sans text-xl text-blue-900 font-medium">{studentSex}</span>
                  </div>
                </div>
                <div className="flex items-end col-span-1">
                  <span className="whitespace-nowrap mr-2">Age</span>
                  <div className="flex-grow border-b border-slate-800 relative pb-0.5">
                    <span className="absolute left-4 bottom-0.5 font-sans text-xl text-blue-900">{studentAge}</span>
                  </div>
                </div>
                <div className="flex items-end col-span-1">
                  <span className="whitespace-nowrap mr-2">Address</span>
                  <div className="flex-grow border-b border-slate-800"></div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 w-full">
                <div className="flex items-end"><span className="mr-1">Sub City</span><div className="flex-grow border-b border-slate-800"></div></div>
                <div className="flex items-end"><span className="mr-1">Woreda</span><div className="flex-grow border-b border-slate-800"></div></div>
                <div className="flex items-end"><span className="mr-1">House no</span><div className="flex-grow border-b border-slate-800"></div></div>
              </div>

              <div className="flex items-end w-full">
                <span className="whitespace-nowrap mr-2">Academic Year</span>
                <div className="flex-grow border-b border-slate-800 relative pb-0.5">
                  <span className="absolute left-6 bottom-0.5 font-sans text-xl text-blue-900 tracking-wider">{academicYear}</span>
                </div>
              </div>

              <div className="flex items-end w-full">
                <span className="whitespace-nowrap mr-2">Class(Grade)</span>
                <div className="flex-grow border-b border-slate-800 relative pb-0.5">
                  <span className="absolute left-6 bottom-0.5 font-sans text-xl text-blue-900 tracking-wider font-light">{selectedClass.grade}th</span>
                </div>
              </div>

              <div className="flex items-end w-full relative">
                <span className="whitespace-nowrap mr-2">Promotion Status</span>
                <div className="flex-grow border-b border-slate-800 relative pb-0.5">
                  <span className={`absolute left-8 bottom-0.5 font-sans text-xl font-medium ${totals.promoted ? 'text-green-600' : 'text-red-600'}`}>
                    {promotionText}
                  </span>
                </div>
                <div className={`absolute right-4 -top-6 transform rotate-[-12deg] border-4 px-3 py-1 rounded font-sans font-black text-xl tracking-wider uppercase opacity-85 ${
                  totals.promoted 
                    ? 'border-green-600 text-green-600' 
                    : 'border-red-600 text-red-600'
                }`}>
                  {promotionStampText}
                  <div className={`text-[10px] text-center font-normal block leading-none ${
                    totals.promoted ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {promotionSubText}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 w-full pt-4">
                <div className="flex items-end">
                  <span className="whitespace-nowrap text-[12px] mr-1">Director's Name</span>
                  <div className="flex-grow border-b border-slate-800 relative">
                    <span className="absolute bottom-0 text-[10px] font-sans text-blue-800/70 truncate max-w-full">Gammadaa Milkiyaas Oncho</span>
                  </div>
                </div>
                <div className="flex items-end">
                  <span className="whitespace-nowrap text-[12px] mr-1">Signature</span>
                  <div className="flex-grow border-b border-slate-800"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* VIEW 2: INNER GRADES & REMARKS */}
        <div ref={page2Ref} className="w-[1123px] h-[794px] bg-[#31b4cc] shadow-2xl flex p-10 relative overflow-hidden border border-cyan-700 print:shadow-none print:border-none page-break">
          
          {/* LEFT PANEL: GRADES TABLE */}
          <div className="w-1/2 h-full pr-4 flex flex-col justify-between">
            <table className="w-full border-collapse border border-slate-900 text-center text-[12px] bg-cyan-50/10">
              <thead>
                <tr className="border-b border-slate-900">
                  <th className="border-r border-slate-900 p-2 font-bold w-[35%] text-left pl-3">Subject</th>
                  <th className="border-r border-slate-900 p-1 font-bold w-[21%] text-xs leading-tight">First<br/>Semester</th>
                  <th className="border-r border-slate-900 p-1 font-bold w-[21%] text-xs leading-tight">Second<br/>Semester</th>
                  <th className="p-1 font-bold w-[23%] text-xs">AVERAGE</th>
                </tr>
              </thead>
              <tbody className="font-sans text-[14px] text-blue-900 font-medium">
                {subjectRows}
                {totalsRows}
              </tbody>
            </table>

            <div className="flex items-end w-full text-[13px] font-serif pt-2">
              <span className="whitespace-nowrap mr-1">Director's Name</span>
              <div className="flex-grow border-b border-slate-900"></div>
              <span className="whitespace-nowrap mx-2">Signature</span>
              <div className="flex-grow border-b border-slate-900"></div>
            </div>
          </div>

          {/* RIGHT PANEL: REMARKS & SIGNATURES */}
          <div className="w-1/2 h-full pl-8 flex flex-col justify-start relative pt-4">
            <h2 className="text-center font-bold text-sm tracking-wide uppercase text-slate-800 mb-8">
              REMARKS FROM THE HOME – ROOM TEACHER
            </h2>

            <div className="w-full mb-12">
              <h3 className="font-bold text-base text-slate-900 mb-1">First Semester</h3>
              <div className="w-full space-y-7 pt-4">
                <div className="border-b border-slate-800/70 h-0.5"></div>
                <div className="border-b border-slate-800/70 h-0.5"></div>
              </div>
              <div className="mt-8 space-y-4 text-[13px]">
                <div className="flex items-end">
                  <span className="whitespace-nowrap mr-2">Signature of Home-Room Teacher</span>
                  <div className="flex-grow border-b border-slate-800/70"></div>
                </div>
                <div className="flex items-end">
                  <span className="whitespace-nowrap mr-2">Signature of Parent or Guardian</span>
                  <div className="flex-grow border-b border-slate-800/70"></div>
                </div>
              </div>
            </div>

            <div className="w-full relative">
              <h3 className="font-bold text-base text-slate-900 mb-1">Second Semester</h3>
              <div className="absolute left-6 top-8 font-sans text-2xl text-blue-900 tracking-wide transform -rotate-1 opacity-90 z-10 leading-relaxed">
                <p className="font-light italic">Satisfactory !</p>
                <p className="pl-12 pt-1 font-normal">Needs Improvement</p>
              </div>
              <div className="w-full space-y-7 pt-4">
                <div className="border-b border-slate-800/70 h-0.5"></div>
                <div className="border-b border-slate-800/70 h-0.5"></div>
              </div>
              <div className="mt-14 space-y-4 text-[13px] relative z-20">
                <div className="flex items-end">
                  <span className="whitespace-nowrap mr-2">Signature of Home-Room Teacher</span>
                  <div className="flex-grow border-b border-slate-800/70 relative">
                    <span className="absolute right-4 bottom-[-4px] font-sans text-3xl text-blue-900 italic opacity-80 select-none">Stf</span>
                  </div>
                </div>
                <div className="flex items-end">
                  <span className="whitespace-nowrap mr-2">Signature of Parent or Guardian</span>
                  <div className="flex-grow border-b border-slate-800/70"></div>
                </div>
              </div>
            </div>

            <div className="absolute bottom-4 left-[-40px] w-36 h-36 border-4 border-dashed border-blue-500/60 rounded-full flex items-center justify-center transform rotate-12 opacity-75 pointer-events-none">
              <div className="w-28 h-28 border border-blue-500/40 rounded-full flex flex-col items-center justify-center text-[7px] text-blue-600 font-sans text-center p-1 leading-tight font-bold">
                <span>ትምህርት ቤት</span>
                <span className="text-[6px] my-0.5">★ TULU DIMTU ★</span>
                <span>SECONDARY SCHOOL</span>
              </div>
            </div>
          </div>
        </div>

        <div className="no-print flex justify-center items-center gap-4 mt-4">
          <button 
            onClick={handleDownload}
            className="bg-[#31b4cc] text-white px-8 py-3 rounded-full font-bold hover:bg-[#2a9db3] transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
          >
            <Download size={20} />
            DOWNLOAD REPORT CARD
          </button>
          <button 
            onClick={handleClose}
            className="bg-gray-500 text-white px-8 py-3 rounded-full font-bold hover:bg-gray-600 transition-all shadow-lg hover:shadow-xl"
          >
            ✖ CLOSE
          </button>
        </div>
      </div>
    );
  };

  const handleExportToExcel = () => {
    const exportData = paginatedStudents.map(student => {
      const subjectColumns = {};
      allSubjectsList.forEach(subject => {
        const subjectName = typeof subject === 'string' ? subject : subject.name;
        const subjectTotal = getSubjectTotal(student._id, subjectName);
        if (subjectTotal) {
          subjectColumns[subjectName] = `${subjectTotal.total}/${subjectTotal.maxTotal}`;
        } else {
          subjectColumns[subjectName] = '-';
        }
      });
      
      const overallAverage = student.overallAverage;
      const grade = getGrade(overallAverage);
      const totalMarks = student.totalMarks;
      const status = getStatus(overallAverage);
      const sex = getStudentSex(student._id);
      const age = getStudentAge(student._id);
      
      return {
        'Rank': student.rank,
        'Roll No': student.rollNumber,
        'Student Name': student.name,
        'Gender': sex,
        'Age': age,
        ...subjectColumns,
        'Total Marks': `${totalMarks}/${allSubjectsList.length * 100}`,
        'Overall Average': `${overallAverage.toFixed(1)}%`,
        'Grade': grade.letter,
        'Status': status.text,
        'Semester': semester,
        'Academic Year': academicYear
      };
    });
    
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `${selectedClass.grade}_${selectedClass.section}_${semester}_${academicYear}`);
    XLSX.writeFile(wb, `Class_Ranking_${selectedClass.grade}_${selectedClass.section}_${semester}_${academicYear}.xlsx`);
    toast.success('Exported to Excel');
  };

  const filteredStudents = students.filter(student => 
    student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.rollNumber?.toString().includes(searchTerm)
  );

  const sortedStudents = [...filteredStudents]
    .map(student => {
      const overallAverage = calculateOverallAverage(student._id);
      const totalMarks = calculateTotalMarks(student._id);
      return { ...student, overallAverage, totalMarks };
    })
    .sort((a, b) => b.overallAverage - a.overallAverage)
    .map((student, index, array) => {
      let rank = index + 1;
      if (index > 0 && student.overallAverage === array[index - 1].overallAverage) {
        rank = array[index - 1].rank;
      }
      return { ...student, rank };
    });

  const totalPages = Math.ceil(sortedStudents.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedStudents = sortedStudents.slice(startIndex, startIndex + rowsPerPage);

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(parseInt(e.target.value));
    setCurrentPage(1);
  };

  // If showing report card
  if (showReportCard && reportCardData) {
    return (
      <ReportCardView 
        student={reportCardData.student} 
        sortedStudents={sortedStudents} 
        yearly={reportCardData.yearly} 
      />
    );
  }
  
  // ==========================================
  // CLASS SELECTOR VIEW
  // ==========================================
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
            padding: 50px;
            border-radius: 15px;
            margin-bottom: 40px;
            text-align: center;
            box-shadow: 0 10px 40px rgba(8, 145, 178, 0.3);
          }
          .hero-title { font-family: 'Playfair Display', serif; font-size: 42px; font-weight: 800; margin-bottom: 15px; letter-spacing: 1px; }
          .hero-subtitle { font-size: 16px; opacity: 0.9; }
          .classes-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
          .class-card {
            background: white;
            padding: 30px;
            border-radius: 12px;
            cursor: pointer;
            transition: all 0.3s ease;
            border: 2px solid transparent;
            box-shadow: 0 4px 15px rgba(0,0,0,0.08);
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
            transform: translateY(-8px);
            box-shadow: 0 12px 30px rgba(8, 145, 178, 0.2);
            border-color: #0891b2;
          }
          .class-icon { font-size: 48px; margin-bottom: 15px; }
          .class-title { font-size: 22px; font-weight: 700; color: #1a202c; margin-bottom: 10px; }
          .class-info { color: #666; font-size: 14px; margin-bottom: 15px; }
          .class-stats { display: flex; gap: 15px; margin-top: 15px; padding-top: 15px; border-top: 1px solid #e5e7eb; }
          .stat-item { flex: 1; text-align: center; }
          .stat-number { font-size: 18px; font-weight: 700; color: #0891b2; }
          .stat-label { font-size: 11px; color: #999; text-transform: uppercase; letter-spacing: 0.5px; }
          .class-button {
            width: 100%;
            background: linear-gradient(135deg, #0e7490, #0891b2);
            color: white;
            border: none;
            padding: 12px;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            margin-top: 15px;
            transition: all 0.3s;
          }
          .class-button:hover { transform: scale(1.02); box-shadow: 0 6px 20px rgba(8, 145, 178, 0.3); }
          .empty-state { text-align: center; padding: 60px 20px; color: #999; }
          .empty-icon { font-size: 60px; margin-bottom: 15px; }
        `}</style>
        
        <div className="class-selector-container">
          <div className="hero-section">
            <div className="flex justify-center mb-4">
              <Award size={48} />
            </div>
            <h2 className="hero-title">📊 Student Report Card Generator</h2>
            <p className="hero-subtitle">Select a class to generate report cards for first and second semester students</p>
          </div>
          
          {classes.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📚</div>
              <p className="text-lg font-semibold">No classes found</p>
              <p className="text-sm mt-2">Please add classes first</p>
            </div>
          ) : (
            <div className="classes-grid">
              {classes.map((cls, idx) => (
                <div key={cls._id} className="class-card">
                  <div className="class-icon">📚</div>
                  <h3 className="class-title">Grade {cls.grade}</h3>
                  <p className="class-info">Section {cls.section}</p>
                  {cls.program && (
                    <div className="inline-block bg-cyan-100 text-cyan-800 text-xs px-3 py-1 rounded-full">
                      {cls.program} Program
                    </div>
                  )}
                  <div className="class-stats">
                    <div className="stat-item">
                      <div className="stat-number">{cls.students?.length || 0}</div>
                      <div className="stat-label">Students</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-number">{cls.subjects?.length || 0}</div>
                      <div className="stat-label">Subjects</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleClassSelect(cls._id)}
                    className="class-button"
                  >
                    View Report Cards →
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ==========================================
  // STUDENT DETAIL VIEW
  // ==========================================
  if (viewMode === 'student' && selectedStudent) {
    const overallAverage = calculateOverallAverage(selectedStudent._id);
    const grade = getGrade(overallAverage);
    const totalMarks = calculateTotalMarks(selectedStudent._id);
    const maxPossible = allSubjectsList.length * 100;
    const status = getStatus(overallAverage);
    const promoted = isPromoted(overallAverage);
    const promotionText = getPromotionText(promoted);
    const studentImage = getStudentImage(selectedStudent._id, selectedStudent.name);
    const sex = getStudentSex(selectedStudent._id);
    const age = getStudentAge(selectedStudent._id);
    
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
        `}</style>
        
        <div className="detail-header">
          <div className="detail-header-content">
            <div className="student-header-info flex items-center gap-4">
              <img
                src={studentImage}
                alt={selectedStudent.name}
                className="w-40 h-40  object-cover border-2 border-white"
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedStudent.name)}&background=4F46E5&color=fff&size=64&font-size=0.5&bold=true`;
                }}
              />
              <div>
                <h3>{selectedStudent.name}</h3>
                <div className="flex flex-wrap gap-2 mt-1">
                  <span className="detail-badge">Roll No: {selectedStudent.rollNumber}</span>
                  <span className="detail-badge">Class: {selectedClass.grade}-{selectedClass.section}</span>
                  <span className="detail-badge">Gender: {sex}</span>
                  <span className="detail-badge">Age: {age}</span>
                  <span className="detail-badge">{semester} | {academicYear}</span>
                  <span className={`detail-badge ${promoted ? 'bg-green-500' : 'bg-red-500'}`}>
                    {promoted ? '✅ Promoted' : '❌ Not Promoted'}
                  </span>
                </div>
              </div>
            </div>
            <div className="action-buttons">
              <button 
                onClick={() => {
                  setReportCardData({ student: selectedStudent, yearly: false });
                  setShowReportCard(true);
                }}
                className="cert-btn"
              >
                📘 Semester Report
              </button>
              <button 
                onClick={() => {
                  setReportCardData({ student: selectedStudent, yearly: true });
                  setShowReportCard(true);
                }}
                className="cert-btn"
              >
                🏆 Annual Report
              </button>
              <button 
                onClick={() => { setSelectedStudent(null); setViewMode('all'); }} 
                className="cert-btn cert-btn-back flex items-center gap-2"
              >
                <ArrowLeft size={18} /> Back
              </button>
            </div>
          </div>
        </div>
        
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-card-label">Total Marks</div>
            <div className="stat-card-value">{totalMarks}/{maxPossible}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-label">Overall Average</div>
            <div className="stat-card-value">{overallAverage.toFixed(1)}%</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-label">Grade</div>
            <div className="stat-card-value" style={{color: grade.color}}>{grade.letter}</div>
          </div>
          <div className="stat-card" style={{borderTopColor: promoted ? '#059669' : '#dc2626'}}>
            <div className="stat-card-label">Status</div>
            <div className="stat-card-value" style={{color: promoted ? '#059669' : '#dc2626'}}>
              {promotionText}
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white">
              <tr>
                <th className="p-3 text-left text-sm font-bold border border-cyan-600">Subject</th>
                <th className="p-3 text-center text-sm font-bold border border-cyan-600">Test</th>
                <th className="p-3 text-center text-sm font-bold border border-cyan-600">Midterm</th>
                <th className="p-3 text-center text-sm font-bold border border-cyan-600">Notebook</th>
                <th className="p-3 text-center text-sm font-bold border border-cyan-600">Final</th>
                <th className="p-3 text-center text-sm font-bold border border-cyan-600">Total</th>
                <th className="p-3 text-center text-sm font-bold border border-cyan-600">Grade</th>
              </tr>
            </thead>
            <tbody>
              {allSubjectsList.map((subject, idx) => {
                const subjectName = typeof subject === 'string' ? subject : subject.name;
                const subjectDetails = getSubjectMarksDetails(selectedStudent._id, subjectName);
                const subjectTotal = getSubjectTotal(selectedStudent._id, subjectName);
                const subjectGrade = subjectTotal ? getGrade(subjectTotal.total) : null;
                const exams = subjectDetails?.exams || {};
                
                return (
                  <tr key={idx} className="border-b hover:bg-cyan-50 transition even:bg-gray-50">
                    <td className="p-3 text-sm font-medium border border-gray-200">{subjectName}</td>
                    <td className="p-3 text-center text-sm border border-gray-200">{exams.test?.score || '-'}</td>
                    <td className="p-3 text-center text-sm border border-gray-200">{exams.midterm?.score || '-'}</td>
                    <td className="p-3 text-center text-sm font-medium text-blue-600 border border-gray-200">{exams.notebook?.score || exams.textbook?.score || exams.assignment?.score || '-'}</td>
                    <td className="p-3 text-center text-sm border border-gray-200">{exams.final?.score || '-'}</td>
                    <td className="p-3 text-center text-sm font-bold text-blue-600 border border-gray-200">{subjectTotal ? `${subjectTotal.total}/${subjectTotal.maxTotal}` : '-'}</td>
                    <td className="p-3 text-center text-sm border border-gray-200">
                      {subjectGrade && (
                        <span className="px-3 py-1 rounded-full text-xs font-bold" style={{background: subjectGrade.bg, color: subjectGrade.color}}>
                          {subjectGrade.letter}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-gray-100 border-t-2 border-gray-300">
              <tr>
                <td colSpan="6" className="p-3 text-sm font-bold text-gray-700 border border-gray-200">Total Subjects</td>
                <td className="p-3 text-center text-sm font-bold text-cyan-600 border border-gray-200">{allSubjectsList.length} Subjects</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    );
  }

  // ==========================================
  // MAIN DASHBOARD VIEW
  // ==========================================
  const maxPossible = allSubjectsList.length * 100;
  const passedCount = sortedStudents.filter(s => s.overallAverage >= 50).length;
  const classAverage = sortedStudents.length > 0 
    ? sortedStudents.reduce((sum, s) => sum + s.overallAverage, 0) / sortedStudents.length 
    : 0;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=Poppins:wght@300;400;500;600;700&display=swap');
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
        .header-controls { display: flex; gap: 10px; }
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
        .period-selector {
          background: #f0f9ff;
          padding: 20px;
          border-radius: 12px;
          border: 1px solid #bae6fd;
          margin-bottom: 20px;
        }
        .period-controls {
          display: flex;
          gap: 15px;
          flex-wrap: wrap;
          align-items: center;
        }
        .period-btn {
          padding: 10px 20px;
          border-radius: 8px;
          border: 2px solid #bae6fd;
          background: white;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s;
        }
        .period-btn.active {
          background: linear-gradient(135deg, #0e7490, #0891b2);
          color: white;
          border-color: #0891b2;
          transform: scale(1.05);
        }
        .period-btn:hover:not(.active) {
          border-color: #0891b2;
          color: #0891b2;
        }
      `}</style>
      
      <div className="dashboard-header">
        <div className="header-top">
          <div>
            <h2 className="header-title">📊 Student Report Cards</h2>
            <p className="header-subtitle">Grade {selectedClass.grade} - Section {selectedClass.section} | Total Students: {sortedStudents.length}</p>
            <p className="text-sm text-green-600 mt-1">✅ Passed: {passedCount} | ❌ Failed: {sortedStudents.length - passedCount}</p>
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
              onClick={() => setSelectedClass(null)} 
              className="control-btn"
              style={{ background: '#f3f4f6', color: '#0891b2' }}
            >
              <ChevronLeft size={18} /> Classes
            </button>
          </div>
        </div>
        
        <div className="period-selector">
          <div className="flex items-center gap-3 mb-4">
            <Calendar size={20} style={{color: '#0891b2'}} />
            <span className="font-semibold text-gray-700">Academic Period Selection:</span>
          </div>
          <div className="period-controls">
            <button
              onClick={() => setSemester('Semester 1')}
              className={`period-btn ${semester === 'Semester 1' ? 'active' : ''}`}
            >
              📘 Semester 1
            </button>
            <button
              onClick={() => setSemester('Semester 2')}
              className={`period-btn ${semester === 'Semester 2' ? 'active' : ''}`}
            >
              📗 Semester 2
            </button>
            <select
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="2023-2024">2023-2024</option>
              <option value="2024-2025">2024-2025</option>
              <option value="2025-2026">2025-2026</option>
            </select>
            <button
              onClick={generateAllQRCodes}
              disabled={generatingQR}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 flex items-center gap-2"
            >
              <QrCode size={18} />
              {generatingQR ? 'Generating...' : 'Generate QR Codes'}
            </button>
          </div>
        </div>
      </div>
      
      {/* Stats Cards */}
      {!loading && sortedStudents.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
            <p className="text-sm text-green-700 font-semibold">Passed Students</p>
            <p className="text-3xl font-bold text-green-700">{passedCount}</p>
            <p className="text-xs text-green-600 mt-1">{((passedCount/sortedStudents.length)*100).toFixed(1)}%</p>
          </div>
          <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-xl border border-red-200">
            <p className="text-sm text-red-700 font-semibold">Failed Students</p>
            <p className="text-3xl font-bold text-red-700">{sortedStudents.length - passedCount}</p>
          </div>
          <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 p-4 rounded-xl border border-cyan-200">
            <p className="text-sm text-cyan-700 font-semibold">Class Average</p>
            <p className="text-3xl font-bold text-cyan-700">{classAverage.toFixed(1)}%</p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
            <p className="text-sm text-purple-700 font-semibold">Total Marks</p>
            <p className="text-2xl font-bold text-purple-700">{sortedStudents.reduce((sum, s) => sum + s.totalMarks, 0)}</p>
            <p className="text-xs text-purple-600">/{sortedStudents.length * maxPossible}</p>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl border border-orange-200">
            <p className="text-sm text-orange-700 font-semibold">Current Period</p>
            <p className="text-lg font-bold text-orange-700">{semester}</p>
            <p className="text-xs text-orange-600">{academicYear}</p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
            <p className="text-sm text-blue-700 font-semibold">Pass Rate</p>
            <p className="text-3xl font-bold text-blue-700">{((passedCount/sortedStudents.length)*100).toFixed(1)}%</p>
            <p className="text-xs text-blue-600">{passedCount}/{sortedStudents.length} students</p>
          </div>
        </div>
      )}
      
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Search Bar */}
        <div className="p-6 border-b border-gray-200">
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
          <div className="flex flex-wrap gap-3 mt-3">
            <button 
              onClick={handleExportToExcel} 
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              disabled={loading}
            >
              <FileSpreadsheet size={18} />
              <span>Export to Excel</span>
            </button>
          </div>
        </div>
        
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block">
              <div className="w-12 h-12 border-4 border-cyan-200 border-t-cyan-600 rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-600">Loading {semester} marks for {academicYear}...</p>
            </div>
          </div>
        ) : sortedStudents.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg font-semibold">No students found in this class</p>
            <p className="text-sm text-gray-400 mt-2">Please add students to the class first</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white">
                  <tr>
                    <th className="p-3 text-center text-sm font-bold border border-cyan-600">Rank</th>
                    <th className="p-3 text-center text-sm font-bold border border-cyan-600">Photo</th>
                    <th className="p-3 text-left text-sm font-bold border border-cyan-600 whitespace-nowrap min-w-[42px]">Roll No</th>
                    <th className="p-3 text-left text-sm font-bold border border-cyan-600 whitespace-nowrap min-w-[42px]">Student Name</th>
                    <th className="p-3 text-left text-sm font-bold border border-cyan-600">Gender</th>
                    <th className="p-3 text-left text-sm font-bold border border-cyan-600">Age</th>
                    {!saveSpace && allSubjectsList.map((subject, idx) => {
                      const subjectName = typeof subject === 'string' ? subject : subject.name;
                      return (
                        <th key={idx} className="p-3 text-center text-sm font-bold border border-cyan-600">{subjectName}</th>
                      );
                    })}
                    {saveSpace && (
                      <th className="p-3 text-center text-sm font-bold border border-cyan-600">Subjects</th>
                    )}
                    <th className="p-3 text-center text-sm font-bold border border-cyan-600 whitespace-nowrap min-w-[42px]">Total Marks</th>
                    <th className="p-3 text-center text-sm font-bold border border-cyan-600">Avg %</th>
                    <th className="p-3 text-center text-sm font-bold border border-cyan-600">Grade</th>
                    <th className="p-3 text-center text-sm font-bold border border-cyan-600">Status</th>
                    <th className="p-3 text-center text-sm font-bold border border-cyan-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedStudents.map((student, idx) => {
                    const grade = getGrade(student.overallAverage);
                    const status = getStatus(student.overallAverage);
                    const totalMarks = student.totalMarks;
                    const bgColor = idx % 2 === 0 ? '#ffffff' : '#f0f9ff';
                    const promoted = isPromoted(student.overallAverage);
                    const promotionText = getPromotionText(promoted);
                    const studentImage = getStudentImage(student._id, student.name);
                    const sex = getStudentSex(student._id);
                    const age = getStudentAge(student._id);
                    
                    return (
                      <tr key={student._id} style={{background: bgColor}} className="hover:bg-cyan-50 transition">
                        <td className="p-3 text-center border border-gray-200">
                          {student.rank === 1 ? (
                            <div className='rounded-full bg-blue-300 text-blue-700 h-8 w-8 mt-2 text-center '>
                              <span className='text-bold justify-center flex'>1</span>
                            </div>
                          ) : student.rank === 2 ? (
                           <div>2</div>
                          ) : student.rank === 3 ? (
                            <div>3</div>
                          ) : (
                            <span className="inline-block w-8 h-8 rounded-full bg-cyan-100 text-cyan-700 font-bold text-center leading-8">
                              {student.rank}
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-center border border-gray-200">
                          <img
                            src={studentImage}
                            alt={student.name}
                            className="w-10 h-10 rounded-full object-cover border-2 border-cyan-200 mx-auto"
                            onError={(e) => {
                              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=4F46E5&color=fff&size=40&font-size=0.5&bold=true`;
                            }}
                          />
                        </td>
                        <td className="p-3 font-mono font-semibold text-gray-900 border border-gray-200">{student.rollNumber}</td>
                        <td className="p-3 font-medium text-gray-900 border border-gray-200 whitespace-nowrap min-w-[42px]">{student.name}</td>
                        <td className="p-3 text-gray-600 border border-gray-200">{sex}</td>
                        <td className="p-3 text-gray-600 border border-gray-200">{age}</td>
                        
                        {!saveSpace && allSubjectsList.map((subject, subIdx) => {
                          const subjectName = typeof subject === 'string' ? subject : subject.name;
                          const subjectTotal = getSubjectTotal(student._id, subjectName);
                          return (
                            <td key={subIdx} className="p-3 text-center border border-gray-200 ">
                              {subjectTotal ? (
                                <div className="flex flex-col items-center">
                                  <span className="font-bold text-cyan-700 text-sm">{subjectTotal.total}</span>
                                </div>
                              ) : '-'}
                            </td>
                          );
                        })}
                        
                        {saveSpace && (
                          <td className="p-3 text-sm border border-gray-200">
                            <div className="flex flex-col gap-1">
                              {allSubjectsList.slice(0, 2).map((subject, subIdx) => {
                                const subjectName = typeof subject === 'string' ? subject : subject.name;
                                const subjectTotal = getSubjectTotal(student._id, subjectName);
                                return subjectTotal ? (
                                  <div key={subIdx} className="flex items-center justify-between text-xs">
                                    <span className="truncate max-w-[80px]">{subjectName}:</span>
                                    <span className="font-bold text-cyan-600">{subjectTotal.total}</span>
                                  </div>
                                ) : null;
                              })}
                              {allSubjectsList.length > 2 && (
                                <span className="text-xs text-gray-400">+{allSubjectsList.length - 2} more</span>
                              )}
                            </div>
                          </td>
                        )}
                        
                        <td className="p-3 text-center font-bold text-gray-900 border border-gray-200">
                          {totalMarks}/{maxPossible}
                        </td>
                        
                        <td className="p-3 text-center border border-gray-200">
                          <div className="flex flex-col items-center">
                            <span className="font-bold text-lg" style={{color: grade.color}}>
                              {student.overallAverage.toFixed(1)}%
                            </span>
                          </div>
                        </td>
                        
                        <td className="p-3 text-center border border-gray-200">
                          <span className="px-3 py-1 rounded-full text-xs font-bold" style={{background: grade.bg, color: grade.color}}>
                            {grade.letter}
                          </span>
                        </td>
                        
                        <td className="p-3 text-center border border-gray-200">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap min-w-[42px] ${promoted ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {promotionText}
                          </span>
                        </td>
                        
                        <td className="p-3 text-center border border-gray-200">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedStudent(student);
                                setViewMode('student');
                              }}
                              className="text-gray-600 hover:text-gray-800 p-1 rounded transition"
                              title="View Details"
                            >
                              <Eye size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-gray-100 border-t-2 border-gray-300">
                  <tr>
                    <td colSpan="9" className="p-3 text-sm font-bold text-gray-700 border border-gray-200">Total Students</td>
                    <td colSpan="4" className="p-3 text-center text-sm font-bold text-cyan-600 border border-gray-200">
                      {sortedStudents.length} Students | {allSubjectsList.length} Subjects
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
            
            {/* Pagination */}
            {sortedStudents.length > 0 && (
              <div className="border-t border-gray-200 p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Rows per page:</span>
                  <select
                    value={rowsPerPage}
                    onChange={handleRowsPerPageChange}
                    className="px-3 py-1 border border-gray-300 rounded-lg"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => goToPage(1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50"
                  >
                    <ChevronsLeft size={18} />
                  </button>
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  
                  <span className="px-4 py-1 text-sm">
                    Page {currentPage} of {totalPages}
                  </span>
                  
                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50"
                  >
                    <ChevronRight size={18} />
                  </button>
                  <button
                    onClick={() => goToPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50"
                  >
                    <ChevronsRight size={18} />
                  </button>
                </div>
                
                <div className="text-sm text-gray-600">
                  Showing {startIndex + 1} to {Math.min(startIndex + rowsPerPage, sortedStudents.length)} of {sortedStudents.length} students
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default StudentReportCard;