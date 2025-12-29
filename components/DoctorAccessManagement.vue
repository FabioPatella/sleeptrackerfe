<template>
  <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 sm:p-6">
    <h2 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4">
      Doctor Access Management
    </h2>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-8">
      <LoadingSpinner />
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
      <p class="text-red-600 dark:text-red-400 text-sm">{{ error }}</p>
    </div>

    <!-- Content -->
    <div v-else>
    <!-- Active Doctors -->
    <div class="mb-6">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
        Doctors with Access
      </h3>
      <div v-if="activeDoctors.length === 0" class="text-gray-500 dark:text-gray-400 text-sm">
        No doctors have access to your data yet.
      </div>
      <div v-else class="space-y-3">
        <div
          v-for="doctor in activeDoctors"
          :key="doctor.id"
          class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800"
        >
          <div class="flex items-center space-x-3">
            <span class="text-2xl">👨‍⚕️</span>
            <div>
              <div class="font-medium text-gray-900 dark:text-white">
                {{ doctor.doctorName }}
              </div>
              <div class="text-sm text-gray-600 dark:text-gray-400">
                {{ doctor.doctorEmail }}
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Access granted {{ formatDate(doctor.respondedAt) }}
              </div>
              <div v-if="doctor.reason" class="text-xs text-gray-500 dark:text-gray-500 mt-1 italic">
                Reason: {{ doctor.reason }}
              </div>
            </div>
          </div>
          <button
            @click="revokeAccess(doctor.id)"
            class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-all text-sm self-start sm:self-auto"
          >
            Revoke Access
          </button>
        </div>
      </div>
    </div>

    <!-- Pending Requests -->
    <div>
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
        Pending Requests
      </h3>
      <div v-if="pendingRequests.length === 0" class="text-gray-500 dark:text-gray-400 text-sm">
        No pending access requests.
      </div>
      <div v-else class="space-y-3">
        <div
          v-for="request in pendingRequests"
          :key="request.id"
          class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800"
        >
          <div class="flex items-center space-x-3">
            <span class="text-2xl">👨‍⚕️</span>
            <div>
              <div class="font-medium text-gray-900 dark:text-white">
                {{ request.doctorName }}
              </div>
              <div class="text-sm text-gray-600 dark:text-gray-400">
                {{ request.doctorEmail }}
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Requested {{ formatDate(request.requestedAt) }}
              </div>
              <div v-if="request.reason" class="text-xs text-gray-500 dark:text-gray-500 mt-1 italic">
                Reason: {{ request.reason }}
              </div>
            </div>
          </div>
          <div class="flex gap-2">
            <button
              @click="acceptRequest(request.id)"
              class="flex-1 sm:flex-none px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-all text-sm"
            >
              Accept
            </button>
            <button
              @click="rejectRequest(request.id)"
              class="flex-1 sm:flex-none px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-all text-sm"
            >
              Reject
            </button>
          </div>
        </div>
      </div>
    </div>
    </div>

    <!-- Confirmation Dialog for Reject -->
    <ConfirmationDialog
      :show="showConfirmModal"
      title="Reject Access Request?"
      message="Are you sure you want to reject this access request? This action cannot be undone."
      icon="⚠️"
      confirm-text="Yes, Reject"
      cancel-text="Cancel"
      confirm-button-class="bg-red-600 hover:bg-red-700"
      @confirm="confirmReject"
      @cancel="cancelReject"
    />

    <!-- Confirmation Dialog for Revoke -->
    <ConfirmationDialog
      :show="showRevokeConfirmModal"
      title="Revoke Doctor Access?"
      message="Are you sure you want to revoke this doctor's access to your sleep data? They will no longer be able to view your information."
      icon="⚠️"
      confirm-text="Yes, Revoke"
      cancel-text="Cancel"
      confirm-button-class="bg-red-600 hover:bg-red-700"
      @confirm="confirmRevoke"
      @cancel="cancelRevoke"
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

defineProps<{
  activeDoctors: AccessRequest[]
  pendingRequests: AccessRequest[]
  loading?: boolean
  error?: string
}>()

const showConfirmModal = ref(false)
const pendingRejectId = ref<number | null>(null)
const showRevokeConfirmModal = ref(false)
const pendingRevokeId = ref<number | null>(null)

const emit = defineEmits<{
  revokeAccess: [requestId: number]
  acceptRequest: [requestId: number]
  rejectRequest: [requestId: number]
}>()

const revokeAccess = (requestId: number) => {
  pendingRevokeId.value = requestId
  showRevokeConfirmModal.value = true
}

const confirmRevoke = () => {
  if (pendingRevokeId.value !== null) {
    emit('revokeAccess', pendingRevokeId.value)
  }
  showRevokeConfirmModal.value = false
  pendingRevokeId.value = null
}

const cancelRevoke = () => {
  showRevokeConfirmModal.value = false
  pendingRevokeId.value = null
}

const acceptRequest = (requestId: number) => {
  emit('acceptRequest', requestId)
}

const rejectRequest = (requestId: number) => {
  pendingRejectId.value = requestId
  showConfirmModal.value = true
}

const confirmReject = () => {
  if (pendingRejectId.value !== null) {
    emit('rejectRequest', pendingRejectId.value)
  }
  showConfirmModal.value = false
  pendingRejectId.value = null
}

const cancelReject = () => {
  showConfirmModal.value = false
  pendingRejectId.value = null
}

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return 'N/A'
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { 
    year: 'numeric',
    month: 'short', 
    day: 'numeric'
  })
}
</script>
