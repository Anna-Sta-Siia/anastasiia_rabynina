import { useEffect, useRef } from "react";
import Header from "../Header";
import Footer from "../Footer";
import { Outlet } from "react-router-dom";

export default function Layout({ phase }) {
  const headerRef = useRef(null);
  const footerRef = useRef(null);

  useEffect(() => {
    const setVars = () => {
      const h = headerRef.current?.offsetHeight ?? 0;
      const f = footerRef.current?.offsetHeight ?? 0;
      document.documentElement.style.setProperty("--header-h", `${h}px`);
      document.documentElement.style.setProperty("--footer-h", `${f}px`);
    };

    setVars(); // initial
    const ro = new ResizeObserver(setVars);
    if (headerRef.current) ro.observe(headerRef.current);
    if (footerRef.current) ro.observe(footerRef.current);
    window.addEventListener("resize", setVars);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", setVars);
    };
  }, []);

  // Recalcule quand tu affiches/masques le header/footer
  useEffect(() => {
    requestAnimationFrame(() => {
      const h = headerRef.current?.offsetHeight ?? 0;
      const f = footerRef.current?.offsetHeight ?? 0;
      document.documentElement.style.setProperty("--header-h", `${h}px`);
      document.documentElement.style.setProperty("--footer-h", `${f}px`);
    });
  }, [phase]);

  return (
    <>
      <Header ref={headerRef} className={phase !== "app" ? "hidden" : ""} />
      <Outlet />
      <Footer ref={footerRef} className={phase !== "app" ? "hidden" : ""} />
    </>
  );
}
