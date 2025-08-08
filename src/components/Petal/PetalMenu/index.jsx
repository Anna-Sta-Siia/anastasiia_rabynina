import { Link } from 'react-router-dom';
import { forwardRef } from 'react';
import styles from '../Petal.module.css';

const Petal = forwardRef(function PetalComponent({ name, path, color, isActive }, ref) {
  const isExternal = path.startsWith('http');
  const style = { '--bg': color };

  const className = `${styles.petal}${isActive ? ' ' + styles.active : ''}`;

  return isExternal ? (
    <a
      ref={ref}
      href={path}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.petal}
      style={style}
    >
      {name}
    </a>
  ) : (
    <Link
      ref={ref}
      to={path}
      className={className}
      style={style}
      aria-pressed={isActive}
    >
      {name}
    </Link>
  );
});

export default Petal;
