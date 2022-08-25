<template>
  <v-container>
    <v-card color="grey darken-3">
      <v-card-text>
        These generators produce basic output for a LANCER GM, used as a general starting point when
        creating a character, location, or faction. For more involved and detailed items, check the
        PREMADES tab above. Interested in contributing? Check the #COMP-CON channel in the official
        LANCER Discord
      </v-card-text>
    </v-card>
    <v-row>
      <v-col cols="auto" style="max-width: 20vw">
        <v-item-group v-model="type" group mandatory>
          <v-item v-slot="{ active, toggle }">
            <v-btn
              small
              text
              :color="active ? 'purple accent-3' : ''"
              value="character"
              @click="toggle"
            >
              Character
            </v-btn>
          </v-item>

          <v-item v-slot="{ active, toggle }">
            <v-btn
              small
              text
              :color="active ? 'purple accent-3' : ''"
              value="location"
              @click="toggle"
            >
              Location
            </v-btn>
          </v-item>

          <v-item v-slot="{ active, toggle }">
            <v-btn
              small
              text
              :color="active ? 'purple accent-3' : ''"
              value="faction"
              @click="toggle"
            >
              Faction
            </v-btn>
          </v-item>

          <v-item v-slot="{ active, toggle }">
            <v-btn small text :color="active ? 'purple accent-3' : ''" value="gear" @click="toggle">
              Gear
            </v-btn>
          </v-item>

          <!-- <v-item v-slot="{ active, toggle }">
            <v-btn small text :color="active ? 'purple accent-3' : ''" value="hook" @click="toggle">
              Adventure Hook
            </v-btn>
          </v-item>
          <v-item v-slot="{ active, toggle }">
            <v-btn
              small
              text
              :color="active ? 'purple accent-3' : ''"
              value="pilot"
              @click="toggle"
            >
              Lancer
            </v-btn>
          </v-item> -->
        </v-item-group>
        <v-divider class="my-2" />
        <v-list dense>
          <v-list-item-group color="primary">
            <v-list-item
              v-for="(t, i) in characterTemplates"
              :key="`ct_${i}`"
              @click="getCharacter(t)"
            >
              <v-list-item-icon class="m-0 p-0">
                <v-icon size="28" v-text="'cci-pilot'" />
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title
                  class="text-button"
                  style="font-size: 13px!important"
                  v-text="t.name"
                />
              </v-list-item-content>
            </v-list-item>
          </v-list-item-group>
        </v-list>
      </v-col>
      <v-divider vertical />
      <v-col>
        <div class="caption">OUTPUT</div>
        <v-tabs v-model="outputTab">
          <v-tab>Rendered</v-tab>
          <v-tab>Markdown</v-tab>
          <v-tab>HTML</v-tab>
        </v-tabs>
        <v-tabs-items v-model="outputTab">
          <v-tab-item>
            <v-card>
              <v-card-text v-html="outputHtml" />
            </v-card>
          </v-tab-item>
          <v-tab-item>
            <v-textarea
              v-model="outputRaw"
              filled
              :loading="loading"
              placeholder="Select a generator template"
              hide-details
              auto-grow
              rows="20"
            />
          </v-tab-item>
          <v-tab-item>
            <v-textarea
              :value="outputHtml"
              filled
              :loading="loading"
              placeholder="Select a generator template"
              hide-details
              auto-grow
              rows="20"
            />
          </v-tab-item>
        </v-tabs-items>
        <v-row no-gutters justify="end">
          <v-col cols="auto"><v-btn x-small outlined color="primary darken-1">Export</v-btn></v-col>
        </v-row>

        <div v-show="history.length">
          <v-divider class="mt-6 mb-3" />
          <v-chip
            v-for="(h, j) in history"
            :key="`history_item_${j}`"
            small
            class="ma-1"
            close
            close-icon="mdi-close"
            @click="output = h.data"
            @click:close="history.splice(j, 1)"
          >
            {{ h.name }}
          </v-chip>
          <v-row dense justify="end">
            <v-col cols="auto">
              <v-btn x-small outlined color="error darken-2" @click="history = []">
                Delete All
              </v-btn>
            </v-col>
            <v-col cols="auto">
              <v-btn x-small outlined color="primary darken-1">Export All</v-btn>
            </v-col>
          </v-row>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { CharacterGenerator } from '@/logic/character/CharacterGenerator'
import CharacterTemplates from '@/assets/data/character/templates.json'
import showdown from 'showdown'

import Vue from 'vue'
export default Vue.extend({
  name: 'home',
  data: () => ({
    type: 'character',
    selected: null,
    outputRaw: '',
    outputHtml: '<i class="text--disabled">Select a generator template</i>',
    loading: false,
    outputTab: 0,
    history: [] as { name: string; data: string }[],
    converter: null,
  }),
  mounted() {
    this.converter = new showdown.Converter()
    this.converter.setOption('tables', true)
  },
  computed: {
    characterTemplates() {
      return CharacterTemplates
    },
  },
  methods: {
    async getCharacter(template: any) {
      this.loading = true
      this.outputRaw = await new CharacterGenerator().Generate(template)
      this.outputHtml = this.converter.makeHtml(this.outputRaw)
      this.history.push({ name: this.outputRaw.split(' ')[0], data: this.outputRaw })
      this.loading = false
    },
  },
})
</script>
