import type { Metadata } from "next";
import Link from "next/link";
import { buttonClasses } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Rejoindre ProfilsActifs" };

export default function RegisterRolePage() {
  return (
    <main className="flex flex-col items-center px-6 py-16 gap-10">
      <div className="text-center flex flex-col items-center gap-3">
        <div className="w-11 h-11 bg-primary text-white font-bold font-heading text-xs flex items-center justify-center">
          JEB
        </div>
        <h1>Rejoindre ProfilsActifs</h1>
        <p className="text-text-secondary">Êtes-vous ?</p>
      </div>

      <div className="flex flex-wrap gap-6 justify-center max-w-4xl">
        <div className="w-full max-w-[420px] border border-border rounded-lg p-7 shadow-card">
          <div className="text-2xl mb-2.5">👤🔍</div>
          <h3 className="mb-2">Demandeur d&apos;emploi</h3>
          <p className="font-body text-sm text-text-secondary mb-4">
            Créez votre profil, publiez votre vidéo de présentation et obtenez votre certification
            officielle JEB.
          </p>
          <Link href="/register/candidate" className={buttonClasses("primary", "md", "w-full")}>
            Je suis demandeur d&apos;emploi
          </Link>
        </div>

        <div className="w-full max-w-[420px] border border-border rounded-lg p-7 shadow-card">
          <div className="text-2xl mb-2.5">🏢</div>
          <h3 className="mb-2">Recruteur</h3>
          <p className="font-body text-sm text-text-secondary mb-4">
            Accédez au catalogue des profils certifiés, filtrez par compétences et contactez les
            candidats.
          </p>
          <Link href="/register/recruiter" className={buttonClasses("secondary", "md", "w-full")}>
            Je suis recruteur
          </Link>
        </div>
      </div>
    </main>
  );
}
