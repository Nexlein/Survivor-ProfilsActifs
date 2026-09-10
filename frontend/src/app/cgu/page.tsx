import type { Metadata } from "next";

export const metadata: Metadata = { title: "CGU" };

export default function CguPage() {
  return (
    <main className="w-full max-w-2xl mx-auto px-6 py-12">
      <h1 className="mb-2">Conditions Générales dUtilisation</h1>
      <p className="text-text-secondary text-sm mb-6">
        Bienvenue sur ProfilsActifs, l'espace de mise en relation professionnelle du Ministère du Job et Bonheur.
      </p>

      <div className="flex flex-col gap-6 font-body text-[15px] leading-6 text-text">
        <section>
          <h2 className="mb-2 text-xl font-bold">1. Notre mission</h2>
          <p>
            ProfilsActifs a été conçu pour simplifier votre recherche d'emploi ou de talents. 
            Notre plateforme permet aux candidats de mettre en valeur leurs compétences à travers la vidéo, 
            et offre aux recruteurs un outil simple pour découvrir des profils inspirants.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-bold">2. Accès et inscription</h2>
          <p>
            Pour vous inscrire, <strong>vous devez avoir au moins 16 ans</strong>. 
            Afin de garantir un environnement sûr et adapté, nous vous demandons de renseigner votre date de naissance lors de la création de votre compte (cette étape est obligatoire). 
            Si vous avez entre 16 et 18 ans, votre profil bénéficie de protections spécifiques (il n'est visible que par les recruteurs authentifiés).
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-bold">3. Vos données et votre sécurité</h2>
          <p>
            Votre confiance est essentielle. Nous protégeons vos données personnelles avec les meilleurs standards de sécurité de l'État. 
            Vous restez propriétaire de votre contenu : vous pouvez à tout moment décider de supprimer votre vidéo ou votre compte. 
            La suppression est alors immédiate et définitive sur nos serveurs.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-bold">4. Certification et Indépendance</h2>
          <p>
            Le badge de certification, obtenu suite à notre questionnaire, a pour but exclusif de valoriser votre profil auprès des recruteurs.
          </p>
          <p className="font-semibold text-error mt-2">
            Important : Aucune donnée de ce service n'est utilisée pour déterminer vos droits ni le montant de vos allocations.
          </p>
          <p className="mt-1">
            ProfilsActifs est un outil exclusif de mise en relation. Votre utilisation de la plateforme n'a aucun impact, positif ou négatif, sur le versement de vos prestations sociales.
          </p>
        </section>
      </div>
    </main>
  );
}
