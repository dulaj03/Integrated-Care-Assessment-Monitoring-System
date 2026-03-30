import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router';
import { 
  Clock, 
  ChevronRight, 
  User, 
  Loader2, 
  Calendar, 
  PlusCircle, 
  Search, 
  X,
  FileText,
  MapPin,
  CalendarDays
} from 'lucide-react';
import { Patient } from '../../lib/mockData';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { format, isSameDay, parseISO, isAfter, startOfDay } from 'date-fns';
import { MessagingSection } from '../../components/MessagingSection';

export function ProfessionalDashboard({ role }: { role?: 'doctor' | 'nurse' }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [assignedPatients, setAssignedPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [selectedAppointment, setSelectedAppointment] = useState<any | null>(null);

  const userRole = role || (sessionStorage.getItem('userRole') as 'doctor' | 'nurse') || 'doctor';
  const token = sessionStorage.getItem('token');

  const fetchData = useCallback(async () => {
    if (!token) return;
    try {
      const assignedRes = await fetch(`http://localhost:5000/api/${userRole}/patients`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (assignedRes.ok) {
        const data = await assignedRes.json();
        setAssignedPatients(data);
      }
      if (userRole === 'doctor') {
        const apptRes = await fetch('http://localhost:5000/api/appointments/my', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (apptRes.ok) {
          const data = await apptRes.json();
          setAppointments(data);
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [token, userRole]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleConfirmAppointment = async (id: number) => {
    try {
      const res = await fetch(`http://localhost:5000/api/appointments/status/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'confirmed' })
      });
      if (res.ok) {
        toast.success('Appointment confirmed');
        fetchData();
      }
    } catch (error) {
      toast.error('Update failed');
    }
  };

  const handleAddToMyPatients = async (patientId: number, appointmentId: number, hospitalId: number) => {
    try {
      const res = await fetch(`http://localhost:5000/api/doctor/patients/approve/${patientId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ hospital_id: hospitalId })
      });
      if (res.ok) {
        await fetch(`http://localhost:5000/api/appointments/status/${appointmentId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ status: 'completed', doctor_notes: 'Patient added to my regular list' })
        });
        toast.success('Patient successfully added to your list');
        fetchData();
        setSelectedAppointment(null);
      }
    } catch (error) {
      toast.error('Action failed');
    }
  };

  const filteredPatients = assignedPatients.filter(patient => {
    const nameMatch = patient.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                      (patient as any).full_name?.toLowerCase().includes(searchQuery.toLowerCase());
    return nameMatch;
  });

  const pendingAppointments = appointments.filter(a => a.status === 'hospital_approved');
  
  // Master Agenda: Filtered by date picker, or show future if none selected
  const agendaAppointments = appointments
    .filter(a => a.status === 'confirmed')
    .filter(a => isSameDay(parseISO(a.appointment_date), parseISO(selectedDate)))
    .sort((a, b) => a.appointment_time.localeCompare(b.appointment_time));

  const upcomingAppointments = appointments
    .filter(a => a.status === 'confirmed' && isAfter(parseISO(a.appointment_date), startOfDay(new Date())))
    .sort((a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime());

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Professional Workspace</h1>
           <p className="text-slate-500 dark:text-slate-400">Manage your agenda and patient records in real-time.</p>
        </div>
        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
           <button 
             onClick={() => setSelectedDate(format(new Date(), 'yyyy-MM-dd'))}
             className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${selectedDate === format(new Date(), 'yyyy-MM-dd') ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
           >
             TODAY
           </button>
           <div className="w-px h-4 bg-slate-200 dark:bg-slate-800 mx-1" />
           <div className="relative">
             <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
             <input 
               type="date" 
               value={selectedDate}
               onChange={(e) => setSelectedDate(e.target.value)}
               className="pl-9 pr-3 py-2 bg-transparent text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none"
             />
           </div>
        </div>
      </div>

      {/* Appointment Requests Section - DOCTOR ONLY */}
      {userRole === 'doctor' && pendingAppointments.length > 0 && (
        <section className="bg-orange-50/50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-900/30 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-orange-200 dark:border-orange-900/30 flex items-center justify-between">
            <h3 className="font-bold text-orange-900 dark:text-orange-400 flex items-center gap-2">
              <Clock className="h-5 w-5" /> Pending Approvals
            </h3>
            <span className="px-2 py-0.5 bg-orange-200 dark:bg-orange-800 text-orange-900 dark:text-orange-100 text-[10px] font-black rounded-full">
              {pendingAppointments.length} ACTION REQUIRED
            </span>
          </div>
          <div className="divide-y divide-orange-100 dark:divide-orange-900/20">
            {pendingAppointments.map(appt => (
              <div key={appt.id} className="p-5 flex items-center justify-between group hover:bg-orange-100/20 transition-all">
                <div>
                  <p className="font-bold text-slate-900 dark:text-white capitalize">{appt.patient_name}</p>
                  <p className="text-xs text-slate-500 font-medium">
                    {appt.hospital_name} · {format(parseISO(appt.appointment_date), 'MMM d')} at {appt.appointment_time}
                  </p>
                </div>
                <button 
                  onClick={() => handleConfirmAppointment(appt.id)}
                  className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-black transition-all shadow-lg shadow-orange-500/20 flex items-center gap-2"
                >
                  Confirm Slot
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Agenda Section */}
        <div className="xl:col-span-2 space-y-6">
           <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <CalendarDays className="h-6 w-6 text-blue-500" /> 
                {isSameDay(parseISO(selectedDate), new Date()) ? "Today's Agenda" : format(parseISO(selectedDate), 'MMMM do')}
              </h3>
              <p className="text-xs font-bold text-slate-400">{agendaAppointments.length} Appointments scheduled</p>
           </div>

           {agendaAppointments.length === 0 ? (
             <div className="bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-12 flex flex-col items-center justify-center gap-4 text-center">
                <div className="h-16 w-16 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-300">
                  <Calendar className="h-8 w-8" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">No engagements scheduled</p>
                  <p className="text-sm text-slate-500">You don't have any confirmed meetings for this day.</p>
                </div>
             </div>
           ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {agendaAppointments.map((appt, i) => (
                 <motion.div 
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: i * 0.05 }}
                   key={appt.id} 
                   onClick={() => setSelectedAppointment(appt)}
                   className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/5 transition-all cursor-pointer group relative overflow-hidden"
                 >
                    <div className="absolute top-0 right-0 p-3">
                       <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                       <div className="h-12 w-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600">
                          <User className="h-6 w-6" />
                       </div>
                       <div>
                         <p className="text-xs font-black text-blue-600 uppercase tracking-widest">{appt.appointment_time}</p>
                         <h4 className="font-black text-slate-900 dark:text-white capitalize">{appt.patient_name}</h4>
                       </div>
                    </div>
                    <div className="space-y-2">
                       <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                          <MapPin className="h-3.5 w-3.5" /> {appt.hospital_name}
                       </div>
                       <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                          <FileText className="h-3.5 w-3.5" /> {appt.reason.slice(0, 40)}{appt.reason.length > 40 && '...'}
                       </div>
                    </div>
                 </motion.div>
               ))}
             </div>
           )}

           {/* Quick Upcoming Section */}
           <div className="space-y-4">
              <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">Upcoming in Next Days</h4>
              <div className="space-y-2">
                {upcomingAppointments.slice(0, 3).map((appt) => (
                   <div key={appt.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-white/10 transition-all cursor-pointer" onClick={() => setSelectedAppointment(appt)}>
                      <div className="flex items-center gap-4">
                         <div className="text-center min-w-[50px]">
                           <p className="text-[10px] font-black text-slate-400 uppercase">{format(parseISO(appt.appointment_date), 'MMM')}</p>
                           <p className="text-lg font-black text-slate-900 dark:text-white leading-none">{format(parseISO(appt.appointment_date), 'dd')}</p>
                         </div>
                         <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white capitalize">{appt.patient_name}</p>
                            <p className="text-xs text-slate-500">{appt.appointment_time} · {appt.hospital_name}</p>
                         </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-300" />
                   </div>
                ))}
              </div>
           </div>
        </div>

        {/* Patients Column */}
        <div className="space-y-6">
           <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Active Patients</h3>
              <div className="relative">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                 <input 
                   type="text" 
                   placeholder="Search..." 
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   className="pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none w-32 md:w-48"
                 />
              </div>
           </div>

           <div className="space-y-4">
              {filteredPatients.length === 0 ? (
                <p className="text-slate-500 text-sm italic">No matching patients found.</p>
              ) : (
                filteredPatients.map(patient => (
                  <Link 
                    key={patient.id} 
                    to={userRole === 'doctor' ? `/doctor/patient/${patient.id}` : `/nurse/patient/${patient.id}`}
                    className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-blue-500 transition-all group shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                        <User className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors capitalize">
                          {(patient as any).full_name || patient.name}
                        </h4>
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase ${
                          patient.condition?.toLowerCase() === 'critical' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {patient.condition || 'STABLE'}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
                  </Link>
                ))
              )}
           </div>
        </div>
      </div>

      {/* Appointment Detail Modal */}
      <AnimatePresence>
        {selectedAppointment && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative h-32 bg-blue-600 flex items-center justify-center text-white overflow-hidden">
                 <div className="absolute inset-0 opacity-20">
                    <Calendar className="w-64 h-64 -rotate-12 absolute -right-10 -bottom-10" />
                 </div>
                 <div className="relative flex flex-col items-center">
                    <p className="text-xs font-black uppercase tracking-widest opacity-80 mb-1">Appointment Session</p>
                    <h2 className="text-2xl font-black">Detail Review</h2>
                 </div>
                 <button 
                   onClick={() => setSelectedAppointment(null)}
                   className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 rounded-full transition-all"
                 >
                   <X className="w-5 h-5" />
                 </button>
              </div>

              <div className="p-8 space-y-6">
                 <div className="flex items-center gap-5 p-5 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5">
                    <div className="h-14 w-14 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center text-blue-600 shadow-sm">
                       <User className="h-7 w-7" />
                    </div>
                    <div>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Assigned Patient</p>
                       <h3 className="text-xl font-black text-slate-900 dark:text-white capitalize">{selectedAppointment.patient_name}</h3>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Scheduled Date</p>
                       <p className="text-sm font-bold text-slate-900 dark:text-white">{format(parseISO(selectedAppointment.appointment_date), 'MMMM d, yyyy')}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Expected Time</p>
                       <p className="text-sm font-bold text-slate-900 dark:text-white">{selectedAppointment.appointment_time}</p>
                    </div>
                 </div>

                 <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Facility / Hospital</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                       <MapPin className="h-4 w-4 text-blue-500" /> {selectedAppointment.hospital_name}
                    </p>
                 </div>

                 <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Consultation Reason</p>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed italic">
                       "{selectedAppointment.reason}"
                    </p>
                 </div>

                 <div className="pt-4 flex gap-3">
                    <button 
                      onClick={() => setSelectedAppointment(null)}
                      className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-black transition-all"
                    >
                      Close View
                    </button>
                    <button 
                      onClick={() => handleAddToMyPatients(selectedAppointment.patient_id, selectedAppointment.id, selectedAppointment.hospital_id)}
                      className="flex-[2] py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-black transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2"
                    >
                      <PlusCircle className="h-4 w-4" /> Add to My List
                    </button>
                 </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Messaging Section (New) */}
      <div className="mt-8">
        <MessagingSection />
      </div>
    </div>
  );
}
