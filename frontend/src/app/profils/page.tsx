"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button, buttonClasses } from "@/components/ui/Button";
import { ProfileCard } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { Profile, ProfileFilters, getAllProfiles, resolveAvatarUrl, translateApiError } from "@/lib/api";
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

  // Debounce the free-text inputs so every keystroke doesn't fire a request;
  // the select/checkbox filters apply immediately since they only change on
  // discrete user actions.
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [debouncedLocation, setDebouncedLocation] = useState("");
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(id);
  }, [search]);
  useEffect(() => {
    const id = setTimeout(() => setDebouncedLocation(location), 300);
    return () => clearTimeout(id);
  }, [location]);

  const filters: ProfileFilters = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      sector: sector || undefined,
      skill: skill || undefined,
      location: debouncedLocation || undefined,
      certifiedOnly: certifiedOnly || undefined,
    }),
    [debouncedSearch, sector, skill, debouncedLocation, certifiedOnly]
  );

  // Reset back to page 1 whenever the active filters change, so we don't end
  // up stuck on a page number that no longer exists for the new result set.
  useEffect(() => {
    setPage(1);
  }, [filters]);

  // Filtering happens server-side (query params below), so a matching
  // candidate always appears on its correct page instead of being scattered
  // across several near-empty pages.
  useEffect(() => {
    let cancelled = false;
    getAllProfiles(page, filters)
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
  }, [page, filters]);

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

  const filtered = profiles ?? [];

  function resetFilters() {
    setSearch("");
    setSector("");
    setSkill("");
    setLocation("");
    setCertifiedOnly(false);
  }

  return (
    <main className="flex flex-col md:flex-row gap-8 px-6 py-8 max-w-[1600px] w-full mx-auto">
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
          label="Certifié uniquement"
          wrapperClassName="items-center mb-4"
          checked={certifiedOnly}
          onChange={(e) => setCertifiedOnly(e.target.checked)}
        />
        <Button type="button" variant="secondary" size="sm" onClick={resetFilters} className="w-full">
          Réinitialiser
        </Button>
      </aside>

      <section className="flex-1 min-w-0">
        {error && <p role="alert" className="text-error">{error}</p>}

        {!error && isLoading && <p className="text-text-secondary">Chargement...</p>}

        {!error && !isLoading && profiles && (
          <>
            <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
              <span className="text-sm font-semibold text-text">
                {total} profil{total > 1 ? "s" : ""} au total
              </span>
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-16 px-5">
                <div className="text-3xl text-border mb-3">🔍</div>
                <p className="text-text-secondary text-sm max-w-[340px] mx-auto mb-4">
                  Aucun profil ne correspond à vos critères de filtrage. Essayez d'élargir
                  votre recherche.
                </p>
                <Button variant="secondary" onClick={resetFilters}>
                  Réinitialiser les filtres
                </Button>
              </div>
            ) : (
              <div className="grid gap-5 [grid-template-columns:repeat(auto-fill,minmax(220px,1fr))]">
                {filtered.map((profile) => (
                  <ProfileCard
                    key={profile.id}
                    name={profile.fullName}
                    role={profile.targetSector ?? "Secteur non renseigné"}
                    avatarUrl={resolveAvatarUrl(profile.avatarUrl)}
                    certified={profile.hasCertificationBadge}
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
