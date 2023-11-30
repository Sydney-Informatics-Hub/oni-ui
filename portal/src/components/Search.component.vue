<template>
  <el-row :gutter="0" :offset="0">
    <el-col :xs="24" :sm="9" :md="9" :lg="5" :xl="5" :offset="0" class="h-full overflow-y-auto flex flex-col"
      id="search_aggregation" style="padding-top: 1rem">
      <div v-show="!advancedSearch" class="flex-1 w-full min-w-full bg-white rounded ">
        <search-bar ref='searchBar' @populate='populate' :searchInput="searchInput" @search="search" :clearSearch="clear"
          :filters="this.filters" :fields="searchFields" class="grow justify-items-center items-center m-4"
          @advanced-search="enableAdvancedSearch" :enableAdvancedSearch="advancedSearch"
          @updateSearchInput="onInputChange" @basicSearch="updateRoutes" />

        <el-row :justify="'center'" :gutter="20" :align="'middle'" class="pb-2">
          <el-button-group class="mr-1">
            <el-button @click="clearFilters()"
              :style="{ 'background': this.$store.state.configuration.ui.button.backgroundColor }">Reset</el-button>
          </el-button-group>
        </el-row>

      </div>
      <!-- <div class="flex-1 w-full min-w-full bg-white mt-4 mb-4 border-b-2">
        <div class="py-3 px-2">
          <div class="">
            <p class="text-xl text-gray-600 dark:text-gray-300 font-semibold py-1 px-2">
              Filters
            </p>
          </div>
        </div>
      </div> -->
      <div class="pt-2">
        <div class="flex w-full" v-for="aggs of aggregations" :key="aggs.name">
          <ul v-if="aggs?.buckets?.length > 0 && !aggs['hide']" class="flex-1 w-full min-w-full bg-white p-2"
            style="border-top: 2px solid black; border-bottom: 2px solid black;">
            <li @click="aggs.active = !aggs.active"
              class="hover:cursor-pointer py-3 flex md:flex md:flex-grow flex-row justify-between space-x-1">
              <span class="text-xl text-gray-600 dark:text-gray-300 font-semibold py-1 px-2">
                {{ aggs.display }}
                <el-tooltip v-if="aggs.help" class="box-item" effect="light" trigger="hover" :content="aggs.help"
                  placement="top">
                  <el-button link>
                    <font-awesome-icon icon="fa-solid fa-circle-info" />
                  </el-button>
                </el-tooltip>
              </span>
              <span class="py-1 px-2">
                <font-awesome-icon v-if="aggs.active" icon="fa fa-chevron-up" />
                <font-awesome-icon v-else="aggs.active" icon="fa fa-chevron-down" />
              </span>
            </li>
            <li v-if="aggs?.buckets?.length <= 0" class="w-full min-w-full">&nbsp;</li>
            <search-aggs :buckets="aggs.buckets" :aggsName="aggs.name" :ref="aggs.name" v-show="aggs.active"
              @is-active="aggs.active = true" @changed-aggs="newAggs" />
          </ul>
        </div>
      </div>
      <el-row v-show="changedFilters" class="bg-white rounded m-4 p-4 px-8 shadow-md border" role="alert"
        style="bottom: 16px; z-index: 2044; position: fixed">
        <el-row class="p-2">
          <div class="w-full">
            <el-button-group class="self-center">
              <el-button @click="clearFilters()">Clear Filters</el-button>
              <el-button type="warning" @click="updateRoutes({ updateFilters: true })">Apply Filters</el-button>
            </el-button-group>
          </div>
        </el-row>
      </el-row>
    </el-col>
    <el-col :xs="24" :sm="15" :md="15" :lg="19" :xl="19" :offset="0" class="overflow-y-auto flex flex-row p-7"
      id="search_results" style="border-left: 2px solid black;overflow: initial;">

      <div v-show="advancedSearch" id="advanced_search_box"
        class="flex-1 w-full min-w-full bg-white rounded mt-4 mb-4 shadow-md border">
        <search-advanced :advancedSearch="advancedSearch" :fields="searchFields" @basic-search="basicSearch"
          @do-advanced-search="updateRoutes" :resetAdvancedSearch="resetAdvancedSearch" />
      </div>

      <div class="top-20 z-10 bg-white pb-5" style="margin-left: 2%; font-size: 17px;">

        <div class="flex" style="justify-content: space-between;">

          <div class="flex">
            <span id="total_results" class="my-1" v-show="this.totals['value']"><span>{{ this.totals['value']
            }} results</span></span>

            <div style="padding-top: 4px;">
              <label class="radio pl-2" v-for="viewKey in viewKeys" :key="viewKey">
                <input type="radio" :name="`typeFilter-${viewKey}`" @click="switchView(viewKey)"
                  :checked="currentView === viewKey">
                <span class="label-body pl-1">{{ viewKey.charAt(0).toUpperCase() + viewKey.slice(1) }}</span>
              </label>
            </div>
          </div>

          <div v-if="currentView === 'list'" class="flex mr-3">
            <img v-for="option in viewConfig.options.list.options" :key="option.name"
              :src="require(`@/assets/${option.icon}`)" @click="switchSubView('list', option.name)"
              :class="{ active: currentListView === option.name }" style="width: 40px; height: 40px; cursor: pointer;">
          </div>

          <div v-else-if="currentView === 'map'" class="flex mr-3">
            <img v-for="option in viewConfig.options.map.options" :key="option.name"
              :src="require(`@/assets/${option.icon}`)" @click="switchSubView('map', option.name)"
              :class="{ active: currentMapView === option.name }" style="width: 40px; height: 40px; cursor: pointer;">
          </div>

        </div>

        <!-- <el-row :align="'middle'" class="pb-2 border-0 text-2xl pt-1">
          <el-button-group class="mr-1">
            <el-button type="warning" v-show="changedFilters" @click="updateRoutes({ updateFilters: true })">Apply
              Filters
            </el-button>
          </el-button-group>
          <span class="my-1 mr-1" v-show="!changedFilters" v-if="!isEmpty(this.filters)">Filtering by:</span>
          <el-button-group v-show="!changedFilters" class="my-1 mr-2" v-for="(filter, filterKey) of this.filters"
            :key="filterKey" v-model="this.filters">
            <el-button plain>{{ clean(filterKey) }}</el-button>
            <el-button v-if="filter && filter.length > 0" v-for="f of filter" :key="f" color="#626aef" plain
              @click="this.updateFilters({ clear: { f, filterKey } })" class="text-2xl">
              {{ clean(f) }}
              <el-icon class="el-icon--right">
                <CloseBold />
              </el-icon>
            </el-button>
          </el-button-group>
          <el-button-group class="mr-1">
            <el-button v-show="!isEmpty(this.filters)" @click="clearFilters()">Clear Filters</el-button>
          </el-button-group>
          <span id="total_results" class="my-1 mr-2" v-show="this.totals['value']"><span>{{ this.totals['value']
          }} results</span></span>
        </el-row> -->
        <el-row v-if="currentView === 'list'" class="pt-2">
          <el-col :span="24" class="flex space-x-4">

            <div v-show="currentListView !== 'table'">
              <el-button-group class="my-1">
                <el-button type="default" v-on:click="this.resetSearch" :style="{ 'background' : this.$store.state.configuration.ui.button.backgroundColor }">Reset sort</el-button>
              </el-button-group>
              <el-select v-model="selectedSorting" @change="sortResults" class="my-1 ml-2">
                <template #prefix>Sort by:</template>
                <el-option v-for="item in sorting" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
              <el-select v-model="selectedOrder" @change="orderResults" class="my-1 ml-2">
                <template #prefix>Order by:</template>
                <el-option v-for="item in ordering" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </div>

            <el-button-group class="my-1">
              <el-button type="default" v-on:click="this.downloadCSV" :style="{ 'background' : this.$store.state.configuration.ui.button.backgroundColor }">Download CSV</el-button>
            </el-button-group>

          </el-col>
        </el-row>
      </div>

      <div v-if="viewConfig.options['map'] && currentView === 'map'" class="map-view" style="padding-left: 6%;">
        <div v-show="journeyLatlngs.length > 0 && currentMapView === 'journey'">
          <MappableLocation :key="mapKey" :latlngs="journeyLatlngs" mapType="journey" height="80vh" width="96%" />
        </div>
        <div v-show="latlngs.length > 0 && currentMapView === 'cluster'">
          <MappableLocation :key="mapKey" :latlngs="latlngs" mapType="cluster" height="80vh" width="96%" />
        </div>
        <div v-show="dateLatlngs.length > 0 && currentMapView === 'timeline'">
          <MappableLocation :key="mapKey" :latlngs="dateLatlngs" mapType="timeline" height="80vh" width="96%" />
        </div>
      </div>

      <div v-show="viewConfig.options['list'] && currentView === 'list'" class="list-view">
        <div v-show="currentListView === 'tile'" class="archive-list">
          <template v-for="item of this.items" :key="item._id" class="mb-4">
            <SearchTile v-if="item._source" :id="item._source['@id']" :href="getSearchDetailUrl(item)"
              :name="first(item._source.name)?.['@value'] || first(first(item._source.identifier)?.value)?.['@value']"
              :conformsTo="item.conformsTo" :types="item._source?.['@type']" :_memberOf="item._source?._memberOf"
              :highlight="item?.highlight" :root="item._source?._root" :parent="item._source?._parent"
              :aggregations="aggregations" :details="item._source" :score="item._score"
              :colorMap="viewConfig.options.list.options[0].color" />
          </template>
        </div>

        <div v-show="currentListView === 'table'" class="table-list mb-6">
          <SearchTable :items="allItems" :properties="getViewProperties('list', 'table', 'properties')"
            :pageSize="getViewProperties('list', 'table', 'pageSize')" :allItem="allItems" />
        </div>

        <div v-show="currentListView === 'detail'">
          <template v-for="item of this.items" :key="item._id" class="mb-4">
            <search-detail-element v-if="item._source" :id="item._source['@id']" :href="getSearchDetailUrl(item)"
              :name="first(item._source.name)?.['@value'] || first(first(item._source.identifier)?.value)?.['@value']"
              :conformsTo="item.conformsTo" :types="item._source?.['@type']" :_memberOf="item._source?._memberOf"
              :highlight="item?.highlight" :root="item._source?._root" :parent="item._source?._parent"
              :aggregations="aggregations" :details="item._source" :score="item._score" />
          </template>
        </div>

        <div v-show="currentListView !== 'table'" class="py-2 w-full" style="margin-left: 4%;">
          <el-pagination class="items-center w-full" background layout="prev, pager, next" :total="totals['value']"
            v-model:page-size="pageSize" @update:page-size="pageSize" v-model:currentPage="currentPage"
            @current-change="updatePages($event, 'total_results')"  />
        </div>
      </div>

      <div v-loading="loading" v-if="!this.items.length > 0">
        <el-row class="pb-4 items-center">
          <h5 class="mb-2 text-2xl tracking-tight dark:text-white">
            <span v-if="!loading">No items found</span>
          </h5>
        </el-row>
        <el-row>
          <p class="text-center">
            <el-button type="primary" v-on:click="this.resetSearch">RESTART SEARCH</el-button>
          </p>
        </el-row>
      </div>
      <el-row v-if="noMoreResults" class="flex justify-center p-6">
        <h5 class="mb-2 text-1xl tracking-tight dark:text-white">
          No more items found with that filter or search query
        </h5>
      </el-row>
    </el-col>
  </el-row>

  <el-dialog v-model="errorDialogVisible" width="40%" center>
    <el-alert title="Error" type="warning" :closable="false">
      <p class="break-normal">{{ this.errorDialogText }}</p>
    </el-alert>
    <template #footer>
      <span class="dialog-footer">
        <el-button type="primary" @click="errorDialogVisible = false">Close</el-button>
      </span>
    </template>
  </el-dialog>
