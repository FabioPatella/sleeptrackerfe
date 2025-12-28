# Authentication System Documentation

## Overview
The authentication system uses Pinia for state management and provides an automatic token refresh mechanism for all authenticated API calls.

## Components

### 1. Auth Store (`stores/auth.ts`)
Manages authentication state including:
- `accessToken`: The JWT access token
- `user`: Current user information (id, email, role, name, surname)

**Actions:**
- `setAccessToken(token)`: Store the access token
- `setUser(user)`: Store user information
- `clearAuth()`: Clear all authentication data
- `refresh()`: Call the refresh endpoint and update the access token

**Getters:**
- `isAuthenticated`: Returns true if the user has an access token
- `userRole`: Returns the current user's role (USER or DOCTOR)

### 2. Auth Fetch Composable (`composables/useAuthFetch.ts`)
A wrapper around `$fetch` that automatically:
- Includes the access token in the `Authorization` header
- Handles token expiration (401 errors)
- Automatically calls refresh and retries the request
- Redirects to login if refresh fails

## Usage Examples

### Basic GET Request
```typescript
const data = await useAuthFetch('/api/user/profile')
```

### POST Request with Body
```typescript
const response = await useAuthFetch('/api/sleep-logs', {
  method: 'POST',
  body: {
    date: '2025-12-27',
    hours: 7.5,
    quality: 'good'
  }
})
```

### PUT Request
```typescript
const updated = await useAuthFetch('/api/user/profile', {
  method: 'PUT',
  body: {
    name: 'John',
    surname: 'Doe'
  }
})
```

### DELETE Request
```typescript
await useAuthFetch('/api/sleep-logs/123', {
  method: 'DELETE'
})
```

### Using in Components
```vue
<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()

const loadUserData = async () => {
  try {
    const profile = await useAuthFetch('/api/user/profile')
    console.log('User profile:', profile)
  } catch (error) {
    console.error('Failed to load profile:', error)
  }
}

onMounted(() => {
  if (authStore.isAuthenticated) {
    loadUserData()
  }
})
</script>
```

## Authentication Flow

1. **Login/Signup:**
   - User submits credentials
   - Backend returns `accessToken` and user info
   - Token and user are stored in Pinia store
   - User is redirected to their dashboard

2. **Authenticated Requests:**
   - Use `useAuthFetch()` for all authenticated API calls
   - Access token is automatically included in headers
   - If token is expired (401 error):
     - Refresh endpoint is called automatically
     - New token is stored
     - Original request is retried
     - If refresh fails, user is redirected to login

3. **Token Refresh:**
   - Refresh token is stored as HTTP-only cookie
   - Called automatically by `useAuthFetch` on 401 errors
   - Can be called manually: `await authStore.refresh()`

4. **Logout:**
   ```typescript
   const logout = () => {
     authStore.clearAuth()
     navigateTo('/')
   }
   ```

## Security Features

- **Access Token**: Stored in Pinia (client-side state)
- **Refresh Token**: HTTP-only cookie (not accessible to JavaScript)
- **Automatic Refresh**: Transparent to the application
- **Credential Inclusion**: All requests include `credentials: 'include'` to send cookies

## Notes

- Never call regular `$fetch` for authenticated endpoints - always use `useAuthFetch()`
- The access token is automatically refreshed when expired
- Refresh failures automatically redirect to login page
- All authentication state is cleared on logout or refresh failure
