<template>
  <v-app>
    <v-app-bar app dense>
      <v-tabs v-model="tab" color="green lighten-2">
        <v-tab>
          generator
        </v-tab>
        <v-tab>
          premades
        </v-tab>
        <v-spacer />
        <v-tab>
          faq
        </v-tab>
        <v-tab>
          raw data
        </v-tab>
        <v-tab>
          contributors
        </v-tab>
      </v-tabs>
    </v-app-bar>
    <v-main>
      <v-tabs-items v-model="tab">
        <v-tab-item>
          <generators />
        </v-tab-item>
        <v-tab-item>
          <premades />
        </v-tab-item>
        <v-tab-item>
          <faq />
        </v-tab-item>
        <v-tab-item><raw-data /></v-tab-item>
        <v-tab-item><contributors /></v-tab-item>
      </v-tabs-items>
      <v-container>
        <v-alert outlined prominent dense icon="mdi-help">
          <div class="font-weight-bold">What is this?</div>
          <div>
            The CC-Generator project is a temporary UI for an upcoming Comp/Con feature that will be
            available in the GM rebuild. It's reproduced here so people can use, contribute to, and
            provide feedback on these things without having to wait for the completion of the new
            C/C stuff.
          </div>
        </v-alert>
      </v-container>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import Vue from 'vue'
import Generators from './views/Generators.vue'
import Premades from './views/Premades.vue'
import Contributors from './views/Contributors.vue'
import Faq from './views/FAQ.vue'
import RawData from './views/RawData.vue'

export default Vue.extend({
  name: 'App',
  components: { Generators, Premades, Faq, RawData, Contributors },
  data: () => ({
    tab: 0,
  }),
})
</script>
