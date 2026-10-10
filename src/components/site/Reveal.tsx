"use client";

import { useEffect } from "react";

export function Reveal() {
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // İçerik JS olmadan da görünür; yalnız ekrandan aşağıdaki bölümlere hareket eklenir.
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.remove("reveal-pending");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    document.querySelectorAll(".reveal").forEach((el) => {
      if (el.getBoundingClientRect().top > innerHeight) {
        el.classList.add("reveal-pending");
        observer.observe(el);
      }
    });
    return () => {
      observer.disconnect();
      document.querySelectorAll(".reveal-pending").forEach((el) => el.classList.remove("reveal-pending"));
    };
  }, []);
  return null;
}
