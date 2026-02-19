import { createBrowserRouter, Outlet } from "react-router";
import { Landing } from "./pages/Home";
import { About } from "./pages/About";
import { Features } from "./pages/Features";
import { Contact } from "./pages/Contact";
import { Register } from "./pages/Register";
import { Login } from "./pages/Login";
import { DashboardLayout } from "./components/DashboardLayout";
import { PatientDashboard } from "./pages/patient/Dashboard";
import { HealthLog } from "./pages/patient/HealthLog";
import { ProfessionalDashboard } from "./pages/professional/Dashboard";
import { PatientDetail } from "./pages/professional/PatientDetail";
import { NotFound } from "./pages/NotFound";
import { CURRENT_USER_PATIENT, CURRENT_USER_DOCTOR } from "./lib/mockData";

function RootLayout() {
  return <Outlet />;
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
        path: "register",
        Component: Register,
      },
      {
        path: "login",
        Component: Login,
      },
      {
        path: "patient",
        element: <DashboardLayout role="patient" userName={CURRENT_USER_PATIENT.name} />,
        children: [
          { path: "dashboard", Component: PatientDashboard },
          { path: "log", Component: HealthLog },
          { index: true, Component: PatientDashboard },
        ],
      },
      {
        path: "doctor",
        element: <DashboardLayout role="doctor" userName={CURRENT_USER_DOCTOR.name} />,
        children: [
          { path: "dashboard", Component: ProfessionalDashboard },
          { path: "patient/:id", Component: PatientDetail },
          { index: true, Component: ProfessionalDashboard },
        ],
      },
      {
        path: "nurse",
        element: <DashboardLayout role="nurse" userName="Nurse Anjali" />,
        children: [
          { path: "dashboard", Component: ProfessionalDashboard },
          { path: "patient/:id", Component: PatientDetail },
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
