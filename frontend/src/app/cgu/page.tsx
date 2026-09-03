import type { Metadata } from "next";

export const metadata: Metadata = { title: "CGU" };

export default function CguPage() {
  return (
    <main className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="mb-2">Conditions Générales d&apos;Utilisation</h1>
      <p className="text-text-secondary text-sm mb-6">
        Ce texte est un brouillon de structure et n&apos;a pas de valeur juridique — il doit être
        rédigé et validé par le service juridique du Ministère avant publication.
      </p>

      <div className="flex flex-col gap-5 font-body text-[15px] leading-6 text-text">
        <section>
          <h2 className="mb-2">1. Objet</h2>
          <p>
            ProfilsActifs est une plateforme de mise en relation professionnelle par vidéo, portée par
            le Ministère du Job et Bonheur, permettant aux demandeurs d&apos;emploi de présenter leurs
            compétences et aux recruteurs de les contacter.
          </p>
        </section>
        <section>
          <h2 className="mb-2">2. Inscription</h2>
          <p>
            L&apos;inscription est réservée aux personnes de 16 ans et plus. Les mineurs de 16 à 18 ans
            relèvent d&apos;un régime spécifique détaillé au moment de l&apos;inscription.
          </p>
        </section>
        <section>
          <h2 className="mb-2">3. Contenu publié par les utilisateurs</h2>
          <p>
            Les vidéos publiées engagent la responsabilité de leur auteur. Le consentement à la
            publication est révocable à tout moment depuis l&apos;espace personnel.
          </p>
        </section>
        <section>
          <h2 className="mb-2">4. Certification JEB</h2>
          <p>
            Le Permis de Travailler JEB est délivré à l&apos;issue du questionnaire de certification et
            n&apos;a pas valeur de diplôme officiel.
          </p>
        </section>
      </div>
    </main>
  );
}
