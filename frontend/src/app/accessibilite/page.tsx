import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Accessibilité" };

export default function AccessibilitePage() {
  return (
    <main className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="mb-2">Déclaration d&apos;accessibilité</h1>
      <p className="text-text-secondary text-sm mb-6">
        Brouillon de structure — l&apos;audit RGAA réel et le taux de conformité doivent être réalisés
        et publiés par l&apos;équipe accessibilité avant mise en production.
      </p>

      <div className="flex flex-col gap-5 font-body text-[15px] leading-6 text-text">
        <section>
          <h2 className="mb-2">État de conformité</h2>
          <p>
            Le Ministère du Job et Bonheur s&apos;engage à rendre ProfilsActifs conforme au Référentiel
            Général d&apos;Amélioration de l&apos;Accessibilité (RGAA), version 4.1.
          </p>
        </section>
        <section>
          <h2 className="mb-2">Mesures prises</h2>
          <ul className="list-disc pl-5 flex flex-col gap-1">
            <li>Sous-titres recommandés/requis sur les vidéos publiées</li>
            <li>Focus clavier visible sur tous les éléments interactifs</li>
            <li>Contrastes de couleurs conformes AA (WCAG)</li>
          </ul>
        </section>
        <section>
          <h2 className="mb-2">Signaler un problème d&apos;accessibilité</h2>
          <p>
            Si vous rencontrez un obstacle sur ce site, vous pouvez nous le signaler via la page{" "}
            <Link href="/contact">Contact</Link>.
          </p>
        </section>
      </div>
    </main>
  );
}
