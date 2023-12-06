<template>
  <div class="text-tile flex flex-col" :style="{ 'background-color': backgroundColor }">

    <div class="flex items-center">
      <img v-if="getIcon() !== null" :src="require(`@/assets/${getIcon()}`)" class="mr-1" style="height: 30px;">
      <div class="tile-title ">
        {{ this.name || this.id }}
      </div>
    </div>


    <div class="tile-info">
      <span v-for="(type, index) in types" :key="index">
        {{ type }}<span v-if="index < types.length - 1">, </span>
      </span>
    </div>

    <div v-if="details?.inLanguage" class="tile-info">
      <span v-for="(l, index) in details.inLanguage" :key="index">
        {{ first(l.name)?.['@value'] }}<span v-if="index < details.inLanguage.length - 1">, </span>
      </span>
    </div>

    <div v-if="Array.isArray(_memberOf) && _memberOf.length > 0" class="tile-langaue">
      <span>
        Member of:
      </span>
      <span v-for="(mO, index) in _memberOf" :key="mO['@id']">
        <a :href="'/collection?id=' + mO['@id'] + '&_crateId=' + encodeURIComponent(mO['@id'])">
          {{ first(mO.name)?.['@value'] || mO['@id'] }}
        </a>
        <span v-if="index < _memberOf.length - 1">, </span>
      </span>
    </div>

    <div v-if="Array.isArray(details.currentHolder) && details.currentHolder.length > 0" class="tile-langaue">
      <span v-for="(mO, index) in details.currentHolder" :key="mO['@id']">
        {{ first(mO.name)?.['@value'] || mO['@id'] }}
        <span v-if="index < details.currentHolder.length - 1">, </span>
      </span>
    </div>

    <div v-if="types && types.includes('RepositoryCollection')" class="tile-langaue">
      <span v-if="!isEmpty(subCollections)">Collections: {{ subCollections?.total }},&nbsp;</span>
      <span>Objects: {{ total }}&nbsp;</span>
      <span v-if="typeFile">Files: {{ typeFile?.['doc_count'] }}</span>
    </div>

    <div class="tile-info flex justify-end mt-auto pr-3">
      <a :href="href" class="no-underline text-black" style="border: 2px solid white; color:white; padding: 6px;">More</a>
    </div>
  </div>
</template>
<script>
import { first, merge, toArray, isEmpty, find, isUndefined, forEach } from 'lodash';
import SummariesCard from './cards/SummariesCard.component.vue';
import AggregationHelper from './helpers/AggregationHelper.component.vue';
import AggregationAsIcon from "./widgets/AggregationAsIcon.component.vue";
import { initSnip, toggleSnip } from "../tools";
import { v4 as uuid } from 'uuid';

