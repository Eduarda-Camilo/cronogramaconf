
import React from 'react';
import { ScheduleEvent, EventType } from '../types';
import { CATEGORY_STYLES } from '../constants';

interface EventCardProps {
  event: ScheduleEvent;
}

const getIcon = (type: EventType, title: string) => {
  const t = title.toLowerCase();
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
      className={`relative w-full rounded-3xl p-5 mb-4 shadow-sm border-l-[6px] flex flex-col transition-all cursor-pointer bg-white dark:bg-slate-900 hover:shadow-md ${
        event.type === EventType.MENSAGENS ? 'bg-emerald-50/30 dark:bg-emerald-950/20 border-emerald-400' : 
        event.type === EventType.REFEICOES ? 'bg-blue-50/30 dark:bg-blue-950/20 border-blue-400' :
        event.type === EventType.ATIVIDADES ? 'bg-amber-50/30 dark:bg-amber-950/20 border-amber-400' :
        'border-slate-200 dark:border-slate-700'
      }`}
    >
      <div className="flex justify-between items-center mb-3">
        <span className="text-xs font-black text-slate-500 dark:text-slate-400 tracking-tight">
          {event.startTime} — {event.endTime}
        </span>
        <span className="material-symbols-outlined text-slate-400 dark:text-slate-500 text-xl">
          {icon}
        </span>
      </div>

      {!isParallel && (
        <h3 className="text-xl font-black text-slate-800 dark:text-white leading-tight">
          {event.title}
        </h3>
      )}

      {isParallel && (
        <div className="flex flex-col gap-3">
          {event.sessions?.map((session, idx) => (
            <div 
              key={idx} 
              className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col"
            >
              <div className="flex justify-between items-center mb-1.5">
                <span className={`text-[9px] font-black uppercase tracking-widest ${
                  session.audience === 'Jovens' ? 'text-emerald-600 dark:text-emerald-400' : 
                  session.audience === 'Adolescentes' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500'
                }`}>
                  {session.audience}
                </span>
                <span className="material-symbols-outlined text-slate-300 text-sm">play_circle</span>
              </div>
              <h4 className="text-base font-extrabold text-slate-800 dark:text-white leading-tight">
                {session.title}
              </h4>
              {session.speaker && (
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 italic mt-1">
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
