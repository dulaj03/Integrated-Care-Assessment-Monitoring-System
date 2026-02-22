import { Calendar, Clock, MapPin, Users, Plus, ChevronRight, AlertCircle, CheckCircle, Video, Phone } from 'lucide-react';
import { useState } from 'react';
import { format, addDays } from 'date-fns';

interface Appointment {
  id: string;
  patientName: string;
  patientAge: number;
  condition: string;
  date: string;
  time: string;
  duration: number;
  type: 'physical' | 'video' | 'phone';
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  room?: string;
  notes?: string;
}

export function DoctorSchedule() {
  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: 'appt-1',
      patientName: 'Nimal Jayasinghe',
      patientAge: 68,
      condition: 'Hypertension & Type 2 Diabetes',
      date: new Date().toISOString(),
      time: '09:00',
      duration: 30,
      type: 'physical',
      status: 'in-progress',
      room: 'Clinic A - Room 3',
      notes: 'Follow-up on medication adjustment',
    },
    {
      id: 'appt-2',
      patientName: 'Kusum Perera',
      patientAge: 54,
      condition: 'Post-Surgery Recovery',
      date: new Date().toISOString(),
      time: '09:45',
      duration: 20,
      type: 'physical',
      status: 'scheduled',
      room: 'Clinic A - Room 4',
      notes: 'Wound assessment',
    },
    {
      id: 'appt-3',
      patientName: 'Anita Sharma',
      patientAge: 45,
      condition: 'Thyroid Disorder',
      date: new Date().toISOString(),
      time: '10:15',
      duration: 25,
      type: 'video',
      status: 'scheduled',
      notes: 'Review TSH levels and medication',
    },
    {
      id: 'appt-4',
      patientName: 'Ravi De Silva',
      patientAge: 72,
      condition: 'COPD',
      date: new Date().toISOString(),
      time: '11:00',
      duration: 30,
      type: 'physical',
      status: 'scheduled',
      room: 'Clinic A - Room 5',
      notes: 'Urgent - Oxygen saturation concerns',
    },
    {
      id: 'appt-5',
      patientName: 'John Smith',
      patientAge: 55,
      condition: 'Hypertension',
      date: addDays(new Date(), 1).toISOString(),
      time: '14:00',
      duration: 20,
      type: 'phone',
      status: 'scheduled',
      notes: 'Routine check-in',
    },
    {
      id: 'appt-6',
      patientName: 'Maria Garcia',
      patientAge: 62,
      condition: 'Arthritis',
      date: addDays(new Date(), 2).toISOString(),
      time: '15:30',
      duration: 25,
      type: 'physical',
      status: 'scheduled',
      room: 'Clinic A - Room 2',
      notes: 'Pain management consultation',
    },
  ]);

  const [viewType, setViewType] = useState<'today' | 'week' | 'all'>('today');

  const getTodayAppointments = () => appointments.filter(apt => {
    const aptDate = format(new Date(apt.date), 'yyyy-MM-dd');
    const today = format(new Date(), 'yyyy-MM-dd');
    return aptDate === today;
  });

  const getWeekAppointments = () => appointments.filter(apt => {
    const aptDate = new Date(apt.date);
    const today = new Date();
    const weekFromNow = addDays(today, 7);
    return aptDate >= today && aptDate <= weekFromNow;
  });

  const displayedAppointments = viewType === 'today' ? getTodayAppointments() : viewType === 'week' ? getWeekAppointments() : appointments;

  const appointmentsByStatus = {
    completed: displayedAppointments.filter(a => a.status === 'completed').length,
    inProgress: displayedAppointments.filter(a => a.status === 'in-progress').length,
    scheduled: displayedAppointments.filter(a => a.status === 'scheduled').length,
  };

  const getAppointmentTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="h-5 w-5" />;
      case 'phone':
        return <Phone className="h-5 w-5" />;
      default:
        return <Users className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
      case 'in-progress':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300';
      case 'scheduled':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300';
      case 'cancelled':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
      default:
        return 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300';
    }
  };

  const AppointmentCard = ({ appointment }: { appointment: Appointment }) => (
    <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-semibold text-slate-900 dark:text-white">
            {appointment.patientName}
          </h4>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {appointment.patientAge}y • {appointment.condition}
          </p>
        </div>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
          {appointment.status === 'in-progress' ? 'Now' : appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
          <Clock className="h-4 w-4 flex-shrink-0 text-slate-500 dark:text-slate-400" />
          <span>{appointment.time} • {appointment.duration} mins</span>
        </div>

        {appointment.room && (
          <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
            <MapPin className="h-4 w-4 flex-shrink-0 text-slate-500 dark:text-slate-400" />
            <span>{appointment.room}</span>
          </div>
        )}

        <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
          <div className="h-4 w-4 flex-shrink-0 text-slate-500 dark:text-slate-400">
            {getAppointmentTypeIcon(appointment.type)}
          </div>
          <span className="capitalize">{appointment.type} Consultation</span>
        </div>

        {appointment.notes && (
          <div className="p-2 bg-slate-50 dark:bg-slate-700/50 rounded mt-2">
            <p className="text-xs text-slate-600 dark:text-slate-400">{appointment.notes}</p>
          </div>
        )}
      </div>

      <div className="flex gap-2 pt-3 border-t border-slate-200 dark:border-slate-700">
        {appointment.status === 'in-progress' && (
          <>
            <button className="flex-1 px-3 py-2 text-xs font-medium rounded-md bg-blue-600 dark:bg-blue-700 text-white hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors">
              Complete
            </button>
            {appointment.type === 'video' && (
              <button className="flex-1 px-3 py-2 text-xs font-medium rounded-md bg-green-600 dark:bg-green-700 text-white hover:bg-green-700 dark:hover:bg-green-600 transition-colors">
                Join Call
              </button>
            )}
          </>
        )}
        {appointment.status === 'scheduled' && (
          <>
            <button className="flex-1 px-3 py-2 text-xs font-medium rounded-md bg-blue-600 dark:bg-blue-700 text-white hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors">
              Start
            </button>
            <button className="flex-1 px-3 py-2 text-xs font-medium rounded-md bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">
              Reschedule
            </button>
          </>
        )}
        {appointment.status === 'completed' && (
          <button className="flex-1 px-3 py-2 text-xs font-medium rounded-md bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">
            View Notes
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-slate-900 dark:text-white sm:text-3xl sm:truncate">
            My Schedule
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            View and manage your appointments and consultations
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900 focus:ring-blue-500 transition-colors duration-200">
            <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            New Appointment
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Today</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{getTodayAppointments().length}</p>
            </div>
            <Calendar className="h-8 w-8 text-blue-600 dark:text-blue-400 opacity-50" />
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">In Progress</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{appointmentsByStatus.inProgress}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-blue-600 dark:text-blue-400 opacity-50" />
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Scheduled</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{appointmentsByStatus.scheduled}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600 dark:text-yellow-400 opacity-50" />
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Completed</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{appointmentsByStatus.completed}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400 opacity-50" />
          </div>
        </div>
      </div>

      {/* View Type Selector */}
      <div className="flex gap-2">
        <button
          onClick={() => setViewType('today')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${viewType === 'today'
              ? 'bg-blue-600 dark:bg-blue-700 text-white'
              : 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100 hover:bg-slate-300 dark:hover:bg-slate-600'
            }`}
        >
          Today
        </button>
        <button
          onClick={() => setViewType('week')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${viewType === 'week'
              ? 'bg-blue-600 dark:bg-blue-700 text-white'
              : 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100 hover:bg-slate-300 dark:hover:bg-slate-600'
            }`}
        >
          This Week
        </button>
        <button
          onClick={() => setViewType('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${viewType === 'all'
              ? 'bg-blue-600 dark:bg-blue-700 text-white'
              : 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100 hover:bg-slate-300 dark:hover:bg-slate-600'
            }`}
        >
          All
        </button>
      </div>

      {/* Appointments List */}
      <div>
        {displayedAppointments.length > 0 ? (
          <div className="space-y-4">
            {displayedAppointments.map(appointment => (
              <AppointmentCard key={appointment.id} appointment={appointment} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 p-12 text-center">
            <Calendar className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-500" />
            <h3 className="mt-2 text-sm font-medium text-slate-900 dark:text-white">
              No appointments scheduled
            </h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              You have no appointments for the selected time period.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
