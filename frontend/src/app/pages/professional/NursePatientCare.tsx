import { useState } from 'react';
import {
  Users, AlertCircle, CheckCircle2, Clock, Heart, Thermometer, Droplet, Activity,
  Send, ArrowLeft, ClipboardList, MessageSquare, Plus, AlertTriangle, User,
  History as HistoryIcon, FlaskConical, ChevronRight, Save, Trash2
} from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { MOCK_PATIENTS } from '../../lib/mockData';
import {
  MOCK_NURSE_LOGS,
  getPatientOrders,
  getPatientClinicalNotes,
  getPatientLabTests,
  getLabStatusLabel,
  getLabStatusColor,
  getPatientNurseReports,
  MOCK_LAB_TESTS,
  NurseReport,
  LabTest,
  LabTestStatus,
  LAB_STATUS_STEPS,
} from '../../lib/hospitalData';

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

const COMMON_SYMPTOMS = [
  'Headache', 'Fatigue', 'Nausea', 'Dizziness', 'Chest Pain',
  'Shortness of Breath', 'Cough', 'Fever', 'Joint Pain', 'Swelling',
  'Appetite Loss', 'Insomnia', 'Muscle Weakness', 'Anxiety', 'Confusion',
];

export function NursePatientCare() {
  const [activeTab, setActiveTab] = useState<NurseTab>('patients');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [logSubmitted, setLogSubmitted] = useState(false);
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);

  // New Lab Order State
  const [newTestName, setNewTestName] = useState('');
  const [newTestPriority, setNewTestPriority] = useState<'routine' | 'urgent' | 'stat'>('routine');
  const [newTestType, setNewTestType] = useState<'blood' | 'urine' | 'scan' | 'xray'>('blood');

  // Report Form State
  const [reportStep, setReportStep] = useState(1);
  const [reportTitle, setReportTitle] = useState('Daily Care Review');
  const [reportTasks, setReportTasks] = useState([
    { title: 'Vitals Monitoring', description: '', completed: false },
    { title: 'Medication Delivery', description: '', completed: false },
    { title: 'Patient Meal Assistance', description: '', completed: false },
    { title: 'Personal Hygiene', description: '', completed: false },
  ]);
  const [reportSummary, setReportSummary] = useState('');
  const [reportRecs, setReportRecs] = useState('');

  const [form, setForm] = useState<SymptomForm>({
    blood_pressure: '',
    heart_rate: '',
    temperature: '',
    oxygen_level: '',
    weight: '',
    respiratory_rate: '',
    symptoms: [],
    pain_level: 0,
    mood: 'okay',
    notes: '',
    flag_doctor: false,
  });

  const [doctorReply, setDoctorReply] = useState('');

  const patients = MOCK_PATIENTS;
  const selectedPatient = patients.find(p => p.id === selectedPatientId);
  const nurseLogs = selectedPatientId ? MOCK_NURSE_LOGS.filter(l => l.patientId === selectedPatientId) : [];
  const doctorOrders = selectedPatientId ? getPatientOrders(selectedPatientId) : [];
  const clinicalNotes = selectedPatientId ? getPatientClinicalNotes(selectedPatientId) : [];
  const labTests = selectedPatientId ? getPatientLabTests(selectedPatientId) : [];

  const toggleSymptom = (sym: string) => {
    setForm(prev => ({
      ...prev,
      symptoms: prev.symptoms.includes(sym)
        ? prev.symptoms.filter(s => s !== sym)
        : [...prev.symptoms, sym],
    }));
  };

  const handleSubmitLog = () => {
    setLogSubmitted(true);
    setForm({
      blood_pressure: '', heart_rate: '', temperature: '',
      oxygen_level: '', weight: '', respiratory_rate: '',
      symptoms: [], pain_level: 0, mood: 'okay', notes: '', flag_doctor: false,
    });
    setTimeout(() => setLogSubmitted(false), 4000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'stable': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
      case 'monitoring': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300';
      case 'critical': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
      default: return 'bg-slate-100 dark:bg-slate-700 text-slate-700';
    }
  };

  const TABS: { key: NurseTab; label: string; icon: any; badge?: number }[] = [
    { key: 'patients', label: 'My Patients', icon: Users },
    { key: 'log_symptoms', label: 'Log Symptoms', icon: ClipboardList },
    { key: 'lab_results', label: 'Lab Management', icon: FlaskConical },
    { key: 'doctor_orders', label: `Doctor Orders (${doctorOrders.filter(o => o.status === 'active').length})`, icon: Activity },
    { key: 'nurse_report', label: 'Nurse Report', icon: Send },
    { key: 'care_notes', label: 'Care Notes', icon: MessageSquare },
  ];

  const handleTaskToggle = (index: number) => {
    setReportTasks(prev => prev.map((t, i) => i === index ? { ...t, completed: !t.completed } : t));
  };

  const updateTaskDesc = (index: number, desc: string) => {
    setReportTasks(prev => prev.map((t, i) => i === index ? { ...t, description: desc } : t));
  };

  const handleSubmitReport = () => {
    setReportSubmitted(true);
    setTimeout(() => {
      setReportSubmitted(false);
      setReportStep(1);
      setReportSummary('');
      setReportRecs('');
      setReportTasks(prev => prev.map(t => ({ ...t, completed: false, description: '' })));
    }, 4000);
  };

  const LabManagementCard = ({ test }: { test: LabTest }) => {
    const [status, setStatus] = useState<LabTestStatus>(test.status);
    const [isUpdating, setIsUpdating] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [stepNote, setStepNote] = useState('');
    const [summary, setSummary] = useState(test.result?.summary || '');
    const [values, setValues] = useState(test.result?.values || [
      { name: 'Glucose', value: '', unit: 'mg/dL', normalRange: '70-100' },
      { name: 'HbA1c', value: '', unit: '%', normalRange: '< 5.7' },
      { name: 'Cholesterol', value: '', unit: 'mg/dL', normalRange: '125-200' }
    ]);

    const currentIndex = LAB_STATUS_STEPS.indexOf(status);
    const nextStatus = LAB_STATUS_STEPS[currentIndex + 1];

    const advanceStatus = () => {
      if (nextStatus) {
        setIsUpdating(true);
        setTimeout(() => {
          const testIndex = MOCK_LAB_TESTS.findIndex(t => t.id === test.id);
          if (testIndex !== -1) {
            const updatedTest = { ...MOCK_LAB_TESTS[testIndex] };
            updatedTest.status = nextStatus;

            // Add new step to the timeline
            const newStep = {
              step: `${getLabStatusLabel(nextStatus)}: Recorded by Nurse`,
              completedAt: new Date().toISOString(),
              note: stepNote || undefined
            };
            updatedTest.steps = [...updatedTest.steps, newStep];

            MOCK_LAB_TESTS[testIndex] = updatedTest;
          }

          setStatus(nextStatus);
          setIsUpdating(false);
          setStepNote('');
        }, 1200);
      }
    };

    const handleSaveResults = () => {
      setIsUpdating(true);
      setTimeout(() => {
        const testIndex = MOCK_LAB_TESTS.findIndex(t => t.id === test.id);
        if (testIndex !== -1) {
          const updatedTest = { ...MOCK_LAB_TESTS[testIndex] };
          updatedTest.status = 'results_ready';
          updatedTest.completedDate = new Date().toISOString();
          updatedTest.result = {
            summary,
            values: values.map(v => ({ ...v, flag: 'normal' })) // Simplified flag logic
          };

          // Add final processing step if not already at results_ready
          if (updatedTest.status !== 'results_ready') {
            updatedTest.steps = [...updatedTest.steps, {
              step: 'Laboratory results finalized and published',
              completedAt: new Date().toISOString()
            }];
          }

          MOCK_LAB_TESTS[testIndex] = updatedTest;
        }

        setIsUpdating(false);
        setShowResults(false);
        setStatus('results_ready');
      }, 1500);
    };

    return (
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden shadow-sm transition-all">
        <div className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white text-lg">{test.testName}</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">Ordered {format(new Date(test.orderedDate), 'MMM d, p')}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getLabStatusColor(status)}`}>
              {getLabStatusLabel(status)}
            </span>
          </div>

          {/* Status Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-slate-500 uppercase">Process Status</p>
              <p className="text-xs font-bold text-blue-600">{Math.round(((currentIndex + 1) / LAB_STATUS_STEPS.length) * 100)}% Complete</p>
            </div>
            <div className="h-2 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden flex gap-0.5">
              {LAB_STATUS_STEPS.map((s, i) => (
                <div key={s} className={`h-full flex-1 transition-all duration-500 ${i <= currentIndex ? 'bg-blue-500' : 'bg-slate-200 dark:bg-slate-700/50'}`} />
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {nextStatus && (status !== 'results_ready' && status !== 'reviewed_by_doctor') && (
              <div className="flex flex-col gap-2 w-full sm:w-auto">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Optional step note..."
                    value={stepNote}
                    onChange={(e) => setStepNote(e.target.value)}
                    className="px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[200px]"
                  />
                  <button
                    onClick={advanceStatus}
                    disabled={isUpdating}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white rounded-lg text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap"
                  >
                    {isUpdating ? <Clock className="h-4 w-4 animate-spin" /> : <ChevronRight className="h-4 w-4" />}
                    Move to {getLabStatusLabel(nextStatus)}
                  </button>
                </div>
              </div>
            )}

            {(status === 'processing' || status === 'results_ready') && (
              <button
                onClick={() => setShowResults(!showResults)}
                className="px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg text-sm font-bold hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-all flex items-center gap-2"
              >
                <FlaskConical className="h-4 w-4" />
                {status === 'results_ready' ? 'Edit Results' : 'Enter Lab Results'}
              </button>
            )}

            <button className="px-3 py-2 text-slate-400 hover:text-red-500 transition-colors ml-auto">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Results Entry Form */}
        <AnimatePresence>
          {showResults && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40"
            >
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h5 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-tight">Enter Laboratory Findings</h5>
                  <button onClick={() => setShowResults(false)} className="text-slate-400 hover:text-slate-600"><Plus className="h-5 w-5 rotate-45" /></button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 px-0.5">Clinical Summary</label>
                  <textarea
                    rows={2}
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    placeholder="Provide a general assessment of the lab findings..."
                    className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-xs font-bold text-slate-500 uppercase px-0.5">Specific Values</label>
                  {values.map((v, i) => (
                    <div key={i} className="grid grid-cols-12 gap-2 items-end">
                      <div className="col-span-4">
                        <label className="text-[10px] text-slate-400 block mb-0.5">Parameter</label>
                        <input type="text" value={v.name} disabled className="w-full px-2 py-1.5 text-xs bg-slate-100 dark:bg-slate-700/50 rounded-lg text-slate-500" />
                      </div>
                      <div className="col-span-3">
                        <label className="text-[10px] text-slate-400 block mb-0.5">Value</label>
                        <input
                          type="text"
                          value={v.value}
                          onChange={(e) => {
                            const newValues = [...values];
                            newValues[i].value = e.target.value;
                            setValues(newValues);
                          }}
                          placeholder="0.00"
                          className="w-full px-2 py-1.5 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="text-[10px] text-slate-400 block mb-0.5">Unit</label>
                        <input type="text" value={v.unit} disabled className="w-full px-2 py-1.5 text-xs bg-slate-100 dark:bg-slate-700/50 rounded-lg text-slate-500" />
                      </div>
                      <div className="col-span-2">
                        <label className="text-[10px] text-slate-400 block mb-0.5">Range</label>
                        <input type="text" value={v.normalRange} disabled className="w-full px-2 py-1.5 text-[10px] bg-slate-100 dark:bg-slate-700/50 rounded-lg text-slate-400" />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button onClick={() => setShowResults(false)} className="px-4 py-2 text-sm font-medium text-slate-500">Cancel</button>
                  <button
                    onClick={handleSaveResults}
                    disabled={isUpdating}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg text-sm font-bold shadow-lg shadow-purple-500/20 flex items-center gap-2"
                  >
                    {isUpdating ? <Clock className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Confirm & Publish Results
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="md:flex md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Patient Care</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {selectedPatient ? `Managing: ${selectedPatient.name}` : 'Select a patient to begin'}
          </p>
        </div>
        {selectedPatient && (
          <div className="mt-4 md:mt-0 flex items-center gap-3">
            <img src={selectedPatient.avatar} alt={selectedPatient.name} className="h-10 w-10 rounded-full object-cover border-2 border-blue-200 dark:border-blue-700" />
            <div>
              <p className="font-semibold text-slate-900 dark:text-white text-sm">{selectedPatient.name}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${getStatusColor(selectedPatient.status)}`}>
                {selectedPatient.status}
              </span>
            </div>
            <button onClick={() => setSelectedPatientId(null)} className="ml-2 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300">
              Change Patient
            </button>
          </div>
        )}
      </div>

      {/* Patient Selection */}
      {!selectedPatient ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {patients.map(patient => (
            <motion.div key={patient.id} whileHover={{ scale: 1.01 }}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 transition-all"
              onClick={() => { setSelectedPatientId(patient.id); setActiveTab('log_symptoms'); }}>
              <div className="flex items-center gap-4">
                <img src={patient.avatar} alt={patient.name} className="h-12 w-12 rounded-full object-cover border-2 border-slate-200 dark:border-slate-700" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-slate-900 dark:text-white">{patient.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${getStatusColor(patient.status)}`}>
                      {patient.status}
                    </span>
                    {patient.status === 'critical' && <AlertCircle className="h-4 w-4 text-red-500" />}
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{patient.age} yrs · {patient.condition}</p>
                  {MOCK_NURSE_LOGS.filter(l => l.patientId === patient.id && l.flaggedForDoctor).length > 0 && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" /> Has flagged observations
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Doctor Orders</p>
                  <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{getPatientOrders(patient.id).filter(o => o.status === 'active').length}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <>
          {/* Tabs */}
          <div className="border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
            <nav className="-mb-px flex gap-1 min-w-max">
              {TABS.map(tab => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.key
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}>
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <AnimatePresence mode="wait">
            {/* ─── Log Symptoms Tab ─── */}
            {activeTab === 'log_symptoms' && (
              <motion.div key="log" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
                <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
                    <ClipboardList className="h-5 w-5 text-blue-500" />
                    Symptom & Vitals Log for {selectedPatient.name}
                  </h3>

                  {/* Vitals Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-5">
                    {[
                      { key: 'blood_pressure', label: 'Blood Pressure', placeholder: 'e.g. 120/80', icon: Activity },
                      { key: 'heart_rate', label: 'Heart Rate (bpm)', placeholder: 'e.g. 72', icon: Heart },
                      { key: 'temperature', label: 'Temperature (°C)', placeholder: 'e.g. 36.8', icon: Thermometer },
                      { key: 'oxygen_level', label: 'SpO2 (%)', placeholder: 'e.g. 98', icon: Droplet },
                      { key: 'weight', label: 'Weight (kg)', placeholder: 'e.g. 65', icon: User },
                      { key: 'respiratory_rate', label: 'Resp. Rate (/min)', placeholder: 'e.g. 16', icon: Activity },
                    ].map(field => (
                      <div key={field.key}>
                        <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">{field.label}</label>
                        <div className="relative">
                          <field.icon className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                          <input type="text" placeholder={field.placeholder}
                            value={(form as any)[field.key]}
                            onChange={e => setForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                            className="w-full pl-9 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pain Level */}
                  <div className="mb-5">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Pain Level: <span className="font-bold text-blue-600 dark:text-blue-400">{form.pain_level}/10</span>
                    </label>
                    <input type="range" min={0} max={10} value={form.pain_level}
                      onChange={e => setForm(prev => ({ ...prev, pain_level: parseInt(e.target.value) }))}
                      className="w-full" />
                    <div className="flex justify-between text-xs text-slate-400 dark:text-slate-500 mt-1">
                      <span>No Pain</span><span>Moderate</span><span>Severe</span>
                    </div>
                  </div>

                  {/* Mood */}
                  <div className="mb-5">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Patient Mood</label>
                    <div className="flex gap-2">
                      {(['great', 'good', 'okay', 'poor', 'bad'] as const).map(m => (
                        <button key={m} onClick={() => setForm(prev => ({ ...prev, mood: m }))}
                          className={`flex-1 py-2 text-sm rounded-lg capitalize border transition-all ${form.mood === m
                            ? 'bg-blue-600 border-blue-600 text-white font-semibold'
                            : 'border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:border-blue-400'
                            }`}>
                          {m === 'great' ? '😊' : m === 'good' ? '🙂' : m === 'okay' ? '😐' : m === 'poor' ? '😟' : '😢'} {m}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Symptoms */}
                  <div className="mb-5">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Observed Symptoms</label>
                    <div className="flex flex-wrap gap-2">
                      {COMMON_SYMPTOMS.map(sym => (
                        <button key={sym} onClick={() => toggleSymptom(sym)}
                          className={`px-3 py-1.5 text-xs rounded-full border transition-all ${form.symptoms.includes(sym)
                            ? 'bg-yellow-500 border-yellow-500 text-white font-semibold'
                            : 'border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:border-yellow-400'
                            }`}>
                          {sym}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="mb-5">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Observations / Notes</label>
                    <textarea rows={3} value={form.notes} onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Describe patient's condition, any concerns, medication adherence..."
                      className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none" />
                  </div>

                  {/* Flag for Doctor */}
                  <div className="mb-5 flex items-center gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                    <input type="checkbox" id="flag_doc" checked={form.flag_doctor}
                      onChange={e => setForm(prev => ({ ...prev, flag_doctor: e.target.checked }))}
                      className="h-4 w-4 text-red-600 rounded" />
                    <label htmlFor="flag_doc" className="text-sm font-medium text-red-800 dark:text-red-300 cursor-pointer">
                      🚨 Flag this log for doctor review (urgent concerns)
                    </label>
                  </div>

                  <button onClick={handleSubmitLog}
                    className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                    <Send className="h-5 w-5" /> Submit Symptom Log
                  </button>

                  {logSubmitted && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      className="mt-4 p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                      <div>
                        <p className="font-semibold text-green-800 dark:text-green-300 text-sm">Log submitted successfully!</p>
                        <p className="text-xs text-green-700 dark:text-green-400">
                          {form.flag_doctor ? 'Doctor has been notified of this urgent log.' : 'Log has been added to the patient\'s record.'}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Previous Logs */}
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Previous Logs</h3>
                  <div className="space-y-3">
                    {nurseLogs.map(log => (
                      <div key={log.id} className={`rounded-xl border p-4 ${log.flaggedForDoctor ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'}`}>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-medium text-slate-600 dark:text-slate-400">{format(new Date(log.date), 'MMM d, yyyy · h:mm a')}</p>
                          {log.flaggedForDoctor && <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-2 py-0.5 rounded-full font-semibold">Flagged</span>}
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs mb-2">
                          <span><span className="text-slate-400">BP:</span> <span className="font-medium text-slate-900 dark:text-white">{log.vitals.bloodPressure}</span></span>
                          <span><span className="text-slate-400">HR:</span> <span className="font-medium text-slate-900 dark:text-white">{log.vitals.heartRate}</span></span>
                          <span><span className="text-slate-400">SpO2:</span> <span className={`font-medium ${(log.vitals.oxygenLevel || 100) < 90 ? 'text-red-600' : 'text-slate-900 dark:text-white'}`}>{log.vitals.oxygenLevel}%</span></span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400">{log.notes}</p>
                        {log.doctorResponse && (
                          <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <p className="text-xs font-semibold text-blue-800 dark:text-blue-300">Doctor's response:</p>
                            <p className="text-xs text-slate-700 dark:text-slate-300 italic">{log.doctorResponse}</p>
                          </div>
                        )}
                        {log.flaggedForDoctor && !log.doctorResponse && (
                          <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 flex items-center gap-1">
                            <Clock className="h-3 w-3" /> Awaiting doctor response...
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ─── Doctor Orders Tab ─── */}
            {activeTab === 'doctor_orders' && (
              <motion.div key="orders" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                <h3 className="font-semibold text-slate-900 dark:text-white">Active Orders from Doctor</h3>
                {doctorOrders.length === 0 && <p className="text-center py-12 text-slate-500 dark:text-slate-400">No active orders for this patient.</p>}
                {doctorOrders.map(order => (
                  <div key={order.id} className={`rounded-xl border p-4 ${order.status === 'active' ? 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800' : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 opacity-60'}`}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${order.type === 'lab_test' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' :
                          order.type === 'medication' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                            order.type === 'scan' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                              'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
                          }`}>
                          {order.type.replace('_', ' ').toUpperCase()}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${order.status === 'active' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'}`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 dark:text-slate-500">{format(new Date(order.date), 'MMM d')}</p>
                    </div>
                    <p className="font-medium text-slate-900 dark:text-white text-sm">{order.description}</p>
                    {order.details && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{order.details}</p>}
                  </div>
                ))}

                {/* Lab Tests for this patient */}
                <h3 className="font-semibold text-slate-900 dark:text-white mt-4">Lab Test Status</h3>
                {labTests.map(test => (
                  <div key={test.id} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white text-sm">{test.testName}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{format(new Date(test.orderedDate), 'MMM d, yyyy')}</p>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${getLabStatusColor(test.status)}`}>
                        {getLabStatusLabel(test.status)}
                      </span>
                    </div>
                    {test.result && (
                      <p className="text-xs text-green-700 dark:text-green-400 mt-2 bg-green-50 dark:bg-green-900/20 p-2 rounded-lg">{test.result.summary}</p>
                    )}
                  </div>
                ))}
              </motion.div>
            )}

            {/* ─── Nurse Report Tab ─── */}
            {activeTab === 'nurse_report' && (
              <motion.div key="report" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">Create Patient Shift Report</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Step {reportStep} of 3</p>
                    </div>
                    {reportSubmitted && (
                      <span className="flex items-center gap-1 text-green-600 dark:text-green-400 text-sm font-bold animate-bounce">
                        <CheckCircle2 className="h-4 w-4" /> Report Submitted!
                      </span>
                    )}
                  </div>

                  {/* Progressive Steps */}
                  <div className="flex gap-2 mb-8">
                    {[1, 2, 3].map(s => (
                      <div key={s} className={`h-1.5 flex-1 rounded-full transition-colors ${reportStep >= s ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'}`} />
                    ))}
                  </div>

                  {/* Step 1: Tasks Checklist */}
                  {reportStep === 1 && (
                    <div className="space-y-5">
                      <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <ClipboardList className="h-5 w-5 text-blue-500" />
                        Shift Tasks Completion
                      </h4>
                      <div className="space-y-3">
                        {reportTasks.map((task, idx) => (
                          <div key={idx} className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                            <div className="flex items-center gap-3 mb-2">
                              <input type="checkbox" checked={task.completed} onChange={() => handleTaskToggle(idx)} className="h-5 w-5 rounded text-blue-600" />
                              <span className={`font-medium ${task.completed ? 'text-slate-900 dark:text-white line-through opacity-50' : 'text-slate-900 dark:text-white'}`}>{task.title}</span>
                            </div>
                            <input type="text" value={task.description} onChange={e => updateTaskDesc(idx, e.target.value)}
                              placeholder="Add notes for this task..."
                              className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                          </div>
                        ))}
                      </div>
                      <button onClick={() => setReportStep(2)} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors">
                        Next: Summary & Recs
                      </button>
                    </div>
                  )}

                  {/* Step 2: Summary & Recommendations */}
                  {reportStep === 2 && (
                    <div className="space-y-5">
                      <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-purple-500" />
                        Final Summary & Recommendations
                      </h4>
                      <div>
                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Shift Overview Summary</label>
                        <textarea rows={4} value={reportSummary} onChange={e => setReportSummary(e.target.value)}
                          placeholder="Summarize the patient's status during your shift..."
                          className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Recommendations for Next Shift / Doctor</label>
                        <textarea rows={3} value={reportRecs} onChange={e => setReportRecs(e.target.value)}
                          placeholder="What should the next nurse or doctor watch out for?"
                          className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                      </div>
                      <div className="flex gap-3">
                        <button onClick={() => setReportStep(1)} className="flex-1 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                          Back
                        </button>
                        <button onClick={() => setReportStep(3)} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors">
                          Review & Submit
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Review */}
                  {reportStep === 3 && (
                    <div className="space-y-6">
                      <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                        Final Review
                      </h4>
                      <div className="p-4 rounded-xl border-2 border-blue-100 dark:border-blue-900 bg-blue-50/30 dark:bg-blue-900/10 space-y-4">
                        <div>
                          <p className="text-xs font-bold text-blue-600 uppercase mb-2">Tasks Completed</p>
                          <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1">
                            {reportTasks.filter(t => t.completed).map(t => <li key={t.title}>✓ {t.title}</li>)}
                          </ul>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-blue-600 uppercase mb-2">Summary</p>
                          <p className="text-sm text-slate-700 dark:text-slate-300">{reportSummary || 'No summary provided'}</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-blue-600 uppercase mb-2">Recommendations</p>
                          <p className="text-sm text-slate-700 dark:text-slate-300">{reportRecs || 'No recommendations provided'}</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button onClick={() => setReportStep(2)} className="flex-1 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                          Edit
                        </button>
                        <button onClick={handleSubmitReport} className="flex-1 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors">
                          Submit Final Report
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* History of Reports */}
                <div className="space-y-4">
                  <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <HistoryIcon className="h-5 w-5 text-slate-400" />
                    Completed Reports history
                  </h3>
                  {selectedPatientId && getPatientNurseReports(selectedPatientId).map(report => (
                    <div key={report.id} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-bold text-slate-900 dark:text-white">{report.title}</h4>
                        <span className="text-xs text-slate-500 dark:text-slate-400">{format(new Date(report.date), 'MMM d, yyyy · p')}</span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">{report.summary}</p>
                      <div className="mt-3 flex items-center gap-4 text-xs">
                        <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium">
                          <CheckCircle2 className="h-3 w-3" /> {report.steps.filter(s => s.completed).length}/{report.steps.length} Steps
                        </span>
                        <button className="text-blue-600 font-bold hover:underline">View Full Report</button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ─── Lab Results Tab ─── */}
            {activeTab === 'lab_results' && (
              <motion.div key="labs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <FlaskConical className="h-6 w-6 text-purple-500" />
                    Laboratory Management
                  </h3>
                  <button
                    onClick={() => setShowOrderModal(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-all flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" /> New Lab Order
                  </button>
                </div>

                <div className="space-y-4">
                  {labTests.map(test => (
                    <LabManagementCard key={test.id} test={test} />
                  ))}
                </div>

                {/* New Order Modal */}
                <AnimatePresence>
                  {showOrderModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-800">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-blue-600 text-white">
                          <h3 className="font-bold text-lg">Order New Lab Test</h3>
                          <button onClick={() => setShowOrderModal(false)}><Plus className="h-6 w-6 rotate-45" /></button>
                        </div>
                        <div className="p-6 space-y-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1 px-0.5">Test Name</label>
                            <input
                              type="text"
                              value={newTestName}
                              onChange={(e) => setNewTestName(e.target.value)}
                              placeholder="e.g. Full Blood Count, Lipid Profile"
                              className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-1 px-0.5">Priority</label>
                              <select
                                value={newTestPriority}
                                onChange={(e) => setNewTestPriority(e.target.value as any)}
                                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                              >
                                <option value="routine">Routine</option>
                                <option value="urgent">Urgent</option>
                                <option value="stat">STAT (Critical)</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-1 px-0.5">Sample Type</label>
                              <select
                                value={newTestType}
                                onChange={(e) => setNewTestType(e.target.value as any)}
                                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                              >
                                <option value="blood">Blood</option>
                                <option value="urine">Urine</option>
                                <option value="scan">Scan</option>
                                <option value="xray">X-Ray</option>
                              </select>
                            </div>
                          </div>
                          <div className="pt-4 flex gap-3">
                            <button onClick={() => setShowOrderModal(false)} className="flex-1 py-3 border border-slate-300 dark:border-slate-600 rounded-xl font-bold text-slate-600 dark:text-slate-400">Cancel</button>
                            <button
                              onClick={() => {
                                if (!newTestName.trim()) return;
                                const newTest: LabTest = {
                                  id: `lt-new-${Date.now()}`,
                                  patientId: selectedPatientId!,
                                  hospitalId: 'h2', // Defualt to current hospital
                                  orderedByDoctorId: 'hd1',
                                  testName: newTestName,
                                  testType: newTestType as any,
                                  status: 'ordered',
                                  orderedDate: new Date().toISOString(),
                                  priority: newTestPriority as any,
                                  steps: [
                                    { step: `Test ordered by Nurse`, completedAt: new Date().toISOString() }
                                  ]
                                };
                                MOCK_LAB_TESTS.push(newTest);
                                setShowOrderModal(false);
                                setNewTestName('');
                              }}
                              className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20"
                            >
                              Confirm Order
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* ─── Care Notes Tab ─── */}
            {activeTab === 'care_notes' && (
              <motion.div key="notes" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                <h3 className="font-semibold text-slate-900 dark:text-white">Doctor's Clinical Notes & Requests</h3>
                {clinicalNotes.length === 0 && <p className="text-center py-12 text-slate-500 dark:text-slate-400">No clinical notes yet.</p>}
                {clinicalNotes.map(note => (
                  <div key={note.id} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{format(new Date(note.date), 'MMMM d, yyyy')}</p>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Assessment</p>
                        <p className="text-sm text-slate-800 dark:text-slate-200">{note.assessment}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Care Plan</p>
                        <p className="text-sm text-slate-800 dark:text-slate-200">{note.plan}</p>
                      </div>
                      {note.requestToNurse && (
                        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl">
                          <p className="text-xs font-semibold text-purple-800 dark:text-purple-300 mb-2">📋 Doctor's Request to You:</p>
                          <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">{note.requestToNurse}</p>
                          {note.nurseResponse ? (
                            <div className="mt-3 pl-3 border-l-2 border-purple-300 dark:border-purple-700">
                              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">Your response:</p>
                              <p className="text-xs text-slate-700 dark:text-slate-300 italic">{note.nurseResponse}</p>
                            </div>
                          ) : (
                            <div className="mt-3 flex gap-2">
                              <input type="text" value={doctorReply} onChange={e => setDoctorReply(e.target.value)}
                                placeholder="Type your response..."
                                className="flex-1 px-3 py-2 text-xs border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500" />
                              <button className="px-3 py-2 bg-purple-600 text-white rounded-lg text-xs font-medium hover:bg-purple-700 transition-colors flex items-center gap-1">
                                <Send className="h-3 w-3" /> Reply
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}
