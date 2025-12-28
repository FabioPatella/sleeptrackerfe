<template>
  <div class="flex gap-2 items-center">
    <!-- Hour input with dropdown -->
    <div class="relative flex-1">
      <input
        :value="hours"
        @input="updateHour(($event.target as HTMLInputElement).value)"
        @focus="showHourDropdown = true"
        @blur="handleHourBlur"
        type="text"
        inputmode="numeric"
        maxlength="2"
        placeholder="HH"
        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-600 dark:text-white text-sm text-center"
      />
      <div
        v-if="showHourDropdown"
        class="absolute z-20 mt-1 w-full max-h-48 overflow-y-auto bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg"
      >
        <button
          v-for="h in 24"
          :key="h - 1"
          @mousedown.prevent="selectHour(String(h - 1).padStart(2, '0'))"
          class="w-full px-3 py-2 text-sm hover:bg-indigo-100 dark:hover:bg-indigo-900 dark:text-white cursor-pointer"
          :class="{ 'bg-indigo-50 dark:bg-indigo-950': String(h - 1).padStart(2, '0') === hours }"
        >
          {{ String(h - 1).padStart(2, '0') }}
        </button>
      </div>
    </div>
    
    <span class="text-gray-600 dark:text-gray-400 font-bold">:</span>
    
    <!-- Minute input with dropdown -->
    <div class="relative flex-1">
      <input
        :value="minutes"
        @input="updateMinute(($event.target as HTMLInputElement).value)"
        @focus="showMinuteDropdown = true"
        @blur="handleMinuteBlur"
        type="text"
        inputmode="numeric"
        maxlength="2"
        placeholder="MM"
        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-600 dark:text-white text-sm text-center"
      />
      <div
        v-if="showMinuteDropdown"
        class="absolute z-20 mt-1 w-full max-h-48 overflow-y-auto bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg"
      >
        <button
          v-for="m in 60"
          :key="m"
          @mousedown.prevent="selectMinute(String(m).padStart(2, '0'))"
          class="w-full px-3 py-2 text-sm hover:bg-indigo-100 dark:hover:bg-indigo-900 dark:text-white cursor-pointer"
          :class="{ 'bg-indigo-50 dark:bg-indigo-950': String(m).padStart(2, '0') === minutes }"
        >
          {{ String(m).padStart(2, '0') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: string // HH:mm format
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const showHourDropdown = ref(false)
const showMinuteDropdown = ref(false)

const hours = computed(() => {
  if (!props.modelValue || !props.modelValue.includes(':')) return ''
  const h = props.modelValue.split(':')[0]
  return h || ''
})

const minutes = computed(() => {
  if (!props.modelValue || !props.modelValue.includes(':')) return ''
  const min = props.modelValue.split(':')[1]
  return min || ''
})

const updateHour = (value: string) => {
  const cleaned = value.replace(/[^0-9]/g, '')
  if (cleaned === '') {
    emit('update:modelValue', `:${minutes.value}`)
    return
  }
  let hour = parseInt(cleaned)
  if (hour > 23) hour = 23
  // Don't pad while typing, keep the raw value
  emit('update:modelValue', `${cleaned.length === 1 ? cleaned : String(hour).padStart(2, '0')}:${minutes.value}`)
}

const updateMinute = (value: string) => {
  const cleaned = value.replace(/[^0-9]/g, '')
  if (cleaned === '') {
    emit('update:modelValue', `${hours.value}:`)
    return
  }
  let minute = parseInt(cleaned)
  if (minute > 59) minute = 59
  // Don't pad while typing, keep the raw value
  emit('update:modelValue', `${hours.value}:${cleaned.length === 1 ? cleaned : String(minute).padStart(2, '0')}`)
}

const selectHour = (h: string) => {
  emit('update:modelValue', `${h}:${minutes.value}`)
  showHourDropdown.value = false
}

const selectMinute = (m: string) => {
  emit('update:modelValue', `${hours.value}:${m}`)
  showMinuteDropdown.value = false
}

const handleHourBlur = () => {
  // Pad with zero on blur
  const h = hours.value
  if (h === '') {
    emit('update:modelValue', `00:${minutes.value || '00'}`)
  } else if (h.length === 1) {
    emit('update:modelValue', `${h.padStart(2, '0')}:${minutes.value || '00'}`)
  }
  setTimeout(() => {
    showHourDropdown.value = false
  }, 200)
}

const handleMinuteBlur = () => {
  // Pad with zero on blur
  const m = minutes.value
  if (m === '') {
    emit('update:modelValue', `${hours.value || '00'}:00`)
  } else if (m.length === 1) {
    emit('update:modelValue', `${hours.value || '00'}:${m.padStart(2, '0')}`)
  }
  setTimeout(() => {
    showMinuteDropdown.value = false
  }, 200)
}
</script>
