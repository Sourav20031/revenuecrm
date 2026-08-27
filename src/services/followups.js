import api from './api.js';

export function fetchFollowUps(params = {}) {
  return api.get('/followups', { params });
}

export function createFollowUp(payload) {
  return api.post('/followups', payload);
}

export function updateFollowUp(id, payload) {
  return api.put(`/followups/${id}`, payload);
}

export function deleteFollowUp(id) {
  return api.delete(`/followups/${id}`);
}
