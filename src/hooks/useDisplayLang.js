// src/hooks/useDisplayLang.js
import { useLocation } from "react-router-dom";
import { getLangFromPathname, getDefaultLang } from "../utils/pathManager";

export function useDisplayLang() {
  const { pathname } = useLocation();
  return getLangFromPathname(pathname) || getDefaultLang();
}
