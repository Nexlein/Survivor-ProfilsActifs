import Link from "next/link";
import { buttonClasses } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <main className="text-center px-6 py-16">
      <div className="w-9 h-9 bg-primary text-white font-bold text-[10px] inline-flex items-center justify-center mb-6">
        JEB
      </div>
      <div className="text-[90px] font-extrabold text-primary opacity-15 font-heading leading-none">
        404
      </div>
      <h2 className="mb-2">Cette page n&apos;existe pas.</h2>
      <p className="text-text-secondary mb-5">
        Le profil ou la page que vous recherchez est introuvable.
      </p>
      <div className="flex gap-3 justify-center flex-wrap">
        <Link href="/" className={buttonClasses("primary")}>
          Retour à l&apos;accueil
        </Link>
        <Link href="/profils" className={buttonClasses("secondary")}>
          Parcourir les profils
        </Link>
      </div>
    </main>
  );
}
