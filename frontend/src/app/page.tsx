import Link from "next/link";
import { buttonClasses } from "@/components/ui/Button";
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
  { name: "Amina K.", role: "Développeuse web", certified: true, avatarUrl: "/images/demo-avatars/avatar-1.jpg" },
  { name: "Marie Dupont", role: "Assistante de gestion", certified: true, avatarUrl: "https://randomuser.me/api/portraits/women/68.jpg" },
  { name: "Karim Belkacem", role: "Technicien logistique", certified: true, avatarUrl: "/images/demo-avatars/avatar-2.jpg" },
  { name: "Sophie Martin", role: "Chargée de communication", certified: false, avatarUrl: "https://randomuser.me/api/portraits/women/23.jpg" },
  { name: "Julien Petit", role: "Comptable", certified: true, avatarUrl: "/images/demo-avatars/avatar-3.jpg" },
  { name: "Lucie Bernard", role: "Community manager", certified: false, avatarUrl: "https://randomuser.me/api/portraits/women/33.jpg" },
  { name: "Thomas Roy", role: "Chargé de recrutement", certified: true, avatarUrl: "https://randomuser.me/api/portraits/men/76.jpg" },
  { name: "Sonia Lefèvre", role: "Chef de projet", certified: false, avatarUrl: "https://randomuser.me/api/portraits/women/50.jpg" },
];

export default function Home() {
  return (
    <main className="flex flex-col">
      <section className="bg-primary px-6 sm:px-12 py-20 sm:py-28 flex flex-col md:flex-row items-center gap-12 md:gap-16">
        <div className="flex-1 flex flex-col gap-7 max-w-lg">
          <h1 className="text-white">Valorisez vos compétences. Soyez vu.</h1>
          <p className="font-body text-lg leading-relaxed text-white/90 max-w-md">
            ProfilsActifs relie candidats et recruteurs par la vidéo, avec certification officielle JEB.
          </p>
          <div className="flex gap-3 flex-wrap justify-center md:justify-start w-full md:w-auto">
            <Link href="/register" className={buttonClasses("primary")}>
              Créer mon profil
            </Link>
            <Link href="/profils" className={buttonClasses("secondary")}>
              Parcourir les profils
            </Link>
          </div>
        </div>
        <div className="flex-1 flex justify-center">
          <ProfileCard
            name="Amina K."
            role="Développeuse web"
            certified
            avatarUrl="/images/demo-avatars/avatar-1.jpg"
          />
        </div>
      </section>

      <section id="comment-ca-marche" className="px-6 sm:px-12 py-20 sm:py-24 bg-bg flex flex-col items-center gap-14">
        <div className="text-center flex flex-col gap-2">
          <h2>Comment ça marche</h2>
          <p className="font-body text-text-secondary">Trois étapes, quelques minutes.</p>
        </div>
        <div className="flex flex-wrap justify-center gap-10">
          {STEPS.map((step) => (
            <div key={step.title} className="text-center max-w-[220px] group">
              <div className="w-16 h-16 rounded-full bg-chip-bg text-primary text-2xl flex items-center justify-center mx-auto mb-4 transition-transform duration-150 group-hover:scale-105">
                {step.icon}
              </div>
              <h3 className="mb-1.5">{step.title}</h3>
              <p className="font-body text-sm text-text-secondary leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 sm:px-12 py-20 sm:py-24 bg-bg-secondary flex flex-col items-center gap-12">
        <h2 className="text-center">Profils mis en avant</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-w-5xl w-full justify-items-center">
          {FEATURED_PROFILES.map((profile) => (
            <ProfileCard key={profile.name} {...profile} />
          ))}
        </div>
        <Link href="/profils" className={buttonClasses("secondary")}>
          Voir tous les profils
        </Link>
      </section>
    </main>
  );
}
