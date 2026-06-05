import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/providers/trpc";
import {
  GraduationCap,
  Search,
  School,
  FileText,
  Award,
  Users,
  BookOpen,
  BarChart3,
  ArrowRight,
} from "lucide-react";

export default function Home() {
  const navigate = useNavigate();
  const [numeroTable, setNumeroTable] = useState("");
  const [idSession, setIdSession] = useState(1);
  const [searchResult, setSearchResult] = useState<any>(null);
  const [searching, setSearching] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const sessionsQuery = trpc.session.list.useQuery();
  const consultQuery = trpc.deliberation.consultResults.useQuery(
    {
      numeroTable: Number(numeroTable),
      idSession,
    },
    {
      enabled: false,
    }
  );

  const handleSearch = async () => {
    if (!numeroTable) return;

    setSearching(true);
    setNotFound(false);
    setSearchResult(null);

    try {
      const result = await consultQuery.refetch();

      if (result.data?.found) {
        setSearchResult(result.data);
      } else {
        setNotFound(true);
      }
    } catch (error) {
      console.error(error);
      setNotFound(true);
    } finally {
      setSearching(false);
    }
  };

  const stats = [
    { icon: School, label: "Ecoles inscrites", value: "150+" },
    { icon: Users, label: "Candidats", value: "50,000+" },
    { icon: BookOpen, label: "Examens geres", value: "4 types" },
    { icon: Award, label: "Taux de reussite", value: "78%" },
  ];

  const examTypes = [
    { code: "CEP", name: "Certificat d'Etudes Primaires", color: "#1E8B4C" },
    {
      code: "BEPC",
      name: "Brevet d'Etudes du Premier Cycle",
      color: "#4A6D8C",
    },
    {
      code: "CAP",
      name: "Certificat d'Aptitude Professionnelle",
      color: "#800020",
    },
    { code: "BAC", name: "Baccalaureat", color: "#202A26" },
  ];

  return (
    <div className="min-h-screen bg-[#F6F4DE]">
      {/* Hero Section */}
      <header
        className="relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #202A26 0%, #1a3d2e 50%, #1E8B4C 100%)",
        }}
      >
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>
            
        <nav className="relative z-10 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-[#1E8B4C]" />
            </div>
            <span className="text-xl font-bold text-white">UniResults</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/register")}
              className="text-sm text-white/80 hover:text-white transition-colors"
            >
              Inscrire mon ecole
            </button>
            <Button
              onClick={() => navigate("/login")}
              className="bg-[#1E8B4C] hover:bg-[#167a3f] text-white"
              size="sm"
            >
              Connexion
            </Button>
          </div>
        </nav>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Vos resultats
            <br />
            <span className="text-[#1E8B4C]">en un clic</span>
          </h1>
          <p className="text-lg text-white/70 mb-10 max-w-2xl mx-auto">
            Consultez vos resultats aux examens officiels (CEP, BEPC, CAP, BAC)
            et telechargez votre releve de notes en toute securite.
          </p>

          {/* Search Card */}
          <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-2xl p-6">
            <h3 className="text-[#202A26] font-semibold mb-4 flex items-center gap-2 justify-center">
              <Search className="w-5 h-5 text-[#1E8B4C]" />
              Consulter mes resultats
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-500 mb-1 block text-left">
                  Numero de table
                </label>
                <Input
                  type="number"
                  placeholder="Ex: 1001"
                  value={numeroTable}
                  onChange={e => setNumeroTable(e.target.value)}
                  className="border-[#C4D7C4] focus:border-[#1E8B4C]"
                />
              </div>
              <div>
                <label className="text-sm text-gray-500 mb-1 block text-left">
                  Session
                </label>
                <select
                  value={idSession}
                  onChange={e => setIdSession(Number(e.target.value))}
                  className="w-full h-10 px-3 rounded-md border border-[#C4D7C4] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#1E8B4C] focus:border-transparent"
                >
                  {sessionsQuery.data?.map(s => (
                    <option key={s.idSession} value={s.idSession}>
                      {s.libelleSession} ({s.annee})
                    </option>
                  ))}
                </select>
              </div>
              <Button
                onClick={handleSearch}
                disabled={searching || !numeroTable}
                className="w-full bg-[#1E8B4C] hover:bg-[#167a3f] text-white"
              >
                {searching ? "Recherche..." : "Rechercher"}
                <Search className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Search Results */}
      {(searchResult || notFound) && (
        <section className="max-w-4xl mx-auto px-6 -mt-4 mb-16">
          {searchResult?.found ? (
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div
                className="px-6 py-4 text-white flex items-center justify-between"
                style={{
                  background:
                    searchResult.deliberation?.resultat === "Admis"
                      ? "linear-gradient(90deg, #1E8B4C, #2db36a)"
                      : "linear-gradient(90deg, #800020, #b30030)",
                }}
              >
                <div>
                  <h3 className="text-xl font-bold">
                    {searchResult.candidate.prenom} {searchResult.candidate.nom}
                  </h3>
                  <p className="text-white/80 text-sm">
                    N° Table: {searchResult.numeroTable} | Centre:{" "}
                    {searchResult.centre}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">
                    {searchResult.deliberation?.moyenneGenerale?.toFixed(2) ||
                      "--"}
                  </div>
                  <div className="text-sm text-white/80">/ 20</div>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-[#F6F4DE] rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-500">Mention</p>
                    <p className="font-semibold text-[#202A26]">
                      {searchResult.deliberation?.mention || "--"}
                    </p>
                  </div>
                  <div className="bg-[#F6F4DE] rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-500">Resultat</p>
                    <p
                      className={`font-semibold ${
                        searchResult.deliberation?.resultat === "Admis"
                          ? "text-[#1E8B4C]"
                          : "text-[#800020]"
                      }`}
                    >
                      {searchResult.deliberation?.resultat || "--"}
                    </p>
                  </div>
                  <div className="bg-[#F6F4DE] rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-500">Serie</p>
                    <p className="font-semibold text-[#202A26]">
                      {searchResult.serie?.libelleSerie || "--"}
                    </p>
                  </div>
                  <div className="bg-[#F6F4DE] rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-500">Session</p>
                    <p className="font-semibold text-[#202A26]">
                      {searchResult.session?.libelleSession || "--"}
                    </p>
                  </div>
                </div>

                <h4 className="font-semibold text-[#202A26] mb-3">
                  Detail des notes
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#C4D7C4]">
                        <th className="text-left py-2 px-3 text-gray-500">
                          Matière
                        </th>
                        <th className="text-center py-2 px-3 text-gray-500">
                          Note
                        </th>
                        <th className="text-center py-2 px-3 text-gray-500">
                          Coef
                        </th>
                        <th className="text-center py-2 px-3 text-gray-500">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {searchResult.notes.map((note: any, i: number) => (
                        <tr key={i} className="border-b border-gray-100">
                          <td className="py-2 px-3">{note.libelleMatiere}</td>
                          <td className="text-center py-2 px-3 font-medium">
                            {note.valeur?.toFixed(2)}
                          </td>
                          <td className="text-center py-2 px-3 text-gray-500">
                            {note.coefficient}
                          </td>
                          <td className="text-center py-2 px-3 font-medium text-[#1E8B4C]">
                            {(note.valeur * note.coefficient).toFixed(1)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-6 flex gap-3">
                  <Button
                    onClick={() => {
                      const releveUrl = `/dashboard/releves?numero=${searchResult.numeroTable}&session=${idSession}`;
                      navigate(releveUrl);
                    }}
                    className="bg-[#1E8B4C] hover:bg-[#167a3f]"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Voir le releve complet
                  </Button>
                </div>
              </div>
            </div>
          ) : notFound ? (
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-[#202A26] mb-2">
                Aucun resultat trouve
              </h3>
              <p className="text-gray-500">
                Verifiez votre numero de table et la session selectionnée.
              </p>
            </div>
          ) : null}
        </section>
      )}

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="bg-white rounded-xl p-6 shadow-sm border border-[#C4D7C4]/30 text-center hover:shadow-md transition-shadow"
            >
              <stat.icon className="w-8 h-8 text-[#1E8B4C] mx-auto mb-3" />
              <p className="text-2xl font-bold text-[#202A26]">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Exam Types Section */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[#202A26] mb-4">
            Examens pris en charge
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Notre plateforme gère tous les examens nationaux du systeme
            éducatif.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {examTypes.map(exam => (
            <div
              key={exam.code}
              className="bg-white rounded-xl p-6 shadow-sm border border-[#C4D7C4]/30 hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer group"
              onClick={() => navigate("/login")}
            >
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                style={{ backgroundColor: exam.color + "15" }}
              >
                <GraduationCap
                  className="w-7 h-7"
                  style={{ color: exam.color }}
                />
              </div>
              <h3
                className="text-2xl font-bold mb-1"
                style={{ color: exam.color }}
              >
                {exam.code}
              </h3>
              <p className="text-sm text-gray-500 mb-3">{exam.name}</p>
              <div
                className="flex items-center text-sm"
                style={{ color: exam.color }}
              >
                <span>Consulter</span>
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it Works */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#202A26] mb-4">
              Comment ca marche ?
            </h2>
            <p className="text-gray-500">
              Trois étapes simples pour consulter vos resultats.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Entrez votre numero",
                desc: "Saisissez votre numero de table fourni lors de l'inscription a l'examen.",
                icon: FileText,
              },
              {
                step: "02",
                title: "Selectionnez la session",
                desc: "Choisissez l'annee et la session d'examen correspondante.",
                icon: BarChart3,
              },
              {
                step: "03",
                title: "Consultez votre releve",
                desc: "Visualisez vos notes, votre moyenne et telechargez votre releve.",
                icon: Award,
              },
            ].map(item => (
              <div key={item.step} className="text-center group">
                <div className="relative inline-block mb-6">
                  <div className="w-20 h-20 rounded-2xl bg-[#F6F4DE] flex items-center justify-center group-hover:bg-[#1E8B4C] transition-colors">
                    <item.icon className="w-8 h-8 text-[#1E8B4C] group-hover:text-white transition-colors" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-[#202A26] text-white text-xs font-bold flex items-center justify-center">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-[#202A26] mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#202A26] text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <GraduationCap className="w-6 h-6 text-[#1E8B4C]" />
                <span className="text-lg font-bold">UniResults</span>
              </div>
              <p className="text-white/50 text-sm">
                Plateforme de gestion et de consultation des resultats
                d'examens.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Examens</h4>
              <ul className="space-y-2 text-sm text-white/50">
                <li>CEP</li>
                <li>BEPC</li>
                <li>CAP</li>
                <li>BAC</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-sm text-white/50">
                <li>Consultation de resultats</li>
                <li>Telechargement de releves</li>
                <li>Inscription des ecoles</li>
                <li>Gestion des notes</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Accès</h4>
              <ul className="space-y-2 text-sm text-white/50">
                <li>
                  <button
                    onClick={() => navigate("/login")}
                    className="hover:text-white"
                  >
                    Espace Admin
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate("/login")}
                    className="hover:text-white"
                  >
                    Espace Ecole
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate("/login")}
                    className="hover:text-white"
                  >
                    Espace Secretaire
                  </button>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 text-center text-sm text-white/30">
            <p>&copy; 2025 UniResults. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
