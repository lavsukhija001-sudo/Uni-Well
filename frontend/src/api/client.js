const BASE_URL = 'http://localhost:8000';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const handleResponse = async (res) => {
  if (res.status === 401) {
    localStorage.removeItem('token');
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
    return null;
  }
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.detail || 'API request failed');
  }
  return res.json();
};

export const api = {
  // Auth
  login: (data) =>
    fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  register: (data) =>
    fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  getMe: () =>
    fetch(`${BASE_URL}/api/auth/me`, {
      headers: getHeaders(),
    }).then(handleResponse),

  // Student
  getDashboard: () =>
    fetch(`${BASE_URL}/api/student/dashboard`, {
      headers: getHeaders(),
    }).then(handleResponse),

  getProfile: () =>
    fetch(`${BASE_URL}/api/student/profile`, {
      headers: getHeaders(),
    }).then(handleResponse),

  updateProfile: (data) =>
    fetch(`${BASE_URL}/api/student/profile`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  // Counselling
  createRequest: (data) =>
    fetch(`${BASE_URL}/api/counselling/request`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  getMyRequests: () =>
    fetch(`${BASE_URL}/api/counselling/my-requests`, {
      headers: getHeaders(),
    }).then(handleResponse),

  getRequest: (id) =>
    fetch(`${BASE_URL}/api/counselling/request/${id}`, {
      headers: getHeaders(),
    }).then(handleResponse),

  // Questionnaire
  getQuestions: (category) => {
    const query = category ? `?category=${encodeURIComponent(category)}` : '';
    return fetch(`${BASE_URL}/api/questionnaire${query}`, {
      headers: getHeaders(),
    }).then(handleResponse);
  },

  submitAnswers: (data) =>
    fetch(`${BASE_URL}/api/questionnaire/submit`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  // Counsellor
  getQueue: (params = {}) => {
    const searchParams = new URLSearchParams();
    if (params.priority) searchParams.append('priority', params.priority);
    if (params.status) searchParams.append('status', params.status);
    if (params.concern) searchParams.append('concern', params.concern);
    if (params.search) searchParams.append('search', params.search);
    const qs = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return fetch(`${BASE_URL}/api/counsellor/queue${qs}`, {
      headers: getHeaders(),
    }).then(handleResponse);
  },

  getStudentDetail: (id) =>
    fetch(`${BASE_URL}/api/counsellor/request/${id}`, {
      headers: getHeaders(),
    }).then(handleResponse),

  updatePriority: (id, data) =>
    fetch(`${BASE_URL}/api/counsellor/request/${id}/priority`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  createAppointment: (id, data) =>
    fetch(`${BASE_URL}/api/counsellor/request/${id}/appointment`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  escalate: (id) =>
    fetch(`${BASE_URL}/api/counsellor/request/${id}/escalate`, {
      method: 'POST',
      headers: getHeaders(),
    }).then(handleResponse),

  review: (id) =>
    fetch(`${BASE_URL}/api/counsellor/request/${id}/review`, {
      method: 'POST',
      headers: getHeaders(),
    }).then(handleResponse),

  requestMoreInfo: (id) =>
    fetch(`${BASE_URL}/api/counsellor/request/${id}/more-info`, {
      method: 'POST',
      headers: getHeaders(),
    }).then(handleResponse),

  // Support Groups
  getGroups: () =>
    fetch(`${BASE_URL}/api/groups`, {
      headers: getHeaders(),
    }).then(handleResponse),

  createGroup: (data) =>
    fetch(`${BASE_URL}/api/groups`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  joinGroup: (id) =>
    fetch(`${BASE_URL}/api/groups/${id}/join`, {
      method: 'POST',
      headers: getHeaders(),
    }).then(handleResponse),

  // Analytics
  getAnalytics: () =>
    fetch(`${BASE_URL}/api/analytics/overview`, {
      headers: getHeaders(),
    }).then(handleResponse),

  // Chatbot
  sendMessage: (data) =>
    fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  // Notifications
  getNotifications: () =>
    fetch(`${BASE_URL}/api/notifications`, {
      headers: getHeaders(),
    }).then(handleResponse),

  markNotificationRead: (id) =>
    fetch(`${BASE_URL}/api/notifications/${id}/read`, {
      method: 'PUT',
      headers: getHeaders(),
    }).then(handleResponse),

  markAllNotificationsRead: () =>
    fetch(`${BASE_URL}/api/notifications/read-all`, {
      method: 'POST',
      headers: getHeaders(),
    }).then(handleResponse),
};
