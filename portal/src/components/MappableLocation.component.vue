<template>
  <iframe :id="id" :src="mapSrc" class="tlcmap" :style="iframeStyle"></iframe>
</template>

<script>

import { TLCMapAPI } from '../tlcmap-api.js';

export default {
  props: {
    latlngs: Array,
    mapType: String,
    logo: {
      type: [String, null],
      default: null
    },
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
            properties: {
              name: ll['name']
            },
          };
          features.push(feature);
        });

      } else if (this.mapType == 'cluster') {
        var serializableProperties = JSON.parse(JSON.stringify(latlng['properties']));
        var feature = {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [latlng['latitude'], latlng['longitude']],
          },
          properties: serializableProperties,
          display: {
            color: latlng['color'],
            popup: {
              links: [
                {
                  text: "Read more",
                  link: latlng['url'],
                },
              ],
            }
          },
        };
        features.push(feature);
      } else if (this.mapType == 'timeline') {
        var serializableProperties = JSON.parse(JSON.stringify(latlng['properties']));
        var feature = {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [latlng['latitude'], latlng['longitude']],
          },
          properties: serializableProperties,
          display: {
            color: latlng['color'],
            popup: {
              links: [
                {
                  text: "Read more",
                  link: latlng['url'],
                },
              ],
            }
          },
        };
        features.push(feature);
      }
    });

    //Construct lines for journey
    if (this.mapType == 'journey') {
      this.latlngs.forEach(latlng => {
        var linecoords = [];
        var color = null;
        var serializableProperties = null;
        var link = null;
        latlng.forEach(ll => {
          serializableProperties = JSON.parse(JSON.stringify(ll['properties']));
          link = ll['url'];

          linecoords.push([ll['latitude'], ll['longitude']]);
          color = ll['color'];
        });
        var feature = {
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: linecoords,
          },
          properties: serializableProperties,
          display: {
            color: color,
            popup: {
              links: [
                {
                  text: "Read more",
                  link: link,
                },
              ],
            }
          },
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
          blockedFields: ['name', 'datestart', 'dateend', 'udatestart', 'udateend']
        }
      },
    };

    if (this.logo) {
      GeoJSON.display.info.logo = require(`@/assets/${this.logo}`);
    }
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
