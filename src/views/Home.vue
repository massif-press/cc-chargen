<template>
  <v-container>
    <v-card class="mb-2">
      <v-card-title class="font-weight-bold">What is this?</v-card-title>
      <v-card-text>
        The CC-Generator project is a temporary UI for an upcoming COMP/CON
        feature that will be available in the GM rebuild. It's reproduced here
        so people can use, contribute to, and provide feedback on these things
        without having to wait for the completion of the new C/C stuff.
      </v-card-text>

      <v-card-text>
        These generators produce basic output for a LANCER GM, used as a general
        starting point when creating a character, location, or faction. For more
        involved and detailed items, check the PREMADES tab above.
      </v-card-text>

      <v-card-text>
        C/C CHARGEN is built off of
        <a href="https://gmgen.netlify.app/">gmgen</a>, an open-source "thing
        generator" available as an npm package.
      </v-card-text>
    </v-card>

    <v-card class="mb-2">
      <v-card-title>How to Contribute</v-card-title>
      <v-card-text class="px-8"
        >There are multiple ways to contribute to this project:

        <ul>
          <li>
            the project's
            <a href="https://github.com/massif-press/cc-chargen/discussions"
              >GitHub discussion board</a
            >
            (requires a github account)
          </li>
          <li>
            <a href="https://forms.gle/XaQ3CPDoqJ6CGurX6">Google Forms</a>
          </li>
        </ul>
      </v-card-text>
      <v-card-text class="px-8"
        >Some submission categories still need their infrastructure built. These
        will be opened soon (and an announcement will be made on the discord)<br />

        <v-alert
          class="my-2"
          icon="mdi-check"
          color="success"
          title="Characters"
          text="Submissions Open"
          variant="outlined"
        ></v-alert>

        <v-alert
          class="my-2"
          icon="mdi-wrench"
          color="grey"
          title="Locations"
          text="Opening Soon"
          variant="outlined"
        ></v-alert>

        <v-alert
          class="my-2"
          icon="mdi-wrench"
          color="grey"
          title="Locations"
          variant="outlined"
        ></v-alert>

        <v-alert
          class="my-2"
          icon="mdi-wrench"
          color="grey"
          title="Factions"
          variant="outlined"
        ></v-alert>

        <v-alert
          class="my-2"
          icon="mdi-wrench"
          color="grey"
          title="Gear"
          variant="outlined"
        ></v-alert>
        <v-alert
          class="my-2"
          icon="mdi-wrench"
          color="grey"
          title="Ships"
          variant="outlined"
        ></v-alert>
        <v-alert
          class="my-2"
          icon="mdi-wrench"
          color="grey"
          title="Lancers"
          variant="outlined"
        ></v-alert>
        <v-alert
          class="my-2"
          icon="mdi-wrench"
          color="grey"
          title="Adventure Hooks"
          variant="outlined"
        ></v-alert>
      </v-card-text>

      <v-card-text class="px-8"
        >Additionally, check the #COMP-CON channel in the official LANCER
        Discord for further info and discussions</v-card-text
      >
    </v-card>
  </v-container>
</template>

<script lang="ts">
export default {
  name: 'home',
};
</script>
