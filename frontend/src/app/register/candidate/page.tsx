"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { login, register, setToken, setUser, translateApiError } from "@/lib/api";
import { usePageTitle } from "@/lib/use-page-title";

const STEP_LABELS = ["Compte", "Identité", "Compétences", "Consentement"];
const SECTORS = ["Informatique", "Logistique", "Commerce"];

function isAtLeast16(dateOfBirth: string): boolean {
  if (!dateOfBirth) return true;
  const dob = new Date(dateOfBirth);
  const ageDate = new Date(Date.now() - dob.getTime());
  const age = Math.abs(ageDate.getUTCFullYear() - 1970);
  return age >= 16;
}

export default function CandidateRegisterPage() {
  usePageTitle("Inscription candidat");
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [sector, setSector] = useState(SECTORS[0]);
  const [location, setLocation] = useState("");

  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState<string[]>([]);

  const [consent1, setConsent1] = useState(false);
  const [consent2, setConsent2] = useState(false);

  const stepHeadingRef = useRef<HTMLHeadingElement>(null);

  // Déplace le focus clavier sur le titre de chaque étape lors d'un
  // changement d'étape : sans ça, le focus reste "perdu" (sur le bouton
  // précédent, démonté par le rendu conditionnel), ce qui viole RGAA 2.1
  // (perte de focus) pour les utilisateurs clavier/lecteur d'écran.
  useEffect(() => {
    stepHeadingRef.current?.focus();
  }, [step]);

  function goNext() {
    setError(null);

    if (step === 1) {
      if (!email.trim() || !password || !confirmPassword || !dateOfBirth) {
        setError("Merci de remplir tous les champs.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Les mots de passe ne correspondent pas.");
        return;
      }
      if (!isAtLeast16(dateOfBirth)) {
        setError("Les personnes de moins de 16 ans ne peuvent pas s'inscrire.");
        return;
      }
    }

    if (step === 2) {
      if (!firstName.trim() || !lastName.trim() || !location.trim()) {
        setError("Merci de remplir tous les champs.");
        return;
      }
    }

    if (step === 3) {
      if (skills.length === 0) {
        setError("Ajoutez au moins une compétence.");
        return;
      }
    }

    setStep((s) => Math.min(s + 1, 4));
  }

  function goPrev() {
    setError(null);
    setStep((s) => Math.max(s - 1, 1));
  }

  function addSkill() {
    const value = skillInput.trim();
    if (!value || skills.includes(value) || skills.length >= 10) return;
    setSkills((s) => [...s, value]);
    setSkillInput("");
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await register({
        email,
        password,
        fullName: `${firstName} ${lastName}`.trim(),
        role: "JOB_SEEKER",
        dateOfBirth: dateOfBirth || undefined,
      });
      const { token, user } = await login(email, password);
      setToken(token);
      setUser(user);
      router.push("/");
    } catch (err) {
      setError(translateApiError(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex justify-center px-6 py-12">
      <form onSubmit={handleSubmit} className="w-full max-w-md">
        <div className="mb-7">
          <div className="flex justify-between text-xs text-text-secondary mb-1.5">
            {STEP_LABELS.map((label, index) => (
              <span key={label} aria-current={step === index + 1 ? "step" : undefined}>
                {label}
              </span>
            ))}
          </div>
          <div className="h-1 bg-border rounded-full">
            <div
              className="h-1 bg-primary rounded-full transition-[width]"
              style={{ width: `${(step / STEP_LABELS.length) * 100}%` }}
            />
          </div>
        </div>

        {step === 1 && (
          <div className="flex flex-col gap-4">
            <h2 ref={stepHeadingRef} tabIndex={-1}>Créer un compte</h2>
            <Input
              id="email"
              type="email"
              label="Adresse e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              id="password"
              type="password"
              label="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Input
              id="confirm-password"
              type="password"
              label="Confirmer le mot de passe"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <Input
              id="date-of-birth"
              type="date"
              label="Date de naissance"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              required
            />
            <p className="text-error text-xs -mt-2">
              Les personnes de moins de 16 ans ne peuvent pas s&apos;inscrire. Les 16-18 ans relèvent
              d&apos;un régime spécifique.
            </p>
            {error && <p role="alert" className="text-error text-sm">{error}</p>}
            <Button type="button" variant="primary" onClick={goNext} className="self-start">
              Suivant →
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-4">
            <h2 ref={stepHeadingRef} tabIndex={-1}>Votre identité</h2>
            <Input
              id="first-name"
              label="Prénom"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
            <Input
              id="last-name"
              label="Nom"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
            <div>
              <label htmlFor="sector" className="block text-[13px] font-semibold text-text font-heading mb-1.5">
                Secteur recherché
              </label>
              <select
                id="sector"
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                className="w-full border border-border rounded-md px-3.5 py-2.5 text-sm focus:border-primary focus:outline-2 focus:outline-primary focus:outline-offset-2"
              >
                {SECTORS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <Input
              id="location"
              label="Localisation"
              placeholder="Ville ou code postal"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
            {error && <p role="alert" className="text-error text-sm">{error}</p>}
            <div className="flex gap-3">
              <Button type="button" variant="secondary" onClick={goPrev}>
                ← Retour
              </Button>
              <Button type="button" variant="primary" onClick={goNext}>
                Suivant →
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-4">
            <h2 ref={stepHeadingRef} tabIndex={-1}>Vos compétences</h2>
            <input
              placeholder="Rechercher une compétence…"
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
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="bg-chip-bg text-chip-text rounded-full px-3 py-1.5 text-sm font-semibold font-heading"
                >
                  {skill}{" "}
                  <button
                    type="button"
                    onClick={() => setSkills((s) => s.filter((x) => x !== skill))}
                    aria-label={`Retirer ${skill}`}
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
            <p className="text-text-secondary text-xs">Maximum 10 compétences.</p>
            {error && <p role="alert" className="text-error text-sm">{error}</p>}
            <div className="flex gap-3">
              <Button type="button" variant="secondary" onClick={goPrev}>
                ← Retour
              </Button>
              <Button type="button" variant="primary" onClick={goNext}>
                Suivant →
              </Button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="flex flex-col gap-4">
            <h2 ref={stepHeadingRef} tabIndex={-1}>Vos données et vos droits</h2>
            <div className="bg-bg-secondary rounded-lg p-4 text-sm text-text">
              En publiant une vidéo sur ProfilsActifs, vous consentez à ce que votre image et votre
              voix soient visibles publiquement. Ce consentement est révocable à tout moment depuis
              votre profil. La révocation entraîne la suppression définitive du fichier vidéo.
            </div>
            <Checkbox
              id="consent-cgu"
              wrapperClassName="items-start"
              className="mt-0.5"
              checked={consent1}
              onChange={(e) => setConsent1(e.target.checked)}
              label={
                <span>
                  J&apos;ai lu et j&apos;accepte les{" "}
                  <a href="/cgu" target="_blank" rel="noopener noreferrer">
                    Conditions Générales d&apos;Utilisation
                  </a>.
                </span>
              }
            />
            <Checkbox
              id="consent-video"
              wrapperClassName="items-start"
              className="mt-0.5"
              checked={consent2}
              onChange={(e) => setConsent2(e.target.checked)}
              label="J'ai compris que la révocation de mon consentement vidéo entraîne la suppression définitive de mes vidéos."
            />
            {error && <p role="alert" className="text-error text-sm">{error}</p>}
            <div className="flex gap-3 items-center">
              <Button type="button" variant="secondary" onClick={goPrev}>
                ← Retour
              </Button>
              <Button type="submit" variant="primary" disabled={!consent1 || !consent2 || isSubmitting}>
                {isSubmitting ? "Création..." : "Créer mon compte"}
              </Button>
            </div>
            <p className="text-text-secondary text-[11px]">
              Texte de consentement v1.2 — horodatage enregistré à la création du compte.
            </p>
          </div>
        )}
      </form>
    </main>
  );
}
