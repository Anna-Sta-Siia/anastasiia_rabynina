// src/components/ContactForm/ContactForm.jsx
import { useEffect, useRef, useState, useMemo, useCallback, useId, useContext } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { UIContext } from "../../context/UIContext";
import StepView from "../StepView";
import Recap from "../Recap";
import QuickEditModal from "../QuickEditModal";
import Modal from "../Modal";
import styles from "./ContactForm.module.css";
import useStep from "../../hooks/useStep";

/* =====================
   Constantes & helpers
   ===================== */
const MAX_MSG = 1200;
const MIN_MSG = 10;
const STEPS = 5; // ← passé de 4 à 5

// FIN — coupe au mot si possible, sinon dans le mot (grapheme-safe)
function truncEnd(input = "", max = 26, slack = 3) {
  const s = String(input ?? "").trim();
  const segs =
    typeof Intl !== "undefined" && Intl.Segmenter
      ? Array.from(
          new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(s),
          (x) => x.segment
        )
      : Array.from(s);
  if (segs.length <= max) return s;

  let cutIdx = max;
  const slice = segs.slice(0, max).join("");
  const backToSpace = slice.lastIndexOf(" ");
  if (backToSpace !== -1 && max - backToSpace <= slack) cutIdx = backToSpace;

  let cut = segs.slice(0, cutIdx).join("");
  cut = cut.replace(/[\s.,;:–—-]+$/u, "");
  return cut + "…";
}

// MILIEU — garde début+fin
function truncMiddle(input = "", max = 24, slack = 3) {
  const s = String(input ?? "");
  const segs =
    typeof Intl !== "undefined" && Intl.Segmenter
      ? Array.from(
          new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(s),
          (x) => x.segment
        )
      : Array.from(s);
  if (segs.length <= max) return s;

  const head = Math.ceil((max - 1) / 2);
  const tail = Math.floor((max - 1) / 2);

  const headStr = segs.slice(0, head).join("");
  const hSpace = headStr.lastIndexOf(" ");
  const headCut = hSpace !== -1 && head - hSpace <= slack ? hSpace : head;

  const tailStr = segs.slice(-tail).join("");
  const tSpace = tailStr.indexOf(" ");
  const tailCut = tSpace !== -1 && tSpace <= slack ? tail - tSpace : tail;

  const left = segs
    .slice(0, headCut)
    .join("")
    .replace(/[\s.,;:–—-]+$/u, "");
  const right = segs
    .slice(-tailCut)
    .join("")
    .replace(/^[\s.,;:–—-]+/u, "");
  return left + "…" + right;
}

