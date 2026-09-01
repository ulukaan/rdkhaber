import type { ElectionRaceType } from "@prisma/client";
import { resolveCandidatePhotoSources, resolvePartyColor } from "@/lib/election-candidate-photo";
import { ElectionCandidatePhoto } from "@/components/election/ElectionCandidatePhoto";
import { ElectionPartyLogo } from "@/components/election/ElectionPartyLogo";
import { cn } from "@/lib/utils";

const SIZES = {
  xs: { photo: 44, badge: 20, border: 2 },
  sm: { photo: 48, badge: 22, border: 2 },
  duel: { photo: 72, badge: 26, border: 2 },
  md: { photo: 88, badge: 35, border: 3 },
  lg: { photo: 100, badge: 35, border: 3 },
} as const;

export function ElectionCandidatePortrait({
  name,
  partyName,
  partyColor,
  photoUrl,
  ntvCityId,
  ntvDistrictId,
  raceType = "MAYOR",
  size = "sm",
  badgeCorner = "bottom-right",
  className,
}: {
  name: string;
  partyName: string;
  partyColor: string;
  photoUrl?: string | null;
  ntvCityId?: number | null;
  ntvDistrictId?: number | null;
  raceType?: ElectionRaceType;
  size?: keyof typeof SIZES;
  badgeCorner?: "bottom-right" | "bottom-left";
  className?: string;
}) {
  const brandColor = resolvePartyColor(partyName, partyColor);
  const dims = SIZES[size];
  const photo = resolveCandidatePhotoSources({
    name,
    partyName,
    partyColor: brandColor,
    photoUrl,
    ntvCityId,
    ntvDistrictId,
    raceType,
  });

  return (
    <div
      className={cn("relative shrink-0", className)}
      style={{ width: dims.photo, height: dims.photo }}
    >
      <div
        className="relative h-full w-full overflow-hidden rounded-full shadow-sm"
        style={{ borderWidth: dims.border, borderStyle: "solid", borderColor: "#fff" }}
      >
        <ElectionCandidatePhoto
          src={photo.src}
          fallbackSrc={photo.fallback}
          alt={name}
          sizes={`${dims.photo}px`}
        />
      </div>
      <div
        className={cn(
          "absolute",
          badgeCorner === "bottom-right" ? "-bottom-0.5 -right-0.5" : "-bottom-0.5 -left-0.5",
        )}
      >
        <ElectionPartyLogo partyName={partyName} partyColor={brandColor} size={dims.badge} />
      </div>
    </div>
  );
}
