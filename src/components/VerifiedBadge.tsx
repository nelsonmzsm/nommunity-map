import { CheckCircle2, HelpCircle } from "lucide-react";

export default function VerifiedBadge({
  verified,
  compact = false,
}: {
  verified: boolean;
  compact?: boolean;
}) {
  const iconClass = compact ? "h-3 w-3" : "h-3.5 w-3.5";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-semibold ${
        compact ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs"
      } ${verified ? "bg-emerald-50 text-emerald-700" : "bg-zinc-100 text-zinc-500"}`}
    >
      {verified ? <CheckCircle2 className={iconClass} /> : <HelpCircle className={iconClass} />}
      {verified ? "運営確認済" : "運営未確認"}
    </span>
  );
}
