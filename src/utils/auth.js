import {
  getUsers,
  addUser,
  getSession,
  setSession,
  clearSession,
} from './storage.js';

/**
 * Generate a simple unique id.
 * @returns {string} A UUID-like string.
 */
function generateId() {
  return 'user-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 9);
}

/**
 * Attempt to log in with the given credentials.
 * @param {string} username - The username.
 * @param {string} password - The password (plaintext).
 * @returns {{ success: boolean, error?: string, session?: Object }} Result object.
 */
export function login(username, password) {
  if (!username || !password) {
    return { success: false, error: 'Username and password are required.' };
  }

  const users = getUsers();
  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (!user) {
    return { success: false, error: 'Invalid credentials.' };
  }

  const session = {
    userId: user.id,
    username: user.username,
    displayName: user.displayName,
    role: user.role,
  };

  setSession(session);

  return { success: true, session };
}

/**
 * Log out the current user by clearing the session.
 */
export function logout() {
  clearSession();
}

/**
 * Register a new user account.
 * @param {{ displayName: string, username: string, password: string }} params - Registration fields.
 * @returns {{ success: boolean, error?: string, session?: Object }} Result object.
 */
export function register({ displayName, username, password }) {
  if (!displayName || !displayName.trim()) {
    return { success: false, error: 'Display name is required.' };
  }

  if (!username || !username.trim()) {
    return { success: false, error: 'Username is required.' };
  }

  if (!password || password.length < 4) {
    return { success: false, error: 'Password must be at least 4 characters.' };
  }

  const users = getUsers();
  const exists = users.some((u) => u.username === username);

  if (exists) {
    return { success: false, error: 'Username is already taken.' };
  }

  const newUser = {
    id: generateId(),
    displayName: displayName.trim(),
    username: username.trim(),
    password: password,
    role: 'user',
    createdAt: new Date().toISOString(),
  };

  addUser(newUser);

  const session = {
    userId: newUser.id,
    username: newUser.username,
    displayName: newUser.displayName,
    role: newUser.role,
  };

  setSession(session);

  return { success: true, session };
}

/**
 * Get the current authenticated user session.
 * @returns {Object|null} The session object or null if not logged in.
 */
export function getCurrentUser() {
  return getSession();
}

/**
 * Check if the current user has the admin role.
 * @returns {boolean} True if the current user is an admin.
 */
export function isAdmin() {
  const session = getSession();
  return session !== null && session.role === 'admin';
}