// src/hooks/useStep.js
import { useCallback, useMemo, useState } from "react";

export default function useStep(total = 4, initial = 1) {
  const [step, setStep] = useState(initial);
  const next = useCallback(() => setStep((s) => Math.min(s + 1, total)), [total]);
  const prev = useCallback(() => setStep((s) => Math.max(s - 1, 1)), []);
  const goto = useCallback((n) => setStep(() => Math.min(Math.max(1, n), total)), [total]);

  const progress = useMemo(() => {
    const t = (step - 1) / (total - 1 || 1);
    const eased = 1 - Math.pow(1 - t, 1.6);
    return {
      pct: Math.round(eased * 100),
      hue: Math.round(28 + eased * (160 - 28)),
    };
  }, [step, total]);

  return { step, setStep: goto, next, prev, progress };
}
