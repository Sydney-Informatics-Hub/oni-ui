<template>
  <iframe :id="id" :src="mapSrc" class="tlcmap" :style="iframeStyle"></iframe>
</template>

<script>

import { TLCMapAPI } from '../tlcmap-api.js';

export default {
  props: {
    latlngs: Array,
    mapType: String,
    height: {
      type: String,
      default: '500px'
    },
    width: {
      type: String,
      default: '800px'
    }
  },
  data() {
    return {
      mapSrc: '',
      id: '',
    }
  },
  mounted() {

    if (this.mapType == 'journey') {
      this.mapSrc = "https://test-views.tlcmap.org/api/journey.html"
      this.id = "journey-map";
    } else if (this.mapType == 'cluster') {
      this.mapSrc = "https://test-views.tlcmap.org/api/cluster.html"
      this.id = "cluster-map";
    } else if (this.mapType == 'timeline') {
      this.mapSrc = "https://test-views.tlcmap.org/api/timeline.html"
      this.id = "timeline-map";
    }

    var features = [];
    this.latlngs.forEach(latlng => {

      if (this.mapType == 'journey') {
        latlng.forEach(ll => {
          var feature = {
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [ll['latitude'], ll['longitude']],
            },
            display: { color: ll['color'] },
          };
          features.push(feature);
        });

      } else if(this.mapType == 'cluster'){
        var feature = {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [latlng['latitude'], latlng['longitude']],
          },
          display: {color: latlng['color'] },
        };
        features.push(feature);
      } else if(this.mapType == 'timeline'){
        var feature = {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [latlng['latitude'], latlng['longitude']],
          },
          properties:{
            datestart: latlng['datestart'],
            dateend: latlng['dateend'],
            udatestart: latlng['udatestart'],
            udateend: latlng['udateend'],
          },
          display: { color: latlng['color'] },
        };
        features.push(feature);
      }
    });

    if (this.mapType == 'journey') {
      this.latlngs.forEach(latlng => {
        var linecoords = [];
        var color = null;
        latlng.forEach(ll => {
          linecoords.push([ll['latitude'], ll['longitude']]);
          color = ll['color'];
        });
        var feature = {
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: linecoords,
          },
          display: { color: color },
        };
        features.push(feature);
      });
    }

    const GeoJSON = {
      type: "FeatureCollection",
      metadata: {
        name: "OMAA Heurist records",
        description:
          "This is the map of records from OMAA Heurist database",
      },
      features: features,
      display: {
        info: {
          content: "<div><p>Click a pin to see its details.</p></div>",
        },
        basemapGallery: false,
        basemap: "hybrid",
        clusterColor: "#301934",
        clusterFontColor: "white",
        popup: {
          allowedFields: [],
          content:
            "",
        },
      },
    };
    this.$nextTick(() => {
      const iframe = document.getElementById(this.id);
      const mapAPI = new TLCMapAPI(iframe);
      mapAPI.sendDataToMap(GeoJSON);
    });

  },
  computed: {
    iframeStyle() {
      return {
        height: this.height,
        width: this.width
      };
    }
  }
};
</script>
