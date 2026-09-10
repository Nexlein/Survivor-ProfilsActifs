import Link from "next/link";
import { buttonClasses } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <main className="text-center px-6 py-16">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.png" alt="ProfilsActifs" className="w-14 h-14 object-contain rounded-sm inline-flex mb-6" />
      <div className="text-[90px] font-extrabold text-primary opacity-15 font-heading leading-none">
        404
      </div>
      <h2 className="mb-2">Cette page n'existe pas.</h2>
      <p className="text-text-secondary mb-5">
        Le profil ou la page que vous recherchez est introuvable.
      </p>
      <div className="flex gap-3 justify-center flex-wrap">
        <Link href="/" className={buttonClasses("primary")}>
          Retour à l'accueil
        </Link>
        <Link href="/profils" className={buttonClasses("secondary")}>
          Parcourir les profils
        </Link>
      </div>
    </main>
  );
}
