const POSTS_KEY = 'writespace_posts';
const USERS_KEY = 'writespace_users';
const SESSION_KEY = 'writespace_session';

const ADMIN_USER = {
  id: 'admin-001',
  displayName: 'Admin',
  username: 'admin',
  password: 'adminpw',
  role: 'admin',
  createdAt: new Date().toISOString(),
};

/**
 * Safely read a value from localStorage and parse as JSON.
 * @param {string} key - The localStorage key.
 * @returns {*} Parsed value or null on failure.
 */
function safeGetItem(key) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) {
      return null;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.warn(`WriteSpace: Failed to read "${key}" from localStorage.`, e);
    return null;
  }
}

/**
 * Safely write a JSON-serializable value to localStorage.
 * @param {string} key - The localStorage key.
 * @param {*} value - The value to store.
 */
function safeSetItem(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`WriteSpace: Failed to write "${key}" to localStorage.`, e);
  }
}

/**
 * Safely remove a key from localStorage.
 * @param {string} key - The localStorage key.
 */
function safeRemoveItem(key) {
  try {
    localStorage.removeItem(key);
  } catch (e) {
    console.warn(`WriteSpace: Failed to remove "${key}" from localStorage.`, e);
  }
}

/**
 * Ensure the admin user exists in the users array.
 * Called on first access to users.
 */
function ensureAdminUser() {
  const users = safeGetItem(USERS_KEY);
  if (!Array.isArray(users)) {
    safeSetItem(USERS_KEY, [ADMIN_USER]);
    return;
  }
  const hasAdmin = users.some((u) => u.username === 'admin');
  if (!hasAdmin) {
    safeSetItem(USERS_KEY, [ADMIN_USER, ...users]);
  }
}

// Initialize admin user on module load
ensureAdminUser();

// --- Posts ---

/**
 * Get all posts from localStorage.
 * @returns {Array<Object>} Array of post objects.
 */
export function getPosts() {
  const posts = safeGetItem(POSTS_KEY);
  return Array.isArray(posts) ? posts : [];
}

/**
 * Replace all posts in localStorage.
 * @param {Array<Object>} posts - Array of post objects.
 */
export function setPosts(posts) {
  safeSetItem(POSTS_KEY, Array.isArray(posts) ? posts : []);
}

/**
 * Add a single post to localStorage.
 * @param {Object} post - The post object to add.
 */
export function addPost(post) {
  const posts = getPosts();
  posts.push(post);
  setPosts(posts);
}

/**
 * Update an existing post by id.
 * @param {Object} updatedPost - The post object with updated fields. Must include `id`.
 */
export function updatePost(updatedPost) {
  const posts = getPosts();
  const index = posts.findIndex((p) => p.id === updatedPost.id);
  if (index !== -1) {
    posts[index] = { ...posts[index], ...updatedPost };
    setPosts(posts);
  }
}

/**
 * Remove a post by id.
 * @param {string} postId - The id of the post to remove.
 */
export function removePost(postId) {
  const posts = getPosts();
  const filtered = posts.filter((p) => p.id !== postId);
  setPosts(filtered);
}

// --- Users ---

/**
 * Get all users from localStorage.
 * @returns {Array<Object>} Array of user objects.
 */
export function getUsers() {
  ensureAdminUser();
  const users = safeGetItem(USERS_KEY);
  return Array.isArray(users) ? users : [];
}

/**
 * Replace all users in localStorage.
 * @param {Array<Object>} users - Array of user objects.
 */
export function setUsers(users) {
  safeSetItem(USERS_KEY, Array.isArray(users) ? users : []);
}

/**
 * Add a single user to localStorage.
 * @param {Object} user - The user object to add.
 */
export function addUser(user) {
  const users = getUsers();
  users.push(user);
  setUsers(users);
}

/**
 * Remove a user by id.
 * @param {string} userId - The id of the user to remove.
 */
export function removeUser(userId) {
  const users = getUsers();
  const filtered = users.filter((u) => u.id !== userId);
  setUsers(filtered);
}

// --- Session ---

/**
 * Get the current session from localStorage.
 * @returns {Object|null} The session object or null.
 */
export function getSession() {
  const session = safeGetItem(SESSION_KEY);
  if (session && typeof session === 'object' && session.userId) {
    return session;
  }
  return null;
}

/**
 * Set the current session in localStorage.
 * @param {Object} session - The session object.
 */
export function setSession(session) {
  safeSetItem(SESSION_KEY, session);
}

/**
 * Clear the current session from localStorage.
 */
export function clearSession() {
  safeRemoveItem(SESSION_KEY);
}