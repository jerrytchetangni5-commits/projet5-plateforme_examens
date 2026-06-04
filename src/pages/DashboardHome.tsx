import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import {
  School,
  Users,
  Calendar,
  Award,
  BookOpen,
  MapPin,
  TrendingUp,
  TrendingDown,
  FileText,
  ClipboardList,
  ShieldCheck,
} from "lucide-react";

export default function DashboardHome() {
  const { isAdmin, isEcole, isSecretaire } = useAuth();
  const statsQuery = trpc.dashboard.stats.useQuery();
  const recentQuery = trpc.dashboard.recentActivity.useQuery();

  const stats = statsQuery.data;

  const statCards = [
    {
      label: "Sessions",
      value: stats?.totalSessions || 0,
      icon: Calendar,
      color: "#4A6D8C",
      bg: "#4A6D8C15",
    },
    {
      label: "Ecoles",
      value: stats?.totalEcoles || 0,
      icon: School,
      color: "#1E8B4C",
      bg: "#1E8B4C15",
    },
    {
      label: "Candidats",
      value: stats?.totalCandidats || 0,
      icon: Users,
      color: "#800020",
      bg: "#80002015",
    },
    {
      label: "Matieres",
      value: stats?.totalMatieres || 0,
      icon: BookOpen,
      color: "#202A26",
      bg: "#202A2615",
    },
    {
      label: "Series",
      value: stats?.totalSeries || 0,
      icon: ClipboardList,
      color: "#4A6D8C",
      bg: "#4A6D8C15",
    },
    {
      label: "Centres",
      value: stats?.totalCentres || 0,
      icon: MapPin,
      color: "#1E8B4C",
      bg: "#1E8B4C15",
    },
  ];

  const delibStats = stats
    ? [
        { label: "Total", value: stats.totalDeliberes, color: "#202A26" },
        { label: "Admis", value: stats.admis, color: "#1E8B4C" },
        { label: "Ajournes", value: stats.ajournes, color: "#E5A800" },
        { label: "Refuses", value: stats.refuses, color: "#800020" },
      ]
    : [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome */}
        <div className="bg-white rounded-xl p-6 border border-[#C4D7C4]/30">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#1E8B4C]/10 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-[#1E8B4C]" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-[#202A26]">
                Bienvenue sur UniResults
              </h2>
              <p className="text-sm text-gray-500">
                {isAdmin
                  ? "Espace d'administration - Gestion complete de la plateforme"
                  : isEcole
                  ? "Espace Ecole - Gestion de vos candidats et resultats"
                  : "Espace Secretaire - Saisie des notes et deliberation"}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {statCards.map((card) => (
            <div
              key={card.label}
              className="bg-white rounded-xl p-4 border border-[#C4D7C4]/30 hover:shadow-md transition-shadow"
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                style={{ backgroundColor: card.bg }}
              >
                <card.icon className="w-5 h-5" style={{ color: card.color }} />
              </div>
              <p className="text-2xl font-bold text-[#202A26]">{card.value}</p>
              <p className="text-xs text-gray-500">{card.label}</p>
            </div>
          ))}
        </div>

        {/* Two columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Deliberation Stats */}
          <div className="bg-white rounded-xl p-6 border border-[#C4D7C4]/30">
            <h3 className="text-lg font-semibold text-[#202A26] mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-[#1E8B4C]" />
              Resultats de la derniere session
            </h3>

            {delibStats.length > 0 ? (
              <>
                <div className="grid grid-cols-4 gap-3 mb-6">
                  {delibStats.map((d) => (
                    <div key={d.label} className="text-center">
                      <p className="text-xl font-bold" style={{ color: d.color }}>
                        {d.value}
                      </p>
                      <p className="text-xs text-gray-500">{d.label}</p>
                    </div>
                  ))}
                </div>

                {/* Visual bar */}
                <div className="h-4 rounded-full overflow-hidden flex">
                  {stats && stats.totalDeliberes > 0 && (
                    <>
                      <div
                        className="h-full bg-[#1E8B4C]"
                        style={{
                          width: `${(stats.admis / stats.totalDeliberes) * 100}%`,
                        }}
                      />
                      <div
                        className="h-full bg-[#E5A800]"
                        style={{
                          width: `${(stats.ajournes / stats.totalDeliberes) * 100}%`,
                        }}
                      />
                      <div
                        className="h-full bg-[#800020]"
                        style={{
                          width: `${(stats.refuses / stats.totalDeliberes) * 100}%`,
                        }}
                      />
                    </>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[#1E8B4C]" />
                    <span className="text-sm text-gray-500">
                      Moyenne generale: <strong>{stats?.avgMoyenne}/20</strong>
                    </span>
                  </div>
                  <span className="text-sm text-[#1E8B4C] font-medium">
                    {stats && stats.totalDeliberes > 0
                      ? `${Math.round(
                          (stats.admis / stats.totalDeliberes) * 100
                        )}% de reussite`
                      : "Pas encore de donnees"}
                  </span>
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-500">
                Aucune deliberation enregistree pour le moment.
              </p>
            )}
          </div>

          {/* Gender Distribution */}
          <div className="bg-white rounded-xl p-6 border border-[#C4D7C4]/30">
            <h3 className="text-lg font-semibold text-[#202A26] mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-[#4A6D8C]" />
              Repartition par genre
            </h3>

            {stats && stats.totalCandidats > 0 ? (
              <>
                <div className="flex items-center justify-center mb-4">
                  <div className="relative w-32 h-32">
                    <svg viewBox="0 0 36 36" className="w-full h-full">
                      <circle
                        cx="18"
                        cy="18"
                        r="15.915"
                        fill="none"
                        stroke="#E5D3B5"
                        strokeWidth="3"
                      />
                      <circle
                        cx="18"
                        cy="18"
                        r="15.915"
                        fill="none"
                        stroke="#4A6D8C"
                        strokeWidth="3"
                        strokeDasharray={`${
                          (stats.hommes / stats.totalCandidats) * 100
                        } ${
                          100 - (stats.hommes / stats.totalCandidats) * 100
                        }`}
                        strokeDashoffset="25"
                        transform="rotate(-90 18 18)"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-lg font-bold text-[#202A26]">
                        {stats.totalCandidats}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex justify-center gap-6">
                  <div className="text-center">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#4A6D8C]" />
                      <span className="text-sm text-gray-500">Garcons</span>
                    </div>
                    <p className="text-lg font-bold text-[#4A6D8C]">
                      {stats.hommes}
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#E5D3B5]" />
                      <span className="text-sm text-gray-500">Filles</span>
                    </div>
                    <p className="text-lg font-bold text-[#E5A800]">
                      {stats.femmes}
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-500">
                Aucun candidat enregistre pour le moment.
              </p>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        {recentQuery.data && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 border border-[#C4D7C4]/30">
              <h3 className="text-lg font-semibold text-[#202A26] mb-4 flex items-center gap-2">
                <School className="w-5 h-5 text-[#1E8B4C]" />
                Ecoles recentes
              </h3>
              {recentQuery.data.recentEcoles.length > 0 ? (
                <div className="space-y-3">
                  {recentQuery.data.recentEcoles.map((ecole) => (
                    <div
                      key={ecole.idEcole}
                      className="flex items-center justify-between p-3 rounded-lg bg-[#F6F4DE]/50"
                    >
                      <div>
                        <p className="font-medium text-sm text-[#202A26]">
                          {ecole.nom}
                        </p>
                        <p className="text-xs text-gray-500">
                          {ecole.departement} - {ecole.type}
                        </p>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          ecole.status === "active"
                            ? "bg-green-50 text-green-600"
                            : "bg-yellow-50 text-yellow-600"
                        }`}
                      >
                        {ecole.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  Aucune ecole enregistree.
                </p>
              )}
            </div>

            <div className="bg-white rounded-xl p-6 border border-[#C4D7C4]/30">
              <h3 className="text-lg font-semibold text-[#202A26] mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-[#800020]" />
                Candidats recents
              </h3>
              {recentQuery.data.recentCandidats.length > 0 ? (
                <div className="space-y-3">
                  {recentQuery.data.recentCandidats.map((c) => (
                    <div
                      key={c.idInscription}
                      className="flex items-center justify-between p-3 rounded-lg bg-[#F6F4DE]/50"
                    >
                      <div>
                        <p className="font-medium text-sm text-[#202A26]">
                          {c.prenom} {c.nom}
                        </p>
                        <p className="text-xs text-gray-500">
                          {c.sexe === "M" ? "Garcon" : "Fille"} - N°{" "}
                          {c.idInscription}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  Aucun candidat enregistre.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
