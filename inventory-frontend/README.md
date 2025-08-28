# Inventory Management System - Frontend

A modern React 18 + Vite frontend for the Inventory Management System with elegant UI and full-featured functionality.

## 🚀 Features

- **Modern React 18** with Vite for fast development
- **TailwindCSS** for beautiful, responsive design
- **Dark/Light Theme** toggle with system preference detection
- **JWT Authentication** with automatic token refresh
- **Protected Routes** with authentication guards
- **Responsive Layout** with sidebar navigation
- **Real-time API Integration** with the backend
- **Elegant UI Components** with smooth animations

## 📋 Pages

- **Login** - User authentication with demo credentials
- **Dashboard** - Overview with statistics and quick actions
- **Products** - Product management with search and CRUD operations
- **Categories** - Category organization and management
- **Reports** - Analytics and insights with charts
- **Users** - User management (Admin only)

## 🛠️ Tech Stack

- **React 18** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **React Router** - Client-side routing
- **TailwindCSS** - Utility-first CSS framework
- **Axios** - HTTP client for API calls
- **Lucide React** - Beautiful icons
- **Headless UI** - Accessible UI components

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- Backend API running on `http://localhost:3001`

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Navigate to `http://localhost:5173`

### Demo Credentials

Use these credentials to test the system:

- **Email:** `admin@inventory.com`
- **Password:** `Admin123!`

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   └── layout/         # Layout components (Sidebar, Header)
├── contexts/           # React contexts (Auth, Theme)
├── lib/               # Utility functions
├── pages/             # Page components
├── services/          # API service functions
├── App.jsx           # Main app component
├── main.jsx          # App entry point
└── index.css         # Global styles
```

## 🎨 Design Features

- **Responsive Design** - Works on all screen sizes
- **Dark Mode** - Toggle between light and dark themes
- **Smooth Animations** - CSS transitions and animations
- **Loading States** - Skeleton loaders and spinners
- **Error Handling** - User-friendly error messages
- **Accessibility** - ARIA labels and keyboard navigation

## 🔧 Configuration

### API Configuration

The frontend is configured to connect to the backend API at `http://localhost:3001`. You can modify this in `src/services/api.js`:

```javascript
const API_BASE_URL = 'http://localhost:3001/api'
```

### Theme Configuration

Theme preferences are automatically saved to localStorage and restored on page reload.

## 📱 Responsive Design

The application is fully responsive with:
- **Mobile-first** design approach
- **Collapsible sidebar** on mobile devices
- **Touch-friendly** interface elements
- **Optimized layouts** for different screen sizes

## 🔐 Authentication

- **JWT-based** authentication
- **Automatic token refresh** on 401 errors
- **Protected routes** with redirect to login
- **Persistent sessions** with localStorage
- **Secure logout** with token cleanup

## 🎯 Key Features

### Dashboard
- Real-time statistics
- Quick action buttons
- Recent activity feed
- Inventory overview

### Products Management
- Product listing with search
- Add/Edit/Delete products
- Stock level indicators
- Category filtering

### Categories
- Category organization
- Product count display
- CRUD operations
- Visual category cards

### Reports & Analytics
- Stock level charts
- Inventory value reports
- Category-wise breakdown
- Export functionality

### User Management
- User listing table
- Role-based access control
- User creation/editing
- Admin-only features

## 🚀 Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory, ready for deployment.

## 🔧 Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 📄 License

This project is part of the Inventory Management System.
