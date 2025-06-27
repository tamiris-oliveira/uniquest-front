export interface Simulation {
  title: string;
  description: string;
  creation_date: string; 
  deadline: string; 
  user_id: number;
  group_id: number[];
}

export interface SimulationPayload {
  simulation: Simulation;
}
