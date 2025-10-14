<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import api from '@/utils/axios';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import SalesMap from '@/components/shared/sales.vue';

const page = { title: 'Trends' };
const breadcrumbs = [{ title: 'Trends', disabled: true, href: '#' }];
const loading = ref(true);
const salesMapData = ref<any[]>([]);
const tracks = ref<any[]>([]);
const genderGraph = ref<any>(null);
const ageGraph = ref<any>(null);
const stores = ref<any[]>([]);
const labels = ref<any[]>([]);
const releases = ref<any[]>([]);
const allTracks = ref<any[]>([]);
const multiSalesGraph = ref<any>(null);
const selectedPeriod = ref(1);
const selectedStore = ref('all');
const selectedLabel = ref('all');
const selectedRelease = ref('all');
const selectedTrack = ref('all');

// Fetch filters + trend data
async function fetchTrendData() {
  loading.value = true;
  try {
    const res = await api.get(`/trends`, {
      params: {
        period: selectedPeriod.value,
        store: selectedStore.value !== 'all' ? selectedStore.value : 'am,apm,yp,yt,tk,tx,sp,sc,pd,it,ig,fb,dr,bp',
        label: selectedLabel.value !== 'all' ? selectedLabel.value : undefined,
        release: selectedRelease.value !== 'all' ? selectedRelease.value : undefined,
        track: selectedTrack.value !== 'all' ? selectedTrack.value : undefined
      }
    });

    const data = res.data;
    tracks.value = data.top_10_tracks || [];
    genderGraph.value = data.gender_graph_data;
    ageGraph.value = data.age_graph_data;
    multiSalesGraph.value = data.multi_sales_graph_data;

    salesMapData.value =
      data.country_wise_sales?.sales?.map((item: any) => ({
        iso3: item.id,
        value: item.value
      })) || [];

    // Initialize filter dropdowns once
    if (stores.value.length === 0) {
      stores.value = [{ id: 'all', name: 'All' }, ...(data.stores || [])];
      labels.value = [{ id: 'all', name: 'All' }, ...(data.labels || [])];
      releases.value = [{ id: 'all', name: 'All' }, ...(data.releases || [])];
      allTracks.value = [{ id: 'all', name: 'All' }, ...(data.tracks || [])];
    }
  } catch (err) {
  } finally {
    loading.value = false;
  }
}
// Auto-fetch when filters change
watch([selectedPeriod, selectedStore, selectedLabel, selectedRelease, selectedTrack], fetchTrendData);
// Initial load
onMounted(fetchTrendData);
// --- Gender Pie Chart ---
const genderChartOptions = computed(() => ({
  chart: { type: 'pie', height: 380, toolbar: { show: false } },
  labels: genderGraph.value?.labels || [],
  colors: ['#1E88E5', '#E91E63', '#9C27B0', '#BDBDBD'],
  legend: { position: 'bottom' },
  dataLabels: { enabled: true },
  tooltip: { y: { formatter: (val: number) => val.toLocaleString() } }
}));
const genderChartSeries = computed(() => genderGraph.value?.data || []);
// --- Age Bar Chart ---
const ageChartOptions = computed(() => ({
  chart: { type: 'bar', height: 350, stacked: true, toolbar: { show: false } },
  xaxis: { categories: ageGraph.value?.labels || [] },
  legend: {
    position: 'bottom',
    markers: {
      shape: 'circle'
    }
  },

  colors: ['#1E88E5', '#E91E63', '#9C27B0', '#BDBDBD'],
  plotOptions: { bar: { horizontal: false, columnWidth: '50%' } },
  dataLabels: { enabled: false },
  tooltip: { y: { formatter: (val: number) => val.toLocaleString() } }
}));

const ageChartSeries = computed(() => {
  if (!ageGraph.value) return [];
  return [
    { name: 'Male', data: ageGraph.value.data.male },
    { name: 'Female', data: ageGraph.value.data.female },
    { name: 'Non-binary', data: ageGraph.value.data.gender_other },
    { name: 'Unknown', data: ageGraph.value.data.unknown }
  ];
});

const multiSalesColors: Record<string, string> = {
  youtube: '#FF0000',
  youtube_premium: '#000000',
  spotify: '#2DCE89',
  shopify: '#96BF48',
  soundcloud: '#FF8800',
  apple_music: '#f94c57',
  amazon_music: '#4512ff',
  facebook: '#4267B2',
  instagram: '#8A3AB9',
  tiktok: '#25F4EE',
  beatport: '#01FF95',
  deezer: '#EF5466',
  itunes: '#000000',
  pandora: '#00A0EE',
  traxsource: '#40A0FF'
};

const multiSalesChartOptions = computed(() => ({
  chart: {
    height: 400,
    type: 'line',
    toolbar: { show: false }
  },
  stroke: {
    width: 3, // 🔥 make lines thicker (default is 2)
    curve: 'smooth'
  },
  markers: {
    size: 4, // 🔥 visible dots on each data point
    strokeWidth: 2, // outline around the dot
    hover: { size: 6 } // enlarge when hovered
  },
  plotOptions: {
    bar: {
      columnWidth: '40%',
      borderRadius: 6
    }
  },
  dataLabels: { enabled: false },
  colors: ['#60A5FA', ...Object.values(multiSalesColors)],
  labels: multiSalesGraph.value?.labels || [],
  xaxis: {
    categories: multiSalesGraph.value?.labels || [],
    labels: {
      rotate: -45,
      style: { colors: '#64748b' }
    }
  },
  yaxis: {
    title: { text: '' },
    labels: { formatter: (v: number) => v.toLocaleString() }
  },
  legend: {
    position: 'top',
    horizontalAlign: 'left',
    markers: { radius: 6 }
  },
  tooltip: {
    y: { formatter: (val: number) => val.toLocaleString() }
  }
}));

