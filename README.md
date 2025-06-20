# BBM Kanban Frontend

![BBM Kanban Logo](assets/icons/logo_icon.svg)

This repository contains the **frontend** for the BBM Kanban Board solution, built for internal use at **BBM Broadcasting**.
It is a lightweight, framework-free JavaScript application, designed to interact seamlessly with the [BBM Kanban Backend](#backend) (Django REST Framework) and provide a responsive, modern user experience for project management and broadcasting workflows.

---

## Prerequisites

* An operational [BBM Kanban Backend](https://github.com/leo-rullani/kanban) (Django REST Framework) — not included here.
* [Visual Studio Code](https://code.visualstudio.com/) (recommended) with the **Live Server** extension, or any static server to run `index.html` locally in your browser.

---

## Getting Started

1. **Ensure the backend is running.**
2. Clone or download this repository.
3. Open the project in Visual Studio Code.
4. Right-click on `index.html` (in the project root) and select **Open with Live Server** to launch the frontend.
5. Log in using your BBM Kanban credentials (or create an account if you have backend admin rights).

---

## About the Project

* **Pure JavaScript**: No frameworks, no build steps. This keeps the project lightweight, transparent, and easy to adapt.
* **BBM Broadcasting Workflow**: Optimized for use within broadcast/production teams, supporting typical Kanban flows for task and resource management.
* **Modular Design**: The frontend is fully decoupled from the backend, allowing for independent updates and deployments.
* **RESTful API Integration**: All interactions with the backend occur via secure REST API calls (CRUD for boards, tasks, comments, user authentication, etc.).
* **Simple Customization**: UI and logic are easy to extend for additional broadcasting-specific features.

---

## Why No Framework?

* **Performance**: Minimal load, ideal for quick internal tools.
* **Transparency**: All logic is visible and modifiable without build steps or dependencies.
* **Training**: New team members can learn the essentials of frontend-backend interaction in a clear, direct way.

---

## Project Structure

```
/
├── assets/         # Icons, logos, images
├── js/             # JavaScript modules (API, UI, helpers, etc.)
├── styles/         # CSS files
├── index.html      # Main entry point
├── README.md       # This file
```

---

## Backend

The frontend is built to connect with the **BBM Kanban API Backend** (Django REST Framework):

* Custom user model (email login)
* Full CRUD for boards, tasks, comments
* Internal permission system (owners, members, BBM admins)
* Token authentication (DRF TokenAuth)
* Admin interface for all core objects
* PEP8 code style, <14 lines/method, all code documented

> See [Backend README](https://github.com/leo-rullani/kanban) for setup and API documentation.

---

## Notes

* **This project is for internal BBM Broadcasting use only.**
  Do not share or distribute outside the company.
* No sensitive data, secrets, or database files are included.
* Environment variables and secrets should be handled securely on the backend.
* Please refer to the [Django Deployment Checklist](https://docs.djangoproject.com/en/4.2/howto/deployment/checklist/) before going live.

---

## License

MIT License

---