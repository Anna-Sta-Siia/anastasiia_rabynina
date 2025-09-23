// src/hooks/useModalTransformLockDeep.js
import { useLayoutEffect } from "react";

export default function useModalTransformLockDeep(anchorRef, open, { lockScroll = true } = {}) {
  useLayoutEffect(() => {
    const anchor = anchorRef?.current;
    if (!open || !anchor) return;

    const offenders = [];
    let el = anchor; // ВКЛЮЧАЕМ САМУ КАРТОЧКУ

    while (el && el !== document.documentElement) {
      const cs = getComputedStyle(el);
      const isBad =
        cs.transform !== "none" ||
        cs.perspective !== "none" ||
        cs.filter !== "none" ||
        cs.backdropFilter !== "none" ||
        cs.contain !== "none" ||
        cs.clipPath !== "none" ||
        cs.maskImage !== "none" ||
        cs.overflow !== "visible" ||
        cs.overflowX !== "visible" ||
        cs.overflowY !== "visible";

      if (isBad) offenders.push(el);
      el = el.parentElement;
    }

    const prevBody = document.body.style.overflow;
    if (lockScroll) document.body.style.overflow = "hidden";

    const prev = new Map();
    offenders.forEach((n) => {
      prev.set(n, {
        width: n.style.width,
        height: n.style.height,
        transform: n.style.transform,
        perspective: n.style.perspective,
        filter: n.style.filter,
        backdropFilter: n.style.backdropFilter,
        contain: n.style.contain,
        overflow: n.style.overflow,
        overflowX: n.style.overflowX,
        overflowY: n.style.overflowY,
        clipPath: n.style.clipPath,
        maskImage: n.style.maskImage,
      });

      // фиксируем размеры, чтобы ничего не "дёрнулось"
      const r = n.getBoundingClientRect();
      n.style.width = r.width + "px";
      n.style.height = r.height + "px";

      // снимаем ВСЁ, что создаёт новый контекст или клиппинг
      Object.assign(n.style, {
        transform: "none",
        perspective: "none",
        filter: "none",
        backdropFilter: "none",
        contain: "initial",
        overflow: "visible",
        overflowX: "visible",
        overflowY: "visible",
        clipPath: "none",
        maskImage: "none",
      });
    });

    return () => {
      offenders.forEach((n) => {
        const p = prev.get(n);
        if (p) Object.assign(n.style, p);
      });
      if (lockScroll) document.body.style.overflow = prevBody;
    };
  }, [anchorRef, open, lockScroll]);
}
