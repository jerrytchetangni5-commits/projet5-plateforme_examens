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
import { School, Plus, Trash2, Search } from "lucide-react";

export default function DashboardEcoles() {
  const utils = trpc.useUtils();
  const ecolesQuery = trpc.ecole.list.useQuery();
  const createMutation = trpc.ecole.create.useMutation({
    onSuccess: () => utils.ecole.list.invalidate(),
  });
  const deleteMutation = trpc.ecole.delete.useMutation({
    onSuccess: () => utils.ecole.list.invalidate(),
  });

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    nom: "",
    ifu: "",
    departement: "",
    type: "College",
    contact: "",
    email: "",
    password: "",
    adresse: "",
  });

  const handleCreate = async () => {
    await createMutation.mutateAsync(form);
    setOpen(false);
    setForm({ nom: "", ifu: "", departement: "", type: "College", contact: "", email: "", password: "", adresse: "" });
  };

  const filteredEcoles = search
    ? ecolesQuery.data?.filter((e) =>
        e.nom.toLowerCase().includes(search.toLowerCase())
      )
    : ecolesQuery.data;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 max-w-md relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Rechercher une ecole..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#1E8B4C] hover:bg-[#167a3f]">
                <Plus className="w-4 h-4 mr-2" />
                Ajouter
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Ajouter une ecole</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="space-y-2">
                  <Label>Nom *</Label>
                  <Input value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>IFU</Label>
                  <Input value={form.ifu} onChange={(e) => setForm({ ...form, ifu: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Departement *</Label>
                  <Input value={form.departement} onChange={(e) => setForm({ ...form, departement: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm">
                    <option>College</option>
                    <option>Lycee</option>
                    <option>CEG</option>
                    <option>Ecole Primaire</option>
                    <option>Prive</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Contact</Label>
                  <Input value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Email *</Label>
                  <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Mot de passe *</Label>
                  <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Adresse</Label>
                  <Input value={form.adresse} onChange={(e) => setForm({ ...form, adresse: e.target.value })} />
                </div>
              </div>
              <Button onClick={handleCreate} className="w-full bg-[#1E8B4C] hover:bg-[#167a3f] mt-4">Ajouter</Button>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEcoles?.map((ecole) => (
            <div key={ecole.idEcole} className="bg-white rounded-xl p-5 border border-[#C4D7C4]/30 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-[#1E8B4C]/10 flex items-center justify-center">
                  <School className="w-5 h-5 text-[#1E8B4C]" />
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${ecole.status === "active" ? "bg-green-50 text-green-600" : "bg-yellow-50 text-yellow-600"}`}>
                  {ecole.status}
                </span>
              </div>
              <h3 className="font-semibold text-[#202A26] mb-1">{ecole.nom}</h3>
              <p className="text-xs text-gray-500 mb-3">{ecole.type} - {ecole.departement}</p>
              <div className="space-y-1 text-xs text-gray-500">
                <p><strong>Email:</strong> {ecole.email}</p>
                <p><strong>Contact:</strong> {ecole.contact || "-"}</p>
                <p><strong>Adresse:</strong> {ecole.adresse || "-"}</p>
              </div>
              <div className="mt-4 flex justify-end">
                <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate({ id: ecole.idEcole })} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
