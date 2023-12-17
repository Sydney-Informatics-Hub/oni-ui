<template>
  <div v-show='currentView === "new"'>
    <div class="table_section flex justify-center" style="background-color: #F5F8DE;">

      <div style="width: 98%;">
        <div class="flex justify-between">
          <div class="text-4xl font-semibold p-5 pt-10 flex items-center w-full">

            <div class="text-xl">
              <a href="/search" class="no-underline">
                <font-awesome-icon icon="fa fa-arrow-left" />
                Back
              </a>
            </div>

            <img v-if="icon" :src="require(`@/assets/${icon}`)" class="mr-1" style="height: 30px; margin-left: 5%;">
            {{ first(this.name)?.['@value'] }}
          </div>
          <div class="flex items-center" style="min-width: 50px;">
            <div class="flex mr-3">
              <img src="../assets/tile-view.svg" :class="{ 'active': currentView === 'new' }" @click="switchView('new')"
                style="width: 40px; height: 40px; cursor: pointer;">
              <img src="../assets/table-view.svg" :class="{ 'active': currentView === 'old' }" @click="switchView('old')"
                style="width: 40px; height: 40px; cursor: pointer;">
            </div>
          </div>
        </div>

        <div style="width: 85%; margin: auto;">
          <div v-show="showTableData" class="flex justify-center px-10 pb-4">
            <ObjectTable :tableData="leftTableData"></ObjectTable>
            <ObjectTable :tableData="rightTableData"></ObjectTable>
          </div>

          <el-row class="p-5 text-lg cursor-pointer" style="margin-left: 1%;" @click="toggleTableData">
            About this object <span class="px-3">
              <font-awesome-icon v-if="showTableData" icon="fa fa-chevron-up" />
              <font-awesome-icon v-else icon="fa fa-chevron-down" />
            </span>
          </el-row>
        </div>
      </div>

    </div>

    <div class="main_section flex justify-center" style="border-top: 2px solid black;">
      <div style="width: 80%;">

        <div v-for="prop in Object.keys(metadata)">
          <div v-if="config.options.new.iframe.includes(prop)">
            <el-row v-for="url in readValue(metadata, prop)" class="p-5 mt-4 justify-center" style="margin-left: 3%;">
              <iframe v-if="isUrl(url)" :src="url" style="width:90%;height: 800px; border: 2px solid black;">
              </iframe>
            </el-row>
          </div>
        </div>

        <template v-for="key in mainSection">
          <el-row v-if="metadata.hasOwnProperty(key)" class="p-5"
            style="margin-left: 3%; display:block; border-bottom: 2px #B91C1C;">
            <h1 class="text-4xl font-medium dark:text-white"
              :style="{ 'border-bottom': '2px solid #B91C1C' }">{{ key.charAt(0).toUpperCase() +
                key.slice(1) }}</h1>
            <p class="mt-4 text-lg">{{ readValue(metadata, key)[0] }}</p>
          </el-row>
        </template>
      </div>

    </div>
  </div>

  <div v-show="currentView === 'old'">
    <div class="px-10 pt-10 pb-7 z-10 bg-white">
      <el-row :align="'middle'" class="mb-2 text-4xl font-medium dark:text-white flex justify-between">
        <h5>
          <member-of-link :memberOf="metadata?._memberOf" />
          {{ first(this.name)?.['@value'] }}
        </h5>

        <div class="flex justify-end">
          <el-row>
            <div class="flex mr-3">
              <img v-if="config.options?.new?.icon" :src="require(`@/assets/${config.options.new.icon}`)"
                :class="{ 'active': currentView === 'new' }" @click="switchView('new')"
                style="width: 40px; height: 40px; cursor: pointer;">
              <img v-if="config.options?.old.icon" :src="require(`@/assets/${config.options.old.icon}`)"
                :class="{ 'active': currentView === 'old' }" @click="switchView('old')"
                style="width: 40px; height: 40px; cursor: pointer;">
            </div>
          </el-row>
        </div>
      </el-row>
    </div>

    <el-row :justify="'center'" v-if="this.metadata" class="m-5 px-10" v-loading="loading">
      <el-col :xs="24" :sm="24" :md="24" :lg="16" :xl="16">
        <AccessHelper v-if="access" :access="access" :license="license" />
        <div class="px-5 pb-5">
          <MetaTopCard :tops="this.tops" :className="'py-5'" />
          <el-row class="">
            <el-col v-for="  meta   of   this.meta  ">
              <meta-field :meta="meta" :routePath="'object'" :crateId="this.crateId" />
            </el-col>
          </el-row>
        </div>
      </el-col>
      <el-col :xs="24" :sm="24" :md="24" :lg="8" :xl="8">
        <el-row :gutter="20" :align="'middle'" class="justify-center content-center pb-5">
          <el-col v-if="this.license?.['@id']">
            <el-card :body-style="{ padding: '0px' }" class="mx-10 p-5">
              <h5 class="text-2xl font-medium">Access</h5>
              <hr class="divider divider-gray pt-2" />
              <license-card v-if="this.license?.['@id']" :license="license" />
            </el-card>
          </el-col>
        </el-row>
        <el-row :gutter="20" class="pb-5">
          <el-col v-if="metadata?._memberOf">
            <MemberOfCard :routePath="'collection'" :_memberOf="metadata?._memberOf" />
          </el-col>
        </el-row>
        <el-row v-if="membersFiltered?.data">
          <el-col>
            <el-card :body-style="{ padding: '0px' }" class="mx-10 p-5">
              <h5 class="text-2xl font-medium ">Other Objects in this Collection</h5>
              <hr class="divider divider-gray pt-2" />
              <ul>
                <li v-for="  d   of   membersFiltered.data  ">
                  <collection-item :field="d._source" :routePath="'object'" />
                </li>
                <li>
                  <el-link type="primary" :href="`/search?f=${moreObjects()}`">more...</el-link>
                </li>
              </ul>
            </el-card>
          </el-col>
        </el-row>
      </el-col>
    </el-row>

    <template v-if="parts && parts.length > 0">
      <el-row class="m-5 pl-10 pr-12">
        <el-col :span="24" class="divide-solid divide-y-2 divide-red-700">
          <div class="grid-content p-6">
            <h5 class="mb-2 text-2xl tracking-tight dark:text-white">
              Files: {{ parts.length }}
            </h5>
          </div>
          <div></div>
        </el-col>
      </el-row>
      <el-row class="m-5 pl-10 pr-12 pb-7">
        <el-col>
          <ul>
            <li v-for="(  part, index  ) of   parts  ">
              <a :id="'part-' + encodeURIComponent(part?.['@id'])"></a>
              <object-part :part="part" :title="first(part?.name)?.['@value'] || part?.['@id']"
                :active="isPartActive(part?.['@id'], index)" :id="encodeURIComponent(part?.['@id'])"
                :encoding="first(part?.['encodingFormat'])" :crateId="this.crateId" :rootId="this.rootId"
                :parentName="first(this.name)?.['@value']" :parentId="this.$route.query.id" :license="license"
                :access="access" />
            </li>
          </ul>
        </el-col>
      </el-row>
    </template>
  </div>
