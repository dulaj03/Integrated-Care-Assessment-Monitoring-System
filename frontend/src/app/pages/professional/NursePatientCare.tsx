import { useState } from 'react';
import {
  Users, AlertCircle, CheckCircle2, Clock, Heart, Thermometer, Droplet, Activity,
  Send, ArrowLeft, ClipboardList, MessageSquare, Plus, AlertTriangle, User
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
} from '../../lib/hospitalData';

type NurseTab = 'patients' | 'log_symptoms' | 'doctor_orders' | 'care_notes';

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
    { key: 'doctor_orders', label: `Doctor Orders (${doctorOrders.filter(o => o.status === 'active').length})`, icon: Activity },
    { key: 'care_notes', label: 'Care Notes', icon: MessageSquare },
  ];

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
