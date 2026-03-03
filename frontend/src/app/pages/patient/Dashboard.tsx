import { Activity, Calendar, Droplet, Heart, Thermometer, TrendingUp, AlertCircle, Plus, FlaskConical, Pill, ClipboardList, ChevronRight, Building2, CheckCircle2, Clock } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CURRENT_USER_PATIENT } from '../../lib/mockData';
import {
  getPatientLabTests,
  getPatientOrders,
  getPatientAppointments,
  getLabStatusLabel,
  getLabStatusColor,
  getHospitalById,
  getDoctorById,
  LAB_STATUS_STEPS,
} from '../../lib/hospitalData';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { motion } from 'motion/react';

export function PatientDashboard() {
  const { t } = useTranslation();
  const patient = CURRENT_USER_PATIENT;
  const recentLogs = patient.logs.slice(0, 7).reverse();

  const chartData = recentLogs.map(log => ({
    name: new Date(log.date).toLocaleDateString('en-US', { weekday: 'short' }),
    systolic: log.vitals.bloodPressure ? parseInt(log.vitals.bloodPressure.split('/')[0]) : 0,
    diastolic: log.vitals.bloodPressure ? parseInt(log.vitals.bloodPressure.split('/')[1]) : 0,
    heartRate: log.vitals.heartRate,
  }));

  const latestLog = patient.logs[0];

  // Hospital data
  const labTests = getPatientLabTests(patient.id);
  const orders = getPatientOrders(patient.id);
  const hospitalAppointments = getPatientAppointments(patient.id);

  const pendingTests = labTests.filter(t => !['results_ready', 'reviewed_by_doctor'].includes(t.status));
  const readyTests = labTests.filter(t => t.status === 'results_ready');
  const upcomingHospitalAppts = hospitalAppointments.filter(a => a.status === 'confirmed' || a.status === 'requested');
  const activeOrders = orders.filter(o => o.status === 'active');

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-slate-900 dark:text-white sm:text-3xl sm:truncate">
            {t('patient_dashboard.greeting')}, {patient.name.split(' ')[0]}!
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {t('patient_dashboard.healthOverview')}
          </p>
        </div>
        <div className="mt-4 flex gap-3 md:mt-0 md:ml-4">
          <Link to="/patient/hospitals"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 dark:bg-emerald-700 hover:bg-emerald-700 dark:hover:bg-emerald-600 transition-colors duration-200"
          >
            <Building2 className="-ml-1 mr-2 h-4 w-4" />
            Book Hospital
          </Link>
          <Link to="/patient/log"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-200"
          >
            <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            {t('patient_dashboard.logHealth')}
          </Link>
        </div>
      </div>

      {/* Alert Banner */}
      {patient.status !== 'stable' && (
        <div className="rounded-md bg-yellow-50 dark:bg-yellow-900/30 p-4 border border-yellow-200 dark:border-yellow-800">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-yellow-400 flex-shrink-0" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">{t('patient_dashboard.attentionNeeded')}</h3>
              <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-400">
                {t('patient_dashboard.statusWarning')} <strong>{patient.status}</strong>. {t('patient_dashboard.pleaseEnsure')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Lab Result Ready Banner */}
      {readyTests.length > 0 && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-xl bg-green-50 dark:bg-green-900/30 p-4 border border-green-200 dark:border-green-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
            <div>
              <p className="font-semibold text-green-800 dark:text-green-300 text-sm">Lab Results Ready!</p>
              <p className="text-xs text-green-700 dark:text-green-400">
                {readyTests.length} test result{readyTests.length > 1 ? 's are' : ' is'} available: {readyTests.map(t => t.testName).join(', ')}
              </p>
            </div>
          </div>
          <Link to="/patient/lab-results"
            className="flex items-center gap-1 text-sm font-semibold text-green-700 dark:text-green-300 hover:text-green-900 dark:hover:text-green-100 transition-colors">
            View Results <ChevronRight className="h-4 w-4" />
          </Link>
        </motion.div>
      )}

      {/* Vitals Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: t('patient_dashboard.bloodPressure'), value: latestLog?.vitals.bloodPressure || 'N/A', icon: Activity, color: 'text-slate-400', sub: 'Normal range' },
          { label: t('patient_dashboard.heartRate'), value: `${latestLog?.vitals.heartRate || 'N/A'} bpm`, icon: Heart, color: 'text-red-400', sub: 'Resting rate' },
          { label: t('patient_dashboard.temperature'), value: `${latestLog?.vitals.temperature || 'N/A'}°C`, icon: Thermometer, color: 'text-orange-400', sub: 'Last checked' },
          { label: t('patient_dashboard.bloodOxygen'), value: `${latestLog?.vitals.oxygenLevel || 'N/A'}%`, icon: Droplet, color: 'text-blue-400', sub: 'SpO2' },
        ].map(vital => (
          <div key={vital.label} className="bg-white dark:bg-slate-900 overflow-hidden shadow dark:shadow-xl rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <vital.icon className={`h-6 w-6 ${vital.color} flex-shrink-0`} />
                <div className="ml-5 w-0 flex-1">
                  <dt className="text-sm font-medium text-slate-500 dark:text-slate-400 truncate">{vital.label}</dt>
                  <dd className="text-lg font-medium text-slate-900 dark:text-white">{vital.value}</dd>
                </div>
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 px-5 py-3">
              <span className="text-sm text-slate-500 dark:text-slate-400">{vital.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Action Cards — Hospital Workflow */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Pending Lab Tests */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FlaskConical className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <h4 className="font-semibold text-slate-900 dark:text-white text-sm">Lab Tests</h4>
            </div>
            <Link to="/patient/lab-results" className="text-xs text-blue-600 dark:text-blue-400 hover:underline">View all</Link>
          </div>
          {labTests.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-slate-400">No lab tests ordered.</p>
          ) : (
            <div className="space-y-2">
              {labTests.slice(0, 3).map(test => (
                <div key={test.id} className="flex items-center justify-between">
                  <p className="text-xs text-slate-700 dark:text-slate-300 truncate flex-1 mr-2">{test.testName}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${getLabStatusColor(test.status)}`}>
                    {getLabStatusLabel(test.status)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Active Doctor Orders */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h4 className="font-semibold text-slate-900 dark:text-white text-sm">Care Orders</h4>
            </div>
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{activeOrders.length} active</span>
          </div>
          {activeOrders.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-slate-400">No active orders.</p>
          ) : (
            <div className="space-y-2">
              {activeOrders.slice(0, 3).map(order => (
                <div key={order.id} className="flex items-start gap-2">
                  <span className={`mt-0.5 h-2 w-2 rounded-full flex-shrink-0 ${order.type === 'lab_test' ? 'bg-purple-500' :
                      order.type === 'medication' ? 'bg-green-500' :
                        order.type === 'scan' ? 'bg-blue-500' : 'bg-orange-500'
                    }`} />
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{order.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Hospital Appointments */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <h4 className="font-semibold text-slate-900 dark:text-white text-sm">Hospital Appointments</h4>
            </div>
            <Link to="/patient/appointments" className="text-xs text-blue-600 dark:text-blue-400 hover:underline">View all</Link>
          </div>
          {upcomingHospitalAppts.length === 0 ? (
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">No upcoming appointments.</p>
              <Link to="/patient/hospitals" className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                <Plus className="h-3 w-3" /> Book an appointment
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {upcomingHospitalAppts.slice(0, 2).map(appt => {
                const doc = getDoctorById(appt.doctorId);
                const hosp = getHospitalById(appt.hospitalId);
                return (
                  <div key={appt.id} className="text-xs">
                    <p className="font-medium text-slate-800 dark:text-slate-200">{doc?.name}</p>
                    <p className="text-slate-500 dark:text-slate-400">{hosp?.name}</p>
                    <p className="text-blue-600 dark:text-blue-400">{format(new Date(appt.date), 'MMM d')} · {appt.timeSlot}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Charts + Appointments */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Chart */}
        <div className="bg-white dark:bg-slate-900 shadow dark:shadow-xl rounded-lg p-6">
          <h3 className="text-lg leading-6 font-medium text-slate-900 dark:text-white mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-blue-500" />
            Health Trends (Last 7 Days)
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorBP" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorHR" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#8a92a1" />
                <YAxis stroke="#8a92a1" />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#4b5563" />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '0.5rem', color: '#e2e8f0' }} />
                <Area type="monotone" dataKey="systolic" stroke="#3B82F6" fillOpacity={1} fill="url(#colorBP)" name="Systolic BP" />
                <Area type="monotone" dataKey="heartRate" stroke="#EF4444" fillOpacity={1} fill="url(#colorHR)" name="Heart Rate" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Upcoming Appointments + Medications */}
        <div className="bg-white dark:bg-slate-900 shadow dark:shadow-xl rounded-lg p-6">
          <h3 className="text-lg leading-6 font-medium text-slate-900 dark:text-white mb-4 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-blue-500" />
            Upcoming Appointments
          </h3>

          {patient.upcomingAppointments.length > 0 ? (
            <ul className="divide-y divide-slate-200 dark:divide-slate-800">
              {patient.upcomingAppointments.map((appt) => (
                <li key={appt.id} className="py-4">
                  <div className="flex space-x-3">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-slate-900 dark:text-white">{appt.title}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{new Date(appt.date).toLocaleDateString()}</p>
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{appt.location}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-500 dark:text-slate-400 text-sm">No upcoming appointments scheduled.</p>
          )}

          <div className="mt-6 border-t border-slate-200 dark:border-slate-800 pt-4">
            <div className="flex items-center gap-2 mb-2">
              <Pill className="h-4 w-4 text-green-500" />
              <h4 className="text-sm font-medium text-slate-900 dark:text-white">My Medications</h4>
            </div>
            <ul className="space-y-2">
              {patient.medications.map((med, idx) => (
                <li key={idx} className="text-sm text-slate-600 dark:text-slate-400 flex justify-between">
                  <span>{med.name}</span>
                  <span className="text-slate-400 dark:text-slate-500">{med.dosage} - {med.frequency}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
