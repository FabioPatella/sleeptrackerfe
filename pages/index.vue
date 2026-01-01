<template>
  <div v-if="!isCheckingAuth" class="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
    <!-- Hero Section -->
    <div class="max-w-7xl mx-auto px-4 py-12">
      <div class="text-center mb-12">
        <h1 class="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          😴 Insomnia Tracker
        </h1>
        <p class="text-xl text-gray-700 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
          Track your sleep patterns, monitor your progress, and take control of your sleep health. 
          Connect with healthcare professionals for personalized insights.
        </p>
      </div>

      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <!-- Login/Signup Forms or Verification Notice - Shows first on mobile -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 order-1 lg:order-2">
          
          <!-- Email Verification Notice -->
          <EmailVerificationNotice 
            v-if="showVerificationNotice" 
            :email="verificationEmail"
            @back-to-login="showVerificationNotice = false; isLogin = true"
          />
          
          <!-- Login/Signup Forms -->
          <div v-else>
          <!-- Toggle Buttons -->
          <div class="flex space-x-2 mb-8 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
            <button
              @click="isLogin = true"
              :class="[
                'flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-200',
                isLogin 
                  ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-md' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              ]"
            >
              Login
            </button>
            <button
              @click="isLogin = false"
              :class="[
                'flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-200',
                !isLogin 
                  ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-md' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              ]"
            >
              Sign Up
            </button>
          </div>

          <!-- Login Form -->
          <form v-if="isLogin" @submit.prevent="handleLogin" class="space-y-6">
            <div>
              <label for="login-email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <input
                id="login-email"
                v-model="loginForm.email"
                type="email"
                required
                class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
              />
            </div>

            <div>
              <label for="login-password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div class="relative">
                <input
                  id="login-password"
                  v-model="loginForm.password"
                  :type="showLoginPassword ? 'text' : 'password'"
                  required
                  class="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                />
                <button
                  type="button"
                  @click="showLoginPassword = !showLoginPassword"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <span v-if="showLoginPassword" class="text-xl">👁️</span>
                  <span v-else class="text-xl">👁️‍🗨️</span>
                </button>
              </div>
            </div>

            <div class="flex items-center justify-between">
              <label class="flex items-center">
                <input type="checkbox" class="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
                <span class="ml-2 text-sm text-gray-600 dark:text-gray-400">Remember me</span>
              </label>
              <NuxtLink to="/forgot-password" class="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300">
                Forgot password?
              </NuxtLink>
            </div>

            <!-- Error Message -->
            <div v-if="loginError" class="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p class="text-sm text-red-600 dark:text-red-400">{{ loginError }}</p>
              
              <!-- Resend Verification Button -->
              <button
                v-if="showResendButton"
                @click="handleResendVerification"
                class="mt-3 w-full bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-all duration-200 text-sm"
              >
                Resend Verification Email
              </button>
            </div>

            <button
              type="submit"
              :disabled="isLoginLoading"
              class="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg"
            >
              <span v-if="isLoginLoading" class="flex items-center justify-center">
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing In...
              </span>
              <span v-else>Sign In</span>
            </button>
          </form>

          <!-- Signup Form -->
          <form v-else @submit.prevent="handleSignup" class="space-y-6">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label for="signup-firstname" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Name
                </label>
                <input
                  id="signup-firstname"
                  v-model="signupForm.name"
                  type="text"
                  required
                  class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                />
              </div>
              <div>
                <label for="signup-lastname" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Surname
                </label>
                <input
                  id="signup-lastname"
                  v-model="signupForm.surname"
                  type="text"
                  required
                  class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                />
              </div>
            </div>

            <div>
              <label for="signup-email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <input
                id="signup-email"
                v-model="signupForm.email"
                type="email"
                required
                class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
              />
            </div>

            <div>
              <label for="signup-password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div class="relative">
                <input
                  id="signup-password"
                  v-model="signupForm.password"
                  :type="showSignupPassword ? 'text' : 'password'"
                  required
                  class="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                />
                <button
                  type="button"
                  @click="showSignupPassword = !showSignupPassword"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <span v-if="showSignupPassword" class="text-xl">👁️</span>
                  <span v-else class="text-xl">👁️‍🗨️</span>
                </button>
              </div>
            </div>

            <div>
              <label for="signup-confirm-password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirm Password
              </label>
              <div class="relative">
                <input
                  id="signup-confirm-password"
                  v-model="signupForm.confirmPassword"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  required
                  class="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                />
                <button
                  type="button"
                  @click="showConfirmPassword = !showConfirmPassword"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <span v-if="showConfirmPassword" class="text-xl">👁️</span>
                  <span v-else class="text-xl">👁️‍🗨️</span>
                </button>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Account Type
              </label>
              <div class="flex space-x-4">
                <label class="flex-1 flex items-center p-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-indigo-500 transition-all">
                  <input
                    v-model="signupForm.role"
                    type="radio"
                    value="USER"
                    class="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div class="ml-3">
                    <div class="text-sm font-medium text-gray-900 dark:text-white">User</div>
                    <div class="text-xs text-gray-500 dark:text-gray-400">Track your sleep</div>
                  </div>
                </label>
                <label class="flex-1 flex items-center p-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-indigo-500 transition-all">
                  <input
                    v-model="signupForm.role"
                    type="radio"
                    value="DOCTOR"
                    class="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div class="ml-3">
                    <div class="text-sm font-medium text-gray-900 dark:text-white">Doctor</div>
                    <div class="text-xs text-gray-500 dark:text-gray-400">Monitor patients</div>
                  </div>
                </label>
              </div>
            </div>

            <!-- Error Message -->
            <div v-if="signupError" class="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p class="text-sm text-red-600 dark:text-red-400">{{ signupError }}</p>
            </div>

            <button
              type="submit"
              :disabled="isSignupLoading"
              class="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg"
            >
              <span v-if="isSignupLoading" class="flex items-center justify-center">
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Account...
              </span>
              <span v-else>Create Account</span>
            </button>
          </form>
          </div>
        </div>

        <!-- Features Section - Shows second on mobile -->
        <div class="space-y-6 order-2 lg:order-1">
          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-6">What We Offer</h2>
            
            <div class="space-y-4">
              <div class="flex items-start space-x-4">
                <div class="flex-shrink-0 w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center">
                  <span class="text-2xl">📊</span>
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-1">Track Your Sleep</h3>
                  <p class="text-gray-600 dark:text-gray-400">Log your sleep hours, quality, and patterns to understand your sleep habits better.</p>
                </div>
              </div>

              <div class="flex items-start space-x-4">
                <div class="flex-shrink-0 w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                  <span class="text-2xl">📈</span>
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-1">View Statistics</h3>
                  <p class="text-gray-600 dark:text-gray-400">Visualize your sleep data with charts and insights to identify trends over time.</p>
                </div>
              </div>

              <div class="flex items-start space-x-4">
                <div class="flex-shrink-0 w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <span class="text-2xl">👨‍⚕️</span>
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-1">Connect with Doctors</h3>
                  <p class="text-gray-600 dark:text-gray-400">Share your sleep data with healthcare professionals for expert guidance and support.</p>
                </div>
              </div>

              <div class="flex items-start space-x-4">
                <div class="flex-shrink-0 w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                  <span class="text-2xl">🔒</span>
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-1">Privacy First</h3>
                  <p class="text-gray-600 dark:text-gray-400">Your data is secure and only shared with doctors you explicitly authorize.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

