<template>
  <v-app>
    <v-app-bar app dense>
      <v-tabs v-model="tab" color="green lighten-2">
        <v-tab value="generator"> generator </v-tab>
        <v-tab value="premades"> premades </v-tab>
        <v-spacer />
        <v-tab value="faq"> faq </v-tab>
        <v-tab value="rawdata"> raw data </v-tab>
        <v-tab value="contributors"> contributors </v-tab>
      </v-tabs>
    </v-app-bar>
    <v-main>
      <v-window v-model="tab">
        <v-window-item value="generator">
          <generators />
        </v-window-item>
        <v-window-item value="premades">
          <premades />
        </v-window-item>
        <v-window-item value="faq">
          <faq />
        </v-window-item>
        <v-window-item value="rawdata"><raw-data /></v-window-item>
        <v-window-item value="contributors"><contributors /></v-window-item>
      </v-window>
      <v-container>
        <v-alert outlined prominent dense icon="mdi-help">
          <div class="font-weight-bold">What is this?</div>
          <div>
            The CC-Generator project is a temporary UI for an upcoming Comp/Con
            feature that will be available in the GM rebuild. It's reproduced
            here so people can use, contribute to, and provide feedback on these
            things without having to wait for the completion of the new C/C
            stuff.
          </div>
        </v-alert>
      </v-container>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import Generators from './views/Generators.vue';
import Premades from './views/Premades.vue';
import Contributors from './views/Contributors.vue';
import Faq from './views/FAQ.vue';
import RawData from './views/RawData.vue';

export default {
  name: 'App',
  components: { Generators, Premades, Faq, RawData, Contributors },
  data: () => ({
    tab: 'generator',
  }),
};
</script>