</template>


<script>

import { first, last, isEmpty, orderBy, toArray, find, isUndefined } from 'lodash';
import { CloseBold } from "@element-plus/icons-vue";
import { defineAsyncComponent, toRaw } from "vue";
import SearchDetailElement from './SearchDetailElement.component.vue';
import SearchTable from './SearchTable.component.vue';
import SearchTile from './SearchTile.component.vue';
import SearchAggs from './SearchAggs.component.vue';
import { putLocalStorage, getLocalStorage, removeLocalStorage } from '@/storage';
import SearchAdvanced from "./SearchAdvanced.component.vue";
import { readValue } from "@/generalFunctions";
import { v4 as uuid } from 'uuid';

export default {
  components: {
    SearchBar: defineAsyncComponent(() =>
      import("@/components/SearchBar.component.vue")
    ),
    MappableLocation: defineAsyncComponent(() =>
      import('@/components/MappableLocation.component.vue')
    ),
    SearchAdvanced,
    SearchDetailElement,
    SearchTable,
    SearchTile,
    CloseBold,
    SearchAggs
  },
  data() {
    return {
      searchInput: '',
      items: [],
      allItems: [],
      latlngs: [],
      journeyLatlngs: [],
      dateLatlngs: [],
      currentView: '',
      currentListView: '',
      currentMapView: '',
      mapKey: 0,
      totals: {},
      pageSize: 36,
      currentPage: 1,
      more: false,
      aggregations: {},
      memberOfBuckets: [],
      filters: {},
      clear: false,
      filterButton: [],
      loading: false,
      top: {},
      showTopCollections: false,
      showRepositoryCollections: false,
      collections: [],
      collectionTotals: 0,
      isStart: false,
      newSearch: true,
      isBrowse: false,
      errorDialogVisible: false,
      errorDialogText: '',
      conformsToNotebook: this.$store.state.configuration.ui.conformsTo?.notebook,
      noMoreResults: false,
      searchFields: this.$store.state.configuration.ui.searchFields,
      sorting: [
        { value: 'relevance', label: 'Relevance' },
        { value: '_isTopLevel.@value.keyword', label: 'Collections' },
        { value: 'name.@value.keyword', label: 'Title' },
        { value: 'inLanguage.name.@value.keyword', label: 'Language' },
      ],
      selectedSorting: null,
      defaultSorting: { value: 'relevance', label: 'Relevance' },
      ordering: [
        { value: 'asc', label: 'Ascending' },
        { value: 'desc', label: 'Descending' }
      ],
      selectedOrder: { value: 'desc', label: 'Descending' },
      searchFrom: 0,
      selectedOperation: 'must',
      changedFilters: false,
      advancedSearch: false,
      advancedQueries: null,
      resetAdvancedSearch: false,
      viewConfig: this.$store.state.configuration.ui.view,
      csvHeader: {},
      csvConfig: this.$store.state.configuration.ui.csv,
    };
  },
  watch: {
    async '$route.query'() {
      this.loading = true;
      if (this.$route.query.s) {
        this.isStart = true;
        this.resetSearch();
      } else {
        await this.updateFilters({});
        this.onInputChange(this.$route.query.q);
        this.currentPage = 1;
        if (this.$route.query.a) {
          this.updateAdvancedQueries();
        }
        await this.search();
        await this.searchAll();
        this.mapKey++;
      }
      this.loading = false;
    }
  },
  async created() {
    this.isStart = true;
    await this.updateFilters({});
    if (this.$route.query.q) {
      this.searchInput = this.$route.query.q;
    }
    if (this.$route.query.a) {
      this.updateAdvancedQueries();
    } else {
      this.advancedSearch = false;
      removeLocalStorage({ key: 'advancedQueries' });
    }
    this.loading = true;
    await this.search();
    await this.searchAll();
    this.loading = false;
    putLocalStorage({ key: 'lastRoute', data: this.$route.fullPath });
  },
  async mounted() {
    this.currentView = this.viewConfig.default;
    this.currentListView = this.viewConfig.options?.list?.default;
    this.currentMapView = this.viewConfig.options?.map?.default;

    await this.updateFilters({});
    if (this.$route.query.o) {
      this.selectedOperation = this.$route.query.o;
    }
    if (!this.$route.query.sf) {
      this.searchFields = this.$store.state.configuration.ui.searchFields;
    }
    if (this.$route.query.a) {
      this.updateAdvancedQueries()
    } else {
      this.advancedSearch = false;
    }
  },
  async updated() {
    if (this.$route.query.q) {
      this.advancedSearch = false;
    }
    // await this.updateFilters({});
    putLocalStorage({ key: 'lastRoute', data: this.$route.fullPath });
  },
  methods: {
    toArray,
    first,
    isEmpty,
    isUndefined,
    async updateFilters({ clear, empty }) {
      try {
        // updating filters from command
        if (clear?.f && clear?.filterKey) {
          if (this.filters[clear.filterKey]) {
            this.filters[clear.filterKey].splice(this.filters[clear.filterKey].indexOf(clear.f), 1);
            if (isEmpty(this.filters[clear.filterKey])) {
              delete this.filters[clear.filterKey];
            }
            //if there is an update on the filter the site will do another search.
            await this.updateRoutes({ updateFilters: true });
          }
        } else {
          // or updating filters from routes
          if (isEmpty(this.$route.query.f)) {
            this.filters = {};
          } else {
            let filterQuery;
            const filters = decodeURIComponent(this.$route.query.f);
            filterQuery = JSON.parse(filters);
            this.filters = {};
            for (let [key, val] of Object.entries(filterQuery)) {
              this.filters[key] = val;
              if (this.filters[key].length === 0) {
                delete this.filters[key];
              }
            }
          }
        }
      } catch (e) {
        console.error(e);
      }
    },
    async updateRoutes({ queries, updateFilters }) {
      let filters;
      const query = {};
      let localFilterUpdate = false;
      if (!isEmpty(this.filters) || updateFilters) {
        filters = toRaw(this.filters);
        filters = encodeURIComponent(JSON.stringify(filters));
        query.f = filters;
        localFilterUpdate = true;
      } else {
        delete query.f;
      }
      if (this.$route.query.f && !localFilterUpdate) {
        query.f = this.$route.query.f;
      }
      let localSearchGroupUpdate = false;
      if (queries?.searchGroup) {
        this.advancedQueries = queries;
        delete query.q;
        query.a = queries.searchGroup;
        this.currentPage = 1;
        //this.selectedSorting = this.sorting[0];
        localSearchGroupUpdate = true;
      }
      if (this.$route.query.a && !localSearchGroupUpdate) {
        query.a = this.$route.query.a;
        delete query.q;
        this.updateAdvancedQueries();
      } else {
        this.advancedQueries = null; //clear advanced search
        query.q = this.searchInput;
      }
      query.r = uuid();
      await this.$router.push({ path: 'search', query, replace: true });
    },
    updateAdvancedQueries() {
      this.advancedSearch = true;
      let searchGroup;
      try {
        searchGroup = JSON.parse(decodeURIComponent(this.$route.query.a));
      } catch (e) {
        throw new Error('There was a problem with your advanced query please try again');
      }
      let queryString = this.$elasticService.queryString(searchGroup);
      this.advancedQueries = { queryString, searchGroup };
    },
    async bucketSelected({ checkedBuckets, id }) {
      // this.filters[id] = checkedBuckets.map((k) => {
      //   return {key: k}
      // });
      this.filters[id] = checkedBuckets;
      await this.updateRoutes({ updateFilters: true });
    },
    populate({ items, newSearch, aggregations }) {
      this.items = [];
      if (newSearch) {
        this.newSearch = true;

      }
      if (items?.['hits']) {
        const thisItems = items['hits']['hits'];
        this.totals = items['hits']['total'];
        if (thisItems.length > 0) {
          for (let item of thisItems) {
            this.items.push(item);
          }
          this.more = true;
        } else {
          this.more = false;
        }
      }
      if (items?.['aggregations']) {
        this.aggregations = this.populateAggregations(items['aggregations']);
        this.memberOfBuckets = items['aggregations']?.['_memberOf.name.@value'];
      }
    },
    populateAggregations(aggregations) {
      const a = {};
      //Note: below is converted to an ordered array not an object.
      const aggInfo = this.$store.state.configuration.ui.aggregations;
      for (let agg of Object.keys(aggregations)) {
        const info = aggInfo.find((a) => a['name'] === agg);
        const display = info?.display;
        const order = info?.order;
        const name = info?.name;
        const hide = info?.hide;
        const active = info?.active;
        const help = info?.help;

        const buckets = aggregations[agg]?.buckets || aggregations[agg]?.values?.buckets;
        if (info?.sortBy === 'name') {
          buckets.sort((a, b) => (a.key > b.key) ? 1 : (a.key < b.key) ? -1 : 0);
        }

        a[agg] = {
          buckets: buckets,
          display: display || agg,
          order: order || 0,
          name: name || agg,
          hide: hide,
          active: active,
          help: help || ''
        };
      }
      return orderBy(a, 'order');
    },
    onInputChange(value) {
      this.searchInput = value;
    },
    async resetSearch() {
      this.scrollToTop();
      this.clear = !this.clear;
      this.searchInput = '';
      this.$route.query.q = '';
      this.$route.query.f = '';
      this.$route.query.t = '';
      if (this.resetAdvancedSearch) {
        this.advancedSearch = false;
      } else {
        this.advancedSearch = this.$route.query.a || false;
      }
      this.advancedQueries = null;
      this.resetAdvancedSearch = true
      this.searchFields = this.$store.state.configuration.ui.searchFields;
      this.$route.query.sf = encodeURIComponent(this.searchFields);
      this.$route.query.o = this.selectedOperation;
      this.selectedOrder = 'desc';
      this.filterButton = [];
      this.isStart = true;
      this.isBrowse = false;
      this.currentPage = 1;
      this.filters = {};
      await this.clearAggregations();
      // await this.search();
      const query = {};
      await this.$router.push({ path: 'search', query });
    },
    scrollToTop() {
      setTimeout(function () {
        document.body.scrollTop = 0; // For Safari
        document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
        window.scrollTo(0, 0);
        document.getElementById('search_results').scrollTop = 0;
        document.getElementById('search_aggregation').scrollTop = 0;
        document.getElementById('advanced_search_box').scrollTop = 0;
      }, 100);
    },
    scrollToId(id) {
      setTimeout(function () {
        // window.scroll({top: 0, left:0, behavior: 'smooth'});
        document.body.scrollTop = 0; // For Safari
        document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
        document.body.scrollTop = 0; // For Safari
        document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
        window.scrollTo(0, 0);
        const element = document.getElementById(id);
        element.scrollIntoView({ behavior: 'smooth' });
        element.scrollTop = 0;
      }, 100);
    },
    scrollToSelector(selector) {
      setTimeout(function () {
        // window.scroll({top: 0, left:0, behavior: 'smooth'});
        document.body.scrollTop = 0; // For Safari
        document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
        window.scrollTo(0, 0);
        const element = document.querySelector(selector);
        element.scrollIntoView({ behavior: 'smooth' });
        element.scrollTop = 0;
      }, 100);
    },
    async clearAggregations() {
      if (this.aggregations) {
        for (let agg of this.aggregations) {
          //TODO: ask cos this may be silly?!?
          //this.$refs[agg][0].clear();
          const name = agg?.name;
          if (this.$refs[name]) {
            for (let r of this.$refs[name]) {
              r.clear();
            }
          }
        }
      }
      this.filters = {};
    },
    async search() {
      this.loading = true;
      if (this.isStart) { //Revert start to sorting by collections
        this.selectedSorting = this.sorting[1].value; //collection
        this.isStart = false;
      } else if (this.searchInput) { // If there is a query sort by relevance
        this.selectedSorting = this.defaultSorting.value;
      } else if (this.advancedSearch) { // If advanced search is enabled sort by relevance
        this.selectedSorting = this.defaultSorting.value;
      } else if (!this.selectedSorting) { // If there is one selected sorting do that
        this.selectedSorting = this.defaultSorting.value;
      }
      this.changedFilters = false;
      this.noMoreResults = false;
      let filters = {};
      if (!isEmpty(this.filters)) {
        filters = this.filters;
      } else {
        filters = {};
      }
      let order = this.selectedOrder.value;
      if (!order) {
        order = this.selectedOrder;
      }
      try {
        this.items = await this.$elasticService.multi({
          multi: this.searchInput,
          filters: toRaw(this.filters),
          searchFields: this.searchFields,
          sort: this.selectedSorting,
          order: order,
          operation: this.selectedOperation,
          pageSize: this.pageSize,
          searchFrom: (this.currentPage - 1) * this.pageSize,
          queries: this.advancedQueries
        });
        this.populate({ items: this.items, newSearch: true, aggregations: this.aggregations });
        this.loading = false;
      } catch (e) {
        this.errorDialogVisible = true;
        this.errorDialogText = e.message;
        this.loading = false;
      }
    },
    async searchAll() {
      this.loading = true;
      let order = this.selectedOrder.value ?? this.selectedOrder;
      try {
        let items = await this.$elasticService.multi({
          multi: this.searchInput,
          filters: toRaw(this.filters),
          searchFields: this.searchFields,
          sort: this.selectedSorting,
          order: order,
          operation: this.selectedOperation,
          pageSize: 100000,
          searchFrom: 0,
          queries: this.advancedQueries
        });
        this.loading = false;
        this.latlngs = [];
        this.journeyLatlngs = [];
        this.csvHeader = new Set();
        //MUFENg . use category for mapping
        let colorMap = this.viewConfig.options.map.color.map;

        if (items?.['hits']) {
          const thisItems = items['hits']['hits'];
          this.allItems = thisItems;
          if (thisItems.length > 0) {
            for (let item of thisItems) {


              if (!item['_source']['@type'].includes('RepositoryCollection')) {

                if (item['_source']) {
                  Object.keys(item['_source']).forEach((key) => {
                    if (!this.csvConfig.exclude.includes(key)) {
                      this.csvHeader.add(key);
                    }
                  });
                }

                let color = colorMap['default'];

                if (item['_source']['category']) {
                  if (colorMap[item['_source']['category'][0]['@id']]) {
                    color = colorMap[item['_source']['category'][0]['@id']];
                  }
                }

                //MUfeng . check subview
                if (item['_source']['_geolocation']) {
                  let geoCoordinates = item['_source']['_geolocation'][0][0][0];
                  if (geoCoordinates) {
                    this.latlngs.push(
                      {
                        latitude: geoCoordinates['latitude'],
                        longitude: geoCoordinates['longitude'],
                        color: color
                      }
                    );
                  }
                }

                if (item['_source']['_journeyGeolocation']) {
                  let journeyGeoLocation = item['_source']['_journeyGeolocation'][0];
                  if (journeyGeoLocation) {
                    let journeycoordinates = [];
                    for (let journeyGeo of journeyGeoLocation) {
                      journeycoordinates.push(
                        {
                          latitude: journeyGeo[0]['latitude'],
                          longitude: journeyGeo[0]['longitude'],
                          color: color
                        }
                      );
                    }
                    this.journeyLatlngs.push(journeycoordinates);
                  }
                }

                if (item['_source']['_dateGeolocation']) {
                  let dateGeoLocation = item['_source']['_dateGeolocation'][0][0][0];
                  if (dateGeoLocation) {
                    this.dateLatlngs.push(
                      {
                        latitude: dateGeoLocation['latitude'],
                        longitude: dateGeoLocation['longitude'],
                        datestart: dateGeoLocation['datestart'],
                        dateend: dateGeoLocation['dateend'],
                        udatestart: dateGeoLocation['udatestart'],
                        udateend: dateGeoLocation['udateend'],
                        color: color
                      }
                    );
                  }
                }

              }
            }
          };
        }
      } catch (e) {
        this.errorDialogVisible = true;
        this.errorDialogText = e.message;
        this.loading = false;
      }
    },
    getSearchDetailUrl(item) {
      //console.log(item);
      //TODO: this is not good, maybe do it with a ConformsTo to specify link. But have to think about it because not
      //      all files have conformsTo!
      let url;
      const types = item._source['@type'];
      const repoType = types.find(t => t === 'RepositoryCollection');
      const fileType = types.find(t => t === 'File');
      const itemType = types.find(t => t === 'RepositoryObject');
      let id = encodeURIComponent(item._source['@id']);
      let crateId = encodeURIComponent(first(item._source['_crateId'])?.['@value']);
      if (repoType) {
        url = `/collection?id=${id}&_crateId=${crateId}`
      } else if (itemType) {
        url = `/object?id=${id}&_crateId=${crateId}`
      } else if (fileType) {
        let isNotebook;
        if (item._source?.['conformsTo']) {
          isNotebook = item._source['conformsTo'].find(c => c['@id'] === this.conformsToNotebook);
        }
        if (isNotebook) {
          id = encodeURIComponent(item._id);
          url = `/object?_id=${id}`;
        } else {
          const fileId = id;
          id = encodeURIComponent(first(item._source['_parent'])?.['@id']);
          url = `/object?id=${id}&_crateId=${crateId}&fileId=${fileId}`
        }
      } else {
        //Defaults to object if it doesnt know what it is
        url = `/object?id=${id}&_crateId=${crateId}`
      }
      return url;
    },
    clean(string) {
      if (string === 'true') {
        return 'Yes';
      } else if (string === 'false') {
        return 'No';
      } else {
        string = string.replace(/@|_|(\..*)/g, "")
        return string;
      }
    },
    sortResults(sort) {
      this.currentPage = 1;
      this.selectedSorting = sort;
      console.log("Mufeng SortResults");
      this.search();
    },
    orderResults(order) {
      this.currentPage = 1;
      this.selectedOrder = order;
      console.log("Mufeng OrderResults");
      this.search();
    },
    async updatePages(page, scrollTo) {
      this.currentPage = page;
      console.log("Mufeng UpdatePages");
      await this.search();
      this.scrollToTop();//Id(scrollTo);
    },
    async clearFilters() {
      this.filters = {};
      await this.updateRoutes({ updateFilters: true });
    },
    newAggs({ query, aggsName }) {
      if (query.f) {
        //In here we need to merge the filters
        const decodedFilters = JSON.parse(decodeURIComponent(query.f));
        this.mergeFilters(decodedFilters, aggsName);
      }
      if (query.q) {
        this.searchInput = decodeURIComponent(query.q);
      }
      console.log(isEmpty(this.filters))
      this.changedFilters = true;
    },
    enableAdvancedSearch() {
      this.advancedSearch = true;
      this.scrollToTop();//('advanced_search_box');
      this.searchInput = '';
    },
    basicSearch() {
      this.advancedSearch = false;
      this.resetAdvancedSearch = true;
      this.resetSearch();
    },
    mergeFilters(newFilters, aggsName) {
      let filters = toRaw(this.filters);
      if (isEmpty(this.filters)) {
        this.filters = newFilters;
      } else {
        this.filters[aggsName] = newFilters[aggsName] || [];
        if (isEmpty(this.filters[aggsName])) {
          delete this.filters[aggsName];
        }
      }
      console.log('is this.filters empty?');
      console.log(isEmpty(this.filters))
      // this.filters = filters;
    },
    switchView(view) {
      if (view in this.viewConfig.options) {
        this.currentView = view;
      }
    },
    switchSubView(mainView, subView) {
      if (mainView === 'list') {
        this.currentListView = subView;
      } else if (mainView === 'map') {
        this.currentMapView = subView;
      }
    },
    downloadCSV() {
      let headerRows = Array.from(this.csvHeader);
      let csvContent = '"' + headerRows.join('","') + '"\n';

      this.allItems.forEach(item => {
        if (!item['_source']['@type'].includes('RepositoryCollection')) {
          let row = headerRows.map(key => {
            let value = readValue(item['_source'], key);
            if (value.length === 0) {
              return "";
            } else {
              value = value.join(", ");
            }
            return `"${value.replace(/"/g, '""')}"`;
          }).join(",");

          csvContent += row + "\n";
        }
      });

      let blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      let link = document.createElement("a");
      let url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "export.csv");
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    getViewProperties(mainViewName, subViewName, proppertyName) {
      const viewOpiton = this.viewConfig.options[mainViewName]?.options.find(option => option.name === subViewName);
      return viewOpiton ? viewOpiton[proppertyName] : null;
    }
  },
  computed: {
    viewKeys() {
      return Object.keys(this.viewConfig.options);
    },
  }
};

</script>

<style>
html {
  scroll-behavior: smooth;
}

.archive-list {
  display: flex;
  flex-wrap: wrap;
  gap: 40px;
  margin-bottom: 2em;
  justify-content: center;
}

.active {
  background-color: lightskyblue;
}

</style>