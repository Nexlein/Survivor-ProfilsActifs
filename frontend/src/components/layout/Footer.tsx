import Link from "next/link";

const LEGAL_LINKS = [
  { href: "/cgu", label: "CGU" },
  { href: "/accessibilite", label: "Accessibilité" },
  { href: "/contact", label: "Contact" },
  { href: "/mentions-rgpd", label: "Mentions RGPD" },
];

export function Footer() {
  return (
    <footer className="bg-text text-white px-6 py-8 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 bg-primary border border-white text-white text-[8px] font-bold font-heading flex items-center justify-center">
          JEB
        </div>
        <strong className="font-heading">ProfilsActifs — Ministère du Job et Bonheur</strong>
      </div>
      <div className="flex gap-4 flex-wrap text-[13px]">
        {LEGAL_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-[#aab0c0] hover:text-white"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </footer>
  );
}
