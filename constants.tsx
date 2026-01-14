import { DaySchedule, EventType } from './types';

export const CATEGORY_STYLES = {
  [EventType.ROTINA]: {
    color: 'bg-slate-500',
    textColor: 'text-slate-600',
    border: 'border-slate-400',
    icon: 'schedule'
  },
  [EventType.REFEICOES]: {
    color: 'bg-blue-500',
    textColor: 'text-blue-600',
    border: 'border-blue-400',
    icon: 'restaurant'
  },
  [EventType.ATIVIDADES]: {
    color: 'bg-amber-500',
    textColor: 'text-amber-600',
    border: 'border-amber-400',
    icon: 'sports_esports'
  },
  [EventType.MENSAGENS]: {
    color: 'bg-emerald-500',
    textColor: 'text-emerald-600',
    border: 'border-emerald-400',
    icon: 'menu_book'
  }
};

export const SCHEDULE_DATA: DaySchedule[] = [
  {
    id: 'day1',
    date: '15/01',
    weekday: 'Qui',
    events: [
      { id: '1-1', startTime: '08:00', endTime: '09:30', title: 'Recepção e café da manhã', type: EventType.REFEICOES },
      { id: '1-2', startTime: '09:30', endTime: '12:00', title: 'Abertura da Conferência', type: EventType.MENSAGENS },
      { id: '1-3', startTime: '12:30', endTime: '14:00', title: 'Almoço', type: EventType.REFEICOES },
      { id: '1-4', startTime: '14:00', endTime: '16:00', title: 'Atividade especial + Reunião de monitores', type: EventType.ATIVIDADES },
      { id: '1-5', startTime: '16:00', endTime: '18:30', title: 'Banho', type: EventType.ROTINA },
      { id: '1-6', startTime: '18:30', endTime: '19:30', title: 'Jantar', type: EventType.REFEICOES },
      { 
        id: '1-7', 
        startTime: '19:30', 
        endTime: '21:30', 
        title: 'Mensagem 1', 
        type: EventType.MENSAGENS,
        sessions: [
          { audience: 'Jovens', title: 'Comprados pelo mais alto preço', speaker: 'Cezar Menegucci' },
          { audience: 'Adolescentes', title: 'Comprados pelo mais alto preço', speaker: 'Josimar Cruz' }
        ]
      },
      { id: '1-8', startTime: '21:30', endTime: '22:00', title: 'Lanche', type: EventType.REFEICOES },
      { id: '1-9', startTime: '22:00', endTime: '22:45', title: 'Livre / Convivência', type: EventType.ROTINA },
      { id: '1-10', startTime: '22:45', endTime: '23:30', title: 'Deslocamento para quartos', type: EventType.ROTINA },
      { id: '1-11', startTime: '23:30', endTime: '00:00', title: 'Oração e apagar as luzes', type: EventType.ROTINA },
    ]
  },
  {
    id: 'day2',
    date: '16/01',
    weekday: 'Sex',
    events: [
      { id: '2-1', startTime: '07:00', endTime: '08:00', title: 'Despertar', type: EventType.ROTINA },
      { id: '2-2', startTime: '08:00', endTime: '09:30', title: 'Café da manhã', type: EventType.REFEICOES },
      { id: '2-3', startTime: '09:30', endTime: '10:00', title: 'Leitura Bíblica', type: EventType.MENSAGENS },
      { 
        id: '2-4', 
        startTime: '10:00', 
        endTime: '12:00', 
        title: 'Mensagem 2', 
        type: EventType.MENSAGENS,
        sessions: [
          { audience: 'Jovens', title: 'Templo do Espírito Santo', speaker: 'David Ma' },
          { audience: 'Adolescentes', title: 'Templo do Espírito Santo', speaker: 'Daniel Melo' }
        ]
      },
      { id: '2-5', startTime: '12:30', endTime: '14:00', title: 'Almoço', type: EventType.REFEICOES },
      { id: '2-6', startTime: '14:00', endTime: '16:00', title: 'Gincana Adolescentes + Atividade Jovens', type: EventType.ATIVIDADES },
      { id: '2-7', startTime: '16:00', endTime: '18:30', title: 'Banho', type: EventType.ROTINA },
      { id: '2-8', startTime: '18:30', endTime: '19:30', title: 'Jantar', type: EventType.REFEICOES },
      { 
        id: '2-9', 
        startTime: '19:30', 
        endTime: '21:30', 
        title: 'Mensagem 3', 
        type: EventType.MENSAGENS,
        sessions: [
          { audience: 'Jovens', title: 'Sacerdócio Real', speaker: 'Felipe Salgueiro' },
          { audience: 'Adolescentes', title: 'Sacerdócio Real', speaker: 'Webert Miranda' }
        ]
      },
      { id: '2-10', startTime: '21:30', endTime: '22:00', title: 'Lanche', type: EventType.REFEICOES },
      { id: '2-11', startTime: '22:00', endTime: '22:45', title: 'Livre / Convivência', type: EventType.ROTINA },
      { id: '2-12', startTime: '22:45', endTime: '23:30', title: 'Deslocamento para quartos', type: EventType.ROTINA },
      { id: '2-13', startTime: '23:30', endTime: '00:00', title: 'Oração e apagar as luzes', type: EventType.ROTINA },
    ]
  },
  {
    id: 'day3',
    date: '17/01',
    weekday: 'Sáb',
    events: [
      { id: '3-1', startTime: '07:00', endTime: '08:00', title: 'Despertar', type: EventType.ROTINA },
      { id: '3-2', startTime: '08:00', endTime: '09:30', title: 'Café da manhã', type: EventType.REFEICOES },
      { id: '3-3', startTime: '09:30', endTime: '10:00', title: 'Leitura Bíblica', type: EventType.MENSAGENS },
      { 
        id: '3-4', 
        startTime: '10:00', 
        endTime: '12:30', 
        title: 'Mensagem 4', 
        type: EventType.MENSAGENS,
        sessions: [
          { audience: 'Jovens', title: 'Vós sois embaixadores Dele', speaker: 'Ulisses Jardim' },
          { audience: 'Adolescentes', title: 'Vós sois embaixadores Dele', speaker: 'João Miguel Jr' }
        ]
      },
      { id: '3-5', startTime: '12:30', endTime: '13:30', title: 'Almoço', type: EventType.REFEICOES },
      { id: '3-6', startTime: '13:30', endTime: '14:00', title: 'Batismo', type: EventType.ATIVIDADES },
      { id: '3-7', startTime: '14:00', endTime: '16:00', title: 'Gincana Jovens + Atividade Adolescentes', type: EventType.ATIVIDADES },
      { id: '3-8', startTime: '16:00', endTime: '18:30', title: 'Banho', type: EventType.ROTINA },
      { id: '3-9', startTime: '18:30', endTime: '19:30', title: 'Jantar', type: EventType.REFEICOES },
      { 
        id: '3-10', 
        startTime: '19:30', 
        endTime: '21:30', 
        title: 'Mensagem 5', 
        type: EventType.MENSAGENS,
        sessions: [
          { audience: 'Jovens', title: 'Discípulos de Jesus', speaker: 'Eduardo Fuzaro' },
          { audience: 'Adolescentes', title: 'Discípulos de Jesus', speaker: 'Mateus Tonisso' }
        ]
      },
      { id: '3-11', startTime: '21:30', endTime: '22:00', title: 'Lanche', type: EventType.REFEICOES },
      { id: '3-12', startTime: '22:00', endTime: '22:45', title: 'Livre / Convivência / Louvor', type: EventType.ROTINA },
      { id: '3-13', startTime: '22:45', endTime: '23:30', title: 'Deslocamento para quartos', type: EventType.ROTINA },
      { id: '3-14', startTime: '23:30', endTime: '00:00', title: 'Oração e apagar as luzes', type: EventType.ROTINA },
    ]
  },
  {
    id: 'day4',
    date: '18/01',
    weekday: 'Dom',
    events: [
      { id: '4-1', startTime: '07:00', endTime: '08:00', title: 'Despertar', type: EventType.ROTINA },
      { id: '4-2', startTime: '08:00', endTime: '09:30', title: 'Café da manhã', type: EventType.REFEICOES },
      { 
        id: '4-3', 
        startTime: '10:00', 
        endTime: '12:00', 
        title: 'Mensagem 6', 
        type: EventType.MENSAGENS,
        sessions: [
          { audience: 'Todos', title: 'Sereis minhas testemunhas', speaker: 'Miguel Ma' }
        ]
      },
      { id: '4-4', startTime: '12:00', endTime: '13:30', title: 'Almoço', type: EventType.REFEICOES },
    ]
  }
];