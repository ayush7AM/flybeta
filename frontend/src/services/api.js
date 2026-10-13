import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1/',
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Auth Interceptors ───────────────────────────────────────────────────

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('flybeta_access');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('flybeta_refresh');
      
      if (refreshToken) {
        try {
          // Attempt to refresh token
          const { data } = await axios.post('/api/v1/auth/refresh/', {
            refresh: refreshToken
          });
          
          localStorage.setItem('flybeta_access', data.access);
          // Don't update refresh token unless backend returns a new one
          if (data.refresh) {
            localStorage.setItem('flybeta_refresh', data.refresh);
          }
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${data.access}`;
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh failed, clear tokens
          localStorage.removeItem('flybeta_access');
          localStorage.removeItem('flybeta_refresh');
          // Dispatch a custom event so AuthContext can log user out
          window.dispatchEvent(new Event('flybeta:logout'));
          return Promise.reject(refreshError);
        }
      }
    }
    return Promise.reject(error);
  }
);

// ── Domain endpoints ────────────────────────────────────────────────────
export const domainCache = {};
const domainPromises = {};

// Helpers to safely read/write localStorage
const readLocal = (key) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (e) {
    return null;
  }
};
const writeLocal = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {}
};

export const getCachedDomainsList = () => {
  return readLocal('flybeta_tracks_list');
};

export const getCachedDomain = (name) => {
  if (domainCache[name]) return domainCache[name];
  const local = readLocal(`flybeta_track_${name}`);
  if (local) {
    domainCache[name] = local;
    return local;
  }
  return null;
};

export const getDomains = async () => {
  const { data } = await api.get('domains/');
  const results = data.results || data;
  const finalResults = Array.isArray(results) ? results : [];
  writeLocal('flybeta_tracks_list', finalResults);
  return data;
};

export const getDomain = (name) => {
  // Return the active promise if a fetch is already in flight
  if (domainPromises[name]) return domainPromises[name];
  
  // Otherwise, trigger a new network fetch (Stale-While-Revalidate)
  const fetchPromise = api.get(`domains/${name}/`).then(({ data }) => {
    domainCache[name] = data;
    writeLocal(`flybeta_track_${name}`, data);
    // Clear promise so subsequent calls will re-fetch if needed
    delete domainPromises[name];
    return data;
  }).catch((err) => {
    delete domainPromises[name];
    throw err;
  });
  
  domainPromises[name] = fetchPromise;
  return fetchPromise;
};

export const prefetchDomain = (name) => {
  if (!domainCache[name]) {
    getDomain(name).catch(() => {}); // silent fail
  }
};

// ── Level endpoints ─────────────────────────────────────────────────────
export const getLevels = async (domainName) => {
  const params = domainName ? { domain: domainName } : {};
  const { data } = await api.get('levels/', { params });
  return data;
};

export const getLevel = async (id) => {
  const { data } = await api.get(`levels/${id}/`);
  return data;
};

// Graded server-side — returns { passed, score, total, level_unlocked, user }
export const submitLevelQuiz = async (levelId, answers) => {
  const { data } = await api.post(`levels/${levelId}/pass_quiz/`, { answers });
  return data;
};

// ── Lesson endpoints ────────────────────────────────────────────────────
export const getLessons = async (levelId) => {
  const params = levelId ? { level: levelId } : {};
  const { data } = await api.get('lessons/', { params });
  return data;
};

export const getLesson = async (id) => {
  const { data } = await api.get(`lessons/${id}/`);
  return data;
};
// ── Auth endpoints ────────────────────────────────────────────────────────
export const loginUser = async (username, password) => {
  const { data } = await api.post('auth/login/', { username, password });
  return data;
};

export const registerUser = async (userData) => {
  const { data } = await api.post('auth/register/', userData);
  return data;
};

export const requestPasswordReset = async (email) => {
  const { data } = await api.post('auth/password-reset/', { email });
  return data;
};

export const resetPassword = async (uid, token, new_password) => {
  const { data } = await api.post('auth/password-reset-confirm/', { uid, token, new_password });
  return data;
};

// ── User endpoints ──────────────────────────────────────────────────────
export const getUserStats = async () => {
  const { data } = await api.get('users/me/');
  return data;
};

export const getUserProfile = async () => {
  const { data } = await api.get('users/profile/');
  return data;
};

export const updateActiveTheme = async (themeName) => {
  const { data } = await api.patch('users/profile/', { theme_preference: themeName });
  return data;
};

export const updateProfileData = async (formData) => {
  const { data } = await api.patch('users/profile/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const getActivity = async (days = 182) => {
  const { data } = await api.get('users/activity/', { params: { days } });
  return data;
};

// Public — anyone with the link can verify a certificate
export const getCertificate = async (certificateId) => {
  const { data } = await api.get(`certificates/${certificateId}/`);
  return data;
};

// Spend coins to repair a recently broken streak
export const restoreStreak = async () => {
  const { data } = await api.post('users/streak/restore/');
  return data;
};

export const completeLesson = async (lessonId) => {
  const { data } = await api.post(`lessons/${lessonId}/complete/`);
  return data;
};

// ── AI endpoints ────────────────────────────────────────────────────────
export const generateBlueprint = async (prompt) => {
  const { data } = await api.post('ai/architect/', { prompt });
  return data;
};

export const reviewCode = async (code, language = 'python') => {
  const { data } = await api.post('ai/reviewer/', { code, language });
  return data;
};

export const extractVideoKnowledge = async (videoUrl) => {
  const { data } = await api.post('ai/synapse/', { video_url: videoUrl });
  return data;
};

export const askOracle = async (message, history) => {
  const { data } = await api.post('ai/oracle/', { message, history });
  return data.reply;
};

export default api;
