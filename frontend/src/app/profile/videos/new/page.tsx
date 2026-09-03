"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Tabs } from "@/components/ui/Tabs";
import { usePageTitle } from "@/lib/use-page-title";

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

export default function AddVideoPage() {
  usePageTitle("Publier une vidéo");
  const [videoUrl, setVideoUrl] = useState("");
  const [title, setTitle] = useState("");
  const [subtitleUrl, setSubtitleUrl] = useState("");
  const [consent, setConsent] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);

  function handlePreview() {
    setPreviewError(null);
    const embed = toEmbedUrl(videoUrl);
    if (!embed) {
      setEmbedUrl(null);
      setPreviewError("URL YouTube ou Vimeo non reconnue.");
      return;
    }
    setEmbedUrl(embed);
  }

  function handlePublish() {
    setNotice(
      "La publication de vidéo n'est pas encore connectée au serveur — aucune route backend n'existe pour l'instant (voir le profil Prisma \"Video\", non exposé par l'API)."
    );
  }

  return (
    <main className="max-w-xl mx-auto px-6 py-12">
      <h2 className="mb-5">Publier une vidéo</h2>

      <Tabs
        defaultTabId="link"
        tabs={[
          {
            id: "link",
            label: "Lien vidéo",
            content: (
              <VideoLinkForm
                videoUrl={videoUrl}
                setVideoUrl={setVideoUrl}
                title={title}
                setTitle={setTitle}
                subtitleUrl={subtitleUrl}
                setSubtitleUrl={setSubtitleUrl}
                onPreview={handlePreview}
                embedUrl={embedUrl}
                previewError={previewError}
              />
            ),
          },
          {
            id: "upload",
            label: "Uploader un fichier",
            content: <VideoUploadForm />,
          },
        ]}
      />

      <div className="bg-[#FFF8F0] rounded-lg p-4 my-5">
        <p className="text-[13px] text-text mb-2.5">
          En publiant cette vidéo, vous consentez à ce que votre image et votre voix soient visibles
          publiquement.
        </p>
        <Checkbox
          id="video-consent"
          wrapperClassName="items-start"
          className="mt-0.5"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          label="Je consens à la publication de cette vidéo (date et version enregistrées)."
        />
      </div>

      {notice && (
        <p role="alert" className="text-error text-sm mb-4">
          {notice}
        </p>
      )}

      <Button variant="primary" disabled={!consent} onClick={handlePublish}>
        Publier ma vidéo
      </Button>
    </main>
  );
}

function VideoLinkForm({
  videoUrl,
  setVideoUrl,
  title,
  setTitle,
  subtitleUrl,
  setSubtitleUrl,
  onPreview,
  embedUrl,
  previewError,
}: {
  videoUrl: string;
  setVideoUrl: (v: string) => void;
  title: string;
  setTitle: (v: string) => void;
  subtitleUrl: string;
  setSubtitleUrl: (v: string) => void;
  onPreview: () => void;
  embedUrl: string | null;
  previewError: string | null;
}) {
  return (
    <div className="pt-4 flex flex-col gap-3.5">
      <div>
        <label className="block text-[13px] font-semibold text-text font-heading mb-1.5">
          URL YouTube ou Vimeo
        </label>
        <div className="flex gap-2">
          <input
            placeholder="https://youtube.com/…"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            className="flex-1 border border-border rounded-md px-3.5 py-2.5 text-sm focus:border-primary focus:outline-2 focus:outline-primary focus:outline-offset-2"
          />
          <Button type="button" variant="secondary" onClick={onPreview}>
            Aperçu
          </Button>
        </div>
        {previewError && <p className="text-error text-xs mt-1.5">{previewError}</p>}
        {embedUrl && (
          <div className="mt-3 aspect-video rounded-md overflow-hidden">
            <iframe src={embedUrl} className="w-full h-full" allowFullScreen title="Aperçu vidéo" />
          </div>
        )}
      </div>
      <div>
        <label className="block text-[13px] font-semibold text-text font-heading mb-1.5">
          Titre de la vidéo
        </label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border border-border rounded-md px-3.5 py-2.5 text-sm focus:border-primary focus:outline-2 focus:outline-primary focus:outline-offset-2"
        />
      </div>
      <div>
        <label className="block text-[13px] font-semibold text-text font-heading mb-1.5">
          Sous-titres (URL fichier VTT)
        </label>
        <input
          value={subtitleUrl}
          onChange={(e) => setSubtitleUrl(e.target.value)}
          className="w-full border border-border rounded-md px-3.5 py-2.5 text-sm focus:border-primary focus:outline-2 focus:outline-primary focus:outline-offset-2"
        />
        <p className="text-xs text-text-secondary mt-1.5">
          Les sous-titres sont fortement recommandés pour l&apos;accessibilité.
        </p>
      </div>
    </div>
  );
}

function VideoUploadForm() {
  return (
    <div className="pt-4">
      <div className="border-2 border-dashed border-primary rounded-lg p-8 text-center">
        <div className="text-2xl mb-2">⬆</div>
        <p className="text-sm text-text">Glissez votre vidéo ici ou cliquez pour parcourir</p>
        <p className="text-xs text-text-secondary mt-1.5">100 Mo maximum — formats MP4, MOV, AVI</p>
      </div>
    </div>
  );
}
