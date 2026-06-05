import { useState, useEffect } from "react";
import { trpc } from "@/providers/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Award,
  FileText,
  Search,
  Download,
  Printer,
  GraduationCap,
  CheckCircle2,
} from "lucide-react";
import { useSearchParams } from "react-router";

export default function DashboardReleves() {
  const sessionsQuery = trpc.session.list.useQuery();
  const [numeroTable, setNumeroTable] = useState("");
  const [idSession, setIdSession] = useState(1);
  const [transcript, setTranscript] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const [searchParams] = useSearchParams();

  // Use tRPC for transcript generation
  const consultQuery = trpc.deliberation.consultResults.useQuery(
    { numeroTable: parseInt(numeroTable) || 0, idSession },
    { enabled: false }
  );

  const handleSearch = async () => {
    if (!numeroTable) return;
    setLoading(true);
    setNotFound(false);
    setTranscript(null);

    try {
      const result = await consultQuery.refetch();
      if (result.data?.found) {
        setTranscript(result.data);
      } else {
        setNotFound(true);
      }
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    window.print();
  };
  useEffect(() => {
    const numero = searchParams.get("numero");
    const session = searchParams.get("session");

    if (numero) {
      setNumeroTable(numero);
    }

    if (session) {
      setIdSession(Number(session));
    }
  }, []);
  useEffect(() => {
    const numero = searchParams.get("numero");

    if (numero) {
      handleSearch();
    }
  }, [numeroTable]);
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="bg-white rounded-xl p-5 border border-[#C4D7C4]/30">
          <h3 className="text-lg font-semibold text-[#202A26] mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#1E8B4C]" />
            Releve de notes
          </h3>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-2">
              <Label>Numero de table</Label>
              <Input
                type="number"
                placeholder="Ex: 1001"
                value={numeroTable}
                onChange={e => setNumeroTable(e.target.value)}
                className="w-48"
              />
            </div>
            <div className="space-y-2">
              <Label>Session</Label>
              <select
                value={idSession}
                onChange={e => setIdSession(Number(e.target.value))}
                className="w-48 h-10 px-3 rounded-md border border-input bg-background text-sm"
              >
                {sessionsQuery.data?.map(s => (
                  <option key={s.idSession} value={s.idSession}>
                    {s.libelleSession}
                  </option>
                ))}
              </select>
            </div>
            <Button
              onClick={handleSearch}
              disabled={loading || !numeroTable}
              className="bg-[#1E8B4C] hover:bg-[#167a3f]"
            >
              <Search className="w-4 h-4 mr-2" />
              {loading ? "Recherche..." : "Rechercher"}
            </Button>
          </div>
        </div>

        {transcript?.found && (
          <div className="bg-white rounded-xl border border-[#C4D7C4]/30 overflow-hidden print:shadow-none">
            {/* Releve Header */}
            <div
              className="px-8 py-6 text-white"
              style={{
                background: "linear-gradient(135deg, #202A26, #1E8B4C)",
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <GraduationCap className="w-10 h-10" />
                  <div>
                    <h2 className="text-2xl font-bold">UniResults</h2>
                    <p className="text-white/70 text-sm">
                      Plateforme de gestion d'examens
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-white/70">Releve de notes</p>
                  <p className="text-lg font-bold">
                    {transcript.session?.libelleSession || "Session 2025"}
                  </p>
                </div>
              </div>
            </div>

            {/* Candidate Info */}
            <div className="px-8 py-6 border-b border-[#C4D7C4]/30">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-xs text-gray-500 uppercase">Nom</p>
                  <p className="font-semibold text-[#202A26]">
                    {transcript.candidate?.nom}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Prenom</p>
                  <p className="font-semibold text-[#202A26]">
                    {transcript.candidate?.prenom}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">
                    Numero de table
                  </p>
                  <p className="font-semibold text-[#202A26]">
                    {transcript.numeroTable}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Centre</p>
                  <p className="font-semibold text-[#202A26]">
                    {transcript.centre}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Serie</p>
                  <p className="font-semibold text-[#202A26]">
                    {transcript.serie?.libelleSerie || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">
                    Date de naissance
                  </p>
                  <p className="font-semibold text-[#202A26]">
                    {transcript.candidate?.dateNaissance
                      ? new Date(
                          transcript.candidate.dateNaissance
                        ).toLocaleDateString("fr-FR")
                      : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Sexe</p>
                  <p className="font-semibold text-[#202A26]">
                    {transcript.candidate?.sexe === "M"
                      ? "Masculin"
                      : "Feminin"}
                  </p>
                </div>
              </div>
            </div>

            {/* Notes Table */}
            <div className="px-8 py-6">
              <h4 className="font-semibold text-[#202A26] mb-4">
                Detail des notes
              </h4>
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-[#202A26]">
                    <th className="text-left py-2 text-sm font-medium text-gray-500">
                      Matiere
                    </th>
                    <th className="text-center py-2 text-sm font-medium text-gray-500">
                      Note
                    </th>
                    <th className="text-center py-2 text-sm font-medium text-gray-500">
                      Coef.
                    </th>
                    <th className="text-center py-2 text-sm font-medium text-gray-500">
                      Total
                    </th>
                    <th className="text-center py-2 text-sm font-medium text-gray-500">
                      Appreciation
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {transcript.notes?.map((note: any, i: number) => (
                    <tr key={i} className="border-b border-gray-100">
                      <td className="py-2.5 text-sm">{note.libelleMatiere}</td>
                      <td className="py-2.5 text-sm text-center font-medium">
                        {note.valeur?.toFixed(2)}
                      </td>
                      <td className="py-2.5 text-sm text-center text-gray-500">
                        x{note.coefficient ?? 1}
                      </td>
                      <td className="py-2.5 text-sm text-center font-medium text-[#1E8B4C]">
                        {((note.valeur ?? 0) * (note.coefficient ?? 1)).toFixed(
                          1
                        )}
                      </td>
                      <td className="py-2.5 text-sm text-center">
                        {note.valeur >= 16
                          ? "Tres Bien"
                          : note.valeur >= 14
                            ? "Bien"
                            : note.valeur >= 12
                              ? "Assez Bien"
                              : note.valeur >= 10
                                ? "Passable"
                                : note.valeur >= 8
                                  ? "Insuffisant"
                                  : "Faible"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Result */}
            <div className="px-8 py-6 bg-[#F6F4DE]/50 border-t border-[#C4D7C4]/30">
              <div className="flex items-center justify-between">
                <div className="grid grid-cols-3 gap-8">
                  <div>
                    <p className="text-xs text-gray-500">Total des points</p>
                    <p className="text-xl font-bold text-[#202A26]">
                      {transcript.notes
                        ?.reduce(
                          (s: number, n: any) =>
                            s + (n.valeur ?? 0) * (n.coefficient ?? 1),
                          0
                        )
                        .toFixed(1)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Total coefficients</p>
                    <p className="text-xl font-bold text-[#202A26]">
                      {transcript.notes?.reduce(
                        (s: number, n: any) => s + (n.coefficient ?? 1),
                        0
                      ) ?? 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Moyenne generale</p>
                    <p className="text-3xl font-bold text-[#1E8B4C]">
                      {transcript.deliberation?.moyenneGenerale?.toFixed(2) ||
                        "--"}
                      <span className="text-lg text-gray-400">/20</span>
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  {transcript.deliberation && (
                    <div
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
                        transcript.deliberation.resultat === "Admis"
                          ? "bg-green-50 text-green-600"
                          : "bg-red-50 text-red-600"
                      }`}
                    >
                      {transcript.deliberation.resultat === "Admis" ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <Award className="w-5 h-5" />
                      )}
                      <span className="font-bold text-lg">
                        {transcript.deliberation.resultat}
                      </span>
                    </div>
                  )}
                  {transcript.deliberation?.mention && (
                    <p className="text-sm text-gray-500 mt-2">
                      Mention:{" "}
                      <strong>{transcript.deliberation.mention}</strong>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="px-8 py-4 border-t border-[#C4D7C4]/30 flex justify-end gap-3 print:hidden">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrint}
                className="border-[#C4D7C4]"
              >
                <Printer className="w-4 h-4 mr-2" />
                Imprimer
              </Button>
              <Button
                type="button"
                className="bg-[#1E8B4C] hover:bg-[#167a3f]"
                onClick={handleDownloadPdf}
              >
                <Download className="w-4 h-4 mr-2" />
                Telecharger PDF
              </Button>
            </div>
          </div>
        )}

        {notFound && (
          <div className="bg-white rounded-xl p-8 text-center border border-[#C4D7C4]/30">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-[#202A26] mb-2">
              Aucun resultat trouve
            </h3>
            <p className="text-gray-500">
              Verifiez votre numero de table et la session selectionnee.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
