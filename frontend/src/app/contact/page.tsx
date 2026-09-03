"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { usePageTitle } from "@/lib/use-page-title";

export default function ContactPage() {
  usePageTitle("Contact");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setNotice(
      "L'envoi de ce formulaire n'est pas encore connecté au serveur — aucune route backend n'existe pour l'instant."
    );
  }

  return (
    <main className="max-w-xl mx-auto px-6 py-12">
      <h1 className="mb-2">Contact</h1>
      <p className="text-text-secondary text-sm mb-6">
        Une question, un signalement, un problème d&apos;accessibilité ? Écrivez-nous.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-[13px] font-semibold text-text font-heading mb-1.5">
            Votre e-mail
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border border-border rounded-md px-3.5 py-2.5 text-sm focus:border-primary focus:outline-2 focus:outline-primary focus:outline-offset-2"
          />
        </div>
        <div>
          <label className="block text-[13px] font-semibold text-text font-heading mb-1.5">
            Message
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            className="w-full h-32 border border-border rounded-md px-3.5 py-2.5 text-sm focus:border-primary focus:outline-2 focus:outline-primary focus:outline-offset-2"
          />
        </div>
        {notice && <p className="text-error text-sm">{notice}</p>}
        <Button type="submit" variant="primary" className="self-start">
          Envoyer
        </Button>
      </form>
    </main>
  );
}
