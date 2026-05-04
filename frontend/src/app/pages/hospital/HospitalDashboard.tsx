import { Calendar, Users, Building2, Clock, Loader2, Send, CreditCard, Save } from 'lucide-react';
import { format, isToday } from 'date-fns';
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { MessagingSection } from '../../components/MessagingSection';
import {
  MOCK_HOSPITAL_DOCTORS,
  MOCK_HOSPITALS,
  getAppointmentStatusColor,
} from '../../lib/hospitalData';
import { useTranslation } from 'react-i18next';

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

export function HospitalDashboard() {
  const storedUserName = sessionStorage.getItem('userName');
  const storedRole = sessionStorage.getItem('userRole');
  const token = sessionStorage.getItem('token');
  const hospitalId = sessionStorage.getItem('userId') || '1';
  
  const [appointments, setAppointments] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hospitalFee, setHospitalFee] = useState<number>(0);
  const [savingFee, setSavingFee] = useState(false);

  // Use stored hospital from session if available, otherwise fallback to mock
  const hospital = (storedRole === 'hospital' && storedUserName) 
    ? { ...MOCK_HOSPITALS[1], name: storedUserName } 
    : MOCK_HOSPITALS[1];

  const fetchAppointments = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/appointments/my', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAppointments(data);
      }

      const patientsRes = await fetch(`/api/hospitals/${hospitalId}/patients`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (patientsRes.ok) {
        const pData = await patientsRes.json();
        setPatients(pData);
      }

      const feeRes = await fetch(`/api/availability/hospital-fee/${hospitalId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (feeRes.ok) {
        const feeData = await feeRes.json();
        setHospitalFee(feeData.appointment_fee);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [token, hospitalId]);

  const handleUpdateFee = async () => {
    setSavingFee(true);
    try {
      const res = await fetch(`/api/availability/hospital-fee`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ hospital_id: hospitalId, appointment_fee: hospitalFee })
      });
      if (res.ok) toast.success('Hospital fee updated successfully');
      else toast.error('Failed to update fee');
    } catch { toast.error('Network error'); }
    finally { setSavingFee(false); }
  };

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleNotifyDoctor = async (apptId: number) => {
    try {
      const res = await fetch(`/api/appointments/status/${apptId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'hospital_approved' })
      });

      if (res.ok) {
        toast.success('Doctor has been notified of this appointment');
        fetchAppointments();
      } else {
        toast.error('Failed to notify doctor');
      }
    } catch (error) {
      toast.error('Network error');
    }
  };

  const todayAppointments = appointments.filter(a => isToday(parseLocalDate(a.appointment_date)));
  const pendingActionCount = appointments.filter(a => a.status === 'requested').length;

  const { t } = useTranslation();

  const stats = [
    { label: t('hospital_dashboard.todayAppointments'), value: todayAppointments.length, icon: Calendar, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: t('hospital_dashboard.pendingInvitations'), value: pendingActionCount, icon: Clock, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/20' },
    { label: t('hospital_dashboard.doctorsOnRoster'), value: MOCK_HOSPITAL_DOCTORS.filter(d => d.hospitalId === hospital.id).length, icon: Users, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/20' },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <p className="text-slate-500">{t('hospital_dashboard.loadingMetrics')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-xl bg-blue-600 flex items-center justify-center">
          <Building2 className="h-7 w-7 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{hospital.name}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">{hospital.address}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className={`rounded-xl border border-slate-200 dark:border-slate-700 ${stat.bg} p-5`}>
            <div className="flex items-center justify-between mb-2">
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
            <p className={`text-3xl font-extrabold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Actions */}
        <div className="rounded-xl border border-orange-200 dark:border-orange-900/50 bg-orange-50/30 dark:bg-orange-900/5 p-5">
          <h3 className="font-bold text-orange-900 dark:text-orange-400 mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5" /> {t('hospital_dashboard.apptRequiringAction')}
          </h3>
          {appointments.filter(a => a.status === 'requested').length === 0 ? (
            <p className="text-sm text-slate-500 py-4">{t('hospital_dashboard.allApptsProcessed')}</p>
          ) : (
            <div className="space-y-3">
              {appointments.filter(a => a.status === 'requested').map(appt => (
                <div key={appt.id} className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-orange-200 dark:border-orange-800/50 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{appt.patient_name}</p>
                      <p className="text-xs text-slate-500">{t('hospital_dashboard.requestedFor')} {appt.doctor_name}</p>
                    </div>
                    <button 
                      onClick={() => handleNotifyDoctor(appt.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-all"
                    >
                      <Send className="h-3 w-3" /> {t('hospital_dashboard.notifyDoctor')}
                    </button>
                  </div>
                  <div className="flex gap-4 text-[11px] text-slate-500 font-medium">
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {format(parseLocalDate(appt.appointment_date), 'MMM d, yyyy')}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {formatTime(appt.appointment_time)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Master Schedule */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-500" /> {t('hospital_dashboard.masterSchedule')}
            </h3>
          </div>
          {appointments.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400 py-8 text-center">{t('hospital_dashboard.noApptsScheduled')}</p>
          ) : (
            <div className="space-y-3">
              {appointments.slice(0, 5).map(appt => (
                <div key={appt.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white text-sm">{appt.patient_name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{appt.doctor_name} · {appt.reason}</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-bold">
                      {format(parseLocalDate(appt.appointment_date), 'MMM d')} · {formatTime(appt.appointment_time)}
                    </p>
                  </div>
                  <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-tighter ${getAppointmentStatusColor(appt.status)}`}>
                    {appt.status.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Hospital Settings */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5">
        <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
          <CreditCard className="h-5 w-5 text-blue-500" /> Hospital Settings & Finance
        </h3>
        <div className="max-w-md space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Default Hospital Appointment Fee (LKR)</label>
            <div className="flex gap-3">
              <input 
                type="number" 
                value={hospitalFee} 
                onChange={e => setHospitalFee(Number(e.target.value))}
                className="flex-1 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-bold text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <button 
                onClick={handleUpdateFee}
                disabled={savingFee}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {savingFee ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                SAVE
              </button>
            </div>
            <p className="text-[10px] text-slate-400">This fee will be charged from patients for every appointment booked at your hospital.</p>
          </div>
        </div>
      </div>

      {/* Patient Directory */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="h-5 w-5 text-emerald-500" /> {t('hospital_dashboard.activePatients')}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
              {patients.map((patient) => (
                <tr key={patient.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full overflow-hidden mr-3 bg-slate-100 flex items-center justify-center">
                        <Users className="h-4 w-4 text-slate-400" />
                      </div>
                      <div className="text-sm font-medium text-slate-900 dark:text-white">{patient.name || patient.full_name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                    {patient.condition || t('hospital_dashboard.condition')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-[10px] leading-5 font-bold rounded-full uppercase ${patient.status === 'ciritical' || patient.status === 'CRITICAL' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                      {patient.status || 'ACTIVE'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                    {patient.doctor_name || t('hospital_dashboard.unassigned')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Messaging Section (New) */}
      <div className="mt-8">
        <MessagingSection />
      </div>
    </div>
  );
}