</template>
<script>
import { first, isUndefined, reject, isEmpty, sortBy } from "lodash";
import { initSnip, toggleSnip } from "../tools";
import MetaField from "./MetaField.component.vue";
import { defineAsyncComponent } from 'vue';
import LicenseCard from './cards/LicenseCard.component.vue';
import MemberOfCard from './cards/MemberOfCard.component.vue';
import AccessHelper from './AccessHelper.component.vue';
import MemberOfLink from './widgets/MemberOfLink.component.vue';
import MetaTopCard from './cards/MetaTopCard.component.vue';
import { putLocalStorage } from '@/storage';
import { readValue, isUrl, getLabelDisplay } from '@/generalFunctions';
import CollectionItem from "./CollectionItem.component.vue";
import ObjectTable from "./ObjectTable.component.vue";


export default {
  components: {
    MetaTopCard,
    LicenseCard,
    MemberOfCard,
    MetaField,
    AccessHelper,
    MemberOfLink,
    ObjectTable,
    ObjectPart: defineAsyncComponent(() =>
      import('./ObjectPart.component.vue')
    ),
    CollectionItem
  },

  props: [],
  data() {
    return {
      id: null,
      config: this.$store.state.configuration.ui.object,
      fields: this.$store.state.configuration.ui.main.fields,
      helpers: this.$store.state.configuration.ui.helpers,
      currentView: "new",
      leftTableData: [],
      rightTableData: [],
      metadata: {},
      name: '',
      tops: [],
      meta: [],
      license: [],
      licenseText: '',
      licenseSnipped: false,
      buckets: [],
      parts: [],
      crateId: '',
      rootId: '',
      access: null,
      activePart: null,
      loading: false,
      membersFiltered: {},
      conformsToObject: this.$store.state.configuration.ui.conformsTo?.object,
      tableData: [],
      showTableData: false,
      icon: null,
      mainSection: [],
      tableDataExclude: [],
    }
  },
  async updated() {
    const fileId = this.$route.query.fileId;
    if (fileId) {
      setTimeout(function () {
        console.log(fileId)
        const fileElement = document.getElementById('part-' + encodeURIComponent(fileId));
        fileElement.scrollIntoView({ behavior: "smooth", block: "start", inline: "start" });
      }, 200);
    }
    this.membersFiltered = await this.filter({
      '_memberOf.@id': [this.crateId],
      'conformsTo.@id': [this.conformsToObject]
    }, false);
    putLocalStorage({ key: 'lastRoute', data: this.$route.fullPath });
  },
  async mounted() {
    try {
      this.crateId = this.$route.query._crateId;
      this.loading = true;
      let metadata = null;
      const id = encodeURIComponent(this.$route.query.id);
      const _id = encodeURIComponent(this.$route.query._id);
      //encodeURIComponent may return "undefined" string
      if (id && id !== 'undefined') {
        if (isUndefined(this.crateId) || this.crateId === 'undefined') {
          await this.$router.push({ path: '/404' });
          this.loading = false;
        } else {
          metadata = await this.$elasticService.single({
            id,
            crateId: this.crateId
          });
        }
      } else if (_id && _id !== 'undefined') {
        metadata = await this.$elasticService.single({ _id });
      }

      this.metadata = metadata?._source;
      await this.populate();
      initSnip({ selector: '#license', button: '#readMoreLicense' });
      putLocalStorage({ key: 'lastRoute', data: this.$route.fullPath });
      this.getIcon();
      this.loading = false;
    } catch (e) {
      console.error(e)
    }
  },
  methods: {
    first,
    isEmpty,
    toggleSnip,
    readValue,
    getLabelDisplay,
    isUrl,
    async populate() {
      this.rootId = first(this.metadata['_root'])?.['@id'];
      this.populateAccess();
      this.populateName(this.config.name);
      this.populateTop(this.config.top);
      this.populateMeta(this.config.meta);
      this.populateLicense();
      this.populateParts();
      this.populateTableData();
    },
    populateName(config) {
      this.name = this.metadata[config.name];
      this.nameDisplay = this.metadata[config.display];
    },
    populateTop(config) {
      for (let field of config) {
        let value;
        if (this.metadata[field.name]) {
          value = this.metadata[field.name]
        } else {
          value = [{ '@value': 'Not Defined' }];
        }
        this.tops.push({ name: field.display, value: value });
      }
    },
    populateMeta(config) {
      const keys = Object.keys(this.metadata);//.map(f => this.config.hide.find(f=> console.log(f)))
      const filtered = reject(keys, o => config.hide.find(f => o === f));
      for (let filter of filtered) {
        let helper = this.helpers.find(h => h.id === filter);
        if (!helper) {
          helper = {
            "id": filter,
            "display": filter,
            "url": "",
            "definition": "TODO: Add definition"
          }
        }
        this.meta.push({ name: filter, data: this.metadata[filter], help: helper });
      }
      this.meta = sortBy(this.meta, 'name');
    },
    populateLicense() {
      this.license = first(this.metadata?.license);
      if (!this.license?.['@id']) {
        console.log('show alert! no license nono')
      } else {
        this.licenseText = first(this.license?.description)?.['@value'];
      }
    },
    populateParts() {
      this.parts = this.metadata.hasPart;
    },
    populateAccess() {
      this.access = this.metadata._access;
    },
    isPartActive(id, index) {
      console.log(this.$route.query.fileId, id, index)
      if (this.$route.query.fileId === id) {
        this.activePart = true;
        return true;
      } else if (index === 0 && !this.activePart) {
        return true;
      }
      return false;
    },
    //TODO: refactor this integrate to multi
    async filter(filters, scroll) {
      const items = await this.$elasticService.multi({ scroll, filters, sort: 'relevance', order: 'desc' });
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
    moreObjects() {
      const filter = {
        '_memberOf.@id': [this.crateId]
      };
      return encodeURIComponent(JSON.stringify(filter));
    },
    switchView(view) {
      this.currentView = view;
    },
    populateTableData() {
      this.tableDataExclude = this.config.options.new.blockedField;
      this.mainSection = this.config.options.new.mainSection;
      this.tableData = [];
      Object.keys(this.metadata).forEach(key => {
        if (!this.tableDataExclude.includes(key) && !this.mainSection.includes(key)) {
          let value = readValue(this.metadata, key);
          if (value.length > 0) {
            this.tableData.push({ label: key, value: value });
          }
        }
      });
      const half = Math.ceil(this.tableData.length / 2);
      this.leftTableData = this.tableData.slice(0, half);
      this.rightTableData = this.tableData.slice(half);
    },
    toggleTableData() {
      this.showTableData = !this.showTableData;

      if (!this.showTableData) {
        this.$nextTick(() => {
          window.scrollTo({
            top: this.$el.offsetTop,
            behavior: 'smooth'
          });
        });
      }
    },
    getIcon() {
      let iconMap = this.config.map;
      let types = readValue(this.metadata, '@type');
      for (let i = 0; i < types.length; i++) {
        if (iconMap.hasOwnProperty(types[i])) {
          this.icon = iconMap[types[i]];
          return;
        }
      }
    },
  }
}
</script>

<style>
.active {
  background-color: lightskyblue;
}</style>
