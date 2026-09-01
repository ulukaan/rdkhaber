"use client";

import { useRef, useState } from "react";
import { Container } from "@/components/ui/Container";
import { ElectionHubClient, type ElectionHubPayload } from "@/components/election/ElectionHubClient";
import { ElectionPageHeader } from "@/components/election/ElectionPageHeader";
import type { ElectionStatus, SnapshotKind } from "@prisma/client";
import { ElectionSourceBar } from "@/components/election/ElectionSourceBar";
import { ElectionArchiveBar } from "@/components/election/ElectionArchiveBar";
import type { SecimPageMode } from "@/lib/election";

export function ElectionPageShell({
  siteName,
  logoUrl,
  title,
  subtitle,
  status,
  liveRefreshSec,
  lastResultsAt,
  election,
  snapshotMeta,
  pageMode = "live",
  archiveTitle,
  archiveDate,
}: {
  siteName: string;
  logoUrl?: string;
  title: string;
  subtitle?: string | null;
  status: ElectionStatus;
  liveRefreshSec: number;
  lastResultsAt?: string | null;
  election: ElectionHubPayload;
  pageMode?: SecimPageMode;
  archiveTitle?: string;
  archiveDate?: string | null;
  snapshotMeta?: {
    kind: SnapshotKind;
    sourceName: string;
    sourceUrl?: string | null;
    importedAt: string;
    verified: boolean;
  } | null;
}) {
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const districtSectionRef = useRef<HTMLElement>(null);

  function handleDistrictSelect(slug: string) {
    setSelectedDistrict(slug);
    districtSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <>
      <ElectionPageHeader
        siteName={siteName}
        logoUrl={logoUrl}
        title={title}
        subtitle={subtitle}
        status={status}
        liveRefreshSec={liveRefreshSec}
        lastResultsAt={lastResultsAt}
        districts={election.districts}
        selectedDistrict={selectedDistrict}
        onDistrictSelect={handleDistrictSelect}
      />
      {pageMode === "archive" && archiveTitle ? (
        <ElectionArchiveBar title={archiveTitle} electionDate={archiveDate} />
      ) : null}
      {snapshotMeta ? (
        <ElectionSourceBar
          sourceName={snapshotMeta.sourceName}
          sourceUrl={snapshotMeta.sourceUrl}
          importedAt={snapshotMeta.importedAt}
          kind={snapshotMeta.kind}
          verified={snapshotMeta.verified}
        />
      ) : null}
      <Container className="py-5 sm:py-8">
        <ElectionHubClient
          election={election}
          selectedDistrict={selectedDistrict}
          onDistrictSelect={handleDistrictSelect}
          districtSectionRef={districtSectionRef}
        />
      </Container>
    </>
  );
}
