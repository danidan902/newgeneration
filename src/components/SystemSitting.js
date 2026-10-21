import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';

const SystemSettings = () => {
  const [activeTab, setActiveTab] = useState('school');
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    schoolInfo: {
      name: '',
      logo: '',
      address: '',
      phone: '',
      email: '',
      website: '',
      principalName: '',
      establishmentYear: ''
    },
    academicSettings: {
      academicYear: '',
      semester: '1',
      term: '1',
      examType: 'Quarterly',
      gradingSystem: 'Percentage',
      attendanceRequired: 75
    },
    securitySettings: {
      minPasswordLength: 6,
      allowMultipleLogin: false,
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      lockoutDuration: 30,
      twoFactorAuth: false
    },
    userManagement: {
      defaultRole: 'student',
      allowSelfRegistration: false,
      maxStudentsPerClass: 50,
      maxTeachersPerClass: 5,
      requireAdminApproval: true,
      autoGeneratePassword: true
    },
    appearance: {
      theme: 'light',
      primaryColor: '#3B82F6',
      sidebarColor: '#1F2937',
      fontSize: 'medium',
      compactMode: false
    },
    generalSettings: {
      language: 'english',
      timezone: 'Africa/Addis_Ababa',
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '24h',
      weekStartDay: 'Monday'
    },
    backupSettings: {
      autoBackup: false,
      backupFrequency: 'weekly',
      backupTime: '00:00',
      retentionDays: 30
    },
    notificationSettings: {
      emailNotifications: true,
      smsAlerts: false,
      attendanceAlerts: true,
      examResultAlerts: true,
      paymentReminders: false,
      adminEmail: ''
    }
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/settings');
      if (response.data) {
        setSettings(prev => ({
          ...prev,
          ...response.data,
          schoolInfo: { ...prev.schoolInfo, ...response.data.schoolInfo },
          academicSettings: { ...prev.academicSettings, ...response.data.academicSettings },
          securitySettings: { ...prev.securitySettings, ...response.data.securitySettings },
          userManagement: { ...prev.userManagement, ...response.data.userManagement },
          appearance: { ...prev.appearance, ...response.data.appearance },
          generalSettings: { ...prev.generalSettings, ...response.data.generalSettings },
          backupSettings: { ...prev.backupSettings, ...response.data.backupSettings },
          notificationSettings: { ...prev.notificationSettings, ...response.data.notificationSettings }
        }));
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.post('/settings', settings);
      toast.success('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleBackup = async () => {
    try {
      const response = await api.get('/backup/download');
      const url = window.URL.createObjectURL(new Blob([JSON.stringify(response.data)], { type: 'application/json' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `backup_${new Date().toISOString()}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Backup downloaded successfully!');
    } catch (error) {
      toast.error('Backup failed');
    }
  };

  const handleRestore = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const backupData = JSON.parse(e.target.result);
        await api.post('/backup/restore', backupData);
        toast.success('System restored successfully!');
        fetchSettings();
      } catch (error) {
        toast.error('Restore failed');
      }
    };
    reader.readAsText(file);
  };

  const tabs = [
    { id: 'school', name: ' School Info' },
    { id: 'academic', name: ' Academic' },
    { id: 'security', name: ' Security' },
    { id: 'user', name: ' User Management' },
    { id: 'appearance', name: ' Appearance' },
    { id: 'general', name: ' General' },
    { id: 'backup', name: ' Backup' },
    { id: 'notification', name: ' Notifications' }
  ];

  const renderTabContent = () => {
    switch(activeTab) {
      case 'school':
        return <SchoolInfoTab settings={settings} setSettings={setSettings} />;
      case 'academic':
        return <AcademicTab settings={settings} setSettings={setSettings} />;
      case 'security':
        return <SecurityTab settings={settings} setSettings={setSettings} />;
      case 'user':
        return <UserManagementTab settings={settings} setSettings={setSettings} />;
      case 'appearance':
        return <AppearanceTab settings={settings} setSettings={setSettings} />;
      case 'general':
        return <GeneralTab settings={settings} setSettings={setSettings} />;
      case 'backup':
        return <BackupTab onBackup={handleBackup} onRestore={handleRestore} settings={settings} setSettings={setSettings} />;
      case 'notification':
        return <NotificationTab settings={settings} setSettings={setSettings} />;
      default:
        return <SchoolInfoTab settings={settings} setSettings={setSettings} />;
    }
  };
  return (
    <div>
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 mb-6 rounded-lg">
        <h2 className="text-2xl font-bold">⚙️ System Settings</h2>
        <p className="text-purple-100 mt-1">Configure your school management system</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="border-b overflow-x-auto">
          <div className="flex min-w-max">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {renderTabContent()}
        </div>

        <div className="border-t p-4 bg-gray-50 rounded-b-lg">
          <button
            onClick={handleSave}
            disabled={loading}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 transition-colors"
          >
            {loading ? 'Saving...' : '💾 Save All Settings'}
          </button>
        </div>
      </div>
    </div>
  );
};

// School Information Tab
const SchoolInfoTab = ({ settings, setSettings }) => {
  const updateField = (field, value) => {
    setSettings({
      ...settings,
      schoolInfo: { ...settings.schoolInfo, [field]: value }
    });
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold mb-4">🏫 School Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">School Name</label>
          <input
            type="text"
            value={settings.schoolInfo?.name || ''}
            onChange={(e) => updateField('name', e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Enter school name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Phone Number</label>
          <input
            type="text"
            value={settings.schoolInfo?.phone || ''}
            onChange={(e) => updateField('phone', e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="+2519xxxxxxxx"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Email</label>
          <input
            type="email"
            value={settings.schoolInfo?.email || ''}
            onChange={(e) => updateField('email', e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="school@example.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Website</label>
          <input
            type="text"
            value={settings.schoolInfo?.website || ''}
            onChange={(e) => updateField('website', e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="www.school.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Principal Name</label>
          <input
            type="text"
            value={settings.schoolInfo?.principalName || ''}
            onChange={(e) => updateField('principalName', e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Establishment Year</label>
          <input
            type="text"
            value={settings.schoolInfo?.establishmentYear || ''}
            onChange={(e) => updateField('establishmentYear', e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="2000"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-2">Address</label>
          <textarea
            value={settings.schoolInfo?.address || ''}
            onChange={(e) => updateField('address', e.target.value)}
            className="w-full p-2 border rounded"
            rows="3"
            placeholder="Full school address"
          />
        </div>
      </div>
    </div>
  );
};

// Academic Settings Tab
const AcademicTab = ({ settings, setSettings }) => {
  const updateField = (field, value) => {
    setSettings({
      ...settings,
      academicSettings: { ...settings.academicSettings, [field]: value }
    });
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold mb-4">📅 Academic Settings</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">Academic Year</label>
          <input
            type="text"
            value={settings.academicSettings?.academicYear || ''}
            onChange={(e) => updateField('academicYear', e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="2024/2025"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Semester</label>
          <select
            value={settings.academicSettings?.semester || '1'}
            onChange={(e) => updateField('semester', e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="1">Semester 1</option>
            <option value="2">Semester 2</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Term</label>
          <select
            value={settings.academicSettings?.term || '1'}
            onChange={(e) => updateField('term', e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="1">Term 1</option>
            <option value="2">Term 2</option>
            <option value="3">Term 3</option>
            <option value="4">Term 4</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Exam Type</label>
          <select
            value={settings.academicSettings?.examType || 'Quarterly'}
            onChange={(e) => updateField('examType', e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="Quarterly">Quarterly</option>
            <option value="Semester">Semester</option>
            <option value="Terminal">Terminal</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Grading System</label>
          <select
            value={settings.academicSettings?.gradingSystem || 'Percentage'}
            onChange={(e) => updateField('gradingSystem', e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="Percentage">Percentage (%)</option>
            <option value="GPA">GPA (4.0)</option>
            <option value="Letter">Letter Grade (A-F)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Required Attendance (%)</label>
          <input
            type="number"
            value={settings.academicSettings?.attendanceRequired || 75}
            onChange={(e) => updateField('attendanceRequired', parseInt(e.target.value))}
            className="w-full p-2 border rounded"
            min="0"
            max="100"
          />
        </div>
      </div>
    </div>
  );
};

// Security Settings Tab
const SecurityTab = ({ settings, setSettings }) => {
  const updateField = (field, value) => {
    setSettings({
      ...settings,
      securitySettings: { ...settings.securitySettings, [field]: value }
    });
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold mb-4">🔐 Security Settings</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">Minimum Password Length</label>
          <input
            type="number"
            value={settings.securitySettings?.minPasswordLength || 6}
            onChange={(e) => updateField('minPasswordLength', parseInt(e.target.value))}
            className="w-full p-2 border rounded"
            min="4"
            max="20"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Session Timeout (minutes)</label>
          <input
            type="number"
            value={settings.securitySettings?.sessionTimeout || 30}
            onChange={(e) => updateField('sessionTimeout', parseInt(e.target.value))}
            className="w-full p-2 border rounded"
            min="5"
            max="120"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Max Login Attempts</label>
          <input
            type="number"
            value={settings.securitySettings?.maxLoginAttempts || 5}
            onChange={(e) => updateField('maxLoginAttempts', parseInt(e.target.value))}
            className="w-full p-2 border rounded"
            min="3"
            max="10"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Lockout Duration (minutes)</label>
          <input
            type="number"
            value={settings.securitySettings?.lockoutDuration || 30}
            onChange={(e) => updateField('lockoutDuration', parseInt(e.target.value))}
            className="w-full p-2 border rounded"
            min="5"
            max="60"
          />
        </div>
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="allowMultipleLogin"
            checked={settings.securitySettings?.allowMultipleLogin || false}
            onChange={(e) => updateField('allowMultipleLogin', e.target.checked)}
            className="w-4 h-4"
          />
          <label htmlFor="allowMultipleLogin" className="text-sm font-medium">
            Allow Multiple Login (Same user on multiple devices)
          </label>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="twoFactorAuth"
            checked={settings.securitySettings?.twoFactorAuth || false}
            onChange={(e) => updateField('twoFactorAuth', e.target.checked)}
            className="w-4 h-4"
          />
          <label htmlFor="twoFactorAuth" className="text-sm font-medium">
            Enable Two-Factor Authentication (2FA)
          </label>
        </div>
      </div>
    </div>
  );
};

// User Management Tab
const UserManagementTab = ({ settings, setSettings }) => {
  const updateField = (field, value) => {
    setSettings({
      ...settings,
      userManagement: { ...settings.userManagement, [field]: value }
    });
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold mb-4">👥 User Management Rules</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">Default Role for New Users</label>
          <select
            value={settings.userManagement?.defaultRole || 'student'}
            onChange={(e) => updateField('defaultRole', e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Max Students Per Class</label>
          <input
            type="number"
            value={settings.userManagement?.maxStudentsPerClass || 50}
            onChange={(e) => updateField('maxStudentsPerClass', parseInt(e.target.value))}
            className="w-full p-2 border rounded"
            min="10"
            max="200"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Max Teachers Per Class</label>
          <input
            type="number"
            value={settings.userManagement?.maxTeachersPerClass || 5}
            onChange={(e) => updateField('maxTeachersPerClass', parseInt(e.target.value))}
            className="w-full p-2 border rounded"
            min="1"
            max="10"
          />
        </div>
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="allowSelfRegistration"
            checked={settings.userManagement?.allowSelfRegistration || false}
            onChange={(e) => updateField('allowSelfRegistration', e.target.checked)}
            className="w-4 h-4"
          />
          <label htmlFor="allowSelfRegistration" className="text-sm font-medium">
            Allow Self Registration
          </label>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="requireAdminApproval"
            checked={settings.userManagement?.requireAdminApproval || true}
            onChange={(e) => updateField('requireAdminApproval', e.target.checked)}
            className="w-4 h-4"
          />
          <label htmlFor="requireAdminApproval" className="text-sm font-medium">
            Require Admin Approval for New Users
          </label>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="autoGeneratePassword"
            checked={settings.userManagement?.autoGeneratePassword || true}
            onChange={(e) => updateField('autoGeneratePassword', e.target.checked)}
            className="w-4 h-4"
          />
          <label htmlFor="autoGeneratePassword" className="text-sm font-medium">
            Auto-generate Password for New Users
          </label>
        </div>
      </div>
    </div>
  );
};

// Appearance Tab
const AppearanceTab = ({ settings, setSettings }) => {
  const updateField = (field, value) => {
    setSettings({
      ...settings,
      appearance: { ...settings.appearance, [field]: value }
    });
  };

  const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold mb-4">🎨 Appearance Settings</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">Theme</label>
          <select
            value={settings.appearance?.theme || 'light'}
            onChange={(e) => updateField('theme', e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="light">Light Mode</option>
            <option value="dark">Dark Mode</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Primary Color</label>
          <div className="flex gap-2 flex-wrap">
            {colors.map(color => (
              <button
                key={color}
                onClick={() => updateField('primaryColor', color)}
                className={`w-8 h-8 rounded-full border-2 ${
                  settings.appearance?.primaryColor === color ? 'border-gray-800 scale-110' : 'border-transparent'
                } transition-all`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Font Size</label>
          <select
            value={settings.appearance?.fontSize || 'medium'}
            onChange={(e) => updateField('fontSize', e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="compactMode"
            checked={settings.appearance?.compactMode || false}
            onChange={(e) => updateField('compactMode', e.target.checked)}
            className="w-4 h-4"
          />
          <label htmlFor="compactMode" className="text-sm font-medium">
            Compact Mode (Reduce spacing)
          </label>
        </div>
      </div>
    </div>
  );
};

// General Settings Tab
const GeneralTab = ({ settings, setSettings }) => {
  const updateField = (field, value) => {
    setSettings({
      ...settings,
      generalSettings: { ...settings.generalSettings, [field]: value }
    });
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold mb-4">🌍 General Settings</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">Language</label>
          <select
            value={settings.generalSettings?.language || 'english'}
            onChange={(e) => updateField('language', e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="english">English</option>
            <option value="amharic">አማርኛ (Amharic)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Timezone</label>
          <select
            value={settings.generalSettings?.timezone || 'Africa/Addis_Ababa'}
            onChange={(e) => updateField('timezone', e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="Africa/Addis_Ababa">Africa/Addis Ababa (EAT)</option>
            <option value="Africa/Nairobi">Africa/Nairobi</option>
            <option value="Africa/Cairo">Africa/Cairo</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Date Format</label>
          <select
            value={settings.generalSettings?.dateFormat || 'DD/MM/YYYY'}
            onChange={(e) => updateField('dateFormat', e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Time Format</label>
          <select
            value={settings.generalSettings?.timeFormat || '24h'}
            onChange={(e) => updateField('timeFormat', e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="12h">12-hour (AM/PM)</option>
            <option value="24h">24-hour</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Week Start Day</label>
          <select
            value={settings.generalSettings?.weekStartDay || 'Monday'}
            onChange={(e) => updateField('weekStartDay', e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="Monday">Monday</option>
            <option value="Sunday">Sunday</option>
            <option value="Saturday">Saturday</option>
          </select>
        </div>
      </div>
    </div>
  );
};

// Backup Tab
const BackupTab = ({ onBackup, onRestore, settings, setSettings }) => {
  const updateField = (field, value) => {
    setSettings({
      ...settings,
      backupSettings: { ...settings.backupSettings, [field]: value }
    });
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold mb-4">💾 Backup & Restore</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">Backup Frequency</label>
          <select
            value={settings.backupSettings?.backupFrequency || 'weekly'}
            onChange={(e) => updateField('backupFrequency', e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Backup Time</label>
          <input
            type="time"
            value={settings.backupSettings?.backupTime || '00:00'}
            onChange={(e) => updateField('backupTime', e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Retention Days</label>
          <input
            type="number"
            value={settings.backupSettings?.retentionDays || 30}
            onChange={(e) => updateField('retentionDays', parseInt(e.target.value))}
            className="w-full p-2 border rounded"
            min="7"
            max="365"
          />
        </div>
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="autoBackup"
            checked={settings.backupSettings?.autoBackup || false}
            onChange={(e) => updateField('autoBackup', e.target.checked)}
            className="w-4 h-4"
          />
          <label htmlFor="autoBackup" className="text-sm font-medium">
            Enable Automatic Backup
          </label>
        </div>
      </div>
      
      <div className="border-t pt-6 mt-6">
        <h4 className="font-semibold mb-4">Manual Backup & Restore</h4>
        <div className="flex gap-4">
          <button
            onClick={onBackup}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            💾 Download Backup
          </button>
          <label className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 cursor-pointer">
            📂 Restore from Backup
            <input
              type="file"
              accept=".json"
              onChange={onRestore}
              className="hidden"
            />
          </label>
        </div>
        <p className="text-sm text-gray-500 mt-3">
          ⚠️ Warning: Restoring will overwrite all current data!
        </p>
      </div>
    </div>
  );
};

// Notification Tab
const NotificationTab = ({ settings, setSettings }) => {
  const updateField = (field, value) => {
    setSettings({
      ...settings,
      notificationSettings: { ...settings.notificationSettings, [field]: value }
    });
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold mb-4">🔔 Notification Settings</h3>
      <div className="grid grid-cols-1 gap-4">
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
          <label className="text-sm font-medium">Email Notifications</label>
          <input
            type="checkbox"
            checked={settings.notificationSettings?.emailNotifications || false}
            onChange={(e) => updateField('emailNotifications', e.target.checked)}
            className="w-4 h-4"
          />
        </div>
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
          <label className="text-sm font-medium">SMS Alerts</label>
          <input
            type="checkbox"
            checked={settings.notificationSettings?.smsAlerts || false}
            onChange={(e) => updateField('smsAlerts', e.target.checked)}
            className="w-4 h-4"
          />
        </div>
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
          <label className="text-sm font-medium">Attendance Alerts</label>
          <input
            type="checkbox"
            checked={settings.notificationSettings?.attendanceAlerts || false}
            onChange={(e) => updateField('attendanceAlerts', e.target.checked)}
            className="w-4 h-4"
          />
        </div>
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
          <label className="text-sm font-medium">Exam Result Alerts</label>
          <input
            type="checkbox"
            checked={settings.notificationSettings?.examResultAlerts || false}
            onChange={(e) => updateField('examResultAlerts', e.target.checked)}
            className="w-4 h-4"
          />
        </div>
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
          <label className="text-sm font-medium">Payment Reminders</label>
          <input
            type="checkbox"
            checked={settings.notificationSettings?.paymentReminders || false}
            onChange={(e) => updateField('paymentReminders', e.target.checked)}
            className="w-4 h-4"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Admin Email for Alerts</label>
          <input
            type="email"
            value={settings.notificationSettings?.adminEmail || ''}
            onChange={(e) => updateField('adminEmail', e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="admin@school.com"
          />
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;