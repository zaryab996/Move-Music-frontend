<script setup lang="ts">
import { ref, watch } from 'vue';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import { Icon } from '@iconify/vue';
import api from '@/utils/axios';
import Tag from 'primevue/tag';
import { useRouter } from 'vue-router';
const router = useRouter();

const page = { title: 'Releases' };
const breadcrumbs = [{ title: 'Releases', disabled: true, href: '#' }];

const releases = ref<any[]>([]);
const loading = ref(false);
const total = ref(0);

const rows = ref(10);
const currentPage = ref(1);
const search = ref('');

// fetch paginated data
const fetchData = async () => {
  loading.value = true;
  try {
    const res = await api.get('/releases', {
      params: {
        page: currentPage.value,
        per_page: rows.value,
        search: search.value
      }
    });

    if (res.data.data) {
      releases.value = Array.isArray(res.data.data) ? res.data.data : [];
      total.value = res.data.meta?.total || 0;
    } else if (res.data.results) {
      releases.value = Array.isArray(res.data.results) ? res.data.results : [];
      total.value = res.data.count || 0;
    } else {
      releases.value = Array.isArray(res.data) ? res.data : [];
      total.value = res.data?.length || 0;
    }
  } finally {
    loading.value = false;
  }
};
// script setup

watch([currentPage, rows, search], fetchData, { immediate: true });
const statusMap: Record<string, { label: string; severity: string }> = {
  offline: { label: 'Offline', severity: 'danger' },
  takedown_request: { label: 'Takedown Requested', severity: 'danger' },
  taken_down: { label: 'Taken Down', severity: 'danger' },
  're_delivery-editing': { label: 'Re-Delivery Editing', severity: 'warning' },
  're_delivery-delivery': { label: 'Re-Delivery', severity: 'warning' },
  ready: { label: 'Ready', severity: 'secondary' },
  approval: { label: 'Waiting Approval', severity: 'info' },
  locked: { label: 'Locked', severity: 'secondary' },
  delivering: { label: 'Delivering', severity: 'primary' },
  distributed: { label: 'Distributed', severity: 'primary' }
};
</script>

<template>
  <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs" />
  <v-row>
    <v-col cols="12">
      <UiParentCard title="Your Releases List">
        <!-- Search input -->
        <input v-model="search" placeholder="Search Releases" class="p-inputtext p-component mb-4" />

        <!-- PrimeVue DataTable -->
        <DataTable
          :value="releases"
          :loading="loading"
          :paginator="true"
          :rows="rows"
          :totalRecords="total"
          :lazy="true"
          :first="(currentPage - 1) * rows"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport"
          :rowsPerPageOptions="[10, 20, 30, 50]"
          currentPageReportTemplate="Showing {first} to {last} of {totalRecords}"
          @page="
            (e) => {
              currentPage = e.page + 1;
              rows = e.rows;
            }
          "
        >
          <!-- Custom Loader -->
          <template #loading>
            <div class="music-loader"><span></span><span></span><span></span><span></span><span></span></div>
          </template>

          <!-- Name with artwork -->
          <Column field="name" header="Name" sortable>
            <template #body="{ data }">
              <div style="display: flex; align-items: center; gap: 10px">
                <img
                  v-if="data.artwork?.thumb_small"
                  :src="data.artwork.thumb_small"
                  alt="Artwork"
                  height="40"
                  width="40"
                  style="border-radius: 50%; object-fit: cover"
                />
                <img v-else src="/download.png" alt="Placeholder" height="40" width="40" style="border-radius: 8px; object-fit: cover" />
                <p style="margin: 0">{{ data.name }}</p>
              </div>
            </template>
          </Column>

          <Column field="artist" header="Artist" sortable>
            <template #body="{ data }">
              <p>{{ data.artists }}</p>
            </template>
          </Column>

          <Column field="catalogue_number" header="Cat. No." sortable />
          <Column field="ean" header="UPC. No." />
          <Column field="official_date" header="Release Date" sortable>
            <template #body="{ data }">
              <p>Official: {{ data.official_date }}</p>
              <p v-if="data.exclusive_date">Exclusive: {{ data.exclusive_date }}</p>
              <p v-else>No Exclusive Date</p>
            </template>
          </Column>
          <Column field="status" header="Status" sortable>
            <template #body="{ data }">
            <span v-if="statusMap[data.status]" :class="`badge badge-${statusMap[data.status]?.severity}`">
  {{ statusMap[data.status]?.label }}
</span>
<span v-else class="badge badge-secondary">{{ data.status }}</span>
            </template>
          </Column>

          <!-- <Column field="store_urls" header="Store Urls" /> -->
          <Column header="QC">
            <template #body="{ data }">
              <div>
                <Icon v-if="!data.qc_passed" icon="mdi:bell-ring-outline" color="gray" width="20" />
                <v-tooltip v-else location="top" content-class="danger-tooltip">
                  <template #activator="{ props }">
                    <Icon v-bind="props" icon="mdi:bell-ring" color="#d93025" width="20" style="cursor: pointer" />
                  </template>
                  <span>{{ data.qc_feedback || 'No feedback provided' }}</span>
                </v-tooltip>
              </div>
            </template>
          </Column>

          <Column header="Alert">
            <template #body="{ data }">
              <div>
                <Icon v-if="!data.has_acr_alert" icon="mdi:bell-ring-outline" color="gray" width="20" />
                <v-tooltip v-else location="top" content-class="danger-tooltip">
                  <template #activator="{ props }">
                    <Icon v-bind="props" icon="mdi:bell-ring" color="#d93025" width="20" style="cursor: pointer" />
                  </template>
          <span>{{ data.acr_alert?.cover_results || 'No alert details' }}</span>
                </v-tooltip>
              </div>
            </template>
          </Column>

          <Column header="Action">
            <template #body="{ data }">
              <Icon
                icon="mdi:eye-outline"
                width="24"
                height="24"
                class="cursor-pointer text-gray-500 hover:text-green-500 transition"
                @click="router.push(`/release/${data.id}`)"
              />
            </template>
          </Column>
        </DataTable>
      </UiParentCard>
    </v-col>
  </v-row>
</template>
