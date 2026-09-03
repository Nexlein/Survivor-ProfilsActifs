"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { login, register, setToken, setUser, translateApiError } from "@/lib/api";
import { usePageTitle } from "@/lib/use-page-title";

export default function RecruiterRegisterPage() {
  usePageTitle("Inscription recruteur");
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [sector, setSector] = useState("");
  const [position, setPosition] = useState("");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setIsSubmitting(true);
    try {
      await register({ email, password, fullName, role: "RECRUITER" });
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
      <form onSubmit={handleSubmit} className="w-full max-w-md flex flex-col gap-4">
        <h2>Créer un compte recruteur</h2>

        <Input
          id="full-name"
          label="Votre nom complet"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
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
          id="company-name"
          label="Nom de l'entreprise"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          required
        />
        <Input
          id="sector"
          label="Secteur d'activité"
          value={sector}
          onChange={(e) => setSector(e.target.value)}
          required
        />
        <Input
          id="position"
          label="Poste occupé"
          value={position}
          onChange={(e) => setPosition(e.target.value)}
          required
        />

        {error && <p role="alert" className="text-error text-sm">{error}</p>}

        <Button type="submit" variant="primary" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Création..." : "Créer mon compte"}
        </Button>
      </form>
    </main>
  );
}
