import { useState } from "react";
import { trpc } from "@/providers/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Award,
  Play,
  BarChart3,
  TrendingUp,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from "lucide-react";

export default function DashboardDeliberation() {
  const utils = trpc.useUtils();
  const sessionsQuery = trpc.session.list.useQuery();
  const [selectedSession, setSelectedSession] = useState(1);

  const statsQuery = trpc.deliberation.getStats.useQuery({
    idSession: selectedSession,
  });
  const resultsQuery = trpc.deliberation.listBySession.useQuery({
    idSession: selectedSession,
  });
  const runMutation = trpc.deliberation.runSessionDeliberation.useMutation({
    onSuccess: () => {
      utils.deliberation.getStats.invalidate();
      utils.deliberation.listBySession.invalidate();
    },
  });

  const candidatesQuery = trpc.candidat.list.useQuery();
  const ecolesQuery = trpc.ecole.list.useQuery();

  const stats = statsQuery.data;
  const delibs = resultsQuery.data || [];

  const getResultIcon = (resultat: string) => {
    if (resultat === "Admis")
      return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    if (resultat === "Ajourne")
      return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    return <XCircle className="w-4 h-4 text-red-500" />;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-[#202A26]">
            Deliberation des resultats
          </h2>
          <div className="flex gap-3">
            <select
              value={selectedSession}
              onChange={e => setSelectedSession(Number(e.target.value))}
              className="h-10 px-3 rounded-md border border-input bg-background text-sm"
            >
              {sessionsQuery.data?.map(s => (
                <option key={s.idSession} value={s.idSession}>
                  {s.libelleSession}
                </option>
              ))}
            </select>
            <Button
              onClick={() => runMutation.mutate({ idSession: selectedSession })}
              disabled={runMutation.isPending}
              className="bg-[#1E8B4C] hover:bg-[#167a3f]"
            >
              <Play className="w-4 h-4 mr-2" />
              {runMutation.isPending ? "En cours..." : "Lancer la deliberation"}
            </Button>
          </div>
        </div>

        {/* Stats */}
        {stats && stats.total > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-5 border border-[#C4D7C4]/30 text-center">
              <p className="text-3xl font-bold text-[#202A26]">{stats.total}</p>
              <p className="text-xs text-gray-500">Deliberes</p>
            </div>
            <div className="bg-white rounded-xl p-5 border border-green-100 text-center">
              <p className="text-3xl font-bold text-green-600">{stats.admis}</p>
              <p className="text-xs text-gray-500">Admis</p>
            </div>
            <div className="bg-white rounded-xl p-5 border border-yellow-100 text-center">
              <p className="text-3xl font-bold text-yellow-600">
                {stats.ajournes}
              </p>
              <p className="text-xs text-gray-500">Ajournes</p>
            </div>
            <div className="bg-white rounded-xl p-5 border border-red-100 text-center">
              <p className="text-3xl font-bold text-red-600">{stats.refuses}</p>
              <p className="text-xs text-gray-500">Refuses</p>
            </div>
          </div>
        )}

        {/* Progress bar */}
        {stats && stats.total > 0 && (
          <div className="bg-white rounded-xl p-5 border border-[#C4D7C4]/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Taux de reussite</span>
              <span className="text-lg font-bold text-[#1E8B4C]">
                {Math.round((stats.admis / stats.total) * 100)}%
              </span>
            </div>
            <div className="h-3 rounded-full overflow-hidden flex bg-gray-100">
              <div
                className="h-full bg-[#1E8B4C]"
                style={{ width: `${(stats.admis / stats.total) * 100}%` }}
              />
              <div
                className="h-full bg-yellow-400"
                style={{ width: `${(stats.ajournes / stats.total) * 100}%` }}
              />
              <div
                className="h-full bg-red-500"
                style={{ width: `${(stats.refuses / stats.total) * 100}%` }}
              />
            </div>
            <div className="flex gap-4 mt-2 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-[#1E8B4C]" />
                Admis
              </span>
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-yellow-400" />
                Ajournes
              </span>
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                Refuses
              </span>
            </div>
          </div>
        )}

        {/* Results table */}
        <div className="bg-white rounded-xl border border-[#C4D7C4]/30 overflow-hidden">
          <div className="px-4 py-3 bg-[#F6F4DE]/50 border-b border-[#C4D7C4]/30 flex items-center gap-2">
            <Award className="w-5 h-5 text-[#1E8B4C]" />
            <h3 className="font-semibold text-[#202A26]">
              Liste des resultats
            </h3>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#C4D7C4]/30">
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">
                  N°
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">
                  Candidat
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">
                  Ecole
                </th>
                <th className="text-center px-4 py-3 text-sm font-medium text-gray-500">
                  Moyenne
                </th>
                <th className="text-center px-4 py-3 text-sm font-medium text-gray-500">
                  Mention
                </th>
                <th className="text-center px-4 py-3 text-sm font-medium text-gray-500">
                  Resultat
                </th>
              </tr>
            </thead>
            <tbody>
              {delibs.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    Aucune deliberation. Cliquez sur "Lancer la deliberation"
                    pour calculer les resultats.
                  </td>
                </tr>
              )}
              {delibs.map(d => {
                const candidate = candidatesQuery.data?.find(
                  c => c.idInscription === d.idInscription
                );
                const school = candidate
                  ? ecolesQuery.data?.find(e => e.idEcole === candidate.idEcole)
                  : undefined;
                return (
                  <tr
                    key={`${d.idInscription}-${d.idSession}`}
                    className="border-b border-gray-50 hover:bg-[#F6F4DE]/30"
                  >
                    <td className="px-4 py-3 text-sm">{d.idInscription}</td>
                    <td className="px-4 py-3 text-sm font-medium">
                      {candidate
                        ? `${candidate.prenom} ${candidate.nom}`
                        : `#${d.idInscription}`}
                    </td>
                    <td className="px-4 py-3 text-sm">{school?.nom || "-"}</td>
                    <td className="px-4 py-3 text-sm text-center font-bold">
                      {d.moyenneGenerale?.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-sm text-center">
                      {d.mention}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                          d.resultat === "Admis"
                            ? "bg-green-50 text-green-600"
                            : d.resultat === "Ajourne"
                              ? "bg-yellow-50 text-yellow-600"
                              : "bg-red-50 text-red-600"
                        }`}
                      >
                        {getResultIcon(d.resultat)}
                        {d.resultat}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
