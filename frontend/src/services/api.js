import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = {
  // Get all persons
  getPersons: () => axios.get(`${API_BASE_URL}/persons`),

  // Get single person
  getPerson: (id) => axios.get(`${API_BASE_URL}/persons/${id}`),

  // Create person
  createPerson: (data) => axios.post(`${API_BASE_URL}/persons`, data),

  // Update person
  updatePerson: (id, data) => axios.put(`${API_BASE_URL}/persons/${id}`, data),

  // Delete person
  deletePerson: (id) => axios.delete(`${API_BASE_URL}/persons/${id}`),

  // Get tree structure
  getTreeStructure: () => axios.get(`${API_BASE_URL}/persons/tree/structure`),

  // Search persons
  searchPersons: (query) => axios.post(`${API_BASE_URL}/persons/search`, { query })
};

export default api;
