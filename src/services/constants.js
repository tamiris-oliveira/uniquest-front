const BASE_URL = process.env.NEXT_PUBLIC_API_URL

export const ApiRoutes = {
  LOGIN: `${BASE_URL}/login`,

  USERS: `${BASE_URL}/users`,
  USER: (id) => `${BASE_URL}/users/${id}`,

  GROUPS: `${BASE_URL}/groups`,
  ADD_USER_TO_GROUP: (id) => `${BASE_URL}/groups/${id}/add_user`,

  SIMULATIONS: `${BASE_URL}/simulations`,
  SIMULATION: (id) => `${BASE_URL}/simulations/${id}`,
  QUESTIONS: (simulationId) => `${BASE_URL}/simulations/${simulationId}/questions`,

  QUESTION: (id) => `${BASE_URL}/questions/${id}`,
  ALTERNATIVES: (questionId) => `${BASE_URL}/questions/${questionId}/alternatives`,

  ATTEMPTS: `${BASE_URL}/attempts`,
  ATTEMPT: (id) => `${BASE_URL}/attempts/${id}`,
  ANSWERS: (attemptId) => `${BASE_URL}/attempts/${attemptId}/answers`,
  CORRECTIONS: (answerId) => `${BASE_URL}/answers/${answerId}/corrections`,

  NOTIFICATIONS: `${BASE_URL}/notifications`,
  REPORTS: `${BASE_URL}/reports`
};

export default ApiRoutes;
