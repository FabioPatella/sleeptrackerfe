<template>
  <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 sm:p-6">
    <h2 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4">
      Log Sleep Session
    </h2>

    <!-- Collapsible Info Banner -->
    <div class="mb-4">
      <button
        type="button"
        @click="showInfo = !showInfo"
        class="w-full bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800 flex items-center gap-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
      >
        <span class="text-xl">ℹ️</span>
        <span class="text-sm font-medium text-blue-900 dark:text-blue-100">Info: How Sleep Days Work</span>
        <span class="ml-auto text-blue-600 dark:text-blue-400 transform transition-transform" :class="{ 'rotate-180': showInfo }">▼</span>
      </button>
      
      <div v-if="showInfo" class="mt-2 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
        <p class="text-xs text-blue-800 dark:text-blue-200 leading-relaxed">
          A "sleep day" runs from <strong>20:00 (8 PM)</strong> of the previous day to <strong>19:59 (7:59 PM)</strong> of the selected date. 
          For example, if you select January 15th, you can log sleep from 8 PM on January 14th through 7:59 PM on January 15th. 
          This accounts for typical overnight sleep patterns.
        </p>
      </div>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-4">
      <!-- Loading Existing Data -->
      <div v-if="loadingExistingData" class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
        <LoadingSpinner />
        <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">Loading existing sleep data...</p>
      </div>

      <!-- Editing Indicator -->
      <div v-if="isEditMode && !loadingExistingData" class="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800 flex items-center justify-between">
        <p class="text-sm text-yellow-800 dark:text-yellow-200 flex items-center gap-2">
          <span>✏️</span>
          <span>Editing existing sleep log for this date</span>
        </p>
        <button
          type="button"
          @click="showDeleteDialog = true"
          class="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-all"
          title="Delete this sleep log"
        >
          <span class="text-xl">🗑️</span>
        </button>
      </div>

      <!-- Date Selection -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Date
          </label>
          <input
            v-model="form.date"
            type="date"
            required
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
          />
        </div>
      </div>

      <!-- Sleep Intervals -->
      <div>
        <div class="flex justify-between items-center mb-2">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Sleep Intervals
          </label>
          <button
            type="button"
            @click="addInterval"
            class="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium"
          >
            + Add Interval
          </button>
        </div>

        <div class="space-y-3">
          <div
            v-for="(interval, index) in form.intervals"
            :key="index"
            class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
          >
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Start Time
                </label>
                <TimePickerInput v-model="interval.start" />
                <span v-if="showValidation && !isValidTime(interval.start)" class="text-xs text-red-600 dark:text-red-400 mt-1 block">
                  Required
                </span>
              </div>

              <div>
                <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  End Time
                </label>
                <TimePickerInput v-model="interval.end" />
                <span v-if="showValidation && !isValidTime(interval.end)" class="text-xs text-red-600 dark:text-red-400 mt-1 block">
                  Required
                </span>
              </div>

              <div>
                <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Quality (0-10)
                </label>
                <div class="flex items-center gap-2">
                  <input
                    v-model.number="interval.quality"
                    type="number"
                    min="0"
                    max="10"
                    placeholder="0-10"
                    class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-600 dark:text-white text-sm"
                    :class="{ 'border-red-500 dark:border-red-500': showValidation && !isValidQuality(interval.quality) }"
                  />
                  <button
                    v-if="form.intervals.length > 1"
                    type="button"
                    @click="removeInterval(index)"
                    class="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                  >
                    🗑️
                  </button>
                </div>
                <span v-if="showValidation && !isValidQuality(interval.quality)" class="text-xs text-red-600 dark:text-red-400 mt-1 block">
                  Required
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Notes (Optional) -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Notes (Optional)
        </label>
        <textarea
          v-model="form.notes"
          rows="3"
          placeholder="Any notes about your sleep..."
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none text-sm"
        />
      </div>

      <!-- Notification Area -->
      <slot name="notification" />

      <!-- Validation Error Message -->
      <div v-if="validationError" class="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
        <p class="text-red-600 dark:text-red-400 text-sm font-medium">{{ validationError }}</p>
      </div>

      <!-- Submit Button -->
      <button
        type="submit"
        class="w-full max-w-xs mx-auto block bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-2.5 px-4 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl text-sm sm:text-base"
      >
        {{ isEditMode ? 'Update Sleep Log' : 'Save Sleep Log' }}
      </button>
    </form>

    <!-- Confirmation Dialog -->
    <ConfirmationDialog
      :show="showDeleteDialog"
      title="Delete Sleep Log?"
      :message="`Are you sure you want to delete the sleep log for ${form.date}? This action cannot be undone.`"
      icon="🗑️"
      confirmText="Delete"
      cancelText="Cancel"
      confirmButtonClass="bg-red-600 hover:bg-red-700"
      @confirm="handleDeleteLog"
      @cancel="showDeleteDialog = false"
    />
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  submit: [data: any]
  deleted: [date: string]
}>()

