import { useState } from "react";
import { trpc } from "@/providers/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { FileText, Save, Search } from "lucide-react";

export default function DashboardNotes() {
  const { isSecretaire } = useAuth();
  const utils = trpc.useUtils();
  const sessionsQuery = trpc.session.list.useQuery();
  const centresQuery = trpc.convocation.listCentres.useQuery();
  const matieresQuery = trpc.matiere.list.useQuery();

  const [selectedSession, setSelectedSession] = useState(1);
  const [selectedCentre, setSelectedCentre] = useState("");
  const [editingNotes, setEditingNotes] = useState<Record<string, number>>({});

  const notesByCentreQuery = trpc.notes.getByCentre.useQuery(
    { centre: selectedCentre, idSession: selectedSession },
    { enabled: !!selectedCentre }
  );

  const bulkMutation = trpc.notes.bulkCreate.useMutation({
    onSuccess: () => {
      utils.notes.getByCentre.invalidate();
      alert("Notes sauvegardees !");
    },
  });

  const handleNoteChange = (
    idInscription: number,
    idMatiere: number,
    value: number
  ) => {
    setEditingNotes(prev => ({
      ...prev,
      [`${idInscription}-${idMatiere}`]: value,
    }));
  };

  const handleSave = () => {
    const notesToSave = Object.entries(editingNotes).map(([key, valeur]) => {
      const [idInscription, idMatiere] = key.split("-").map(Number);
      return { idInscription, idSession: selectedSession, idMatiere, valeur };
    });
    if (notesToSave.length > 0) {
      bulkMutation.mutate(notesToSave);
    }
  };

  // Get all unique matieres from the data
  const allMatieres = new Set<number>();
  notesByCentreQuery.data?.forEach(c => {
    c.notes.forEach(n => allMatieres.add(n.idMatiere));
  });

  const matiereList = Array.from(allMatieres)
    .map(id => matieresQuery.data?.find(m => m.idMatiere === id))
    .filter(Boolean);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="bg-white rounded-xl p-5 border border-[#C4D7C4]/30">
          <h3 className="text-lg font-semibold text-[#202A26] mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#1E8B4C]" />
            {isSecretaire ? "Saisie des notes par centre" : "Gestion des notes"}
          </h3>

          <div className="flex flex-wrap gap-4">
            <div className="space-y-2">
              <Label>Session</Label>
              <select
                value={selectedSession}
                onChange={e => setSelectedSession(Number(e.target.value))}
                className="w-48 h-10 px-3 rounded-md border border-input bg-background text-sm"
              >
                {sessionsQuery.data?.map(s => (
                  <option key={s.idSession} value={s.idSession}>
                    {s.libelleSession}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label>Centre d'examen</Label>
              <select
                value={selectedCentre}
                onChange={e => setSelectedCentre(e.target.value)}
                className="w-56 h-10 px-3 rounded-md border border-input bg-background text-sm"
              >
                <option value="">Choisir un centre...</option>
                {centresQuery.data?.map(c => (
                  <option key={c.idCentre} value={c.nom}>
                    {c.nom}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {notesByCentreQuery.data && notesByCentreQuery.data.length > 0 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500">
                {notesByCentreQuery.data.length} candidat(s) trouve(s)
              </p>
              {isSecretaire && (
                <Button
                  onClick={handleSave}
                  className="bg-[#1E8B4C] hover:bg-[#167a3f]"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Sauvegarder les notes
                </Button>
              )}
            </div>

            <div className="bg-white rounded-xl border border-[#C4D7C4]/30 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#C4D7C4]/30 bg-[#F6F4DE]/50">
                    <th className="text-left px-3 py-3 font-medium text-gray-500 sticky left-0 bg-[#F6F4DE]/50">
                      N° Table
                    </th>
                    <th className="text-left px-3 py-3 font-medium text-gray-500 sticky left-20 bg-[#F6F4DE]/50">
                      Candidat
                    </th>
                    {matiereList.map(m => (
                      <th
                        key={m!.idMatiere}
                        className="text-center px-3 py-3 font-medium text-gray-500 min-w-[80px]"
                      >
                        {m!.code || m!.libelleMatiere}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {notesByCentreQuery.data.map(c => (
                    <tr
                      key={c.candidate.idInscription}
                      className="border-b border-gray-50 hover:bg-[#F6F4DE]/30"
                    >
                      <td className="px-3 py-2 font-mono sticky left-0 bg-white">
                        {c.numeroTable}
                      </td>
                      <td className="px-3 py-2 font-medium sticky left-20 bg-white">
                        {c.candidate.prenom} {c.candidate.nom}
                      </td>
                      {matiereList.map(m => {
                        const existingNote = c.notes.find(
                          n => n.idMatiere === m!.idMatiere
                        );
                        const key = `${c.candidate.idInscription}-${m!.idMatiere}`;
                        const value =
                          editingNotes[key] !== undefined
                            ? editingNotes[key]
                            : existingNote?.valeur;

                        return (
                          <td key={m!.idMatiere} className="px-3 py-2">
                            <Input
                              type="number"
                              min={0}
                              max={20}
                              step={0.5}
                              value={value || ""}
                              onChange={e =>
                                handleNoteChange(
                                  c.candidate.idInscription,
                                  m!.idMatiere,
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              className="w-16 h-8 text-center p-1 text-sm"
                            />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {selectedCentre &&
          notesByCentreQuery.data &&
          notesByCentreQuery.data.length === 0 && (
            <div className="bg-white rounded-xl p-8 text-center border border-[#C4D7C4]/30">
              <p className="text-gray-500">
                Aucun candidat trouve pour ce centre.
              </p>
            </div>
          )}
      </div>
    </DashboardLayout>
  );
}
