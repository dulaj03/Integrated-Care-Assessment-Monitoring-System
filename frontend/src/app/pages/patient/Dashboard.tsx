import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Activity, Calendar, Droplet, Heart, Thermometer, AlertCircle, Plus, FlaskConical, Pill, ClipboardList, ChevronRight, Building2, CheckCircle2, Clock, User, History as HistoryIcon, Loader2, Bell, Send, Stethoscope, MapPin, FileText } from 'lucide-react';
import { CURRENT_USER_PATIENT } from '../../lib/mockData';
import {
  getPatientLabTests,
  getPatientOrders,
  getLabStatusLabel,
  getLabStatusColor,
  getPatientNurseReports,
} from '../../lib/hospitalData';
import { Link } from 'react-router';
import { format } from 'date-fns';
import { toast } from 'sonner';

// Safely parse a date string or object into a local Date object
function parseLocalDate(dateInput: any): Date {
  if (!dateInput) return new Date();
  if (dateInput instanceof Date) return dateInput;
  
  const dateStr = String(dateInput);
  // If it is an ISO string (like 2026-04-04T00:00:00.000Z), let standard parsing handle it
  // But if it is JUST a YYYY-MM-DD string, parse it as local midnight
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  }
  
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? new Date() : d;
}

// Format "HH:mm:ss" or ISO string time into "h:mm a"
function formatTime(timeInput: string): string {
  if (!timeInput) return '--:--';
  // If it's a full ISO string, extract time
  if (timeInput.includes('T')) {
    return format(new Date(timeInput), 'h:mm a');
  }
  // If HH:mm:ss
  const [hours, minutes] = timeInput.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes);
  return format(date, 'h:mm a');
}
import { motion, AnimatePresence } from 'motion/react';
import { HealthTrendChart } from '../../components/HealthTrendChart';
import { MessagingSection } from '../../components/MessagingSection';
import { HealthLog } from '../../lib/mockData';
import { OnboardingTour } from '../../components/OnboardingTour';

interface DbHealthLog {
  id: string | number;
  patient_id: string | number;
  systolic_bp: number;
  diastolic_bp: number;
  heart_rate: number;
  temperature: number;
  oxygen_level: number;
  mood: string;
  symptoms: string[] | string;
  notes: string;
  created_at: string;
  date?: string; // from mock data
  vitals?: {
    bloodPressure?: string;
    heartRate?: number;
    temperature?: number;
    oxygenLevel?: number;
  };
}

