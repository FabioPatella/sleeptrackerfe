import { useAuthStore } from '~/stores/auth'
import type { NitroFetchOptions } from 'nitropack'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS'

interface AuthFetchOptions {
  method?: HttpMethod
  body?: any
  headers?: HeadersInit
  params?: Record<string, any>
  query?: Record<string, any>
}

/**
 * Wrapper for authenticated API calls with automatic token refresh
 * Automatically includes the access token in the Authorization header
 * If the request fails with 401, it will attempt to refresh the token and retry once
 */
export const useAuthFetch = async <T = any>(
  url: string,
  options: AuthFetchOptions = {}
): Promise<T> => {
  const authStore = useAuthStore()
  const config = useRuntimeConfig()

  // Construct full URL if it's a relative path
  const fullUrl = url.startsWith('http') ? url : `${config.public.apiBaseUrl}${url}`

  // First attempt with current access token
  try {
    const response = await $fetch<T>(fullUrl, {
      ...options,
      credentials: 'include',
      headers: {
        ...options.headers,
        ...(authStore.accessToken ? { Authorization: `Bearer ${authStore.accessToken}` } : {}),
      },
    })
    return response
  } catch (error: any) {
    // If we get a 401 (unauthorized) or 403 (forbidden), try to refresh the token
    if (error.statusCode === 401 || error.status === 401 || error.statusCode === 403 || error.status === 403) {
      console.log('Access token expired or forbidden, attempting refresh...')
      
      const refreshed = await authStore.refresh()
      
      if (refreshed) {
        // Retry the request with the new token
        try {
          const response = await $fetch<T>(fullUrl, {
            ...options,
            credentials: 'include',
            headers: {
              ...options.headers,
              Authorization: `Bearer ${authStore.accessToken}`,
            },
          })
          return response
        } catch (retryError: any) {
          console.error('Retry after refresh failed:', retryError)
          // If retry fails, redirect to login
          authStore.clearAuth()
          navigateTo('/')
          throw retryError
        }
      } else {
        // Refresh failed, redirect to login
        console.log('Token refresh failed, redirecting to login')
        authStore.clearAuth()
        navigateTo('/')
        throw new Error('Authentication failed')
      }
    }
    
    // For other errors, just throw them
    throw error
  }
}
