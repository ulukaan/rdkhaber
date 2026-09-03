"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
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
  const [active, setActive] = useState<CategoryActiveDetail>({ name, slug, color });
  const bg = active.color || "var(--brand)";

  if (active.name !== name || active.slug !== slug || active.color !== color) {
    setActive({ name, slug, color });
  }

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const y = window.scrollY;
        let next = stuckRef.current;
        if (!stuckRef.current && y > STUCK_ON) next = true;
        else if (stuckRef.current && y < STUCK_OFF) next = false;
        if (next === stuckRef.current) return;
        stuckRef.current = next;
        setStuck(next);
        document.documentElement.classList.toggle("article-reading", next);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.cancelAnimationFrame(frame);
      document.documentElement.classList.remove("article-reading");
    };
  }, []);

  useEffect(() => {
    const onContinue = (event: Event) => {
      const detail = (event as CustomEvent<CategoryActiveDetail>).detail;
      if (!detail?.slug) return;
      setActive(detail);
    };
    window.addEventListener("continue-article-active", onContinue);
    return () => window.removeEventListener("continue-article-active", onContinue);
  }, []);

  useEffect(() => {
    const main = document.getElementById("article-main");
    if (!main) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting || entry.intersectionRatio < 0.25) return;
        setActive({ name, slug, color });
        const url = main.getAttribute("data-url");
        const title = main.getAttribute("data-title");
        if (url && window.location.pathname !== url) {
          window.history.replaceState(null, "", url);
          if (title) document.title = `${title} | Düzce Radikal`;
        }
      },
      { threshold: [0.25] },
    );
    observer.observe(main);
    return () => observer.disconnect();
  }, [name, slug, color]);

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
