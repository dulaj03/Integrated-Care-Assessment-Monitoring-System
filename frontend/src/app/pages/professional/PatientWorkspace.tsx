import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router';
import {
  Activity, FlaskConical, Pill, ClipboardList, MessageSquare, Send, CheckCircle2, Clock,
  User, ArrowLeft, AlertTriangle, Heart, Thermometer, Droplet, Plus, Loader2
} from 'lucide-react';
import { Link } from 'react-router';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

type WorkspaceTab = 'overview' | 'nurse_logs' | 'nurse_reports' | 'lab_tests' | 'orders' | 'notes';

const ORDER_TYPES = [
  { value: 'lab_test', label: 'Lab Test', color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' },
  { value: 'scan', label: 'Scan / Imaging', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' },
  { value: 'medication', label: 'Medication', color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' },
  { value: 'referral', label: 'Referral', color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300' },
  { value: 'physiotherapy', label: 'Physiotherapy', color: 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300' },
];

export function PatientWorkspace() {
  const { id } = useParams<{ id: string }>();
  const [patient, setPatient] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('overview');
  const [loading, setLoading] = useState(true);

  // Data States
  const [vitals, setVitals] = useState<any[]>([]);
  const [labTests, setLabTests] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [availableNurses, setAvailableNurses] = useState<any[]>([]);

  // Form States
  const [noteForm, setNoteForm] = useState({ assessment: '', plan: '', request: '' });
  const [orderForm, setOrderForm] = useState({ type: 'lab_test', desc: '', details: '' });
  const [isNurseModalOpen, setIsNurseModalOpen] = useState(false);

  const token = sessionStorage.getItem('token');

  const fetchData = useCallback(async () => {
    if (!id || !token) return;
    try {
      setLoading(true);
      
      // 1. Get Patient Info from list (simplest for now)
      const pRes = await fetch('http://localhost:5000/api/doctor/patients', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const patients = await pRes.json();
      const currentPatient = patients.find((p: any) => p.id == id);
      setPatient(currentPatient);

      // 2. Fetch Vitals
      const vRes = await fetch(`http://localhost:5000/api/health/logs/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (vRes.ok) setVitals(await vRes.json());

      // 3. Fetch Orders
      const oRes = await fetch(`http://localhost:5000/api/doctor/orders/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (oRes.ok) setOrders(await oRes.json());

      // 4. Fetch Notes
      const nRes = await fetch(`http://localhost:5000/api/doctor/notes/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (nRes.ok) setNotes(await nRes.json());

      // 5. Fetch Labs
      const lRes = await fetch(`http://localhost:5000/api/lab/my`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (lRes.ok) {
          const labs = await lRes.json();
          setLabTests(labs.filter((l: any) => l.patient_id == id));
      }

      // 6. Fetch Reports (via doctor-accessible endpoint)
      const rRes = await fetch(`http://localhost:5000/api/doctor/nurse-reports/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
      });
      if (rRes.ok) setReports(await rRes.json());

    } catch (err) {
      console.error(err);
      toast.error('Data synchronization failed');
    } finally {
      setLoading(false);
    }
  }, [id, token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const fetchNurses = useCallback(async () => {
      // If no hospital_id, we still try to fetch (the backend will now fallback to general list)
      try {
          const url = patient?.hospital_id 
            ? `http://localhost:5000/api/doctor/nurses?hospital_id=${patient.hospital_id}`
            : `http://localhost:5000/api/doctor/nurses`;
            
          const res = await fetch(url, {
              headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await res.json();
          setAvailableNurses(Array.isArray(data) ? data : []);
      } catch (err) {
          toast.error('Could not load staff list');
      }
  }, [patient?.hospital_id, token]);

  useEffect(() => {
    if (isNurseModalOpen) {
      fetchNurses();
    }
  }, [isNurseModalOpen, fetchNurses]);

  const handleAssignNurse = async (nurseId: number) => {
    try {
      const res = await fetch('http://localhost:5000/api/doctor/patients/assign-nurse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ patientId: id, nurseId })
      });
      if (res.ok) {
        toast.success('Nurse assigned successfully');
        setIsNurseModalOpen(false);
        fetchData(); // refresh
      }
    } catch (err) {
      toast.error('Assignment failed');
    }
  };

  const handleSubmitOrder = async () => {
    if (!orderForm.desc.trim()) return;
    try {
      const res = await fetch('http://localhost:5000/api/doctor/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          patient_id: id,
          order_type: orderForm.type,
          description: orderForm.desc,
          details: orderForm.details
        })
      });
      if (res.ok) {
        toast.success('Order synchronized with hospital system');
        setOrderForm({ type: 'lab_test', desc: '', details: '' });
        fetchData();
      }
    } catch (err) {
      toast.error('System error: Order failed');
    }
  };

  const handleSubmitNote = async () => {
    if (!noteForm.assessment.trim()) return;
    try {
      const res = await fetch('http://localhost:5000/api/doctor/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          patient_id: id,
          assessment: noteForm.assessment,
          plan: noteForm.plan,
          request_to_nurse: noteForm.request
        })
      });
      if (res.ok) {
        toast.success('Clinical note saved and shared with care team');
        setNoteForm({ assessment: '', plan: '', request: '' });
        fetchData();
      }
    } catch (err) {
      toast.error('Failed to save record');
    }
  };

  const handleSignLab = async (testId: number, reviewNote: string) => {
    try {
        const res = await fetch(`http://localhost:5000/api/lab/${testId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ status: 'reviewed_by_doctor', result_summary: reviewNote })
        });
        if (res.ok) {
            toast.success('Report reviewed and signed');
            fetchData();
        }
    } catch (err) {
        toast.error('Signature failed');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] gap-4">
        <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
        <p className="font-bold text-slate-500">Synchronizing Clinical Workspace...</p>
      </div>
    );
  }

  if (!patient) return <div className="p-20 text-center font-bold text-slate-400">Record synchronization error. Please try again.</div>;

  const latestVitals = vitals[0];

  return (
    <div className="space-y-6 pb-10">
      {/* Header Panel */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-[32px] shadow-sm relative overflow-hidden ring-1 ring-slate-200/50">
        <div className="flex flex-col md:flex-row md:items-center gap-6 relative z-10">
          <Link to="/doctor/patients" className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl hover:bg-slate-100 transition-all text-slate-500">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="h-20 w-20 rounded-3xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center border-2 border-white dark:border-slate-800 shadow-xl overflow-hidden">
             <User className="h-10 w-10 text-blue-600" />
          </div>
          <div className="flex-1">
             <div className="flex items-center gap-3 mb-1">
                <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{patient.full_name}</h2>
                <span className={`px-4 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                  patient.status?.toLowerCase() === 'critical' ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'
                }`}>
                  {patient.status || 'STABLE'}
                </span>
             </div>
             <p className="text-slate-500 dark:text-slate-400 font-bold uppercase text-xs tracking-widest">
                ID: PAT-{patient.id.toString().padStart(4, '0')} • {patient.condition || 'General Observation'} • Hospital: {patient.hospital_id}
             </p>
          </div>
          <div className="flex gap-3">
             <button 
               onClick={() => setIsNurseModalOpen(true)}
               className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl text-xs font-black hover:scale-105 transition-all shadow-xl shadow-slate-900/10 flex items-center gap-2"
             >
               <User className="h-4 w-4" /> {patient.nurses?.length > 0 ? 'Managed Care' : 'Assign Nurse'}
             </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {[
          { key: 'overview', label: 'Overview', icon: Activity },
          { key: 'nurse_logs', label: `Logs (${vitals.length})`, icon: ClipboardList },
          { key: 'nurse_reports', label: `Reports (${reports.length})`, icon: Send },
          { key: 'lab_tests', label: `Labs (${labTests.length})`, icon: FlaskConical },
          { key: 'orders', label: `Orders (${orders.length})`, icon: Pill },
          { key: 'notes', label: 'Clinical Notes', icon: MessageSquare },
        ].map(tab => (
          <button 
            key={tab.key}
            onClick={() => setActiveTab(tab.key as WorkspaceTab)}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black transition-all whitespace-nowrap ${
              activeTab === tab.key 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105' 
                : 'bg-white dark:bg-slate-900 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div key="ov" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
               {/* Vital Stats Cards */}
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'BP', value: latestVitals ? `${latestVitals.systolic_bp}/${latestVitals.diastolic_bp}` : '--', unit: 'mmHg', icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Pulse', value: latestVitals?.heart_rate || '--', unit: 'bpm', icon: Heart, color: 'text-rose-600', bg: 'bg-rose-50' },
                    { label: 'Temp', value: latestVitals?.temperature || '--', unit: '°C', icon: Thermometer, color: 'text-amber-600', bg: 'bg-amber-50' },
                    { label: 'SpO2', value: latestVitals?.oxygen_level || '--', unit: '%', icon: Droplet, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative group overflow-hidden">
                       <stat.icon className={`h-12 w-12 absolute -right-2 -bottom-2 opacity-10 ${stat.color} group-hover:scale-110 transition-transform`} />
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{stat.label}</p>
                       <div className="flex items-baseline gap-1">
                          <span className={`text-2xl font-black ${stat.color}`}>{stat.value}</span>
                          <span className="text-[10px] font-bold text-slate-400">{stat.unit}</span>
                       </div>
                    </div>
                  ))}
               </div>

               {/* Flagged Alert */}
               {latestVitals?.notes && (
                 <div className="p-6 rounded-[2rem] bg-rose-50 dark:bg-rose-900/20 border-2 border-rose-100 dark:border-rose-900/30 flex gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-rose-500/20">
                       <AlertTriangle className="h-6 w-6" />
                    </div>
                    <div>
                       <h4 className="font-black text-rose-900 dark:text-rose-300 text-sm mb-1 uppercase tracking-tight">System Alert: Clinical Observation</h4>
                       <p className="text-sm text-rose-700 dark:text-rose-400 leading-relaxed font-bold">"{latestVitals.notes}"</p>
                       <p className="text-[10px] text-rose-500 mt-2 uppercase font-black tracking-widest">Logged: {format(new Date(latestVitals.created_at), 'MMM d, h:mm a')}</p>
                    </div>
                 </div>
               )}

               {/* Quick Order Input */}
               <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
                  <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6 tracking-tight flex items-center gap-3">
                     <div className="p-2 bg-blue-600 rounded-xl"><Send className="h-5 w-5 text-white" /></div> 
                     Instant Care Order
                  </h3>
                  <div className="space-y-4">
                     <div className="flex flex-wrap gap-2 mb-2">
                        {ORDER_TYPES.map(ot => (
                          <button 
                            key={ot.value} 
                            onClick={() => setOrderForm({ ...orderForm, type: ot.value })}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                              orderForm.type === ot.value ? 'bg-slate-900 text-white ring-4 ring-slate-100' : 'bg-slate-50 text-slate-500'
                            }`}
                          >
                             {ot.label}
                          </button>
                        ))}
                     </div>
                     <input 
                       className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 text-sm font-bold placeholder-slate-400 focus:ring-2 focus:ring-blue-500" 
                       placeholder="What is the required procedure or medication?" 
                       value={orderForm.desc}
                       onChange={e => setOrderForm({ ...orderForm, desc: e.target.value })}
                     />
                     <textarea 
                       className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 text-sm font-bold placeholder-slate-400 focus:ring-2 focus:ring-blue-500 min-h-[100px]" 
                       placeholder="Dosage instructions, frequency or laboratory specific requirements..." 
                       value={orderForm.details}
                       onChange={e => setOrderForm({ ...orderForm, details: e.target.value })}
                     />
                     <button 
                       onClick={handleSubmitOrder}
                       className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-[1.5rem] text-sm font-black transition-all shadow-xl shadow-blue-500/20"
                     >
                        Confirm & Transmit Order
                     </button>
                  </div>
               </div>
            </div>

            <div className="space-y-6">
                {/* Condition Triage */}
                <div className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 p-6 rounded-[2rem] shadow-2xl">
                   <p className="text-[10px] font-black opacity-50 uppercase tracking-widest mb-4">Patient Condition Triage</p>
                   <div className="space-y-3">
                      {[
                        { val: 'stable', label: 'Standard Protocol (Stable)', color: 'bg-emerald-500' },
                        { val: 'monitoring', label: 'Close Observation (Monitoring)', color: 'bg-amber-500' },
                        { val: 'critical', label: 'High Dependency (Critical)', color: 'bg-rose-500' },
                      ].map(c => (
                        <button 
                          key={c.val}
                          onClick={async () => {
                              await fetch(`http://localhost:5000/api/doctor/patients/condition/${id}`, {
                                  method: 'PATCH',
                                  headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                  body: JSON.stringify({ condition: c.val })
                              });
                              toast.success(`Triage updated to ${c.val}`);
                              fetchData();
                          }}
                          className={`w-full p-3 rounded-2xl border flex items-center gap-3 transition-all ${
                            patient.condition === c.val ? 'bg-white/10 border-white/20' : 'bg-transparent border-transparent opacity-40 hover:opacity-100'
                          }`}
                        >
                           <div className={`h-3 w-3 rounded-full ${c.color}`} />
                           <span className="text-xs font-black uppercase tracking-tight">{c.label}</span>
                        </button>
                      ))}
                   </div>
                </div>

                {/* Team Panel */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
                   <h4 className="text-sm font-black text-slate-900 dark:text-white mb-4 uppercase tracking-widest">Designated Care Team</h4>
                   {patient.nurses?.length > 0 ? (
                     <div className="space-y-4">
                        {patient.nurses.map((n: any) => (
                          <div key={n.id} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                             <div className="h-10 w-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 font-black">
                                {n.full_name?.charAt(0)}
                             </div>
                             <div className="flex-1">
                                <p className="text-xs font-black text-slate-900 dark:text-white leading-tight">{n.full_name}</p>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Nursing Duty</p>
                             </div>
                             <Link to={`/messages?userId=${n.id}`} className="p-2 hover:bg-slate-200 rounded-lg transition-colors">
                                <Send className="h-4 w-4 text-blue-500" />
                             </Link>
                          </div>
                        ))}
                     </div>
                   ) : (
                     <p className="text-xs font-bold text-slate-400 italic">No nursing staff assigned yet.</p>
                   )}
                </div>
            </div>
          </motion.div>
        )}

        {/* Other Tabs Simplified for brevity but real data linked */}
        {activeTab === 'nurse_logs' && (
           <motion.div key="logs" className="space-y-4">
              {vitals.map(log => (
                <div key={log.id} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 flex gap-6 items-center">
                   <div className="shrink-0 text-center">
                      <p className="text-2xl font-black text-slate-900 dark:text-white leading-none">{format(new Date(log.created_at), 'dd')}</p>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{format(new Date(log.created_at), 'MMM')}</p>
                   </div>
                   <div className="flex-1 grid grid-cols-4 gap-4">
                      <div><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">BP</p><p className="text-sm font-black text-slate-700">{log.systolic_bp}/{log.diastolic_bp}</p></div>
                      <div><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">PULSE</p><p className="text-sm font-black text-slate-700">{log.heart_rate} bpm</p></div>
                      <div><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">TEMP</p><p className="text-sm font-black text-slate-700">{log.temperature}°C</p></div>
                      <div><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">O2</p><p className="text-sm font-black text-slate-700">{log.oxygen_level}%</p></div>
                   </div>
                   {log.notes && <div className="hidden md:block max-w-[300px] text-xs font-bold text-slate-500 italic">"{log.notes}"</div>}
                </div>
              ))}
           </motion.div>
        )}

        {activeTab === 'lab_tests' && (
           <motion.div key="labs" className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {labTests.map(test => (
                <div key={test.id} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-xl group">
                   <div className="flex items-start justify-between mb-4">
                      <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                         <FlaskConical className="h-6 w-6" />
                      </div>
                      <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${
                        test.status === 'ready' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'
                      }`}>
                         {test.status}
                      </span>
                   </div>
                   <h4 className="text-xl font-black text-slate-900 dark:text-white mb-1">{test.test_name}</h4>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Type: {test.test_type} • Date: {format(new Date(test.created_at), 'MMM d, yyyy')}</p>
                   
                   {test.result_summary && (
                     <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl mb-4">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 underline decoration-indigo-500">Official Findings</p>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300 leading-relaxed">{test.result_summary}</p>
                     </div>
                   )}

                   {test.status !== 'reviewed_by_doctor' ? (
                     <div className="pt-2">
                        <textarea 
                          id={`review-${test.id}`}
                          className="w-full bg-slate-50 border-none rounded-xl p-3 text-xs font-bold placeholder-slate-400 mb-2"
                          placeholder="Your clinical review & follow-up instructions..."
                        />
                        <button 
                          onClick={() => {
                              const note = (document.getElementById(`review-${test.id}`) as HTMLTextAreaElement).value;
                              handleSignLab(test.id, note);
                          }}
                          className="w-full py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20"
                        >
                           Sign & Finalize Result
                        </button>
                     </div>
                   ) : (
                     <div className="pt-2 flex items-center gap-2 text-emerald-600 font-black text-[10px] uppercase tracking-widest">
                        <CheckCircle2 className="h-4 w-4" /> Reviewed by Doctor
                     </div>
                   )}
                </div>
              ))}
           </motion.div>
        )}
        {activeTab === 'orders' && (
           <motion.div key="orders_tab" className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {orders.length === 0 ? (
                <div className="md:col-span-2 p-20 text-center font-bold text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
                  No active clinical orders for this patient.
                </div>
              ) : (
                orders.map(order => (
                  <div key={order.id} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                     <div className="flex items-center justify-between mb-4">
                        <div className={`p-3 rounded-2xl ${
                          ORDER_TYPES.find(ot => ot.value === order.order_type)?.color || 'bg-slate-100 text-slate-600'
                        }`}>
                          <Pill className="h-5 w-5" />
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{format(new Date(order.created_at), 'MMM d, yyyy · HH:mm')}</span>
                     </div>
                     <h4 className="text-lg font-black text-slate-900 dark:text-white mb-1 capitalize">{order.order_type?.replace('_', ' ')}</h4>
                     <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4">{order.description}</p>
                     {order.details && (
                       <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Directives</p>
                          <p className="text-xs font-bold text-slate-500 italic">"{order.details}"</p>
                       </div>
                     )}
                     <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-all">
                        <div className="px-3 py-1 bg-emerald-500 text-white rounded-lg text-[9px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20">Active</div>
                     </div>
                  </div>
                ))
              )}
           </motion.div>
        )}

        {activeTab === 'notes' && (
           <motion.div key="notes_tab" className="space-y-6">
               <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm ring-2 ring-blue-50">
                  <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6 uppercase tracking-tight">Clinical Assessment Entry</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                     <div className="space-y-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Assessment & Observations</p>
                        <textarea 
                          className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold min-h-[120px]" 
                          placeholder="What did you observe today?"
                          value={noteForm.assessment}
                          onChange={e => setNoteForm({...noteForm, assessment: e.target.value})}
                        />
                     </div>
                     <div className="space-y-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Clinical Plan & Follow-up</p>
                        <textarea 
                          className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold min-h-[120px]" 
                          placeholder="What are the next steps?"
                          value={noteForm.plan}
                          onChange={e => setNoteForm({...noteForm, plan: e.target.value})}
                        />
                     </div>
                  </div>
                  <div className="space-y-2 mb-6">
                    <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest ml-2">Specific Instructions for Assigned Nurse</p>
                    <input 
                      className="w-full bg-purple-50/50 border-none rounded-2xl p-4 text-sm font-bold" 
                      placeholder="e.g. Check temperature every 2 hours, Monitor for dizziness..."
                      value={noteForm.request}
                      onChange={e => setNoteForm({...noteForm, request: e.target.value})}
                    />
                  </div>
                  <button onClick={handleSubmitNote} className="px-10 py-4 bg-slate-900 text-white rounded-[1.5rem] text-xs font-black uppercase tracking-widest shadow-2xl">
                     Save Clinical Record
                  </button>
               </div>

               {notes.map(note => (
                 <div key={note.id} className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-6">
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{format(new Date(note.created_at), 'MMMM d, yyyy · H:mm')}</span>
                       <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 underline decoration-blue-500 decoration-2">Assessment</p>
                          <p className="text-sm font-bold text-slate-700 leading-relaxed capitalize">{note.assessment}</p>
                       </div>
                       <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 underline decoration-emerald-500 decoration-2">Plan</p>
                          <p className="text-sm font-bold text-slate-700 leading-relaxed capitalize">{note.plan}</p>
                       </div>
                    </div>
                    {note.request_to_nurse && (
                      <div className="mt-8 p-4 bg-purple-50 rounded-2xl border border-purple-100 flex items-center gap-4">
                         <div className="p-2 bg-purple-600 rounded-lg text-white"><Clock className="h-4 w-4" /></div>
                         <div className="flex-1">
                            <p className="text-[9px] font-black text-purple-600 uppercase tracking-widest">Nursing Directive</p>
                            <p className="text-xs font-bold text-purple-900">"{note.request_to_nurse}"</p>
                         </div>
                         {note.nurse_response && (
                            <div className="px-4 py-2 bg-white rounded-xl border border-purple-200 text-[10px] font-black text-slate-500">Replied: Checked ✓</div>
                         )}
                      </div>
                    )}
                 </div>
               ))}
           </motion.div>
        )}
      </AnimatePresence>

      {/* Nurse Assignment Modal */}
      <AnimatePresence>
        {isNurseModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 40 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 w-full max-w-lg border border-white/20 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8">
                 <button onClick={() => setIsNurseModalOpen(false)} className="p-2 bg-slate-100 rounded-full text-slate-400 hover:text-slate-900">
                    <Plus className="h-6 w-6 rotate-45" />
                 </button>
              </div>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">On-Duty Nursing Staff</h3>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-8">Select a qualified nurse from Hospital {patient.hospital_id}</p>
              
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {availableNurses.length === 0 ? (
                  <div className="p-10 text-center text-slate-400 font-bold italic">No active nursing staff found for this facility.</div>
                ) : (
                  availableNurses.map((nurse: any) => (
                    <div key={nurse.id} className="p-5 rounded-3xl border-2 border-slate-50 hover:border-blue-500 transition-all group flex items-center gap-4 cursor-pointer" onClick={() => handleAssignNurse(nurse.id)}>
                      <div className="h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 font-black text-xl group-hover:bg-blue-600 group-hover:text-white transition-all">
                        {nurse.name?.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <p className="font-black text-slate-900 dark:text-white uppercase text-xs tracking-tight">{nurse.name}</p>
                        <p className="text-[10px] font-bold text-slate-400">{nurse.qualification} • {nurse.years_of_experience} yrs EXP</p>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-all">
                         <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Plus className="h-4 w-4" /></div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
