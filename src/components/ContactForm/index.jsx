// src/components/ContactForm/index.jsx
import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { useForm } from "react-hook-form";
import Modal from "../Modal";
import styles from "./ContactForm.module.css";

// =====================
// Constantes & helpers
// =====================
const MAX_MSG = 1200;
const MIN_MSG = 10;
const STEPS = 4;

/** coupe au milieu : "abcdefgh…wxyz" */
function truncMiddle(s = "", n = 24) {
  const arr = Array.from(s);
  if (arr.length <= n) return s;
  const head = Math.ceil((n - 1) / 2);
  const tail = Math.floor((n - 1) / 2);
  return arr.slice(0, head).join("") + "…" + arr.slice(-tail).join("");
}
/** First name for recap/toast:
 * - If user typed several names, keep the *first* token (split on spaces/dashes).
 * - If that single name > 15 chars, cut to 15 and add an ellipsis.
 */
function firstNameForRecap(input = "") {
  const s = String(input).trim();
  if (!s) return "";
  // split on spaces or dashes (keeps “Anne-Sophie” as two tokens; we take the first)
  const firstToken = s.split(/[\s-]+/)[0];
  return firstToken.length <= 15 ? firstToken : firstToken.slice(0, 15) + "…";
}

function subjectDisplay(code, custom, t) {
  const otherLabel = t.subjectOptions?.other || "Other";
  if (code === "other") {
    const v = (custom || "").trim();
    return v ? `${otherLabel}: ${v}` : otherLabel;
  }
  // réutilise ta fonction existante
  return (
    {
      client: t.subjectOptions?.clientProject,
      job: t.subjectOptions?.jobOffer,
      other: otherLabel,
    }[code] ??
    code ??
    "—"
  );
}

/** Format the “sent” toast, accepting string or function */
function formatSentToast(t, fullName) {
  const v = t?.sentWithName;
  if (!fullName) return t?.sent || "Thanks! Your message was sent.";

  if (typeof v === "function") return v(fullName); // old style
  if (typeof v === "string") return v.replace("{fullName}", fullName); // new JSON style
  return t?.sent || "Thanks! Your message was sent.";
}

/** texte par défaut */
const tFallback = {
  nameLabel: "Name",
  namePlaceholder: "Your name",
  lastNameLabel: "Surname",
  lastNamePlaceholder: "Your surname",
  emailLabel: "Email",
  emailPlaceholder: "Your email",
  companyLabel: "Company",
  companyPlaceholder: "Company (optional)",
  subjectLabel: "Subject",
  subjectPlaceholder: "Choose…",
  subjectCustomPlaceholder: "Type your subject…",
  subjectOptions: {
    clientProject: "Client work proposal",
    jobOffer: "Job offer",
    other: "Other",
  },
  messageLabel: "Message",
  messagePlaceholder: "Your message…",
  recapFor: "Let's recap, {firstName}:",
  recapTitle: "Summary",
  confirmBody: "Please confirm you want to send this message.",
  confirmSend: "Send",
  confirmCancel: "Cancel",
  sending: "Sending…",
  sent: "Thanks! Your message was sent.",
  sentWithName: (fullName) => `Thanks, ${fullName}! Your message was sent.`,
  next: "Next",
  back: "Back",
  editInModal: "Edit in modal",
  clear: "Clear",
  save: "Save",
  close: "Close",
  errors: {
    nameRequired: "Name is required.",
    nameMin: "At least 2 characters.",
    namePattern: "Only letters, spaces, - and '.",
    emailRequired: "Email is required.",
    emailInvalid: "Invalid email format.",
    subjectRequired: "Subject is required.",
    subjectCustomRequired: "Please provide a subject.",
    messageRequired: "Message is required.",
    messageMin: "At least 10 characters.",
    messageMax: "Maximum 1200 characters.",
  },
  subjectCustomTitle: "Custom subject",
};

