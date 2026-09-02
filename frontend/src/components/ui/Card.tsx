import { ReactNode } from "react";
import { Badge } from "@/components/ui/Badge";

type ProfileCardProps = {
  name: string;
  role: string;
  avatarUrl?: string;
  certified?: boolean;
};

export function ProfileCard({ name, role, avatarUrl, certified }: ProfileCardProps) {
  return (
    <div className="w-[220px] bg-bg rounded-lg p-4 shadow-card">
      <div className="flex gap-2.5 items-center mb-2">
        <div className="w-10 h-10 rounded-full bg-border overflow-hidden shrink-0">
          {avatarUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
          )}
        </div>
        <div>
          <div className="font-bold text-[13px] font-heading text-text">{name}</div>
          <div className="italic text-xs font-body text-text-secondary">{role}</div>
        </div>
      </div>
      {certified && <Badge variant="success">★ Certifié JEB</Badge>}
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
