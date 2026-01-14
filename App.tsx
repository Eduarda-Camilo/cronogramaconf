
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { SCHEDULE_DATA } from './constants';
import EventCard from './components/EventCard';
import { ScheduleEvent, EventType, ParallelSession } from './types';

const App: React.FC = () => {
  const [activeDayId, setActiveDayId] = useState<string | 'all'>(SCHEDULE_DATA[0].id);
  const [hoveredDayId, setHoveredDayId] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null);
  const [activeCategory, setActiveCategory] = useState<EventType | 'Tudo'>('Tudo');
  const exportRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const PIXELS_PER_HOUR = 60;
  const PIXELS_PER_30MIN = PIXELS_PER_HOUR / 2;

  // URL da imagem convertida para garantir que carregue (usando o link de anexo que costuma ser mais estável em ambientes de preview)
  const LOGO_URL = "https://files.oaiusercontent.com/file-K7TjXAnD6XpA9r87mF49uK?se=2025-01-30T14%3A50%3A59Z&sp=r&sv=2024-08-04&sr=b&rscc=max-age%3D604800%2C%20immutable%2C%20private&rscd=attachment%3B%20filename%3D45f28464-90a6-4b8c-8f15-8948197171e0.webp&sig=G06lWcbeR2/AEvp8V3H1I8Tz9eYd0oW9F/r8zT/Ue88%3D";

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const scrollToNow = () => {
      const hours = currentTime.getHours();
      const minutes = currentTime.getMinutes();
      if (hours >= 7 && hours < 24) {
        const topPos = (hours - 7) * PIXELS_PER_HOUR + (minutes / 60) * PIXELS_PER_HOUR;
        if (activeDayId === 'all') {
          window.scrollTo({ top: topPos + 300, behavior: 'smooth' });
        } else {
          const line = document.getElementById('current-time-line');
          if (line) line.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    };
    const timeoutId = setTimeout(scrollToNow, 500);
    return () => clearTimeout(timeoutId);
  }, [activeDayId, currentTime, PIXELS_PER_HOUR]);

  const handleExport = async () => {
    if (!exportRef.current) return;
    setIsExporting(true);
    await new Promise(r => setTimeout(r, 150));
    try {
      const canvas = await (window as any).html2canvas(exportRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: document.documentElement.classList.contains('dark') ? '#020617' : '#fffaf0',
        logging: false,
      });
      const link = document.createElement('a');
      link.download = `cronograma-conferencia-2026-${activeDayId}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  const activeDaysToRender = useMemo(() => {
    if (activeDayId === 'all') return SCHEDULE_DATA;
    return SCHEDULE_DATA.filter(d => d.id === activeDayId);
  }, [activeDayId]);

  const getFullWeekday = (weekday: string) => {
    switch (weekday.toLowerCase()) {
      case 'qui': return 'Quinta-feira';
      case 'sex': return 'Sexta-feira';
      case 'sáb': return 'Sábado';
      case 'dom': return 'Domingo';
      default: return weekday;
    }
  };

  const activeTitle = useMemo(() => {
    if (activeDayId === 'all') return 'Cronograma Geral';
    const day = SCHEDULE_DATA.find(d => d.id === activeDayId);
    return day ? `${getFullWeekday(day.weekday)} ${day.date}` : '';
  }, [activeDayId]);

  const getTimePosition = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return (hours - 7) * PIXELS_PER_HOUR + (minutes / 60) * PIXELS_PER_HOUR;
  };

  const currentIndicatorPos = useMemo(() => {
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    if (hours < 7 || hours >= 24) return null;
    return (hours - 7) * PIXELS_PER_HOUR + (minutes / 60) * PIXELS_PER_HOUR;
  }, [currentTime, PIXELS_PER_HOUR]);

  const timeLabels = useMemo(() => {
    const labels = [];
    for (let hour = 7; hour <= 23; hour++) {
      labels.push(`${hour.toString().padStart(2, '0')}:00`);
      labels.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    return labels;
  }, []);

  const handleSessionClick = (e: React.MouseEvent, session: ParallelSession) => {
    e.stopPropagation();
    const youtubeLinks: Record<string, string> = {
      'Jovens': 'https://www.youtube.com/@JovensIgreja',
      'Adolescentes': 'https://www.youtube.com/@AdolescentesIgreja',
      'Todos': 'https://www.youtube.com/@IgrejaGeral'
    };
    window.open(youtubeLinks[session.audience] || 'https://youtube.com', '_blank');
  };

  const categoryLegend = [
    { type: 'Tudo', dot: 'bg-slate-400', activeBg: 'bg-slate-200 dark:bg-slate-700', activeBorder: 'border-slate-400' },
    { type: EventType.MENSAGENS, dot: 'bg-emerald-500', activeBg: 'bg-emerald-100 dark:bg-emerald-900/40', activeBorder: 'border-emerald-500' },
    { type: EventType.REFEICOES, dot: 'bg-blue-500', activeBg: 'bg-blue-100 dark:bg-blue-900/40', activeBorder: 'border-blue-500' },
    { type: EventType.ATIVIDADES, dot: 'bg-amber-500', activeBg: 'bg-amber-100 dark:bg-amber-900/40', activeBorder: 'border-amber-500' },
    { type: EventType.ROTINA, dot: 'bg-slate-500', activeBg: 'bg-slate-200 dark:bg-slate-700', activeBorder: 'border-slate-500' },
  ];

  return (
    <div className="min-h-screen pb-12 bg-conf-cream dark:bg-slate-950 transition-colors font-sans text-slate-900 dark:text-slate-100">
      <header className="w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 pt-6 pb-4">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header Layout: Texto à esquerda, Logo à direita */}
          <div className="flex flex-row items-center justify-between mb-6 gap-4">
            <div className="flex-1 text-left">
              <h1 className="text-sm sm:text-lg font-black text-slate-800 dark:text-white uppercase tracking-tight mb-1">
                Conferência de Adolescentes e Jovens — Jan/2026
              </h1>
              <p className="text-[10px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm">
                Este site é o seu <span className="font-bold text-conf-wine dark:text-conf-beige">GUIA DIGITAL</span> oficial da conferência. 
                Acompanhe os horários em tempo real, verifique os locais, acesse as mensagens no youtube durante todo o evento.
              </p>
            </div>
            
            <div className="w-24 sm:w-40 flex-shrink-0">
              <img 
                src={LOGO_URL} 
                alt="Logo Vós Sois Dele" 
                className="w-full h-auto object-contain dark:invert transition-all grayscale opacity-80 hover:grayscale-0 hover:opacity-100"
                crossOrigin="anonymous"
              />
            </div>
          </div>

          {/* Navegação de Dias */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 justify-start sm:justify-center">
            <button
              onClick={() => setActiveDayId('all')}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all border-2 ${
                activeDayId === 'all' 
                ? 'bg-slate-900 border-slate-900 text-white shadow-lg' 
                : 'bg-white dark:bg-slate-800 border-transparent text-slate-400'
              }`}
            >
              Cronograma Geral
            </button>
            {SCHEDULE_DATA.map(day => (
              <button
                key={day.id}
                onClick={() => setActiveDayId(day.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all border-2 ${
                  activeDayId === day.id 
                  ? 'bg-conf-green border-conf-green text-white shadow-lg' 
                  : 'bg-white dark:bg-slate-800 border-transparent text-slate-400'
                }`}
              >
                {day.weekday} {day.date}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-black text-slate-800 dark:text-white leading-tight">
            {activeTitle}
          </h2>
          <button 
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 bg-conf-wine text-white px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-md hover:bg-red-900 active:scale-95 transition-all disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-sm">{isExporting ? 'sync' : 'download'}</span>
            {isExporting ? 'Processando...' : 'Baixar Cronograma'}
          </button>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categoryLegend.map((cat) => (
            <button
              key={cat.type}
              onClick={() => setActiveCategory(cat.type as any)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 transition-all duration-300 ${
                activeCategory === cat.type 
                  ? `${cat.activeBg} ${cat.activeBorder} scale-105 shadow-md` 
                  : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${cat.dot}`} />
              <span className={`text-[8px] font-black uppercase tracking-widest ${
                activeCategory === cat.type ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'
              }`}>
                {cat.type}
              </span>
            </button>
          ))}
        </div>

        {activeDayId === 'all' ? (
          <div ref={exportRef} className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl overflow-hidden">
            <div className="w-full relative p-2 sm:p-4">
              <div className="flex mb-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="w-12 sm:w-16" />
                {SCHEDULE_DATA.map(day => (
                  <div 
                    key={day.id} 
                    className="flex-1 text-center relative cursor-pointer z-0 h-14 sm:h-16 flex flex-col justify-center items-center"
                    onClick={() => setActiveDayId(day.id)}
                    onMouseEnter={() => setHoveredDayId(day.id)}
                    onMouseLeave={() => setHoveredDayId(null)}
                  >
                    <div 
                      className={`absolute inset-0 m-auto w-12 h-12 sm:w-14 sm:h-14 rounded-full transition-all duration-300 pointer-events-none -z-10 ${
                        hoveredDayId === day.id ? 'bg-conf-wine scale-100 opacity-100' : 'bg-conf-wine scale-50 opacity-0'
                      }`} 
                    />
                    <span className={`block text-[8px] font-black uppercase tracking-widest transition-colors duration-300 relative z-10 ${
                      hoveredDayId === day.id ? 'text-white' : 'text-slate-400'
                    }`}>
                      {day.weekday}
                    </span>
                    <span className={`text-xs sm:text-lg font-black transition-colors duration-300 relative z-10 ${
                      hoveredDayId === day.id ? 'text-white' : 'text-slate-800 dark:text-white'
                    }`}>
                      {day.date}
                    </span>
                  </div>
                ))}
              </div>

              <div className="relative flex">
                <div className="w-12 sm:w-16 flex-shrink-0">
                  {timeLabels.map(label => (
                    <div key={label} style={{ height: `${PIXELS_PER_30MIN}px` }} className="relative">
                      <span className="absolute -top-2 right-2 text-[8px] font-black text-slate-400">
                        {label}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex-1 flex relative">
                  <div className="absolute inset-0 grid grid-rows-[repeat(34,30px)] pointer-events-none">
                    {Array.from({ length: 34 }).map((_, i) => (
                      <div 
                        key={i} 
                        style={{ height: `${PIXELS_PER_30MIN}px` }}
                        className={`border-t ${i % 2 === 0 ? 'border-slate-100 dark:border-slate-800' : 'border-slate-50/30 dark:border-slate-800/30 border-dashed'}`} 
                      />
                    ))}
                  </div>

                  {SCHEDULE_DATA.map(day => (
                    <div 
                      key={day.id} 
                      onMouseEnter={() => setHoveredDayId(day.id)}
                      onMouseLeave={() => setHoveredDayId(null)}
                      style={{ minHeight: `${PIXELS_PER_30MIN * 34}px` }} 
                      className={`flex-1 relative border-l border-slate-100 dark:border-slate-800 cursor-pointer transition-colors duration-300 rounded-xl ${
                        hoveredDayId === day.id ? 'bg-conf-wine/[0.05] dark:bg-conf-wine/[0.1]' : ''
                      }`}
                    >
                      <div className="absolute inset-0 z-0" onClick={() => setActiveDayId(day.id)} />
                      {day.events.map(event => {
                        if (activeCategory !== 'Tudo' && event.type !== activeCategory) return null;
                        const top = getTimePosition(event.startTime);
                        const height = getTimePosition(event.endTime) - top;
                        
                        const isMensagem = event.type === EventType.MENSAGENS;
                        const isRefeicao = event.type === EventType.REFEICOES;
                        const isAtividade = event.type === EventType.ATIVIDADES;
                        
                        const bgColor = isMensagem ? 'bg-emerald-50/50 dark:bg-emerald-950/40' : 
                                      isRefeicao ? 'bg-blue-50/50 dark:bg-blue-950/40' :
                                      isAtividade ? 'bg-amber-50/50 dark:bg-amber-950/40' :
                                      'bg-white dark:bg-slate-800';
                        
                        const borderColor = isMensagem ? 'border-emerald-400' : 
                                         isRefeicao ? 'border-blue-400' :
                                         isAtividade ? 'border-amber-400' :
                                         'border-slate-200 dark:border-slate-700';

                        return (
                          <div 
                            key={event.id}
                            onClick={(e) => { e.stopPropagation(); setSelectedEvent(event); }}
                            className={`absolute left-0.5 right-0.5 rounded-xl px-2 py-1.5 shadow-sm border-l-[4px] transition-all overflow-hidden text-left flex flex-col group ${
                              hoveredDayId === day.id ? 'shadow-md scale-[1.01]' : ''
                            } ${bgColor} ${borderColor} border-y border-r border-y-slate-200/50 dark:border-y-slate-800/50 border-r-slate-200/50 dark:border-r-slate-800/50 cursor-pointer z-10 hover:brightness-95`}
                            style={{ top: `${top}px`, height: `${height}px` }}
                          >
                            <p className="text-[6px] font-black text-slate-500 dark:text-slate-400 uppercase leading-none mb-0.5">{event.startTime}</p>
                            {!event.sessions?.length && (
                              <h4 className="text-[7px] sm:text-[8px] font-black text-slate-800 dark:text-white leading-[1.1] text-wrap break-words">{event.title}</h4>
                            )}
                            {event.sessions && event.sessions.length > 0 && (
                              <div className="flex flex-col gap-1 overflow-hidden h-full">
                                {event.sessions.map((session, idx) => (
                                  <div key={idx} className="bg-white/80 dark:bg-slate-800/80 rounded-lg p-1 border border-slate-100 dark:border-slate-700 flex flex-col">
                                    <span className={`text-[5px] font-black uppercase tracking-widest ${
                                      session.audience === 'Jovens' ? 'text-emerald-600 dark:text-emerald-400' : 
                                      session.audience === 'Adolescentes' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500'
                                    }`}>
                                      {session.audience}
                                    </span>
                                    <h5 className="text-[6px] sm:text-[7px] font-black text-slate-800 dark:text-white leading-tight truncate">
                                      {session.title}
                                    </h5>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}

                  {currentIndicatorPos !== null && (
                    <div 
                      id="current-time-line"
                      className="absolute left-0 right-0 z-30 flex items-center pointer-events-none"
                      style={{ top: `${currentIndicatorPos}px` }}
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500 -ml-[3px] shadow-[0_0_4px_rgba(239,68,68,0.5)]" />
                      <div className="flex-grow h-[1px] bg-red-500/50" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div id="daily-events-container" className="flex flex-col gap-4 w-full relative">
            {activeDaysToRender.map(day => {
              const events = day.events.filter(event => activeCategory === 'Tudo' || event.type === activeCategory);
              const nowFormatted = currentTime.getHours().toString().padStart(2, '0') + ':' + currentTime.getMinutes().toString().padStart(2, '0');
              return (
                <div key={day.id} className="flex flex-col w-full relative">
                  {events.map((event, idx) => {
                    const prevEvent = events[idx-1];
                    const isCurrentSlot = (!prevEvent || prevEvent.startTime <= nowFormatted) && event.startTime > nowFormatted;
                    return (
                      <React.Fragment key={event.id}>
                        {isCurrentSlot && currentTime.getHours() >= 7 && (
                          <div id="current-time-line" className="flex items-center gap-3 my-2 pointer-events-none animate-pulse">
                            <span className="text-[10px] font-black text-red-500 bg-red-50 dark:bg-red-950/30 px-2 py-0.5 rounded-full uppercase">Agora • {nowFormatted}</span>
                            <div className="flex-grow h-[2px] bg-red-500/30 rounded-full" />
                          </div>
                        )}
                        <div onClick={() => setSelectedEvent(event)}>
                          <EventCard event={event} />
                        </div>
                      </React.Fragment>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {selectedEvent && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedEvent(null)}
        >
          <div 
            className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 sm:p-10">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                      {selectedEvent.startTime} — {selectedEvent.endTime}
                    </span>
                    <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider ${
                      selectedEvent.type === EventType.MENSAGENS ? 'bg-emerald-100 text-emerald-700' :
                      selectedEvent.type === EventType.REFEICOES ? 'bg-blue-100 text-blue-700' :
                      selectedEvent.type === EventType.ATIVIDADES ? 'bg-amber-100 text-amber-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {selectedEvent.type}
                    </span>
                  </div>
                  <h2 className="text-3xl font-black text-slate-800 dark:text-white leading-tight">
                    {selectedEvent.title}
                  </h2>
                </div>
                <button 
                  onClick={() => setSelectedEvent(null)}
                  className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              {selectedEvent.sessions && selectedEvent.sessions.length > 0 ? (
                <div className={`grid gap-6 ${selectedEvent.sessions.length > 1 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
                  {selectedEvent.sessions.map((session, idx) => (
                    <div key={idx} className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 flex flex-col h-full">
                      <div className="flex items-center justify-between mb-4">
                        <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${
                          session.audience === 'Jovens' ? 'text-emerald-600' : 
                          session.audience === 'Adolescentes' ? 'text-blue-600' : 'text-slate-500'
                        }`}>
                          {session.audience}
                        </span>
                        <span className="material-symbols-outlined text-slate-300">play_circle</span>
                      </div>
                      
                      <div 
                        onClick={(e) => handleSessionClick(e, session)}
                        className="aspect-video w-full bg-slate-200 dark:bg-slate-700 rounded-2xl mb-4 overflow-hidden relative group cursor-pointer"
                      >
                        <img 
                          src={`https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg`} 
                          alt="Thumbnail" 
                          className="w-full h-full object-cover brightness-75 group-hover:brightness-50 transition-all"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-16 h-16 bg-conf-wine/90 rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined text-white text-4xl ml-1">play_arrow</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex-grow">
                        <h3 className="text-xl font-black text-slate-800 dark:text-white mb-1">
                          {session.title}
                        </h3>
                        {session.speaker && (
                          <p className="text-sm font-bold text-slate-500 dark:text-slate-400 italic">
                            Palestrante: {session.speaker}
                          </p>
                        )}
                      </div>
                      
                      <button 
                        onClick={(e) => handleSessionClick(e, session)}
                        className="mt-6 flex items-center justify-center gap-2 w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-conf-wine dark:hover:bg-conf-wine hover:text-white transition-all shadow-lg active:scale-95"
                      >
                        Assistir no YouTube
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] border border-slate-100 dark:border-slate-800">
                  <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <span className="material-symbols-outlined text-4xl text-slate-300">event_available</span>
                  </div>
                  <p className="text-slate-400 font-black uppercase text-xs tracking-widest">Evento Geral — Todos os Públicos</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <button 
        onClick={() => document.documentElement.classList.toggle('dark')}
        className="fixed bottom-6 right-6 w-12 h-12 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl shadow-2xl flex items-center justify-center z-50 active:scale-95 transition-transform border border-slate-100 dark:border-slate-700"
      >
        <span className="material-symbols-outlined">contrast</span>
      </button>

      <footer className="max-w-6xl mx-auto px-6 py-8 border-t border-slate-200 dark:border-slate-800 mt-8">
        <p className="text-center text-[8px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Filtros Ativos: {activeCategory}</p>
      </footer>
    </div>
  );
};

export default App;
