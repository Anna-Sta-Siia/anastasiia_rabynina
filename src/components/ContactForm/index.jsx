// src/components/ContactForm/index.jsx
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import Modal from "../Modal";
import styles from "./ContactForm.module.css";

// =====================
// Helpers / constantes
// =====================
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

// Texte par défaut (utilisé si tu ne fournis pas t)
const tFallback = {
  nameLabel: "Name",
  namePlaceholder: "Your name",
  emailLabel: "Email",
  emailPlaceholder: "Your email",
  companyLabel: "Company",
  companyPlaceholder: "Company (optional)",
  subjectLabel: "Subject",
  subjectPlaceholder: "Choose…",
  subjectOptions: {
    clientProject: "Client work proposal",
    jobOffer: "Job offer",
    other: "Other",
  },
  messageLabel: "Message",
  messagePlaceholder: "Your message…",
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
    namePattern: "Letters, spaces and dashes/apostrophes only.",
    emailRequired: "Email is required.",
    emailInvalid: "Invalid email format.",
    subjectRequired: "Subject is required.",
    messageRequired: "Message is required.",
    messageMin: "At least 10 characters.",
    messageMax: "Maximum 1200 characters.",
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
    formState: { errors, isSubmitting, isValid, touchedFields },
    getValues,
    setValue,
    setFocus,
    trigger,
    reset,
    watch,
  } = useForm({ mode: "onChange" });

  // Étape courante
  const [step, setStep] = useState(1);

  // Pour montrer le toast de succès
  const [showOverlay, setShowOverlay] = useState(false);

  // Flags : l’utilisateur a essayé d’aller plus loin -> on affiche les erreurs
  const [triedNext1, setTriedNext1] = useState(false);
  const [triedNext2, setTriedNext2] = useState(false);
  const [triedNext3, setTriedNext3] = useState(false);

  const MIN_MSG = 10;
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorDraft, setEditorDraft] = useState("");
  const [editorTouched, setEditorTouched] = useState(false);
  const editorRef = useRef(null);
  const openEditor = () => {
    setEditorDraft(getValues("message") || "");
    setEditorTouched(false); // on repart propre
    setEditorOpen(true);
  };
  const closeEditor = () => setEditorOpen(false);

  const saveEditor = () => {
    setValue("message", editorDraft, { shouldValidate: true, shouldDirty: true });
    setEditorOpen(false);
  };

  // Champs live (pour affichage et compteurs)
  const wName = watch("name");
  const wEmail = watch("email");
  const wCompany = watch("company");
  const wSubject = watch("subject");
  const wMessage = watch("message");

  // Auto-hide du toast
  useEffect(() => {
    if (!showOverlay) return;
    const t = setTimeout(() => setShowOverlay(false), 3000);
    return () => clearTimeout(t);
  }, [showOverlay]);

  // Nav clavier ← →
  useEffect(() => {
    const onKey = async (e) => {
      if (e.key === "ArrowRight") {
        if (step === 1) await goNext1();
        else if (step === 2) await goNext2();
        else if (step === 3) await goNext3();
      } else if (e.key === "ArrowLeft") {
        if (step === 2) setStep(1);
        else if (step === 3) setStep(2);
        else if (step === 4) setStep(3);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, errors]);

  // --------- Étapes : validations au clic sur “suivant” ---------
  const goNext1 = async () => {
    setTriedNext1(true);
    const ok = await trigger(["name", "email"]);
    if (!ok) {
      if (errors.name) setFocus("name");
      else if (errors.email) setFocus("email");
      return;
    }
    setStep(2);
  };

  const goNext2 = async () => {
    setTriedNext2(true);
    const ok = await trigger(["subject"]);
    if (!ok) {
      if (errors.subject) setFocus("subject");
      return;
    }
    setStep(3);
  };

  const goNext3 = async () => {
    setTriedNext3(true);
    const ok = await trigger(["message"]);
    if (!ok) {
      if (errors.message) setEditorOpen(true);
      return;
    }
    setStep(4);
  };

  // --------- Envoi ---------
  const submit = async (data) => {
    if (data.hp) return; // honeypot anti-bot
    try {
      if (onSubmit) {
        await onSubmit(data, { reset });
      } else if (apiUrl) {
        const base = apiUrl.replace(/\/$/, "");
        const resp = await fetch(`${base}/messages`, {
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
        // Simulation
        await new Promise((r) => setTimeout(r, 800));
      }

      reset();
      setStep(1);
      setShowOverlay(true);
      setTriedNext1(false);
      setTriedNext2(false);
      setTriedNext3(false);
    } catch (err) {
      console.error("ContactForm submit error:", err);
      alert("Envoi impossible pour le moment. Vérifie la configuration API.");
    }
  };

  // Rendu
  return (
    <>
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

          {/* ========= ŒUF 1 : Nom + Email ========= */}
          <div
            className={`${styles.egg} ${styles.wizardEgg} ${
              step === 1 ? styles.center : styles.hidden
            }`}
            style={{ "--accent": accent }}
            aria-current={step === 1 ? "step" : undefined}
          >
            <div className={styles.form}>
              {/* Name */}
              <div
                className={styles.field}
                data-invalid={!!errors.name && (touchedFields.name || triedNext1)}
              >
                <label htmlFor="name">{t.nameLabel}</label>
                <input
                  id="name"
                  placeholder={t.namePlaceholder}
                  autoComplete="name"
                  aria-invalid={errors.name ? "true" : "false"}
                  {...register("name", {
                    required: t.errors.nameRequired,
                    minLength: { value: 2, message: t.errors.nameMin },
                    pattern: {
                      value: /^[\p{L}\s'’-]+$/u,
                      message: t.errors.namePattern,
                    },
                  })}
                />
                {(touchedFields.name || triedNext1) && (
                  <span className={styles.error} role="alert">
                    {errors.name?.message}
                  </span>
                )}
              </div>

              {/* Email */}
              <div
                className={styles.field}
                data-invalid={!!errors.email && (touchedFields.email || triedNext1)}
              >
                <label htmlFor="email">{t.emailLabel}</label>
                <input
                  id="email"
                  type="email"
                  placeholder={t.emailPlaceholder}
                  autoComplete="email"
                  aria-invalid={errors.email ? "true" : "false"}
                  {...register("email", {
                    required: t.errors.emailRequired,
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: t.errors.emailInvalid,
                    },
                  })}
                />
                {(touchedFields.email || triedNext1) && (
                  <span className={styles.error} role="alert">
                    {errors.email?.message}
                  </span>
                )}
              </div>

              <div className={styles.navRow}>
                <button
                  type="button"
                  className={styles.next}
                  onClick={goNext1}
                  aria-label={t.next}
                  title={t.next}
                >
                  <span aria-hidden>›</span>
                </button>
              </div>
            </div>
          </div>

          {/* ========= ŒUF 2 : Société + Sujet ========= */}
          <div
            className={`${styles.egg} ${styles.wizardEgg} ${
              step === 2 ? styles.center : styles.hidden
            }`}
            style={{ "--accent": accent }}
            aria-current={step === 2 ? "step" : undefined}
          >
            <div className={styles.form}>
              {showCompany && (
                <div className={styles.field}>
                  <label htmlFor="company">{t.companyLabel}</label>
                  <input
                    id="company"
                    placeholder={t.companyPlaceholder}
                    autoComplete="organization"
                    {...register("company")}
                  />
                </div>
              )}

              <div
                className={styles.field}
                data-invalid={!!errors.subject && (touchedFields.subject || triedNext2)}
              >
                <label htmlFor="subject">{t.subjectLabel}</label>
                <select
                  id="subject"
                  defaultValue=""
                  aria-invalid={errors.subject ? "true" : "false"}
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
                {(touchedFields.subject || triedNext2) && (
                  <span className={styles.error} role="alert">
                    {errors.subject?.message}
                  </span>
                )}
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
                  aria-label={t.next}
                  title={t.next}
                >
                  <span aria-hidden>›</span>
                </button>
              </div>
            </div>
          </div>

          {/* ========= ŒUF 3 : Message (modale) ========= */}
          <div
            className={`${styles.egg} ${styles.wizardEgg} ${
              step === 3 ? styles.center : styles.hidden
            }`}
            style={{ "--accent": accent }}
            aria-current={step === 3 ? "step" : undefined}
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
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      openEditor();
                    }
                  }}
                  data-invalid={!!errors.message && (touchedFields.message || triedNext3)}
                >
                  {(wMessage || "").trim() ? (
                    trunc(wMessage, 60)
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
                    {(wMessage || "").length}/{MAX_MSG}
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
                {(touchedFields.message || triedNext3) && (
                  <span className={styles.error} role="alert">
                    {errors.message?.message}
                  </span>
                )}
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
                  type="button"
                  className={styles.next}
                  onClick={goNext3}
                  aria-label={t.next}
                  title={t.next}
                >
                  <span aria-hidden>›</span>
                </button>
              </div>
            </div>
          </div>

          {/* ========= ŒUF 4 : Récap / Envoi ========= */}
          <div
            className={`${styles.egg} ${styles.wizardEgg} ${
              step === 4 ? styles.center : styles.hidden
            }`}
            style={{ "--accent": accent }}
            aria-current={step === 4 ? "step" : undefined}
          >
            <div className={styles.form}>
              <div className={styles.summary}>
                <p>
                  <strong>{t.nameLabel}:</strong> {wName || "—"}
                </p>
                <p>
                  <strong>{t.emailLabel}:</strong> {wEmail || "—"}
                </p>
                <p>
                  <strong>{t.subjectLabel}:</strong> {subjectLabel(wSubject, t)}
                </p>
                {showCompany && !!wCompany && (
                  <p>
                    <strong>{t.companyLabel}:</strong> {wCompany}
                  </p>
                )}
                <p>
                  <strong>{t.messageLabel}:</strong>{" "}
                  <span className={styles.preview}>{trunc(wMessage || "", 10)}</span>
                </p>
              </div>

              <div className={styles.navRow}>
                <button
                  type="button"
                  className={styles.back}
                  onClick={() => setStep(3)}
                  aria-label={t.back}
                  title={t.back}
                >
                  <span aria-hidden>‹</span>
                </button>
                <button
                  type="submit"
                  className={styles.convexBtn}
                  data-valid={isValid ? "true" : undefined}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? t.sending : t.send}
                </button>
              </div>
            </div>
          </div>
        </form>

        {/* ===== Modale Message ===== */}
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
              ref={editorRef}
              className={styles.editorText}
              value={editorDraft}
              onChange={(e) => {
                setEditorDraft(e.target.value.slice(0, MAX_MSG));
                setEditorTouched(true);
              }}
              maxLength={MAX_MSG}
              placeholder={t.messagePlaceholder}
            />

            <div className={styles.modalBar}>
              <span className={styles.counter}>
                {editorDraft.length}/{MAX_MSG}
              </span>

              {/* message d'erreur si trop court */}
              {(editorTouched || editorDraft.length > 0) && editorDraft.trim().length < MIN_MSG && (
                <span className={styles.inlineError}>{t.errors.messageMin}</span>
              )}

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.btn}
                  onClick={() => {
                    setEditorDraft("");
                    setEditorTouched(true);
                  }}
                >
                  {t.clear}
                </button>

                <button
                  type="button"
                  className={`${styles.btn} ${styles.btnPrimary}`}
                  onClick={saveEditor}
                  disabled={editorDraft.trim().length < MIN_MSG}
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
