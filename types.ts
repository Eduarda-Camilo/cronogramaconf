
export enum EventType {
  ROTINA = 'Rotina',
  REFEICOES = 'Refeições',
  ATIVIDADES = 'Atividades',
  MENSAGENS = 'Mensagens'
}

export interface ParallelSession {
  audience: 'Jovens' | 'Adolescentes' | 'Todos';
  title: string;
  speaker?: string;
}

export interface ScheduleEvent {
  id: string;
  startTime: string;
  endTime: string;
  title: string;
  type: EventType;
  sessions?: ParallelSession[];
  location?: string;
}

export interface DaySchedule {
  id: string;
  date: string;
  weekday: string;
  events: ScheduleEvent[];
}
