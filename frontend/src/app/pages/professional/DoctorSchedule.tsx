import { Calendar, Clock, MapPin, AlertCircle, CheckCircle, Loader2, DollarSign, Save, Building2 } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { format, isSameDay, isWithinInterval, addDays, startOfDay, endOfDay } from 'date-fns';
import { toast } from 'sonner';
import { motion } from 'motion/react';

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

function formatTime(timeInput: string): string {
  if (!timeInput) return '--:--';
  if (timeInput.includes('T')) return format(new Date(timeInput), 'h:mm a');
  const [hours, minutes] = timeInput.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes);
  return format(date, 'h:mm a');
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

interface Appointment {
  id: string; patient_name: string; reason: string;
  appointment_date: string; appointment_time: string;
  hospital_name: string; status: string; doctor_notes?: string; patient_id: string;
}
interface Hospital { id: number; name: string; }
interface AvailabilitySlot { day_of_week: string; start_time: string; end_time: string; slot_duration_minutes: number; }
interface DoctorFee { hospital_id: number; hospital_name: string; consultation_fee: string; }

export function DoctorSchedule() {
  const [activeTab, setActiveTab] = useState<'appointments' | 'availability' | 'fees'>('appointments');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewType, setViewType] = useState<'today' | 'week' | 'all'>('today');
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [selectedHospitalId, setSelectedHospitalId] = useState('');
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [fees, setFees] = useState<DoctorFee[]>([]);
  const [feeInputs, setFeeInputs] = useState<Record<number, string>>({});
  const [savingAvail, setSavingAvail] = useState(false);
  const [savingFee, setSavingFee] = useState<number | null>(null);
  const token = sessionStorage.getItem('token');

  const fetchAppointments = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/appointments/my', { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) setAppointments(await res.json());
    } catch { /* silent */ } finally { setLoading(false); }
  }, [token]);

  const fetchHospitals = useCallback(async () => {
    if (!token) return;
    try {
      // Get doctor's hospitals
      const docRes = await fetch('/api/auth/me', { headers: { 'Authorization': `Bearer ${token}` } });
      if (docRes.ok) {
        const data = await docRes.json();
        const hospIds: number[] = data.user?.hospital_ids || [];
        if (hospIds.length > 0) {
          const results = await Promise.all(
            hospIds.map((id: number) => fetch(`/api/hospitals/${id}`).then(r => r.ok ? r.json() : null))
          );
          setHospitals(results.filter(Boolean));
          if (results.length > 0 && results[0]) setSelectedHospitalId(String(results[0].id));
        }
      }
    } catch (e) { console.error(e); }
  }, [token]);

  const fetchAvailability = useCallback(async (hospitalId: string) => {
    try {
      const res = await fetch('/api/availability/my', { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        const hospitalSlots = data.filter((s: any) => String(s.hospital_id) === String(hospitalId));
        setSlots(hospitalSlots.map((s: any) => ({
          day_of_week: s.day_of_week, start_time: s.start_time.slice(0, 5),
          end_time: s.end_time.slice(0, 5), slot_duration_minutes: s.slot_duration_minutes
        })));
      }
    } catch { /* silent */ }
  }, [token]);

  const fetchFees = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/availability/fees', { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setFees(data);
        const inputs: Record<number, string> = {};
        data.forEach((f: DoctorFee) => { inputs[f.hospital_id] = String(f.consultation_fee); });
        setFeeInputs(inputs);
      }
    } catch { /* silent */ }
  }, [token]);

  useEffect(() => { fetchAppointments(); fetchHospitals(); fetchFees(); }, [fetchAppointments, fetchHospitals, fetchFees]);
  useEffect(() => {
    if (selectedHospitalId) fetchAvailability(selectedHospitalId);
  }, [selectedHospitalId, fetchAvailability]);

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/appointments/status/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status })
      });
      if (res.ok) { toast.success('Status updated'); fetchAppointments(); }
    } catch { toast.error('Update failed'); }
  };

  const toggleDay = (day: string) => {
    const exists = slots.find(s => s.day_of_week === day);
    if (exists) {
      setSlots(slots.filter(s => s.day_of_week !== day));
    } else {
      setSlots([...slots, { day_of_week: day, start_time: '08:00', end_time: '17:00', slot_duration_minutes: 30 }]);
    }
  };

  const updateSlot = (day: string, field: string, value: string) => {
    setSlots(slots.map(s => s.day_of_week === day ? { ...s, [field]: value } : s));
  };

  const saveAvailability = async () => {
    if (!selectedHospitalId) { toast.error('Please select a hospital'); return; }
    setSavingAvail(true);
    try {
      const res = await fetch('/api/availability/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ hospital_id: selectedHospitalId, slots })
      });
      if (res.ok) toast.success('Availability saved successfully!');
      else toast.error('Failed to save availability');
    } catch { toast.error('Network error'); } finally { setSavingAvail(false); }
  };

  const saveFee = async (hospitalId: number) => {
    setSavingFee(hospitalId);
    try {
      const res = await fetch('/api/availability/fees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ hospital_id: hospitalId, consultation_fee: parseFloat(feeInputs[hospitalId] || '0') })
      });
      if (res.ok) { toast.success('Consultation fee updated!'); fetchFees(); }
      else toast.error('Failed to update fee');
    } catch { toast.error('Network error'); } finally { setSavingFee(null); }
  };

  const getTodayAppts = () => appointments.filter(a => isSameDay(parseLocalDate(a.appointment_date), new Date()));
  const getWeekAppts = () => appointments.filter(a => isWithinInterval(parseLocalDate(a.appointment_date), { start: startOfDay(new Date()), end: endOfDay(addDays(new Date(), 7)) }));
  const displayedAppointments = viewType === 'today' ? getTodayAppts() : viewType === 'week' ? getWeekAppts() : appointments;
  const stats = { today: getTodayAppts().length, inProgress: appointments.filter(a => a.status === 'in_progress').length, scheduled: appointments.filter(a => a.status === 'confirmed').length, completed: appointments.filter(a => a.status === 'completed').length };

  const getStatusColor = (status: string) => {
    switch (status) {
    case 'completed': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300';
    case 'in_progress': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
    case 'confirmed': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300';
    case 'cancelled': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
    default: return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 gap-4">
      <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      <p className="font-bold text-slate-500">Loading your schedule...</p>
    </div>
  );

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">My Schedule</h2>
          <p className="text-slate-500 dark:text-slate-400 font-bold mt-1">Manage appointments, availability & consultation fees</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl w-fit">
        {[
          { key: 'appointments', label: 'Appointments', icon: Calendar },
          { key: 'availability', label: 'Availability', icon: Clock },
          { key: 'fees', label: 'Fees', icon: DollarSign },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black transition-all ${activeTab === tab.key ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}>
            <tab.icon className="h-4 w-4" /> {tab.label}
          </button>
        ))}
      </div>

      {/* ── Appointments Tab ── */}
      {activeTab === 'appointments' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'New Today', value: stats.today, icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
              { label: 'In Progress', value: stats.inProgress, icon: AlertCircle, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
              { label: 'Scheduled', value: stats.scheduled, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
              { label: 'Completed', value: stats.completed, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
            ].map(s => (
              <div key={s.label} className={`rounded-3xl p-5 ${s.bg}`}>
                <div className="flex items-center justify-between mb-2">
                  <s.icon className={`h-6 w-6 ${s.color}`} />
                  <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            {['today', 'week', 'all'].map(t => (
              <button key={t} onClick={() => setViewType(t as any)}
                className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${viewType === t ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xl' : 'bg-white dark:bg-slate-900 text-slate-500 border border-slate-200 dark:border-slate-800'}`}>
                {t === 'today' ? 'Today' : t === 'week' ? 'This Week' : 'All'}
              </button>
            ))}
          </div>
          {displayedAppointments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {displayedAppointments.map(appt => (
                <div key={appt.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:shadow-xl transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h4 className="font-black text-slate-900 dark:text-white capitalize text-lg">{appt.patient_name}</h4>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{appt.reason}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusColor(appt.status)}`}>
                      {appt.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="space-y-2 mb-4">
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
                      <button onClick={() => updateStatus(appt.id, 'in_progress')}
                        className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-black shadow-lg shadow-blue-500/20 hover:scale-105 transition-all">
                        Start Session
                      </button>
                    )}
                    {appt.status === 'in_progress' && (
                      <button onClick={() => updateStatus(appt.id, 'completed')}
                        className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-black shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all">
                        Complete Session
                      </button>
                    )}
                    {appt.status === 'completed' && (
                      <button className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-xl text-xs font-black italic">Session Finalized</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800 p-20 text-center">
              <Calendar className="mx-auto h-12 w-12 text-slate-300 mb-4" />
              <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-widest">No activities found</h3>
            </div>
          )}
        </div>
      )}

      {/* ── Availability Tab ── */}
      {activeTab === 'availability' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-5 border border-blue-100 dark:border-blue-900/30">
            <p className="text-sm font-bold text-blue-700 dark:text-blue-300">
              💡 Set your available days and hours for each hospital. Patients will see these slots when booking appointments. Update every week before <strong>Sunday</strong>.
            </p>
          </div>

          {/* Hospital selector */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Building2 className="h-3 w-3" /> Select Hospital
            </label>
            <select value={selectedHospitalId} onChange={e => setSelectedHospitalId(e.target.value)}
              className="w-full max-w-sm px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
              <option value="">Select a hospital...</option>
              {hospitals.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
            </select>
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-1 gap-4">
            {DAYS.map(day => {
              const slot = slots.find(s => s.day_of_week === day);
              const active = !!slot;
              return (
                <div key={day} className={`rounded-2xl border-2 transition-all ${active ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'}`}>
                  <div className="flex items-center justify-between p-4">
                    <button onClick={() => toggleDay(day)}
                      className={`flex items-center gap-3 font-black text-sm ${active ? 'text-blue-700 dark:text-blue-300' : 'text-slate-500'}`}>
                      <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all ${active ? 'bg-blue-600 border-blue-600' : 'border-slate-300'}`}>
                        {active && <div className="h-2 w-2 rounded-full bg-white" />}
                      </div>
                      {day}
                    </button>
                    {active && (
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500 font-bold">From</span>
                          <input type="time" value={slot!.start_time} onChange={e => updateSlot(day, 'start_time', e.target.value)}
                            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-white" />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500 font-bold">To</span>
                          <input type="time" value={slot!.end_time} onChange={e => updateSlot(day, 'end_time', e.target.value)}
                            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-white" />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500 font-bold">Slot</span>
                          <select value={slot!.slot_duration_minutes} onChange={e => updateSlot(day, 'slot_duration_minutes', e.target.value)}
                            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold">
                            <option value="15">15 min</option>
                            <option value="20">20 min</option>
                            <option value="30">30 min</option>
                            <option value="45">45 min</option>
                            <option value="60">60 min</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <button onClick={saveAvailability} disabled={savingAvail || !selectedHospitalId}
            className="flex items-center gap-2 px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-sm shadow-xl shadow-blue-500/20 hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100">
            {savingAvail ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {savingAvail ? 'Saving...' : 'Save Availability'}
          </button>
        </motion.div>
      )}

      {/* ── Fees Tab ── */}
      {activeTab === 'fees' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-5 border border-emerald-100 dark:border-emerald-900/30">
            <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
              💰 Set your consultation fee for each hospital. This will appear on patient invoices along with the hospital facility fee and I-CAMS platform fee.
            </p>
          </div>

          {hospitals.length === 0 ? (
            <div className="text-center py-16 text-slate-500">
              <Building2 className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="font-bold">No hospitals linked to your account</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {hospitals.map(h => {
                const fee = fees.find(f => f.hospital_id === h.id);
                return (
                  <div key={h.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="h-10 w-10 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-black text-slate-900 dark:text-white text-sm">{h.name}</h4>
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest">Current: {fee ? `LKR ${parseFloat(fee.consultation_fee).toLocaleString()}` : 'Not set'}</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">Consultation Fee (LKR)</label>
                        <input type="number" min="0" step="50"
                          value={feeInputs[h.id] || ''}
                          onChange={e => setFeeInputs({ ...feeInputs, [h.id]: e.target.value })}
                          placeholder="e.g. 2500"
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
                      </div>
                      <button onClick={() => saveFee(h.id)} disabled={savingFee === h.id}
                        className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-sm flex items-center gap-2 self-end transition-all hover:scale-105 disabled:opacity-50 disabled:scale-100">
                        {savingFee === h.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
