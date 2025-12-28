<template>
  <header class="bg-white dark:bg-gray-800 shadow-md">
    <div class="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center">
        <div class="flex items-center space-x-3">
          <span class="text-3xl">😴</span>
          <div>
            <h1 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              {{ title }}
            </h1>
            <p v-if="subtitle" class="text-sm text-gray-600 dark:text-gray-400">
              {{ subtitle }}
            </p>
          </div>
        </div>
        <button
          @click="handleLogout"
          class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all text-sm sm:text-base"
        >
          Logout
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

defineProps<{
  title: string
  subtitle?: string
}>()

const authStore = useAuthStore()

const handleLogout = async () => {
  await authStore.logout()
  navigateTo('/')
}
</script>
