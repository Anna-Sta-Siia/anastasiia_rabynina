import { useForm } from "react-hook-form";
import styles from "./ContactForm.module.css";

const tFallback = {
  nameLabel: "Name",
  namePlaceholder: "Your name",
  emailLabel: "Email",
  emailPlaceholder: "Your email",
  messageLabel: "Message",
  messagePlaceholder: "Your message…",
  companyPlaceholder: "Company (leave empty)",
  send: "Send",
  sending: "Sending…",
  sent: "Thanks! Your message was sent.",
  errors: {
    nameRequired: "Name is required.",
    nameMin: "At least 2 characters.",
    namePattern: "Letters, spaces and dashes only.",
    emailRequired: "Email is required.",
    emailInvalid: "Invalid email format.",
    messageRequired: "Message is required.",
    messageMin: "At least 10 characters.",
  },
};

export default function ContactForm({
  t = tFallback, // dictionnaire de traductions
  accent = "#B0BEC5", // couleur d’accent pour l’œuf/bouton
  onSubmit, // optionnel : callback custom (data, { reset })
  className = "", // classes additionnelles si besoin
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful, isValid },
    reset,
  } = useForm({ mode: "onChange" }); // validation live

  const submit = async (data) => {
    // Honeypot anti-bot : si rempli, on ignore.
    if (data.company) return;

    if (onSubmit) {
      await onSubmit(data, { reset });
    } else {
      // Simulation d’envoi
      await new Promise((r) => setTimeout(r, 1000));
      alert(t.sent);
      reset();
    }
  };

  return (
    <div className={`${styles.egg} ${className}`} style={{ "--accent": accent }}>
      <form onSubmit={handleSubmit(submit)} className={styles.form} noValidate>
        {/* Name */}
        <div className={styles.field}>
          <label htmlFor="name">{t.nameLabel}</label>
          <input
            id="name"
            name="name"
            required
            autoComplete="name"
            placeholder={t.namePlaceholder}
            aria-invalid={errors.name ? "true" : "false"}
            aria-describedby="name-error"
            {...register("name", {
              required: t.errors.nameRequired,
              minLength: { value: 2, message: t.errors.nameMin },
              pattern: { value: /^[\p{L}\s'’-]{2,}$/u, message: t.errors.namePattern },
            })}
          />
          <span id="name-error" className={styles.error} role="alert">
            {errors.name?.message}
          </span>
        </div>

        {/* Email */}
        <div className={styles.field}>
          <label htmlFor="email">{t.emailLabel}</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder={t.emailPlaceholder}
            aria-invalid={errors.email ? "true" : "false"}
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

        {/* Message */}
        <div className={styles.field}>
          <label htmlFor="message">{t.messageLabel}</label>
          <textarea
            id="message"
            name="message"
            required
            rows={6}
            placeholder={t.messagePlaceholder}
            aria-invalid={errors.message ? "true" : "false"}
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

        {/* Honeypot anti-bot (caché via CSS) */}
        <input
          className={styles.honey}
          tabIndex={-1}
          autoComplete="off"
          placeholder={t.companyPlaceholder}
          {...register("company")}
        />

        {/* Submit */}
        <div className={styles.submitconteneur}>
          <button
            type="submit"
            className={`${styles.convexBtn} ${isValid ? styles.valid : ""}`}
            disabled={!isValid || isSubmitting}
          >
            {isSubmitting ? t.sending : t.send}
          </button>
        </div>

        {/* Message de succès non intrusif */}
        <p className={styles.success} aria-live="polite">
          {isSubmitSuccessful ? t.sent : "‎"}
        </p>
      </form>
    </div>
  );
}
