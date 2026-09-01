"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Vote } from "lucide-react";
import type { ElectionRaceType, ElectionStatus } from "@prisma/client";
import { clientFormSubmit } from "@/lib/client-form";
import { createElectionAction, updateElectionAction } from "@/actions/election";
import { DEFAULT_PARTY_COLORS, DUZCE_DISTRICTS, ELECTION_STATUS_LABELS, RACE_TYPE_LABELS } from "@/lib/election";
import { slugify } from "@/lib/slug";
import { FieldGroup, Input, Select, Textarea } from "@/components/ui/FormField";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { Button } from "@/components/ui/Button";
import { FormCard } from "@/components/admin/FormCard";
import { PanelFormFooter, PANEL_FORM_BOTTOM_PAD } from "@/components/admin/PanelFormFooter";
import { cn } from "@/lib/utils";

type CandidateDraft = {
  key: string;
  id?: string;
  raceType: ElectionRaceType;
  name: string;
  partyName: string;
  partyColor: string;
  photoUrl: string;
  slogan: string;
  bio: string;
  votes: number;
  votePct: number;
  prevVotes: number | "";
  prevVotePct: number | "";
};

type DistrictDraft = {
  key: string;
  id?: string;
  name: string;
  slug: string;
  order: number;
  totalBoxes: number;
  openBoxes: number;
  turnoutPct: number;
};

export type ElectionFormDefaults = {
  id?: string;
  slug?: string;
  title?: string;
  subtitle?: string;
  electionDate?: string;
  status?: ElectionStatus;
  showOnHome?: boolean;
  isPrimary?: boolean;
  liveRefreshSec?: number;
  totalBoxes?: number;
  openBoxes?: number;
  totalVoters?: number;
  usedVotes?: number;
  validVotes?: number;
  categorySlug?: string;
  yskSecimId?: number | "";
  yskSecimTuru?: number | "";
  yskIlId?: number | "";
  yskFocusIlce?: string;
  yskSyncEnabled?: boolean;
  candidates?: Array<Omit<CandidateDraft, "key"> & { id?: string }>;
  districts?: Array<Omit<DistrictDraft, "key"> & { id?: string }>;
};

function newKey() {
  return `e-${Math.random().toString(36).slice(2, 9)}`;
}

function emptyCandidate(raceType: ElectionRaceType = "MAYOR"): CandidateDraft {
  return {
    key: newKey(),
    raceType,
    name: "",
    partyName: "",
    partyColor: "#d0021b",
    photoUrl: "",
    slogan: "",
    bio: "",
    votes: 0,
    votePct: 0,
    prevVotes: "",
    prevVotePct: "",
  };
}

