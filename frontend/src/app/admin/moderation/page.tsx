"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button, buttonClasses } from "@/components/ui/Button";
import { VideoPlayer } from "@/components/profile/VideoPlayer";
import {
  AccountModerationStatus,
  ModerationQueueUser,
  ModerationVideo,
  approveAccount,
  getModerationQueue,
  getModerationVideoFeed,
  moderateVideo,
  rejectAccount,
  resolveAvatarUrl,
  suspendAccount,
  translateApiError,
} from "@/lib/api";
import { usePageTitle } from "@/lib/use-page-title";
import { useRequireAuth } from "@/lib/use-require-auth";

type VideoStatusFilter = "PENDING" | "APPROVED" | "REJECTED";
type Resource = "videos" | "accounts";

const RESOURCE_LABELS: Record<Resource, string> = {
  videos: "Vidéos",
  accounts: "Comptes",
};

const VIDEO_STATUS_LABELS: Record<VideoStatusFilter, string> = {
  PENDING: "En attente",
  APPROVED: "Approuvées",
  REJECTED: "Rejetées",
};

const ACCOUNT_STATUS_LABELS: Record<AccountModerationStatus, string> = {
  PENDING: "En attente",
  APPROVED: "Approuvés",
  REJECTED: "Rejetés",
  SUSPENDED: "Bannis",
};

const TYPE_LABELS: Record<"LINK" | "UPLOAD", string> = {
  LINK: "Lien externe",
  UPLOAD: "Fichier importé",
};

// Shared column template so the header row and every data row line up
// exactly regardless of content length (a flex row with per-cell min-widths
// drifts as soon as one cell's content is wider than its neighbour's).
const ROW_GRID = "grid grid-cols-[40px_minmax(140px,1.4fr)_120px_100px_1fr] gap-3 items-center px-4";
const ACCOUNT_ROW_GRID = "grid grid-cols-[40px_minmax(160px,1.4fr)_120px_1fr] gap-3 items-center px-4";

function ResourceSwitcher({ resource, onChange }: { resource: Resource; onChange: (r: Resource) => void }) {
  return (
    <div className="flex gap-2 flex-wrap mb-5">
      {(Object.keys(RESOURCE_LABELS) as Resource[]).map((r) => (
        <button
          key={r}
          type="button"
          onClick={() => onChange(r)}
          className={`rounded-md px-4 py-2 text-sm font-semibold font-heading border ${
            resource === r ? "bg-primary text-white border-primary" : "bg-white text-text border-border"
          }`}
        >
          {RESOURCE_LABELS[r]}
        </button>
      ))}
    </div>
  );
}

