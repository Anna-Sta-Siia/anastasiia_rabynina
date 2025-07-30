import { useForm } from 'react-hook-form';
import styles from './Contact.module.css';

export default function Contact() {
  const { register, handleSubmit, reset } = useForm();
  const onSubmit = data => {
    console.log(data);
    alert('Merci ! Votre message a été envoyé.');
    reset();
  };

  return (
    <section className={styles.contact}>
      <h2>Contact</h2>
      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <input {...register('name')} placeholder="Votre nom" required />
        <input {...register('email')} type="email" placeholder="Votre email" required />
        <textarea {...register('message')} placeholder="Votre message" required />
        <button type="submit">Envoyer</button>
      </form>
    </section>
  );
}
