import { useState, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import { UserTable } from '../components/UserTable';
import { AddHospitalModal } from '../components/AddHospitalModal';
import type { AdminUser, UserStatus } from '../types/user';
import {
  Search,
  Bell,
  Users,
  ShieldCheck,
  AlertCircle,
  TrendingUp,
  PlusCircle,
  Loader2
} from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';

export const Dashboard = ({ onLogout }: { onLogout: () => void }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isHospitalModalOpen, setIsHospitalModalOpen] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    const token = localStorage.getItem('admin_token');
    try {
      const res = await fetch('http://localhost:5000/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch users');

      // Combine and map roles
      const allUsers: AdminUser[] = [
        ...data.doctors.map((u: any) => ({ ...u, name: u.full_name, role: 'DOCTOR', createdAt: u.created_at })),
        ...data.nurses.map((u: any) => ({ ...u, name: u.full_name, role: 'NURSE', createdAt: u.created_at })),
        ...data.patients.map((u: any) => ({ ...u, name: u.full_name, role: 'PATIENT', createdAt: u.created_at })),
        ...data.hospitals.map((u: any) => ({ ...u, role: 'HOSPITAL', createdAt: u.created_at })),
      ].map(u => ({
        ...u,
        createdAt: new Date(u.createdAt).toLocaleDateString()
      }));

      setUsers(allUsers);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUpdateStatus = async (id: string, role: string, status: UserStatus) => {
    const token = localStorage.getItem('admin_token');
    try {
      const res = await fetch('http://localhost:5000/api/admin/users/update-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ id, role: role.toLowerCase(), status }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update status');

      toast.success(data.message);
      fetchUsers(); // Refresh list
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeTab === 'dashboard') return matchesSearch;
    return matchesSearch && u.role.toLowerCase() === activeTab.slice(0, -1);
  });

  const pendingCount = users.filter(u => u.status === 'PENDING').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} onLogout={onLogout} />

      <main className="pl-64 min-h-screen">
        {/* Header */}
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-10 sticky top-0 bg-slate-950/80 backdrop-blur-md z-40">
          <div className="relative w-96 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4 transition-colors group-focus-within:text-blue-500" />
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
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs font-bold text-white transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20"
            >
              <PlusCircle className="w-4 h-4" />
              ADD HOSPITAL
            </button>
            <button className="relative p-2 hover:bg-white/5 rounded-xl transition-all group">
              <Bell className="w-5 h-5 text-slate-400 group-hover:text-white" />
              {pendingCount > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full border-2 border-slate-950" />
              )}
            </button>
            <div className="h-8 w-px bg-white/10" />
            <div className="flex items-center gap-3 pl-2">
              <div className="text-right">
                <p className="text-sm font-bold text-white leading-none">Super Admin</p>
                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Administrator</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-800 border border-white/10 flex items-center justify-center font-bold text-blue-400">
                AD
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-10 space-y-10 max-w-7xl mx-auto">
          {activeTab === 'dashboard' && (
            <div className="space-y-10 animate-fade-in">
              <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-black text-white tracking-tight">System Overview</h1>
                <p className="text-slate-400">Real-time stats and management dashboard.</p>
              </div>

              {/* Stats Grid */}
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
                    className="glass-card p-6 flex items-center gap-5 hover:border-white/20 transition-all cursor-default group"
                  >
                    <div className={`${stat.bg} ${stat.color} w-14 h-14 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-inner`}>
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
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                <p className="text-slate-400 font-medium animate-pulse">Fetching latest records...</p>
              </div>
            ) : (
              <UserTable
                users={filteredUsers}
                title={activeTab === 'dashboard' ? 'Recent Users' : `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Management`}
                onApprove={(id) => handleUpdateStatus(id, users.find(u => u.id === id)?.role || '', 'ACTIVE')}
                onReject={(id) => handleUpdateStatus(id, users.find(u => u.id === id)?.role || '', 'REJECTED')}
              />
            )}
          </div>
        </div>

        <AddHospitalModal
          isOpen={isHospitalModalOpen}
          onClose={() => setIsHospitalModalOpen(false)}
          onSuccess={fetchUsers}
        />
      </main>
    </div>
  );
};
