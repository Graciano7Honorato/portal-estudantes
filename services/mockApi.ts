import { supabase } from './supabase';
import { Material, CalendarEvent, ChatMessage, Student } from '../types';

// --- Materials API ---
export const materialApi = {
  getAll: async (): Promise<Material[]> => {
    const { data, error } = await supabase
      .from('materials')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching materials:', error);
      return [];
    }
    
    // Map database fields to TS type
    return data.map((item: any) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      subject: item.subject,
      type: item.type,
      url: item.url,
      createdAt: item.created_at,
      uploadedBy: item.uploaded_by || 'Professor'
    }));
  },
  
  add: async (material: Material, file?: File): Promise<Material> => {
    // 1. Upload File
    if (!file) throw new Error("No file provided");
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;
    
    const { error: uploadError } = await supabase.storage
      .from('materials')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // 2. Get Public URL
    const { data: { publicUrl } } = supabase.storage
      .from('materials')
      .getPublicUrl(filePath);

    // 3. Insert into DB
    const { data, error } = await supabase
      .from('materials')
      .insert([{
        title: material.title,
        description: material.description,
        subject: material.subject,
        type: material.type,
        url: publicUrl,
        uploaded_by: material.uploadedBy
      }])
      .select()
      .single();

    if (error) throw error;
    
    return {
        ...material,
        id: data.id,
        url: publicUrl,
        createdAt: data.created_at
    };
  },
  
  delete: async (id: string): Promise<void> => {
    // Note: In production, you should also delete the file from Storage bucket
    // using the filename derived from the URL.
    const { error } = await supabase
      .from('materials')
      .delete()
      .eq('id', id);
      
    if (error) console.error('Error deleting material:', error);
  }
};

// --- Events API ---
export const eventApi = {
  getAll: async (): Promise<CalendarEvent[]> => {
    const { data, error } = await supabase
      .from('events')
      .select('*');
      
    if (error) return [];

    return data.map((e: any) => ({
      id: e.id,
      title: e.title,
      description: e.description,
      start: e.start_time,
      end: e.end_time,
      type: e.type,
      subject: e.subject,
      createdBy: e.created_by
    }));
  },
  
  add: async (event: CalendarEvent): Promise<CalendarEvent> => {
    const { data, error } = await supabase
      .from('events')
      .insert([{
        title: event.title,
        description: event.description,
        start_time: event.start,
        end_time: event.end,
        type: event.type,
        subject: event.subject,
        created_by: event.createdBy
      }])
      .select()
      .single();

    if (error) throw error;
    
    return { ...event, id: data.id };
  },
  
  delete: async (id: string): Promise<void> => {
    await supabase.from('events').delete().eq('id', id);
  }
};

// --- Chat API ---
export const chatApi = {
  getHistory: async (): Promise<ChatMessage[]> => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(100);

    if (error) return [];

    return data.map((msg: any) => ({
      id: msg.id,
      userId: msg.user_id,
      userName: msg.user_name,
      userRole: msg.user_role,
      text: msg.text,
      timestamp: msg.created_at
    }));
  },
  
  saveMessage: async (msg: ChatMessage) => {
    await supabase.from('messages').insert([{
      user_id: msg.userId,
      user_name: msg.userName,
      user_role: msg.userRole,
      text: msg.text,
      created_at: msg.timestamp
    }]);
  }
};

// --- Students API ---
export const studentApi = {
  getAll: async (): Promise<Student[]> => {
    const { data, error } = await supabase.from('students').select('*');
    if (error) return [];
    return data;
  },
  
  // Função nova: Sincroniza usuário logado com a tabela pública de alunos
  syncLoggedUser: async (name: string, email: string) => {
    try {
      // Verifica se o email já existe na tabela de estudantes
      const { data } = await supabase
        .from('students')
        .select('id')
        .eq('email', email)
        .maybeSingle();

      // Se não existir, insere automaticamente
      if (!data) {
        await supabase.from('students').insert([{
           name: name,
           email: email,
           class: 'Nova Matrícula' // Valor padrão
        }]);
        console.log(`Usuário ${email} sincronizado para a lista de alunos.`);
      }
    } catch (error) {
      console.error('Erro ao sincronizar usuário:', error);
    }
  },

  save: async (student: Student): Promise<Student> => {
    const payload = {
       name: student.name,
       email: student.email,
       class: student.class
    };

    if (student.id && student.id.length > 20) {
       const { data, error } = await supabase
        .from('students')
        .update(payload)
        .eq('id', student.id)
        .select()
        .single();
       if (error) throw error;
       return data;
    } else {
       const { data, error } = await supabase
        .from('students')
        .insert([payload])
        .select()
        .single();
       if (error) throw error;
       return data;
    }
  },
  
  delete: async (id: string): Promise<void> => {
    await supabase.from('students').delete().eq('id', id);
  }
};