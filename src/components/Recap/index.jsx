// src/components/Recap/index.jsx
import { useMemo } from "react";
import { useFormContext } from "react-hook-form";
import Tooltip from "../Tooltip";
import styles from "../ContactForm/ContactForm.module.css";

/* helper pour la phrase d’intro */
function firstNameForRecap(input = "") {
  const s = String(input).trim();
  if (!s) return "";
  const first = s.split(/[\s-]+/)[0];
  return first.length <= 15 ? first : first.slice(0, 15) + "…";
}

export default function Recap({
  t,
  guardLang = "fr",
  tipIds = {},
  showLastName = true,
  showCompany = true,
  values = {},
  actions = {},
  subjectPresetOptions = [],
  onBack,
  onConfirm,
}) {
  const { watch, setValue } = useFormContext();

  const {
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
  } = values;

  const { openQuick, openSubjectRead, openSubjectEdit, openEditorRead, openEditorEdit } = actions;

  const currentSubject = watch("subject");
  const isCustomSubject = currentSubject === "other";

  const recapText = useMemo(() => {
    const fn = firstNameForRecap(wName);
    return fn
      ? (t.recapFor || "Let's recap, {firstName}").replace("{firstName}", fn)
      : t.recapTitle || "Summary";
  }, [t, wName]);

  const opts = [
    ...(subjectPresetOptions || []),
    { value: "other", label: t.subjectOptions?.other || "Divers" },
  ];

  const CLAMP = {
    first: 1,
    last: 2,
    email: 3,
    subj: 4,
    company: 4,
    msg: 4,
  };

  return (
    <div className={styles.view}>
      {/* Titre */}
      <p className={styles.recapTitle} title={recapText}>
        {recapText}
      </p>

      {/* Liste récap */}
      <div className={styles.summary} lang={guardLang}>
        {/* Prénom */}
        <div className={styles.summaryRow}>
          <strong>{t.firstNameLabel || "Prénom"}:</strong>{" "}
          <Tooltip
            id={tipIds?.first}
            content={wName || "—"}
            lines={CLAMP.first}
            wide
            variant="name"
            lang={guardLang}
            onMore={() => openQuick?.("name", t.firstNameLabel, wName || "", "text")}
            onEdit={() => openQuick?.("name", t.firstNameLabel, wName || "", "text")}
            labelMore={t.tooltipMore}
            labelEdit={t.tooltipEdit}
          >
            <span
              className={styles.value}
              aria-describedby={tipIds?.first}
              onClick={() => openQuick?.("name", t.firstNameLabel, wName || "", "text")}
            >
              {firstNameShort || "—"}
            </span>
          </Tooltip>
        </div>

        {/* Nom */}
        {showLastName && wLastName?.trim() && (
          <div className={styles.summaryRow}>
            <strong>{t.lastNameLabel || "Nom"}:</strong>{" "}
            <Tooltip
              id={tipIds?.last}
              content={wLastName}
              lines={CLAMP.last}
              wide
              variant="lastname"
              lang={guardLang}
              onMore={() => openQuick?.("lastName", t.lastNameLabel, wLastName || "", "text")}
              onEdit={() => openQuick?.("lastName", t.lastNameLabel, wLastName || "", "text")}
              labelMore={t.tooltipMore}
              labelEdit={t.tooltipEdit}
            >
              <span
                className={styles.value}
                aria-describedby={tipIds?.last}
                onClick={() => openQuick?.("lastName", t.lastNameLabel, wLastName || "", "text")}
              >
                {lastNameShort}
              </span>
            </Tooltip>
          </div>
        )}

        {/* Email */}
        <div className={styles.summaryRow}>
          <strong>{t.emailLabel || "E-mail"}:</strong>{" "}
          <Tooltip
            id={tipIds?.email}
            content={wEmail || "—"}
            lines={CLAMP.email}
            wide
            lang={guardLang}
            onMore={() => openQuick?.("email", t.emailLabel, wEmail || "", "email")}
            onEdit={() => openQuick?.("email", t.emailLabel, wEmail || "", "email")}
            labelMore={t.tooltipMore}
            labelEdit={t.tooltipEdit}
          >
            <span
              className={styles.value}
              aria-describedby={tipIds?.email}
              onClick={() => openQuick?.("email", t.emailLabel, wEmail || "", "email")}
            >
              {emailShort || "—"}
            </span>
          </Tooltip>
        </div>

        {/* Sujet */}
        <div className={styles.summaryRow}>
          <strong>{t.subjectLabel || "Sujet"}:</strong>{" "}
          <Tooltip
            id={tipIds?.subj}
            content={subjectFull}
            lines={CLAMP.subj}
            wide
            lang={guardLang}
            options={opts.map((o) => ({
              ...o,
              onSelect: (val) => {
                setValue("subject", val, { shouldDirty: true, shouldValidate: true });
                if (val === "other") {
                  actions?.openSubjectEdit?.();
                } else {
                  setValue("subjectCustom", "", { shouldDirty: true, shouldValidate: true });
                }
              },
            }))}
            currentOption={currentSubject}
            onMore={isCustomSubject ? openSubjectRead : undefined}
            onEdit={isCustomSubject ? openSubjectEdit : undefined}
            labelMore={isCustomSubject ? t.tooltipMore : undefined}
            labelEdit={isCustomSubject ? t.tooltipEdit : undefined}
            labelChoose={t.tooltipChoose}
          >
            <span
              className={styles.value}
              aria-describedby={tipIds?.subj || undefined}
              title={subjectFull}
            >
              {subjectShort}
            </span>
          </Tooltip>
        </div>

        {/* Société */}
        {showCompany && wCompany?.trim() && (
          <div className={styles.summaryRow}>
            <strong>{t.companyLabel || "Société"}:</strong>{" "}
            <Tooltip
              id={tipIds?.company}
              content={wCompany}
              lines={CLAMP.company}
              wide
              lang={guardLang}
              onMore={() => openQuick?.("company", t.companyLabel, wCompany || "", "text")}
              onEdit={() => openQuick?.("company", t.companyLabel, wCompany || "", "text")}
              labelMore={t.tooltipMore}
              labelEdit={t.tooltipEdit}
            >
              <span
                className={styles.value}
                aria-describedby={tipIds?.company}
                onClick={() => openQuick?.("company", t.companyLabel, wCompany || "", "text")}
              >
                {companyShort}
              </span>
            </Tooltip>
          </div>
        )}

        {/* Message */}
        <div className={styles.summaryRow}>
          <strong>{t.messageLabel || "Message"}:</strong>{" "}
          <Tooltip
            id={tipIds?.msg}
            content={wMessage || "—"}
            lines={CLAMP.msg}
            lang={guardLang}
            wide
            onMore={openEditorRead}
            onEdit={openEditorEdit}
            labelMore={t.tooltipMore}
            labelEdit={t.tooltipEdit}
          >
            <span className={styles.value} aria-describedby={tipIds?.msg}>
              {msgShort || "—"}
            </span>
          </Tooltip>
        </div>
      </div>

      <div className={styles.flexGrow} />

      {/* Nav */}
      <div className={styles.navRow}>
        <button
          type="button"
          className={styles.back}
          onClick={onBack}
          aria-label={t.back || "Retour"}
          title={t.back || "Retour"}
        >
          <span aria-hidden>‹</span>
        </button>
        <button
          type="button"
          className={styles.next}
          onClick={onConfirm}
          aria-label={t.send || t.confirmSend || "Envoyer"}
          title={t.send || t.confirmSend || "Envoyer"}
        >
          <span aria-hidden>›</span>
        </button>
      </div>
    </div>
  );
}