export default function ContactForm({
  t,
  accent = "#B0BEC5",
  className = "",
  onSubmit, // (data, { reset })
  apiUrl = import.meta?.env?.VITE_CONTACT_API_URL || "",
  showLastName = true,
  showCompany = true,
  debugHoneypot = false,
}) {
  const { language, guards } = useContext(UIContext);
  const methods = useForm({ mode: "onChange" });
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
  } = methods;

  // IDs accessibles
  const idTipFirst = useId();
  const idTipLast = useId();
  const idTipEmail = useId();
  const idTipSubj = useId();
  const idTipCompany = useId();
  const idTipMsg = useId();

  // Étapes (1 → 5) + progression
  const { step, setStep, progress } = useStep(STEPS, 1);

  /* ===== Overlay “toast” ===== */
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
  const [triedNext4, setTriedNext4] = useState(false);

  /* ===== Modales (Subject + Message) ===== */
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorDraft, setEditorDraft] = useState("");
  const [editorReadOnly, setEditorReadOnly] = useState(false);
  const editorRef = useRef(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const openConfirm = () => setConfirmOpen(true);
  const closeConfirm = () => setConfirmOpen(false);

  const [subjectOpen, setSubjectOpen] = useState(false);
  const [subjectDraft, setSubjectDraft] = useState("");
  const [subjectReadOnly, setSubjectReadOnly] = useState(false);
  const [subjectDismissed, setSubjectDismissed] = useState(false);
  const subjectRef = useRef(null);

  // Quick edit
  const [quickOpen, setQuickOpen] = useState(false);
  const [quickField, setQuickField] = useState(null); // { field, type }
  const [quickLabel, setQuickLabel] = useState("");
  const [quickValue, setQuickValue] = useState("");

  const openQuick = (field, label, value, type = "text") => {
    setQuickField({ field, type });
    setQuickLabel(label);
    setQuickValue(value || "");
    setQuickOpen(true);
  };
  const closeQuick = () => setQuickOpen(false);
  const saveQuick = (nextVal) => {
    if (!quickField) return;
    setValue(quickField.field, nextVal, { shouldValidate: true, shouldDirty: true });
  };

  // Ouverture/fermeture modales
  const openEditor = (opts = {}) => {
    const { readOnly = false, text } = opts;
    setEditorReadOnly(readOnly);
    if (readOnly && typeof text === "string") {
      setEditorDraft(text);
    } else {
      setEditorDraft(getValues("message") || "");
    }
    setEditorOpen(true);
  };
  const closeEditor = () => {
    setEditorOpen(false);
    setEditorReadOnly(false);
  };

  const saveEditor = () => {
    const trimmed = editorDraft.trim();
    if (trimmed.length < MIN_MSG) return;
    setValue("message", trimmed, { shouldValidate: true, shouldDirty: true });
    setEditorOpen(false);
  };

  const openSubject = useCallback(
    (opts = {}) => {
      const { readOnly = false, text } = opts;
      setSubjectReadOnly(readOnly);
      if (readOnly && typeof text === "string") {
        setSubjectDraft(text);
      } else {
        setSubjectDraft((getValues("subjectCustom") || "").trim());
      }
      setSubjectDismissed(false);
      setSubjectOpen(true);
    },
    [getValues]
  );
  const closeSubject = () => {
    setSubjectOpen(false);
    setSubjectReadOnly(false);
    setSubjectDismissed(true);
  };
  const saveSubject = () => {
    const v = subjectDraft.trim();
    // revalide via guards
    const validators = guards?.forSubject?.(t) || {};
    for (const fn of Object.values(validators)) {
      if (fn(v) !== true) return; // ne ferme pas si invalide
    }
    // autoriser vide, ne pas bloquer
    if (v && v.length < 3) return;
    setValue("subjectCustom", v, { shouldDirty: true, shouldValidate: true });
    setSubjectOpen(false);
  };

  // autofocus
  useEffect(() => {
    if (!editorOpen || !editorRef.current) return;
    const el = editorRef.current;
    el.focus();
    const end = el.value.length;
    requestAnimationFrame(() => {
      el.setSelectionRange(end, end);
      el.scrollTop = el.scrollHeight;
    });
  }, [editorOpen]);

  useEffect(() => {
    if (subjectOpen && subjectRef.current) {
      const el = subjectRef.current;
      el.focus();
      el.setSelectionRange?.(0, 0);
      el.scrollTop = 0;
    }
  }, [subjectOpen]);
  useEffect(() => {
    const handler = () => openSubject({ readOnly: false });
    window.addEventListener("open-subject-modal", handler);
    return () => window.removeEventListener("open-subject-modal", handler);
  }, [openSubject]);
  // Champs live
  const wName = watch("name");
  const wLastName = watch("lastName");
  const wEmail = watch("email");
  const wCompany = watch("company");
  const wSubject = watch("subject");
  const wSubjectCustom = watch("subjectCustom");
  const wMessage = watch("message");

  // Auto-ouvrir la modale SUBJECT si other + custom vide (à l'étape 3 désormais)
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

  // Résumés (troncature)
  const subjectFull = useMemo(() => {
    const otherLabel = t.subjectOptions?.other || "Other";
    if (wSubject === "other") {
      const v = (wSubjectCustom || "").trim();
      return v ? `${otherLabel}: ${v}` : otherLabel;
    }
    return (
      {
        client: t.subjectOptions?.clientProject,
        job: t.subjectOptions?.jobOffer,
        other: otherLabel,
      }[wSubject] ??
      wSubject ??
      "—"
    );
  }, [wSubject, wSubjectCustom, t]);

  const firstNameShort = useMemo(() => truncEnd(wName, 17, 3), [wName]);
  const lastNameShort = useMemo(() => truncEnd(wLastName, 17, 3), [wLastName]);
  const emailShort = useMemo(() => truncMiddle(wEmail || "—", 17, 3), [wEmail]);
  const subjectShort = useMemo(() => truncEnd(subjectFull, 17, 3), [subjectFull]);
  const companyShort = useMemo(() => truncEnd(wCompany || "—", 17, 3), [wCompany]);
  const msgShort = useMemo(() => truncEnd(wMessage || "—", 17, 3), [wMessage]);

  /* ===== Étapes : validations ===== */
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

  const goNext2 = async () => {
    setTriedNext2(true);
    const ok = await trigger(["email"]); // company optionnelle
    if (!ok) {
      if (errors.email) setFocus("email");
      return;
    }
    setStep(3);
  };

  const goNext3 = async () => {
    setTriedNext3(true);
    const fields = ["subject"];
    if ((getValues("subject") || "") === "other") fields.push("subjectCustom");
    const ok = await trigger(fields);
    if (!ok) {
      if (errors.subject || errors.subjectCustom) setFocus("subject");
      return;
    }
    setStep(4);
  };

  const goNext4 = async () => {
    setTriedNext4(true);
    const ok = await trigger("message");
    if (!ok) {
      setFocus("message");
      return;
    }
    setStep(5);
  };

  // Envoi
  const submit = async (data) => {
    if (data.hp) return; // anti-bot
    try {
      const fullNameStr = `${(data.name || "").trim()} ${(data.lastName || "").trim()}`.trim();
      const payload = {
        name: data.name,
        lastName: data.lastName || "",
        fullName: fullNameStr,
        email: data.email,
        company: data.company || "",
        subject: data.subject === "other" ? data.subjectCustom?.trim() || "other" : data.subject,
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
      setTriedNext1(false);
      setTriedNext2(false);
      setTriedNext3(false);
      setTriedNext4(false);
      const makeSentMsg = () => {
        if (typeof t.sentWithName === "function") {
          return t.sentWithName(fullNameStr);
        }
        if (typeof t.sentWithName === "string") {
          return t.sentWithName.replace("{fullName}", fullNameStr);
        }
        return t.sent || "Thanks! Your message was sent.";
      };

      showToast(makeSentMsg());
    } catch (err) {
      console.error("ContactForm submit error:", err);
      alert("Envoi impossible pour le moment. Vérifie la configuration API.");
    }
  };

  // Erreurs : flags
  const showNameErr = triedNext1 || touchedFields.name;
  const showLastNameErr = triedNext1 || touchedFields.lastName;
  const showCompanyErr =
    (triedNext2 || touchedFields.company || (wCompany || "").trim().length > 0) && !!errors.company;
  const showEmailErr = triedNext2 || touchedFields.email;
  const showSubjectErr = triedNext3 || touchedFields.subject;
  const showSubjectCustomErr = triedNext3 || touchedFields.subjectCustom;
  const showMsgErr = triedNext4 || touchedFields.message;

  /* =====================
     Rendu
     ===================== */
  return (
    <FormProvider {...methods}>
      {showOverlay && (
        <div className={styles.overlay} role="status" aria-live="assertive">
          <div className={styles.overlayCard}>{toastText}</div>
        </div>
      )}

      <section
        lang={language}
        className={`${styles.eggWrap} ${className}`}
        data-complete={step === STEPS ? "true" : undefined}
        style={{ "--barHue": progress.hue }}
      >
        <div className={styles.egg} style={{ "--accent": accent }} data-egg>
          <form className={styles.form} onSubmit={handleSubmit(submit)} noValidate>
            {/* Honeypot accessible-off */}
            <input
              id="hp"
              name="hp"
              type="text"
              className={`${styles.honey} ${debugHoneypot ? styles.honeyDebug : ""}`}
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              role="presentation"
              {...methods.register("hp")}
            />

            {/* ===== Steps (1..5) ===== */}
            {step === 1 && (
              <StepView
                kind="identity"
                t={t}
                errors={errors}
                showLastName={showLastName}
                register={register}
                guards={guards}
                showNameErr={showNameErr}
                showLastNameErr={showLastNameErr}
                onNext={goNext1}
              />
            )}

            {step === 2 && (
              <StepView
                kind="companyEmail"
                t={t}
                errors={errors}
                register={register}
                guards={guards}
                showCompany={showCompany}
                showEmailErr={showEmailErr}
                showCompanyErr={showCompanyErr} // ← NEW
                onBack={() => setStep(1)}
                onNext={goNext2}
              />
            )}

            {step === 3 && (
              <StepView
                kind="subject"
                t={t}
                errors={errors}
                register={register}
                guards={guards}
                subjectValue={watch("subject")}
                showSubjectErr={showSubjectErr}
                showSubjectCustomErr={showSubjectCustomErr}
                onSubjectChange={(v) => {
                  if (v === "other") {
                    setSubjectDismissed(false);
                    openSubject();
                  } else {
                    setValue("subjectCustom", "", { shouldDirty: true });
                    setSubjectDismissed(false);
                  }
                }}
                onBack={() => setStep(2)}
                onNext={goNext3}
              />
            )}

            {step === 4 && (
              <StepView
                kind="message"
                t={t}
                errors={errors}
                register={register}
                guards={guards}
                showMsgErr={showMsgErr}
                MAX_MSG={MAX_MSG}
                MIN_MSG={MIN_MSG}
                openEditor={() => openEditor()}
                onBack={() => setStep(3)}
                onNext={goNext4}
              />
            )}

            {step === 5 && (
              <Recap
                t={t}
                guardLang={language}
                tipIds={{
                  first: idTipFirst,
                  last: idTipLast,
                  email: idTipEmail,
                  subj: idTipSubj,
                  company: idTipCompany,
                  msg: idTipMsg,
                }}
                subjectPresetOptions={[
                  {
                    value: "client",
                    label: t.subjectOptions?.clientProject || "Client work proposal",
                  },
                  { value: "job", label: t.subjectOptions?.jobOffer || "Job offer" },
                ]}
                onSelectSubjectPreset={(val) => {
                  setValue("subject", val, { shouldDirty: true, shouldValidate: true });
                }}
                showLastName={showLastName}
                showCompany={showCompany}
                values={{
                  wName,
                  wLastName,
                  wEmail,
                  wCompany,
                  wMessage,
                  subjectFull,
                  firstNameShort,
                  lastNameShort,
                  emailShort,
                  subjectShort,
                  companyShort,
                  msgShort,
                }}
                actions={{
                  openQuick,
                  openSubjectRead: () => openSubject({ readOnly: true, text: subjectFull }),
                  openSubjectEdit: () => openSubject({ readOnly: false }),
                  openEditorRead: () => openEditor({ readOnly: true, text: wMessage }),
                  openEditorEdit: () => openEditor({ readOnly: false }),
                }}
                onBack={() => setStep(4)}
                onConfirm={openConfirm}
              />
            )}
          </form>
        </div>

        {/* ===== Barre de progression ===== */}
        <div className={styles.progress}>
          <div className={styles.progressTrack}>
            <div
              className={styles.progressFill}
              style={{ width: `${progress.pct}%` }}
              aria-hidden
            />
          </div>
          <span className={styles.progressLabel} aria-live="polite">
            {progress.pct}%
          </span>
        </div>
      </section>

      {/* ===== QuickEdit ===== */}
      <QuickEditModal
        open={quickOpen}
        onClose={closeQuick}
        label={quickLabel}
        value={quickValue}
        type={quickField?.type || "text"}
        onSave={saveQuick}
        t={t}
      />

      {/* ===== Modale Sujet (custom) ===== */}
      <Modal
        open={subjectOpen}
        title={t.subjectCustomTitle}
        onClose={closeSubject}
        closeLabel={t.close}
        initialFocus="element"
      >
        {(() => {
          // --- VALIDATION LIVE DU TEXTE PERSONNALISÉ ---
          const validators = guards?.forSubject?.(t) || {};
          const validateNow = (val) => {
            for (const fn of Object.values(validators)) {
              const res = fn(val);
              if (res !== true)
                return typeof res === "string"
                  ? res
                  : t.errors?.subjectRequired || "Sujet invalide.";
            }
            // facultatif : on autorise vide
            if (val.trim().length === 0) return "";
            if (val.trim().length < 3) return t.errors?.subjectTooShort || "";
          };

          const err = validateNow(subjectDraft);

          return (
            <div className={`${styles.modalEditor} ${styles.field}`} data-err-lines="2">
              <label htmlFor="subject-editor" className={styles.srOnly}>
                {t.subjectLabel}
              </label>
              <div className={styles.editorShell}>
                <textarea
                  id="subject-editor"
                  ref={subjectRef}
                  className={`${styles.editorText} ${err ? styles.inputInvalid : ""}`}
                  value={subjectDraft}
                  onChange={(e) => !subjectReadOnly && setSubjectDraft(e.target.value)}
                  placeholder={t.subjectCustomPlaceholder}
                  readOnly={subjectReadOnly}
                  aria-invalid={!!err}
                  aria-describedby="subject-editor-error"
                />
              </div>
              {/* message d'erreur live */}
              <div
                id="subject-editor-error"
                className={styles.error}
                role="alert"
                aria-live="polite"
              >
                {/* on n'affiche l'erreur que si non vide ET invalide */}
                {subjectDraft.trim().length > 0 ? err : ""}
              </div>

              <div className={styles.modalBar}>
                <span className={styles.counter} aria-hidden="true" />
                <div className={styles.modalActions}>
                  {subjectReadOnly ? (
                    <button
                      type="button"
                      className={`${styles.btn} ${styles.btnPrimary}`}
                      onClick={() => openSubject({ readOnly: false })}
                    >
                      {t.edit}
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        className={styles.btn}
                        onClick={() => setSubjectDraft("")}
                      >
                        {t.clear}
                      </button>
                      <button
                        type="button"
                        className={`${styles.btn} ${styles.btnPrimary}`}
                        onClick={saveSubject}
                        disabled={!!err}
                        title={err ? err : t.save}
                      >
                        {t.save}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })()}
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
          <div className={styles.editorShell}>
            <textarea
              id="message-editor"
              ref={editorRef}
              className={styles.editorText}
              value={editorDraft}
              onChange={(e) => !editorReadOnly && setEditorDraft(e.target.value.slice(0, MAX_MSG))}
              maxLength={MAX_MSG}
              placeholder={t.messagePlaceholder}
              readOnly={editorReadOnly}
            />
          </div>
        </div>
        <div className={styles.modalBar}>
          <span className={styles.counter}>
            {editorDraft.length}/{MAX_MSG}
          </span>
          <div className={styles.modalActions}>
            {editorReadOnly ? (
              <button
                type="button"
                className={`${styles.btn} ${styles.btnPrimary}`}
                onClick={() => openEditor({ readOnly: false })}
              >
                {t.edit}
              </button>
            ) : (
              <>
                <button type="button" className={styles.btn} onClick={() => setEditorDraft("")}>
                  {t.clear}
                </button>
                <button
                  type="button"
                  className={`${styles.btn} ${styles.btnPrimary}`}
                  onClick={saveEditor}
                >
                  {t.save}
                </button>
              </>
            )}
          </div>
        </div>
      </Modal>

      {/* ===== Confirmation d’envoi ===== */}
      <Modal open={confirmOpen} onClose={closeConfirm} closeLabel={t.close}>
        <div className={styles.modalEditor}>
          <p style={{ margin: 0 }}>{t.confirmBody}</p>
          <div className={styles.modalBar}>
            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.btn}
                onClick={() => {
                  reset();
                  setStep(1);
                  closeConfirm();
                }}
              >
                {t.confirmCancel}
              </button>
              <button
                type="button"
                className={`${styles.btn} ${styles.btnPrimary}`}
                onClick={() => {
                  closeConfirm();
                  handleSubmit(submit)();
                }}
              >
                {t.confirmSend}
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </FormProvider>
  );
}
