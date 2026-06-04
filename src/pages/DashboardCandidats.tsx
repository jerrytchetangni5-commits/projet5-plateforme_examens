import { useState } from "react";
import { trpc } from "@/providers/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Users, Plus, Trash2, Search, User } from "lucide-react";

export default function DashboardCandidats() {
  const utils = trpc.useUtils();
  const candidatsQuery = trpc.candidat.list.useQuery();
  const ecolesQuery = trpc.ecole.list.useQuery();
  const seriesQuery = trpc.serie.list.useQuery();
  const createMutation = trpc.candidat.create.useMutation({
    onSuccess: () => utils.candidat.list.invalidate(),
  });
  const deleteMutation = trpc.candidat.delete.useMutation({
    onSuccess: () => utils.candidat.list.invalidate(),
  });

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    sexe: "M",
    dateNaissance: "",
    idSerie: 0,
    idEcole: 0,
  });

  const handleCreate = async () => {
    await createMutation.mutateAsync(form);
    setOpen(false);
    setForm({ nom: "", prenom: "", sexe: "M", dateNaissance: "", idSerie: 0, idEcole: 0 });
  };

  const filtered = search
    ? candidatsQuery.data?.filter((c) =>
        `${c.nom} ${c.prenom}`.toLowerCase().includes(search.toLowerCase())
      )
    : candidatsQuery.data;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 max-w-md relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Rechercher un candidat..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#1E8B4C] hover:bg-[#167a3f]">
                <Plus className="w-4 h-4 mr-2" />
                Ajouter
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Ajouter un candidat</DialogTitle></DialogHeader>
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="space-y-2"><Label>Nom *</Label><Input value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} /></div>
                <div className="space-y-2"><Label>Prenom *</Label><Input value={form.prenom} onChange={(e) => setForm({ ...form, prenom: e.target.value })} /></div>
                <div className="space-y-2"><Label>Sexe</Label>
                  <select value={form.sexe} onChange={(e) => setForm({ ...form, sexe: e.target.value })} className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm">
                    <option value="M">Masculin</option>
                    <option value="F">Feminin</option>
                  </select>
                </div>
                <div className="space-y-2"><Label>Date de naissance</Label><Input type="date" value={form.dateNaissance} onChange={(e) => setForm({ ...form, dateNaissance: e.target.value })} /></div>
                <div className="space-y-2"><Label>Serie</Label>
                  <select value={form.idSerie} onChange={(e) => setForm({ ...form, idSerie: Number(e.target.value) })} className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm">
                    <option value={0}>Choisir...</option>
                    {seriesQuery.data?.map((s) => <option key={s.idSerie} value={s.idSerie}>{s.libelleSerie}</option>)}
                  </select>
                </div>
                <div className="space-y-2"><Label>Ecole</Label>
                  <select value={form.idEcole} onChange={(e) => setForm({ ...form, idEcole: Number(e.target.value) })} className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm">
                    <option value={0}>Choisir...</option>
                    {ecolesQuery.data?.map((e) => <option key={e.idEcole} value={e.idEcole}>{e.nom}</option>)}
                  </select>
                </div>
              </div>
              <Button onClick={handleCreate} className="w-full bg-[#1E8B4C] hover:bg-[#167a3f] mt-4">Ajouter</Button>
            </DialogContent>
          </Dialog>
        </div>

        <div className="bg-white rounded-xl border border-[#C4D7C4]/30 overflow-hidden">
          <table className="w-full">
            <thead><tr className="border-b border-[#C4D7C4]/30 bg-[#F6F4DE]/50">
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">N°</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Nom</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Prenom</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Sexe</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Date naiss.</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">Actions</th>
            </tr></thead>
            <tbody>
              {filtered?.map((c) => (
                <tr key={c.idInscription} className="border-b border-gray-50 hover:bg-[#F6F4DE]/30">
                  <td className="px-4 py-3 text-sm">{c.idInscription}</td>
                  <td className="px-4 py-3 text-sm font-medium">{c.nom}</td>
                  <td className="px-4 py-3 text-sm">{c.prenom}</td>
                  <td className="px-4 py-3 text-sm">{c.sexe}</td>
                  <td className="px-4 py-3 text-sm">{c.dateNaissance ? new Date(c.dateNaissance).toLocaleDateString("fr-FR") : "-"}</td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate({ id: c.idInscription })} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
