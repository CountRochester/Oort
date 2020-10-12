<template>
  <v-app dark>
    <footerSkb />
    <navbar />>
    <left-drawer />
    <right-drawer />
    <v-main>
      <v-container class="pt-0 px-0 mt-n5 mx-0" fluid>
        <nuxt />
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
// import subworker from '@/utils/subworker'
import { mapState } from 'vuex'
import navbar from '../components/nav'
import footerSkb from '../components/footer'
import leftDrawer from '../components/leftDrawer'
import rightDrawer from '../components/rightDrawer'

export default {
  components: {
    navbar,
    footerSkb,
    leftDrawer,
    rightDrawer
  },
  data () {
    return {
      selectedDep: null
    }
  },
  computed: {
    ...mapState('navInterface', {
      rightDrawer: 'rightDrawer'
    }),
    ...mapState('auth', {
      currentUser: 'currentUser'
    })
  },
  watch: {
    currentUser: {
      deep: true,
      handler (newVal) {
        console.log('newVal', newVal)
        if (newVal.selectedDep && newVal.selectedDep !== this.selectedDep) {
          this.selectedDep = newVal.selectedDep
          this.$parent.context.$storage.setSelectedDepartment(newVal.selectedDep)
        }
      }
    }
  },
  mounted () {
    // await this.$store.dispatch('nuxtServerInit')
    if (!this.$store.state.navInterface.config) {
      this.$store.dispatch('navInterface/loadConfig')
    }
    if (this.currentUser.selectedDep) {
      this.$parent.context.$storage.setSelectedDepartment(this.currentUser.selectedDep)
    }
  }
}
</script>
