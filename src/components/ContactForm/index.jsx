import { useForm } from "react-hook-form";
import styles from "./ContactForm.module.css";

export default function ContactForm({
  t, // dictionnaire de traductions (en/fr/ru) -> voir structure plus bas
  accent = "#FFCCD5", // couleur d’accent pour l'œuf/bouton
  onSubmit, // optionnel : callback si tu veux gérer l’envoi toi-même
  className = "",
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
    reset,
  } = useForm({ mode: "onTouched" });

  const submit = async (data) => {
    // champ honeypot: si rempli, on ignore (probablement un bot)
    if (data.company) return;

    if (onSubmit) {
      await onSubmit(data, { reset });
    } else {
      // Simulation d’envoi (remplace plus tard par un fetch/EmailJS/etc.)
      await new Promise((r) => setTimeout(r, 1200));
      // Tu peux remplacer alert par un toast perso
      alert(t.sent);
      reset();
    }
  };

  return (
    <div className={`${styles.egg} ${className}`} style={{ "--accent": accent }}>
      <form onSubmit={handleSubmit(submit)} className={styles.form} noValidate>
        <div className={styles.field}>
          <label htmlFor="name">{t.nameLabel}</label>
          <input
            id="name"
            placeholder={t.namePlaceholder}
            aria-invalid={!!errors.name}
            aria-describedby="name-error"
            {...register("name", {
              required: t.errors.nameRequired,
              minLength: { value: 2, message: t.errors.nameMin },
              pattern: {
                value: /^[\p{L}\s'’-]{2,}$/u,
                message: t.errors.namePattern,
              },
            })}
          />
          <span id="name-error" className={styles.error} role="alert">
            {errors.name?.message}
          </span>
        </div>

        <div className={styles.field}>
          <label htmlFor="email">{t.emailLabel}</label>
          <input
            id="email"
            type="email"
            placeholder={t.emailPlaceholder}
            aria-invalid={!!errors.email}
            aria-describedby="email-error"
            {...register("email", {
              required: t.errors.emailRequired,
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: t.errors.emailInvalid,
              },
            })}
          />
          <span id="email-error" className={styles.error} role="alert">
            {errors.email?.message}
          </span>
        </div>

        <div className={styles.field}>
          <label htmlFor="message">{t.messageLabel}</label>
          <textarea
            id="message"
            rows={6}
            placeholder={t.messagePlaceholder}
            aria-invalid={!!errors.message}
            aria-describedby="message-error"
            {...register("message", {
              required: t.errors.messageRequired,
              minLength: { value: 10, message: t.errors.messageMin },
            })}
          />
          <span id="message-error" className={styles.error} role="alert">
            {errors.message?.message}
          </span>
        </div>

        {/* honeypot anti-bot */}
        <input
          className={styles.honey}
          tabIndex={-1}
          autoComplete="off"
          placeholder="Company"
          {...register("company")}
        />

        <button type="submit" className={styles.convexBtn} disabled={isSubmitting}>
          {isSubmitting ? t.sending : t.send}
        </button>

        <p className={styles.success} aria-live="polite">
          {isSubmitSuccessful ? t.sent : "‎"}
        </p>
      </form>
    </div>
  );
}
