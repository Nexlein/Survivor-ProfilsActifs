"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

const MIN_LENGTH = 50;

type ContactModalProps = {
  isOpen: boolean;
  onClose: () => void;
  candidateName: string;
};

export function ContactModal({ isOpen, onClose, candidateName }: ContactModalProps) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  function handleSend() {
    if (message.length < MIN_LENGTH) return;
    setNotice(
      "L'envoi de message n'est pas encore connecté au serveur — aucune route backend n'existe pour l'instant (voir le modèle Prisma \"Interaction\", non exposé par l'API)."
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Contacter ${candidateName}`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button variant="primary" onClick={handleSend} disabled={message.length < MIN_LENGTH}>
            Envoyer le message
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3.5 text-left">
        <div>
          <label className="block text-[13px] font-semibold text-text font-heading mb-1.5">
            Objet
          </label>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full border border-border rounded-md px-3.5 py-2.5 text-sm focus:border-primary focus:outline-2 focus:outline-primary focus:outline-offset-2"
          />
        </div>
        <div>
          <label className="block text-[13px] font-semibold text-text font-heading mb-1.5">
            Votre message
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full h-28 border border-border rounded-md px-3.5 py-2.5 text-sm focus:border-primary focus:outline-2 focus:outline-primary focus:outline-offset-2"
          />
          <p className="text-[11px] text-text-secondary mt-1.5">
            Minimum {MIN_LENGTH} caractères — {message.length}/{MIN_LENGTH}
          </p>
        </div>
        <p className="text-xs text-text-secondary">
          Votre message sera transmis au candidat par notification. Il pourra y répondre depuis son
          espace.
        </p>
        {notice && <p className="text-error text-sm">{notice}</p>}
      </div>
    </Modal>
  );
}
