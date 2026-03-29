import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router';
import { ArrowLeft, Send, Activity, Clock, CheckCircle2, Loader2, ClipboardList, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

export function PatientDetail() {
  const { id } = useParams<{ id: string }>();
  const [patient, setPatient] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Form Stats
  const [vitalsForm, setVitalsForm] = useState({
      systolic: '', diastolic: '', pulse: '', temp: '', spo2: '', notes: '', mood: 'good', symptoms: [] as string[]
  });
  const [reportForm, setReportForm] = useState({ title: 'Daily Care Review', summary: '', recommendations: '' });

  const token = sessionStorage.getItem('token');

  const fetchData = useCallback(async () => {
    if (!id || !token) return;
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:5000/api/nurse/patients/${id}/details`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
          const data = await res.json();
          setPatient(data.patient);
          setLogs(data.logs);
      }
    } catch (err) {
      toast.error('Patient record synchronization error');
    } finally {
      setLoading(false);
    }
  }, [id, token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmitVitals = async () => {
    if (!vitalsForm.systolic || !vitalsForm.diastolic || !vitalsForm.pulse) {
        toast.error('Principal vitals are required');
        return;
    }
    try {
      const res = await fetch('http://localhost:5000/api/nurse/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          patient_id: id,
          systolic_bp: parseInt(vitalsForm.systolic),
          diastolic_bp: parseInt(vitalsForm.diastolic),
          heart_rate: parseInt(vitalsForm.pulse),
          temperature: parseFloat(vitalsForm.temp),
          oxygen_level: parseInt(vitalsForm.spo2),
          mood: vitalsForm.mood,
          symptoms: vitalsForm.symptoms,
          notes: vitalsForm.notes
        })
      });
      if (res.ok) {
        toast.success('Vitals synchronized with clinical HQ');
        setIsLogModalOpen(false);
        setVitalsForm({ systolic: '', diastolic: '', pulse: '', temp: '', spo2: '', notes: '', mood: 'good', symptoms: [] });
        fetchData();
      }
    } catch (err) {
      toast.error('Sync failed');
    }
  };

  const handleSubmitReport = async () => {
      if (!reportForm.summary.trim()) return;
      try {
          const res = await fetch('http://localhost:5000/api/nurse/reports', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
              body: JSON.stringify({
                  patient_id: id,
                  title: reportForm.title,
                  summary: reportForm.summary,
                  recommendations: reportForm.recommendations,
                  steps: [],
                  vitals_snapshot: logs[0] ? { bp: `${logs[0].systolic_bp}/${logs[0].diastolic_bp}`, hr: logs[0].heart_rate, temp: logs[0].temperature, spo2: logs[0].oxygen_level } : {}
              })
          });
          if (res.ok) {
              toast.success('Shift report submitted to direct doctor');
              setIsReportModalOpen(false);
              setReportForm({ title: 'Daily Care Review', summary: '', recommendations: '' });
          }
      } catch (err) {
          toast.error('System error: Report submission failed');
      }
  };

  if (loading) return <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
      <p className="font-black text-slate-500 uppercase tracking-widest text-[10px]">Accessing patient file...</p>
  </div>;

  if (!patient) return <div className="p-20 text-center font-bold text-slate-400 uppercase tracking-widest">Unauthorized access - Restricted patient record.</div>;

  return (
    <div className="space-y-8 pb-10">
      {/* Header Panel */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-200 dark:border-slate-800 shadow-xl relative overflow-hidden group">
         <div className="absolute top-0 right-0 p-8 flex flex-col items-end">
            <span className={`px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest ${
                patient.condition === 'critical' ? 'bg-rose-500 text-white animate-pulse' : 'bg-emerald-500 text-white'
            }`}>
                {patient.condition || 'STABLE'}
            </span>
         </div>
         <div className="flex items-center gap-8">
            <Link to="/nurse/patients" className="p-4 bg-slate-50 rounded-2xl text-slate-400 hover:text-slate-900 transition-all">
                <ArrowLeft className="h-6 w-6" />
            </Link>
            <div className="h-24 w-24 rounded-3xl bg-slate-100 flex items-center justify-center text-slate-300 font-black text-4xl shadow-inner uppercase tracking-tighter">
                {patient.full_name?.charAt(0)}
            </div>
            <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2 underline decoration-blue-500 decoration-8 underline-offset-8 decoration-white/0 group-hover:decoration-blue-500/20 transition-all">{patient.full_name}</h1>
                <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em]">Patient Supervision Panel • ID: PAT-{patient.id.toString().padStart(4, '0')} • Floor 3, Ward A</p>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Main Content: History */}
         <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                   <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                      <div className="p-2 bg-blue-600 rounded-xl text-white"><ClipboardList className="h-5 w-5" /></div>
                      Nursing Supervision History
                   </h3>
                   <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{logs.length} Total Logs Recorded</span>
                </div>
                
                <div className="space-y-6">
                   {logs.length === 0 ? (
                      <div className="p-20 text-center font-bold text-slate-300 italic">No health logs recorded in current shift.</div>
                   ) : logs.map(log => (
                      <div key={log.id} className="p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-200 flex flex-col md:flex-row gap-6 relative group hover:scale-[1.01] transition-all">
                         <div className="shrink-0 text-center">
                            <p className="text-2xl font-black text-slate-900 leading-none">{format(new Date(log.created_at), 'HH:mm')}</p>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{format(new Date(log.created_at), 'MMM d')}</p>
                         </div>
                         <div className="flex-1">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                               <div><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">BP</p><p className="text-sm font-black text-slate-700">{log.systolic_bp}/{log.diastolic_bp}</p></div>
                               <div><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Pulse</p><p className="text-sm font-black text-rose-600">{log.heart_rate} bpm</p></div>
                               <div><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Temp</p><p className="text-sm font-black text-amber-600">{log.temperature}°C</p></div>
                               <div><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">O2</p><p className="text-sm font-black text-emerald-600">{log.oxygen_level}%</p></div>
                            </div>
                            {log.notes && (
                                <div className="p-4 bg-white/50 rounded-2xl border-l-4 border-blue-500">
                                   <p className="text-xs font-bold text-slate-600 italic">"{log.notes}"</p>
                                </div>
                            )}
                         </div>
                      </div>
                   ))}
                </div>
            </div>
         </div>

         {/* Actions Sidebar */}
         <div className="space-y-6">
            <div className="bg-slate-900 text-white p-8 rounded-[40px] shadow-2xl space-y-4">
                <p className="text-[10px] font-black opacity-50 uppercase tracking-[0.2em] mb-4">Patient Management Actions</p>
                <button 
                  onClick={() => setIsLogModalOpen(true)}
                  className="w-full py-4 bg-white text-slate-900 rounded-3xl text-sm font-black flex items-center justify-center gap-3 hover:scale-105 transition-all shadow-xl shadow-white/10"
                >
                    <Activity className="h-5 w-5" /> Record New Vitals
                </button>
                <button 
                  onClick={() => setIsReportModalOpen(true)}
                  className="w-full py-4 bg-blue-600 text-white rounded-3xl text-sm font-black flex items-center justify-center gap-3 hover:scale-105 transition-all shadow-xl shadow-blue-500/20"
                >
                    <Send className="h-5 w-5" /> Submit Shift Report
                </button>
            </div>

            {/* Doctor Directive Display */}
            <div className="bg-white p-8 rounded-[40px] border-2 border-purple-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5"><Plus className="h-20 w-20 text-purple-900" /></div>
                <h4 className="text-xs font-black text-purple-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Clock className="h-4 w-4" /> Doctor's Directives
                </h4>
                <p className="text-xs font-bold text-slate-500 italic mb-4">"No specific additional orders assigned for this patient by the primary Dr. saran perera today."</p>
                <div className="p-4 bg-purple-50 rounded-2xl text-[10px] font-black text-purple-600 uppercase tracking-widest text-center cursor-not-allowed border border-purple-100">
                    Awaiting Directives
                </div>
            </div>
         </div>
      </div>

      {/* Vitals Recording Modal */}
      <AnimatePresence>
        {isLogModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-xl">
             <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-[3rem] p-10 w-full max-w-2xl border border-white/20 shadow-2xl relative">
                <button onClick={() => setIsLogModalOpen(false)} className="absolute top-10 right-10 p-2 bg-slate-100 rounded-full hover:bg-slate-200">
                    <Plus className="h-6 w-6 rotate-45" />
                </button>
                <h3 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Vitals Record Entry</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-10">Principal health indicators for HQ synchronization</p>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
                   <div className="space-y-2">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">BP (Sys/Dia)</p>
                      <div className="flex items-center gap-2">
                         <input className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold placeholder-slate-300" placeholder="120" value={vitalsForm.systolic} onChange={e => setVitalsForm({...vitalsForm, systolic: e.target.value})} />
                         <span className="font-black text-slate-300">/</span>
                         <input className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold placeholder-slate-300" placeholder="80" value={vitalsForm.diastolic} onChange={e => setVitalsForm({...vitalsForm, diastolic: e.target.value})} />
                      </div>
                   </div>
                   <div className="space-y-2">
                      <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest ml-2">Pulse Rate</p>
                      <input className="w-full bg-rose-50 border-none rounded-2xl p-4 text-sm font-bold text-rose-600 placeholder-rose-200" placeholder="72" value={vitalsForm.pulse} onChange={e => setVitalsForm({...vitalsForm, pulse: e.target.value})} />
                   </div>
                   <div className="space-y-2">
                      <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest ml-2">Temperature</p>
                      <input className="w-full bg-amber-50 border-none rounded-2xl p-4 text-sm font-bold text-amber-600 placeholder-amber-200" placeholder="37.0" value={vitalsForm.temp} onChange={e => setVitalsForm({...vitalsForm, temp: e.target.value})} />
                   </div>
                   <div className="space-y-2">
                      <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest ml-2">Oxygen Level %</p>
                      <input className="w-full bg-blue-50 border-none rounded-2xl p-4 text-sm font-bold text-blue-600 placeholder-blue-200" placeholder="98" value={vitalsForm.spo2} onChange={e => setVitalsForm({...vitalsForm, spo2: e.target.value})} />
                   </div>
                </div>

                <div className="space-y-2 mb-8">
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Nursing Assessment & Notes</p>
                   <textarea className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold min-h-[120px]" placeholder="Record any visible symptoms or concerns observed during round..." value={vitalsForm.notes} onChange={e => setVitalsForm({...vitalsForm, notes: e.target.value})} />
                </div>

                <div className="flex gap-4">
                   <button onClick={handleSubmitVitals} className="flex-1 py-5 bg-slate-900 text-white rounded-[1.5rem] font-black text-sm uppercase tracking-widest shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" /> Commit to Medical Record
                   </button>
                </div>
             </motion.div>
          </div>
        )}

        {isReportModalOpen && (
           <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-xl">
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-[3rem] p-10 w-full max-w-lg border border-white/20 shadow-2xl relative">
                 <button onClick={() => setIsReportModalOpen(false)} className="absolute top-10 right-10 p-2 bg-slate-100 rounded-full hover:bg-slate-200">
                     <Plus className="h-6 w-6 rotate-45" />
                 </button>
                 <h3 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Shift Report Filing</h3>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-10">Formal nursing care summary submission</p>
                 
                 <div className="space-y-6">
                    <div className="space-y-2">
                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Summary of Care</p>
                       <textarea className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold min-h-[150px]" placeholder="Detailed overview of patient activity and care provided during your shift..." value={reportForm.summary} onChange={e => setReportForm({...reportForm, summary: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Key Recommendations</p>
                       <input className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold" placeholder="Actions for next shift or doctor..." value={reportForm.recommendations} onChange={e => setReportForm({...reportForm, recommendations: e.target.value})} />
                    </div>
                    <button onClick={handleSubmitReport} className="w-full py-5 bg-blue-600 text-white rounded-[1.5rem] font-black text-sm uppercase tracking-widest shadow-2xl hover:scale-105 transition-all">
                       Submit Final Report
                    </button>
                 </div>
              </motion.div>
           </div>
        )}
      </AnimatePresence>
    </div>
  );
}
