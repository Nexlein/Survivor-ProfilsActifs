"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { logInteraction, translateApiError } from "@/lib/api";

const MIN_LENGTH = 50;

type ContactModalProps = {
  isOpen: boolean;
  onClose: () => void;
  candidateName: string;
  profileId: string;
};

export function ContactModal({ isOpen, onClose, candidateName, profileId }: ContactModalProps) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSend() {
    if (message.length < MIN_LENGTH || !subject.trim()) return;
    setIsSending(true);
    setError(null);
    try {
      await logInteraction({
        profileId,
        type: "CONTACT",
        subject: subject.trim(),
        message: message.trim(),
      });
      setSent(true);
    } catch (err) {
      setError(translateApiError(err));
    } finally {
      setIsSending(false);
    }
  }

  function handleClose() {
    setSubject("");
    setMessage("");
    setError(null);
    setSent(false);
    onClose();
  }

  if (sent) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title={`Contacter ${candidateName}`}
        footer={
          <Button variant="primary" onClick={handleClose}>
            Fermer
          </Button>
        }
      >
        <p className="text-success text-sm">
          Votre message a bien été envoyé par e-mail (simulation) à {candidateName}. Il/elle pourra
          vous répondre directement depuis sa boîte de réception.
        </p>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Contacter ${candidateName}`}
      footer={
        <>
          <Button variant="secondary" onClick={handleClose}>
            Annuler
          </Button>
          <Button variant="primary" onClick={handleSend} disabled={message.length < MIN_LENGTH || !subject.trim() || isSending}>
            {isSending ? "Envoi..." : "Envoyer le message"}
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
          Votre message sera envoyé par e-mail au candidat. Il pourra vous répondre
          directement depuis sa boîte de réception.
        </p>
        {error && (
          <p role="alert" className="text-error text-sm">
            {error}
          </p>
        )}
      </div>
    </Modal>
  );
}
