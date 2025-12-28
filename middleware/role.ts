export default defineNuxtRouteMiddleware((to) => {
  const role = useCookie('role') // ✅ SSR-safe
  console.log(role)
  console.log(role.value)

  if (!role.value) {
    return navigateTo('/')
  }

  if (to.path.startsWith('/doctor') && role.value !== 'DOCTOR') {
    return navigateTo('/user')
  }

  if (to.path.startsWith('/user') && role.value !== 'USER') {
    return navigateTo('/doctor')
  }
})