<template>
  <header class="sticky top-0 z-50">
    <el-row :gutter="0" :offset="0" style="" class="flex items-center justify-center">
      <el-col>
        <nav-view />
      </el-col>
    </el-row>
  </header>
  <el-row :gutter="0" :offset="0" class="flex items-center justify-center relative" >
    <el-col>
      <main class="">
        <router-view />
      </main>
    </el-col>
  </el-row>
  <footer>
    <footer-view />
  </footer>
</template>

<script>
import NavView from './Nav.component.vue';
import FooterView from './Footer.component.vue';

export default {
  components: {
    NavView,
    FooterView
  },
  beforeMount() {
  },
  mounted() {
    if (this.$route.path === "/") this.$router.push("/search");
  },
  watch: {
    async '$route.path'() {
      if (this.$route.path === "/") this.$router.push("/search");
    },
  },
  data() {
    return {
      ui: this.$store.state.configuration?.ui
    }
  },
};
</script>

