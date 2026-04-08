import type { AuthAdapter, User } from '../types.js'

/**
 * Mock auth adapter for testing and development.
 * No external dependencies. Stores state in memory.
 */
export function createMockAdapter(initialUser?: User): AuthAdapter {
  let currentUser: User | null = initialUser ?? null
  const listeners = new Set<(user: User | null) => void>()

  function notify() {
    for (const fn of listeners) {
      fn(currentUser)
    }
  }

  return {
    async signIn(email, _password) {
      currentUser = {
        uid: 'mock-' + email,
        email,
        displayName: email.split('@')[0],
        photoURL: null,
        roles: ['student'],
      }
      notify()
      return currentUser
    },

    async signInWithOAuth(_provider) {
      currentUser = {
        uid: 'mock-oauth',
        email: 'oauth@example.com',
        displayName: 'OAuth User',
        photoURL: null,
        roles: ['student'],
      }
      notify()
      return currentUser
    },

    async signUp(email, _password, displayName) {
      currentUser = {
        uid: 'mock-' + email,
        email,
        displayName,
        photoURL: null,
        roles: ['student'],
      }
      notify()
      return currentUser
    },

    async signOut() {
      currentUser = null
      notify()
    },

    async resetPassword(_email) {
      // no-op in mock
    },

    async getToken() {
      return currentUser ? 'mock-token-' + currentUser.uid : null
    },

    onAuthStateChange(callback) {
      listeners.add(callback)
      // Fire immediately with current state
      callback(currentUser)
      return () => { listeners.delete(callback) }
    },
  }
}
