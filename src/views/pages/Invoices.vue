<script setup lang="ts">
import { ref, watch } from 'vue';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import { Icon } from '@iconify/vue';
import api from '@/utils/axios';
import { useRouter } from 'vue-router';

const router = useRouter();
const page = { title: 'Invoices' };
const breadcrumbs = [{ title: 'Invoices', disabled: true, href: '#' }];
const invoices = ref<any[]>([]);
const loading = ref(false);
const total = ref(0);
const rows = ref(10);
const currentPage = ref(1);
const search = ref('');
const openLink = (url: string) => {
  window.open(url, '_blank');
};
const goToAddInvoice = () => {
  router.push('/invoice/statements');
};

// Fetch data
const fetchData = async () => {
  loading.value = true;
  try {
    const res = await api.get('/invoices', {
      params: {
        page: currentPage.value,
        per_page: rows.value,
        search: search.value
      }
    });

    if (res.data.data) {
      invoices.value = Array.isArray(res.data.data) ? res.data.data : [];
      total.value = res.data.meta?.total || 0;
    } else if (res.data.results) {
      invoices.value = Array.isArray(res.data.results) ? res.data.results : [];
      total.value = res.data.count || 0;
    } else {
      invoices.value = Array.isArray(res.data) ? res.data : [];
      total.value = res.data?.length || 0;
    }
  } finally {
    loading.value = false;
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
            <h3 class="text-lg font-semibold flex items-center">Your Invoices List</h3>
            <v-btn color="primary" @click="goToAddInvoice">
              <Icon icon="mdi:add" width="22" height="22" class="mr-1" />
              Add Invoice
            </v-btn>
          </div>
        </template>

        <input v-model="search" placeholder="Search Invoices" class="p-inputtext p-component mb-4" />

        <DataTable
          :value="invoices"
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

          <Column field="issue_date" header="Issue Date" />

          <Column field="invoice_number" header="Invoice Number" />

          <Column header="Status">
            <template #body="{ data }">
              <span
                class="badge"
                :class="{
                  'badge-primary': data.status === 'Paid',
                  'badge-warning': data.status === 'Pending'
                }"
                style="pointer-events: none; cursor: default"
              >
                {{ data.status === 'paid' ? 'Paid' : 'Pending' }}
              </span>
            </template>
          </Column>

          <Column header="Total Amount">
            <template #body="{ data }">
              <span>
                {{ data.currency === 0 ? `${data.total_amount}€` : data.total_amount }}
              </span>
            </template>
          </Column>

          <!-- Overview column -->
          <Column header="Download PDF  ">
            <template #body="{ data }">
              <v-btn v-if="data.invoice_pdf" color="primary" @click="openLink(data.invoice_pdf)">
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
