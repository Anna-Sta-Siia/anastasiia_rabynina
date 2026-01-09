import { useEffect, useMemo, useState, useRef } from "react";
import styles from "./LevelSlider.module.css";

const STOPS = [
  { value: 1, key: "beginner" },
  { value: 2, key: "intermediate" },
  { value: 3, key: "advanced" },
  { value: 4, key: "expert" },
];

const RAW_MAX = 1000;

export default function LevelSlider({ value = 1, onChange, t }) {
  const max = STOPS[STOPS.length - 1].value;

  const [raw, setRaw] = useState(() => levelToRaw(value, max));

  // 👇 ref на обёртку, чтобы писать CSS-переменные
  const wrapRef = useRef(null);

  useEffect(() => {
    setRaw(levelToRaw(value, max));
  }, [value, max]);

  const pct = (raw / RAW_MAX) * 100;
  const level = useMemo(() => rawToLevel(raw, max), [raw, max]);

  const activeStop = STOPS.find((s) => s.value === level) ?? STOPS[0];
  const activeText = t?.levels?.[activeStop.key] ?? activeStop.key;

  const fillCenterLeft = `clamp(36px, ${pct / 2}%, calc(100% - 36px))`;
  const showHint = raw < 8;

  // ✅ ВРАЩЕНИЕ: плавное по всей длине
  useEffect(() => {
    // сколько оборотов хочешь на всей длине
    const turns = 4; // 4 полных оборота от 0 до 100%
    const deg = (raw / RAW_MAX) * 360 * turns;

    wrapRef.current?.style.setProperty("--roll", `${deg}deg`);
  }, [raw]);

  function handleRawChange(nextRaw) {
    setRaw(nextRaw);

    const nextLevel = rawToLevel(nextRaw, max);
    if (nextLevel !== value) onChange?.(nextLevel);
  }

  return (
    <div ref={wrapRef} className={styles.sliderWrap}>
      <div className={styles.slider}>
        <div className={styles.track} aria-hidden="true">
          <div className={styles.fill} style={{ width: `${pct}%` }} />
        </div>

        {/* Hint внутри трека до первого действия */}
        {showHint && (
          <div className={styles.hint} aria-live="polite">
            {t?.chooseLevelHint ?? "Choisissez un niveau"}
          </div>
        )}

        {/* Активный уровень — по центру зелёной части */}
        {!showHint && (
          <div
            key={level}
            className={styles.activeLabel}
            style={{ left: fillCenterLeft }}
            aria-hidden="true"
            title={activeText}
          >
            {activeText}
          </div>
        )}

        <input
          className={styles.range}
          type="range"
          min={0}
          max={RAW_MAX}
          step={1}
          value={raw}
          onChange={(e) => handleRawChange(Number(e.target.value))}
          aria-labelledby="level-slider-label"
          aria-describedby="level-slider-sr"
        />
        <span id="level-slider-label" className={styles.srOnly}>
          {t?.levelFilterLabel ?? "Level"}
        </span>
      </div>

      <p id="level-slider-sr" className={styles.srOnly}>
        {t?.screenreader ?? "Используйте стрелки или клик по шкале, чтобы выбрать уровень."}
      </p>
    </div>
  );
}

function rawToLevel(raw, max) {
  // строго по четвертям (очень предсказуемо):
  const ratio = raw / RAW_MAX; // 0..1
  const idx = Math.min(max - 1, Math.floor(ratio * max)); // 0..3
  return idx + 1; // 1..4
}

function levelToRaw(level, max) {
  const ratio = (level - 1) / (max - 1);
  return Math.round(ratio * RAW_MAX);
}
