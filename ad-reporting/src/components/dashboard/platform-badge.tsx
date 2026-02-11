import { cn } from "@/lib/utils";

const platformConfig = {
  FACEBOOK_ADS: {
    label: "Facebook Ads",
    shortLabel: "Meta",
    bgColor: "bg-blue-50",
    textColor: "text-blue-700",
    borderColor: "border-blue-200",
  },
  GOOGLE_ADS: {
    label: "Google Ads",
    shortLabel: "Google",
    bgColor: "bg-emerald-50",
    textColor: "text-emerald-700",
    borderColor: "border-emerald-200",
  },
  TIKTOK_ADS: {
    label: "TikTok Ads",
    shortLabel: "TikTok",
    bgColor: "bg-pink-50",
    textColor: "text-pink-700",
    borderColor: "border-pink-200",
  },
};

interface PlatformBadgeProps {
  platform: keyof typeof platformConfig;
  short?: boolean;
  className?: string;
}

export function PlatformBadge({
  platform,
  short = false,
  className,
}: PlatformBadgeProps) {
  const config = platformConfig[platform];
  if (!config) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        config.bgColor,
        config.textColor,
        config.borderColor,
        className
      )}
    >
      {short ? config.shortLabel : config.label}
    </span>
  );
}
