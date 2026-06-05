import { useState } from "react";
import { trpc } from "@/providers/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Plus, Trash2 } from "lucide-react";

export default function DashboardSeries() {
  const utils = trpc.useUtils();
  const seriesQuery = trpc.serie.list.useQuery();
  const matieresQuery = trpc.matiere.list.useQuery();
  const createSerieMutation = trpc.serie.create.useMutation({
    onSuccess: () => utils.serie.list.invalidate(),
  });
  const createMatiereMutation = trpc.matiere.create.useMutation({
    onSuccess: () => utils.matiere.list.invalidate(),
  });
  const deleteSerieMutation = trpc.serie.delete.useMutation({
    onSuccess: () => {
      utils.serie.list.invalidate();
    },
  });
  const assignMutation = trpc.serieMatiere.assign.useMutation({
    onSuccess: () => {
      utils.serieMatiere.listBySerie.invalidate({
        idSerie: assignForm.idSerie,
      });
    },
  });

  const [serieForm, setSerieForm] = useState({
    libelleSerie: "",
    typeExamen: "BAC",
    description: "",
  });
  const [openSerieDialog, setOpenSerieDialog] = useState(false);
  const [matiereForm, setMatiereForm] = useState({
    libelleMatiere: "",
    code: "",
  });
  const [selectedSerie, setSelectedSerie] = useState<number | null>(null);
  const [assignForm, setAssignForm] = useState({
    idSerie: 0,
    idMatiere: 0,
    coefficient: 1,
  });

  const serieMatieresQuery = trpc.serieMatiere.listBySerie.useQuery(
    { idSerie: selectedSerie || 0 },
    { enabled: !!selectedSerie }
  );

  const examTypes = ["CEP", "BEPC", "CAP", "BAC"];

  return (
    <DashboardLayout>
      <Tabs defaultValue="series">
        <TabsList className="mb-6 bg-white border border-[#C4D7C4]/30">
          <TabsTrigger value="series">Series</TabsTrigger>
          <TabsTrigger value="matieres">Matieres</TabsTrigger>
          <TabsTrigger value="coefficients">Coefficients</TabsTrigger>
        </TabsList>

        <TabsContent value="series" className="space-y-6">
          <div className="flex justify-between">
            <h3 className="text-lg font-semibold text-[#202A26]">
              Liste des series
            </h3>
            <Dialog open={openSerieDialog} onOpenChange={setOpenSerieDialog}>
              <DialogTrigger asChild>
                <Button className="bg-[#1E8B4C] hover:bg-[#167a3f]" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nouvelle serie</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Libelle</Label>
                    <Input
                      value={serieForm.libelleSerie}
                      onChange={e =>
                        setSerieForm({
                          ...serieForm,
                          libelleSerie: e.target.value,
                        })
                      }
                      placeholder="Ex: BAC C"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Type d'examen</Label>
                    <select
                      value={serieForm.typeExamen}
                      onChange={e =>
                        setSerieForm({
                          ...serieForm,
                          typeExamen: e.target.value,
                        })
                      }
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                    >
                      {examTypes.map(t => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Input
                      value={serieForm.description}
                      onChange={e =>
                        setSerieForm({
                          ...serieForm,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>
                  <Button
                    onClick={async () => {
                      try {
                        const res =
                          await createSerieMutation.mutateAsync(serieForm);
                        setSerieForm({
                          libelleSerie: "",
                          typeExamen: "BAC",
                          description: "",
                        });
                        setOpenSerieDialog(false);
                        toast.success("Série créée");
                        if (res?.id) setSelectedSerie(Number(res.id));
                        await utils.serie.list.invalidate();
                      } catch (err: any) {
                        const msg =
                          err?.message ||
                          err?.data?.message ||
                          "Erreur lors de la création";
                        toast.error(msg);
                      }
                    }}
                    className="w-full bg-[#1E8B4C] hover:bg-[#167a3f]"
                  >
                    Creer
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {seriesQuery.data?.map(s => (
              <div
                key={s.idSerie}
                className={`p-5 rounded-xl border transition-all cursor-pointer ${selectedSerie === s.idSerie ? "border-[#1E8B4C] bg-[#1E8B4C]/5" : "border-[#C4D7C4]/30 bg-white hover:shadow-md"}`}
                onClick={() => setSelectedSerie(s.idSerie)}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#4A6D8C]/10 flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-[#4A6D8C]" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#202A26]">
                        {s.libelleSerie}
                      </h4>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[#C4D7C4]/30 text-[#202A26]">
                        {s.typeExamen}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={async e => {
                      e.stopPropagation();
                      if (!window.confirm("Supprimer cette série ?")) return;
                      try {
                        await deleteSerieMutation.mutateAsync({
                          id: s.idSerie,
                        });
                        toast.success("Série supprimée");
                        if (selectedSerie === s.idSerie) setSelectedSerie(null);
                      } catch (err: any) {
                        toast.error(
                          err?.message || "Erreur lors de la suppression"
                        );
                      }
                    }}
                    className="text-red-500 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-sm text-gray-500">{s.description}</p>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="matieres" className="space-y-6">
          <div className="flex justify-between">
            <h3 className="text-lg font-semibold text-[#202A26]">
              Liste des matieres
            </h3>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-[#1E8B4C] hover:bg-[#167a3f]" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nouvelle matiere</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Libelle</Label>
                    <Input
                      value={matiereForm.libelleMatiere}
                      onChange={e =>
                        setMatiereForm({
                          ...matiereForm,
                          libelleMatiere: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Code</Label>
                    <Input
                      value={matiereForm.code}
                      onChange={e =>
                        setMatiereForm({ ...matiereForm, code: e.target.value })
                      }
                      placeholder="MATH"
                    />
                  </div>
                  <Button
                    onClick={async () => {
                      try {
                        await createMatiereMutation.mutateAsync(matiereForm);
                        setMatiereForm({ libelleMatiere: "", code: "" });
                        toast.success("Matière créée");
                      } catch (err: any) {
                        const msg =
                          err?.message ||
                          err?.data?.message ||
                          "Erreur lors de la création";
                        toast.error(msg);
                      }
                    }}
                    className="w-full bg-[#1E8B4C] hover:bg-[#167a3f]"
                  >
                    Creer
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="bg-white rounded-xl border border-[#C4D7C4]/30 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#C4D7C4]/30 bg-[#F6F4DE]/50">
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">
                    ID
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">
                    Code
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">
                    Libelle
                  </th>
                </tr>
              </thead>
              <tbody>
                {matieresQuery.data?.map(m => (
                  <tr
                    key={m.idMatiere}
                    className="border-b border-gray-50 hover:bg-[#F6F4DE]/30"
                  >
                    <td className="px-4 py-3 text-sm">{m.idMatiere}</td>
                    <td className="px-4 py-3 text-sm font-mono">{m.code}</td>
                    <td className="px-4 py-3 text-sm">{m.libelleMatiere}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="coefficients" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-[#202A26]">
              Gestion des coefficients
            </h3>
            <div className="flex gap-2">
              <select
                value={assignForm.idSerie}
                onChange={e =>
                  setAssignForm({
                    ...assignForm,
                    idSerie: Number(e.target.value),
                  })
                }
                className="h-10 px-3 rounded-md border border-input bg-background text-sm"
              >
                <option value={0}>Choisir serie...</option>
                {seriesQuery.data?.map(s => (
                  <option key={s.idSerie} value={s.idSerie}>
                    {s.libelleSerie}
                  </option>
                ))}
              </select>
              <select
                value={assignForm.idMatiere}
                onChange={e =>
                  setAssignForm({
                    ...assignForm,
                    idMatiere: Number(e.target.value),
                  })
                }
                className="h-10 px-3 rounded-md border border-input bg-background text-sm"
              >
                <option value={0}>Choisir matiere...</option>
                {matieresQuery.data?.map(m => (
                  <option key={m.idMatiere} value={m.idMatiere}>
                    {m.libelleMatiere}
                  </option>
                ))}
              </select>
              <Input
                type="number"
                min={1}
                max={20}
                value={assignForm.coefficient}
                onChange={e =>
                  setAssignForm({
                    ...assignForm,
                    coefficient: Number(e.target.value),
                  })
                }
                className="w-20"
              />
              <Button
                onClick={() => assignMutation.mutate(assignForm)}
                className="bg-[#1E8B4C] hover:bg-[#167a3f]"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {selectedSerie && (
            <div className="bg-white rounded-xl border border-[#C4D7C4]/30 overflow-hidden">
              <div className="px-4 py-3 bg-[#F6F4DE]/50 border-b border-[#C4D7C4]/30">
                <h4 className="font-medium text-[#202A26]">
                  Coefficients -{" "}
                  {
                    seriesQuery.data?.find(s => s.idSerie === selectedSerie)
                      ?.libelleSerie
                  }
                </h4>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#C4D7C4]/30">
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">
                      Matiere
                    </th>
                    <th className="text-center px-4 py-3 text-sm font-medium text-gray-500">
                      Coefficient
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {serieMatieresQuery.data?.map((sm, i) => {
                    const mat = matieresQuery.data?.find(
                      m => m.idMatiere === sm.idMatiere
                    );
                    return (
                      <tr key={i} className="border-b border-gray-50">
                        <td className="px-4 py-3 text-sm">
                          {mat?.libelleMatiere || `Matiere #${sm.idMatiere}`}
                        </td>
                        <td className="px-4 py-3 text-sm text-center font-medium text-[#1E8B4C]">
                          {sm.coefficient}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