const isLogin = ref(true)
const config = useRuntimeConfig()
const isCheckingAuth = ref(true)
const authStore = useAuthStore()

const showLoginPassword = ref(false)
const showSignupPassword = ref(false)
const showConfirmPassword = ref(false)

const loginError = ref('')
const signupError = ref('')
const showVerificationNotice = ref(false)
const verificationEmail = ref('')
const showResendButton = ref(false)
const isLoginLoading = ref(false)
const isSignupLoading = ref(false)

// Check if user is already authenticated on page load
onMounted(async () => {
  const refreshed = await authStore.refresh()
  
  if (refreshed && authStore.user) {
    // If refresh is successful, redirect based on user role
    if (authStore.user.role === 'DOCTOR') {
      navigateTo('/doctor')
    } else if (authStore.user.role === 'USER') {
      navigateTo('/user')
    }
  } else {
    // No valid session, show login page
    isCheckingAuth.value = false
  }
})

const loginForm = ref({
  email: '',
  password: ''
})

const signupForm = ref({
  name: '',
  surname: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: 'USER'
})

const handleLogin = async () => {
  loginError.value = ''
  isLoginLoading.value = true
  
  try {
    const response = await $fetch(`${config.public.apiBaseUrl}/api/auth/login`, {
      method: 'POST',
      credentials: 'include',
      body: {
        email: loginForm.value.email,
        password: loginForm.value.password
      }
    }) as any
    console.log('Login successful:', response)
    
    // Store the access token and user info in the store
    if (response.accessToken) {
      authStore.setAccessToken(response.accessToken)
    }
    
    // Extract user data from response
    const userData = {
      id: response.id || response.user?.id,
      email: response.email || response.user?.email,
      role: response.role || response.user?.role,
      name: response.name || response.user?.name,
      surname: response.surname || response.user?.surname,
    }
    console.log('User data:', userData)
    authStore.setUser(userData)
    
    // Redirect based on user role
    if (userData.role === 'DOCTOR') {
      navigateTo('/doctor')
    } else {
      navigateTo('/user')
    }
  } catch (error: any) {
    console.error('Login failed:', error)
    
    // Check if it's an email verification error (403)
    if (error.status === 403 || error.statusCode === 403) {
      if (typeof error.data === 'string') {
        loginError.value = error.data
      } else if (error.data?.message) {
        loginError.value = error.data.message
      } else {
        loginError.value = 'Please verify your email before logging in.'
      }
      showResendButton.value = true
      verificationEmail.value = loginForm.value.email
    } else {
      // Handle other errors
      showResendButton.value = false
      if (typeof error.data === 'string') {
        loginError.value = error.data
      } else if (error.data?.message) {
        loginError.value = error.data.message
      } else if (error.message) {
        loginError.value = error.message
      } else {
        loginError.value = 'Login failed. Please try again.'
      }
    }
  } finally {
    isLoginLoading.value = false
  }
}

