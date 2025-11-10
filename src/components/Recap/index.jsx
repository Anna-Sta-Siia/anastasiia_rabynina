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

  // pour surligner le preset sélectionné dans le tooltip
  const currentSubject = watch("subject");

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

  return (
    <div className={styles.view}>
      {/* Titre */}
      <p className={styles.recapTitle} title={recapText}>
        {recapText}
      </p>

      {/* Liste récap */}
      <div className={styles.summary} lang={guardLang}>
        {/* Prénom */}
        <p>
          <strong>{t.firstNameLabel || "Prénom"}:</strong>{" "}
          <Tooltip
            id={tipIds?.first}
            content={wName || "—"}
            maxCh={16}
            lines={5}
            wide
            lang={guardLang}
          >
            <span
              className={styles.value}
              aria-describedby={tipIds?.first}
              onClick={() => openQuick?.("name", t.firstNameLabel, wName || "", "text")}
            >
              {firstNameShort || "—"}
            </span>
          </Tooltip>
        </p>

        {/* Nom */}
        {showLastName && wLastName?.trim() && (
          <p>
            <strong>{t.lastNameLabel || "Nom"}:</strong>{" "}
            <Tooltip
              id={tipIds?.last}
              content={wLastName}
              maxCh={16}
              lines={5}
              wide
              lang={guardLang}
            >
              <span
                className={styles.value}
                aria-describedby={tipIds?.last}
                onClick={() => openQuick?.("lastName", t.lastNameLabel, wLastName || "", "text")}
              >
                {lastNameShort}
              </span>
            </Tooltip>
          </p>
        )}

        {/* Email */}
        <p>
          <strong>{t.emailLabel || "E-mail"}:</strong>{" "}
          <Tooltip
            id={tipIds?.email}
            content={wEmail || "—"}
            maxCh={16}
            lines={5}
            wide
            lang={guardLang}
          >
            <span
              className={styles.value}
              aria-describedby={tipIds?.email}
              onClick={() => openQuick?.("email", t.emailLabel, wEmail || "", "email")}
            >
              {emailShort || "—"}
            </span>
          </Tooltip>
        </p>

        {/* Sujet */}
        <p>
          <strong>{t.subjectLabel || "Sujet"}:</strong>{" "}
          <Tooltip
            id={tipIds?.subj}
            content={subjectFull}
            maxCh={16}
            lines={5}
            wide
            lang={guardLang}
            options={opts.map((o) => ({
              ...o,
              onSelect: (val) => {
                setValue("subject", val, { shouldDirty: true, shouldValidate: true });
                if (val === "other") {
                  actions?.openSubjectEdit?.(); // ouvre la modale "Sujet personnalisé"
                } else {
                  setValue("subjectCustom", "", { shouldDirty: true, shouldValidate: true });
                }
              },
            }))}
            currentOption={currentSubject}
            onMore={openSubjectRead}
            onEdit={openSubjectEdit}
          >
            <span
              className={styles.value}
              aria-describedby={tipIds?.subj || undefined}
              title={subjectFull}
            >
              {subjectShort}
            </span>
          </Tooltip>
        </p>

        {/* Société */}
        {showCompany && wCompany?.trim() && (
          <p>
            <strong>{t.companyLabel || "Société"}:</strong>{" "}
            <Tooltip
              id={tipIds?.company}
              content={wCompany}
              maxCh={16}
              lines={5}
              wide
              lang={guardLang}
            >
              <span
                className={styles.value}
                aria-describedby={tipIds?.company}
                onClick={() => openQuick?.("company", t.companyLabel, wCompany || "", "text")}
              >
                {companyShort}
              </span>
            </Tooltip>
          </p>
        )}

        {/* Message */}
        <p>
          <strong>{t.messageLabel || "Message"}:</strong>{" "}
          <Tooltip
            id={tipIds?.msg}
            content={wMessage || "—"}
            maxCh={16}
            lines={5}
            lang={guardLang}
            wide
            onMore={openEditorRead}
            onEdit={openEditorEdit}
          >
            <span className={styles.value} aria-describedby={tipIds?.msg}>
              {msgShort || "—"}
            </span>
          </Tooltip>
        </p>
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
