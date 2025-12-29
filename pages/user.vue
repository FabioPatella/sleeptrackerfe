<template>
  <div class="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
    <AppHeader 
      title="User Dashboard" 
      :subtitle="`Welcome back, ${authStore.user?.name || 'User'}!`" 
    />
    
    <div class="max-w-7xl mx-auto px-4 py-6 sm:py-8">
      <!-- Tab Navigation -->
      <div class="mb-6 flex flex-wrap gap-2 bg-white dark:bg-gray-800 p-2 rounded-xl shadow-md">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="[
            'flex-1 min-w-[100px] px-4 py-3 rounded-lg font-medium transition-all text-sm sm:text-base',
            activeTab === tab.id
              ? 'bg-indigo-600 text-white shadow-lg'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
          ]"
        >
          <span class="mr-2">{{ tab.icon }}</span>
          {{ tab.label }}
        </button>
      </div>

      <!-- Tab Content -->
      <div class="space-y-6">
        <!-- Sleep Log Tab -->
        <div v-if="activeTab === 'log'">
          <SleepLogForm @submit="handleSleepLogSubmit">
            <template #notification>
              <NotificationToast 
                :show="notification.show"
                :message="notification.message"
                :type="notification.type"
                :description="notification.description"
                @close="hideNotification"
              />
            </template>
          </SleepLogForm>
        </div>

        <!-- Statistics Tab -->
        <div v-if="activeTab === 'stats'">
          <SleepStatistics />
        </div>

        <!-- Doctors Tab -->
        <div v-if="activeTab === 'doctors'">
          <DoctorAccessManagement
            :active-doctors="activeDoctors"
            :pending-requests="pendingRequests"
            @revoke-access="handleRevokeAccess"
            @accept-request="handleAcceptRequest"
            @reject-request="handleRejectRequest"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()
const activeTab = ref('log')
const notification = ref<{ show: boolean; message: string; type: 'success' | 'error' | 'loading'; description?: string }>({ 
  show: false, 
  message: '', 
  type: 'success',
  description: ''
})

const showNotification = (message: string, type: 'success' | 'error' | 'loading', description = '', duration = 4000) => {
  notification.value = { show: true, message, type, description }
  if (type !== 'loading' && duration > 0) {
    setTimeout(() => {
      notification.value.show = false
    }, duration)
  }
}

const hideNotification = () => {
  notification.value.show = false
}

// Auth check is now handled by middleware - no need for onMounted logic

const tabs = [
  { id: 'log', label: 'Log Sleep', icon: '📝' },
  { id: 'stats', label: 'Statistics', icon: '📊' },
  { id: 'doctors', label: 'Doctors', icon: '👨‍⚕️' }
]

// Hardcoded data for demonstration
const statistics = ref({
  avgHours: 7.2,
  avgQuality: 7.5,
  totalNights: 28,
  trend: '↑ +0.5h'
})

const recentLogs = ref([
  {
    id: '1',
    date: '2025-12-26',
    totalHours: 7.5,
    intervals: [
      { id: '1a', start: '23:00', end: '06:30', quality: 8 }
    ]
  },
  {
    id: '2',
    date: '2025-12-25',
    totalHours: 6.8,
    intervals: [
      { id: '2a', start: '22:30', end: '02:00', quality: 6 },
      { id: '2b', start: '03:00', end: '06:30', quality: 7 }
    ]
  },
  {
    id: '3',
    date: '2025-12-24',
    totalHours: 8.0,
    intervals: [
      { id: '3a', start: '22:00', end: '06:00', quality: 9 }
    ]
  },
  {
    id: '4',
    date: '2025-12-23',
    totalHours: 7.0,
    intervals: [
      { id: '4a', start: '23:30', end: '06:30', quality: 7 }
    ]
  }
])

const activeDoctors = ref([
  {
    id: '1',
    name: 'Sarah',
    surname: 'Johnson',
    specialization: 'Sleep Medicine',
    accessDate: 'Dec 15, 2025'
  },
  {
    id: '2',
    name: 'Michael',
    surname: 'Chen',
    specialization: 'Neurology',
    accessDate: 'Dec 20, 2025'
  }
])

const pendingRequests = ref([
  {
    id: '1',
    name: 'Emily',
    surname: 'Rodriguez',
    specialization: 'Psychology',
    requestDate: 'Dec 26, 2025'
  }
])

const handleSleepLogSubmit = async (data: any) => {
  try {
    // Show loading notification
    showNotification('Saving sleep log...', 'loading', '', 0)
    
    // Transform the form data to match API structure
    const payload = {
      date: data.date,
      notes: data.notes || '',
      intervals: data.intervals.map((interval: any) => ({
        startTime: interval.start + ':00', // Convert HH:mm to HH:mm:ss
        endTime: interval.end + ':00',
        intensity: interval.quality
      }))
    }

    await useAuthFetch('/api/sleep-hours', {
      method: 'POST',
      body: payload
    })

    // Hide loading and show success
    hideNotification()
    setTimeout(() => {
      showNotification(
        'Sleep log saved successfully!', 
        'success',
        'Your data is now available in the Statistics section.'
      )
    }, 100)
  } catch (error: any) {
    console.error('Error saving sleep log:', error)
    // Hide loading and show error
    hideNotification()
    setTimeout(() => {
      showNotification(error.message || 'Failed to save sleep log', 'error')
    }, 100)
  }
}

const handleRevokeAccess = (doctorId: string) => {
  console.log('Revoke access for doctor:', doctorId)
  // TODO: Call API with useAuthFetch
  activeDoctors.value = activeDoctors.value.filter(d => d.id !== doctorId)
  alert('Doctor access revoked! (This will be connected to the backend)')
}

const handleAcceptRequest = (requestId: string) => {
  console.log('Accept request:', requestId)
  // TODO: Call API with useAuthFetch
  const request = pendingRequests.value.find(r => r.id === requestId)
  if (request) {
    activeDoctors.value.push({
      id: requestId,
      name: request.name,
      surname: request.surname,
      specialization: request.specialization,
      accessDate: 'Today'
    })
    pendingRequests.value = pendingRequests.value.filter(r => r.id !== requestId)
  }
  alert('Request accepted! (This will be connected to the backend)')
}

const handleRejectRequest = (requestId: string) => {
  console.log('Reject request:', requestId)
  // TODO: Call API with useAuthFetch
  pendingRequests.value = pendingRequests.value.filter(r => r.id !== requestId)
  alert('Request rejected! (This will be connected to the backend)')
}
definePageMeta({
  middleware: 'role'
})

</script>
