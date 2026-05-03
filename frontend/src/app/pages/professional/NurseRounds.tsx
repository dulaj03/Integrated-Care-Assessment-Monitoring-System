import { Activity, Clock, CheckCircle, Plus, Check, ChevronRight, User, Search, X, Loader2, ClipboardList, Info } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

interface TaskStep {
    id: number;
    step_name: string;
    status: 'pending' | 'completed';
    completed_at?: string;
    notes?: string;
}

interface NursingTask {
    id: number;
    title: string;
    task_type: string;
    patient_id: number;
    patient_name: string;
    doctor_name?: string;
    status: 'pending' | 'in_progress' | 'completed';
    current_step: number;
    created_at: string;
    steps: TaskStep[];
}

interface Patient {
    id: number;
    full_name: string;
    condition: string;
}

const WORKFLOW_PRESETS = {
  'Radiology Scan': ['Order Received', 'Pre-procedural Prep', 'Transport to Radiology', 'Scan in Progress', 'Return to Ward', 'Results Uploaded'],
  'Medication Round': ['Verification', 'Allergy Check', 'Administration', 'Monitoring'],
  'Wound Care': ['Tray Setup', 'Dressing Removal', 'Clinical Assessment', 'New Dressing Applied'],
  'Admission Flow': ['Vitals Assessment', 'History Taking', 'ID Band Verification', 'Orientation'],
  'Discharge Flow': ['Doctor Clearance', 'Meds Prepared', 'Final Vitals', 'Education & Sign-off']
};

