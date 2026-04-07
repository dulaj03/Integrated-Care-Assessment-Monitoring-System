import { useState, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import { UserTable } from '../components/UserTable';
import { AddHospitalModal } from '../components/AddHospitalModal';
import { AdminSettings } from '../components/AdminSettings';
import { PendingReviewModal } from '../components/PendingReviewModal';
import type { AdminUser, UserStatus } from '../types/user';
import {
  Search,
  Bell,
  Users,
  ShieldCheck,
  AlertCircle,
  TrendingUp,
  PlusCircle,
  Loader2,
  X
} from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';

export const Dashboard = ({ onLogout }: { onLogout: () => void }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isHospitalModalOpen, setIsHospitalModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [reviewUser, setReviewUser] = useState<AdminUser | null>(null);
  const [currentAdmin, setCurrentAdmin] = useState<{ full_name: string; username: string } | null>(null);

  const fetchCurrentAdmin = async () => {
    const token = sessionStorage.getItem('admin_token');
    try {
      const res = await fetch('http://localhost:5000/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setCurrentAdmin(data.user);
    } catch (err) {
      console.error('Failed to fetch admin profile', err);
    }
  };

  const fetchUsers = async (silent = false) => {
    if (!silent) setLoading(true);
    const token = sessionStorage.getItem('admin_token');
    try {
      const res = await fetch('http://localhost:5000/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch users');

      interface UserApiResponse {
        id: string;
        full_name?: string;
        name?: string;
        email: string;
        created_at: string;
        status: UserStatus;
        [key: string]: unknown;
      }

      const allUsers: AdminUser[] = [
        ...data.doctors.map((u: UserApiResponse) => ({ ...u, name: u.full_name || '', role: 'DOCTOR' as const, createdAt: u.created_at, uniqueId: `doctor-${u.id}`, status: u.status })),
        ...data.nurses.map((u: UserApiResponse) => ({ ...u, name: u.full_name || '', role: 'NURSE' as const, createdAt: u.created_at, uniqueId: `nurse-${u.id}`, status: u.status })),
        ...data.patients.map((u: UserApiResponse) => ({ ...u, name: u.full_name || '', role: 'PATIENT' as const, createdAt: u.created_at, uniqueId: `patient-${u.id}`, status: u.status })),
        ...data.hospitals.map((u: UserApiResponse) => ({ ...u, name: u.name || '', role: 'HOSPITAL' as const, createdAt: u.created_at, uniqueId: `hospital-${u.id}`, status: u.status })),
      ].map(u => ({
        ...u,
        createdAt: new Date(String(u.createdAt)).toLocaleDateString()
      })) as AdminUser[];

      setUsers(allUsers);
    } catch (err) {
      if (!silent && err instanceof Error) {
        toast.error(err.message);
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentAdmin();
    fetchUsers();

    // Auto-refresh every 1 second
    const interval = setInterval(() => {
      fetchUsers(true); // Silent refresh
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (id: string, role: string, status: UserStatus, reason?: string) => {
    const token = sessionStorage.getItem('admin_token');
    try {
      const res = await fetch('http://localhost:5000/api/admin/users/update-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ id, role: role.toLowerCase(), status, reason }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update status');

      toast.success(data.message);
      fetchUsers();
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message);
      }
    }
  };

  const handleActivate = async (id: string, role: string) => {
    await handleUpdateStatus(id, role, 'ACTIVE');
  };

  const handleDeactivate = async (id: string, role: string) => {
    const token = sessionStorage.getItem('admin_token');
    try {
      const requestBody = { id: String(id), role: role.toLowerCase() };
      const res = await fetch('http://localhost:5000/api/admin/users/deactivate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to deactivate user');
      toast.success('User deactivated successfully');
      fetchUsers();
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message);
      }
    }
  };

  const handleDelete = async (id: string, role: string) => {
    if (!confirm(`Are you sure you want to delete this ${role.toLowerCase()}? This action cannot be undone.`)) return;

    const token = sessionStorage.getItem('admin_token');
    try {
      const requestBody = { id: String(id), role: role.toLowerCase() };
      const res = await fetch('http://localhost:5000/api/admin/users/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete user');
      toast.success('User deleted successfully');
      fetchUsers();
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message);
      }
    }
  };

  const handleEdit = (user: AdminUser) => {
    setEditingUser(user);
    setIsEditModalOpen(true);
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          u.email.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeTab === 'dashboard') return matchesSearch;
    if (activeTab === 'pending') return matchesSearch && (u.status.toUpperCase() === 'PENDING' || u.status.toUpperCase() === 'PENDINGADMINAPPROVAL');
    return matchesSearch && u.role.toLowerCase() === activeTab.slice(0, -1);
  });

  const pendingCount = users.filter(u => u.status.toUpperCase() === 'PENDING' || u.status.toUpperCase() === 'PENDINGADMINAPPROVAL').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} onLogout={onLogout} />

      <main className="pl-64 min-h-screen">
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-10 sticky top-0 bg-slate-950/80 backdrop-blur-md z-40">
          <div className="relative w-96 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
            <input
              type="text"
              placeholder="Search users, hospitals, or logs..."
              className="w-full bg-slate-900 border border-white/10 rounded-xl py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsHospitalModalOpen(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs font-bold text-white transition-all flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              ADD HOSPITAL
            </button>
            <button className="relative p-2 hover:bg-white/5 rounded-xl transition-all">
              <Bell className="w-5 h-5 text-slate-400" />
              {pendingCount > 0 && (
                <span className="absolute top-2 right-2 w-5 h-5 bg-blue-500 text-[10px] font-black rounded-full border-2 border-slate-950 flex items-center justify-center text-white">
                   {pendingCount}
                </span>
              )}
            </button>
            <div className="h-8 w-px bg-white/10" />
            <div className="flex items-center gap-3 pl-2">
              <div className="text-right">
                <p className="text-sm font-bold text-white leading-none">{currentAdmin?.full_name || 'Super Admin'}</p>
                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{currentAdmin?.username || 'Administrator'}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-800 border border-white/10 flex items-center justify-center font-bold text-blue-400 capitalize">
                {currentAdmin?.username?.slice(0, 2) || 'AD'}
              </div>
            </div>
          </div>
        </header>

        <div className="p-10 space-y-10 max-w-7xl mx-auto">
          {activeTab === 'dashboard' && (
            <div className="space-y-10 animate-fade-in">
              <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-black text-white tracking-tight">System Overview</h1>
                <p className="text-slate-400">Real-time stats and management dashboard.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'Total Users', value: users.length, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                  { label: 'Pending Approvals', value: pendingCount, icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                  { label: 'Verified Entities', value: users.filter(u => u.status === 'ACTIVE').length, icon: ShieldCheck, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                  { label: 'System Health', value: '99.9%', icon: TrendingUp, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
                ].map((stat, i) => (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    key={stat.label}
                    className="glass-card p-6 flex items-center gap-5"
                  >
                    <div className={`${stat.bg} ${stat.color} w-14 h-14 rounded-2xl flex items-center justify-center`}>
                      <stat.icon className="w-7 h-7" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
                      <h3 className="text-2xl font-black text-white">{stat.value}</h3>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          <div className="animate-fade-in">
            {activeTab === 'settings' ? (
              <AdminSettings />
            ) : loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                <p className="text-slate-400 font-medium animate-pulse">Fetching latest records...</p>
              </div>
            ) : (
              <UserTable
                users={filteredUsers}
                title={activeTab === 'dashboard' ? 'Recent Users' : activeTab === 'pending' ? 'Pending Applications' : `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Management`}
                onApprove={(id) => handleUpdateStatus(id, users.find(u => u.id === id)?.role || '', 'ACTIVE')}
                onReject={(id) => handleUpdateStatus(id, users.find(u => u.id === id)?.role || '', 'REJECTED')}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onActivate={handleActivate}
                onDeactivate={handleDeactivate}
                onReview={(user) => setReviewUser(user)}
              />
            )}
          </div>
        </div>

        <AddHospitalModal
          isOpen={isHospitalModalOpen}
          onClose={() => setIsHospitalModalOpen(false)}
          onSuccess={fetchUsers}
        />

        {reviewUser && (
          <PendingReviewModal
            user={reviewUser}
            onClose={() => setReviewUser(null)}
            onApprove={(id, role) => {
              handleUpdateStatus(id, role, 'ACTIVE');
              setReviewUser(null);
            }}
            onReject={(id, role, reason) => {
              handleUpdateStatus(id, role, 'REJECTED', reason);
              setReviewUser(null);
            }}
          />
        )}

        {isEditModalOpen && editingUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsEditModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 border border-white/10 rounded-2xl p-8 w-full max-w-md shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Edit User</h2>
                <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Name</label>
                  <input type="text" value={editingUser.name} readOnly className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-slate-200" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                  <input type="email" value={editingUser.email} readOnly className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-slate-200" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Role</label>
                  <input type="text" value={editingUser.role} readOnly className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-slate-200" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Status</label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => { if (editingUser.status !== 'ACTIVE') { handleActivate(editingUser.id, editingUser.role); setIsEditModalOpen(false); } }}
                      className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${editingUser.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 border border-white/10 text-slate-300 hover:bg-slate-700'}`}
                    >
                      Activate
                    </button>
                    <button
                      onClick={() => { if (editingUser.status === 'ACTIVE') { handleDeactivate(editingUser.id, editingUser.role); setIsEditModalOpen(false); } }}
                      className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${editingUser.status !== 'ACTIVE' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-slate-800 border border-white/10 text-slate-300 hover:bg-slate-700'}`}
                    >
                      Deactivate
                    </button>
                  </div>
                </div>

                <button onClick={() => setIsEditModalOpen(false)} className="w-full mt-6 py-2 px-4 bg-slate-800 border border-white/10 text-slate-300 rounded-lg hover:bg-slate-700 transition-all font-medium">
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </main>
    </div>
  );
};
