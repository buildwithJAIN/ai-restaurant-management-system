# 🍽️ AI-Powered Full-Stack Restaurant Management System

A production-ready full-stack restaurant management platform built using Angular, Node.js, Express, PostgreSQL, and Prisma ORM. The system features role-based dashboards and AI-powered automation for menu creation and enhancement.

---

## 🚀 Project Overview

This application enables restaurants to manage operations end-to-end including:

- Role-based dashboards (Manager, Chef, Waiter, Host)
- Order lifecycle management
- Table management & availability tracking
- Reservation handling
- Billing & reporting
- AI-powered menu description generation
- Automated PDF → structured menu conversion
- Image integration for menu items

The project follows a clean mono-repo architecture separating frontend and backend for scalability and maintainability.

---

## 🏗️ System Architecture

Frontend (Angular)
        ↓
REST API (Node.js + Express)
        ↓
Prisma ORM
        ↓
PostgreSQL Database

### AI Layer
- LLM-powered menu description generation
- Automated conversion of PDF menus into structured JSON
- Image integration support for menu items

---

## 👥 Role-Based Access System

### 👨‍🍳 Chef Dashboard
- View kitchen order queue
- Update order status (In Progress / Completed)
- Monitor completed orders

### 🧑‍💼 Manager Dashboard
- Menu & category management
- Staff management
- Table management
- Reservation monitoring
- Reports & analytics
- AI-powered menu automation tools

### 🧑‍🍽 Waiter Dashboard
- Manage assigned tables
- Create & update orders
- Generate bills
- Track ready orders

### 🧑‍🏫 Host Dashboard
- Manage guest reservations
- Monitor table availability
- Coordinate seating flow

---

## 🧠 AI Integration

The system integrates Large Language Models (LLMs) to automate:

- Professional menu description generation
- Converting menu PDFs into structured JSON format
- Supporting image integration for menu items

This reduces manual menu setup time and improves operational efficiency.

---

## 🛠️ Technology Stack

### Frontend
- Angular
- TypeScript
- SCSS

### Backend
- Node.js
- Express.js
- Prisma ORM

### Database
- PostgreSQL

### AI Services
- Gemini API / OpenAI API

---

## 📂 Project Structure
ai-restaurant-management-system/
│
├── frontend/ # Angular application
├── backend/ # Express API + Prisma
├── .gitignore
└── README.md





---

## ⚙️ Installation & Setup

### 🔹 Backend Setup
cd backend
npm install
npx prisma migrate dev
npm start


Create a `.env` file using `.env.example` as a reference.

---

### 🔹 Frontend Setup
cd frontend
npm install
ng serve


Open in browser:
http://localhost:4200



---

## 🎯 Engineering Highlights

- Clean mono-repo architecture
- Modular REST API design
- Role-based authorization system
- Structured Prisma migrations
- AI-driven automation workflows
- Separation of concerns (frontend / backend / services)
- Production-ready environment handling

---

## 📌 Resume-Ready Summary

Built an AI-powered full-stack restaurant management system using Angular, Node.js, PostgreSQL, and Prisma ORM, implementing role-based dashboards, order lifecycle management, and AI-driven automated menu generation from PDF with structured image integration.

---

## 📄 License

This project is built for educational and portfolio demonstration purposes.