function VideoModerationView() {
  const [status, setStatus] = useState<VideoStatusFilter>("PENDING");
  const [page, setPage] = useState(1);
  const [videos, setVideos] = useState<ModerationVideo[] | null>(null);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [pendingActionId, setPendingActionId] = useState<string | null>(null);
  // No separate isLoading state to set synchronously on every filter/page
  // change — derived instead from whether the currently-rendered data
  // matches the requested query (same pattern as profils/page.tsx).
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const currentKey = `${status}:${page}`;
  const isLoading = loadedKey !== currentKey;

  // Changing the status filter re-queries from page 1 — a page number
  // that made sense for one status queue rarely exists in another.
  function changeStatus(next: VideoStatusFilter) {
    setStatus(next);
    setPage(1);
  }

  useEffect(() => {
    let cancelled = false;
    getModerationVideoFeed(status, page)
      .then((res) => {
        if (cancelled) return;
        setVideos(res.videos);
        setTotal(res.total);
        setPageSize(res.pageSize);
        setError(null);
        setLoadedKey(`${status}:${page}`);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(translateApiError(err));
        setLoadedKey(`${status}:${page}`);
      });
    return () => {
      cancelled = true;
    };
  }, [status, page]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  async function handleApprove(id: string) {
    setPendingActionId(id);
    try {
      await moderateVideo(id, true);
      setVideos((prev) => prev?.filter((v) => v.id !== id) ?? prev);
      setTotal((t) => Math.max(0, t - 1));
    } catch (err) {
      setError(translateApiError(err));
    } finally {
      setPendingActionId(null);
    }
  }

  async function handleReject(id: string) {
    if (!reason.trim()) return;
    setPendingActionId(id);
    try {
      await moderateVideo(id, false, reason.trim());
      setVideos((prev) => prev?.filter((v) => v.id !== id) ?? prev);
      setTotal((t) => Math.max(0, t - 1));
      setRejectingId(null);
      setReason("");
    } catch (err) {
      setError(translateApiError(err));
    } finally {
      setPendingActionId(null);
    }
  }

  return (
    <>
      <div className="flex gap-2 flex-wrap mb-4">
        {(Object.keys(VIDEO_STATUS_LABELS) as VideoStatusFilter[]).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => changeStatus(s)}
            className={`border rounded-md px-3 py-2 text-[13px] ${
              status === s ? "border-primary text-primary bg-bg-secondary" : "border-border text-text-secondary"
            }`}
          >
            {VIDEO_STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {error && (
        <p role="alert" className="text-error mb-4">
          {error}
        </p>
      )}

      {isLoading && !error && <p className="text-text-secondary">Chargement...</p>}

      {!isLoading && videos !== null && videos.length === 0 && (
        <p className="text-text-secondary">Aucune vidéo dans cette catégorie.</p>
      )}

      <div className="bg-white rounded-lg shadow-card overflow-x-auto">
        <div className="min-w-[820px]">
          {!isLoading && videos && videos.length > 0 && (
            <div className={`${ROW_GRID} py-2 text-xs font-bold text-text-secondary border-b border-border`}>
              <div />
              <div>CANDIDAT</div>
              <div>TYPE</div>
              <div>DATE</div>
              <div>ACTIONS</div>
            </div>
          )}
          {!isLoading && videos?.map((video) => (
            <div key={video.id} className="border-b border-border last:border-b-0">
              <div className={`${ROW_GRID} py-3 text-[13px]`}>
                {video.profile.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={resolveAvatarUrl(video.profile.avatarUrl)}
                    alt=""
                    className="w-7 h-7 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-border" />
                )}
                <div className="font-semibold text-text truncate">{video.profile.fullName}</div>
                <div className="text-text-secondary">{TYPE_LABELS[video.type]}</div>
                <div className="text-text-secondary">{new Date(video.createdAt).toLocaleDateString("fr-FR")}</div>
                <div className="flex gap-2 flex-wrap">
                  <Link href={`/profils/${video.profile.userId}`} className={buttonClasses("secondary", "sm")}>
                    Voir le profil
                  </Link>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setExpandedId(expandedId === video.id ? null : video.id)}
                  >
                    {expandedId === video.id ? "Masquer" : "Voir"}
                  </Button>
                  {(status === "PENDING" || status === "REJECTED") && (
                    <Button
                      variant="success"
                      size="sm"
                      disabled={pendingActionId === video.id}
                      onClick={() => handleApprove(video.id)}
                    >
                      {status === "REJECTED" ? "Réapprouver" : "Approuver"}
                    </Button>
                  )}
                  {(status === "PENDING" || status === "APPROVED") && (
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={pendingActionId === video.id}
                      onClick={() => {
                        setRejectingId(rejectingId === video.id ? null : video.id);
                        setReason("");
                      }}
                    >
                      Rejeter
                    </Button>
                  )}
                </div>
              </div>

              {expandedId === video.id && (
                <div className="px-4 pb-4">
                  <VideoPlayer video={video} />
                </div>
              )}

              {rejectingId === video.id && (
                <div className="px-4 pb-4 flex gap-2 items-start">
                  <label htmlFor={`reason-${video.id}`} className="sr-only">
                    Motif du rejet
                  </label>
                  <input
                    id={`reason-${video.id}`}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Motif du rejet (obligatoire)"
                    className="flex-1 border border-border rounded-md px-3 py-2 text-[13px]"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={!reason.trim() || pendingActionId === video.id}
                    onClick={() => handleReject(video.id)}
                  >
                    Confirmer le rejet
                  </Button>
                </div>
              )}

              {video.status === "REJECTED" && video.rejectionReason && (
                <p className="px-4 pb-3 text-xs text-error">Motif : {video.rejectionReason}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <Button variant="secondary" size="sm" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
            ← Précédent
          </Button>
          <span className="text-sm text-text-secondary">
            Page {page} sur {totalPages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            disabled={page === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Suivant →
          </Button>
        </div>
      )}
    </>
  );
}

function AccountModerationView() {
  const [status, setStatus] = useState<AccountModerationStatus>("PENDING");
  const [page, setPage] = useState(1);
  const [accounts, setAccounts] = useState<ModerationQueueUser[] | null>(null);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [error, setError] = useState<string | null>(null);
  const [pendingActionId, setPendingActionId] = useState<string | null>(null);
  // No separate isLoading state to set synchronously on every filter/page
  // change — derived instead from whether the currently-rendered data
  // matches the requested query (same pattern as profils/page.tsx).
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const currentKey = `${status}:${page}`;
  const isLoading = loadedKey !== currentKey;

  function changeStatus(next: AccountModerationStatus) {
    setStatus(next);
    setPage(1);
  }

  useEffect(() => {
    let cancelled = false;
    getModerationQueue(status, page)
      .then((res) => {
        if (cancelled) return;
        setAccounts(res.users);
        setTotal(res.total);
        setPageSize(res.pageSize);
        setError(null);
        setLoadedKey(`${status}:${page}`);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(translateApiError(err));
        setLoadedKey(`${status}:${page}`);
      });
    return () => {
      cancelled = true;
    };
  }, [status, page]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // Every action moves the account out of whichever status queue is
  // currently being viewed, so the row is simply dropped from the list
  // rather than re-fetched.
  async function runAction(id: string, action: () => Promise<unknown>) {
    setPendingActionId(id);
    try {
      await action();
      setAccounts((prev) => prev?.filter((u) => u.id !== id) ?? prev);
      setTotal((t) => Math.max(0, t - 1));
    } catch (err) {
      setError(translateApiError(err));
    } finally {
      setPendingActionId(null);
    }
  }

  function handleBan(id: string, name: string) {
    if (!window.confirm(`Bannir ${name} ? Son profil ne sera plus visible publiquement.`)) return;
    runAction(id, () => suspendAccount(id));
  }

  return (
    <>
      <div className="flex gap-2 flex-wrap mb-4">
        {(Object.keys(ACCOUNT_STATUS_LABELS) as AccountModerationStatus[]).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => changeStatus(s)}
            className={`border rounded-md px-3 py-2 text-[13px] ${
              status === s ? "border-primary text-primary bg-bg-secondary" : "border-border text-text-secondary"
            }`}
          >
            {ACCOUNT_STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {error && (
        <p role="alert" className="text-error mb-4">
          {error}
        </p>
      )}

      {isLoading && !error && <p className="text-text-secondary">Chargement...</p>}

      {!isLoading && accounts !== null && accounts.length === 0 && (
        <p className="text-text-secondary">Aucun compte dans cette catégorie.</p>
      )}

      <div className="bg-white rounded-lg shadow-card overflow-x-auto">
        <div className="min-w-[680px]">
          {!isLoading && accounts && accounts.length > 0 && (
            <div className={`${ACCOUNT_ROW_GRID} py-2 text-xs font-bold text-text-secondary border-b border-border`}>
              <div />
              <div>CANDIDAT</div>
              <div>DATE</div>
              <div>ACTIONS</div>
            </div>
          )}
          {!isLoading && accounts?.map((account) => (
            <div key={account.id} className="border-b border-border last:border-b-0">
              <div className={`${ACCOUNT_ROW_GRID} py-3 text-[13px]`}>
                {account.profile?.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={resolveAvatarUrl(account.profile.avatarUrl)}
                    alt=""
                    className="w-7 h-7 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-border" />
                )}
                <div className="font-semibold text-text truncate">{account.profile?.fullName ?? account.email}</div>
                <div className="text-text-secondary">{new Date(account.createdAt).toLocaleDateString("fr-FR")}</div>
                <div className="flex gap-2 flex-wrap">
                  <Link href={`/profils/${account.id}`} className={buttonClasses("secondary", "sm")}>
                    Voir le profil
                  </Link>
                  {status === "PENDING" && (
                    <>
                      <Button
                        variant="success"
                        size="sm"
                        disabled={pendingActionId === account.id}
                        onClick={() => runAction(account.id, () => approveAccount(account.id))}
                      >
                        Valider
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={pendingActionId === account.id}
                        onClick={() => runAction(account.id, () => rejectAccount(account.id))}
                      >
                        Rejeter
                      </Button>
                    </>
                  )}
                  {status === "APPROVED" && (
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={pendingActionId === account.id}
                      onClick={() => handleBan(account.id, account.profile?.fullName ?? account.email)}
                    >
                      Bannir
                    </Button>
                  )}
                  {(status === "REJECTED" || status === "SUSPENDED") && (
                    <Button
                      variant="success"
                      size="sm"
                      disabled={pendingActionId === account.id}
                      onClick={() => runAction(account.id, () => approveAccount(account.id))}
                    >
                      Réactiver
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <Button variant="secondary" size="sm" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
            ← Précédent
          </Button>
          <span className="text-sm text-text-secondary">
            Page {page} sur {totalPages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            disabled={page === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Suivant →
          </Button>
        </div>
      )}
    </>
  );
}

export default function ModerationPage() {
  usePageTitle("Modération");
  const authReady = useRequireAuth(["ADMIN"]);
  const [resource, setResource] = useState<Resource>("videos");

  if (!authReady) return null;

  return (
    <main className="px-6 py-8">
      <h2 className="mb-4">Modération</h2>

      <ResourceSwitcher resource={resource} onChange={setResource} />

      {resource === "videos" ? <VideoModerationView /> : <AccountModerationView />}
    </main>
  );
}
