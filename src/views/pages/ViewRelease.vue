<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { Icon } from '@iconify/vue';
import api from '@/utils/axios';

const trackLoading = ref(false);

const release = ref<any>(null);
const loading = ref(true);
const route = useRoute();
const tab = ref('details');

// track modal state
const selectedTrack = ref<any>(null);
const trackDialog = ref(false);

onMounted(async () => {
  const releaseId = route.params.id;
  try {
    const res = await api.get(`/view-release/${releaseId}`);
    release.value = res.data;
  } finally {
    loading.value = false;
  }
});

async function openTrack(trackId: number) {
  trackDialog.value = true;   // open immediately
  trackLoading.value = true;  // show loader
  try {
    const res = await api.get(`/tracks/${trackId}`);
    selectedTrack.value = res.data;
  } catch (e) {
    console.error('Error fetching track:', e);
  } finally {
    trackLoading.value = false; // stop loader
  }
}

</script>
<template>
  <v-container v-if="!loading && release" fluid class="pa-8">
    <v-row>
      <!-- LEFT SIDEBAR -->
      <!-- LEFT SIDEBAR -->
      <v-col cols="12" md="4">
        <v-card class="pa-6 rounded-2xl text-center" elevation="4">
          <v-img :src="release.artwork?.full_size || '/download.png'" class="rounded-xl mb-6" height="280" cover />

          <!-- Release Name -->
          <h2 class="text-h4 font-weight-bold mb-2">{{ release.name }}</h2>

          <!-- Artist(s) -->
        <p class="text-h6 text-primary font-weight-medium mb-4">
  {{ release.artists.map((a: any) => a.artist.name).join(', ') }}
