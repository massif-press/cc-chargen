<template>
  <v-container>
    <v-card color="grey darken-3">
      <v-card-text>
        These generators produce basic output for a LANCER GM, used as a general
        starting point when creating a character, location, or faction. For more
        involved and detailed items, check the PREMADES tab above. Interested in
        contributing? Check the #COMP-CON channel in the official LANCER Discord
      </v-card-text>
    </v-card>
    <v-tabs v-model="type" tile color="purple accent-2" grow>
      <v-tab> Character </v-tab>

      <v-tab disabled> Location </v-tab>

      <v-tab disabled> Faction </v-tab>

      <v-tab disabled> Gear </v-tab>

      <v-tab disabled> Ship </v-tab>

      <v-tab disabled> Lancer </v-tab>

      <v-tab disabled> Adventure Hook </v-tab>
    </v-tabs>
    <v-window v-model="type">
      <v-window-item>
        <character />
      </v-window-item>
    </v-window>
  </v-container>
</template>

<script lang="ts">
import Character from './generators/Character.vue';

export default {
  name: 'home',
  components: { Character },
  data: () => ({
    type: 0,
  }),
};
</script>

<style>
h2 {
  padding: 8px 0 0px 0;
}
</style>
