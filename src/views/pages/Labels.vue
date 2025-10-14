<script setup lang="ts">
import { ref, watch } from 'vue';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import api from '@/utils/axios';

const page = { title: 'Labels' };
const breadcrumbs = [{ title: 'Labels', disabled: true, href: '#' }];
const labels = ref<any[]>([]);
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
    const res = await api.get('/labels', {
      params: {
        page: currentPage.value,
        per_page: rows.value,
        search: search.value,
        ordering: sortField.value || undefined
      }
    });

    if (res.data.data) {
      labels.value = Array.isArray(res.data.data) ? res.data.data : [];
      total.value = res.data.meta?.total || 0;
    } else if (res.data.results) {
      labels.value = Array.isArray(res.data.results) ? res.data.results : [];
      total.value = res.data.count || 0;
    } else {
      labels.value = Array.isArray(res.data) ? res.data : [];
      total.value = res.data?.length || 0;
    }
  } finally {
    loading.value = false;
  }
};
// script setup

watch([currentPage, rows, search], fetchData, { immediate: true });
</script>

<template>
  <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs" />
  <v-row>
    <v-col cols="12">
      <UiParentCard title="Your Labels List">
        <!-- Search input -->
        <input v-model="search" placeholder="Search Labels" class="p-inputtext p-component mb-4" />

        <!-- PrimeVue DataTable -->
        <DataTable
          :value="labels"
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
          <Column field="name" header="Name" sortable>
            <template #body="{ data }">
              <div style="display: flex; align-items: center; gap: 10px">
                <img
                  v-if="data.logo?.thumb_small"
                  :src="data.logo.thumb_small"
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

          <Column field="primary_genre" header="Genre" sortable>
            <template #body="{ data }">
              <p>{{ data.primary_genre }}</p>
            </template>
          </Column>

          <Column field="company" header="Company" sortable />
          <Column field="year" header="Year" sortable />
          <Column field="catalog_num" header="Catalog No." />
          <Column header="Contract" field="contract_received" sortable>
            <template #body="{ data }">
              <v-btn :color="data.contract_received ? 'success' : 'error'" class="status-btn">
                {{ data.contract_received ? 'Approved' : 'Waiting Approval' }}
              </v-btn>
            </template>
          </Column>

          <Column header="Info" field="information_accepted" sortable>
            <template #body="{ data }">
              <v-btn :color="data.information_accepted ? 'success' : 'error'" class="status-btn">
                {{ data.information_accepted ? 'Approved' : 'Waiting Approval' }}
              </v-btn>
            </template>
          </Column>

          <Column header="Status" field="label_approved" sortable>
            <template #body="{ data }">
              <v-btn :color="data.label_approved ? 'success' : 'error'" class="status-btn">
                {{ data.label_approved ? 'Approved' : 'Waiting Approval' }}
              </v-btn>
            </template>
          </Column>
        </DataTable>
      </UiParentCard>
    </v-col>
  </v-row>
</template>
