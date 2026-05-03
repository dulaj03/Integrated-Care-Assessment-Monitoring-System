import { Calendar, Clock, MapPin, Plus, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { format, isSameDay, isWithinInterval, addDays, startOfDay, endOfDay } from 'date-fns';
import { toast } from 'sonner';

// Safely parse a date string or object into a local Date object (IST resilient)
function parseLocalDate(dateInput: any): Date {
  if (!dateInput) return new Date();
  if (dateInput instanceof Date) return dateInput;
  const dateStr = String(dateInput);
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
  if (timeInput.includes('T')) return format(new Date(timeInput), 'h:mm a');
  const [hours, minutes] = timeInput.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes);
  return format(date, 'h:mm a');
}

interface Appointment {
  id: string;
  patient_name: string;
  reason: string;
  appointment_date: string;
  appointment_time: string;
  hospital_name: string;
  status: 'requested' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  doctor_notes?: string;
  patient_id: string;
}

export function DoctorSchedule() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewType, setViewType] = useState<'today' | 'week' | 'all'>('today');
  const token = sessionStorage.getItem('token');

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
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/appointments/status/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        toast.success(`Updated to ${status.replace('_', ' ')}`);
        fetchAppointments();
      }
    } catch (error) {
      toast.error('Update failed');
    }
  };

  const getTodayAppts = () => appointments.filter(a => isSameDay(parseLocalDate(a.appointment_date), new Date()));
  const getWeekAppts = () => appointments.filter(a => {
    const d = parseLocalDate(a.appointment_date);
    return isWithinInterval(d, { start: startOfDay(new Date()), end: endOfDay(addDays(new Date(), 7)) });
  });

  const displayedAppointments = viewType === 'today' ? getTodayAppts() : viewType === 'week' ? getWeekAppts() : appointments;

  const stats = {
    today: getTodayAppts().length,
    inProgress: appointments.filter(a => a.status === 'in_progress').length,
    scheduled: appointments.filter(a => a.status === 'confirmed').length,
    completed: appointments.filter(a => a.status === 'completed').length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
    case 'completed': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300';
    case 'in_progress': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
    case 'confirmed': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300';
    case 'cancelled': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
    default: return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <p className="font-bold text-slate-500">Loading your schedule...</p>
      </div>
    );
  }

  const AppointmentCard = ({ appt }: { appt: Appointment }) => (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:shadow-xl hover:border-blue-500/20 transition-all group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h4 className="font-black text-slate-900 dark:text-white capitalize text-lg">{appt.patient_name}</h4>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{appt.reason}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusColor(appt.status)}`}>
          {appt.status.replace('_', ' ')}
        </span>
      </div>

      <div className="space-y-2 mb-6">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-400">
          <Calendar className="h-4 w-4 text-blue-500" />
          <span>{format(parseLocalDate(appt.appointment_date), 'MMMM d, yyyy')}</span>
        </div>
        <div className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-400">
          <Clock className="h-4 w-4 text-blue-500" />
          <span>{formatTime(appt.appointment_time)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-400">
          <MapPin className="h-4 w-4 text-blue-500" />
          <span className="truncate">{appt.hospital_name}</span>
        </div>
      </div>

      <div className="flex gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
        {appt.status === 'confirmed' && (
          <>
            <button 
              onClick={() => updateStatus(appt.id, 'in_progress')}
              className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-black shadow-lg shadow-blue-500/20 hover:scale-105 transition-all"
            >
              Start Session
            </button>
            <button className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl text-xs font-black">
              Reschedule
            </button>
          </>
        )}
        {appt.status === 'in_progress' && (
          <button 
            onClick={() => updateStatus(appt.id, 'completed')}
            className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-black shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all"
          >
            Complete Session
          </button>
        )}
        {appt.status === 'completed' && (
          <button className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-xl text-xs font-black italic">
            Session Finalized
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">My Schedule</h2>
          <p className="text-slate-500 dark:text-slate-400 font-bold mt-1">View and manage your appointments and consultations</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-blue-500/20 transition-all hover:scale-105">
          <Plus className="h-4 w-4" /> New Appointment
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'New Today', value: stats.today, icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'In Progress', value: stats.inProgress, icon: AlertCircle, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
          { label: 'Scheduled', value: stats.scheduled, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
          { label: 'Completed', value: stats.completed, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
        ].map(s => (
          <div key={s.label} className={`rounded-3xl p-5 ${s.bg} border-2 border-transparent hover:border-current transition-all group`}>
            <div className="flex items-center justify-between mb-2">
              <s.icon className={`h-6 w-6 ${s.color}`} />
              <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{s.label}</p>
          </div>
        ))}
      </div>

      {/* View Filters */}
      <div className="flex gap-2">
        {['today', 'week', 'all'].map(t => (
          <button
            key={t}
            onClick={() => setViewType(t as any)}
            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              viewType === t 
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xl' 
                : 'bg-white dark:bg-slate-900 text-slate-500 hover:text-slate-900 border border-slate-200 dark:border-slate-800'
            }`}
          >
            {t === 'today' ? 'Today' : t === 'week' ? 'This Week' : 'All Requests'}
          </button>
        ))}
      </div>

      {/* Appointment Grid */}
      {displayedAppointments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {displayedAppointments.map(appt => (
            <AppointmentCard key={appt.id} appt={appt} />
          ))}
        </div>
      ) : (
        <div className="rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800 p-20 text-center">
          <Calendar className="mx-auto h-12 w-12 text-slate-300 mb-4" />
          <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-widest">No activities found</h3>
          <p className="text-slate-500 font-bold text-sm mt-2">You don't have any appointments for the selected timeframe.</p>
        </div>
      )}
    </div>
  );
}
