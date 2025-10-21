<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import api from '@/utils/axios';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import { Icon } from '@iconify/vue';
import { router } from '@/router';

const page = { title: 'View Artist' };
const breadcrumbs = [{ title: 'View Artist', disabled: true, href: '#' }];
const route = useRoute();
const artistId = route.params.id;
const loading = ref(true);
const artist = ref<any>(null);
const similarArtists = ref<any[]>([]);
const tracks = ref<any[]>([]);

function formatGenres(genres: string[]) {
  return genres && genres.length ? genres : [];
}

function formatDuration(ms: number) {
  if (!ms) return '0:00';
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000)
    .toString()
    .padStart(2, '0');
  return `${minutes}:${seconds}`;
}

async function fetchArtistData() {
  loading.value = true;
  try {
    const res = await api.get(`/view-artist/${artistId}`);
    const data = res.data;
    artist.value = data.artist || data;
    similarArtists.value = data.similar || [];
    tracks.value = data.tracks || [];
  } catch (err) {
  } finally {
    loading.value = false;
  }
}

onMounted(fetchArtistData);
</script>

<template>
  <v-container fluid class="pa-6">
    <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs" />

    <v-row dense>
      <v-col cols="12" md="3">
        <v-card elevation="4" class="pa-4 text-center">
          <v-img :src="artist?.image_big || ''" alt="Artist" height="220" class="rounded-lg mb-4" cover />
          <h2 class="text-h5 font-weight-bold mb-1">{{ artist?.name }}</h2>
          <div class="d-flex flex-wrap justify-center ga-1 mb-3">
            <v-chip
              v-for="genre in formatGenres(artist?.spotify_details?.genres || [])"
              :key="genre"
              color="primary"
              text-color="white"
              size="small"
              variant="flat"
            >
              {{ genre.replace(/\b\w/g, (char) => char.toUpperCase()) }}
            </v-chip>
          </div>

          <v-divider class="my-3" />

          <div class="d-flex justify-space-between align-center mb-2">
            <span class="text-body-2">
              <Icon icon="mdi:account-multiple" width="18" height="18" color="#10b981" class="me-2" />
              Followers
            </span>
            <span class="font-weight-medium">
              {{ artist?.spotify_details?.followers?.total || 0 }}
            </span>
          </div>

          <div class="mb-2">
            <div class="d-flex justify-space-between text-body-2 mb-1">
              <span>
                <Icon icon="mdi:fire" width="18" height="18" color="#fb923c" class="me-2" />
                Popularity
              </span>
              <span>{{ artist?.spotify_details?.popularity || 0 }}%</span>
            </div>
            <v-progress-linear :model-value="artist?.spotify_details?.popularity || 0" color="deep-orange" height="6" rounded />
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="9">
        <v-card elevation="4">
          <v-card-title class="font-weight-bold">Similar Artists</v-card-title>
          <v-data-table
            :headers="[
              { title: 'Artist', value: 'name' },
              { title: 'Genres', value: 'genres' },
              { title: 'Popularity', value: 'popularity' },
              { title: 'Action', value: 'action', sortable: false }
            ]"
            :items="similarArtists"
            :loading="loading"
            class="elevation-1"
          >
            <template #item.name="{ item }">
              <v-avatar size="32" class="me-2">
                <v-img :src="item?.images?.[0]?.url || ''" />
              </v-avatar>
              <span>{{ item.name }}</span>
            </template>

            <template #item.genres="{ item }">
              <div class="d-flex flex-wrap ga-1">
                <v-chip
                  v-for="genre in formatGenres(item?.genres || [])"
                  :key="genre"
                  size="x-small"
                  color="grey-lighten-3"
                  text-color="grey-darken-3"
                >
                  {{ genre }}
                </v-chip>
              </div>
            </template>

            <template #item.action="{ item }">
              <Icon
                icon="mdi:eye-outline"
                width="24"
                height="24"
                class="cursor-pointer text-gray-500 hover:text-green-500 transition"
                @click="router.push(`/artist/${item.id}`)"
              />
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>

    <v-row dense class="mt-6">
      <v-col cols="12">
        <v-card elevation="4">
          <v-card-title class="font-weight-bold">Top Tracks</v-card-title>

          <v-data-table
            :headers="[
              { title: 'Track', key: 'name' },
              { title: 'Release', key: 'album' },
              { title: 'Artists', key: 'artists' },
              { title: 'Popularity', key: 'popularity' },
              { title: 'Action', key: 'action', sortable: false }
            ]"
            :items="tracks"
            :loading="loading"
            class="elevation-1"
          >
            <template #item.name="{ item }">
              <div class="d-flex align-center">
                <v-avatar size="32" class="me-2">
                  <v-img :src="item?.album?.images?.[0]?.url || ''" />
                </v-avatar>
                <span>{{ item.name }}</span>
              </div>
            </template>

            <template #item.album="{ item }">
              <div>
                <div class="font-weight-medium">{{ item?.album?.name || '' }}</div>
                <div class="text-caption text-grey">{{ item?.album?.release_date || '' }}</div>
              </div>
            </template>

            <template #item.artists="{ item }">
              {{ (item?.artists || []).map((a: any) => a.name).join(', ') }}
            </template>

            <template #item.popularity="{ item }">
              <div class="d-flex align-center">
                <span class="me-2">{{ item?.popularity || 0 }}%</span>
                <v-progress-linear :model-value="item?.popularity || 0" color="primary" height="6" rounded style="width: 100px" />
              </div>
            </template>

            <template #item.action="{ item }">
              <v-btn icon variant="text" color="green-darken-1" :href="item.external_urls?.spotify" target="_blank">
                <Icon icon="mdi:spotify" width="20" height="20" />
              </v-btn>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
