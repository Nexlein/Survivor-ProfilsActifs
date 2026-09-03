"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { login, setToken, setUser, translateApiError } from "@/lib/api";
import { usePageTitle } from "@/lib/use-page-title";

export default function LoginPage() {
  usePageTitle("Connexion");
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const { token, user } = await login(email, password);
      setToken(token);
      setUser(user);
      router.push("/");
    } catch (err) {
      setError(translateApiError(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex flex-1">
      <div className="hidden md:flex flex-[0_0_45%] bg-primary flex-col items-center justify-center p-10 text-center gap-4">
        <div className="w-14 h-14 border border-white text-white font-bold font-heading flex items-center justify-center">
          JEB
        </div>
        <p className="italic font-body text-lg text-white max-w-xs">
          Votre carrière commence ici.
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col gap-4">
          <h2>Connexion</h2>

          <Input
            id="email"
            type="email"
            label="Adresse e-mail"
            placeholder="votre@email.fr"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div>
            <label htmlFor="password" className="block text-[13px] font-semibold text-text font-heading mb-1.5">
              Mot de passe
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full border border-border rounded-md px-3.5 py-2.5 pr-10 text-sm focus:border-primary focus:outline-2 focus:outline-primary focus:outline-offset-2"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary"
              >
                👁
              </button>
            </div>
          </div>

          <div className="text-right text-sm">
            <Link href="/forgot-password">Mot de passe oublié ?</Link>
          </div>

          {error && <p role="alert" className="text-error text-sm">{error}</p>}

          <Button type="submit" variant="primary" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Connexion..." : "Se connecter"}
          </Button>

          <div className="text-center text-sm">
            Pas encore de compte ? <Link href="/register">S&apos;inscrire</Link>
          </div>
        </form>
      </div>
    </main>
  );
}
