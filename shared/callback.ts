export function withoutCallbackConsent<T extends Record<string, unknown>>(body: T): T {
  const quizAnswers = body.quizAnswers && typeof body.quizAnswers === "object" && !Array.isArray(body.quizAnswers)
    ? { ...body.quizAnswers as Record<string, unknown> }
    : {};
  // Website forms do not request AI calls, including submissions from stale tabs.
  delete quizAnswers.aiSalesCallbackConsent;
  return { ...body, callbackConsent: undefined, quizAnswers };
}
