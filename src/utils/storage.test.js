import { describe, it, expect, beforeEach, vi } from 'vitest';

const POSTS_KEY = 'writespace_posts';
const USERS_KEY = 'writespace_users';
const SESSION_KEY = 'writespace_session';

const ADMIN_USER = {
  id: 'admin-001',
  displayName: 'Admin',
  username: 'admin',
  password: 'adminpw',
  role: 'admin',
};

describe('storage.js', () => {
  let storage;

  beforeEach(() => {
    localStorage.clear();
    vi.resetModules();
  });

  async function loadStorage() {
    const mod = await import('./storage.js');
    return mod;
  }

  describe('Admin initialization', () => {
    it('creates admin user on first load when no users exist', async () => {
      storage = await loadStorage();
      const users = storage.getUsers();
      expect(users.length).toBeGreaterThanOrEqual(1);
      const admin = users.find((u) => u.username === 'admin');
      expect(admin).toBeDefined();
      expect(admin.id).toBe('admin-001');
      expect(admin.role).toBe('admin');
      expect(admin.displayName).toBe('Admin');
    });

    it('preserves existing users and adds admin if missing', async () => {
      const existingUser = {
        id: 'user-existing',
        displayName: 'Existing',
        username: 'existing',
        password: 'pass',
        role: 'user',
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem(USERS_KEY, JSON.stringify([existingUser]));

      storage = await loadStorage();
      const users = storage.getUsers();
      expect(users.length).toBe(2);
      expect(users.find((u) => u.username === 'admin')).toBeDefined();
      expect(users.find((u) => u.username === 'existing')).toBeDefined();
    });

    it('does not duplicate admin if already present', async () => {
      const adminUser = {
        id: 'admin-001',
        displayName: 'Admin',
        username: 'admin',
        password: 'adminpw',
        role: 'admin',
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem(USERS_KEY, JSON.stringify([adminUser]));

      storage = await loadStorage();
      const users = storage.getUsers();
      const admins = users.filter((u) => u.username === 'admin');
      expect(admins.length).toBe(1);
    });
  });

  describe('getPosts', () => {
    it('returns empty array when no posts exist', async () => {
      storage = await loadStorage();
      localStorage.removeItem(POSTS_KEY);
      const posts = storage.getPosts();
      expect(posts).toEqual([]);
    });

    it('returns stored posts', async () => {
      const mockPosts = [
        {
          id: 'post-1',
          title: 'Test Post',
          content: 'Content',
          createdAt: new Date().toISOString(),
          authorId: 'user-1',
          authorName: 'Tester',
        },
      ];
      localStorage.setItem(POSTS_KEY, JSON.stringify(mockPosts));

      storage = await loadStorage();
      const posts = storage.getPosts();
      expect(posts).toEqual(mockPosts);
    });

    it('returns empty array when localStorage has invalid JSON for posts', async () => {
      localStorage.setItem(POSTS_KEY, 'not-valid-json');

      storage = await loadStorage();
      const posts = storage.getPosts();
      expect(posts).toEqual([]);
    });

    it('returns empty array when posts key holds a non-array value', async () => {
      localStorage.setItem(POSTS_KEY, JSON.stringify('string-value'));

      storage = await loadStorage();
      const posts = storage.getPosts();
      expect(posts).toEqual([]);
    });
  });

  describe('setPosts', () => {
    it('stores posts array in localStorage', async () => {
      storage = await loadStorage();
      const posts = [
        {
          id: 'post-1',
          title: 'Hello',
          content: 'World',
          createdAt: new Date().toISOString(),
          authorId: 'user-1',
          authorName: 'Author',
        },
      ];
      storage.setPosts(posts);

      const stored = JSON.parse(localStorage.getItem(POSTS_KEY));
      expect(stored).toEqual(posts);
    });

    it('stores empty array when given non-array value', async () => {
      storage = await loadStorage();
      storage.setPosts(null);

      const stored = JSON.parse(localStorage.getItem(POSTS_KEY));
      expect(stored).toEqual([]);
    });
  });

  describe('addPost', () => {
    it('adds a post to existing posts', async () => {
      storage = await loadStorage();
      localStorage.setItem(POSTS_KEY, JSON.stringify([]));

      const newPost = {
        id: 'post-new',
        title: 'New Post',
        content: 'New Content',
        createdAt: new Date().toISOString(),
        authorId: 'user-1',
        authorName: 'Author',
      };
      storage.addPost(newPost);

      const posts = storage.getPosts();
      expect(posts.length).toBe(1);
      expect(posts[0].id).toBe('post-new');
    });

    it('appends to existing posts without overwriting', async () => {
      const existingPost = {
        id: 'post-existing',
        title: 'Existing',
        content: 'Content',
        createdAt: new Date().toISOString(),
        authorId: 'user-1',
        authorName: 'Author',
      };
      localStorage.setItem(POSTS_KEY, JSON.stringify([existingPost]));

      storage = await loadStorage();
      const newPost = {
        id: 'post-new',
        title: 'New',
        content: 'New Content',
        createdAt: new Date().toISOString(),
        authorId: 'user-2',
        authorName: 'Author2',
      };
      storage.addPost(newPost);

      const posts = storage.getPosts();
      expect(posts.length).toBe(2);
      expect(posts[0].id).toBe('post-existing');
      expect(posts[1].id).toBe('post-new');
    });
  });

  describe('updatePost', () => {
    it('updates an existing post by id', async () => {
      const post = {
        id: 'post-1',
        title: 'Original Title',
        content: 'Original Content',
        createdAt: new Date().toISOString(),
        authorId: 'user-1',
        authorName: 'Author',
      };
      localStorage.setItem(POSTS_KEY, JSON.stringify([post]));

      storage = await loadStorage();
      storage.updatePost({ id: 'post-1', title: 'Updated Title', content: 'Updated Content' });

      const posts = storage.getPosts();
      expect(posts.length).toBe(1);
      expect(posts[0].title).toBe('Updated Title');
      expect(posts[0].content).toBe('Updated Content');
      expect(posts[0].authorId).toBe('user-1');
      expect(posts[0].authorName).toBe('Author');
    });

    it('does nothing when post id is not found', async () => {
      const post = {
        id: 'post-1',
        title: 'Title',
        content: 'Content',
        createdAt: new Date().toISOString(),
        authorId: 'user-1',
        authorName: 'Author',
      };
      localStorage.setItem(POSTS_KEY, JSON.stringify([post]));

      storage = await loadStorage();
      storage.updatePost({ id: 'post-nonexistent', title: 'Nope' });

      const posts = storage.getPosts();
      expect(posts.length).toBe(1);
      expect(posts[0].title).toBe('Title');
    });
  });

  describe('removePost', () => {
    it('removes a post by id', async () => {
      const posts = [
        {
          id: 'post-1',
          title: 'Post 1',
          content: 'Content 1',
          createdAt: new Date().toISOString(),
          authorId: 'user-1',
          authorName: 'Author',
        },
        {
          id: 'post-2',
          title: 'Post 2',
          content: 'Content 2',
          createdAt: new Date().toISOString(),
          authorId: 'user-1',
          authorName: 'Author',
        },
      ];
      localStorage.setItem(POSTS_KEY, JSON.stringify(posts));

      storage = await loadStorage();
      storage.removePost('post-1');

      const remaining = storage.getPosts();
      expect(remaining.length).toBe(1);
      expect(remaining[0].id).toBe('post-2');
    });

    it('does nothing when removing a non-existent post id', async () => {
      const posts = [
        {
          id: 'post-1',
          title: 'Post 1',
          content: 'Content 1',
          createdAt: new Date().toISOString(),
          authorId: 'user-1',
          authorName: 'Author',
        },
      ];
      localStorage.setItem(POSTS_KEY, JSON.stringify(posts));

      storage = await loadStorage();
      storage.removePost('post-nonexistent');

      const remaining = storage.getPosts();
      expect(remaining.length).toBe(1);
    });
  });

  describe('getUsers', () => {
    it('returns users array including admin', async () => {
      storage = await loadStorage();
      const users = storage.getUsers();
      expect(Array.isArray(users)).toBe(true);
      expect(users.length).toBeGreaterThanOrEqual(1);
      expect(users.find((u) => u.id === 'admin-001')).toBeDefined();
    });

    it('returns empty-like array with admin when localStorage has invalid JSON for users', async () => {
      storage = await loadStorage();
      localStorage.setItem(USERS_KEY, 'invalid-json');

      vi.resetModules();
      const freshStorage = await import('./storage.js');
      const users = freshStorage.getUsers();
      expect(Array.isArray(users)).toBe(true);
      expect(users.find((u) => u.username === 'admin')).toBeDefined();
    });
  });

  describe('setUsers', () => {
    it('stores users array in localStorage', async () => {
      storage = await loadStorage();
      const users = [
        {
          id: 'user-1',
          displayName: 'Test',
          username: 'test',
          password: 'pass',
          role: 'user',
          createdAt: new Date().toISOString(),
        },
      ];
      storage.setUsers(users);

      const stored = JSON.parse(localStorage.getItem(USERS_KEY));
      expect(stored).toEqual(users);
    });

    it('stores empty array when given non-array value', async () => {
      storage = await loadStorage();
      storage.setUsers(null);

      const stored = JSON.parse(localStorage.getItem(USERS_KEY));
      expect(stored).toEqual([]);
    });
  });

  describe('addUser', () => {
    it('adds a user to existing users', async () => {
      storage = await loadStorage();
      const initialCount = storage.getUsers().length;

      const newUser = {
        id: 'user-new',
        displayName: 'New User',
        username: 'newuser',
        password: 'pass1234',
        role: 'user',
        createdAt: new Date().toISOString(),
      };
      storage.addUser(newUser);

      const users = storage.getUsers();
      expect(users.length).toBe(initialCount + 1);
      expect(users.find((u) => u.id === 'user-new')).toBeDefined();
    });
  });

  describe('removeUser', () => {
    it('removes a user by id', async () => {
      const users = [
        {
          id: 'admin-001',
          displayName: 'Admin',
          username: 'admin',
          password: 'adminpw',
          role: 'admin',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'user-to-delete',
          displayName: 'Delete Me',
          username: 'deleteme',
          password: 'pass',
          role: 'user',
          createdAt: new Date().toISOString(),
        },
      ];
      localStorage.setItem(USERS_KEY, JSON.stringify(users));

      storage = await loadStorage();
      storage.removeUser('user-to-delete');

      const remaining = storage.getUsers();
      expect(remaining.find((u) => u.id === 'user-to-delete')).toBeUndefined();
    });

    it('does nothing when removing a non-existent user id', async () => {
      storage = await loadStorage();
      const initialCount = storage.getUsers().length;

      storage.removeUser('user-nonexistent');

      const users = storage.getUsers();
      expect(users.length).toBe(initialCount);
    });
  });

  describe('getSession', () => {
    it('returns null when no session exists', async () => {
      storage = await loadStorage();
      const session = storage.getSession();
      expect(session).toBeNull();
    });

    it('returns session object when valid session exists', async () => {
      const sessionData = {
        userId: 'user-1',
        username: 'testuser',
        displayName: 'Test User',
        role: 'user',
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));

      storage = await loadStorage();
      const session = storage.getSession();
      expect(session).toEqual(sessionData);
    });

    it('returns null when session is invalid JSON', async () => {
      localStorage.setItem(SESSION_KEY, 'not-json');

      storage = await loadStorage();
      const session = storage.getSession();
      expect(session).toBeNull();
    });

    it('returns null when session object has no userId', async () => {
      localStorage.setItem(SESSION_KEY, JSON.stringify({ username: 'test' }));

      storage = await loadStorage();
      const session = storage.getSession();
      expect(session).toBeNull();
    });

    it('returns null when session is a non-object value', async () => {
      localStorage.setItem(SESSION_KEY, JSON.stringify('string-session'));

      storage = await loadStorage();
      const session = storage.getSession();
      expect(session).toBeNull();
    });
  });

  describe('setSession', () => {
    it('stores session in localStorage', async () => {
      storage = await loadStorage();
      const sessionData = {
        userId: 'user-1',
        username: 'testuser',
        displayName: 'Test User',
        role: 'user',
      };
      storage.setSession(sessionData);

      const stored = JSON.parse(localStorage.getItem(SESSION_KEY));
      expect(stored).toEqual(sessionData);
    });
  });

  describe('clearSession', () => {
    it('removes session from localStorage', async () => {
      const sessionData = {
        userId: 'user-1',
        username: 'testuser',
        displayName: 'Test User',
        role: 'user',
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));

      storage = await loadStorage();
      storage.clearSession();

      expect(localStorage.getItem(SESSION_KEY)).toBeNull();
    });

    it('does not throw when no session exists', async () => {
      storage = await loadStorage();
      expect(() => storage.clearSession()).not.toThrow();
    });
  });

  describe('localStorage error handling', () => {
    it('getPosts returns empty array when localStorage.getItem throws', async () => {
      storage = await loadStorage();
      const originalGetItem = localStorage.getItem;
      localStorage.getItem = vi.fn(() => {
        throw new Error('Storage error');
      });

      const posts = storage.getPosts();
      expect(posts).toEqual([]);

      localStorage.getItem = originalGetItem;
    });

    it('setPosts does not throw when localStorage.setItem throws', async () => {
      storage = await loadStorage();
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = vi.fn(() => {
        throw new Error('Storage error');
      });

      expect(() => storage.setPosts([{ id: 'post-1' }])).not.toThrow();

      localStorage.setItem = originalSetItem;
    });

    it('clearSession does not throw when localStorage.removeItem throws', async () => {
      storage = await loadStorage();
      const originalRemoveItem = localStorage.removeItem;
      localStorage.removeItem = vi.fn(() => {
        throw new Error('Storage error');
      });

      expect(() => storage.clearSession()).not.toThrow();

      localStorage.removeItem = originalRemoveItem;
    });
  });
});