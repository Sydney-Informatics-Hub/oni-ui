<template>
  <div style="height:300px; width:400px">
    <l-map ref="map" v-model:zoom="zoom" :center="latlngs[0]">
    <!-- <l-map ref="map" v-model:center="latlngs[0]" :bounds="bounds"> -->
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
  props: [ 'latlngs'],
  components: {
    LMap,
    LTileLayer,
    LMarker,
  },
  data() {
    return {
      zoom: 5,
      latlngs: this.latlngs,
      bounds: {"_southWest":{"lat":-13.8, "lng":84.8},"_northEast":{"lat":10.6,"lng":149}},
    };
  },
};
</script>

<style></style>