"use client";

import { ChangeEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Tabs } from "@/components/ui/Tabs";
import { createVideoLink, createVideoUpload, translateApiError, useCurrentUser } from "@/lib/api";
import { usePageTitle } from "@/lib/use-page-title";

const CONSENT_VERSION = "v1.0 - 2026-09-01";
const MAX_VIDEO_BYTES = 100 * 1024 * 1024;

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
  const router = useRouter();
  const currentUser = useCurrentUser();

  const [activeTab, setActiveTab] = useState<"link" | "upload">("link");

  const [videoUrl, setVideoUrl] = useState("");
  const [subtitleUrl, setSubtitleUrl] = useState("");
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [subtitleFile, setSubtitleFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  function handleVideoFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setFileError(null);
    if (!file.type.startsWith("video/")) {
      setFileError("Format non pris en charge — un fichier vidéo est attendu.");
      setVideoFile(null);
      return;
    }
    if (file.size > MAX_VIDEO_BYTES) {
      setFileError("Le fichier dépasse la limite de 100 Mo.");
      setVideoFile(null);
      return;
    }
    setVideoFile(file);
  }

  function handleSubtitleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setSubtitleFile(file);
  }

  async function handlePublish() {
    setError(null);
    setIsSubmitting(true);

    try {
      if (activeTab === "link") {
        if (!videoUrl.trim()) {
          setError("Merci de renseigner un lien vidéo.");
          return;
        }
        await createVideoLink({
          videoUrl: videoUrl.trim(),
          subtitleUrl: subtitleUrl.trim() || undefined,
          consentTextVersion: CONSENT_VERSION,
        });
      } else {
        if (!videoFile) {
          setError("Merci de sélectionner un fichier vidéo.");
          return;
        }
        await createVideoUpload({
          video: videoFile,
          subtitle: subtitleFile ?? undefined,
          consentTextVersion: CONSENT_VERSION,
        });
      }
      router.push(currentUser ? `/profils/${currentUser.id}` : "/");
    } catch (err) {
      setError(translateApiError(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="max-w-xl mx-auto px-6 py-12">
      <h2 className="mb-5">Publier une vidéo</h2>

      <Tabs
        defaultTabId="link"
        onChange={(id) => setActiveTab(id as "link" | "upload")}
        tabs={[
          {
            id: "link",
            label: "Lien vidéo",
            content: (
              <VideoLinkForm
                videoUrl={videoUrl}
                setVideoUrl={setVideoUrl}
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
            content: (
              <VideoUploadForm
                videoFile={videoFile}
                onVideoFileChange={handleVideoFileChange}
                subtitleFile={subtitleFile}
                onSubtitleFileChange={handleSubtitleFileChange}
                fileError={fileError}
              />
            ),
          },
        ]}
      />

      <div className="bg-[#FFF8F0] rounded-lg p-4 my-5">
        <p className="text-[13px] text-text mb-2.5">
          En publiant cette vidéo, vous consentez à ce que votre image et votre voix soient visibles
          publiquement. Elle sera vérifiée par un modérateur avant publication.
        </p>
        <Checkbox
          id="video-consent"
          wrapperClassName="items-start"
          className="mt-0.5"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          label={`Je consens à la publication de cette vidéo (consentement ${CONSENT_VERSION}, horodaté à l'enregistrement).`}
        />
      </div>

      {error && (
        <p role="alert" className="text-error text-sm mb-4">
          {error}
        </p>
      )}

      <Button variant="primary" disabled={!consent || isSubmitting} onClick={handlePublish}>
        {isSubmitting ? "Envoi..." : "Publier ma vidéo"}
      </Button>
    </main>
  );
}

function VideoLinkForm({
  videoUrl,
  setVideoUrl,
  subtitleUrl,
  setSubtitleUrl,
  onPreview,
  embedUrl,
  previewError,
}: {
  videoUrl: string;
  setVideoUrl: (v: string) => void;
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
          Sous-titres (URL fichier VTT)
        </label>
        <input
          value={subtitleUrl}
          onChange={(e) => setSubtitleUrl(e.target.value)}
          placeholder="https://…/sous-titres.vtt"
          className="w-full border border-border rounded-md px-3.5 py-2.5 text-sm focus:border-primary focus:outline-2 focus:outline-primary focus:outline-offset-2"
        />
        <p className="text-xs text-text-secondary mt-1.5">
          Les sous-titres sont fortement recommandés pour l&apos;accessibilité.
        </p>
      </div>
    </div>
  );
}

function VideoUploadForm({
  videoFile,
  onVideoFileChange,
  subtitleFile,
  onSubtitleFileChange,
  fileError,
}: {
  videoFile: File | null;
  onVideoFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
  subtitleFile: File | null;
  onSubtitleFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
  fileError: string | null;
}) {
  return (
    <div className="pt-4 flex flex-col gap-3.5">
      <label className="border-2 border-dashed border-primary rounded-lg p-8 text-center cursor-pointer block">
        <input type="file" accept="video/*" onChange={onVideoFileChange} className="hidden" />
        <div className="text-2xl mb-2">⬆</div>
        <p className="text-sm text-text">
          {videoFile ? videoFile.name : "Cliquez pour choisir votre vidéo"}
        </p>
        <p className="text-xs text-text-secondary mt-1.5">100 Mo maximum</p>
      </label>
      {fileError && (
        <p role="alert" className="text-error text-xs">
          {fileError}
        </p>
      )}
      <div>
        <label className="block text-[13px] font-semibold text-text font-heading mb-1.5">
          Sous-titres (fichier .vtt, optionnel)
        </label>
        <input
          type="file"
          accept=".vtt,text/vtt"
          onChange={onSubtitleFileChange}
          className="w-full border border-border rounded-md px-3.5 py-2.5 text-sm file:mr-3 file:border-0 file:bg-bg-secondary file:rounded file:px-3 file:py-1.5"
        />
        {subtitleFile && <p className="text-xs text-text-secondary mt-1.5">{subtitleFile.name}</p>}
      </div>
    </div>
  );
}
