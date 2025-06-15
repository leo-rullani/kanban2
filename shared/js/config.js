// Beispiel-User für Guest-Login (optional, kann im Frontend als Button angeboten werden)
const GUEST_LOGIN = {
    email: "leugzimrullani@outlook.com",
    password: "Nike#1995"
};

// Basis-URL für alle API-Endpunkte
const API_BASE_URL = 'http://127.0.0.1:8000/api/auth/';

// Endpunkte (relativ zur API_BASE_URL)
const LOGIN_URL = 'login/';
const REGISTER_URL = 'registration/';
const BOARDS_URL = '../kanban/boards/';  // Boards liegen meist in einer eigenen App, daher ../kanban/
const MAIL_CHECK_URL = 'email-check/';
const TASKS_URL = '../kanban/tasks/';
const TASKS_ASSIGNED_URL = '../kanban/tasks/assigned-to-me/';
const TASKS_REVIEWER_URL = '../kanban/tasks/reviewing/';