const multiSalesChartSeries = computed(() => {
  if (!multiSalesGraph.value) return [];

  const series = [];

  // Bar (combined)
  if (multiSalesGraph.value.combined_sales?.data?.length) {
    series.push({
      name: 'Combined Sales',
      type: 'column',
      data: multiSalesGraph.value.combined_sales.data
    });
  }

  // Lines (stores)
  for (const [store, obj] of Object.entries(multiSalesGraph.value.store_sales || {}) as [string, { data: number[] }][]) {
    if (obj.data && obj.data.length) {
      series.push({
        name: store.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        type: 'line',
        data: obj.data,
        color: multiSalesColors[store] || '#999'
      });
    }
  }

  return series;
});
</script>

<template>
  <v-container fluid class="pa-6">
    <div v-if="loading" class="d-flex justify-center align-center" style="height: 70vh">
      <div class="music-loader"><span></span><span></span><span></span><span></span><span></span></div>
    </div>
    <template v-else>
      <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs" />
      <v-card elevation="4" class="mb-4 pa-4">
        <v-row align="center" justify="space-between" class="mb-2">
          <v-col cols="6">
            <h3 class="text-h3 font-weight-medium mb-0">Filters</h3>
          </v-col>

          <v-col cols="6" class="text-right">
            <v-btn
              color="secondary"
              variant="outlined"
              @click="
                selectedPeriod = 1;
                selectedStore = 'all';
                selectedLabel = 'all';
                selectedRelease = 'all';
                selectedTrack = 'all';
              "
            >
              Reset Filters
            </v-btn>
          </v-col>
        </v-row>
        <v-row dense align="center">
          <v-col cols="12" md="2">
            <v-select
              label="Period"
              v-model="selectedPeriod"
              :items="[
                { title: 'Last 7 Days', value: 1 },
                { title: 'Last 14 Days', value: 2 },
                { title: 'Last 30 Days', value: 3 },
                { title: 'Last 45 Days', value: 4 },
                { title: 'Last 60 Days', value: 5 },
                { title: 'Last 75 Days', value: 6 },
                { title: 'Last 90 Days', value: 7 }
              ]"
              item-title="title"
              item-value="value"
              density="compact"
              variant="outlined"
            />
          </v-col>

          <v-col cols="12" md="2">
            <v-select
              label="Store"
              v-model="selectedStore"
              :items="stores"
              item-title="name"
              item-value="id"
              density="compact"
              variant="outlined"
            />
          </v-col>

          <v-col cols="12" md="2">
            <v-select
              label="Label"
              v-model="selectedLabel"
              :items="labels"
              item-title="name"
              item-value="id"
              density="compact"
              variant="outlined"
            />
          </v-col>

          <v-col cols="12" md="3">
            <v-select
              label="Release"
              v-model="selectedRelease"
              :items="releases"
              item-title="name"
              item-value="id"
              density="compact"
              variant="outlined"
            />
          </v-col>

          <v-col cols="12" md="3">
            <v-select
              label="Track"
              v-model="selectedTrack"
              :items="allTracks"
              item-title="name"
              item-value="id"
              density="compact"
              variant="outlined"
            />
          </v-col>
        </v-row>
      </v-card>
      <v-card elevation="4" class="mb-4 pa-4">
        <v-row dense class="">
          <v-col cols="12">
            <v-card-title class="font-weight-bold pb-4"> Store-wise Sales </v-card-title>
            <v-card-text class="flex-grow-1 d-flex align-center justify-center">
              <apexchart
                v-if="multiSalesGraph"
                style="width: 100%"
                height="400"
                type="line"
                :options="multiSalesChartOptions"
                :series="multiSalesChartSeries"
              />
              <v-skeleton-loader v-else type="image" />
            </v-card-text>
          </v-col>
        </v-row>
      </v-card>
      <SalesMap :data="salesMapData" />
      <v-row dense class="mt-2">
        <!-- Gender Pie Chart -->
        <v-col cols="12" md="6">
          <v-card elevation="4" class="h-100 d-flex flex-column">
            <v-card-title class="font-weight-bold pb-4">Gender Distribution</v-card-title>
            <v-card-text class="flex-grow-1 d-flex align-center justify-center">
              <apexchart
                style="width: 100%"
                v-if="genderGraph"
                type="pie"
                height="350"
                :options="genderChartOptions"
                :series="genderChartSeries"
              />
              <v-skeleton-loader v-else type="image" />
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Age Bar Chart -->
        <v-col cols="12" md="6">
          <v-card elevation="4" class="h-100 d-flex flex-column">
            <v-card-title class="font-weight-bold pb-4">Age Distribution</v-card-title>
            <v-card-text class="flex-grow-1 d-flex align-center justify-center">
              <apexchart v-if="ageGraph" style="width: 100%" type="bar" height="350" :options="ageChartOptions" :series="ageChartSeries" />
              <v-skeleton-loader v-else type="image" />
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
      <v-row dense class="mt-4">
        <v-col cols="12">
          <v-card elevation="4">
            <v-card-title class="font-weight-bold">Top 10 Tracks</v-card-title>
            <v-data-table
              :headers="[
                { title: 'Artist', key: 'artist_name' },
                { title: 'Song/Mix Name', key: 'song_name' },
                { title: 'Number Of Sales', key: 'number_of_sales' }
              ]"
              :items="tracks"
              :loading="loading"
              class="elevation-1"
            />
          </v-card>
        </v-col>
      </v-row>
    </template>
  </v-container>
</template>
