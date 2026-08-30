import Link from "next/link";
import { AdUnit } from "@/components/ads/AdUnit";
import {
  ArticleSidebarPanels,
  type SidebarPanelsData,
} from "@/components/news/ArticleSidebarPanels";

export type { SidebarPanelsData };

export function ArticleSidebar(props: SidebarPanelsData) {
  return (
    <div className="space-y-5 xl:sticky xl:top-24 xl:self-start">
      <AdUnit code="069" className="py-0" />
      <AdUnit code="300" className="py-0" />
      <ArticleSidebarPanels {...props} />
      <AdUnit code="133" className="py-0" />
    </div>
  );
}