const form = ref({
  date: new Date().toISOString().split('T')[0] as string,
  intervals: [
    { start: '', end: '', quality: null as number | null }
  ],
  notes: ''
})

const showValidation = ref(false)
const showInfo = ref(false)
const isEditMode = ref(false)
const loadingExistingData = ref(false)
const showDeleteDialog = ref(false)

// Watch for date changes and fetch existing data
watch(() => form.value.date, async (newDate, oldDate) => {
  if (oldDate && newDate !== oldDate) {
    // Reset form when date changes
    form.value.intervals = [{ start: '', end: '', quality: null }]
    form.value.notes = ''
    isEditMode.value = false
    showValidation.value = false
  }
  
  if (newDate) {
    await fetchExistingData(newDate)
  }
})

const fetchExistingData = async (date: string) => {
  loadingExistingData.value = true
  
  try {
    const data = await useAuthFetch<any>('/api/sleep-hours/statistics', {
      method: 'GET',
      params: {
        fromDate: date,
        toDate: date
      }
    })
    
    // Check if data exists and has intervals (single day response)
    if (data && data.intervals && data.intervals.length > 0) {
      isEditMode.value = true
      
      // Populate form with existing data
      form.value.intervals = data.intervals.map((interval: any) => ({
        start: interval.startTime.substring(0, 5), // Remove seconds from HH:MM:SS
        end: interval.endTime.substring(0, 5),
        quality: interval.intensity
      }))
      
      form.value.notes = data.notes || ''
    } else {
      isEditMode.value = false
    }
  } catch (error) {
    console.error('Error fetching existing data:', error)
    isEditMode.value = false
  } finally {
    loadingExistingData.value = false
  }
}

// Fetch data on mount for the initial date
onMounted(() => {
  if (form.value.date) {
    fetchExistingData(form.value.date)
  }
})

const addInterval = () => {
  form.value.intervals.push({
    start: '',
    end: '',
    quality: null
  })
}

const removeInterval = (index: number) => {
  form.value.intervals.splice(index, 1)
}

