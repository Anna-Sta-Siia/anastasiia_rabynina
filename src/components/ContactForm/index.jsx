import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import styles from "./ContactForm.module.css";

const tFallback = {
  nameLabel: "Name",
  namePlaceholder: "Your name",
  emailLabel: "Email",
  emailPlaceholder: "Your email",
  messageLabel: "Message",
  messagePlaceholder: "Your message…",
  companyLabel: "Company",
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
  className = "",
  showCompany = true, // affiche "Company" comme champ normal
  debugHoneypot = false, // rendre visible le honeypot pour tester
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
    reset,
  } = useForm({ mode: "onChange" });

  const [showOverlay, setShowOverlay] = useState(false);

  useEffect(() => {
    let timer;
    if (showOverlay) {
      timer = setTimeout(() => setShowOverlay(false), 3000); // auto-hide après 3s
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [showOverlay]);

  const submit = async (data) => {
    // Honeypot : si rempli → on ignore (anti-bot)
    if (data.hp) return;

    if (onSubmit) {
      await onSubmit(data, { reset });
    } else {
      // simulation d’envoi
      await new Promise((r) => setTimeout(r, 1000));
    }
    reset(); // on vide le formulaire
    setShowOverlay(true); // on affiche l’overlay de succès
  };

  return (
    <>
      {/* Overlay de succès plein écran */}
      {showOverlay && (
        <div className={styles.overlay} role="status" aria-live="assertive">
          <div className={styles.overlayCard}>{t.sent}</div>
        </div>
      )}

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
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: t.errors.emailInvalid },
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

          {/* Company visible (optionnel) */}
          {showCompany && (
            <div className={styles.field}>
              <label htmlFor="company">{t.companyLabel || "Company"}</label>
              <input
                id="company"
                name="company"
                placeholder={t.companyPlaceholder}
                aria-invalid="false"
                autoComplete="organization"
                {...register("company")}
              />
            </div>
          )}

          {/* Honeypot toujours présent (nom différent : "hp") */}
          <input
            className={`${styles.honey} ${debugHoneypot ? styles.honeyDebug : ""}`}
            tabIndex={-1}
            autoComplete="off"
            placeholder={t.companyPlaceholder}
            {...register("hp")}
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
        </form>
      </div>
    </>
  );
}
