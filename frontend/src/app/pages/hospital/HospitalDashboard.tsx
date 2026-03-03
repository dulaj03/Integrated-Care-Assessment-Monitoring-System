import { useState } from 'react';
import { Calendar, Users, FlaskConical, AlertCircle, CheckCircle2, Clock, Building2, ChevronRight, Activity, TrendingUp } from 'lucide-react';
import { format, isToday } from 'date-fns';
import { motion } from 'motion/react';
import {
  MOCK_HOSPITAL_APPOINTMENTS,
  MOCK_LAB_TESTS,
  MOCK_HOSPITAL_DOCTORS,
  MOCK_HOSPITALS,
  getLabStatusLabel,
  getLabStatusColor,
  getAppointmentStatusColor,
  getDoctorById,
} from '../../lib/hospitalData';
import { MOCK_PATIENTS } from '../../lib/mockData';

export function HospitalDashboard() {
  const hospital = MOCK_HOSPITALS[1]; // Nawaloka Hospital

  const todayAppointments = MOCK_HOSPITAL_APPOINTMENTS.filter(a => isToday(new Date(a.date)));
  const allAppointments = MOCK_HOSPITAL_APPOINTMENTS;


  const getPatientName = (id: string) => MOCK_PATIENTS.find(p => p.id === id)?.name || id;

  const stats = [
    { label: "Today's Appointments", value: todayAppointments.length || 2, icon: Calendar, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Doctors On Roster', value: MOCK_HOSPITAL_DOCTORS.filter(d => d.hospitalId === hospital.id).length, icon: Users, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/20' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-xl bg-blue-600 flex items-center justify-center">
          <Building2 className="h-7 w-7 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{hospital.name}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">{hospital.address} · {hospital.phone}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className={`rounded-xl border border-slate-200 dark:border-slate-700 ${stat.bg} p-5`}>
            <div className="flex items-center justify-between mb-2">
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
            <p className={`text-3xl font-extrabold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Today's Appointments */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-500" /> Today's Appointments
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">{format(new Date(), 'MMMM d, yyyy')}</span>
          </div>
          {allAppointments.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400 py-8 text-center">No appointments today.</p>
          ) : (
            <div className="space-y-3">
              {allAppointments.slice(0, 4).map(appt => {
                const doc = getDoctorById(appt.doctorId);
                return (
                  <div key={appt.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white text-sm">{getPatientName(appt.patientId)}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{doc?.name} · {appt.specialization}</p>
                      <p className="text-xs text-blue-600 dark:text-blue-400">{format(new Date(appt.date), 'MMM d')} · {appt.timeSlot}</p>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${getAppointmentStatusColor(appt.status)}`}>
                      {appt.status.replace('_', ' ')}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>


      </div>

      {/* Doctor Roster */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-500" /> Hospital Doctors
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {MOCK_HOSPITAL_DOCTORS.filter(d => d.hospitalId === hospital.id).map(doc => (
            <div key={doc.id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700">
              <img src={doc.avatar} alt={doc.name} className="h-10 w-10 rounded-full object-cover border border-blue-200 dark:border-blue-700" />
              <div>
                <p className="font-medium text-slate-900 dark:text-white text-sm">{doc.name}</p>
                <p className="text-xs text-blue-600 dark:text-blue-400">{doc.specialization}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{doc.availableDays.join(', ')}</p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-xs text-slate-500 dark:text-slate-400">Fee</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white">LKR {doc.consultationFee.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hospital Patient Directory */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="h-5 w-5 text-emerald-500" /> Patient Directory
          </h3>
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
            {MOCK_PATIENTS.filter(p => p.hospitalId === hospital.id).length} Active Patients
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-900/50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Patient</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Condition</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Assigned Doctor</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
              {MOCK_PATIENTS.filter(p => p.hospitalId === hospital.id).map((patient) => {
                const doc = getDoctorById(patient.assignedDoctorId);
                return (
                  <tr key={patient.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full overflow-hidden mr-3">
                          <img src={patient.avatar} alt="" className="h-full w-full object-cover" />
                        </div>
                        <div className="text-sm font-medium text-slate-900 dark:text-white">{patient.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-500 dark:text-slate-400">{patient.condition}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${patient.status === 'critical' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400' :
                        patient.status === 'monitoring' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400' :
                          'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                        }`}>
                        {patient.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                      {doc?.name}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
