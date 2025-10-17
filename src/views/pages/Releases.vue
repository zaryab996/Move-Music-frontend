```vue
<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import { Icon } from '@iconify/vue';
import api from '@/utils/axios';
import { useRouter } from 'vue-router';
import Accordion from 'primevue/accordion';
import AccordionTab from 'primevue/accordiontab';

const page = { title: 'Releases' };
const breadcrumbs = [{ title: 'Releases', disabled: true, href: '#' }];
const releases = ref<any[]>([]);
const loading = ref(false);
const total = ref(0);
const rows = ref(10);
const currentPage = ref(1);
const search = ref('');
const router = useRouter();
const sortField = ref(''); // column name
const expandedRows = ref<any[]>([]);

function onSort(event: any) {
  sortField.value = event.sortField;

  fetchData();
}

const onRowExpand = (event: any) => {
  if (!expandedRows.value.some((row) => row.id === event.data.id)) {
    expandedRows.value = [...expandedRows.value, event.data];
  }
};

const onRowCollapse = (event: any) => {
  expandedRows.value = expandedRows.value.filter((row) => row.id !== event.data.id);
};

// fetch paginated data
const fetchData = async () => {
  loading.value = true;
  try {
    const res = await api.get('/releases', {
      params: {
        page: currentPage.value,
        per_page: rows.value,
        search: search.value,
        ordering: sortField.value || undefined
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
  offline: { label: 'Offline', severity: 'error' },
  takedown_request: { label: 'Takedown Requested', severity: 'error' },
  taken_down: { label: 'Taken Down', severity: 'error' },
  're_delivery-editing': { label: 'Re-Delivery Editing', severity: 'warning' },
  're_delivery-delivery': { label: 'Re-Delivery', severity: 'warning' },
  ready: { label: 'Ready', severity: 'secondary' },
  approval: { label: 'Waiting Approval', severity: 'info' },
  locked: { label: 'Locked', severity: 'secondary' },
  delivering: { label: 'Delivering', severity: 'primary' },
  distributed: { label: 'Distributed', severity: 'primary' }
};

function handleDelivered(data: any) {
  router.push(`/delivered/release/${data.name}`);
}

function handleView(data: any) {
  router.push(`/release/${data.id}`);
}

const activeTooltip = ref<number | null>(null);
const tooltipPosition = ref({ top: '0px', left: '0px' });

function toggleTooltip(id: number, event?: MouseEvent) {
  if (activeTooltip.value === id) {
    activeTooltip.value = null;
    return;
  }
  activeTooltip.value = id;

  const rect = (event?.currentTarget as HTMLElement).getBoundingClientRect();
  tooltipPosition.value = {
    top: `${rect.bottom + window.scrollY + 8}px`,
    left: `${rect.left}px`
  };
}

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
function formatActionLabel(action: string): string {
  return action
    ? action
        .replace(/[_-]/g, ' ') // replaces both underscores and hyphens
        .replace(/\b\w/g, (c) => c.toUpperCase()) // capitalize each word
    : '';
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

function getBellColor(status?: string): string {
  switch (status?.toLowerCase()) {
    case 'rejected':
      return '#d93025'; // red
    case 'approved':
      return '#34a853'; // green
    default:
      return 'gray'; // neutral
  }
}

function getColor(status?: string): string {
  switch (status?.toLowerCase()) {
    case 'rejected':
      return 'danger-tooltip'; // red
    case 'approved':
      return 'success-tooltip'; // green
    default:
      return 'gray'; // neutral
  }
}

function getTooltipMessage(data: any): string {
  const status = data.release_user_declaration?.status?.toLowerCase();

  if (status === 'rejected') {
    return data.release_user_declaration?.admin_message || 'Rejected - No message';
  }

  if (status === 'approved') {
    return data.release_user_declaration?.admin_message || 'Approved by admin';
  }

  if (data.acr_alert) {
    return data.acr_alert?.cover_results || 'No alert details';
  }

  return 'No alert';
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
          v-model:expandedRows="expandedRows"
          :value="releases"
          :loading="loading"
          :paginator="true"
          :rows="rows"
          :totalRecords="total"
          :lazy="true"
          :sortField="sortField"
          @sort="onSort"
          :dataKey="'id'"
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
          @row-expand="onRowExpand"
          @row-collapse="onRowCollapse"
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
          <Column field="artist" header="Artist">
            <template #body="{ data }">
              <p>{{ data.artists }}</p>
            </template>
          </Column>
          <Column field="catalogue_number" header="Cat. No." />
          <!-- <Column field="ean" header="UPC. No." /> -->
          <Column field="official_date" header="Release Date" sortable>
            <template #body="{ data }">
              <p>{{ data.official_date }}</p>
            </template>
          </Column>
          <Column field="status" header="Status" sortable>
            <template #body="{ data }">
              <v-btn :color="statusMap[data.status]?.severity || 'secondary'" class="status-btn">
                {{ statusMap[data.status]?.label || data.status }}
              </v-btn>
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
                  @click.stop="data.store_urls?.length ? toggleTooltip(data.id, $event) : null"
                />

                <Teleport to="body">
                  <div v-if="activeTooltip === data.id && data.store_urls?.length" class="store-tooltip" :style="tooltipPosition">
                    <div v-for="(store, index) in data.store_urls" :key="index" class="store-item">
                      <div class="store-left">
                        <Icon :icon="getStoreIcon(store.store_name).icon" :color="getStoreIcon(store.store_name).color" width="22" />
                        <span>{{ formatActionLabel(store.store_name) }}</span>
                      </div>
                      <div class="store-actions">
                        <Icon icon="mdi:content-copy" width="18" style="cursor: pointer" @click.stop="copyToClipboard(store.url)" />
                        <Icon icon="mdi:open-in-new" width="18" style="cursor: pointer" @click.stop="openInNewTab(store.url)" />
                      </div>
                    </div>
                  </div>
                </Teleport>
              </div>
            </template>
          </Column>
          <Column header="QC">
            <template #body="{ data }">
              <div>
                <!-- If no feedback -->
                <Icon
                  v-if="!data.qc_feedback || (Array.isArray(data.qc_feedback) && data.qc_feedback.length === 0)"
                  icon="mdi:bell-ring-outline"
                  color="gray"
                  width="20"
                />

                <!-- If feedback exists -->
                <v-tooltip v-else location="top" content-class="danger-tooltip">
                  <template #activator="{ props }">
                    <Icon v-bind="props" icon="mdi:bell-ring" color="#d93025" width="20" style="cursor: pointer" />
                  </template>

                  <!-- Safe optional chaining -->
                  <span>
                    <span>
                  Release {{ data.name }} has QC issues, please view the release for detailed QC feedback, make required changes and resubmit!
                    </span>
                  </span>
                </v-tooltip>
              </div>
            </template>
          </Column>
          <Column header="Alert">
            <template #body="{ data }">
              <div>
                <!-- No alert -->
                <Icon v-if="!data.has_acr_alert && !data.release_user_declaration" icon="mdi:bell-ring-outline" color="gray" width="20" />

                <!-- Alert with tooltip -->
                <v-tooltip v-else location="top" class="tool" :content-class="getColor(data.release_user_declaration?.status)">
                  <template #activator="{ props }">
                    <Icon
                      v-bind="props"
                      icon="mdi:bell-ring"
                      :color="getBellColor(data.release_user_declaration?.status)"
                      width="20"
                      style="cursor: pointer"
                    />
                  </template>
                  <span>
                    {{ getTooltipMessage(data) }}
                  </span>
                </v-tooltip>
              </div>
            </template>
          </Column>

          <!-- Expander Column for Accordion Expansion -->
          <Column expander header="Actions" style="width: 6rem" />

          <!-- Expanded Row Content with Accordion -->
          <template #expansion="slotProps">
            <div
              class="expanded-row-wrapper"
              style="
                background: #f8f9fa;
                border: 1px solid #e9ecef;
                border-radius: 8px;
                margin: 8px 0;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
              "
            >
              <Accordion :multiple="false" :activeIndex="0">
                <AccordionTab header="Details" :pt="{ header: { class: 'font-semibold text-base' }, content: { class: 'p-0' } }">
                  <div class="p-4" style="display: flex; justify-content: space-between; align-items: flex-start; gap: 20px">
                    <!-- Left Side: UPC and Release Date -->
                    <div style="display: flex; flex-direction: row; gap: 80px; min-width: 200px">
                      <div style="display: flex; align-items: center; gap: 8px">
                        <div>
                          <p style="margin: 0; font-size: 0.875rem; color: #6c757d; font-weight: 500">UPC No.</p>
                          <p style="margin: 0; font-weight: 600; color: #212529">{{ slotProps.data.ean }}</p>
                        </div>
                      </div>
                      <div style="display: flex; align-items: center; gap: 8px">
                        <div>
                          <p style="margin: 0; font-size: 0.875rem; color: #6c757d; font-weight: 500">Release Date (Official)</p>
                          <p style="margin: 0; font-weight: 600; color: #212529">{{ slotProps.data.official_date }}</p>
                        </div>
                      </div>
                      <div style="display: flex; align-items: center; gap: 8px">
                        <div>
                          <p style="margin: 0; font-size: 0.875rem; color: #6c757d; font-weight: 500">Release Date (Exclusive)</p>
                          <p style="margin: 0; font-weight: 600; color: #212529" v-if="slotProps.data.exclusive_date">
                            Exclusive: {{ slotProps.data.exclusive_date }}
                          </p>
                          <p style="margin: 0; font-weight: 600; color: #212529" v-else>No Exclusive Date</p>
                        </div>
                      </div>
                    </div>
                    <!-- Right Side: Buttons -->
                    <div style="display: flex; gap: 12px; align-items: flex-start">
                      <v-btn color="primary" variant="outlined" @click="handleDelivered(slotProps.data)" class="status-btn">
                        Delivered List
                      </v-btn>
                      <v-btn color="primary" size="default" @click="handleView(slotProps.data)" class="status-btn"> View </v-btn>
                    </div>
                  </div>
                </AccordionTab>
              </Accordion>
            </div>
          </template>
        </DataTable>
      </UiParentCard>
    </v-col>
  </v-row>
</template>
