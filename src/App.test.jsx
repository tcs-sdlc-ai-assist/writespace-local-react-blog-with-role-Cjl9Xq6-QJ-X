import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

let mockSession = null;

vi.mock('./utils/auth.js', () => ({
  getCurrentUser: vi.fn(() => mockSession),
  logout: vi.fn(() => {
    mockSession = null;
  }),
  login: vi.fn(),
  register: vi.fn(),
  isAdmin: vi.fn(() => mockSession !== null && mockSession.role === 'admin'),
}));

vi.mock('./utils/storage.js', () => ({
  getPosts: vi.fn(() => []),
  getUsers: vi.fn(() => [
    {
      id: 'admin-001',
      displayName: 'Admin',
      username: 'admin',
      password: 'adminpw',
      role: 'admin',
      createdAt: new Date().toISOString(),
    },
  ]),
  addPost: vi.fn(),
  updatePost: vi.fn(),
  removePost: vi.fn(),
  addUser: vi.fn(),
  removeUser: vi.fn(),
  setPosts: vi.fn(),
  setUsers: vi.fn(),
  getSession: vi.fn(() => mockSession),
  setSession: vi.fn(),
  clearSession: vi.fn(),
}));

import App from './App.jsx';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import LandingPage from './pages/LandingPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import Home from './pages/Home.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import UserManagement from './pages/UserManagement.jsx';

function renderWithRouter(initialRoute = '/') {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/blogs"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute role="admin">
              <UserManagement />
            </ProtectedRoute>
          }
        />
      </Routes>
    </MemoryRouter>
  );
}

