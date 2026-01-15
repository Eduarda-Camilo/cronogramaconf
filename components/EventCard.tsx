
import React from 'react';
import { ScheduleEvent, EventType } from '../types';

interface EventCardProps {
  event: ScheduleEvent;
}

const getIcon = (type: EventType, title: string) => {
  const t = title.toLowerCase();
  if (type === EventType.TRANSPORTE || t.includes('ônibus')) return 'directions_bus';
  if (t.includes('abertura')) return 'celebration';
  if (t.includes('café') || t.includes('almoço') || t.includes('jantar') || t.includes('lanche')) return 'restaurant';
  if (t.includes('banho')) return 'shower';
  if (t.includes('mensagem') || t.includes('leitura') || t.includes('bíblica')) return 'menu_book';
  if (t.includes('despertar') || t.includes('oração') || t.includes('monitores')) return 'schedule';
  if (t.includes('gincana') || t.includes('atividade')) return 'sports_esports';
  if (t.includes('batismo')) return 'waves';
  return 'event';
};

const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const icon = getIcon(event.type, event.title);
  const isParallel = event.sessions && event.sessions.length > 0;

  return (
    <div 
      className={`relative w-full rounded-2xl p-4 mb-4 shadow-sm border-l-[4px] flex flex-col transition-all cursor-pointer bg-white dark:bg-conf-wine-card hover:shadow-md ${
        event.type === EventType.MENSAGENS ? 'border-emerald-500' : 
        event.type === EventType.REFEICOES ? 'border-blue-400' :
        event.type === EventType.ATIVIDADES ? 'border-amber-400' :
        event.type === EventType.TRANSPORTE ? 'border-purple-400' :
        'border-slate-200 dark:border-conf-wine/30'
      }`}
    >
      <div className="flex justify-between items-center mb-2">
        <span className="text-[10px] font-bold text-slate-400 dark:text-conf-beige/50 tracking-wider font-poppins">
          {event.startTime} — {event.endTime}
        </span>
        <span className="material-symbols-outlined text-slate-300 dark:text-conf-beige/20 text-xl">
          {icon}
        </span>
      </div>

      <h3 className="text-lg font-bold text-slate-800 dark:text-conf-beige leading-tight font-poppins uppercase tracking-tight mb-3">
        {event.title}
      </h3>

      {isParallel && (
        <div className="flex flex-col gap-2">
          {event.sessions?.map((session, idx) => (
            <div 
              key={idx} 
              className="bg-slate-50 dark:bg-conf-wine-darker/60 rounded-xl p-3 border border-slate-100 dark:border-conf-wine/20 shadow-[0_1px_4px_rgba(0,0,0,0.02)] flex flex-col"
            >
              <span className={`text-[8px] font-bold uppercase tracking-[0.15em] mb-1 ${
                session.audience === 'Jovens' ? 'text-emerald-600 dark:text-emerald-400' : 
                session.audience === 'Adolescentes' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-conf-beige/50'
              }`}>
                {session.audience}
              </span>
              <h4 className="text-sm font-bold text-slate-800 dark:text-conf-beige leading-snug font-poppins uppercase tracking-wide">
                {session.title}
              </h4>
              {session.speaker && (
                <p className="text-[11px] font-medium text-slate-400 dark:text-conf-beige/60 italic mt-0.5 font-sans">
                  {session.speaker}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventCard;
