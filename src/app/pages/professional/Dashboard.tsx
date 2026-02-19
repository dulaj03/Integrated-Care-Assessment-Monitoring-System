import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Search, Filter, AlertCircle, CheckCircle, Clock, ChevronRight, User } from 'lucide-react';
import { MOCK_PATIENTS, Patient } from '../../lib/mockData';
import { clsx } from 'clsx';

export function ProfessionalDashboard() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'critical' | 'monitoring' | 'stable'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPatients = MOCK_PATIENTS.filter(patient => {
    const matchesFilter = filter === 'all' || patient.status === filter;
    const matchesSearch = patient.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          patient.condition.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status: Patient['status']) => {
    switch (status) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'monitoring': return 'bg-yellow-100 text-yellow-800';
      case 'stable': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Patient Overview</h1>
        <div className="mt-4 sm:mt-0">
          <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            Add New Patient
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <User className="h-6 w-6 text-slate-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-slate-500 truncate">Total Patients</dt>
                  <dd>
                    <div className="text-lg font-medium text-slate-900">{MOCK_PATIENTS.length}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertCircle className="h-6 w-6 text-red-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-slate-500 truncate">Critical Alerts</dt>
                  <dd>
                    <div className="text-lg font-medium text-slate-900">
                      {MOCK_PATIENTS.filter(p => p.status === 'critical').length}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-slate-500 truncate">Pending Reviews</dt>
                  <dd>
                    <div className="text-lg font-medium text-slate-900">2</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white shadow rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <div className="relative rounded-md shadow-sm max-w-xs">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-slate-300 rounded-md py-2 border"
              placeholder="Search patients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-slate-500">Filter by:</span>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
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
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-slate-200">
          {filteredPatients.map((patient) => (
            <li key={patient.id}>
              <Link to={`/doctor/patient/${patient.id}`} className="block hover:bg-slate-50 transition duration-150 ease-in-out">
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                            <img className="h-10 w-10 rounded-full object-cover" src={patient.avatar} alt="" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-blue-600 truncate">{patient.name}</p>
                            <p className="text-sm text-slate-500 truncate">{patient.condition}</p>
                        </div>
                    </div>
                    <div className="ml-2 flex-shrink-0 flex">
                      <span className={clsx(
                        "px-2 inline-flex text-xs leading-5 font-semibold rounded-full",
                        getStatusColor(patient.status)
                      )}>
                        {patient.status}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-slate-500">
                        <User className="flex-shrink-0 mr-1.5 h-5 w-5 text-slate-400" />
                        {patient.age} yrs, {patient.gender}
                      </p>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-slate-500 sm:mt-0">
                      <Clock className="flex-shrink-0 mr-1.5 h-5 w-5 text-slate-400" />
                      <p>
                        Last update: {new Date(patient.lastUpdate).toLocaleDateString()}
                      </p>
                      <ChevronRight className="ml-2 h-5 w-5 text-slate-400" />
                    </div>
                  </div>
                </div>
              </Link>
            </li>
          ))}
          {filteredPatients.length === 0 && (
            <li className="px-4 py-8 text-center text-slate-500">
                No patients found matching your criteria.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
