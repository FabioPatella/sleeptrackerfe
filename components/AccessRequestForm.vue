<template>
  <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 sm:p-6">
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
          placeholder="patient@example.com"
          class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Reason for Access
        </label>
        <textarea
          v-model="form.reason"
          rows="3"
          required
          placeholder="Brief explanation for requesting access..."
          class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
        />
      </div>

      <button
        type="submit"
        class="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
      >
        Send Access Request
      </button>
    </form>

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
                {{ request.patientEmail }}
              </div>
              <div class="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Sent: {{ request.requestDate }}
              </div>
            </div>
            <span class="text-xs px-2 py-1 bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300 rounded-full">
              Pending
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface PendingRequest {
  id: string
  patientEmail: string
  requestDate: string
}

defineProps<{
  pendingRequests: PendingRequest[]
}>()

const emit = defineEmits<{
  submit: [data: { patientEmail: string; reason: string }]
}>()

const form = ref({
  patientEmail: '',
  reason: ''
})

const handleSubmit = () => {
  emit('submit', { ...form.value })
  // Reset form
  form.value = {
    patientEmail: '',
    reason: ''
  }
}
</script>
