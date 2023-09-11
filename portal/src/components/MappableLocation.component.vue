<template>
  <div style="height:300px; width:400px">
    <l-map ref="map" v-model:zoom="zoom" :center="[lat, long]">
      <l-tile-layer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        layer-type="base"
        name="OpenStreetMap"
      ></l-tile-layer>
      <l-marker :lat-lng="[lat, long]">
      </l-marker>
    </l-map>
  </div>
</template>

<script>
import "leaflet/dist/leaflet.css";
import { LMap, LTileLayer, LMarker } from "@vue-leaflet/vue-leaflet";


export default {
  props: [ 'lat', 'long'],
  components: {
    LMap,
    LTileLayer,
    LMarker,
  },
  data() {
    return {
      zoom: 12,
      lat: this.lat,
      long: this.long
    };
  },
};
</script>

<style></style>