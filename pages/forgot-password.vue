<template>
  <div class="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center px-4">
    <div class="max-w-md w-full">
      <!-- Back to Login Link -->
      <div class="mb-6">
        <NuxtLink 
          to="/" 
          class="inline-flex items-center text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
        >
          <span class="mr-2">←</span> Back to Login
        </NuxtLink>
      </div>

      <!-- Card -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
        <!-- Header -->
        <div class="text-center mb-8">
          <div class="text-6xl mb-4">🔐</div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Forgot Password?
          </h1>
          <p class="text-gray-600 dark:text-gray-400">
            No worries! Enter your email and we'll send you reset instructions.
          </p>
        </div>

        <!-- Success Message -->
        <div v-if="submitted" class="space-y-6">
          <div class="p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-center">
            <div class="text-5xl mb-4">✉️</div>
            <h3 class="text-lg font-semibold text-green-800 dark:text-green-300 mb-2">
              Check Your Email
            </h3>
            <p class="text-sm text-green-700 dark:text-green-400 mb-4">
              If an account exists with <strong>{{ email }}</strong>, you will receive password reset instructions.
            </p>
            <p class="text-xs text-green-600 dark:text-green-500">
              The reset link will expire in 15 minutes.
            </p>
          </div>

          <div class="text-center space-y-3">
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Didn't receive an email? Check your spam folder.
            </p>
            <button
              @click="resetForm"
              class="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium"
            >
              Try a different email
            </button>
          </div>
        </div>

        <!-- Form -->
        <form v-else @submit.prevent="handleSubmit" class="space-y-6">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email Address
            </label>
            <input
              id="email"
              v-model="email"
              type="email"
              required
              :disabled="loading"
              placeholder="you@example.com"
              class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            />
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
              Sending...
            </span>
            <span v-else>Send Reset Link</span>
          </button>
        </form>

        <!-- Additional Help -->
        <div class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 text-center">
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Remember your password? 
            <NuxtLink to="/" class="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium">
              Sign In
            </NuxtLink>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()
const email = ref('')
const loading = ref(false)
const error = ref('')
const submitted = ref(false)

const handleSubmit = async () => {
  error.value = ''
  
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.value)) {
    error.value = 'Please enter a valid email address'
    return
  }

  loading.value = true

  try {
    const response = await $fetch(`${config.public.apiBaseUrl}/api/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: {
        email: email.value
      }
    })

    // Always show success message for security (don't reveal if email exists)
    submitted.value = true
  } catch (err: any) {
    console.error('Forgot password error:', err)
    
    // Even on error, we show success message to prevent email enumeration
    // But if there's a network error, we should show it
    if (err.message?.includes('fetch') || err.message?.includes('network')) {
      error.value = 'Unable to connect to the server. Please try again later.'
    } else {
      // For any other error, still show success for security
      submitted.value = true
    }
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  email.value = ''
  submitted.value = false
  error.value = ''
}
</script>
