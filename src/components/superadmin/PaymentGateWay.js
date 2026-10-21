import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  Users, BookOpen, User, Mail, Phone, Calendar, 
  Award, TrendingUp, Eye, ChevronLeft, Search, 
  RefreshCw, X, Download, Printer, 
  GraduationCap, Home, School, MapPin, Clock,
  Save, ChevronDown, ChevronUp, ArrowLeft,
  CreditCard, CheckCircle, Clock as ClockIcon, XCircle, AlertCircle,
  Check, RotateCcw
} from 'lucide-react';
import api from '../../services/api';

// ============================================
// 📊 REUSABLE COMPONENTS
// ============================================

// ============================================
// 🎯 AVATAR COMPONENT
// ============================================
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
// 📊 BADGE COMPONENT
// ============================================
const Badge = ({ text, color = 'blue' }) => {
  const colorMap = {
    blue: 'bg-cyan-100 text-cyan-700',
    green: 'bg-green-100 text-green-700',
    yellow: 'bg-yellow-100 text-yellow-700',
    red: 'bg-red-100 text-red-700',
    purple: 'bg-purple-100 text-purple-700',
    gray: 'bg-gray-100 text-gray-700',
    pink: 'bg-pink-100 text-pink-700',
  };

  return (
    <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${colorMap[color]}`}>
      {text}
    </span>
  );
};

// ============================================
// 📊 PAYMENT STATUS BADGE
// ============================================
const PaymentStatusBadge = ({ status }) => {
  const statusMap = {
    'Paid': { color: 'green', icon: CheckCircle, label: 'Paid ✓' },
    'Pending': { color: 'yellow', icon: ClockIcon, label: 'Pending' },
    'Not Paid': { color: 'gray', icon: CreditCard, label: 'Not Paid' },
    'Rejected': { color: 'red', icon: XCircle, label: 'Rejected ✗' },
  };

  const statusInfo = statusMap[status] || statusMap['Not Paid'];
  const IconComponent = statusInfo.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-${statusInfo.color}-100 text-${statusInfo.color}-700 border-2 border-${statusInfo.color}-200`}>
      <IconComponent className="w-3.5 h-3.5" />
      {statusInfo.label}
    </span>
  );
};

// ============================================
// 📊 ADMIN PAYMENT DROPDOWN
// ============================================
const AdminPaymentDropdown = ({ student, onActionSuccess }) => {
  const [processing, setProcessing] = useState(false);
  const [selectedAction, setSelectedAction] = useState('');

  const handleAdminAction = async () => {
    if (!selectedAction) {
      toast.error('Please select an action');
      return;
    }

    const actionLabels = {
      'approve': 'approve this payment',
      'reject': 'reject this payment',
      'request_new': 'request a new receipt'
    };

    if (!window.confirm(`Are you sure you want to ${actionLabels[selectedAction]}?`)) {
      return;
    }

    setProcessing(true);
    try {
      const response = await api.put(`/payments/admin/review/${student._id}`, {
        action: selectedAction
      });

      if (response.data.success) {
        const messages = {
          'approve': '✅ Payment approved successfully!',
          'reject': '❌ Payment rejected.',
          'request_new': '🔄 New receipt requested.'
        };
        toast.success(messages[selectedAction]);
        setSelectedAction('');
        onActionSuccess();
      }
    } catch (error) {
      console.error('Error updating payment:', error);
      toast.error(error.response?.data?.error || 'Failed to update payment status');
    } finally {
      setProcessing(false);
    }
  };

  const status = student.paymentStatus || 'Not Paid';

  if (status === 'Not Paid') {
    return <span className="text-gray-400 text-xs">No payment</span>;
  }

  return (
    <div className="flex items-center gap-1.5 ">
      <select
        value={selectedAction}
        onChange={(e) => setSelectedAction(e.target.value)}
        className="px-2 py-1 text-xs border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 bg-white min-w-[120px] transition "
        disabled={processing}
      >
        <option value="">Select Action</option>
        <option value="approve"> Approve</option>
        <option value="reject"> Reject</option>
        <option value="request_new"> Request New</option>
      </select>
      <button
        onClick={handleAdminAction}
        disabled={!selectedAction || processing}
        className="px-3 py-1 bg-cyan-600 text-white text-xs font-semibold rounded-lg hover:bg-cyan-700 transition disabled:opacity-50 whitespace-nowrap shadow-sm hover:shadow-md"
      >
        {processing ? '⏳' : 'Apply'}
      </button>
    </div>
  );
};

