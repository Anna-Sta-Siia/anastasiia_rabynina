import { Link } from 'react-router-dom';
import { forwardRef, memo } from 'react';
import styles from './LapotImg.module.css';
import lapotPng from '../../assets/images/lapot.png';

/**
 * props:
 * - name: текст внутри лаптя
 * - path: ссылка
 * - dir: 'left' | 'right' — направление движения/взгляда
 * - pose: 'up' | 'down' — базовый наклон (чередуем для имитации правой/левой)
 * - stepping: boolean — анимация короткого шага (автопрокрутка/клики)
 */
const LapotImg = forwardRef(function LapotImg(
  { name, path, dir = 'right', pose = 'up', stepping = false },
  ref
) {
  const isExternal = /^https?:\/\//i.test(path);

  const className = [
    styles.lapot,
    dir === 'left' ? styles.dirLeft : styles.dirRight,
    pose === 'down' ? styles.poseDown : styles.poseUp,
    stepping ? styles.stepping : ''
  ].join(' ');

  const content = (
    <>
      <div className={styles.wrap}>
        <img className={styles.img} src={lapotPng} alt="" aria-hidden="true" draggable="false" />
      </div>
      <span className={styles.label}>{name}</span>
    </>
  );

  return isExternal ? (
    <a ref={ref} href={path} target="_blank" rel="noopener noreferrer"
       className={className} role="listitem" aria-label={name}>
      {content}
    </a>
  ) : (
    <Link ref={ref} to={path} className={className} role="listitem" aria-label={name}>
      {content}
    </Link>
  );
});

export default memo(LapotImg);
