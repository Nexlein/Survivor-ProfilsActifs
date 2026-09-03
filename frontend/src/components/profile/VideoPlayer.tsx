"use client";

import { useEffect, useState } from "react";
import { fetchMediaBlobUrl, translateApiError, Video } from "@/lib/api";

function toEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtube.com")) {
      const id = parsed.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (parsed.hostname === "youtu.be") {
      const id = parsed.pathname.slice(1);
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (parsed.hostname.includes("vimeo.com")) {
      const id = parsed.pathname.split("/").filter(Boolean)[0];
      return id ? `https://player.vimeo.com/video/${id}` : null;
    }
    return null;
  } catch {
    return null;
  }
}

export function VideoPlayer({ video }: { video: Video }) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [subtitleBlobUrl, setSubtitleBlobUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isUpload = video.type === "UPLOAD";
  // /media/:id requires an Authorization header (legal access gating on
  // pending/rejected videos), so a plain <video src> can't hit it directly —
  // fetch the bytes ourselves and hand the element a blob: URL instead.
  // LINK videos point at an external host and don't need this.
  useEffect(() => {
    if (!isUpload) return;
    let cancelled = false;
    const objectUrls: string[] = [];

    fetchMediaBlobUrl(`/media/${video.id}`)
      .then((url) => {
        if (cancelled) return;
        objectUrls.push(url);
        setBlobUrl(url);
      })
      .catch((err) => !cancelled && setError(translateApiError(err)));

    if (video.subtitleUrl) {
      fetchMediaBlobUrl(`/media/${video.id}/subtitle`)
        .then((url) => {
          if (cancelled) return;
          objectUrls.push(url);
          setSubtitleBlobUrl(url);
        })
        .catch(() => {
          /* subtitle is optional — a failed fetch just means no track */
        });
    }

    return () => {
      cancelled = true;
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [isUpload, video.id, video.subtitleUrl]);

  if (!isUpload) {
    const embedUrl = toEmbedUrl(video.url);
    if (embedUrl) {
      return (
        <div className="aspect-video rounded-md overflow-hidden">
          <iframe src={embedUrl} className="w-full h-full" allowFullScreen title="Vidéo de présentation" />
        </div>
      );
    }
    return (
      <video controls className="w-full rounded-md" src={video.url}>
        {video.subtitleUrl && <track kind="subtitles" src={video.subtitleUrl} srcLang="fr" label="Français" default />}
      </video>
    );
  }

  if (error) {
    return <p className="text-error text-sm">{error}</p>;
  }

  if (!blobUrl) {
    return <p className="text-text-secondary text-sm">Chargement de la vidéo...</p>;
  }

  return (
    <video controls className="w-full rounded-md" src={blobUrl}>
      {subtitleBlobUrl && <track kind="subtitles" src={subtitleBlobUrl} srcLang="fr" label="Français" default />}
    </video>
  );
}
