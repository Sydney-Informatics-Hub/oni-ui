<template>
  <table class="table-auto">
    <tbody>
      <tr v-for="item in tableData">
        <td class="font-bold">{{ getLabelDisplay(item.label) }}</td>
        <td>
          <div v-if="Array.isArray(item.value)">
            <div v-for="val in item.value">
              <div v-if="isUrl(val)">
                <a :href="val" class="underline text-blue-600 hover:text-blue-800 visited:text-purple-600"> {{ val
                }} </a>
              </div>
              <div v-else> {{ val }}</div>
            </div>
          </div>
          <div v-else>
            {{ item.value }}
          </div>
        </td>
      </tr>
    </tbody>
  </table>
</template>
<script>

import { readValue, isUrl, getLabelDisplay } from '@/generalFunctions';

export default {
  props: {
    tableData: Array
  },
  methods: {
    readValue,
    getLabelDisplay,
    isUrl
  }
}
</script>

<style>
.table-auto {
  width: 50%;
  margin-right: 2rem;
  border: 2px solid black;
}

.table-auto tbody tr:nth-child(even) {
  background-color: #EEEEEE;
}

td {
  padding: 0.5rem;
}
</style>