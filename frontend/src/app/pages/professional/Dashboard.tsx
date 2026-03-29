import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router';
import { Clock, ChevronRight, User, Loader2, Calendar, CheckCircle, PlusCircle } from 'lucide-react';
import { Patient } from '../../lib/mockData';
import { toast } from 'sonner';

export function ProfessionalDashboard({ role }: { role?: 'doctor' | 'nurse' }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [pendingPatients, setPendingPatients] = useState<Partial<Patient>[]>([]);
  const [assignedPatients, setAssignedPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const userRole = role || (sessionStorage.getItem('userRole') as 'doctor' | 'nurse') || 'doctor';
  const token = sessionStorage.getItem('token');

  const fetchData = useCallback(async () => {
    if (!token) return;
    try {
      // Fetch assigned patients
      const assignedRes = await fetch(`http://localhost:5000/api/${userRole}/patients`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (assignedRes.ok) {
        const data = await assignedRes.json();
        setAssignedPatients(data);
      }

      // Fetch pending items (only for doctors)
      if (userRole === 'doctor') {
        const pendingRes = await fetch('http://localhost:5000/api/doctor/patients/pending', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (pendingRes.ok) {
          const data = await pendingRes.json();
          setPendingPatients(data);
        }

        // Fetch appointments for approval
        const apptRes = await fetch('http://localhost:5000/api/appointments/my', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (apptRes.ok) {
          const data = await apptRes.json();
          setAppointments(data);
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [token, userRole]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleApprovePatient = async (id: string | number) => {
    try {
      const res = await fetch(`http://localhost:5000/api/doctor/patients/approve/${id}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success('Patient added to your roster');
        fetchData();
      }
    } catch (error) {
      toast.error('Failed to approve');
    }
  };

  const handleConfirmAppointment = async (id: number) => {
    try {
      const res = await fetch(`http://localhost:5000/api/appointments/status/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'confirmed' })
      });
      if (res.ok) {
        toast.success('Appointment confirmed');
        fetchData();
      }
    } catch (error) {
      toast.error('Update failed');
    }
  };

  const handleAddToMyPatients = async (patientId: number, appointmentId: number) => {
    try {
      // Logic to actually set doctor_id for the patient
      // Assuming we can use the approvePatient endpoint or a new one
      const res = await fetch(`http://localhost:5000/api/doctor/patients/approve/${patientId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        // Also mark appointment as completed or update UI
        await fetch(`http://localhost:5000/api/appointments/status/${appointmentId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ status: 'completed', doctor_notes: 'Patient added to my regular list' })
        });
        toast.success('Patient successfully added to your list');
        fetchData();
      }
    } catch (error) {
      toast.error('Action failed');
    }
  };

  const filteredPatients = assignedPatients.filter(patient => {
    const nameMatch = patient.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                      (patient as any).full_name?.toLowerCase().includes(searchQuery.toLowerCase());
    return nameMatch;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
      </div>
    );
  }

  const pendingAppointments = appointments.filter(a => a.status === 'hospital_approved');
  const confirmedAppointments = appointments.filter(a => a.status === 'confirmed');

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Professional Dashboard</h1>

      {/* Appointment Requests Section - DOCTOR ONLY */}
      {userRole === 'doctor' && pendingAppointments.length > 0 && (
        <section className="bg-orange-50/50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-900/30 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-orange-200 dark:border-orange-900/30">
            <h3 className="font-bold text-orange-900 dark:text-orange-400 flex items-center gap-2">
              <Calendar className="h-5 w-5" /> New Appointment Requests
            </h3>
          </div>
          <div className="divide-y divide-orange-100 dark:divide-orange-900/20">
            {pendingAppointments.map(appt => (
              <div key={appt.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">{appt.patient_name}</p>
                  <p className="text-xs text-slate-500">at {appt.hospital_name} - {appt.appointment_time}</p>
                </div>
                <button 
                  onClick={() => handleConfirmAppointment(appt.id)}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-bold transition-all shadow-lg shadow-orange-500/20"
                >
                  Confirm & Schedule
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Confirmed Meetings Section (First Time Meets) - DOCTOR ONLY */}
      {userRole === 'doctor' && confirmedAppointments.length > 0 && (
        <section className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/30 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-blue-200 dark:border-blue-900/30">
            <h3 className="font-bold text-blue-900 dark:text-blue-400 flex items-center gap-2">
              <CheckCircle className="h-5 w-5" /> Today's New Patient Consultations
            </h3>
          </div>
          <div className="divide-y divide-blue-100 dark:divide-blue-900/20">
            {confirmedAppointments.map(appt => (
              <div key={appt.id} className="p-4 flex items-center justify-between bg-white dark:bg-slate-900/50">
                <div className="flex items-center gap-3">
                   <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center text-blue-600">
                     <User className="h-5 w-5" />
                   </div>
                   <div>
                    <p className="font-bold text-slate-900 dark:text-white">{appt.patient_name}</p>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {appt.appointment_time} · First Consultation
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => handleAddToMyPatients(appt.patient_id, appt.id)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
                >
                  <PlusCircle className="h-4 w-4" /> Add to Patient List
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Main Patient List */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold dark:text-white">Active My Patients</h2>
          <div className="flex gap-4">
             <input 
              type="text" 
              placeholder="Search patients..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-4 py-2 rounded-lg border dark:border-slate-700 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-blue-500"
             />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPatients.map(patient => (
            <Link 
              key={patient.id} 
              to={userRole === 'doctor' ? `/doctor/patient/${patient.id}` : `/nurse/patient/${patient.id}`}
              className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                  <User className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                    {(patient as any).full_name || patient.name}
                  </h4>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    patient.condition === 'critical' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {patient.condition}
                  </span>
                </div>
                <ChevronRight className="ml-auto h-5 w-5 text-slate-300" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
