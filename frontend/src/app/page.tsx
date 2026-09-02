import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ProfileCard } from "@/components/ui/Card";

const STEPS = [
  {
    icon: "◎",
    title: "Créez votre profil",
    description: "Renseignez vos compétences et votre expérience.",
  },
  {
    icon: "▶",
    title: "Publiez votre vidéo",
    description: "Présentez-vous en quelques minutes.",
  },
  {
    icon: "★",
    title: "Obtenez votre certification JEB",
    description: "Passez le questionnaire et décrochez votre badge.",
  },
];

const FEATURED_PROFILES = [
  { name: "Amina K.", role: "Développeuse web", certified: true },
  { name: "Marie Dupont", role: "Assistante de gestion", certified: true },
  { name: "Karim Belkacem", role: "Technicien logistique", certified: true },
  { name: "Sophie Martin", role: "Chargée de communication", certified: false },
  { name: "Julien Petit", role: "Comptable", certified: true },
  { name: "Lucie Bernard", role: "Community manager", certified: false },
];

export default function Home() {
  return (
    <main className="flex flex-col">
      <section className="bg-primary px-6 sm:px-12 py-16 flex flex-col md:flex-row items-center gap-10">
        <div className="flex-1 flex flex-col gap-6 max-w-lg">
          <h1 className="text-white">Valorisez vos compétences. Soyez vu.</h1>
          <p className="font-body text-lg text-white max-w-md">
            ProfilsActifs met en relation les demandeurs d&apos;emploi et les recruteurs grâce à la vidéo
            et à la certification officielle JEB.
          </p>
          <div className="flex gap-3 flex-wrap">
            <Link href="/register">
              <Button variant="primary">Créer mon profil</Button>
            </Link>
            <Link href="/profils">
              <Button variant="outline-light">Parcourir les profils</Button>
            </Link>
          </div>
        </div>
        <div className="flex-1 flex justify-center">
          <div className="bg-white rounded-lg p-5 w-[220px] shadow-modal">
            <div className="w-16 h-16 rounded-full bg-bg-secondary mx-auto mb-2.5" />
            <div className="text-center font-bold text-text">Amina K.</div>
            <div className="text-center italic text-[13px] font-body text-text-secondary mb-2.5">
              Développeuse web
            </div>
            <div className="bg-success text-white rounded-md px-2.5 py-1.5 text-xs font-bold text-center font-heading">
              ★ Certifié JEB
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 sm:px-12 py-12 bg-bg flex flex-col items-center gap-12">
        <h2 className="text-center">Comment ça marche</h2>
        <div className="flex flex-wrap justify-center gap-10">
          {STEPS.map((step) => (
            <div key={step.title} className="text-center max-w-[220px]">
              <div className="w-14 h-14 rounded-full bg-chip-bg text-primary text-2xl flex items-center justify-center mx-auto mb-3">
                {step.icon}
              </div>
              <h3 className="mb-1.5">{step.title}</h3>
              <p className="font-body text-sm text-text-secondary">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 sm:px-12 py-12 bg-bg-secondary flex flex-col items-center gap-10">
        <h2 className="text-center">Profils mis en avant</h2>
        <div className="flex flex-wrap justify-center gap-4">
          {FEATURED_PROFILES.map((profile) => (
            <ProfileCard key={profile.name} {...profile} />
          ))}
        </div>
        <Link href="/profils">
          <Button variant="secondary">Voir tous les profils</Button>
        </Link>
      </section>
    </main>
  );
}