/** progression (easing + hue) */
function progressFromStep(step, steps = STEPS) {
  const t = (step - 1) / (steps - 1);
  const eased = 1 - Math.pow(1 - t, 1.6);
  const pct = Math.round(eased * 100);
  const hue = Math.round(28 + eased * (160 - 28));
  return { pct, hue };
}

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
    formState: { errors, touchedFields },
    getValues,
    setValue,
    setFocus,
    trigger,
    reset,
    watch,
  } = useForm({ mode: "onChange" });

  // Étapes (1 → 4)
  const [step, setStep] = useState(1);

  // ===== Toast / overlay (UN SEUL état + helper)
  const [showOverlay, setShowOverlay] = useState(false);
  const [toastText, setToastText] = useState(t.sent);
  const showToast = (text) => {
    setToastText(text || t.sent);
    setShowOverlay(true);
  };
  useEffect(() => {
    if (!showOverlay) return;
    const tmo = setTimeout(() => setShowOverlay(false), 3000);
    return () => clearTimeout(tmo);
  }, [showOverlay]);

  // Flags “j’ai tenté Next”
  const [triedNext1, setTriedNext1] = useState(false);
  const [triedNext2, setTriedNext2] = useState(false);
  const [triedNext3, setTriedNext3] = useState(false);

  // ===== Modale MESSAGE
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorDraft, setEditorDraft] = useState("");
  const editorRef = useRef(null);
  const [editorShowMinErr, setEditorShowMinErr] = useState(false); // montre après Save < 10

  // --- Confirm modal: state & helpers ---
  const [confirmOpen, setConfirmOpen] = useState(false);
  const openConfirm = () => setConfirmOpen(true);
  const closeConfirm = () => setConfirmOpen(false);

  // Launch submit from the confirm modal
  const doConfirmSend = () => {
    closeConfirm();
    handleSubmit(submit)(); // trigger RHF submit with validation
  };
  const cancelAndReset = () => {
    reset();
    setStep(1);
    closeConfirm();
  };
  const openEditor = () => {
    setEditorDraft(getValues("message") || "");
    setEditorShowMinErr(false);
    setEditorOpen(true);
  };
  const closeEditor = () => setEditorOpen(false);
  const saveEditor = () => {
    const trimmed = editorDraft.trim();
    if (trimmed.length < MIN_MSG) {
      setEditorShowMinErr(true); // afficher et laisser tant que < 10
      return;
    }
    setValue("message", trimmed, { shouldValidate: true, shouldDirty: true });
    setEditorOpen(false);
  };
  // autofocus dans la modale MESSAGE
  useEffect(() => {
    if (!editorOpen || !editorRef.current) return;

    const el = editorRef.current;
    el.focus();

    // place the caret after the last character
    const end = el.value.length;
    // do it on the next frame to ensure value is rendered
    requestAnimationFrame(() => {
      el.setSelectionRange(end, end);
      el.scrollTop = el.scrollHeight; // make sure last lines are visible
    });
  }, [editorOpen]);
  // masque l’erreur inline dès qu’on atteint 10
  useEffect(() => {
    if (editorShowMinErr && editorDraft.trim().length >= MIN_MSG) {
      setEditorShowMinErr(false);
    }
  }, [editorDraft, editorShowMinErr]);

  // ===== Modale SUBJECT (pour "Other")
  const subjectRef = useRef(null);
  const [subjectOpen, setSubjectOpen] = useState(false);
  const [subjectDraft, setSubjectDraft] = useState("");
  const [subjectDismissed, setSubjectDismissed] = useState(false);

  const openSubject = useCallback(() => {
    setSubjectDraft((getValues("subjectCustom") || "").trim());
    setSubjectDismissed(false);
    setSubjectOpen(true);
  }, [getValues]);
  const closeSubject = () => {
    setSubjectOpen(false);
    setSubjectDismissed(true);
  };
  const saveSubject = () => {
    const v = subjectDraft.trim();
    if (!v) return;
    setValue("subjectCustom", v, { shouldDirty: true, shouldValidate: true });
    setSubjectOpen(false);
  };
  // autofocus dans la modale SUBJECT
  useEffect(() => {
    if (subjectOpen && subjectRef.current) {
      const el = subjectRef.current;
      el.focus();
      el.setSelectionRange?.(0, 0);
      el.scrollTop = 0;
    }
  }, [subjectOpen]);

  // mémoriser le step précédent (pour pouvoir ré-autoriser l’auto open du subject en entrant sur 3)
  const prevStepRef = useRef(step);
  useEffect(() => {
    const prev = prevStepRef.current;
    if (prev !== step && step === 3) setSubjectDismissed(false);
    prevStepRef.current = step;
  }, [step]);

  // Champs live
  const wName = watch("name");
  const wLastName = watch("lastName");
  const wEmail = watch("email");
  const wCompany = watch("company");
  const wSubject = watch("subject");
  const wSubjectCustom = watch("subjectCustom");
  const wMessage = watch("message");

  // Auto-ouvrir la modale SUBJECT sur l’étape 3 si "other" sélectionné + custom vide
  useEffect(() => {
    if (
      step === 3 &&
      wSubject === "other" &&
      !subjectOpen &&
      !subjectDismissed &&
      !(getValues("subjectCustom") || "").trim()
    ) {
      openSubject();
    }
  }, [step, wSubject, subjectOpen, subjectDismissed, getValues, openSubject]);

  // Progression
  const progress = useMemo(() => progressFromStep(step, STEPS), [step]);
  const progressPct = progress.pct;

  // Étapes : validations
  // 1) name + lastName
  const goNext1 = async () => {
    setTriedNext1(true);
    const ok = await trigger(["name", "lastName"]);
    if (!ok) {
      if (errors.name) setFocus("name");
      else if (errors.lastName) setFocus("lastName");
      return;
    }
    setStep(2);
  };

  // 2) email+subject
  const goNext2 = async () => {
    setTriedNext2(true);
    const fields = ["email", "subject"];
    if ((getValues("subject") || "") === "other") {
      fields.push("subjectCustom"); // subject custom requis si “other”
    }
    const ok = await trigger(fields);
    if (!ok) {
      if (errors.email) setFocus("email");
      else if (errors.subject || errors.subjectCustom) setFocus("subject");
      return;
    }
    setStep(3);
  };

  // 3) message
  const goNext3 = async () => {
    setTriedNext3(true);

    // validate only "message"
    const ok = await trigger("message");

    if (!ok) {
      // stay on step 3 and focus the textarea
      setFocus("message");
      return;
    }

    // all good → go to recap
    setStep(4);
  };
  // Envoi
  const submit = async (data) => {
    if (data.hp) return; // anti-bot
    try {
      // ⚠️ Nouveau nom pour éviter tout conflit
      const fullNameStr = `${(data.name || "").trim()} ${(data.lastName || "").trim()}`.trim();

      const payload = {
        name: data.name,
        lastName: data.lastName || "",
        fullName: fullNameStr,
        email: data.email,
        company: data.company || "",
        subject: data.subject === "other" ? data.subjectCustom || "other" : data.subject,
        message: data.message,
      };

      if (onSubmit) {
        await onSubmit(payload, { reset });
      } else if (apiUrl) {
        const base = apiUrl.replace(/\/$/, "");
        const resp = await fetch(`${base}/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      } else {
        await new Promise((r) => setTimeout(r, 800));
      }

      reset();
      setStep(1);

      // Toast personnalisé — string ou fonction supportés
      showToast(formatSentToast(t, fullNameStr));

      setTriedNext1(false);
      setTriedNext2(false);
      setTriedNext3(false);
    } catch (err) {
      console.error("ContactForm submit error:", err);
      alert("Envoi impossible pour le moment. Vérifie la configuration API.");
    }
  };

  // Erreurs : conteneurs toujours rendus (hauteur réservée en CSS)
  const showNameErr = triedNext1 || touchedFields.name;
  const showLastNameErr = triedNext1 || touchedFields.lastName;
  const showEmailErr = triedNext2 || touchedFields.email;
  const showSubjectErr = triedNext2 || touchedFields.subject;
  const showSubjectCustomErr = triedNext2 || touchedFields.subjectCustom;
  const showMsgErr = triedNext3 || touchedFields.message;

  // Rendu
  return (
    <>
      {showOverlay && (
        <div className={styles.overlay} role="status" aria-live="assertive">
          <div className={styles.overlayCard}>{toastText}</div>
        </div>
      )}

      <section
        className={`${styles.eggWrap} ${className}`}
        data-complete={step === STEPS ? "true" : undefined}
        style={{ "--barHue": progress.hue }}
      >
        <div className={styles.egg} style={{ "--accent": accent }}>
          <form className={styles.form} onSubmit={handleSubmit(submit)} noValidate>
            {/* Honeypot */}
            <input
              className={`${styles.honey} ${debugHoneypot ? styles.honeyDebug : ""}`}
              tabIndex={-1}
              autoComplete="off"
              {...register("hp")}
            />
            {/* ===== Step 1: first + last + (company) ===== */}
            {step === 1 && (
              <div className={styles.view} key="step1">
                <div
                  className={styles.field}
                  data-err-lines="1"
                  data-invalid={!!errors.name && showNameErr}
                >
                  <label htmlFor="name">{t.nameLabel}</label>
                  <input
                    id="name"
                    placeholder={t.namePlaceholder}
                    autoComplete="given-name"
                    aria-invalid={errors.name ? "true" : "false"}
                    {...register("name", {
                      required: t.errors.nameRequired,
                      minLength: { value: 2, message: t.errors.nameMin },
                      setValueAs: (v) => (typeof v === "string" ? v.trim() : v),
                      validate: (v) => /^[\p{L}\s'’-]+$/u.test(v) || t.errors.patternCommon,
                    })}
                  />
                  <div className={styles.error} role="alert" aria-live="polite">
                    {showNameErr ? errors.name?.message ?? "" : ""}
                  </div>
                </div>

                <div
                  className={styles.field}
                  data-err-lines="1"
                  data-invalid={!!errors.lastName && showLastNameErr}
                >
                  <label htmlFor="lastName">{t.lastNameLabel}</label>
                  <input
                    id="lastName"
                    placeholder={t.lastNamePlaceholder}
                    autoComplete="family-name"
                    aria-invalid={errors.lastName ? "true" : "false"}
                    {...register("lastName", {
                      setValueAs: (v) => (typeof v === "string" ? v.trim() : v),
                      validate: (v) => !v || /^[\p{L}\s'’-]+$/u.test(v) || t.errors.patternCommon,
                    })}
                  />
                  <div className={styles.error} role="alert" aria-live="polite">
                    {showLastNameErr ? errors.lastName?.message ?? "" : ""}
                  </div>
                </div>

                {showCompany && (
                  <div className={styles.field}>
                    <label htmlFor="company">{t.companyLabel}</label>
                    <input
                      id="company"
                      placeholder={t.companyPlaceholder}
                      autoComplete="organization"
                      {...register("company")}
                    />
                    <div className={styles.error} aria-hidden="true" />
                  </div>
                )}

                <div className={styles.flexGrow} />
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
            )}
            {/* ===== Step 2: email + subject (modal for "other") ===== */}
            {step === 2 && (
              <div className={styles.view} key="step2">
                <div className={styles.field} data-invalid={!!errors.email && showEmailErr}>
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
                  <div className={styles.error} role="alert" aria-live="polite">
                    {showEmailErr ? errors.email?.message ?? "" : ""}
                  </div>
                </div>

                <div className={styles.field} data-invalid={!!errors.subject && showSubjectErr}>
                  <label htmlFor="subject">{t.subjectLabel}</label>
                  <select
                    id="subject"
                    defaultValue=""
                    aria-invalid={errors.subject ? "true" : "false"}
                    {...register("subject", {
                      required: t.errors.subjectRequired,
                      validate: (v) => v !== "" || t.errors.subjectRequired,
                      onChange: (e) => {
                        const v = e.target.value;
                        if (v === "other") {
                          setSubjectDismissed(false);
                          openSubject();
                        } else {
                          setValue("subjectCustom", "", { shouldDirty: true });
                          setSubjectDismissed(false);
                        }
                      },
                    })}
                  >
                    <option value="" disabled>
                      {t.subjectPlaceholder}
                    </option>
                    <option value="client">
                      {t.subjectOptions?.clientProject || "Client work proposal"}
                    </option>
                    <option value="job">{t.subjectOptions?.jobOffer || "Job offer"}</option>
                    <option value="other">
                      {(t.subjectOptions?.other || "Other") +
                        (wSubject === "other" && (wSubjectCustom || "").trim()
                          ? `: ${Array.from(wSubjectCustom).slice(0, 28).join("")}${
                              (wSubjectCustom || "").length > 28 ? "…" : ""
                            }`
                          : "")}
                    </option>
                  </select>
                  <input type="hidden" {...register("subjectCustom")} />

                  <div className={styles.error} role="alert" aria-live="polite">
                    {(showSubjectErr && errors.subject?.message) ||
                      (wSubject === "other" && showSubjectCustomErr
                        ? errors.subjectCustom?.message
                        : "")}
                  </div>
                </div>

                <div className={styles.flexGrow} />
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
            )}
            {/* ===== Step 3: message (textarea + “Edit in modal”) ===== */}
            {step === 3 && (
              <div className={styles.view} key="step3">
                <div className={styles.field} data-invalid={!!errors.message && showMsgErr}>
                  <label htmlFor="message">{t.messageLabel}</label>

                  <textarea
                    id="message"
                    placeholder={t.messagePlaceholder}
                    aria-invalid={errors.message ? "true" : "false"}
                    maxLength={MAX_MSG}
                    {...register("message", {
                      required: t.errors.messageRequired,
                      minLength: { value: MIN_MSG, message: t.errors.messageMin },
                      maxLength: { value: MAX_MSG, message: t.errors.messageMax },
                      setValueAs: (v) => (typeof v === "string" ? v : ""),
                    })}
                  />

                  {/* Счётчик сразу под textarea */}
                  <div className={styles.counterRow} aria-hidden="true">
                    <span className={styles.counter}>
                      {(wMessage || "").length}/{MAX_MSG}
                    </span>
                  </div>

                  {/* Затем — ссылка “Редактировать …” */}
                  <div className={styles.helperRow} id="message-helper">
                    <button type="button" className={styles.linkBtn} onClick={openEditor}>
                      {t.editInModal}
                    </button>
                    <span className={styles.helperSpacer} />
                  </div>

                  <div id="message-error" className={styles.error} role="alert" aria-live="polite">
                    {showMsgErr ? errors.message?.message ?? "" : ""}
                  </div>
                </div>

                <div className={styles.flexGrow} />
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
            )}

            {/* ===== Step 4: Récap + Submit ===== */}
            {step === 4 && (
              <div className={styles.view} key="step4">
                {/* intro line (personalized) */}
                {(() => {
                  const first = firstNameForRecap(wName);
                  const recapText = first
                    ? (t.recapFor || "Let's recap, {firstName}:").replace("{firstName}", first)
                    : t.recapTitle || "Review:";
                  return (
                    <p className={styles.recapTitle} title={recapText}>
                      {recapText}
                    </p>
                  );
                })()}
                <div className={styles.summary}>
                  <p>
                    <strong>{t.nameLabel}:</strong>{" "}
                    <span
                      className={styles.ellip}
                      title={`${wName || "—"} ${wLastName || ""}`.trim()}
                    >
                      {truncMiddle(`${wName || "—"} ${wLastName || ""}`.trim(), 28)}
                    </span>
                  </p>
                  <p>
                    <strong>{t.emailLabel}:</strong>{" "}
                    <span className={styles.ellip} title={wEmail || "—"}>
                      {truncMiddle(wEmail || "—", 26)}
                    </span>
                  </p>
                  <p>
                    <strong>{t.subjectLabel}:</strong>{" "}
                    <span
                      className={styles.ellip}
                      title={subjectDisplay(wSubject, wSubjectCustom, t)}
                    >
                      {subjectDisplay(wSubject, wSubjectCustom, t)}
                    </span>
                  </p>
                  {showCompany && !!wCompany && (
                    <p>
                      <strong>{t.companyLabel}:</strong>{" "}
                      <span className={styles.ellip} title={wCompany}>
                        {truncMiddle(wCompany, 22)}
                      </span>
                    </p>
                  )}
                  <p>
                    <strong>{t.messageLabel}:</strong>{" "}
                    <span className={styles.preview} title={wMessage || ""}>
                      {Array.from(wMessage || "")
                        .slice(0, 60)
                        .join("")}
                      {(wMessage || "").length > 60 ? "…" : ""}
                    </span>
                  </p>
                </div>
                <div className={styles.flexGrow} />
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
                    type="button"
                    className={styles.next}
                    onClick={openConfirm}
                    aria-label={t.send}
                    title={t.send}
                  >
                    <span aria-hidden>›</span>
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* ===== Barre de progression ===== */}
        <div className={styles.progress}>
          <div className={styles.progressTrack}>
            <div className={styles.progressFill} style={{ width: `${progressPct}%` }} aria-hidden />
          </div>
          <span className={styles.progressLabel} aria-live="polite">
            {progressPct}%
          </span>
        </div>
      </section>

      {/* ===== Modale Sujet (custom) ===== */}
      <Modal
        open={subjectOpen}
        title={t.subjectCustomTitle}
        onClose={closeSubject}
        closeLabel={t.close}
        initialFocus="element"
      >
        <div className={styles.modalEditor}>
          <label htmlFor="subject-editor" className={styles.srOnly}>
            {t.subjectLabel}
          </label>
          <textarea
            id="subject-editor"
            ref={subjectRef}
            className={styles.editorText}
            value={subjectDraft}
            onChange={(e) => setSubjectDraft(e.target.value)}
            placeholder={t.subjectCustomPlaceholder}
          />
          <div className={styles.modalBar}>
            <span className={styles.counter} aria-hidden="true" />
            <div className={styles.modalActions}>
              <button type="button" className={styles.btn} onClick={() => setSubjectDraft("")}>
                {t.clear}
              </button>
              <button
                type="button"
                className={`${styles.btn} ${styles.btnPrimary}`}
                onClick={saveSubject}
                disabled={!subjectDraft.trim()}
              >
                {t.save}
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* ===== Modale Message ===== */}
      <Modal
        open={editorOpen}
        title={t.messageLabel}
        onClose={closeEditor}
        initialFocus="element"
        initialFocusRef={editorRef}
        closeLabel={t.close}
        id="message-editor-modal"
      >
        <div className={styles.modalEditor}>
          <label htmlFor="message-editor" className={styles.srOnly}>
            {t.messageLabel}
          </label>
          <textarea
            id="message-editor"
            ref={editorRef}
            className={styles.editorText}
            value={editorDraft}
            onChange={(e) => setEditorDraft(e.target.value.slice(0, MAX_MSG))}
            maxLength={MAX_MSG}
            placeholder={t.messagePlaceholder}
          />
          <div className={styles.modalBar}>
            <div className={`${styles.inlineError} ${editorShowMinErr ? "" : styles.invisible}`}>
              {t.errors.messageMin}
            </div>
            <div className={styles.modalActions}>
              <span className={styles.counter}>
                {editorDraft.length}/{MAX_MSG}
              </span>
              <button
                type="button"
                className={styles.btn}
                onClick={() => {
                  setEditorDraft(""); // on laisse l’erreur si < 10, c’est plus clair
                }}
              >
                {t.clear}
              </button>
              <button
                type="button"
                className={`${styles.btn} ${styles.btnPrimary}`}
                onClick={saveEditor}
              >
                {t.save}
              </button>
            </div>
          </div>
        </div>
      </Modal>
      <Modal open={confirmOpen} onClose={closeConfirm} closeLabel={t.close}>
        <div className={styles.modalEditor}>
          <p style={{ margin: 0 }}>{t.confirmBody}</p>
          <div className={styles.modalBar}>
            <div className={styles.modalActions}>
              <button type="button" className={styles.btn} onClick={cancelAndReset}>
                {t.confirmCancel}
              </button>
              <button
                type="button"
                className={`${styles.btn} ${styles.btnPrimary}`}
                onClick={doConfirmSend}
              >
                {t.confirmSend}
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
