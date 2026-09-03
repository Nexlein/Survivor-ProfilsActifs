import { ReactNode } from "react";
import { Badge } from "@/components/ui/Badge";

type ProfileCardProps = {
  name: string;
  role: string;
  avatarUrl?: string;
  certified?: boolean;
  className?: string;
  footer?: ReactNode;
};

export function ProfileCard({ name, role, avatarUrl, certified, className = "", footer }: ProfileCardProps) {
  return (
    <div
      className={`w-full sm:w-[220px] bg-bg rounded-lg p-5 shadow-card transition-all duration-150 hover:shadow-modal hover:-translate-y-0.5 ${className}`}
    >
      <div className="flex gap-3 items-center mb-3.5">
        <div className="w-14 h-14 rounded-full bg-border overflow-hidden shrink-0 ring-1 ring-black/5">
          {avatarUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
          )}
        </div>
        <div className="min-w-0">
          <div className="font-bold text-sm font-heading text-text truncate">{name}</div>
          <div className="italic text-xs font-body text-text-secondary truncate">{role}</div>
        </div>
      </div>
      {certified ? (
        <Badge variant="success">★ Certifié JEB</Badge>
      ) : (
        <Badge variant="neutral">Certification en cours</Badge>
      )}
      {footer && <div className="mt-3.5">{footer}</div>}
    </div>
  );
}

type InfoCardProps = {
  label: string;
  children: ReactNode;
};

export function InfoCard({ label, children }: InfoCardProps) {
  return (
    <div className="bg-bg-secondary rounded-lg p-4">
      <div className="text-xs font-bold font-heading text-text-secondary mb-1.5 uppercase">{label}</div>
      <div className="text-[13px] text-text">{children}</div>
    </div>
  );
}
