"use client";

import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Modal } from "@/components/ui/Modal";
import {
  Profile,
  clearToken,
  clearUser,
  deleteAccount,
  exportMyData,
  getMyProfile,
  resolveAvatarUrl,
  translateApiError,
  updateProfile,
  uploadAvatar,
  useCurrentUser,
} from "@/lib/api";
import { usePageTitle } from "@/lib/use-page-title";

export default function EditProfilePage() {
  usePageTitle("Modifier mon profil");
  const router = useRouter();
  const currentUser = useCurrentUser();
  const isEditableRole = !currentUser || currentUser.role === "JOB_SEEKER" || currentUser.role === "RECRUITER";
  const isRecruiter = currentUser?.role === "RECRUITER";
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(isEditableRole);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [fullName, setFullName] = useState("");
  const [sector, setSector] = useState("");
  const [location, setLocation] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [position, setPosition] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [bio, setBio] = useState("");
  const [visible, setVisible] = useState(true);

  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  function addSkill() {
    const value = skillInput.trim();
    if (!value || skills.includes(value) || skills.length >= 10) return;
    setSkills((s) => [...s, value]);
    setSkillInput("");
  }

  useEffect(() => {
    if (!isEditableRole) return;

    getMyProfile()
      .then((p) => {
        if (!p) {
          setLoadError("Profil introuvable.");
          return;
        }
        setProfile(p);
        setFullName(p.fullName);
        setSector(p.targetSector ?? "");
        setLocation(p.location ?? "");
        setSkills((p.skills ?? []).map((s) => s.name));
        setBio(p.bio ?? "");
        setVisible(p.visible ?? true);
        setCompanyName(p.companyName ?? "");
        setIndustry(p.industry ?? "");
        setPosition(p.position ?? "");
        const resolvedAvatar = resolveAvatarUrl(p.avatarUrl);
        if (resolvedAvatar) setPhotoPreview(resolvedAvatar);
      })
      .catch((err) => setLoadError(translateApiError(err)))
      .finally(() => setIsLoading(false));
  }, [isEditableRole]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!profile) return;
    setError(null);
    setIsSubmitting(true);

    try {
      if (photoFile) {
        await uploadAvatar(photoFile);
      }
      await updateProfile({
        fullName,
        targetSector: sector,
        location,
        bio,
        skills,
        visible,
        ...(isRecruiter ? { companyName, industry, position } : {}),
      });
      router.push(`/profils/${profile.userId}`);
    } catch (err) {
      setError(translateApiError(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleExportData() {
    setIsExporting(true);
    setExportError(null);
    try {
      const res = await exportMyData();
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `profilsactifs-mes-donnees-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setExportError(translateApiError(err));
    } finally {
      setIsExporting(false);
    }
  }

  async function handleDelete() {
    setIsDeleting(true);
    try {
      await deleteAccount();
      clearToken();
      clearUser();
      router.push("/");
    } catch (err) {
      setError(translateApiError(err));
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  }

  if (!isEditableRole) {
    return (
      <main className="p-12 text-center text-error">
        Cette page est réservée aux profils candidats et recruteurs.
      </main>
    );
  }

  if (isLoading) {
    return <main className="p-12 text-center text-text-secondary">Chargement...</main>;
  }

  if (loadError || !profile) {
    return <main className="p-12 text-center text-error">{loadError ?? "Profil introuvable."}</main>;
  }

  return (
    <main className="w-full max-w-xl mx-auto px-6 py-12">
      <h2 className="mb-6">Modifier mon profil</h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex items-center gap-4 mb-2">
          <div
            className="w-16 h-16 rounded-full bg-border bg-cover bg-center"
            style={photoPreview ? { backgroundImage: `url(${photoPreview})` } : undefined}
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            className="hidden"
          />
          <Button type="button" variant="secondary" onClick={() => fileInputRef.current?.click()}>
            Changer la photo
          </Button>
        </div>
        {photoFile && (
          <p className="text-text-secondary text-xs -mt-2">
            Nouvelle photo sélectionnée — elle sera envoyée à l'enregistrement.
          </p>
        )}

        <Input
          id="full-name"
          label="Prénom / Nom"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
        {isRecruiter ? (
          <>
            <Input
              id="company-name"
              label="Nom de l'entreprise"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
            <Input
              id="industry"
              label="Secteur d'activité"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
            />
            <Input
              id="position"
              label="Poste occupé"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
            />
          </>
        ) : (
          <>
            <Input id="sector" label="Secteur" value={sector} onChange={(e) => setSector(e.target.value)} />
            <Input
              id="location"
              label="Localisation"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />

            <div>
              <label htmlFor="skill-input" className="block text-[13px] font-semibold text-text font-heading mb-1.5">
                Compétences
              </label>
              <input
                id="skill-input"
                placeholder="Ajouter une compétence…"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSkill();
                  }
                }}
                className="w-full border border-border rounded-md px-3.5 py-2.5 text-sm focus:border-primary focus:outline-2 focus:outline-primary focus:outline-offset-2"
              />
              {skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2.5">
                  {skills.map((skill) => (
                    <Chip key={skill} onRemove={() => setSkills((s) => s.filter((x) => x !== skill))}>
                      {skill}
                    </Chip>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {!isRecruiter && (
          <div>
            <label htmlFor="bio" className="block text-[13px] font-semibold text-text font-heading mb-1.5">
              À propos
            </label>
            <textarea
              id="bio"
              rows={4}
              placeholder="Présentez-vous en quelques lignes…"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full border border-border rounded-md px-3.5 py-2.5 text-sm focus:border-primary focus:outline-2 focus:outline-primary focus:outline-offset-2"
            />
          </div>
        )}

        {error && <p role="alert" className="text-error text-sm">{error}</p>}

        <Button type="submit" variant="primary" disabled={isSubmitting} className="self-start">
          {isSubmitting ? "Enregistrement..." : "Enregistrer les modifications"}
        </Button>
      </form>

      {!isRecruiter && (
        <div className="mt-8 pt-6 border-t border-border">
          <h3 className="mb-1.5">Visibilité du profil</h3>
          <p className="text-text-secondary text-sm mb-3">
            Si vous désactivez cette option, votre profil sera retiré du catalogue public,
            des listes de recherche et ne sera plus consultable par les recruteurs.
          </p>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={visible}
              onChange={(e) => setVisible(e.target.checked)}
              className="w-5 h-5 rounded text-primary focus:ring-primary"
            />
            <span className="text-sm font-semibold">Publier mon profil dans le catalogue</span>
          </label>
        </div>
      )}

      <div className="mt-8 pt-6 border-t border-border">
        <h3 className="mb-1.5">Vos données</h3>
        <p className="text-text-secondary text-sm mb-3">
          Conformément au RGPD, vous pouvez télécharger une copie de toutes les données que
          ProfilsActifs détient sur vous (profil, vidéos, interactions, historique de connexion).
        </p>
        <Button type="button" variant="secondary" size="sm" onClick={handleExportData} disabled={isExporting}>
          {isExporting ? "Préparation..." : "Exporter mes données (JSON)"}
        </Button>
        {exportError && (
          <p role="alert" className="text-error text-sm mt-2">
            {exportError}
          </p>
        )}
      </div>

      <div className="mt-8 pt-6 border-t border-border">
        <button
          type="button"
          onClick={() => setIsDeleteModalOpen(true)}
          className="text-error text-sm"
        >
          Supprimer mon compte
        </button>
      </div>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Supprimer mon compte"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Suppression..." : "Supprimer définitivement"}
            </Button>
          </>
        }
      >
        Cette action est définitive : votre profil, vos vidéos et vos données seront supprimés.
      </Modal>
    </main>
  );
}
