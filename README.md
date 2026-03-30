# School CRM - Full Stack Web Application

A comprehensive School Customer Relationship Management (CRM) system built with modern web technologies. This application provides role-based access control for administrators, teachers, and students, with full management capabilities for students, teachers, classes, attendance, fees, exams, and results.

## Tech Stack

### Backend
- **Node.js** with **Express.js** - REST API server
- **PostgreSQL** - Relational database
- **Sequelize ORM** - Database modeling and queries
- **JWT** - Authentication and authorization
- **bcryptjs** - Password hashing

### Frontend
- **React.js** - UI library
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first styling
- **Recharts** - Data visualization
- **Lucide React** - Icon library
- **Axios** - HTTP client

## Features

### Authentication & Authorization
- JWT-based secure authentication
- Role-based access control (Admin, Teacher, Student)
- Protected routes and API endpoints
- Password encryption

### Core Modules

#### 1. Student Management
- Add, edit, delete, and view students
- Class assignment
- Parent information
- Profile management

#### 2. Teacher Management
- Add, edit, delete, and view teachers
- Department and specialization tracking
- Class teacher assignments

#### 3. Class Management
- Create and manage classes
- Assign class teachers
- Student enrollment per class

#### 4. Attendance Tracking
- Mark daily attendance (present, absent, late, half-day, leave)
- Bulk attendance marking
- Attendance reports and summaries
- Date-wise and class-wise filtering

#### 5. Fees Management
- Create different fee types (tuition, exam, library, etc.)
- Track payments and pending fees
- Payment recording with multiple methods
- Fee summary and reports

#### 6. Exams & Results Management
- Schedule exams with different types
- Record student results
- Automatic grade calculation
- Individual student report cards
- Pass/fail tracking

### Dashboard Features
- Role-specific dashboards
- Summary statistics
- Charts and visualizations
- Recent activity feeds
- Quick access to key metrics

## Project Structure

```
school-crm/
├── client/                  # React Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── context/         # React contexts (Auth)
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   └── App.js           # Main application
│   ├── package.json
│   └── tailwind.config.js
│
└── server/                  # Node.js Backend
    ├── config/              # Configuration files
    ├── controllers/         # Route controllers
    ├── middleware/          # Auth & validation middleware
    ├── models/              # Sequelize models
    ├── routes/              # API routes
    ├── utils/               # Utility functions
    ├── server.js            # Entry point
    └── package.json
```

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
cd school-crm
```

2. **Setup Database**
```bash
# Create PostgreSQL database
createdb school_crm

# Update server/.env with your database credentials
```

3. **Install Backend Dependencies**
```bash
cd server
npm install
```

4. **Install Frontend Dependencies**
```bash
cd ../client
npm install
```

5. **Environment Configuration**

Backend (`server/.env`):
```
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=school_crm
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_super_secret_key
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:3000
```

Frontend (`client/.env`):
```
REACT_APP_API_URL=http://localhost:5000/api
```

### Running the Application

1. **Start the Backend Server**
```bash
cd server
npm run dev
```

2. **Start the Frontend Development Server**
```bash
cd client
npm start
```

3. **Seed Initial Data** (Optional)
```bash
cd server
node seed-data.js
```

This creates default users:
- **Admin**: admin@school.com / admin123
- **Teacher**: teacher@school.com / teacher123
- **Student**: student@school.com / student123

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/change-password` - Change password

### Students
- `GET /api/students` - List all students
- `POST /api/students` - Create student
- `GET /api/students/:id` - Get student details
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student

### Teachers
- `GET /api/teachers` - List all teachers
- `POST /api/teachers` - Create teacher
- `GET /api/teachers/:id` - Get teacher details
- `PUT /api/teachers/:id` - Update teacher
- `DELETE /api/teachers/:id` - Delete teacher

### Classes
- `GET /api/classes` - List all classes
- `POST /api/classes` - Create class
- `GET /api/classes/:id` - Get class details
- `PUT /api/classes/:id` - Update class
- `DELETE /api/classes/:id` - Delete class

### Attendance
- `GET /api/attendance` - List attendance records
- `POST /api/attendance` - Mark attendance
- `POST /api/attendance/bulk` - Bulk mark attendance

### Fees
- `GET /api/fees` - List all fees
- `POST /api/fees` - Create fee
- `PUT /api/fees/:id/payment` - Record payment

### Exams
- `GET /api/exams` - List all exams
- `POST /api/exams` - Create exam
- `PUT /api/exams/:id` - Update exam
- `DELETE /api/exams/:id` - Delete exam

### Results
- `GET /api/results` - List all results
- `POST /api/results` - Create result
- `GET /api/results/report/:studentId` - Student report card

### Dashboard
- `GET /api/dashboard/stats` - Admin dashboard stats
- `GET /api/dashboard/teacher` - Teacher dashboard
- `GET /api/dashboard/student` - Student dashboard

## Database Schema

The application uses PostgreSQL with the following main tables:

- **users** - User accounts (admin, teacher, student)
- **students** - Student profiles
- **teachers** - Teacher profiles
- **classes** - Class information
- **attendance** - Daily attendance records
- **fees** - Fee records and payments
- **exams** - Exam schedules
- **results** - Student exam results

Relationships are defined using Sequelize associations for data integrity.

## Security Features

- JWT token-based authentication
- Password hashing with bcrypt
- Role-based access control middleware
- Protected API routes
- Input validation and sanitization
- CORS configuration

## UI/UX Features

- Responsive design for all screen sizes
- Sidebar navigation with role-based menu items
- Data tables with sorting and filtering
- Modal dialogs for forms
- Charts and visualizations
- Toast notifications
- Loading states and error handling

## Production Deployment

### Backend
1. Set `NODE_ENV=production` in `.env`
2. Use a strong JWT_SECRET
3. Configure database connection pooling
4. Set up proper logging
5. Use PM2 or similar process manager

### Frontend
1. Build the production bundle:
```bash
cd client
npm run build
```
2. Serve the build folder with nginx or similar
3. Configure API proxy if needed

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and feature requests, please use the GitHub issue tracker.