// ============================================
// 📊 STUDENT DETAIL PAGE
// ============================================

const StudentDetailPage = ({ student, onBack, onActionSuccess }) => {
  if (!student) return null;

  const isGraduated = student.academicStatus === 'Graduated' || student.grade === 'Graduated';

  const personalInfo = [
    { label: 'Full Name', value: student.name, icon: User },
    { label: 'Email', value: student.email, icon: Mail },
    { label: 'Phone', value: student.phone || student.parentPhone || '-', icon: Phone },
    { label: 'Gender', value: student.sex || '-', icon: Users },
    { label: 'Age', value: student.age || '-', icon: Calendar },
  ];

  const academicInfo = [
    { label: 'Roll Number', value: student.rollNumber || '-', icon: BookOpen },
    { label: 'Grade', value: student.grade || '-', icon: School },
    { label: 'Section', value: student.section || '-', icon: MapPin },
    { label: 'Program', value: student.programs || '-', icon: TrendingUp },
    { label: 'Academic Status', value: student.academicStatus || 'Active', icon: GraduationCap },
  ];

  const paymentInfo = [
    { label: 'Payment Status', value: student.paymentStatus || 'Not Paid', icon: CreditCard },
    { label: 'Amount Paid', value: student.paymentAmount ? `$${student.paymentAmount.toFixed(2)}` : '-', icon: Award },
    { label: 'Bank Name', value: student.paymentBank || '-', icon: School },
    { label: 'Transaction Ref', value: student.paymentRef || '-', icon: BookOpen },
    { label: 'Payment Date', value: student.paymentDate ? new Date(student.paymentDate).toLocaleDateString() : '-', icon: Calendar },
  ];

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=Poppins:wght@300;400;500;600;700&display=swap');
        
        .detail-container { animation: fadeIn 0.5s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        
        .detail-hero {
          background: linear-gradient(135deg, #0e7490 0%, #0891b2 50%, #22d3ee 100%);
          color: white;
          padding: 35px;
          border-radius: 15px;
          margin-bottom: 30px;
          box-shadow: 0 10px 40px rgba(8, 145, 178, 0.3);
        }
        
        .detail-back-btn {
          background: white;
          color: #0e7490;
          border: 2px solid #0e7490;
          padding: 10px 24px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .detail-back-btn:hover {
          background: #0e7490;
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(8, 145, 178, 0.3);
        }
        
        .detail-info-table {
          width: 100%;
          border-collapse: collapse;
          background: white;
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid #e2e8f0;
        }
        .detail-info-table th {
          background: linear-gradient(135deg, #0e7490, #0891b2);
          color: white;
          padding: 12px 16px;
          text-align: left;
          font-weight: 600;
          border: 1px solid #0c6a82;
        }
        .detail-info-table td {
          padding: 12px 16px;
          border: 1px solid #e2e8f0;
        }
        .detail-info-table tr:nth-child(even) td {
          background: #f8fafc;
        }
        .detail-info-table tr:hover td {
          background: #f0f9ff;
        }
        
        .detail-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }
      `}</style>

      <div className="detail-container">
        <button onClick={onBack} className="detail-back-btn mb-6">
          <ArrowLeft size={18} /> Back to Students
        </button>

        <div className="detail-hero">
          <div className="flex flex-wrap items-center gap-6">
            <Avatar name={student.name} image={student.profileImage} size={80} />
            <div>
              <h2 className="text-3xl font-bold">{student.name}</h2>
              <p className="text-cyan-100 mt-1">Roll No: {student.rollNumber || 'N/A'}</p>
              <div className="flex gap-2 mt-2 flex-wrap">
                <Badge text={student.grade || 'No Grade'} color="blue" />
                {isGraduated && <Badge text="🎓 Graduated" color="purple" />}
                {student.academicStatus === 'Active' && <Badge text="Active" color="green" />}
                <PaymentStatusBadge status={student.paymentStatus || 'Not Paid'} />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="detail-stats-grid">
          <div className="border rounded-xl p-5 text-center border-cyan-200 text-cyan-700 bg-cyan-50 transition-all hover:shadow-md">
            <User className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-2xl font-bold">{student.age || '-'}</p>
            <p className="text-xs font-semibold uppercase tracking-wider opacity-75">Age</p>
          </div>
          <div className={`border rounded-xl p-5 text-center ${isGraduated ? 'border-purple-200 text-purple-700 bg-purple-50' : 'border-green-200 text-green-700 bg-green-50'} transition-all hover:shadow-md`}>
            <GraduationCap className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-2xl font-bold">{student.academicStatus || 'Active'}</p>
            <p className="text-xs font-semibold uppercase tracking-wider opacity-75">Status</p>
          </div>
          <div className={`border rounded-xl p-5 text-center transition-all hover:shadow-md ${
            student.paymentStatus === 'Paid' ? 'border-green-200 text-green-700 bg-green-50' : 
            student.paymentStatus === 'Pending' ? 'border-yellow-200 text-yellow-700 bg-yellow-50' : 
            student.paymentStatus === 'Rejected' ? 'border-red-200 text-red-700 bg-red-50' :
            'border-gray-200 text-gray-700 bg-gray-50'
          }`}>
            <CreditCard className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-2xl font-bold">{student.paymentStatus || 'Not Paid'}</p>
            <p className="text-xs font-semibold uppercase tracking-wider opacity-75">Payment</p>
          </div>
          <div className="border rounded-xl p-5 text-center border-orange-200 text-orange-700 bg-orange-50 transition-all hover:shadow-md">
            <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-2xl font-bold">{formatDate(student.createdAt)}</p>
            <p className="text-xs font-semibold uppercase tracking-wider opacity-75">Joined</p>
          </div>
        </div>

        {/* Personal Information */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <User className="text-cyan-600" size={24} />
            Personal Information
          </h3>
          <table className="detail-info-table">
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
                        <IconComponent className="text-cyan-600" size={16} />
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

        {/* Academic Information */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <BookOpen className="text-cyan-600" size={24} />
            Academic Information
          </h3>
          <table className="detail-info-table">
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
                        <IconComponent className="text-cyan-600" size={16} />
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

        {/* Payment Information */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <CreditCard className="text-cyan-600" size={24} />
            Payment Information
          </h3>
          <table className="detail-info-table">
            <thead>
              <tr>
                <th>Field</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {paymentInfo.map((item, idx) => {
                const IconComponent = item.icon;
                return (
                  <tr key={idx}>
                    <td className="font-medium text-gray-700">
                      <div className="flex items-center gap-2">
                        <IconComponent className="text-cyan-600" size={16} />
                        {item.label}
                      </div>
                    </td>
                    <td>
                      {item.label === 'Payment Status' ? (
                        <PaymentStatusBadge status={item.value} />
                      ) : (
                        item.value
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Admin Payment Actions */}
          {student.paymentStatus && student.paymentStatus !== 'Not Paid' && (
            <div className="mt-4 p-5 bg-cyan-50 rounded-xl border-2 border-cyan-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-cyan-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Admin Payment Actions
                  </p>
                  <p className="text-xs text-cyan-600 mt-0.5">
                    Approve, Reject, or Request a new receipt
                  </p>
                </div>
                <AdminPaymentDropdown 
                  student={student} 
                  onActionSuccess={onActionSuccess}
                />
              </div>
            </div>
          )}

          {/* Status Messages */}
          {student.paymentStatus === 'Paid' && (
            <div className="mt-4 p-4 bg-green-50 rounded-xl border-2 border-green-200">
              <p className="text-sm font-semibold text-green-700 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Payment has been approved ✓
              </p>
            </div>
          )}

          {student.paymentStatus === 'Rejected' && (
            <div className="mt-4 p-4 bg-red-50 rounded-xl border-2 border-red-200">
              <p className="text-sm font-semibold text-red-700 flex items-center gap-2">
                <XCircle className="w-4 h-4" />
                Payment has been rejected
              </p>
              {student.paymentNote && (
                <p className="text-xs text-red-600 mt-1">
                  Note: {student.paymentNote}
                </p>
              )}
            </div>
          )}

          {student.paymentStatus === 'Pending' && (
            <div className="mt-4 p-4 bg-yellow-50 rounded-xl border-2 border-yellow-200">
              <p className="text-sm font-semibold text-yellow-700 flex items-center gap-2">
                <ClockIcon className="w-4 h-4" />
                Payment is pending review
              </p>
            </div>
          )}
        </div>

        {/* Payment Receipt */}
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Eye className="text-cyan-600" size={24} />
            Payment Receipt
          </h3>
          <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden shadow-sm">
            <div className="p-4 bg-gradient-to-r from-cyan-600 to-cyan-700 text-white border-b border-cyan-800">
              <h4 className="font-semibold flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Payment Receipt
              </h4>
            </div>
            <div className="p-6 flex justify-center bg-gray-50">
              {student.paymentReceipt ? (
                <img 
                  src={student.paymentReceipt} 
                  alt="Payment Receipt" 
                  className="max-w-full max-h-96 object-contain rounded-lg shadow-md border-2 border-gray-200"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/400x300/94a3b8/ffffff?text=No+Image';
                  }}
                />
              ) : (
                <div className="p-6 text-center">
                  <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm font-medium">No receipt uploaded</p>
                  <p className="text-gray-400 text-xs mt-1">Student has not submitted a payment receipt yet</p>
                </div>
              )}
            </div>
            {student.paymentNote && (
              <div className="p-4 bg-yellow-50 border-t-2 border-yellow-200">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold text-yellow-700">📝 Note:</span> {student.paymentNote}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// 📊 MAIN STUDENT PROFILE PAGE
// ============================================

const StudentProfilePage = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showDetailPage, setShowDetailPage] = useState(false);
  const [filterGrade, setFilterGrade] = useState('');
  const [filterProgram, setFilterProgram] = useState('');
  const [filterSex, setFilterSex] = useState('');
  const [filterSection, setFilterSection] = useState('');
  const [filterPaymentStatus, setFilterPaymentStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [studentsPerPage] = useState(50);
  const [sortOrder, setSortOrder] = useState('asc');
  const [paymentStats, setPaymentStats] = useState({
    total: 0,
    paid: 0,
    pending: 0,
    notPaid: 0,
    rejected: 0,
  });

  useEffect(() => {
    fetchAllStudents();
  }, []);

  const fetchAllStudents = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users/role/student');
      
      const studentsWithPayments = await Promise.all(
        response.data.map(async (student) => {
          try {
            const paymentRes = await api.get(`/payments/student/${student._id}/status`);
            return {
              ...student,
              paymentStatus: paymentRes.data.status || 'Not Paid',
              paymentAmount: paymentRes.data.amount,
              paymentBank: paymentRes.data.bankName,
              paymentRef: paymentRes.data.transactionRef,
              paymentDate: paymentRes.data.paymentDate,
              paymentReceipt: paymentRes.data.receiptUrl,
              paymentNote: paymentRes.data.adminNote
            };
          } catch (error) {
            return {
              ...student,
              paymentStatus: 'Not Paid'
            };
          }
        })
      );
      
      const activeStudents = studentsWithPayments.filter(student => 
        student.academicStatus !== 'Graduated' && 
        student.grade !== 'Graduated' &&
        student.academicStatus !== 'graduated'
      );
      
      const sortedStudents = activeStudents.sort((a, b) => {
        const nameA = a.name?.toLowerCase() || '';
        const nameB = b.name?.toLowerCase() || '';
        return nameA.localeCompare(nameB);
      });
      
      setStudents(sortedStudents);
      calculatePaymentStats(sortedStudents);
      toast.success(`Loaded ${sortedStudents.length} active students`);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to fetch students');
      const mockData = [
        { _id: '1', name: 'Abebe Kebede', email: 'abebe@example.com', grade: '9', section: 'A', sex: 'Male', age: 14, programs: 'Science', academicStatus: 'Active', rollNumber: '001', paymentStatus: 'Paid', paymentAmount: 2500, paymentBank: 'Chase Bank', paymentRef: 'CH-2026-001', paymentReceipt: 'https://via.placeholder.com/400x300/22c55e/ffffff?text=Receipt' },
        { _id: '2', name: 'Biruk Hailu', email: 'biruk@example.com', grade: '11', section: 'C', sex: 'Male', age: 16, programs: 'Physics', academicStatus: 'Active', rollNumber: '003', paymentStatus: 'Pending', paymentAmount: 1800, paymentBank: 'Bank of America', paymentRef: 'BOA-26-442', paymentReceipt: 'https://via.placeholder.com/400x300/ef4444/ffffff?text=Receipt' },
        { _id: '3', name: 'Eden Assefa', email: 'eden@example.com', grade: '10', section: 'B', sex: 'Female', age: 15, programs: 'Mathematics', academicStatus: 'Active', rollNumber: '006', paymentStatus: 'Not Paid' },
        { _id: '4', name: 'Meron Tesfaye', email: 'meron@example.com', grade: '10', section: 'B', sex: 'Female', age: 15, programs: 'Mathematics', academicStatus: 'Active', rollNumber: '002', paymentStatus: 'Paid', paymentAmount: 2000, paymentBank: 'Citi Bank', paymentRef: 'CITI-2026-003', paymentReceipt: 'https://via.placeholder.com/400x300/22c55e/ffffff?text=Receipt' },
        { _id: '5', name: 'Samuel Getachew', email: 'samuel@example.com', grade: '9', section: 'B', sex: 'Male', age: 14, programs: 'Biology', academicStatus: 'Active', rollNumber: '005', paymentStatus: 'Rejected', paymentAmount: 1500, paymentBank: 'Wells Fargo', paymentRef: 'WF-26-009', paymentReceipt: 'https://via.placeholder.com/400x300/94a3b8/ffffff?text=Receipt', paymentNote: '❌ Payment rejected. Please upload a valid receipt.' },
      ];
      setStudents(mockData);
      calculatePaymentStats(mockData);
    } finally {
      setLoading(false);
    }
  };

  const calculatePaymentStats = (studentsList) => {
    const stats = {
      total: studentsList.length,
      paid: 0,
      pending: 0,
      notPaid: 0,
      rejected: 0,
    };

    studentsList.forEach(student => {
      const status = student.paymentStatus || 'Not Paid';
      switch(status) {
        case 'Paid': stats.paid++; break;
        case 'Pending': stats.pending++; break;
        case 'Not Paid': stats.notPaid++; break;
        case 'Rejected': stats.rejected++; break;
        default: break;
      }
    });

    setPaymentStats(stats);
  };

  const refreshData = async () => {
    await fetchAllStudents();
    toast.success('Data refreshed');
  };

  const toggleSortOrder = () => {
    const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    setSortOrder(newOrder);
    const sorted = [...students].sort((a, b) => {
      const nameA = a.name?.toLowerCase() || '';
      const nameB = b.name?.toLowerCase() || '';
      if (newOrder === 'asc') {
        return nameA.localeCompare(nameB);
      } else {
        return nameB.localeCompare(nameA);
      }
    });
    setStudents(sorted);
  };

  const grades = [...new Set(students.map(s => s.grade).filter(Boolean))].sort();
  const programs = [...new Set(students.map(s => s.programs).filter(Boolean))].sort();
  const sections = [...new Set(students.map(s => s.section).filter(Boolean))].sort();
  const sexes = ['Male', 'Female', 'Other'];
  const paymentStatuses = ['Paid', 'Pending', 'Not Paid', 'Rejected'];

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         s.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         s.rollNumber?.toString().includes(searchTerm);
    const matchesGrade = filterGrade ? s.grade === filterGrade : true;
    const matchesProgram = filterProgram ? s.programs === filterProgram : true;
    const matchesSection = filterSection ? s.section === filterSection : true;
    const matchesSex = filterSex ? s.sex === filterSex : true;
    const matchesPayment = filterPaymentStatus ? (s.paymentStatus || 'Not Paid') === filterPaymentStatus : true;
    return matchesSearch && matchesGrade && matchesProgram && matchesSection && matchesSex && matchesPayment;
  });

  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent);
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);

  const handleViewDetails = (student) => {
    setSelectedStudent(student);
    setShowDetailPage(true);
  };

  const handleBackToList = () => {
    setShowDetailPage(false);
    setSelectedStudent(null);
  };

  const handleAdminActionSuccess = () => {
    fetchAllStudents();
  };

  // Show detail page if selected
  if (showDetailPage && selectedStudent) {
    return <StudentDetailPage student={selectedStudent} onBack={handleBackToList} onActionSuccess={handleAdminActionSuccess} />;
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=Poppins:wght@300;400;500;600;700&display=swap');
        
        .manage-container { animation: fadeIn 0.5s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        
        .manage-hero {
          background: linear-gradient(135deg, #0e7490 0%, #0891b2 50%, #22d3ee 100%);
          color: white;
          padding: 35px;
          border-radius: 15px;
          margin-bottom: 30px;
          box-shadow: 0 10px 40px rgba(8, 145, 178, 0.3);
        }
        .manage-hero-title { font-family: 'Playfair Display', serif; font-size: 36px; font-weight: 800; margin-bottom: 10px; }
        .manage-hero-subtitle { font-size: 16px; opacity: 0.9; }
        
        .manage-filter-box {
          background: white;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 24px;
          transition: all 0.3s;
        }
        .manage-filter-box:focus-within {
          border-color: #0891b2;
          box-shadow: 0 0 0 3px rgba(8, 145, 178, 0.1);
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }
        
        .table-container {
          background: white;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          overflow: hidden;
        }
        .table-header {
          background: linear-gradient(135deg, #0e7490, #0891b2);
          color: white;
        }
        .table-header th {
          padding: 12px 14px;
          text-align: left;
          font-weight: 600;
          font-size: 12px;
          border: 1px solid #0c6a82;
          white-space: nowrap;
        }
        .table-row td {
          padding: 10px 14px;
          border: 1px solid #e2e8f0;
          font-size: 13px;
        }
        .table-row:nth-child(even) td {
          background: #f8fafc;
        }
        .table-row:hover td {
          background: #f0f9ff;
        }
        
        .search-input-wrapper {
          position: relative;
        }
        .search-input-wrapper input {
          width: 100%;
          padding: 10px 16px 10px 42px;
          border: 2px solid #e2e8f0;
          border-radius: 10px;
          transition: all 0.3s;
          font-size: 14px;
        }
        .search-input-wrapper input:focus {
          border-color: #0891b2;
          outline: none;
          box-shadow: 0 0 0 3px rgba(8, 145, 178, 0.1);
        }
        .search-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
        }
        
        .btn-hero {
          background: white;
          color: #0e7490;
          border: 2px solid white;
          padding: 10px 20px;
          border-radius: 12px;
          font-weight: 700;
          transition: all 0.3s;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          cursor: pointer;
        }
        .btn-hero:hover {
          background: rgba(255,255,255,0.15);
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(255,255,255,0.2);
        }
        
        .table-action-btn {
          padding: 4px 12px;
          border-radius: 6px;
          font-weight: 600;
          font-size: 11px;
          transition: all 0.3s;
          border: none;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }
        .table-action-btn:hover {
          transform: translateY(-1px);
        }
        .table-action-btn-primary {
          background: linear-gradient(135deg, #0e7490, #0891b2);
          color: white;
        }
        .table-action-btn-primary:hover {
          box-shadow: 0 4px 12px rgba(8, 145, 178, 0.3);
        }
      `}</style>

      <div className="manage-container">
        {/* Hero Section */}
        <div className="manage-hero">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <Users className="w-8 h-8" />
                <h2 className="manage-hero-title">🎓 Active Students</h2>
              </div>
              <p className="manage-hero-subtitle">View and manage all active student profiles with payment status</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button onClick={toggleSortOrder} className="btn-hero" style={{background: 'white', color: '#7c3aed', borderColor: '#7c3aed'}}>
                {sortOrder === 'asc' ? '↑ A-Z' : '↓ Z-A'}
              </button>
              <button onClick={refreshData} className="btn-hero" style={{background: 'white', color: '#059669', borderColor: '#059669'}}>
                <RefreshCw size={18} /> Refresh
              </button>
              <button onClick={() => window.print()} className="btn-hero" style={{background: 'white', color: '#475569', borderColor: '#475569'}}>
                <Printer size={18} /> Print
              </button>
            </div>
          </div>
          <p className="text-cyan-100 mt-2 text-sm">
            Total Active Students: <span className="font-bold text-white">{students.length}</span>
          </p>
        </div>

        {/* Payment Stats */}
        <div className="stats-grid">
          <div className="border rounded-xl p-5 text-center border-cyan-200 text-cyan-700 bg-cyan-50 transition-all hover:shadow-md">
            <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-2xl font-bold">{paymentStats.total}</p>
            <p className="text-xs font-semibold uppercase tracking-wider opacity-75">Total Students</p>
          </div>
          <div className="border rounded-xl p-5 text-center border-green-200 text-green-700 bg-green-50 transition-all hover:shadow-md">
            <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-2xl font-bold">{paymentStats.paid}</p>
            <p className="text-xs font-semibold uppercase tracking-wider opacity-75">Paid</p>
          </div>
          <div className="border rounded-xl p-5 text-center border-yellow-200 text-yellow-700 bg-yellow-50 transition-all hover:shadow-md">
            <ClockIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-2xl font-bold">{paymentStats.pending}</p>
            <p className="text-xs font-semibold uppercase tracking-wider opacity-75">Pending</p>
          </div>
          <div className="border rounded-xl p-5 text-center border-gray-200 text-gray-700 bg-gray-50 transition-all hover:shadow-md">
            <CreditCard className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-2xl font-bold">{paymentStats.notPaid}</p>
            <p className="text-xs font-semibold uppercase tracking-wider opacity-75">Not Paid</p>
          </div>
          <div className="border rounded-xl p-5 text-center border-red-200 text-red-700 bg-red-50 transition-all hover:shadow-md">
            <XCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-2xl font-bold">{paymentStats.rejected}</p>
            <p className="text-xs font-semibold uppercase tracking-wider opacity-75">Rejected</p>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="manage-filter-box">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 search-input-wrapper">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Search by name, email, roll..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <select
              value={filterGrade}
              onChange={(e) => {
                setFilterGrade(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-cyan-500 focus:outline-none bg-white transition"
            >
              <option value="">All Grades</option>
              {grades.map(grade => (
                <option key={grade} value={grade}>{grade}</option>
              ))}
            </select>
            <select
              value={filterProgram}
              onChange={(e) => {
                setFilterProgram(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-cyan-500 focus:outline-none bg-white transition"
            >
              <option value="">All Programs</option>
              {programs.map(program => (
                <option key={program} value={program}>{program}</option>
              ))}
            </select>
            <select
              value={filterSection}
              onChange={(e) => {
                setFilterSection(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-cyan-500 focus:outline-none bg-white transition"
            >
              <option value="">All Sections</option>
              {sections.map(section => (
                <option key={section} value={section}>{section}</option>
              ))}
            </select>
            <select
              value={filterPaymentStatus}
              onChange={(e) => {
                setFilterPaymentStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-cyan-500 focus:outline-none bg-white transition"
            >
              <option value="">All Status</option>
              {paymentStatuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
          <div className="mt-3 text-sm text-gray-500">
            Found {filteredStudents.length} active student{filteredStudents.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Students Table */}
        <div className="table-container">
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
            </div>
          ) : currentStudents.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-lg font-semibold">No active students found</p>
              <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="table-header">
                  <tr>
                    <th className="text-center">Roll</th>
                    <th className="text-center">Photo</th>
                    <th className="text-left cursor-pointer hover:bg-cyan-700 transition" onClick={toggleSortOrder}>
                      Student {sortOrder === 'asc' ? '↑' : '↓'}
                    </th>
                    <th className="text-left">Email</th>
                    <th className="text-center">Gender</th>
                    <th className="text-center">Age</th>
                    <th className="text-center">Grade</th>
                    <th className="text-center">Section</th>
                    <th className="text-center">Program</th>
                    <th className="text-center">Parent Phone</th>
                    <th className="text-center">Payment</th>
                    <th className="text-center ">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentStudents.map((student, index) => (
                    <tr key={student._id || index} className="table-row">
                      <td className="text-center font-medium text-gray-700">
                        {student.rollNumber || '-'}
                      </td>
                      <td className="text-center ">
                        <Avatar name={student.name} image={student.profileImage} size={35} />
                      </td>
                      <td className="font-medium text-gray-900">
                        <button
                          onClick={() => handleViewDetails(student)}
                          className="hover:text-cyan-600 hover:underline transition  whitespace-nowrap min-w-[42px]"
                        >
                          {student.name}
                        </button>
                      </td>
                      <td className="text-gray-700">{student.studentId || '-'}</td>
                      <td className="text-center text-gray-700">{student.sex || '-'}</td>
                      <td className="text-center text-gray-700">{student.age || '-'}</td>
                      <td className="text-center  whitespace-nowrap min-w-[42px]">
                        <Badge text={student.grade || '-'} color="blue" />
                      </td>
                      <td className="text-center">
                        <Badge text={student.section || '-'} color="green" />
                      </td>
                      <td className="text-center  whitespace-nowrap min-w-[42px]">
                        {student.programs && <Badge text={student.programs} color="purple" />}
                      </td>
                      <td className="text-center text-gray-700">{student.parentPhone || '-'}</td>
                      <td className="text-center whitespace-nowrap min-w-[42px]">
                        <PaymentStatusBadge status={student.paymentStatus || 'Not Paid'} />
                      </td>
                      <td className="text-center   ">
                       <div className="flex items-center gap-3">
  <button
    onClick={() => handleViewDetails(student)}
    className="table-action-btn table-action-btn-primary"
  >
    <Eye size={12} /> View
  </button>

  {student.paymentStatus && student.paymentStatus !== 'Not Paid' && (
    <AdminPaymentDropdown
      student={student}
      onActionSuccess={handleAdminActionSuccess}
    />
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-3 mt-6">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 font-semibold hover:bg-gray-300 transition"
            >
              Previous
            </button>
            <span className="px-6 py-3 font-bold text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 font-semibold hover:bg-gray-300 transition"
            >
              Next
            </button>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white border-2 border-cyan-200 rounded-xl p-4 text-center">
            <p className="text-xs font-bold text-cyan-700 uppercase">Active Students</p>
            <p className="text-2xl font-bold text-cyan-700">{students.length}</p>
          </div>
          <div className="bg-white border-2 border-blue-200 rounded-xl p-4 text-center">
            <p className="text-xs font-bold text-blue-700 uppercase">Grades</p>
            <p className="text-2xl font-bold text-blue-700">
              {[...new Set(students.map(s => s.grade).filter(Boolean))].length}
            </p>
          </div>
          <div className="bg-white border-2 border-purple-200 rounded-xl p-4 text-center">
            <p className="text-xs font-bold text-purple-700 uppercase">Programs</p>
            <p className="text-2xl font-bold text-purple-700">
              {[...new Set(students.map(s => s.programs).filter(Boolean))].length}
            </p>
          </div>
          <div className="bg-white border-2 border-orange-200 rounded-xl p-4 text-center">
            <p className="text-xs font-bold text-orange-700 uppercase">Sections</p>
            <p className="text-2xl font-bold text-orange-700">
              {[...new Set(students.map(s => s.section).filter(Boolean))].length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfilePage;