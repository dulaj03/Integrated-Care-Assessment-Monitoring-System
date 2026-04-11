import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Loader2, Save, User, Mail, Lock, Shield, Activity } from 'lucide-react';

export const AdminSettings = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [adminData, setAdminData] = useState({
    username: '',
    email: '',
    full_name: '',
  });
  const [passwords, setPasswords] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  const fetchProfile = async () => {
    setLoading(true);
    const token = localStorage.getItem('admin_token');
    try {
      const res = await fetch('http://localhost:5000/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch profile');
      
      setAdminData({
        username: data.user.username,
        email: data.user.email,
        full_name: data.user.full_name,
      });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwords.newPassword && passwords.newPassword !== passwords.confirmPassword) {
      return toast.error('Passwords do not match!');
    }

    setSaving(true);
    const token = localStorage.getItem('admin_token');
    try {
      const res = await fetch('http://localhost:5000/api/auth/admin/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...adminData,
          password: passwords.newPassword || undefined
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update profile');

      toast.success(data.message);
      setPasswords({ newPassword: '', confirmPassword: '' });
      
      // Update local storage user if needed or just refresh
      fetchProfile();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
        <p className="text-slate-400 font-medium">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl animate-fade-in space-y-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black text-white tracking-tight">Admin Settings</h1>
        <p className="text-slate-400">Manage your administrative account details and security.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleProfileUpdate} className="glass-card p-8 space-y-6">
            <div className="flex items-center gap-3 pb-2 border-b border-white/5">
              <Shield className="w-5 h-5 text-blue-500" />
              <h2 className="text-xl font-bold text-white">Security & Profile</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <User className="w-3.5 h-3.5" /> Username
                </label>
                <input
                  type="text"
                  value={adminData.username}
                  onChange={(e) => setAdminData({ ...adminData, username: e.target.value })}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all font-medium"
                  placeholder="admin_username"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5" /> Email Address
                </label>
                <input
                  type="email"
                  value={adminData.email}
                  onChange={(e) => setAdminData({ ...adminData, email: e.target.value })}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all font-medium"
                  placeholder="admin@icams.lk"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                   Display Name
                </label>
                <input
                  type="text"
                  value={adminData.full_name}
                  onChange={(e) => setAdminData({ ...adminData, full_name: e.target.value })}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all font-medium"
                  placeholder="Full Name"
                />
              </div>

              <div className="pt-4 border-t border-white/5 md:col-span-2 mt-2">
                <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-widest flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-500" /> Change Password
                </h3>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">New Password</label>
                <input
                  type="password"
                  value={passwords.newPassword}
                  onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all"
                  placeholder="••••••••"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">Confirm Password</label>
                <input
                  type="password"
                  value={passwords.confirmPassword}
                  onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="pt-6 border-t border-white/5 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:cursor-not-allowed rounded-xl text-sm font-bold text-white transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'SAVING CHANGES...' : 'SAVE SETTINGS'}
              </button>
            </div>
          </form>
        </div>

        {/* Info Card */}
        <div className="space-y-6">
          <div className="glass-card p-6 border-blue-500/20 bg-blue-500/5">
            <h3 className="text-lg font-bold text-white mb-3">Security Note</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Changing your administrator credentials will take effect immediately. Ensure you keep your new password in a safe place.
            </p>
          </div>
          
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-500" /> Account Status
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Role</span>
                <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase rounded border border-blue-500/20 tracking-tighter">Super Admin</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Last Login</span>
                <span className="text-sm text-white font-medium">Just now</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Status</span>
                <span className="flex items-center gap-1.5 text-emerald-400 text-sm font-bold">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