export function NurseRounds() {
  const [tasks, setTasks] = useState<NursingTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');
    
  // Add Task Form State
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<number | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<number | null>(null);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskType, setTaskType] = useState('Radiology Scan');
  const [customSteps, setCustomSteps] = useState<string[]>(WORKFLOW_PRESETS['Radiology Scan']);
  const [searchPatient, setSearchPatient] = useState('');

  const [userProfile, setUserProfile] = useState<any>(null);
  const [pendingTests, setPendingTests] = useState<any[]>([]);
  const [selectedTestId, setSelectedTestId] = useState<number | null>(null);

  const token = sessionStorage.getItem('token');
  const user = JSON.parse(sessionStorage.getItem('user') || '{}');
  const hospitalId = userProfile?.hospital_id || userProfile?.hospital_ids?.[0] || user.hospital_id || user.hospital_ids?.[0];

  useEffect(() => {
    console.log('🩺 Dashboard Professional Context:', { 
      resolvedHospitalId: hospitalId, 
    });
  }, [hospitalId, user, userProfile]);

  const fetchTasks = useCallback(async () => {
    if (!token) return;
    try {
      // Fetch profile to ensure we have hospital context
      const meRes = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (meRes.ok) {
        const me = await meRes.json();
        setUserProfile(me.user);
      }

      // Fetch pending orders to link them
      const labRes = await fetch('/api/lab/pending', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (labRes.ok) {
        const data = await labRes.json();
        console.log('📦 PENDING LAB ORDERS LOADED:', data);
        setPendingTests(data);
      }

      const res = await fetch('/api/rounds/my-rounds', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    } catch (error) {
      console.error('Fetch tasks failed:', error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchPatients = useCallback(async () => {
    try {
      const res = await fetch('/api/nurse/patients', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        console.log('📋 Loaded Patients:', data);
        setPatients(data);
      }

      const docRes = await fetch('/api/doctors', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (docRes.ok) {
        const data = await docRes.json();
        setDoctors(data);
      }
    } catch (error) {
      console.error('Fetch data failed:', error);
    }
  }, [token]);

  useEffect(() => {
    fetchTasks();
    fetchPatients();
  }, [fetchTasks, fetchPatients]);

  const handleCreateTask = async () => {
    if (!selectedPatient || !taskTitle) return;
        
    const targetPatient = patients.find(p => p.id === selectedPatient);
    if (!targetPatient) {
      toast.error('Selected patient not found');
      return;
    }

    const targetHospitalId = (targetPatient as any).hospital_id || hospitalId;

    if (!targetHospitalId) {
      toast.error('Clinical facility ID not found. Please contact administration.');
      console.error('❌ Hospital ID missing for round creation', { 
        patientHospitalId: (targetPatient as any).hospital_id, 
        nurseHospitalId: hospitalId 
      });
      return;
    }

    console.log('🚀 Initiating Round Workflow...', {
      title: taskTitle,
      patientId: selectedPatient,
      hospitalId: targetHospitalId
    });

    try {
      const res = await fetch('/api/rounds/create', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: taskTitle,
          task_type: taskType,
          patient_id: selectedPatient,
          hospital_id: targetHospitalId,
          doctor_id: selectedDoctor,
          steps: customSteps,
          lab_test_id: selectedTestId
        })
      });
      if (res.ok) {
        toast.success('Round Workflow Initialized');
        setShowAddModal(false);
        setTaskTitle('');
        setSelectedPatient(null);
        setSelectedTestId(null);
        fetchTasks();
      }
    } catch (error) {
      toast.error('Failed to create task');
    }
  };

  const [showFinalizeModal, setShowFinalizeModal] = useState<number | null>(null);
  const [resultSummary, setResultSummary] = useState('');
  const [resultFile, setResultFile] = useState<string | null>(null);

  const handleStepComplete = async (stepId: number, taskId: number) => {
    try {
      console.log('📑 Documenting Milestone...', stepId);
      const res = await fetch(`/api/rounds/step/complete/${stepId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ notes: 'Step completed by nurse' })
      });

      if (res.ok) {
        const data = await res.json();
        toast.success('Clinical milestone documented');
                
        if (data.is_last_step) {
          setShowFinalizeModal(taskId); // Trigger result collection for the TASK
        }
                
        await fetchTasks();
      } else {
        const err = await res.json();
        toast.error(err.error || 'Update failed');
      }
    } catch (error) {
      console.error('❌ Milestone update failed:', error);
      toast.error('Network error during documentation');
    }
  };

  const handleFinalize = async (taskId: number) => {
    if (!resultSummary) return toast.error('Please enter a clinical summary');
    try {
      const res = await fetch(`/api/rounds/finalize/${taskId}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          result_summary: resultSummary,
          result_file: resultFile
        })
      });
      if (res.ok) {
        toast.success('Procedural results finalized');
        setShowFinalizeModal(null);
        setResultSummary('');
        setResultFile(null);
        fetchTasks();
      }
    } catch (e) {
      toast.error('Finalization failed');
    }
  };

  const filteredTasks = tasks.filter(t => filter === 'all' || t.status === filter);

  const stats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 gap-4">
      <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      <p className="font-bold text-slate-500">Synchronizing nursing workflows...</p>
    </div>
  );

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Nursing Rounds</h2>
          <p className="text-slate-500 dark:text-slate-400 font-bold mt-1">Manage and track your active clinical tasks</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-blue-500/20 transition-all hover:scale-105"
        >
          <Plus className="h-4 w-4" /> Add Round Task
        </button>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Tasks', value: stats.total, icon: ClipboardList, color: 'text-slate-900 dark:text-white', bg: 'bg-white dark:bg-slate-900' },
          { label: 'Pending', value: stats.pending, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
          { label: 'In Progress', value: stats.inProgress, icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Completed', value: stats.completed, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
        ].map(s => (
          <div key={s.label} className={`rounded-3xl p-5 ${s.bg} border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:border-blue-500/30 group`}>
            <div className="flex items-center justify-between mb-2">
              <s.icon className={`h-6 w-6 ${s.color} group-hover:scale-110 transition-transform`} />
              <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs & Filters */}
      <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800/50 rounded-2xl w-fit">
        {['all', 'pending', 'in_progress', 'completed'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f as any)}
            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              filter === f ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {f.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Tasks Feed */}
      <div className="grid grid-cols-1 gap-6">
        {filteredTasks.length > 0 ? (
          filteredTasks.map(task => (
            <div key={task.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm hover:shadow-xl transition-all border-l-[12px] border-l-blue-600">
              <div className="flex flex-col lg:flex-row gap-8">
                <div className="lg:w-1/3 border-r border-slate-100 dark:border-slate-800 pr-8">
                  <div className="flex items-center gap-2 mb-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      task.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 
                        task.status === 'in_progress' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {task.status.replace('_', ' ')}
                    </span>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Added {format(new Date(task.created_at), 'h:mm a')}</p>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white capitalize leading-tight mb-2">{task.title}</h3>
                  <div className="flex items-center gap-3 text-slate-500 font-bold mb-6">
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-widest opacity-50">Patient</p>
                      <p className="text-sm dark:text-slate-300">{task.patient_name}</p>
                    </div>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Task Progress</p>
                      <p className="text-xs font-black text-blue-600">
                        {Math.round((task.steps.filter(s => s.status === 'completed').length / task.steps.length) * 100)}%
                      </p>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-blue-600 h-full transition-all duration-500"
                        style={{ width: `${(task.steps.filter(s => s.status === 'completed').length / task.steps.length) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex-1 space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Workflow Milestones</p>
                    {task.steps.every(s => s.status === 'completed') && task.status !== 'completed' && (
                      <button 
                        onClick={() => {
                          setResultSummary('');
                          setShowFinalizeModal(task.id);
                        }}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20 animate-pulse hover:animate-none transition-all"
                      >
                                                Finalize Outcome & Upload Results
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {task.steps.map((step, idx) => (
                      <button
                        key={step.id}
                        disabled={step.status === 'completed'}
                        onClick={() => handleStepComplete(step.id, task.id)}
                        className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                          step.status === 'completed' 
                            ? 'bg-emerald-50 border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-900/20 text-emerald-700' 
                            : 'bg-slate-50 border-slate-100 dark:bg-slate-800/50 dark:border-slate-800 text-slate-600 hover:border-blue-500 hover:bg-blue-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black ${
                            step.status === 'completed' ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'
                          }`}>
                            {idx + 1}
                          </div>
                          <p className="text-sm font-bold">{step.step_name}</p>
                        </div>
                        {step.status === 'completed' ? <CheckCircle className="w-4 h-4" /> : <ChevronRight className="w-4 h-4 opacity-30" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-[4rem] border-4 border-dashed border-slate-100 dark:border-slate-800 p-20 text-center">
            <Activity className="mx-auto h-16 w-16 text-slate-200 mb-6" />
            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-widest">No Active Rounds</h3>
            <p className="text-slate-500 font-bold mt-2">All treatments are currently up to date.</p>
          </div>
        )}
      </div>

      {/* Add Task Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-2xl"
            >
              <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-black tracking-tight">Initiate New Round</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Assign Clinical Workflow</p>
                </div>
                <button onClick={() => setShowAddModal(false)} className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-all"><X /></button>
              </div>

              <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Select Assigned Patient</label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Search by name..."
                      value={searchPatient}
                      onChange={(e) => setSearchPatient(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-slate-100 dark:bg-slate-800 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-2 mt-2">
                    {patients.filter(p => p.full_name.toLowerCase().includes(searchPatient.toLowerCase())).slice(0, 3).map(p => (
                      <button 
                        key={p.id}
                        onClick={() => setSelectedPatient(p.id)}
                        className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                          selectedPatient === p.id ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-slate-50 border-slate-100 dark:bg-slate-800 dark:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600"><User className="w-4 h-4" /></div>
                          <span className="font-bold">{p.full_name}</span>
                        </div>
                        {selectedPatient === p.id && <Check className="w-4 h-4" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Assign Consulting Doctor (Optional)</label>
                  <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                    {doctors.map(doc => (
                      <button
                        key={doc.id}
                        onClick={() => setSelectedDoctor(selectedDoctor === doc.id ? null : doc.id)}
                        className={`flex-shrink-0 flex items-center gap-2 p-3 rounded-2xl border-2 transition-all ${
                          selectedDoctor === doc.id ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-slate-50 border-slate-100 dark:bg-slate-800 dark:border-slate-700'
                        }`}
                      >
                        <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-black text-[8px]">
                          {doc.full_name.charAt(0)}
                        </div>
                        <span className="text-xs font-black whitespace-nowrap">Dr. {doc.full_name.split(' ').pop()}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Link to Doctor Assignment */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Pending Assignments from Doctor (Optional)</label>
                  <div className="flex flex-wrap gap-2">
                    {pendingTests.filter(t => t.patient_id === selectedPatient && (!selectedDoctor || t.doctor_id === selectedDoctor)).length === 0 ? (
                      <p className="text-[10px] font-bold text-slate-400 italic p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl w-full">No active orders from this physician for this patient</p>
                    ) : (
                      pendingTests.filter(t => t.patient_id === selectedPatient && (!selectedDoctor || t.doctor_id === selectedDoctor)).map(test => (
                        <button
                          key={test.id}
                          onClick={() => {
                            setSelectedTestId(test.id);
                            setTaskTitle(test.test_name);
                            setTaskType('Radiology Scan'); // Default or mapped
                            setSelectedDoctor(test.doctor_id);
                          }}
                          className={`px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                            selectedTestId === test.id 
                              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {test.test_name} 📝
                        </button>
                      ))
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Task / Procedure Title</label>
                  <input 
                    type="text" 
                    placeholder="e.g., Abdominal CT Scan Prep"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    className="w-full px-6 py-4 bg-slate-100 dark:bg-slate-800 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Select Workflow Preset</label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.keys(WORKFLOW_PRESETS).map(type => (
                      <button
                        key={type}
                        onClick={() => {
                          setTaskType(type);
                          setTaskTitle(type);
                          setCustomSteps(WORKFLOW_PRESETS[type as keyof typeof WORKFLOW_PRESETS]);
                        }}
                        className={`p-4 rounded-2xl border-2 text-xs font-black uppercase tracking-widest transition-all ${
                          taskType === type ? 'bg-blue-600 border-blue-600 text-white' : 'bg-slate-100 border-slate-100 dark:bg-slate-800 dark:border-slate-700 text-slate-500'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-6 bg-amber-50 dark:bg-amber-900/10 rounded-3xl border border-amber-100 dark:border-amber-900/20">
                  <div className="flex items-center gap-2 mb-3 text-amber-700 dark:text-amber-400">
                    <Info className="w-4 h-4" />
                    <p className="text-[10px] font-black uppercase tracking-widest">Process Preview</p>
                  </div>
                  <div className="space-y-2">
                    {customSteps.map((step, i) => (
                      <div key={i} className="flex items-center gap-3 text-sm font-bold text-slate-600 dark:text-slate-400">
                        <div className="w-5 h-5 rounded bg-white dark:bg-slate-800 flex items-center justify-center text-[10px]">{i+1}</div>
                        {step}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-8">
                <button 
                  onClick={handleCreateTask}
                  disabled={!selectedPatient || !taskTitle}
                  className="w-full py-5 bg-blue-600 disabled:opacity-50 text-white rounded-[2rem] font-black text-sm shadow-xl shadow-blue-500/30 transition-all hover:scale-[1.02]"
                >
                                    START ROUND WORKFLOW
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Finalize Results Modal */}
      <AnimatePresence>
        {showFinalizeModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl"
            >
              <div className="p-8 bg-emerald-600 text-white flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-black tracking-tight">Procedural Outcomes</h3>
                  <p className="text-[10px] font-black text-emerald-200 uppercase tracking-widest mt-1">Final Documentation & Results</p>
                </div>
                <button onClick={() => setShowFinalizeModal(null)} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-all"><X /></button>
              </div>

              <div className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Clinical Result Summary</label>
                  <textarea 
                    rows={4}
                    placeholder="Enter the final procedural notes or results here..."
                    value={resultSummary}
                    onChange={(e) => setResultSummary(e.target.value)}
                    className="w-full px-6 py-4 bg-slate-100 dark:bg-slate-800 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-emerald-500 resize-none text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Attach Result File (URL/Link)</label>
                  <div className="relative">
                    <Info className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Paste image/PDF link here..."
                      value={resultFile || ''}
                      onChange={(e) => setResultFile(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-slate-100 dark:bg-slate-800 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-emerald-500 text-sm"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => setShowFinalizeModal(null)}
                    className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-2xl font-black text-xs transition-all"
                  >
                                        Later
                  </button>
                  <button 
                    onClick={() => {
                      const taskId = tasks.find(t => t.steps.some(s => s.id === showFinalizeModal))?.id;
                      if (taskId) handleFinalize(taskId);
                    }}
                    className="flex-[2] py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs shadow-xl shadow-emerald-500/30 transition-all hover:scale-105"
                  >
                                        FINALIZE & NOTIFY DOCTOR
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
