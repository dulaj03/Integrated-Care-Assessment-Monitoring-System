import { addDays, subDays, subHours, subMinutes } from 'date-fns';

// ─── Types ────────────────────────────────────────────────────────────────────

export type AppointmentStatus = 'requested' | 'confirmed' | 'in_progress' | 'completed' | 'follow_up_needed' | 'cancelled';
export type LabTestStatus = 'ordered' | 'processing' | 'ready' | 'reviewed';
export type OrderType = 'lab_test' | 'scan' | 'medication' | 'referral' | 'physiotherapy';

export interface Hospital {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  type: 'government' | 'private';
  specializations: string[];
  rating: number; // out of 5
  imageUrl?: string;
}

export interface HospitalDoctor {
  id: string;
  name: string;
  specialization: string;
  hospitalId: string;
  qualifications: string;
  experience: number; // years
  availableDays: string[];
  consultationFee: number; // LKR
  avatar?: string;
}

export interface HospitalAppointment {
  id: string;
  patientId: string;
  doctorId: string;
  hospitalId: string;
  specialization: string;
  date: string;
  timeSlot: string;
  status: AppointmentStatus;
  reason: string;
  notes?: string;
  doctorOrderIds?: string[]; // orders placed after visit
}

export interface LabTestStep {
  step: string;
  completedAt?: string;
  note?: string;
}

export interface LabTest {
  id: string;
  patientId: string;
  hospitalId: string;
  orderedByDoctorId: string;
  testName: string;
  testType: 'blood' | 'urine' | 'scan' | 'xray' | 'ecg' | 'mri' | 'biopsy';
  status: LabTestStatus;
  orderedDate: string;
  scheduledDate?: string;
  completedDate?: string;
  result?: {
    summary: string;
    values?: Array<{ name: string; value: string; unit: string; normalRange: string; flag?: 'normal' | 'high' | 'low' | 'critical' }>;
    reportUrl?: string;
    reviewNote?: string; // doctor's note after reviewing
  };
  steps: LabTestStep[];
  priority: 'routine' | 'urgent' | 'stat';
}

export interface ClinicalOrder {
  id: string;
  patientId: string;
  orderedByDoctorId: string;
  type: OrderType;
  description: string;
  details: string;
  date: string;
  status: 'active' | 'completed' | 'cancelled';
  linkedLabTestId?: string;
}

export interface Prescription {
  id: string;
  patientId: string;
  prescribedByDoctorId: string;
  date: string;
  medications: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions?: string;
  }>;
  notes?: string;
}

export interface NurseSymptomLog {
  id: string;
  patientId: string;
  nurseId: string;
  date: string;
  symptoms: string[];
  painLevel: number; // 0-10
  vitals: {
    bloodPressure?: string;
    heartRate?: number;
    temperature?: number;
    oxygenLevel?: number;
    weight?: number;
    respiratoryRate?: number;
  };
  mood: 'great' | 'good' | 'okay' | 'poor' | 'bad';
  notes: string;
  flaggedForDoctor: boolean;
  doctorResponse?: string;
}

export interface DoctorClinicalNote {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  assessment: string;
  plan: string;
  requestToNurse?: string; // doctor asks nurse something
  nurseResponse?: string;
}

export interface NurseReport {
  id: string;
  patientId: string;
  nurseId: string;
  date: string;
  title: string;
  steps: Array<{
    title: string;
    description: string;
    completed: boolean;
    timestamp?: string;
  }>;
  summary: string;
  recommendations: string;
  vitalsSnapshot?: {
    bp?: string;
    hr?: number;
    temp?: number;
    spo2?: number;
  };
  status: 'draft' | 'completed';
}

// ─── Sri Lankan Hospitals ─────────────────────────────────────────────────────

