<template>
  <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 sm:p-6">
    <h2 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4">
      Sleep Statistics
    </h2>
    
    <!-- Period Selector -->
    <div class="mb-6 flex flex-wrap gap-2">
      <button
        v-for="period in periods"
        :key="period.value"
        @click="selectPeriod(period.value)"
        :class="[
          'px-4 py-2 rounded-lg font-medium transition-all text-sm sm:text-base',
          selectedPeriod === period.value
            ? 'bg-indigo-600 text-white'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
        ]"
      >
        {{ period.label }}
      </button>
    </div>

    <!-- Single Day Date Picker -->
    <div v-if="selectedPeriod === 'singleday'" class="mb-6">
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Select Date
      </label>
      <input
        v-model="singleDate"
        type="date"
        @change="fetchStatistics"
        class="w-full max-w-xs px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
      />
    </div>

    <!-- Custom Date Range -->
    <div v-if="selectedPeriod === 'custom'" class="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          From Date
        </label>
        <input
          v-model="customFromDate"
          type="date"
          class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          To Date
        </label>
        <input
          v-model="customToDate"
          type="date"
          class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
      </div>
      <div class="sm:col-span-2">
        <button
          @click="applyCustomRange"
          class="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Apply Custom Range
        </button>
      </div>
    </div>

    <!-- Loading Overlay -->
    <div v-if="loading && (statisticsData.length > 0 || singleDayData)" class="relative">
      <div class="absolute inset-0 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm z-10 flex items-center justify-center rounded-xl">
        <LoadingSpinner />
      </div>
    </div>

    <!-- Loading State (when no data) -->
    <div v-if="loading && !statisticsData.length && !singleDayData" class="flex justify-center items-center py-12 min-h-[400px]">
      <LoadingSpinner />
    </div>

    <!-- Error State -->
    <div v-else-if="error && !statisticsData.length && !singleDayData" class="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg mb-6 min-h-[400px] flex items-center justify-center">
      <p class="text-red-600 dark:text-red-400">{{ error }}</p>
    </div>

    <!-- Statistics Cards -->
    <div v-if="statisticsData.length > 0 && !singleDayData" class="space-y-6 min-h-[400px]">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div class="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl">
          <div class="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400">
            {{ averageSleep.toFixed(1) }}h
          </div>
          <div class="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Average Sleep
          </div>
        </div>
        
        <div class="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl">
          <div class="text-2xl sm:text-3xl font-bold text-orange-600 dark:text-orange-400">
            {{ averageIntensity.toFixed(1) }}/10
          </div>
          <div class="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Average Intensity
          </div>
        </div>
        
        <div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl">
          <div class="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400">
            {{ averageRisvegli.toFixed(1) }}
          </div>
          <div class="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Average Awakenings
          </div>
        </div>
      </div>

      <!-- Charts -->
      <div class="space-y-6">
        <div class="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Sleep Metrics Over Time
          </h3>
          <p class="text-xs text-gray-600 dark:text-gray-400 mb-4">
            💡 Click on a data point to view detailed information for that day
          </p>
          <Line :data="combinedChartData" :options="chartOptions" />
        </div>
      </div>
    </div>

    <!-- Single Day View -->
    <div v-if="singleDayData" class="space-y-6">
      <!-- Check if there are no intervals -->
      <div v-if="!singleDayData.intervals || singleDayData.intervals.length === 0" class="text-center py-12">
        <div class="text-6xl mb-4">😴</div>
        <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          No Sleep Data Available
        </h3>
        <p class="text-gray-600 dark:text-gray-400">
          No sleep records found for {{ formatFullDate(singleDayData.date) }}
        </p>
      </div>
      
      <!-- Show data if intervals exist -->
      <template v-else>
      <!-- Date Header -->
      <div class="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl">
        <h3 class="text-xl font-bold text-gray-900 dark:text-white">
          {{ formatFullDate(singleDayData.date) }}
        </h3>
      </div>

      <!-- Notes Section -->
      <div class="bg-white dark:bg-gray-700 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-600">
        <h4 class="text-base font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
          <span>📝</span>
          Notes
        </h4>
        <p v-if="singleDayData.notes" class="text-gray-700 dark:text-gray-300 leading-relaxed">
          {{ singleDayData.notes }}
        </p>
        <p v-else class="text-gray-500 dark:text-gray-400 italic">
          No notes available for this day
        </p>
      </div>

      <!-- Intervals -->
      <div>
        <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Sleep Intervals
        </h4>
        <div class="space-y-3">
          <div
            v-for="(interval, index) in singleDayData.intervals"
            :key="index"
            class="bg-white dark:bg-gray-700 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-600"
          >
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div class="flex items-center gap-3">
                <div class="bg-indigo-100 dark:bg-indigo-900/30 p-3 rounded-lg">
                  <span class="text-2xl">💤</span>
                </div>
                <div>
                  <div class="font-semibold text-gray-900 dark:text-white">
                    {{ formatTime(interval.startTime) }} - {{ formatTime(interval.endTime) }}
                  </div>
                  <div class="text-sm text-gray-600 dark:text-gray-400">
                    Duration: {{ formatDuration(interval.durationMinutes) }}
                  </div>
                </div>
              </div>
              <div class="flex items-center gap-4">
                <div class="text-center">
                  <div class="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {{ interval.intensity }}/10
                  </div>
                  <div class="text-xs text-gray-600 dark:text-gray-400">
                    Intensity
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Summary Stats -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl">
          <div class="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400">
            {{ (singleDayData.intervals.reduce((sum, i) => sum + i.durationMinutes, 0) / 60).toFixed(1) }}h
          </div>
          <div class="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Total Sleep
          </div>
        </div>
        
        <div class="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl">
          <div class="text-2xl sm:text-3xl font-bold text-orange-600 dark:text-orange-400">
            {{ (singleDayData.intervals.reduce((sum, i) => sum + i.intensity, 0) / singleDayData.intervals.length).toFixed(1) }}/10
          </div>
          <div class="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Average Intensity
          </div>
        </div>
        
        <div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl">
          <div class="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400">
            {{ singleDayData.intervals.length - 1 }}
          </div>
          <div class="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Awakenings
          </div>
        </div>
      </div>
      </template>
    </div>

    <!-- No Data State -->
    <div v-else-if="!loading && !statisticsData.length && !singleDayData" class="text-center py-12 text-gray-500 dark:text-gray-400">
      <template v-if="selectedPeriod === 'custom' && (!customFromDate || !customToDate)">
        <div class="text-5xl mb-4">📅</div>
        <p class="text-lg font-medium mb-2">No period has been selected.</p>
        <p class="text-sm">Please select a date range above.</p>
      </template>
      <template v-else-if="selectedPeriod === 'custom' && customFromDate && customToDate && !customRangeApplied">
        <div class="text-5xl mb-4">👆</div>
        <p class="text-lg font-medium mb-2">Date range selected</p>
        <p class="text-sm">Click "Apply Custom Range" to view statistics.</p>
      </template>
      <template v-else-if="selectedPeriod === 'singleday' && !singleDate">
        <div class="text-5xl mb-4">📅</div>
        <p class="text-lg font-medium mb-2">No date has been selected.</p>
        <p class="text-sm">Please select a date above.</p>
      </template>
      <template v-else-if="fetchAttempted">
        <div class="text-5xl mb-4">😴</div>
        <p class="text-lg font-medium mb-2">No sleep data available</p>
        <p class="text-sm">No sleep records found for the selected period.</p>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  type ChartOptions
} from 'chart.js'

const props = defineProps<{
  userId?: number
}>()

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

interface SleepStatisticsData {
  date: string
  totalHoursSlept: number
  weightedAverageIntensity: number
  numberOfRisvegli: number
}

interface SleepInterval {
  startTime: string
  endTime: string
  intensity: number
  durationMinutes: number
}

interface SingleDayData {
  date: string
  notes?: string
  intervals: SleepInterval[]
}

const selectedPeriod = ref('1week')
const customFromDate = ref('')
const customToDate = ref('')
const singleDate = ref(new Date().toISOString().split('T')[0])
const loading = ref(false)
const error = ref('')
const statisticsData = ref<SleepStatisticsData[]>([])
const singleDayData = ref<SingleDayData | null>(null)
const isAuthError = ref(false)
const fetchAttempted = ref(false)
const customRangeApplied = ref(false)
let fetchController: AbortController | null = null

const periods = [
  { label: '1 Week', value: '1week' },
  { label: '1 Month', value: '1month' },
  { label: '3 Months', value: '3months' },
  { label: 'Single Day', value: 'singleday' },
  { label: 'Custom Range', value: 'custom' },
]

const getDateRange = (period: string): { fromDate: string; toDate: string } | null => {
  const today = new Date()
  const toDate = today.toISOString().split('T')?.[0] || ''
  let fromDate = ''

  switch (period) {
    case '1week': {
      const from = new Date()
      from.setDate(from.getDate() - 7)
      fromDate = from.toISOString().split('T')?.[0] || ''
      break
    }
    case '1month': {
      const from = new Date()
      from.setMonth(from.getMonth() - 1)
      fromDate = from.toISOString().split('T')?.[0] || ''
      break
    }
    case '3months': {
      const from = new Date()
      from.setMonth(from.getMonth() - 3)
      fromDate = from.toISOString().split('T')?.[0] || ''
      break
    }
    case 'singleday':
      if (singleDate.value) {
        return { fromDate: singleDate.value, toDate: singleDate.value }
      }
      return null
    case 'custom':
      if (customFromDate.value && customToDate.value) {
        return { fromDate: customFromDate.value, toDate: customToDate.value }
      }
      return null
  }

  return { fromDate, toDate }
}

