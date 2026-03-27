import { Mail, Phone, Calendar, Heart, Pill, AlertCircle, Edit, Shield, MapPin, User as UserIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { CURRENT_USER_PATIENT, MOCK_DOCTORS } from '../../lib/mockData';
import { useTranslation } from 'react-i18next';

export function Profile() {
  const { t } = useTranslation();
  const [patient, setPatient] = useState<any>(CURRENT_USER_PATIENT);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    age: '',
    gender: 'Male',
    phone: '+94 71 234 5678',
    address: '123 Main Street, Colombo 3, Sri Lanka',
  });

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
          setFormData(prev => ({
            ...prev,
            name: user.full_name || user.name,
            email: user.email,
          }));
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const assignedDoctor = MOCK_DOCTORS.find(d => d.id === patient.doctor_id || d.id === (patient as any).assignedDoctorId);

  if (loading) return <div className="p-8 text-center text-slate-500">Loading profile...</div>;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    setIsEditing(false);
    // In a real app, you'd save this data to the backend
    console.log('Saving profile:', formData);
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
          <div className="flex-shrink-0">
            <img
              className="h-16 w-16 rounded-full object-cover"
              src={patient.avatar || 'https://images.unsplash.com/photo-1552058544-f2b08422138a?auto=format&fit=crop&q=80&w=100&h=100'}
              alt={patient.name}
            />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
              {patient.name}
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
                className="flex-1 px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors font-medium"
              >
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
            <InfoCard icon={UserIcon} label="Full Name" value={patient.name} />
            <InfoCard icon={Mail} label="Email Address" value={patient.email} />
            <InfoCard icon={Phone} label="Phone Number" value={formData.phone} />
            <InfoCard icon={Calendar} label="Age" value={`${patient.age} years old`} />
            <InfoCard icon={UserIcon} label="Gender" value={patient.gender} />
            <InfoCard icon={MapPin} label="Address" value={formData.address} />
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
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Assigned Doctor</p>
              <p className="text-sm font-medium text-slate-900 dark:text-white">
                {assignedDoctor?.name || 'Unassigned'}
              </p>
              {assignedDoctor?.email && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {assignedDoctor.email}
                </p>
              )}
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
          <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
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
          <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors border-t border-slate-200 dark:border-slate-700">
            <span className="text-sm font-medium text-slate-900 dark:text-white">
              Download Health Records
            </span>
            <span className="text-slate-400">&gt;</span>
          </button>
        </div>
      </div>
    </div>
  );
}
