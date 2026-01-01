<template>
  <div class="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center px-4">
    <div class="max-w-md w-full">
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
        <!-- Invalid Token State -->
        <div v-if="tokenStatus === 'invalid'" class="text-center space-y-6">
          <div class="text-6xl mb-4">⚠️</div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Invalid Reset Link
          </h1>
          <p class="text-gray-600 dark:text-gray-400 mb-6">
            This password reset link is invalid or has expired. Reset links are only valid for 15 minutes.
          </p>
          <div class="space-y-3">
            <NuxtLink 
              to="/forgot-password" 
              class="block w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl text-center"
            >
              Request New Reset Link
            </NuxtLink>
            <NuxtLink 
              to="/" 
              class="block text-center text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
            >
              Back to Login
            </NuxtLink>
          </div>
        </div>

        <!-- Success State -->
        <div v-else-if="resetSuccess" class="text-center space-y-6">
          <div class="text-6xl mb-4">✅</div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Password Reset Successful!
          </h1>
          <p class="text-gray-600 dark:text-gray-400 mb-6">
            Your password has been reset successfully. You can now log in with your new password.
          </p>
          <div class="p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg">
            <p class="text-sm text-indigo-700 dark:text-indigo-400">
              Redirecting to login in {{ countdown }} seconds...
            </p>
          </div>
          <NuxtLink 
            to="/" 
            class="inline-block text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium"
          >
            Go to Login Now
          </NuxtLink>
        </div>

        <!-- Reset Form -->
        <div v-else-if="tokenStatus === 'valid'">
          <div class="text-center mb-8">
            <div class="text-6xl mb-4">🔑</div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Reset Password
            </h1>
            <p class="text-gray-600 dark:text-gray-400">
              Enter your new password below
            </p>
          </div>

          <form @submit.prevent="handleSubmit" class="space-y-6">
            <!-- New Password -->
            <div>
              <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                New Password
              </label>
              <div class="relative">
                <input
                  id="password"
                  v-model="newPassword"
                  :type="showPassword ? 'text' : 'password'"
                  required
                  :disabled="loading"
                  minlength="8"
                  placeholder="Minimum 8 characters"
                  class="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  :disabled="loading"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50"
                >
                  <span v-if="showPassword" class="text-xl">👁️</span>
                  <span v-else class="text-xl">👁️‍🗨️</span>
                </button>
              </div>
            </div>

            <!-- Confirm Password -->
            <div>
              <label for="confirm-password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirm Password
              </label>
              <div class="relative">
                <input
                  id="confirm-password"
                  v-model="confirmPassword"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  required
                  :disabled="loading"
                  minlength="8"
                  placeholder="Re-enter your password"
                  class="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  @click="showConfirmPassword = !showConfirmPassword"
                  :disabled="loading"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50"
                >
                  <span v-if="showConfirmPassword" class="text-xl">👁️</span>
                  <span v-else class="text-xl">👁️‍🗨️</span>
                </button>
              </div>
            </div>

            <!-- Password Strength Indicator -->
            <div v-if="newPassword" class="space-y-2">
              <div class="flex items-center justify-between text-xs">
                <span class="text-gray-600 dark:text-gray-400">Password Strength:</span>
                <span :class="passwordStrengthColor" class="font-semibold">{{ passwordStrengthText }}</span>
              </div>
              <div class="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  :class="passwordStrengthBgColor"
                  class="h-full transition-all duration-300"
                  :style="{ width: passwordStrengthWidth }"
                ></div>
              </div>
              <div class="space-y-1 text-xs">
                <div class="flex items-center gap-2">
                  <span :class="hasMinLength ? 'text-green-600' : 'text-gray-400'">
                    {{ hasMinLength ? '✓' : '○' }}
                  </span>
                  <span class="text-gray-600 dark:text-gray-400">At least 8 characters</span>
                </div>
                <div class="flex items-center gap-2">
                  <span :class="hasUppercase ? 'text-green-600' : 'text-gray-400'">
                    {{ hasUppercase ? '✓' : '○' }}
                  </span>
                  <span class="text-gray-600 dark:text-gray-400">Contains uppercase letter</span>
                </div>
                <div class="flex items-center gap-2">
                  <span :class="hasNumber ? 'text-green-600' : 'text-gray-400'">
                    {{ hasNumber ? '✓' : '○' }}
                  </span>
                  <span class="text-gray-600 dark:text-gray-400">Contains number</span>
                </div>
                <div class="flex items-center gap-2">
                  <span :class="hasSpecialChar ? 'text-green-600' : 'text-gray-400'">
                    {{ hasSpecialChar ? '✓' : '○' }}
                  </span>
                  <span class="text-gray-600 dark:text-gray-400">Contains special character</span>
                </div>
              </div>
            </div>

            <!-- Error Message -->
            <div v-if="error" class="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p class="text-sm text-red-600 dark:text-red-400">{{ error }}</p>
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              :disabled="loading"
              class="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg"
            >
              <span v-if="loading" class="flex items-center justify-center">
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Resetting Password...
              </span>
              <span v-else>Reset Password</span>
            </button>
          </form>

          <div class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 text-center">
            <NuxtLink 
              to="/" 
              class="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
            >
              ← Back to Login
            </NuxtLink>
          </div>
        </div>

        <!-- Loading State -->
        <div v-else class="text-center py-12">
          <svg class="animate-spin h-12 w-12 mx-auto text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p class="mt-4 text-gray-600 dark:text-gray-400">Validating reset token...</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()

