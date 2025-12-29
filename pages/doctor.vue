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
                  placeholder="Search patient by name or surname..."
                  @input="handlePatientSearch"
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
                @click="selectPatient(patient)"
                class="w-full text-left p-3 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all border-b border-gray-200 dark:border-gray-600 last:border-b-0"
              >
                <div class="flex items-center space-x-3">
                  <span class="text-xl">😴</span>
                  <div>
                    <div class="font-medium text-gray-900 dark:text-white">
                      {{ patient.name }} {{ patient.surname }}
                    </div>
                    <div class="text-sm text-gray-600 dark:text-gray-400">
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
                    Selected: {{ selectedPatient.name }} {{ selectedPatient.surname }}
                  </div>
                  <div class="text-sm text-gray-600 dark:text-gray-400">
                    Patient since {{ selectedPatient.accessGrantedDate }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Patient Statistics (Full Width) -->
          <div v-if="selectedPatient">
            <SleepStatistics />
          </div>
          <div v-else class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center">
            <span class="text-6xl mb-4 block">🔍</span>
            <p class="text-gray-600 dark:text-gray-400 text-lg">
              Search and select a patient to view their sleep statistics
            </p>
          </div>
        </div>

        <!-- Request Access Tab -->
        <div v-show="activeTab === 'requests'">
          <div class="max-w-2xl mx-auto">
            <AccessRequestForm
              :pending-requests="pendingAccessRequests"
              @submit="handleAccessRequestSubmit"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()
const activeTab = ref('patients')

// Auth check is now handled by middleware - no need for onMounted logic

const patientSearch = ref('')
const showSearchResults = ref(false)

const tabs = [
  { id: 'patients', label: 'My Patients', icon: '👥' },
  { id: 'requests', label: 'Request Access', icon: '📨' }
]

// Hardcoded data for demonstration
const patients = ref([
  {
    id: '1',
    name: 'John',
    surname: 'Doe',
    accessGrantedDate: 'Dec 10, 2025'
  },
  {
    id: '2',
    name: 'Jane',
    surname: 'Smith',
    accessGrantedDate: 'Dec 15, 2025'
  },
  {
    id: '3',
    name: 'Robert',
    surname: 'Williams',
    accessGrantedDate: 'Dec 18, 2025'
  },
  {
    id: '4',
    name: 'Maria',
    surname: 'Garcia',
    accessGrantedDate: 'Dec 22, 2025'
  }
])

const filteredPatients = computed(() => {
  if (!patientSearch.value) return []
  
  const query = patientSearch.value.toLowerCase()
  return patients.value.filter(patient =>
    patient.name.toLowerCase().includes(query) ||
    patient.surname.toLowerCase().includes(query)
  )
})

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

const handlePatientSearch = () => {
  showSearchResults.value = patientSearch.value.length > 0
}

const selectPatient = (patient: any) => {
  selectedPatient.value = patient
  patientSearch.value = `${patient.name} ${patient.surname}`
  showSearchResults.value = false
  // TODO: Fetch patient data from API
  // const data = await useAuthFetch(`/api/doctor/patients/${patient.id}/sleep-logs`)
}

const clearPatientSelection = () => {
  selectedPatient.value = null
  patientSearch.value = ''
  showSearchResults.value = false
}

const pendingAccessRequests = ref([
  {
    id: '1',
    patientEmail: 'alice@example.com',
    requestDate: 'Dec 25, 2025'
  }
])

const handleAccessRequestSubmit = (data: { patientEmail: string; reason: string }) => {
  console.log('Access request submitted:', data)
  // TODO: Call API with useAuthFetch
  // const response = await useAuthFetch('/api/doctor/access-requests', {
  //   method: 'POST',
  //   body: data
  // })
  pendingAccessRequests.value.push({
    id: Date.now().toString(),
    patientEmail: data.patientEmail,
    requestDate: 'Today'
  })
  alert('Access request sent! (This will be connected to the backend)')
}
definePageMeta({
  middleware: 'role'
})

</script>
