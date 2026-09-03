"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, buttonClasses } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { usePageTitle } from "@/lib/use-page-title";

// Questions de démonstration — aucune route backend n'expose encore les
// modèles Prisma Question/Option/QuestionnaireProgress (voir résumé final).
const DEMO_QUESTIONS = [
  {
    text: "Dans une situation de travail en équipe sur un projet urgent, quelle est votre première réaction face à un désaccord de méthode ?",
    options: [
      "J'impose ma méthode pour gagner du temps",
      "Je propose d'en discuter rapidement pour trouver un compromis",
      "Je laisse faire sans donner mon avis",
      "Je demande à un supérieur de trancher",
    ],
    correct: 1,
  },
  {
    text: "Un client vous fait une remarque désagréable sur un retard. Comment réagissez-vous ?",
    options: [
      "Je m'excuse et propose une solution concrète",
      "Je me justifie longuement",
      "Je reste silencieux",
      "Je réponds sur le même ton",
    ],
    correct: 0,
  },
  {
    text: "Vous devez apprendre un nouvel outil en peu de temps. Quelle est votre approche ?",
    options: [
      "J'attends qu'on me forme",
      "Je teste par moi-même et je pose des questions ciblées",
      "Je refuse tant que je n'ai pas de formation officielle",
      "Je délègue à un collègue",
    ],
    correct: 1,
  },
];

const TOTAL_QUESTIONS = 100; // annoncé côté produit — le set de démo n'en couvre que 3

type ViewState = "intro" | "question" | "pass" | "fail";

export default function QuestionnairePage() {
  usePageTitle("Questionnaire de certification JEB");
  const [view, setView] = useState<ViewState>("intro");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [finalScore, setFinalScore] = useState(0);

  function start() {
    setCurrentIndex(0);
    setScore(0);
    setView("question");
  }

  function answer(optionIndex: number) {
    const isCorrect = optionIndex === DEMO_QUESTIONS[currentIndex].correct;
    const nextScore = score + (isCorrect ? 1 : 0);

    if (currentIndex + 1 < DEMO_QUESTIONS.length) {
      setScore(nextScore);
      setCurrentIndex((i) => i + 1);
      return;
    }

    const percentage = Math.round((nextScore / DEMO_QUESTIONS.length) * 100);
    setFinalScore(percentage);
    setView(percentage >= 60 ? "pass" : "fail");
  }

  if (view === "intro") {
    return (
      <main className="max-w-xl mx-auto px-6 py-16 text-center">
        <h1 className="mb-4">Questionnaire de Certification JEB</h1>
        <p className="font-body text-[15px] leading-6 text-text mb-3">
          Ce questionnaire évalue vos aptitudes professionnelles transversales : communication,
          organisation, adaptabilité. Il comprend {TOTAL_QUESTIONS} questions. Votre progression est
          sauvegardée automatiquement — vous pouvez reprendre à tout moment.
        </p>
        <p className="text-text-secondary text-sm mb-6">⏱ Durée estimée : 30 à 45 minutes</p>
        <Button variant="primary" onClick={start}>
          Commencer le questionnaire
        </Button>
        <p className="text-text-secondary text-xs mt-4">
          Démo : {DEMO_QUESTIONS.length} questions d&apos;exemple (pas encore de banque de{" "}
          {TOTAL_QUESTIONS} questions ni de sauvegarde côté serveur).
        </p>
      </main>
    );
  }

  if (view === "question") {
    const question = DEMO_QUESTIONS[currentIndex];
    return (
      <main className="max-w-xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[13px] font-bold text-primary">
            {currentIndex + 1}/{DEMO_QUESTIONS.length}
          </span>
        </div>
        <div className="mb-6">
          <ProgressBar current={currentIndex + 1} total={DEMO_QUESTIONS.length} />
        </div>
        <p className="text-xs text-text-secondary mb-1">Question {currentIndex + 1}</p>
        <h3 className="mb-5">{question.text}</h3>
        <div className="flex flex-col gap-2.5">
          {question.options.map((option, index) => (
            <button
              key={option}
              type="button"
              onClick={() => answer(index)}
              className="text-left border border-border rounded-md px-4 py-3 text-sm hover:border-primary hover:bg-bg-secondary"
            >
              {option}
            </button>
          ))}
        </div>
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
        <p className="font-bold text-text mb-1.5">Score final : {finalScore}/100</p>
        <p className="text-text-secondary mb-6">Votre badge est maintenant affiché sur votre profil.</p>
        <div className="flex gap-3 justify-center">
          <Link href="/" className={buttonClasses("primary")}>
            Voir mon profil
          </Link>
          <Button variant="secondary">Partager mon badge</Button>
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
      <p className="font-bold text-text mb-1.5">Score final : {finalScore}/100</p>
      <p className="text-text-secondary mb-6">Vous pouvez repasser le questionnaire dans 30 jours.</p>
      <Link href="/" className={buttonClasses("secondary")}>
        Retour à mon profil
      </Link>
    </main>
  );
}
