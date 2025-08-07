import { forwardRef } from 'react';
import styles from '../Petal.module.css';

const PetalFilter = forwardRef(function PetalFilter(
  { name, color, active, onClick },
  ref
) {
  const style = { '--bg': color };
  const ariaPressed = active ? 'true' : 'false';
  const className = `${styles.petal} ${active ? styles.active : ''}`;

  return (
    <button
      ref={ref}
      type="button"
      className={className}
      style={style}
      onClick={onClick}
      aria-pressed={ariaPressed}
    >
      {name}
    </button>
  );
});

export default PetalFilter;
