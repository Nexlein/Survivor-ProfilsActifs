"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { usePageTitle } from "@/lib/use-page-title";

export default function ForgotPasswordPage() {
  usePageTitle("Mot de passe oublié");
  const [email, setEmail] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setNotice(
      "La réinitialisation de mot de passe n'est pas encore connectée au serveur — aucune route backend n'existe pour l'instant."
    );
  }

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-12">
      <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col gap-4">
        <h2>Mot de passe oublié</h2>
        <p className="text-text-secondary text-sm">
          Indiquez votre adresse e-mail, nous vous enverrons un lien pour réinitialiser votre mot de
          passe.
        </p>
        <Input
          id="email"
          type="email"
          label="Adresse e-mail"
          placeholder="votre@email.fr"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        {notice && <p className="text-error text-sm">{notice}</p>}
        <Button type="submit" variant="primary">
          Envoyer le lien
        </Button>
        <Link href="/login" className="text-sm text-center">
          Retour à la connexion
        </Link>
      </form>
    </main>
  );
}
