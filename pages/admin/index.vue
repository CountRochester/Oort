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
      <v-container class="my-0 py-0">
        <v-tabs
          fixed-tabs
          background-color="grey darken-4"
          color="white"
          height="60"
          dark
        >
          <v-tabs-slider color="white" />
          <v-tab
            href="#Users"
            @click="currentItem = '#Users'"
          >
            Пользователи
          </v-tab>
          <v-tab
            href="#Groups"
            @click="currentItem = '#Groups'"
          >
            Группы
          </v-tab>
        </v-tabs>
        <Users v-if="currentItem==='#Users'" />
        <Groups v-if="currentItem==='#Groups'" />
      </v-container>
    </v-flex>
  </v-layout>
</template>

<script>
// import serverRequest from '../utils/graphqlquery'
import Users from './users'
import Groups from './groups'

export default {
  components: {
    Users,
    Groups
  },
  data () {
    return {
      dialog: false,
      currentItem: '#Users'
    }
  },

  computed: {
  },

  watch: {
  },

  created () {
  },

  methods: {
  },

  middleware: ['auth', 'policy-admin']
}
</script>
