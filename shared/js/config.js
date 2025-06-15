// Beispiel-User für Guest-Login (optional, kann im Frontend als Button angeboten werden)
const GUEST_LOGIN = {
    email: "leugzimrullani@outlook.com",
    password: "Nike#1995"
};

// Basis-URLs für API-Endpunkte (auth und kanban getrennt)
const API_BASE_URL_AUTH = 'http://127.0.0.1:8000/api/auth/';
const API_BASE_URL_KANBAN = 'http://127.0.0.1:8000/api/kanban/';

// Auth-Endpoints (relativ zur API_BASE_URL_AUTH)
const LOGIN_URL = API_BASE_URL_AUTH + 'login/';
const REGISTER_URL = API_BASE_URL_AUTH + 'registration/';
const MAIL_CHECK_URL_AUTH = API_BASE_URL_AUTH + 'email-check/';

// Kanban-Endpoints (relativ zur API_BASE_URL_KANBAN)
const BOARDS_URL = API_BASE_URL_KANBAN + 'boards/';
const MAIL_CHECK_URL_KANBAN = API_BASE_URL_KANBAN + 'email-check/';

const TASKS_URL = API_BASE_URL_KANBAN + 'tasks/';
const TASKS_ASSIGNED_URL = API_BASE_URL_KANBAN + 'tasks/assigned-to-me/';
const TASKS_REVIEWER_URL = API_BASE_URL_KANBAN + 'tasks/reviewing/';