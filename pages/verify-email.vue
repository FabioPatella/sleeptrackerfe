<template>
  <div class="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center px-4">
    <div class="max-w-md w-full">
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
        
        <!-- Loading State -->
        <div v-if="status === 'verifying'" class="text-center space-y-6">
          <svg class="animate-spin h-16 w-16 mx-auto text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            Verifying Your Email
          </h1>
          <p class="text-gray-600 dark:text-gray-400">
            Please wait while we verify your email address...
          </p>
        </div>

        <!-- Success State -->
        <div v-else-if="status === 'success'" class="text-center space-y-6">
          <div class="text-6xl mb-4">✅</div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Email Verified!
          </h1>
          <p class="text-gray-600 dark:text-gray-400 mb-6">
            {{ message }}
          </p>
          <div class="p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg">
            <p class="text-sm text-indigo-700 dark:text-indigo-400">
              Redirecting to login in {{ countdown }} seconds...
            </p>
          </div>
          <NuxtLink 
            to="/" 
            class="inline-block bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Go to Login Now
          </NuxtLink>
        </div>

        <!-- Error State -->
        <div v-else-if="status === 'error'" class="text-center space-y-6">
          <div class="text-6xl mb-4">❌</div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Verification Failed
          </h1>
          <p class="text-gray-600 dark:text-gray-400 mb-6">
            {{ message }}
          </p>
          
          <!-- Resend Section -->
          <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 space-y-4">
            <p class="text-sm text-gray-700 dark:text-gray-300">
              Need a new verification link?
            </p>
            
            <div v-if="!resendSuccess">
              <input
                v-model="resendEmail"
                type="email"
                placeholder="Enter your email address"
                class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white mb-3"
              />
              <button
                @click="handleResendVerification"
                :disabled="resending || resendCooldown > 0"
                class="w-full bg-indigo-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span v-if="resending">Sending...</span>
                <span v-else-if="resendCooldown > 0">Resend in {{ resendCooldown }}s</span>
                <span v-else>Resend Verification Email</span>
              </button>
            </div>
            
            <div v-else class="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p class="text-sm text-green-600 dark:text-green-400">
                ✓ Verification email sent! Check your inbox.
              </p>
            </div>
            
            <div v-if="resendError" class="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p class="text-sm text-red-600 dark:text-red-400">{{ resendError }}</p>
            </div>
          </div>

          <div class="space-y-3 pt-4">
            <NuxtLink 
              to="/" 
              class="block text-center text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
            >
              Back to Login
            </NuxtLink>
          </div>
        </div>

        <!-- No Token State -->
        <div v-else class="text-center space-y-6">
          <div class="text-6xl mb-4">⚠️</div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Invalid Link
          </h1>
          <p class="text-gray-600 dark:text-gray-400 mb-6">
            This verification link is invalid or incomplete.
          </p>
          <NuxtLink 
            to="/" 
            class="inline-block bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Back to Login
          </NuxtLink>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()

const verificationToken = ref('')
const status = ref<'verifying' | 'success' | 'error' | 'no-token'>('verifying')
const message = ref('')
const countdown = ref(3)

// Resend functionality
const resendEmail = ref('')
const resending = ref(false)
const resendSuccess = ref(false)
const resendError = ref('')
const resendCooldown = ref(0)

onMounted(async () => {
  // Extract token from URL
  const urlToken = route.query.token as string || ''
  
  if (!urlToken) {
    status.value = 'no-token'
    return
  }

  // Store token in component state
  verificationToken.value = urlToken
  
  // Clean the URL immediately using the History API
  const cleanUrl = window.location.pathname
  window.history.replaceState({}, document.title, cleanUrl)
  
  // Verify the email
  await verifyEmail()
})

const verifyEmail = async () => {
  if (!verificationToken.value) {
    status.value = 'no-token'
    return
  }

  status.value = 'verifying'

  try {
    const response = await $fetch(`${config.public.apiBaseUrl}/api/auth/verify-email?token=${verificationToken.value}`, {
      method: 'GET'
    }) as any

    status.value = 'success'
    message.value = response.message || 'Email verified successfully! You can now log in with your account.'
    
    // Start countdown and redirect
    const countdownInterval = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(countdownInterval)
        router.push('/')
      }
    }, 1000)

  } catch (err: any) {
    console.error('Email verification error:', err)
    status.value = 'error'
    
    if (err.data?.message) {
      message.value = err.data.message
    } else if (err.data && typeof err.data === 'string') {
      message.value = err.data
    } else {
      message.value = 'This verification link is invalid or has expired. Please request a new one.'
    }
  }
}

const handleResendVerification = async () => {
  if (!resendEmail.value) {
    resendError.value = 'Please enter your email address'
    return
  }

  resending.value = true
  resendError.value = ''
  resendSuccess.value = false

  try {
    const response = await $fetch(`${config.public.apiBaseUrl}/api/auth/resend-verification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: {
        email: resendEmail.value
      }
    }) as any

    resendSuccess.value = true
    resendError.value = ''
    
    // Start cooldown timer
    resendCooldown.value = 60
    const cooldownInterval = setInterval(() => {
      resendCooldown.value--
      if (resendCooldown.value <= 0) {
        clearInterval(cooldownInterval)
        resendSuccess.value = false
      }
    }, 1000)

  } catch (err: any) {
    console.error('Resend verification error:', err)
    
    // Show generic message for security (don't reveal if email exists)
    resendError.value = 'If an account exists with that email, a verification link will be sent.'
  } finally {
    resending.value = false
  }
}
</script>
