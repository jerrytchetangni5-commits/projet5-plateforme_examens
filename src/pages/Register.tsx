import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { trpc } from "@/providers/trpc";
import { GraduationCap, ArrowLeft, School } from "lucide-react";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nom: "",
    ifu: "",
    departement: "",
    type: "College",
    contact: "",
    email: "",
    password: "",
    confirmPassword: "",
    adresse: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const registerMutation = trpc.auth.registerEcole.useMutation();

  const handleSubmit = async () => {
    setError("");

    if (!form.nom || !form.departement || !form.email || !form.password) {
      setError("Veuillez remplir tous les champs obligatoires");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    try {
      const result = await registerMutation.mutateAsync({
        nom: form.nom,
        ifu: form.ifu || undefined,
        departement: form.departement,
        type: form.type,
        contact: form.contact || undefined,
        email: form.email,
        password: form.password,
        adresse: form.adresse || undefined,
      });

      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.error || "Erreur lors de l'inscription");
      }
    } catch {
      setError("Erreur lors de l'inscription");
    }
  };

  if (success) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ background: "linear-gradient(135deg, #202A26 0%, #1E8B4C 100%)" }}
      >
        <Card className="w-full max-w-md border-0 shadow-2xl">
          <CardContent className="pt-8 pb-6 text-center">
            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
              <School className="w-8 h-8 text-[#1E8B4C]" />
            </div>
            <h2 className="text-xl font-bold text-[#202A26] mb-2">
              Inscription reussie !
            </h2>
            <p className="text-gray-500 mb-6">
              Votre ecole a ete enregistree. Vous pouvez maintenant vous connecter.
            </p>
            <Button
              onClick={() => navigate("/login")}
              className="bg-[#1E8B4C] hover:bg-[#167a3f]"
            >
              Se connecter
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen p-4"
      style={{ background: "linear-gradient(135deg, #202A26 0%, #1E8B4C 100%)" }}
    >
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-white/70 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour a l'accueil
        </button>

        <Card className="border-0 shadow-2xl">
          <CardHeader className="text-center pb-2">
            <div className="w-14 h-14 rounded-xl bg-[#1E8B4C]/10 flex items-center justify-center mx-auto mb-4">
              <School className="w-7 h-7 text-[#1E8B4C]" />
            </div>
            <CardTitle className="text-2xl text-[#202A26]">
              Inscrire votre ecole
            </CardTitle>
            <CardDescription>
              Creez un compte pour votre etablissement scolaire
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nom">
                  Nom de l'ecole <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="nom"
                  value={form.nom}
                  onChange={(e) => setForm({ ...form, nom: e.target.value })}
                  placeholder="College/Lycee ..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ifu">IFU</Label>
                <Input
                  id="ifu"
                  value={form.ifu}
                  onChange={(e) => setForm({ ...form, ifu: e.target.value })}
                  placeholder="Numero IFU"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="departement">
                  Departement <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="departement"
                  value={form.departement}
                  onChange={(e) =>
                    setForm({ ...form, departement: e.target.value })
                  }
                  placeholder="Ex: Littoral"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type d'etablissement</Label>
                <select
                  id="type"
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                >
                  <option value="College">College</option>
                  <option value="Lycee">Lycee</option>
                  <option value="CEG">CEG</option>
                  <option value="Ecole Primaire">Ecole Primaire</option>
                  <option value="Prive">Prive</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact">Contact</Label>
                <Input
                  id="contact"
                  value={form.contact}
                  onChange={(e) =>
                    setForm({ ...form, contact: e.target.value })
                  }
                  placeholder="229 XX XX XX XX"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="ecole@email.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">
                  Mot de passe <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  placeholder="Min. 6 caracteres"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">
                  Confirmer <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="confirm"
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) =>
                    setForm({ ...form, confirmPassword: e.target.value })
                  }
                  placeholder="Repeter le mot de passe"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="adresse">Adresse</Label>
                <Input
                  id="adresse"
                  value={form.adresse}
                  onChange={(e) =>
                    setForm({ ...form, adresse: e.target.value })
                  }
                  placeholder="Adresse complete"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">
                {error}
              </div>
            )}

            <Button
              onClick={handleSubmit}
              disabled={registerMutation.isPending}
              className="w-full bg-[#1E8B4C] hover:bg-[#167a3f] text-white"
            >
              {registerMutation.isPending
                ? "Inscription en cours..."
                : "S'inscrire"}
            </Button>

            <p className="text-center text-sm text-gray-500">
              Deja inscrit ?{" "}
              <button
                onClick={() => navigate("/login")}
                className="text-[#1E8B4C] hover:underline font-medium"
              >
                Se connecter
              </button>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
