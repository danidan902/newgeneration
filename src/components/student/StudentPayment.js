// StudentPayment.js
import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { 
  CreditCard, Upload, CheckCircle, Clock, XCircle, 
  AlertCircle, Eye, FileText, ArrowLeft, 
  FileImage, Trash2, ZoomIn, X,
  User, Calendar, RefreshCw, File, 
  ChevronLeft, School, MapPin, Mail, Phone,
  Award, TrendingUp, Download, Printer,
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
const PaymentStatusBadge = ({ status, size = 'md' }) => {
  const statusMap = {
    'Paid': { 
      color: 'green', 
      icon: CheckCircle, 
      label: 'Paid ✓',
      bg: 'bg-green-100',
      text: 'text-green-700',
      border: 'border-green-300'
    },
    'Pending': { 
      color: 'yellow', 
      icon: Clock, 
      label: 'Pending Review',
      bg: 'bg-yellow-100',
      text: 'text-yellow-700',
      border: 'border-yellow-300'
    },
    'Not Paid': { 
      color: 'gray', 
      icon: CreditCard, 
      label: 'Not Paid',
      bg: 'bg-gray-100',
      text: 'text-gray-700',
      border: 'border-gray-300'
    },
    'Rejected': { 
      color: 'red', 
      icon: XCircle, 
      label: 'Rejected ✗',
      bg: 'bg-red-100',
      text: 'text-red-700',
      border: 'border-red-300'
    },
    'Request New': { 
      color: 'purple', 
      icon: AlertCircle, 
      label: 'Request New',
      bg: 'bg-purple-100',
      text: 'text-purple-700',
      border: 'border-purple-300'
    },
  };

  const statusInfo = statusMap[status] || statusMap['Not Paid'];
  const IconComponent = statusInfo.icon;
  const sizeClasses = size === 'lg' ? 'px-4 py-2 text-sm' : 'px-3 py-1 text-xs';

  return (
    <span className={`inline-flex items-center gap-1.5 ${sizeClasses} rounded-full font-semibold ${statusInfo.bg} ${statusInfo.text} border-2 ${statusInfo.border}`}>
      <IconComponent className={`${size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'}`} />
      {statusInfo.label}
    </span>
  );
};

// ============================================
// 📊 STAT CARD
// ============================================
const StatCard = ({ icon: Icon, label, value, color = 'blue' }) => {
  const colorMap = {
    blue: 'border-cyan-200 text-cyan-700 bg-cyan-50',
    green: 'border-green-200 text-green-700 bg-green-50',
    purple: 'border-purple-200 text-purple-700 bg-purple-50',
    orange: 'border-orange-200 text-orange-700 bg-orange-50',
    red: 'border-red-200 text-red-700 bg-red-50',
    yellow: 'border-yellow-200 text-yellow-700 bg-yellow-50',
    gray: 'border-gray-200 text-gray-700 bg-gray-50',
  };

  return (
    <div className={`border rounded-xl p-5 text-center ${colorMap[color]} transition-all hover:shadow-md`}>
      <Icon className="w-8 h-8 mx-auto mb-2 opacity-50" />
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs font-semibold uppercase tracking-wider opacity-75">{label}</p>
    </div>
  );
};

// ============================================
// 📊 MAIN STUDENT PAYMENT COMPONENT (Full Page)
// ============================================

const StudentPayment = () => {
  const [student, setStudent] = useState(null);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [error, setError] = useState(null);
  const [studentId, setStudentId] = useState(null);
  
  // Upload form state
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    bankName: '',
    transactionRef: '',
    paymentDate: new Date().toISOString().split('T')[0],
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);

  // Get student ID from localStorage
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const id = userData._id || userData.id;
    if (id) {
      setStudentId(id);
      fetchStudentData(id);
    } else {
      setLoading(false);
      setError('Student ID not found. Please log in again.');
    }
  }, []);

  const fetchStudentData = async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching student data for ID:', id);
      
      // Fetch student profile
      try {
        const studentRes = await api.get(`/users/${id}`);
        console.log('Student data:', studentRes.data);
        setStudent(studentRes.data);
      } catch (err) {
        console.error('Failed to fetch student:', err);
        setStudent({ name: 'Student', email: '' });
      }

      // Fetch payment status
      try {
        const paymentRes = await api.get(`/payments/student/${id}/status`);
        console.log('Payment status:', paymentRes.data);
        setPayment(paymentRes.data);
      } catch (paymentError) {
        console.log('No payment found:', paymentError);
        setPayment({ status: 'Not Paid' });
      }

      // Fetch payment history
      try {
        const historyRes = await api.get(`/payments/student/${id}/history`);
        console.log('Payment history:', historyRes.data);
        setPaymentHistory(historyRes.data.data || []);
      } catch (historyError) {
        console.log('No payment history:', historyError);
        setPaymentHistory([]);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load payment data. Please try again.');
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const viewReceipt = (receiptUrl) => {
    if (receiptUrl) {
      window.open(receiptUrl, '_blank');
    }
  };

  const getFileIcon = (filename) => {
    if (!filename) return <File className="w-4 h-4" />;
    const ext = filename.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
      return <FileImage className="w-4 h-4 text-blue-500" />;
    } else if (ext === 'pdf') {
      return <Upload className="w-4 h-4 text-red-500" />;
    }
    return <File className="w-4 h-4 text-gray-500" />;
  };

  // ============================================
  // 📊 UPLOAD FORM HANDLERS
  // ============================================

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const validateAndSetFile = (file) => {
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
    const fileExtension = file.name.split('.').pop().toLowerCase();
    const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf'];
    
    if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension)) {
      toast.error('Please upload an image (JPG, PNG, GIF, WEBP) or PDF file');
      return;
    }

    setSelectedFile(file);
    setUploadProgress(0);

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewImage(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setPreviewImage(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.bankName) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!selectedFile) {
      toast.error('Please select a receipt file');
      return;
    }

    setUploadLoading(true);
    try {
      const uploadData = new FormData();
      uploadData.append('studentId', studentId);
      uploadData.append('amount', formData.amount);
      uploadData.append('bankName', formData.bankName);
      uploadData.append('transactionRef', formData.transactionRef || 'N/A');
      uploadData.append('paymentDate', formData.paymentDate);
      uploadData.append('receipt', selectedFile);

      const response = await api.post('/payments/upload', uploadData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          }
        }
      });
      
      if (response.data.success) {
        toast.success('✅ Payment receipt uploaded successfully!');
        setShowUploadForm(false);
        setFormData({
          amount: '',
          bankName: '',
          transactionRef: '',
          paymentDate: new Date().toISOString().split('T')[0],
        });
        setSelectedFile(null);
        setPreviewImage(null);
        setUploadProgress(0);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        fetchStudentData(studentId);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.error || 'Failed to upload receipt');
    } finally {
      setUploadLoading(false);
    }
  };

  const viewFullPreview = () => {
    if (previewImage) {
      window.open(previewImage, '_blank');
    } else if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      window.open(url, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-cyan-200 border-t-cyan-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold text-lg">Loading payment portal...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center border-2 border-red-200">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Error Loading Payment</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => studentId && fetchStudentData(studentId)}
            className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-xl transition shadow-lg hover:shadow-xl flex items-center justify-center gap-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50 p-4 md:p-6">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=Poppins:wght@300;400;500;600;700&display=swap');
        
        .payment-container { animation: fadeIn 0.5s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        
        .payment-hero {
          background: linear-gradient(135deg, #0e7490 0%, #0891b2 50%, #22d3ee 100%);
          color: white;
          padding: 35px;
          border-radius: 15px;
          margin-bottom: 30px;
          box-shadow: 0 10px 40px rgba(8, 145, 178, 0.3);
        }
        .payment-hero-title { font-family: 'Playfair Display', serif; font-size: 36px; font-weight: 800; margin-bottom: 10px; }
        .payment-hero-subtitle { font-size: 16px; opacity: 0.9; }
        
        .payment-card {
          background: white;
          border: 2px solid #e2e8f0;
          border-radius: 16px;
          padding: 24px;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(0,0,0,0.06);
          position: relative;
          overflow: hidden;
        }
        .payment-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #0e7490, #22d3ee);
        }
        .payment-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 30px rgba(8, 145, 178, 0.15);
          border-color: #0891b2;
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
          padding: 12px 16px;
          text-align: left;
          font-weight: 600;
          font-size: 12px;
          border: 1px solid #0c6a82;
          white-space: nowrap;
        }
        .table-row td {
          padding: 12px 16px;
          border: 1px solid #e2e8f0;
          font-size: 13px;
        }
        .table-row:nth-child(even) td {
          background: #f8fafc;
        }
        .table-row:hover td {
          background: #f0f9ff;
        }
        
        .upload-area {
          border: 2px dashed #e2e8f0;
          border-radius: 12px;
          padding: 32px;
          text-align: center;
          transition: all 0.3s;
          cursor: pointer;
        }
        .upload-area:hover {
          border-color: #0891b2;
          background: #f0f9ff;
        }
        .upload-area.drag-active {
          border-color: #0891b2;
          background: #e0f2fe;
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
        
        .btn-primary-class {
          background: linear-gradient(135deg, #0e7490, #0891b2);
          color: white;
          padding: 8px 20px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 13px;
          transition: all 0.3s;
          border: none;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .btn-primary-class:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(8, 145, 178, 0.3);
        }
        
        .btn-success-class {
          background: linear-gradient(135deg, #059669, #10b981);
          color: white;
          padding: 8px 20px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 13px;
          transition: all 0.3s;
          border: none;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .btn-success-class:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(16, 185, 129, 0.3);
        }
        
        .btn-danger-class {
          background: linear-gradient(135deg, #dc2626, #ef4444);
          color: white;
          padding: 8px 20px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 13px;
          transition: all 0.3s;
          border: none;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .btn-danger-class:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(239, 68, 68, 0.3);
        }
        
        .btn-gray-class {
          background: #e2e8f0;
          color: #475569;
          padding: 8px 20px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 13px;
          transition: all 0.3s;
          border: none;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .btn-gray-class:hover {
          background: #cbd5e1;
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }
      `}</style>

      <div className="payment-container max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="payment-hero">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <CreditCard className="w-8 h-8" />
                <h2 className="payment-hero-title"> Payment Portal</h2>
              </div>
              <p className="payment-hero-subtitle">Manage your payment receipts and track status</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => studentId && fetchStudentData(studentId)}
                className="btn-hero"
                style={{background: 'rgba(255,255,255,0.2)', color: 'white', borderColor: 'rgba(255,255,255,0.3)'}}
              >
                <RefreshCw size={18} /> Refresh
              </button>
              <button
                onClick={() => window.print()}
                className="btn-hero"
                style={{background: 'rgba(255,255,255,0.15)', color: 'white', borderColor: 'rgba(255,255,255,0.2)'}}
              >
                <Printer size={18} /> Print
              </button>
            </div>
          </div>
        </div>

        {/* Student Profile Card */}
        <div className="payment-card mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <Avatar name={student?.name} image={student?.profileImage} size={80} />
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-gray-900">{student?.name || 'Student'}</h2>
                <PaymentStatusBadge status={payment?.status || 'Not Paid'} size="lg" />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Roll Number</p>
                  <p className="font-semibold text-gray-800">{student?.rollNumber || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Grade</p>
                  <p className="font-semibold text-gray-800">{student?.grade || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Section</p>
                  <p className="font-semibold text-gray-800">{student?.section || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Email</p>
                  <p className="font-semibold text-gray-800 truncate">{student?.email || '-'}</p>
                </div>
              </div>
            </div>
            {!showUploadForm && (
              <button
                onClick={() => setShowUploadForm(true)}
                className="btn-success-class px-6 py-3 text-base whitespace-nowrap"
              >
                <Upload className="w-4 h-4" />
                Upload Receipt
              </button>
            )}
          </div>
        </div>

        {/* Upload Form - Full Page */}
        {showUploadForm && (
          <div className="payment-card mb-6 border-cyan-300">
            <div className="flex justify-between items-center mb-4 pb-4 border-b-2 border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-green-700 rounded-xl flex items-center justify-center">
                  <Upload className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Upload Payment Receipt</h3>
                  <p className="text-sm text-gray-500">Upload receipt image or PDF file</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowUploadForm(false);
                  setSelectedFile(null);
                  setPreviewImage(null);
                  setUploadProgress(0);
                }}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Amount Paid ($) *
                  </label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    placeholder="Enter amount"
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-cyan-500 focus:outline-none transition"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Bank Name *
                  </label>
                  <input
                    type="text"
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleChange}
                    placeholder="Enter bank name"
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-cyan-500 focus:outline-none transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Transaction Reference
                  </label>
                  <input
                    type="text"
                    name="transactionRef"
                    value={formData.transactionRef}
                    onChange={handleChange}
                    placeholder="Enter transaction reference"
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-cyan-500 focus:outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Payment Date
                  </label>
                  <input
                    type="date"
                    name="paymentDate"
                    value={formData.paymentDate}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-cyan-500 focus:outline-none transition"
                  />
                </div>
              </div>

              {/* File Upload Area */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Receipt File *
                </label>
                
                {!selectedFile ? (
                  <div
                    className={`upload-area ${dragActive ? 'drag-active' : ''}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 font-medium">
                      Drag & drop your receipt here
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      or click to browse files
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      Supported formats: JPG, PNG, GIF, WEBP, PDF (Max 10MB)
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,image/*,application/pdf"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="border-2 border-cyan-200 rounded-lg p-4 bg-cyan-50">
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0">
                          {previewImage ? (
                            <img 
                              src={previewImage} 
                              alt="Preview" 
                              className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200"
                            />
                          ) : (
                            <div className="w-20 h-20 flex items-center justify-center bg-white rounded-lg border-2 border-gray-200">
                              <Upload className="w-10 h-10 text-red-500" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">{selectedFile.name}</p>
                          <p className="text-xs text-gray-500">
                            {(selectedFile.size / 1024).toFixed(1)} KB
                          </p>
                          <p className="text-xs text-gray-400 uppercase">
                            {selectedFile.type || selectedFile.name.split('.').pop()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={viewFullPreview}
                            className="p-2 bg-white rounded-lg hover:bg-gray-100 transition shadow-sm"
                            title="Preview"
                          >
                            <ZoomIn className="w-4 h-4 text-gray-600" />
                          </button>
                          <button
                            type="button"
                            onClick={removeFile}
                            className="p-2 bg-red-100 hover:bg-red-200 rounded-lg transition"
                            title="Remove"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {uploadProgress > 0 && uploadProgress < 100 && (
                      <div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-cyan-600 h-2.5 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{uploadProgress}% uploaded</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {previewImage && (
                <div className="mt-2">
                  <p className="text-sm font-semibold text-gray-700 mb-1">Preview:</p>
                  <div className="relative inline-block">
                    <img 
                      src={previewImage} 
                      alt="Receipt Preview" 
                      className="max-w-full max-h-64 object-contain rounded-lg border-2 border-gray-200"
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t-2 border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowUploadForm(false);
                    setSelectedFile(null);
                    setPreviewImage(null);
                    setUploadProgress(0);
                  }}
                  className="flex-1 btn-gray-class py-3 text-base justify-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadLoading || !selectedFile}
                  className="flex-1 btn-success-class py-3 text-base justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploadLoading ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      {uploadProgress < 100 ? `Uploading ${uploadProgress}%` : 'Processing...'}
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Submit Receipt
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Payment Stats */}
        <div className="stats-grid">
          <StatCard icon={CreditCard} label="Current Status" value={payment?.status || 'Not Paid'} color={payment?.status === 'Paid' ? 'green' : payment?.status === 'Pending' ? 'yellow' : payment?.status === 'Rejected' ? 'red' : 'gray'} />
          <StatCard icon={Award} label="Amount Paid" value={payment?.amount ? `$${payment.amount.toFixed(2)}` : '$0.00'} color="blue" />
          <StatCard icon={Clock} label="Total Payments" value={paymentHistory.length} color="purple" />
          <StatCard icon={TrendingUp} label="Latest Payment" value={paymentHistory.length > 0 ? formatDate(paymentHistory[0]?.paymentDate || paymentHistory[0]?.createdAt) : '-'} color="orange" />
        </div>

        {/* Payment History Table */}
        <div className="table-container">
          <div className="p-4 border-b-2 border-gray-200 bg-gradient-to-r from-cyan-50 to-blue-50">
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Clock className="w-5 h-5 text-cyan-600" />
              Payment History
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({paymentHistory.length} records)
              </span>
            </h3>
          </div>

          {paymentHistory.length === 0 ? (
            <div className="p-16 text-center">
              <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-semibold">No payment records found</p>
              <p className="text-gray-400 text-sm mt-1">Upload your first payment receipt</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="table-header">
                  <tr>
                    <th className="text-center">#</th>
                    <th className="text-left">Date</th>
                    <th className="text-center">Amount</th>
                    <th className="text-left">Bank</th>
                    <th className="text-left">Reference</th>
                    <th className="text-center">Status</th>
                    <th className="text-center">Receipt</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentHistory.map((record, index) => (
                    <tr key={record._id || index} className="table-row">
                      <td className="text-center font-medium text-gray-700">
                        {index + 1}
                      </td>
                      <td className="text-gray-700">
                        {formatDate(record.paymentDate || record.createdAt)}
                      </td>
                      <td className="text-center font-semibold text-gray-900">
                        ${(record.amount || 0).toFixed(2)}
                      </td>
                      <td className="text-gray-700">
                        {record.bankName || '-'}
                      </td>
                      <td className="text-gray-700 font-mono text-xs">
                        {record.transactionRef || '-'}
                      </td>
                      <td className="text-center">
                        <PaymentStatusBadge status={record.status || 'Pending'} />
                      </td>
                      <td className="text-center">
                        {record.receiptUrl ? (
                          <button
                            onClick={() => viewReceipt(record.receiptUrl)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-cyan-100 hover:bg-cyan-200 text-cyan-700 rounded-lg transition text-sm font-medium"
                          >
                            {getFileIcon(record.receiptUrl)}
                            View
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400">No file</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Summary Footer */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border-2 border-cyan-200 rounded-xl p-4 text-center">
            <p className="text-xs font-bold text-cyan-700 uppercase">Total Paid</p>
            <p className="text-2xl font-bold text-cyan-700">
              ${paymentHistory.reduce((sum, r) => sum + (r.amount || 0), 0).toFixed(2)}
            </p>
          </div>
          <div className="bg-white border-2 border-green-200 rounded-xl p-4 text-center">
            <p className="text-xs font-bold text-green-700 uppercase">Successful Payments</p>
            <p className="text-2xl font-bold text-green-700">
              {paymentHistory.filter(r => r.status === 'Paid').length}
            </p>
          </div>
          <div className="bg-white border-2 border-purple-200 rounded-xl p-4 text-center">
            <p className="text-xs font-bold text-purple-700 uppercase">Pending Review</p>
            <p className="text-2xl font-bold text-purple-700">
              {paymentHistory.filter(r => r.status === 'Pending').length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentPayment;