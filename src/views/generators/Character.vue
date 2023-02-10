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
                background = null;
              "
            >
              <v-list-item-content>
                <v-list-item-title
                  class="text-button"
                  style="font-size: 13px !important"
                  v-text="s.name"
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
                v-for="(b, i) in society.backgrounds"
                :key="`ct_${i}`"
                :style="background === b ? 'color: #E040FB' : ''"
                @click="background = b"
              >
                <v-list-item-content>
                  <v-list-item-title
                    :class="`text-button ${
                      b.active ? '' : 'text-grey-darken-2'
                    }`"
                    style="font-size: 13px !important"
                    v-text="b.background"
                  />
                </v-list-item-content>
              </v-list-item>
            </v-list-item-group>
          </v-list>
          <v-btn
            variant="outlined"
            color="purple-lighten-1"
            size="x-small"
            block
            class="mt-2"
            href="https://forms.gle/waTzu9K1NYEjaWbAA"
            target="_blank"
            ><v-icon left>mdi-plus</v-icon>suggest new</v-btn
          >
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
                capitalize(society.name)
              }}</span
              ><i v-else class="px-2 text-disabled">select society</i>
              <span v-if="background" class="pl-1 text-h6">{{
                capitalize(background.background)
              }}</span
              ><i v-else class="px-2 text-disabled">select background</i>
            </div>
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn
              color="#E040FB"
              :disabled="
                !society || !background || (background && !background.active)
              "
              @click="getCharacter()"
              >generate</v-btn
            >
          </v-card-actions>
        </v-card>
        <v-card
          v-if="background && !background.active"
          variant="outlined"
          color="red-darken-4"
          class="my-2 mx-4"
        >
          <v-card-text>
            <v-row align="center">
              <v-col><v-divider /></v-col>
              <v-col cols="auto" class="mx-1"><b>NO DATA</b></v-col>
              <v-col><v-divider /></v-col>
            </v-row>
            <p
              class="text-grey-lighten-2 text-center mt-2"
              style="font-size: 1.2em"
            >
              CC-CHARGEN has no generator data for
              <v-chip size="small" class="text-button mx-1"
                >{{ society.name }} {{ background.background }}</v-chip
              ><br />would you like to
              <a href="https://forms.gle/waTzu9K1NYEjaWbAA" target="_blank"
                >suggest a few ideas?</a
              >
            </p>
          </v-card-text>
        </v-card>
        <v-tabs v-else v-model="outputTab">
          <v-tab value="rendered">Rendered</v-tab>
          <v-tab value="markdown">Markdown</v-tab>
          <v-tab value="html">HTML</v-tab>
        </v-tabs>
        <span v-if="background && !background.active" />
        <v-window v-else v-model="outputTab">
          <v-window-item value="rendered">
            <v-card variant="outlined">
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
          <v-row justify="end">
            <v-col cols="auto">
              <v-btn
                variant="outlined"
                color="purple-lighten-1"
                size="x-small"
                class="mt-2"
                href="https://forms.gle/waTzu9K1NYEjaWbAA"
                target="_blank"
                ><v-icon left>mdi-plus</v-icon>suggest generator data</v-btn
              >
            </v-col>
          </v-row>
        </v-window>

        <div v-show="history.length">
          <v-divider class="mt-6" />
          <div class="text-overline">History ({{ history.length }})</div>
          <v-alert
            v-for="(h, j) in history"
            :key="`history_item_${j}`"
            density="compact"
            class="ma-1"
            :color="historyActive === h ? 'purple-darken-4' : ''"
          >
            <v-row align="center">
              <v-col cols="auto">
                <span class="text-button">
                  {{ h.name }}
                </span>
              </v-col>
              <v-col />
              <v-col cols="auto"
                ><v-btn size="small" color="purple" @click="loadHistoryItem(h)"
                  >Load</v-btn
                ></v-col
              >
              <v-col cols="auto"
                ><v-btn size="small" color="purple" @click="exportItem(h)"
                  >Export</v-btn
                ></v-col
              >
              <v-col cols="auto" class="ml-5"
                ><v-btn
                  size="small"
                  color="red-darken-3"
                  @click="deleteHistoryItem(j)"
                  >Delete</v-btn
                ></v-col
              >
            </v-row>
          </v-alert>
          <v-row dense justify="end" class="mt-3">
            <v-col cols="auto">
              <v-btn
                size="x-small"
                variant="outlined"
                color="pink darken-2"
                @click="history = []"
              >
                Delete All
              </v-btn>
            </v-col>
          </v-row>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import * as templates from '../../assets/data/character/index';
import societies from './societies.json';
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
    societies: societies,
    society: '',
    background: '',
    historyActive: null,
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
    capitalize(str: string) {
      return str
        .split(' ')
        .map((s) => s.substring(0, 1).toUpperCase() + s.substring(1))
        .join(' ');
    },
    getCharacter() {
      this.loading = true;
      const res = Generate(this.society.name, this.background.background);

      this.outputRaw = res;

      this.outputHtml = this.converter.makeHtml(this.outputRaw);

      this.history.unshift({
        name: this.outputRaw.split('\n')[0].replaceAll('#', ''),
        data: this.outputRaw,
      });

      this.historyActive = this.history[0];

      this.loading = false;
    },
    exportItem(item) {
      const link = document.createElement('a');
      const file = new Blob([item.data], { type: 'text/plain' });

      // Add file content in the object URL
      link.href = URL.createObjectURL(file);

      // Add file name
      link.download = `${item.name.trim().replace(/ *\([^)]*\) */g, '')}.md`;

      // Add click event to <a> tag to save file.
      link.click();
      URL.revokeObjectURL(link.href);
    },
    loadHistoryItem(item) {
      this.outputRaw = item.data;
      this.outputHtml = this.converter.makeHtml(this.outputRaw);
      this.historyActive = item;
    },
    deleteHistoryItem(index) {
      this.history.splice(index, 1);
    },
  },
};
</script>

<style>
p {
  font-size: 1.15em;
  margin-top: 10px;
}
</style>
