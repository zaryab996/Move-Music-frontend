<script setup lang="ts">
import { ref, onMounted } from 'vue';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import api from '@/utils/axios';
import { useRoute } from 'vue-router';

interface StoreConfirmation {
  store?: string;
  store_name?: string | string[];
  status?: string | boolean | string;
  [key: string]: any;
}

const page = { title: 'Store Delivery List' };
const breadcrumbs = [{ title: 'Store Delivery List', disabled: true, href: '#' }];
const delivered = ref<StoreConfirmation[]>([]);
const loading = ref(false);
const route = useRoute();
const deliveredId = route.params.id;

const fetchData = async () => {
  loading.value = true;
  try {
    const res = await api.get(`/delivered/${deliveredId}`);

    let rawData: StoreConfirmation[] = [];

    if (res.data.data) {
      rawData = Array.isArray(res.data.data.store_confirmations) ? res.data.data.store_confirmations : [];
    } else if (res.data.results) {
      rawData = Array.isArray(res.data.results.store_confirmations) ? res.data.results.store_confirmations : [];
    } else {
      rawData = Array.isArray(res.data.store_confirmations) ? res.data.store_confirmations : [];
    }

    const expandedData: StoreConfirmation[] = rawData.flatMap((item: StoreConfirmation) => {
      const storeNames = Array.isArray(item.store_name)
        ? item.store_name
        : (item.store_name || '')
            .split(',')
            .map((s: string) => s.trim())
            .filter((s: string) => s.length > 0);

      return storeNames.map((name: string) => ({
        ...item,
        store_name: name
      }));
    });

    delivered.value = expandedData;
  } catch (error) {
    console.error('Error fetching delivered list:', error);
  } finally {
    loading.value = false;
  }
};

function getStatusBadge(status: any): string {
  if (status === true) return 'primary';
  if (status === false) return 'error';

  switch (status) {
    case 'DELIVERED':
      return 'primary';
    case 'PARTIALLY DELIVERED':
      return 'warning';
    case 'FAILED':
      return 'error';
    default:
      return 'secondary';
  }
}

function getStatusText(status: any): string {
  if (status === true) return 'DELIVERED';
  if (status === false) return 'FAILED';
  return status || 'UNKNOWN';
}

function formatActionLabel(action: string): string {
  if (!action) return '';
  return action
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function getAdditionalNote(storeName?: string | string[], status?: string | boolean): { text: string; color: string } {
  if (!storeName) {
    return { text: 'No additional information available.', color: 'secondary' };
  }

  const name = Array.isArray(storeName) ? storeName[0] : storeName;
  const lowerName = name?.toLowerCase() || '';
  const statusText = getStatusText(status);

  if (statusText === 'FAILED') {
    return {
      text: `Delivery to ${name} has failed.`,
      color: 'dark'
    };
  }

  if (lowerName.includes('apple music') || lowerName.includes('itunes')) {
    return {
      text: `Successfully delivered subject to additional QC control by ${name} staff.`,
      color: 'error' // red to highlight QC control
    };
  }

  return {
    text: `Release has been successfully delivered to the ${name} servers.`,
    color: 'dark'
  };
}

onMounted(fetchData);
</script>

<template>
  <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs" />
  <v-row>
    <v-col cols="12">
      <UiParentCard title="Delivered List">
        <DataTable :value="delivered" :loading="loading">
          <!-- Custom Loader -->
          <template #loading>
            <div class="music-loader"><span></span><span></span><span></span><span></span><span></span></div>
          </template>

          <!-- Store Column -->
          <Column field="store_name" header="Store" />

          <!-- Additional Notes Column -->
          <Column header="Additional Notes">
            <template #body="slotProps">
              <span :class="`text-${getAdditionalNote(slotProps.data.store_name, slotProps.data.status).color}`">
                {{ getAdditionalNote(slotProps.data.store_name, slotProps.data.status).text }}
              </span>
            </template>
          </Column>

          <!-- Status Column -->
          <Column field="status" header="Status">
            <template #body="slotProps">
              <v-btn :color="getStatusBadge(slotProps.data.status)" class="status-btn">
                {{ formatActionLabel(getStatusText(slotProps.data.status)) }}
              </v-btn>
            </template>
          </Column>
        </DataTable>
      </UiParentCard>
    </v-col>
  </v-row>
</template>
