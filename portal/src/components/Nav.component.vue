<template>
  <el-menu id="top_menu" :ellipsis="true" :default-active="active" :router="true" :style="{'backgroundColor' : headerConfig.backgroundColor}">

    <el-row :gutter="0" :offset="0" style="border-bottom: 2px solid black;">

      <el-col :xs="24" :sm="9" :md="9" :lg="5" :xl="5" :offset="0">
        <div class="flex flex-col justify-center pl-3" :style="{ 'height': navHeight }">
          <el-menu-item index="home" :route="topNavHome + Date.now()">
            <router-view :key="topNavHome">
              <img v-if="showLogo" class="object-fill block" :src="require(`@/assets/${headerConfig.logo}`)"
                :alt="this.$store.state.configuration.ui.shortTitle || 'Oni'" style="height: 80%;" />
              <span v-else link>{{ this.$store.state.configuration.ui.shortTitle || 'Oni' }}</span>
            </router-view>
          </el-menu-item>
        </div>
      </el-col>

      <el-col :xs="24" :sm="15" :md="15" :lg="19" :xl="19" :offset="0" style="display: flex; justify-content: space-between;">

        <div class="flex items-center font-medium text-3xl">
          {{ headerConfig.text }}
        </div>
        <div class="flex items-center pr-10">
          <!-- <el-menu-item v-for="topNavItem of topNavItems" :index="topNavItem.route" :router="topNavItem.route">
            <router-view :key="topNavItem.route">
              <div class="flex flex-col justify-center items-center" :style="{ 'height': navHeight }">
                <span>{{ topNavItem.display }}</span>
              </div>
            </router-view>
          </el-menu-item> -->

          <!-- <el-menu-item index="search" :route="'/search'">
            <router-link to="/search">
              <div class="flex flex-col justify-center items-center" :style="{ 'height': navHeight }">
                <span>Browse</span>
              </div>
            </router-link>
          </el-menu-item> -->
          <nav-user v-if="isLoginEnabled" />
          <el-sub-menu index="help-sub">
            <template #title class="flex flex-col justify-center items-center" :style="{ 'height': navHeight }">
              <div class="flex flex-col justify-center items-center" :style="{ 'height': navHeight }">
                <span>Help</span>
              </div>
            </template>
            <el-menu-item index="help-sub-about" :route="'/about'">
              <router-link to="/about">
                About Oni
              </router-link>
            </el-menu-item>
            <el-menu-item index="help-sub-api" :route="'/docs'">
              <router-link to="/docs">
                Oni Api docs
              </router-link>
            </el-menu-item>
            <template v-for="helpLink of subHelpLinks">
              <li class="el-menu-item">
                <a class="w-full block" :href="helpLink.href" :target="helpLink.target">
                  {{ helpLink.name }}
                </a>
              </li>
            </template>
          </el-sub-menu>
        </div>
      </el-col>
    </el-row>
  </el-menu>
</template>
<style>
.el-menu-item a {
  display: block;
}
</style>
<script>

import {
  tokenSessionKey,
  removeLocalStorage,
  getLocalStorage
} from "@/storage";
import NavUser from './NavUser.component.vue';
import { defineAsyncComponent, toRaw } from "vue";

export default {
  name: 'NavView',
  components: {
    NavUser
  },
  data() {
    return {
      isLoginEnabled: this.$store.state.configuration.ui?.login?.enabled,
      showLogo: this.$store.state.configuration.ui?.showLogo,
      showNotebooks: this.$store.state.configuration.ui?.showNotebooks,
      navHeight: this.$store.state.configuration.ui?.navHeight || '50px',
      topNavHome: this.$store.state.configuration.ui?.topNavHome || '/search?s=',
      topNavItems: this.$store.state.configuration.ui?.topNavItems || [],
      subHelpLinks: this.$store.state.configuration.ui?.subHelpLinks || [],
      active: '',
      populate: null,
      searchInput: null,
      search: null,
      clear: null,
      filters: null,
      onInputChange: null,
      headerConfig: this.$store.state.configuration.ui.header,
    };
  },
  computed: {
    current: async function () {
      return this.$route.path;
    }
  },
  watch: {
    '$route.query.view': {
      handler() {
        this.activate();
      },
      flush: 'post',
      immediate: true
    },
    '$route.query': {
      handler() {
        this.activate();
      },
      flush: 'post',
      immediate: true
    },
  },
  mounted() {
  },
  methods: {
    activate: function () {
      if (this.$route.name === this.topNavHome) {
        this.active = this.topNavHome;
      } else {
        this.active = this.$route.name;
        console.log(`Active Route: ${this.active}`);
      }
    }
  }
};
</script>
