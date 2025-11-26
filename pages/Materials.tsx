import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { materialApi } from '../services/mockApi';
import { Material, UserRole } from '../types';
import { SUBJECTS } from '../constants';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Plus, Search, FileText, File, Download, Eye, X, Trash2 } from 'lucide-react';

const Materials: React.FC = () => {
  const { user } = useAuth();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [filteredMaterials, setFilteredMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  // Filters
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('Todas');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newMaterial, setNewMaterial] = useState({
    title: '',
    description: '',
    subject: SUBJECTS[0],
    file: null as File | null
  });

  // Preview State
  const [previewFile, setPreviewFile] = useState<Material | null>(null);

  useEffect(() => {
    loadMaterials();
  }, []);

  useEffect(() => {
    let result = materials;
    if (search) {
      result = result.filter(m => m.title.toLowerCase().includes(search.toLowerCase()));
    }
    if (subjectFilter !== 'Todas') {
      result = result.filter(m => m.subject === subjectFilter);
    }
    setFilteredMaterials(result);
  }, [materials, search, subjectFilter]);

  const loadMaterials = async () => {
    setLoading(true);
    const data = await materialApi.getAll();
    setMaterials(data);
    setLoading(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewMaterial({ ...newMaterial, file: e.target.files[0] });
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMaterial.file || !user) return;
    setUploading(true);

    try {
      const fileType = newMaterial.file.name.endsWith('.pdf') ? 'PDF' : 
                       newMaterial.file.name.endsWith('.docx') ? 'DOCX' : 'OTHER';
      
      const matData: Material = {
        id: '',
        title: newMaterial.title,
        description: newMaterial.description,
        subject: newMaterial.subject,
        type: fileType as any,
        url: '',
        createdAt: new Date().toISOString(),
        uploadedBy: user.name
      };

      await materialApi.add(matData, newMaterial.file);
      await loadMaterials();
      setIsModalOpen(false);
      setNewMaterial({ title: '', description: '', subject: SUBJECTS[0], file: null });
    } catch (error) {
      alert('Erro ao fazer upload. Verifique sua conexão.');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este material?')) {
      await materialApi.delete(id);
      await loadMaterials();
    }
  };

  const isTeacher = user?.role === UserRole.TEACHER;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Materiais de Estudo</h1>
          <p className="text-gray-500 text-sm">Acesse e gerencie documentos do curso.</p>
        </div>
        {isTeacher && (
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" /> Enviar Material
          </Button>
        )}
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Buscar por título..." 
              className="pl-9" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-48">
            <select 
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md border"
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
            >
              <option value="Todas">Todas as Matérias</option>
              {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Carregando materiais...</div>
        ) : filteredMaterials.length === 0 ? (
          <div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
            Nenhum material encontrado.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredMaterials.map((item) => (
              <div key={item.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-start justify-between">
                    <div className={`p-2 rounded-lg ${item.type === 'PDF' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                      {item.type === 'PDF' ? <FileText size={24} /> : <File size={24} />}
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {item.subject}
                    </span>
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-gray-900 truncate" title={item.title}>{item.title}</h3>
                  <p className="mt-1 text-sm text-gray-500 line-clamp-2">{item.description}</p>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs text-gray-400">{new Date(item.createdAt).toLocaleDateString('pt-BR')}</span>
                  <div className="flex space-x-2">
                    {isTeacher && (
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Excluir Material"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                    <button 
                      onClick={() => setPreviewFile(item)}
                      className="p-1.5 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors"
                      title="Visualizar"
                    >
                      <Eye size={18} />
                    </button>
                    <a 
                      href={item.url} 
                      download={item.title}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                      title="Baixar"
                    >
                      <Download size={18} />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true" onClick={() => setIsModalOpen(false)}>
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div className="sm:flex sm:items-start">
                <div className="w-full">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Enviar Novo Material</h3>
                  <form onSubmit={handleUpload} className="space-y-4">
                    <Input 
                      label="Título" 
                      value={newMaterial.title} 
                      onChange={(e) => setNewMaterial({...newMaterial, title: e.target.value})}
                      required 
                    />
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Matéria</label>
                      <select 
                         className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md border"
                         value={newMaterial.subject}
                         onChange={(e) => setNewMaterial({...newMaterial, subject: e.target.value})}
                      >
                        {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                      <textarea 
                        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md p-2"
                        rows={3}
                        value={newMaterial.description}
                        onChange={(e) => setNewMaterial({...newMaterial, description: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Arquivo (PDF ou DOCX)</label>
                      <input 
                        type="file" 
                        accept=".pdf,.docx,.doc"
                        onChange={handleFileChange}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                        required
                      />
                    </div>
                    <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                      <Button type="submit" className="w-full sm:ml-3 sm:w-auto" isLoading={uploading}>
                        {uploading ? 'Enviando...' : 'Enviar'}
                      </Button>
                      <Button type="button" variant="secondary" className="mt-3 w-full sm:mt-0 sm:w-auto" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4 bg-black bg-opacity-75">
           <div className="bg-white w-full h-full max-w-5xl rounded-lg flex flex-col overflow-hidden">
              <div className="flex justify-between items-center p-4 border-b">
                 <h3 className="font-semibold text-lg">{previewFile.title}</h3>
                 <button onClick={() => setPreviewFile(null)} className="p-1 hover:bg-gray-100 rounded-full">
                    <X size={24} />
                 </button>
              </div>
              <div className="flex-1 bg-gray-100 relative">
                 {previewFile.type === 'PDF' ? (
                   <iframe 
                      src={previewFile.url} 
                      className="w-full h-full" 
                      title="PDF Preview"
                   />
                 ) : (
                   <div className="flex flex-col items-center justify-center h-full text-gray-500">
                      <File size={64} className="mb-4" />
                      <p className="text-lg">Pré-visualização não disponível para arquivos {previewFile.type}.</p>
                      <Button onClick={() => window.open(previewFile.url, '_blank')} className="mt-4">
                         Baixar para Visualizar
                      </Button>
                   </div>
                 )}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Materials;