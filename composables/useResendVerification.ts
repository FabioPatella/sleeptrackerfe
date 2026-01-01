/**
 * Composable for handling email verification resend functionality
 * Provides reusable logic for resending verification emails with cooldown
 */
export const useResendVerification = () => {
  const config = useRuntimeConfig()
  
  const resending = ref(false)
  const resendSuccess = ref(false)
  const resendError = ref('')
  const resendCooldown = ref(0)

  const resendVerificationEmail = async (email: string) => {
    if (!email) {
      resendError.value = 'Email address is required'
      return false
    }

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
          email
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

      return true
    } catch (err: any) {
      console.error('Resend verification error:', err)
      
      // Show generic message for security (don't reveal if email exists)
      resendError.value = 'Failed to send verification email. Please try again later.'
      return false
    } finally {
      resending.value = false
    }
  }

  const resetState = () => {
    resending.value = false
    resendSuccess.value = false
    resendError.value = ''
    resendCooldown.value = 0
  }

  return {
    resending: readonly(resending),
    resendSuccess: readonly(resendSuccess),
    resendError: readonly(resendError),
    resendCooldown: readonly(resendCooldown),
    resendVerificationEmail,
    resetState
  }
}
