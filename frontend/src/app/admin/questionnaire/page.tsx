"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { usePageTitle } from "@/lib/use-page-title";

type QuizQuestion = {
  id: string;
  text: string;
  weight: number;
};

// Données de démonstration — le modèle Prisma Question/Option existe déjà
// côté backend, mais aucune route CRUD n'est exposée (voir résumé final).
const DEMO_QUESTIONS: QuizQuestion[] = [
  { id: "1", text: "Face à un désaccord de méthode en équipe...", weight: 3 },
  { id: "2", text: "Un client vous fait une remarque désagréable...", weight: 2 },
  { id: "3", text: "Vous devez apprendre un nouvel outil rapidement...", weight: 1 },
];

export default function QuestionnaireAdminPage() {
  usePageTitle("Gestion du questionnaire");
  const [selected, setSelected] = useState<QuizQuestion>(DEMO_QUESTIONS[0]);
  const [text, setText] = useState(selected.text);
  const [weight, setWeight] = useState(selected.weight);
  const [notice, setNotice] = useState<string | null>(null);

  function select(question: QuizQuestion) {
    setSelected(question);
    setText(question.text);
    setWeight(question.weight);
    setNotice(null);
  }

  function handleSave() {
    setNotice(
      "L'enregistrement n'est pas encore connecté au serveur — aucune route CRUD n'existe pour les questions (voir résumé final)."
    );
  }

  return (
    <main className="px-6 py-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
        <h2>Gestion du questionnaire</h2>
        <Button variant="primary" className="self-start sm:self-auto">
          Ajouter une question
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-5">
        <div className="flex-1 bg-white rounded-lg shadow-card overflow-hidden">
          {DEMO_QUESTIONS.map((question) => (
            <div
              key={question.id}
              className="flex gap-2.5 items-center px-4 py-3 border-b border-border last:border-b-0 text-[13px]"
            >
              <span className="text-text-secondary">#{question.id}</span>
              <span className="flex-1">{question.text}</span>
              <span className="text-text-secondary">poids {question.weight}</span>
              <Button variant="secondary" size="sm" onClick={() => select(question)}>
                Modifier
              </Button>
            </div>
          ))}
        </div>

        <div className="flex-1 bg-white rounded-lg shadow-card p-4">
          <label className="block text-[13px] font-semibold text-text font-heading mb-1.5">
            Texte de la question
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full h-16 border border-border rounded-md px-3 py-2 text-[13px] mb-3"
          />
          <label className="block text-[13px] font-semibold text-text font-heading mb-1.5">
            Pondération (1-5)
          </label>
          <input
            type="number"
            min={1}
            max={5}
            value={weight}
            onChange={(e) => setWeight(Number(e.target.value))}
            className="w-20 border border-border rounded-md px-3 py-2 text-[13px] mb-3"
          />
          <label className="block text-[13px] font-semibold text-text font-heading mb-1.5">
            Options de réponse
          </label>
          <div className="flex gap-1.5 items-center mb-1.5">
            <input type="radio" name="correct-option" />
            <input className="flex-1 border border-border rounded-md px-2.5 py-1.5 text-[13px]" />
          </div>
          <div className="flex gap-1.5 items-center mb-3">
            <input type="radio" name="correct-option" />
            <input className="flex-1 border border-border rounded-md px-2.5 py-1.5 text-[13px]" />
          </div>
          {notice && <p className="text-error text-xs mb-3">{notice}</p>}
          <Button variant="primary" size="sm" onClick={handleSave}>
            Enregistrer la question
          </Button>
        </div>
      </div>
    </main>
  );
}
