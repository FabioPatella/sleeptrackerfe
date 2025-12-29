import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: null as string | null,
    user: null as { email: string; role: string; name: string; surname: string } | null,
  }),

  actions: {
    setAccessToken(token: string) {
      this.accessToken = token
    },
    

    setUser(user: { email: string; role: string; name: string; surname: string }) {
      this.user = user
    },

    clearAuth() {
      this.accessToken = null
      this.user = null
      // Clear the role cookie to ensure middleware redirects properly
      const roleCookie = useCookie('role')
      roleCookie.value = null
    },

    async logout() {
      const config = useRuntimeConfig()
      try {
        await $fetch(`${config.public.apiBaseUrl}/api/auth/logout`, {
          method: 'POST',
          credentials: 'include',
        })
      } catch (error) {
        console.error('Logout error:', error)
        // Continue with clearing auth even if API call fails
      } finally {
        this.clearAuth()
      }
    },

    async refresh() {
      const config = useRuntimeConfig()
      try {
        const response = await $fetch(`${config.public.apiBaseUrl}/api/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
        }) as any

        if (response.accessToken) {
          this.setAccessToken(response.accessToken)
          // Set user data if available (response is flat structure with email, name, surname, role)
          if (response.email) {
            this.setUser({
              email: response.email,
              role: response.role,
              name: response.name,
              surname: response.surname,
            })
          }
          return true
        }
        return false
      } catch (error) {
        this.clearAuth()
        return false
      }
    },
  },

  getters: {
    isAuthenticated: (state) => !!state.accessToken,
    userRole: (state) => state.user?.role,
  },
})
