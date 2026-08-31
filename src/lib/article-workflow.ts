import type { Role } from "@prisma/client";
import type { SettingKey } from "@/lib/settings";

type PublishInput = {
  requestedStatus: string;
  scheduledAt: Date | null;
  publishedAt: Date | null;
  role: Role;
  editorRequiresApproval: boolean;
};

export type PublishResolution = {
  status: "DRAFT" | "REVIEW" | "PUBLISHED" | "ARCHIVED";
  publishedAt: Date | null;
  scheduledAt: Date | null;
  pendingApproval: boolean;
};

/** Editör onayı, zamanlanmış yayın ve durum çözümlemesi. */
export function resolveArticlePublishState(input: PublishInput): PublishResolution {
  const now = new Date();

  if (input.scheduledAt && input.scheduledAt.getTime() > now.getTime()) {
    return {
      status: "DRAFT",
      publishedAt: null,
      scheduledAt: input.scheduledAt,
      pendingApproval: false,
    };
  }

  if (input.requestedStatus === "PUBLISHED") {
    if (input.role === "EDITOR" && input.editorRequiresApproval) {
      return {
        status: "REVIEW",
        publishedAt: input.publishedAt,
        scheduledAt: null,
        pendingApproval: true,
      };
    }
    return {
      status: "PUBLISHED",
      publishedAt: input.scheduledAt ?? input.publishedAt ?? now,
      scheduledAt: null,
      pendingApproval: false,
    };
  }

  if (input.requestedStatus === "ARCHIVED") {
    return {
      status: "ARCHIVED",
      publishedAt: input.publishedAt,
      scheduledAt: null,
      pendingApproval: false,
    };
  }

  if (input.requestedStatus === "REVIEW") {
    return {
      status: "REVIEW",
      publishedAt: input.publishedAt,
      scheduledAt: null,
      pendingApproval: true,
    };
  }

  return {
    status: "DRAFT",
    publishedAt: input.publishedAt,
    scheduledAt: input.scheduledAt,
    pendingApproval: false,
  };
}

export function parseScheduledAt(raw?: string | null) {
  if (!raw?.trim()) return null;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
}
