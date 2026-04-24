import { Mail, Phone, Shield, User as UserIcon, Award, Briefcase, Building2, CreditCard, Edit, CheckCircle2, Camera } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export function Settings() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    specialization: '', // mapped to qualification for nurses
    license_number: '',
    years_of_experience: '',
    institution_name: '',
    registration_number: '',
    avatar: '',
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
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
          setProfile(user);
          setFormData({
            full_name: user.full_name || '',
            email: user.email || '',
            specialization: user.specialization || user.qualification || '',
            license_number: user.license_number || '',
            years_of_experience: String(user.years_of_experience || ''),
            institution_name: user.institution_name || '',
            registration_number: user.registration_number || '',
            avatar: user.avatar || '',
          });
          setAvatarPreview(user.avatar || null);
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
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
        toast.success('Password changed successfully!');
        setIsPasswordModalOpen(false);
        setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        const error = await res.json();
        toast.error(error.error || 'Failed to change password');
      }
    } catch (err) {
      console.error('Error changing password:', err);
      toast.error('Error changing password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleSave = async () => {
    setSaveLoading(true);
    const token = sessionStorage.getItem('token');
    
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, value);
      });
      if (avatarFile) {
        data.append('avatar', avatarFile);
      }

      const res = await fetch('http://localhost:5000/api/auth/professional/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: data
      });

      if (res.ok) {
        const { user } = await res.json();
        setProfile(user);
        // Re-sync formData so edit mode shows the freshly saved values
        setFormData({
          full_name: user.full_name || '',
          email: user.email || '',
          specialization: user.specialization || user.qualification || '',
          license_number: user.license_number || '',
          years_of_experience: String(user.years_of_experience || ''),
          institution_name: user.institution_name || '',
          registration_number: user.registration_number || '',
          avatar: user.avatar || '',
        });
        setIsEditing(false);
        toast.success('Professional profile updated successfully!');
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Error saving profile:', err);
      toast.error('Error saving profile');
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <div className="h-10 w-10 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
      <p className="font-bold text-slate-500">Retrieving secure professional data...</p>
    </div>
  );

  if (!profile) return <div className="p-20 text-center font-bold text-slate-400">Settings synchronization failed.</div>;

  const roleLabel = profile.role === 'doctor' ? 'Medical Doctor' : 'Nursing Staff';

  const InfoCard = ({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) => (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/30">
      <div className="h-10 w-10 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm text-blue-600 dark:text-blue-400">
        <Icon size={20} />
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-widest font-black text-slate-400 mb-0.5">{label}</p>
        <p className="text-sm font-bold text-slate-900 dark:text-white">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Account Settings</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage your clinical credentials and professional identity.</p>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-600/20 transition-all font-bold text-sm"
        >
          {isEditing ? 'Cancel' : <><Edit size={16} /> Edit Profile</>}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Badge */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-sm border border-slate-100 dark:border-slate-800 text-center">
            <div className="relative inline-block mb-4">
              <div className="h-24 w-24 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 mx-auto overflow-hidden border-2 border-slate-100 dark:border-slate-800">
                {avatarPreview ? (
                  <img src={avatarPreview} alt={profile.full_name} className="h-full w-full object-cover" />
                ) : (
                  <UserIcon size={48} />
                )}
              </div>
              
              {isEditing && (
                <label className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-blue-600 border-2 border-white dark:border-slate-900 flex items-center justify-center text-white cursor-pointer hover:bg-blue-700 transition-colors shadow-lg">
                  <Camera size={14} />
                  <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                </label>
              )}
              
              {!isEditing && (
                <div className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-emerald-500 border-4 border-white dark:border-slate-900 flex items-center justify-center text-white">
                  <CheckCircle2 size={16} />
                </div>
              )}
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">{profile.full_name}</h3>
            <p className="text-[10px] uppercase font-black tracking-widest text-blue-500 mb-6">{roleLabel}</p>
            
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between text-xs font-bold px-2">
                <span className="text-slate-400 uppercase tracking-wider text-[9px]">Account Status</span>
                <span className="px-2 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 uppercase text-[9px] font-black">Active</span>
              </div>
              <div className="flex items-center justify-between text-xs font-bold px-2">
                <span className="text-slate-400 uppercase tracking-wider text-[9px]">Institution</span>
                <span className="text-slate-900 dark:text-white truncate max-w-[150px]">{profile.institution_name || 'I-CAMS Network'}</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 px-2">Privacy & Security</h4>
            <button 
              onClick={() => setIsPasswordModalOpen(true)}
              className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-indigo-500" />
                <span className="text-sm font-bold text-slate-900 dark:text-white">Change Password</span>
              </div>
            </button>
            <p className="text-[10px] text-slate-400 px-4">Regularly updating your password ensures clinical data security and platform integrity.</p>
          </div>
        </div>

        {/* Detailed Info / Form */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-slate-100 dark:border-slate-800 h-full">
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-8 flex items-center gap-2">
              <UserIcon size={14} className="text-blue-500" /> Professional Identity Records
            </h4>

            {isEditing ? (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black tracking-widest text-slate-500 px-1">Legal Full Name</label>
                    <input
                      type="text"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleInputChange}
                      className="w-full px-5 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all shadow-inner"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black tracking-widest text-slate-500 px-1">Clinical Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-5 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all shadow-inner"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black tracking-widest text-slate-500 px-1">Clinical Specialization</label>
                    <input
                      type="text"
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleInputChange}
                      className="w-full px-5 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all shadow-inner"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black tracking-widest text-slate-500 px-1">License Number</label>
                    <input
                      type="text"
                      name="license_number"
                      value={formData.license_number}
                      onChange={handleInputChange}
                      className="w-full px-5 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all shadow-inner"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black tracking-widest text-slate-500 px-1">Experience Years</label>
                    <input
                      type="number"
                      name="years_of_experience"
                      value={formData.years_of_experience}
                      onChange={handleInputChange}
                      className="w-full px-5 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all shadow-inner"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] uppercase font-black tracking-widest text-slate-500 px-1">Assigned Institution / Hospital</label>
                    <input
                      type="text"
                      name="institution_name"
                      value={formData.institution_name}
                      onChange={handleInputChange}
                      className="w-full px-5 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all shadow-inner"
                    />
                  </div>
                </div>

                <div className="pt-6 flex gap-4">
                  <button
                    onClick={handleSave}
                    disabled={saveLoading}
                    className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[1.5rem] font-black uppercase text-xs tracking-widest shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {saveLoading ? 'Synchronizing...' : 'Submit Profile Updates'}
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-8 py-4 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-[1.5rem] font-black uppercase text-xs tracking-widest transition-all"
                  >
                    Discard
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <InfoCard icon={Mail} label="Professional Email" value={profile.email} />
                <InfoCard icon={Phone} label="Official Contact" value={profile.phone || 'Not Configured'} />
                <InfoCard icon={Award} label="Core Specialization" value={profile.specialization || profile.qualification || 'N/A'} />
                <InfoCard icon={CreditCard} label="License ID" value={profile.license_number || 'N/A'} />
                <InfoCard icon={Briefcase} label="Clinical Experience" value={`${profile.years_of_experience || '0'}+ Years Published`} />
                <InfoCard icon={Building2} label="Primary Institution" value={profile.institution_name || 'N/A'} />
                <div className="md:col-span-2 pt-6">
                  <div className="p-6 rounded-[2rem] bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30 flex items-start gap-4">
                    <Shield className="h-6 w-6 text-indigo-500 flex-shrink-0 mt-1" />
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600 mb-1">Clinical Registration Number</p>
                      <p className="text-xl font-black text-slate-900 dark:text-white">{profile.registration_number || 'REG-PENDING-000'}</p>
                      <p className="text-[10px] text-slate-500 mt-1">This ID is utilized for official clinical orders and lab result signatures within the I-CAMS infrastructure.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Password Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl w-full max-w-md p-8 border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-300">
            <div className="h-12 w-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 mb-6">
              <Shield size={24} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Update Security</h3>
            <p className="text-xs text-slate-500 mb-8 uppercase tracking-widest font-bold">Credential Protocol Reset</p>
            
            <form onSubmit={handleChangePassword} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black tracking-widest text-slate-500 px-1">Established Password</label>
                <input
                  type="password"
                  required
                  value={passwordData.oldPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, oldPassword: e.target.value }))}
                  className="w-full px-5 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all shadow-inner"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black tracking-widest text-slate-500 px-1">New Secure Cipher</label>
                <input
                  type="password"
                  required
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  className="w-full px-5 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all shadow-inner"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black tracking-widest text-slate-500 px-1">Confirm New Cipher</label>
                <input
                  type="password"
                  required
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="w-full px-5 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all shadow-inner"
                />
              </div>
              <div className="flex gap-3 pt-6">
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50"
                >
                  {passwordLoading ? 'Cryptographic Update...' : 'Commit Reset'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="px-6 py-4 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 transition-all"
                >
                  Close
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
