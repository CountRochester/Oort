<template>
  <v-app-bar
    :clipped-left="clipped"
    fixed
    app
  >
    <v-tooltip bottom>
      <template v-slot:activator="{ on: onn }">
        <v-app-bar-nav-icon v-on="onn" @click.stop="toggleLeftDrawer" />
      </template>
      <span>Меню</span>
    </v-tooltip>
    <v-tooltip bottom>
      <template v-slot:activator="{ on: onn }">
        <v-btn
          icon
          @click.stop="toggleLeftDrawerMiniVariant"
          v-on="onn"
        >
          <v-icon>mdi-{{ `chevron-${miniVariant ? 'right' : 'left'}` }}</v-icon>
        </v-btn>
      </template>
      <span>Свернуть/развернуть меню</span>
    </v-tooltip>
    <v-toolbar-title v-text="title" />
    <v-spacer />
    <div v-if="showSearchDoc">
      <searchDocument />
    </div>
    <v-spacer />
    <div v-if="!ok" ref="login">
      <v-btn
        id="login"
        icon
        to="/auth/login"
        @click.stop
        @mouseenter="loginHover = true"
        @mouseleave="loginHover = false"
      >
        <v-icon>mdi-account-arrow-left</v-icon>
      </v-btn>
      <v-tooltip
        v-model="showLogin"
        :disabled="!loginHover"
        activator="#login"
        bottom
      >
        <span>Войти</span>
      </v-tooltip>
    </div>
    <div v-if="!ok" ref="register">
      <v-btn
        v-if="!ok"
        id="register"
        disabled
        icon
        to="/auth/register"
        @click.stop
        @mouseenter="registerHover = true"
        @mouseleave="registerHover = false"
      >
        <v-icon>mdi-account-plus</v-icon>
      </v-btn>
      <v-tooltip
        v-if="!ok"
        v-model="showRegister"
        :disabled="!registerHover"
        activator="#register"
        bottom
      >
        <span>Зарегистрироваться</span>
      </v-tooltip>
    </div>
    <div v-if="ok" ref="logout">
      <v-btn
        id="logout"
        class="mr-0"
        icon
        to="/auth/login?message=logout"
        @click.stop="logout"
        @mouseenter="logoutHover = true"
        @mouseleave="logoutHover = false"
      >
        <v-icon>mdi-logout-variant</v-icon>
      </v-btn>
      <v-tooltip
        v-model="showLogout"
        :disabled="!logoutHover"
        activator="#logout"
        bottom
      >
        <span>Выход</span>
      </v-tooltip>
    </div>
    <div v-if="ok" ref="account">
      <v-btn
        id="account"
        color="rgba(0, 0, 0, 0)"
        tile
        depressed
        to="/auth/user"
        class="mr-10 font-weight-regular text-capitalize"
        @click.stop
        @mouseenter="accountHover = true"
        @mouseleave="accountHover = false"
      >
        <v-icon>mdi-account</v-icon>
        <span>{{ name }}</span>
      </v-btn>
      <v-tooltip
        v-model="showAccount"
        :disabled="!accountHover"
        activator="#account"
        bottom
      >
        <span>Аккаунт</span>
      </v-tooltip>
    </div>
    <v-btn
      v-if="ok"
      icon
      @click.stop="toggleRightDrawer"
    >
      <v-icon>mdi-filter-outline</v-icon>
    </v-btn>
  </v-app-bar>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import searchDocument from '@/components/serch-document'

export default {
  components: {
    searchDocument
  },
  data () {
    return {
      // title: 'СКБ',
      ok: false,
      accountHover: false,
      logoutHover: false,
      registerHover: false,
      loginHover: false,
      showAccount: false,
      showLogout: false,
      showRegister: false,
      showLogin: false
    }
  },
  computed: {
    ...mapGetters({
      user: 'auth/getUser',
      isAuthenticated: 'auth/isAuthenticated',
      miniVariant: 'navInterface/leftMinVar',
      clipped: 'navInterface/leftDrawlerClipped',
      userById: 'auth/getUserById'
    }),
    // ...mapState({
    //   title: 'navInterface/currentTitle'
    // }),
    uri () {
      return this.$route.path
    },
    showSearchDoc () {
      const arr = this.uri.split('/')
      return arr[1] === 'docs'
    },
    title () {
      return this.$store.state.navInterface.currentTitle
    },
    name () {
      if (this.user) {
        if (this.user.employee.id) {
          return this.user.employee.secondName + ' ' + this.user.employee.firstName[0] + '.' + this.user.employee.middleName[0] + '.'
        } else {
          return this.userById[this.user.id] ? this.userById[this.user.id].name : ''
        }
      } else {
        return ''
      }
    }
  },

  watch: {
    isAuthenticated: {
      deep: true,
      immediate: true,
      handler (val) {
        this.ok = val
      }
    },
    accountHover (newVal) {
      this.showAccount = newVal
    },
    logoutHover (newVal) {
      this.showLogout = newVal
    },
    registerHover (newVal) {
      this.showRegister = newVal
    },
    loginHover (newVal) {
      this.showLogin = newVal
    },
    ok (newVal) {
      this.logoutHover = false
    },
    uri (val) {
      console.log('URI:', val)
    }
  },

  async created () {
    await this.fetch('Users')
    console.log(this.uri)
  },

  methods: {
    ...mapActions({
      toggleLeftDrawerMiniVariant: 'navInterface/toggleLeftDrawerMiniVariant',
      toggleLeftDrawer: 'navInterface/toggleLeftDrawer',
      toggleRightDrawer: 'navInterface/toggleRightDrawer',
      fetch: 'fetch',
      logout: 'auth/logout'
    })
  }
}
</script>
