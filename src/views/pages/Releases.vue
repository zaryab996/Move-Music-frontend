<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import { Icon } from '@iconify/vue';
import api from '@/utils/axios';
import Dropdown from 'primevue/dropdown';
import { useRouter } from 'vue-router';

const page = { title: 'Releases' };
const breadcrumbs = [{ title: 'Releases', disabled: true, href: '#' }];
const releases = ref<any[]>([]);
const loading = ref(false);
const total = ref(0);
const rows = ref(10);
const currentPage = ref(1);
const search = ref('');

const router = useRouter();

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

// router actions
function handleAction(action: string, data: any) {
  if (action === 'view') {
    router.push(`/release/${data.id}`);
  } else if (action === 'delivered') {
    router.push(`/delivered/release/${data.name}`);
  }
}

// =============== ✅ Store URL Tooltip Logic ==================
const activeTooltip = ref<number | null>(null);

function toggleTooltip(id: number) {
  activeTooltip.value = activeTooltip.value === id ? null : id;
}

// close tooltip when clicking outside
function handleClickOutside(e: MouseEvent) {
  const tooltipElements = document.querySelectorAll('.store-tooltip');
  let clickedInside = false;
  tooltipElements.forEach((tooltip) => {
    if (tooltip.contains(e.target as Node)) clickedInside = true;
  });
  if (!clickedInside) activeTooltip.value = null;
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});

function copyToClipboard(url: string) {
  navigator.clipboard.writeText(url);
}

function openInNewTab(url: string) {
  window.open(url, '_blank');
}

function getStoreIcon(store: string) {
  const icons: Record<string, { icon: string; color: string }> = {
    spotify: { icon: 'mdi:spotify', color: 'green' },
    'apple-music': { icon: 'mdi:apple', color: 'red' },
    deezer: { icon: 'simple-icons:deezer', color: '#00C7F2' },
    'amazon-music': { icon: 'mdi:amazon', color: 'orange' },
    beatport: { icon: 'simple-icons:beatport', color: '#A4FF00' },
    traxsource: { icon: 'mdi:music', color: '#3498db' },
    youtube: { icon: 'mdi:youtube', color: 'red' }
  };
  return icons[store] || { icon: 'mdi:music', color: '#666' };
}
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
          <Column field="name" header="Name">
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
          <Column field="artist" header="Artist">
            <template #body="{ data }">
              <p>{{ data.artists }}</p>
            </template>
          </Column>
          <Column field="catalogue_number" header="Cat. No." />
          <Column field="ean" header="UPC. No." />
          <Column field="official_date" header="Release Date">
            <template #body="{ data }">
              <p>Official: {{ data.official_date }}</p>
              <p v-if="data.exclusive_date">Exclusive: {{ data.exclusive_date }}</p>
              <p v-else>No Exclusive Date</p>
            </template>
          </Column>
          <Column field="status" header="Status">
            <template #body="{ data }">
              <span v-if="statusMap[data.status]" :class="`badge badge-${statusMap[data.status]?.severity}`">
                {{ statusMap[data.status]?.label }}
              </span>
              <span v-else class="badge badge-secondary">{{ data.status }}</span>
            </template>
          </Column>
          <Column header="Store URLs">
            <template #body="{ data }">
              <div class="relative">
                <Icon
                  icon="mdi:link-variant"
                  :color="data.store_urls?.length ? '#1976D2' : 'gray'"
                  width="22"
                  style="cursor: pointer"
                  @click.stop="data.store_urls?.length ? toggleTooltip(data.id) : null"
                />

                <!-- Tooltip Dropdown -->
                <div v-if="activeTooltip === data.id && data.store_urls?.length" class="store-tooltip">
                  <div v-for="(store, index) in data.store_urls" :key="index" class="store-item">
                    <div class="store-left">
                      <Icon :icon="getStoreIcon(store.store_name).icon" :color="getStoreIcon(store.store_name).color" width="22" />
                      <span>{{ store.store_name }}</span>
                    </div>
                    <div class="store-actions">
                      <Icon icon="mdi:content-copy" width="18" style="cursor: pointer" @click.stop="copyToClipboard(store.url)" />
                      <Icon icon="mdi:open-in-new" width="18" style="cursor: pointer" @click.stop="openInNewTab(store.url)" />
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </Column>
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
                <v-tooltip v-else location="top" class="tool" content-class="danger-tooltip">
                  <template #activator="{ props }">
                    <Icon v-bind="props" icon="mdi:bell-ring" color="#d93025" width="20" style="cursor: pointer" />
                  </template>
                  <span class="">
                    {{
                      data.acr_alert
                        ? data.release_user_declaration?.admin_message || 'No admin message'
                        : data.acr_alert?.cover_results || 'No alert details'
                    }}
                  </span>
                </v-tooltip>
              </div>
            </template>
          </Column>
          <Column header="Action">
            <template #body="{ data }">
              <Dropdown
                :options="[
                  { label: 'View', value: 'view' },
                  { label: 'Delivered List', value: 'delivered' }
                ]"
                optionLabel="label"
                optionValue="value"
                placeholder="Action"
                @change="(e) => handleAction(e.value, data)"
                class="w-60"
              />
            </template>
          </Column>
        </DataTable>
      </UiParentCard>
    </v-col>
  </v-row>
</template>
