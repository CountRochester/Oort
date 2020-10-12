<template>
  <v-footer
    :fixed="fixed"
    app
    class="my-0 py-0 px-0"
  >
    <v-col cols="4" class="my-0 py-0">
      <span>{{ loadingData.loadingMessage }}</span>
    </v-col>
    <v-divider vertical />
    <v-col cols="7" class="my-0 py-0">
      <v-progress-linear :value="loadingData.loadingProgress" />
    </v-col>
    <v-divider vertical />
    <v-col cols="1" class="my-0 mr-n1 ml-0 py-0 px-3">
      <v-icon :color="icon.color">
        {{ icon.icon }}
      </v-icon>
      <div class="float-right">
        <span>&copy; 2020</span>
      </div>
    </v-col>
  </v-footer>
</template>

<script>

export default {

  data () {
    return {
      fixed: false,
      icons: {
        success: { icon: 'mdi-check-circle-outline', color: 'success' },
        warning: { icon: 'mdi-alert-outline', color: 'warning' },
        pending: { icon: 'mdi-autorenew', color: 'primary' },
        error: { icon: 'mdi-alert-outline', color: 'error' },
        none: { icon: 'mdi-brain', color: 'primary' }
      }
    }
  },
  computed: {
    loadingData () {
      return this.$store.state.navInterface.loadingData
    },
    icon () {
      return this.icons[this.loadingData.loadingStatus] || this.icons.none
    }
  }
}
</script>