const handleSignup = async () => {
  signupError.value = ''
  
  if (signupForm.value.password !== signupForm.value.confirmPassword) {
    signupError.value = 'Passwords do not match'
    return
  }
  
  isSignupLoading.value = true
  
  try {
    const response = await $fetch(`${config.public.apiBaseUrl}/api/auth/signup`, {
      method: 'POST',
      credentials: 'include',
      body: {
        name: signupForm.value.name,
        surname: signupForm.value.surname,
        email: signupForm.value.email,
        password: signupForm.value.password,
        role: signupForm.value.role
      }
    }) as any
    console.log('Signup successful:', response)
    
    // Show verification notice instead of auto-login
    verificationEmail.value = signupForm.value.email
    showVerificationNotice.value = true
    
    // Clear the form
    signupForm.value = {
      name: '',
      surname: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'USER'
    }
  } catch (error: any) {
    console.error('Signup failed:', error)
    // Handle plain text error responses from backend
    if (typeof error.data === 'string') {
      signupError.value = error.data
    } else if (error.data?.message) {
      signupError.value = error.data.message
    } else if (error.message) {
      signupError.value = error.message
    } else {
      signupError.value = 'Signup failed. Please try again.'
    }
  } finally {
    isSignupLoading.value = false
  }
}

const handleResendVerification = async () => {
  loginError.value = ''
  
  try {
    await $fetch(`${config.public.apiBaseUrl}/api/auth/resend-verification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: {
        email: verificationEmail.value
      }
    })
    
    loginError.value = ''
    showResendButton.value = false
    // Show success message by switching to verification notice
    showVerificationNotice.value = true
    isLogin.value = false
  } catch (error: any) {
    console.error('Resend verification error:', error)
    loginError.value = 'Failed to resend verification email. Please try again.'
  }
}
</script>
