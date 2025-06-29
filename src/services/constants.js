const BASE_URL = process.env.NEXT_PUBLIC_API_URL

export const ApiRoutes = {
  LOGIN: `${BASE_URL}/login`,

  USERS: `${BASE_URL}/users`,
  USER: (id) => `${BASE_URL}/users/${id}`,
  PROFILE: `${BASE_URL}/profile`,

  GROUPS: `${BASE_URL}/groups`,
  ADD_USER_TO_GROUP: (id) => `${BASE_URL}/groups/${id}/add_user`,

  SIMULATIONS: `${BASE_URL}/simulations`,
  SIMULATION: (id) => `${BASE_URL}/simulations/${id}`,
  SIMULATION_GROUPS: (simulationId) => `${BASE_URL}/simulations/${simulationId}/groups`,
  ASSIGN_GROUPS_TO_SIMULATION: (simulationId) => `${BASE_URL}/simulations/${simulationId}/assign_groups`,

  QUESTIONS: `${BASE_URL}/questions`,
  QUESTION: (id) => `${BASE_URL}/questions/${id}`,
  ALTERNATIVES: (questionId) => `${BASE_URL}/questions/${questionId}/alternatives`,

  ATTEMPTS: `${BASE_URL}/attempts`,
  ATTEMPT: (id) => `${BASE_URL}/attempts/${id}`,
  ANSWERS: (attemptId) => `${BASE_URL}/attempts/${attemptId}/answers`,
  ANSWER: (answerId) => `${BASE_URL}/answers/${answerId}`,
  CORRECTIONS: (answerId) => `${BASE_URL}/answers/${answerId}/corrections`,
  CORRECTION: (correctionId) => `${BASE_URL}/corrections/${correctionId}`,

  NOTIFICATIONS: `${BASE_URL}/notifications`,
  REPORTS: `${BASE_URL}/reports`,
  REPORTS_BY_SUBJECT: `${BASE_URL}/reports/performance_by_subject`,
  REPORTS_BY_GROUP: `${BASE_URL}/reports/group_performance`,
  REPORTS_SUMMARY: `${BASE_URL}/reports/performance_summary`,


  SUBJECTS: `${BASE_URL}/subjects`,
};

export default ApiRoutes;
