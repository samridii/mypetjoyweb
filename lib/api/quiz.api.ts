// lib/api/quiz.api.ts
import api from "./axios";
import { API } from "./endpoint";

export const submitQuiz = (answers: Record<string, string>) =>
  api.post<{ success: boolean; recommendation: string }>(API.QUIZ.SUBMIT, answers);