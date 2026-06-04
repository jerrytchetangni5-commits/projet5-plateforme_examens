import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/providers/trpc";
import { GraduationCap, School, UserCheck, ShieldCheck } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("admin");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Admin form
  const [adminUser, setAdminUser] = useState("admin");
  const [adminPass, setAdminPass] = useState("admin");

  // Ecole form
  const [ecoleEmail, setEcoleEmail] = useState("csjb@cotonou.bj");
  const [ecolePass, setEcolePass] = useState("ecole123");

  // Secretaire form
  const [secEmail, setSecEmail] = useState("marie.kouassi@uniresults.com");
  const [secPass, setSecPass] = useState("sec123");

  const loginMutation = trpc.auth.loginAdmin.useMutation();
  const loginEcoleMutation = trpc.auth.loginEcole.useMutation();
  const loginSecMutation = trpc.auth.loginSecretaire.useMutation();

  const handleLogin = async () => {
    setError("");
    setLoading(true);

    try {
      let result;
      if (activeTab === "admin") {
        result = await loginMutation.mutateAsync({
          username: adminUser,
          password: adminPass,
        });
      } else if (activeTab === "ecole") {
        result = await loginEcoleMutation.mutateAsync({
          email: ecoleEmail,
          password: ecolePass,
        });
      } else {
        result = await loginSecMutation.mutateAsync({
          email: secEmail,
          password: secPass,
        });
      }

      if (result.success && result.token) {
        localStorage.setItem("token", result.token);
        window.location.href = "/dashboard";
      } else {
        setError(result.error || "Erreur de connexion");
      }
    } catch (err) {
      setError("Identifiants incorrects");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "linear-gradient(135deg, #202A26 0%, #1E8B4C 100%)" }}
    >
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center">
              <GraduationCap className="w-7 h-7 text-[#1E8B4C]" />
            </div>
            <h1 className="text-3xl font-bold text-white">UniResults</h1>
          </div>
          <p className="text-white/70">Plateforme de gestion d'examens</p>
        </div>

        <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl text-[#202A26]">Connexion</CardTitle>
            <CardDescription>
              Accedez a votre espace selon votre profil
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3 mb-6 bg-[#C4D7C4]/40">
                <TabsTrigger value="admin" className="flex items-center gap-1.5 text-xs">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Admin
                </TabsTrigger>
                <TabsTrigger value="ecole" className="flex items-center gap-1.5 text-xs">
                  <School className="w-3.5 h-3.5" />
                  Ecole
                </TabsTrigger>
                <TabsTrigger value="secretaire" className="flex items-center gap-1.5 text-xs">
                  <UserCheck className="w-3.5 h-3.5" />
                  Secretaire
                </TabsTrigger>
              </TabsList>

              <TabsContent value="admin" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="admin-user">Nom d'utilisateur</Label>
                  <Input
                    id="admin-user"
                    value={adminUser}
                    onChange={(e) => setAdminUser(e.target.value)}
                    placeholder="admin"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-pass">Mot de passe</Label>
                  <Input
                    id="admin-pass"
                    type="password"
                    value={adminPass}
                    onChange={(e) => setAdminPass(e.target.value)}
                    placeholder="admin"
                  />
                </div>
              </TabsContent>

              <TabsContent value="ecole" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ecole-email">Email</Label>
                  <Input
                    id="ecole-email"
                    type="email"
                    value={ecoleEmail}
                    onChange={(e) => setEcoleEmail(e.target.value)}
                    placeholder="ecole@email.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ecole-pass">Mot de passe</Label>
                  <Input
                    id="ecole-pass"
                    type="password"
                    value={ecolePass}
                    onChange={(e) => setEcolePass(e.target.value)}
                    placeholder="Mot de passe"
                  />
                </div>
              </TabsContent>

              <TabsContent value="secretaire" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="sec-email">Email</Label>
                  <Input
                    id="sec-email"
                    type="email"
                    value={secEmail}
                    onChange={(e) => setSecEmail(e.target.value)}
                    placeholder="secretaire@email.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sec-pass">Mot de passe</Label>
                  <Input
                    id="sec-pass"
                    type="password"
                    value={secPass}
                    onChange={(e) => setSecPass(e.target.value)}
                    placeholder="Mot de passe"
                  />
                </div>
              </TabsContent>
            </Tabs>

            {error && (
              <div className="mt-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm">
                {error}
              </div>
            )}

            <Button
              className="w-full mt-6 bg-[#1E8B4C] hover:bg-[#167a3f] text-white"
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? "Connexion..." : "Se connecter"}
            </Button>

            <div className="mt-4 text-center">
              <button
                onClick={() => navigate("/")}
                className="text-sm text-[#4A6D8C] hover:underline"
              >
                Retour a l'accueil
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
