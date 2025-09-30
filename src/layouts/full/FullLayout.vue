<script setup lang="ts">
import { RouterView } from 'vue-router';
import VerticalSidebarVue from './vertical-sidebar/VerticalSidebar.vue';
import VerticalHeaderVue from './vertical-header/VerticalHeader.vue';
import Customizer from './customizer/CustomizerPanel.vue';
import FooterPanel from './footer/FooterPanel.vue';
import { useCustomizerStore } from '../../stores/customizer';
const customizer = useCustomizerStore();
</script>

<template>
  <v-locale-provider>
    <v-app
      theme="PurpleTheme"
      :class="[customizer.fontTheme, customizer.mini_sidebar ? 'mini-sidebar' : '', customizer.inputBg ? 'inputWithbg' : '']"
    >
      <Customizer />
      <VerticalSidebarVue />
      <VerticalHeaderVue />

      <v-main>
        <v-container fluid class="page-wrapper">
          <div>
            <RouterView />
            <v-btn
              class="customizer-btn"
              size="large"
              icon
              variant="flat"
              color="secondary"
              @click.stop="customizer.SET_CUSTOMIZER_DRAWER(!customizer.Customizer_drawer)"
            >
              <SettingsIcon class="icon" />
            </v-btn>
          </div>
        </v-container>
        <v-container fluid class="pt-0">
          <div>
            <FooterPanel />
          </div>
        </v-container>
      </v-main>
    </v-app>
  </v-locale-provider>
</template>

<style>
/* put this in Artists.vue <style scoped> or global */
.music-loader {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  height: 80px;
}

.music-loader span {
  width: 6px;
  height: 20px;
  background: linear-gradient(180deg, #1db954, #1ed760);
  border-radius: 3px;
  animation: bounce 1s infinite ease-in-out;
}

.music-loader span:nth-child(2) {
  animation-delay: 0.2s;
}
.music-loader span:nth-child(3) {
  animation-delay: 0.4s;
}
.music-loader span:nth-child(4) {
  animation-delay: 0.6s;
}
.music-loader span:nth-child(5) {
  animation-delay: 0.8s;
}

@keyframes bounce {
  0%,
  100% {
    transform: scaleY(0.3);
  }
  50% {
    transform: scaleY(1);
  }
}
.p-paginator {
  display: block !important;
}
.p-paginator .p-dropdown {
  float: right !important;
}
.p-paginator .p-paginator-current {
  float: right !important;
}
.p-datatable-loading-overlay {
  background-color: rgb(255, 255, 255);
}
.badge {
  display: inline-block;
  padding: 13px 20px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: capitalize;
}
.badge-danger {
  background: #d93025;
  color: #ffffff;
}

.badge-warning {
  background: #e6a700;
  color: #ffffff;
}

.badge-success {
  background: #188038;
  color: #ffffff;
}

.badge-primary {
  background: #000a60; /* custom primary */
  color: #ffffff;
}

.badge-info {
  background: #006064;
  color: #ffffff;
}

.badge-secondary {
  background: #3f57bc; /* custom secondary */
  color: #ffffff;
}
.danger-tooltip {
  background-color: #fdecea !important; /* light red */
  color: #d93025 !important; /* danger red */
  font-size: 13px;
  padding: 6px 10px;
  border-radius: 6px;
}
.space-y-3 > * + * {
  margin-top: 0.75rem;
}

.font-mono {
  font-family: 'Roboto Mono', monospace;
}

.w-100 {
  width: 100%;
}
</style>
