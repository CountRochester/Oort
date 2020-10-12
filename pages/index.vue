<template>
  <v-layout
    column
    justify-center
    align-center
  >
    <v-flex
      xs12
      sm8
      md6
    >
      <div class="text-center" />
      <v-card>
        <v-card-title class="headline">
          <h2>СПЕЦИАЛЬНОЕ КОНСТРУКТОРСКОЕ БЮРО</h2>
        </v-card-title>
        <v-card-text>
          <h2 class="mb-4 text-center">
            Добро пожаловать
          </h2>
          <p>Для продолжения нажмите на кнопку продолжить</p>
          <p>
            Для работы с базами данных необходимо авторизироваться
          </p>
          <hr class="my-3">
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            :to="link"
            color="primary"
            :disabled="!config"
            nuxt
          >
            Продолжить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-flex>
    <v-overlay :value="!firstInit">
      <v-progress-circular indeterminate size="64" width="7" />
      <!-- <v-progress-circular :value="loadingData.loadingProgress" size="64" width="10" /> -->
    </v-overlay>
  </v-layout>
</template>
<script>

import { mapGetters, mapState } from 'vuex'
// import { app } from '@/utils/is-client'

export default {
  components: {
  },
  data () {
    return {
      firstInit: false
    }
  },
  computed: {
    ...mapState('navInterface', {
      config: 'config',
      loadingData: 'loadingData'
    }),
    ...mapGetters({
      isAuth: 'auth/isAuthenticated'
    }),
    link () {
      return this.isAuth ? '/main' : '/auth/login'
    }
  },
  watch: {
    // async firstInit (val) {
    //   if (val) {
    //     this.$nuxt.$loading.start()
    //     await this.$docs.updateAll()
    //     this.$nuxt.$loading.finish()
    //   }
    // }
    // loadingData: {
    //   deep: true,
    //   handler (newVal) {
    //     console.log(newVal)
    //   }
    // }

  },
  mounted () {
    // const _app = app()
    this.firstInit = this.$docs.firstInit.init
    this.$nextTick(() => {
      // this.$nuxt.$loading.start()
      this.$store.dispatch('navInterface/loadConfig')
      // this.$nuxt.$loading.finish()
    })
  }
}
</script>