const normalizeTime = (time: string): string => {
  if (!time) return '00:00'
  
  const parts = time.split(':')
  const hours = parts[0] || '00'
  const minutes = parts[1] || '00'
  
  return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`
}

const isValidTime = (time: string): boolean => {
  if (!time || !time.includes(':')) return false
  
  const parts = time.split(':')
  const hours = parts[0]
  
  // Check that hours exist and are not empty (minutes can be empty, will default to 00)
  return hours !== ''
}

const isValidQuality = (quality: number | null): boolean => {
  return quality !== null && quality !== undefined && !isNaN(quality) && quality >= 0 && quality <= 10
}

// Convert time to minutes from 20:00 (8 PM) as the start of the "sleep day"
// 20:00 = 0 minutes, 21:00 = 60 minutes, 00:00 = 240 minutes, 19:00 = 1380 minutes
const timeToMinutes = (time: string): number => {
  const [hoursStr, minutesStr] = time.split(':')
  const hours = parseInt(hoursStr || '0', 10)
  const minutes = parseInt(minutesStr || '0', 10)
  let totalMinutes = hours * 60 + minutes
  
  // If time is before 20:00, add 24 hours worth of minutes (it's the next day)
  if (hours < 20) {
    totalMinutes += 24 * 60
  }
  
  // Subtract 20:00 (1200 minutes) to make 20:00 the zero point
  return totalMinutes - (20 * 60)
}

const checkIntervalValidity = (start: string, end: string): { valid: boolean; message: string } => {
  const startMinutes = timeToMinutes(normalizeTime(start))
  const endMinutes = timeToMinutes(normalizeTime(end))
  
  if (startMinutes >= endMinutes) {
    return { valid: false, message: 'End time must be after start time' }
  }
  
  return { valid: true, message: '' }
}

const checkOverlap = (intervals: Array<{ start: string; end: string }>): { valid: boolean; message: string } => {
  const normalized = intervals.map(interval => ({
    start: timeToMinutes(normalizeTime(interval.start)),
    end: timeToMinutes(normalizeTime(interval.end))
  }))
  
  // Sort intervals by start time
  normalized.sort((a, b) => a.start - b.start)
  
  // Check for overlaps
  for (let i = 0; i < normalized.length - 1; i++) {
    const current = normalized[i]
    const next = normalized[i + 1]
    if (current && next && current.end > next.start) {
      return { valid: false, message: 'Sleep intervals cannot overlap' }
    }
  }
  
  return { valid: true, message: '' }
}

const validationError = ref('')

const handleSubmit = async () => {
  showValidation.value = true
  validationError.value = ''
  
  // Validate that all time fields are properly filled
  const allTimesFilled = form.value.intervals.every(interval => 
    isValidTime(interval.start) && isValidTime(interval.end)
  )
  
  if (!allTimesFilled) {
    return
  }
  
  // Check that all quality fields are filled
  const allQualityFilled = form.value.intervals.every(interval => 
    isValidQuality(interval.quality)
  )
  
  if (!allQualityFilled) {
    return
  }
  
  // Validate each interval: start time must be before end time
  for (let i = 0; i < form.value.intervals.length; i++) {
    const interval = form.value.intervals[i]
    if (interval) {
      const validation = checkIntervalValidity(interval.start, interval.end)
      if (!validation.valid) {
        validationError.value = `Interval ${i + 1}: ${validation.message}`
        return
      }
    }
  }
  
  // Check for overlapping intervals
  const overlapCheck = checkOverlap(form.value.intervals)
  if (!overlapCheck.valid) {
    validationError.value = overlapCheck.message
    return
  }
  
  // Normalize all time fields
  const normalizedIntervals = form.value.intervals.map(interval => ({
    start: normalizeTime(interval.start),
    end: normalizeTime(interval.end),
    quality: interval.quality
  }))
  
  emit('submit', { 
    ...form.value, 
    intervals: normalizedIntervals 
  })
  
  // Reset validation state after successful submit
  showValidation.value = false
  validationError.value = ''
}

const handleDeleteLog = async () => {
  const dateToDelete = form.value.date
  try {
    await useAuthFetch(`/api/sleep-hours?date=${dateToDelete}`, {
      method: 'DELETE'
    })
    
    showDeleteDialog.value = false
    
    // Reset form after successful deletion
    isEditMode.value = false
    form.value.intervals = [{ start: '', end: '', quality: null }]
    form.value.notes = ''
    
    // Emit deleted event to parent
    emit('deleted', dateToDelete)
  } catch (error: any) {
    showDeleteDialog.value = false
    console.error('Error deleting sleep log:', error)
    // You might want to show an error notification here
  }
}

// Expose method to refetch data (called by parent after successful save)
const refetch = async () => {
  await fetchExistingData(form.value.date)
}

defineExpose({
  refetch
})
</script>
