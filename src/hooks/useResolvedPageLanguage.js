import { useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { buildLangUrl } from "../utils/pathManager";

export function useResolvedPageLanguage({
  askedLang,
  resolveGuard,
  generalByLang,
  redirectOnFallback = true,
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const guard = useMemo(() => {
    return resolveGuard();
  }, [resolveGuard]);

  const { effectiveLang, hasFallback, unavailable } = guard;

  useEffect(() => {
    if (!redirectOnFallback) return;
    if (!effectiveLang) return;
    if (effectiveLang === askedLang) return;

    const nextUrl = buildLangUrl(effectiveLang, {
      pathname: location.pathname,
      search: location.search,
      hash: location.hash,
    });

    navigate(nextUrl, { replace: true });
  }, [
    askedLang,
    effectiveLang,
    redirectOnFallback,
    location.pathname,
    location.search,
    location.hash,
    navigate,
  ]);

  const noticeUi = useMemo(() => {
    return generalByLang[askedLang] || generalByLang.fr;
  }, [askedLang, generalByLang]);

  return {
    askedLang,
    effectiveLang,
    hasFallback,
    unavailable,
    noticeUi,
  };
}
