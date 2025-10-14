<script setup lang="ts">
import { ref, watch } from 'vue';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import { Icon } from '@iconify/vue';
import api from '@/utils/axios';
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
const sortField = ref(''); // column name
function onSort(event: any) {
  sortField.value = event.sortField;

  fetchData();
}

// fetch paginated data
const fetchData = async () => {
  loading.value = true;
  try {
    const params: any = {
      page: currentPage.value,
      per_page: rows.value,
      search: search.value,
      ordering: sortField.value || undefined
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
      return 'primary';
    case 'TAKEDOWN':
      return 'error';
    case 'FULL_UPDATE':
      return 'info';
    case 'METADATA_UPDATE':
      return 'warning';
    default:
      return 'secondary';
  }
}

function getStatusBadgeClass(status: string): string {
  switch (status) {
    case 'DELIVERED':
      return 'primary';
    case 'PARTIALLY DELIVERED':
      return 'warning';
    default:
      return 'secondary';
  }
}

function formatActionLabel(action: string): string {
  return action ? action.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : '';
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
          :sortField="sortField"
          @sort="onSort"
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
          <Column field="release_name" header="Release"  />

          <Column field="upc" header="UPC Number" />

          <!-- Action column -->
          <Column field="action" header="Action" >
            <template #body="slotProps">
              <v-btn :color="getActionBadgeClass(slotProps.data.action)" class="status-btn">
                {{ formatActionLabel(slotProps.data.action) }}
              </v-btn>
            </template>
          </Column>

          <!-- Status column -->
          <Column field="status" header="Status">
            <template #body="slotProps">
              <v-btn :color="getStatusBadgeClass(slotProps.data.status)" class="status-btn">
                {{ slotProps.data.status }}
              </v-btn>
            </template>
          </Column>
          <Column field="created" header="Delivery Date" sortable>
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
