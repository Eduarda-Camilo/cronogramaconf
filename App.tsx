
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { SCHEDULE_DATA } from './constants';
import EventCard from './components/EventCard';
import { ScheduleEvent, EventType, ParallelSession } from './types';

const App: React.FC = () => {
  const [activeDayId, setActiveDayId] = useState<string | 'all'>('all');
  const [hoveredDayId, setHoveredDayId] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null);
  const [activeCategory, setActiveCategory] = useState<EventType | 'Tudo'>('Tudo');
  const exportRefAll = useRef<HTMLDivElement>(null);
  const exportRefDaily = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const PIXELS_PER_HOUR = 90; 
  const PIXELS_PER_30MIN = PIXELS_PER_HOUR / 2;
  const START_HOUR = 7;

  const LOGO_URL = "https://lh3.googleusercontent.com/u/0/d/1IEGghbpjco78PtXtj1kAcWk1fBdLrWme";
  const YOUTUBE_URL = "https://www.youtube.com/channel/UCKXmodit6c2irD6w2i3o1wA";
  const THUMB_PLACEHOLDER = "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=800";

  // Estado para a posição da linha na vista diária (em pixels relativos ao container)
  const [dailyTimelineTop, setDailyTimelineTop] = useState<number | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 30000); 
    return () => clearInterval(timer);
  }, []);

  // Lógica de cálculo de posição para a lista de cards
  useEffect(() => {
    if (activeDayId === 'all') return;

    const updateDailyLinePosition = () => {
      const now = currentTime.getHours() * 60 + currentTime.getMinutes();
      const dayData = SCHEDULE_DATA.find(d => d.id === activeDayId);
      if (!dayData) return;

      const eventElements = document.querySelectorAll('[data-event-id]');
      let foundTop = null;

      for (const el of Array.from(eventElements)) {
        const id = el.getAttribute('data-event-id');
        const event = dayData.events.find(e => e.id === id);
        if (!event) continue;

        const [startH, startM] = event.startTime.split(':').map(Number);
        const [endH, endM] = event.endTime.split(':').map(Number);
        const startTotal = startH * 60 + startM;
        const endTotal = endH * 60 + endM;

        if (now >= startTotal && now <= endTotal) {
          const rect = (el as HTMLElement).getBoundingClientRect();
          const containerRect = exportRefDaily.current?.getBoundingClientRect();
          if (containerRect) {
            const relativeTop = rect.top - containerRect.top;
            const progress = (now - startTotal) / (endTotal - startTotal);
            foundTop = relativeTop + (rect.height * progress);
          }
          break;
        } else if (now < startTotal && foundTop === null) {
          // Se ainda não chegamos no evento, mas este é o próximo
          const rect = (el as HTMLElement).getBoundingClientRect();
          const containerRect = exportRefDaily.current?.getBoundingClientRect();
          if (containerRect) {
            foundTop = rect.top - containerRect.top - 10; // Fica um pouco acima do próximo card
          }
          break;
        }
      }
      setDailyTimelineTop(foundTop);
    };

    // Pequeno delay para garantir que os cards foram renderizados
    const timeoutId = setTimeout(updateDailyLinePosition, 100);
    window.addEventListener('resize', updateDailyLinePosition);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', updateDailyLinePosition);
    };
  }, [activeDayId, currentTime, activeCategory]);

  useEffect(() => {
    const scrollToNow = () => {
      const hours = currentTime.getHours();
      if (hours >= START_HOUR && hours < 24) {
        const line = document.getElementById('current-time-line');
        if (line) {
          line.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    };
    const timeoutId = setTimeout(scrollToNow, 800);
    return () => clearTimeout(timeoutId);
  }, [activeDayId, currentTime]);

  const getTimePosition = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return (hours - START_HOUR) * PIXELS_PER_HOUR + (minutes / 60) * PIXELS_PER_HOUR;
  };

  const getEventStyle = (event: ScheduleEvent, dayEvents: ScheduleEvent[]) => {
    const top = getTimePosition(event.startTime);
    const bottom = getTimePosition(event.endTime);
    const height = Math.max(40, bottom - top);

    const collisions = dayEvents.filter(other => {
      if (other.id === event.id) return false;
      if (activeCategory !== 'Tudo' && other.type !== activeCategory) return false;
      const otherTop = getTimePosition(other.startTime);
      const otherBottom = getTimePosition(other.endTime);
      return (top < otherBottom && bottom > otherTop);
    });

    if (collisions.length === 0) {
      return { top: `${top}px`, height: `${height}px`, width: 'calc(100% - 4px)', left: '2px' };
    }

    const isSecondary = event.type === EventType.TRANSPORTE || event.title.toLowerCase().includes('ônibus');
    
    return {
      top: `${top}px`,
      height: `${height}px`,
      width: isSecondary ? '65%' : '85%',
      left: isSecondary ? '30%' : '2px',
      zIndex: isSecondary ? 30 : 25,
      opacity: isSecondary ? 0.95 : 1
    };
  };

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
    if (activeDayId === 'all') return 'CRONOGRAMA GERAL';
    const day = SCHEDULE_DATA.find(d => d.id === activeDayId);
    return day ? `${getFullWeekday(day.weekday)} ${day.date}`.toUpperCase() : '';
  }, [activeDayId]);

  const handleCategoryClick = (category: EventType | 'Tudo') => {
    if (activeCategory === category) {
      setActiveCategory('Tudo');
    } else {
      setActiveCategory(category);
    }
  };

  const handleExport = async () => {
    const targetRef = activeDayId === 'all' ? exportRefAll.current : exportRefDaily.current;
    if (!targetRef) return;
    setIsExporting(true);
    await new Promise(r => setTimeout(r, 200));

    try {
      const canvas = await (window as any).html2canvas(targetRef, {
        scale: 2,
        useCORS: true,
        backgroundColor: document.documentElement.classList.contains('dark') ? '#1a0000' : '#ffffff',
        logging: false,
        onclone: (clonedDoc: Document, element: HTMLElement) => {
          element.style.padding = '40px';
          element.style.borderRadius = '0px';
          element.style.width = activeDayId === 'all' ? '1200px' : '800px';
          const header = clonedDoc.createElement('div');
          header.style.marginBottom = '30px';
          header.style.paddingBottom = '20px';
          header.style.borderBottom = '3px solid #800000';
          header.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; font-family: sans-serif;">
              <div>
                <h1 style="font-size: 32px; font-weight: 800; color: #1e293b; margin: 0;">${activeTitle}</h1>
                <p style="font-size: 14px; color: #64748b; margin: 5px 0 0 0; text-transform: uppercase; letter-spacing: 2px;">Conferência CAJ 2026</p>
              </div>
              <img src="${LOGO_URL}" style="height: 60px;" />
            </div>`;
          element.prepend(header);
          const nowLines = element.querySelectorAll('#current-time-line');
          nowLines.forEach(line => (line as HTMLElement).style.display = 'none');
        }
      });
      const link = document.createElement('a');
      link.download = `cronograma-caj-2026-${activeDayId}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  const currentIndicatorPos = useMemo(() => {
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    const seconds = currentTime.getSeconds();
    if (hours < START_HOUR || hours >= 24) return null;
    return (hours - START_HOUR) * PIXELS_PER_HOUR + (minutes / 60) * PIXELS_PER_HOUR + (seconds / 3600) * PIXELS_PER_HOUR;
  }, [currentTime]);

  const timeLabels = useMemo(() => {
    const labels = [];
    for (let hour = START_HOUR; hour <= 23; hour++) {
      labels.push(`${hour.toString().padStart(2, '0')}:00`);
      labels.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    return labels;
  }, []);

  const categoryLegend = [
    { type: 'Tudo', dot: 'bg-slate-400', activeBg: 'bg-slate-200 dark:bg-conf-wine-soft', activeBorder: 'border-slate-400' },
    { type: EventType.MENSAGENS, dot: 'bg-emerald-500', activeBg: 'bg-emerald-100 dark:bg-emerald-950/40', activeBorder: 'border-emerald-500' },
    { type: EventType.REFEICOES, dot: 'bg-blue-500', activeBg: 'bg-blue-100 dark:bg-blue-950/40', activeBorder: 'border-blue-500' },
    { type: EventType.ATIVIDADES, dot: 'bg-amber-500', activeBg: 'bg-amber-100 dark:bg-amber-950/40', activeBorder: 'border-amber-500' },
    { type: EventType.TRANSPORTE, dot: 'bg-purple-500', activeBg: 'bg-purple-100 dark:bg-purple-950/40', activeBorder: 'border-purple-500' },
    { type: EventType.ROTINA, dot: 'bg-slate-500', activeBg: 'bg-slate-200 dark:bg-conf-wine-soft', activeBorder: 'border-slate-500' },
  ];

  const SidePanelContent = () => (
    <div className="h-full flex flex-col p-6 overflow-y-auto scrollbar-hide">
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-slate-100 dark:bg-conf-wine-soft text-slate-500 dark:text-conf-beige/70 text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              {selectedEvent?.startTime} — {selectedEvent?.endTime}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-semibold text-slate-800 dark:text-conf-beige leading-tight font-poppins uppercase tracking-wide">
            {selectedEvent?.title}
          </h2>
        </div>
        <button 
          onClick={() => setSelectedEvent(null)}
          className="w-10 h-10 rounded-full bg-slate-50 dark:bg-conf-wine-soft flex items-center justify-center text-slate-400 dark:text-conf-beige/50 hover:text-slate-600 transition-colors"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>
      </div>

      <div className="flex flex-col gap-6">
        {selectedEvent?.sessions && selectedEvent.sessions.length > 0 ? (
          selectedEvent.sessions.map((session, idx) => {
            const isMensagem = selectedEvent.type === EventType.MENSAGENS;
            return (
              <div key={idx} className="bg-slate-50 dark:bg-conf-wine-card rounded-3xl overflow-hidden border border-slate-100 dark:border-conf-wine/30 flex flex-col group">
                {isMensagem && (
                  <div className="relative aspect-video w-full overflow-hidden bg-slate-200 dark:bg-conf-wine-deep">
                    <img src={THUMB_PLACEHOLDER} className="w-full h-full object-cover" alt="Preview" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors">
                      <span className="material-symbols-outlined text-white text-5xl opacity-80 font-variation-settings-fill">play_circle</span>
                    </div>
                  </div>
                )}
                <div className="p-5">
                  <span className={`text-[9px] font-bold uppercase tracking-[0.2em] mb-2 block ${
                    session.audience === 'Jovens' ? 'text-emerald-600 dark:text-emerald-400' : 
                    session.audience === 'Adolescentes' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-conf-beige/50'
                  }`}>Público: {session.audience}</span>
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-conf-beige mb-1 font-poppins uppercase">{session.title}</h3>
                  {session.speaker && <p className="text-xs font-bold text-slate-500 dark:text-conf-beige/60 italic mb-4">Palestrante: {session.speaker}</p>}
                  {isMensagem && (
                    <a 
                      href={YOUTUBE_URL} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center justify-center gap-3 w-full bg-[#FF0000] text-white px-4 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-[#CC0000] transition-all shadow-lg active:scale-95 font-poppins group/yt"
                    >
                      <svg className="w-5 h-5 fill-current flex-shrink-0" viewBox="0 0 24 24">
                        <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                      </svg>
                      <span className="whitespace-nowrap">Assistir no YouTube</span>
                    </a>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-12 text-center bg-slate-50 dark:bg-conf-wine-card rounded-3xl border border-dashed border-slate-200 dark:border-conf-wine/30">
            <div className="w-16 h-16 bg-white dark:bg-conf-wine-deep rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
              <span className="material-symbols-outlined text-3xl text-slate-300 dark:text-conf-beige/30">
                {selectedEvent?.type === EventType.TRANSPORTE ? 'directions_bus' : 
                 selectedEvent?.type === EventType.REFEICOES ? 'restaurant' : 
                 'event_available'}
              </span>
            </div>
            <p className="text-slate-400 dark:text-conf-beige/40 font-bold uppercase text-[9px] tracking-widest font-poppins">Evento Geral</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-conf-cream dark:bg-conf-wine-deep transition-colors font-sans text-slate-900 dark:text-conf-beige relative overflow-x-hidden">
      {/* MOBILE BACKDROP */}
      {selectedEvent && (
        <div 
          className="fixed inset-0 bg-black/50 z-[80] lg:hidden animate-in fade-in duration-300" 
          onClick={() => setSelectedEvent(null)} 
        />
      )}

      {/* HEADER */}
      <header className="w-full bg-white dark:bg-conf-wine-darker border-b border-slate-200 dark:border-conf-wine/30 sticky top-0 z-[60] pt-4 sm:pt-6 pb-4">
        <div className="max-w-6xl mx-auto px-4">
          <div className="sm:hidden flex flex-col items-center mb-4">
            <div className="w-28 mb-3">
              <img src={LOGO_URL} className="max-w-full h-auto object-contain mx-auto" alt="Logo" />
            </div>
            <h1 className="text-xl font-semibold text-slate-800 dark:text-conf-beige uppercase tracking-tight mb-2 font-poppins text-center">CAJ Vós Sois Dele</h1>
            <p className="text-[11px] font-medium text-slate-500 dark:text-conf-beige/70 leading-relaxed text-center px-2">
              Este site é o seu <span className="font-bold text-conf-wine dark:text-conf-beige">GUIA DIGITAL</span> oficial da conferência.
            </p>
          </div>

          <div className="hidden sm:flex flex-row items-start justify-between mb-6">
            <div className="flex-grow text-left mr-6">
              <h1 className="text-3xl font-semibold text-slate-800 dark:text-conf-beige uppercase tracking-tight mb-2 font-poppins">CAJ Vós Sois Dele</h1>
              <p className="text-[13px] font-medium text-slate-500 dark:text-conf-beige/70 leading-relaxed block max-w-none">
                Este site é o seu <span className="font-bold text-conf-wine dark:text-conf-beige">GUIA DIGITAL</span> oficial da conferência. 
                Acompanhe os horários em tempo real, verifique os locais, acesse as mensagens no youtube durante todo o evento.
              </p>
            </div>
            <div className="w-48 flex-shrink-0 mt-1 flex justify-end">
              <img src={LOGO_URL} className="max-w-full h-auto object-contain" alt="Logo" />
            </div>
          </div>
          
          <div className="relative w-full">
            <div className="flex gap-4 overflow-x-auto scroll-smooth scrollbar-hide pb-2 px-1 snap-x touch-pan-x whitespace-nowrap -mx-4 sm:mx-0 px-4 sm:px-0">
              <button 
                onClick={() => setActiveDayId('all')} 
                className={`flex-shrink-0 px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border-2 snap-start inline-block ${
                  activeDayId === 'all' 
                    ? 'bg-conf-green border-conf-green text-white shadow-md' 
                    : 'bg-white dark:bg-conf-wine-card border-transparent text-slate-400 dark:text-conf-beige/40'
                }`}
              >
                Cronograma Geral
              </button>

              {SCHEDULE_DATA.map(day => (
                <button 
                  key={day.id} 
                  onClick={() => setActiveDayId(day.id)} 
                  className={`flex-shrink-0 px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border-2 snap-start inline-block ${
                    activeDayId === day.id 
                      ? 'bg-conf-green border-conf-green text-white shadow-md' 
                      : 'bg-white dark:bg-conf-wine-card border-transparent text-slate-400 dark:text-conf-beige/40'
                  }`}
                >
                  {day.weekday} {day.date}
                </button>
              ))}
              <div className="flex-shrink-0 w-4 h-1 sm:hidden"></div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <h2 className="font-semibold text-slate-800 dark:text-conf-beige text-xl sm:text-2xl uppercase font-poppins">{activeTitle}</h2>
          
          <button 
            onClick={handleExport} 
            disabled={isExporting} 
            className="hidden sm:flex items-center justify-center gap-2 bg-conf-wine text-white px-4 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-md active:scale-95 transition-transform disabled:opacity-50 sm:w-auto"
          >
            <span className="material-symbols-outlined text-sm">{isExporting ? 'sync' : 'download'}</span>
            {isExporting ? 'Processando...' : 'BAIXAR CRONOGRAMA'}
          </button>
        </div>

        <div className="flex flex-wrap justify-start sm:justify-center gap-2 mb-6 -mx-1 px-1">
          {categoryLegend.map((cat) => (
            <button key={cat.type} onClick={() => handleCategoryClick(cat.type as any)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 transition-all flex-shrink-0 ${activeCategory === cat.type ? `${cat.activeBg} ${cat.activeBorder} scale-105 shadow-md` : 'border-slate-100 dark:border-conf-wine/30 bg-white dark:bg-conf-wine-darker'}`}>
              <div className={`w-2 h-2 rounded-full ${cat.dot}`} />
              <span className={`text-[8px] font-semibold uppercase tracking-widest ${activeCategory === cat.type ? 'text-slate-900 dark:text-conf-beige' : 'text-slate-500 dark:text-conf-beige/40'}`}>{cat.type}</span>
            </button>
          ))}
        </div>

        <button 
          onClick={handleExport} 
          disabled={isExporting} 
          className="flex sm:hidden items-center justify-center gap-2 bg-conf-wine text-white px-4 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-md active:scale-95 transition-transform disabled:opacity-50 w-full mb-8"
        >
          <span className="material-symbols-outlined text-sm">{isExporting ? 'sync' : 'download'}</span>
          {isExporting ? 'Processando...' : 'BAIXAR CRONOGRAMA'}
        </button>

        <div className="flex flex-col lg:flex-row gap-6 relative items-start">
          <div className={`transition-all duration-500 ease-in-out ${selectedEvent ? 'lg:w-[70%]' : 'w-full'} lg:pr-2`}>
            {activeDayId === 'all' ? (
              <div ref={exportRefAll} className="rounded-3xl border border-slate-200 dark:border-conf-wine/30 bg-white dark:bg-conf-wine-deep shadow-xl overflow-hidden">
                <div className="w-full relative p-2 sm:p-4 overflow-x-auto">
                  <div className="flex mb-4 border-b border-slate-100 dark:border-conf-wine/20 pb-4 min-w-[500px]">
                    <div className="w-12 sm:w-16 flex-shrink-0" />
                    {SCHEDULE_DATA.map(day => (
                      <div 
                        key={day.id} 
                        className="flex-1 min-w-[80px] text-center cursor-pointer group" 
                        onClick={() => setActiveDayId(day.id)}
                        onMouseEnter={() => setHoveredDayId(day.id)}
                        onMouseLeave={() => setHoveredDayId(null)}
                      >
                        <div className="relative flex flex-col items-center justify-center py-2">
                          <div className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-conf-wine rounded-full transition-all duration-300 z-0 ${
                            activeDayId === day.id 
                              ? 'w-20 h-20 sm:w-24 sm:h-24 opacity-100 scale-100' 
                              : hoveredDayId === day.id 
                                ? 'w-18 h-18 sm:w-20 sm:h-20 opacity-80 scale-95' 
                                : 'w-0 h-0 opacity-0 scale-0'
                          }`} />
                          
                          <div className="relative z-10 flex flex-col items-center">
                            <span className={`text-[10px] sm:text-[14px] font-bold uppercase transition-colors duration-300 ${
                              activeDayId === day.id || hoveredDayId === day.id 
                                ? 'text-white' 
                                : 'text-slate-400 dark:text-conf-beige/40'
                            }`}>
                              {day.weekday}
                            </span>
                            <span className={`text-sm sm:text-2xl font-bold transition-colors duration-300 -mt-1 ${
                              activeDayId === day.id || hoveredDayId === day.id 
                                ? 'text-white' 
                                : 'text-slate-800 dark:text-conf-beige group-hover:text-conf-wine'
                            }`}>
                              {day.date}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="relative flex min-w-[500px]">
                    <div className="w-12 sm:w-16 flex-shrink-0">
                      {timeLabels.map(l => <div key={l} style={{ height: `${PIXELS_PER_30MIN}px` }} className="relative"><span className="absolute -top-2 right-2 text-[8px] font-semibold text-slate-400 dark:text-conf-beige/30">{l}</span></div>)}
                    </div>
                    <div className="flex-1 flex relative">
                      <div className="absolute inset-0 grid grid-rows-[repeat(34,45px)] pointer-events-none">
                        {Array.from({ length: 34 }).map((_, i) => <div key={i} style={{ height: `${PIXELS_PER_30MIN}px` }} className={`border-t ${i % 2 === 0 ? 'border-slate-100 dark:border-conf-wine/10' : 'border-slate-50/30 dark:border-conf-wine/5 border-dashed'}`} />)}
                      </div>
                      {SCHEDULE_DATA.map(day => (
                        <div key={day.id} style={{ minHeight: `${PIXELS_PER_30MIN * 34}px` }} className={`flex-1 min-w-[80px] relative border-l border-slate-100 dark:border-conf-wine/10 transition-colors ${hoveredDayId === day.id ? 'bg-conf-wine/[0.02]' : ''}`}>
                          {day.events.map(event => {
                            if (activeCategory !== 'Tudo' && event.type !== activeCategory) return null;
                            const style = getEventStyle(event, day.events);
                            const isMensagem = event.type === EventType.MENSAGENS;
                            const isRefeicao = event.type === EventType.REFEICOES;
                            const isAtividade = event.type === EventType.ATIVIDADES;
                            const isTransporte = event.type === EventType.TRANSPORTE;
                            const bgColor = isMensagem ? 'bg-emerald-50/95 dark:bg-emerald-950/90' : isRefeicao ? 'bg-blue-50/95 dark:bg-blue-950/80' : isAtividade ? 'bg-amber-50/95 dark:bg-amber-950/80' : isTransporte ? 'bg-purple-50/95 dark:bg-purple-950/80' : 'bg-white/95 dark:bg-conf-wine-card';
                            const borderColor = isMensagem ? 'border-emerald-500' : isRefeicao ? 'border-blue-500' : isAtividade ? 'border-amber-500' : isTransporte ? 'border-purple-500' : 'border-slate-300 dark:border-conf-wine/50';
                            
                            return (
                              <div key={event.id} onClick={() => setSelectedEvent(event)} className={`absolute rounded-xl px-2 py-2 shadow-lg border-l-[4px] transition-all overflow-hidden ${selectedEvent?.id === event.id ? 'ring-2 ring-conf-wine z-[60]' : ''} ${bgColor} ${borderColor} cursor-pointer hover:z-[70] hover:scale-[1.01]`} style={style}>
                                <div className="flex flex-col h-full overflow-hidden">
                                  <div className="flex justify-between items-center mb-1">
                                    <p className="text-[6px] sm:text-[7.5px] font-bold text-slate-500 dark:text-conf-beige/60 uppercase leading-none">{event.startTime} — {event.endTime}</p>
                                  </div>
                                  <h4 className="text-[8px] sm:text-[9px] font-extrabold text-slate-800 dark:text-conf-beige leading-tight font-poppins uppercase mb-1.5 tracking-tight line-clamp-1">{event.title}</h4>
                                  
                                  {event.sessions && event.sessions.length > 0 && (
                                    <div className="flex flex-col gap-1 mt-auto">
                                      {event.sessions.map((session, idx) => (
                                        <div key={idx} className="bg-slate-100/60 dark:bg-black/20 rounded-lg px-1.5 py-1.5 border border-black/5 dark:border-white/5 flex flex-col">
                                          <span className={`text-[5px] sm:text-[6px] font-bold uppercase tracking-widest mb-0.5 ${session.audience === 'Jovens' ? 'text-emerald-600 dark:text-emerald-400' : session.audience === 'Adolescentes' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500'}`}>
                                            {session.audience}
                                          </span>
                                          <h5 className="text-[6.5px] sm:text-[7.5px] font-bold text-slate-900 dark:text-white leading-none mb-1 line-clamp-1">
                                            {session.title}
                                          </h5>
                                          {session.speaker && (
                                            <p className="text-[5.5px] sm:text-[6.5px] font-medium italic text-slate-500 dark:text-conf-beige/50 truncate">
                                              {session.speaker}
                                            </p>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ))}
                      {currentIndicatorPos !== null && (
                        <div id="current-time-line" className="absolute left-0 right-0 z-[80] flex items-center pointer-events-none transition-all duration-300 ease-linear" style={{ top: `${currentIndicatorPos}px` }}>
                          <div className="bg-red-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-r-md shadow-md animate-pulse whitespace-nowrap -ml-[48px] mr-2 flex items-center gap-1 uppercase tracking-tighter">
                            AGORA <span className="opacity-70">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                          <div className="flex-grow h-[1px] bg-red-500 shadow-sm" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div ref={exportRefDaily} className="flex flex-col gap-4 relative w-full">
                <div className="flex flex-col gap-4 pb-20 relative">
                   {/* Linha do Tempo nas Listas Diárias - Posição Calculada */}
                   {dailyTimelineTop !== null && (
                    <div 
                      id="current-time-line" 
                      className="absolute left-0 right-0 z-[80] flex items-center pointer-events-none transition-all duration-300 ease-linear" 
                      style={{ top: `${dailyTimelineTop}px` }}
                    >
                      <div className="bg-red-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-r-md shadow-md animate-pulse whitespace-nowrap mr-2 flex items-center gap-1 uppercase tracking-tighter">
                        AGORA <span className="opacity-70">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                      <div className="flex-grow h-[1px] bg-red-500 shadow-sm opacity-50" />
                    </div>
                  )}

                  <div className="relative">
                    {SCHEDULE_DATA.find(d => d.id === activeDayId)?.events.filter(e => activeCategory === 'Tudo' || e.type === activeCategory).map(event => (
                      <div 
                        key={event.id} 
                        data-event-id={event.id}
                        onClick={() => setSelectedEvent(event)} 
                        className={`transition-all ${selectedEvent?.id === event.id ? 'ring-2 ring-conf-wine rounded-3xl' : ''}`}
                      >
                        <EventCard event={event} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <aside className={`hidden lg:flex transition-all duration-500 ease-in-out ${selectedEvent ? 'lg:w-[30%] opacity-100 visible sticky top-[120px] max-h-[calc(100vh-140px)]' : 'w-0 opacity-0 invisible overflow-hidden absolute right-0'}`}>
            <div className="w-full h-full bg-white dark:bg-conf-wine-deep border border-slate-200 dark:border-conf-wine/30 lg:rounded-3xl shadow-lg overflow-hidden flex flex-col">
              {selectedEvent && <SidePanelContent />}
            </div>
          </aside>

          <aside 
            className={`lg:hidden fixed bottom-0 left-0 right-0 z-[100] bg-white dark:bg-conf-wine-darker rounded-t-[2.5rem] shadow-2xl transition-transform duration-500 ease-in-out transform ${selectedEvent ? 'translate-y-0' : 'translate-y-full'}`}
            style={{ maxHeight: '85vh' }}
          >
            <div className="w-12 h-1.5 bg-slate-200 dark:bg-conf-wine-card rounded-full mx-auto my-4" />
            <div className="overflow-y-auto pb-10" style={{ maxHeight: 'calc(85vh - 40px)' }}>
              {selectedEvent && <SidePanelContent />}
            </div>
          </aside>
        </div>
      </main>

      <button onClick={() => document.documentElement.classList.toggle('dark')} className="fixed bottom-6 right-6 w-12 h-12 bg-white dark:bg-conf-wine-card text-slate-900 dark:text-conf-beige rounded-2xl shadow-2xl flex items-center justify-center z-[70] border border-slate-100 dark:border-conf-wine/30 active:scale-95 transition-transform"><span className="material-symbols-outlined">contrast</span></button>
      <footer className="max-w-6xl mx-auto px-6 py-8 border-t border-slate-200 dark:border-conf-wine/30 mt-8"><p className="text-center text-[8px] font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-conf-beige/30 font-poppins">Conferência Vós Sois Dele 2026</p></footer>
    </div>
  );
};

export default App;
