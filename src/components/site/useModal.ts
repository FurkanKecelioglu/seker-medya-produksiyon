"use client";

import { useEffect } from "react";
import type { RefObject } from "react";

export function useModal(active: boolean, dialog: RefObject<HTMLDialogElement | null>, opener: RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!active) return;
    const el = dialog.current;
    const button = opener.current;
    const body = document.body;
    const root = document.documentElement;
    const y = window.scrollY;
    const previous = {
      position: body.style.position, top: body.style.top, width: body.style.width, height: body.style.height,
      overflow: body.style.overflow, rootOverflow: root.style.overflow,
    };
    // Sabit gövde, mobil Safari'de de arka planın kaymasını ve odak sıçramasını önler.
    body.style.position = "fixed";
    body.style.top = `-${y}px`;
    body.style.width = "100%";
    body.style.height = "100%";
    body.style.overflow = "hidden";
    root.style.overflow = "hidden";
    el?.showModal();
    const trapFocus = (event: KeyboardEvent) => {
      if (event.key !== "Tab" || !el) return;
      const elements = Array.from(el.querySelectorAll<HTMLElement>(
        "a[href], button:not(:disabled), input:not(:disabled), select, textarea, [tabindex='0']",
      )).filter((item) => item.getClientRects().length > 0);
      const first = elements[0];
      const last = elements[elements.length - 1];
      const current = document.activeElement;
      if (!first || !last) { event.preventDefault(); return; }
      if (event.shiftKey && (current === first || !el.contains(current))) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && (current === last || !el.contains(current))) {
        event.preventDefault(); first.focus();
      }
    };
    document.addEventListener("keydown", trapFocus, true);
    return () => {
      document.removeEventListener("keydown", trapFocus, true);
      el?.close();
      body.style.position = previous.position;
      body.style.top = previous.top;
      body.style.width = previous.width;
      body.style.height = previous.height;
      body.style.overflow = previous.overflow;
      root.style.overflow = previous.rootOverflow;
      window.scrollTo({ top: y, behavior: "instant" });
      button?.focus({ preventScroll: true });
    };
  }, [active, dialog, opener]);
}
