import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { studentApi } from '../services/mockApi';
import { Student } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Plus, Trash2, Edit2, Search } from 'lucide-react';

const Students: React.FC = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({ name: '', email: '', class: '' });

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    const data = await studentApi.getAll();
    setStudents(data);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const student: Student = {
      id: editingId || Date.now().toString(),
      ...formData
    };
    await studentApi.save(student);
    await loadStudents();
    closeModal();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Excluir este aluno?')) {
      await studentApi.delete(id);
      loadStudents();
    }
  };

  const openModal = (student?: Student) => {
    if (student) {
      setEditingId(student.id);
      setFormData({ name: student.name, email: student.email, class: student.class });
    } else {
      setEditingId(null);
      setFormData({ name: '', email: '', class: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  if (user?.role !== 'TEACHER') {
    return <div className="text-center p-10">Acesso Negado</div>;
  }

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Alunos</h1>
          <p className="text-gray-500 text-sm">Gerencie as matrículas da turma.</p>
        </div>
        <Button onClick={() => openModal()}>
          <Plus className="w-4 h-4 mr-2" /> Adicionar Aluno
        </Button>
      </div>

      <Card>
        <div className="mb-4 relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Buscar alunos..." 
              className="pl-9 max-w-md"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">E-mail</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Turma</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudents.map((student) => (
                <tr key={student.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold">
                        {student.name.charAt(0)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{student.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {student.class}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => openModal(student)} className="text-indigo-600 hover:text-indigo-900 mr-4">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(student.id)} className="text-red-600 hover:text-red-900">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold mb-4">{editingId ? 'Editar Aluno' : 'Adicionar Novo Aluno'}</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <Input 
                label="Nome Completo"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                required
              />
              <Input 
                label="E-mail"
                type="email"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                required
              />
              <Input 
                label="Turma / Série"
                value={formData.class}
                onChange={e => setFormData({...formData, class: e.target.value})}
                required
              />
              <div className="flex justify-end space-x-2 mt-4">
                <Button type="button" variant="secondary" onClick={closeModal}>Cancelar</Button>
                <Button type="submit">Salvar</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;