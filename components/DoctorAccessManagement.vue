<template>
  <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 sm:p-6">
    <h2 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4">
      Doctor Access Management
    </h2>

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
                Dr. {{ doctor.name }} {{ doctor.surname }}
              </div>
              <div class="text-sm text-gray-600 dark:text-gray-400">
                {{ doctor.specialization }} • Access granted {{ doctor.accessDate }}
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
                Dr. {{ request.name }} {{ request.surname }}
              </div>
              <div class="text-sm text-gray-600 dark:text-gray-400">
                {{ request.specialization }} • Requested {{ request.requestDate }}
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
              class="flex-1 sm:flex-none px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-all text-sm"
            >
              Reject
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Doctor {
  id: string
  name: string
  surname: string
  specialization: string
  accessDate: string
}

interface DoctorRequest {
  id: string
  name: string
  surname: string
  specialization: string
  requestDate: string
}

defineProps<{
  activeDoctors: Doctor[]
  pendingRequests: DoctorRequest[]
}>()

const emit = defineEmits<{
  revokeAccess: [doctorId: string]
  acceptRequest: [requestId: string]
  rejectRequest: [requestId: string]
}>()

const revokeAccess = (doctorId: string) => {
  emit('revokeAccess', doctorId)
}

const acceptRequest = (requestId: string) => {
  emit('acceptRequest', requestId)
}

const rejectRequest = (requestId: string) => {
  emit('rejectRequest', requestId)
}
</script>
