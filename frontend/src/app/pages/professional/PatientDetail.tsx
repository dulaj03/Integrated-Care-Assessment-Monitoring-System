import { useParams, Link } from 'react-router';
import { MOCK_PATIENTS } from '../../lib/mockData';
import { ArrowLeft, Send, Calendar, FileText } from 'lucide-react';
import { useState } from 'react';
import { StatusBadge } from '../../components/StatusBadge';
import { HealthTrendChart } from '../../components/HealthTrendChart';
import { calculateHealthSeverity, getHealthStatusDescription } from '../../lib/healthUtils';

export function PatientDetail() {
  const { id } = useParams<{ id: string }>();
  const patient = MOCK_PATIENTS.find(p => p.id === id);
  const [note, setNote] = useState('');

  if (!patient) {
    return <div className="p-8 text-center text-slate-500 dark:text-slate-400">Patient not found</div>;
  }

  const handleSendNote = () => {
    if (!note.trim()) return;
    alert(`Note sent to ${patient.name}: ${note}`);
    setNote('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link to="/nurse/dashboard" className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200">
          <ArrowLeft className="h-6 w-6 text-slate-600 dark:text-slate-400" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{patient.name}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{patient.age} yrs • {patient.gender} • {patient.condition}</p>
        </div>
        <span className={`ml-auto px-3 py-1 rounded-full text-sm font-medium capitalize 
          ${patient.status === 'critical' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400' :
            patient.status === 'stable' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400'}`}>
          {patient.status}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Main Chart Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Health Trend Chart with Filtering */}
          <HealthTrendChart logs={patient.logs} title="Health Trends" height={320} />

          {/* Recent Logs List */}
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow dark:shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-medium text-slate-900 dark:text-white">Recent Logs</h3>
            </div>
            <ul className="divide-y divide-slate-200 dark:divide-slate-800 max-h-96 overflow-y-auto">
              {patient.logs.map((log) => {
                const severity = calculateHealthSeverity(log);
                const statusDescription = getHealthStatusDescription(log);

                return (
                  <li
                    key={log.id}
                    className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-300 animate-fade-in"
                    title={statusDescription}
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{new Date(log.date).toLocaleString()}</p>
                        <div className="mt-1 flex flex-wrap gap-2">
                          {log.symptoms.length > 0 ? log.symptoms.map(s => (
                            <span key={s} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 transition-opacity duration-200">
                              {s}
                            </span>
                          )) : <span className="text-xs text-slate-500 dark:text-slate-400">No symptoms reported</span>}
                        </div>
                        {log.notes && <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 italic">"{log.notes}"</p>}
                      </div>
                      <div className="flex flex-col items-end gap-3 min-w-fit">
                        {/* Status Badge */}
                        <div className="transform transition-transform duration-200 hover:scale-105">
                          <StatusBadge
                            severity={severity}
                            size="sm"
                            showIcon={true}
                          />
                        </div>
                        {/* Vital Signs */}
                        <div className="text-right text-sm text-slate-500 dark:text-slate-400">
                          <div>BP: {log.vitals.bloodPressure}</div>
                          <div>HR: {log.vitals.heartRate}</div>
                          <div className={log.vitals.oxygenLevel && log.vitals.oxygenLevel < 95 ? 'text-red-600 dark:text-red-500 font-bold' : ''}>
                            SpO2: {log.vitals.oxygenLevel}%
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">

          <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow dark:shadow-xl">
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4">Round Observations</h3>
            <textarea
              rows={4}
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-slate-300 dark:border-slate-600 rounded-md p-2 border bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 mb-4 transition-colors duration-200"
              placeholder="Add a note or recommendation..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <button
              onClick={handleSendNote}
              disabled={!note.trim()}
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900 focus:ring-blue-500 disabled:opacity-50 transition-colors duration-200"
            >
              <Send className="mr-2 h-4 w-4" />
              Send Note
            </button>
          </div>

          {/* Medications */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow dark:shadow-xl">
            <div className="flex items-center mb-4">
              <FileText className="h-5 w-5 text-slate-400 dark:text-slate-500 mr-2" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-white">Current Medications</h3>
            </div>
            <ul className="space-y-3">
              {patient.medications.map((med, i) => (
                <li key={i} className="text-sm border-b border-slate-100 dark:border-slate-800 pb-2 last:border-0">
                  <div className="font-medium text-slate-900 dark:text-white">{med.name}</div>
                  <div className="text-slate-500 dark:text-slate-400">{med.dosage} • {med.frequency}</div>
                </li>
              ))}
            </ul>
          </div>

          {/* Upcoming Appts */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow dark:shadow-xl">
            <div className="flex items-center mb-4">
              <Calendar className="h-5 w-5 text-slate-400 dark:text-slate-500 mr-2" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-white">Appointments</h3>
            </div>
            <ul className="space-y-3">
              {patient.upcomingAppointments.length > 0 ? patient.upcomingAppointments.map((appt) => (
                <li key={appt.id} className="text-sm border-b border-slate-100 dark:border-slate-800 pb-2 last:border-0">
                  <div className="font-medium text-slate-900 dark:text-white">{appt.title}</div>
                  <div className="text-slate-500 dark:text-slate-400">{new Date(appt.date).toLocaleDateString()}</div>
                  <div className="text-xs text-slate-400 dark:text-slate-500">{appt.location}</div>
                </li>
              )) : <p className="text-sm text-slate-500 dark:text-slate-400">No upcoming appointments.</p>}
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
}