export const MOCK_HOSPITALS: Hospital[] = [
  {
    id: 'h1',
    name: 'National Hospital of Sri Lanka',
    address: 'Regent Street, Colombo 10',
    city: 'Colombo',
    phone: '+94 11 269 1111',
    type: 'government',
    specializations: ['Cardiology', 'Neurology', 'Oncology', 'Nephrology', 'Orthopedics', 'General Medicine'],
    rating: 4.2,
    imageUrl: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'h2',
    name: 'Nawaloka Hospital',
    address: '23 Deshamanya H.K. Dharmadasa Mawatha, Colombo 2',
    city: 'Colombo',
    phone: '+94 11 254 4444',
    type: 'private',
    specializations: ['Cardiology', 'Diabetology', 'Endocrinology', 'Pulmonology', 'Gastroenterology'],
    rating: 4.7,
    imageUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'h3',
    name: 'Lanka Hospital',
    address: '578 Elvitigala Mawatha, Colombo 5',
    city: 'Colombo',
    phone: '+94 11 553 0000',
    type: 'private',
    specializations: ['Orthopedics', 'Neurology', 'Pediatrics', 'Gynecology', 'Dermatology'],
    rating: 4.5,
    imageUrl: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'h4',
    name: 'Teaching Hospital Kandy',
    address: 'Kandy Road, Kandy',
    city: 'Kandy',
    phone: '+94 81 222 2261',
    type: 'government',
    specializations: ['General Medicine', 'Surgery', 'Psychiatry', 'Ophthalmology', 'ENT'],
    rating: 4.0,
    imageUrl: 'https://images.unsplash.com/photo-1551190822-a9333d879b1f?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'h5',
    name: 'Durdans Hospital',
    address: '3 Alfred Place, Colombo 3',
    city: 'Colombo',
    phone: '+94 11 257 5171',
    type: 'private',
    specializations: ['Cardiology', 'Oncology', 'Diabetology', 'Nephrology', 'Rheumatology'],
    rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1581594549595-35f6edc7b762?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'h6',
    name: 'Teaching Hospital Karapitiya',
    address: 'Karapitiya, Galle',
    city: 'Galle',
    phone: '+94 91 222 2261',
    type: 'government',
    specializations: ['General Medicine', 'Surgery', 'Pediatrics', 'Gynecology', 'Orthopedics'],
    rating: 3.9,
    imageUrl: 'https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?auto=format&fit=crop&w=400&q=80',
  },
];

// ─── Hospital Doctors ─────────────────────────────────────────────────────────

export const MOCK_HOSPITAL_DOCTORS: HospitalDoctor[] = [
  {
    id: 'hd1',
    name: 'Dr. Sarah Perera',
    specialization: 'Diabetology',
    hospitalId: 'h2',
    qualifications: 'MBBS, MD (Internal Medicine), MRCP',
    experience: 14,
    availableDays: ['Monday', 'Wednesday', 'Friday'],
    consultationFee: 2500,
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=100&h=100',
  },
  {
    id: 'hd2',
    name: 'Dr. Kamal Silva',
    specialization: 'Pulmonology',
    hospitalId: 'h2',
    qualifications: 'MBBS, MD (Respiratory Medicine)',
    experience: 11,
    availableDays: ['Tuesday', 'Thursday', 'Saturday'],
    consultationFee: 2000,
    avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=100&h=100',
  },
  {
    id: 'hd3',
    name: 'Dr. Amaya Wijesinghe',
    specialization: 'Cardiology',
    hospitalId: 'h1',
    qualifications: 'MBBS, MD, FRCP (Cardiology)',
    experience: 18,
    availableDays: ['Monday', 'Tuesday', 'Thursday'],
    consultationFee: 3500,
    avatar: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=100&h=100',
  },
  {
    id: 'hd4',
    name: 'Dr. Roshan Fernando',
    specialization: 'Endocrinology',
    hospitalId: 'h5',
    qualifications: 'MBBS, MD, PhD (Endocrinology)',
    experience: 20,
    availableDays: ['Wednesday', 'Friday'],
    consultationFee: 4000,
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=100&h=100',
  },
  {
    id: 'hd5',
    name: 'Dr. Niluka Rathnayaka',
    specialization: 'Nephrology',
    hospitalId: 'h1',
    qualifications: 'MBBS, MD, MRCP (Nephrology)',
    experience: 9,
    availableDays: ['Monday', 'Wednesday', 'Friday'],
    consultationFee: 2800,
    avatar: 'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?auto=format&fit=crop&q=80&w=100&h=100',
  },
];

