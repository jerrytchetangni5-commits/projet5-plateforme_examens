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
import { Switch } from "@/components/ui/switch";
import {
  Calendar,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  XCircle,
} from "lucide-react";

export default function DashboardSessions() {
  const utils = trpc.useUtils();
  const sessionsQuery = trpc.session.list.useQuery();
  const createMutation = trpc.session.create.useMutation({
    onSuccess: () => utils.session.list.invalidate(),
  });
  const toggleMutation = trpc.session.toggleStatus.useMutation({
    onSuccess: () => utils.session.list.invalidate(),
  });
  const deleteMutation = trpc.session.delete.useMutation({
    onSuccess: () => utils.session.list.invalidate(),
  });

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    annee: new Date().getFullYear(),
    libelleSession: "",
    dateOuverture: "",
    dateFermeture: "",
  });

  const handleCreate = async () => {
    await createMutation.mutateAsync(form);
    setOpen(false);
    setForm({
      annee: new Date().getFullYear(),
      libelleSession: "",
      dateOuverture: "",
      dateFermeture: "",
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-[#202A26]">
            Gestion des sessions
          </h2>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#1E8B4C] hover:bg-[#167a3f]">
                <Plus className="w-4 h-4 mr-2" />
                Nouvelle session
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Creer une session</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Annee</Label>
                  <Input
                    type="number"
                    value={form.annee}
                    onChange={(e) =>
                      setForm({ ...form, annee: parseInt(e.target.value) })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Libelle</Label>
                  <Input
                    value={form.libelleSession}
                    onChange={(e) =>
                      setForm({ ...form, libelleSession: e.target.value })
                    }
                    placeholder="Session Principale 2025"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date d'ouverture</Label>
                    <Input
                      type="date"
                      value={form.dateOuverture}
                      onChange={(e) =>
                        setForm({ ...form, dateOuverture: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Date de fermeture</Label>
                    <Input
                      type="date"
                      value={form.dateFermeture}
                      onChange={(e) =>
                        setForm({ ...form, dateFermeture: e.target.value })
                      }
                    />
                  </div>
                </div>
                <Button
                  onClick={handleCreate}
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
                  Libelle
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">
                  Annee
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">
                  Ouverture
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">
                  Fermeture
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">
                  Statut
                </th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {sessionsQuery.data?.map((s) => (
                <tr
                  key={s.idSession}
                  className="border-b border-gray-50 hover:bg-[#F6F4DE]/30"
                >
                  <td className="px-4 py-3 text-sm">{s.idSession}</td>
                  <td className="px-4 py-3 text-sm font-medium">
                    {s.libelleSession}
                  </td>
                  <td className="px-4 py-3 text-sm">{s.annee}</td>
                  <td className="px-4 py-3 text-sm">
                    {s.dateOuverture
                      ? new Date(s.dateOuverture).toLocaleDateString("fr-FR")
                      : "-"}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {s.dateFermeture
                      ? new Date(s.dateFermeture).toLocaleDateString("fr-FR")
                      : "-"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={s.statut === "ouverte"}
                        onCheckedChange={() =>
                          toggleMutation.mutate({ id: s.idSession })
                        }
                      />
                      {s.statut === "ouverte" ? (
                        <span className="text-xs text-green-600 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Ouverte
                        </span>
                      ) : (
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <XCircle className="w-3 h-3" />
                          Fermee
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        deleteMutation.mutate({ id: s.idSession })
                      }
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
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
