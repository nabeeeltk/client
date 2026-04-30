import axios from 'axios';

/**
 * AXIOS CONFIGURATION
 */
const api = axios.create({
  // Your Vercel backend URL
  baseURL: 'https://server-c6du4omry-nabeel-tks-projects.vercel.app/api',
  headers: { 'Content-Type': 'application/json' }
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirect to login if on the browser
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

/**
 * API SERVICE EXPORTS
 */

// Auth
export const login = (data) => api.post('/auth/login', data);
export const logout = () => api.post('/auth/logout');
export const getMe = () => api.get('/auth/me');

// Units
export const getUnits = () => api.get('/units');
export const getUnit = (id) => api.get(`/units/${id}`);

// Members
export const getAllMembers = () => api.get('/members/all');
export const getUnitMembers = (unitId) => api.get(`/members/unit/${unitId}`);
export const createMember = (formData) => api.post('/members', formData, { 
  headers: { 'Content-Type': 'multipart/form-data' } 
});
export const updateMember = (id, formData) => api.put(`/members/${id}`, formData, { 
  headers: { 'Content-Type': 'multipart/form-data' } 
});
export const deleteMember = (id) => api.delete(`/members/${id}`);
export const uploadMemberPhoto = (id, formData) => api.post(`/members/${id}/photo`, formData, { 
  headers: { 'Content-Type': 'multipart/form-data' } 
});

// Programmes
export const getProgrammes = () => api.get('/programmes');
export const getUnitProgrammes = (unitId) => api.get(`/programmes/unit/${unitId}`);
export const createProgramme = (formData) => api.post('/programmes', formData, { 
  headers: { 'Content-Type': 'multipart/form-data' } 
});
export const updateProgramme = (id, formData) => api.put(`/programmes/${id}`, formData, { 
  headers: { 'Content-Type': 'multipart/form-data' } 
});
export const deleteProgramme = (id) => api.delete(`/programmes/${id}`);

// Announcements
export const getAnnouncements = () => api.get('/announcements');
export const createAnnouncement = (data) => api.post('/announcements', data);
export const updateAnnouncement = (id, data) => api.put(`/announcements/${id}`, data);
export const deleteAnnouncement = (id) => api.delete(`/announcements/${id}`);

// Gallery
export const getGallery = (programmeId) => api.get('/gallery', { 
  params: programmeId ? { programme_id: programmeId } : {} 
});
export const uploadGallery = (formData) => api.post('/gallery', formData, { 
  headers: { 'Content-Type': 'multipart/form-data' } 
});
export const deleteGalleryPhoto = (id) => api.delete(`/gallery/${id}`);

// Blood Members
export const getAllBloodMembers = () => api.get('/blood/all');
export const getUnitBloodMembers = (unitId, bloodGroup) => api.get(`/blood/unit/${unitId}`, { 
  params: bloodGroup ? { blood_group: bloodGroup } : {} 
});
export const createBloodMember = (data) => api.post('/blood', data);
export const updateBloodMember = (id, data) => api.put(`/blood/${id}`, data);
export const deleteBloodMember = (id) => api.delete(`/blood/${id}`);

// Unit Uploads
export const getAllUploads = () => api.get('/uploads/all');
export const getUnitUploads = (unitId) => api.get(`/uploads/unit/${unitId}`);
export const createUpload = (formData) => api.post('/uploads', formData, { 
  headers: { 'Content-Type': 'multipart/form-data' } 
});
export const deleteUpload = (id) => api.delete(`/uploads/${id}`);

// Leaderboard & Scores
export const getLeaderboard = () => api.get('/leaderboard');
export const getLeaderboardByProgramme = (programmeId) => api.get(`/leaderboard/${programmeId}`);
export const createScore = (data) => api.post('/scores', data);
export const updateScore = (id, data) => api.put(`/scores/${id}`, data);
export const getUnitScores = (unitId) => api.get(`/scores/unit/${unitId}`);

export default api;