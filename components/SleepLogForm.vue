<template>
  <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 sm:p-6">
    <h2 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4">
      Log Sleep Session
    </h2>

    <form @submit.prevent="handleSubmit" class="space-y-4">
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
              </div>

              <div>
                <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  End Time
                </label>
                <TimePickerInput v-model="interval.end" />
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
                    required
                    class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-600 dark:text-white text-sm"
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

      <!-- Submit Button -->
      <button
        type="submit"
        class="w-full max-w-xs mx-auto block bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-2.5 px-4 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl text-sm sm:text-base"
      >
        Save Sleep Log
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  submit: [data: any]
}>()

const form = ref({
  date: new Date().toISOString().split('T')[0],
  intervals: [
    { start: '', end: '', quality: null as number | null }
  ],
  notes: ''
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

const handleSubmit = () => {
  emit('submit', { ...form.value })
}
</script>
