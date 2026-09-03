"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button, buttonClasses } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import {
  Question,
  QuestionnaireResult,
  getQuestionnaireProgress,
  getQuestionnaireQuestions,
  saveQuestionnaireProgress,
  submitQuestionnaire,
  translateApiError,
} from "@/lib/api";
import { usePageTitle } from "@/lib/use-page-title";

type ViewState = "loading" | "intro" | "question" | "pass" | "fail" | "error";

export default function QuestionnairePage() {
  usePageTitle("Questionnaire de certification JEB");
  const [view, setView] = useState<ViewState>("loading");
  const [loadError, setLoadError] = useState<string | null>(null);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentIndex, setCurrentIndex] = useState(0);

  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<QuestionnaireResult | null>(null);

  // Guards the fire-and-forget autosave below: if a slower request resolves
  // after a newer one, it must not overwrite the more recent save/status.
  const saveSeq = useRef(0);

  useEffect(() => {
    Promise.all([getQuestionnaireQuestions(), getQuestionnaireProgress()])
      .then(([loadedQuestions, progress]) => {
        setQuestions(loadedQuestions);
        if (progress?.answers) {
          setAnswers(progress.answers);
          const firstUnanswered = loadedQuestions.findIndex((q) => !progress.answers[q.id]);
          setCurrentIndex(firstUnanswered === -1 ? loadedQuestions.length - 1 : firstUnanswered);
        }
        setView("intro");
      })
      .catch((err) => {
        setLoadError(translateApiError(err));
        setView("error");
      });
  }, []);

  function start() {
    setView("question");
  }

  function persist(nextAnswers: Record<string, string>) {
    const seq = ++saveSeq.current;
    setSaveStatus("saving");
    saveQuestionnaireProgress(nextAnswers)
      .then(() => {
        if (seq === saveSeq.current) setSaveStatus("saved");
      })
      .catch(() => {
        if (seq === saveSeq.current) setSaveStatus("error");
      });
  }

  function selectAnswer(questionId: string, optionId: string) {
    const nextAnswers = { ...answers, [questionId]: optionId };
    setAnswers(nextAnswers);
    persist(nextAnswers);
  }

  async function handleSubmit() {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const submitted = await submitQuestionnaire(answers);
      setResult(submitted);
      setView(submitted.hasWorkPermit ? "pass" : "fail");
    } catch (err) {
      setSubmitError(translateApiError(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (view === "loading") {
    return <main className="p-12 text-center text-text-secondary">Chargement...</main>;
  }

  if (view === "error") {
    return <main className="p-12 text-center text-error">{loadError}</main>;
  }

  const answeredCount = Object.keys(answers).length;

  if (view === "intro") {
    return (
      <main className="max-w-xl mx-auto px-6 py-16 text-center">
        <h1 className="mb-4">Questionnaire de Certification JEB</h1>
        <p className="font-body text-[15px] leading-6 text-text mb-3">
          Ce questionnaire évalue vos aptitudes professionnelles transversales : communication,
          organisation, adaptabilité. Il comprend {questions.length} questions. Votre progression est
          sauvegardée automatiquement sur nos serveurs — vous pouvez fermer votre navigateur et
          reprendre plus tard, même sur un autre appareil.
        </p>
        <p className="text-text-secondary text-sm mb-6">⏱ Durée estimée : 30 à 45 minutes</p>
        <Button variant="primary" onClick={start}>
          {answeredCount > 0 ? "Reprendre le questionnaire" : "Commencer le questionnaire"}
        </Button>
        {answeredCount > 0 && (
          <p className="text-text-secondary text-xs mt-4">
            {answeredCount}/{questions.length} questions déjà répondues.
          </p>
        )}
      </main>
    );
  }

  if (view === "question") {
    const question = questions[currentIndex];
    const selectedOptionId = answers[question.id];

    return (
      <main className="max-w-xl mx-auto px-6 py-8">
        <div className="mb-6">
          <ProgressBar current={currentIndex + 1} total={questions.length} />
        </div>
        <p className="text-xs text-text-secondary mb-1">Question {currentIndex + 1}</p>
        <h3 className="mb-5">{question.text}</h3>
        <div className="flex flex-col gap-2.5 mb-6">
          {question.options.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => selectAnswer(question.id, option.id)}
              aria-pressed={selectedOptionId === option.id}
              className={`text-left border rounded-md px-4 py-3 text-sm hover:border-primary hover:bg-bg-secondary ${
                selectedOptionId === option.id ? "border-primary bg-bg-secondary" : "border-border"
              }`}
            >
              {option.text}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
          >
            ← Précédent
          </Button>

          <span className="text-xs text-text-secondary" aria-live="polite">
            {saveStatus === "saving" && "Enregistrement..."}
            {saveStatus === "saved" && "Progression enregistrée"}
            {saveStatus === "error" && "Échec de l'enregistrement — vos réponses restent sur cette page"}
          </span>

          {currentIndex + 1 < questions.length ? (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={!selectedOptionId}
              onClick={() => setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))}
            >
              Suivant →
            </Button>
          ) : (
            <Button
              type="button"
              variant="primary"
              size="sm"
              disabled={answeredCount < questions.length || isSubmitting}
              onClick={handleSubmit}
            >
              {isSubmitting ? "Envoi..." : "Valider mes réponses"}
            </Button>
          )}
        </div>

        {answeredCount < questions.length && currentIndex + 1 === questions.length && (
          <p className="text-text-secondary text-xs mt-3">
            {questions.length - answeredCount} question(s) restent sans réponse.
          </p>
        )}
        {submitError && (
          <p role="alert" className="text-error text-sm mt-3">
            {submitError}
          </p>
        )}
      </main>
    );
  }

  if (view === "pass") {
    return (
      <main className="bg-bg-secondary py-16 px-6 text-center">
        <div className="w-20 h-20 rounded-full bg-success text-white font-bold text-xl flex items-center justify-center mx-auto mb-5">
          JEB ★
        </div>
        <h1 className="text-success mb-2.5">
          Félicitations ! Vous avez obtenu votre Permis de Travailler JEB.
        </h1>
        <p className="font-bold text-text mb-1.5">Score final : {result?.totalScore}/1000</p>
        <p className="text-text-secondary mb-6">Votre badge est maintenant affiché sur votre profil.</p>
        <div className="flex gap-3 justify-center">
          <Link href="/" className={buttonClasses("primary")}>
            Voir mon profil
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-[#FFF5F5] py-16 px-6 text-center">
      <div className="w-20 h-20 rounded-full bg-border text-text-secondary font-bold text-xl flex items-center justify-center mx-auto mb-5">
        JEB
      </div>
      <h1 className="mb-2.5">Certification non obtenue cette fois.</h1>
      <p className="font-bold text-text mb-1.5">Score final : {result?.totalScore}/1000</p>
      <p className="text-text-secondary mb-6">Vous pouvez retenter le questionnaire quand vous le souhaitez.</p>
      <Link href="/" className={buttonClasses("secondary")}>
        Retour à mon profil
      </Link>
    </main>
  );
}
