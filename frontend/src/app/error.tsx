"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";

export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="text-center px-6 py-16">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.png" alt="ProfilsActifs" className="w-14 h-14 object-contain rounded-sm inline-flex mb-6" />
      <h2 className="mb-2">Une erreur est survenue.</h2>
      <p className="text-text-secondary mb-5">
        Nos équipes ont été prévenues. Veuillez réessayer dans quelques instants.
      </p>
      <Button variant="primary" onClick={() => retry()}>
        Réessayer
      </Button>
    </main>
  );
}
