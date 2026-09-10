"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button, buttonClasses } from "@/components/ui/Button";
import {
  AdminInteractionStats,
  ModerationQueueUser,
  ModerationVideo,
  approveAccount,
  getInteractionStats,
  getModerationQueue,
  getModerationVideoFeed,
  moderateVideo,
  rejectAccount,
  translateApiError,
} from "@/lib/api";
import { usePageTitle } from "@/lib/use-page-title";
import { useRequireAuth } from "@/lib/use-require-auth";

const PREVIEW_SIZE = 3;

export default function AdminDashboardPage() {
  usePageTitle("Tableau de bord admin");
  const authReady = useRequireAuth(["ADMIN"]);
  const [stats, setStats] = useState<AdminInteractionStats | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [pending, setPending] = useState<ModerationVideo[] | null>(null);
  const [queueError, setQueueError] = useState<string | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const [accountQueue, setAccountQueue] = useState<ModerationQueueUser[] | null>(null);
  const [accountQueueTotal, setAccountQueueTotal] = useState(0);
  const [accountQueueError, setAccountQueueError] = useState<string | null>(null);
  const [pendingAccountActionId, setPendingAccountActionId] = useState<string | null>(null);

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

  useEffect(() => {
    let cancelled = false;
    getModerationQueue()
      .then((res) => {
        if (cancelled) return;
        setAccountQueue(res.users);
        setAccountQueueTotal(res.total);
      })
      .catch((err) => {
        if (!cancelled) setAccountQueueError(translateApiError(err));
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

  async function handleApproveAccount(userId: string) {
    setPendingAccountActionId(userId);
    try {
      await approveAccount(userId);
      setAccountQueue((prev) => prev?.filter((u) => u.id !== userId) ?? prev);
      setAccountQueueTotal((t) => Math.max(0, t - 1));
    } catch (err) {
      setAccountQueueError(translateApiError(err));
    } finally {
      setPendingAccountActionId(null);
    }
  }

  async function handleRejectAccount(userId: string) {
    setPendingAccountActionId(userId);
    try {
      await rejectAccount(userId);
      setAccountQueue((prev) => prev?.filter((u) => u.id !== userId) ?? prev);
      setAccountQueueTotal((t) => Math.max(0, t - 1));
    } catch (err) {
      setAccountQueueError(translateApiError(err));
    } finally {
      setPendingAccountActionId(null);
    }
  }

  const kpis = [
    { value: stats ? String(stats.profilesActive) : "—", label: "Profils actifs" },
    { value: stats ? `${stats.certificationRate}%` : "—", label: "Taux de certification" },
    { value: stats ? String(stats.videosPublished) : "—", label: "Vidéos publiées" },
    { value: stats ? String(stats.interactionsThisMonth) : "—", label: "Interactions ce mois" },
  ];

  if (!authReady) return null;

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
        <p className="text-text-secondary text-sm mb-8">Aucune vidéo en attente.</p>
      )}

      {pending !== null && pending.length > 0 && (
        <>
          <p className="md:hidden text-xs text-text-secondary mb-1.5">
            ← Faites glisser pour voir toutes les actions →
          </p>
          <div className="bg-white rounded-lg shadow-card overflow-x-auto mb-8">
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
        </>
      )}

      <div className="flex flex-wrap justify-between items-center gap-2 mb-3">
        <h3>Comptes en attente de validation</h3>
      </div>

      {accountQueueError && (
        <p role="alert" className="text-error text-sm mb-3">
          {accountQueueError}
        </p>
      )}

      {accountQueue !== null && accountQueue.length === 0 && !accountQueueError && (
        <p className="text-text-secondary text-sm">Aucun compte en attente.</p>
      )}

      {accountQueue !== null && accountQueue.length > 0 && (
        <>
          <p className="md:hidden text-xs text-text-secondary mb-1.5">
            ← Faites glisser pour voir toutes les actions →
          </p>
          <div className="bg-white rounded-lg shadow-card overflow-x-auto">
          <div className="min-w-[560px]">
            {accountQueue.map((item) => (
              <div
                key={item.id}
                className="flex gap-3 items-center px-4 py-3 border-b border-border last:border-b-0 flex-nowrap text-[13px]"
              >
                <div className="flex-1 min-w-[120px] font-semibold text-text">
                  {item.profile?.fullName ?? item.email}
                </div>
                <div className="text-text-secondary min-w-[90px]">
                  {new Date(item.createdAt).toLocaleDateString("fr-FR")}
                </div>
                <div className="min-w-[90px]">En attente</div>
                <Link href={`/profils/${item.id}`} className={buttonClasses("secondary", "sm")}>
                  Voir le profil
                </Link>
                <Button
                  variant="success"
                  size="sm"
                  className="shrink-0"
                  disabled={pendingAccountActionId === item.id}
                  onClick={() => handleApproveAccount(item.id)}
                >
                  Valider
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="shrink-0"
                  disabled={pendingAccountActionId === item.id}
                  onClick={() => handleRejectAccount(item.id)}
                >
                  Rejeter
                </Button>
              </div>
            ))}
          </div>
          </div>
        </>
      )}
      {accountQueue !== null && accountQueueTotal > accountQueue.length && (
        <p className="text-text-secondary text-xs mt-2">
          {accountQueueTotal - accountQueue.length} de plus non affichés.
        </p>
      )}
    </main>
  );
}
