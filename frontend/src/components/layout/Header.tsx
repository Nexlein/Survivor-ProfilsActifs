"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { buttonClasses } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { AuthUser, clearToken, clearUser, useCurrentUser } from "@/lib/api";

type NavLink = { href: string; label: string };

function getNavLinks(user: AuthUser | null): NavLink[] {
  if (!user) {
    return [
      { href: "/", label: "Accueil" },
      { href: "/profils", label: "Parcourir les profils" },
      { href: "/#comment-ca-marche", label: "Comment ça marche" },
    ];
  }
  if (user.role === "RECRUITER") {
    return [
      { href: "/profils", label: "Parcourir les profils" },
      { href: "/dashboard/recruiter", label: "Tableau de bord" },
      { href: "/notifications", label: "Notifications" },
    ];
  }
  if (user.role === "ADMIN") {
    return [
      { href: "/dashboard/admin", label: "Tableau de bord" },
      { href: "/admin/moderation", label: "Modération" },
      { href: "/admin/questionnaire", label: "Questionnaire" },
    ];
  }
  return [
    { href: `/profils/${user.id}`, label: "Mon profil" },
    { href: "/notifications", label: "Notifications" },
    { href: "/questionnaire", label: "Certification JEB" },
  ];
}

export function Header() {
  const router = useRouter();
  const user = useCurrentUser();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);

  function handleLogout() {
    clearToken();
    clearUser();
    setIsAccountMenuOpen(false);
    router.push("/");
  }

  const navLinks = getNavLinks(user);

  return (
    <header className="border-b border-border bg-bg">
      <div className="h-16 px-6 flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <div className="w-7 h-7 bg-primary text-white text-[9px] font-bold font-heading flex items-center justify-center">
            JEB
          </div>
          <span className="font-bold text-primary font-heading">ProfilsActifs</span>
        </Link>

        <nav className="hidden md:flex flex-1 gap-6 text-sm font-semibold text-text">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3 ml-auto">
          {user?.role === "ADMIN" && <Badge variant="admin">ADMIN</Badge>}

          {!user && (
            <>
              <Link href="/login" className={buttonClasses("secondary")}>
                Se connecter
              </Link>
              <Link href="/register" className={buttonClasses("primary")}>
                S&apos;inscrire
              </Link>
            </>
          )}

          {user && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsAccountMenuOpen((v) => !v)}
                aria-label="Mon compte"
                aria-haspopup="true"
                aria-expanded={isAccountMenuOpen}
                className="w-[34px] h-[34px] rounded-full bg-primary block"
              />
              {isAccountMenuOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white border border-border rounded-md shadow-card py-1 z-10">
                  {user.role === "JOB_SEEKER" && (
                    <Link
                      href={`/profils/${user.id}`}
                      className="block px-4 py-2 text-sm text-text hover:bg-bg-secondary"
                      onClick={() => setIsAccountMenuOpen(false)}
                    >
                      Mon profil
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-error hover:bg-bg-secondary"
                  >
                    Déconnexion
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <button
          type="button"
          className="md:hidden ml-auto text-xl"
          onClick={() => setIsMobileMenuOpen((v) => !v)}
          aria-label={isMobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={isMobileMenuOpen}
        >
          ☰
        </button>
      </div>

      {isMobileMenuOpen && (
        <nav className="md:hidden flex flex-col gap-3 px-6 pb-4 text-sm font-semibold text-text">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setIsMobileMenuOpen(false)}>
              {link.label}
            </Link>
          ))}
          {!user && (
            <div className="flex gap-3 pt-2">
              <Link href="/login" className={buttonClasses("secondary", "md", "flex-1")}>
                Se connecter
              </Link>
              <Link href="/register" className={buttonClasses("primary", "md", "flex-1")}>
                S&apos;inscrire
              </Link>
            </div>
          )}
          {user && (
            <button type="button" onClick={handleLogout} className="text-left text-error">
              Déconnexion
            </button>
          )}
        </nav>
      )}
    </header>
  );
}