</p>


          <!-- Status -->
          <v-chip
            :color="release.status === 'distributed' ? 'green' : 'orange'"
            variant="flat"
            size="large"
            class="mb-2 text-body-1 font-weight-bold"
          >
            {{ release.status }}
          </v-chip>
        </v-card>
      </v-col>

      <!-- RIGHT MAIN -->
      <v-col cols="12" md="8">
        <v-card class="rounded-2xl" elevation="4">
          <v-tabs v-model="tab" color="primary" align-tabs="start" grow>
            <v-tab value="details">Details</v-tab>
            <v-tab value="tracks">Tracks</v-tab>
            <v-tab value="qc">QC / Alerts</v-tab>
            <v-tab value="notes">Notes</v-tab>
          </v-tabs>

          <v-divider />

          <v-card-text class="pa-6">
            <v-window v-model="tab">
              <!-- DETAILS -->
              <v-window-item value="details">
                <v-row>
                  <v-col cols="6" class="d-flex flex-column gap-2">
                    <div><strong>ID:</strong> {{ release.id }}</div>
                    <div><strong>Catalogue:</strong> {{ release.catalogue_number }}</div>
                    <div><strong>UPC:</strong> {{ release.ean }}</div>
                    <div><strong>Release Version:</strong> {{ release.release_version || '-' }}</div>
                    <div><strong>Language:</strong> {{ release.language }}</div>
                    <div><strong>Label:</strong> {{ release.label?.name }}</div>
                    <div><strong>Publisher:</strong> {{ release.publisher }}</div>
                    <div><strong>Year:</strong> {{ release.publisher_year }}</div>
                    <div><strong>Copyright:</strong> {{ release.copyright_holder }} ({{ release.copyright_holder_year }})</div>
                    <div><strong>Genre:</strong> {{ release.genre }}</div>
                    <div><strong>Sub Genre:</strong> {{ release.subgenre }}</div>
                    <div><strong>Kind:</strong> {{ release.kind }}</div>
                  </v-col>

                  <v-col cols="6" class="d-flex flex-column gap-2">
                    <div><strong>Official Date:</strong> {{ release.official_date }}</div>
                    <div><strong>Original Date:</strong> {{ release.original_date }}</div>
                    <div><strong>Territory:</strong> {{ release.territory }}</div>
               
                    <div><strong>Auto Detect Lang:</strong> {{ release.auto_detect_language ? 'Yes' : 'No' }}</div>
                    <div><strong>Is New Release:</strong> {{ release.is_new_release ? 'Yes' : 'No' }}</div>
                    <div><strong>Release Date Passed:</strong> {{ release.release_date_passed ? 'Yes' : 'No' }}</div>
                    <div><strong>Backcatalog:</strong> {{ release.backcatalog ? 'Yes' : 'No' }}</div>
                    <div><strong>All Tracks Ready:</strong> {{ release.all_tracks_ready ? 'Yes' : 'No' }}</div>
                    <div><strong>Transferred:</strong> {{ release.transferred ? 'Yes' : 'No' }}</div>
                    <!-- <div><strong>Sub User:</strong> {{ release.sub_user || '-' }}</div> -->
                    <div><strong>Has Delivery Confirmations:</strong> {{ release.has_delivery_confirmations ? 'Yes' : 'No' }}</div>
                  
                   
                    <div><strong>YouTube Declaration:</strong> {{ release.youtube_declaration ? 'Yes' : 'No' }}</div>
                   
                    <div><strong>Dolby Atmos:</strong> {{ release.dolby_atmos ? 'Yes' : 'No' }}</div>
                  </v-col>
                </v-row>

                <v-divider class="my-4" />

                <div class="d-flex flex-column gap-2">
                 
                  <div><strong>ACR Alert:</strong> {{ release.has_acr_alert ? 'Yes' : 'No' }}</div>
                  <div><strong>Release User Declaration:</strong> {{ release.release_user_declaration ? 'Yes' : 'No' }}</div>
                </div>
              </v-window-item>

              <!-- TRACKS -->
               <v-window-item value="tracks">
                <v-table density="comfortable" class="elevation-1">
                  <thead>
                    <tr>
                      <th>Track</th>
                      <th>ISRC</th>
                    
                      <th>Length</th>
                      <th>QC</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="track in release.tracks" :key="track.id" class="hover:bg-grey-lighten-4">
                      <td class="font-weight-medium">{{ track.name }}</td>
                      <td>{{ track.ISRC }}</td>
                     
                      <td>{{ track.track_lenght }}</td>
                      <td>
                        <v-tooltip location="top">
                          <template #activator="{ props }">
                            <Icon
                              v-bind="props"
                              :icon="track.qc_passed ? 'mdi:check-circle' : 'mdi:alert-circle-outline'"
                              :color="track.qc_passed ? 'green' : 'red'"
                              width="20"
                            />
                          </template>
                          <span v-if="Object.keys(track.qc_feedback).length">
                            {{ track.qc_feedback }}
                          </span>
                          <span v-else>No QC Feedback</span>
                        </v-tooltip>
                      </td>
                      <td>
                        <Icon
                          icon="mdi:eye-outline"
                          width="22"
                          class="cursor-pointer text-gray-500 hover:text-primary transition"
                          @click="openTrack(track.id)"
                        />
                      </td>
                    </tr>
                  </tbody>
                </v-table>
              </v-window-item>


              <!-- QC -->
              <v-window-item value="qc">
                <div v-if="release.acr_alert">
                  <h4 class="text-subtitle-1 mb-4">ACR Scan Results</h4>
                  <v-table density="compact">
                    <thead>
                      <tr>
                        <th>Track</th>
                        <th>Match Title</th>
                        <th>Artist</th>
                        <th>Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="scan in release.acr_alert.scanned_tracks" :key="scan.id" class="hover:bg-grey-lighten-4">
                        <td>{{ scan.track_name }}</td>
                        <td>{{ scan.music_results[0]?.result?.title }}</td>
                        <td>{{ scan.music_results[0]?.result?.artists[0]?.name }}</td>
                        <td>{{ scan.music_results[0]?.result?.score }}%</td>
                      </tr>
                    </tbody>
                  </v-table>
                </div>

                <v-alert v-if="release.release_user_declaration" type="success" class="mt-6" border="start" variant="tonal">
                  <strong>Admin Message:</strong>
                  <p class="mb-0">{{ release.release_user_declaration.admin_message }}</p>
                </v-alert>
              </v-window-item>

              <!-- NOTES -->
              <v-window-item value="notes">
                <p class="text-body-2">
                  {{ release.notes || 'No notes available.' }}
                </p>
              </v-window-item>
            </v-window>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>

  <!-- LOADING -->
  <v-container v-else class="text-center pa-10">
    <v-progress-circular indeterminate color="primary" size="40" />
  </v-container>


  <!-- TRACK DETAIL MODAL -->
