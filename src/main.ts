import { createApp } from 'vue';
import { createPinia } from 'pinia';
import PrimeVue from 'primevue/config';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Paginator from 'primevue/paginator';
import App from './App.vue';
import { router } from './router';
import vuetify from './plugins/vuetify';
import '@/scss/style.scss';
import { PerfectScrollbarPlugin } from 'vue3-perfect-scrollbar';
import VueApexCharts from 'vue3-apexcharts';
import VueTablerIcons from 'vue-tabler-icons';
import 'primevue/resources/themes/saga-blue/theme.css';  // theme
import 'primevue/resources/primevue.min.css';            // core
import 'primeicons/primeicons.css';                      // icons
import 'primeflex/primeflex.css';                        // flex utilities
import { fakeBackend } from '@/utils/helpers/fake-backend';
import print from 'vue3-print-nb';
import Tag from 'primevue/tag';

const app = createApp(App);

fakeBackend();

app.use(router);
app.use(PerfectScrollbarPlugin);
app.use(createPinia());
app.use(VueTablerIcons);
app.use(print);
app.use(VueApexCharts);
app.use(vuetify);

// ✅ This is the missing line
app.use(PrimeVue);

// register PrimeVue components globally
app.component('DataTable', DataTable);
app.component('Column', Column);
app.component('Paginator', Paginator);
app.component('Tag', Tag);
app.mount('#app');
