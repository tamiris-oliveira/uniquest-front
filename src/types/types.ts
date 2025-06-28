export interface Group {
  id: number;
  name: string;
  invite_code: string;
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
    user_id: number;
    group_ids: number[];   
  };
}

export interface Alternative {
  id: number;
  text: string;
  correct: boolean;
  question_id: number;
  created_at?: string;
  updated_at?: string;
}

export interface Subject {
  id: number;
  name: string;
}

