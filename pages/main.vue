<template>
  <v-layout
    column
    justify-left
    align-left
  >
    <v-flex
      xs12
      sm8
      md6
    >
      <v-container>
        <v-card
          min-width="1100"
          max-width="1200"
          color="grey darken-4"
        >
          <v-toolbar
            color="blue darken-3"
            height="100"
            dark
          >
            <h1 class="display-2 font-weight-medium text-center my-5">
              СПЕЦИАЛЬНОЕ КОНСТРУКТОРСКОЕ БЮРО
            </h1>
          </v-toolbar>
          <v-card-text>
            <p class="headline white--text">
              Данный сайт существует исключительно на инициативной основе.
            </p>
            <p class="headline white--text">
              В настоящее время сайт работает в тестовом режиме. Работает <strong>ТОЛЬКО</strong> система электронного документооборота. О всех найденных багах и ошибках,
              в том числе логических, просьба сообщать в whatsapp 8-903-554-01-09. Спасибо.
            </p>
            <p class="headline white--text mt-10">
              Для доступа к системе документооборота нажмите кнопку в панели слева.
            </p>
          </v-card-text>
        </v-card>
      </v-container>
    </v-flex>
  </v-layout>
</template>

<script>
// import gql from 'graphql-tag'
// import Docs from '@/Storage/docs'
import { mapActions } from 'vuex'
import Messenger from '@/utils/messenger'
// console.log(this.$apollo.subscriptions)
export default {
  data () {
    return {
      subs: '',
      client: this.$apollo.getClient()
    }
  },
  // apollo: {
  //   $subscribe: {
  //     subs: {
  //       query: gql`
  //               subscription {
  //                 contractDeleted
  //               }`,
  //       result ({ data, key }) {
  //         console.log('data')
  //         console.log(data)
  //         console.log('key')
  //         console.log(key)
  //         this.subs = data
  //       }
  //     }
  //   }
  // },
  middleware: ['auth'],
  messenger: Messenger.getInstance(),
  mounted () {
    // await window.$nuxt.$docs.updateAll()
    // await this.$store.dispatch('nuxtServerInit')
    this.setTitle('')
  },
  methods: {
    ...mapActions({
      setTitle: 'navInterface/setTitle'
    })
  }
}
</script>
