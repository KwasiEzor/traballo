"use client";

import * as React from "react";
import dynamic from "next/dynamic";

const SiteMapInner = dynamic(() => import("./site-map-inner"), {
  ssr: false,
  loading: () => <div className="h-[340px] w-full animate-pulse bg-slate-100" />,
});

/**
 * Interactive location map for the public site. The Leaflet bundle + tiles
 * only load once the section scrolls near the viewport.
 */
export function SiteMap(props: {
  lat: number;
  lng: number;
  label: string;
  color: string;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el || show) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShow(true);
          io.disconnect();
        }
      },
      { rootMargin: "300px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [show]);

  return (
    <div ref={ref} className="h-[340px] w-full bg-slate-100">
      {show && <SiteMapInner {...props} />}
    </div>
  );
}
