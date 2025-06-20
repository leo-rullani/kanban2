// Beispiel-User für Guest-Login (optional, kann im Frontend als Button angeboten werden)
const GUEST_LOGIN = {
    email: "guest@kanmind.local.ch",
    password: "GuestDemo123!"
};

// Basis-URL für alle API-Endpunkte
const API_BASE_URL = 'http://127.0.0.1:8000/api/';

// Endpunkte (relativ zur API_BASE_URL)
const LOGIN_URL = 'login/';
const REGISTER_URL = 'registration/';
const BOARDS_URL = 'boards/';
const MAIL_CHECK_URL = 'email-check/';
const TASKS_URL = 'tasks/';
const TASKS_ASSIGNED_URL = 'tasks/assigned-to-me/';
const TASKS_REVIEWER_URL = 'tasks/reviewing/';