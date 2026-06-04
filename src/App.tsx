import { Routes, Route, Navigate } from "react-router";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import DashboardHome from "./pages/DashboardHome";
import DashboardSessions from "./pages/DashboardSessions";
import DashboardEcoles from "./pages/DashboardEcoles";
import DashboardCandidats from "./pages/DashboardCandidats";
import DashboardSeries from "./pages/DashboardSeries";
import DashboardNotes from "./pages/DashboardNotes";
import DashboardDeliberation from "./pages/DashboardDeliberation";
import DashboardConvocations from "./pages/DashboardConvocations";
import DashboardReleves from "./pages/DashboardReleves";
import { useAuth } from "./hooks/useAuth";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#C4D7C4]/20">
        <div className="animate-spin w-8 h-8 border-3 border-[#1E8B4C] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardHome />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/sessions"
        element={
          <ProtectedRoute>
            <DashboardSessions />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/ecoles"
        element={
          <ProtectedRoute>
            <DashboardEcoles />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/candidats"
        element={
          <ProtectedRoute>
            <DashboardCandidats />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/series"
        element={
          <ProtectedRoute>
            <DashboardSeries />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/notes"
        element={
          <ProtectedRoute>
            <DashboardNotes />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/deliberation"
        element={
          <ProtectedRoute>
            <DashboardDeliberation />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/convocations"
        element={
          <ProtectedRoute>
            <DashboardConvocations />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/releves"
        element={
          <ProtectedRoute>
            <DashboardReleves />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
