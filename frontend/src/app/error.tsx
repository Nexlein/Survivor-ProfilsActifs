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
      <div className="w-9 h-9 bg-primary text-white font-bold text-[10px] inline-flex items-center justify-center mb-6">
        JEB
      </div>
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