const selectPeriod = async (period: string) => {
  selectedPeriod.value = period
  
  // Reset custom range applied flag when switching periods
  customRangeApplied.value = false
  
  // Clear data when switching to custom range or single day
  if (period === 'custom' || period === 'singleday') {
    statisticsData.value = []
    singleDayData.value = null
  }
  
  if (period !== 'custom' && period !== 'singleday') {
    await fetchStatistics()
  } else if (period === 'singleday' && singleDate.value) {
    await fetchStatistics()
  }
}

const applyCustomRange = async () => {
  customRangeApplied.value = true
  await fetchStatistics()
}

const fetchStatistics = async () => {
  // Prevent refetching if already loading or if we had an auth error
  if (loading.value || isAuthError.value) {
    console.log('[SleepStatistics] Skipping fetch - loading or auth error')
    return
  }

  // Cancel any pending fetch
  if (fetchController) {
    console.log('[SleepStatistics] Aborting previous fetch')
    fetchController.abort()
  }

  const dateRange = getDateRange(selectedPeriod.value)
  
  if (!dateRange) {
    error.value = 'Please select valid dates'
    return
  }

  console.log('[SleepStatistics] Starting fetch for range:', dateRange)
  
  fetchController = new AbortController()
  loading.value = true
  error.value = ''

  try {
    const params: any = {
      fromDate: dateRange.fromDate,
      toDate: dateRange.toDate
    }
    
    // Add userId if provided (for doctor viewing patient data)
    if (props.userId) {
      params.userId = props.userId
    }
    
    const data = await useAuthFetch<any>('/api/sleep-hours/statistics', {
      method: 'GET',
      params
    })
    
    console.log('[SleepStatistics] Fetch successful, data:', data)
    
    // Check if it's a single day response (has intervals property)
    if (data.intervals) {
      singleDayData.value = data
      statisticsData.value = []
    } else {
      statisticsData.value = data
      singleDayData.value = null
    }
    
    fetchAttempted.value = true
  } catch (err: any) {
    console.error('[SleepStatistics] Fetch error:', err)
    // Check if it's an auth error
    if (err.message === 'Authentication failed' || err.statusCode === 401 || err.status === 401) {
      isAuthError.value = true
      error.value = 'Authentication failed. Redirecting...'
      console.log('[SleepStatistics] Auth error detected, stopping further requests')
    } else if (err.name !== 'AbortError') {
      error.value = err.message || 'Failed to fetch statistics'
    }
    fetchAttempted.value = true
  } finally {
    loading.value = false
    fetchController = null
  }
}

