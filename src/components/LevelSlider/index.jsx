import { useEffect, useMemo, useState } from "react";
import styles from "./LevelSlider.module.css";

const STOPS = [
  { value: 1, key: "beginner" },
  { value: 2, key: "intermediate" },
  { value: 3, key: "advanced" },
  { value: 4, key: "expert" },
];

const RAW_MAX = 1000;
const KOLOBOK_SIZE = 50; // px (визуальный размер колобка)

export default function LevelSlider({ value = 1, onChange, t }) {
  const max = STOPS[STOPS.length - 1].value;

  const [raw, setRaw] = useState(() => levelToRaw(value, max));
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    setRaw(levelToRaw(value, max));
  }, [value, max]);

  const pct = (raw / RAW_MAX) * 100;

  const level = useMemo(() => rawToLevel(raw, max), [raw, max]);
  const activeStop = STOPS.find((s) => s.value === level) ?? STOPS[0];
  const activeText = t?.levels?.[activeStop.key] ?? activeStop.key;

  const showHint = raw < 8;

  // центр зелёной части для activeLabel
  const fillCenterLeft = `clamp(36px, ${pct / 2}%, calc(100% - 36px))`;

  // позиция колобка по треку (с ограничением по краям)
  const kolobokLeft = `clamp(${KOLOBOK_SIZE / 2}px, ${pct}%, calc(100% - ${KOLOBOK_SIZE / 2}px))`;

  // вращение: плавно по всей длине
  const turns = 4;
  const rollDeg = (raw / RAW_MAX) * 360 * turns;

  function handleRawChange(nextRaw) {
    setRaw(nextRaw);

    const nextLevel = rawToLevel(nextRaw, max);
    if (nextLevel !== value) onChange?.(nextLevel);
  }

  return (
    <div className={styles.sliderWrap} style={{ "--roll": `${rollDeg}deg` }}>
      <div className={`${styles.slider} ${dragging ? styles.dragging : ""}`}>
        {/* Track + fill */}
        <div className={styles.track} aria-hidden="true">
          <div className={styles.fill} style={{ width: `${pct}%` }} />
        </div>

        {/* Hint внутри трека до первого действия */}
        {showHint && (
          <div className={styles.hint} aria-hidden="true">
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
          onPointerDown={() => setDragging(true)}
          onPointerUp={() => setDragging(false)}
          onPointerCancel={() => setDragging(false)}
          onBlur={() => setDragging(false)}
          aria-labelledby="level-slider-label"
          aria-describedby="level-slider-sr"
        />
        <div
          className={`${styles.kolobok} ${dragging ? styles.kolobokDragging : ""}`}
          style={{ left: kolobokLeft }}
          aria-hidden="true"
        >
          <span className={styles.browLeft} />
          <span className={styles.browRight} />

          <span className={styles.cheekLeft} />
          <span className={styles.cheekRight} />

          <span className={styles.eyeLeft} />
          <span className={styles.eyeRight} />

          <span className={styles.nose} />
          <span className={styles.mouth} />
        </div>
      </div>
      <span id="level-slider-label" className={styles.srOnly}>
        {t?.levelFilterLabel ?? "Level"}
      </span>
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
