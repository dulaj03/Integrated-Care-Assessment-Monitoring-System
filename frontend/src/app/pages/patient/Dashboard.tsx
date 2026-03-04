import { useState } from 'react';
import { Activity, Calendar, Droplet, Heart, Thermometer, TrendingUp, AlertCircle, Plus, FlaskConical, Pill, ClipboardList, ChevronRight, Building2, CheckCircle2, Clock, Send, User, History as HistoryIcon } from 'lucide-react';
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
  getPatientNurseReports,
  LAB_STATUS_STEPS,
} from '../../lib/hospitalData';
import { useTranslation } from 'react-i18next';
import { useSearchParams, Link } from 'react-router';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';

export function PatientDashboard() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const isPending = false; // Patients no longer need approval

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
  const nurseReports = getPatientNurseReports(patient.id);

  const readyTests = labTests.filter(t => t.status === 'results_ready');
  const upcomingHospitalAppts = hospitalAppointments.filter(a => a.status === 'confirmed' || a.status === 'requested');
  const activeOrders = orders.filter(o => o.status === 'active');

  const [isLogFormOpen, setIsLogFormOpen] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [criticalAlert, setCriticalAlert] = useState<string | null>(null);
  const [logFormData, setLogFormData] = useState({
    systolic: '',
    diastolic: '',
    heartRate: '',
    temperature: '',
    oxygenLevel: '',
  });

  const handleLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const bpSystolic = parseInt(logFormData.systolic);
    const bpDiastolic = parseInt(logFormData.diastolic);
    const hr = parseInt(logFormData.heartRate);
    const temp = parseFloat(logFormData.temperature);
    const spo2 = parseInt(logFormData.oxygenLevel);

    let isCritical = false;
    let reasons = [];

    if (bpSystolic > 150 || bpDiastolic > 100) {
      isCritical = true;
      reasons.push('High Blood Pressure');
    }
    if (hr > 110) {
      isCritical = true;
      reasons.push('High Heart Rate');
    }
    if (spo2 < 92) {
      isCritical = true;
      reasons.push('Low Oxygen Level');
    }
    if (temp > 38.5) {
      isCritical = true;
      reasons.push('High Temperature');
    }

    if (isCritical) {
      setCriticalAlert(`Critical Alert: ${reasons.join(', ')}. Your care team has been notified.`);
    } else {
      setCriticalAlert(null);
    }

    setIsLogFormOpen(false);
    // In a real app: POST /health-logs and GET /patients/:id/status
  };

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
          <button
            onClick={() => setIsLogFormOpen(true)}
            disabled={isPending}
            className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-colors duration-200 ${isPending ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600'}`}
          >
            <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            {t('patient_dashboard.logHealth')}
          </button>
        </div>
      </div>

      {/* Pending Approval Banner */}
      {isPending && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-xl bg-blue-50 dark:bg-blue-900/40 p-6 border-2 border-blue-200 dark:border-blue-700 flex flex-col md:flex-row items-center gap-6"
        >
          <div className="h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center flex-shrink-0 animate-pulse">
            <Clock className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-blue-800 dark:text-blue-300">Registration Pending Approval</h3>
            <p className="mt-1 text-slate-600 dark:text-slate-300">
              Welcome to I-CAMS! Your registration has been sent to your selected doctor for review.
              Once approved, you will have full access to log your health data and view hospital services.
            </p>
            <div className="mt-4 flex items-center gap-2">
              <span className="px-3 py-1 bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-700 rounded-full text-xs font-semibold text-blue-700 dark:text-blue-400 flex items-center gap-1">
                <Building2 className="h-3 w-3" /> {sessionStorage.getItem('selectedHospitalName') || 'Nawaloka Hospital'}
              </span>
              <span className="px-3 py-1 bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-700 rounded-full text-xs font-semibold text-blue-700 dark:text-blue-400 flex items-center gap-1">
                <User className="h-3 w-3" /> Dr. Sarah Perera
              </span>
            </div>
          </div>
        </motion.div>
      )}

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

      {/* Critical Alert Badge */}
      <AnimatePresence>
        {criticalAlert && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-xl bg-red-600 p-4 border border-red-500 shadow-lg shadow-red-500/20 flex items-center gap-3 animate-pulse">
              <AlertCircle className="h-6 w-6 text-white flex-shrink-0" />
              <p className="font-bold text-white text-sm">{criticalAlert}</p>
              <button onClick={() => setCriticalAlert(null)} className="ml-auto text-white/80 hover:text-white">
                <Plus className="h-5 w-5 rotate-45" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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

      {/* Quick Action Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Lab Tests Card */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 flex flex-col h-full">
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
            <div className="space-y-2 flex-1">
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

        {/* Care Orders Card */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 flex flex-col h-full">
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
            <div className="space-y-2 flex-1">
              {activeOrders.slice(0, 3).map(order => (
                <div key={order.id} className="flex items-start gap-2">
                  <span className={`mt-0.5 h-2 w-2 rounded-full flex-shrink-0 ${order.type === 'lab_test' ? 'bg-purple-500' :
                    order.type === 'medication' ? 'bg-green-500' :
                      order.type === 'scan' ? 'bg-blue-500' : 'bg-orange-500'}`} />
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{order.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Nurse shift reports card */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 flex flex-col h-full">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <HistoryIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h4 className="font-semibold text-slate-900 dark:text-white text-sm">Nurse Reports</h4>
            </div>
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{nurseReports.length} total</span>
          </div>
          {nurseReports.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-slate-400">No nurse reports yet.</p>
          ) : (
            <div className="space-y-3 flex-1">
              {nurseReports.slice(0, 2).map(report => (
                <div key={report.id} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  onClick={() => setSelectedReportId(report.id)}>
                  <p className="text-xs font-bold text-slate-900 dark:text-white mb-1 line-clamp-1">{report.title}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 mb-1">{report.summary}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">✓ {report.steps.filter(s => s.completed).length} items</span>
                    <span className="text-[10px] text-slate-400">{format(new Date(report.date), 'MMM d')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Charts + Appointments */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Health Trends chart */}
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

        {/* Appointments + Medications */}
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

      {/* Report Detail Modal */}
      <AnimatePresence>
        {selectedReportId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 dark:border-slate-800">
              <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-blue-600 text-white">
                <h3 className="font-bold text-lg">Nurse Shift Report Detail</h3>
                <button onClick={() => setSelectedReportId(null)}><Plus className="h-6 w-6 rotate-45" /></button>
              </div>
              <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
                {nurseReports.filter(r => r.id === selectedReportId).map(report => (
                  <div key={report.id} className="space-y-5">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-xl text-slate-900 dark:text-white">{report.title}</h4>
                        <p className="text-sm text-slate-500">{format(new Date(report.date), 'MMMM d, yyyy · p')}</p>
                      </div>
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase">Completed</span>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 space-y-3 border border-slate-200 dark:border-slate-700">
                      <p className="text-xs font-bold text-blue-600 uppercase">Shift Tasks</p>
                      {report.steps.map((s, i) => (
                        <div key={i} className="flex gap-3">
                          <CheckCircle2 className={`h-4 w-4 flex-shrink-0 ${s.completed ? 'text-green-500' : 'text-slate-300'}`} />
                          <div>
                            <p className={`text-sm font-semibold ${s.completed ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>{s.title}</p>
                            <p className="text-xs text-slate-500">{s.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-bold text-purple-600 uppercase">Nurse Summary</p>
                      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-purple-50 dark:bg-purple-900/10 p-4 rounded-xl border border-purple-100 dark:border-purple-900/30">
                        {report.summary}
                      </p>
                    </div>

                    {report.vitalsSnapshot && (
                      <div className="grid grid-cols-4 gap-2">
                        <div className="p-2 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 text-center">
                          <p className="text-[10px] text-red-600 font-bold uppercase">BP</p>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">{report.vitalsSnapshot.bp}</p>
                        </div>
                        <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 text-center">
                          <p className="text-[10px] text-blue-600 font-bold uppercase">SpO2</p>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">{report.vitalsSnapshot.spo2}%</p>
                        </div>
                        <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/30 text-center">
                          <p className="text-[10px] text-orange-600 font-bold uppercase">Temp</p>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">{report.vitalsSnapshot.temp}°C</p>
                        </div>
                        <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 text-center">
                          <p className="text-[10px] text-emerald-600 font-bold uppercase">HR</p>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">{report.vitalsSnapshot.hr} bpm</p>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <p className="text-xs font-bold text-amber-600 uppercase">Recommendations</p>
                      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-amber-50 dark:bg-amber-900/10 p-4 rounded-xl border border-amber-100 dark:border-amber-900/30">
                        {report.recommendations}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Health Log Modal */}
      <AnimatePresence>
        {isLogFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-800"
            >
              <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-blue-600">
                <h3 className="text-xl font-bold text-white">Daily Health Log</h3>
                <button onClick={() => setIsLogFormOpen(false)} className="text-white/80 hover:text-white transition-colors">
                  <Plus className="h-6 w-6 rotate-45" />
                </button>
              </div>
              <form onSubmit={handleLogSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Systolic BP</label>
                    <input type="number" required placeholder="e.g. 120" value={logFormData.systolic}
                      onChange={(e) => setLogFormData({ ...logFormData, systolic: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Diastolic BP</label>
                    <input type="number" required placeholder="e.g. 80" value={logFormData.diastolic}
                      onChange={(e) => setLogFormData({ ...logFormData, diastolic: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Heart Rate</label>
                    <input type="number" required placeholder="e.g. 72" value={logFormData.heartRate}
                      onChange={(e) => setLogFormData({ ...logFormData, heartRate: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Temp (°C)</label>
                    <input type="number" step="0.1" required placeholder="e.g. 36.5" value={logFormData.temperature}
                      onChange={(e) => setLogFormData({ ...logFormData, temperature: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Oxygen (SpO2 %)</label>
                  <input type="number" required placeholder="e.g. 98" value={logFormData.oxygenLevel}
                    onChange={(e) => setLogFormData({ ...logFormData, oxygenLevel: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="pt-4">
                  <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/20">
                    Submit Health Log
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
