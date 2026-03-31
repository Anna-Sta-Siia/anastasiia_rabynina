import { Outlet, useParams, useSearchParams } from "react-router-dom";
import { useLayoutEffect } from "react";
import { useUI } from "../context";
import { saveLang } from "../utils/pathManager";

export default function SyncAskedLangWithUrl() {
  const { lang } = useParams();
  const [searchParams] = useSearchParams();
  const { askedLang, setAskedLang } = useUI();

  const from = searchParams.get("from");
  const nextAskedLang = from || lang;

  useLayoutEffect(() => {
    if (!nextAskedLang) return;
    if (nextAskedLang === askedLang) return;

    setAskedLang(nextAskedLang);
    saveLang(nextAskedLang);
  }, [nextAskedLang, askedLang, setAskedLang]);

  return <Outlet />;
}
