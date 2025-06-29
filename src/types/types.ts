export interface Group {
  id: number;
  name: string;
  invite_code: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: number;
  avatar?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Question {
  id: number;
  statement: string;
  question_type: string;
  justification: string;
  user_id: number;
  subject_id: number;
  alternatives: Alternative[];
}

export interface Simulation {
  id: number;              
  title: string;
  description: string;
  creation_date: string; 
  deadline: string;
  time_limit: number, 
  max_attempts: number,
  user_id: number;
  groups: Group[];         
  questions: Question[];   
}

export interface SimulationPayload {
  simulation: {
    title: string;
    description: string;
    creation_date: string; 
    deadline: string; 
    time_limit: number, 
    max_attempts: number,
    user_id: number;
    group_ids: number[];
    question_ids: number[];   
  };
}

export interface SimulationForm {
  title: string;
  description: string;
  deadline: string;
  max_attempts: number;
  time_limit: number;
  user_id: number;
  group_ids: number[];
  question_ids: number[];
}

export interface Alternative {
  id?: number;
  text: string;
  correct: boolean;
  question_id?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Subject {
  id: number;
  name: string;
}

export interface Attempt {
  id: number;
  attempt_date: string; 
  final_grade: number;
  simulation_id: number;
  user_id: number;
  created_at: string;
  updated_at: string;
}

export interface AttemptWithAnswers {
  id: number;
  attempt_date: string;

  user: User;

  simulation: {
    id: number;
    title: string;
    deadline: string;
  };

  answers: {
    id: number;
    student_answer: string;
    correct: boolean | null;

    question: {
      id: number;
      statement: string;
      question_type: "Objetiva" | "Discursiva";
      alternatives: {
        id: number;
        text: string;
        correct: boolean;
      }[];
    };
  }[];
}

export type SimulationWithAttempts = {
  id: number;
  title: string;
  attempts: {
    id: number;
    user: User;
    attempt_date: string;
    answers: Answer[];
  }[];
}[];


export interface Answer {
  id: number;
  student_answer: string;
  correct: boolean | null;
  question_id: number;
  question: Question,
  attempt_id: number;
  created_at: string;
  updated_at: string;
  corrections: Correction[];
}

export interface AnswerData {
  id: number;
  student_answer: string;
  attempt: {
    attempt_date: string;
    simulation: {
      id: number;
      title: string;
    };
    user: {
      id: number;
      name: string;
    };
  };
}

export interface SubmitAnswer {
  question_id: number;
  student_answer: string;
}

export interface Correction {
  id: number;
  grade: number | null;
  feedback: string | null;
  created_at: string;
}

export interface GeneralReport {
  total_attempts: number;
  total_correct_answers: number;
  total_incorrect_answers: number;
  total_manual_grade: number;
  total_grade: number;
  evolution: {
    date: string; // ISO format: "2025-06-29"
    correct: number;
    incorrect: number;
    manual_grade: number;
    total_grade: number;
  }[];
}


export interface SubjectReport {
  subject_name: string;
  correct_answers: number;
  incorrect_answers: number;
  manual_total_grade: number;
  manual_average: number;
  total_questions: number;
}


export interface GroupReport {
  group_id: number;
  group_name: string;
  students_count: number;
  total_attempts: number;
  total_correct_answers: number;
  total_incorrect_answers: number;
  total_manual_grade: number;
  total_grade: number;
  ranking: {
    user_id: number;
    name: string;
    avg_grade: number;
  }[];
  most_difficult_questions: {
    question_id: number;
    statement: string;
    correct: number;
    incorrect: number;
    total: number;
    error_rate: number;
  }[];
}



export const questionTypes = [
  { value: "Objetiva", label: "Múltipla escolha" },
  { value: "Discursiva", label: "Dissertativa" },
];

export const avatarPlaceholder = "https://www.gravatar.com/avatar/?d=mp&f=y";