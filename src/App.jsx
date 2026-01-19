import { Routes, Route, Navigate, Outlet, useParams } from "react-router-dom";
import { useState, useEffect } from "react";

import medallionBack from "./assets/images/medaillon_back.webp";
import portrait from "./assets/images/AnastasiaGirard.webp";
import MatryoshkaLoader from "./components/MatryoshkaLoader";
import Layout from "./components/Layout";
import Accueil from "./pages/Accueil";
import Projects from "./pages/Projects";
import Skills from "./pages/Skills";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import CV from "./pages/CV";

import { LANGS, getDefaultLang } from "./utils/pathManager";

function RequireValidLang({ defaultLang }) {
  const { lang } = useParams();
  if (!LANGS.includes(lang)) return <Navigate to={`/${defaultLang}/`} replace />;
  return <Outlet />;
}

export default function App() {
  const defaultLang = getDefaultLang();
  const [phase, setPhase] = useState("matryoshka");

  const handleMatryoshkaEnd = () => {
    setTimeout(() => {
      const played = sessionStorage.getItem("hasPlayedOnce") === "true";
      setPhase(played ? "app" : "medallion");
    }, 500);
  };

  const handleMedallionEnd = () => {
    sessionStorage.setItem("hasPlayedOnce", "true");
    setPhase("app");
  };

  useEffect(() => {
    const warm = (src) => {
      const img = new Image();
      img.src = src;
      img.decode?.().catch(() => {});
    };
    warm(medallionBack);
    warm(portrait);
  }, []);

  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to={`/${defaultLang}/`} replace />} />

        <Route element={<RequireValidLang defaultLang={defaultLang} />}>
          <Route path=":lang" element={<Layout />}>
            <Route index element={<Accueil phase={phase} onFinish={handleMedallionEnd} />} />
            <Route path="projects" element={<Projects />} />
            <Route path="skills" element={<Skills />} />
            <Route path="contact" element={<Contact />} />
            <Route path="cv" element={<CV />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to={`/${defaultLang}/`} replace />} />
      </Routes>

      {phase === "matryoshka" && <MatryoshkaLoader onComplete={handleMatryoshkaEnd} />}
    </>
  );
}
