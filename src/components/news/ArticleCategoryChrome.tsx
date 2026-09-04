"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/utils";
import { categoryHref } from "@/lib/category-path";

type CategoryActiveDetail = {
  name: string;
  slug: string;
  color: string | null;
};

function replaceArticleUrl(url: string, title?: string | null) {
  if (window.location.pathname === url) {
    if (title) document.title = `${title} | Düzce Radikal`;
    return;
  }
  const state = window.history.state;
  window.history.replaceState(
    state && typeof state === "object" ? { ...state } : state,
    "",
    url,
  );
  if (title) document.title = `${title} | Düzce Radikal`;
}

const STUCK_ON = 120;
const STUCK_OFF = 24;

export function ArticleCategoryChrome({
  name,
  slug,
  color,
  children,
}: {
  name: string;
  slug: string;
  color: string | null;
  children?: ReactNode;
}) {
  const router = useRouter();
  const [stuck, setStuck] = useState(false);
  const stuckRef = useRef(false);
  const origin = useMemo(() => ({ name, slug, color }), [name, slug, color]);
  const originKey = `${name}|${slug}|${color ?? ""}`;
  const originRef = useRef<CategoryActiveDetail>(origin);
  const [scrollActive, setScrollActive] = useState<{
    key: string;
    detail: CategoryActiveDetail;
  } | null>(null);
  const active =
    scrollActive && scrollActive.key === originKey ? scrollActive.detail : origin;
  const bg = active.color || "var(--brand)";

  useEffect(() => {
    originRef.current = origin;
  }, [origin]);

  useEffect(() => {
    let frame = 0;
    const applyReadingChrome = () => {
      const y = window.scrollY;
      let nextStuck = stuckRef.current;
      if (!stuckRef.current && y > STUCK_ON) nextStuck = true;
      else if (stuckRef.current && y < STUCK_OFF) nextStuck = false;
      if (nextStuck !== stuckRef.current) {
        stuckRef.current = nextStuck;
        setStuck(nextStuck);
        document.documentElement.classList.toggle("article-reading", nextStuck);
      }

      const bandTop = 72;
      const items = document.querySelectorAll<HTMLElement>(".article-continue-item");
      let current: HTMLElement | null = null;
      for (const el of items) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= bandTop && rect.bottom > bandTop + 48) current = el;
      }

      const key = `${originRef.current.name}|${originRef.current.slug}|${originRef.current.color ?? ""}`;

      if (current) {
        const next = {
          name: current.dataset.categoryName || originRef.current.name,
          slug: current.dataset.categorySlug || originRef.current.slug,
          color: current.dataset.categoryColor || originRef.current.color,
        };
        setScrollActive((prev) =>
          prev?.key === key &&
          prev.detail.slug === next.slug &&
          prev.detail.name === next.name &&
          prev.detail.color === next.color
            ? prev
            : { key, detail: next },
        );
        const url = current.dataset.url;
        const title = current.dataset.title;
        if (url) replaceArticleUrl(url, title);
        return;
      }

      setScrollActive(null);
      const main = document.getElementById("article-main");
      const url = main?.getAttribute("data-url");
      const title = main?.getAttribute("data-title");
      if (url) replaceArticleUrl(url, title);
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        applyReadingChrome();
      });
    };
    applyReadingChrome();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.cancelAnimationFrame(frame);
      document.documentElement.classList.remove("article-reading");
    };
  }, []);

  function goBack() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    router.push(categoryHref(active.slug));
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href={categoryHref(slug)}
          className="inline-flex items-center px-3 py-1.5 text-[12px] font-extrabold uppercase tracking-wide text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: color || "var(--brand)" }}
        >
          {name}
        </Link>
        {children}
      </div>

      <div
        className={cn(
          "fixed inset-x-0 top-0 z-[60] transition-transform duration-200",
          stuck ? "translate-y-0" : "-translate-y-full",
        )}
        aria-hidden={!stuck}
      >
        <div className="shadow-sm" style={{ backgroundColor: bg }}>
          <Container className="flex h-11 items-center gap-2">
            <button
              type="button"
              onClick={goBack}
              tabIndex={stuck ? 0 : -1}
              aria-label="Geri"
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-sm text-white/90 transition-colors hover:bg-white/15 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <ArrowLeft className="h-5 w-5" aria-hidden />
            </button>
            <Link
              href={categoryHref(active.slug)}
              tabIndex={stuck ? 0 : -1}
              className="text-[13px] font-extrabold uppercase tracking-wide text-white"
            >
              {active.name}
            </Link>
          </Container>
        </div>
      </div>
    </>
  );
}
