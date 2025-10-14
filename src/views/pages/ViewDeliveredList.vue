<script setup lang="ts">
import { ref, onMounted } from 'vue';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import { Icon } from '@iconify/vue';
import api from '@/utils/axios';
import { useRoute } from 'vue-router';

const page = { title: 'Store Delivery List' };
const breadcrumbs = [{ title: 'Store Delivery List', disabled: true, href: '#' }];
const delivered = ref<any[]>([]);
const loading = ref(false);
const route = useRoute();
const deliveredId = route.params.id;

const fetchData = async () => {
  loading.value = true;
  try {
    const res = await api.get(`/delivered/${deliveredId}`);

    if (res.data.data) {
      delivered.value = Array.isArray(res.data.data.store_confirmations) ? res.data.data.store_confirmations : [];
    } else if (res.data.results) {
      delivered.value = Array.isArray(res.data.results.store_confirmations) ? res.data.results.store_confirmations : [];
    } else {
      delivered.value = Array.isArray(res.data.store_confirmations) ? res.data.store_confirmations : [];
    }
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
    default:
      return 'secondary';
  }
}

function getStatusText(status: any): string {
  if (status === true) return 'DELIVERED';
  if (status === false) return 'FAILED';
  return status || 'UNKNOWN';
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

          <Column field="store" header="Store" />
          <Column field="status" header="Status">
            <template #body="slotProps">
              <v-btn :color="getStatusBadge(slotProps.data.status)" class="status-btn">
                {{ getStatusText(slotProps.data.status) }}
              </v-btn>
            </template>
          </Column>
        </DataTable>
      </UiParentCard>
    </v-col>
  </v-row>
</template>
