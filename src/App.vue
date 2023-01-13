<template>
  <v-app>
    <v-app-bar app dense>
      <v-tabs v-model="tab" color="purple accent-1 mt-1">
        <v-tab value="home"> home </v-tab>
        <v-tab value="generator"> generator </v-tab>
        <v-tab value="premades"> premades </v-tab>
        <v-tab value="contributors"> contributors </v-tab>
      </v-tabs>
      <v-spacer />
      <v-btn icon flat><v-icon size="large">mdi-github</v-icon></v-btn>
    </v-app-bar>
    <v-main>
      <v-window v-model="tab">
        <v-window-item value="home">
          <home />
        </v-window-item>
        <v-window-item value="generator">
          <generators />
        </v-window-item>
        <v-window-item value="premades">
          <premades />
        </v-window-item>
        <v-window-item value="contributors"><contributors /></v-window-item>
      </v-window>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import Home from './views/Home.vue';
import Generators from './views/Generators.vue';
import Premades from './views/Premades.vue';
import Contributors from './views/Contributors.vue';

export default {
  name: 'App',
  components: { Home, Generators, Premades, Contributors },
  data: () => ({
    tab: 'home',
  }),
};
</script>
