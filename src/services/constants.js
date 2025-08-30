const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const ApiRoutes = {
  // --- Autenticação ---
  LOGIN: `${BASE_URL}/login`,

  // --- Usuários e Perfil ---
  USERS: `${BASE_URL}/users`,
  USER: (id) => `${BASE_URL}/users/${id}`,
  PROFILE: `${BASE_URL}/profile`,
  
  // --- Aprovação de Usuários ---
  USER_APPROVALS: `${BASE_URL}/user_approvals`,
  USER_APPROVE: (id) => `${BASE_URL}/user_approvals/${id}/approve`,
  USER_REJECT: (id) => `${BASE_URL}/user_approvals/${id}/reject`,
  REQUEST_TEACHER_ROLE: `${BASE_URL}/user_approvals/request_teacher_role`,

  // --- Turmas (Groups) ---
  GROUPS: `${BASE_URL}/groups`,
  ADD_USER_TO_GROUP: (id) => `${BASE_URL}/groups/${id}/add_user`,

  // --- Simulados ---
  SIMULATIONS: `${BASE_URL}/simulations`,
  SIMULATION: (id) => `${BASE_URL}/simulations/${id}`,
  SIMULATION_GROUPS: (simulationId) => `${BASE_URL}/simulations/${simulationId}/groups`,
  ASSIGN_GROUPS_TO_SIMULATION: (simulationId) => `${BASE_URL}/simulations/${simulationId}/assign_groups`,

  // --- Questões ---
  QUESTIONS: `${BASE_URL}/questions`,
  QUESTION: (id) => `${BASE_URL}/questions/${id}`,
  ALTERNATIVES: (questionId) => `${BASE_URL}/questions/${questionId}/alternatives`,

  // --- Tentativas (Attempts) e Correções ---
  ATTEMPTS: `${BASE_URL}/attempts`,
  ATTEMPT: (id) => `${BASE_URL}/attempts/${id}`,
  ANSWERS: (attemptId) => `${BASE_URL}/attempts/${attemptId}/answers`,
  ANSWER: (answerId) => `${BASE_URL}/answers/${answerId}`,
  CORRECTIONS: (answerId) => `${BASE_URL}/answers/${answerId}/corrections`,
  CORRECTION: (correctionId) => `${BASE_URL}/corrections/${correctionId}`,
  
  // --- Notificações ---
  NOTIFICATIONS: `${BASE_URL}/notifications`,

  // --- Matérias (Subjects) ---
  SUBJECTS: `${BASE_URL}/subjects`,

  // --- Cursos ---
  COURSES: `${BASE_URL}/courses`,
  COURSE: (id) => `${BASE_URL}/courses/${id}`,
  COURSE_USERS: (courseId) => `${BASE_URL}/courses/${courseId}/users`,

  // --- NOVAS ROTAS DE RELATÓRIOS OTIMIZADOS 📊 ---

  // Relatórios para Alunos
  REPORTS_STUDENT_EVOLUTION: `${BASE_URL}/reports/student/performance_evolution`,
  REPORTS_STUDENT_SUBJECT_PERFORMANCE: `${BASE_URL}/reports/student/subject_performance`,

  // Relatórios para Professores
  REPORTS_TEACHER_GROUP_SUMMARY: (groupId) => `${BASE_URL}/reports/teacher/group_summary/${groupId}`,
  REPORTS_TEACHER_SIMULATION_DETAILS: (simulationId) => `${BASE_URL}/reports/teacher/simulation_details/${simulationId}`,
  REPORTS_TEACHER_GROUPS_COMPARISON: `${BASE_URL}/reports/teacher/groups_comparison`,
};

export default ApiRoutes;