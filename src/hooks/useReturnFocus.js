import { useEffect, useRef } from "react";

export function useReturnFocus(isOpen) {
  const lastOpenerRef = useRef(null);
  useEffect(() => {
    if (!isOpen) lastOpenerRef.current?.focus?.();
  }, [isOpen]);
  return lastOpenerRef;
}
