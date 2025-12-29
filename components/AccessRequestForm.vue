<template>
  <div>
    <h2 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4">
      Request Patient Access
    </h2>

    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Patient Email
        </label>
        <input
          v-model="form.patientEmail"
          type="email"
          required
          :disabled="submitting"
          placeholder="patient@example.com"
          class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white disabled:opacity-50"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Reason for Access (Optional)
        </label>
        <textarea
          v-model="form.reason"
          rows="3"
          :disabled="submitting"
          placeholder="Brief explanation for requesting access..."
          class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none disabled:opacity-50"
        />
      </div>

      <!-- Submit Error -->
      <div v-if="submitError" class="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
        <p class="text-red-600 dark:text-red-400 text-sm">{{ submitError }}</p>
      </div>

      <!-- Submit Success -->
      <div v-if="submitSuccess" class="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
        <p class="text-green-600 dark:text-green-400 text-sm">Access request sent successfully!</p>
      </div>

      <button
        type="submit"
        :disabled="submitting"
        class="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ submitting ? 'Sending...' : 'Send Access Request' }}
      </button>
    </form>

    <!-- Loading State -->
    <div v-if="props.loading" class="mt-6 flex justify-center items-center py-8">
      <LoadingSpinner />
    </div>

    <!-- Error State -->
    <div v-else-if="props.error" class="mt-6 bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
      <p class="text-red-600 dark:text-red-400 text-sm">{{ props.error }}</p>
    </div>

    <template v-else>
    <!-- Pending Requests -->
    <div v-if="pendingRequests.length > 0" class="mt-6">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
        Pending Requests
      </h3>
      <div class="space-y-2">
        <div
          v-for="request in pendingRequests"
          :key="request.id"
          class="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800"
        >
          <div class="flex justify-between items-start">
            <div>
              <div class="font-medium text-gray-900 dark:text-white text-sm">
                {{ request.patientName }}
              </div>
              <div class="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {{ request.patientEmail }}
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Sent: {{ formatDate(request.requestedAt) }}
              </div>
              <div v-if="request.reason" class="text-xs text-gray-500 dark:text-gray-500 mt-1 italic">
                Reason: {{ request.reason }}
              </div>
            </div>
            <span class="text-xs px-2 py-1 bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300 rounded-full">
              Pending
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Accepted Requests -->
    <div v-if="acceptedRequests.length > 0" class="mt-6">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
        Active Access
      </h3>
      <div class="space-y-2">
        <div
          v-for="request in acceptedRequests"
          :key="request.id"
          class="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800"
        >
          <div class="flex justify-between items-start gap-3">
            <div class="flex-1">
              <div class="font-medium text-gray-900 dark:text-white text-sm">
                {{ request.patientName }}
              </div>
              <div class="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {{ request.patientEmail }}
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Accepted: {{ formatDate(request.respondedAt || '') }}
              </div>
              <div v-if="request.reason" class="text-xs text-gray-500 dark:text-gray-500 mt-1 italic">
                Reason: {{ request.reason }}
              </div>
            </div>
            <button
              @click="handleRemoveAccess(request.id)"
              class="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-all text-xs whitespace-nowrap"
            >
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- No Requests State -->
    <div v-if="pendingRequests.length === 0 && acceptedRequests.length === 0" class="mt-6 text-center py-8 text-gray-500 dark:text-gray-400">
      No access requests yet
    </div>
    </template>

    <!-- Confirmation Dialog -->
    <ConfirmationDialog
      :show="showRemoveConfirm"
      title="Remove Patient Access?"
      message="Are you sure you want to remove your access to this patient's sleep data? You will need to request access again."
      icon="⚠️"
      confirm-text="Yes, Remove"
      cancel-text="Cancel"
      confirm-button-class="bg-red-600 hover:bg-red-700"
      @confirm="confirmRemove"
      @cancel="cancelRemove"
    />
  </div>
</template>

<script setup lang="ts">
interface AccessRequest {
  id: number
  doctorId: number
  doctorEmail: string
  doctorName: string
  patientId: number
  patientEmail: string
  patientName: string
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED'
  reason: string | null
  requestedAt: string
  respondedAt: string | null
}

const props = defineProps<{
  initialRequests?: AccessRequest[]
  loading?: boolean
  error?: string
}>()

const emit = defineEmits<{
  submit: [data: { patientEmail: string; reason: string }]
  refresh: []
}>()

const form = ref({
  patientEmail: '',
  reason: ''
})

const allRequests = computed(() => props.initialRequests || [])
const submitting = ref(false)
const submitError = ref('')
const submitSuccess = ref(false)
const showRemoveConfirm = ref(false)
const pendingRemoveId = ref<number | null>(null)

const pendingRequests = computed(() => 
  allRequests.value.filter(req => req.status === 'PENDING')
)

const acceptedRequests = computed(() => 
  allRequests.value.filter(req => req.status === 'ACCEPTED')
)

const handleSubmit = async () => {
  submitting.value = true
  submitError.value = ''
  submitSuccess.value = false
  
  try {
    await useAuthFetch('/api/access/request', {
      method: 'POST',
      body: {
        patientEmail: form.value.patientEmail,
        reason: form.value.reason
      }
    })
    
    submitSuccess.value = true
    
    // Reset form
    form.value = {
      patientEmail: '',
      reason: ''
    }
    
    // Refresh the list (don't wait for it)
    emit('refresh')
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      submitSuccess.value = false
    }, 3000)
  } catch (err: any) {
    // Try to extract error from response body
    submitError.value = err.data?.error || err.message || 'Failed to send access request'
  } finally {
    submitting.value = false
  }
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return 'N/A'
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { 
    year: 'numeric',
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const handleRemoveAccess = (accessId: number) => {
  pendingRemoveId.value = accessId
  showRemoveConfirm.value = true
}

const confirmRemove = async () => {
  if (pendingRemoveId.value === null) return
  
  try {
    await useAuthFetch(`/api/access/${pendingRemoveId.value}`, {
      method: 'DELETE'
    })
    
    // Refresh the list
    emit('refresh')
    
    submitSuccess.value = true
    setTimeout(() => {
      submitSuccess.value = false
    }, 3000)
  } catch (err: any) {
    submitError.value = err.data?.error || err.message || 'Failed to remove access'
  } finally {
    showRemoveConfirm.value = false
    pendingRemoveId.value = null
  }
}

const cancelRemove = () => {
  showRemoveConfirm.value = false
  pendingRemoveId.value = null
}
</script>
