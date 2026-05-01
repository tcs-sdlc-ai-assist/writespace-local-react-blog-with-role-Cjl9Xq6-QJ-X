import React, { useState } from 'react';
import { getUsers, addUser, removeUser } from '../utils/storage.js';
import { getCurrentUser } from '../utils/auth.js';
import Navbar from '../components/Navbar.jsx';
import UserRow from '../components/UserRow.jsx';

/**
 * Admin-only user management page rendered at '/admin/users'.
 * Displays all users in a responsive list with avatar, display name, username, role badge,
 * created date, and delete button. Includes a create user form with validation.
 * Hard-coded admin (admin-001) and currently logged-in admin cannot be deleted.
 * @returns {JSX.Element} The user management page.
 */
function UserManagement() {
  const session = getCurrentUser();

  const [users, setUsersState] = useState(() => getUsers());
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('user');
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState(null);

  const refreshUsers = () => {
    setUsersState(getUsers());
  };

  const resetForm = () => {
    setDisplayName('');
    setUsername('');
    setPassword('');
    setConfirmPassword('');
    setRole('user');
    setFormError('');
    setFormLoading(false);
  };

  const handleToggleForm = () => {
    if (showCreateForm) {
      resetForm();
    }
    setShowCreateForm((prev) => !prev);
  };

  const handleCreateUser = (e) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);

    if (!displayName || !displayName.trim()) {
      setFormError('Display name is required.');
      setFormLoading(false);
      return;
    }

    if (!username || !username.trim()) {
      setFormError('Username is required.');
      setFormLoading(false);
      return;
    }

    if (!password || password.length < 4) {
      setFormError('Password must be at least 4 characters.');
      setFormLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setFormError('Passwords do not match.');
      setFormLoading(false);
      return;
    }

    const currentUsers = getUsers();
    const exists = currentUsers.some((u) => u.username === username.trim());

    if (exists) {
      setFormError('Username is already taken.');
      setFormLoading(false);
      return;
    }

    try {
      const newUser = {
        id: 'user-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 9),
        displayName: displayName.trim(),
        username: username.trim(),
        password: password,
        role: role,
        createdAt: new Date().toISOString(),
      };

      addUser(newUser);
      refreshUsers();
      resetForm();
      setShowCreateForm(false);
    } catch (err) {
      setFormError('An unexpected error occurred. Please try again.');
      setFormLoading(false);
    }
  };

  const handleDeleteClick = (userId) => {
    setDeleteUserId(userId);
    setShowConfirm(true);
  };

  const handleConfirmDelete = () => {
    if (deleteUserId) {
      removeUser(deleteUserId);
      refreshUsers();
    }
    setShowConfirm(false);
    setDeleteUserId(null);
  };

  const handleCancelDelete = () => {
    setShowConfirm(false);
    setDeleteUserId(null);
  };

  const deleteTargetUser = deleteUserId
    ? users.find((u) => u.id === deleteUserId)
    : null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1">
        {/* Gradient Banner */}
        <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-pink-500 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
              Manage Users
            </h1>
            <p className="text-white/80 text-base sm:text-lg">
              View, create, and manage user accounts on WriteSpace.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Actions */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-800">
              All Users ({users.length})
            </h2>
            <button
              onClick={handleToggleForm}
              className={`px-5 py-2.5 text-sm font-semibold rounded-lg transition-colors shadow-sm ${
                showCreateForm
                  ? 'text-slate-700 bg-slate-100 hover:bg-slate-200'
                  : 'text-white bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {showCreateForm ? 'Cancel' : 'Create User'}
            </button>
          </div>

          {/* Create User Form */}
          {showCreateForm && (
            <div className="bg-white rounded-xl shadow-md p-6 sm:p-8 mb-8">
              <h3 className="text-lg font-bold text-slate-800 mb-4">
                Create New User
              </h3>

              {formError && (
                <div
                  className="mb-6 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700"
                  role="alert"
                >
                  {formError}
                </div>
              )}

              <form onSubmit={handleCreateUser} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label
                      htmlFor="createDisplayName"
                      className="block text-sm font-medium text-slate-700 mb-1"
                    >
                      Display Name
                    </label>
                    <input
                      id="createDisplayName"
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Enter display name"
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      required
                      autoComplete="name"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="createUsername"
                      className="block text-sm font-medium text-slate-700 mb-1"
                    >
                      Username
                    </label>
                    <input
                      id="createUsername"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Choose a username"
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      required
                      autoComplete="username"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="createPassword"
                      className="block text-sm font-medium text-slate-700 mb-1"
                    >
                      Password
                    </label>
                    <input
                      id="createPassword"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min 4 characters"
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      required
                      autoComplete="new-password"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="createConfirmPassword"
                      className="block text-sm font-medium text-slate-700 mb-1"
                    >
                      Confirm Password
                    </label>
                    <input
                      id="createConfirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm password"
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      required
                      autoComplete="new-password"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="createRole"
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    Role
                  </label>
                  <select
                    id="createRole"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full sm:w-48 px-4 py-2.5 rounded-lg border border-slate-300 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleToggleForm}
                    className="px-5 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className={`px-5 py-2.5 text-sm font-semibold text-white rounded-lg transition-colors shadow-sm ${
                      formLoading
                        ? 'bg-indigo-400 cursor-not-allowed'
                        : 'bg-indigo-600 hover:bg-indigo-700'
                    }`}
                  >
                    {formLoading ? 'Creating…' : 'Create User'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Users List */}
          {users.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-8 flex flex-col items-center justify-center text-center">
              <div className="w-14 h-14 flex items-center justify-center rounded-full bg-indigo-100 text-2xl mb-4">
                👥
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">
                No users found
              </h3>
              <p className="text-sm text-slate-500 max-w-md">
                There are no user accounts yet. Create the first one!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {users.map((user) => (
                <UserRow
                  key={user.id}
                  user={user}
                  onDelete={handleDeleteClick}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm mx-4">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-red-100 text-2xl mb-4">
                🗑️
              </div>
              <h2 className="text-lg font-bold text-slate-800 mb-2">
                Delete User
              </h2>
              <p className="text-sm text-slate-500 mb-6">
                Are you sure you want to delete{' '}
                {deleteTargetUser ? (
                  <span className="font-semibold text-slate-700">
                    {deleteTargetUser.displayName}
                  </span>
                ) : (
                  'this user'
                )}
                ? This action cannot be undone.
              </p>
              <div className="flex items-center space-x-3 w-full">
                <button
                  onClick={handleCancelDelete}
                  className="flex-1 px-4 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export { UserManagement };
export default UserManagement;