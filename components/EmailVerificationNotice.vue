<template>
  <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
    <div class="text-center space-y-6">
      <div class="text-6xl mb-4">📧</div>
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        Check Your Email
      </h1>
      <p class="text-gray-600 dark:text-gray-400">
        We've sent a verification link to:
      </p>
      <div class="p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg">
        <p class="text-lg font-semibold text-indigo-700 dark:text-indigo-400">
          {{ email }}
        </p>
      </div>
      <p class="text-gray-600 dark:text-gray-400">
        Click the link in the email to verify your account and start using Insomnia Tracker.
      </p>

      <!-- Resend Section -->
      <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 space-y-4 mt-6">
        <p class="text-sm text-gray-700 dark:text-gray-300">
          Didn't receive the email?
        </p>
        
        <button
          v-if="!resendSuccess"
          @click="handleResend"
          :disabled="resending || resendCooldown > 0"
          class="w-full bg-indigo-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="resending" class="flex items-center justify-center">
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Sending...
          </span>
          <span v-else-if="resendCooldown > 0">Resend in {{ resendCooldown }}s</span>
          <span v-else>Resend Verification Email</span>
        </button>
        
        <div v-if="resendSuccess" class="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p class="text-sm text-green-600 dark:text-green-400">
            ✓ Verification email sent! Check your inbox.
          </p>
        </div>
        
        <div v-if="resendError" class="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p class="text-sm text-red-600 dark:text-red-400">{{ resendError }}</p>
        </div>
        
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">
          💡 Check your spam folder if you don't see it.
        </p>
      </div>

      <div class="pt-6 border-t border-gray-200 dark:border-gray-700">
        <button
          @click="$emit('back-to-login')"
          class="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 cursor-pointer"
        >
          ← Back to Login
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  email: string
}>()

const emit = defineEmits<{
  'back-to-login': []
}>()

const config = useRuntimeConfig()

const resending = ref(false)
const resendSuccess = ref(false)
const resendError = ref('')
const resendCooldown = ref(0)

const handleResend = async () => {
  resending.value = true
  resendError.value = ''
  resendSuccess.value = false

  try {
    await $fetch(`${config.public.apiBaseUrl}/api/auth/resend-verification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: {
        email: props.email
      }
    })

    resendSuccess.value = true
    resendError.value = ''
    
    // Start cooldown timer (60 seconds)
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
    resendError.value = 'Failed to send verification email. Please try again later.'
  } finally {
    resending.value = false
  }
}
</script>