// ─── Mock Hospital Appointments ───────────────────────────────────────────────

export const MOCK_HOSPITAL_APPOINTMENTS: HospitalAppointment[] = [
  {
    id: 'ha1',
    patientId: 'p1',
    doctorId: 'hd1',
    hospitalId: 'h2',
    specialization: 'Diabetology',
    date: subDays(new Date(), 5).toISOString(),
    timeSlot: '10:00 AM',
    status: 'completed',
    reason: 'Routine diabetes follow-up and blood pressure review',
    notes: 'HbA1c slightly elevated. Ordered FBS and HbA1c repeat in 3 months. Adjusted Metformin dosage.',
    doctorOrderIds: ['co1', 'co2'],
  },
  {
    id: 'ha2',
    patientId: 'p1',
    doctorId: 'hd1',
    hospitalId: 'h2',
    specialization: 'Diabetology',
    date: addDays(new Date(), 7).toISOString(),
    timeSlot: '09:30 AM',
    status: 'confirmed',
    reason: 'Follow-up after lab results',
  },
  {
    id: 'ha3',
    patientId: 'p3',
    doctorId: 'hd2',
    hospitalId: 'h2',
    specialization: 'Pulmonology',
    date: addDays(new Date(), 1).toISOString(),
    timeSlot: '11:00 AM',
    status: 'confirmed',
    reason: 'Urgent COPD assessment — oxygen saturation concerns',
  },
];

// ─── Lab Tests ────────────────────────────────────────────────────────────────

