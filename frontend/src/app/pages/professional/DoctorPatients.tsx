import { 
  Users, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Plus, 
  Search, 
  Loader2, 
  Stethoscope,
  Activity
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { Link } from 'react-router';
import { toast } from 'sonner';

export function DoctorPatients() {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const token = sessionStorage.getItem('token');

  const fetchPatients = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch('http://localhost:5000/api/doctor/patients', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch patients');
      const data = await res.json();
      setPatients(data);
    } catch (error) {
      console.error(error);
      toast.error('Could not load patient directory');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const filteredPatients = patients.filter(patient => {
    const nameStr = (patient.full_name || patient.name || '').toLowerCase();
    const conditionStr = (patient.condition || '').toLowerCase();
    const matchesSearch = nameStr.includes(searchTerm.toLowerCase()) || conditionStr.includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || patient.status?.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
    case 'active':
    case 'stable':
      return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
    case 'monitoring':
      return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
    case 'critical':
      return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400';
    default:
      return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
        <p className="text-slate-500 font-medium">Loading patient directory...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Patient Directory</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage and monitor all assigned patient records.</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-black transition-all shadow-lg shadow-blue-500/20">
          <Plus className="h-4 w-4" /> Add New Case
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Assigned Total', value: patients.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Critical Cases', value: patients.filter(p => p.status?.toLowerCase() === 'critical').length, icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50' },
          { label: 'Stable / Active', value: patients.filter(p => p.status?.toLowerCase() === 'active' || p.status?.toLowerCase() === 'stable').length, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Monitoring', value: patients.filter(p => p.status?.toLowerCase() === 'monitoring').length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map((stat) => (
          <div key={stat.label} className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
              <stat.icon className="h-12 w-12" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
            <h3 className={`text-3xl font-black ${stat.color}`}>{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by name, condition or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-6 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="monitoring">Monitoring</option>
          <option value="critical">Critical</option>
        </select>
      </div>

      {/* Main Grid View */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredPatients.length === 0 ? (
          <div className="col-span-full py-20 bg-white dark:bg-slate-900 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center gap-4 text-center">
            <div className="h-16 w-16 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-300">
              <Users className="h-8 w-8" />
            </div>
            <p className="font-bold text-slate-500">No patients found matching your criteria</p>
          </div>
        ) : (
          filteredPatients.map((patient) => (
            <div key={patient.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 hover:shadow-xl transition-all group">
              <div className="flex items-center justify-between mb-6">
                <div className="h-14 w-14 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                  <Users className="h-7 w-7" />
                </div>
                <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tight ${getStatusColor(patient.status)}`}>
                  {patient.status || 'ACTIVE'}
                </span>
              </div>
               
              <div className="space-y-1 mb-6">
                <h4 className="text-xl font-black text-slate-900 dark:text-white capitalize truncate group-hover:text-blue-600 transition-colors">
                  {patient.full_name || patient.name}
                </h4>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 truncate capitalize">
                  <Activity className="h-3 w-3" /> {patient.condition || 'Monitoring required'}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Last Update</p>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {patient.created_at ? format(new Date(patient.created_at), 'MMM d, yyyy') : 'No history'}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Nurse Care</p>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {patient.nurses?.length || 0} Assigned
                  </p>
                </div>
              </div>

              <Link 
                to={`/doctor/patient/${patient.id}`}
                className="w-full py-3 bg-slate-900 dark:bg-white dark:text-slate-950 text-white rounded-2xl text-xs font-black flex items-center justify-center gap-2 hover:bg-blue-600 dark:hover:bg-blue-500 dark:hover:text-white transition-all shadow-lg"
              >
                <Stethoscope className="h-4 w-4" /> Open Clinical Workspace
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
