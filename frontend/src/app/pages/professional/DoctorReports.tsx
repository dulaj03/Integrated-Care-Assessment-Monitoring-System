import { FileText, Download, Calendar, User, TrendingUp, AlertCircle, CheckCircle, Plus, Filter, Search } from 'lucide-react';
import { useState } from 'react';
import { format } from 'date-fns';

interface MedicalReport {
  id: string;
  patientName: string;
  patientAge: number;
  reportType: 'lab-results' | 'diagnostic-imaging' | 'clinical-summary' | 'progress-note' | 'discharge-summary';
  date: string;
  status: 'pending' | 'completed' | 'reviewed';
  findings?: string;
  recommendations?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
}

export function DoctorReports() {
  const [reports, setReports] = useState<MedicalReport[]>([
    {
      id: 'report-1',
      patientName: 'Nimal Jayasinghe',
      patientAge: 68,
      reportType: 'lab-results',
      date: new Date().toISOString(),
      status: 'pending',
      priority: 'high',
      findings: 'Elevated fasting glucose levels (180 mg/dL), HbA1c 8.2%',
      recommendations: 'Adjust Metformin dosage, recommend dietary counseling',
    },
    {
      id: 'report-2',
      patientName: 'Kusum Perera',
      patientAge: 54,
      reportType: 'progress-note',
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'completed',
      priority: 'normal',
      findings: 'Surgical wound healing well, no signs of infection',
      recommendations: 'Continue current pain management, schedule follow-up in 2 weeks',
    },
    {
      id: 'report-3',
      patientName: 'Ravi De Silva',
      patientAge: 72,
      reportType: 'diagnostic-imaging',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'reviewed',
      priority: 'urgent',
      findings: 'Chest X-ray shows increased infiltrates consistent with COPD exacerbation',
      recommendations: 'Consider hospitalization, increase oxygen therapy',
    },
    {
      id: 'report-4',
      patientName: 'Anita Sharma',
      patientAge: 45,
      reportType: 'lab-results',
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'reviewed',
      priority: 'normal',
      findings: 'TSH levels normalized (2.3 mIU/L), T4 within normal range',
      recommendations: 'Continue current Levothyroxine dose, recheck in 3 months',
    },
    {
      id: 'report-5',
      patientName: 'John Smith',
      patientAge: 55,
      reportType: 'clinical-summary',
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'pending',
      priority: 'normal',
      findings: 'Blood pressure controlled on current medications (128/80 mmHg)',
      recommendations: 'Continue current antihypertensive therapy, lifestyle modifications',
    },
    {
      id: 'report-6',
      patientName: 'Maria Garcia',
      patientAge: 62,
      reportType: 'discharge-summary',
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'completed',
      priority: 'normal',
      findings: 'Patient discharged in stable condition following arthroscopy',
      recommendations: 'Physical therapy, pain management, follow-up with orthopedics',
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.patientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || report.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getReportTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'lab-results': 'Lab Results',
      'diagnostic-imaging': 'Diagnostic Imaging',
      'clinical-summary': 'Clinical Summary',
      'progress-note': 'Progress Note',
      'discharge-summary': 'Discharge Summary',
    };
    return labels[type] || type;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
    case 'completed':
      return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
    case 'reviewed':
      return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300';
    case 'pending':
      return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300';
    default:
      return 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
    case 'urgent':
      return 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20';
    case 'high':
      return 'border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20';
    case 'normal':
      return 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20';
    case 'low':
      return 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20';
    default:
      return 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800';
    }
  };

  const ReportCard = ({ report }: { report: MedicalReport }) => (
    <div className={`rounded-lg border-2 p-4 ${getPriorityColor(report.priority)}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-slate-900 dark:text-white">
              {report.patientName}
            </h4>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
              {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
            </span>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {report.patientAge}y • {getReportTypeLabel(report.reportType)}
          </p>
        </div>
        {report.priority === 'urgent' && (
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
        )}
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
          <Calendar className="h-4 w-4" />
          <span>{format(new Date(report.date), 'MMM d, yyyy • h:mm a')}</span>
        </div>

        {report.findings && (
          <div className="p-3 rounded bg-slate-100 dark:bg-slate-700/50">
            <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Findings</p>
            <p className="text-sm text-slate-700 dark:text-slate-300">{report.findings}</p>
          </div>
        )}

        {report.recommendations && (
          <div className="p-3 rounded bg-slate-100 dark:bg-slate-700/50">
            <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Recommendations</p>
            <p className="text-sm text-slate-700 dark:text-slate-300">{report.recommendations}</p>
          </div>
        )}
      </div>

      <div className="flex gap-2 pt-3 border-t border-slate-300 dark:border-slate-600">
        <button className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors border border-slate-300 dark:border-slate-600">
          <FileText className="h-4 w-4" />
          View Full
        </button>
        <button className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium rounded-md bg-blue-600 dark:bg-blue-700 text-white hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors">
          <Download className="h-4 w-4" />
          Download
        </button>
      </div>
    </div>
  );

  const stats = {
    total: filteredReports.length,
    pending: filteredReports.filter(r => r.status === 'pending').length,
    completed: filteredReports.filter(r => r.status === 'completed').length,
    reviewed: filteredReports.filter(r => r.status === 'reviewed').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-slate-900 dark:text-white sm:text-3xl sm:truncate">
            Medical Reports
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            View and manage patient medical reports and lab results
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900 focus:ring-blue-500 transition-colors duration-200">
            <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            New Report
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
          <div>
            <p className="text-sm text-slate-600 dark:text-slate-400">Total Reports</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
          <div>
            <p className="text-sm text-slate-600 dark:text-slate-400">Pending</p>
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pending}</p>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
          <div>
            <p className="text-sm text-slate-600 dark:text-slate-400">Completed</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.completed}</p>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
          <div>
            <p className="text-sm text-slate-600 dark:text-slate-400">Reviewed</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.reviewed}</p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by patient name..."
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
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="reviewed">Reviewed</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Priority</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="normal">Normal</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Reports Grid */}
      <div>
        {filteredReports.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredReports.map(report => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 p-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-500" />
            <h3 className="mt-2 text-sm font-medium text-slate-900 dark:text-white">
              No reports found
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
