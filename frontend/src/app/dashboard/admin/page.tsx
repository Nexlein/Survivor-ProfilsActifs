"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button, buttonClasses } from "@/components/ui/Button";
import {
  AdminInteractionStats,
  ModerationVideo,
  getInteractionStats,
  getModerationVideoFeed,
  moderateVideo,
  translateApiError,
} from "@/lib/api";
import { usePageTitle } from "@/lib/use-page-title";

// Nombre d'inscriptions par semaine : reste de la démonstration, aucune
// route d'agrégation temporelle n'existe côté backend pour ce graphique.
const WEEKLY_SIGNUPS = [40, 55, 35, 70, 60, 85, 50];

const PREVIEW_SIZE = 3;

export default function AdminDashboardPage() {
  usePageTitle("Tableau de bord admin");
  const [stats, setStats] = useState<AdminInteractionStats | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [pending, setPending] = useState<ModerationVideo[] | null>(null);
  const [queueError, setQueueError] = useState<string | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getInteractionStats()
      .then((res) => {
        if (!cancelled) setStats(res as AdminInteractionStats);
      })
      .catch((err) => {
        if (!cancelled) setStatsError(translateApiError(err));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    getModerationVideoFeed("PENDING")
      .then((res) => {
        if (!cancelled) setPending(res.videos.slice(0, PREVIEW_SIZE));
      })
      .catch((err) => {
        if (!cancelled) setQueueError(translateApiError(err));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleApprove(id: string) {
    setApprovingId(id);
    try {
      await moderateVideo(id, true);
      setPending((prev) => prev?.filter((v) => v.id !== id) ?? prev);
    } catch (err) {
      setQueueError(translateApiError(err));
    } finally {
      setApprovingId(null);
    }
  }

  const kpis = [
    { value: stats ? String(stats.profilesActive) : "—", label: "Profils actifs" },
    { value: stats ? `${stats.certificationRate}%` : "—", label: "Taux de certification" },
    { value: stats ? String(stats.videosPublished) : "—", label: "Vidéos publiées" },
    { value: stats ? String(stats.interactionsThisMonth) : "—", label: "Interactions ce mois" },
  ];

  return (
    <main className="px-6 py-8">
      <h2 className="mb-5">Tableau de bord admin</h2>

      {statsError && (
        <p role="alert" className="text-error text-sm mb-4">
          {statsError}
        </p>
      )}

      {stats && stats.videosPending > 0 && (
        <div className="bg-[#FFF3E9] text-action rounded-lg px-4 py-3 text-[13px] font-semibold mb-5">
          {stats.videosPending} vidéo{stats.videosPending > 1 ? "s" : ""} en attente de votre validation.
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-lg p-4.5 shadow-card">
            <div className="text-xl font-extrabold text-primary font-heading">{kpi.value}</div>
            <div className="text-xs text-text-secondary">{kpi.label}</div>
          </div>
        ))}
      </div>

      <h3 className="mb-3 hidden md:block">Nouvelles inscriptions par semaine</h3>
      <div className="hidden md:flex items-end gap-2.5 h-24 mb-8">
        {WEEKLY_SIGNUPS.map((value, i) => (
          <div
            key={i}
            className="w-7 bg-primary"
            style={{ height: `${value}%` }}
          />
        ))}
      </div>

      <div className="flex flex-wrap justify-between items-center gap-2 mb-3">
        <h3>Vidéos en attente de modération</h3>
        <Link href="/admin/moderation" className={buttonClasses("secondary", "sm")}>
          Voir tout
        </Link>
      </div>

      {queueError && (
        <p role="alert" className="text-error text-sm mb-3">
          {queueError}
        </p>
      )}

      {pending !== null && pending.length === 0 && !queueError && (
        <p className="text-text-secondary text-sm">Aucune vidéo en attente.</p>
      )}

      {pending !== null && pending.length > 0 && (
        <div className="bg-white rounded-lg shadow-card overflow-x-auto">
          <div className="min-w-[480px]">
            {pending.map((video) => (
              <div
                key={video.id}
                className="flex gap-3 items-center px-4 py-3 border-b border-border last:border-b-0 flex-nowrap text-[13px]"
              >
                <div className="flex-1 min-w-[120px] font-semibold text-text">{video.profile.fullName}</div>
                <div className="text-text-secondary min-w-[90px]">
                  {new Date(video.createdAt).toLocaleDateString("fr-FR")}
                </div>
                <Button
                  variant="success"
                  size="sm"
                  className="shrink-0"
                  disabled={approvingId === video.id}
                  onClick={() => handleApprove(video.id)}
                >
                  Approuver
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
