<template>
  <div class="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
    <div class="max-w-7xl mx-auto px-4 py-12">
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
        <h1 class="text-4xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          😴 User Dashboard
        </h1>
        <p class="text-xl text-gray-700 dark:text-gray-300 mb-8">
          Welcome! Track your sleep patterns and monitor your progress.
        </p>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div class="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-xl">
            <div class="text-3xl mb-2">📊</div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Sleep Log</h3>
            <p class="text-gray-600 dark:text-gray-400">Track your daily sleep hours</p>
          </div>
          
          <div class="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-xl">
            <div class="text-3xl mb-2">📈</div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Statistics</h3>
            <p class="text-gray-600 dark:text-gray-400">View your sleep trends</p>
          </div>
          
          <div class="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl">
            <div class="text-3xl mb-2">👨‍⚕️</div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Doctors</h3>
            <p class="text-gray-600 dark:text-gray-400">Connect with professionals</p>
          </div>
        </div>
        
        <button
          @click="logout"
          class="mt-8 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all"
        >
          Logout
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const logout = () => {
  // Clear any stored auth data
  navigateTo('/')
}
</script>
