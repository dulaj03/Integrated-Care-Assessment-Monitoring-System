import { Mail, Phone, Calendar, Heart, Pill, AlertCircle, Edit, Shield, MapPin, User as UserIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export function Profile() {
  const { t } = useTranslation();
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    gender: 'Male',
    address: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = sessionStorage.getItem('token');
      if (!token) return;
      try {
        const res = await fetch('http://localhost:5000/api/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const { user } = await res.json();
          setPatient(user);
          setFormData({
            name: user.full_name || '',
            email: user.email || '',
            phone: user.phone || '',
            age: user.age || '',
            gender: user.gender || 'Male',
            address: user.address || '',
          });
          setAvatarPreview(user.profile_picture || null);
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);


  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 gap-4">
      <div className="h-10 w-10 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
      <p className="font-bold text-slate-500">Synchronizing Health Profile...</p>
    </div>
  );
  if (!patient) return <div className="p-20 text-center font-bold text-slate-400">Profile synchronization failed. Please log in again.</div>;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }

    setPasswordLoading(true);
    const token = sessionStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:5000/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          oldPassword: passwordData.oldPassword,
          newPassword: passwordData.newPassword
        })
      });

      if (res.ok) {
        alert('Password changed successfully!');
        setIsPasswordModalOpen(false);
        setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to change password');
      }
    } catch (err) {
      console.error('Error changing password:', err);
      alert('Error changing password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDownloadRecords = async () => {
    try {
      // First fetch all related data (vitals, reports, etc.) 
      // For now, we generate a JSON blob of the profile and basic summary
      const data = {
        patient_info: patient,
        downloaded_at: new Date().toISOString(),
        notes: "Official health record summary from I-CAMS"
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Health_Record_${patient.full_name.replace(/\s+/g, '_')}.json`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (err) {
      console.error('Error downloading records:', err);
      alert('Failed to generate health records');
    }
  };

  const handleSave = async () => {
    setSaveLoading(true);
    const token = sessionStorage.getItem('token');
    
    // Create FormData for multipart/form-data
    const data = new FormData();
    data.append('full_name', formData.name);
    data.append('email', formData.email);
    data.append('phone', formData.phone);
    data.append('age', formData.age);
    data.append('gender', formData.gender);
    data.append('address', formData.address);
    if (selectedFile) {
      data.append('profile_picture', selectedFile);
    }

    try {
      const res = await fetch('http://localhost:5000/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
          // Content-Type is set automatically by the browser with boundary when using FormData
        },
        body: data
      });

      if (res.ok) {
        const { user } = await res.json();
        setPatient(user);
        setIsEditing(false);
        alert('Profile updated successfully!');
      } else {
        alert('Failed to update profile');
      }
    } catch (err) {
      console.error('Error saving profile:', err);
      alert('Error saving profile');
    } finally {
      setSaveLoading(false);
    }
  };

  const InfoCard = ({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) => (
    <div className="flex items-center gap-3">
      <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
      <div>
        <p className="text-sm text-slate-600 dark:text-slate-400">{label}</p>
        <p className="text-sm font-medium text-slate-900 dark:text-white">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-slate-900 dark:text-white sm:text-3xl sm:truncate">
            {t('patient_profile.title')}
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage your personal and medical information
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900 focus:ring-blue-500 transition-colors duration-200"
          >
            <Edit className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>
      </div>

      {/* Personal Information */}
      <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-shrink-0 relative group">
            <img
              className="h-20 w-20 rounded-full object-cover border-2 border-slate-100 dark:border-slate-700 shadow-sm"
              src={avatarPreview || 'https://images.unsplash.com/photo-1552058544-f2b08422138a?auto=format&fit=crop&q=80&w=100&h=100'}
              alt={patient.full_name}
            />
            {isEditing && (
              <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                <Edit className="h-5 w-5 text-white" />
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </label>
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              {patient.full_name}
            </h3>
            <p className={`inline-flex items-center gap-1 text-xs font-medium mt-1 px-2 py-1 rounded-full ${patient.status === 'stable'
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
              : patient.status === 'monitoring'
                ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
            }`}>
              <Heart className="h-3 w-3" />
              {patient.status.charAt(0).toUpperCase() + patient.status.slice(1)}
            </p>
          </div>
        </div>

        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Personal Information
        </h3>

        {isEditing ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-900 dark:text-white mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 dark:text-white mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 dark:text-white mb-1">
                  Age
                </label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 dark:text-white mb-1">
                  Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 dark:text-white mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 dark:text-white mb-1">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={handleSave}
                disabled={saveLoading}
                className="flex-1 px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saveLoading && <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                Save Changes
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="flex-1 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-md hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <InfoCard icon={UserIcon} label="Full Name" value={patient.full_name} />
            <InfoCard icon={Mail} label="Email Address" value={patient.email} />
            <InfoCard icon={Phone} label="Phone Number" value={patient.phone || 'Not provided'} />
            <InfoCard icon={Calendar} label="Age" value={patient.age ? `${patient.age} years old` : 'Not provided'} />
            <InfoCard icon={UserIcon} label="Gender" value={patient.gender || 'Not provided'} />
            <InfoCard icon={MapPin} label="Address" value={patient.address || 'Not provided'} />
          </div>
        )}
      </div>

      {/* Medical Information */}
      <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Medical Information
        </h3>

        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50">
            <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Primary Condition</p>
              <p className="text-sm font-medium text-slate-900 dark:text-white">
                {patient.condition}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50">
            <Heart className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Health Status</p>
              <p className="text-sm font-medium text-slate-900 dark:text-white">
                {patient.status.charAt(0).toUpperCase() + patient.status.slice(1)}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50">
            <UserIcon className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-slate-600 dark:text-slate-400">Assigned Care Team</p>
              <div className="mt-2 space-y-3">
                <div>
                  <p className="text-[10px] font-black uppercase text-blue-500 tracking-widest">Primary Doctor</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    {patient.doctor_name || 'No doctor assigned'}
                  </p>
                </div>
                {patient.nurse_names && (
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-600">
                    <p className="text-[10px] font-black uppercase text-emerald-500 tracking-widest">Assigned Nurses</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {patient.nurse_names}
                    </p>
                  </div>
                )}
                {!patient.nurse_names && (
                   <div className="pt-2 border-t border-slate-200 dark:border-slate-600">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Assigned Nurses</p>
                    <p className="text-sm font-medium text-slate-400 italic">No nurses assigned yet</p>
                   </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Current Medications */}
      <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Pill className="h-5 w-5" />
          Current Medications
        </h3>

        {patient.medications && patient.medications.length > 0 ? (
          <div className="space-y-3">
            {patient.medications.map((med: any, index: number) => (
              <div
                key={index}
                className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {med.name}
                    </p>
                    <div className="mt-2 space-y-1">
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        <span className="font-medium">Dosage:</span> {med.dosage}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        <span className="font-medium">Frequency:</span> {med.frequency}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-600 dark:text-slate-400">
            No medications currently prescribed.
          </p>
        )}
      </div>

      {/* Privacy & Security */}
      <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Privacy & Security
        </h3>

        <div className="space-y-3">
          <button 
            onClick={() => setIsPasswordModalOpen(true)}
            className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
          >
            <span className="text-sm font-medium text-slate-900 dark:text-white">
              Change Password
            </span>
            <span className="text-slate-400">&gt;</span>
          </button>
          <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors border-t border-slate-200 dark:border-slate-700">
            <span className="text-sm font-medium text-slate-900 dark:text-white">
              Privacy Settings
            </span>
            <span className="text-slate-400">&gt;</span>
          </button>
          <button 
            onClick={handleDownloadRecords}
            className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors border-t border-slate-200 dark:border-slate-700"
          >
            <span className="text-sm font-medium text-slate-900 dark:text-white">
              Download Health Records
            </span>
            <span className="text-slate-400">&gt;</span>
          </button>
        </div>
      </div>

      {/* Password Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md p-6 border border-slate-200 dark:border-slate-800">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Change Password</h3>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Current Password</label>
                <input
                  type="password"
                  required
                  value={passwordData.oldPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, oldPassword: e.target.value }))}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">New Password</label>
                <input
                  type="password"
                  required
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {passwordLoading ? 'Updating...' : 'Update Password'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl font-bold hover:bg-slate-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
