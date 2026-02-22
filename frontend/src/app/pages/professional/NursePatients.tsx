import { Users, AlertCircle, Clock, Heart, CheckCircle, Plus, Search, Filter } from 'lucide-react';
import { useState } from 'react';
import { MOCK_PATIENTS, MOCK_DOCTORS } from '../../lib/mockData';
import { format } from 'date-fns';

interface AssignedPatient {
  id: string;
  name: string;
  age: number;
  condition: string;
  status: 'stable' | 'monitoring' | 'critical' | 'recovered';
  lastCheck: string;
  room: string;
  vitalSigns: {
    bloodPressure?: string;
    heartRate?: number;
    temperature?: number;
  };
  assignedDoctor: string;
}

export function NursePatients() {
  const [patients, setPatients] = useState<AssignedPatient[]>([
    {
      id: 'p1',
      name: 'Nimal Jayasinghe',
      age: 68,
      condition: 'Hypertension & Type 2 Diabetes',
      status: 'monitoring',
      lastCheck: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      room: 'Ward A - Room 302',
      vitalSigns: {
        bloodPressure: '132/88',
        heartRate: 78,
        temperature: 37.1,
      },
      assignedDoctor: 'Dr. Sarah Perera',
    },
    {
      id: 'p2',
      name: 'Kusum Perera',
      age: 54,
      condition: 'Post-Surgery Recovery',
      status: 'stable',
      lastCheck: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
      room: 'Ward B - Room 215',
      vitalSigns: {
        bloodPressure: '118/76',
        heartRate: 72,
        temperature: 36.8,
      },
      assignedDoctor: 'Dr. Sarah Perera',
    },
    {
      id: 'p3',
      name: 'Ravi De Silva',
      age: 72,
      condition: 'COPD',
      status: 'critical',
      lastCheck: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
      room: 'ICU - Room 5',
      vitalSigns: {
        bloodPressure: '145/92',
        heartRate: 105,
        temperature: 37.8,
      },
      assignedDoctor: 'Dr. Kamal Silva',
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.room.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.condition.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || patient.status === statusFilter;
    return matchesSearch && matchesStatus;
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

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const checkTime = new Date(date);
    const diffMinutes = Math.floor((now.getTime() - checkTime.getTime()) / (1000 * 60));

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const PatientCard = ({ patient }: { patient: AssignedPatient }) => (
    <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              {patient.name}
            </h3>
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(patient.status)}`}>
              {patient.status.charAt(0).toUpperCase() + patient.status.slice(1)}
            </span>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {patient.age} years • {patient.condition}
          </p>
        </div>
        {patient.status === 'critical' && (
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
        )}
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
          <span className="font-medium">Room:</span>
          <span>{patient.room}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
          <Clock className="h-4 w-4" />
          <span>Last check: {getTimeAgo(patient.lastCheck)}</span>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-4 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">BP</p>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              {patient.vitalSigns.bloodPressure || 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">HR</p>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              {patient.vitalSigns.heartRate ? `${patient.vitalSigns.heartRate} bpm` : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Temp</p>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              {patient.vitalSigns.temperature ? `${patient.vitalSigns.temperature}°C` : 'N/A'}
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
        <button className="flex-1 px-3 py-2 text-sm font-medium rounded-md bg-blue-600 dark:bg-blue-700 text-white hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors">
          Check Vitals
        </button>
        <button className="flex-1 px-3 py-2 text-sm font-medium rounded-md bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">
          View Details
        </button>
      </div>
    </div>
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
            Manage and monitor your assigned patients
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
      </div>

      {/* Search and Filter */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, room, or condition..."
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

      {/* Patient List */}
      <div>
        {filteredPatients.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredPatients.map(patient => (
              <PatientCard key={patient.id} patient={patient} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 p-12 text-center">
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
    </div>
  );
}
