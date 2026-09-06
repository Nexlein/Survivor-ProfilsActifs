"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { getNotifications, markNotificationRead, Notification, translateApiError } from "@/lib/api";
import { usePageTitle } from "@/lib/use-page-title";

const FILTERS = [
  { id: "all", label: "Toutes" },
  { id: "unread", label: "Non lues" },
  { id: "seen", label: "Vues" },
  { id: "contact", label: "Contacts" },
] as const;

type FilterId = (typeof FILTERS)[number]["id"];

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "à l'instant";
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  return `il y a ${days} j`;
}

function recruiterLabel(n: Notification): string {
  return n.recruiter.profile?.companyName || n.recruiter.profile?.fullName || "Un recruteur";
}

export default function NotificationsPage() {
  usePageTitle("Notifications");
  const [filter, setFilter] = useState<FilterId>("all");
  const [notifications, setNotifications] = useState<Notification[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getNotifications()
      .then((res) => {
        if (!cancelled) setNotifications(res);
      })
      .catch((err) => {
        if (!cancelled) setError(translateApiError(err));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleMarkRead(id: string) {
    setNotifications((prev) => prev?.map((n) => (n.id === id ? { ...n, read: true } : n)) ?? prev);
    try {
      await markNotificationRead(id);
    } catch {
      // best-effort — a failed read-state sync isn't worth surfacing here
    }
  }

  const filtered = (notifications ?? []).filter((n) => {
    if (filter === "all") return true;
    if (filter === "unread") return !n.read;
    if (filter === "seen") return n.type === "VIEW";
    if (filter === "contact") return n.type === "CONTACT";
    return true;
  });

  return (
    <main className="max-w-2xl mx-auto px-6 py-8">
      <h2 className="mb-4">Mes notifications</h2>
      <div className="flex gap-2 flex-wrap mb-5">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-4 py-2 rounded-md text-sm font-semibold font-heading border ${
              filter === f.id
                ? "bg-primary text-white border-primary"
                : "bg-white text-text border-border"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error && (
        <p role="alert" className="text-error text-sm mb-4">
          {error}
        </p>
      )}

      {notifications === null && !error && <p className="text-text-secondary text-sm">Chargement...</p>}

      <div className="flex flex-col gap-2.5">
        {notifications !== null && filtered.length === 0 && (
          <p className="text-text-secondary text-sm">Aucune notification pour ce filtre.</p>
        )}
        {filtered.map((n) => (
          <div
            key={n.id}
            className={`rounded-lg p-3.5 flex gap-3 items-start ${
              n.read ? "bg-white border border-border" : "bg-chip-bg"
            }`}
          >
            <span className={n.type === "CONTACT" ? "text-action text-lg" : "text-primary text-lg"}>
              {n.type === "CONTACT" ? "✉" : "👁"}
            </span>
            <div className="flex-1">
              <p className={`text-sm m-0 ${n.read ? "text-text-secondary" : "text-text"}`}>
                {n.type === "CONTACT"
                  ? `${recruiterLabel(n)} vous a envoyé un message`
                  : `${recruiterLabel(n)} a consulté votre profil`}
              </p>
              {n.type === "CONTACT" && n.message && (
                <p className="text-sm text-text-secondary mt-1 whitespace-pre-line">{n.message}</p>
              )}
              <p className="text-xs text-text-secondary mt-1">{relativeTime(n.createdAt)}</p>
              {!n.read && (
                <button
                  onClick={() => handleMarkRead(n.id)}
                  className="text-xs font-semibold text-primary mt-1.5 underline"
                >
                  Marquer comme lu
                </button>
              )}
            </div>
            {n.type === "VIEW" && !n.read && <Badge variant="vue">Vue</Badge>}
            {n.type === "CONTACT" && <Badge variant="contact">Contact</Badge>}
          </div>
        ))}
      </div>
    </main>
  );
}
