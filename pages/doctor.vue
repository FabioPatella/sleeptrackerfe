<template>
  <div class="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
    <AppHeader 
      title="Doctor Dashboard" 
      :subtitle="`Welcome, Dr. ${authStore.user?.surname || 'Doctor'}!`" 
    />
    
    <div class="max-w-7xl mx-auto px-4 py-6 sm:py-8">
      <!-- Tab Navigation -->
      <div class="mb-6 flex flex-wrap gap-2 bg-white dark:bg-gray-800 p-2 rounded-xl shadow-md">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="[
            'flex-1 min-w-[120px] px-4 py-3 rounded-lg font-medium transition-all text-sm sm:text-base',
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
        <!-- Patients Tab -->
        <div v-show="activeTab === 'patients'">
          <!-- Patient Search Bar -->
          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 mb-6">
            <div class="flex flex-col sm:flex-row gap-3">
              <div class="flex-1">
                <input
                  v-model="patientSearch"
                  type="text"
                  placeholder="Search patient by name or email..."
                  autocomplete="off"
                  @input="handlePatientSearch"
                  @focus="handleSearchFocus"
                  @blur="handleSearchBlur"
                  class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <button
                v-if="selectedPatient"
                @click="clearPatientSelection"
                class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-all text-sm whitespace-nowrap"
              >
                Clear Selection
              </button>
            </div>

            <!-- Search Results Dropdown -->
            <div
              v-if="showSearchResults && filteredPatients.length > 0"
              class="mt-3 max-h-60 overflow-y-auto bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600"
            >
              <button
                v-for="patient in filteredPatients"
                :key="patient.id"
                @mousedown.prevent
                @click="selectPatient(patient)"
                class="w-full text-left p-3 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all border-b border-gray-200 dark:border-gray-600 last:border-b-0"
              >
                <div class="flex items-center space-x-3">
                  <span class="text-xl">😴</span>
                  <div>
                    <div class="font-medium text-gray-900 dark:text-white">
                      {{ patient.name }}
                    </div>
                    <div class="text-sm text-gray-600 dark:text-gray-400">
                      {{ patient.email }}
                    </div>
                    <div class="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      Access granted: {{ patient.accessGrantedDate }}
                    </div>
                  </div>
                </div>
              </button>
            </div>

            <!-- Selected Patient Display -->
            <div v-if="selectedPatient" class="mt-3 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
              <div class="flex items-center space-x-3">
                <span class="text-2xl">😴</span>
                <div class="flex-1">
                  <div class="font-medium text-gray-900 dark:text-white">
                    Selected: {{ selectedPatient.name }}
                  </div>
                  <div class="text-sm text-gray-600 dark:text-gray-400">
                    {{ selectedPatient.email }}
                  </div>
                  <div class="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    Access granted: {{ selectedPatient.accessGrantedDate }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Patient Statistics (Full Width) -->
          <div v-if="selectedPatient">
            <SleepStatistics :user-id="selectedPatient.patientId" />
          </div>
          <div v-else class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center">
            <span class="text-6xl mb-4 block">🔍</span>
            <p class="text-gray-600 dark:text-gray-400 text-lg">
              Search and select a patient to view their sleep statistics
            </p>
          </div>
        </div>

        <!-- Request Access Tab -->
        <div v-if="activeTab === 'requests'">
          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 sm:p-6">
            <div class="max-w-4xl mx-auto">
              <AccessRequestForm 
                :initial-requests="accessRequests"
                :loading="loadingAccessRequests"
                :error="accessRequestsError"
                @refresh="fetchAccessRequests"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

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

const authStore = useAuthStore()
const activeTab = ref('patients')

const patientSearch = ref('')
const showSearchResults = ref(false)
const accessRequests = ref<AccessRequest[]>([])
const loadingAccessRequests = ref(false)
const accessRequestsError = ref('')

const tabs = [
  { id: 'patients', label: 'My Patients', icon: '👥' },
  { id: 'requests', label: 'Request Access', icon: '📨' }
]

// Compute available patients from accepted access requests
const availablePatients = computed(() => {
  return accessRequests.value
    .filter(req => req.status === 'ACCEPTED')
    .map(req => ({
      id: req.id,
      patientId: req.patientId,
      name: req.patientName,
      email: req.patientEmail,
      accessGrantedDate: formatDate(req.respondedAt || '')
    }))
})