export default {
  components: {
    SummariesCard,
    AggregationHelper,
    AggregationAsIcon
  },
  props: ['id', 'href', 'name', 'conformsTo', 'types', '_memberOf', 'root', 'highlight', 'parent', 'details', 'score', 'colorMap', 'icons'],
  data() {
    return {
      fields: this.$store.state.configuration.ui.main.fields || [],
      conformsToCollection: this.$store.state.configuration.ui.conformsTo?.collection,
      conformsToObject: this.$store.state.configuration.ui.conformsTo?.object,
      parentId: '',
      parentName: '',
      aggregations: this.$store.state.configuration.ui.aggregations,
      total: 0,
      members: [],
      typeFile: null,
      subCollections: [],
      licenses: this.$store.state.configuration.ui?.licenses || [],
      _uuid: uuid(),
      aggConfig: this.$store.state.configuration.ui.aggregations,
      backgroundColor: null,
    }
  },
  watch: {
    'types': {
      async handler() {
        await this.updateSummaries();
      },
      flush: 'post',
      immediate: true
    }
  },
  async mounted() {
    await this.updateSummaries();
    this.getBackgroundColor();
  },
  computed: {
    iconSrc() {
      // Computed property depends on the 'icon' data property
      return this.icon ? require(`@/assets/${this.icon}`) : null;
    },
  },
  methods: {
    first,
    toArray,
    isEmpty,
    getFilter({ field, id }) {
      const filter = {};
      filter[field] = [id];
      let filterEncoded = encodeURIComponent(JSON.stringify(filter));
      if (this.$route.query.f) {
        filterEncoded = this.mergeQueryFilters({ filters: this.$route.query.f, filter })
      }
      if (this.$route.query.q) {
        const searchQuery = `q=${this.$route.query.q}`;
        return `/search?${searchQuery}&f=${filterEncoded}`;
      } else {
        return `/search?f=${filterEncoded}`;
      }
    },
    mergeQueryFilters({ filters, filter }) {
      let decodedFilters = decodeURIComponent(filters);
      decodedFilters = JSON.parse(decodedFilters);
      const merged = merge(decodedFilters, filter);
      return encodeURIComponent(JSON.stringify(merged));
    },
    async updateSummaries() {
      let summaries;
      if (this.types && this.types.includes('RepositoryCollection')) {
        this.subCollections = await this.filter({
          '_memberOf.@id': [this.id],
          'conformsTo.@id': [this.conformsToCollection]
        });
        this.members = await this.filter({
          '_collectionStack.@id': [this.id],
          'conformsTo.@id': [this.conformsToObject]
        });
        summaries = await this.filter({
          '_collectionStack.@id': [this.id]
        });
      }
      if (this.types && this.types.includes('RepositoryObject')) {
        if (this.types.includes('RepositoryObject')) {
          summaries = await this.filter({
            '_parent.@id': [this.id]
          });
        }
      }
      this.aggregations = summaries?.aggregations;
      // Get the buckets to extract one value: File counts
      const buckets = summaries?.aggregations?.['@type']?.buckets;
      if (buckets) {
        this.typeFile = find(buckets, (obj) => obj.key === 'File');
      }
      this.total = this.members?.total;
      if (!this.descriptionSnipped) {
        initSnip({ selector: '#desc_' + this._uuid, lines: 3 });
      }
      this.loading = false;
    },
    //TODO: refactor this integrate to multi
    async filter(filters) {
      const items = await this.$elasticService.multi({
        filters: filters,
        sort: 'relevance',
        order: 'desc'
      });
      if (items?.hits?.hits.length > 0) {
        return {
          data: items?.hits?.hits,
          aggregations: items?.aggregations,
          total: items.hits?.total.value,
          scrollId: items?._scroll_id,
          route: null
        }
      }
    },
    getBackgroundColor() {
      if (this.colorMap) {
        this.backgroundColor = this.colorMap.map['default'];
        if (this.details.category) {
          this.backgroundColor = this.colorMap.map[this.details.category[0]['@id']]
        }
      }
    },
    getIcon() {
      let iconMap = this.icons.map;
      for (const type of this.types) {
        if (iconMap.hasOwnProperty(type)) {
          return iconMap[type];
        }
      }
      return null;
    },
  }
}
</script>

<style>
a {
  text-decoration: underline;
}

.text-tile {
  flex: 1;
  max-width: calc(20% - 30px);
  min-width: calc(18% - 30px);
  color: white;
  font-family: Apercu, sans-serif;
  padding: 20px 10px;
  line-height: 120%;
  border: 2px solid black;
}

.text-tile div:not(:last-child) {
  margin-bottom: 15px;
}

.text-tile .tile-title {
  font-family: Antwerp, Georgia, serif;
  font-size: 26px;
  font-style: italic;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 120%;
}


.text-tile .tile-info {
  font-size: 1.2em;
}

/* Media Queries for different widths */

@media (max-width: 2000px) {
  .text-tile {
    max-width: calc(25% - 30px);
    min-width: calc(25% - 30px);
    /* 2 tiles per row */
  }
}

@media (max-width: 1500px) {
  .text-tile {
    max-width: calc(33.33% - 30px);
    min-width: calc(33.33% - 30px);
    /* 2 tiles per row */
  }
}


@media (max-width: 1200px) {
  .text-tile {
    max-width: calc(50% - 30px);
    min-width: calc(50% - 30px);
    /* 2 tiles per row */
  }
}

@media (max-width: 900px) {
  .text-tile {
    max-width: calc(100% - 30px);
    min-width: calc(100% - 30px);
    /* 1 tiles per row */
  }
}</style>