// Computed properties for averages
const averageSleep = computed(() => {
  if (statisticsData.value.length === 0) return 0
  const total = statisticsData.value.reduce((sum, day) => sum + day.totalHoursSlept, 0)
  return total / statisticsData.value.length
})

const averageIntensity = computed(() => {
  if (statisticsData.value.length === 0) return 0
  const total = statisticsData.value.reduce((sum, day) => sum + day.weightedAverageIntensity, 0)
  return total / statisticsData.value.length
})

const averageRisvegli = computed(() => {
  if (statisticsData.value.length === 0) return 0
  const total = statisticsData.value.reduce((sum, day) => sum + day.numberOfRisvegli, 0)
  return total / statisticsData.value.length
})

// Chart data
const combinedChartData = computed(() => ({
  labels: statisticsData.value.map(d => formatDate(d.date)),
  datasets: [
    {
      label: 'Hours Slept',
      data: statisticsData.value.map(d => d.totalHoursSlept),
      borderColor: 'rgb(34, 197, 94)',
      backgroundColor: 'rgba(34, 197, 94, 0.1)',
      tension: 0.4,
      yAxisID: 'y',
      pointRadius: 6,
      pointHoverRadius: 8,
      pointHitRadius: 10,
      pointBackgroundColor: 'rgb(34, 197, 94)',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointHoverBackgroundColor: 'rgb(34, 197, 94)',
      pointHoverBorderColor: '#fff',
      pointHoverBorderWidth: 3
    },
    {
      label: 'Intensity',
      data: statisticsData.value.map(d => d.weightedAverageIntensity),
      borderColor: 'rgb(234, 88, 12)',
      backgroundColor: 'rgba(234, 88, 12, 0.1)',
      tension: 0.4,
      yAxisID: 'y',
      pointRadius: 6,
      pointHoverRadius: 8,
      pointHitRadius: 10,
      pointBackgroundColor: 'rgb(234, 88, 12)',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointHoverBackgroundColor: 'rgb(234, 88, 12)',
      pointHoverBorderColor: '#fff',
      pointHoverBorderWidth: 3
    },
    {
      label: 'Awakenings',
      data: statisticsData.value.map(d => d.numberOfRisvegli),
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      tension: 0.4,
      yAxisID: 'y',
      pointRadius: 6,
      pointHoverRadius: 8,
      pointHitRadius: 10,
      pointBackgroundColor: 'rgb(59, 130, 246)',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointHoverBackgroundColor: 'rgb(59, 130, 246)',
      pointHoverBorderColor: '#fff',
      pointHoverBorderWidth: 3
    }
  ]
}))

const chartOptions: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: true,
  interaction: {
    mode: 'point',
    intersect: true
  },
  plugins: {
    legend: {
      display: true,
      position: 'top'
    },
    tooltip: {
      mode: 'index',
      intersect: false
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      position: 'left',
      title: {
        display: true,
        text: 'Value'
      }
    }
  },
  onClick: (event, elements) => {
    if (elements.length > 0 && elements[0]) {
      const index = elements[0].index
      const clickedDate = statisticsData.value[index]?.date
      if (clickedDate) {
        // Switch to single day view
        singleDate.value = clickedDate
        selectedPeriod.value = 'singleday'
        fetchStatistics()
      }
    }
  }
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  })
}

const formatFullDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { 
    weekday: 'long',
    year: 'numeric',
    month: 'long', 
    day: 'numeric' 
  })
}

const formatTime = (timeStr: string) => {
  // timeStr is in format "HH:MM:SS"
  const [hours, minutes] = timeStr.split(':')
  return `${hours}:${minutes}`
}

const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours === 0) return `${mins}m`
  if (mins === 0) return `${hours}h`
  return `${hours}h ${mins}m`
}

// Fetch data on mount
onMounted(() => {
  console.log('[SleepStatistics] Component mounted')
  if (!isAuthError.value && !fetchAttempted.value) {
    fetchStatistics()
  }
})

// Cleanup on unmount
onBeforeUnmount(() => {
  console.log('[SleepStatistics] Component unmounting, cleaning up')
  if (fetchController) {
    fetchController.abort()
  }
  loading.value = false
  isAuthError.value = true // Prevent any pending operations
})
</script>
