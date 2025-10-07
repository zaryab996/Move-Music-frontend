<script setup lang="ts">
import { ref, watch } from 'vue';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import { Icon } from '@iconify/vue';
import api from '@/utils/axios';
import Tag from 'primevue/tag';

import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();


const page = { title: 'Delivered List' };
const breadcrumbs = [{ title: 'Dilevered list', disabled: true, href: '#' }];
const delivered = ref<any[]>([]);
const loading = ref(false);
const total = ref(0);
const rows = ref(10);
const currentPage = ref(1);
const search = ref('');

// fetch paginated data
const fetchData = async () => {
  loading.value = true;
  try {
    const params: any = {
      page: currentPage.value,
      per_page: rows.value,
      search: search.value
    };

    // ✅ if we have /delivered/release/:name → add release param
    if (route.params.name) {
      params.release = route.params.name;
    }

    const res = await api.get('/delivered', { params });

    if (res.data.data) {
      delivered.value = Array.isArray(res.data.data) ? res.data.data : [];
      total.value = res.data.meta?.total || 0;
    } else if (res.data.results) {
      delivered.value = Array.isArray(res.data.results) ? res.data.results : [];
      total.value = res.data.count || 0;
    } else {
      delivered.value = Array.isArray(res.data) ? res.data : [];
      total.value = res.data?.length || 0;
    }
  } finally {
    loading.value = false;
  }
};

// script setup
function getActionBadgeClass(action: string): string {
  switch (action) {
    case 'INSERT':
      return 'badge-primary';
    case 'TAKEDOWN':
      return 'badge-danger';
    case 'FULL_UPDATE':
      return 'badge-info';
    case 'METADATA_UPDATE':
      return 'badge-warning';
    default:
      return 'badge-secondary';
  }
}

function getStatusBadgeClass(status: string): string {
  switch (status) {
    case 'DELIVERED':
      return 'badge-primary';
    case 'PARTIALLY DELIVERED':
      return 'badge-warning';
    default:
      return 'badge-secondary';
  }
}

watch([currentPage, rows, search], fetchData, { immediate: true });
</script>

<template>
  <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs" />
  <v-row>
    <v-col cols="12">
      <UiParentCard title="Delivered List">
        <input v-model="search" placeholder="Search" class="p-inputtext p-component mb-4" />
        <DataTable
          :value="delivered"
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
          <Column field="release_name" header="Release" />

          <Column field="upc" header="UPC Number" />

          <!-- Action column -->
          <Column field="action" header="Action">
            <template #body="slotProps">
              <span class="badge" :class="getActionBadgeClass(slotProps.data.action)" style="pointer-events: none; cursor: default">
                {{ slotProps.data.action }}
              </span>
            </template>
          </Column>

          <!-- Status column -->
          <Column field="status" header="Status">
            <template #body="slotProps">
              <span class="badge" :class="getStatusBadgeClass(slotProps.data.status)" style="pointer-events: none; cursor: default">
                {{ slotProps.data.status }}
              </span>
            </template>
          </Column>
          <Column field="created" header="Delivery Date">
            <template #body="{ data }">
              {{ new Date(data.created).toLocaleString() }}
            </template>
          </Column>

          <Column header="Details" style="width: 100px; text-align: center">
            <template #body="{ data }">
              <Icon
                icon="mdi:eye-outline"
                width="24"
                height="24"
                class="cursor-pointer text-gray-500 hover:text-green-500 transition"
                @click="router.push(`/delivered/${data.id}`)"
              />
            </template>
          </Column>
        </DataTable>
      </UiParentCard>
    </v-col>
  </v-row>
</template>
