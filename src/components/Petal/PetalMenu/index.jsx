import { Link } from 'react-router-dom';
import { forwardRef } from 'react';
import styles from '../Petal.module.css';

const Petal = forwardRef(function PetalComponent({ name, path, color }, ref) {
  const isExternal = path.startsWith('http');
  const style = { '--bg': color };

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
      className={styles.petal}
      style={style}
    >
      {name}
    </Link>
  );
});

export default Petal;