<v-dialog v-model="trackDialog" max-width="800px" persistent>
  <v-card class="rounded-xl elevation-8">
    <!-- Header -->
    <div class="pa-6 pb-4">
      <div class="d-flex align-center justify-space-between mb-2">
        <div>
          <h2 class="text-h5 font-weight-bold text-grey-darken-3 mb-1">
            {{ selectedTrack?.name || 'Track Details' }}
          </h2>
          <p class="text-body-2 text-grey mb-0">
            Track Information & Metadata
          </p>
        </div>
       <v-btn 
  variant="text" 
  size="small"
  class="text-grey"
  @click="trackDialog = false"
>
  <Icon icon="mdi:close" width="22" />
</v-btn>

      </div>
    </div>

    <v-divider />

    <v-card-text class="pa-0">
       <div v-if="trackLoading" class="d-flex align-center justify-center pa-10">
    <v-progress-circular indeterminate color="primary" size="40" />
  </div>
   <div v-else>
      <!-- Track Basics -->
      <div class="pa-6 pb-4">
        <h3 class="text-h6 font-weight-bold mb-4 text-grey-darken-2 d-flex align-center">
          <Icon icon="mdi:music-note" class="mr-2" />
          Track Information
        </h3>
        
        <v-row>
          <v-col cols="12" sm="6">
            <div class="mb-4">
              <div class="text-caption text-grey-darken-1 mb-1">ISRC CODE</div>
              <div class="font-weight-medium font-mono text-body-1">
                {{ selectedTrack?.ISRC || 'N/A' }}
              </div>
            </div>
            <div class="mb-4">
              <div class="text-caption text-grey-darken-1 mb-1">LANGUAGE</div>
              <div class="font-weight-medium">{{ selectedTrack?.language || 'N/A' }}</div>
            </div>
          </v-col>
          <v-col cols="12" sm="6">
            <div class="mb-4">
              <div class="text-caption text-grey-darken-1 mb-1">DURATION</div>
              <div class="font-weight-medium font-mono">{{ selectedTrack?.track_lenght || 'N/A' }}</div>
            </div>
            <div class="mb-4">
              <div class="text-caption text-grey-darken-1 mb-1">VOCAL TYPE</div>
              <div class="font-weight-medium">{{ selectedTrack?.vocals || 'Instrumental' }}</div>
            </div>
          </v-col>
        </v-row>

        <!-- Content Flags -->
        <div class="mb-4">
          <div class="text-caption text-grey-darken-1 mb-2">CONTENT FLAGS</div>
          <div class="d-flex flex-wrap gap-2">
            <v-chip
              :color="selectedTrack?.explicit_content ? 'error' : 'success'"
              size="small"
              variant="flat"
            >
              <Icon 
                :icon="selectedTrack?.explicit_content ? 'mdi:alert-octagon' : 'mdi:check-circle'" 
                class="mr-1" 
                size="14"
              />
              {{ selectedTrack?.explicit_content ? 'Explicit Content' : 'Clean' }}
            </v-chip>
          </div>
        </div>
      </div>

      <v-divider />

      <!-- Artists Section -->
      <div class="pa-6 pb-4" v-if="selectedTrack?.artists?.length">
        <h3 class="text-h6 font-weight-bold mb-4 text-grey-darken-2 d-flex align-center">
          <Icon icon="mdi:account-music" class="mr-2" />
          Artists
          <v-chip size="x-small" variant="text" class="ml-2">
            {{ selectedTrack.artists.length }}
          </v-chip>
        </h3>
        
        <div class="d-flex flex-wrap gap-2">
          <v-chip
            v-for="artist in selectedTrack.artists"
            :key="artist.id"
            color="primary"
            variant="tonal"
            size="default"
            class="ma-1"
          >
            <Icon icon="mdi:account" class="mr-2" size="16" />
            <strong>{{ artist.artist?.name || artist.artist }}</strong>
            <span class="ml-2 text-caption opacity-75">({{ artist.kind }})</span>
          </v-chip>
        </div>
      </div>

      <!-- Publishers Section -->
      <div class="pa-6 pb-4" v-if="selectedTrack?.publishers?.length">
        <v-divider class="mb-6" />
        <h3 class="text-h6 font-weight-bold mb-4 text-grey-darken-2 d-flex align-center">
          <Icon icon="mdi:office-building" class="mr-2" />
          Publishers
          <v-chip size="x-small" variant="text" class="ml-2">
            {{ selectedTrack.publishers.length }}
          </v-chip>
        </h3>
        
        <div class="space-y-3">
          <div 
            v-for="publisher in selectedTrack.publishers" 
            :key="publisher.id"
            class="d-flex align-center pa-3 rounded-lg bg-grey-lighten-5"
          >
            <Icon icon="mdi:domain" class="mr-3 text-grey" />
            <div class="flex-grow-1">
              <div class="font-weight-medium">{{ publisher.publisher?.name || 'Unknown Publisher' }}</div>
              <div class="text-body-2 text-grey">{{ publisher.author }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Contributors Section -->
      <div class="pa-6 pb-4" v-if="selectedTrack?.contributors?.length">
        <v-divider class="mb-6" />
        <h3 class="text-h6 font-weight-bold mb-4 text-grey-darken-2 d-flex align-center">
          <Icon icon="mdi:account-group" class="mr-2" />
          Contributors
          <v-chip size="x-small" variant="text" class="ml-2">
            {{ selectedTrack.contributors.length }}
          </v-chip>
        </h3>
        
        <div class="space-y-3">
          <div 
            v-for="contributor in selectedTrack.contributors" 
            :key="contributor.id"
            class="d-flex align-center pa-3 rounded-lg bg-grey-lighten-5"
          >
            <Icon icon="mdi:account-outline" class="mr-3 text-grey" />
            <div class="flex-grow-1">
              <div class="font-weight-medium">{{ contributor.contributor?.name || 'Unknown Contributor' }}</div>
              <div class="text-body-2 text-grey">{{ contributor.role?.name || 'Unknown Role' }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Copyright Section -->
      <div class="pa-6">
        <v-divider class="mb-6" />
        <h3 class="text-h6 font-weight-bold mb-4 text-grey-darken-2 d-flex align-center">
          <Icon icon="mdi:copyright" class="mr-2" />
          Rights & Copyright
        </h3>
        
        <v-card variant="outlined" class="pa-4 rounded-lg">
          <div class="d-flex align-center">
            <Icon icon="mdi:shield-account" class="mr-3 text-primary" size="24" />
            <div>
              <div class="font-weight-medium text-body-1">
                {{ selectedTrack?.copyright_holder || 'Not specified' }}
              </div>
              <div class="text-body-2 text-grey">
                Copyright Year: {{ selectedTrack?.copyright_holder_year || 'N/A' }}
              </div>
            </div>
          </div>
        </v-card>

        <!-- Preview Button (when uncommented) -->
        <!-- <v-btn
          v-if="selectedTrack?.resource"
          color="primary"
          variant="flat"
          size="large"
          class="mt-6 w-100"
          :href="selectedTrack.resource"
          target="_blank"
          rounded="lg"
        >
          <Icon icon="mdi:play-circle" class="mr-2" />
          Play Preview
        </v-btn> -->
      </div>
      </div>
    </v-card-text>

    <!-- Footer Actions -->
    <v-card-actions class="pa-6 pt-0">
      <v-spacer />
      <v-btn
        variant="outlined"
        color="grey"
        @click="trackDialog = false"
        rounded="lg"
      >
        Close
      </v-btn>
    </v-card-actions>
  </v-card>
</v-dialog>


</template>
