// src/composables/useDataTable.ts
import { ref, watch } from 'vue';
import api from '@/utils/axios';

export function useDataTable<T>(endpoint: string, perPage = 10) {
  const data = ref<T[]>([]);
  const loading = ref(false);
  const search = ref('');
  const page = ref(1);
  const total = ref(0);

  const fetchData = async () => {
    loading.value = true;
    try {
      const res = await api.get(endpoint, {
        params: {
          search: search.value,
          page: page.value,
          per_page: perPage
        }
      });

      // adapt response to your table
      if (res.data.results) {
        data.value = res.data.results;
        total.value = res.data.count;
      } else {
        // fallback if it's already Laravel-style
        data.value = res.data.data;
        total.value = res.data.meta?.total || 0;
      }
    } finally {
      loading.value = false;
    }
  };

  watch([search, page], fetchData, { immediate: true });

  return { data, loading, search, page, total, fetchData };
}
