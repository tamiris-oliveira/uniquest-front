export interface Group {
  id: string | number;
  name: string;
  invite_code: string;
}

export interface User {
  id: string | number;
  name: string;
  email: string;
  role: number;
  avatar?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Question {
  id: string | number;
  statement: string;
  question_type: string;
  justification: string;
  user: User;
  subject_id: string | number;
  alternatives: Alternative[];
}

export interface Simulation {
  id: string | number;              
  title: string;
  description: string;
  creation_date: string; 
  deadline: string;
  time_limit: number, 
  max_attempts: number,
  user_id: string | number;
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
    user_id: string | number;
    group_ids: (string | number)[];
    question_ids: (string | number)[];   
  };
}

export interface SimulationForm {
  title: string;
  description: string;
  deadline: string;
  max_attempts: number;
  time_limit: number;
  user_id: string | number;
  group_ids: (string | number)[];
  question_ids: (string | number)[];
}

export interface Alternative {
  id?: string | number;
  text: string;
  correct: boolean;
  question_id?: string | number;
  created_at?: string;
  updated_at?: string;
}

export interface Subject {
  id: string | number;
  name: string;
}

export interface Attempt {
  id: string | number;
  attempt_date: string; 
  final_grade: number;
  simulation_id: string | number;
  user_id: string | number;
  created_at: string;
  updated_at: string;
}

export interface AttemptWithAnswers {
  id: string | number;
  attempt_date: string;

  user: User;

  simulation: {
    id: string | number;
    title: string;
    deadline: string;
  };

  answers: {
    id: string | number;
    student_answer: string;
    correct: boolean | null;

    question: {
      id: string | number;
      statement: string;
      question_type: "Objetiva" | "Discursiva";
      alternatives: {
        id: string | number;
        text: string;
        correct: boolean;
      }[];
    };
  }[];
}

export type SimulationWithAttempts = {
  id: string | number;
  title: string;
  attempts: {
    id: string | number;
    user: User;
    attempt_date: string;
    answers: Answer[];
  }[];
}[];


export interface Answer {
  id: string | number;
  student_answer: string;
  correct: boolean | null;
  question_id: string | number;
  question: Question,
  attempt_id: string | number;
  created_at: string;
  updated_at: string;
  corrections: Correction[];
}

export interface AnswerData {
  id: string | number;
  student_answer: string;
  attempt: {
    attempt_date: string;
    simulation: {
      id: string | number;
      title: string;
    };
    user: {
      id: string | number;
      name: string;
    };
  };
}

export interface SubmitAnswer {
  question_id: string | number;
  student_answer: string;
}

export interface Correction {
  id: string | number;
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
  group_id: string | number;
  group_name: string;
  students_count: number;
  total_attempts: number;
  total_correct_answers: number;
  total_incorrect_answers: number;
  total_manual_grade: number;
  total_grade: number;
  ranking: {
    user_id: string | number;
    name: string;
    avg_grade: number;
  }[];
  most_difficult_questions: {
    question_id: string | number;
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