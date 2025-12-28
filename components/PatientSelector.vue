<template>
  <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 sm:p-6">
    <h2 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4">
      My Patients
    </h2>

    <!-- Search Bar -->
    <div class="mb-4">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search patients..."
        class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
      />
    </div>

    <!-- Patient List -->
    <div class="space-y-2 max-h-96 overflow-y-auto">
      <button
        v-for="patient in filteredPatients"
        :key="patient.id"
        @click="selectPatient(patient)"
        :class="[
          'w-full text-left p-4 rounded-lg transition-all',
          selectedPatientId === patient.id
            ? 'bg-indigo-100 dark:bg-indigo-900/40 border-2 border-indigo-500'
            : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border-2 border-transparent'
        ]"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <span class="text-2xl">😴</span>
            <div>
              <div class="font-medium text-gray-900 dark:text-white">
                {{ patient.name }} {{ patient.surname }}
              </div>
              <div class="text-sm text-gray-600 dark:text-gray-400">
                Access granted: {{ patient.accessGrantedDate }}
              </div>
            </div>
          </div>
          <div v-if="selectedPatientId === patient.id" class="text-indigo-600 dark:text-indigo-400 text-xl">
            ✓
          </div>
        </div>
      </button>
    </div>

    <div v-if="filteredPatients.length === 0" class="text-center text-gray-500 dark:text-gray-400 py-8">
      No patients found
    </div>
  </div>
</template>

<script setup lang="ts">
interface Patient {
  id: string
  name: string
  surname: string
  accessGrantedDate: string
}

const props = defineProps<{
  patients: Patient[]
  selectedPatientId: string | null
}>()

const emit = defineEmits<{
  selectPatient: [patient: Patient]
}>()

const searchQuery = ref('')

const filteredPatients = computed(() => {
  if (!searchQuery.value) return props.patients
  
  const query = searchQuery.value.toLowerCase()
  return props.patients.filter(patient =>
    patient.name.toLowerCase().includes(query) ||
    patient.surname.toLowerCase().includes(query)
  )
})

const selectPatient = (patient: Patient) => {
  emit('selectPatient', patient)
}
</script>
