<template>
  <span class="p-2">
    <span v-if="noIcon">
      <span class="flex justify-center" v-if="accessIcon === 'public'">
        <el-tooltip
            class="box-item"
            effect="dark"
            content="You can access this data immediately and by doing so you accept the licence terms specified on the record."
            placement="bottom"
        >
        <img class="object-fill block" :src="publicIcon" :srcset="publicIcon" :style="{'height': '60px'}"/>
        </el-tooltip>
      </span>
      <span class="flex justify-center" v-if="accessIcon === 'login'">
        <el-tooltip
            class="box-item"
            effect="dark"
            content="You can access this data after logging in. You may also have to agree to licence terms in an automatic process."
            placement="bottom"
        >
        <img class="object-fill block" :src="loginIcon" :srcset="loginIcon" :style="{'height': '60px'}"/>
        </el-tooltip>
      </span>
      <span class="flex justify-center" v-if="accessIcon === 'loginPlus'">
        <el-tooltip
            class="box-item"
            effect="dark"
            content="There are restrictions on access to this data. Log in to get further information."
            placement="bottom"
        >
        <img class="object-fill block" :src="loginIconPlus" :srcset="loginIconPlus" :style="{'height': '60px'}"/>
        </el-tooltip>
      </span>
    </span>
    <span v-else>
      <span class="flex justify-center">
        <el-tooltip
            class="box-item"
            effect="dark"
            :content="`${field?.display}: ${item}`"
            placement="bottom"
        >
        <font-awesome-icon
            :icon="['fa-solid', iconType]"
            size="2x"
            style="color: rgba(0,0,0,0.55);"/>
      </el-tooltip>
      </span>
    </span>
  </span>
</template>
<script>
import publicIcon from "@/assets/access-public.svg";
import loginIcon from "@/assets/access-login-pass.svg";
import loginIconPlus from "@/assets/access-login-restricted.svg";

export default {
  props: ['item', 'id', 'field'],
  data() {
    return {
      noIcon: false,
      iconType: 'file',
      accessIcon: 'none',
      publicIcon,
      loginIcon,
      loginIconPlus
    }
  },
  mounted() {
    if (/text\/plain/.test(this.item)) {
      this.iconType = 'file-lines';
    } else if (/text\/csv/.test(this.item)) {
      this.iconType = 'file-csv';
    } else if (/video\/mp4/.test(this.item)) {
      this.iconType = 'file-video';
    } else if (/xml/.test(this.item)) {
      this.iconType = 'file-code';
    } else if (/application\/zip/.test(this.item)) {
      this.iconType = 'file-zipper';
    } else if (/application\/pdf/.test(this.item)) {
      this.iconType = 'file-pdf';
    } else if (/application\/msword/.test(this.item)) {
      this.iconType = 'file-word';
    } else if (/audio\/mpeg/.test(this.item) || /audio\/x-wav/.test(this.item)) {
      this.iconType = 'file-audio';
    } else if (/application\/x-ipynb+json/.test(this.item)) {
      this.iconType = 'clipboard';
    } else if (/WrittenLanguage/.test(this.item)) {
      this.iconType = 'fa-feather';
    } else if (/SpokenLanguage/.test(this.item)){
        this.iconType = 'fa-microphone-lines';
    } else if (/Song/.test(this.item)){
      this.iconType = 'fa-music';
    } else if (/Gesture/.test(this.item)){
      this.iconType = 'fa-hand';
    } else if (/SignLanguage/.test(this.item)){
      this.iconType = 'fa-hands-asl-interpreting';
    } else if (/WhistledLanguage/.test(this.item)){
      this.iconType = 'fa-face-kiss';
    } else if (/public/.test(this.item)) {
      this.accessIcon = 'public';
      this.noIcon = true;
    } else if (/loginPlus/.test(this.item)) {
      this.accessIcon = 'loginPlus';
      this.noIcon = true;
    } else if (/login/.test(this.item)) {
      this.accessIcon = 'login';
      this.noIcon = true;
    } else {
      this.noIcon = true;
    }
  }
}
</script>
