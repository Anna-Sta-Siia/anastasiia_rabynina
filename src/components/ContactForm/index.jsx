import { useEffect, useMemo, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import Modal from "../Modal";
import styles from "./ContactForm.module.css";

// Limite + util pour l’aperçu
const MAX_MSG = 1200;
const trunc = (s, n = 10) => {
  const arr = Array.from(s ?? "");
  return arr.length > n ? `${arr.slice(0, n).join("")}…` : arr.join("");
};

const subjectLabel = (code, t) =>
  ({
    client: t.subjectOptions?.clientProject,
    job: t.subjectOptions?.jobOffer,
    other: t.subjectOptions?.other,
  }[code] ??
  code ??
  "—");

const tFallback = {
  nameLabel: "Name",
  namePlaceholder: "Your name",
  emailLabel: "Email",
  emailPlaceholder: "Your email",
  messageLabel: "Message",
  messagePlaceholder: "Your message…",
  subjectLabel: "Subject",
  subjectPlaceholder: "Choose…",
  subjectOptions: {
    clientProject: "Client work proposal",
    jobOffer: "Job offer",
    other: "Other",
  },
  companyLabel: "Company",
  companyPlaceholder: "Company (optional)",
  send: "Send",
  sending: "Sending…",
  sent: "Thanks! Your message was sent.",
  next: "Next",
  back: "Back",
  editInModal: "Edit in modal",
  clear: "Clear",
  save: "Save",
  close: "Close",
  errors: {
    nameRequired: "Name is required.",
    nameMin: "At least 2 characters.",
    namePattern: "Letters, spaces and dashes only.",
    emailRequired: "Email is required.",
    emailInvalid: "Invalid email format.",
    messageRequired: "Message is required.",
    messageMin: "At least 10 characters.",
    messageMax: "Maximum 1200 characters.",
    subjectRequired: "Subject is required.",
  },
};

export default function ContactForm({
  t = tFallback,
  accent = "#B0BEC5",
  className = "",
  onSubmit, // (data, { reset })
  apiUrl = import.meta?.env?.VITE_CONTACT_API_URL || "",
  showCompany = true,
  debugHoneypot = false,
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
    getValues,
    setValue,
    trigger,
    reset,
    watch,
  } = useForm({ mode: "onChange" });

  const [step, setStep] = useState(1);
  const [showOverlay, setShowOverlay] = useState(false);
  const editorRef = useRef(null);
  // --- Éditeur modale pour le message ---
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorDraft, setEditorDraft] = useState("");

  const openEditor = () => {
    setEditorDraft(getValues("message") || "");
    setEditorOpen(true);
  };
  const closeEditor = () => setEditorOpen(false);
  const saveEditor = () => {
    setValue("message", editorDraft, { shouldValidate: true, shouldDirty: true });
    setEditorOpen(false);
  };

  // champs live (pour activer flèches/bouton)
  const wName = watch("name");
  const wEmail = watch("email");
  const wMessage = watch("message");
  const wSubject = watch("subject");

  const step1Valid = useMemo(
    () => !!wName && !errors.name && !!wEmail && !errors.email && !!wSubject && !errors.subject,
    [wName, wEmail, wSubject, errors.name, errors.email, errors.subject]
  );
  const step2Valid = useMemo(
    () => !!(wMessage || "").trim() && !errors.message,
    [wMessage, errors.message]
  );

  useEffect(() => {
    if (!showOverlay) return;
    const timer = setTimeout(() => setShowOverlay(false), 3000);
    return () => clearTimeout(timer);
  }, [showOverlay]);

  // Nav clavier ← →
  useEffect(() => {
    const onKey = async (e) => {
      if (e.key === "ArrowRight") {
        if (step === 1) await goNext1();
        else if (step === 2) await goNext2();
      } else if (e.key === "ArrowLeft") {
        if (step === 2) setStep(1);
        else if (step === 3) setStep(2);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const goNext1 = async () => {
    const ok = await trigger(["name", "email", "subject"]);
    if (ok) setStep(2);
  };
  const goNext2 = async () => {
    const ok = await trigger(["message"]);
    if (ok) setStep(3);
  };

  const submit = async (data) => {
    if (data.hp) return; // honeypot anti-bot

    try {
      if (onSubmit) {
        await onSubmit(data, { reset });
      } else if (apiUrl) {
        const resp = await fetch(`${apiUrl.replace(/\/$/, "")}/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: data.name,
            email: data.email,
            company: data.company || "",
            subject: data.subject,
            message: data.message,
          }),
        });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      } else {
        // simulation
        await new Promise((r) => setTimeout(r, 1000));
      }

      reset();
      setStep(1);
      setShowOverlay(true);
    } catch (err) {
      console.error("ContactForm submit error:", err);
      alert("Envoi impossible pour le moment. Vérifie la configuration API.");
    }
  };

  return (
    <>
      {/* Overlay de succès */}
      {showOverlay && (
        <div className={styles.overlay} role="status" aria-live="assertive">
          <div className={styles.overlayCard}>{t.sent}</div>
        </div>
      )}

      <section className={`${styles.wizard} ${className}`}>
        <form className={styles.rail} onSubmit={handleSubmit(submit)} noValidate>
          {/* Honeypot (caché) */}
          <input
            className={`${styles.honey} ${debugHoneypot ? styles.honeyDebug : ""}`}
            tabIndex={-1}
            autoComplete="off"
            {...register("hp")}
          />

          {/* ŒUF 1 — Identité */}
          <div
            className={`${styles.egg} ${styles.wizardEgg} ${
              step === 1 ? styles.center : styles.hidden
            }`}
            style={{ "--accent": accent }}
            aria-current={step === 1 ? "step" : undefined}
          >
            <div className={styles.form}>
              {/* Name */}
              <div className={styles.field}>
                <label htmlFor="name">{t.nameLabel}</label>
                <input
                  id="name"
                  autoComplete="name"
                  placeholder={t.namePlaceholder}
                  aria-invalid={errors.name ? "true" : "false"}
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

              {/* Email */}
              <div className={styles.field}>
                <label htmlFor="email">{t.emailLabel}</label>
                <input
                  id="email"
                  type="email"
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

              {/* Company (optionnel) */}
              {showCompany && (
                <div className={styles.field}>
                  <label htmlFor="company">{t.companyLabel}</label>
                  <input
                    id="company"
                    autoComplete="organization"
                    placeholder={t.companyPlaceholder}
                    {...register("company")}
                  />
                </div>
              )}

              {/* Subject (required) */}
              <div className={styles.field}>
                <label htmlFor="subject">{t.subjectLabel}</label>
                <select
                  id="subject"
                  aria-invalid={errors.subject ? "true" : "false"}
                  aria-describedby="subject-error"
                  defaultValue=""
                  {...register("subject", { required: t.errors.subjectRequired })}
                >
                  <option value="" disabled>
                    {t.subjectPlaceholder}
                  </option>
                  <option value="client">
                    {t.subjectOptions?.clientProject || "Client work proposal"}
                  </option>
                  <option value="job">{t.subjectOptions?.jobOffer || "Job offer"}</option>
                  <option value="other">{t.subjectOptions?.other || "Other"}</option>
                </select>
                <span id="subject-error" className={styles.error} role="alert">
                  {errors.subject?.message}
                </span>
              </div>

              <div className={styles.navRow}>
                <button
                  type="button"
                  className={styles.next}
                  onClick={goNext1}
                  disabled={!step1Valid}
                  aria-label={t.next}
                  title={t.next}
                >
                  <span aria-hidden>›</span>
                </button>
              </div>
            </div>
          </div>

          {/* ŒUF 2 — Message (édition dans une modale) */}
          <div
            className={`${styles.egg} ${styles.wizardEgg} ${
              step === 2 ? styles.center : styles.hidden
            }`}
            style={{ "--accent": accent }}
            aria-current={step === 2 ? "step" : undefined}
          >
            <div className={styles.form}>
              <div className={styles.field}>
                <label htmlFor="message">{t.messageLabel}</label>

                {/* Zone cliquable qui ouvre la modale */}
                <div
                  id="message"
                  role="button"
                  tabIndex={0}
                  className={styles.editorField}
                  aria-describedby="message-helper"
                  onClick={openEditor}
                  onKeyDown={(e) =>
                    (e.key === "Enter" || e.key === " ") && (e.preventDefault(), openEditor())
                  }
                >
                  {(getValues("message") || "").trim() ? (
                    trunc(getValues("message"), 60)
                  ) : (
                    <span className={styles.placeholder}>{t.messagePlaceholder}</span>
                  )}
                </div>

                <div id="message-helper" className={styles.helperRow}>
                  <button type="button" className={styles.linkBtn} onClick={openEditor}>
                    {t.editInModal}
                  </button>
                  <span className={styles.helperSpacer} />
                  <span className={styles.counter}>
                    {(getValues("message") || "").length}/{MAX_MSG}
                  </span>
                </div>

                {/* textarea masquée pour RHF (validation) */}
                <textarea
                  style={{ display: "none" }}
                  aria-hidden="true"
                  {...register("message", {
                    required: t.errors.messageRequired,
                    minLength: { value: 10, message: t.errors.messageMin },
                    maxLength: { value: MAX_MSG, message: t.errors.messageMax },
                  })}
                />
                <span className={styles.error} role="alert">
                  {errors.message?.message}
                </span>
              </div>

              <div className={styles.navRow}>
                <button
                  type="button"
                  className={styles.back}
                  onClick={() => setStep(1)}
                  aria-label={t.back}
                  title={t.back}
                >
                  <span aria-hidden>‹</span>
                </button>
                <button
                  type="button"
                  className={styles.next}
                  onClick={goNext2}
                  disabled={!step2Valid}
                  aria-label={t.next}
                  title={t.next}
                >
                  <span aria-hidden>›</span>
                </button>
              </div>
            </div>
          </div>

          {/* ŒUF 3 — Submit */}
          <div
            className={`${styles.egg} ${styles.wizardEgg} ${
              step === 3 ? styles.center : styles.hidden
            }`}
            style={{ "--accent": accent }}
            aria-current={step === 3 ? "step" : undefined}
          >
            <div className={styles.form}>
              <div className={styles.summary}>
                <p>
                  <strong>{t.nameLabel}:</strong> {getValues("name") || "—"}
                </p>
                <p>
                  <strong>{t.emailLabel}:</strong> {getValues("email") || "—"}
                </p>
                <p>
                  <strong>{t.subjectLabel}:</strong> {subjectLabel(getValues("subject"), t)}
                </p>
                {showCompany && !!getValues("company") && (
                  <p>
                    <strong>{t.companyLabel}:</strong> {getValues("company")}
                  </p>
                )}
                <p>
                  <strong>{t.messageLabel}:</strong>{" "}
                  <span className={styles.preview}>{trunc(getValues("message") || "", 10)}</span>
                </p>
              </div>

              <div className={styles.navRow}>
                <button
                  type="button"
                  className={styles.back}
                  onClick={() => setStep(2)}
                  aria-label={t.back}
                  title={t.back}
                >
                  <span aria-hidden>‹</span>
                </button>

                <button
                  type="submit"
                  className={styles.convexBtn}
                  data-valid={isValid ? "true" : undefined}
                  disabled={!isValid || isSubmitting}
                >
                  {isSubmitting ? t.sending : t.send}
                </button>
              </div>
            </div>
          </div>
        </form>

        {/* Modale d’édition du message */}
        <Modal
          open={editorOpen}
          title={t.messageLabel}
          onClose={closeEditor}
          initialFocus="element"
          initialFocusRef={editorRef}
          closeLabel={t.close}
        >
          <div className={styles.modalEditor}>
            <textarea
              ref={editorRef} // 👈 focus ici
              className={styles.editorText}
              value={editorDraft}
              onChange={(e) => setEditorDraft(e.target.value.slice(0, MAX_MSG))}
              maxLength={MAX_MSG}
              placeholder={t.messagePlaceholder}
            />
            <div className={styles.modalBar}>
              <span className={styles.counter}>
                {editorDraft.length}/{MAX_MSG}
              </span>
              <div className={styles.modalActions}>
                {/* Effacer : on vide la zone mais on ne ferme PAS la modale */}
                <button
                  type="button"
                  className={styles.btn}
                  onClick={() => setEditorDraft("")}
                  title="Effacer tout le texte"
                >
                  {t.clear || "Clear"}
                </button>
                <button
                  type="button"
                  className={`${styles.btn} ${styles.btnPrimary}`}
                  onClick={saveEditor}
                  disabled={editorDraft.trim().length < 10}
                >
                  {t.save}
                </button>
              </div>
            </div>
          </div>
        </Modal>
      </section>
    </>
  );
}
