"use client";

import { ChangeEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { createVideoUpload, translateApiError, useCurrentUser } from "@/lib/api";
import { usePageTitle } from "@/lib/use-page-title";

const CONSENT_VERSION = "v1.0 - 2026-09-01";
const MAX_VIDEO_BYTES = 100 * 1024 * 1024;

export default function AddVideoPage() {
  usePageTitle("Publier une vidéo");
  const router = useRouter();
  const currentUser = useCurrentUser();

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [subtitleFile, setSubtitleFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      if (!videoFile) {
        setError("Merci de sélectionner un fichier vidéo.");
        return;
      }
      await createVideoUpload({
        video: videoFile,
        subtitle: subtitleFile ?? undefined,
        consentTextVersion: CONSENT_VERSION,
      });
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

      <VideoUploadForm
        videoFile={videoFile}
        onVideoFileChange={handleVideoFileChange}
        subtitleFile={subtitleFile}
        onSubtitleFileChange={handleSubtitleFileChange}
        fileError={fileError}
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
