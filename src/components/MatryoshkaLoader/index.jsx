import { useEffect, useState } from "react";
import { motion as Motion } from "framer-motion";
import { AnimatePresence, useAnimation } from "framer-motion";
import styles from "./MatryoshkaLoader.module.css";

import full from "../../assets/images/matreshka.webp";
import top from "../../assets/images/matreshka_top.webp";
import bottom from "../../assets/images/matreshka_bottom.webp";

export default function MatryoshkaLoader({ onComplete }) {
  const [phase, setPhase] = useState("full"); // 'full', 'rotating', 'split'

  const topControls = useAnimation();
  const bottomControls = useAnimation();
  const overlayControls = useAnimation();

  useEffect(() => {
    async function animate() {
      // Показ целой матрешки
      setPhase("rotating");

      // Крутим
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Переход к split
      setPhase("split");

      // Ждём 50ms, чтобы React успел отрисовать <img>
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Анимация верхней части
      topControls.start({
        y: -100, // приподнимается вверх
        x: -180, // уезжает влево
        rotate: -180, // поворот против часовой
        originY: 1, // вращаем относительно нижнего края
        transition: {
          duration: 6,
          ease: "easeInOut",
        },
      });

      // Анимация нижней части
      bottomControls.start({
        x: [-4, 4, -2, 2, 0],
        transition: { duration: 1.2, ease: "easeInOut" },
      });

      // Пауза → затем исчезновение
      await new Promise((resolve) => setTimeout(resolve, 1800));

      overlayControls.start({
        opacity: 0,
        transition: { duration: 0.6, ease: "easeOut" },
      });
      setTimeout(() => onComplete?.(), 600);
    }

    animate();
  }, [topControls, bottomControls, overlayControls, onComplete]);

  return (
    <Motion.div className={styles.overlay} initial={{ opacity: 1 }} animate={overlayControls}>
      <AnimatePresence>
        {phase === "rotating" && (
          <Motion.img
            key="full"
            src={full}
            alt="matreshka full"
            className={styles.full}
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, ease: "linear" }}
          />
        )}
      </AnimatePresence>

      {phase === "split" && (
        <>
          <Motion.img
            src={bottom}
            alt="matreshka bottom"
            className={styles.bottom}
            initial={{ opacity: 1, x: 0 }}
            animate={bottomControls}
          />
          <Motion.img
            src={top}
            alt="matreshka top"
            className={styles.top}
            initial={{ y: 0, rotate: 0, opacity: 1 }}
            animate={topControls}
          />
        </>
      )}
    </Motion.div>
  );
}
