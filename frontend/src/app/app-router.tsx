import { createBrowserRouter, Outlet, useLocation } from "react-router";
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
import { Messages } from "./pages/Messages";
import { ProfessionalDashboard } from "./pages/professional/Dashboard";
import { PatientDetail } from "./pages/professional/PatientDetail";
import { DoctorPatients } from "./pages/professional/DoctorPatients";
import { DoctorSchedule } from "./pages/professional/DoctorSchedule";
import { DoctorReports } from "./pages/professional/DoctorReports";
import { NursePatients } from "./pages/professional/NursePatients";
import { NurseRounds } from "./pages/professional/NurseRounds";
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
      {
        index: true,
        Component: Landing,
      },
      {
        path: "about",
        Component: About,
      },
      {
        path: "features",
        Component: Features,
      },
      {
        path: "contact",
        Component: Contact,
      },
      {
        path: "privacy",
        Component: PrivacyPolicy,
      },
      {
        path: "terms",
        Component: TermsOfService,
      },
      {
        path: "register",
        Component: Register,
      },
      {
        path: "login",
        Component: Login,
      },
      {
        path: "login/:role",
        Component: LoginForm,
      },
      {
        path: "patient",
        element: <DashboardLayout role="patient" userName={CURRENT_USER_PATIENT.name} />,
        children: [
          { path: "dashboard", Component: PatientDashboard },
          { path: "log", Component: HealthLog },
          { path: "appointments", Component: Appointments },
          { path: "profile", Component: Profile },
          { path: "messages", element: <Messages userRole="patient" userId="p1" /> },
          { index: true, Component: PatientDashboard },
        ],
      },
      {
        path: "doctor",
        element: <DashboardLayout role="doctor" userName={CURRENT_USER_DOCTOR.name} />,
        children: [
          { path: "dashboard", Component: ProfessionalDashboard },
          { path: "patients", Component: DoctorPatients },
          { path: "schedule", Component: DoctorSchedule },
          { path: "reports", Component: DoctorReports },
          { path: "patient/:id", Component: PatientDetail },
          { path: "messages", element: <Messages userRole="professional" userId="d1" /> },
          { index: true, Component: ProfessionalDashboard },
        ],
      },
      {
        path: "nurse",
        element: <DashboardLayout role="nurse" userName="Nurse Anjali" />,
        children: [
          { path: "dashboard", Component: ProfessionalDashboard },
          { path: "patients", Component: NursePatients },
          { path: "rounds", Component: NurseRounds },
          { path: "patient/:id", Component: PatientDetail },
          { path: "messages", element: <Messages userRole="professional" userId="n1" /> },
          { index: true, Component: ProfessionalDashboard },
        ],
      },
      {
        path: "*",
        Component: NotFound,
      },
    ],
  },
]);
