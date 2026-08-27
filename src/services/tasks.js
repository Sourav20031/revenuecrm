import api from './api.js';

export function fetchTasks(params = {}) {
  return api.get('/tasks', { params });
}

export function createTask(payload) {
  return api.post('/tasks', payload);
}

export function updateTask(id, payload) {
  return api.put(`/tasks/${id}`, payload);
}

export function deleteTask(id) {
  return api.delete(`/tasks/${id}`);
}
