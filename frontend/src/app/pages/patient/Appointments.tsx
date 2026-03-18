import { Calendar, Clock, MapPin, Phone, User, Plus, CheckCircle, AlertCircle, X } from 'lucide-react';
import { useState } from 'react';
import { CURRENT_USER_PATIENT, MOCK_DOCTORS } from '../../lib/mockData';
import { format, isPast } from 'date-fns';
import { useTranslation } from 'react-i18next';

interface Appointment {
  id: string;
  date: string;
  title: string;
  location: string;
  doctorId?: string;
  status?: 'upcoming' | 'completed' | 'cancelled';
  notes?: string;
}

export function Appointments() {
  const { t } = useTranslation();
  const patient = CURRENT_USER_PATIENT;
  const [appointments, setAppointments] = useState<Appointment[]>([
    ...patient.upcomingAppointments.map(apt => ({
      ...apt,
      status: isPast(new Date(apt.date)) ? ('completed' as const) : ('upcoming' as const),
      doctorId: patient.assignedDoctorId,
    })),
    {
      id: 'a-past-1',
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      title: 'Follow-up Consultation',
      location: 'General Hospital, Colombo',
      status: 'completed' as const,
      doctorId: 'd1',
      notes: 'Blood pressure readings normal. Continue current medications.',
    },
    {
      id: 'a-past-2',
      date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      title: 'Routine Checkup',
      location: 'General Hospital, Colombo',
      status: 'completed' as const,
      doctorId: 'd1',
      notes: 'All tests normal. Encouraged to increase physical activity.',
    },
  ]);

  const upcomingAppointments = appointments.filter(apt => !isPast(new Date(apt.date)));
  const pastAppointments = appointments.filter(apt => isPast(new Date(apt.date)));

  const getDoctorName = (doctorId?: string) => {
    if (!doctorId) return 'Dr. Sarah Perera';
    const doctor = MOCK_DOCTORS.find(d => d.id === doctorId);
    return doctor?.name || 'General Doctor';
  };

  const AppointmentCard = ({ appointment }: { appointment: Appointment }) => {
    const appointmentDate = new Date(appointment.date);
    const isUpcoming = !isPast(appointmentDate);

    return (
      <div className={`rounded-lg border p-6 ${isUpcoming
        ? 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20'
        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
      }`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              {appointment.title}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              {t('patient_appointments.with')} {getDoctorName(appointment.doctorId)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {appointment.status === 'completed' ? (
              <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                <CheckCircle className="w-4 h-4" />
                <span className="text-xs font-medium">{t('patient_appointments.completed')}</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                <AlertCircle className="w-4 h-4" />
                <span className="text-xs font-medium">{t('patient_appointments.upcoming')}</span>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
            <Calendar className="w-4 h-4 flex-shrink-0 text-slate-500 dark:text-slate-400" />
            <span>{format(appointmentDate, 'EEEE, MMMM d, yyyy')}</span>
          </div>

          <div className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
            <Clock className="w-4 h-4 flex-shrink-0 text-slate-500 dark:text-slate-400" />
            <span>{format(appointmentDate, 'h:mm a')}</span>
          </div>

          <div className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
            <MapPin className="w-4 h-4 flex-shrink-0 text-slate-500 dark:text-slate-400" />
            <span>{appointment.location}</span>
          </div>

          {appointment.notes && (
            <div className="mt-4 pt-4 border-t border-slate-300 dark:border-slate-600">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                <strong className="text-slate-900 dark:text-white">{t('patient_appointments.notes')}:</strong>
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                {appointment.notes}
              </p>
            </div>
          )}
        </div>

        {isUpcoming && (
          <div className="mt-4 pt-4 border-t border-slate-300 dark:border-slate-600 flex gap-2">
            <button className="flex-1 px-3 py-2 text-sm font-medium rounded-md bg-blue-600 dark:bg-blue-700 text-white hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors">
              Reschedule
            </button>
            <button className="flex-1 px-3 py-2 text-sm font-medium rounded-md bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">
              Cancel
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-slate-900 dark:text-white sm:text-3xl sm:truncate">
            {t('patient_appointments.title')}
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {t('patient_appointments.upcomingAppointments')}
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900 focus:ring-blue-500 transition-colors duration-200">
            <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            {t('patient_appointments.scheduleAppointment')}
          </button>
        </div>
      </div>

      {/* Upcoming Appointments */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          {t('patient_appointments.upcomingAppointments')} ({upcomingAppointments.length})
        </h3>
        {upcomingAppointments.length > 0 ? (
          <div className="space-y-4">
            {upcomingAppointments.map(apt => (
              <AppointmentCard key={apt.id} appointment={apt} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 p-12 text-center">
            <Calendar className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-500" />
            <h3 className="mt-2 text-sm font-medium text-slate-900 dark:text-white">
              {t('patient_appointments.noAppointments')}
            </h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {t('patient_appointments.scheduleAppointment')}
            </p>
            <button className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600">
              <Plus className="-ml-1 mr-2 h-5 w-5" />
              {t('patient_appointments.scheduleAppointment')}
            </button>
          </div>
        )}
      </div>

      {/* Past Appointments */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          {t('patient_appointments.pastAppointments')} ({pastAppointments.length})
        </h3>
        {pastAppointments.length > 0 ? (
          <div className="space-y-4">
            {pastAppointments.map(apt => (
              <AppointmentCard key={apt.id} appointment={apt} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t('patient_appointments.noAppointments')}
          </p>
        )}
      </div>

      {/* Quick Contact */}
      <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Need Help?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <Phone className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-white">
                Hospital Helpline
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                +94 11 234 5678
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-white">
                Your Doctor
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {getDoctorName(patient.assignedDoctorId)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
