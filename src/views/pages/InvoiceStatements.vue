<script setup lang="ts">
import { ref, watch } from 'vue';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import { Icon } from '@iconify/vue';
import api from '@/utils/axios';
import { router } from '@/router';

const page = { title: 'Add Invoice' };
const breadcrumbs = [{ title: 'Add Invoice', disabled: true, href: '#' }];
const statements = ref<any[]>([]);
const loading = ref(false);
const total = ref(0);
const generating = ref(false);
const rows = ref(10);
const currentPage = ref(1);
const search = ref('');
const openLink = (url: string) => {
  window.open(url, '_blank');
};
const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];

function getMonthName(month?: number | string): string {
  const m = Number(month);
  if (!m || m < 1 || m > 12) return '-';
  return monthNames[m - 1] ?? '-';
}

// Fetch data
const fetchData = async () => {
  loading.value = true;
  try {
    const res = await api.get('/invoice/statements', {
      params: {
        page: currentPage.value,
        per_page: rows.value,
        search: search.value
      }
    });

    if (res.data.data) {
      statements.value = Array.isArray(res.data.data) ? res.data.data : [];
      total.value = res.data.meta?.total || 0;
    } else if (res.data.results) {
      statements.value = Array.isArray(res.data.results) ? res.data.results : [];
      total.value = res.data.count || 0;
    } else {
      statements.value = Array.isArray(res.data) ? res.data : [];
      total.value = res.data?.length || 0;
    }
  } finally {
    loading.value = false;
  }
};

const goToGenerateInvoice = async () => {
  generating.value = true;
  try {
    await api.get('/invoice/generate'); // call API but ignore result
  } catch (error) {
 
  } finally {
    // always redirect after the call (success or fail)
    router.push('/invoices');
    generating.value = false;
  }
};

watch([currentPage, rows, search], fetchData, { immediate: true });
</script>

<template>
  <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs" />
  <v-row>
    <v-col cols="12">
      <UiParentCard>
        <template #title>
          <div class="flex justify-space-between items-center w-full">
            <h3 class="text-lg font-semibold flex items-center">Statements Available For Invoicing</h3>
            <v-btn color="success" :loading="generating" :disabled="generating" @click="goToGenerateInvoice">
              <Icon icon="mdi:add" width="22" height="22" class="mr-1" />
              Generate Invoice
            </v-btn>
          </div>
        </template>

        <input v-model="search" placeholder="Search.." class="p-inputtext p-component mb-4" />

        <DataTable
          :value="statements"
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
          <template #loading>
            <div class="music-loader"><span></span><span></span><span></span><span></span><span></span></div>
          </template>

          <Column header="Type">
            <template #body="{ data }">
              {{ data.kind === 1 ? 'Regular' : 'Unknown' }}
            </template>
          </Column>
          <Column field="year" header="Year" />
          <Column header="Month">
            <template #body="{ data }">
              {{ getMonthName(data.month) }}
            </template>
          </Column>
          <Column field="issue_year" header="Is.Year" />
          <!-- Month Column -->

          <!-- Issue Month Column -->
          <Column header="Is. Month">
            <template #body="{ data }">
              {{ getMonthName(data.issue_month) }}
            </template>
          </Column>

          <Column field="short_description" header="Description" />
          <Column header="Amount">
            <template #body="{ data }">
              <span>
                {{ data.currency === 0 ? `${data.price}€` : data.price }}
              </span>
            </template>
          </Column>

           <Column header="Status">
            <template #body="{ data }">
              <v-btn v-if="data.new_details" color="success" class="status-btn">
                {{ data.status === 0 ? 'Open' : 'Closed' }}
              </v-btn>
            </template>
          </Column>

          <!-- Details column -->
          <Column header="Details">
            <template #body="{ data }">
              <v-btn v-if="data.new_details" color="primary" @click="openLink(data.new_details)" class="status-btn">
                <Icon icon="mdi:download" width="18" height="18" class="mr-1" />
                Download
              </v-btn>
              <v-chip v-else color="error" variant="tonal" size="small"> Waiting Approval </v-chip>
            </template>
          </Column>

          <!-- Overview column -->
          <Column header="Overview">
            <template #body="{ data }">
              <v-btn v-if="data.new_overview" color="primary" @click="openLink(data.new_overview)" class="status-btn">
                <Icon icon="mdi:download" width="18" height="18" class="mr-1" />
                Download
              </v-btn>
              <v-chip v-else color="error" variant="tonal" size="small"> Waiting Approval </v-chip>
            </template>
          </Column>
        </DataTable>
      </UiParentCard>
    </v-col>
  </v-row>
</template>
