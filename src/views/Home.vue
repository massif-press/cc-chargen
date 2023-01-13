<template>
  <v-container>
    <v-card class="mb-2">
      <v-card-title class="font-weight-bold">What is this?</v-card-title>
      <v-card-text>
        The CC-Generator project is a temporary UI for an upcoming Comp/Con
        feature that will be available in the GM rebuild. It's reproduced here
        so people can use, contribute to, and provide feedback on these things
        without having to wait for the completion of the new C/C stuff.
      </v-card-text>

      <v-card-text>
        These generators produce basic output for a LANCER GM, used as a general
        starting point when creating a character, location, or faction. For more
        involved and detailed items, check the PREMADES tab above. Interested in
        contributing? Check the #COMP-CON channel in the official LANCER Discord
      </v-card-text>
    </v-card>

    <v-card class="mb-2">
      <v-card-title>how to contribute</v-card-title>
      <v-card-text class="px-8">data</v-card-text>
      <v-card-text class="px-8">code</v-card-text>
    </v-card>

    <v-card class="mb-2">
      <v-card-title>faq</v-card-title>
      <v-card-text class="px-8">faq</v-card-text>
    </v-card>
  </v-container>
</template>

<script lang="ts">
export default {
  name: 'home',
};
</script>
