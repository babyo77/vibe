"use client";
// import { useEffect, useRef } from "react";
// import Lenis from "@studio-freight/lenis";

function SmoothScrollingDiv({ children }: { children: React.ReactNode }) {
  // const scrollRef = useRef<HTMLDivElement>(null);
  // const lenisRef = useRef<Lenis | null>(null);

  // useEffect(() => {
  //   if (!scrollRef.current) return;

  //   // Initialize Lenis with the scrollable div as the wrapper
  //   const lenis = new Lenis({
  //     wrapper: scrollRef.current,
  //   });

  //   lenisRef.current = lenis;

  //   // Animation frame to continuously update Lenis
  //   function raf(time: number) {
  //     lenis.raf(time);
  //     requestAnimationFrame(raf);
  //   }

  //   requestAnimationFrame(raf);

  //   // Clean up when the component unmounts
  //   return () => {
  //     lenis.destroy();
  //   };
  // }, []);

  // // Update Lenis after dynamic content changes (trigger reflow)
  // useEffect(() => {
  //   if (lenisRef.current) {
  //     lenisRef.current.resize(); // Recalculate scrolling after content change
  //   }
  // }, [children]); // Re-run when the children (dynamic content) changes

  return (
    <div
      // ref={scrollRef}
      className="h-full transition-all z-50 overflow-y-scroll"
    >
      {children}
    </div>
  );
}

export default SmoothScrollingDiv;
