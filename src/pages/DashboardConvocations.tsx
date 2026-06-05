import { useState } from "react";
import { trpc } from "@/providers/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import {
  Dialog,
  DialogContent,
  
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MapPin, Plus, Printer, Building2, Users } from "lucide-react";

export default function DashboardConvocations() {
  const { isAdmin } = useAuth();
  const utils = trpc.useUtils();
  const centresQuery = trpc.convocation.listCentres.useQuery();
  const sessionsQuery = trpc.session.list.useQuery();
  /*const candidatsQuery = trpc.candidat.list.useQuery();*/

  const [open, setOpen] = useState(false);
  const [centreForm, setCentreForm] = useState({
    nom: "",
    ville: "",
    departement: "",
    capacite: 0,
  });

  const createCentreMutation = trpc.convocation.createCentre.useMutation({
    onSuccess: () => {
      utils.convocation.listCentres.invalidate();
      setOpen(false);
    },
  });

  const generateMutation = trpc.convocation.generateTableNumbers.useMutation({
    onSuccess: () => {
      alert("Numeros de table generes !");
    },
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Generate table numbers */}
        <div className="bg-white rounded-xl p-5 border border-[#C4D7C4]/30">
          <h3 className="text-lg font-semibold text-[#202A26] mb-4 flex items-center gap-2">
            <Printer className="w-5 h-5 text-[#1E8B4C]" />
            Generation des convocations
          </h3>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-2">
              <Label>Session</Label>
              <select className="w-48 h-10 px-3 rounded-md border border-input bg-background text-sm">
                {sessionsQuery.data?.map(s => (
                  <option key={s.idSession} value={s.idSession}>
                    {s.libelleSession}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Centre d'affectation</Label>
              <select
                id="gen-centre"
                className="w-56 h-10 px-3 rounded-md border border-input bg-background text-sm"
              >
                {centresQuery.data?.map(c => (
                  <option key={c.idCentre} value={c.nom}>
                    {c.nom}
                  </option>
                ))}
              </select>
            </div>
            <Button
              onClick={() => {
                const centreEl = document.getElementById(
                  "gen-centre"
                ) as HTMLSelectElement;
                if (centreEl?.value) {
                  generateMutation.mutate({
                    idSession: 1,
                    centre: centreEl.value,
                  });
                }
              }}
              className="bg-[#1E8B4C] hover:bg-[#167a3f]"
            >
              <Users className="w-4 h-4 mr-2" />
              Generer les numeros de table
            </Button>
          </div>
        </div>

        {/* Centres list */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-[#202A26] flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#4A6D8C]" />
              Centres d'examen
            </h3>
            {isAdmin && (
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-[#1E8B4C] hover:bg-[#167a3f]" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Nouveau centre</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label>Nom *</Label>
                      <Input
                        value={centreForm.nom}
                        onChange={e =>
                          setCentreForm({ ...centreForm, nom: e.target.value })
                        }
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Ville</Label>
                        <Input
                          value={centreForm.ville}
                          onChange={e =>
                            setCentreForm({
                              ...centreForm,
                              ville: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Departement</Label>
                        <Input
                          value={centreForm.departement}
                          onChange={e =>
                            setCentreForm({
                              ...centreForm,
                              departement: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Capacite</Label>
                      <Input
                        type="number"
                        value={centreForm.capacite}
                        onChange={e =>
                          setCentreForm({
                            ...centreForm,
                            capacite: parseInt(e.target.value) || 0,
                          })
                        }
                      />
                    </div>
                    <Button
                      onClick={() => createCentreMutation.mutate(centreForm)}
                      className="w-full bg-[#1E8B4C] hover:bg-[#167a3f]"
                    >
                      Creer
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {centresQuery.data?.map(centre => (
              <div
                key={centre.idCentre}
                className="bg-white rounded-xl p-5 border border-[#C4D7C4]/30 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-[#4A6D8C]/10 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-[#4A6D8C]" />
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-600">
                    Cap: {centre.capacite}
                  </span>
                </div>
                <h4 className="font-semibold text-[#202A26] mb-1">
                  {centre.nom}
                </h4>
                <p className="text-sm text-gray-500">
                  {centre.ville}, {centre.departement}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