export const MOCK_LAB_TESTS: LabTest[] = [
  {
    id: 'lt1',
    patientId: 'p1',
    hospitalId: 'h2',
    orderedByDoctorId: 'hd1',
    testName: 'Fasting Blood Sugar (FBS)',
    testType: 'blood',
    status: 'ready',
    orderedDate: subDays(new Date(), 5).toISOString(),
    scheduledDate: subDays(new Date(), 3).toISOString(),
    completedDate: subDays(new Date(), 2).toISOString(),
    priority: 'routine',
    result: {
      summary: 'FBS mildly elevated. Consistent with poorly controlled Type 2 Diabetes.',
      values: [
        { name: 'Fasting Blood Sugar', value: '148', unit: 'mg/dL', normalRange: '70-100', flag: 'high' },
        { name: 'HbA1c', value: '7.8', unit: '%', normalRange: '< 5.7', flag: 'high' },
        { name: 'Total Cholesterol', value: '195', unit: 'mg/dL', normalRange: '< 200', flag: 'normal' },
        { name: 'LDL', value: '118', unit: 'mg/dL', normalRange: '< 100', flag: 'high' },
        { name: 'HDL', value: '48', unit: 'mg/dL', normalRange: '> 40', flag: 'normal' },
      ],
      reviewNote: 'FBS and HbA1c elevated. Consider increasing Metformin to 1000mg. Book follow-up in 3 months.',
    },
    steps: [
      { step: 'Test ordered by Dr. Sarah Perera', completedAt: subDays(new Date(), 5).toISOString() },
      { step: 'Sample collection appointment scheduled — Nawaloka Hospital Lab', completedAt: subDays(new Date(), 4).toISOString() },
      { step: 'Blood sample collected by lab technician', completedAt: subDays(new Date(), 3).toISOString() },
      { step: 'Sample processing in laboratory', completedAt: subDays(new Date(), 2).toISOString(), note: 'Automated analyzer + manual review' },
      { step: 'Results reviewed and released', completedAt: subDays(new Date(), 2).toISOString() },
    ],
  },
  {
    id: 'lt2',
    patientId: 'p1',
    hospitalId: 'h2',
    orderedByDoctorId: 'hd1',
    testName: 'Kidney Function Test (KFT)',
    testType: 'blood',
    status: 'processing',
    orderedDate: subDays(new Date(), 2).toISOString(),
    scheduledDate: subDays(new Date(), 1).toISOString(),
    priority: 'routine',
    steps: [
      { step: 'Test ordered by Dr. Sarah Perera', completedAt: subDays(new Date(), 2).toISOString() },
      { step: 'Sample collection appointment scheduled', completedAt: subDays(new Date(), 2).toISOString() },
      { step: 'Blood sample collected', completedAt: subDays(new Date(), 1).toISOString() },
      { step: 'Processing in laboratory', completedAt: subHours(new Date(), 3).toISOString(), note: 'Expected completion: Today by 5 PM' },
    ],
  },
  {
    id: 'lt3',
    patientId: 'p1',
    hospitalId: 'h2',
    orderedByDoctorId: 'hd1',
    testName: 'ECG (Electrocardiogram)',
    testType: 'ecg',
    status: 'ordered',
    orderedDate: subDays(new Date(), 1).toISOString(),
    scheduledDate: addDays(new Date(), 2).toISOString(),
    priority: 'routine',
    steps: [
      { step: 'ECG ordered by Dr. Sarah Perera', completedAt: subDays(new Date(), 1).toISOString() },
      { step: 'Appointment scheduled — 2 days from today at 9:00 AM', completedAt: subDays(new Date(), 1).toISOString() },
    ],
  },
  {
    id: 'lt4',
    patientId: 'p3',
    hospitalId: 'h2',
    orderedByDoctorId: 'hd2',
    testName: 'Arterial Blood Gas (ABG)',
    testType: 'blood',
    status: 'ordered',
    orderedDate: new Date().toISOString(),
    priority: 'urgent',
    steps: [
      { step: 'Urgent ABG ordered by Dr. Kamal Silva', completedAt: new Date().toISOString() },
    ],
  },
];

// ─── Clinical Orders ──────────────────────────────────────────────────────────

export const MOCK_CLINICAL_ORDERS: ClinicalOrder[] = [
  {
    id: 'co1',
    patientId: 'p1',
    orderedByDoctorId: 'hd1',
    type: 'lab_test',
    description: 'Fasting Blood Sugar + HbA1c + Lipid Profile',
    details: 'Fasting required for 8 hours. Morning sample preferred.',
    date: subDays(new Date(), 5).toISOString(),
    status: 'completed',
    linkedLabTestId: 'lt1',
  },
  {
    id: 'co2',
    patientId: 'p1',
    orderedByDoctorId: 'hd1',
    type: 'medication',
    description: 'Increase Metformin to 1000mg — Twice Daily',
    details: 'Stop 500mg. Start 1000mg from tomorrow morning. Take with meals. Watch for GI side effects.',
    date: subDays(new Date(), 5).toISOString(),
    status: 'active',
  },
  {
    id: 'co3',
    patientId: 'p1',
    orderedByDoctorId: 'hd1',
    type: 'lab_test',
    description: 'Kidney Function Test (KFT) + Urine Full Report',
    details: 'Routine monitoring of renal function in diabetic patient.',
    date: subDays(new Date(), 2).toISOString(),
    status: 'active',
    linkedLabTestId: 'lt2',
  },
  {
    id: 'co4',
    patientId: 'p1',
    orderedByDoctorId: 'hd1',
    type: 'scan',
    description: 'ECG — Cardiac Baseline',
    details: 'Baseline ECG to rule out cardiac involvement in hypertension.',
    date: subDays(new Date(), 1).toISOString(),
    status: 'active',
    linkedLabTestId: 'lt3',
  },
];

