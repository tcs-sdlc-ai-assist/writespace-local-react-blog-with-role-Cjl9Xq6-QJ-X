import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('./storage.js', () => {
  let _users = [];
  let _session = null;

  return {
    getUsers: vi.fn(() => _users),
    addUser: vi.fn((user) => {
      _users.push(user);
    }),
    getSession: vi.fn(() => _session),
    setSession: vi.fn((session) => {
      _session = session;
    }),
    clearSession: vi.fn(() => {
      _session = null;
    }),
    __setUsers: (users) => {
      _users = users;
    },
    __setSession: (session) => {
      _session = session;
    },
    __reset: () => {
      _users = [];
      _session = null;
    },
  };
});

import { login, logout, register, getCurrentUser, isAdmin } from './auth.js';
import { getUsers, addUser, getSession, setSession, clearSession, __setUsers, __setSession, __reset } from './storage.js';

describe('auth.js', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    __reset();
  });

  describe('login', () => {
    it('returns error when username is empty', () => {
      const result = login('', 'password');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Username and password are required.');
    });

    it('returns error when password is empty', () => {
      const result = login('admin', '');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Username and password are required.');
    });

    it('returns error when both username and password are empty', () => {
      const result = login('', '');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Username and password are required.');
    });

    it('returns error when username is null', () => {
      const result = login(null, 'password');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Username and password are required.');
    });

    it('returns error when password is null', () => {
      const result = login('admin', null);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Username and password are required.');
    });

    it('returns error when credentials are invalid', () => {
      __setUsers([
        {
          id: 'admin-001',
          displayName: 'Admin',
          username: 'admin',
          password: 'adminpw',
          role: 'admin',
          createdAt: new Date().toISOString(),
        },
      ]);

      const result = login('admin', 'wrongpassword');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid credentials.');
    });

    it('returns error when user does not exist', () => {
      __setUsers([
        {
          id: 'admin-001',
          displayName: 'Admin',
          username: 'admin',
          password: 'adminpw',
          role: 'admin',
          createdAt: new Date().toISOString(),
        },
      ]);

      const result = login('nonexistent', 'somepassword');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid credentials.');
    });

    it('successfully logs in with valid admin credentials', () => {
      __setUsers([
        {
          id: 'admin-001',
          displayName: 'Admin',
          username: 'admin',
          password: 'adminpw',
          role: 'admin',
          createdAt: new Date().toISOString(),
        },
      ]);

      const result = login('admin', 'adminpw');
      expect(result.success).toBe(true);
      expect(result.session).toBeDefined();
      expect(result.session.userId).toBe('admin-001');
      expect(result.session.username).toBe('admin');
      expect(result.session.displayName).toBe('Admin');
      expect(result.session.role).toBe('admin');
      expect(setSession).toHaveBeenCalledWith(result.session);
    });

    it('successfully logs in with valid user credentials', () => {
      __setUsers([
        {
          id: 'user-123',
          displayName: 'Test User',
          username: 'testuser',
          password: 'testpass',
          role: 'user',
          createdAt: new Date().toISOString(),
        },
      ]);

      const result = login('testuser', 'testpass');
      expect(result.success).toBe(true);
      expect(result.session).toBeDefined();
      expect(result.session.userId).toBe('user-123');
      expect(result.session.username).toBe('testuser');
      expect(result.session.displayName).toBe('Test User');
      expect(result.session.role).toBe('user');
      expect(setSession).toHaveBeenCalledTimes(1);
    });

    it('calls getUsers to retrieve user list', () => {
      __setUsers([]);
      login('admin', 'adminpw');
      expect(getUsers).toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('calls clearSession to remove the session', () => {
      logout();
      expect(clearSession).toHaveBeenCalledTimes(1);
    });

    it('does not throw when no session exists', () => {
      expect(() => logout()).not.toThrow();
    });
  });

  describe('register', () => {
    it('returns error when display name is empty', () => {
      const result = register({ displayName: '', username: 'newuser', password: 'pass1234' });
      expect(result.success).toBe(false);
      expect(result.error).toBe('Display name is required.');
    });

    it('returns error when display name is only whitespace', () => {
      const result = register({ displayName: '   ', username: 'newuser', password: 'pass1234' });
      expect(result.success).toBe(false);
      expect(result.error).toBe('Display name is required.');
    });

    it('returns error when display name is null', () => {
      const result = register({ displayName: null, username: 'newuser', password: 'pass1234' });
      expect(result.success).toBe(false);
      expect(result.error).toBe('Display name is required.');
    });

    it('returns error when username is empty', () => {
      const result = register({ displayName: 'New User', username: '', password: 'pass1234' });
      expect(result.success).toBe(false);
      expect(result.error).toBe('Username is required.');
    });

    it('returns error when username is only whitespace', () => {
      const result = register({ displayName: 'New User', username: '   ', password: 'pass1234' });
      expect(result.success).toBe(false);
      expect(result.error).toBe('Username is required.');
    });

    it('returns error when username is null', () => {
      const result = register({ displayName: 'New User', username: null, password: 'pass1234' });
      expect(result.success).toBe(false);
      expect(result.error).toBe('Username is required.');
    });

    it('returns error when password is too short', () => {
      const result = register({ displayName: 'New User', username: 'newuser', password: 'abc' });
      expect(result.success).toBe(false);
      expect(result.error).toBe('Password must be at least 4 characters.');
    });

    it('returns error when password is empty', () => {
      const result = register({ displayName: 'New User', username: 'newuser', password: '' });
      expect(result.success).toBe(false);
      expect(result.error).toBe('Password must be at least 4 characters.');
    });

    it('returns error when password is null', () => {
      const result = register({ displayName: 'New User', username: 'newuser', password: null });
      expect(result.success).toBe(false);
      expect(result.error).toBe('Password must be at least 4 characters.');
    });

    it('returns error when username is already taken', () => {
      __setUsers([
        {
          id: 'user-existing',
          displayName: 'Existing User',
          username: 'existinguser',
          password: 'pass1234',
          role: 'user',
          createdAt: new Date().toISOString(),
        },
      ]);

      const result = register({ displayName: 'New User', username: 'existinguser', password: 'pass1234' });
      expect(result.success).toBe(false);
      expect(result.error).toBe('Username is already taken.');
    });

    it('successfully registers a new user', () => {
      __setUsers([]);

      const result = register({ displayName: 'New User', username: 'newuser', password: 'pass1234' });
      expect(result.success).toBe(true);
      expect(result.session).toBeDefined();
      expect(result.session.username).toBe('newuser');
      expect(result.session.displayName).toBe('New User');
      expect(result.session.role).toBe('user');
      expect(result.session.userId).toBeDefined();
      expect(result.session.userId).toMatch(/^user-/);
    });

    it('calls addUser with the new user object', () => {
      __setUsers([]);

      register({ displayName: 'New User', username: 'newuser', password: 'pass1234' });
      expect(addUser).toHaveBeenCalledTimes(1);

      const addedUser = addUser.mock.calls[0][0];
      expect(addedUser.displayName).toBe('New User');
      expect(addedUser.username).toBe('newuser');
      expect(addedUser.password).toBe('pass1234');
      expect(addedUser.role).toBe('user');
      expect(addedUser.id).toBeDefined();
      expect(addedUser.createdAt).toBeDefined();
    });

    it('calls setSession after successful registration', () => {
      __setUsers([]);

      const result = register({ displayName: 'New User', username: 'newuser', password: 'pass1234' });
      expect(setSession).toHaveBeenCalledTimes(1);
      expect(setSession).toHaveBeenCalledWith(result.session);
    });

    it('trims display name and username', () => {
      __setUsers([]);

      const result = register({ displayName: '  Trimmed Name  ', username: '  trimmeduser  ', password: 'pass1234' });
      expect(result.success).toBe(true);
      expect(result.session.displayName).toBe('Trimmed Name');
      expect(result.session.username).toBe('trimmeduser');

      const addedUser = addUser.mock.calls[0][0];
      expect(addedUser.displayName).toBe('Trimmed Name');
      expect(addedUser.username).toBe('trimmeduser');
    });

    it('always assigns role as user for new registrations', () => {
      __setUsers([]);

      const result = register({ displayName: 'New User', username: 'newuser', password: 'pass1234' });
      expect(result.session.role).toBe('user');

      const addedUser = addUser.mock.calls[0][0];
      expect(addedUser.role).toBe('user');
    });
  });

  describe('getCurrentUser', () => {
    it('returns null when no session exists', () => {
      __setSession(null);
      const result = getCurrentUser();
      expect(result).toBeNull();
      expect(getSession).toHaveBeenCalled();
    });

    it('returns session object when session exists', () => {
      const sessionData = {
        userId: 'user-1',
        username: 'testuser',
        displayName: 'Test User',
        role: 'user',
      };
      __setSession(sessionData);

      const result = getCurrentUser();
      expect(result).toEqual(sessionData);
      expect(getSession).toHaveBeenCalled();
    });

    it('returns admin session when admin is logged in', () => {
      const adminSession = {
        userId: 'admin-001',
        username: 'admin',
        displayName: 'Admin',
        role: 'admin',
      };
      __setSession(adminSession);

      const result = getCurrentUser();
      expect(result).toEqual(adminSession);
      expect(result.role).toBe('admin');
    });
  });

  describe('isAdmin', () => {
    it('returns false when no session exists', () => {
      __setSession(null);
      const result = isAdmin();
      expect(result).toBe(false);
    });

    it('returns true when current user is admin', () => {
      __setSession({
        userId: 'admin-001',
        username: 'admin',
        displayName: 'Admin',
        role: 'admin',
      });

      const result = isAdmin();
      expect(result).toBe(true);
    });

    it('returns false when current user is a regular user', () => {
      __setSession({
        userId: 'user-1',
        username: 'testuser',
        displayName: 'Test User',
        role: 'user',
      });

      const result = isAdmin();
      expect(result).toBe(false);
    });
  });
});