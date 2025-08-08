import { useForm } from 'react-hook-form';
import styles from './Contact.module.css';
import { useLocation } from 'react-router-dom';
import PageTitle from '../../components/PageTitle';
import menuItems from '../../config/menuConfig';

export default function Contact() {
    const location = useLocation();
    const currentPath = location.pathname;
    const pageData = menuItems.find(item => item.path === currentPath);
    const color = pageData?.color || '#eee';
  const { register, handleSubmit, reset } = useForm();
  const onSubmit = data => {
    console.log(data);
    alert('Merci ! Votre message a été envoyé.');
    reset();
  };

  return (
    <section className={styles.contact}>
      <PageTitle text="Projects" color={color} />
      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <input {...register('name')} placeholder="Votre nom" required />
        <input {...register('email')} type="email" placeholder="Votre email" required />
        <textarea {...register('message')} placeholder="Votre message" required />
        <button type="submit">Envoyer</button>
      </form>
    </section>
  );
}
