import { Routes, Route } from "react-router-dom";
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

export default function App() {
  const [hasPlayedOnce, setHasPlayedOnce] = useState(() => {
    return sessionStorage.getItem("hasPlayedOnce") === "true";
  });

  const [phase, setPhase] = useState("matryoshka");

  const handleMatryoshkaEnd = () => {
    setTimeout(() => {
      setPhase(hasPlayedOnce ? "app" : "medallion");
    }, 500);
  };

  const handleMedallionEnd = () => {
    sessionStorage.setItem("hasPlayedOnce", "true");
    setHasPlayedOnce(true);
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
        <Route path="/" element={<Layout phase={phase} />}>
          <Route index element={<Accueil phase={phase} onFinish={handleMedallionEnd} />} />
          <Route path="projects" element={<Projects />} />
          <Route path="skills" element={<Skills />} />
          <Route path="contact" element={<Contact />} />
          <Route path="cv" element={<CV />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>

      {phase === "matryoshka" && <MatryoshkaLoader onComplete={handleMatryoshkaEnd} />}
    </>
  );
}
