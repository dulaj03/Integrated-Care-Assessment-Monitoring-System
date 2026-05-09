import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router';
import { Users, ClipboardList, Activity, Send, MessageSquare, User, CheckCircle2, History as HistoryIcon, Loader2, Clock, AlertCircle, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

type NurseTab = 'patients' | 'log_symptoms' | 'doctor_orders' | 'nurse_report' | 'care_notes' | 'lab_results';

interface SymptomForm {
  blood_pressure: string;
  heart_rate: string;
  temperature: string;
  oxygen_level: string;
  weight: string;
  respiratory_rate: string;
  symptoms: string[];
  pain_level: number;
  mood: 'great' | 'good' | 'okay' | 'poor' | 'bad';
  notes: string;
  flag_doctor: boolean;
}

export function NursePatientCare() {
  const [activeTab, setActiveTab] = useState<NurseTab>('patients');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Data State
  const [patients, setPatients] = useState<any[]>([]);
  const [nurseLogs, setNurseLogs] = useState<any[]>([]);
  const [doctorOrders, setDoctorOrders] = useState<any[]>([]);
  const [clinicalNotes, setClinicalNotes] = useState<any[]>([]);
  const [labTests, setLabTests] = useState<any[]>([]);

  // Token & Token Data
  const token = sessionStorage.getItem('token');

  // Fetch Patients
  const fetchPatients = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch('/api/nurse/patients', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setPatients(await res.json());
    } catch (err) {
      toast.error('Failed to sync patient directory');
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Fetch Selected Patient Data
  const fetchSelectedData = useCallback(async (pid: string) => {
    if (!token || !pid) return;
    try {
      const [lRes, oRes, nRes] = await Promise.all([
        fetch(`/api/nurse/logs/${pid}`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`/api/nurse/orders/${pid}`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`/api/nurse/notes/${pid}`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      if (lRes.ok) setNurseLogs(await lRes.json());
      if (oRes.ok) setDoctorOrders(await oRes.json());
      if (nRes.ok) setClinicalNotes(await nRes.json());

      // Fetch lab tests for this patient
      const lrRes = await fetch(`/api/lab/patient/${pid}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (lrRes.ok) setLabTests(await lrRes.json());
    } catch (err) {
      console.error('Data pull failed', err);
    }
  }, [token]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  useEffect(() => {
    if (selectedPatientId) {
      fetchSelectedData(selectedPatientId);
    }
  }, [selectedPatientId, fetchSelectedData]);

  // Form States
  const [form, setForm] = useState<SymptomForm>({
    blood_pressure: '', heart_rate: '', temperature: '', oxygen_level: '',
    weight: '', respiratory_rate: '', symptoms: [], pain_level: 0,
    mood: 'okay', notes: '', flag_doctor: false,
  });

  const [reportSummary, setReportSummary] = useState('');
  const [reportRecs, setReportRecs] = useState('');
  const [reportTasks, setReportTasks] = useState([
    { title: 'Vitals Monitoring', description: '', completed: false },
    { title: 'Medication Delivery', description: '', completed: false },
    { title: 'Patient Meal Assistance', description: '', completed: false },
    { title: 'Personal Hygiene', description: '', completed: false },
  ]);

  const [labUpload, setLabUpload] = useState<{ id: string | null; summary: string; file: File | null }>({
    id: null,
    summary: '',
    file: null
  });
  const [uploadingLab, setUploadingLab] = useState(false);

  const selectedPatient = patients.find(p => String(p.id) === String(selectedPatientId));

  const handleSubmitLog = async () => {
    if (!selectedPatientId) return;
    try {
      const parts = form.blood_pressure.split('/');
      const res = await fetch('/api/nurse/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          patient_id: selectedPatientId,
          systolic_bp: parseInt(parts[0]) || 0,
          diastolic_bp: parseInt(parts[1]) || 0,
          heart_rate: parseInt(form.heart_rate) || 0,
          temperature: parseFloat(form.temperature) || 37.0,
          oxygen_level: parseInt(form.oxygen_level) || 98,
          mood: form.mood,
          symptoms: form.symptoms,
          notes: form.notes
        })
      });

      if (res.ok) {
        toast.success('Clinical log synchronized successfully');
        setForm({
          blood_pressure: '', heart_rate: '', temperature: '', oxygen_level: '',
          weight: '', respiratory_rate: '', symptoms: [], pain_level: 0,
          mood: 'okay', notes: '', flag_doctor: false,
        });
        fetchSelectedData(selectedPatientId);
      }
    } catch (err) {
      toast.error('Sync error: log not saved');
    }
  };

  const handleSubmitReport = async () => {
    if (!selectedPatientId || !reportSummary.trim()) return;
    try {
      const res = await fetch('/api/nurse/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          patient_id: selectedPatientId,
          title: `End-of-Shift Care Report - ${format(new Date(), 'MMM d')}`,
          summary: reportSummary,
          recommendations: reportRecs,
          steps: reportTasks,
          vitals_snapshot: nurseLogs[0] ? { bp: `${nurseLogs[0].systolic_bp}/${nurseLogs[0].diastolic_bp}`, hr: nurseLogs[0].heart_rate, temp: nurseLogs[0].temperature, spo2: nurseLogs[0].oxygen_level } : {}
        })
      });
      if (res.ok) {
        toast.success('Shift report filed and shared with doctor');
        setReportSummary('');
        setReportRecs('');
        fetchSelectedData(selectedPatientId);
      }
    } catch (err) {
      toast.error('Report submission failed');
    }
  };

  const handleUploadLabResult = async () => {
    if (!labUpload.id || !labUpload.summary) {
      toast.error('Result summary is required');
      return;
    }
    if (!token) return;
    setUploadingLab(true);
    const formData = new FormData();
    formData.append('result_summary', labUpload.summary);
    if (labUpload.file) formData.append('profile_picture', labUpload.file); // Reusing field name for now

    try {
      const res = await fetch(`/api/lab/upload/${labUpload.id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      if (res.ok) {
        toast.success('Lab results synchronized with patient file');
        setLabUpload({ id: null, summary: '', file: null });
        if (selectedPatientId) fetchSelectedData(selectedPatientId);
      }
    } catch (err) {
      toast.error('Upload failed');
    } finally {
      setUploadingLab(false);
    }
  };

  const TABS: { key: NurseTab; label: string; icon: any; badge?: number }[] = [
    { key: 'patients', label: 'My Patients', icon: Users },
    { key: 'log_symptoms', label: 'Log Vitals', icon: ClipboardList },
    { key: 'doctor_orders', label: `Orders (${doctorOrders.filter(o => o.status !== 'completed').length})`, icon: Activity },
    { key: 'nurse_report', label: 'Shift Report', icon: Send },
    { key: 'care_notes', label: 'Clinical Notes', icon: MessageSquare },
    { key: 'lab_results', label: `Labs (${labTests.filter(l => l.status === 'ordered').length})`, icon: Activity },
  ];

  if (loading && patients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
        <p className="font-black text-slate-400 uppercase tracking-widest text-[10px]">Accessing clinical workspace...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-auto lg:h-[calc(100vh-100px)] overflow-hidden bg-slate-50 dark:bg-slate-950 rounded-[2rem] lg:rounded-[40px] border border-slate-200 dark:border-slate-800 shadow-2xl">
      <div className="flex flex-col lg:flex-row h-full overflow-y-auto lg:overflow-hidden">
        {/* Left Sidebar: Patient List & Tabs */}
        <div className="w-full lg:w-[380px] flex flex-col border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl">
          <div className="p-6 lg:p-8">
            <h2 className="text-xl lg:text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Nursing HQ</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 lg:mb-8">Active Supervision Center</p>
              
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-1 gap-2 lg:space-y-2">
              {TABS.map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`w-full flex items-center gap-3 lg:gap-4 px-4 lg:px-6 py-3 lg:py-4 rounded-2xl lg:rounded-3xl text-sm font-black transition-all ${
                      activeTab === tab.key 
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl scale-[1.02]' 
                        : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <tab.icon className="h-4 w-4 lg:h-5 lg:w-5" />
                    <span className="flex-1 text-left uppercase tracking-widest text-[9px] lg:text-[11px] truncate">{tab.label}</span>
                    {tab.badge && tab.badge > 0 && (
                      <span className="h-4 w-4 lg:h-5 lg:w-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[8px] lg:text-[9px]">{tab.badge}</span>
                    )}
                  </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 pb-8 custom-scrollbar max-h-[300px] lg:max-h-none">
            <div className="space-y-4">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-2 mb-2">Assigned Patients</p>
              {patients.length === 0 ? (
                <div className="p-10 text-center text-xs font-bold text-slate-400 italic">No assigned patients.</div>
              ) : patients.map(p => (
                <button
                  key={p.id}
                  onClick={() => { setSelectedPatientId(String(p.id)); setActiveTab('log_symptoms'); }}
                  className={`w-full p-5 rounded-[2rem] border-2 transition-all flex items-start gap-4 text-left ${
                    selectedPatientId === String(p.id)
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 shadow-lg shadow-blue-500/10'
                      : 'bg-white dark:bg-slate-800 border-transparent hover:border-slate-200 dark:hover:border-slate-700'
                  }`}
                >
                  <div className={`h-12 w-12 rounded-2xl flex items-center justify-center font-black text-xl shadow-inner ${
                    p.condition === 'critical' ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {p.full_name?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-slate-900 dark:text-white truncate uppercase tracking-tight">{p.full_name}</p>
                    <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-tight">{p.condition || 'STABLE'}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className={`h-2 w-2 rounded-full ${p.condition === 'critical' ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`} />
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active Watch</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Workspace */}
        <div className="flex-1 overflow-y-auto bg-white/30 dark:bg-slate-900/10 p-6 lg:p-10 custom-scrollbar">
          <AnimatePresence mode="wait">
            {!selectedPatientId ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col items-center justify-center text-center space-y-4">
                <div className="h-24 w-24 bg-slate-100 dark:bg-slate-800 rounded-[3rem] flex items-center justify-center text-slate-300">
                  <User className="h-12 w-12" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Select Patient for Rounds</h3>
                <p className="text-sm text-slate-500 max-w-xs font-bold leading-relaxed">Choose an assigned patient from the directory to begin clinical observation and care management.</p>
              </motion.div>
            ) : (
              <motion.div key={selectedPatientId + activeTab} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-10">
                {/* Workspace Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="h-16 w-16 lg:h-20 lg:w-20 rounded-2xl lg:rounded-[2rem] bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center text-2xl lg:text-3xl font-black shadow-2xl">
                      {selectedPatient?.full_name?.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter mb-1">{selectedPatient?.full_name}</h3>
                      <div className="flex items-center gap-4">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Patient Supervision • Record ID: PAT-{selectedPatient?.id}</p>
                        <span className={`px-4 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest ${
                          selectedPatient?.condition === 'critical' ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'
                        }`}>{selectedPatient?.condition || 'STABLE'}</span>
                      </div>
                    </div>
                  </div>
                  <Link to={`/nurse/patient/${selectedPatientId}`} className="hidden md:block px-8 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl text-[11px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl">
                         Full Case History
                  </Link>
                </div>
                <Link to={`/nurse/patient/${selectedPatientId}`} className="block md:hidden w-full py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center shadow-lg">
                       Full Case History
                </Link>

                {/* Tab Content */}
                {activeTab === 'log_symptoms' && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white dark:bg-slate-900 p-6 lg:p-10 rounded-[2.5rem] lg:rounded-[3.5rem] border border-slate-200 dark:border-slate-800 shadow-sm space-y-8">
                      <h4 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-4">
                        <div className="p-3 bg-blue-500 rounded-2xl text-white"><ClipboardList className="h-6 w-6" /></div>
                              Clinical Observation Round
                      </h4>
                           
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">BP (Sys/Dia)</p>
                          <input className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-5 text-sm font-bold" placeholder="120/80" value={form.blood_pressure} onChange={e => setForm({...form, blood_pressure: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                          <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest ml-2">Pulse Rate (BPM)</p>
                          <input className="w-full bg-rose-50/50 dark:bg-rose-900/20 border-none rounded-2xl p-5 text-sm font-bold text-rose-600" placeholder="72" value={form.heart_rate} onChange={e => setForm({...form, heart_rate: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                          <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest ml-2">Body Temp (°C)</p>
                          <input className="w-full bg-amber-50/50 dark:bg-amber-900/20 border-none rounded-2xl p-5 text-sm font-bold text-amber-600" placeholder="37.0" value={form.temperature} onChange={e => setForm({...form, temperature: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                          <p className="text-[10px] font-black text-sky-500 uppercase tracking-widest ml-2">Oxygen (SpO2 %)</p>
                          <input className="w-full bg-sky-50/50 dark:bg-sky-900/20 border-none rounded-2xl p-5 text-sm font-bold text-sky-600" placeholder="98" value={form.oxygen_level} onChange={e => setForm({...form, oxygen_level: e.target.value})} />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Patient Presentation / Mood</p>
                        <div className="flex gap-2">
                          {['bad', 'poor', 'okay', 'good', 'great'].map(m => (
                            <button key={m} onClick={() => setForm({...form, mood: m as any})} className={`flex-1 py-3 rounded-2xl border-2 text-[10px] font-black uppercase transition-all ${
                              form.mood === m ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-400 border-slate-50 hover:border-slate-200'
                            }`}>{m}</button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Observation Notes</p>
                        <textarea className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-5 text-sm font-bold text-slate-900 dark:text-white placeholder-slate-400 min-h-[120px] focus:ring-2 focus:ring-blue-500 transition-all outline-none" placeholder="Record any visible symptoms, concerns or patient comments..." value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />
                      </div>

                      <button onClick={handleSubmitLog} className="w-full py-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-2xl hover:scale-[1.02] transition-all">
                              Commit Round Findings
                      </button>
                    </div>

                    <div className="space-y-8">
                      <div className="bg-white dark:bg-slate-900 p-8 rounded-[3.5rem] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5"><HistoryIcon className="h-32 w-32" /></div>
                        <h4 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Previous Observation History</h4>
                        <div className="space-y-4">
                          {nurseLogs.length === 0 ? (
                            <p className="text-xs font-bold text-slate-400 italic">No history available for this round.</p>
                          ) : nurseLogs.slice(0, 4).map(log => (
                            <div key={log.id} className="p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 flex items-center justify-between group hover:scale-[1.02] transition-all">
                              <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{format(new Date(log.created_at), 'MMMM d, h:mm a')}</p>
                                <p className="text-sm font-black text-slate-700 dark:text-slate-300 capitalize">{log.notes || `Routine Check - ${log.mood} Mood`}</p>
                              </div>
                              <div className="flex gap-4">
                                <div className="text-right"><p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">BP</p><p className="text-xs font-black text-slate-900 dark:text-white">{log.systolic_bp}/{log.diastolic_bp}</p></div>
                                <div className="text-right"><p className="text-[8px] font-black text-rose-500 uppercase tracking-widest">HR</p><p className="text-xs font-black text-rose-600">{log.heart_rate}</p></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="p-8 rounded-[3.5rem] bg-indigo-600 text-white shadow-2xl shadow-indigo-600/20 relative overflow-hidden group">
                        <AlertCircle className="h-40 w-40 absolute -right-10 -bottom-10 opacity-10 group-hover:rotate-12 transition-transform" />
                        <h4 className="text-xs font-black uppercase tracking-[0.2em] mb-4 opacity-60 text-indigo-100">Care Protocol Notice</h4>
                        <p className="text-lg font-bold leading-relaxed mb-6">Ensure all vitals are recorded within 15 minutes of the observation to maintain clinical accuracy in the shared health record.</p>
                        <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest">
                          <Plus className="h-4 w-4" /> Real-time Sync Enabled
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'doctor_orders' && (
                  <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] border-2 border-amber-100 dark:border-amber-900/30">
                      <h4 className="text-xl font-black text-amber-600 dark:text-amber-400 mb-8 flex items-center gap-4">
                        <div className="p-3 bg-amber-500 rounded-2xl text-white"><Activity className="h-6 w-6" /></div>
                              Active Medical Orders
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {doctorOrders.length === 0 ? (
                          <p className="col-span-full py-10 text-center font-bold text-slate-400 italic">No pending medical orders for this patient.</p>
                        ) : doctorOrders.map(order => (
                          <div key={order.id} className="p-8 bg-amber-50/50 dark:bg-amber-900/10 rounded-[2.5rem] border border-amber-100 dark:border-amber-900/30 group">
                            <div className="flex items-center justify-between mb-4">
                              <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 rounded-lg text-[9px] font-black uppercase tracking-widest">{order.order_type || 'Active'}</span>
                              <span className="text-[10px] font-bold text-slate-400">{format(new Date(order.created_at), 'MMM d, h:mm a')}</span>
                            </div>
                            <h5 className="text-lg font-black text-slate-900 dark:text-white mb-2 leading-tight uppercase tracking-tight">{order.description}</h5>
                            <p className="text-sm font-bold text-slate-600 dark:text-slate-400 leading-relaxed italic mb-6">"{order.details}"</p>
                            <div className="flex items-center gap-3 pt-6 border-t border-amber-100 dark:border-amber-900/30">
                              <div className="h-8 w-8 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center text-[10px] font-black">DR</div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ordered by HQ Medical Staff</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'nurse_report' && (
                  <div className="max-w-4xl mx-auto space-y-10">
                    <div className="bg-white dark:bg-slate-900 p-6 lg:p-12 rounded-[2.5rem] lg:rounded-[4rem] border border-slate-200 dark:border-slate-800 shadow-2xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-12 opacity-5"><Send className="h-32 w-32" /></div>
                      <h4 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter mb-4">Clinical Care Report (Shift Summary)</h4>
                      <p className="text-sm text-slate-500 font-bold mb-10 max-w-lg">Submit a formal summary of the care provided and the patient's status for the medical team and the next shift nurse.</p>
                            
                      <div className="space-y-8">
                        <div className="space-y-4">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Daily Care Tasks Completed</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {reportTasks.map((t, idx) => (
                              <button key={idx} onClick={() => {
                                const newTasks = [...reportTasks];
                                newTasks[idx].completed = !newTasks[idx].completed;
                                setReportTasks(newTasks);
                              }} className={`p-6 rounded-3xl border-2 flex items-center gap-4 text-left transition-all ${
                                t.completed ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500' : 'bg-white dark:bg-slate-800 border-slate-50 opacity-60 hover:opacity-100 hover:border-slate-200'
                              }`}>
                                <div className={`h-8 w-8 rounded-xl flex items-center justify-center transition-all ${t.completed ? 'bg-emerald-500 text-white shadow-lg' : 'bg-slate-100 text-slate-400'}`}>
                                  <CheckCircle2 className="h-5 w-5" />
                                </div>
                                <span className={`text-xs font-black uppercase tracking-tight ${t.completed ? 'text-emerald-900 dark:text-emerald-300' : 'text-slate-500'}`}>{t.title}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-4">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Supervision Summary</p>
                          <textarea className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-[2.5rem] p-8 text-sm font-bold text-slate-900 dark:text-white placeholder-slate-400 min-h-[200px] focus:ring-2 focus:ring-blue-500 transition-all outline-none" placeholder="Detailed overview of patient activity, behavior and care provided during your shift..." value={reportSummary} onChange={e => setReportSummary(e.target.value)} />
                        </div>

                        <button onClick={handleSubmitReport} className="w-full py-8 bg-blue-600 text-white rounded-[2.5rem] font-black text-md uppercase tracking-[0.2em] shadow-2xl hover:scale-[1.02] transition-all">
                                  Submit Official Shift Report
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'care_notes' && (
                  <div className="space-y-8">
                    <div className="bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] border-2 border-purple-100 dark:border-purple-900/30">
                      <h4 className="text-xl font-black text-purple-600 dark:text-purple-400 mb-8 flex items-center gap-4">
                        <div className="p-3 bg-purple-500 rounded-2xl text-white"><MessageSquare className="h-6 w-6" /></div>
                               Clinical Directives & HQ Comms
                      </h4>
                      <div className="space-y-6">
                        {clinicalNotes.length === 0 ? (
                          <div className="py-20 text-center font-bold text-slate-300 italic">No clinical notes recorded by the medical team.</div>
                        ) : clinicalNotes.map(note => (
                          <div key={note.id} className="p-8 bg-purple-50/50 dark:bg-purple-900/10 rounded-[2.5rem] border border-purple-100 dark:border-purple-900/30">
                            <div className="flex items-center justify-between mb-6">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-black">DR</div>
                                <div>
                                  <p className="text-xs font-black text-purple-900 dark:text-purple-300 uppercase tracking-tight">Clinical Staff Review</p>
                                  <p className="text-[9px] font-bold text-slate-400 uppercase">{format(new Date(note.created_at), 'MMMM d, h:mm a')}</p>
                                </div>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                              <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 underline decoration-purple-500 decoration-2">Assessment</p>
                                <p className="text-sm font-bold text-slate-700 dark:text-slate-300 leading-relaxed">{note.assessment}</p>
                              </div>
                              <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 underline decoration-emerald-500 decoration-2">Plan</p>
                                <p className="text-sm font-bold text-slate-700 dark:text-slate-300 leading-relaxed">{note.plan}</p>
                              </div>
                            </div>
                            {note.request_to_nurse && (
                              <div className="p-6 bg-white dark:bg-slate-800 rounded-3xl border border-purple-100 dark:border-purple-800 flex items-center gap-4">
                                <div className="p-2 bg-purple-100 text-purple-600 rounded-lg"><Clock className="h-4 w-4" /></div>
                                <div className="flex-1">
                                  <p className="text-[9px] font-black text-purple-600 uppercase tracking-widest">Nursing Directive</p>
                                  <p className="text-xs font-bold text-purple-900 dark:text-purple-200">"{note.request_to_nurse}"</p>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                {activeTab === 'lab_results' && (
                  <div className="space-y-10">
                    <div className="bg-white dark:bg-slate-900 p-12 rounded-[4rem] border border-slate-200 dark:border-slate-800 shadow-2xl">
                      <h4 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter mb-10 flex items-center gap-6">
                        <div className="p-4 bg-purple-600 rounded-3xl text-white shadow-xl shadow-purple-500/20"><Activity className="h-8 w-8" /></div>
                                    Laboratory Processing Hub
                      </h4>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        <div className="space-y-6">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-4">Pending Diagnostic Orders</p>
                          <div className="space-y-4">
                            {labTests.filter(t => t.status === 'ordered' || t.status === 'processing').length === 0 ? (
                              <div className="p-16 text-center bg-slate-50 dark:bg-slate-800/50 rounded-[3rem] border border-dashed border-slate-200 dark:border-slate-700">
                                <p className="text-sm font-bold text-slate-300 italic">No new lab orders detected.</p>
                              </div>
                            ) : labTests.filter(t => t.status === 'ordered' || t.status === 'processing').map(test => (
                              <button 
                                key={test.id}
                                onClick={() => setLabUpload({...labUpload, id: test.id})}
                                className={`w-full p-8 rounded-[3rem] border-2 transition-all text-left flex items-center justify-between ${
                                  labUpload.id === test.id 
                                    ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-500 shadow-xl' 
                                    : 'bg-white dark:bg-slate-800 border-transparent hover:border-slate-200 dark:hover:border-slate-700'
                                }`}
                              >
                                <div>
                                  <p className="text-[9px] font-black text-purple-600 uppercase tracking-widest mb-1">{test.test_type} TEST</p>
                                  <p className="text-lg font-black text-slate-900 dark:text-white">{test.test_name}</p>
                                  <p className="text-[10px] font-bold text-slate-400 mt-2">Ordered {format(new Date(test.created_at), 'h:mm a')}</p>
                                </div>
                                <Plus className={`h-6 w-6 ${labUpload.id === test.id ? 'text-purple-600' : 'text-slate-300'}`} />
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-800/50 p-10 rounded-[4rem] border border-slate-200 dark:border-slate-700">
                          {labUpload.id ? (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                              <h5 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Upload Test Results</h5>
                              <div className="space-y-6">
                                <div className="space-y-2">
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Result Summary / Text</p>
                                  <textarea 
                                    className="w-full bg-white dark:bg-slate-900 border-none rounded-3xl p-6 text-sm font-bold text-slate-900 dark:text-white placeholder-slate-400 min-h-[150px] shadow-sm focus:ring-2 focus:ring-purple-500 transition-all outline-none"
                                    placeholder="Enter clinical summary of the findings..."
                                    value={labUpload.summary}
                                    onChange={e => setLabUpload({...labUpload, summary: e.target.value})}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Attachment (Image/Document)</p>
                                  <input 
                                    type="file" 
                                    className="w-full bg-white dark:bg-slate-900 rounded-3xl p-6 text-[10px] font-black uppercase"
                                    onChange={e => setLabUpload({...labUpload, file: e.target.files ? e.target.files[0] : null})}
                                  />
                                </div>
                                <button 
                                  onClick={handleUploadLabResult}
                                  disabled={uploadingLab}
                                  className="w-full py-6 bg-purple-600 text-white rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-2xl hover:scale-105 transition-all disabled:opacity-50"
                                >
                                  {uploadingLab ? 'Synchronizing File...' : 'Dispatch Verified Results'}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center p-10 opacity-50">
                              <div className="p-6 bg-white dark:bg-slate-900 rounded-[2.5rem] mb-6"><ClipboardList className="h-10 w-10 text-slate-300" /></div>
                              <p className="text-xs font-black text-slate-400 uppercase tracking-widest leading-relaxed">Select a pending order from the list to begin result verification and clinical documentation.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Verified History */}
                    <div className="bg-white dark:bg-slate-900 p-10 rounded-[40px] border border-slate-200 dark:border-slate-800 shadow-sm mt-10">
                      <h3 className="text-xl font-black text-slate-900 dark:text-white mb-8 tracking-tight">Recently Verified Results</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {labTests.filter(t => t.status === 'ready').map(test => (
                          <div key={test.id} className="p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700">
                            <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-1">VERIFIED RESULT</p>
                            <p className="text-md font-black text-slate-900 dark:text-white mb-3">{test.test_name}</p>
                            {test.file_url && (
                              <div className="h-20 w-full mb-3 rounded-xl overflow-hidden cursor-pointer hover:opacity-80 transition-opacity" onClick={() => window.open(test.file_url, '_blank')}>
                                <img src={test.file_url} className="w-full h-full object-cover" alt="Verified Link" />
                              </div>
                            )}
                            <p className="text-[10px] font-bold text-slate-400 mt-2 text-right">Completed {format(new Date(test.collected_at || test.created_at), 'MMM d, h:mm a')}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