// ─── Prescriptions ────────────────────────────────────────────────────────────

export const MOCK_PRESCRIPTIONS: Prescription[] = [
  {
    id: 'rx1',
    patientId: 'p1',
    prescribedByDoctorId: 'hd1',
    date: subDays(new Date(), 5).toISOString(),
    medications: [
      { name: 'Metformin', dosage: '1000mg', frequency: 'Twice daily', duration: '3 months', instructions: 'Take with meals' },
      { name: 'Losartan', dosage: '50mg', frequency: 'Once daily', duration: 'Ongoing', instructions: 'Take in the morning' },
      { name: 'Atorvastatin', dosage: '20mg', frequency: 'Once daily at night', duration: '3 months', instructions: 'Take at bedtime' },
    ],
    notes: 'Strict diabetic diet advised. Reduce salt intake. 30 minutes walking daily.',
  },
];

// ─── Nurse Symptom Logs ───────────────────────────────────────────────────────

export const MOCK_NURSE_LOGS: NurseSymptomLog[] = [
  {
    id: 'nl1',
    patientId: 'p1',
    nurseId: 'n1',
    date: subHours(new Date(), 2).toISOString(),
    symptoms: ['Mild headache', 'Slight fatigue'],
    painLevel: 3,
    vitals: {
      bloodPressure: '138/88',
      heartRate: 80,
      temperature: 37.0,
      oxygenLevel: 97,
      weight: 65.2,
      respiratoryRate: 16,
    },
    mood: 'okay',
    notes: 'Patient complained of mild headache since morning. BP slightly elevated today. Patient had salty food last night.',
    flaggedForDoctor: true,
    doctorResponse: 'Continue monitoring BP. If it exceeds 145/95, notify me immediately. Patient to reduce salt. Check at next round.',
  },
  {
    id: 'nl2',
    patientId: 'p1',
    nurseId: 'n1',
    date: subDays(new Date(), 1).toISOString(),
    symptoms: [],
    painLevel: 1,
    vitals: {
      bloodPressure: '128/82',
      heartRate: 72,
      temperature: 36.7,
      oxygenLevel: 98,
      weight: 65.0,
    },
    mood: 'good',
    notes: 'Patient feeling well today. Took all medications on time. Mild walk in the morning reported.',
    flaggedForDoctor: false,
  },
  {
    id: 'nl3',
    patientId: 'p3',
    nurseId: 'n1',
    date: subMinutes(new Date(), 30).toISOString(),
    symptoms: ['Shortness of breath', 'Chest tightness', 'Cough'],
    painLevel: 7,
    vitals: {
      bloodPressure: '148/94',
      heartRate: 108,
      temperature: 37.9,
      oxygenLevel: 86,
      respiratoryRate: 24,
    },
    mood: 'bad',
    notes: 'Patient in significant respiratory distress. SpO2 critically low at 86%. Administered oxygen. Urgently needs doctor review.',
    flaggedForDoctor: true,
  },
];

// ─── Doctor Clinical Notes ────────────────────────────────────────────────────

export const MOCK_CLINICAL_NOTES: DoctorClinicalNote[] = [
  {
    id: 'dcn1',
    patientId: 'p1',
    doctorId: 'hd1',
    date: subDays(new Date(), 5).toISOString(),
    assessment: 'T2DM poorly controlled. BP mildly elevated. Lipid profile needs attention.',
    plan: 'Increase Metformin to 1000mg BD. Add Atorvastatin 20mg. Repeat HbA1c in 3 months. KFT follow-up.',
    requestToNurse: 'Please check BP daily and flag if systolic >145. Remind patient to take evening Atorvastatin.',
    nurseResponse: 'Noted. Will check BP every morning round and report. Patient reminded about evening medication.',
  },
  {
    id: 'dcn2',
    patientId: 'p1',
    doctorId: 'hd1',
    date: subDays(new Date(), 1).toISOString(),
    assessment: 'BP normalising with current regimen. FBS results reviewed — HbA1c 7.8%, target <7%.',
    plan: 'Continue current medications. Dietary counselling reinforced. Follow-up appointment in 7 days.',
    requestToNurse: 'Any headaches or dizziness reported today?',
    nurseResponse: 'Yes — patient reported mild headache this morning. BP was 138/88 at morning round.',
  },
];

// ─── Nurse Reports ────────────────────────────────────────────────────────────

export const MOCK_NURSE_REPORTS: NurseReport[] = [
  {
    id: 'nr1',
    patientId: 'p1',
    nurseId: 'n1',
    date: subHours(new Date(), 4).toISOString(),
    title: 'Daily Care Review - Morning Shift',
    steps: [
      { title: 'Morning Vitals Check', description: 'Recorded BP, HR, and Temp', completed: true, timestamp: subHours(new Date(), 5).toISOString() },
      { title: 'Medication Administration', description: 'Administered morning Metformin and Losartan', completed: true, timestamp: subHours(new Date(), 4.5).toISOString() },
      { title: 'Wound Dressing', description: 'N/A for this patient', completed: true },
      { title: 'Dietary Compliance', description: 'Consumed low-salt breakfast as per plan', completed: true, timestamp: subHours(new Date(), 4).toISOString() },
    ],
    summary: 'Patient is stable and responsive. Following the new medication regimen well.',
    recommendations: 'Continue monitoring BP due to slight elevation at 9 AM. Ensure patient drinks enough water.',
    vitalsSnapshot: {
      bp: '138/88',
      hr: 80,
      temp: 37.0,
      spo2: 97,
    },
    status: 'completed',
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const getLabStatusLabel = (status: LabTestStatus): string => {
  const labels: Record<LabTestStatus, string> = {
    ordered: 'Ordered',
    processing: 'Processing',
    ready: 'Results Ready',
    reviewed: 'Reviewed by Doctor',
  };
  return labels[status];
};

export const getLabStatusColor = (status: LabTestStatus): string => {
  const colors: Record<LabTestStatus, string> = {
    ordered: 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300',
    processing: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
    ready: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    reviewed: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
  };
  return colors[status];
};

export const getAppointmentStatusColor = (status: AppointmentStatus): string => {
  const colors: Record<AppointmentStatus, string> = {
    requested: 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300',
    confirmed: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    in_progress: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
    completed: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    follow_up_needed: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
    cancelled: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
  };
  return colors[status];
};

export const LAB_STATUS_STEPS: LabTestStatus[] = [
  'ordered', 'processing', 'ready', 'reviewed',
];

export const getHospitalById = (id: string) => MOCK_HOSPITALS.find(h => h.id === id);
export const getDoctorById = (id: string) => MOCK_HOSPITAL_DOCTORS.find(d => d.id === id);
export const getPatientLabTests = (patientId: string) => MOCK_LAB_TESTS.filter(t => t.patientId === patientId);
export const getPatientOrders = (patientId: string) => MOCK_CLINICAL_ORDERS.filter(o => o.patientId === patientId);
export const getPatientAppointments = (patientId: string) => MOCK_HOSPITAL_APPOINTMENTS.filter(a => a.patientId === patientId);
export const getPatientNurseLogs = (patientId: string) => MOCK_NURSE_LOGS.filter(l => l.patientId === patientId);
export const getPatientClinicalNotes = (patientId: string) => MOCK_CLINICAL_NOTES.filter(n => n.patientId === patientId);
export const getPatientNurseReports = (patientId: string) => MOCK_NURSE_REPORTS.filter(r => r.patientId === patientId);
export const getDoctorsByHospital = (hospitalId: string) => MOCK_HOSPITAL_DOCTORS.filter(d => d.hospitalId === hospitalId);
