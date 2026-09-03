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
  const isEditableRole = !currentUser || currentUser.role === "JOB_SEEKER";
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(isEditableRole);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [fullName, setFullName] = useState("");
  const [sector, setSector] = useState("");
  const [location, setLocation] = useState("");

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
      await updateProfile({ fullName, targetSector: sector, location });
      router.push(`/profils/${profile.userId}`);
    } catch (err) {
      setError(translateApiError(err));
    } finally {
      setIsSubmitting(false);
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
        Cette page est réservée aux profils candidats. Les comptes recruteur n&apos;ont pas encore de
        profil éditable.
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
    <main className="max-w-xl mx-auto px-6 py-12">
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
            Nouvelle photo sélectionnée — elle sera envoyée à l&apos;enregistrement.
          </p>
        )}

        <Input
          id="full-name"
          label="Prénom / Nom"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
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
          <p className="text-text-secondary text-xs mt-1.5">
            Modification des compétences pas encore connectée au serveur — l&apos;API ne permet pas
            encore de les mettre à jour depuis cette page.
          </p>
        </div>

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
          <p className="text-text-secondary text-xs mt-1.5">
            Section pas encore connectée au serveur — ce champ n&apos;existe pas encore dans la base de
            données.
          </p>
        </div>

        {error && <p role="alert" className="text-error text-sm">{error}</p>}

        <Button type="submit" variant="primary" disabled={isSubmitting} className="self-start">
          {isSubmitting ? "Enregistrement..." : "Enregistrer les modifications"}
        </Button>
      </form>

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
