import {
  Calendar, Clock, MapPin, User, Building2, Loader2, Plus,
  CheckCircle2, X, Send, ChevronRight, Stethoscope, AlertCircle,
  FileText
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { format, isPast } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

// Safely parse a date string or object into a local Date object
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

// ─── Types ───────────────────────────────────────────────────────────────────
type ApptStatus = 'requested' | 'hospital_approved' | 'confirmed' | 'completed' | 'cancelled';

interface Appointment {
  id: string;
  appointment_date: string;
  appointment_time: string;
  reason: string;
  hospital_name: string;
  doctor_name: string;
  doctor_id: string;
  hospital_id: string;
  status: ApptStatus;
  doctor_notes?: string;
  created_at: string;
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

// ─── The 3-Step Pipeline Definition ─────────────────────────────────────────
const PIPELINE_STEPS = [
  {
    key: 'requested',
    label: 'Request Sent',
    sublabel: 'Awaiting hospital review',
    icon: Send,
    color: 'text-orange-500',
    bg: 'bg-orange-500',
    ring: 'ring-orange-200',
    trackFill: 'bg-orange-400',
  },
  {
    key: 'hospital_approved',
    label: 'Hospital Approved',
    sublabel: 'Awaiting doctor confirmation',
    icon: Building2,
    color: 'text-blue-500',
    bg: 'bg-blue-500',
    ring: 'ring-blue-200',
    trackFill: 'bg-blue-400',
  },
  {
    key: 'confirmed',
    label: 'Doctor Confirmed',
    sublabel: 'Appointment is set',
    icon: Stethoscope,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500',
    ring: 'ring-emerald-200',
    trackFill: 'bg-emerald-400',
  },
];

// Returns 0-based index of the current step (or -1 for cancelled)
function getStepIndex(status: ApptStatus): number {
  if (status === 'cancelled') return -1;
  if (status === 'completed') return 3; // all steps done
  return PIPELINE_STEPS.findIndex(s => s.key === status);
}

// ─── Progress Stepper Component ──────────────────────────────────────────────
function ApprovalStepper({ status }: { status: ApptStatus }) {
  if (status === 'cancelled') {
    return (
      <div className="flex items-center gap-2 py-3 px-4 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-100 dark:border-red-900/30">
        <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
        <p className="text-xs font-black text-red-600 dark:text-red-400 uppercase tracking-widest">Appointment Cancelled</p>
      </div>
    );
  }

  const currentStep = getStepIndex(status);
  const isCompleted = status === 'completed';

  return (
    <div className="relative pt-2 pb-1">
      {/* Track line */}
      <div className="absolute top-[22px] left-[20px] right-[20px] h-0.5 bg-slate-200 dark:bg-slate-700 z-0" />
      <div
        className="absolute top-[22px] left-[20px] h-0.5 bg-emerald-400 dark:bg-emerald-500 z-0 transition-all duration-700"
        style={{
          width: isCompleted
            ? 'calc(100% - 40px)'
            : currentStep === 0
              ? '0%'
              : currentStep === 1
                ? 'calc(50% - 20px)'
                : 'calc(100% - 40px)',
        }}
      />

      {/* Steps */}
      <div className="relative z-10 flex justify-between items-start">
        {PIPELINE_STEPS.map((step, idx) => {
          const isDone = isCompleted || currentStep > idx;
          const isActive = currentStep === idx && !isCompleted;
          const StepIcon = step.icon;

          return (
            <div key={step.key} className="flex flex-col items-center gap-1.5 w-1/3">
              <div
                className={`h-11 w-11 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-sm
                  ${isDone ? `${step.bg} text-white shadow-lg` : ''}
                  ${isActive ? `bg-white dark:bg-slate-900 ${step.color} ring-4 ${step.ring} dark:ring-opacity-30 shadow-lg` : ''}
                  ${!isDone && !isActive ? 'bg-slate-100 dark:bg-slate-800 text-slate-400' : ''}
                `}
              >
                {isDone ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <StepIcon className="h-5 w-5" />
                )}
              </div>
              <div className="text-center px-1">
                <p className={`text-[9px] font-black uppercase tracking-widest leading-tight
                  ${isDone ? step.color : isActive ? step.color : 'text-slate-400 dark:text-slate-600'}
                `}>
                  {step.label}
                </p>
                {isActive && (
                  <p className="text-[8px] text-slate-400 dark:text-slate-500 font-bold leading-tight mt-0.5 hidden sm:block">
                    {step.sublabel}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Appointment Card ─────────────────────────────────────────────────────────
function AppointmentCard({ apt }: { apt: Appointment }) {
  const isActive = apt.status !== 'completed' && apt.status !== 'cancelled';
  const isConfirmed = apt.status === 'confirmed';
  const isPastAppt = isPast(parseLocalDate(apt.appointment_date));

  const borderColor = apt.status === 'cancelled'
    ? 'border-red-200 dark:border-red-900/30'
    : isConfirmed
      ? 'border-emerald-200 dark:border-emerald-900/30'
      : 'border-slate-200 dark:border-slate-800';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white dark:bg-slate-900 rounded-[28px] border-2 ${borderColor} p-6 shadow-sm hover:shadow-lg transition-all group`}
    >
      {/* Top row */}
      <div className="flex items-start justify-between mb-5 gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`h-12 w-12 rounded-2xl shrink-0 flex items-center justify-center transition-all
            ${isConfirmed ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-slate-50 dark:bg-slate-800'}`}>
            <Stethoscope className={`h-6 w-6 ${isConfirmed ? 'text-emerald-500' : 'text-slate-400'}`} />
          </div>
          <div className="min-w-0">
            <h4 className="font-black text-slate-900 dark:text-white text-sm truncate group-hover:text-blue-600 transition-colors">
              Dr. {apt.doctor_name}
            </h4>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">
              {apt.reason || 'Medical Consultation'}
            </p>
          </div>
        </div>

        {/* Date badge */}
        <div className={`shrink-0 text-center px-4 py-2 rounded-2xl
          ${isConfirmed ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-slate-50 dark:bg-slate-800'}`}>
          <p className={`text-xl font-black leading-none ${isConfirmed ? 'text-emerald-600' : 'text-slate-900 dark:text-white'}`}>
            {format(parseLocalDate(apt.appointment_date), 'dd')}
          </p>
          <p className={`text-[9px] font-black uppercase tracking-widest ${isConfirmed ? 'text-emerald-400' : 'text-slate-400'}`}>
            {format(parseLocalDate(apt.appointment_date), 'MMM')}
          </p>
        </div>
      </div>

      {/* Details row */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
          <Clock className="h-3.5 w-3.5 shrink-0" />
          <span>{formatTime(apt.appointment_time)}</span>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 min-w-0">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{apt.hospital_name}</span>
        </div>
      </div>

      {/* Doctor notes (only when confirmed) */}
      {apt.doctor_notes && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-900/30 flex gap-2">
          <FileText className="h-3.5 w-3.5 text-blue-500 shrink-0 mt-0.5" />
          <p className="text-[10px] font-bold text-blue-700 dark:text-blue-300 italic">"{apt.doctor_notes}"</p>
        </div>
      )}

      {/* Progress stepper or completed badge */}
      {isActive ? (
        <div className="mt-2">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">
            Approval Progress
          </p>
          <ApprovalStepper status={apt.status} />
        </div>
      ) : apt.status === 'completed' ? (
        <div className="flex items-center gap-2 py-2.5 px-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
          <CheckCircle2 className="h-4 w-4 text-slate-400 shrink-0" />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Appointment Completed {isPastAppt ? '· ' + format(new Date(apt.appointment_date), 'MMM d, yyyy') : ''}
          </p>
        </div>
      ) : (
        <ApprovalStepper status={apt.status} />
      )}
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function Appointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBookModal, setShowBookModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'active' | 'all'>('active');

  // Booking Form State
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [selectedHospitalId, setSelectedHospitalId] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const token = sessionStorage.getItem('token');

  const fetchAppointments = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch('http://localhost:5000/api/appointments/my', {
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

  const fetchDoctors = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:5000/api/doctors');
      if (res.ok) setDoctors(await res.json());
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  }, []);

  const fetchDoctorHospitals = useCallback(async (doctorId: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/doctors/${doctorId}/hospitals`);
      if (res.ok) {
        const data = await res.json();
        setHospitals(data);
      }
    } catch (error) {
      console.error('Error fetching doctor hospitals:', error);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
    fetchDoctors();
  }, [fetchAppointments, fetchDoctors]);

  useEffect(() => {
    if (selectedDoctorId) {
      fetchDoctorHospitals(selectedDoctorId);
    } else {
      setHospitals([]);
      setSelectedHospitalId('');
    }
  }, [selectedDoctorId, fetchDoctorHospitals]);

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
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          doctor_id: selectedDoctorId,
          hospital_id: selectedHospitalId,
          appointment_date: appointmentDate,
          appointment_time: appointmentTime,
          reason
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
    } catch {
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

  // ─── Computed lists ─────────────────────────────────────────────────────────
  const activeAppts = appointments.filter(a =>
    a.status !== 'completed' && a.status !== 'cancelled'
  );
  const pastAppts = appointments.filter(a =>
    a.status === 'completed' || a.status === 'cancelled'
  );
  const displayed = activeFilter === 'active' ? activeAppts : appointments;

  // ─── Stats ──────────────────────────────────────────────────────────────────
  const stats = [
    { label: 'In Progress', value: activeAppts.length, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Confirmed', value: appointments.filter(a => a.status === 'confirmed').length, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { label: 'Completed', value: pastAppts.filter(a => a.status === 'completed').length, color: 'text-slate-600', bg: 'bg-slate-50 dark:bg-slate-800' },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <p className="text-slate-500 font-bold animate-pulse">Loading your appointments...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">My Appointments</h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold mt-1">
            Track your consultation requests through the approval pipeline
          </p>
        </div>
        <button
          onClick={() => setShowBookModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-sm transition-all shadow-xl shadow-blue-500/20 hover:scale-105"
        >
          <Plus className="h-4 w-4" /> Book Appointment
        </button>
      </div>

      {/* ── Stats Strip ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        {stats.map(s => (
          <div key={s.label} className={`p-5 rounded-3xl ${s.bg} text-center`}>
            <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── How it works banner (shown when there are active appts) ────────── */}
      {activeAppts.length > 0 && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-5 text-white">
          <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-3">How Approvals Work</p>
          <div className="flex items-center gap-2 flex-wrap">
            {[
              { icon: Send, label: 'You Request' },
              { icon: Building2, label: 'Hospital Reviews' },
              { icon: Stethoscope, label: 'Doctor Confirms' },
            ].map((step, i) => (
              <div key={step.label} className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <div className="h-7 w-7 rounded-xl bg-white/20 flex items-center justify-center">
                    <step.icon className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-[11px] font-black">{step.label}</span>
                </div>
                {i < 2 && <ChevronRight className="h-4 w-4 opacity-50" />}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Filter tabs ─────────────────────────────────────────────────────── */}
      <div className="flex gap-2">
        {[
          { key: 'active', label: `Active (${activeAppts.length})` },
          { key: 'all', label: `All Time (${appointments.length})` },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveFilter(tab.key as 'active' | 'all')}
            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              activeFilter === tab.key
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl'
                : 'bg-white dark:bg-slate-900 text-slate-500 hover:text-slate-900 border border-slate-200 dark:border-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Appointment Cards ─────────────────────────────────────────────── */}
      {displayed.length === 0 ? (
        <div className="rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-800 p-16 text-center">
          <Calendar className="mx-auto h-12 w-12 text-slate-300 mb-4" />
          <p className="font-black text-slate-400 uppercase tracking-widest text-sm">No appointments found</p>
          <button
            onClick={() => setShowBookModal(true)}
            className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-2xl text-sm font-black hover:bg-blue-700 transition-all"
          >
            Book your first consultation
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {displayed.map(apt => (
            <AppointmentCard key={apt.id} apt={apt} />
          ))}
        </div>
      )}

      {/* ── Booking Modal ──────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showBookModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-lg">
            <motion.div
              initial={{ opacity: 0, scale: 0.93, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: 24 }}
              className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl w-full max-w-xl border border-slate-200 dark:border-slate-800 overflow-hidden"
            >
              {/* Modal header */}
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-white/20 flex items-center justify-center">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black">Book an Appointment</h3>
                    <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest">Starts the 3-step approval process</p>
                  </div>
                </div>
                <button onClick={() => setShowBookModal(false)} className="p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-all">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleBookAppointment} className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
                {/* Doctor */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <User className="h-3 w-3" /> Select Doctor
                  </label>
                  <select
                    value={selectedDoctorId}
                    onChange={e => setSelectedDoctorId(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  >
                    <option value="">Choose a medical professional...</option>
                    {doctors.map(d => (
                      <option key={d.id} value={d.id}>{d.full_name} — {d.specialization}</option>
                    ))}
                  </select>
                </div>

                {/* Hospital (depends on doctor) */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Building2 className="h-3 w-3" /> Select Hospital
                  </label>
                  <select
                    value={selectedHospitalId}
                    onChange={e => setSelectedHospitalId(e.target.value)}
                    disabled={!selectedDoctorId || hospitals.length === 0}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50"
                    required
                  >
                    <option value="">
                      {!selectedDoctorId
                        ? 'First select a doctor'
                        : hospitals.length === 0
                          ? 'No hospitals linked to this doctor'
                          : 'Select a hospital...'}
                    </option>
                    {hospitals.map(h => (
                      <option key={h.id} value={h.id}>{h.name} — {h.address}</option>
                    ))}
                  </select>
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <Calendar className="h-3 w-3" /> Date
                    </label>
                    <input
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      value={appointmentDate}
                      onChange={e => setAppointmentDate(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <Clock className="h-3 w-3" /> Time
                    </label>
                    <input
                      type="time"
                      value={appointmentTime}
                      onChange={e => setAppointmentTime(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                {/* Reason */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <FileText className="h-3 w-3" /> Reason for Visit
                  </label>
                  <textarea
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                    placeholder="Briefly describe your symptoms or reason for booking..."
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                    rows={3}
                  />
                </div>

                {/* Pipeline preview */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">
                    After submitting, your request will go through:
                  </p>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                    <span className="px-2 py-0.5 bg-orange-100 text-orange-600 rounded-lg">1. Your Request</span>
                    <ChevronRight className="h-3 w-3" />
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-600 rounded-lg">2. Hospital Approval</span>
                    <ChevronRight className="h-3 w-3" />
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-600 rounded-lg">3. Doctor Confirms</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-blue-500/20 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:scale-100"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  {submitting ? 'Submitting...' : 'Send Appointment Request'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
