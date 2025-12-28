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
        @click="selectedPeriod = period.value"
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

    <!-- Statistics Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div class="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl">
        <div class="text-2xl sm:text-3xl font-bold text-indigo-600 dark:text-indigo-400">
          {{ stats.avgHours }}h
        </div>
        <div class="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Average Sleep
        </div>
      </div>
      
      <div class="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl">
        <div class="text-2xl sm:text-3xl font-bold text-purple-600 dark:text-purple-400">
          {{ stats.avgQuality }}/10
        </div>
        <div class="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Average Quality
        </div>
      </div>
      
      <div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl">
        <div class="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400">
          {{ stats.totalNights }}
        </div>
        <div class="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Nights Logged
        </div>
      </div>
      
      <div class="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl">
        <div class="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400">
          {{ stats.trend }}
        </div>
        <div class="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Trend
        </div>
      </div>
    </div>

    <!-- Recent Sleep Logs -->
    <div class="mt-6">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
        Recent Sleep Logs
      </h3>
      <div class="space-y-3 max-h-96 overflow-y-auto">
        <div
          v-for="log in recentLogs"
          :key="log.id"
          class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg"
        >
          <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
            <div>
              <div class="font-medium text-gray-900 dark:text-white">
                {{ formatDate(log.date) }}
              </div>
              <div class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Total: {{ log.totalHours }}h
              </div>
            </div>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="interval in log.intervals"
                :key="interval.id"
                class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300"
              >
                {{ interval.start }} - {{ interval.end }} ({{ interval.quality }}/10)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface SleepInterval {
  id: string
  start: string
  end: string
  quality: number
}

interface SleepLog {
  id: string
  date: string
  totalHours: number
  intervals: SleepInterval[]
}

interface Statistics {
  avgHours: number
  avgQuality: number
  totalNights: number
  trend: string
}

defineProps<{
  stats: Statistics
  recentLogs: SleepLog[]
}>()

const selectedPeriod = ref('7d')

const periods = [
  { label: '7 Days', value: '7d' },
  { label: '30 Days', value: '30d' },
  { label: '90 Days', value: '90d' },
]

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  })
}
</script>
