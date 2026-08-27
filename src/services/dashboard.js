import api from './api.js';

export function fetchDashboard() {
  return api.get('/dashboard');
}
