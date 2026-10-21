import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Save, Edit, X, RefreshCw, FileSearch, Calendar } from 'lucide-react';
import api from '../services/api';

const AnalyzePace = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [analyzeData, setAnalyzeData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchRollNum, setSearchRollNum] = useState('');
  const [fetchedStudentMarks, setFetchedStudentMarks] = useState(null);
  const [isFetching, setIsFetching] = useState(false);
  const [editingMark, setEditingMark] = useState(null);
  const [editingValue, setEditingValue] = useState('');
  
  // Semester and Academic Year states
  const [semester, setSemester] = useState('Semester 1');
  const [academicYear, setAcademicYear] = useState('2024-2025');
  

const ClassSelector = ({ classes, onSelect, title = "Select Class" }) => (
  <div className="max-w-4xl mx-auto">
    <h2 className="text-2xl font-bold mb-6">{title}</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {classes.map((cls) => (
        <button
          key={cls._id}
          onClick={() => onSelect(cls._id)}
          className="text-left p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
        >
          <h3 className="text-lg font-bold">Grade {cls.grade} - Section {cls.section}</h3>
          {/* ✅ FIXED: Use cls.subject?.name instead of cls.subject */}
          <p className="text-gray-600 mt-1">{cls.subject?.name || 'No Subject'}</p>
          <p className="text-sm text-gray-500 mt-2">{cls.students?.length || 0} Students</p>
        </button>
      ))}
    </div>
  </div>
);


  useEffect(() => {
    fetchClasses();
  }, []);
  
  // Reload data when semester or academic year changes
  useEffect(() => {
    if (selectedClass) {
      fetchStudentsForAnalyze(selectedClass._id, selectedClass);
    }
  }, [semester, academicYear]);
  
  const fetchClasses = async () => {
    try {
      const response = await api.get('/classes/my-classes');
      setClasses(response.data);
    } catch (error) {
      toast.error('Failed to fetch classes');
    }
  };


  
  const handleClassSelect = async (classId) => {
    const cls = classes.find(c => c._id === classId);
    setSelectedClass(cls);
    await fetchStudentsForAnalyze(classId, cls);
  };
  
  // MAIN FUNCTION - Fetch students with marks
  const fetchStudentsForAnalyze = async (classId, cls) => {
    setIsLoading(true);
    try {
      // Get students in class
      const classResponse = await api.get(`/classes/${classId}`);
      const students = classResponse.data.students || [];
      
      if (students.length === 0) {
        toast.warning('No students found');
        setAnalyzeData([]);
        setIsLoading(false);
        return;
      }
      
      const studentsWithMarks = [];
      
      // Get subject name correctly
      const subjectName = cls.subject?.name || cls.subject;
      
      // Fetch marks for each student with semester and academic year filters
      for (const student of students) {
        try {
          // Get marks with semester and academic year filter
          const marksResponse = await api.get(`/marks/student/${student._id}`, {
            params: { semester: semester, academicYear: academicYear }
          });
          
          let marksArray = marksResponse.data;
          if (!Array.isArray(marksArray) && marksResponse.data?.data) {
            marksArray = marksResponse.data.data;
          }
          
          // Filter by subject
          const subjectMarks = marksArray.filter(m => m.subject === subjectName);
          
          // Initialize scores
          let scores = {
            quiz: 0, quizId: null,
            test: 0, testId: null,
            midterm: 0, midtermId: null,
            textbook: 0, textbookId: null,
            final: 0, finalId: null
          };
          
          subjectMarks.forEach(mark => {
            switch(mark.examType) {
              case 'quiz': scores.quiz = mark.score; scores.quizId = mark._id; break;
              case 'test': scores.test = mark.score; scores.testId = mark._id; break;
              case 'midterm': scores.midterm = mark.score; scores.midtermId = mark._id; break;
              case 'textbook': scores.textbook = mark.score; scores.textbookId = mark._id; break;
              case 'final': scores.final = mark.score; scores.finalId = mark._id; break;
              default: break;
            }
          });
          
          const total = scores.quiz + scores.test + scores.midterm + scores.textbook + scores.final;
          let result = 'Fail', grade = 'F';
          if (total >= 90) { result = 'Pass'; grade = 'A+'; }
          else if (total >= 80) { result = 'Pass'; grade = 'A'; }
          else if (total >= 70) { result = 'Pass'; grade = 'B'; }
          else if (total >= 60) { result = 'Pass'; grade = 'C'; }
          else if (total >= 50) { result = 'Pass'; grade = 'D'; }
          
          studentsWithMarks.push({
            _id: student._id,
            name: student.name,
            rollNumber: student.rollNumber,
            ...scores,
            total,
            result,
            grade
          });
          
        } catch (error) {
          console.error(`Error for ${student.name}:`, error);
          studentsWithMarks.push({
            _id: student._id,
            name: student.name,
            rollNumber: student.rollNumber,
            quiz: 0, test: 0, midterm: 0, textbook: 0, final: 0,
            total: 0, result: 'Fail', grade: 'F'
          });
        }
      }
      
      setAnalyzeData(studentsWithMarks);
      toast.success(`Loaded ${studentsWithMarks.length} students for ${semester} ${academicYear}`);
      
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Save edited mark
  const saveMarkEdit = async () => {
    if (!editingMark) return;
    
    const maxScores = { quiz: 10, test: 10, midterm: 20, textbook: 20, final: 50 };
    const newScore = parseInt(editingValue);
    
    if (isNaN(newScore) || newScore < 0 || newScore > maxScores[editingMark.examType]) {
      toast.error(`Score must be 0-${maxScores[editingMark.examType]}`);
      return;
    }
    
    try {
      const subjectName = selectedClass.subject?.name || selectedClass.subject;
      
      const markData = {
        studentId: editingMark.studentId,
        classId: selectedClass._id,
        subject: subjectName,
        examType: editingMark.examType,
        score: newScore,
        maxScore: maxScores[editingMark.examType],
        semester: semester,
        academicYear: academicYear
      };
      
      if (editingMark.markId) {
        await api.put(`/marks/${editingMark.markId}`, markData);
      } else {
        await api.post('/marks/add', markData);
      }
      
      toast.success('Mark saved!');
      await fetchStudentsForAnalyze(selectedClass._id, selectedClass);
      setEditingMark(null);
      setEditingValue('');
      
    } catch (error) {
      console.error('Save error:', error);
      toast.error(error.response?.data?.error || 'Failed to save');
    }
  };
  
  // Search single student
  const fetchStudentMarkByRollNum = async () => {
    if (!selectedClass || !searchRollNum) {
      toast.error('Select class and enter roll number');
      return;
    }
    
    setIsFetching(true);
    try {
      const classResponse = await api.get(`/classes/${selectedClass._id}`);
      const student = classResponse.data.students.find(
        s => s.rollNumber.toString() === searchRollNum.toString()
      );
      
      if (!student) {
        toast.error('Student not found');
        setFetchedStudentMarks(null);
        setIsFetching(false);
        return;
      }
      
      const marksResponse = await api.get(`/marks/student/${student._id}`, {
        params: { semester: semester, academicYear: academicYear }
      });
      
      let marksArray = marksResponse.data;
      if (!Array.isArray(marksArray) && marksResponse.data?.data) {
        marksArray = marksResponse.data.data;
      }
      
      const subjectName = selectedClass.subject?.name || selectedClass.subject;
      const subjectMarks = marksArray.filter(m => m.subject === subjectName);
      
      let scores = { quiz: 0, test: 0, midterm: 0, textbook: 0, final: 0 };
      subjectMarks.forEach(mark => {
        scores[mark.examType] = mark.score;
      });
      
      const total = scores.quiz + scores.test + scores.midterm + scores.textbook + scores.final;
      let result = 'Fail', grade = 'F';
      if (total >= 90) { result = 'Pass'; grade = 'A+'; }
      else if (total >= 80) { result = 'Pass'; grade = 'A'; }
      else if (total >= 70) { result = 'Pass'; grade = 'B'; }
      else if (total >= 60) { result = 'Pass'; grade = 'C'; }
      else if (total >= 50) { result = 'Pass'; grade = 'D'; }
      
      setFetchedStudentMarks({ student, ...scores, total, result, grade });
      toast.success('Student found!');
      
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Failed to fetch');
    } finally {
      setIsFetching(false);
    }
  };
  
  // Handle semester change
  const handleSemesterChange = (newSemester) => {
    setSemester(newSemester);
  };
  
  // Handle academic year change
  const handleAcademicYearChange = (newYear) => {
    setAcademicYear(newYear);
  };
  
  // Calculate stats
  const totalStudents = analyzeData.length;
  const passedStudents = analyzeData.filter(s => s.result === 'Pass').length;
  const classAverage = totalStudents > 0 
    ? (analyzeData.reduce((sum, s) => sum + s.total, 0) / totalStudents).toFixed(1)
    : 0;
  
  // Class selector view - FIXED
  if (!selectedClass) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white p-6 rounded-lg mb-6">
          <h2 className="text-2xl font-bold">Analyze Student Pace</h2>
          <p className="mt-2">Select a class to analyze student performance</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {classes.map((cls) => (
            <button
              key={cls._id}
              onClick={() => handleClassSelect(cls._id)}
              className="text-left p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
            >
              <h3 className="text-lg font-bold">Grade {cls.grade} - Section {cls.section}</h3>
              {/* FIXED: Use cls.subject?.name instead of cls.subject */}
              <p className="text-gray-600 mt-1">{cls.subject?.name || 'No Subject'}</p>
              <p className="text-sm text-gray-500 mt-2">{cls.students?.length || 0} Students</p>
            </button>
          ))}
        </div>
      </div>
    );
  }
  
  const subjectName = selectedClass.subject?.name || selectedClass.subject;
  
  if (!selectedClass) {
    return <ClassSelector classes={classes} onSelect={handleClassSelect} title="Select Class to View All Marks" />;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Class Performance Analysis</h2>
            <p className="text-gray-600">{selectedClass.grade} - {selectedClass.section} | {subjectName}</p>
            <p className="text-sm text-blue-600 mt-1">{semester} - {academicYear}</p>
          </div>
          <button onClick={() => setSelectedClass(null)} className="text-gray-600 hover:text-gray-800">
            Change Class
          </button>
        </div>
        
        {/* Semester and Academic Year Selectors */}
        <div className="mt-4 mb-4 bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-xl shadow-sm">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Calendar size={20} className="text-blue-600" />
              <span className="font-semibold text-gray-700">Academic Period:</span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => handleSemesterChange('Semester 1')}
                className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                  semester === 'Semester 1' 
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md transform scale-105' 
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                <span className="text-lg">📘</span>
                Semester 1
              </button>
              <button
                onClick={() => handleSemesterChange('Semester 2')}
                className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                  semester === 'Semester 2' 
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md transform scale-105' 
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                <span className="text-lg">📗</span>
                Semester 2
              </button>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={academicYear}
                onChange={(e) => handleAcademicYearChange(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="2023-2024">2023-2024</option>
                <option value="2024-2025">2024-2025</option>
                <option value="2025-2026">2025-2026</option>
              </select>
              <div className="text-sm text-blue-600 bg-blue-100 px-3 py-1.5 rounded-full">
                {semester === 'Semester 1' ? '📘 First Half' : '📗 Second Half'}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Search Section */}
      <div className="mb-8 bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center">
          <FileSearch size={20} className="mr-2" />
          Search Student by Roll Number
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Enter roll number"
            value={searchRollNum}
            onChange={(e) => setSearchRollNum(e.target.value)}
            className="p-2 border rounded-lg"
            onKeyPress={(e) => e.key === 'Enter' && fetchStudentMarkByRollNum()}
          />
          <button
            onClick={fetchStudentMarkByRollNum}
            disabled={isFetching}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {isFetching ? 'Searching...' : 'Fetch Student Marks'}
          </button>
        </div>
        
        {fetchedStudentMarks && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-bold">{fetchedStudentMarks.student.name} (Roll: {fetchedStudentMarks.student.rollNumber})</h4>
            <div className="grid grid-cols-6 gap-2 mt-2 text-center">
              <div>Quiz: {fetchedStudentMarks.quiz}</div>
              <div>Test: {fetchedStudentMarks.test}</div>
              <div>Mid: {fetchedStudentMarks.midterm}</div>
              <div>Textbook: {fetchedStudentMarks.textbook}</div>
              <div>Final: {fetchedStudentMarks.final}</div>
              <div><strong>Total: {fetchedStudentMarks.total}</strong></div>
            </div>
          </div>
        )}
      </div>
      
      {/* Main Table */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Student Marks - {subjectName}</h3>
          <button 
            onClick={() => fetchStudentsForAnalyze(selectedClass._id, selectedClass)}
            className="flex items-center gap-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
        
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-3">Loading {semester} marks for {academicYear}...</p>
          </div>
        ) : analyzeData.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No marks found for {semester} - {academicYear}</p>
            <p className="text-sm text-gray-400 mt-2">Go to Grade Entry page and add marks</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border">
              <thead className="bg-gray-800 text-white">
                <tr>
                  <th className="p-2">Roll</th>
                  <th className="p-2">Name</th>
                  <th className="p-2">Quiz(10)</th>
                  <th className="p-2">Test(10)</th>
                  <th className="p-2">Mid(20)</th>
                  <th className="p-2">Text(20)</th>
                  <th className="p-2">Final(50)</th>
                  <th className="p-2">Total</th>
                  <th className="p-2">Result</th>
                  <th className="p-2">Grade</th>
                </tr>
              </thead>
              <tbody>
                {analyzeData.map((student) => (
                  <tr key={student._id} className="border-b hover:bg-gray-50">
                    <td className="p-2 text-center">{student.rollNumber}</td>
                    <td className="p-2">{student.name}</td>
                    <td className="p-2 text-center">
                      {editingMark?.studentId === student._id && editingMark?.examType === 'quiz' ? (
                        <div className="flex gap-1 justify-center">
                          <input type="number" value={editingValue} onChange={(e) => setEditingValue(e.target.value)} className="w-16 p-1 border rounded" />
                          <button onClick={saveMarkEdit} className="text-green-600">✓</button>
                          <button onClick={() => setEditingMark(null)} className="text-red-600">✗</button>
                        </div>
                      ) : (
                        <div className="flex justify-between items-center">
                          <span>{student.quiz}</span>
                          <button onClick={() => {
                            setEditingMark({ studentId: student._id, examType: 'quiz', markId: student.quizId });
                            setEditingValue(student.quiz);
                          }} className="text-blue-500 text-xs ml-2">✏️</button>
                        </div>
                      )}
                    </td>
                    <td className="p-2 text-center">
                      {editingMark?.studentId === student._id && editingMark?.examType === 'test' ? (
                        <div className="flex gap-1 justify-center">
                          <input type="number" value={editingValue} onChange={(e) => setEditingValue(e.target.value)} className="w-16 p-1 border rounded" />
                          <button onClick={saveMarkEdit} className="text-green-600">✓</button>
                          <button onClick={() => setEditingMark(null)} className="text-red-600">✗</button>
                        </div>
                      ) : (
                        <div className="flex justify-between items-center">
                          <span>{student.test}</span>
                          <button onClick={() => {
                            setEditingMark({ studentId: student._id, examType: 'test', markId: student.testId });
                            setEditingValue(student.test);
                          }} className="text-blue-500 text-xs ml-2">✏️</button>
                        </div>
                      )}
                    </td>
                    <td className="p-2 text-center">{student.midterm}</td>
                    <td className="p-2 text-center">{student.textbook}</td>
                    <td className="p-2 text-center">{student.final}</td>
                    <td className="p-2 text-center font-bold">{student.total}%</td>
                    <td className="p-2 text-center">
                      <span className={`px-2 py-1 rounded text-sm ${student.result === 'Pass' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {student.result}
                      </span>
                    </td>
                    <td className="p-2 text-center font-bold">{student.grade}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-100">
                <tr>
                  <td colSpan="6" className="p-2 text-right font-bold">Class Average:</td>
                  <td className="p-2 text-center font-bold">{classAverage}%</td>
                  <td colSpan="2" className="p-2">Pass Rate: {totalStudents > 0 ? ((passedStudents/totalStudents)*100).toFixed(1) : 0}%</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
        
        {/* Stats */}
        {analyzeData.length > 0 && !isLoading && (
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 text-center rounded">
              <p className="text-sm">Total Students</p>
              <p className="text-2xl font-bold text-blue-700">{totalStudents}</p>
            </div>
            <div className="bg-green-50 p-4 text-center rounded">
              <p className="text-sm">Passed</p>
              <p className="text-2xl font-bold text-green-600">{passedStudents}</p>
            </div>
            <div className="bg-purple-50 p-4 text-center rounded">
              <p className="text-sm">Pass Rate</p>
              <p className="text-2xl font-bold text-purple-600">{totalStudents > 0 ? ((passedStudents/totalStudents)*100).toFixed(1) : 0}%</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyzePace;