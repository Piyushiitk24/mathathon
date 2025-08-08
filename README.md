# Mathathon - Interactive Mathematics Learning Platform

A full-stack web application for interactive mathematics learning, featuring timed flash cards for revision and mock tests for assessment.

## 🎯 Features

### Learning Modes
- **Study Mode (Revision)**: Timed flash cards with 25-second auto-advance
- **Mock Test Mode**: Interactive quizzes with scoring and progress tracking

### User Experience
- Session-based authentication (username only)
- Responsive design with modern UI/UX
- Real-time progress tracking
- Detailed performance analytics

### Admin Features
- Password-protected admin panel
- Add questions via web interface
- Import questions from CSV
- View user attempts and statistics
- Module management

### Technical Features
- Dual database support (SQLite default, MongoDB optional)
- RESTful API architecture
- Modern React frontend with Tailwind CSS
- Framer Motion animations
- Session-based authentication

## 🏗️ Architecture

```
mathathon/
├── server/                 # Node.js + Express backend
│   ├── data/              # CSV data files
│   ├── models/            # Database models
│   ├── controllers/       # Business logic
│   ├── routes/            # API routes
│   ├── db.js              # Database connection
│   ├── seed.js            # CSV import script
│   └── server.js          # Main server file
└── client/                # React frontend
    ├── public/            # Static files
    └── src/
        ├── api/           # API helpers
        ├── pages/         # React pages
        ├── components/    # Reusable components
        └── styles/        # Custom CSS
```

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

1. **Clone and setup the project**
```bash
git clone <repository-url>
cd mathathon
```

2. **Install server dependencies**
```bash
cd server
npm install
```

3. **Install client dependencies**
```bash
cd ../client
npm install
```

4. **Configure environment**
```bash
cd ../server
cp .env.example .env
# Edit .env with your settings:
# - SESSION_SECRET (required)
# - ADMIN_PASSWORD (required)
# - MONGODB_URI (optional, uses SQLite if not set)
```

5. **Seed the database**
```bash
node seed.js
```

6. **Start the backend server**
```bash
npm run dev
# Server runs on http://localhost:5000
```

7. **Start the frontend (new terminal)**
```bash
cd ../client
npm start
# Client runs on http://localhost:3000
```

## 📊 Database Schema

### SQLite Schema (Default)
```sql
-- Modules
CREATE TABLE modules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL
);

-- Users
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL
);

-- Questions
CREATE TABLE questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  module_id INTEGER NOT NULL,
  type TEXT NOT NULL,           -- 'revision' or 'mock'
  question_text TEXT NOT NULL,
  option_a TEXT,
  option_b TEXT,
  option_c TEXT,
  option_d TEXT,
  correct_option TEXT,          -- 'A'|'B'|'C'|'D' or null
  answer_text TEXT,
  difficulty TEXT,
  FOREIGN KEY (module_id) REFERENCES modules (id)
);

-- Attempts
CREATE TABLE attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL,
  datetime_iso TEXT NOT NULL,   -- ISO 8601 timestamp
  module_id INTEGER NOT NULL,
  type TEXT NOT NULL,
  score INTEGER,                -- nullable for revision
  time_taken_seconds INTEGER,   -- nullable for revision
  details TEXT                  -- JSON string
);
```

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/login` - Login with username
- `GET /api/auth/session` - Get current session
- `POST /api/auth/logout` - Logout

### Modules
- `GET /api/modules` - Get all modules
- `GET /api/modules/:id` - Get module by ID

### Questions
- `GET /api/questions/:moduleId/:type` - Get questions by module and type
- `GET /api/questions/:id` - Get question by ID

### Attempts
- `POST /api/attempts` - Create new attempt
- `GET /api/attempts` - Get all attempts
- `GET /api/attempts/user/:username` - Get user attempts
- `GET /api/attempts/module/:moduleId` - Get module attempts

### Admin (Password Protected)
- `POST /api/admin/add-question` - Add new question
- `GET /api/admin/attempts` - Get all attempts with details
- `GET /api/admin/stats` - Get platform statistics
- `POST /api/admin/import-csv` - Import questions from CSV

## 📁 CSV Import Format

The seed script expects a CSV file with these exact columns:
```csv
question,answer,option_a,option_b,option_c,option_d,correct_option,module,type,difficulty
```

Example row:
```csv
"What is sin²(A) + cos²(A)?","1","0","1","2","sin(A)","B","trigonometry","revision","easy"
```

## 🎨 UI Components

### Key Components
- **TimerHourglass**: Animated 25-second countdown timer
- **ProgressDots**: Visual progress indicator for mock tests
- **QuestionCard**: Displays questions with math expressions
- **AnswerList**: Multiple choice answers with validation
- **ModuleCard**: Module selection with study/test options
- **AdminForms**: Question management interface

### Styling
- **Framework**: Tailwind CSS with custom configuration
- **Fonts**: Orbitron (headings), Poppins (body)
- **Colors**: Green (#2ECC71), Orange (#F28C47), custom palette
- **Animations**: Framer Motion for smooth transitions

## 🔧 Environment Variables

### Server (.env)
```bash
# Required
PORT=5000
SESSION_SECRET=your-super-secret-session-key
ADMIN_PASSWORD=your-admin-password

# Optional (uses SQLite if not set)
MONGODB_URI=mongodb://localhost:27017/mathathon

# Optional
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

## 🛠️ Development

### Available Scripts

**Server**
```bash
npm start          # Production server
npm run dev        # Development server with nodemon
node seed.js       # Import CSV data
```

**Client**
```bash
npm start          # Development server
npm run build      # Production build
npm test           # Run tests
```

### Key Features Implementation

1. **25-Second Timer**: Implemented in `TimerHourglass` component with automatic question advancement
2. **Session Management**: Express-session with secure cookies
3. **Database Abstraction**: Single interface for SQLite/MongoDB
4. **Admin Protection**: Environment variable password checking
5. **Responsive Design**: Mobile-first approach with Tailwind

## 🔐 Security Considerations

- Session-based authentication with secure cookies
- Admin password stored in environment variables
- Input validation on both frontend and backend
- CORS configuration for cross-origin requests
- SQL injection prevention with parameterized queries

## 📱 Responsive Design

- **Mobile**: Single column layout, touch-friendly buttons
- **Tablet**: Two column grids, optimized spacing
- **Desktop**: Three column grids, full feature set

## 🚦 Performance Optimizations

- Component lazy loading
- Optimized re-renders with React hooks
- Efficient database queries
- Compressed assets in production
- Animated transitions with GPU acceleration

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Check MongoDB URI if using MongoDB
   - Ensure SQLite directory is writable
   - Verify environment variables are set

2. **CSV Import Issues**
   - Verify CSV format matches expected columns
   - Check for encoding issues (use UTF-8)
   - Ensure CSV file exists in `server/data/` directory

3. **Session Issues**
   - Verify SESSION_SECRET is set in .env
   - Check browser cookies are enabled
   - Clear browser storage if needed

4. **Admin Access Issues**
   - Verify ADMIN_PASSWORD in .env
   - Check admin password entry in UI
   - Ensure no trailing spaces in password

## 📄 License

MIT License - See LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For issues and questions:
1. Check the troubleshooting section
2. Review the API documentation
3. Open an issue on GitHub
4. Contact the development team

---

**Happy Learning! 🎓**
