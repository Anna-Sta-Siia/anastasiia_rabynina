import { useForm } from 'react-hook-form';
import styles from './Contact.module.css';
import PageTitle from '../../components/PageTitle';
import { usePageMeta } from '../../config/hooks/usePageMeta'

export default function Contact() {
  const { label, color } = usePageMeta();
  const { register, handleSubmit, reset } = useForm();
  const onSubmit = data => {
    console.log(data);
    alert('Merci ! Votre message a été envoyé.');
    reset();
  };

  return (
    <section className={styles.contact}>
       <PageTitle text={label} color={color} />
      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <input {...register('name')} placeholder="Votre nom" required />
        <input {...register('email')} type="email" placeholder="Votre email" required />
        <textarea {...register('message')} placeholder="Votre message" required />
        <button type="submit">Envoyer</button>
      </form>
    </section>
  );
}
