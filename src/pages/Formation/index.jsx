import PageTitle from '../../components/PageTitle';
import { usePageMeta } from '../../config/hooks/usePageMeta'
import styles from './Formation.module.css';

const timeline = [
  { year: '2012', title: 'Licence Économie',      school: 'Université X' },
  { year: '2017', title: 'Master Traduction',      school: 'École Y' },
  { year: '2024', title: 'Bootcamp Web Integrator',school: 'Coding Academy' },
];

export default function Formation() {
  const { label, color } = usePageMeta();
  return (
    <section className={styles.formation}>
      <PageTitle text={label} color={color} />
      <ul className={styles.timeline}>
        {timeline.map(item => (
          <li key={item.year}>
            <span className={styles.year}>{item.year}</span>
            <div>
              <strong>{item.title}</strong>
              <p>{item.school}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
