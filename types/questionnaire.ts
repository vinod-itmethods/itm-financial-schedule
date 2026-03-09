// ─── Questionnaire Record (saved per customer) ───────────────────────────────

/** answers[toolId][questionId] = answer string */
export type QuestionnaireAnswers = Record<string, Record<string, string>>;

export interface QuestionnaireRecord {
  id: string;
  clientName: string;
  projectName: string;
  date: string;          // ISO date
  answers: QuestionnaireAnswers;
  notes: string;         // general pre-sales notes
  createdAt: string;
  updatedAt: string;
}

export interface QuestionnaireListItem {
  id: string;
  clientName: string;
  projectName: string;
  updatedAt: string;
}
