import { useParams, Link } from 'react-router';
import { MOCK_PATIENTS } from '../../lib/mockData';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ArrowLeft, Send, AlertTriangle, Calendar, FileText } from 'lucide-react';
import { useState } from 'react';

export function PatientDetail() {
  const { id } = useParams<{ id: string }>();
  const patient = MOCK_PATIENTS.find(p => p.id === id);
  const [note, setNote] = useState('');

  if (!patient) {
    return <div className="p-8 text-center text-slate-500">Patient not found</div>;
  }

  const chartData = [...patient.logs].reverse().map(log => ({
    date: new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    systolic: log.vitals.bloodPressure ? parseInt(log.vitals.bloodPressure.split('/')[0]) : 0,
    diastolic: log.vitals.bloodPressure ? parseInt(log.vitals.bloodPressure.split('/')[1]) : 0,
    heartRate: log.vitals.heartRate,
    oxygen: log.vitals.oxygenLevel,
  }));

  const handleSendNote = () => {
      if(!note.trim()) return;
      alert(`Note sent to ${patient.name}: ${note}`);
      setNote('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link to="/doctor/dashboard" className="p-2 rounded-full hover:bg-slate-100">
          <ArrowLeft className="h-6 w-6 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{patient.name}</h1>
          <p className="text-sm text-slate-500">{patient.age} yrs • {patient.gender} • {patient.condition}</p>
        </div>
        <span className={`ml-auto px-3 py-1 rounded-full text-sm font-medium capitalize 
          ${patient.status === 'critical' ? 'bg-red-100 text-red-800' : 
            patient.status === 'stable' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
          {patient.status}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Chart Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-slate-900 mb-4">Vitals History</h3>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" domain={[60, 110]} />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="systolic" stroke="#3B82F6" name="Systolic BP" strokeWidth={2} dot={{r: 4}} />
                  <Line yAxisId="left" type="monotone" dataKey="diastolic" stroke="#93C5FD" name="Diastolic BP" strokeWidth={2} />
                  <Line yAxisId="right" type="monotone" dataKey="heartRate" stroke="#EF4444" name="Heart Rate" strokeWidth={2} dot={{r: 4}} />
                  <Line yAxisId="right" type="monotone" dataKey="oxygen" stroke="#10B981" name="SpO2 %" strokeWidth={2} strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Logs List */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
             <div className="px-6 py-4 border-b border-slate-200">
                <h3 className="text-lg font-medium text-slate-900">Recent Logs</h3>
             </div>
             <ul className="divide-y divide-slate-200 max-h-96 overflow-y-auto">
                {patient.logs.map((log) => (
                    <li key={log.id} className="p-4 hover:bg-slate-50">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-slate-900">{new Date(log.date).toLocaleString()}</p>
                                <div className="mt-1 flex flex-wrap gap-2">
                                    {log.symptoms.length > 0 ? log.symptoms.map(s => (
                                        <span key={s} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                            {s}
                                        </span>
                                    )) : <span className="text-xs text-slate-500">No symptoms reported</span>}
                                </div>
                                {log.notes && <p className="mt-2 text-sm text-slate-600 italic">"{log.notes}"</p>}
                            </div>
                            <div className="text-right text-sm text-slate-500">
                                <div>BP: {log.vitals.bloodPressure}</div>
                                <div>HR: {log.vitals.heartRate}</div>
                                <div className={log.vitals.oxygenLevel && log.vitals.oxygenLevel < 95 ? 'text-red-600 font-bold' : ''}>
                                    SpO2: {log.vitals.oxygenLevel}%
                                </div>
                            </div>
                        </div>
                    </li>
                ))}
             </ul>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          
          {/* Action Card */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-slate-900 mb-4">Doctor's Orders</h3>
            <textarea
                rows={4}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-slate-300 rounded-md p-2 border mb-4"
                placeholder="Add a note or recommendation..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
            />
            <button
                onClick={handleSendNote}
                disabled={!note.trim()}
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
                <Send className="mr-2 h-4 w-4" />
                Send Note
            </button>
          </div>

          {/* Medications */}
          <div className="bg-white p-6 rounded-lg shadow">
             <div className="flex items-center mb-4">
                <FileText className="h-5 w-5 text-slate-400 mr-2" />
                <h3 className="text-lg font-medium text-slate-900">Current Medications</h3>
             </div>
             <ul className="space-y-3">
                {patient.medications.map((med, i) => (
                    <li key={i} className="text-sm border-b border-slate-100 pb-2 last:border-0">
                        <div className="font-medium text-slate-900">{med.name}</div>
                        <div className="text-slate-500">{med.dosage} • {med.frequency}</div>
                    </li>
                ))}
             </ul>
          </div>

          {/* Upcoming Appts */}
           <div className="bg-white p-6 rounded-lg shadow">
             <div className="flex items-center mb-4">
                <Calendar className="h-5 w-5 text-slate-400 mr-2" />
                <h3 className="text-lg font-medium text-slate-900">Appointments</h3>
             </div>
             <ul className="space-y-3">
                {patient.upcomingAppointments.length > 0 ? patient.upcomingAppointments.map((appt) => (
                    <li key={appt.id} className="text-sm border-b border-slate-100 pb-2 last:border-0">
                        <div className="font-medium text-slate-900">{appt.title}</div>
                        <div className="text-slate-500">{new Date(appt.date).toLocaleDateString()}</div>
                        <div className="text-xs text-slate-400">{appt.location}</div>
                    </li>
                )) : <p className="text-sm text-slate-500">No upcoming appointments.</p>}
             </ul>
          </div>

        </div>
      </div>
    </div>
  );
}
