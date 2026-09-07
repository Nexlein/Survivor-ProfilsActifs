"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { buttonClasses } from "@/components/ui/Button";
import { getInteractionStats, getSentContacts, RecruiterStats, SentContact, translateApiError } from "@/lib/api";
import { usePageTitle } from "@/lib/use-page-title";

export default function RecruiterDashboardPage() {
  usePageTitle("Tableau de bord recruteur");
  const [stats, setStats] = useState<RecruiterStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [contacts, setContacts] = useState<SentContact[] | null>(null);
  const [contactsError, setContactsError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getInteractionStats()
      .then((res) => {
        if (!cancelled) setStats(res as RecruiterStats);
      })
      .catch((err) => {
        if (!cancelled) setError(translateApiError(err));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    getSentContacts()
      .then((res) => {
        if (!cancelled) setContacts(res);
      })
      .catch((err) => {
        if (!cancelled) setContactsError(translateApiError(err));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const STATS = [
    { value: stats ? String(stats.profilesViewed) : "—", label: "Profils consultés ce mois" },
    { value: stats ? String(stats.favorites) : "—", label: "Favoris enregistrés" },
    { value: stats ? String(stats.messagesSent) : "—", label: "Messages envoyés ce mois" },
  ];

  return (
    <main className="px-6 py-8">
      <h2 className="mb-5">Tableau de bord recruteur</h2>

      {error && (
        <p role="alert" className="text-error text-sm mb-4">
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {STATS.map((stat) => (
          <div key={stat.label} className="bg-white rounded-lg p-4.5 shadow-card">
            <div className="text-2xl font-extrabold text-primary font-heading">{stat.value}</div>
            <div className="text-[13px] text-text-secondary">{stat.label}</div>
          </div>
        ))}
      </div>

      <h3 className="mb-3">Mes contacts récents</h3>

      {contactsError && (
        <p role="alert" className="text-error text-sm mb-3">
          {contactsError}
        </p>
      )}

      {contacts !== null && contacts.length === 0 && !contactsError && (
        <p className="text-text-secondary text-sm">
          Vous n&apos;avez encore contacté aucun candidat.
        </p>
      )}

      {contacts !== null && contacts.length > 0 && (
        <div className="bg-white rounded-lg shadow-card overflow-x-auto">
          <div className="min-w-[720px]">
            {contacts.map((contact) => (
              <div
                key={contact.id}
                className="flex gap-3 items-center px-4 py-3 border-b border-border last:border-b-0 flex-nowrap text-[13px]"
              >
                <div className="w-8 h-8 rounded-full bg-border shrink-0" />
                <div className="flex-1 min-w-[120px] font-semibold text-text">{contact.profile.fullName}</div>
                <div className="text-text-secondary min-w-[100px]">{contact.profile.targetSector ?? "—"}</div>
                <div className="text-primary font-semibold min-w-[90px]">
                  {contact.profile.hasWorkPermit && contact.profile.certificationScore !== null
                    ? `${contact.profile.certificationScore}/1000`
                    : "Non certifié"}
                </div>
                <div className="text-text-secondary min-w-[90px]">
                  {new Date(contact.createdAt).toLocaleDateString("fr-FR")}
                </div>
                <Link
                  href={`/profils/${contact.profile.userId}`}
                  className={buttonClasses("secondary", "sm", "shrink-0")}
                >
                  Voir le profil
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
