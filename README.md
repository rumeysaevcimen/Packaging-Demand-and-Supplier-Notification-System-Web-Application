# Packaging Supplier & Customer Portal

A web application built with Next.js (React) frontend and NestJS backend to manage packaging product requests between customers and suppliers.
It supports basic authentication, product filtering, demand management and supplier interest tracking.

---

## Features

- **Basic Auth Authentication** using mock JSON user data.  
- **Customer Requests Management**: Customers can create product requests saved in backend/localStorage.  
- **Supplier Panel**: Suppliers can view requests, filter by product types, and express interest (approve/reject) in requests.  
- **Admin Panel (planned)**: Manage users, products, and requests (not detailed here).  
- **Dynamic Product Types** loaded from backend JSON file via REST API.  
- **LocalStorage-based persistence** for supplier approval/rejection statuses.

---

## Tech Stack

- Frontend: Next.js (React + TypeScript)  
- Backend: NestJS (TypeScript)  
- Data Storage: JSON files for mock data (users, product types, requests)  
- Authentication: Basic Auth simulated with JSON-based user validation  
- Communication: REST API between frontend and backend

---

## Project Structure

```
packaging-api/ Backend (NestJS)
├── src/
│ ├── data/ JSON mock data files
│ ├── controllers/ API controllers
│ └── ... Other backend files
└── ...

packaging-client/ Frontend (Next.js)
├── pages/ Next.js pages
├── components/ React components
└── ... Other frontend files
```



## Getting Started

### Prerequisites

- Node.js (v16+ recommended)
- npm or yarn
- Git

### Installation

1. Clone the repository:

```bash
git clone https://github.com/rumeysaevcimen/Packaging-Demand-and-Supplier-Notification-System-Web-Application.git
cd Packaging-Demand-and-Supplier-Notification-System-Web-Application
```

2. Install backend dependencies and run backend server:

```bash
cd packaging-api
npm install
npm run start:dev
```

Backend server runs on `http://localhost:3001` by default.

3. In a new terminal, install frontend dependencies and run frontend:

```bash
cd packaging-client
npm install
npm run dev
```

Frontend runs on `http://localhost:3000` by default.

---

## Usage

- Access the frontend on `http://localhost:3000`.
- Login using mock users defined in JSON.
- Use Admin panel to manage product types and view customer requests.
- Use Supplier panel to filter requests by product and approve/reject interests.
- Data persistence is simulated via JSON files in backend and LocalStorage in frontend.

---

## Notes

- Basic Authentication is mocked using JSON user data.
- Data files are located in the backend under `/src/data`.
- Product types and customer requests can be added via the backend API or admin frontend.
- The project can be deployed on platforms like Heroku or Vercel (setup not included here).

---





