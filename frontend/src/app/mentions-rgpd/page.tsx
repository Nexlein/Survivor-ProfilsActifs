import type { Metadata } from "next";

export const metadata: Metadata = { title: "Mentions RGPD" };

export default function MentionsRgpdPage() {
  return (
    <main className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="mb-2">Mentions RGPD</h1>
      <p className="text-text-secondary text-sm mb-6">
        Ce texte est un brouillon de structure et n&apos;a pas de valeur juridique — il doit être
        rédigé et validé par le service juridique / DPO du Ministère avant publication.
      </p>

      <div className="flex flex-col gap-5 font-body text-[15px] leading-6 text-text">
        <section>
          <h2 className="mb-2">Données collectées</h2>
          <p>
            ProfilsActifs collecte : e-mail, mot de passe (chiffré), date de naissance (vérification
            d&apos;âge légale), nom, secteur recherché, localisation, compétences, et les vidéos
            publiées volontairement.
          </p>
        </section>
        <section>
          <h2 className="mb-2">Consentement vidéo</h2>
          <p>
            La publication d&apos;une vidéo nécessite un consentement explicite, horodaté et
            révocable à tout moment. La révocation entraîne la suppression définitive du fichier
            vidéo.
          </p>
        </section>
        <section>
          <h2 className="mb-2">Droits des personnes</h2>
          <p>
            Conformément au RGPD, vous disposez d&apos;un droit d&apos;accès, de rectification et de
            suppression de vos données, exerçable depuis votre espace personnel ou via la page{" "}
            Contact.
          </p>
        </section>
      </div>
    </main>
  );
}
