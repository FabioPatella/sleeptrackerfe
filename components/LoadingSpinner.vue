<template>
  <div class="flex items-center justify-center">
    <div 
      :class="[
        'animate-spin rounded-full border-solid border-t-transparent',
        sizeClasses,
        colorClasses
      ]"
    />
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  size?: 'sm' | 'md' | 'lg'
  color?: 'primary' | 'white' | 'gray'
}>()

const sizeClasses = computed(() => {
  switch (props.size || 'md') {
    case 'sm':
      return 'h-4 w-4 border-2'
    case 'lg':
      return 'h-12 w-12 border-4'
    default:
      return 'h-8 w-8 border-3'
  }
})

const colorClasses = computed(() => {
  switch (props.color || 'primary') {
    case 'white':
      return 'border-white'
    case 'gray':
      return 'border-gray-500'
    default:
      return 'border-indigo-600'
  }
})
</script>
