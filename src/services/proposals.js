import api from './api.js';

export function fetchProposals(params = {}) {
  return api.get('/proposals', { params });
}

export function createProposal(payload) {
  return api.post('/proposals', payload);
}

export function updateProposal(id, payload) {
  return api.put(`/proposals/${id}`, payload);
}
