<template>
  <v-container>
    <v-card class="mb-2">
      <v-card-title>Premade Contributors</v-card-title>
      <v-card-text>
        <i>None yet!</i>
      </v-card-text>
    </v-card>

    <v-card class="mt-2">
      <v-card-title>Data Contributors</v-card-title>
      <v-card-subtitle>Data Contributors</v-card-subtitle>
      <v-card-text>
        <v-alert
          v-for="c in dataContributors"
          :key="c.name"
          :color="c.color"
          variant="outlined"
          density="compact"
        >
          <v-row dense>
            <v-col cols="auto">
              <v-avatar size="x-large">
                <v-img :src="c.icon" :alt="c.name"></v-img>
              </v-avatar>
            </v-col>
            <v-col class="ml-2">
              <v-row align="center" justify="space-between">
                <v-col cols="auto">
                  <span class="text-h6" v-text="c.name" />
                </v-col>

                <v-col cols="auto">
                  <v-chip
                    class="ml-4"
                    variant="outlined"
                    v-text="`${c.contributions} Contributions`"
                  /> </v-col
              ></v-row>
              <v-row dense>
                <v-col cols="auto">
                  <v-chip-group inline>
                    <v-chip
                      size="small"
                      v-text="c.discord"
                      @click="
                        wOpen(`https://discordapp.com/users/${c.discord}`)
                      "
                    />
                    <v-chip
                      size="small"
                      v-text="`@${c.twitter}`"
                      @click="wOpen(`https://twitter.com/${c.twitter}`)"
                    />
                  </v-chip-group>
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </v-alert>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script lang="ts">
export default {
  name: 'home',
  data: () => ({
    dataContributors: [
      {
        name: 'beef',
        icon: 'https://pbs.twimg.com/profile_images/1123993702425350144/OD4BlOya_400x400.png',
        twitter: 'jarena2',
        discord: 'beeftime#0558',
        contributions: `99+`,
        color: 'orange',
      },
    ],
  }),
  methods: {
    wOpen(url) {
      window.open(url, '_blank', 'noreferrer');
    },
  },
};
</script>
