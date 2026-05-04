import { createBrowserRouter, Outlet } from 'react-router';
import { Landing } from './pages/Home';
import { About } from './pages/About';
import { Features } from './pages/Features';
import { Contact } from './pages/Contact';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { TermsOfService } from './pages/TermsOfService';
import { Register } from './pages/Register';
import { Login } from './pages/Login';
import { LoginForm } from './pages/LoginForm';
import { ForgotPassword } from './pages/ForgotPassword';
import { VerifyEmail } from './pages/VerifyEmail';
import { DashboardLayout } from './components/DashboardLayout';
import { PatientDashboard } from './pages/patient/Dashboard';
import { HealthLog } from './pages/patient/HealthLog';
import { Appointments } from './pages/patient/Appointments';
import { Profile } from './pages/patient/Profile';
import { HospitalFinder } from './pages/patient/HospitalFinder';
import { DoctorSearch } from './pages/patient/DoctorSearch';
import { LabResults } from './pages/patient/LabResults';
import { Messages } from './pages/Messages';
import { ProfessionalDashboard } from './pages/professional/Dashboard';
import { PatientDetail } from './pages/professional/PatientDetail';
import { PatientWorkspace } from './pages/professional/PatientWorkspace';
import { DoctorPatients } from './pages/professional/DoctorPatients';
import { DoctorSchedule } from './pages/professional/DoctorSchedule';
import { DoctorReports } from './pages/professional/DoctorReports';
import { DoctorReviews } from './pages/professional/DoctorReviews';
import { NursePatients } from './pages/professional/NursePatients';
import { NurseRounds } from './pages/professional/NurseRounds';
import { NursePatientCare } from './pages/professional/NursePatientCare';
import { HospitalDashboard } from './pages/hospital/HospitalDashboard';
import { LabManagement } from './pages/hospital/LabManagement';
import { ProceduralOutcomes } from './pages/professional/ProceduralOutcomes';
import { CareHistory } from './pages/patient/CareHistory';
import { Invoice } from './pages/patient/Invoice';
import { Settings } from './pages/professional/Settings';
import { NotFound } from './pages/NotFound';
import { ScrollToTopOnNavigate } from './components/ScrollToTopOnNavigate';

import { AIChatBubble } from './components/AIChatBubble';

function RootLayout() {
  return (
    <>
      <ScrollToTopOnNavigate />
      <Outlet />
      <AIChatBubble />
    </>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    Component: RootLayout,
    errorElement: <NotFound />,
    children: [
      { index: true, Component: Landing },
      { path: 'about', Component: About },
      { path: 'features', Component: Features },
      { path: 'contact', Component: Contact },
      { path: 'privacy', Component: PrivacyPolicy },
      { path: 'terms', Component: TermsOfService },
      { path: 'register', Component: Register },
      { path: 'login', Component: Login },
      { path: 'login/:role', Component: LoginForm },
      { path: 'forgot-password/:role', Component: ForgotPassword },
      { path: 'verify-email', Component: VerifyEmail },

      // ─── Patient ───────────────────────────────────────────────────────────
      {
        path: 'patient',
        element: <DashboardLayout role="patient" />,
        children: [
          { index: true, Component: PatientDashboard },
          { path: 'dashboard', Component: PatientDashboard },
          { path: 'log', Component: HealthLog },
          { path: 'care-history', Component: CareHistory },
          { path: 'appointments', Component: Appointments },
          { path: 'hospitals', Component: HospitalFinder },
          { path: 'doctors', Component: DoctorSearch },
          { path: 'lab-results', Component: LabResults },
          { path: 'profile', Component: Profile },
          { path: 'invoice/:appointmentId', Component: Invoice },
          { path: 'messages', Component: Messages },
        ],
      },

      // ─── Doctor ────────────────────────────────────────────────────────────
      {
        path: 'doctor',
        element: <DashboardLayout role="doctor" />,
        children: [
          { index: true, element: <ProfessionalDashboard role="doctor" /> },
          { path: 'dashboard', element: <ProfessionalDashboard role="doctor" /> },
          { path: 'patients', Component: DoctorPatients },
          { path: 'patient/:id', Component: PatientWorkspace },
          { path: 'procedural-hub', Component: ProceduralOutcomes },
          { path: 'schedule', Component: DoctorSchedule },
          { path: 'reports', Component: DoctorReports },
          { path: 'reviews', Component: DoctorReviews },
          { path: 'messages', Component: Messages },
          { path: 'settings', Component: Settings },
        ],
      },

      // ─── Nurse ─────────────────────────────────────────────────────────────
      {
        path: 'nurse',
        element: <DashboardLayout role="nurse" />,
        children: [
          { index: true, element: <ProfessionalDashboard role="nurse" /> },
          { path: 'dashboard', element: <ProfessionalDashboard role="nurse" /> },
          { path: 'patients', Component: NursePatients },
          { path: 'care', Component: NursePatientCare },
          { path: 'rounds', Component: NurseRounds },
          { path: 'patient/:id', Component: PatientDetail },
          { path: 'messages', Component: Messages },
          { path: 'settings', Component: Settings },
        ],
      },

      // ─── Hospital ──────────────────────────────────────────────────────────
      {
        path: 'hospital',
        element: <DashboardLayout role="hospital" />,
        children: [
          { index: true, Component: HospitalDashboard },
          { path: 'dashboard', Component: HospitalDashboard },
          { path: 'lab', Component: LabManagement },
          { path: 'messages', Component: Messages },
        ],
      },

      { path: '*', Component: NotFound },
    ],
  },
]);
