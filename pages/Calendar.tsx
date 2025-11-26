import React, { useEffect, useState } from 'react';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, format, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { eventApi } from '../services/mockApi';
import { CalendarEvent, UserRole } from '../types';
import { EVENT_TYPES, SUBJECTS } from '../constants';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const CalendarPage: React.FC = () => {
  const { user } = useAuth();
  const isTeacher = user?.role === UserRole.TEACHER;
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date()); // Começa com hoje selecionado
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [newEvent, setNewEvent] = useState<Partial<CalendarEvent>>({
    title: '',
    type: 'EXAM',
    subject: SUBJECTS[0],
    start: '',
    end: '',
    description: ''
  });

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    const data = await eventApi.getAll();
    setEvents(data);
  };

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  // Calendar Grid Logic
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const getDayEvents = (day: Date) => {
    return events.filter(e => isSameDay(new Date(e.start), day));
  };

  const handleDayClick = (day: Date) => {
    // Se clicar no dia que já está selecionado e for professor, abre modal
    if (selectedDate && isSameDay(day, selectedDate) && isTeacher) {
      const formattedDate = format(day, "yyyy-MM-dd'T'09:00");
      setNewEvent({
        ...newEvent,
        start: formattedDate,
        end: format(day, "yyyy-MM-dd'T'10:00")
      });
      setIsModalOpen(true);
    } else {
      setSelectedDate(day);
    }
  };

  const handleDeleteEvent = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Tem certeza?')) return;
    await eventApi.delete(id);
    loadEvents();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.title || !newEvent.start) return;

    const evt: CalendarEvent = {
        id: Date.now().toString(),
        title: newEvent.title!,
        description: newEvent.description || '',
        start: newEvent.start!,
        end: newEvent.end || newEvent.start!,
        type: newEvent.type as any,
        subject: newEvent.subject,
        createdBy: user!.id
    };

    await eventApi.add(evt);
    await loadEvents();
    setIsModalOpen(false);
    setNewEvent({ title: '', type: 'EXAM', subject: SUBJECTS[0], description: '' });
  };

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900 capitalize">
          {currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
        </h1>
        <div className="flex items-center space-x-2">
          <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-100 rounded-full"><ChevronLeft /></button>
          <button onClick={() => { setCurrentDate(new Date()); setSelectedDate(new Date()); }} className="px-3 py-1 text-sm border rounded hover:bg-gray-50">Hoje</button>
          <button onClick={handleNextMonth} className="p-2 hover:bg-gray-100 rounded-full"><ChevronRight /></button>
          {isTeacher && (
             <Button onClick={() => setIsModalOpen(true)} className="ml-4">
               <Plus className="w-4 h-4 mr-2" /> Novo Evento
             </Button>
          )}
        </div>
      </div>

      <div className="flex-1 bg-white border rounded-lg shadow flex flex-col overflow-hidden">
        {/* Days Header */}
        <div className="grid grid-cols-7 border-b bg-gray-50">
          {weekDays.map(day => (
            <div key={day} className="py-2 text-center text-sm font-semibold text-gray-500">
              {day}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="flex-1 grid grid-cols-7 auto-rows-fr overflow-y-auto">
          {calendarDays.map((day, dayIdx) => {
            const dayEvents = getDayEvents(day);
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isToday = isSameDay(day, new Date());

            return (
              <div 
                key={day.toString()}
                onClick={() => handleDayClick(day)}
                className={`min-h-[100px] border-b border-r p-2 transition-all cursor-pointer relative
                  ${!isCurrentMonth ? 'bg-gray-50/50 text-gray-400' : ''} 
                  ${isSelected ? 'bg-primary-50 ring-2 ring-inset ring-primary-500 z-10' : 'hover:bg-gray-50 bg-white'}
                `}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full 
                    ${isToday ? 'bg-primary-600 text-white shadow-md' : 'text-gray-700'}
                  `}>
                    {format(day, 'd')}
                  </span>
                  {isSelected && <span className="text-xs font-bold text-primary-600 px-1">Selecionado</span>}
                </div>
                <div className="mt-1 space-y-1">
                  {dayEvents.map(evt => (
                    <div 
                      key={evt.id} 
                      className={`text-xs p-1 rounded border truncate flex justify-between items-center group shadow-sm ${EVENT_TYPES[evt.type]?.color || 'bg-gray-100'}`}
                      title={`${evt.title} (${evt.subject})`}
                    >
                      <span className="font-medium">{evt.title}</span>
                      {isTeacher && (
                        <button 
                          onClick={(e) => handleDeleteEvent(e, evt.id)}
                          className="hidden group-hover:block text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={10} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Event Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold mb-4">Adicionar Novo Evento</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input 
                label="Título do Evento"
                value={newEvent.title}
                onChange={e => setNewEvent({...newEvent, title: e.target.value})}
                required
              />
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                    <select 
                      className="block w-full border-gray-300 rounded-md shadow-sm border p-2 text-sm"
                      value={newEvent.type}
                      onChange={e => setNewEvent({...newEvent, type: e.target.value as any})}
                    >
                      {Object.keys(EVENT_TYPES).map(t => (
                        <option key={t} value={t}>{EVENT_TYPES[t as keyof typeof EVENT_TYPES].label}</option>
                      ))}
                    </select>
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Matéria</label>
                    <select 
                      className="block w-full border-gray-300 rounded-md shadow-sm border p-2 text-sm"
                      value={newEvent.subject}
                      onChange={e => setNewEvent({...newEvent, subject: e.target.value})}
                    >
                      {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                 </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input 
                  type="datetime-local" 
                  label="Início"
                  value={newEvent.start}
                  onChange={e => setNewEvent({...newEvent, start: e.target.value})}
                  required
                />
                <Input 
                  type="datetime-local" 
                  label="Fim"
                  value={newEvent.end}
                  onChange={e => setNewEvent({...newEvent, end: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <textarea 
                  className="w-full border border-gray-300 rounded-md p-2 text-sm"
                  rows={3}
                  value={newEvent.description}
                  onChange={e => setNewEvent({...newEvent, description: e.target.value})}
                />
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                <Button type="submit">Salvar Evento</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarPage;