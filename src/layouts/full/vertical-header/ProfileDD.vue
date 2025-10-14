<script setup lang="ts">
import { ref, computed } from 'vue'
import { SettingsIcon, LogoutIcon, UserIcon } from 'vue-tabler-icons'
import { useAuthStore } from '@/stores/auth'

const swt1 = ref(true)
const swt2 = ref(false)
const authStore = useAuthStore()

// ✅ Dynamic greeting based on time
const greeting = computed(() => {
  const hour = new Date().getHours()

  if (hour < 12) return 'Good Morning Max!'
  if (hour < 18) return 'Good Afternoon Max!'
  return 'Good Evening Max!'
})
</script>
<template>
  <div class="pa-4">
    <h4 class="mb-n1 mb-3">{{ greeting }} </h4>
    <!-- <span class="text-subtitle-2 text-medium-emphasis"></span> -->

    <v-divider></v-divider>

    <perfect-scrollbar style="height: 100%">
      <v-divider></v-divider>

      <v-list class="mt-3">
        <v-list-item color="secondary" rounded="md" to="/profile" link>
          <template #prepend>
            <UserIcon size="20" class="mr-2" />
          </template>
          <v-list-item-title class="text-subtitle-2">My Profile</v-list-item-title>
        </v-list-item>

        <v-list-item @click="authStore.logout()" color="secondary" rounded="md">
          <template #prepend>
            <LogoutIcon size="20" class="mr-2" />
          </template>
          <v-list-item-title class="text-subtitle-2">Logout</v-list-item-title>
        </v-list-item>
      </v-list>
    </perfect-scrollbar>
  </div>
</template>

