import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole, CalendarEvent } from '../types';
import Card from '../components/ui/Card';
import { BookOpen, Calendar, Users, Clock, AlertCircle } from 'lucide-react';
import { materialApi, eventApi, studentApi } from '../services/mockApi';
import { isSameDay, parseISO, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { EVENT_TYPES } from '../constants';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    materials: 0,
    events: 0,
    students: 0
  });
  const [upcomingEvents, setUpcomingEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const [mats, evts, studs] = await Promise.all([
        materialApi.getAll(),
        eventApi.getAll(),
        studentApi.getAll()
      ]);
      
      setStats({
        materials: mats.length,
        events: evts.length,
        students: studs.length
      });

      // Filter and sort upcoming events
      const now = new Date();
      now.setHours(0, 0, 0, 0); // Reset time to compare dates properly

      const upcoming = evts
        .filter(e => parseISO(e.start) >= now) // Only future or today
        .sort((a, b) => parseISO(a.start).getTime() - parseISO(b.start).getTime())
        .slice(0, 5); // Take top 5

      setUpcomingEvents(upcoming);
    };
    fetchData();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom Dia';
    if (hour < 18) return 'Boa Tarde';
    return 'Boa Noite';
  };

  const StatCard = ({ title, value, icon, color }: any) => (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className={`flex-shrink-0 rounded-md p-3 ${color}`}>
            {icon}
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd className="text-lg font-medium text-gray-900">{value}</dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            {getGreeting()}, {user?.name.split(' ')[0]}!
          </h2>
          <p className="mt-1 text-sm text-gray-500">
             Bem-vindo de volta. Hoje é <span className="font-semibold text-primary-600">{format(new Date(), "dd 'de' MMMM", { locale: ptBR })}</span>.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard 
          title="Total de Materiais" 
          value={stats.materials} 
          icon={<BookOpen className="h-6 w-6 text-white" />} 
          color="bg-blue-500"
        />
        <StatCard 
          title="Eventos Futuros" 
          value={stats.events} 
          icon={<Calendar className="h-6 w-6 text-white" />} 
          color="bg-purple-500"
        />
        {user?.role === UserRole.TEACHER && (
          <StatCard 
            title="Total de Alunos" 
            value={stats.students} 
            icon={<Users className="h-6 w-6 text-white" />} 
            color="bg-green-500"
          />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Próximos Eventos & Prazos">
          {upcomingEvents.length === 0 ? (
            <p className="text-gray-500 text-sm py-4">Nenhum evento agendado para os próximos dias.</p>
          ) : (
            <div className="flow-root">
              <ul className="-mb-8">
                {upcomingEvents.map((evt, idx) => {
                  const evtDate = parseISO(evt.start);
                  const isToday = isSameDay(evtDate, new Date());
                  
                  return (
                    <li key={evt.id}>
                      <div className="relative pb-8">
                        {idx !== upcomingEvents.length - 1 ? (
                          <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                        ) : null}
                        <div className={`relative flex space-x-3 p-3 rounded-lg transition-colors ${isToday ? 'bg-amber-50 border border-amber-200' : 'hover:bg-gray-50'}`}>
                          <div>
                            <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white 
                              ${isToday ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-500'}
                            `}>
                              {isToday ? <AlertCircle size={16} /> : <Calendar size={16} />}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {evt.title} 
                                {isToday && <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">HOJE</span>}
                              </p>
                              <p className="text-xs text-gray-500">{evt.subject} • {EVENT_TYPES[evt.type]?.label}</p>
                            </div>
                            <div className="text-right text-sm whitespace-nowrap text-gray-500">
                              <time dateTime={evt.start}>
                                {isToday 
                                  ? format(evtDate, 'HH:mm')
                                  : format(evtDate, "dd/MM")
                                }
                              </time>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </Card>

        <Card title="Ações Rápidas">
          <div className="space-y-4">
             <p className="text-sm text-gray-500">Acesso rápido às funcionalidades principais.</p>
             <div className="grid grid-cols-2 gap-4">
                <button 
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-primary-300 transition-all text-center group"
                  onClick={() => window.location.hash = '#/materials'}
                >
                    <BookOpen className="mx-auto h-6 w-6 text-gray-400 group-hover:text-primary-600 mb-2" />
                    <span className="block text-sm font-medium text-gray-900">Biblioteca</span>
                </button>
                <button 
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-primary-300 transition-all text-center group"
                  onClick={() => window.location.hash = '#/calendar'}
                >
                    <Calendar className="mx-auto h-6 w-6 text-gray-400 group-hover:text-primary-600 mb-2" />
                    <span className="block text-sm font-medium text-gray-900">Horários</span>
                </button>
                {user?.role === UserRole.TEACHER && (
                  <button 
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-primary-300 transition-all text-center group"
                    onClick={() => window.location.hash = '#/students'}
                  >
                      <Users className="mx-auto h-6 w-6 text-gray-400 group-hover:text-primary-600 mb-2" />
                      <span className="block text-sm font-medium text-gray-900">Gerir Turma</span>
                  </button>
                )}
             </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;