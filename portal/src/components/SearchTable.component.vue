<template>
  <div class="table-view">
    <ejs-grid ref='grid' id='Grid' :allowPaging="true" :pageSettings='pageSettings' :dataSource="data"
      :allowSorting='true' :allowResizing='true' :allowFiltering="true" :allowGrouping='true'
      :groupSettings='groupOptions' :showColumnChooser='true' :toolbar='toolbarOptions' :filterSettings='filterOptions'
      :resizeStop='resizeStop'>
      <e-columns>
        <e-column v-for="(prop, index) in properties" :field="prop.name" :headerText="prop.display"
          :width="getColumnWidth(prop)" :visible="getColumnVisibility(index, prop)"
          :disableHtmlEncode="prop.name === 'name' ? false : true"></e-column>
      </e-columns>
    </ejs-grid>
  </div>
</template>

<script>

import { GridComponent, ColumnDirective, ColumnsDirective, Sort, Resize, Filter, Group, ColumnChooser, Toolbar, Page } from "@syncfusion/ej2-vue-grids";
import { putLocalStorage, getLocalStorage } from '@/storage';
import { readValue } from "@/generalFunctions";
import { first } from 'lodash';

export default {
  components: {
    'ejs-grid': GridComponent,
    'e-column': ColumnDirective,
    'e-columns': ColumnsDirective
  },
  props: {
    items: Array,
    properties: Array,
    pageSize: Number,
  },
  data() {
    return {
      data: [],
      pageSettings: { pageSize: this.pageSize || 36 },
      groupOptions: { columns: [] },
      filterOptions: {
        type: 'Menu',
        operators: {
          stringOperator: [
            { value: 'contains', text: 'contains' },
            { value: 'equal', text: 'Equal' },
            { value: 'startsWith', text: 'starts with' },
            { value: 'endsWith', text: 'ends with' },
          ],
        }
      },
      toolbarOptions: ['ColumnChooser'],
    }
  },
  provide: {
    grid: [Sort, Resize, Filter, Group, ColumnChooser, Toolbar, Page]
  },
  watch: {
    items: {
      deep: true,
      handler() {
        this.buildTableContent();
      }
    },
  },
  mounted() {
    this.setupColumnChooserMonitor();
    this.setupGroupingMonitor();
  },
  created() {
    this.buildTableContent();
    this.getColumnGrouping();
  },
  methods: {
    buildTableContent() {
      this.data = [];

      this.items.map(item => {
        const rowData = {};
        this.properties.forEach(prop => {

          if (prop.name === '_memberOf') {
            rowData[prop.name] = this.formatDetails(item);
          } else if (prop.name === 'name') {
            rowData[prop.name] = '<a href=' + this.getSearchDetailUrl(item) + ' class="underline text-blue-600 hover:text-blue-800 visited:text-purple-600"">' + readValue(item._source, prop.name).join(', ') + '</a>';
          } else {
            rowData[prop.name] = readValue(item._source, prop.name).join(', ');
          }
        });
        this.data.push(rowData);
      });
    },
    formatDetails(item) {
      if (item._source['@type'] && item._source['@type'].includes('RepositoryCollection')) {
        return `Objects: ${item._source.hasMember?.length}`;
      } else if (Array.isArray(item._source._memberOf) && item._source._memberOf.length > 0) {
        return `Member of: ${item._source._memberOf[0]['@id']}`;
      }
      return '';
    },
    resizeStop: function (args) {
      const tableWidth = document.getElementsByClassName('table-view')[0].clientWidth;
      let currentColumn = args.column.field;
      let currentWidth = (parseFloat(args.column.width) / tableWidth * 100).toFixed(2) + '%';
      putLocalStorage({
        key: 'tableColumn_' + currentColumn,
        data: {
          field: currentColumn,
          width: currentWidth
        }
      });
    },
    setupColumnChooserMonitor() {
      const okButton = document.querySelector('.e-cc_okbtn');
      if (okButton) {
        okButton.addEventListener('click', function () {
          const items = document.querySelectorAll('.e-cclist.e-cc:not(.e-cc-selectall)');
          var columnOption = {};
          items.forEach(item => {

            const checkbox = item.querySelector('.e-chk-hidden.e-cc.e-cc-chbox');
            const isChecked = checkbox.getAttribute('aria-checked') === 'true';
            const idMatch = item.id.match(/(\d+)$/);
            const idNumber = idMatch ? idMatch[0] : null;

            if (idNumber) {
              columnOption[idNumber] = isChecked;
            }
          });
          putLocalStorage({
            key: 'tableColumnOptions',
            data: columnOption
          });
        });
      }
    },
    setupGroupingMonitor() {
      const targetNode = document.querySelector('.e-groupdroparea');

      const observer = new MutationObserver(mutations => {
        console.log("change monitored");
        var groupColumnNames = [];
        mutations.forEach(mutation => {
          if (mutation.addedNodes.length || mutation.removedNodes.length) {
            const elements = targetNode.querySelectorAll('.e-grid-icon.e-groupheadercell');
            elements.forEach(element => {
              const childDiv = element.querySelector('div[ej-mappingname]');
              if (childDiv) {
                const mappingName = childDiv.getAttribute('ej-mappingname');
                if (!groupColumnNames.includes(mappingName)) {
                  groupColumnNames.push(mappingName);
                }
              }
            });
          }
        });
        putLocalStorage({
          key: 'tableColumnGrouping',
          data: groupColumnNames
        });
      });

      const config = { childList: true, subtree: true };

      observer.observe(targetNode, config);
    },
    getColumnWidth(prop) {
      const width = getLocalStorage({
        key: 'tableColumn_' + prop.name
      });
      if (width && width.field === prop.name && width.width) {
        return width.width;
      } else {
        return prop.width || 'auto';
      }
    },
    getColumnVisibility(index, prop) {
      const columnOptions = getLocalStorage({
        key: 'tableColumnOptions'
      });
      if (columnOptions && columnOptions[index] !== undefined && typeof columnOptions[index] === 'boolean') {
        return columnOptions[index];
      } else {
        return prop.visible;
      }
    },
    getColumnGrouping() {
      const groupedColumnNames = getLocalStorage({
        key: 'tableColumnGrouping'
      });
      if (groupedColumnNames && Array.isArray(groupedColumnNames) && groupedColumnNames.length > 0) {
        this.groupOptions.columns = groupedColumnNames;
      }
    },
    getSearchDetailUrl(item) {
      //console.log(item);
      //TODO: this is not good, maybe do it with a ConformsTo to specify link. But have to think about it because not
      //      all files have conformsTo!
      let url;
      const types = item._source['@type'];
      const repoType = types.find(t => t === 'RepositoryCollection');
      const fileType = types.find(t => t === 'File');
      const itemType = types.find(t => t === 'RepositoryObject');
      let id = encodeURIComponent(item._source['@id']);
      let crateId = encodeURIComponent(first(item._source['_crateId'])?.['@value']);
      if (repoType) {
        url = `/collection?id=${id}&_crateId=${crateId}`
      } else if (itemType) {
        url = `/object?id=${id}&_crateId=${crateId}`
      } else if (fileType) {
        let isNotebook;
        if (item._source?.['conformsTo']) {
          isNotebook = item._source['conformsTo'].find(c => c['@id'] === this.conformsToNotebook);
        }
        if (isNotebook) {
          id = encodeURIComponent(item._id);
          url = `/object?_id=${id}`;
        } else {
          const fileId = id;
          id = encodeURIComponent(first(item._source['_parent'])?.['@id']);
          url = `/object?id=${id}&_crateId=${crateId}&fileId=${fileId}`
        }
      } else {
        //Defaults to object if it doesnt know what it is
        url = `/object?id=${id}&_crateId=${crateId}`
      }
      return url;
    },
  },
};
</script>

<style>
@import url('https://cdn.syncfusion.com/ej2/material.css');

.table-view {
  width: 100%;
  border-collapse: collapse;
}

.table-view th,
.table-view td {
  border: 1px solid #000;
  padding: 8px;
  text-align: left;
}

.table-view th {
  background-color: #f3f3f3;
}

.table-view tbody tr:nth-child(odd) {
  background-color: #fff;
}

.table-view tbody tr:nth-child(even) {
  background-color: #f9f9f9;
}
</style>