export function PatientDashboard() {
  const { t } = useTranslation();
  const patientId = sessionStorage.getItem('userId');
  const userEmail = sessionStorage.getItem('userEmail');
  const userName = sessionStorage.getItem('userName') || t('common.patient');

  // If we have a real user, use their data, otherwise fallback to mock
  const patient = {
    ...CURRENT_USER_PATIENT,
    id: patientId || CURRENT_USER_PATIENT.id,
    name: userName,
    email: userEmail || CURRENT_USER_PATIENT.email,
  };

  const [dbLogs, setDbLogs] = useState<DbHealthLog[]>([]);
  const [dbOrders, setDbOrders] = useState<any[]>([]);
  const [dbReports, setDbReports] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [liveAppointments, setLiveAppointments] = useState<any[]>([]);
  const [patientStatus, setPatientStatus] = useState(patient.status);
  const [patientCondition, setPatientCondition] = useState(patient.condition || 'stable');
  const [loading, setLoading] = useState(true);

  const fetchHealthLogs = async () => {
    if (!patientId || isNaN(parseInt(patientId))) return;
    const token = sessionStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch(`http://localhost:5000/api/health/all/${patientId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDbLogs(data);
      }
    } catch (error) {
      console.error('Error fetching health logs:', error);
    }
  };

  const fetchLiveAppointments = async () => {
    const token = sessionStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch('http://localhost:5000/api/appointments/my', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setLiveAppointments(data.filter((a: any) => a.status !== 'completed' && a.status !== 'cancelled'));
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const fetchNotifications = async () => {
    const token = sessionStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch('http://localhost:5000/api/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const fetchPatientOrders = async () => {
    if (!patientId) return;
    const token = sessionStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5000/api/health/orders/${patientId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setDbOrders(await res.json());
    } catch (e) { console.error(e); }
  };

  const fetchNurseReports = async () => {
    if (!patientId) return;
    const token = sessionStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5000/api/health/nurse-reports/${patientId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setDbReports(await res.json());
    } catch (e) { console.error(e); }
  };

  const [activeRounds, setActiveRounds] = useState<any[]>([]);

  const fetchActiveRounds = async () => {
    if (!patientId) return;
    const token = sessionStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5000/api/rounds/patient/${patientId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setActiveRounds(await res.json());
    } catch (e) { console.error(e); }
  };

  const fetchPatientInfo = async () => {
    const token = sessionStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch('http://localhost:5000/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const { user } = await res.json();
        setPatientStatus(user.status);
        setPatientCondition(user.condition);
      }
    } catch (error) {
      console.error('Error fetching patient info:', error);
    }
  };

  const refreshAll = useCallback(async () => {
    await Promise.all([
      fetchHealthLogs(),
      fetchNotifications(),
      fetchPatientInfo(),
      fetchLiveAppointments(),
      fetchPatientOrders(),
      fetchNurseReports(),
      fetchActiveRounds()
    ]);
    setLoading(false);
  }, [patientId]);

  useEffect(() => {
    refreshAll();
    // FR34: Dashboard polling every 30 seconds
    const interval = setInterval(refreshAll, 30000);
    return () => clearInterval(interval);
  }, [refreshAll]);

  const markNotificationRead = async (id: number) => {
    const token = sessionStorage.getItem('token');
    await fetch(`http://localhost:5000/api/notifications/mark-read/${id}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    fetchNotifications();
  };

  // Prepare all logs for the HealthTrendChart
  // Real users (numeric ID) should only see their DB logs, even if empty.
  // Mock users (non-numeric ID like 'p1') fall back to mock data for demo purposes.
  const isMockUser = !patientId || isNaN(Number(patientId));
  const logsToUse = dbLogs.length > 0 ? dbLogs : (isMockUser ? (patient as any).logs || [] : []);

  const allLogsForChart: HealthLog[] = logsToUse.map((log: any) => {
    let symptoms: string[] = [];
    try {
      symptoms = Array.isArray(log.symptoms) ? log.symptoms : (typeof log.symptoms === 'string' ? JSON.parse(log.symptoms) : []);
    } catch (e) {
      symptoms = [];
    }

    return {
      id: String(log.id || Math.random()),
      date: log.created_at || log.date || new Date().toISOString(),
      symptoms,
      notes: log.notes || '',
      vitals: {
        bloodPressure: log.systolic_bp ? `${log.systolic_bp}/${log.diastolic_bp}` : log.vitals?.bloodPressure,
        heartRate: log.heart_rate || log.vitals?.heartRate,
        temperature: log.temperature || log.vitals?.temperature,
        oxygenLevel: log.oxygen_level || (log.vitals?.oxygenLevel || log.vitals?.oxygen_level),
      },
      mood: log.mood as any,
    };
  });

  const latestLog: DbHealthLog = logsToUse.length > 0 ? logsToUse[0] : (isMockUser ? (patient.logs[0] as unknown as DbHealthLog) : null as any);

  // Hospital data - Prefer DB over Mock
  const labTests = getPatientLabTests(patient.id);
  const liveOrders = dbOrders.length > 0 ? dbOrders : getPatientOrders(patient.id);
  const nurseReports = dbReports.length > 0 ? dbReports : getPatientNurseReports(patient.id);

  const readyTests = labTests.filter(t => t.status === 'ready');
  const activeOrders = liveOrders;

  const [isLogFormOpen, setIsLogFormOpen] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [criticalAlert, setCriticalAlert] = useState<string | null>(null);
  const [logFormData, setLogFormData] = useState({
    systolic: '',
    diastolic: '',
    heartRate: '',
    temperature: '',
    oxygenLevel: '',
    mood: 'great' as 'great' | 'good' | 'okay' | 'poor' | 'bad',
    symptoms: [] as string[],
    notes: '',
  });

  const availableSymptoms = [
    'Headache', 'Fever', 'Cough', 'Fatigue',
    'Shortness of Breath', 'Dizziness', 'Nausea', 'Chest Pain'
  ];

  const handleSymptomToggle = (symptom: string) => {
    setLogFormData(prev => ({
      ...prev,
      symptoms: prev.symptoms.includes(symptom)
        ? prev.symptoms.filter(s => s !== symptom)
        : [...prev.symptoms, symptom]
    }));
  };

  const handleLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const bpSystolic = parseInt(logFormData.systolic);
    const bpDiastolic = parseInt(logFormData.diastolic);
    const hr = parseInt(logFormData.heartRate);
    const temp = parseFloat(logFormData.temperature);
    const spo2 = parseInt(logFormData.oxygenLevel);

    let isCritical = false;
    const reasons = [];

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

    try {
      const token = sessionStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/health/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          patient_id: patientId,
          systolic_bp: bpSystolic,
          diastolic_bp: bpDiastolic,
          heart_rate: hr,
          temperature: temp,
          oxygen_level: spo2,
          mood: logFormData.mood,
          symptoms: logFormData.symptoms,
          notes: logFormData.notes
        }),
      });

      if (res.ok) {
        toast.success('Health log saved successfully!');
        setIsLogFormOpen(false);
        setLogFormData({
          systolic: '',
          diastolic: '',
          heartRate: '',
          temperature: '',
          oxygenLevel: '',
          mood: 'great',
          symptoms: [],
          notes: ''
        });
        await fetchHealthLogs(); // Refresh dashboard data
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to submit health log');
      }
    } catch (err) {
      console.error('Error submitting health log:', err);
      toast.error('Network error. Is the backend running?');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
        <p className="text-slate-500 animate-pulse">{t('patient_dashboard.loadingDashboard')}</p>
      </div>
    );
  }

  const isPending = patientStatus === 'pendingdoctorapproval';

  return (
    <div className="space-y-6">
      <OnboardingTour />
      {/* Notifications Panel (FR35) */}
      {notifications.filter(n => !n.is_read).length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-blue-100 dark:border-blue-900 overflow-hidden">
          <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/40 border-b border-blue-100 dark:border-blue-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-blue-800 dark:text-blue-300 flex items-center gap-2">
              <Bell className="h-4 w-4" /> {t('patient_dashboard.newNotifications')}
            </h3>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {notifications.filter(n => !n.is_read).map(n => (
              <div key={n.id} className="p-3 flex items-start gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${n.type === 'critical' ? 'bg-red-500' : 'bg-blue-500'}`} />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{n.title}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{n.message}</p>
                </div>
                <button onClick={() => markNotificationRead(n.id)} className="text-[10px] font-bold text-blue-600 hover:text-blue-800 uppercase">Mark Read</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Welcome Header */}
      <div id="onboarding-welcome" className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-slate-900 dark:text-white sm:text-3xl sm:truncate">
            {t('patient_dashboard.greeting')}, {patient.name.split(' ')[0]}!
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {t('common.status')}: <span className="font-bold uppercase text-blue-600">{t(`common.${patientStatus}`) || patientStatus}</span> | {t('patient_dashboard.currentCondition')}: <span className={`font-bold uppercase ${patientCondition === 'critical' ? 'text-red-500' : 'text-green-500'}`}>{t(`professional_dashboard.${patientCondition}Status`) || patientCondition}</span>
          </p>
        </div>
        <div className="mt-4 flex gap-3 md:mt-0 md:ml-4">
          <Link to="/patient/hospitals"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 dark:bg-emerald-700 hover:bg-emerald-700 dark:hover:bg-emerald-600 transition-colors duration-200"
          >
            <Building2 className="-ml-1 mr-2 h-4 w-4" />
            {t('patient_dashboard.bookHospital')}
          </Link>
          <button
            onClick={() => setIsLogFormOpen(true)}
            disabled={isPending}
            className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-colors duration-200 ${isPending ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600'}`}
          >
            <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            {t('patient_dashboard.logHealthVitals')}
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
            <h3 className="text-xl font-bold text-blue-800 dark:text-blue-300">{t('patient_dashboard.registrationPending')}</h3>
            <p className="mt-1 text-slate-600 dark:text-slate-300">
              {t('patient_dashboard.pendingDesc')}
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

      {/* Active Care Journey */}
      {activeRounds.filter(r => r.status !== 'completed').length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Activity className="h-6 w-6 text-emerald-500" />
              {t('patient_dashboard.activeCareJourney')}
            </h3>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('common.realtime')}</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {activeRounds.filter(r => r.status !== 'completed').map(round => {
              const completedSteps = round.steps?.filter((s:any) => s.status === 'completed').length || 0;
              const totalSteps = round.steps?.length || 1;
              const progress = Math.round((completedSteps / totalSteps) * 100);
              const currentStep = round.steps?.find((s:any) => s.status === 'pending')?.step_name || 'Finalizing...';

              return (
                <div key={round.id} className="bg-white dark:bg-slate-900 border-2 border-emerald-100 dark:border-emerald-900/20 rounded-[2.5rem] p-6 shadow-sm relative overflow-hidden">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600">
                        <ClipboardList className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Current Task</p>
                        <h4 className="text-lg font-black text-slate-900 dark:text-white">{round.title}</h4>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-emerald-600 leading-none">{progress}%</p>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Complete</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                      <span>Next Step: <span className="text-slate-900 dark:text-white uppercase tracking-wider">{currentStep}</span></span>
                      <span>Milestone {completedSteps} of {totalSteps}</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 p-0.5">
                      <div 
                        className="bg-emerald-500 h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    
                    {/* Visual Milestone Track */}
                    <div className="flex gap-1 justify-between">
                      {round.steps?.map((step: any) => (
                        <div key={step.id} className="flex-1 flex flex-col items-center gap-1 group">
                          <div className={`h-1.5 w-full rounded-full transition-all ${step.status === 'completed' ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800'}`} />
                          <span className={`text-[8px] font-black uppercase tracking-tighter transition-opacity ${step.status === 'completed' ? 'text-emerald-500 opacity-100' : 'text-slate-300 dark:bg-slate-600 opacity-0 group-hover:opacity-100'}`}>
                            {step.step_name.split(' ')[0]}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Alert Banner */}
      {patientCondition !== 'stable' && (
        <div className={`rounded-md p-4 border ${patientCondition === 'critical' ? 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800' : 'bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800'}`}>
          <div className="flex">
            <AlertCircle className={`h-5 w-5 flex-shrink-0 ${patientCondition === 'critical' ? 'text-red-400' : 'text-yellow-400'}`} />
            <div className="ml-3">
              <h3 className={`text-sm font-medium ${patientCondition === 'critical' ? 'text-red-800 dark:text-red-300' : 'text-yellow-800 dark:text-yellow-300'}`}>{t('patient_dashboard.attentionNeeded')}</h3>
              <p className={`mt-1 text-sm ${patientCondition === 'critical' ? 'text-red-700 dark:text-red-400' : 'text-yellow-700 dark:text-yellow-400'}`}>
                {t('patient_dashboard.statusWarning')} <strong>{t(`professional_dashboard.${patientCondition}Status`) || patientCondition}</strong>.
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
              <p className="font-semibold text-green-800 dark:text-green-300 text-sm">{t('patient_dashboard.labResultsReady')}</p>
              <p className="text-xs text-green-700 dark:text-green-400">
                {readyTests.length} test result{readyTests.length > 1 ? 's are' : ' is'} available: {readyTests.map(t => t.testName).join(', ')}
              </p>
            </div>
          </div>
          <Link to="/patient/lab-results"
            className="flex items-center gap-1 text-sm font-semibold text-green-700 dark:text-green-300 hover:text-green-900 dark:hover:text-green-100 transition-colors">
            {t('patient_dashboard.viewResults')} <ChevronRight className="h-4 w-4" />
          </Link>
        </motion.div>
      )}

      {/* Vitals Cards */}
      <div id="onboarding-vitals" className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: t('patient_dashboard.bloodPressure'),
            value: latestLog?.systolic_bp ? `${latestLog.systolic_bp}/${latestLog.diastolic_bp}` : (latestLog?.vitals?.bloodPressure || 'N/A'),
            icon: Activity,
            color: 'text-slate-400',
            sub: latestLog?.created_at ? `${t('common.date')}: ${format(new Date(latestLog.created_at), 'MMM d, p')}` : (latestLog?.date ? `Record from ${format(new Date(latestLog.date), 'MMM d')}` : t('common.noData'))
          },
          {
            label: t('patient_dashboard.heartRate'),
            value: `${latestLog?.heart_rate || latestLog?.vitals?.heartRate || 'N/A'} bpm`,
            icon: Heart,
            color: 'text-red-400',
            sub: latestLog?.created_at ? `${t('common.date')}: ${format(new Date(latestLog.created_at), 'MMM d')}` : t('common.noData')
          },
          {
            label: t('patient_dashboard.temperature'),
            value: `${latestLog?.temperature || latestLog?.vitals?.temperature || 'N/A'}°C`,
            icon: Thermometer,
            color: 'text-orange-400',
            sub: latestLog?.created_at ? `${t('common.date')}: ${format(new Date(latestLog.created_at), 'MMM d')}` : t('common.noData')
          },
          {
            label: t('patient_dashboard.oxygenLevel'),
            value: `${latestLog?.oxygen_level || latestLog?.vitals?.oxygenLevel || 'N/A'}%`,
            icon: Droplet,
            color: 'text-blue-400',
            sub: latestLog?.created_at ? `${t('common.date')}: ${format(new Date(latestLog.created_at), 'MMM d')}` : t('common.noData')
          },
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

      {/* Symptoms & Mood Display */}
      {latestLog && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow p-6 border border-slate-200 dark:border-slate-800">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4 uppercase flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-500" />
              {t('patient_dashboard.currentCondition')}
            </h4>
            <div className="flex items-center gap-4 mb-4">
              <div className="text-3xl">
                {latestLog.mood === 'great' ? '😊' :
                  latestLog.mood === 'good' ? '🙂' :
                    latestLog.mood === 'okay' ? '😐' :
                      latestLog.mood === 'poor' ? '☹️' : '🤒'}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{t('patient_dashboard.currentCondition')} {t(`professional_dashboard.${latestLog.mood || 'stable'}Status`) || latestLog.mood}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{t('common.date')}: {format(new Date(latestLog.created_at || latestLog.date || ''), 'MMM d, h:mm a')}</p>
              </div>
            </div>
            {(Array.isArray(latestLog.symptoms) ? latestLog.symptoms : JSON.parse((latestLog.symptoms as string) || '[]')).length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {(Array.isArray(latestLog.symptoms) ? latestLog.symptoms : JSON.parse((latestLog.symptoms as string) || '[]')).map((symptom: string) => (
                  <span key={symptom} className="px-2 py-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-[10px] font-bold rounded-full border border-red-100 dark:border-red-800">
                    {symptom}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No symptoms reported today.</p>
            )}
          </div>
          {latestLog.notes && (
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow p-6 border border-slate-200 dark:border-slate-800">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2 uppercase">{t('patient_dashboard.additionalNotes')}</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 italic leading-relaxed">
                "{latestLog.notes}"
              </p>
            </div>
          )}
        </div>
      )}

      {/* Quick Action Cards Grid */}
      <div id="onboarding-actions" className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Lab Tests Card */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 flex flex-col h-full">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FlaskConical className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <h4 className="font-semibold text-slate-900 dark:text-white text-sm">{t('patient_dashboard.labTests')}</h4>
            </div>
            <Link to="/patient/lab-results" className="text-xs text-blue-600 dark:text-blue-400 hover:underline">{t('common.viewAll')}</Link>
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
              <h4 className="font-semibold text-slate-900 dark:text-white text-sm">{t('patient_dashboard.careOrders')}</h4>
            </div>
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{activeOrders.length} {t('common.active')}</span>
          </div>
          {activeOrders.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-slate-400">No active orders.</p>
          ) : (
            <div className="space-y-2 flex-1">
              {activeOrders.slice(0, 3).map(order => (
                <div key={order.id} className="flex items-start gap-2">
                  <span className={`mt-0.5 h-2 w-2 rounded-full flex-shrink-0 ${order.order_type === 'lab_test' ? 'bg-purple-500' :
                    order.order_type === 'medication' ? 'bg-green-500' :
                      order.order_type === 'scan' ? 'bg-blue-500' : 'bg-orange-500'}`} />
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
              <h4 className="font-semibold text-slate-900 dark:text-white text-sm">{t('patient_dashboard.nurseReports')}</h4>
            </div>
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{nurseReports.length} {t('common.total')}</span>
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
                    <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">Synced</span>
                    <span className="text-[10px] text-slate-400">{format(new Date(report.created_at || report.date), 'MMM d')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Charts + Appointments */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Health Trends chart */}
        <div id="onboarding-charts" className="lg:col-span-2">
          <HealthTrendChart 
            logs={allLogsForChart} 
            title="Comprehensive Health Trends Analysis"
          />
        </div>

        {/* Appointments + Medications */}
        <div id="onboarding-appointments" className="bg-white dark:bg-slate-900 shadow dark:shadow-xl rounded-xl p-6 space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              {t('patient_dashboard.myAppointments')}
            </h3>
            <Link to="/patient/appointments" className="text-xs font-black text-blue-600 hover:underline flex items-center gap-1">
              {t('common.viewAll')} <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

          {liveAppointments.length > 0 ? (
            <div className="space-y-4">
              {liveAppointments.slice(0, 3).map((appt: any) => {
                // Pipeline steps definition (same as Appointments.tsx)
                const STEPS = [
                  { key: 'requested',         label: 'Requested',    icon: Send,        activeColor: 'text-orange-500', bg: 'bg-orange-500',  ring: 'ring-orange-200', inactive: 'bg-slate-100 dark:bg-slate-800 text-slate-400' },
                  { key: 'hospital_approved', label: 'Hosp. OK',     icon: Building2,   activeColor: 'text-blue-500',   bg: 'bg-blue-500',    ring: 'ring-blue-200',   inactive: 'bg-slate-100 dark:bg-slate-800 text-slate-400' },
                  { key: 'confirmed',         label: 'Confirmed',    icon: Stethoscope, activeColor: 'text-emerald-500', bg: 'bg-emerald-500', ring: 'ring-emerald-200', inactive: 'bg-slate-100 dark:bg-slate-800 text-slate-400' },
                ];
                const currentStepIdx = STEPS.findIndex(s => s.key === appt.status);
                const isConfirmed = appt.status === 'confirmed';
                const isCancelled = appt.status === 'cancelled';

                const cardBorder = isCancelled
                  ? 'border-red-200 dark:border-red-900/30'
                  : isConfirmed
                    ? 'border-emerald-200 dark:border-emerald-900/30 bg-emerald-50/30 dark:bg-emerald-900/10'
                    : 'border-slate-200 dark:border-slate-700';

                return (
                  <div
                    key={appt.id}
                    className={`rounded-2xl border-2 ${cardBorder} p-4 space-y-3 transition-all`}
                  >
                    {/* Top: doctor + date */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-black text-slate-900 dark:text-white truncate">
                          Dr. {appt.doctor_name}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                            <Clock className="h-3 w-3" />
                            {format(parseLocalDate(appt.appointment_date), 'MMM d')} · {formatTime(appt.appointment_time)}
                          </span>
                          {appt.hospital_name && (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 truncate">
                              <MapPin className="h-3 w-3 shrink-0" />
                              <span className="truncate">{appt.hospital_name}</span>
                            </span>
                          )}
                        </div>
                      </div>
                      {/* Date badge */}
                      <div className={`shrink-0 text-center px-3 py-1.5 rounded-xl
                        ${isConfirmed ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-slate-100 dark:bg-slate-800'}`}>
                        <p className={`text-lg font-black leading-none ${isConfirmed ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-white'}`}>
                          {format(parseLocalDate(appt.appointment_date), 'dd')}
                        </p>
                        <p className={`text-[8px] font-black uppercase tracking-widest ${isConfirmed ? 'text-emerald-400' : 'text-slate-400'}`}>
                          {format(parseLocalDate(appt.appointment_date), 'MMM')}
                        </p>
                      </div>
                    </div>

                    {/* Reason */}
                    {appt.reason && (
                      <div className="flex items-start gap-1.5">
                        <FileText className="h-3 w-3 text-slate-400 mt-0.5 shrink-0" />
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 italic leading-snug line-clamp-2">{appt.reason}</p>
                      </div>
                    )}

                    {/* Inline 3-step pipeline */}
                    {isCancelled ? (
                      <div className="flex items-center gap-2 py-1.5 px-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-900/30">
                        <AlertCircle className="h-3.5 w-3.5 text-red-500 shrink-0" />
                        <p className="text-[9px] font-black text-red-600 dark:text-red-400 uppercase tracking-widest">Cancelled</p>
                      </div>
                    ) : (
                      <div className="relative pt-1 pb-0.5">
                        {/* Track */}
                        <div className="absolute top-[18px] left-[16px] right-[16px] h-0.5 bg-slate-200 dark:bg-slate-700 z-0" />
                        {/* Progress fill */}
                        <div
                          className="absolute top-[18px] left-[16px] h-0.5 bg-emerald-400 z-0 transition-all duration-700"
                          style={{
                            width: isConfirmed
                              ? 'calc(100% - 32px)'
                              : currentStepIdx === 0
                                ? '0%'
                                : currentStepIdx === 1
                                  ? 'calc(50% - 16px)'
                                  : 'calc(100% - 32px)',
                          }}
                        />
                        {/* Steps */}
                        <div className="relative z-10 flex justify-between items-start">
                          {STEPS.map((step, idx) => {
                            const isDone = isConfirmed || currentStepIdx > idx;
                            const isActive = currentStepIdx === idx && !isConfirmed;
                            const StepIcon = step.icon;
                            return (
                              <div key={step.key} className="flex flex-col items-center gap-1 w-1/3">
                                <div
                                  className={`h-9 w-9 rounded-xl flex items-center justify-center transition-all duration-300 shadow-sm
                                    ${isDone ? `${step.bg} text-white shadow-md` : ''}
                                    ${isActive ? `bg-white dark:bg-slate-900 ${step.activeColor} ring-4 ${step.ring} dark:ring-opacity-30 shadow-md` : ''}
                                    ${!isDone && !isActive ? step.inactive : ''}
                                  `}
                                >
                                  {isDone
                                    ? <CheckCircle2 className="h-4 w-4" />
                                    : <StepIcon className="h-4 w-4" />
                                  }
                                </div>
                                <p className={`text-[8px] font-black uppercase tracking-wider text-center leading-tight
                                  ${isDone ? step.activeColor : isActive ? step.activeColor : 'text-slate-400 dark:text-slate-600'}
                                `}>
                                  {step.label}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Doctor notes if confirmed */}
                    {appt.doctor_notes && isConfirmed && (
                      <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-900/30 flex gap-2">
                        <FileText className="h-3 w-3 text-blue-500 shrink-0 mt-0.5" />
                        <p className="text-[9px] font-bold text-blue-700 dark:text-blue-300 italic line-clamp-2">"{appt.doctor_notes}"</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 space-y-2">
              <Calendar className="mx-auto h-10 w-10 text-slate-200 dark:text-slate-700" />
              <p className="text-slate-500 dark:text-slate-400 text-sm font-bold">No active appointments.</p>
              <Link
                to="/patient/appointments"
                className="inline-flex items-center gap-1 text-xs font-black text-blue-600 hover:underline"
              >
                <Plus className="h-3 w-3" /> Book one now
              </Link>
            </div>
          )}

          {/* Medications */}
          <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
            <div className="flex items-center gap-2 mb-3">
              <Pill className="h-4 w-4 text-green-500" />
              <h4 className="text-sm font-black text-slate-900 dark:text-white">My Medications</h4>
            </div>
            <ul className="space-y-2">
              {liveOrders.filter(o => o.order_type === 'medication').length > 0 ? (
                liveOrders.filter(o => o.order_type === 'medication').map((med, idx) => (
                  <li key={idx} className="text-sm text-slate-600 dark:text-slate-400 flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-800 dark:text-white">{med.description}</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">{med.details || 'As prescribed by doctor'}</span>
                    </div>
                    <span className="text-[10px] bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2 py-1 rounded-md self-center capitalize">Active</span>
                  </li>
                ))
              ) : (
                patient.medications.map((med, idx) => (
                  <li key={idx} className="text-sm text-slate-600 dark:text-slate-400 flex justify-between">
                    <span>{med.name}</span>
                    <span className="text-slate-400 dark:text-slate-500">{med.dosage} - {med.frequency}</span>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Messaging Section (New) */}
      <div className="mb-6">
        <MessagingSection />
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
                        <p className="text-sm text-slate-500">{format(new Date(report.created_at || report.date), 'MMMM d, yyyy · p')}</p>
                      </div>
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase">Completed</span>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 space-y-3 border border-slate-200 dark:border-slate-700">
                      <p className="text-xs font-bold text-blue-600 uppercase">Shift Tasks</p>
                      {(report.steps || []).map((s: any, i: number) => (
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
                <h3 className="text-xl font-bold text-white">{t('patient_dashboard.logFormTitle')}</h3>
                <button onClick={() => setIsLogFormOpen(false)} className="text-white/80 hover:text-white transition-colors">
                  <Plus className="h-6 w-6 rotate-45" />
                </button>
              </div>
              <form onSubmit={handleLogSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">{t('patient_dashboard.systolicBP')}</label>
                    <input type="number" required placeholder="e.g. 120" value={logFormData.systolic}
                      onChange={(e) => setLogFormData({ ...logFormData, systolic: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">{t('patient_dashboard.diastolicBP')}</label>
                    <input type="number" required placeholder="e.g. 80" value={logFormData.diastolic}
                      onChange={(e) => setLogFormData({ ...logFormData, diastolic: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">{t('patient_dashboard.heartRateBPM')}</label>
                    <input type="number" required placeholder="e.g. 72" value={logFormData.heartRate}
                      onChange={(e) => setLogFormData({ ...logFormData, heartRate: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">{t('patient_dashboard.temperatureC')}</label>
                    <input type="number" step="0.1" required placeholder="e.g. 36.5" value={logFormData.temperature}
                      onChange={(e) => setLogFormData({ ...logFormData, temperature: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">{t('patient_dashboard.oxygenLevelPct')}</label>
                  <input type="number" required placeholder="e.g. 98" value={logFormData.oxygenLevel}
                    onChange={(e) => setLogFormData({ ...logFormData, oxygenLevel: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">{t('patient_dashboard.mood')}</label>
                  <div className="flex justify-between gap-2">
                    {(['great', 'good', 'okay', 'poor', 'bad'] as const).map((mood) => (
                      <button
                        key={mood}
                        type="button"
                        onClick={() => setLogFormData({ ...logFormData, mood })}
                        className={`flex-1 py-2 rounded-lg border transition-all ${logFormData.mood === mood
                          ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <span className="block text-xl">
                          {mood === 'great' ? '😊' : mood === 'good' ? '🙂' : mood === 'okay' ? '😐' : mood === 'poor' ? '☹️' : '🤒'}
                        </span>
                        <span className="text-[10px] font-bold uppercase">{t(`patient_dashboard.mood${mood.charAt(0).toUpperCase() + mood.slice(1)}`)}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">{t('patient_dashboard.symptoms')}</label>
                  <div className="flex flex-wrap gap-2">
                    {availableSymptoms.map((symptom) => (
                      <button
                        key={symptom}
                        type="button"
                        onClick={() => handleSymptomToggle(symptom)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${logFormData.symptoms.includes(symptom)
                          ? 'bg-red-600 border-red-600 text-white'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-red-400'
                        }`}
                      >
                        {t(`patient_dashboard.${symptom.toLowerCase().replace(/\s+/g, '')}`)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">{t('patient_dashboard.additionalNotes')}</label>
                  <textarea
                    placeholder="Anything else you'd like to share with your doctor?"
                    value={logFormData.notes}
                    onChange={(e) => setLogFormData({ ...logFormData, notes: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 min-h-[80px]"
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsLogFormOpen(false)}
                    className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200"
                  >
                    {t('common_buttons.cancel')}
                  </button>
                  <button type="submit" className="flex-[2] py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/20">
                    {t('patient_dashboard.submitLog')}
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
