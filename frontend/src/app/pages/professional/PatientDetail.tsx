import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router';
import { ArrowLeft, Send, Activity, Clock, CheckCircle2, Loader2, ClipboardList, Plus, Pill, MessageSquare, Heart, Thermometer, Droplet } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

export function PatientDetail() {
  const { id } = useParams<{ id: string }>();
  const [patient, setPatient] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isLabModalOpen, setIsLabModalOpen] = useState(false);
  const [labForm, setLabForm] = useState({ test_name: '', test_type: 'blood' });
  const [labResults, setLabResults] = useState<any[]>([]);

  // Form States
  const [vitalsForm, setVitalsForm] = useState({
    systolic: '', diastolic: '', pulse: '', temp: '', spo2: '', notes: '', mood: 'good', symptoms: [] as string[]
  });
  const [reportForm, setReportForm] = useState({ title: 'Daily Care Review', summary: '', recommendations: '' });
  const [labUpload, setLabUpload] = useState<{ id: string | null; summary: string; file: File | null }>({
    id: null,
    summary: '',
    file: null
  });
  const [uploadingLab, setUploadingLab] = useState(false);

  const token = sessionStorage.getItem('token');

  const fetchData = useCallback(async () => {
    if (!id || !token) return;
    try {
      setLoading(true);
      // Patient details + health logs
      const res = await fetch(`http://localhost:5000/api/nurse/patients/${id}/details`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPatient(data.patient);
        setLogs(data.logs);
      }

      // Doctor orders
      const oRes = await fetch(`http://localhost:5000/api/nurse/orders/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (oRes.ok) setOrders(await oRes.json());

      // Clinical notes
      const nRes = await fetch(`http://localhost:5000/api/nurse/notes/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (nRes.ok) setNotes(await nRes.json());

      // My reports for this patient
      const rRes = await fetch(`http://localhost:5000/api/nurse/reports/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (rRes.ok) setReports(await rRes.json());

      // Lab Results
      const lRes = await fetch(`http://localhost:5000/api/lab/patient/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (lRes.ok) setLabResults(await lRes.json());

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
        fetchData();
      }
    } catch (err) {
      toast.error('System error: Report submission failed');
    }
  };

  const handleOrderLab = async () => {
    if (!labForm.test_name) return;
    try {
      const res = await fetch('http://localhost:5000/api/lab/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          patient_id: id,
          hospital_id: patient.hospital_id,
          test_name: labForm.test_name,
          test_type: labForm.test_type
        })
      });
      if (res.ok) {
        toast.success('Lab test ordered successfully');
        setIsLabModalOpen(false);
        setLabForm({ test_name: '', test_type: 'blood' });
        fetchData();
      }
    } catch (err) {
      toast.error('Failed to order lab test');
    }
  };

  const handleUploadLabResult = async () => {
    if (!labUpload.id || !labUpload.summary) {
      toast.error('Summary and verified data is required');
      return;
    }
    setUploadingLab(true);
    const fd = new FormData();
    fd.append('result_summary', labUpload.summary);
    if (labUpload.file) fd.append('profile_picture', labUpload.file);

    const token = sessionStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch(`http://localhost:5000/api/lab/upload/${labUpload.id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: fd
      });
      if (res.ok) {
        toast.success('Patient lab diagnostics updated');
        setLabUpload({ id: null, summary: '', file: null });
        fetchData();
      }
    } catch (err) {
      toast.error('Clinical upload failed');
    } finally {
      setUploadingLab(false);
    }
  };

  if (loading) return <div className="flex flex-col items-center justify-center min-h-screen gap-4">
    <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
    <p className="font-black text-slate-500 uppercase tracking-widest text-[10px]">Accessing patient file...</p>
  </div>;

  if (!patient) return <div className="p-20 text-center font-bold text-slate-400 uppercase tracking-widest">Unauthorized access - Restricted patient record.</div>;

  const latestVitals = logs[0];
  const activeOrders = orders.filter(o => o.status !== 'completed');
  const nurseDirectives = notes.filter(n => n.request_to_nurse);
  const userRole = token ? JSON.parse(atob(token.split('.')[1])).role : null;

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
          <Link to="/nurse/patients" className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <div className="h-24 w-24 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-300 font-black text-4xl shadow-inner uppercase tracking-tighter">
            {patient.full_name?.charAt(0)}
          </div>
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-2">{patient.full_name}</h1>
            <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em]">Patient Supervision Panel • ID: PAT-{patient.id.toString().padStart(4, '0')}</p>
          </div>
        </div>
      </div>

      {/* Quick Vitals Strip */}
      {latestVitals && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Blood Pressure', value: `${latestVitals.systolic_bp}/${latestVitals.diastolic_bp}`, unit: 'mmHg', icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
            { label: 'Heart Rate', value: latestVitals.heart_rate, unit: 'bpm', icon: Heart, color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-900/20' },
            { label: 'Temperature', value: latestVitals.temperature, unit: '°C', icon: Thermometer, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
            { label: 'SpO2', value: latestVitals.oxygen_level, unit: '%', icon: Droplet, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          ].map((stat, i) => (
            <div key={i} className={`${stat.bg} p-5 rounded-3xl border border-slate-200 dark:border-slate-800 relative overflow-hidden group`}>
              <stat.icon className={`h-14 w-14 absolute -right-2 -bottom-2 opacity-5 ${stat.color}`} />
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <div className="flex items-baseline gap-1">
                <span className={`text-2xl font-black ${stat.color}`}>{stat.value}</span>
                <span className="text-[10px] font-bold text-slate-400">{stat.unit}</span>
              </div>
              <p className="text-[9px] text-slate-400 mt-1">{format(new Date(latestVitals.created_at), 'MMM d, h:mm a')}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content: History */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-xl text-white"><ClipboardList className="h-5 w-5" /></div>
                      Nursing Supervision History
              </h3>
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{logs.length} Total Logs</span>
            </div>
                
            <div className="space-y-6">
              {logs.length === 0 ? (
                <div className="p-20 text-center font-bold text-slate-300 dark:text-slate-600 italic">No health logs recorded yet.</div>
              ) : logs.map(log => (
                <div key={log.id} className="p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row gap-6 relative group hover:scale-[1.01] transition-all">
                  <div className="shrink-0 text-center">
                    <p className="text-2xl font-black text-slate-900 dark:text-white leading-none">{format(new Date(log.created_at), 'HH:mm')}</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{format(new Date(log.created_at), 'MMM d')}</p>
                  </div>
                  <div className="flex-1">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">BP</p><p className="text-sm font-black text-slate-700 dark:text-slate-300">{log.systolic_bp}/{log.diastolic_bp}</p></div>
                      <div><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Pulse</p><p className="text-sm font-black text-rose-600">{log.heart_rate} bpm</p></div>
                      <div><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Temp</p><p className="text-sm font-black text-amber-600">{log.temperature}°C</p></div>
                      <div><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">O2</p><p className="text-sm font-black text-emerald-600">{log.oxygen_level}%</p></div>
                    </div>
                    {log.notes && (
                      <div className="p-4 bg-white/50 dark:bg-slate-900/50 rounded-2xl border-l-4 border-blue-500">
                        <p className="text-xs font-bold text-slate-600 dark:text-slate-400 italic">"{log.notes}"</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Previous Shift Reports */}
          {reports.length > 0 && (
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3 mb-6">
                <div className="p-2 bg-emerald-600 rounded-xl text-white"><Send className="h-4 w-4" /></div>
                  My Shift Reports
              </h3>
              <div className="space-y-4">
                {reports.map(report => (
                  <div key={report.id} className="p-5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-black text-slate-900 dark:text-white text-sm">{report.title}</h4>
                      <span className="text-[10px] font-bold text-slate-400">{format(new Date(report.created_at), 'MMM d, h:mm a')}</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">{report.summary}</p>
                    {report.recommendations && (
                      <p className="text-xs text-blue-600 dark:text-blue-400 italic mt-2">Rec: "{report.recommendations}"</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lab Results Display */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                <div className="p-2 bg-purple-600 rounded-xl text-white"><Activity className="h-5 w-5" /></div>
                      Patient Lab Test Results
              </h3>
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{labResults.length} Total Tests</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {labResults.length === 0 ? (
                <div className="col-span-full p-10 text-center font-bold text-slate-300 italic text-xs uppercase tracking-widest">No verified lab records found.</div>
              ) : labResults.map(res => (
                <div key={res.id} className="p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{res.test_type} TEST</p>
                      <h4 className="text-lg font-black text-slate-900 dark:text-white">{res.test_name}</h4>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`px-2 py-0.5 rounded-lg text-[7px] font-black uppercase ${
                        res.status === 'ready' ? 'bg-emerald-100 text-emerald-600' : 
                          res.status === 'ordered' ? 'bg-amber-100 text-amber-600' :
                            'bg-blue-100 text-blue-600'
                      }`}>{res.status}</span>
                      {userRole === 'nurse' && res.status !== 'ready' && (
                        <button 
                          onClick={() => setLabUpload(prev => ({ ...prev, id: res.id }))}
                          className="text-[8px] font-black text-blue-600 underline uppercase mt-1 cursor-pointer"
                        >
                                     Upload Results
                        </button>
                      )}
                    </div>
                  </div>
                         
                  {labUpload.id === res.id ? (
                    <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border-2 border-blue-500 space-y-4 animate-in slide-in-from-top-2 duration-300">
                      <div className="space-y-1">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Findings Summary</p>
                        <textarea 
                          className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 text-[10px] font-bold min-h-[80px]"
                          placeholder="Enter verified test results summary..."
                          value={labUpload.summary}
                          onChange={e => setLabUpload({...labUpload, summary: e.target.value})}
                        />
                      </div>
                      <div className="space-y-1">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Result Image / File</p>
                        <input 
                          type="file" 
                          className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl p-2 text-[8px] font-black"
                          onChange={e => setLabUpload({...labUpload, file: e.target.files ? e.target.files[0] : null})}
                        />
                      </div>
                      <div className="flex gap-2">
                        <button onClick={handleUploadLabResult} disabled={uploadingLab} className="flex-1 py-3 bg-blue-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-700">
                          {uploadingLab ? 'Syncing...' : 'Submit'}
                        </button>
                        <button onClick={() => setLabUpload({ id: null, summary: '', file: null })} className="px-3 py-3 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-xl text-[9px] font-black uppercase">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {res.result_summary && (
                        <div className="p-3 bg-white/50 dark:bg-slate-900/50 rounded-xl border-l-4 border-purple-500">
                          <p className="text-xs font-bold text-slate-600 dark:text-slate-400 italic">"{res.result_summary}"</p>
                        </div>
                      )}

                      {res.file_url && (
                        <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 group relative">
                          <img 
                            src={res.file_url} 
                            alt="Lab Result" 
                            className="w-full h-auto object-cover max-h-48 cursor-pointer hover:scale-105 transition-transform" 
                            onClick={() => window.open(res.file_url, '_blank')}
                          />
                        </div>
                      )}
                    </>
                  )}

                  <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center text-[9px] font-black uppercase tracking-widest">
                    <span className="text-slate-400">{format(new Date(res.created_at), 'MMM d, yyyy')}</span>
                    {res.nurse_name ? (
                      <span className="text-purple-600">Verified by {res.nurse_name}</span>
                    ) : (
                      <span className="text-amber-500 italic">Awaiting Processing</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Actions Sidebar */}
        <div className="space-y-6">
          <div className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 p-8 rounded-[40px] shadow-2xl space-y-4">
            <p className="text-[10px] font-black opacity-50 uppercase tracking-[0.2em] mb-4">Patient Management Actions</p>
            <button 
              onClick={() => setIsLogModalOpen(true)}
              className="w-full py-4 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-3xl text-sm font-black flex items-center justify-center gap-3 hover:scale-105 transition-all shadow-xl shadow-white/10"
            >
              <Activity className="h-5 w-5" /> Record New Vitals
            </button>
            <button 
              onClick={() => setIsReportModalOpen(true)}
              className="w-full py-4 bg-blue-600 text-white rounded-3xl text-sm font-black flex items-center justify-center gap-3 hover:scale-105 transition-all shadow-xl shadow-blue-500/20"
            >
              <Send className="h-5 w-5" /> Submit Shift Report
            </button>
            {userRole === 'doctor' && (
              <button 
                onClick={() => setIsLabModalOpen(true)}
                className="w-full py-4 bg-purple-600 text-white rounded-3xl text-sm font-black flex items-center justify-center gap-3 hover:scale-105 transition-all shadow-xl shadow-purple-500/20"
              >
                <Plus className="h-5 w-5" /> Order Lab Test
              </button>
            )}
          </div>

          {/* Doctor's Orders (real data) */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-[40px] border-2 border-blue-100 dark:border-blue-900/30 shadow-sm space-y-4">
            <h4 className="text-xs font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
              <Pill className="h-4 w-4" /> Active Doctor Orders
            </h4>
            {activeOrders.length === 0 ? (
              <p className="text-xs font-bold text-slate-400 italic">No active orders for this patient.</p>
            ) : activeOrders.slice(0, 5).map(order => (
              <div key={order.id} className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                <div className="flex items-center justify-between mb-1">
                  <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase ${
                    order.order_type === 'lab_test' ? 'bg-purple-100 text-purple-700' :
                      order.order_type === 'medication' ? 'bg-green-100 text-green-700' :
                        'bg-blue-100 text-blue-700'
                  }`}>{order.order_type?.replace('_', ' ')}</span>
                  <span className="text-[9px] text-slate-400">{format(new Date(order.created_at), 'MMM d')}</span>
                </div>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{order.description}</p>
                {order.details && <p className="text-[10px] text-slate-500 mt-1">{order.details}</p>}
                {order.doctor_name && <p className="text-[9px] text-blue-500 mt-1">— Dr. {order.doctor_name}</p>}
              </div>
            ))}
          </div>

          {/* Doctor Directives / Nurse Requests (real data) */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-[40px] border-2 border-purple-100 dark:border-purple-900/30 shadow-sm space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5"><MessageSquare className="h-20 w-20 text-purple-900" /></div>
            <h4 className="text-xs font-black text-purple-600 dark:text-purple-400 uppercase tracking-widest flex items-center gap-2">
              <Clock className="h-4 w-4" /> Doctor's Directives
            </h4>
            {nurseDirectives.length === 0 ? (
              <div>
                <p className="text-xs font-bold text-slate-500 italic mb-4">"No specific directives assigned for this patient."</p>
                <div className="p-4 bg-purple-50 dark:bg-purple-900/10 rounded-2xl text-[10px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-widest text-center border border-purple-100 dark:border-purple-800">
                        Awaiting Directives
                </div>
              </div>
            ) : nurseDirectives.slice(0, 3).map(note => (
              <div key={note.id} className="p-4 bg-purple-50 dark:bg-purple-900/10 rounded-2xl border border-purple-100 dark:border-purple-800">
                <p className="text-[9px] font-black text-purple-600 uppercase tracking-widest mb-1">
                  {note.doctor_name ? `Dr. ${note.doctor_name}` : 'Doctor'} • {format(new Date(note.created_at), 'MMM d')}
                </p>
                <p className="text-xs font-bold text-purple-900 dark:text-purple-300">"{note.request_to_nurse}"</p>
                {note.assessment && (
                  <p className="text-[10px] text-slate-500 mt-2">Assessment: {note.assessment}</p>
                )}
              </div>
            ))}

            {/* All Clinical Notes (collapsed) */}
            {notes.length > 0 && (
              <div className="pt-2 border-t border-purple-100 dark:border-purple-800">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">ALL CLINICAL NOTES ({notes.length})</p>
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {notes.map(note => (
                    <div key={note.id} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                      <p className="text-[9px] text-slate-400">{format(new Date(note.created_at), 'MMM d, h:mm a')} {note.doctor_name ? `• Dr. ${note.doctor_name}` : ''}</p>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-1">{note.assessment}</p>
                      {note.plan && <p className="text-[10px] text-slate-500 mt-1">Plan: {note.plan}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Vitals Recording Modal */}
      <AnimatePresence>
        {isLogModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-xl">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 w-full max-w-2xl border border-white/20 shadow-2xl relative">
              <button onClick={() => setIsLogModalOpen(false)} className="absolute top-10 right-10 p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700">
                <Plus className="h-6 w-6 rotate-45 text-slate-500" />
              </button>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Vitals Record Entry</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-10">Principal health indicators for HQ synchronization</p>
                
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">BP (Sys/Dia)</p>
                  <div className="flex items-center gap-2">
                    <input className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 text-sm font-bold placeholder-slate-300 dark:placeholder-slate-600 dark:text-white" placeholder="120" value={vitalsForm.systolic} onChange={e => setVitalsForm({...vitalsForm, systolic: e.target.value})} />
                    <span className="font-black text-slate-300">/</span>
                    <input className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 text-sm font-bold placeholder-slate-300 dark:placeholder-slate-600 dark:text-white" placeholder="80" value={vitalsForm.diastolic} onChange={e => setVitalsForm({...vitalsForm, diastolic: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest ml-2">Pulse Rate</p>
                  <input className="w-full bg-rose-50 dark:bg-rose-900/20 border-none rounded-2xl p-4 text-sm font-bold text-rose-600 placeholder-rose-200 dark:placeholder-rose-800" placeholder="72" value={vitalsForm.pulse} onChange={e => setVitalsForm({...vitalsForm, pulse: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest ml-2">Temperature</p>
                  <input className="w-full bg-amber-50 dark:bg-amber-900/20 border-none rounded-2xl p-4 text-sm font-bold text-amber-600 placeholder-amber-200 dark:placeholder-amber-800" placeholder="37.0" value={vitalsForm.temp} onChange={e => setVitalsForm({...vitalsForm, temp: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest ml-2">Oxygen Level %</p>
                  <input className="w-full bg-blue-50 dark:bg-blue-900/20 border-none rounded-2xl p-4 text-sm font-bold text-blue-600 placeholder-blue-200 dark:placeholder-blue-800" placeholder="98" value={vitalsForm.spo2} onChange={e => setVitalsForm({...vitalsForm, spo2: e.target.value})} />
                </div>
              </div>

              <div className="space-y-2 mb-8">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Nursing Assessment & Notes</p>
                <textarea className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 text-sm font-bold min-h-[120px] dark:text-white" placeholder="Record any visible symptoms or concerns observed during round..." value={vitalsForm.notes} onChange={e => setVitalsForm({...vitalsForm, notes: e.target.value})} />
              </div>

              <div className="flex gap-4">
                <button onClick={handleSubmitVitals} className="flex-1 py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[1.5rem] font-black text-sm uppercase tracking-widest shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" /> Commit to Medical Record
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {isReportModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-xl">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 w-full max-w-lg border border-white/20 shadow-2xl relative">
              <button onClick={() => setIsReportModalOpen(false)} className="absolute top-10 right-10 p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700">
                <Plus className="h-6 w-6 rotate-45 text-slate-500" />
              </button>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Shift Report Filing</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-10">Formal nursing care summary submission</p>
                 
              <div className="space-y-6">
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Summary of Care</p>
                  <textarea className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 text-sm font-bold min-h-[150px] dark:text-white" placeholder="Detailed overview of patient activity and care provided during your shift..." value={reportForm.summary} onChange={e => setReportForm({...reportForm, summary: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Key Recommendations</p>
                  <input className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 text-sm font-bold dark:text-white" placeholder="Actions for next shift or doctor..." value={reportForm.recommendations} onChange={e => setReportForm({...reportForm, recommendations: e.target.value})} />
                </div>
                <button onClick={handleSubmitReport} className="w-full py-5 bg-blue-600 text-white rounded-[1.5rem] font-black text-sm uppercase tracking-widest shadow-2xl hover:scale-105 transition-all">
                       Submit Final Report
                </button>
              </div>
            </motion.div>
          </div>
        )}
        {isLabModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-xl">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 w-full max-w-lg border border-white/20 shadow-2xl relative">
              <button onClick={() => setIsLabModalOpen(false)} className="absolute top-10 right-10 p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700">
                <Plus className="h-6 w-6 rotate-45 text-slate-500" />
              </button>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Order Lab Diagnostic</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-10">Select required diagnostic tests for patient processing</p>
                  
              <div className="space-y-6">
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Diagnostic Test Name</p>
                  <input className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 text-sm font-bold dark:text-white ring-0 outline-none" placeholder="e.g. Lipid Profile" value={labForm.test_name} onChange={e => setLabForm({...labForm, test_name: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Test Department / Type</p>
                  <select className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 text-sm font-bold dark:text-white" value={labForm.test_type} onChange={e => setLabForm({...labForm, test_type: e.target.value})}>
                    <option value="blood">Hematology (Blood)</option>
                    <option value="urine">Urinalysis</option>
                    <option value="imaging">Medical Imaging (X-Ray/CT)</option>
                    <option value="biopsy">Biopsy / Pathology</option>
                    <option value="cardio">Cardiovascular (ECG/Echo)</option>
                    <option value="other">Other Diagnostic</option>
                  </select>
                </div>
                <button onClick={handleOrderLab} className="w-full py-5 bg-purple-600 text-white rounded-[1.5rem] font-black text-sm uppercase tracking-widest shadow-2xl hover:scale-105 transition-all">
                        Execute Lab Order
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
