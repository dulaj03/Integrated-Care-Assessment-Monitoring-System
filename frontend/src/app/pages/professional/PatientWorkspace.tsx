import { useState } from 'react';
import { useParams } from 'react-router';
import {
  Activity, FlaskConical, Pill, ClipboardList, MessageSquare, Send, CheckCircle2, Clock,
  User, ArrowLeft, AlertTriangle, Heart, Thermometer, Droplet, Plus
} from 'lucide-react';
import { Link } from 'react-router';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { MOCK_PATIENTS, MOCK_NURSES } from '../../lib/mockData';
import {
  getPatientLabTests,
  getPatientOrders,
  getPatientNurseLogs,
  getPatientClinicalNotes,
  MOCK_LAB_TESTS,
  getLabStatusLabel,
  getLabStatusColor,
  getPatientNurseReports,
  ClinicalOrder,
  OrderType,
  LabTest,
} from '../../lib/hospitalData';

type WorkspaceTab = 'overview' | 'nurse_logs' | 'nurse_reports' | 'lab_tests' | 'orders' | 'notes' | 'messaging';

const ORDER_TYPES: { value: OrderType; label: string; color: string }[] = [
  { value: 'lab_test', label: 'Lab Test', color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' },
  { value: 'scan', label: 'Scan / Imaging', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' },
  { value: 'medication', label: 'Medication', color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' },
  { value: 'referral', label: 'Referral', color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300' },
  { value: 'physiotherapy', label: 'Physiotherapy', color: 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300' },
];

export function PatientWorkspace() {
  const { id } = useParams<{ id: string }>();
  const patient = MOCK_PATIENTS.find(p => p.id === id) || MOCK_PATIENTS[0];

  const [activeTab, setActiveTab] = useState<WorkspaceTab>('overview');
  const [noteText, setNoteText] = useState('');
  const [nurseRequestText, setNurseRequestText] = useState('');
  const [orderType, setOrderType] = useState<OrderType>('lab_test');
  const [orderDesc, setOrderDesc] = useState('');
  const [orderDetails, setOrderDetails] = useState('');
  const [showAddOrder, setShowAddOrder] = useState(false);
  const [localOrders, setLocalOrders] = useState<ClinicalOrder[]>(getPatientOrders(patient.id));
  const [noteSubmitted, setNoteSubmitted] = useState(false);
  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [isNurseModalOpen, setIsNurseModalOpen] = useState(false);
  const [assignedNurseId, setAssignedNurseId] = useState<string | null>(null);

  const handleAssignNurse = (nurseId: string) => {
    setAssignedNurseId(nurseId);
    setIsNurseModalOpen(false);
    // In a real app: POST /care-team/assign-nurse
  };

  const labTests = getPatientLabTests(patient.id);
  const nurseLogs = getPatientNurseLogs(patient.id);
  const clinicalNotes = getPatientClinicalNotes(patient.id);
  const latestNurseLog = nurseLogs[0];

  const getStatusColor = (status: string) => {
    switch (status) {
    case 'stable': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
    case 'monitoring': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300';
    case 'critical': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
    default: return 'bg-slate-100 dark:bg-slate-700 text-slate-700';
    }
  };

  const handleSubmitOrder = () => {
    if (!orderDesc.trim()) return;
    const newOrder: ClinicalOrder = {
      id: `co-new-${Date.now()}`,
      patientId: patient.id,
      orderedByDoctorId: 'hd1',
      type: orderType,
      description: orderDesc,
      details: orderDetails,
      date: new Date().toISOString(),
      status: 'active',
    };
    setLocalOrders(prev => [newOrder, ...prev]);
    setOrderDesc('');
    setOrderDetails('');
    setShowAddOrder(false);
    setOrderSubmitted(true);
    setTimeout(() => setOrderSubmitted(false), 3000);
  };

  const handleSubmitNote = () => {
    if (!noteText.trim()) return;
    setNoteText('');
    setNoteSubmitted(true);
    setTimeout(() => setNoteSubmitted(false), 3000);
  };

  const TABS: { key: WorkspaceTab; label: string; icon: React.ElementType }[] = [
    { key: 'overview', label: 'Overview', icon: Activity },
    { key: 'nurse_logs', label: `Nursing (${nurseLogs.length})`, icon: ClipboardList },
    { key: 'nurse_reports', label: 'Shift Reports', icon: Send },
    { key: 'lab_tests', label: `Labs (${labTests.length})`, icon: FlaskConical },
    { key: 'orders', label: `Orders (${localOrders.length})`, icon: Pill },
    { key: 'notes', label: 'Clinical Notes', icon: MessageSquare },
  ];

  const LabTestReviewCard = ({ test }: { test: LabTest }) => {
    const [reviewNote, setReviewNote] = useState(test.result?.reviewNote || '');
    const [isSaving, setIsSaving] = useState(false);
    const [status, setStatus] = useState(test.status);

    const handleSaveReview = () => {
      setIsSaving(true);
      setTimeout(() => {
        const testIndex = MOCK_LAB_TESTS.findIndex(t => t.id === test.id);
        if (testIndex !== -1) {
          const updatedTest = { ...MOCK_LAB_TESTS[testIndex] };
          updatedTest.status = 'reviewed_by_doctor';
          updatedTest.result = {
            ...updatedTest.result!,
            reviewNote: reviewNote
          };

          // Add review step
          updatedTest.steps = [...updatedTest.steps, {
            step: 'Doctor Review: Completed by Dr. Sarah Perera',
            completedAt: new Date().toISOString(),
            note: reviewNote
          }];

          MOCK_LAB_TESTS[testIndex] = updatedTest;
          setStatus('reviewed_by_doctor');
        }
        setIsSaving(false);
      }, 1000);
    };

    return (
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-sm transition-all hover:shadow-md">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${test.testType === 'blood' ? 'bg-red-50 dark:bg-red-900/20 text-red-600' : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600'}`}>
              <FlaskConical className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white">{test.testName}</h4>
              <p className="text-xs text-slate-500">Ordered: {format(new Date(test.orderedDate), 'MMM d, yyyy')}</p>
            </div>
          </div>
          <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-tight ${getLabStatusColor(status)}`}>
            {getLabStatusLabel(status)}
          </span>
        </div>

        {test.result ? (
          <div className="space-y-4">
            <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-100 dark:border-slate-700">
              <p className="text-xs font-bold text-slate-500 uppercase mb-2">Findings Summary</p>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">{test.result.summary}</p>

              {test.result.values && (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {test.result.values.map((v: { name: string; value: string; unit: string; flag?: string }, i: number) => (
                    <div key={i} className="flex justify-between items-center p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700 text-xs">
                      <span className="text-slate-500">{v.name}</span>
                      <span className={`font-bold ${v.flag === 'high' ? 'text-red-600' : v.flag === 'low' ? 'text-blue-600' : 'text-green-600'}`}>
                        {v.value} {v.unit}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-blue-600 uppercase">Clinical Review & Instructions</label>
              <textarea
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                placeholder="Enter your clinical interpretation and next steps for the patient..."
                className="w-full px-4 py-3 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 resize-none"
                rows={3}
              />
              <div className="flex justify-end pt-1">
                <button
                  onClick={handleSaveReview}
                  disabled={isSaving || !reviewNote.trim()}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-lg text-sm font-bold shadow-lg shadow-blue-500/20 flex items-center gap-2 transition-all"
                >
                  {isSaving ? <Clock className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  {status === 'reviewed_by_doctor' ? 'Update Review' : 'Finalize & Sign Results'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
            <Clock className="h-8 w-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500 italic">No results reported yet. Progressing through laboratory workflow.</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Back + Header */}
      <div className="flex items-center gap-4">
        <Link to="/doctor/patients" className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex items-center gap-4 flex-1">
          <img src={patient.avatar} alt={patient.name} className="h-12 w-12 rounded-full object-cover border-2 border-blue-200 dark:border-blue-700" />
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{patient.name}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">{patient.age} yrs · {patient.gender} · {patient.condition}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(patient.status)}`}>
            {patient.status.charAt(0).toUpperCase() + patient.status.slice(1)}
          </span>
          <button
            onClick={() => setIsNurseModalOpen(true)}
            className="px-4 py-2 bg-slate-800 dark:bg-slate-700 text-white rounded-lg text-sm font-medium hover:bg-slate-700 dark:hover:bg-slate-600 transition-all flex items-center gap-2"
          >
            <User className="h-4 w-4" />
            {assignedNurseId ? 'Reassign Nurse' : 'Assign Nurse'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
        <nav className="-mb-px flex gap-1 min-w-max">
          {TABS.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.key
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:border-slate-300'
              }`}>
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <AnimatePresence mode="wait">
        {/* ─── Overview Tab ─── */}
        {activeTab === 'overview' && (
          <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
            {/* Nurse Flagged Alert */}
            {latestNurseLog?.flaggedForDoctor && (
              <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-800 dark:text-red-300 text-sm">⚠ Nurse flagged a concern</p>
                  <p className="text-sm text-red-700 dark:text-red-400 mt-1">{latestNurseLog.notes}</p>
                  <p className="text-xs text-red-500 dark:text-red-500 mt-1">
                    Logged by Nurse Anjali · {format(new Date(latestNurseLog.date), 'MMM d, h:mm a')}
                  </p>
                  {latestNurseLog.doctorResponse && (
                    <div className="mt-2 p-2 bg-white dark:bg-slate-800 rounded-lg">
                      <p className="text-xs font-medium text-slate-700 dark:text-slate-300">Your previous response:</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 italic">{latestNurseLog.doctorResponse}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Current Vitals (from Nurse) */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-500" />
                Latest Vitals
                {latestNurseLog && (
                  <span className="ml-auto text-xs text-slate-500 dark:text-slate-400">
                    Nurse round · {format(new Date(latestNurseLog.date), 'MMM d · h:mm a')}
                  </span>
                )}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {latestNurseLog ? [
                  { label: 'Blood Pressure', value: latestNurseLog.vitals.bloodPressure || 'N/A', icon: Activity, color: 'text-slate-600 dark:text-slate-400' },
                  { label: 'Heart Rate', value: `${latestNurseLog.vitals.heartRate} bpm`, icon: Heart, color: 'text-red-500' },
                  { label: 'Temperature', value: `${latestNurseLog.vitals.temperature}°C`, icon: Thermometer, color: 'text-orange-500' },
                  { label: 'SpO2', value: `${latestNurseLog.vitals.oxygenLevel}%`, icon: Droplet, color: 'text-blue-500' },
                  { label: 'Resp. Rate', value: `${latestNurseLog.vitals.respiratoryRate || 'N/A'} /min`, icon: Activity, color: 'text-purple-500' },
                  { label: 'Weight', value: `${latestNurseLog.vitals.weight || 'N/A'} kg`, icon: User, color: 'text-green-500' },
                ].map(v => (
                  <div key={v.label} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                    <v.icon className={`h-5 w-5 ${v.color}`} />
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{v.label}</p>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{v.value}</p>
                    </div>
                  </div>
                )) : (
                  <p className="col-span-full text-sm text-slate-500 dark:text-slate-400">No nurse vitals logged yet.</p>
                )}
              </div>
            </div>

            {/* Quick Order */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-blue-500" /> Quick Order
                </h3>
              </div>
              {!showAddOrder ? (
                <div className="flex flex-wrap gap-2">
                  {ORDER_TYPES.map(ot => (
                    <button key={ot.value} onClick={() => { setOrderType(ot.value); setShowAddOrder(true); }}
                      className={`px-4 py-2 rounded-lg text-sm font-medium ${ot.color} hover:opacity-80 transition-opacity border border-transparent`}>
                      + Order {ot.label}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${ORDER_TYPES.find(o => o.value === orderType)?.color}`}>
                      {ORDER_TYPES.find(o => o.value === orderType)?.label}
                    </span>
                    <button onClick={() => setShowAddOrder(false)} className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300">← Change type</button>
                  </div>
                  <input type="text" placeholder="Order description..." value={orderDesc} onChange={e => setOrderDesc(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                  <textarea rows={2} placeholder="Additional instructions..." value={orderDetails} onChange={e => setOrderDetails(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none" />
                  <div className="flex gap-2">
                    <button onClick={handleSubmitOrder}
                      className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                      <Send className="h-4 w-4" /> Place Order
                    </button>
                    <button onClick={() => setShowAddOrder(false)}
                      className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                      Cancel
                    </button>
                  </div>
                </div>
              )}
              {orderSubmitted && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-green-600 dark:text-green-400 mt-2 flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4" /> Order placed successfully!
                </motion.p>
              )}
            </div>

            {/* Message Nurse */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-purple-500" /> Request to Assigned Nurse
              </h3>
              <div className="flex gap-3">
                <textarea rows={2} value={nurseRequestText} onChange={e => setNurseRequestText(e.target.value)}
                  placeholder="Ask the nurse to check something or carry out a task..."
                  className="flex-1 px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm resize-none" />
                <button className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors self-end flex items-center gap-2">
                  <Send className="h-4 w-4" /> Send
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ─── Nurse Logs Tab ─── */}
        {activeTab === 'nurse_logs' && (
          <motion.div key="nurse_logs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-900 dark:text-white">Nurse Symptom Logs</h3>
              <span className="text-sm text-slate-500 dark:text-slate-400">{nurseLogs.length} entries</span>
            </div>
            {nurseLogs.length === 0 ? (
              <p className="text-center py-12 text-slate-500 dark:text-slate-400">No nurse logs recorded yet.</p>
            ) : nurseLogs.map(log => (
              <div key={log.id} className={`rounded-xl border p-5 ${log.flaggedForDoctor ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'}`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white text-sm">
                      {format(new Date(log.date), 'MMMM d, yyyy · h:mm a')}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Logged by Nurse Anjali</p>
                  </div>
                  {log.flaggedForDoctor && (
                    <span className="flex items-center gap-1 text-xs font-semibold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-2.5 py-1 rounded-full">
                      <AlertTriangle className="h-3 w-3" /> Flagged for you
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                  <div><span className="text-slate-500 dark:text-slate-400 text-xs">BP:</span> <span className="font-medium text-slate-900 dark:text-white">{log.vitals.bloodPressure}</span></div>
                  <div><span className="text-slate-500 dark:text-slate-400 text-xs">HR:</span> <span className="font-medium text-slate-900 dark:text-white">{log.vitals.heartRate} bpm</span></div>
                  <div><span className="text-slate-500 dark:text-slate-400 text-xs">Temp:</span> <span className="font-medium text-slate-900 dark:text-white">{log.vitals.temperature}°C</span></div>
                  <div><span className="text-slate-500 dark:text-slate-400 text-xs">SpO2:</span> <span className={`font-medium ${(log.vitals.oxygenLevel || 100) < 90 ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-white'}`}>{log.vitals.oxygenLevel}%</span></div>
                </div>
                {log.symptoms.length > 0 && (
                  <div className="mb-2 flex flex-wrap gap-1.5">
                    {log.symptoms.map(s => (
                      <span key={s} className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 px-2 py-0.5 rounded-full">{s}</span>
                    ))}
                  </div>
                )}
                <p className="text-sm text-slate-700 dark:text-slate-300 mt-2">📝 {log.notes}</p>
                {log.doctorResponse && (
                  <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-xs font-semibold text-blue-800 dark:text-blue-300 mb-1">Your Response:</p>
                    <p className="text-xs text-slate-700 dark:text-slate-300 italic">{log.doctorResponse}</p>
                  </div>
                )}
                {log.flaggedForDoctor && !log.doctorResponse && (
                  <div className="mt-3 flex gap-2">
                    <input type="text" placeholder="Type your response to the nurse..." className="flex-1 px-3 py-2 text-xs border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <button className="px-3 py-2 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors flex items-center gap-1">
                      <Send className="h-3 w-3" /> Reply
                    </button>
                  </div>
                )}
              </div>
            ))}
          </motion.div>
        )}

        {/* ─── Nurse Reports Tab ─── */}
        {activeTab === 'nurse_reports' && (
          <motion.div key="nurse_reports" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            <h3 className="font-semibold text-slate-900 dark:text-white">Nurse Shift Reports</h3>
            {getPatientNurseReports(patient.id).length === 0 ? (
              <p className="text-center py-12 text-slate-500 dark:text-slate-400">No shift reports filed yet.</p>
            ) : getPatientNurseReports(patient.id).map(report => (
              <div key={report.id} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">{report.title}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{format(new Date(report.date), 'MMMM d, yyyy · p')}</p>
                  </div>
                  <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-bold uppercase">Submitted</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">Nursing Assessment</p>
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{report.summary}</p>
                    <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mt-4">Nurse Recommendations</p>
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic border-l-2 border-amber-200 dark:border-amber-800 pl-3">
                      {report.recommendations}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Completed Tasks</p>
                    <div className="space-y-2">
                      {report.steps.map((step, idx) => (
                        <div key={idx} className="flex gap-2">
                          <CheckCircle2 className={`h-4 w-4 flex-shrink-0 ${step.completed ? 'text-green-500' : 'text-slate-300'}`} />
                          <div>
                            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{step.title}</p>
                            {step.description && <p className="text-[10px] text-slate-500">{step.description}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {report.vitalsSnapshot && (
                  <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700">
                    <p className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">Shift Vitals Snapshot</p>
                    <div className="grid grid-cols-4 gap-4">
                      <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900/50">
                        <p className="text-[10px] text-slate-500">BP</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{report.vitalsSnapshot.bp}</p>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900/50">
                        <p className="text-[10px] text-slate-500">Pulse</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{report.vitalsSnapshot.hr} bpm</p>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900/50">
                        <p className="text-[10px] text-slate-500">SpO2</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{report.vitalsSnapshot.spo2}%</p>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900/50">
                        <p className="text-[10px] text-slate-500">Temp</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{report.vitalsSnapshot.temp}°C</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </motion.div>
        )}

        {/* ─── Lab Tests Tab ─── */}
        {activeTab === 'lab_tests' && (
          <motion.div key="lab_tests" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            <h3 className="font-semibold text-slate-900 dark:text-white">Ordered Lab Tests</h3>
            {labTests.map(test => (
              <LabTestReviewCard key={test.id} test={test} />
            ))}
          </motion.div>
        )}

        {/* ─── Orders Tab ─── */}
        {activeTab === 'orders' && (
          <motion.div key="orders" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-900 dark:text-white">Clinical Orders</h3>
              <button onClick={() => setShowAddOrder(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                <Plus className="h-4 w-4" /> New Order
              </button>
            </div>
            {showAddOrder && (
              <div className="p-5 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 space-y-3">
                <h4 className="font-semibold text-slate-900 dark:text-white text-sm">New Clinical Order</h4>
                <div className="flex flex-wrap gap-2">
                  {ORDER_TYPES.map(ot => (
                    <button key={ot.value} onClick={() => setOrderType(ot.value)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border-2 transition-all ${orderType === ot.value ? 'border-blue-500 ' + ot.color : 'border-transparent ' + ot.color + ' opacity-60'
                      }`}>
                      {ot.label}
                    </button>
                  ))}
                </div>
                <input type="text" placeholder="Order description..." value={orderDesc} onChange={e => setOrderDesc(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                <textarea rows={2} placeholder="Instructions / Notes..." value={orderDetails} onChange={e => setOrderDetails(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none" />
                <div className="flex gap-2">
                  <button onClick={handleSubmitOrder}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2">
                    <Send className="h-4 w-4" /> Submit Order
                  </button>
                  <button onClick={() => setShowAddOrder(false)}
                    className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 transition-colors">
                    Cancel
                  </button>
                </div>
              </div>
            )}
            {localOrders.map(order => (
              <div key={order.id} className={`rounded-xl border p-4 ${order.status === 'active' ? 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800' : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 opacity-70'}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${ORDER_TYPES.find(o => o.value === order.type)?.color}`}>
                        {ORDER_TYPES.find(o => o.value === order.type)?.label}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${order.status === 'active' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'}`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="font-medium text-slate-900 dark:text-white text-sm">{order.description}</p>
                    {order.details && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{order.details}</p>}
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{format(new Date(order.date), 'MMM d, yyyy')}</p>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* ─── Clinical Notes Tab ─── */}
        {activeTab === 'notes' && (
          <motion.div key="notes" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Add Clinical Note</h3>
              <textarea rows={4} value={noteText} onChange={e => setNoteText(e.target.value)}
                placeholder="Assessment, plan, and instructions..."
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none" />
              <div className="mt-3 flex gap-2">
                <button onClick={handleSubmitNote}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2">
                  <Send className="h-4 w-4" /> Save Note
                </button>
              </div>
              {noteSubmitted && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-green-600 dark:text-green-400 mt-2 flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4" /> Note saved successfully!
                </motion.p>
              )}
            </div>
            {clinicalNotes.map(note => (
              <div key={note.id} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{format(new Date(note.date), 'MMMM d, yyyy')}</p>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1">Assessment</p>
                    <p className="text-sm text-slate-800 dark:text-slate-200">{note.assessment}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1">Plan</p>
                    <p className="text-sm text-slate-800 dark:text-slate-200">{note.plan}</p>
                  </div>
                  {note.requestToNurse && (
                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                      <p className="text-xs font-semibold text-purple-800 dark:text-purple-300 mb-1">Request to Nurse:</p>
                      <p className="text-xs text-slate-700 dark:text-slate-300">{note.requestToNurse}</p>
                      {note.nurseResponse && (
                        <div className="mt-2 pl-3 border-l-2 border-purple-300 dark:border-purple-700">
                          <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">Nurse replied:</p>
                          <p className="text-xs text-slate-700 dark:text-slate-300 italic">{note.nurseResponse}</p>
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

      {/* Nurse Assignment Modal */}
      <AnimatePresence>
        {isNurseModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-800"
            >
              <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Assign Nurse</h3>
                <button onClick={() => setIsNurseModalOpen(false)} className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors">
                  <Plus className="h-6 w-6 rotate-45" />
                </button>
              </div>
              <div className="p-4 max-h-[400px] overflow-y-auto space-y-3">
                {MOCK_NURSES.map((nurse) => (
                  <div key={nurse.id} className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 hover:border-blue-500 transition-all group">
                    <div className="flex items-center gap-4">
                      <img src={nurse.avatar} alt={nurse.name} className="h-12 w-12 rounded-full object-cover" />
                      <div className="flex-1">
                        <p className="font-bold text-slate-900 dark:text-white">{nurse.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">RN · 5+ years experience</p>
                      </div>
                      <button
                        onClick={() => handleAssignNurse(nurse.id)}
                        className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors"
                      >
                        Assign
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 flex justify-end">
                <button onClick={() => setIsNurseModalOpen(false)} className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 font-medium hover:text-slate-900 dark:hover:text-white transition-colors">
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
