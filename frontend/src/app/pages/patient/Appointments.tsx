import { Calendar, Clock, MapPin, User, Building2, Loader2, Plus, AlertCircle, CheckCircle2, X, Send } from 'lucide-react';
import { useState, useEffect } from 'react';
import { format, isPast } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

interface Appointment {
  id: string;
  date: string;
  title: string;
  location: string;
  doctorId?: string;
  hospitalId?: string;
  status: 'requested' | 'hospital_approved' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  doctorName?: string;
}

interface Doctor {
  id: number;
  full_name: string;
  specialization: string;
  institution_name: string;
}

interface Hospital {
  id: number;
  name: string;
  address: string;
}

export function Appointments() {
  const { t } = useTranslation();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBookModal, setShowBookModal] = useState(false);
  
  // Booking Form State
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [selectedHospitalId, setSelectedHospitalId] = useState<string>('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const token = sessionStorage.getItem('token');

  useEffect(() => {
    fetchAppointments();
    fetchDoctors();
  }, []);

  useEffect(() => {
    if (selectedDoctorId) {
      fetchDoctorHospitals(selectedDoctorId);
    } else {
      setHospitals([]);
      setSelectedHospitalId('');
    }
  }, [selectedDoctorId]);

  const fetchAppointments = async () => {
    if (!token) return;
    try {
      const res = await fetch('http://localhost:5000/api/appointments/my', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAppointments(data.map((a: any) => ({
          id: String(a.id),
          date: `${a.appointment_date.split('T')[0]}T${a.appointment_time}`,
          title: a.reason || 'Medical Consultation',
          location: a.hospital_name || 'Hospital',
          doctorId: a.doctor_id,
          doctorName: a.doctor_name,
          status: a.status,
          notes: a.doctor_notes
        })));
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/doctors');
      if (res.ok) {
        const data = await res.json();
        setDoctors(data);
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  const fetchDoctorHospitals = async (doctorId: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/doctors/${doctorId}/hospitals`);
      if (res.ok) {
        const data = await res.json();
        setHospitals(data);
      }
    } catch (error) {
      console.error('Error fetching doctor hospitals:', error);
    }
  };

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedDoctorId || !selectedHospitalId || !appointmentDate || !appointmentTime) {
      toast.error('Please fill all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('http://localhost:5000/api/appointments/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          doctor_id: selectedDoctorId,
          hospital_id: selectedHospitalId,
          appointment_date: appointmentDate,
          appointment_time: appointmentTime,
          reason: reason
        })
      });

      if (res.ok) {
        toast.success('Appointment requested! Awaiting hospital approval.');
        setShowBookModal(false);
        resetForm();
        fetchAppointments();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to book appointment');
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedDoctorId('');
    setSelectedHospitalId('');
    setAppointmentDate('');
    setAppointmentTime('');
    setReason('');
  };

  const getStatusDisplay = (status: Appointment['status']) => {
    switch (status) {
      case 'requested': return { label: 'Awaiting Hospital', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300', icon: Clock };
      case 'hospital_approved': return { label: 'Hospital Approved (Pending Doctor)', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300', icon: Building2 };
      case 'confirmed': return { label: 'Confirmed', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300', icon: CheckCircle2 };
      case 'completed': return { label: 'Completed', color: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300', icon: CheckCircle2 };
      case 'cancelled': return { label: 'Cancelled', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300', icon: AlertCircle };
      default: return { label: status, color: 'bg-slate-100 text-slate-700', icon: AlertCircle };
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <p className="text-slate-500 animate-pulse">Loading appointments...</p>
      </div>
    );
  }

  const upcomingAppointments = appointments.filter(apt => apt.status !== 'completed' && apt.status !== 'cancelled' && !isPast(new Date(apt.date)));

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
          <button 
            onClick={() => setShowBookModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900 focus:ring-blue-500 transition-colors duration-200"
          >
            <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            {t('patient_appointments.scheduleAppointment')}
          </button>
        </div>
      </div>

      {/* Appointment List Section */}
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            {t('patient_appointments.upcomingAppointments')} ({upcomingAppointments.length})
          </h3>
          {upcomingAppointments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upcomingAppointments.map(apt => {
                const statusInfo = getStatusDisplay(apt.status);
                return (
                  <div key={apt.id} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600">
                          <User className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white">{apt.doctorName}</h4>
                          <p className="text-xs text-slate-500">{apt.title}</p>
                        </div>
                      </div>
                      <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight ${statusInfo.color}`}>
                        <statusInfo.icon className="h-3 w-3" />
                        {statusInfo.label}
                      </span>
                    </div>
                    
                    <div className="space-y-2 mt-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <Calendar className="h-4 w-4" />
                        <span>{format(new Date(apt.date), 'MMM d, yyyy')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <Clock className="h-4 w-4" />
                        <span>{format(new Date(apt.date), 'h:mm a')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <MapPin className="h-4 w-4" />
                        <span>{apt.location}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 p-12 text-center">
              <Calendar className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-500" />
              <h3 className="mt-2 text-sm font-medium text-slate-900 dark:text-white">No active appointments</h3>
              <button 
                onClick={() => setShowBookModal(true)}
                className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
              >
                Book your first consultation
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Booking Modal */}
      <AnimatePresence>
        {showBookModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden border border-slate-200 dark:border-slate-800"
            >
              <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" /> Book an Appointment
                </h3>
                <button onClick={() => setShowBookModal(false)} className="text-slate-500 hover:text-slate-700 dark:hover:text-white transition-colors">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleBookAppointment} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                {/* Step 1: Select Doctor */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">Select Doctor</label>
                  <select 
                    value={selectedDoctorId} 
                    onChange={(e) => setSelectedDoctorId(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Choose a medical professional...</option>
                    {doctors.map(d => (
                      <option key={d.id} value={d.id}>{d.full_name} ({d.specialization})</option>
                    ))}
                  </select>
                </div>

                {/* Step 2: Select Hospital (Dependent on Doctor) */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">Select Hospital</label>
                  <select 
                    value={selectedHospitalId} 
                    onChange={(e) => setSelectedHospitalId(e.target.value)}
                    disabled={!selectedDoctorId}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    required
                  >
                    <option value="">{selectedDoctorId ? 'Select available hospital...' : 'First select a doctor'}</option>
                    {hospitals.map(h => (
                      <option key={h.id} value={h.id}>{h.name} - {h.address}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">Date</label>
                    <input 
                      type="date" 
                      min={new Date().toISOString().split('T')[0]}
                      value={appointmentDate} 
                      onChange={(e) => setAppointmentDate(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">Time</label>
                    <input 
                      type="time" 
                      value={appointmentTime} 
                      onChange={(e) => setAppointmentTime(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">Reason for Visit</label>
                  <textarea 
                    value={reason} 
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Briefly describe your systems or reason for booking..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={submitting}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                  Request Appointment
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
