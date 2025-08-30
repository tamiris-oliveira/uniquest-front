import axios from 'axios';

// Configurar axios para preservar IDs grandes como strings
axios.defaults.transformResponse = [(data) => {
  if (typeof data === 'string') {
    try {
      // Usar regex para converter IDs grandes em strings no JSON raw
      const processedJson = data.replace(
        /"(id|user_id|course_id|creator_id|question_id|simulation_id|group_id|subject_id|attempt_id|answer_id|correction_id)"\s*:\s*(\d{16,})/g,
        '"$1":"$2"'
      );
      
      return JSON.parse(processedJson);
    } catch (error) {
      // Fallback para parsing normal
      try {
        return JSON.parse(data);
      } catch {
        return data;
      }
    }
  }
  return data;
}];

export default axios;
