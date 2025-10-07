<script setup lang="ts">
import { ref, watch } from 'vue';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import { Icon } from '@iconify/vue';
import api from '@/utils/axios';
import Tag from 'primevue/tag';
import { router } from '@/router';

const page = { title: 'Labels' };
const breadcrumbs = [{ title: 'Labels', disabled: true, href: '#' }];

const labels = ref<any[]>([]);
const loading = ref(false);
const total = ref(0);

const rows = ref(10);
const currentPage = ref(1);
const search = ref('');

// fetch paginated data
const fetchData = async () => {
  loading.value = true;
  try {
    const res = await api.get('/labels', {
      params: {
        page: currentPage.value,
        per_page: rows.value,
        search: search.value
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

          <Column field="primary_genre" header="Genre">
            <template #body="{ data }">
              <p>{{ data.primary_genre }}</p>
            </template>
          </Column>

          <Column field="company" header="Company" />
          <Column field="year" header="Year" />
          <Column field="catalog_num" header="Catalog No." />
          <Column header="Contract">
            <template #body="{ data }">
              <span
                class="badge"
                :class="data.contract_received ? 'badge-success' : 'badge-danger'"
                style="pointer-events: none; cursor: default"
              >
                {{ data.contract_received ? 'Approved' : 'Waiting Approval' }}
              </span>
            </template>
          </Column>

          <Column header="Info">
            <template #body="{ data }">
              <span
                class="badge"
                :class="data.information_accepted ? 'badge-success' : 'badge-danger'"
                style="pointer-events: none; cursor: default"
              >
                {{ data.information_accepted ? 'Approved' : 'Waiting Approval' }}
              </span>
            </template>
          </Column>

          <Column header="Status">
            <template #body="{ data }">
              <span
                class="badge"
                :class="data.label_approved ? 'badge-success' : 'badge-danger'"
                style="pointer-events: none; cursor: default"
              >
                {{ data.label_approved ? 'Approved' : 'Waiting Approval' }}
              </span>
            </template>
          </Column>
        </DataTable>
      </UiParentCard>
    </v-col>
  </v-row>
</template>
