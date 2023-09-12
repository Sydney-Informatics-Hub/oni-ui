<template>
  <div style="height:300px; width:400px">
    <l-map ref="map" v-model:zoom="zoom" :center="latlngs[0]">
      <l-tile-layer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        layer-type="base"
        name="OpenStreetMap"
      ></l-tile-layer>
      <l-marker v-for="latlng in latlngs" :lat-lng="latlng">
      </l-marker>
    </l-map>
  </div>
</template>

<script>
import "leaflet/dist/leaflet.css";
import { LMap, LTileLayer, LMarker } from "@vue-leaflet/vue-leaflet";


export default {
  props: [ 'lat', 'long', 'latlngs'],
  components: {
    LMap,
    LTileLayer,
    LMarker,
  },
  data() {
    return {
      zoom: 12,
      latlngs: this.latlngs,
      lat: this.lat,
      long: this.long
    };
  },
};
</script>

<style></style>