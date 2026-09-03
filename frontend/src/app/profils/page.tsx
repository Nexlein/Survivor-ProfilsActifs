"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button, buttonClasses } from "@/components/ui/Button";
import { ProfileCard } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { Profile, getAllProfiles, resolveAvatarUrl, translateApiError } from "@/lib/api";
import { usePageTitle } from "@/lib/use-page-title";

export default function ProfileCatalogPage() {
  usePageTitle("Parcourir les profils");
  const [profiles, setProfiles] = useState<Profile[] | null>(null);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [page, setPage] = useState(1);
  // No separate isLoading state to set synchronously on every page change —
  // derived instead from whether the currently-rendered data matches the
  // requested page.
  const [loadedPage, setLoadedPage] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isLoading = loadedPage !== page;

  const [search, setSearch] = useState("");
  const [sector, setSector] = useState("");
  const [skill, setSkill] = useState("");
  const [location, setLocation] = useState("");
  const [certifiedOnly, setCertifiedOnly] = useState(false);

  // Server-side pagination is mandatory here (20/page) — only the current
  // page is ever fetched and held in memory, never the whole catalog. One
  // consequence: the filters below only search within the page currently
  // loaded, not across the full catalog, since the API has no filter query
  // params yet (only `page`) — a real limitation, not hidden here.
  useEffect(() => {
    let cancelled = false;
    getAllProfiles(page)
      .then((res) => {
        if (cancelled) return;
        setProfiles(res.profiles);
        setTotal(res.total);
        setPageSize(res.pageSize);
        setLoadedPage(page);
      })
      .catch((err) => {
        if (!cancelled) setError(translateApiError(err));
      });
    return () => {
      cancelled = true;
    };
  }, [page]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const sectors = useMemo(() => {
    if (!profiles) return [];
    return Array.from(new Set(profiles.map((p) => p.targetSector).filter(Boolean))) as string[];
  }, [profiles]);

  const skills = useMemo(() => {
    if (!profiles) return [];
    const names = profiles.flatMap((p) => p.skills?.map((s) => s.name) ?? []);
    return Array.from(new Set(names)).sort();
  }, [profiles]);

  const filtered = useMemo(() => {
    if (!profiles) return [];
    return profiles.filter((p) => {
      if (search && !p.fullName.toLowerCase().includes(search.toLowerCase())) return false;
      if (sector && p.targetSector !== sector) return false;
      if (skill && !p.skills?.some((s) => s.name === skill)) return false;
      if (location && !p.location?.toLowerCase().includes(location.toLowerCase())) return false;
      if (certifiedOnly && !p.hasWorkPermit) return false;
      return true;
    });
  }, [profiles, search, sector, skill, location, certifiedOnly]);

  const hasActiveFilters = Boolean(search || sector || skill || location || certifiedOnly);

  function resetFilters() {
    setSearch("");
    setSector("");
    setSkill("");
    setLocation("");
    setCertifiedOnly(false);
  }

  return (
    <main className="flex flex-col md:flex-row gap-8 px-6 py-8">
      <aside className="w-full md:w-[260px] flex-none">
        <h3 className="mb-3.5">Filtrer les profils</h3>
        <label htmlFor="filter-search" className="block text-xs font-bold text-text-secondary mb-2">
          RECHERCHE
        </label>
        <input
          id="filter-search"
          placeholder="Nom du candidat"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-border rounded-md px-3 py-2 text-[13px] mb-4"
        />
        <label htmlFor="filter-sector" className="block text-xs font-bold text-text-secondary mb-2">
          SECTEUR
        </label>
        <select
          id="filter-sector"
          value={sector}
          onChange={(e) => setSector(e.target.value)}
          className="w-full border border-border rounded-md px-3 py-2 text-[13px] mb-3.5"
        >
          <option value="">Tous secteurs</option>
          {sectors.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <label htmlFor="filter-skill" className="block text-xs font-bold text-text-secondary mb-2">
          COMPÉTENCE
        </label>
        <select
          id="filter-skill"
          value={skill}
          onChange={(e) => setSkill(e.target.value)}
          className="w-full border border-border rounded-md px-3 py-2 text-[13px] mb-3.5"
        >
          <option value="">Toutes compétences</option>
          {skills.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <label htmlFor="filter-location" className="block text-xs font-bold text-text-secondary mb-2">
          LOCALISATION
        </label>
        <input
          id="filter-location"
          placeholder="Ville"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full border border-border rounded-md px-3 py-2 text-[13px] mb-3.5"
        />
        <Checkbox
          id="filter-certified"
          label="Certifié JEB uniquement"
          wrapperClassName="items-center mb-4"
          checked={certifiedOnly}
          onChange={(e) => setCertifiedOnly(e.target.checked)}
        />
        <Button type="button" variant="secondary" size="sm" onClick={resetFilters} className="w-full">
          Réinitialiser
        </Button>
        {hasActiveFilters && (
          <p className="text-xs text-text-secondary mt-3">
            Les filtres ne s&apos;appliquent qu&apos;à la page actuellement chargée (pagination serveur).
          </p>
        )}
      </aside>

      <section className="flex-1 min-w-0">
        {error && <p role="alert" className="text-error">{error}</p>}

        {!error && isLoading && <p className="text-text-secondary">Chargement...</p>}

        {!error && !isLoading && profiles && (
          <>
            <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
              <span className="text-sm font-semibold text-text">
                {total} profil{total > 1 ? "s" : ""} au total
                {hasActiveFilters && ` — ${filtered.length} sur cette page`}
              </span>
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-16 px-5">
                <div className="text-3xl text-border mb-3">🔍</div>
                <p className="text-text-secondary text-sm max-w-[340px] mx-auto mb-4">
                  Aucun profil ne correspond à vos critères de filtrage sur cette page. Essayez
                  d&apos;élargir votre recherche ou de changer de page.
                </p>
                <Button variant="secondary" onClick={resetFilters}>
                  Réinitialiser les filtres
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 justify-items-center">
                {filtered.map((profile) => (
                  <ProfileCard
                    key={profile.id}
                    name={profile.fullName}
                    role={profile.targetSector ?? "Secteur non renseigné"}
                    avatarUrl={resolveAvatarUrl(profile.avatarUrl)}
                    certified={profile.hasWorkPermit}
                    footer={
                      <Link
                        href={`/profils/${profile.userId}`}
                        className={buttonClasses("secondary", "sm", "w-full")}
                      >
                        Voir le profil
                      </Link>
                    }
                  />
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-8">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
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
        )}
      </section>
    </main>
  );
}
