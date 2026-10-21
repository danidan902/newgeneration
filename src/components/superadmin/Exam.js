import React, { useState, useMemo } from 'react';
import { Plus, Search, Edit, Eye, Trash2, X, CheckCircle, Clock, AlertCircle } from 'lucide-react';

// --- Dummy Data ---
const initialExams = [
  { id: '1', title: 'Mathematics Final', grade: '10', section: 'A', academicYear: '2024-2025', term: 'Term 1', date: '2025-03-15', status: 'Scheduled' },
  { id: '2', title: 'English Midterm', grade: '9', section: 'B', academicYear: '2024-2025', term: 'Term 1', date: '2025-03-10', status: 'Ongoing' },
  { id: '3', title: 'Physics Quiz', grade: '11', section: 'C', academicYear: '2024-2025', term: 'Term 2', date: '2025-02-20', status: 'Completed' },
  { id: '4', title: 'Chemistry Practical', grade: '12', section: 'A', academicYear: '2023-2024', term: 'Term 3', date: '2024-11-05', status: 'Completed' },
  { id: '5', title: 'Biology Assignment', grade: '10', section: 'B', academicYear: '2024-2025', term: 'Term 1', date: '2025-04-01', status: 'Scheduled' },
];

// --- Helper Components ---
const StatusBadge = ({ status }) => {
  const styles = {
    Scheduled: 'bg-blue-100 text-blue-700 border-blue-200',
    Ongoing: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    Completed: 'bg-green-100 text-green-700 border-green-200',
  };
  const icons = {
    Scheduled: <Clock className="w-3 h-3 mr-1" />,
    Ongoing: <AlertCircle className="w-3 h-3 mr-1" />,
    Completed: <CheckCircle className="w-3 h-3 mr-1" />,
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status]}`}>
      {icons[status]} {status}
    </span>
  );
};

// --- Main Component ---
const ExamManagement = () => {
  const [exams, setExams] = useState(initialExams);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ academicYear: '', term: '', grade: '', section: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [viewingExam, setViewingExam] = useState(null);
  const [loading, setLoading] = useState(false);

  // --- Filter & Search Logic ---
  const filteredExams = useMemo(() => {
    return exams.filter((exam) => {
      const matchesSearch = exam.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesYear = filters.academicYear ? exam.academicYear === filters.academicYear : true;
      const matchesTerm = filters.term ? exam.term === filters.term : true;
      const matchesGrade = filters.grade ? exam.grade === filters.grade : true;
      const matchesSection = filters.section ? exam.section === filters.section : true;
      return matchesSearch && matchesYear && matchesTerm && matchesGrade && matchesSection;
    });
  }, [exams, searchTerm, filters]);

  // --- CRUD Handlers ---
  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this exam?')) {
      setLoading(true);
      setTimeout(() => {
        setExams(exams.filter((e) => e.id !== id));
        setLoading(false);
      }, 500);
    }
  };

  const handleSaveExam = (examData) => {
    setLoading(true);
    setTimeout(() => {
      if (editingExam) {
        setExams(exams.map((e) => (e.id === editingExam.id ? { ...examData, id: editingExam.id } : e)));
      } else {
        const newExam = { ...examData, id: Date.now().toString() };
        setExams([newExam, ...exams]);
      }
      setIsModalOpen(false);
      setEditingExam(null);
      setLoading(false);
    }, 500);
  };

  // --- Extract filter options ---
  const academicYears = [...new Set(exams.map((e) => e.academicYear))];
  const terms = [...new Set(exams.map((e) => e.term))];
  const grades = [...new Set(exams.map((e) => e.grade))];
  const sections = [...new Set(exams.map((e) => e.section))];

  // --- Modal Component (Create / Edit) ---
  const ExamFormModal = ({ onClose, onSave, initialData }) => {
    const [formData, setFormData] = useState({
      title: initialData?.title || '',
      grade: initialData?.grade || '',
      section: initialData?.section || '',
      academicYear: initialData?.academicYear || '',
      term: initialData?.term || '',
      date: initialData?.date || '',
      status: initialData?.status || 'Scheduled',
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      onSave(formData);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 animate-fade-in-up">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">{initialData ? 'Edit Exam' : 'Create New Exam'}</h2>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 transition-colors">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Exam Title</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Grade</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  value={formData.grade}
                  onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  value={formData.section}
                  onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  value={formData.academicYear}
                  onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Term</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  value={formData.term}
                  onChange={(e) => setFormData({ ...formData, term: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Scheduled">Scheduled</option>
                <option value="Ongoing">Ongoing</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition">
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                {initialData ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // --- View Exam Modal ---
  const ViewExamModal = ({ exam, onClose }) => {
    if (!exam) return null;
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 animate-fade-in-up">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Exam Details</h2>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 transition-colors">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <div className="space-y-3">
            <div><span className="font-medium text-gray-500">Title:</span> <span className="text-gray-800">{exam.title}</span></div>
            <div><span className="font-medium text-gray-500">Grade:</span> <span className="text-gray-800">{exam.grade}</span></div>
            <div><span className="font-medium text-gray-500">Section:</span> <span className="text-gray-800">{exam.section}</span></div>
            <div><span className="font-medium text-gray-500">Academic Year:</span> <span className="text-gray-800">{exam.academicYear}</span></div>
            <div><span className="font-medium text-gray-500">Term:</span> <span className="text-gray-800">{exam.term}</span></div>
            <div><span className="font-medium text-gray-500">Date:</span> <span className="text-gray-800">{exam.date}</span></div>
            <div><span className="font-medium text-gray-500">Status:</span> <StatusBadge status={exam.status} /></div>
          </div>
          <div className="mt-6 flex justify-end">
            <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition">Close</button>
          </div>
        </div>
      </div>
    );
  };

  // --- UI ---
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Exam Management</h1>
        <button
          onClick={() => { setEditingExam(null); setIsModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm"
        >
          <Plus className="w-4 h-4" /> New Exam
        </button>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search exams..."
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none transition text-sm"
              value={filters.academicYear}
              onChange={(e) => setFilters({ ...filters, academicYear: e.target.value })}
            >
              <option value="">All Years</option>
              {academicYears.map((y) => <option key={y}>{y}</option>)}
            </select>
            <select
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none transition text-sm"
              value={filters.term}
              onChange={(e) => setFilters({ ...filters, term: e.target.value })}
            >
              <option value="">All Terms</option>
              {terms.map((t) => <option key={t}>{t}</option>)}
            </select>
            <select
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none transition text-sm"
              value={filters.grade}
              onChange={(e) => setFilters({ ...filters, grade: e.target.value })}
            >
              <option value="">All Grades</option>
              {grades.map((g) => <option key={g}>{g}</option>)}
            </select>
            <select
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none transition text-sm"
              value={filters.section}
              onChange={(e) => setFilters({ ...filters, section: e.target.value })}
            >
              <option value="">All Sections</option>
              {sections.map((s) => <option key={s}>{s}</option>)}
            </select>
            {(filters.academicYear || filters.term || filters.grade || filters.section) && (
              <button
                onClick={() => setFilters({ academicYear: '', term: '', grade: '', section: '' })}
                className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Exam Table */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredExams.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="text-gray-400 text-5xl mb-3">📋</div>
          <h3 className="text-lg font-medium text-gray-600">No exams found</h3>
          <p className="text-gray-400 text-sm">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade/Section</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Academic Year</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Term</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredExams.map((exam) => (
                  <tr key={exam.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-800">{exam.title}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{exam.grade} - {exam.section}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">{exam.academicYear}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">{exam.term}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">{exam.date}</td>
                    <td className="px-4 py-3 whitespace-nowrap"><StatusBadge status={exam.status} /></td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => setViewingExam(exam)}
                          className="p-1.5 rounded-full hover:bg-blue-50 text-blue-600 transition"
                          aria-label="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => { setEditingExam(exam); setIsModalOpen(true); }}
                          className="p-1.5 rounded-full hover:bg-yellow-50 text-yellow-600 transition"
                          aria-label="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(exam.id)}
                          className="p-1.5 rounded-full hover:bg-red-50 text-red-600 transition"
                          aria-label="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-400 flex justify-between">
            <span>Showing {filteredExams.length} of {exams.length} exams</span>
          </div>
        </div>
      )}

      {/* Modals */}
      {isModalOpen && (
        <ExamFormModal
          onClose={() => { setIsModalOpen(false); setEditingExam(null); }}
          onSave={handleSaveExam}
          initialData={editingExam}
        />
      )}
      {viewingExam && (
        <ViewExamModal
          exam={viewingExam}
          onClose={() => setViewingExam(null)}
        />
      )}

      {/* Inline styles for animation */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.25s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ExamManagement;