<template>
  <div class="h-auto text-center grid place-items-center p-6"
    :style="{ 'background-color': footerConfig.backgroundColor }">
    <el-row>
      <el-col :span="24" class="flex space-x-4">
        <el-link v-for="component in footerConfig.components" :href="component?.href" :underline="false"
          :style="{ 'color': footerConfig.textColor, 'font-size': '1rem' }">
          {{ component?.title }}
        </el-link>

        <el-link v-if="splashLauncher" class="font-semibold" @click="splash = true" :underline="false">
          {{ splashLauncher || 'Splash' }}
        </el-link>
      </el-col>
    </el-row>
  </div>
  <splash-screen :launch="splash" @close="splash = false" />
</template>
<script>
import SplashScreen from './SplashScreen.component.vue'

export default {
  name: 'FooterView',
  components: { SplashScreen },
  data() {
    return {
      footerConfig: this.$store.state.configuration.ui?.footer,
      splash: false,
      splashLauncher: this.$store.state.configuration.ui?.splashLauncher || null
    }
  }
}
</script>
