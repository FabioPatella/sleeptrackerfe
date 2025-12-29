<template>
  <div v-if="show" class="fixed inset-0 flex items-center justify-center z-50 p-4">
    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 border-2 border-gray-200 dark:border-gray-700">
      <div class="flex items-center space-x-3">
        <span class="text-3xl">{{ icon }}</span>
        <h3 class="text-xl font-bold text-gray-900 dark:text-white">
          {{ title }}
        </h3>
      </div>
      <p class="text-gray-600 dark:text-gray-400">
        {{ message }}
      </p>
      <div class="flex gap-3 pt-2">
        <button
          @click="$emit('confirm')"
          :class="confirmButtonClass"
          class="flex-1 px-4 py-2.5 text-white font-semibold rounded-lg transition-all"
        >
          {{ confirmText }}
        </button>
        <button
          @click="$emit('cancel')"
          class="flex-1 px-4 py-2.5 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold rounded-lg transition-all"
        >
          {{ cancelText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  show: boolean
  title: string
  message: string
  icon?: string
  confirmText?: string
  cancelText?: string
  confirmButtonClass?: string
}>()

defineEmits<{
  confirm: []
  cancel: []
}>()
</script>