describe('App', () => {
  beforeEach(() => {
    mockSession = null;
    vi.clearAllMocks();
  });

  describe('Public routes', () => {
    it('renders the landing page at /', () => {
      renderWithRouter('/');
      expect(screen.getByText('Welcome to')).toBeInTheDocument();
      expect(screen.getByText('WriteSpace')).toBeInTheDocument();
    });

    it('renders the login page at /login', () => {
      renderWithRouter('/login');
      expect(screen.getByText('Welcome Back')).toBeInTheDocument();
      expect(screen.getByText('Sign in to your WriteSpace account')).toBeInTheDocument();
    });

    it('renders the register page at /register', () => {
      renderWithRouter('/register');
      expect(screen.getByText('Create Account')).toBeInTheDocument();
      expect(screen.getByText('Join WriteSpace and start writing today')).toBeInTheDocument();
    });
  });

  describe('ProtectedRoute redirects for unauthenticated users', () => {
    it('redirects unauthenticated users from /blogs to /login', () => {
      mockSession = null;
      renderWithRouter('/blogs');
      expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    });

    it('redirects unauthenticated users from /admin to /login', () => {
      mockSession = null;
      renderWithRouter('/admin');
      expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    });

    it('redirects unauthenticated users from /admin/users to /login', () => {
      mockSession = null;
      renderWithRouter('/admin/users');
      expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    });
  });

  describe('Authenticated user access', () => {
    it('allows authenticated user to access /blogs', () => {
      mockSession = {
        userId: 'user-123',
        username: 'testuser',
        displayName: 'Test User',
        role: 'user',
      };
      renderWithRouter('/blogs');
      expect(screen.getByText('All Posts')).toBeInTheDocument();
    });

    it('redirects regular user from /admin to /blogs', () => {
      mockSession = {
        userId: 'user-123',
        username: 'testuser',
        displayName: 'Test User',
        role: 'user',
      };
      renderWithRouter('/admin');
      expect(screen.getByText('All Posts')).toBeInTheDocument();
    });

    it('redirects regular user from /admin/users to /blogs', () => {
      mockSession = {
        userId: 'user-123',
        username: 'testuser',
        displayName: 'Test User',
        role: 'user',
      };
      renderWithRouter('/admin/users');
      expect(screen.getByText('All Posts')).toBeInTheDocument();
    });
  });

  describe('Admin-only route access', () => {
    it('allows admin to access /admin', () => {
      mockSession = {
        userId: 'admin-001',
        username: 'admin',
        displayName: 'Admin',
        role: 'admin',
      };
      renderWithRouter('/admin');
      expect(screen.getByText(/Welcome back, Admin!/)).toBeInTheDocument();
    });

    it('allows admin to access /admin/users', () => {
      mockSession = {
        userId: 'admin-001',
        username: 'admin',
        displayName: 'Admin',
        role: 'admin',
      };
      renderWithRouter('/admin/users');
      expect(screen.getByText('Manage Users')).toBeInTheDocument();
    });

    it('allows admin to access /blogs', () => {
      mockSession = {
        userId: 'admin-001',
        username: 'admin',
        displayName: 'Admin',
        role: 'admin',
      };
      renderWithRouter('/blogs');
      expect(screen.getByText('All Posts')).toBeInTheDocument();
    });
  });

  describe('Navbar rendering based on session state', () => {
    it('renders PublicNavbar with Login and Register links on landing page when not authenticated', () => {
      mockSession = null;
      renderWithRouter('/');
      const loginLinks = screen.getAllByText('Login');
      expect(loginLinks.length).toBeGreaterThanOrEqual(1);
      const registerLinks = screen.getAllByText('Register');
      expect(registerLinks.length).toBeGreaterThanOrEqual(1);
    });

    it('renders authenticated Navbar with user info on /blogs when logged in', () => {
      mockSession = {
        userId: 'user-123',
        username: 'testuser',
        displayName: 'Test User',
        role: 'user',
      };
      renderWithRouter('/blogs');
      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.getByText('Logout')).toBeInTheDocument();
      expect(screen.getByText('Blogs')).toBeInTheDocument();
      expect(screen.getByText('Write')).toBeInTheDocument();
    });

    it('renders admin-specific nav links for admin users', () => {
      mockSession = {
        userId: 'admin-001',
        username: 'admin',
        displayName: 'Admin',
        role: 'admin',
      };
      renderWithRouter('/blogs');
      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Manage Users')).toBeInTheDocument();
    });

    it('does not render admin-specific nav links for regular users', () => {
      mockSession = {
        userId: 'user-123',
        username: 'testuser',
        displayName: 'Test User',
        role: 'user',
      };
      renderWithRouter('/blogs');
      expect(screen.queryByText('Admin Dashboard')).not.toBeInTheDocument();
      expect(screen.queryByText('Manage Users')).not.toBeInTheDocument();
    });

    it('renders role badge as Admin for admin users', () => {
      mockSession = {
        userId: 'admin-001',
        username: 'admin',
        displayName: 'Admin',
        role: 'admin',
      };
      renderWithRouter('/blogs');
      const badges = screen.getAllByText('Admin');
      expect(badges.length).toBeGreaterThanOrEqual(1);
    });

    it('renders role badge as User for regular users', () => {
      mockSession = {
        userId: 'user-123',
        username: 'testuser',
        displayName: 'Test User',
        role: 'user',
      };
      renderWithRouter('/blogs');
      expect(screen.getByText('User')).toBeInTheDocument();
    });
  });

  describe('App component renders with BrowserRouter', () => {
    it('renders without crashing', () => {
      mockSession = null;
      const { container } = render(<App />);
      expect(container).toBeTruthy();
    });
  });

  describe('Navigation between pages', () => {
    it('navigates from landing page to login page via Login link', async () => {
      mockSession = null;
      const user = userEvent.setup();
      renderWithRouter('/');

      const loginLinks = screen.getAllByRole('link', { name: /login/i });
      await user.click(loginLinks[0]);

      await waitFor(() => {
        expect(screen.getByText('Welcome Back')).toBeInTheDocument();
      });
    });

    it('navigates from landing page to register page via Register link', async () => {
      mockSession = null;
      const user = userEvent.setup();
      renderWithRouter('/');

      const registerLinks = screen.getAllByRole('link', { name: /register/i });
      await user.click(registerLinks[0]);

      await waitFor(() => {
        expect(screen.getByText('Create Account')).toBeInTheDocument();
      });
    });

    it('navigates from login page to register page via Register link', async () => {
      mockSession = null;
      const user = userEvent.setup();
      renderWithRouter('/login');

      const registerLink = screen.getByRole('link', { name: /register/i });
      await user.click(registerLink);

      await waitFor(() => {
        expect(screen.getByText('Create Account')).toBeInTheDocument();
      });
    });

    it('navigates from register page to login page via Login link', async () => {
      mockSession = null;
      const user = userEvent.setup();
      renderWithRouter('/register');

      const loginLink = screen.getByRole('link', { name: /login/i });
      await user.click(loginLink);

      await waitFor(() => {
        expect(screen.getByText('Welcome Back')).toBeInTheDocument();
      });
    });
  });
});