const TABS = [
  { id: "genel", label: "Genel" },
  { id: "adaylar", label: "Adaylar" },
  { id: "ilceler", label: "İlçeler" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function ElectionForm({ defaults }: { defaults?: ElectionFormDefaults }) {
  const router = useRouter();
  const isEdit = Boolean(defaults?.id);
  const [tab, setTab] = useState<TabId>("genel");
  const [title, setTitle] = useState(defaults?.title ?? "");
  const [slug, setSlug] = useState(defaults?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(defaults?.slug));
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [candidates, setCandidates] = useState<CandidateDraft[]>(() =>
    defaults?.candidates?.length
      ? defaults.candidates.map((item) => ({ ...item, key: item.id ?? newKey(), prevVotes: item.prevVotes ?? "", prevVotePct: item.prevVotePct ?? "" }))
      : [emptyCandidate("MAYOR"), emptyCandidate("MAYOR")],
  );
  const [districts, setDistricts] = useState<DistrictDraft[]>(() =>
    defaults?.districts?.length
      ? defaults.districts.map((item) => ({ ...item, key: item.id ?? newKey() }))
      : DUZCE_DISTRICTS.map((d, order) => ({
          key: newKey(),
          name: d.name,
          slug: d.slug,
          order,
          totalBoxes: 0,
          openBoxes: 0,
          turnoutPct: 0,
        })),
  );

  const onSubmit = async (formData: FormData) => {
    setLoading(true);
    setError(null);
    const raw = {
      title: String(formData.get("title") ?? title),
      slug: String(formData.get("slug") ?? slug),
      subtitle: String(formData.get("subtitle") ?? ""),
      electionDate: String(formData.get("electionDate") ?? ""),
      status: String(formData.get("status") ?? "DRAFT"),
      showOnHome: formData.get("showOnHome") === "on",
      isPrimary: formData.get("isPrimary") === "on",
      liveRefreshSec: Number(formData.get("liveRefreshSec") ?? 60),
      totalBoxes: Number(formData.get("totalBoxes") ?? 0),
      openBoxes: Number(formData.get("openBoxes") ?? 0),
      totalVoters: Number(formData.get("totalVoters") ?? 0),
      usedVotes: Number(formData.get("usedVotes") ?? 0),
      validVotes: Number(formData.get("validVotes") ?? 0),
      categorySlug: String(formData.get("categorySlug") ?? ""),
      yskSecimId: String(formData.get("yskSecimId") ?? "") ? Number(formData.get("yskSecimId")) : null,
      yskSecimTuru: String(formData.get("yskSecimTuru") ?? "") ? Number(formData.get("yskSecimTuru")) : null,
      yskIlId: String(formData.get("yskIlId") ?? "") ? Number(formData.get("yskIlId")) : null,
      yskFocusIlce: String(formData.get("yskFocusIlce") ?? ""),
      yskSyncEnabled: formData.get("yskSyncEnabled") === "on",
      candidates: candidates.map((candidate) => ({
        id: candidate.id,
        raceType: candidate.raceType,
        name: candidate.name,
        partyName: candidate.partyName,
        partyColor: candidate.partyColor,
        photoUrl: candidate.photoUrl,
        slogan: candidate.slogan,
        bio: candidate.bio,
        votes: candidate.votes,
        votePct: candidate.votePct,
        prevVotes: candidate.prevVotes === "" ? null : Number(candidate.prevVotes),
        prevVotePct: candidate.prevVotePct === "" ? null : Number(candidate.prevVotePct),
      })),
      districts: districts.map((district) => ({
        id: district.id,
        name: district.name,
        slug: district.slug,
        order: district.order,
        totalBoxes: district.totalBoxes,
        openBoxes: district.openBoxes,
        turnoutPct: district.turnoutPct,
        results: [],
      })),
    };

    const result = isEdit
      ? await updateElectionAction(defaults!.id!, raw)
      : await createElectionAction(raw);
    setLoading(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    if ("id" in result && result.id) {
      router.push(`/admin/secim/${result.id}`);
    } else {
      router.push("/admin/secim");
    }
    router.refresh();
  };

  return (
    <FormCard title={isEdit ? "Seçimi düzenle" : "Yeni seçim"} description="NTV tarzı seçim merkezi — adaylar, sandık verileri ve ilçe sonuçları." Icon={Vote}>
      <form onSubmit={clientFormSubmit(onSubmit)} className={cn("flex flex-col gap-4", PANEL_FORM_BOTTOM_PAD)}>
        <div className="flex gap-1 overflow-x-auto border-b border-border pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={cn(
                "shrink-0 rounded-md px-3 py-2 text-sm font-semibold transition-colors",
                tab === item.id ? "bg-brand text-white" : "text-ink-soft hover:bg-surface hover:text-ink",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        {tab === "genel" ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <FieldGroup label="Başlık" htmlFor="title">
                <Input
                  id="title"
                  name="title"
                  value={title}
                  required
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (!slugTouched) setSlug(slugify(e.target.value));
                  }}
                />
              </FieldGroup>
            </div>
            <FieldGroup label="Adres (slug)" htmlFor="slug">
              <Input
                id="slug"
                name="slug"
                value={slug}
                required
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(e.target.value);
                }}
              />
            </FieldGroup>
            <FieldGroup label="Alt başlık" htmlFor="subtitle">
              <Input id="subtitle" name="subtitle" defaultValue={defaults?.subtitle ?? ""} placeholder="Düzce Yerel Seçim 2024" />
            </FieldGroup>
            <FieldGroup label="Seçim tarihi" htmlFor="electionDate">
              <Input id="electionDate" name="electionDate" type="datetime-local" defaultValue={defaults?.electionDate ?? ""} />
            </FieldGroup>
            <FieldGroup label="Durum" htmlFor="status">
              <Select id="status" name="status" defaultValue={defaults?.status ?? "DRAFT"}>
                {Object.entries(ELECTION_STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </FieldGroup>
            <FieldGroup label="Haber kategorisi (slug)" htmlFor="categorySlug">
              <Input id="categorySlug" name="categorySlug" defaultValue={defaults?.categorySlug ?? "secim"} placeholder="secim" />
            </FieldGroup>
            <FieldGroup label="Canlı yenileme (sn)" htmlFor="liveRefreshSec">
              <Input id="liveRefreshSec" name="liveRefreshSec" type="number" min={15} max={300} defaultValue={defaults?.liveRefreshSec ?? 60} />
            </FieldGroup>
            <label className="flex min-h-[44px] items-center gap-2 text-sm font-semibold text-ink sm:col-span-2">
              <input type="checkbox" name="showOnHome" defaultChecked={defaults?.showOnHome} className="h-4 w-4 accent-brand" />
              Anasayfada seçim şeridi göster
            </label>
            <label className="flex min-h-[44px] items-center gap-2 text-sm font-semibold text-ink sm:col-span-2">
              <input type="checkbox" name="isPrimary" defaultChecked={defaults?.isPrimary ?? !isEdit} className="h-4 w-4 accent-brand" />
              Birincil (aktif) seçim
            </label>
            <div className="sm:col-span-2 rounded-2xl border border-border bg-surface/40 p-3 sm:p-4">
              <p className="mb-3 text-xs font-bold uppercase tracking-wide text-ink-soft">YSK API bağlantısı</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <FieldGroup label="Seçim ID (secimId)" htmlFor="yskSecimId">
                  <Input
                    id="yskSecimId"
                    name="yskSecimId"
                    type="number"
                    min={1}
                    placeholder="20260"
                    defaultValue={defaults?.yskSecimId ?? ""}
                  />
                </FieldGroup>
                <FieldGroup label="Seçim türü (secimTuru)" htmlFor="yskSecimTuru">
                  <Input
                    id="yskSecimTuru"
                    name="yskSecimTuru"
                    type="number"
                    min={1}
                    placeholder="2"
                    defaultValue={defaults?.yskSecimTuru ?? ""}
                  />
                </FieldGroup>
                <FieldGroup label="İl kodu (ilId)" htmlFor="yskIlId">
                  <Input id="yskIlId" name="yskIlId" type="number" min={1} placeholder="81" defaultValue={defaults?.yskIlId ?? ""} />
                </FieldGroup>
                <FieldGroup label="Odak ilçe" htmlFor="yskFocusIlce">
                  <Input
                    id="yskFocusIlce"
                    name="yskFocusIlce"
                    placeholder="DÜZCE MERKEZ"
                    defaultValue={defaults?.yskFocusIlce ?? ""}
                  />
                </FieldGroup>
              </div>
              <label className="mt-3 flex min-h-[44px] items-center gap-2 text-sm font-semibold text-ink">
                <input
                  type="checkbox"
                  name="yskSyncEnabled"
                  defaultChecked={defaults?.yskSyncEnabled}
                  className="h-4 w-4 accent-brand"
                />
                YSK senkronizasyonunu etkinleştir
              </label>
            </div>
            <div className="sm:col-span-2">
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-soft">Sandık özeti</p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <FieldGroup label="Toplam sandık" htmlFor="totalBoxes">
                  <Input id="totalBoxes" name="totalBoxes" type="number" min={0} defaultValue={defaults?.totalBoxes ?? 0} />
                </FieldGroup>
                <FieldGroup label="Açılan sandık" htmlFor="openBoxes">
                  <Input id="openBoxes" name="openBoxes" type="number" min={0} defaultValue={defaults?.openBoxes ?? 0} />
                </FieldGroup>
                <FieldGroup label="Toplam seçmen" htmlFor="totalVoters">
                  <Input id="totalVoters" name="totalVoters" type="number" min={0} defaultValue={defaults?.totalVoters ?? 0} />
                </FieldGroup>
                <FieldGroup label="Kullanılan oy" htmlFor="usedVotes">
                  <Input id="usedVotes" name="usedVotes" type="number" min={0} defaultValue={defaults?.usedVotes ?? 0} />
                </FieldGroup>
                <FieldGroup label="Geçerli oy" htmlFor="validVotes">
                  <Input id="validVotes" name="validVotes" type="number" min={0} defaultValue={defaults?.validVotes ?? 0} />
                </FieldGroup>
              </div>
            </div>
          </div>
        ) : null}

        {tab === "adaylar" ? (
          <div className="space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-semibold text-ink">Aday listesi</p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button type="button" size="sm" variant="outline" className="w-full sm:w-auto" onClick={() => setCandidates((prev) => [...prev, emptyCandidate("MAYOR")])}>
                  <Plus className="h-4 w-4" /> Belediye adayı
                </Button>
                <Button type="button" size="sm" variant="outline" className="w-full sm:w-auto" onClick={() => setCandidates((prev) => [...prev, emptyCandidate("COUNCIL")])}>
                  <Plus className="h-4 w-4" /> Meclis adayı
                </Button>
              </div>
            </div>
            {candidates.map((candidate, index) => (
              <div key={candidate.key} className="rounded-2xl border border-border bg-surface/40 p-3 sm:p-4">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <span className="text-xs font-bold uppercase tracking-wide text-ink-soft">
                    {RACE_TYPE_LABELS[candidate.raceType]} · {index + 1}
                  </span>
                  <button
                    type="button"
                    disabled={candidates.length <= 1}
                    onClick={() => setCandidates((prev) => prev.filter((item) => item.key !== candidate.key))}
                    className="flex h-11 w-11 items-center justify-center rounded-lg text-ink-soft hover:bg-white hover:text-brand disabled:opacity-40"
                    aria-label="Adayı sil"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <FieldGroup label="Tür">
                    <Select
                      value={candidate.raceType}
                      onChange={(e) =>
                        setCandidates((prev) =>
                          prev.map((item) =>
                            item.key === candidate.key ? { ...item, raceType: e.target.value as ElectionRaceType } : item,
                          ),
                        )
                      }
                    >
                      {Object.entries(RACE_TYPE_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </Select>
                  </FieldGroup>
                  <FieldGroup label="Ad soyad">
                    <Input
                      value={candidate.name}
                      onChange={(e) =>
                        setCandidates((prev) =>
                          prev.map((item) => (item.key === candidate.key ? { ...item, name: e.target.value } : item)),
                        )
                      }
                      required
                    />
                  </FieldGroup>
                  <FieldGroup label="Parti">
                    <Input
                      value={candidate.partyName}
                      list="party-suggestions"
                      onChange={(e) => {
                        const partyName = e.target.value;
                        const color = DEFAULT_PARTY_COLORS[partyName] ?? candidate.partyColor;
                        setCandidates((prev) =>
                          prev.map((item) =>
                            item.key === candidate.key ? { ...item, partyName, partyColor: color } : item,
                          ),
                        );
                      }}
                      required
                    />
                  </FieldGroup>
                  <FieldGroup label="Parti rengi">
                    <Input
                      type="color"
                      value={candidate.partyColor}
                      onChange={(e) =>
                        setCandidates((prev) =>
                          prev.map((item) => (item.key === candidate.key ? { ...item, partyColor: e.target.value } : item)),
                        )
                      }
                      className="h-11 w-full p-1"
                    />
                  </FieldGroup>
                  <FieldGroup label="Oy sayısı">
                    <Input
                      type="number"
                      min={0}
                      value={candidate.votes}
                      onChange={(e) =>
                        setCandidates((prev) =>
                          prev.map((item) =>
                            item.key === candidate.key ? { ...item, votes: Number(e.target.value) || 0 } : item,
                          ),
                        )
                      }
                    />
                  </FieldGroup>
                  <FieldGroup label="Oy oranı (%)">
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      step={0.01}
                      value={candidate.votePct}
                      onChange={(e) =>
                        setCandidates((prev) =>
                          prev.map((item) =>
                            item.key === candidate.key ? { ...item, votePct: Number(e.target.value) || 0 } : item,
                          ),
                        )
                      }
                    />
                  </FieldGroup>
                  <div className="sm:col-span-2">
                    <FieldGroup label="Fotoğraf">
                      <ImageUploadField
                        name={`candidatePhoto_${candidate.key}`}
                        defaultValue={candidate.photoUrl}
                        onValueChange={(url) =>
                          setCandidates((prev) =>
                            prev.map((item) => (item.key === candidate.key ? { ...item, photoUrl: url } : item)),
                          )
                        }
                      />
                    </FieldGroup>
                  </div>
                  <FieldGroup label="Slogan">
                    <Input
                      value={candidate.slogan}
                      onChange={(e) =>
                        setCandidates((prev) =>
                          prev.map((item) => (item.key === candidate.key ? { ...item, slogan: e.target.value } : item)),
                        )
                      }
                    />
                  </FieldGroup>
                  <FieldGroup label="Kısa bio">
                    <Textarea
                      rows={2}
                      value={candidate.bio}
                      onChange={(e) =>
                        setCandidates((prev) =>
                          prev.map((item) => (item.key === candidate.key ? { ...item, bio: e.target.value } : item)),
                        )
                      }
                    />
                  </FieldGroup>
                </div>
              </div>
            ))}
            <datalist id="party-suggestions">
              {Object.keys(DEFAULT_PARTY_COLORS).map((party) => (
                <option key={party} value={party} />
              ))}
            </datalist>
          </div>
        ) : null}

        {tab === "ilceler" ? (
          <div className="space-y-3">
            <p className="text-sm text-ink-soft">Düzce ilçeleri — sandık ve katılım verilerini güncelleyin.</p>
            {districts.map((district) => (
              <div key={district.key} className="rounded-xl border border-border bg-white p-3 sm:p-4">
                <p className="mb-3 text-sm font-bold text-ink">{district.name}</p>
                <div className="grid gap-3 sm:grid-cols-3">
                  <FieldGroup label="Toplam sandık">
                    <Input
                      type="number"
                      min={0}
                      value={district.totalBoxes}
                      onChange={(e) =>
                        setDistricts((prev) =>
                          prev.map((item) =>
                            item.key === district.key ? { ...item, totalBoxes: Number(e.target.value) || 0 } : item,
                          ),
                        )
                      }
                    />
                  </FieldGroup>
                  <FieldGroup label="Açılan sandık">
                    <Input
                      type="number"
                      min={0}
                      value={district.openBoxes}
                      onChange={(e) =>
                        setDistricts((prev) =>
                          prev.map((item) =>
                            item.key === district.key ? { ...item, openBoxes: Number(e.target.value) || 0 } : item,
                          ),
                        )
                      }
                    />
                  </FieldGroup>
                  <FieldGroup label="Katılım (%)">
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      step={0.01}
                      value={district.turnoutPct}
                      onChange={(e) =>
                        setDistricts((prev) =>
                          prev.map((item) =>
                            item.key === district.key ? { ...item, turnoutPct: Number(e.target.value) || 0 } : item,
                          ),
                        )
                      }
                    />
                  </FieldGroup>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {error ? <p className="text-sm font-medium text-brand">{error}</p> : null}

        <PanelFormFooter>
          <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => router.back()}>
            Vazgeç
          </Button>
          <Button type="submit" disabled={loading} className="w-full sm:w-auto">
            {loading ? "Kaydediliyor..." : isEdit ? "Güncelle" : "Oluştur"}
          </Button>
        </PanelFormFooter>
      </form>
    </FormCard>
  );
}
