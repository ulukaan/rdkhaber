-- AdSense manuel reklam birimleri için slot alanları
ALTER TABLE "AdSlot" ADD COLUMN "kind" TEXT NOT NULL DEFAULT 'BANNER';
ALTER TABLE "AdSlot" ADD COLUMN "adsenseSlot" TEXT;
ALTER TABLE "AdSlot" ADD COLUMN "adsenseLayout" TEXT;
ALTER TABLE "AdSlot" ADD COLUMN "adsenseFormat" TEXT;

CREATE INDEX "AdSlot_kind_active_idx" ON "AdSlot"("kind", "active");
