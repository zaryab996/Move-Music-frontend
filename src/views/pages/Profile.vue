<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '@/utils/axios';
import { Icon } from '@iconify/vue';

const page = { title: 'My Profile' };
const breadcrumbs = [{ title: 'My Profile', disabled: true, href: '#' }];
const loading = ref(true);
const profile = ref<any>(null);

async function fetchProfileData() {
  loading.value = true;
  try {
    const res = await api.get(`/profile/384`);
    if (res.data?.data) {
      profile.value = res.data.data;
    } else if (res.data?.results) {
      profile.value = res.data.results;
    } else {
      profile.value = res.data;
    }
  } catch (err) {
  
  } finally {
    loading.value = false;
  }
}

onMounted(fetchProfileData);
</script>

<template>
  <v-container fluid class="pa-6 profile-container">
    <v-row justify="center" class="mt-6">
      <v-col cols="12" md="8" lg="6">
        <v-card v-if="!loading && profile" class="profile-card pa-8 rounded-xl d-flex flex-column align-center text-center">
          <!-- Avatar -->
          <div class="avatar-container mb-5">
            <v-avatar size="100" class="profile-avatar">
              <span class="avatar-text"> {{ profile.first_name?.charAt(0) }}{{ profile.last_name?.charAt(0) }} </span>
            </v-avatar>
          </div>
          <h2 class="text-h5 font-weight-bold mb-1">{{ profile.first_name }} {{ profile.last_name }}</h2>
          <p class="text-medium-emphasis mb-4">{{ profile.email }}</p>

          <v-divider class="my-4 w-100"></v-divider>
          <v-row dense class="w-100">
            <v-col
              v-for="(item, i) in [
                { icon: 'mdi:office-building', label: 'Company', value: profile.company },
                { icon: 'mdi:map-marker', label: 'Country', value: profile.country },
                { icon: 'mdi:road-variant', label: 'Street & Number', value: profile.street_and_number },
                { icon: 'mdi:home-city', label: 'City', value: profile.city },
                { icon: 'mdi:mailbox', label: 'Postal Code', value: profile.postal_code }
              ]"
              :key="i"
              cols="12"
              sm="6"
              class="profile-item mb-3"
            >
              <div class="d-flex align-center px-3 py-2 rounded-lg hoverable">
                <Icon :icon="item.icon" class="me-3 text-primary" width="22" />
                <div class="text-start">
                  <p class="text-caption text-medium-emphasis mb-0">{{ item.label }}</p>
                  <p class="text-body-2 font-weight-medium mb-0">{{ item.value }}</p>
                </div>
              </div>
            </v-col>
          </v-row>
        </v-card>

        <v-skeleton-loader v-else type="card-avatar, article" class="rounded-xl elevation-3" :loading="loading" />
      </v-col>
    </v-row>
  </v-container>
</template>
