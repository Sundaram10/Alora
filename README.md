# ALORA: Smart Campus Complaint Intelligence & Recommendation System

**ALORA** is an end-to-end AI-powered Smart Campus management platform that automates complaint triaging, department routing, severity scoring, resolution turnaround estimation, duplicate complaint detection, and technician recommendations.

---

## 🏛️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                          ALORA                              │
│       Smart Campus Platform (User / Admin / Technician)     │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
            ┌────────────────────────────────────┐
            │   Modern Web Frontend (HTML/CSS/JS)│
            │   Live Timeline & Duplicate Alert  │
            └──────────────────┬─────────────────┘
                               │ REST API
                               ▼
            ┌────────────────────────────────────┐
            │    Spring Boot Java 17 Backend     │
            │ • User & Role Management           │
            │ • Complaint Lifecycle Workflow     │
            │ • Auto Technician Assignment       │
            │ • Dispatcher & SLA Analytics       │
            └─────────────┬────────────────┬─────┘
                          │                │
                          ▼                ▼
                   ┌────────────┐   ┌──────────────┐
                   │   MySQL    │   │  Python ML   │
                   │  Database  │   │   FastAPI    │
                   │ (alora_db) │   │  Service     │
                   └────────────┘   └──────┬───────┘
                                           │
         ┌─────────────────────────────────┼─────────────────────────────────┐
         ▼                                 ▼                                 ▼
   Category Model                   Department Model                  Severity Model
(NLP Multi-class)                  (Routing Classifier)            (Urgency Classifier)
         │                                 │                                 │
         └─────────────────────────────────┼─────────────────────────────────┘
                                           ▼
                                 Resolution Time Model
                                  (Ridge / RF Regressor)
                                           │
                                           ▼
                                  Duplicate Detection
                                (Cosine Similarity + Loc)
                                           │
                                           ▼
                                  Recommendation Engine
                                (Priority Queue & Action Plan)
                                           │
                                           ▼
                                 Continuous Retraining
                               (Feedback Loop & Accuracy)
```

---

## 🚀 Quick Start (One-Click Launch)

To start all components together:

```cmd
start_alora.bat
```

This will automatically:
1. Launch the **Python FastAPI ML Service** at `http://127.0.0.1:8001`
2. Launch the **Java Spring Boot Backend** at `http://127.0.0.1:8080`
3. Open the **Responsive Web Frontend** in your default web browser

---

## 🔧 Component Details

### 1. Python + FastAPI ML Engine (`alora-ml-service/`)
- **Port**: `8001`
- **Interactive Swagger Docs**: [http://127.0.0.1:8001/docs](http://127.0.0.1:8001/docs)
- **Models**:
  - `Category Model`: Predicts problem domain (Electrical, Plumbing, IT & Network, HVAC, Civil, Sanitation).
  - `Department Model`: Automatically routes tickets to the appropriate campus maintenance division.
  - `Severity Model`: Scores urgency (LOW, MEDIUM, HIGH, CRITICAL) using text indicators and location criticality.
  - `Resolution Time Model`: Regressor estimating resolution hours for SLA compliance.
  - `Duplicate Detection Engine`: Combines TF-IDF cosine text similarity with location proximity to alert users of duplicate reports before dispatch.
  - `Recommendation Engine`: Suggests technician SOP checklists, required tools, and safety protocols.
  - `Retraining Pipeline`: Triggered via `POST /api/ml/retrain` to hot-reload model weights.

### 2. Spring Boot Java Backend (`alora-backend/`)
- **Port**: `8080`
- **Framework**: Spring Boot 3.2, Spring Data JPA, RESTful API
- **Java**: Java 17 (included in `tools/jdk-17`)
- **Build Tool**: Apache Maven 3.9 (included in `tools/maven`, executed via `mvn_local.bat`)
- **Database**: Configured for MySQL `alora_db` in `application.properties` with automatic schema creation and data seeding via `DataInitializer`.

### 3. MySQL Database (`database/`)
- **Scripts**:
  - `database/schema.sql`: Full DDL for users, departments, complaints, ml_predictions, feedback, and audit logs.
  - `database/seed_data.sql`: Seed data for campus buildings, student/faculty accounts, and historical complaints.
  - `setup_database.bat`: Helper script to run MySQL import.

### 4. Modern Web Frontend (`alora-frontend/`)
- **Stack**: HTML5, Modern CSS3, JavaScript SPA
- **Features**:
  - **Student View**: Real-time duplicate detection warning banner as the user types, interactive complaint tracking timeline (`Submitted` ➔ `AI Triaged` ➔ `Assigned` ➔ `In Progress` ➔ `Resolved`), 5-star feedback rating modal.
  - **Admin & Dispatcher View**: Live KPI summary cards, ticket filter by status/duplicates, department workload metrics.
  - **Technician Desk**: Filtered work orders by technician, SOP checklist, recommended tools, and status progression.
  - **AI / ML Ops Center**: Model version, accuracy scores, live retraining trigger, and interactive prediction sandbox.

---

## 💻 Manual Startup Instructions

### Start ML Service individually:
```cmd
start_ml_service.bat
```

### Start Spring Boot Backend individually:
```cmd
start_backend.bat
```

### Accessing the Web Frontend:
Open `alora-frontend/index.html` in any modern browser (Chrome, Edge, Firefox).
