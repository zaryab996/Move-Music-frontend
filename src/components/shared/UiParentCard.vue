<script setup lang="ts">
const props = defineProps({
  title: {
    type: String,
    default: ''
  }
});
</script>

<template>
  <v-card variant="flat">
    <v-card-item>
      <div class="w-100">
        <!-- ✅ If user provides custom title slot -->
        <slot name="title">
          <!-- ✅ Otherwise use default layout -->
          <div class="d-sm-flex align-center justify-space-between w-100">
            <v-card-title>{{ props.title }}</v-card-title>
            <slot name="action"></slot>
          </div>
        </slot>
      </div>
    </v-card-item>

    <v-divider></v-divider>

    <v-card-text>
      <slot />
    </v-card-text>
  </v-card>
</template>
