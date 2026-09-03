"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button, buttonClasses } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Tabs } from "@/components/ui/Tabs";
import { ContactModal } from "@/components/profile/ContactModal";
import { Profile, getProfileByUserId, getUser, resolveAvatarUrl, translateApiError } from "@/lib/api";
import { usePageTitle } from "@/lib/use-page-title";

export default function PublicProfilePage() {
  const params = useParams<{ id: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isContactOpen, setIsContactOpen] = useState(false);

  usePageTitle(profile ? profile.fullName : "Profil");

  useEffect(() => {
    getProfileByUserId(params.id)
      .then(setProfile)
      .catch((err) => setError(translateApiError(err)))
      .finally(() => setIsLoading(false));
  }, [params.id]);

  if (isLoading) {
    return (
      <main className="p-12 text-center text-text-secondary">Chargement...</main>
    );
  }

  if (error || !profile) {
    return (
      <main className="p-12 text-center flex flex-col items-center gap-3">
        <p className="text-error">{error ?? "Profil introuvable."}</p>
        {error?.includes("connecté") && (
          <Link href="/login" className={buttonClasses("primary")}>
            Se connecter
          </Link>
        )}
      </main>
    );
  }

  const currentUser = getUser();
  const isOwner = currentUser?.id === profile.userId;
  const skills = profile.skills ?? [];

  return (
    <main className="flex flex-col lg:flex-row gap-8 p-6 sm:p-12 max-w-5xl mx-auto">
      <aside className="flex-none w-full lg:max-w-[260px]">
        <div className="w-[110px] h-[110px] rounded-full bg-border mx-auto mb-3 overflow-hidden">
          {resolveAvatarUrl(profile.avatarUrl) && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={resolveAvatarUrl(profile.avatarUrl)} alt="" className="w-full h-full object-cover" />
          )}
        </div>
        <h2 className="text-center mb-1">{profile.fullName}</h2>
        {profile.targetSector && (
          <p className="text-center italic font-body text-sm text-text-secondary mb-1.5">
            {profile.targetSector}
          </p>
        )}
        {profile.location && (
          <p className="text-center text-[13px] text-text-secondary mb-3">📍 {profile.location}</p>
        )}

        {profile.hasWorkPermit ? (
          <div className="mb-4">
            <Badge variant="success">★ Certifié JEB</Badge>
            {profile.certificationScore !== null && (
              <p className="text-center text-[13px] text-text-secondary mt-1.5">
                Score : {profile.certificationScore}/100
              </p>
            )}
          </div>
        ) : (
          <div className="bg-bg-secondary text-text-secondary rounded-md py-2.5 text-center font-semibold mb-4">
            Certification en cours
          </div>
        )}

        {isOwner && (
          <div className="flex flex-col gap-2 mb-4">
            <Link href="/profile/edit" className={buttonClasses("secondary", "md", "w-full")}>
              Modifier mon profil
            </Link>
          </div>
        )}

        {!isOwner && currentUser?.role === "RECRUITER" && (
          <div className="mb-4">
            <Button variant="primary" className="w-full" onClick={() => setIsContactOpen(true)}>
              Contacter ce candidat
            </Button>
          </div>
        )}
      </aside>

      <section className="flex-1 min-w-0">
        <Tabs
          tabs={[
            {
              id: "video",
              label: "Vidéo",
              content:
                profile.videos && profile.videos.length > 0 ? (
                  <div>Vidéo disponible.</div>
                ) : (
                  <p>Aucune vidéo publiée pour l&apos;instant.</p>
                ),
            },
            {
              id: "skills",
              label: "Compétences",
              content:
                skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill) => (
                      <Chip key={skill.id}>{skill.name}</Chip>
                    ))}
                  </div>
                ) : (
                  <p>Aucune compétence renseignée pour l&apos;instant.</p>
                ),
            },
            {
              id: "about",
              label: "À propos",
              content: profile.bio ? (
                <p className="whitespace-pre-line">{profile.bio}</p>
              ) : (
                <p>Aucune présentation renseignée pour l&apos;instant.</p>
              ),
            },
          ]}
        />
      </section>

      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
        candidateName={profile.fullName}
      />
    </main>
  );
}
