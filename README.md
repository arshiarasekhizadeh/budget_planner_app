# Budget Planner App

A comprehensive personal finance management application with budgeting, analytics, and AI-powered advice.

## 🚀 Features

- **Personalized Budgeting**: Set monthly spending goals and track individual budget categories.
- **Analytics Dashboard**: Visualize spending habits with intuitive charts and graphs.
- **AI Financial Advice**: Get smart tips and suggestions to improve your financial health.
- **Account Management**: 
  - Secure Login & Signup
  - Profile Image Uploads
  - Email Verification
  - Password Change Support
- **Multi-format Export**: Download your budget data in PDF or CSV formats.
- **Responsive Design**: Fully optimized for both desktop and mobile devices.

## 🛠 Tech Stack

### Backend
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Python 3.10+)
- **Database**: PostgreSQL (managed via SQLAlchemy ORM)
- **Migrations**: [Alembic](https://alembic.sqlalchemy.org/)
- **Authentication**: JWT-based auth with password hashing (Passlib/Bcrypt)
- **Email Service**: Integration for verification emails.

### Frontend
- **Framework**: [Next.js 15](https://nextjs.org/) (App Router, TypeScript)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **API Communication**: Custom service layer with Fetch API.
- **Icons**: [Lucide React](https://lucide.dev/)

## 📁 Project Structure

```text
budget-planner-app/
├── backend/                # FastAPI source code
│   ├── alembic/            # Database migration scripts
│   ├── app/
│   │   ├── api/routes/     # API endpoints (Auth, Budgets, Analytics, etc.)
│   │   ├── core/           # Database & configuration logic
│   │   ├── models/         # SQLAlchemy database models
│   │   ├── schemas/        # Pydantic validation schemas
│   │   └── services/       # Business logic (Auth, Mail)
│   └── uploads/            # Local storage for profile pictures
├── frontend/               # Next.js source code
│   ├── app/                # App router pages & components
│   ├── public/             # Static assets
│   └── services/           # API service client
└── docker-compose.yml      # Infrastructure setup (PostgreSQL, pgAdmin)
```

## ⚙️ Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- Docker & Docker Compose

### 1. Database Setup
Launch the PostgreSQL database using Docker:
```bash
docker-compose up -d
```

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run migrations:
   ```bash
   alembic upgrade head
   ```
5. Start the development server:
   ```bash
   uvicorn app.main:app --reload
   ```

### 3. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔑 Environment Variables

### Backend (`backend/.env`)
- `DATABASE_URL`: Your PostgreSQL connection string.
- `SECRET_KEY`: Used for JWT signing.
- `MAIL_USERNAME`, `MAIL_PASSWORD`, `MAIL_FROM`: For email verification service.

### Frontend (`frontend/.env.local`)
- `NEXT_PUBLIC_API_URL`: The base URL of your FastAPI backend (e.g., `http://localhost:8000`).

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.
