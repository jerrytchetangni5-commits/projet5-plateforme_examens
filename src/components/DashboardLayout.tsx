import { Link, useLocation, useNavigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Calendar,
  School,
  Users,
  BookOpen,
  FileText,
  ClipboardList,
  Award,
  MapPin,
  LogOut,
  GraduationCap,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";

const adminNavItems = [
  { icon: LayoutDashboard, label: "Tableau de bord", path: "/dashboard" },
  { icon: Calendar, label: "Sessions", path: "/dashboard/sessions" },
  { icon: School, label: "Ecoles", path: "/dashboard/ecoles" },
  { icon: Users, label: "Candidats", path: "/dashboard/candidats" },
  { icon: BookOpen, label: "Series & Matieres", path: "/dashboard/series" },
  { icon: FileText, label: "Notes", path: "/dashboard/notes" },
  { icon: ClipboardList, label: "Deliberation", path: "/dashboard/deliberation" },
  { icon: MapPin, label: "Convocations", path: "/dashboard/convocations" },
  { icon: Award, label: "Releves", path: "/dashboard/releves" },
];

const ecoleNavItems = [
  { icon: LayoutDashboard, label: "Mon espace", path: "/dashboard" },
  { icon: Users, label: "Mes candidats", path: "/dashboard/candidats" },
  { icon: FileText, label: "Notes", path: "/dashboard/notes" },
  { icon: ClipboardList, label: "Deliberation", path: "/dashboard/deliberation" },
  { icon: Award, label: "Releves", path: "/dashboard/releves" },
];

const secretaireNavItems = [
  { icon: LayoutDashboard, label: "Tableau de bord", path: "/dashboard" },
  { icon: FileText, label: "Saisie des notes", path: "/dashboard/notes" },
  { icon: MapPin, label: "Centres d'examen", path: "/dashboard/convocations" },
  { icon: ClipboardList, label: "Deliberation", path: "/dashboard/deliberation" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, isAdmin, isEcole, isSecretaire } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  let navItems = adminNavItems;
  if (isEcole) navItems = ecoleNavItems;
  if (isSecretaire) navItems = secretaireNavItems;

  return (
    <div className="min-h-screen flex bg-[#C4D7C4]/20">
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full bg-[#202A26] text-white transition-all duration-300 z-50 ${
          collapsed ? "w-16" : "w-64"
        }`}
      >
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#1E8B4C] flex items-center justify-center shrink-0">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            {!collapsed && (
              <div>
                <h1 className="font-bold text-lg leading-tight">UniResults</h1>
                <p className="text-[10px] text-white/50 uppercase tracking-wider">
                  {isAdmin ? "Administration" : isEcole ? "Espace Ecole" : "Espace Secretaire"}
                </p>
              </div>
            )}
          </div>
        </div>

        <nav className="p-2 space-y-1 mt-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative ${
                  isActive
                    ? "bg-[#1E8B4C] text-white"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                {!collapsed && <span className="text-sm">{item.label}</span>}
                {isActive && !collapsed && (
                  <ChevronRight className="w-4 h-4 ml-auto" />
                )}
                {collapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-[#202A26] rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                    {item.label}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          {!collapsed && (
            <div className="mb-3 px-3 py-2 rounded-lg bg-white/5">
              <p className="text-xs text-white/50">Connecte en tant que</p>
              <p className="text-sm font-medium truncate">
                {user?.nom || user?.username || user?.email}
              </p>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="w-full text-white/60 hover:text-white hover:bg-white/5 justify-start gap-2"
          >
            <LogOut className="w-4 h-4" />
            {!collapsed && <span className="text-sm">Deconnexion</span>}
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main
        className={`flex-1 transition-all duration-300 ${
          collapsed ? "ml-16" : "ml-64"
        }`}
      >
        {/* Header */}
        <header className="bg-white border-b border-[#C4D7C4] px-6 py-4 flex items-center justify-between sticky top-0 z-40">
          <div>
            <h2 className="text-lg font-semibold text-[#202A26]">
              {navItems.find((n) => n.path === location.pathname)?.label || "Tableau de bord"}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/")}
              className="text-xs border-[#C4D7C4] hover:bg-[#C4D7C4]/20"
            >
              Voir le site
            </Button>
            <div className="w-8 h-8 rounded-full bg-[#1E8B4C] flex items-center justify-center text-white text-xs font-bold">
              {(user?.nom || user?.username || "U")[0].toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
