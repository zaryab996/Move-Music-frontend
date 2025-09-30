<script setup lang="ts">
import { ref, watch } from 'vue';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import { Icon } from '@iconify/vue';
import api from '@/utils/axios';
import { useRouter } from 'vue-router';
const router = useRouter();

const page = { title: 'Artists' };
const breadcrumbs = [{ title: 'Artists', disabled: true, href: '#' }];

const artists = ref<any[]>([]);
const loading = ref(false);
const total = ref(0);

const rows = ref(10); // rows per page
const currentPage = ref(1); // current page
const search = ref('');

// fetch paginated data
const fetchData = async () => {
  loading.value = true;
  try {
    const res = await api.get('/artists', {
      params: {
        page: currentPage.value,
        per_page: rows.value,
        search: search.value
      }
    });

    // adapt backend response
    if (res.data.data) {
      artists.value = Array.isArray(res.data.data) ? res.data.data : [];
      total.value = res.data.meta?.total || 0;
    } else if (res.data.results) {
      artists.value = Array.isArray(res.data.results) ? res.data.results : [];
      total.value = res.data.count || 0;
    } else {
      artists.value = Array.isArray(res.data) ? res.data : [];
      total.value = res.data?.length || 0;
    }
  } finally {
    loading.value = false;
  }
};

// trigger fetch when page, rows, or search changes
watch([currentPage, rows, search], fetchData, { immediate: true });

// helpers for links
const getSpotifyLink = (id?: string): string | undefined =>
  id ? `https://open.spotify.com/artist/${id.replace('spotify:artist:', '')}` : undefined;

const getAppleLink = (id?: string): string | undefined =>
  id ? `https://music.apple.com/artist/${id}` : undefined;

const getAmazonLink = (id?: string): string | undefined =>
  id ? `https://music.amazon.com/artists/${id}` : undefined;

const getDeezerLink = (id?: string): string | undefined =>
  id ? `https://www.deezer.com/artist/${id}` : undefined;

</script>

<template>
  <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs" />
  <v-row>
    <v-col cols="12">
      <UiParentCard title="Your Artists List">
        <!-- PrimeVue styled input -->
        <input v-model="search" placeholder="Search Artists" class="p-inputtext p-component mb-4" />

        <DataTable
          :value="artists"
          :loading="loading"
          :paginator="true"
          :rows="rows"
          :totalRecords="total"
          :lazy="true"
          :first="(currentPage - 1) * rows"
          :rowsPerPageOptions="[10, 20, 30, 50]"
          currentPageReportTemplate="Showing {first} to {last} of {totalRecords}"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport"
          @page="
            (e) => {
              currentPage = e.page + 1;
              rows = e.rows;
            }
          "
        >
          <template #loading>
            <div class="music-loader"><span></span><span></span><span></span><span></span><span></span></div>
          </template>
          <!-- <Column field="id" header="ID" sortable /> -->
          <Column field="name" header="Artist Name" sortable>
            <template #body="{ data }">
              <div style="display: flex; align-items: center; gap: 10px">
                <img
                  v-if="data.image_small"
                  :src="data.image_small"
                  alt="Artist"
                  height="40"
                  width="40"
                  style="border-radius: 50%; object-fit: cover"
                />
                <img v-else src="/download.png" alt="Placeholder" height="40" width="40" style="border-radius: 50%; object-fit: cover" />

                <p style="margin: 0">{{ data.name }}</p>
              </div>
            </template>
          </Column>
          <!-- <Column field="owner" header="Owner">
            <template #body="{ data }">
              <p>{{ data.owner }}</p>
            </template>
          </Column> -->

          <Column header="Spotify">
            <template #body="{ data }">
              <a v-if="getSpotifyLink(data.spotify_identifier)" :href="getSpotifyLink(data.spotify_identifier)" target="_blank">
                <Icon icon="mdi:spotify" color="green" width="24" />
              </a>
            </template>
          </Column>

          <Column header="Apple Music">
            <template #body="{ data }">
              <a v-if="getAppleLink(data.apple_identifier)" :href="getAppleLink(data.apple_identifier)" target="_blank">
                <Icon icon="mdi:apple" color="red" width="24" />
              </a>
            </template>
          </Column>

          <Column header="Amazon Music">
            <template #body="{ data }">
              <a v-if="getAmazonLink(data.amazon_music_identifier)" :href="getAmazonLink(data.amazon_music_identifier)" target="_blank">
                <Icon icon="mdi:amazon" color="orange" width="24" />
              </a>
            </template>
          </Column>

          <Column header="Deezer">
            <template #body="{ data }">
              <a v-if="getDeezerLink(data.deezer_identifier)" :href="getDeezerLink(data.deezer_identifier)" target="_blank">
                <Icon icon="simple-icons:deezer" color="#00C7F2" width="24" />
              </a>
            </template>
          </Column>

          <Column header="Action" style="width: 100px; text-align: center">
            <template #body="{ data }">
              <Icon
                icon="mdi:eye-outline"
                width="24"
                height="24"
                class="cursor-pointer text-gray-500 hover:text-green-500 transition"
                @click="router.push(`/artist/${data.id}`)"
              />
            </template>
          </Column>
        </DataTable>
      </UiParentCard>
    </v-col>
  </v-row>
</template>
