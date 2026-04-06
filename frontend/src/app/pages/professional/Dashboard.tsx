import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router';
import { 
  Activity,
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
  CalendarDays,
  CheckCircle
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

  const [rounds, setRounds] = useState<any[]>([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedAssignPatient, setSelectedAssignPatient] = useState<string | null>(null);
  const [assignTitle, setAssignTitle] = useState('');
  const [assignType, setAssignType] = useState('Radiology Scan');
  const [isAssigning, setIsAssigning] = useState(false);

  const handleOrderTest = async () => {
    if (!selectedAssignPatient || !assignTitle || !token) {
        toast.error('Patient or Title missing for assignment');
        return;
    }
    
    setIsAssigning(true);
    try {
      const patient = assignedPatients.find(p => String(p.id) === String(selectedAssignPatient));
      const user = JSON.parse(sessionStorage.getItem('user') || '{}');
      
      // Robust Facility Discovery: Priority 1: Patient-linked facility | Priority 2: Professional's primary facility | Priority 3: Professional's facility array
      const hId = (patient as any)?.hospital_id || user.hospital_id || (Array.isArray(user.hospital_ids) ? user.hospital_ids[0] : user.hospital_ids);
      
      const numericPatientId = parseInt(selectedAssignPatient.replace(/\D/g, '')) || selectedAssignPatient;
      const numericHospitalId = hId ? parseInt(String(hId).replace(/\D/g, '')) : null;

      if (!numericHospitalId) {
          console.error('[Clinical Assignment] ID Failure:', { hId, user, patient });
          toast.error('Session expired. Please log out and back in to refresh clinical session.');
          return;
      }

      const res = await fetch('http://localhost:5000/api/lab/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          patient_id: numericPatientId,
          hospital_id: numericHospitalId,
          test_name: assignTitle,
          test_type: assignType
        })
      });

      if (res.ok) {
        toast.success(`${assignTitle} assigned successfully.`);
        setShowAssignModal(false);
        setAssignTitle('');
        setSelectedAssignPatient(null);
        fetchData();
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || 'Server error');
      }
    } catch (e) {
      toast.error('Medical server connection failed.');
    } finally {
      setIsAssigning(false);
    }
  };

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
      const roundsRes = await fetch('http://localhost:5000/api/rounds/my-rounds', {
          headers: { 'Authorization': `Bearer ${token}` }
      });
      if (roundsRes.ok) setRounds(await roundsRes.json());
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
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
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
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ status: 'completed' })
        });
        toast.success('Patient added');
        fetchData();
        setSelectedAppointment(null);
      }
    } catch (error) {
      toast.error('Action failed');
    }
  };

  const filteredPatients = assignedPatients.filter(patient => {
    const nameMatch = (patient as any).full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                      patient.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return nameMatch;
  });

  const pendingAppointments = appointments.filter(a => a.status === 'hospital_approved');
  const agendaAppointments = appointments
    .filter(a => a.status === 'confirmed')
    .filter(a => isSameDay(parseISO(a.appointment_date), parseISO(selectedDate)))
    .sort((a, b) => a.appointment_time.localeCompare(b.appointment_time));

  const upcomingAppointments = appointments
    .filter(a => a.status === 'confirmed' && isAfter(parseISO(a.appointment_date), startOfDay(new Date())))
    .sort((a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime());

  if (loading) return <div className="flex items-center justify-center min-h-[400px] bg-white dark:bg-slate-900"><Loader2 className="animate-spin h-10 w-10 text-blue-500" /></div>;

  return (
    <div className="space-y-8 pb-10 bg-white dark:bg-transparent min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Workspace</h1>
           <p className="text-slate-500 dark:text-slate-400">Real-time Clinical Dashboard</p>
        </div>
        {userRole === 'doctor' && (
          <button onClick={() => setShowAssignModal(true)} className="flex items-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-sm transition-all hover:scale-105 shadow-xl shadow-blue-500/20">
            <PlusCircle className="h-5 w-5" /> Assign Procedural Task
          </button>
        )}
      </div>

      {/* Pending Approvals */}
      {userRole === 'doctor' && pendingAppointments.length > 0 && (
        <section className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 p-6 rounded-2xl">
          <h3 className="font-bold text-amber-900 dark:text-amber-400 mb-4 flex items-center gap-2"><Clock className="h-5 w-5" /> Pending Approvals ({pendingAppointments.length})</h3>
          <div className="space-y-3">
            {pendingAppointments.map(appt => (
              <div key={appt.id} className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-xl border border-amber-100 dark:border-amber-900/20 shadow-sm transition-all hover:border-amber-400">
                <div><p className="font-bold capitalize text-slate-900 dark:text-white">{appt.patient_name}</p><p className="text-xs text-slate-500 dark:text-slate-400">{appt.appointment_time}</p></div>
                <button onClick={() => handleConfirmAppointment(appt.id)} className="px-4 py-2 bg-amber-600 text-white rounded-lg text-xs font-black shadow-lg shadow-amber-500/20">Confirm Slot</button>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-6">
           {/* Active Rounds Sync */}
           {rounds.filter(r => r.status !== 'completed').length > 0 && (
             <section className="space-y-4">
                <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2"><Activity className="text-emerald-500" /> Nursing Round Sync</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {rounds.filter(r => r.status !== 'completed').slice(0, 4).map(r => (
                     <div key={r.id} className="p-5 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20 rounded-[1.5rem] shadow-sm relative overflow-hidden">
                        <div className="flex justify-between items-start mb-2">
                           <div>
                              <h4 className="font-black text-slate-900 dark:text-white capitalize text-sm">{r.title}</h4>
                              <p className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500">Patient: {r.patient_name}</p>
                           </div>
                           <Activity className="h-4 w-4 text-emerald-500 animate-pulse" />
                        </div>
                        <div className="mt-4 h-1.5 w-full bg-emerald-200/50 dark:bg-slate-700 rounded-full overflow-hidden">
                           <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: '40%' }} />
                        </div>
                     </div>
                   ))}
                </div>
             </section>
           )}

           <div className="flex justify-between items-center">
              <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2"><CalendarDays className="text-blue-500" /> {isSameDay(parseISO(selectedDate), new Date()) ? "Today's Agenda" : "Agenda"}</h3>
              <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                 <Calendar className="h-4 w-4 text-slate-400" />
                 <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="bg-transparent border-none text-xs font-bold focus:outline-none text-slate-900 dark:text-white" />
              </div>
           </div>

           {agendaAppointments.length === 0 ? (
             <div className="p-12 border-2 border-dashed border-slate-200 dark:border-slate-800 text-center rounded-3xl flex flex-col items-center gap-4">
               <Calendar className="h-8 w-8 text-slate-300 dark:text-slate-700" />
               <p className="text-slate-500 dark:text-slate-400 font-bold">No scheduled engagements</p>
             </div>
           ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {agendaAppointments.map(appt => (
                  <div key={appt.id} onClick={() => setSelectedAppointment(appt)} className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl cursor-pointer hover:border-blue-500 transition-all shadow-sm relative group overflow-hidden">
                    <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity"><ChevronRight className="h-4 w-4 text-blue-500" /></div>
                    <p className="text-xs font-black text-blue-600">{appt.appointment_time}</p>
                    <h4 className="font-black text-slate-900 dark:text-white capitalize mb-2">{appt.patient_name}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1"><MapPin className="h-3 w-3" /> {appt.hospital_name}</p>
                  </div>
                ))}
             </div>
           )}

           {/* Upcoming Glimpse */}
           {upcomingAppointments.length > 0 && (
             <div className="pt-6 space-y-4">
               <h4 className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">Upcoming Agenda</h4>
               <div className="space-y-2">
                 {upcomingAppointments.slice(0, 3).map(appt => (
                   <div key={appt.id} className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-900/50 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all cursor-pointer" onClick={() => setSelectedAppointment(appt)}>
                     <div className="flex items-center gap-4">
                       <p className="text-xs font-black text-slate-900 dark:text-white">{format(parseISO(appt.appointment_date), 'MMM d')}</p>
                       <p className="text-sm font-bold capitalize text-slate-900 dark:text-white">{appt.patient_name}</p>
                     </div>
                     <ChevronRight className="h-3 w-3 text-slate-300" />
                   </div>
                 ))}
               </div>
             </div>
           )}
        </div>

        {/* Patients List */}
        <div className="space-y-6">
           <div className="flex flex-col gap-4">
              <h3 className="text-xl font-black text-slate-900 dark:text-white">Clinical Records</h3>
              <div className="relative">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                 <input type="text" placeholder="Search records..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 pr-3 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl w-full text-xs shadow-sm focus:border-blue-500 transition-all dark:text-white" />
              </div>
           </div>
           <div className="space-y-4">
              {filteredPatients.map(p => (
                <Link key={p.id} to={userRole === 'doctor' ? `/doctor/patient/${p.id}` : `/nurse/patient/${p.id}`} className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-blue-500 transition-all group shadow-sm border-l-[6px] border-l-blue-600">
                   <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center shadow-inner"><User className="text-slate-400 h-5 w-5" /></div>
                      <div>
                        <h4 className="text-sm font-bold capitalize group-hover:text-blue-600 text-slate-900 dark:text-white">{(p as any).full_name || p.name}</h4>
                        <p className="text-[10px] font-black uppercase text-emerald-600 flex items-center gap-1"><CheckCircle className="h-2.5 w-2.5" /> {p.condition || 'STABLE'}</p>
                      </div>
                   </div>
                   <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500" />
                </Link>
              ))}
           </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedAppointment && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-white/20">
               <div className="p-8 bg-blue-600 text-white flex justify-between items-center relative">
                  <h3 className="text-xl font-black flex items-center gap-2"><Calendar /> Review Appointment</h3>
                  <button onClick={() => setSelectedAppointment(null)} className="p-2 hover:bg-white/20 rounded-full transition-all"><X /></button>
               </div>
               <div className="p-8 space-y-6">
                  <div className="flex items-center gap-4 p-5 bg-slate-50 dark:bg-slate-800 rounded-2xl"><User className="text-blue-600 h-8 w-8" /><div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Assigned Patient</p><h4 className="text-xl font-black capitalize text-slate-900 dark:text-white">{selectedAppointment.patient_name}</h4></div></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center gap-3"><MapPin className="text-blue-500 h-4 w-4" /> <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{selectedAppointment.hospital_name}</p></div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center gap-3"><Clock className="text-blue-500 h-4 w-4" /> <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{selectedAppointment.appointment_time}</p></div>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-800 flex items-start gap-3"><FileText className="text-blue-500 h-4 w-4 mt-1" /><p className="text-sm text-slate-600 dark:text-slate-400 italic leading-relaxed">"{selectedAppointment.reason}"</p></div>
                  <button onClick={() => handleAddToMyPatients(selectedAppointment.patient_id, selectedAppointment.id, selectedAppointment.hospital_id)} className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-500/20 active:scale-95 transition-all">Add to My Records</button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {showAssignModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[999] flex items-center justify-center p-4" onClick={() => setShowAssignModal(false)}>
           <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-[3rem] shadow-2xl relative overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="p-10 bg-slate-900 text-white flex justify-between items-center relative">
                 <div className="relative z-10"><h3 className="text-2xl font-black text-white">Assign Procedure</h3><p className="text-[10px] uppercase text-blue-400 font-black tracking-widest mt-1">Initiate Clinical Care Round</p></div>
                 <button onClick={() => setShowAssignModal(false)} className="p-4 bg-white/10 rounded-full relative z-10 text-white"><X /></button>
                 <PlusCircle className="absolute right-[-2rem] top-[-2rem] w-48 h-48 text-white/5" />
              </div>
              <div className="p-10 space-y-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-2">1. Select Destination Patient</label>
                    <div className="grid grid-cols-1 gap-2">
                       {assignedPatients.map(p => (
                         <button key={p.id} onClick={() => setSelectedAssignPatient(String(p.id))} className={`w-full p-5 rounded-2xl border-2 text-left font-black transition-all flex justify-between items-center ${String(selectedAssignPatient) === String(p.id) ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-500/20' : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-blue-500/30 hover:bg-blue-50/10'}`}>
                           <span>{(p as any).name || (p as any).full_name}</span>
                           {String(selectedAssignPatient) === String(p.id) && <CheckCircle className="h-4 w-4" />}
                         </button>
                       ))}
                    </div>
                 </div>
                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-2">2. Procedural / Task Title</label>
                    <input type="text" placeholder="e.g. Brain MRI Prep Workflow" value={assignTitle} onChange={(e) => setAssignTitle(e.target.value)} className={`w-full p-6 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl font-black border-2 transition-all outline-none ${assignTitle.length >= 3 ? 'border-emerald-500 ring-4 ring-emerald-500/5' : 'border-transparent focus:border-blue-600'}`} />
                 </div>
                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-2">3. Diagnostic Category</label>
                    <div className="flex gap-2">
                       {['Radiology Scan', 'Laboratory Test', 'Vital Monitor'].map(type => (
                         <button key={type} onClick={() => setAssignType(type)} className={`flex-1 p-4 rounded-xl border-2 text-[10px] font-black tracking-widest transition-all ${assignType === type ? 'bg-blue-100 border-blue-600 text-blue-600' : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-600'}`}>{type.toUpperCase()}</button>
                       ))}
                    </div>
                 </div>
              </div>
              <div className="p-10 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900">
                 <button onClick={handleOrderTest} disabled={isAssigning || !selectedAssignPatient || assignTitle.length < 3} className="w-full py-6 bg-slate-900 dark:bg-blue-600 text-white rounded-[2.5rem] font-black uppercase text-sm shadow-2xl shadow-blue-500/30 active:scale-95 transition-all flex items-center justify-center gap-3">
                   {isAssigning ? <Loader2 className="animate-spin h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                   {isAssigning ? 'SYNCHRONIZING...' : 'CONFIRM ASSIGNMENT'} 
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Messaging Section (New) */}
      <div className="mt-8">
        <MessagingSection />
      </div>
    </div>
  );
}
