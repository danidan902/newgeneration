import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { 
  Download, Search, ChevronLeft, Eye, FileSpreadsheet,
  Award, Trophy, Calendar, FileText, Printer, Settings,
  ChevronRight, ChevronsLeft, ChevronsRight, Shield, Star,
  CheckCircle, Zap, BookOpen, Target, TrendingUp, BarChart3,
  QrCode, Stamp, PenTool, ShieldCheck, User, Mail, Phone,
  Users, School, MapPin, GraduationCap, Edit2, RefreshCw, X, Save, Trash2, Home
} from 'lucide-react';
import api from '../../services/api';
import * as XLSX from 'xlsx';
import QRCode from 'qrcode';
import Logo from '../../assets/Logo.png';
import Logo1 from '../../assets/Logo2.png';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const StudentCertificate = () => {
  const [studentData, setStudentData] = useState(null);
  const [studentClass, setStudentClass] = useState(null);
  const [allMarks, setAllMarks] = useState({});
  const [allSubjectsList, setAllSubjectsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Semester and Academic Year states
  const [semester, setSemester] = useState('Semester 1');
  const [academicYear, setAcademicYear] = useState('2024-2025');
  
  const [digitalAssets, setDigitalAssets] = useState(null);
  const [showCertificate, setShowCertificate] = useState(false);
  const [certificateType, setCertificateType] = useState('semester');

  // Student details cache
  const [studentDetails, setStudentDetails] = useState({
    photo: null,
    sex: 'N/A',
    age: 'N/A',
    address: 'N/A',
    subCity: 'N/A'
  });

  // Refs for certificate pages
  const page1Ref = useRef();
  const page2Ref = useRef();

  useEffect(() => {
    fetchStudentData();
  }, []);

  useEffect(() => {
    if (studentData) {
      fetchStudentMarks();
      fetchStudentDetails();
      fetchStudentClass();
    }
  }, [semester, academicYear, studentData]);

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

  const fetchStudentClass = async () => {
    if (!studentData) return;
    
    try {
      let classId = studentData.classId;
      
      // If no classId, try to get from student details
      if (!classId) {
        try {
          const studentRes = await api.get(`/users/${studentData._id}`);
          classId = studentRes.data.classId;
          console.log('Got classId from student details:', classId);
        } catch (err) {
          console.log('Could not fetch student details for classId');
        }
      }
      
      if (classId) {
        console.log('Fetching class with ID:', classId);
        const response = await api.get(`/classes/${classId}`);
        console.log('Fetched class data:', response.data);
        setStudentClass(response.data);
        return response.data;
      } else {
        console.log('No class ID found for student');
        // Try to get class from the classId in student data
        if (studentData.class) {
          setStudentClass(studentData.class);
          return studentData.class;
        }
      }
    } catch (error) {
      console.error('Error fetching class data:', error);
    }
    return null;
  };

  const fetchStudentDetails = async () => {
    if (!studentData || !studentData._id) return;
    
    try {
      const response = await api.get(`/users/${studentData._id}`);
      const data = response.data;
      
      setStudentDetails({
        photo: data.profileImage || null,
        sex: data.sex || data.gender || 'N/A',
        age: data.age || 'N/A',
        address: data.address || 'N/A',
        subCity: data.subCity || 'N/A'
      });
      
      // If age is not directly available, calculate from dateOfBirth
      if (!data.age && data.dateOfBirth) {
        const birthDate = new Date(data.dateOfBirth);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        setStudentDetails(prev => ({ ...prev, age: age.toString() }));
      }
      
      console.log('Fetched student details:', data);
    } catch (error) {
      console.error('Error fetching student details:', error);
      // Fallback to existing data
      setStudentDetails({
        photo: studentData.profileImage || null,
        sex: studentData.sex || studentData.gender || 'N/A',
        age: studentData.age || 'N/A',
        address: studentData.address || 'N/A',
        subCity: studentData.subCity || 'N/A'
      });
    }
  };

  const fetchStudentData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/users/me/profile');
      const userData = response.data;
      
      if (userData.role !== 'student') {
        setError('Access denied. This page is only for students.');
        toast.error('Access denied');
        setLoading(false);
        return;
      }
      
      setStudentData(userData);
      
      // Fetch additional student details
      if (userData._id) {
        await fetchStudentDetails();
        await fetchStudentClass();
      }
      
      toast.success(`Welcome, ${userData.name}`);
    } catch (error) {
      console.error('Error fetching student data:', error);
      setError('Failed to load your profile. Please try again.');
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentMarks = async () => {
    if (!studentData) return;
    
    setLoading(true);
    try {
      // Fetch marks for the current semester
      const marksResponse = await api.get(`/marks/student/${studentData._id}`, {
        params: { semester: semester, academicYear: academicYear }
      });
      
      const studentMarks = marksResponse.data;
      console.log('Fetched marks:', studentMarks);
      
      // Extract all subjects
      const subjectsSet = new Set();
      studentMarks.forEach(mark => {
        if (mark.subject) {
          subjectsSet.add(mark.subject);
        }
      });
      
      const allSubjects = Array.from(subjectsSet);
      
      if (allSubjects.length === 0) {
        toast.warning('No marks found for the selected period');
        // Add default subjects for demo
        allSubjects.push('Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'ICT');
      }
      
      setAllSubjectsList(allSubjects);
      
      // Create marks map
      const marksMap = {};
      marksMap[studentData._id] = {};
      
      allSubjects.forEach(subject => {
        marksMap[studentData._id][subject] = {
          exams: {}
        };
      });
      
      // Populate marks
      studentMarks.forEach(mark => {
        const subject = mark.subject;
        const examType = mark.examType;
        const score = mark.score;
        
        if (subject && marksMap[studentData._id] && marksMap[studentData._id][subject]) {
          marksMap[studentData._id][subject].exams[examType] = {
            score: score
          };
        }
      });
      
      setAllMarks(marksMap);
      console.log('Marks map:', marksMap);
      
      toast.success(`Loaded marks for ${semester}, ${academicYear}`);
      
    } catch (error) {
      console.error('Failed to fetch marks:', error);
      toast.error('Failed to fetch marks');
    } finally {
      setLoading(false);
    }
  };
  
  const getSubjectTotal = (studentId, subjectName) => {
    const subjectData = allMarks[studentId]?.[subjectName];
    if (!subjectData) return null;
    
    const exams = subjectData.exams;
    let totalScore = 0;
    
    if (exams.quiz?.score) totalScore += exams.quiz.score;
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
  
  const calculateOverallAverage = (studentId) => {
    let totalSubjectScores = 0;
    let subjectCount = 0;
    
    allSubjectsList.forEach(subject => {
      const subjectTotal = getSubjectTotal(studentId, subject);
      if (subjectTotal) {
        totalSubjectScores += subjectTotal.total;
        subjectCount++;
      }
    });
    
    if (subjectCount === 0) return 0;
    return totalSubjectScores / subjectCount;
  };
  
  const calculateTotalMarks = (studentId) => {
    let total = 0;
    allSubjectsList.forEach(subject => {
      const subjectTotal = getSubjectTotal(studentId, subject);
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
  
  const getStatus = (average) => {
    if (average >= 50) {
      return { text: 'PROMOTED', color: '#059669', bg: '#d1fae5', icon: '✓' };
    }
    return { text: 'NOT PROMOTED', color: '#dc2626', bg: '#fee2e2', icon: '✗' };
  };

  const isPromoted = (average) => {
    return average >= 50;
  };

  const getPromotionText = (promoted) => {
    return promoted ? 'Promoted' : 'Not Promoted';
  };

  // ==========================================
  // CERTIFICATE VIEW COMPONENT
  // ==========================================
  const CertificateView = ({ student, yearly }) => {
    const [studentPhotoUrl, setStudentPhotoUrl] = useState('https://via.placeholder.com/150x180?text=No+Photo');
    const [studentSex, setStudentSex] = useState('N/A');
    const [studentAge, setStudentAge] = useState('N/A');
    const [studentClassInfo, setStudentClassInfo] = useState(null);
    const [qrCodeImage, setQrCodeImage] = useState(null);
    const [subjectRows, setSubjectRows] = useState([]);
    const [totals, setTotals] = useState({ 
      totalMarks: 0, 
      overallAverage: 0, 
      grade: null, 
      status: null,
      promoted: false 
    });
    const [loadingCertificate, setLoadingCertificate] = useState(true);

    useEffect(() => {
      const fetchAllData = async () => {
        setLoadingCertificate(true);
        
        try {
          // Fetch complete student data
          const studentDetailsRes = await api.get(`/users/${student._id}`);
          const completeStudentData = studentDetailsRes.data;
          
          console.log('Complete student data:', completeStudentData);
          
          // Set photo
          if (completeStudentData.profileImage) {
            setStudentPhotoUrl(completeStudentData.profileImage);
          } else if (student.profileImage) {
            setStudentPhotoUrl(student.profileImage);
          }
          
          // Set sex
          let sex = completeStudentData.sex || student.sex || 'N/A';
          if (!sex || sex === 'N/A') {
            sex = completeStudentData.gender || student.gender || 'N/A';
          }
          setStudentSex(sex);
          
          // Set age
          let age = completeStudentData.age || student.age;
          if (!age && (completeStudentData.dateOfBirth || student.dateOfBirth)) {
            const birthDate = new Date(completeStudentData.dateOfBirth || student.dateOfBirth);
            const today = new Date();
            age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
              age--;
            }
          }
          setStudentAge(age || 'N/A');
          
          // Fetch class info - try multiple ways
          let classData = null;
          let classId = completeStudentData.classId || student.classId;
          
          // If no classId, try to get from the student's class field
          if (!classId && completeStudentData.class) {
            classId = completeStudentData.class._id || completeStudentData.class;
          }
          
          // If still no classId, try to get from the studentClass state
          if (!classId && studentClass) {
            classId = studentClass._id;
          }
          
          // Also try to get grade directly from student data
          let gradeFromStudent = completeStudentData.grade || student.grade;
          
          if (classId) {
            try {
              console.log('Fetching class with ID:', classId);
              const classRes = await api.get(`/classes/${classId}`);
              classData = classRes.data;
              console.log('Certificate class data:', classData);
              setStudentClassInfo(classData);
              
              // Also update the global studentClass
              setStudentClass(classData);
            } catch (err) {
              console.log('Could not fetch class details for certificate:', err);
              // Try to use existing studentClass if available
              if (studentClass) {
                setStudentClassInfo(studentClass);
              } else if (gradeFromStudent) {
                // Create a basic class object with the grade
                setStudentClassInfo({ grade: gradeFromStudent, section: completeStudentData.section || student.section || '' });
              }
            }
          } else {
            console.log('No class ID found in student data');
            // Use existing studentClass if available
            if (studentClass) {
              setStudentClassInfo(studentClass);
            } else if (gradeFromStudent) {
              // Create a basic class object with the grade
              setStudentClassInfo({ grade: gradeFromStudent, section: completeStudentData.section || student.section || '' });
            }
          }
          
          // Update global student details
          setStudentDetails({
            photo: completeStudentData.profileImage || student.profileImage || null,
            sex: sex,
            age: age || 'N/A',
            address: completeStudentData.address || student.address || 'N/A',
            subCity: completeStudentData.subCity || student.subCity || 'N/A'
          });
          
        } catch (error) {
          console.error('Error fetching student details:', error);
          // Fallback to existing data
          setStudentPhotoUrl(student.profileImage || 'https://via.placeholder.com/150x180?text=No+Photo');
          setStudentSex(student.sex || studentDetails.sex || 'N/A');
          setStudentAge(student.age || studentDetails.age || 'N/A');
          
          // Use existing studentClass as fallback
          if (studentClass) {
            setStudentClassInfo(studentClass);
          } else if (student.grade) {
            setStudentClassInfo({ grade: student.grade, section: student.section || '' });
          }
        }
        
        setLoadingCertificate(false);
      };
      
      fetchAllData();
    }, [student]);

    useEffect(() => {
      const generateQR = async () => {
        try {
          const qrData = `${window.location.origin}/verify?id=${student._id}`;
          const qr = await QRCode.toDataURL(qrData, {
            width: 200,
            margin: 1,
            color: { dark: '#000000', light: '#ffffff' }
          });
          setQrCodeImage(qr);
        } catch (error) {
          console.log('QR generation failed');
        }
      };
      generateQR();
    }, [student]);

    useEffect(() => {
      const buildRows = async () => {
        setLoadingCertificate(true);
        
        if (yearly) {
          // Annual report - fetch both semesters
          try {
            const sem1Res = await api.get(`/marks/student/${student._id}`, {
              params: { semester: 'Semester 1', academicYear: academicYear }
            });
            const sem2Res = await api.get(`/marks/student/${student._id}`, {
              params: { semester: 'Semester 2', academicYear: academicYear }
            });
            
            const sem1Marks = sem1Res.data;
            const sem2Marks = sem2Res.data;
            
            console.log('Semester 1 marks:', sem1Marks);
            console.log('Semester 2 marks:', sem2Marks);
            
            // Get all subjects from both semesters
            const allSubjects = new Set();
            sem1Marks.forEach(m => allSubjects.add(m.subject));
            sem2Marks.forEach(m => allSubjects.add(m.subject));
            const subjectList = Array.from(allSubjects);
            
            console.log('All subjects:', subjectList);
            
            if (subjectList.length === 0) {
              // Fallback subjects if no marks found
              subjectList.push('Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'ICT');
            }
            
            const subjectScores = {};
            let totalSem1 = 0;
            let totalSem2 = 0;
            let totalFinal = 0;
            let subjectCount = 0;
            
            subjectList.forEach(subject => {
              const sem1SubjectMarks = sem1Marks.filter(m => m.subject === subject);
              const sem1Total = sem1SubjectMarks.reduce((sum, m) => sum + (m.score || 0), 0);
              
              const sem2SubjectMarks = sem2Marks.filter(m => m.subject === subject);
              const sem2Total = sem2SubjectMarks.reduce((sum, m) => sum + (m.score || 0), 0);
              
              const finalAverage = subjectCount > 0 ? (sem1Total + sem2Total) / 2 : 0;
              
              subjectScores[subject] = {
                sem1: sem1Total,
                sem2: sem2Total,
                final: finalAverage
              };
              totalSem1 += sem1Total;
              totalSem2 += sem2Total;
              totalFinal += finalAverage;
              subjectCount++;
            });
            
            const avgSem1 = subjectCount > 0 ? totalSem1 / subjectCount : 0;
            const avgSem2 = subjectCount > 0 ? totalSem2 / subjectCount : 0;
            const avgFinal = subjectCount > 0 ? totalFinal / subjectCount : 0;
            
            const finalGrade = getGrade(avgFinal);
            const finalStatus = getStatus(avgFinal);
            const promoted = isPromoted(avgFinal);
            
            setTotals({
              totalMarks: totalFinal,
              sem1Total: totalSem1,
              sem2Total: totalSem2,
              avgSem1: avgSem1,
              avgSem2: avgSem2,
              overallAverage: avgFinal,
              grade: finalGrade,
              status: finalStatus,
              promoted: promoted
            });
            
            const rows = subjectList.map((subject, index) => {
              const sem1Score = subjectScores[subject].sem1;
              const sem2Score = subjectScores[subject].sem2;
              const finalScore = subjectScores[subject].final;
              const subjectGrade = getGrade(finalScore);
              
              return (
                <tr key={index} className="border-b border-slate-900 h-[29px]">
                  <td className="border-r border-slate-900 text-left pl-3 font-serif text-[13px] text-slate-900 font-normal">{subject}</td>
                  <td className="border-r border-slate-900 text-center font-sans text-[14px] text-blue-900 font-medium">{sem1Score > 0 ? sem1Score : '—'}</td>
                  <td className="border-r border-slate-900 text-center font-sans text-[14px] text-blue-900 font-medium">{sem2Score > 0 ? sem2Score : '—'}</td>
                  <td className="border-r border-slate-900 text-center font-sans text-[14px] text-blue-900 font-medium">{finalScore.toFixed(1)}</td>
                  <td className="text-center font-sans text-[14px] font-bold" style={{color: subjectGrade.color}}>{subjectGrade.letter}</td>
                </tr>
              );
            });
            
            setSubjectRows(rows);
          } catch (error) {
            console.error('Error fetching yearly marks:', error);
            toast.error('Failed to fetch yearly marks');
          }
        } else {
          // Semester report
          try {
            const marksResponse = await api.get(`/marks/student/${student._id}`, {
              params: { semester: semester, academicYear: academicYear }
            });
            
            const studentMarks = marksResponse.data;
            console.log('Semester marks:', studentMarks);
            
            // Get all subjects
            const subjectsSet = new Set();
            studentMarks.forEach(m => subjectsSet.add(m.subject));
            let subjectList = Array.from(subjectsSet);
            
            if (subjectList.length === 0) {
              // Fallback subjects if no marks found
              subjectList = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'ICT'];
            }
            
            let totalSem1 = 0;
            let subjectCount = 0;
            
            const rows = subjectList.map((subject, index) => {
              const subjectMarks = studentMarks.filter(m => m.subject === subject);
              const totalScore = subjectMarks.reduce((sum, m) => sum + (m.score || 0), 0);
              const subjectTotal = totalScore > 0 ? { total: totalScore, maxTotal: 100 } : null;
              const subjectGrade = subjectTotal ? getGrade(totalScore) : null;
              
              if (subjectTotal) {
                totalSem1 += totalScore;
                subjectCount++;
              }
              
              return (
                <tr key={index} className="border-b border-slate-900 h-[29px]">
                  <td className="border-r border-slate-900 text-left pl-3 font-serif text-[13px] text-slate-900 font-normal">{subject}</td>
                  <td className="border-r border-slate-900 text-center font-sans text-[14px] text-blue-900 font-medium">{subjectTotal ? subjectTotal.total : '—'}</td>
                  <td className="border-r border-slate-900 text-center font-sans text-[14px] text-blue-900 font-medium">—</td>
                  <td className="border-r border-slate-900 text-center font-sans text-[14px] text-blue-900 font-medium">{subjectTotal ? subjectTotal.total : '—'}</td>
                  <td className="text-center font-sans text-[14px] font-bold" style={{color: subjectGrade?.color || '#999'}}>{subjectGrade ? subjectGrade.letter : '—'}</td>
                </tr>
              );
            });
            
            const avgSem1 = subjectCount > 0 ? totalSem1 / subjectCount : 0;
            const overallAverage = avgSem1;
            const totalMarks = totalSem1;
            const grade = getGrade(overallAverage);
            const status = getStatus(overallAverage);
            const promoted = isPromoted(overallAverage);
            
            setTotals({
              totalMarks: totalMarks,
              sem1Total: totalMarks,
              avgSem1: avgSem1,
              overallAverage: overallAverage,
              grade: grade,
              status: status,
              promoted: promoted
            });
            
            setSubjectRows(rows);
          } catch (error) {
            console.error('Error fetching semester marks:', error);
            toast.error('Failed to fetch semester marks');
          }
        }
        setLoadingCertificate(false);
      };
      
      buildRows();
    }, [student, yearly]);

    const handleDownload = async () => {
      const downloadToast = toast.loading('Generating certificate PDF...');
      
      try {
        const page1Element = page1Ref.current;
        const page2Element = page2Ref.current;
        
        if (!page1Element || !page2Element) {
          toast.error('Certificate elements not found');
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
          width: 1128,
          height: 820,
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
          width: 1128,
          height: 820,
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
          format: [1128, 820],
          hotfixes: ['px_scaling']
        });

        const imgData1 = canvas1.toDataURL('image/jpeg', 0.95);
        pdf.addImage(imgData1, 'JPEG', 0, 0, 1128, 820);

        pdf.addPage();
        const imgData2 = canvas2.toDataURL('image/jpeg', 0.95);
        pdf.addImage(imgData2, 'JPEG', 0, 0, 1128, 820);

        const fileName = `${yearly ? 'Annual' : semester}_Certificate_${student.name.replace(/\s+/g, '_')}_${academicYear}.pdf`;
        pdf.save(fileName);

        toast.success(`✅ Certificate downloaded successfully!`, { id: downloadToast });
      } catch (error) {
        console.error('Error generating PDF:', error);
        toast.error('Failed to generate certificate. Please try again.', { id: downloadToast });
      }
    };

    const handleClose = () => {
      setShowCertificate(false);
    };

    const promotionText = getPromotionText(totals.promoted);
    const promotionStampText = totals.promoted ? 'Promoted!' : 'Not Promoted!';
    const promotionSubText = totals.promoted ? 'ያልፋል' : 'አያልፍም';

    // Get class grade from multiple sources
    const classGrade = studentClassInfo?.grade || 
                       studentClass?.grade || 
                       student.grade || 
                       'Not Assigned';
    
    const classSection = studentClassInfo?.section || 
                         studentClass?.section || 
                         student.section || 
                         '';

    const totalsRows = (
      <>
        <tr className="border-b border-slate-900 h-[29px] border-t-2 border-t-slate-900">
          <td className="border-r border-slate-900 text-left pl-3 font-serif text-[13px] text-slate-900 font-bold">Total Sum</td>
          <td className="border-r border-slate-900 text-center font-sans text-[14px] text-blue-900 font-bold">{yearly ? totals.sem1Total?.toFixed(1) : totals.totalMarks.toFixed(1)}</td>
          <td className="border-r border-slate-900 text-center font-sans text-[14px] text-blue-900 font-bold">{yearly ? totals.sem2Total?.toFixed(1) : '—'}</td>
          <td className="border-r border-slate-900 text-center font-sans text-[14px] text-blue-900 font-bold">{totals.totalMarks.toFixed(1)}</td>
          <td className="text-center font-sans text-[14px] text-blue-900 font-bold">{totals.grade?.letter || '—'}</td>
        </tr>
        <tr className="border-b border-slate-900 h-[29px]">
          <td className="border-r border-slate-900 text-left pl-3 font-serif text-[13px] text-slate-900 font-bold">Average</td>
          <td className="border-r border-slate-900 text-center font-sans text-[14px] text-blue-900 font-bold">{yearly ? totals.avgSem1?.toFixed(2) : totals.overallAverage.toFixed(2)}</td>
          <td className="border-r border-slate-900 text-center font-sans text-[14px] text-blue-900 font-bold">{yearly ? totals.avgSem2?.toFixed(2) : '—'}</td>
          <td className="border-r border-slate-900 text-center font-sans text-[14px] text-blue-900 font-bold">{totals.overallAverage.toFixed(2)}</td>
          <td className="text-center font-sans text-[14px] text-blue-900 font-bold">{totals.grade?.letter || '—'}</td>
        </tr>
        <tr className="border-b border-slate-900 h-[29px]">
          <td className="border-r border-slate-900 text-left pl-3 font-serif text-[13px] text-slate-900 font-bold">Rank</td>
          <td className="border-r border-slate-900 text-center font-sans text-[14px] text-blue-900 font-bold">—</td>
          <td className="border-r border-slate-900 text-center font-sans text-[14px] text-blue-900 font-bold">—</td>
          <td className="border-r border-slate-900 text-center font-sans text-[14px] text-blue-900 font-bold">—</td>
          <td className="text-center font-sans text-[14px] text-blue-900 font-bold">—</td>
        </tr>
        <tr className="border-b border-slate-900 h-[29px]">
          <td className="border-r border-slate-900 text-left pl-3 font-serif text-[13px] text-slate-900 font-bold">Conduct</td>
          <td className="border-r border-slate-900 text-center font-sans text-[14px] text-blue-900 font-bold">{totals.grade?.letter || '—'}</td>
          <td className="border-r border-slate-900 text-center font-sans text-[14px] text-blue-900 font-bold">{yearly ? totals.grade?.letter : '—'}</td>
          <td className="border-r border-slate-900 text-center font-sans text-[14px] text-blue-900 font-bold">{totals.grade?.letter || '—'}</td>
          <td className="text-center font-sans text-[14px] text-blue-900 font-bold">{totals.grade?.letter || '—'}</td>
        </tr>
        <tr className="border-b border-slate-900 h-[29px] bg-cyan-100/30">
          <td className="border-r border-slate-900 text-left pl-3 font-serif text-[13px] text-slate-900 font-bold">Promotion</td>
          <td colSpan="4" className="text-center font-sans text-[16px] font-bold" style={{ color: totals.promoted ? '#059669' : '#dc2626' }}>
            {promotionText}
          </td>
        </tr>
      </>
    );

    if (loadingCertificate) {
      return (
        <div className="min-h-screen bg-slate-100 flex justify-center items-center">
          <div className="bg-white p-8 rounded-xl shadow-xl flex items-center gap-3">
            <div className="w-6 h-6 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-gray-600">Loading certificate data...</span>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-slate-100 p-8 flex flex-col gap-12 justify-center items-center font-serif text-slate-900 select-none print:p-0 print:bg-white">
        
        {/* PAGE 1: FRONT AND BACK COVERS */}
        <div ref={page1Ref} className="w-[1128px] h-[820px] bg-[#31b4cc] shadow-2xl flex p-10 relative overflow-hidden border border-cyan-700 print:shadow-none print:border-none page-break">
          
          {/* LEFT PANEL: BACK COVER (Method of Marking) */}
          <div className="w-1/2 h-full pr-10 border-r flex flex-col items-center relative text-[14px]">
            <div className="flex items-center justify-center mb-4">
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
              A mark Zero (0%) should never be given, since it would mean no work has been done absolutely. If a student has been absent from class for the whole period covered and has not made up any of the work, He/she should be marked 'AB' for 'absent'
            </p>
            <div className="absolute bottom-6 right-6 flex flex-col gap-3 font-bold text-slate-700 text-lg">
              <span>:</span><span>:</span><span>:</span>
            </div>
          </div>

          {/* RIGHT PANEL: FRONT COVER (Student Profile) */}
          <div className="w-1/2 h-full pl-10 flex flex-col items-center text-[13px] text-slate-900">
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
                  className="w-[150px] h-[180px] object-cover border-3 border-[#b88728] shadow-md"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextElementSibling.style.display = 'flex';
                  }}
                />
                <div className="w-[150px] h-[180px] bg-gray-100 flex items-center justify-center text-xs text-gray-500 hidden">
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
              <p className="text-[12px] font-medium text-slate-800">{yearly ? 'Yearly' : semester} Student Certificate</p>
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
                  <span className="absolute left-6 bottom-0.5 font-sans text-xl text-blue-900 tracking-wider font-light">
                    {classGrade !== 'Not Assigned' ? `${classGrade}${classSection ? ` - ${classSection}` : ''}` : 'Not Assigned'}
                  </span>
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

        {/* PAGE 2: GRADES & REMARKS */}
        <div ref={page2Ref} className="w-[1128px] h-[820px] bg-[#31b4cc] shadow-2xl flex p-10 relative overflow-hidden border border-cyan-700 print:shadow-none print:border-none page-break">
          
          {/* LEFT PANEL: GRADES TABLE */}
          <div className="w-1/2 h-full pr-4 flex flex-col justify-between">
            <table className="w-full border-collapse border border-slate-900 text-center text-[12px] bg-cyan-50/10">
              <thead>
                <tr className="border-b border-slate-900">
                  <th className="border-r border-slate-900 p-2 font-bold w-[28%] text-left pl-3">Subject</th>
                  <th className="border-r border-slate-900 p-1 font-bold w-[18%] text-xs leading-tight">First<br/>Semester</th>
                  <th className="border-r border-slate-900 p-1 font-bold w-[18%] text-xs leading-tight">Second<br/>Semester</th>
                  <th className="border-r border-slate-900 p-1 font-bold w-[18%] text-xs">AVERAGE</th>
                  <th className="p-1 font-bold w-[18%] text-xs">GRADE</th>
                </tr>
              </thead>
              <tbody className="font-sans text-[14px] text-blue-900 font-medium">
                {subjectRows.length > 0 ? subjectRows : (
                  <tr>
                    <td colSpan="5" className="text-center py-4 text-slate-500">No marks available</td>
                  </tr>
                )}
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

          {/* RIGHT PANEL: REMARKS & SIGNATURES WITH QR */}
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

            {/* QR Code */}
            {qrCodeImage && (
              <div className="absolute bottom-4 right-8 flex flex-col items-center">
                <img src={qrCodeImage} alt="QR Code" className="w-24 h-24 border-2 border-slate-800 rounded-lg" />
                <span className="text-[8px] text-slate-600 mt-1 font-bold">VERIFY AUTHENTICITY</span>
              </div>
            )}

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
            DOWNLOAD CERTIFICATE
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

  // ==========================================
  // MAIN VIEW
  // ==========================================

  if (showCertificate) {
    return (
      <CertificateView 
        student={studentData} 
        yearly={certificateType === 'yearly'} 
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-700 via-cyan-600 to-blue-700 flex justify-center items-center">
        <div className="bg-white/10 backdrop-blur-sm px-8 py-4 rounded-xl shadow-xl text-white flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          <span>Loading your certificate...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-700 via-cyan-600 to-blue-700 flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg text-center">
          <p className="font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  if (!studentData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-700 via-cyan-600 to-blue-700 flex items-center justify-center">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-6 py-4 rounded-lg text-center">
          <p>No student data found. Please contact administrator.</p>
        </div>
      </div>
    );
  }

  const overallAverage = calculateOverallAverage(studentData._id);
  const grade = getGrade(overallAverage);
  const totalMarks = calculateTotalMarks(studentData._id);
  const maxPossible = allSubjectsList.length * 100;
  const status = getStatus(overallAverage);
  const promoted = isPromoted(overallAverage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-700 via-cyan-600 to-blue-700 py-12 px-4">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=Poppins:wght@300;400;500;600;700&display=swap');
        .dashboard-header { margin-bottom: 30px; }
        .header-title {
          font-family: 'Playfair Display', serif;
          font-size: 36px;
          font-weight: 800;
          color: white;
        }
      `}</style>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="dashboard-header text-center">
          <h1 className="header-title">📜 My Academic Certificate</h1>
          <p className="text-cyan-100 mt-2">View and download your academic performance certificate</p>
        </div>

        {/* Controls */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-8">
          <div className="flex flex-wrap gap-4 justify-between items-center">
            <div className="flex gap-4">
              <div>
                <label className="block text-sm font-medium text-cyan-100 mb-2">Semester</label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="px-4 py-2 border rounded-lg bg-white"
                >
                  <option value="Semester 1">Semester 1</option>
                  <option value="Semester 2">Semester 2</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-cyan-100 mb-2">Academic Year</label>
                <select
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="px-4 py-2 border rounded-lg bg-white"
                >
                  <option value="2023-2024">2023-2024</option>
                  <option value="2024-2025">2024-2025</option>
                  <option value="2025-2026">2025-2026</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setCertificateType('semester');
                  setShowCertificate(true);
                }}
                disabled={allSubjectsList.length === 0}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download size={20} />
                {semester} Certificate
              </button>
              <button
                onClick={() => {
                  setCertificateType('yearly');
                  setShowCertificate(true);
                }}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:shadow-lg transition flex items-center gap-2"
              >
                <Download size={20} />
                Yearly Certificate
              </button>
            </div>
          </div>
        </div>

        {/* Performance Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white/95 backdrop-blur-sm p-4 rounded-xl border border-cyan-200 shadow-lg">
            <p className="text-sm text-cyan-700 font-semibold">Total Marks</p>
            <p className="text-3xl font-bold text-cyan-700">{totalMarks}/{maxPossible}</p>
          </div>
          <div className="bg-white/95 backdrop-blur-sm p-4 rounded-xl border border-blue-200 shadow-lg">
            <p className="text-sm text-blue-700 font-semibold">Overall Average</p>
            <p className="text-3xl font-bold text-blue-700">{overallAverage.toFixed(1)}%</p>
          </div>
          <div className="bg-white/95 backdrop-blur-sm p-4 rounded-xl border border-purple-200 shadow-lg">
            <p className="text-sm text-purple-700 font-semibold">Grade</p>
            <p className="text-3xl font-bold text-purple-700" style={{color: grade.color}}>{grade.letter}</p>
          </div>
          <div className="bg-white/95 backdrop-blur-sm p-4 rounded-xl border border-orange-200 shadow-lg">
            <p className="text-sm text-orange-700 font-semibold">Status</p>
            <p className="text-3xl font-bold text-orange-700" style={{color: status.color}}>{status.text}</p>
          </div>
          <div className={`bg-white/95 backdrop-blur-sm p-4 rounded-xl border shadow-lg ${promoted ? 'border-green-200' : 'border-red-200'}`}>
            <p className="text-sm font-semibold" style={{color: promoted ? '#059669' : '#dc2626'}}>Promotion</p>
            <p className="text-3xl font-bold" style={{color: promoted ? '#059669' : '#dc2626'}}>{getPromotionText(promoted)}</p>
          </div>
        </div>

        {/* Marks Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white">
                <tr>
                  <th className="p-4 text-left border border-cyan-600">Subject</th>
                  <th className="p-4 text-center border border-cyan-600">Quiz</th>
                  <th className="p-4 text-center border border-cyan-600">Test</th>
                  <th className="p-4 text-center border border-cyan-600">Midterm</th>
                  <th className="p-4 text-center border border-cyan-600">Assignment</th>
                  <th className="p-4 text-center border border-cyan-600">Final</th>
                  <th className="p-4 text-center border border-cyan-600">Total</th>
                  <th className="p-4 text-center border border-cyan-600">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {allSubjectsList.map((subject, idx) => {
                  const subjectDetails = getSubjectMarksDetails(studentData._id, subject);
                  const subjectTotal = getSubjectTotal(studentData._id, subject);
                  const subjectGrade = subjectTotal ? getGrade(subjectTotal.total) : null;
                  const exams = subjectDetails?.exams || {};
                  const bgColor = idx % 2 === 0 ? '#ffffff' : '#f0f9ff';
                  
                  return (
                    <tr key={subject} style={{background: bgColor}} className="hover:bg-cyan-50 transition">
                      <td className="p-4 font-medium border border-gray-200">{subject}</td>
                      <td className="p-4 text-center border border-gray-200">{exams.quiz?.score || '-'}</td>
                      <td className="p-4 text-center border border-gray-200">{exams.test?.score || '-'}</td>
                      <td className="p-4 text-center border border-gray-200">{exams.midterm?.score || '-'}</td>
                      <td className="p-4 text-center font-medium text-blue-600 border border-gray-200">
                        {exams.assignment?.score || exams.textbook?.score || exams.notebook?.score || '-'}
                      </td>
                      <td className="p-4 text-center border border-gray-200">{exams.final?.score || '-'}</td>
                      <td className="p-4 text-center font-bold text-blue-600 border border-gray-200">
                        {subjectTotal ? `${subjectTotal.total}/${subjectTotal.maxTotal}` : '-'}
                      </td>
                      <td className="p-4 text-center border border-gray-200">
                        {subjectGrade && (
                          <span className="px-3 py-1 rounded-full text-sm font-medium" style={{background: subjectGrade.bg, color: subjectGrade.color}}>
                            {subjectGrade.letter}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentCertificate;