import { addDays, subDays } from 'date-fns';

export type UserRole = 'patient' | 'nurse' | 'doctor' | 'hospital';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  avatar?: string;
}

export interface HealthLog {
  id: string;
  date: string;
  symptoms: string[];
  notes: string;
  painLevel?: number; // 0-10 scale
  vitals: {
    bloodPressure?: string;
    heartRate?: number;
    temperature?: number;
    oxygenLevel?: number;
    weight?: number;
  };
  mood?: 'great' | 'good' | 'okay' | 'poor' | 'bad';
}

export interface Patient extends User {
  age: number;
  gender: string;
  condition: string;
  status: 'stable' | 'monitoring' | 'critical' | 'recovered' | 'pending_approval' | 'pendingdoctorapproval';
  assignedDoctorId: string;
  assignedNurseId?: string;
  hospitalId: string;
  lastUpdate: string;
  upcomingAppointments: Array<{ id: string, date: string, title: string, location: string }>;
  medications: Array<{ name: string, dosage: string, frequency: string }>;
  logs: HealthLog[];
}

// Mock Hospitals
export interface Hospital {
  id: string;
  name: string;
  address: string;
}

export const MOCK_HOSPITALS: Hospital[] = [
  { id: 'h1', name: 'General Hospital, Colombo', address: 'Colombo 08, Sri Lanka' },
  { id: 'h2', name: 'Nawaloka Hospital', address: 'Colombo 02, Sri Lanka' },
  { id: 'h3', name: 'Lanka Hospitals', address: 'Colombo 05, Sri Lanka' },
];

export interface Doctor extends User {
  hospitalId: string;
}

// Mock Doctors
export const MOCK_DOCTORS: Doctor[] = [
  { id: 'd1', name: 'Dr. Sarah Perera', role: 'doctor', email: 'sarah.perera@icams.lk', hospitalId: 'h1', avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=100&h=100' },
  { id: 'd2', name: 'Dr. Kamal Silva', role: 'doctor', email: 'kamal.silva@icams.lk', hospitalId: 'h1', avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=100&h=100' },
  { id: 'd3', name: 'Dr. Nimal Gunawardena', role: 'doctor', email: 'nimal.g@icams.lk', hospitalId: 'h2', avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=100&h=100' },
];

// Mock Nurses
export const MOCK_NURSES: User[] = [
  { id: 'n1', name: 'Nurse Anjali', role: 'nurse', email: 'anjali@icams.lk', avatar: 'https://images.unsplash.com/photo-1584982751601-97dcc096659c?auto=format&fit=crop&q=80&w=100&h=100' },
];

// Generate some history logs
const generateLogs = (count: number): HealthLog[] => {
  return Array.from({ length: count }).map((_, i) => {
    const date = subDays(new Date(), i);
    const painLevel = Math.floor(Math.random() * 11); // 0-10 scale
    return {
      id: `log-${i}`,
      date: date.toISOString(),
      painLevel,
      symptoms: i % 3 === 0 ? ['Fatigue', 'Mild Headache'] : [],
      notes: i % 5 === 0 ? 'Felt a bit dizzy after lunch.' : 'Feeling okay.',
      vitals: {
        bloodPressure: i % 2 === 0 ? '120/80' : '125/82',
        heartRate: 70 + (i % 10),
        temperature: 36.5 + (i % 5) * 0.1,
        oxygenLevel: 98,
        weight: 65,
      },
      mood: i % 4 === 0 ? 'good' : 'great',
    };
  });
};

// Mock Patients
export const MOCK_PATIENTS: Patient[] = [
  {
    id: 'p1',
    name: 'Nimal Jayasinghe',
    role: 'patient',
    email: 'nimal@gmail.com',
    age: 68,
    gender: 'Male',
    condition: 'Hypertension & Type 2 Diabetes',
    status: 'monitoring',
    assignedDoctorId: 'd1',
    assignedNurseId: 'n1',
    hospitalId: 'h1',
    lastUpdate: subDays(new Date(), 0).toISOString(),
    avatar: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?auto=format&fit=crop&q=80&w=100&h=100',
    upcomingAppointments: [
      { id: 'a1', date: addDays(new Date(), 2).toISOString(), title: 'Regular Checkup', location: 'General Hospital, Colombo' },
    ],
    medications: [
      { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily' },
      { name: 'Losartan', dosage: '50mg', frequency: 'Once daily' },
    ],
    logs: generateLogs(14),
  },
  {
    id: 'p2',
    name: 'Kusum Perera',
    role: 'patient',
    email: 'kusum@gmail.com',
    age: 54,
    gender: 'Female',
    condition: 'Post-Surgery Recovery',
    status: 'stable',
    assignedDoctorId: 'd1',
    hospitalId: 'h1',
    lastUpdate: subDays(new Date(), 1).toISOString(),
    avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&q=80&w=100&h=100',
    upcomingAppointments: [],
    medications: [
      { name: 'Paracetamol', dosage: '500mg', frequency: 'As needed' },
    ],
    logs: generateLogs(7),
  },
  {
    id: 'p3',
    name: 'Ravi De Silva',
    role: 'patient',
    email: 'ravi@gmail.com',
    age: 72,
    gender: 'Male',
    condition: 'COPD',
    status: 'critical',
    assignedDoctorId: 'd2',
    hospitalId: 'h1',
    lastUpdate: subDays(new Date(), 0).toISOString(), // Updated today
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100&h=100',
    upcomingAppointments: [
      { id: 'a2', date: addDays(new Date(), 1).toISOString(), title: 'Urgent Assessment', location: 'Nawaloka Hospital' },
    ],
    medications: [
      { name: 'Salbutamol Inhaler', dosage: '100mcg', frequency: 'As needed' },
    ],
    logs: generateLogs(30).map((log, i) => {
      // Make this patient look critical
      if (i < 3) {
        return {
          ...log,
          painLevel: 8 + Math.floor(Math.random() * 3), // 8-10 (High Risk)
          vitals: { ...log.vitals, oxygenLevel: 88 + i, heartRate: 110 - i },
          symptoms: ['Shortness of breath', 'Chest tightness'],
          mood: 'bad'
        };
      }
      return log;
    }),
  }
];

export const MOCK_PENDING_PATIENTS: Partial<Patient>[] = [
  {
    id: 'p-pending-1',
    name: 'Saman Kumara',
    email: 'saman@gmail.com',
    condition: 'Chest Pain',
    status: 'pending_approval',
    assignedDoctorId: 'd1',
    hospitalId: 'h1',
    lastUpdate: new Date().toISOString(),
  },
  {
    id: 'p-pending-2',
    name: 'Anula Devi',
    email: 'anula@gmail.com',
    condition: 'Severe Migraine',
    status: 'pending_approval',
    assignedDoctorId: 'd1',
    hospitalId: 'h1',
    lastUpdate: new Date().toISOString(),
  }
];

export const CURRENT_USER_PATIENT = MOCK_PATIENTS[0]; // Logged in as Nimal
export const CURRENT_USER_DOCTOR = MOCK_DOCTORS[0]; // Logged in as Dr. Sarah