const token = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const loading = ref(false)
const error = ref('')
const tokenStatus = ref<'unchecked' | 'checking' | 'valid' | 'invalid'>('checking')
const resetSuccess = ref(false)
const countdown = ref(3)

onMounted(async () => {
  // Extract token from URL
  const urlToken = route.query.token as string || ''
  
  if (!urlToken) {
    tokenStatus.value = 'invalid'
    return
  }

  // Store token in component state
  token.value = urlToken
  
  // Clean the URL immediately using the History API
  const cleanUrl = window.location.pathname
  window.history.replaceState({}, document.title, cleanUrl)
  
  // Validate token before showing the form
  await validateToken()
})

const validateToken = async () => {
  if (!token.value) {
    tokenStatus.value = 'invalid'
    return
  }

  tokenStatus.value = 'checking'

  try {
    await $fetch(`${config.public.apiBaseUrl}/api/auth/validate-reset-token?token=${token.value}`, {
      method: 'GET'
    })
    tokenStatus.value = 'valid'
  } catch (err: any) {
    console.error('Token validation error:', err)
    tokenStatus.value = 'invalid'
  }
}

// Password validation computed properties
const hasMinLength = computed(() => newPassword.value.length >= 8)
const hasUppercase = computed(() => /[A-Z]/.test(newPassword.value))
const hasNumber = computed(() => /[0-9]/.test(newPassword.value))
const hasSpecialChar = computed(() => /[!@#$%^&*(),.?":{}|<>]/.test(newPassword.value))

const passwordStrength = computed(() => {
  let strength = 0
  const password = newPassword.value

  if (password.length >= 8) strength++
  if (password.length >= 12) strength++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++
  if (/[0-9]/.test(password)) strength++
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++

  return strength
})

const passwordStrengthText = computed(() => {
  const strength = passwordStrength.value
  if (strength <= 1) return 'Weak'
  if (strength <= 3) return 'Medium'
  return 'Strong'
})

const passwordStrengthColor = computed(() => {
  const strength = passwordStrength.value
  if (strength <= 1) return 'text-red-600'
  if (strength <= 3) return 'text-yellow-600'
  return 'text-green-600'
})

const passwordStrengthBgColor = computed(() => {
  const strength = passwordStrength.value
  if (strength <= 1) return 'bg-red-600'
  if (strength <= 3) return 'bg-yellow-600'
  return 'bg-green-600'
})

const passwordStrengthWidth = computed(() => {
  const strength = passwordStrength.value
  return `${(strength / 5) * 100}%`
})

const handleSubmit = async () => {
  error.value = ''

  if (newPassword.value.length < 8) {
    error.value = 'Password must be at least 8 characters long'
    return
  }

  if (newPassword.value !== confirmPassword.value) {
    error.value = 'Passwords do not match'
    return
  }

  loading.value = true

  try {
    await $fetch(`${config.public.apiBaseUrl}/api/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: {
        token: token.value,
        newPassword: newPassword.value
      }
    })

    newPassword.value = ''
    confirmPassword.value = ''
    resetSuccess.value = true
    
    const countdownInterval = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(countdownInterval)
        router.push('/')
      }
    }, 1000)

  } catch (err: any) {
    console.error('Password reset error:', err)
    
    if (err.data?.error) {
      error.value = err.data.error
    } else if (err.statusCode === 400) {
      error.value = 'Invalid or expired reset link. Please request a new one.'
    } else if (err.message?.includes('fetch') || err.message?.includes('network')) {
      error.value = 'Unable to connect to the server. Please try again later.'
    } else {
      error.value = 'Failed to reset password. Please try again.'
    }
    
    if (err.statusCode === 400) {
      tokenStatus.value = 'invalid'
    }
  } finally {
    loading.value = false
  }
}
</script>