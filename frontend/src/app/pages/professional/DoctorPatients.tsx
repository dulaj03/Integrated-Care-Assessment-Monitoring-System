import { Users, AlertCircle, CheckCircle, Clock, Plus, Search, Filter, TrendingUp, Pill } from 'lucide-react';
import { useState } from 'react';
import { MOCK_PATIENTS, Patient } from '../../lib/mockData';
import { format } from 'date-fns';
import { Link } from 'react-router';

export function DoctorPatients() {
  const userId = sessionStorage.getItem('userId') || 'd1';
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredPatients = MOCK_PATIENTS.filter(patient => {
    const isAssigned = patient.assignedDoctorId === userId;
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.condition.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || patient.status === statusFilter;
    return isAssigned && matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'stable':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
      case 'monitoring':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300';
      case 'critical':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
      case 'recovered':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300';
      default:
        return 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300';
    }
  };

  const PatientRow = ({ patient }: { patient: Patient }) => (
    <tr className="border-t border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap">
        <div>
          <p className="font-medium text-slate-900 dark:text-white">{patient.name}</p>
          <p className="text-sm text-slate-600 dark:text-slate-400">{patient.age}y, {patient.gender}</p>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <p className="text-sm text-slate-700 dark:text-slate-300">{patient.condition}</p>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(patient.status)}`}>
          {patient.status.charAt(0).toUpperCase() + patient.status.slice(1)}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
        {format(new Date(patient.lastUpdate), 'MMM d, yyyy')}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
        {patient.upcomingAppointments?.[0] ? format(new Date(patient.upcomingAppointments[0].date), 'MMM d, yyyy') : 'N/A'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
        <Link to={`/doctor/patient/${patient.id}`} className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
          View
        </Link>
        <button className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200">
          Edit
        </button>
      </td>
    </tr>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-slate-900 dark:text-white sm:text-3xl sm:truncate">
            My Patients
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage your patient records and medical history
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900 focus:ring-blue-500 transition-colors duration-200">
            <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Add Patient
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Total Patients</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{filteredPatients.length}</p>
            </div>
            <Users className="h-8 w-8 text-blue-600 dark:text-blue-400 opacity-50" />
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Critical</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{filteredPatients.filter(p => p.status === 'critical').length}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400 opacity-50" />
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Stable</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{filteredPatients.filter(p => p.status === 'stable').length}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400 opacity-50" />
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Monitoring</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{filteredPatients.filter(p => p.status === 'monitoring').length}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600 dark:text-yellow-400 opacity-50" />
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or condition..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="stable">Stable</option>
            <option value="monitoring">Monitoring</option>
            <option value="critical">Critical</option>
            <option value="recovered">Recovered</option>
          </select>
        </div>
      </div>

      {/* Patients Table */}
      <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden">
        {filteredPatients.length > 0 ? (
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">Patient</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">Condition</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">Last Visit</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">Next Appointment</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-slate-900 dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map(patient => (
                <PatientRow key={patient.id} patient={patient} />
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-12 text-center">
            <Users className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-500" />
            <h3 className="mt-2 text-sm font-medium text-slate-900 dark:text-white">
              No patients found
            </h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        )}
      </div>

      {/* Recent Notes */}
      <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Recent Clinical Notes
        </h3>
        <div className="space-y-4">
          {filteredPatients.filter(p => p.logs && p.logs.length > 0).slice(0, 3).map(patient => (
            <div key={patient.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <p className="font-medium text-slate-900 dark:text-white">{patient.name}</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(patient.status)}`}>
                  {patient.status.charAt(0).toUpperCase() + patient.status.slice(1)}
                </span>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300">{patient.logs[0].notes}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
