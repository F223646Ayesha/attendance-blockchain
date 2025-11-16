# Attendance Blockchain System – README

I built this project as a fully functional **Attendance Management System powered by blockchain**, using a secure chain-of-trust design across Departments, Classes, Students, and Attendance records. My goal was to ensure tamper-proof attendance storage, transparent history, and cryptographic verification of every update.

## Project Overview

This system maintains attendance data using a **multi-layer blockchain** structure:

- Department Chain
- Class Chain
- Student Chain
- Attendance Blocks

Every operation—adding departments, creating classes, adding students, or marking attendance—results in a **mined block** stored with SHA-256 hashing and Proof of Work.

My backend enforces consistent parent-child chain linking, and the frontend provides a complete interface for CRUD, search, attendance marking, chain inspection, and blockchain validation.

## Main Features

### 1. Blockchain Architecture
I implemented a 3-layer blockchain:

Department → Class → Student → Attendance

### 2. Cryptography
- SHA-256 hashing for every block
- Proof of Work (difficulty = 4)
- Hash re-computation during validation

### 3. CRUD Operations
Full CRUD for:
- Departments  
- Classes  
- Students  

### 4. Attendance Management
Secure attendance marking with:
- Present / Absent / Leave  
- Duplicate prevention  
- Attendance stored as a mined block  

### 5. Blockchain Explorer
Allows inspection of:
- Department chains  
- Class chains  
- Student chains  

### 6. Validation Engine
- Validates every chain  
- Verifies PoW  
- Validates parent-child hash linking  
- Generates a full validation report  

### 7. Search System
Global search across:
- Departments  
- Classes  
- Students  
- Roll numbers  
- Names  

## Project Structure
attendance-blockchain/
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── db/saved.json
│   ├── server.js
├── frontend/
│   ├── pages/
│   ├── app.js
│   ├── api.js
│   ├── ui.js
│   ├── components.js
│   ├── index.html
└── README.md

## How I Run the Backend
cd backend
npm install
node server.js

Runs on: http://localhost:5000

## How I Run the Frontend
Open frontend/index.html using Live Server or any static server.

## API Endpoints (Summary)
### Departments
POST /departments/add  
GET /departments/all  
PUT /departments/update/:name  
PUT /departments/delete/:name  
GET /departments/chain/:dept  

### Classes
POST /classes/add  
GET /classes/:dept  
PUT /classes/update/:dept/:class  
PUT /classes/delete/:dept/:class  
GET /classes/chain/:dept/:class  

### Students
POST /students/add  
GET /students/:dept/:class  
PUT /students/update/:d/:c/:roll  
PUT /students/delete/:d/:c/:roll  
GET /students/chain/:d/:c/:roll  

### Attendance
POST /attendance/mark  
GET /attendance/ledger/:dept/:class/:roll  

### Validation
GET /validate/all

## Author
I built:
- Blockchain logic  
- Backend APIs  
- Frontend UI  
- Validation engine  
- Hashing & PoW  
- Search & explorer  
