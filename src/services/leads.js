import api from './api.js';

export function fetchLeads(params = {}) {
  return api.get('/leads', { params });
}

export function fetchLeadById(id) {
  return api.get(`/leads/${id}`);
}

export function createLead(payload) {
  return api.post('/leads', payload);
}

export function updateLead(id, payload) {
  return api.put(`/leads/${id}`, payload);
}

export function deleteLead(id) {
  return api.delete(`/leads/${id}`);
}

export function updateLeadStage(id, stage) {
  return api.put(`/leads/${id}/stage`, { stage });
}

export function fetchLeadTimeline(id) {
  return api.get(`/leads/${id}/timeline`);
}
