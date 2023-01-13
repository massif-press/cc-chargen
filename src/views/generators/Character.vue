<template>
  <v-container>
    <v-row>
      <v-col cols="auto" style="max-width: 20vw">
        <div class="text-overline">SOCIETY</div>
        <v-list dense>
          <v-list-item-group>
            <v-list-item
              v-for="(s, i) in societies"
              :key="`ct_${i}`"
              :style="society === s ? 'color: #E040FB' : ''"
              @click="
                society = s;
                background = '';
              "
            >
              <v-list-item-content>
                <v-list-item-title
                  class="text-button"
                  style="font-size: 13px !important"
                  v-text="s"
                />
              </v-list-item-content>
            </v-list-item>
          </v-list-item-group>
        </v-list>
      </v-col>
      <v-expand-x-transition>
        <v-col v-show="society" cols="auto" style="max-width: 20vw">
          <div class="text-overline">BACKGROUND</div>
          <v-list dense>
            <v-list-item-group color="primary">
              <v-list-item
                v-for="(b, i) in getBackground(society)"
                :key="`ct_${i}`"
                :style="background === b ? 'color: #E040FB' : ''"
                @click="background = b"
              >
                <v-list-item-content>
                  <v-list-item-title
                    class="text-button"
                    style="font-size: 13px !important"
                    v-text="b"
                  />
                </v-list-item-content>
              </v-list-item>
            </v-list-item-group>
          </v-list>
        </v-col>
      </v-expand-x-transition>
      <v-divider vertical />
      <v-col>
        <div class="caption">OUTPUT</div>

        <v-card>
          <v-card-text class="pb-0 pt-1">
            <div class="text-overline">TEMPLATE</div>
            <div>
              <span v-if="society" class="pl-1 text-h6">{{
                capitalize(society)
              }}</span
              ><i v-else class="px-2 text-disabled">select society</i>
              <span v-if="background" class="pl-1 text-h6">{{
                capitalize(background)
              }}</span
              ><i v-else class="px-2 text-disabled">select background</i>
            </div>
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn
              color="#E040FB"
              :disabled="!society || !background"
              @click="getCharacter()"
              >generate</v-btn
            >
          </v-card-actions>
        </v-card>

        <v-tabs v-model="outputTab">
          <v-tab value="rendered">Rendered</v-tab>
          <v-tab value="markdown">Markdown</v-tab>
          <v-tab value="html">HTML</v-tab>
        </v-tabs>
        <v-window v-model="outputTab">
          <v-window-item value="rendered">
            <v-card outlined>
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
        <v-row justify="end">
          <v-col cols="auto" class="mt-1"
            ><v-btn text size="small">Export</v-btn></v-col
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
import * as templates from '../../assets/data/character/index';
import showdown from 'showdown';
import Generate from '../../logic/CharacterGenerator';

export default {
  name: 'home',
  data: () => ({
    type: 'character',
    selected: null,
    outputRaw: '',
    outputHtml: '<i class="text-disabled">Select a generator template</i>',
    loading: false,
    outputTab: 0,
    history: [] as { name: string; data: string }[],
    converter: null,
    societies: ['baronic', 'cosmopolitan', 'diasporan'],
    society: '',
    background: '',
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
    getBackground() {
      switch (this.society) {
        case 'baronic':
          return ['noble'];
        case 'cosmopolitan':
          return ['celebrity', 'scholar'];
        default:
          return '';
      }
    },
    capitalize(str: string) {
      return str
        .split(' ')
        .map((s) => s.substring(0, 1).toUpperCase() + s.substring(1))
        .join(' ');
    },
    async getCharacter() {
      this.loading = true;
      const res = Generate(this.society, this.background);
      // const g = new Generator();
      // // g.LoadLibraryDir('character', 'lists');
      // const lib = new GeneratorLibrary(templates.cosmopolitan, templates.baron);
      // g.LoadLibrary(lib);

      // console.log(g);

      // // console.log(Generator.WeightedSelection(genders));

      // g.Generate(template);

      this.outputRaw = await res;

      this.outputHtml = this.converter.makeHtml(this.outputRaw);
      this.history.push({
        name: this.outputRaw.split(' ')[0],
        data: this.outputRaw,
      });

      this.loading = false;
    },
  },
};
</script>
