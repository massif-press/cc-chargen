<template>
  <v-container>
    <v-row>
      <v-col cols="auto" style="max-width: 20vw">
        <div class="caption">TEMPLATE</div>
        <v-list dense>
          <v-list-item-group color="primary">
            <v-list-item
              v-for="(t, i) in characterTemplates"
              :key="`ct_${i}`"
              @click="getCharacter(t)"
            >
              <v-list-item-icon class="m-0 p-0">
                <!-- <v-icon size="28" v-text="'cci-pilot'" /> -->
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title
                  class="text-button"
                  style="font-size: 13px !important"
                  v-text="t.key"
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
          <v-tab value="rendered">Rendered</v-tab>
          <v-tab value="markdown">Markdown</v-tab>
          <v-tab value="html">HTML</v-tab>
        </v-tabs>
        <v-window v-model="outputTab">
          <v-window-item value="rendered">
            <v-card>
              <v-card-text v-html="outputHtml" />
            </v-card>
          </v-window-item>
          <v-window-item value="markdown">
            <v-textarea
              v-model="outputRaw"
              filled
              :loading="loading"
              placeholder="Select a generator template"
              hide-details
              auto-grow
              rows="20"
            />
          </v-window-item>
          <v-window-item value="html">
            <v-textarea
              :value="outputHtml"
              filled
              :loading="loading"
              placeholder="Select a generator template"
              hide-details
              auto-grow
              rows="20"
            />
          </v-window-item>
        </v-window>
        <v-row no-gutters justify="end">
          <v-col cols="auto"
            ><v-btn x-small outlined color="primary darken-1"
              >Export</v-btn
            ></v-col
          >
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
              <v-btn
                x-small
                outlined
                color="error darken-2"
                @click="history = []"
              >
                Delete All
              </v-btn>
            </v-col>
            <v-col cols="auto">
              <v-btn x-small outlined color="primary darken-1"
                >Export All</v-btn
              >
            </v-col>
          </v-row>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Generator } from '../../lib/generator';
import * as templates from '../../assets/data/character/index';
import showdown from 'showdown';
// import genders from '../../assets/data/character/genders.json';
import { GeneratorLibrary } from '../../lib/generatorLibrary';

export default {
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
    this.converter = new showdown.Converter();
    this.converter.setOption('tables', true);
  },
  computed: {
    characterTemplates() {
      return templates;
    },
  },
  methods: {
    async getCharacter(template: any) {
      this.loading = true;
      const g = new Generator();
      // g.LoadLibraryDir('character', 'lists');
      const lib = new GeneratorLibrary(templates.cosmopolitan, templates.baron);
      g.LoadLibrary(lib);

      console.log(g);

      // console.log(Generator.WeightedSelection(genders));

      g.Generate(template);

      // this.outputRaw = await new CharacterGenerator().Generate(template)
      // this.outputHtml = this.converter.makeHtml(this.outputRaw)
      // this.history.push({ name: this.outputRaw.split(' ')[0], data: this.outputRaw })
      this.loading = false;
    },
  },
};
</script>
