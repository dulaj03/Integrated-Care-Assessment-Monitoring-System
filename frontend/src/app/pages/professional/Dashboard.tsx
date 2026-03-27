import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router';
import { Search, AlertCircle, Clock, ChevronRight, User, Loader2 } from 'lucide-react';
import { Patient } from '../../lib/mockData';
import { clsx } from 'clsx';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { toast } from 'sonner';

export function ProfessionalDashboard({ role }: { role?: 'doctor' | 'nurse' }) {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<'all' | 'critical' | 'monitoring' | 'stable'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [pendingPatients, setPendingPatients] = useState<Partial<Patient>[]>([]);
  const [assignedPatients, setAssignedPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  const userRole = role || (sessionStorage.getItem('userRole') as 'doctor' | 'nurse') || 'doctor';
  const token = sessionStorage.getItem('token');

  const fetchData = useCallback(async () => {
    if (!token) return;
    try {
      // Fetch assigned patients
      const assignedRes = await fetch(`http://localhost:5000/api/${userRole}/patients`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (assignedRes.ok) {
        const data = await assignedRes.json();
        setAssignedPatients(data);
      }

      // Fetch pending patients (only for doctors)
      if (userRole === 'doctor') {
        const pendingRes = await fetch('http://localhost:5000/api/doctor/patients/pending', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (pendingRes.ok) {
          const data = await pendingRes.json();
          setPendingPatients(data);
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [token, userRole]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleApprove = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/doctor/patients/approve/${id}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success('Patient approved successfully');
        fetchData();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to approve patient');
      }
    } catch (error) {
      toast.error('Network error');
    }
  };

  const handleReject = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/doctor/patients/reject/${id}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success('Patient rejected');
        fetchData();
      }
    } catch (error) {
      toast.error('Network error');
    }
  };

  const filteredPatients = assignedPatients.filter(patient => {
    const matchesFilter = filter === 'all' || patient.status === filter;
    const nameMatch = patient.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                      (patient as any).full_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const conditionMatch = patient.condition?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesFilter && (nameMatch || conditionMatch);
  });

  const getStatusColor = (status: Patient['status']) => {
    switch (status) {
    case 'critical': return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400';
    case 'monitoring': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400';
    case 'stable': return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400';
    default: return 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
        <p className="text-slate-500 animate-pulse">Loading patient data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('professional_dashboard.patientOverview')}</h1>
      </div>

      {/* Critical Alerts Banner (FR19) */}
      {assignedPatients.filter(p => p.condition === 'critical').length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl bg-red-600 p-4 border border-red-500 shadow-xl shadow-red-500/20 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg animate-pulse">
              <AlertCircle className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="font-bold text-white text-lg">Critical Monitoring Alerts</p>
              <p className="text-white/80 text-sm">
                {assignedPatients.filter(p => p.condition === 'critical').length} patient(s) require immediate attention.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {assignedPatients.filter(p => p.condition === 'critical').slice(0, 2).map(p => (
              <Link key={p.id} to={userRole === 'doctor' ? `/doctor/patient/${p.id}` : `/nurse/patient/${p.id}`} className="px-4 py-2 bg-white text-red-600 font-bold rounded-lg hover:bg-red-50 transition-colors text-sm">
                View {(p as any).full_name?.split(' ')[0] || p.name?.split(' ')[0]}
              </Link>
            ))}
          </div>
        </motion.div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white dark:bg-slate-900 overflow-hidden shadow dark:shadow-xl rounded-lg border border-slate-200 dark:border-slate-800">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <User className="h-6 w-6 text-blue-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-slate-500 dark:text-slate-400 truncate">{t('professional_dashboard.totalPatients')}</dt>
                  <dd>
                    <div className="text-lg font-medium text-slate-900 dark:text-white">{assignedPatients.length}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 overflow-hidden shadow dark:shadow-xl rounded-lg border border-slate-200 dark:border-slate-800">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertCircle className="h-6 w-6 text-red-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-slate-500 dark:text-slate-400 truncate">{t('professional_dashboard.criticalAlerts')}</dt>
                  <dd>
                    <div className="text-lg font-medium text-slate-900 dark:text-white">
                      {assignedPatients.filter(p => p.condition === 'critical').length}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 overflow-hidden shadow dark:shadow-xl rounded-lg border border-slate-200 dark:border-slate-800">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-6 w-6 text-orange-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-slate-500 dark:text-slate-400 truncate">
                    {userRole === 'doctor' ? 'Pending Approvals' : 'Assigned Total'}
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-slate-900 dark:text-white">
                      {userRole === 'doctor' ? pendingPatients.length : assignedPatients.length}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Patient Requests - DOCTOR ONLY */}
      {userRole === 'doctor' && pendingPatients.length > 0 && (
        <div className="bg-white dark:bg-slate-900 shadow dark:shadow-xl rounded-lg overflow-hidden border border-blue-500/20">
          <div className="px-4 py-5 sm:px-6 bg-blue-50/50 dark:bg-blue-900/10 border-b border-blue-500/20">
            <h3 className="text-lg font-medium leading-6 text-slate-900 dark:text-white flex items-center">
              <Clock className="mr-2 h-5 w-5 text-blue-500" />
              Pending Patient Requests
            </h3>
          </div>
          <ul className="divide-y divide-slate-200 dark:divide-slate-800">
            {pendingPatients.map((patient) => (
              <li key={patient.id} className="p-4 sm:px-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                      <User className="h-6 w-6 text-slate-500" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{(patient as any).full_name || patient.name}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Condition: {patient.condition}</p>
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleApprove(patient.id || '')}
                      className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(patient.id || '')}
                      className="px-4 py-1.5 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-md text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="bg-white dark:bg-slate-900 shadow dark:shadow-xl rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <div className="relative rounded-md shadow-sm max-w-xs">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400 dark:text-slate-500" aria-hidden="true" />
            </div>
            <input
              type="text"
              className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-slate-300 dark:border-slate-600 rounded-md py-2 border bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-colors duration-200"
              placeholder="Search patients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-slate-500 dark:text-slate-400">Filter by:</span>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as 'all' | 'critical' | 'monitoring' | 'stable')}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition-colors duration-200"
            >
              <option value="all">All Statuses</option>
              <option value="critical">Critical</option>
              <option value="monitoring">Monitoring</option>
              <option value="stable">Stable</option>
            </select>
          </div>
        </div>
      </div>

      {/* Patient List */}
      <div className="bg-white dark:bg-slate-900 shadow dark:shadow-xl overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-slate-200 dark:divide-slate-800">
          {filteredPatients.map((patient) => (
            <li key={patient.id}>
              <Link to={userRole === 'doctor' ? `/doctor/patient/${patient.id}` : `/nurse/patient/${patient.id}`} className="block hover:bg-slate-50 dark:hover:bg-slate-800 transition duration-150 ease-in-out">
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                          <User className="h-6 w-6 text-slate-500" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-blue-600 dark:text-blue-500 truncate">
                          {(patient as any).full_name || patient.name}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{patient.condition}</p>
                      </div>
                    </div>
                    <div className="ml-2 flex-shrink-0 flex">
                      <span className={clsx(
                        'px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize',
                        getStatusColor(patient.condition as any)
                      )}>
                        {patient.condition}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                        <Clock className="flex-shrink-0 mr-1.5 h-5 w-5 text-slate-400 dark:text-slate-500" />
                        Registered: {new Date((patient as any).created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-slate-500 dark:text-slate-400 sm:mt-0">
                      <p>
                        Status: {(patient as any).status}
                      </p>
                      <ChevronRight className="ml-2 h-5 w-5 text-slate-400 dark:text-slate-500" />
                    </div>
                  </div>
                </div>
              </Link>
            </li>
          ))}
          {filteredPatients.length === 0 && (
            <li className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
              No patients found matching your criteria.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
