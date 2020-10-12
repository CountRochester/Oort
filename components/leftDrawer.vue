<template>
  <v-navigation-drawer
    v-model="drawer.drawer"
    :mini-variant="drawer.miniVariant"
    :clipped="clipped"
    fixed
    app
  >
    <v-list>
      <v-list-item
        v-for="(item, i) in items"
        :key="i"
        :to="item.to"
        :disabled="!config"
        router
        exact
      >
        <v-list-item-action>
          <v-tooltip right>
            <template v-slot:activator="{ on: onn }">
              <v-icon v-on="onn">
                {{ item.icon }}
              </v-icon>
            </template>
            <span v-if="drawer.miniVariant">{{ item.title }}</span>
          </v-tooltip>
        </v-list-item-action>
        <v-list-item-content>
          <v-list-item-title v-text="item.title" />
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script>
import { mapState, mapGetters } from 'vuex'

import { checkUserPermission } from '../utils/permission'

export default {
  data () {
    return {
      allItems: [
        {
          icon: 'mdi-home',
          title: 'Главная',
          to: '/main',
          permission: 0
        },
        {
          icon: 'mdi-file-document-box-multiple-outline',
          title: 'Документооборот',
          to: '/docs',
          permission: 1
        },
        {
          icon: 'mdi-cart-outline',
          title: 'Закупки',
          to: '/zakup',
          permission: 1
        },
        {
          icon: 'mdi-factory',
          title: 'Заказы',
          to: '/zakaz',
          permission: 1
        },
        {
          icon: 'mdi-book-information-variant',
          title: 'Справочник',
          to: '/sprav',
          permission: 0
        },
        {
          icon: 'mdi-account-group',
          title: 'Об отделе',
          to: '/depabout',
          permission: 0
        },
        {
          icon: 'mdi-help-box',
          title: 'О сайте',
          to: '/about',
          permission: 0
        },
        {
          icon: 'mdi-account-multiple',
          title: 'Администрирование',
          to: '/admin',
          permission: 255
        }
      ]
    }
  },
  computed: {
    ...mapState('navInterface', {
      drawer: 'leftDrawer',
      config: 'config'
    }),
    ...mapState('auth', {
      user: 'currentUser'
    }),
    ...mapGetters('navInterface', {
      clipped: 'leftDrawlerClipped'
    }),
    items () {
      const arr = []
      for (const item of this.allItems) {
        if (checkUserPermission(this.user.permissions, item.permission)) {
          arr.push(item)
        }
      }
      return arr
    }
  }
}
</script>