const filteredPatients = computed(() => {
  // Show all patients when search is focused but empty
  if (showSearchResults.value && !patientSearch.value) {
    return availablePatients.value
  }
  
  if (!patientSearch.value) return []
  
  const query = patientSearch.value.toLowerCase()
  return availablePatients.value.filter(patient =>
    patient.name.toLowerCase().includes(query) ||
    patient.email.toLowerCase().includes(query)
  )
})

const formatDate = (dateStr: string) => {
  if (!dateStr) return 'N/A'
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { 
    year: 'numeric',
    month: 'short', 
    day: 'numeric'
  })
}

const selectedPatient = ref(null as any)

// Hardcoded patient data - in real app, this would be fetched based on selected patient
const patientData: Record<string, any> = {
  '1': {
    stats: {
      avgHours: 6.8,
      avgQuality: 6.5,
      totalNights: 25,
      trend: '↓ -0.3h'
    },
    logs: [
      {
        id: '1',
        date: '2025-12-26',
        totalHours: 6.5,
        intervals: [
          { id: '1a', start: '23:30', end: '06:00', quality: 6 }
        ]
      },
      {
        id: '2',
        date: '2025-12-25',
        totalHours: 7.0,
        intervals: [
          { id: '2a', start: '22:00', end: '05:00', quality: 7 }
        ]
      }
    ]
  },
  '2': {
    stats: {
      avgHours: 8.2,
      avgQuality: 8.8,
      totalNights: 30,
      trend: '↑ +0.8h'
    },
    logs: [
      {
        id: '1',
        date: '2025-12-26',
        totalHours: 8.5,
        intervals: [
          { id: '1a', start: '22:00', end: '06:30', quality: 9 }
        ]
      },
      {
        id: '2',
        date: '2025-12-25',
        totalHours: 8.0,
        intervals: [
          { id: '2a', start: '22:30', end: '06:30', quality: 8 }
        ]
      }
    ]
  },
  '3': {
    stats: {
      avgHours: 5.5,
      avgQuality: 5.0,
      totalNights: 20,
      trend: '↓ -1.2h'
    },
    logs: [
      {
        id: '1',
        date: '2025-12-26',
        totalHours: 5.0,
        intervals: [
          { id: '1a', start: '01:00', end: '06:00', quality: 4 }
        ]
      }
    ]
  },
  '4': {
    stats: {
      avgHours: 7.5,
      avgQuality: 7.8,
      totalNights: 28,
      trend: '→ Stable'
    },
    logs: [
      {
        id: '1',
        date: '2025-12-26',
        totalHours: 7.5,
        intervals: [
          { id: '1a', start: '23:00', end: '06:30', quality: 8 }
        ]
      }
    ]
  }
}

const selectedPatientStats = computed(() => {
  if (!selectedPatient.value) return null
  return patientData[selectedPatient.value.id]?.stats || {
    avgHours: 0,
    avgQuality: 0,
    totalNights: 0,
    trend: 'N/A'
  }
})

const selectedPatientLogs = computed(() => {
  if (!selectedPatient.value) return []
  return patientData[selectedPatient.value.id]?.logs || []
})

const fetchAccessRequests = async () => {
  loadingAccessRequests.value = true
  accessRequestsError.value = ''
  
  try {
    const data = await useAuthFetch<AccessRequest[]>('/api/access/all', {
      method: 'GET'
    })
    
    accessRequests.value = data || []
  } catch (err: any) {
    accessRequestsError.value = err.data?.error || err.message || 'Failed to fetch access requests'
  } finally {
    loadingAccessRequests.value = false
  }
}

const handlePatientSearch = () => {
  showSearchResults.value = true
}

const handleSearchFocus = () => {
  showSearchResults.value = true
}

const handleSearchBlur = () => {
  showSearchResults.value = false
}

const selectPatient = (patient: any) => {
  selectedPatient.value = patient
  patientSearch.value = patient.name
  showSearchResults.value = false
  // TODO: Fetch patient data from API
  // const data = await useAuthFetch(`/api/doctor/patients/${patient.patientId}/sleep-logs`)
}

const clearPatientSelection = () => {
  selectedPatient.value = null
  patientSearch.value = ''
  showSearchResults.value = false
}

// Fetch access requests on page load
onMounted(() => {
  fetchAccessRequests()
})

definePageMeta({
  middleware: 'role'
})

</script>
