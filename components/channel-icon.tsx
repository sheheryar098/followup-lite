import {
  Globe,
  Linkedin,
  Mail,
  Phone,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { CHANNEL_LABELS, type Channel } from "@/lib/followup";

const icons: Record<Channel, LucideIcon> = {
  EMAIL: Mail,
  LINKEDIN: Linkedin,
  FORM: Globe,
  PHONE: Phone,
  OTHER: Sparkles,
};

export function ChannelIcon({
  channel,
  className,
  withLabel = false,
}: {
  channel: Channel;
  className?: string;
  withLabel?: boolean;
}) {
  const Icon = icons[channel];
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-muted", className)}>
      <Icon className="h-3.5 w-3.5" aria-hidden />
      {withLabel ? CHANNEL_LABELS[channel] : <span className="sr-only">{CHANNEL_LABELS[channel]}</span>}
    </span>
  );
}
