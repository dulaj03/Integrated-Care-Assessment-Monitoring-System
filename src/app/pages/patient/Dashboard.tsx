import { Activity, Calendar, Droplet, Heart, Thermometer, TrendingUp, AlertCircle, Plus } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CURRENT_USER_PATIENT } from '../../lib/mockData';
import { Link } from 'react-router';

export function PatientDashboard() {
  const patient = CURRENT_USER_PATIENT;
  const recentLogs = patient.logs.slice(0, 7).reverse(); // Last 7 entries for chart

  // Prepare data for chart
  const chartData = recentLogs.map(log => ({
    name: new Date(log.date).toLocaleDateString('en-US', { weekday: 'short' }),
    systolic: log.vitals.bloodPressure ? parseInt(log.vitals.bloodPressure.split('/')[0]) : 0,
    diastolic: log.vitals.bloodPressure ? parseInt(log.vitals.bloodPressure.split('/')[1]) : 0,
    heartRate: log.vitals.heartRate,
  }));

  const latestLog = patient.logs[0];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-slate-900 sm:text-3xl sm:truncate">
            Hello, {patient.name.split(' ')[0]}!
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Here is your health overview for today.
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <Link
            to="/patient/log"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Log Health
          </Link>
        </div>
      </div>

      {/* Alert Banner if status is not stable */}
      {patient.status !== 'stable' && (
        <div className="rounded-md bg-yellow-50 p-4 border border-yellow-200">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-yellow-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Attention Needed</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  Your current status is marked as <strong>{patient.status}</strong>. Please ensure you are logging your vitals daily and following your doctor's advice.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Vitals Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Blood Pressure */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Activity className="h-6 w-6 text-slate-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-slate-500 truncate">Blood Pressure</dt>
                  <dd>
                    <div className="text-lg font-medium text-slate-900">{latestLog?.vitals.bloodPressure || 'N/A'}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-slate-50 px-5 py-3">
            <div className="text-sm">
              <span className="text-green-600 font-medium">Normal range </span>
            </div>
          </div>
        </div>

        {/* Heart Rate */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Heart className="h-6 w-6 text-red-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-slate-500 truncate">Heart Rate</dt>
                  <dd>
                    <div className="text-lg font-medium text-slate-900">{latestLog?.vitals.heartRate || 'N/A'} bpm</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
           <div className="bg-slate-50 px-5 py-3">
            <div className="text-sm">
               <span className="text-slate-500">Resting rate</span>
            </div>
          </div>
        </div>

        {/* Temperature */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Thermometer className="h-6 w-6 text-orange-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-slate-500 truncate">Temperature</dt>
                  <dd>
                    <div className="text-lg font-medium text-slate-900">{latestLog?.vitals.temperature || 'N/A'} °C</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
           <div className="bg-slate-50 px-5 py-3">
            <div className="text-sm">
              <span className="text-slate-500">Last checked</span>
            </div>
          </div>
        </div>

        {/* Oxygen */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Droplet className="h-6 w-6 text-blue-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-slate-500 truncate">Oxygen Level</dt>
                  <dd>
                    <div className="text-lg font-medium text-slate-900">{latestLog?.vitals.oxygenLevel || 'N/A'}%</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
           <div className="bg-slate-50 px-5 py-3">
            <div className="text-sm">
              <span className="text-slate-500">SpO2</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Chart Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg leading-6 font-medium text-slate-900 mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-blue-500" />
            Health Trends (Last 7 Days)
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorBP" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorHR" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" />
                <YAxis />
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <Tooltip />
                <Area type="monotone" dataKey="systolic" stroke="#3B82F6" fillOpacity={1} fill="url(#colorBP)" name="Systolic BP" />
                <Area type="monotone" dataKey="heartRate" stroke="#EF4444" fillOpacity={1} fill="url(#colorHR)" name="Heart Rate" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Appointments / Next Steps */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg leading-6 font-medium text-slate-900 mb-4 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-blue-500" />
            Upcoming Appointments
          </h3>
          
          {patient.upcomingAppointments.length > 0 ? (
            <ul className="divide-y divide-slate-200">
              {patient.upcomingAppointments.map((appt) => (
                <li key={appt.id} className="py-4">
                  <div className="flex space-x-3">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-slate-900">{appt.title}</h3>
                        <p className="text-sm text-slate-500">{new Date(appt.date).toLocaleDateString()}</p>
                      </div>
                      <p className="text-sm text-slate-500">{appt.location}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
             <p className="text-slate-500 text-sm">No upcoming appointments scheduled.</p>
          )}

          <div className="mt-6 border-t border-slate-200 pt-4">
             <h4 className="text-sm font-medium text-slate-900 mb-2">My Medications</h4>
             <ul className="space-y-2">
                {patient.medications.map((med, idx) => (
                    <li key={idx} className="text-sm text-slate-600 flex justify-between">
                        <span>{med.name}</span>
                        <span className="text-slate-400">{med.dosage} - {med.frequency}</span>
                    </li>
                ))}
             </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
