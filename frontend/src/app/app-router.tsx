import { createBrowserRouter, Outlet } from "react-router";
import { Landing } from "./pages/Home";
import { About } from "./pages/About";
import { Features } from "./pages/Features";
import { Contact } from "./pages/Contact";
import { PrivacyPolicy } from "./pages/PrivacyPolicy";
import { TermsOfService } from "./pages/TermsOfService";
import { Register } from "./pages/Register";
import { Login } from "./pages/Login";
import { LoginForm } from "./pages/LoginForm";
import { DashboardLayout } from "./components/DashboardLayout";
import { PatientDashboard } from "./pages/patient/Dashboard";
import { HealthLog } from "./pages/patient/HealthLog";
import { Appointments } from "./pages/patient/Appointments";
import { Profile } from "./pages/patient/Profile";
import { HospitalFinder } from "./pages/patient/HospitalFinder";
import { LabResults } from "./pages/patient/LabResults";
import { Messages } from "./pages/Messages";
import { ProfessionalDashboard } from "./pages/professional/Dashboard";
import { PatientDetail } from "./pages/professional/PatientDetail";
import { PatientWorkspace } from "./pages/professional/PatientWorkspace";
import { DoctorPatients } from "./pages/professional/DoctorPatients";
import { DoctorSchedule } from "./pages/professional/DoctorSchedule";
import { DoctorReports } from "./pages/professional/DoctorReports";
import { NursePatients } from "./pages/professional/NursePatients";
import { NurseRounds } from "./pages/professional/NurseRounds";
import { NursePatientCare } from "./pages/professional/NursePatientCare";
import { HospitalDashboard } from "./pages/hospital/HospitalDashboard";
import { LabManagement } from "./pages/hospital/LabManagement";
import { NotFound } from "./pages/NotFound";
import { ScrollToTopOnNavigate } from "./components/ScrollToTopOnNavigate";
import { CURRENT_USER_PATIENT, CURRENT_USER_DOCTOR } from "./lib/mockData";

function RootLayout() {
  return (
    <>
      <ScrollToTopOnNavigate />
      <Outlet />
    </>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    errorElement: <NotFound />,
    children: [
      { index: true, Component: Landing },
      { path: "about", Component: About },
      { path: "features", Component: Features },
      { path: "contact", Component: Contact },
      { path: "privacy", Component: PrivacyPolicy },
      { path: "terms", Component: TermsOfService },
      { path: "register", Component: Register },
      { path: "login", Component: Login },
      { path: "login/:role", Component: LoginForm },

      // ─── Patient ───────────────────────────────────────────────────────────
      {
        path: "patient",
        element: <DashboardLayout role="patient" userName={CURRENT_USER_PATIENT.name} />,
        children: [
          { index: true, Component: PatientDashboard },
          { path: "dashboard", Component: PatientDashboard },
          { path: "log", Component: HealthLog },
          { path: "appointments", Component: Appointments },
          { path: "hospitals", Component: HospitalFinder },
          { path: "lab-results", Component: LabResults },
          { path: "profile", Component: Profile },
          { path: "messages", element: <Messages userRole="patient" userId="p1" /> },
        ],
      },

      // ─── Doctor ────────────────────────────────────────────────────────────
      {
        path: "doctor",
        element: <DashboardLayout role="doctor" userName={CURRENT_USER_DOCTOR.name} />,
        children: [
          { index: true, element: <ProfessionalDashboard role="doctor" /> },
          { path: "dashboard", element: <ProfessionalDashboard role="doctor" /> },
          { path: "patients", Component: DoctorPatients },
          { path: "patient/:id", Component: PatientWorkspace },
          { path: "schedule", Component: DoctorSchedule },
          { path: "reports", Component: DoctorReports },
          { path: "messages", element: <Messages userRole="professional" userId="d1" /> },
        ],
      },

      // ─── Nurse ─────────────────────────────────────────────────────────────
      {
        path: "nurse",
        element: <DashboardLayout role="nurse" userName="Nurse Anjali" />,
        children: [
          { index: true, element: <ProfessionalDashboard role="nurse" /> },
          { path: "dashboard", element: <ProfessionalDashboard role="nurse" /> },
          { path: "patients", Component: NursePatients },
          { path: "care", Component: NursePatientCare },
          { path: "rounds", Component: NurseRounds },
          { path: "patient/:id", Component: PatientDetail },
          { path: "messages", element: <Messages userRole="professional" userId="n1" /> },
        ],
      },

      // ─── Hospital ──────────────────────────────────────────────────────────
      {
        path: "hospital",
        element: <DashboardLayout role="hospital" userName="Nawaloka Hospital" />,
        children: [
          { index: true, Component: HospitalDashboard },
          { path: "dashboard", Component: HospitalDashboard },
          { path: "lab", Component: LabManagement },
          { path: "messages", element: <Messages userRole="professional" userId="h1" /> },
        ],
      },

      { path: "*", Component: NotFound },
    ],
  },
]);
