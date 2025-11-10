// src/components/StepView.jsx
import styles from "../ContactForm/ContactForm.module.css";

/**
 * Un seul composant d’étape, piloté par la prop `kind`:
 *  - "identity"      : name / lastName
 *  - "companyEmail"  : company (opt) / email
 *  - "subject"       : select subject (+ erreur)
 *  - "message"       : textarea + bouton "éditer en modale"
 */
export default function StepView({
  kind, // "identity" | "companyEmail" | "subject" | "message"
  t,
  errors,
  showLastName = true,
  showCompany = true,

  // RHF & guards
  register,
  guards,

  // états d’erreur (bools déjà calculés dans ContactForm)
  showNameErr = false,
  showLastNameErr = false,
  showCompanyErr = false,
  showEmailErr = false,
  showSubjectErr = false,
  showSubjectCustomErr = false,
  showMsgErr = false,

  // valeurs live utiles
  subjectValue,
  MAX_MSG = 1200,
  MIN_MSG = 10,

  // navigation
  onNext,
  onBack,

  // actions modales (message / subject)
  openEditor, // () => void
  onSubjectChange, // (value) => void
}) {
  /* ===== Étape 1 : Identité ===== */
  if (kind === "identity") {
    return (
      <div className={styles.view}>
        {/* Name */}
        <div
          className={styles.field}
          data-err-lines="2"
          data-invalid={!!errors?.name && showNameErr}
        >
          <label htmlFor="name">{t.nameLabel}</label>
          <input
            id="name"
            placeholder={t.namePlaceholder}
            autoComplete="given-name"
            aria-invalid={errors?.name ? "true" : "false"}
            {...register("name", {
              required: t.errors.nameRequired,
              minLength: { value: 2, message: t.errors.nameMin },
              setValueAs: guards?._raw?.normalize,
              validate: { ...(guards?.forNameRequired?.(t) || {}) },
            })}
          />
          <div className={styles.error} role="alert" aria-live="polite">
            {showNameErr ? errors?.name?.message ?? "" : ""}
          </div>
        </div>

        {/* Last name (opt.) */}
        {showLastName && (
          <div
            className={styles.field}
            data-err-lines="2"
            data-invalid={!!errors?.lastName && showLastNameErr}
          >
            <label htmlFor="lastName">{t.lastNameLabel}</label>
            <input
              id="lastName"
              placeholder={t.lastNamePlaceholder}
              autoComplete="family-name"
              aria-invalid={errors?.lastName ? "true" : "false"}
              {...register("lastName", {
                setValueAs: guards?._raw?.normalize,
                validate: { ...(guards?.forLastNameOptional?.(t) || {}) },
                maxLength: { value: 60, message: t.errors?.lastNameMax || "60 caractères max." },
              })}
            />
            <div className={styles.error} role="alert" aria-live="polite">
              {showLastNameErr ? errors?.lastName?.message ?? "" : ""}
            </div>
          </div>
        )}

        <div className={styles.flexGrow} />
        <div className={styles.navRow}>
          <button
            type="button"
            className={styles.next}
            onClick={onNext}
            aria-label={t.next}
            title={t.next}
          >
            <span aria-hidden>›</span>
          </button>
        </div>
      </div>
    );
  }

  /* ===== Étape 2 : Société + E-mail ===== */
  if (kind === "companyEmail") {
    return (
      <div className={styles.view}>
        {/* Company (optionnelle) */}
        {showCompany && (
          <div
            className={styles.field}
            data-err-lines="1"
            data-invalid={!!errors?.company && showCompanyErr}
          >
            <label htmlFor="company">{t.companyLabel}</label>
            <input
              id="company"
              placeholder={t.companyPlaceholder}
              autoComplete="organization"
              aria-invalid={errors?.company ? "true" : "false"}
              {...register("company", {
                setValueAs: guards?._raw?.normalize,
                validate: { ...(guards?.forCompany?.(t) || {}) }, // noUrl + noProfanity + noGibberish
              })}
            />
            <div className={styles.error} role="alert" aria-live="polite">
              {showCompanyErr ? errors?.company?.message ?? "" : ""}
            </div>
          </div>
        )}

        {/* Email */}
        <div
          className={styles.field}
          data-invalid={!!errors?.email && showEmailErr}
          data-err-lines="1"
        >
          <label htmlFor="email">{t.emailLabel}</label>
          <input
            id="email"
            type="email"
            placeholder={t.emailPlaceholder}
            autoComplete="email"
            aria-invalid={errors?.email ? "true" : "false"}
            {...register("email", {
              required: t.errors.emailRequired,
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: t.errors.emailInvalid },
              validate: { ...(guards?.forEmail || {}) },
            })}
          />
          <div className={styles.error} role="alert" aria-live="polite">
            {showEmailErr ? errors?.email?.message ?? "" : ""}
          </div>
        </div>

        <div className={styles.flexGrow} />
        <div className={styles.navRow}>
          <button
            type="button"
            className={styles.back}
            onClick={onBack}
            aria-label={t.back}
            title={t.back}
          >
            <span aria-hidden>‹</span>
          </button>
          <button
            type="button"
            className={styles.next}
            onClick={onNext}
            aria-label={t.next}
            title={t.next}
          >
            <span aria-hidden>›</span>
          </button>
        </div>
      </div>
    );
  }

  /* ===== Étape 3 : Sujet ===== */
  if (kind === "subject") {
    return (
      <div className={styles.view}>
        {/* Subject */}
        <div
          className={styles.field}
          data-invalid={!!errors?.subject && showSubjectErr}
          data-err-lines="2"
        >
          <label htmlFor="subject">{t.subjectLabel}</label>

          <select
            id="subject"
            defaultValue={subjectValue || ""}
            aria-invalid={errors?.subject ? "true" : "false"}
            {...register("subject", {
              required: t.errors.subjectRequired,
              validate: (v) => v !== "" || t.errors.subjectRequired,
              onChange: (e) => onSubjectChange?.(e.target.value),
            })}
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

          {/* lien pour rouvrir la modale quand Divers est sélectionné */}
          {subjectValue === "other" && (
            <div className={styles.helperRow} style={{ marginTop: 6 }}>
              <button
                type="button"
                className={styles.linkBtn}
                onClickCapture={(e) => {
                  e.stopPropagation();
                  // ouvre la modale custom
                  typeof window !== "undefined" &&
                    window.dispatchEvent(new Event("open-subject-modal"));
                }}
              >
                {t.editInModal || "Éditer le texte personnalisé"}
              </button>
            </div>
          )}

          <div className={styles.error} role="alert" aria-live="polite">
            {(showSubjectErr && errors?.subject?.message) ||
              (showSubjectCustomErr ? errors?.subjectCustom?.message : "")}
          </div>
        </div>

        <div className={styles.flexGrow} />
        <div className={styles.navRow}>
          <button
            type="button"
            className={styles.back}
            onClick={onBack}
            aria-label={t.back}
            title={t.back}
          >
            <span aria-hidden>‹</span>
          </button>
          <button
            type="button"
            className={styles.next}
            onClick={onNext}
            aria-label={t.next}
            title={t.next}
          >
            <span aria-hidden>›</span>
          </button>
        </div>
      </div>
    );
  }

  /* ===== Étape 4 : Message ===== */
  return (
    <div className={styles.view}>
      <div className={styles.field} data-invalid={!!errors?.message && showMsgErr}>
        <label htmlFor="message">{t.messageLabel}</label>
        <div className={styles.textarea_shell}>
          <textarea
            id="message"
            placeholder={t.messagePlaceholder}
            aria-invalid={errors?.message ? "true" : "false"}
            maxLength={MAX_MSG}
            {...register("message", {
              required: t.errors.messageRequired,
              minLength: { value: MIN_MSG, message: t.errors.messageMin },
              maxLength: { value: MAX_MSG, message: t.errors.messageMax },
              setValueAs: (v) => (typeof v === "string" ? v : ""),
              validate: { ...(guards?.forMessage?.(t) || {}) },
            })}
          />
        </div>

        <div className={styles.helperRow} id="message-helper">
          {openEditor && (
            <button type="button" className={styles.linkBtn} onClick={() => openEditor()}>
              {t.editInModal}
            </button>
          )}
          <span className={styles.helperSpacer} />
        </div>

        <div className={styles.error} role="alert" aria-live="polite">
          {showMsgErr ? errors?.message?.message ?? "" : ""}
        </div>
      </div>

      <div className={styles.flexGrow} />
      <div className={styles.navRow}>
        <button
          type="button"
          className={styles.back}
          onClick={onBack}
          aria-label={t.back}
          title={t.back}
        >
          <span aria-hidden>‹</span>
        </button>
        <button
          type="button"
          className={styles.next}
          onClick={onNext}
          aria-label={t.next}
          title={t.next}
        >
          <span aria-hidden>›</span>
        </button>
      </div>
    </div>
  );
}

StepView.defaultProps = {
  t: {},
  errors: {},
  showLastName: true,
  showCompany: true,
  showNameErr: false,
  showLastNameErr: false,
  showEmailErr: false,
  showSubjectErr: false,
  showSubjectCustomErr: false,
  showMsgErr: false,
  MAX_MSG: 1200,
  MIN_MSG: 10,
};
