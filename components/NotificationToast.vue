<template>
  <Transition
    enter-active-class="transition ease-out duration-300"
    enter-from-class="translate-y-2 opacity-0"
    enter-to-class="translate-y-0 opacity-100"
    leave-active-class="transition ease-in duration-200"
    leave-from-class="translate-y-0 opacity-100"
    leave-to-class="translate-y-2 opacity-0"
  >
    <div 
      v-if="show" 
      :class="[
        'px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 w-full',
        typeClasses
      ]"
    >
      <LoadingSpinner v-if="type === 'loading'" size="sm" color="white" />
      <span v-else class="text-2xl">{{ icon }}</span>
      <div class="flex-1">
        <span class="font-semibold text-base block">{{ message }}</span>
        <span v-if="description" class="text-sm font-medium opacity-95 block mt-1">{{ description }}</span>
      </div>
      <button 
        @click="$emit('close')"
        class="text-white hover:text-gray-200 transition-colors ml-2 text-3xl leading-none font-bold"
        aria-label="Close notification"
      >
        ×
      </button>
    </div>
  </Transition>
</template>

<script setup lang="ts">
const props = defineProps<{
  show: boolean
  message: string
  type: 'success' | 'error' | 'loading'
  description?: string
}>()

defineEmits<{
  close: []
}>()

const icon = computed(() => {
  switch (props.type) {
    case 'success':
      return '✓'
    case 'error':
      return '✕'
    default:
      return ''
  }
})

const typeClasses = computed(() => {
  switch (props.type) {
    case 'success':
      return 'bg-green-500 text-white'
    case 'error':
      return 'bg-red-500 text-white'
    case 'loading':
      return 'bg-indigo-500 text-white'
    default:
      return 'bg-gray-500 text-white'
  }
})
</script>
