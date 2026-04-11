import { 
  Users, 
  AlertCircle, 
  Clock, 
  Search, 
  Loader2, 
  Activity,
  ChevronRight,
  Heart
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router';
import { toast } from 'sonner';

export function NursePatients() {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const token = sessionStorage.getItem('token');

  const fetchPatients = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch('http://localhost:5000/api/nurse/patients', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch patients');
      const data = await res.json();
      setPatients(data);
    } catch (error) {
      console.error(error);
      toast.error('Could not load assigned patient list');
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
        <p className="text-slate-500 font-medium tracking-tight">Accessing patient care database...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Nursing Care Directory</h1>
          <p className="text-slate-500 dark:text-slate-400">Real-time status of all patients under your supervision.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-black transition-all">
              Summary Report
          </button>
        </div>
      </div>

      {/* Quick Status Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Assigned Patients', value: patients.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-500/10' },
          { label: 'Critical Alert', value: patients.filter(p => p.status?.toLowerCase() === 'critical').length, icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-500/10' },
          { label: 'Routine Check-ups', value: patients.filter(p => p.status?.toLowerCase() === 'monitoring').length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-500/10' },
        ].map((stat) => (
          <div key={stat.label} className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
            <div className={`absolute top-0 right-0 p-4 ${stat.bg} ${stat.color} rounded-bl-3xl opacity-20 group-hover:opacity-100 transition-all duration-500`}>
              <stat.icon className="h-20 w-20 -mr-6 -mt-6" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
            <h3 className={`text-3xl font-black ${stat.color}`}>{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search name, ward or condition..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 focus:outline-none"
          />
        </div>
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-6 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
        >
          <option value="all">Priority Level</option>
          <option value="critical">Critical (Red)</option>
          <option value="monitoring">Monitoring (Yellow)</option>
          <option value="active">Standard (Green)</option>
        </select>
      </div>

      {/* Patient Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredPatients.length === 0 ? (
          <div className="col-span-full py-20 bg-white dark:bg-slate-900 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center gap-4 text-center">
            <Users className="h-10 w-10 text-slate-300" />
            <p className="font-bold text-slate-500">No assigned patients found</p>
          </div>
        ) : (
          filteredPatients.map((patient) => (
            <div key={patient.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 hover:shadow-xl transition-all group overflow-hidden relative">
              {patient.status?.toLowerCase() === 'critical' && (
                <div className="absolute top-0 left-0 w-1 h-full bg-rose-500" />
              )}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                    <Users className="h-7 w-7" />
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-slate-900 dark:text-white capitalize leading-tight mb-1">
                      {patient.full_name || patient.name}
                    </h4>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-tight">
                      <Activity className="h-3 w-3" /> {patient.condition || 'General Observation'}
                    </div>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tight ${getStatusColor(patient.status)}`}>
                  {patient.status || 'STABLE'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Ward Location</p>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Room 304, Ward A</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Primary Doctor</p>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Dr. {patient.doctor_name || 'Assigned'}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Link 
                  to={`/nurse/patient/${patient.id}`}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-black flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/20"
                >
                  <Heart className="h-4 w-4" /> Vitals & Assessment
                </Link>
                <button className="px-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl text-xs font-black hover:bg-slate-200 dark:hover:bg-slate-700">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
