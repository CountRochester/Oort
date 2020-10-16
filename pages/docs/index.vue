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
      <v-container class="my-0 mx-0 px-0 py-0" fluid>
        <!-- Категории -->
        <v-tabs
          id="vtabs"
          :background-color="theme.tables.menu"
          :color="theme.tables.menuText"
          height="40"
          dark
        >
          <v-tabs-slider :color="theme.tables.sliderColor" />
          <v-tab
            v-for="tab in catItems"
            :id="tab.title"
            :ref="tab.title"
            :key="tab.title"
            :disabled="tab.disabled"
          >
            <v-menu offset-y>
              <template v-slot:activator="{ on }">
                <div
                  class="d-flex"
                  v-on="on"
                  @click="currentCat = tab.title"
                >
                  <v-col cols="1">
                    <v-icon>
                      {{ tab.icon }}
                    </v-icon>
                  </v-col>
                  <v-col cols="11">
                    {{ tab.title }}
                  </v-col>
                </div>
              </template>
              <v-list
                :color="theme.tables.menu"
              >
                <v-list-item
                  v-for="(item, index) in items"
                  :key="index"
                  @click="selectTab(item)"
                >
                  <v-list-item-icon>
                    <v-icon>
                      {{ item.icon }}
                    </v-icon>
                  </v-list-item-icon>

                  <v-list-item-title>{{ item.title }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </v-tab>
        </v-tabs>
        <!-- eslint-disable-next-line vue/require-component-is -->
        <component :is="selectedComponent" />
      </v-container>
    </v-flex>
  </v-layout>
</template>

<script>
import { mapState, mapActions, mapMutations, mapGetters } from 'vuex'
import * as subscriptions from '@/subscriptions'
import { checkUserPermission } from '../../utils/permission'

import Contract from './contract'
import Department from './department'
import Employee from './employee'
import ExtEmployee from './ext-employee'
import ExtIncoming from './ext-incoming'
import ExtOutgoing from './ext-outgoing'
import IntIncoming from './int-incoming'
import IntOutgoing from './int-outgoing'
import Internal from './internal'
import Organisation from './organisation'
import Position from './position'
import State from './state'
import Subdivision from './subdivision'
import Tema from './tema'
import Type from './type'
import MyIncoming from './my-docs/my-incoming'

export default {
  data () {
    return {
      docs: null,
      dialog: false,
      currentCat: 'Внешние документы',
      // tabs: document.querySelectorAll()
      tabCat: [
        { title: 'Мои входящие документы', icon: 'mdi-web', permission: 1, disabled: true },
        { title: 'Мои исходящие документы', icon: 'mdi-web', permission: 1, disabled: true },
        { title: 'Внешние документы', icon: 'mdi-web', permission: 1 },
        { title: 'Внутренние документы', icon: 'mdi-office-building', permission: 1 },
        { title: 'Прочее', icon: 'mdi-bookshelf', permission: 1 },
        { title: 'Служебная информация', icon: 'mdi-cog', permission: 2 }
      ],
      tabList: [
        {
          title: 'Мои входящие документы в работе',
          ref: '#personalIncDocs',
          permission: 1,
          icon: 'mdi-email-receive',
          cat: 'Мои входящие документы',
          component: MyIncoming
        },
        {
          title: 'Входящие документы подразделения',
          ref: '#subdivisionIncDocs',
          permission: 1,
          icon: 'mdi-email-receive',
          cat: 'Мои входящие документы',
          component: ExtIncoming
        },
        {
          title: 'Входящие документы отдела',
          ref: '#departmentIncDocs',
          permission: 16,
          icon: 'mdi-email-receive',
          cat: 'Мои входящие документы',
          component: ExtIncoming
        },
        {
          title: 'Мои исходящие документы в работе',
          ref: '#personalOutDocs',
          permission: 1,
          icon: 'mdi-email-receive',
          cat: 'Мои исходящие документы',
          component: ExtIncoming
        },
        {
          title: 'Исходящие документы подразделения',
          ref: '#subdivisionOutDocs',
          permission: 1,
          icon: 'mdi-email-receive',
          cat: 'Мои исходящие документы',
          component: ExtIncoming
        },
        {
          title: 'Исходящие документы отдела',
          ref: '#departmentOutDocs',
          permission: 16,
          icon: 'mdi-email-receive',
          cat: 'Мои исходящие документы',
          component: ExtIncoming
        },
        {
          title: 'Входящие внешние документы',
          ref: '#extIncoming',
          permission: 1,
          icon: 'mdi-email-receive',
          cat: 'Внешние документы',
          component: ExtIncoming
        },

        {
          title: 'Исходящие внешние документы',
          ref: '#extOutgoing',
          permission: 1,
          icon: 'mdi-email-send',
          cat: 'Внешние документы',
          component: ExtOutgoing
        },

        {
          title: 'Входящие внутренние документы',
          ref: '#intIncoming',
          permission: 1,
          icon: 'mdi-arrow-bottom-right-bold-outline',
          cat: 'Внутренние документы',
          component: IntIncoming
        },

        {
          title: 'Исходящие внутренние документы',
          ref: '#intOutgoing',
          permission: 1,
          icon: 'mdi-arrow-top-left-bold-outline',
          cat: 'Внутренние документы',
          component: IntOutgoing
        },

        {
          title: 'Внутренние документы',
          ref: '#internal',
          permission: 1,
          icon: 'mdi-text-box-outline',
          cat: 'Прочее',
          component: Internal
        },

        {
          title: 'Работники',
          ref: '#employee',
          permission: 2,
          icon: 'mdi-account-hard-hat',
          cat: 'Служебная информация',
          component: Employee
        },

        {
          title: 'Отделы',
          ref: '#department',
          permission: 2,
          icon: 'mdi-account-group-outline',
          cat: 'Служебная информация',
          component: Department
        },

        {
          title: 'Должности',
          ref: '#position',
          permission: 2,
          icon: 'mdi-sitemap',
          cat: 'Служебная информация',
          component: Position
        },

        {
          title: 'Темы',
          ref: '#tema',
          permission: 2,
          icon: 'mdi-shape',
          cat: 'Служебная информация',
          component: Tema
        },

        {
          title: 'Контракты',
          ref: '#contract',
          permission: 2,
          icon: 'mdi-script-outline',
          cat: 'Служебная информация',
          component: Contract
        },

        {
          title: 'Внешние респонденты',
          ref: '#extEmployee',
          permission: 2,
          icon: 'mdi-account-network-outline',
          cat: 'Служебная информация',
          component: ExtEmployee
        },

        {
          title: 'Организации',
          ref: '#organisation',
          permission: 2,
          icon: 'mdi-bank',
          cat: 'Служебная информация',
          component: Organisation
        },

        {
          title: 'Состояния',
          ref: '#state',
          permission: 2,
          icon: 'mdi-format-list-numbered',
          cat: 'Служебная информация',
          component: State
        },

        {
          title: 'Типы документов',
          ref: '#type',
          permission: 2,
          icon: 'mdi-file-code-outline',
          cat: 'Служебная информация',
          component: Type
        },

        {
          title: 'Подразделения',
          ref: '#subdivision',
          permission: 2,
          icon: 'mdi-google-circles-extended',
          cat: 'Служебная информация',
          component: Subdivision
        }
      ]
      // selectedTab: document.getElementById('Внешние документы')
      // selectedTab: null
    }
  },

  computed: {
    ...mapState('navInterface', {
      currentItem: 'selectedDocsTab',
      config: 'config'
    }),
    ...mapGetters({
      theme: 'navInterface/getTheme'
    }),
    user: {
      get () {
        return this.$store.state.auth.currentUser
      },
      set () {}
    },
    selectedComponent () {
      // const name = this.currentItem.slice(1).replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`)
      // return () => import(`./${name}`)
      const tab = this.tabList.find(el => el.ref === this.currentItem)
      return tab.component
    },
    selectedTab () {
      const tab = this.tabList.find(el => el.ref === this.currentItem)
      const id = tab ? tab.cat : 'Внешние документы'
      this.setTitle(tab.title)
      if (document) {
        const selTab = document.getElementById(id)
        selTab.click()
        this.selectDocsTab(tab.ref)
        return selTab
      } else { return null }
    },
    catItems () {
      const arr = []
      for (const item of this.tabCat) {
        if (checkUserPermission(this.user.permissions, item.permission)) {
          arr.push(item)
        }
      }
      return arr
    },

    items () {
      const arr = []
      for (const item of this.tabList) {
        if (checkUserPermission(this.user.permissions, item.permission) &&
          item.cat === this.currentCat) {
          arr.push(item)
        }
      }
      return arr
    }
  },

  apollo: {
    $subscribe: { ...subscriptions.default }
  },

  mounted () {
    this.selectedTab.click()
  },

  methods: {
    ...mapActions({
      selectDocsTab: 'navInterface/selectDocsTab',
      resetFilters: 'navInterface/resetFilters',
      setTitle: 'navInterface/setTitle',
      modify: 'docs/modify',
      modifyAuth: 'auth/modify'
    }),
    ...mapMutations({
      addDocs: 'docs/add',
      editDocs: 'docs/hardEdit',
      findAndDeleteById: 'docs/findAndDeleteById'
    }),

    selectTab (tab) {
      this.resetFilters()
      this.setTitle(tab.title)
      this.selectDocsTab(tab.ref)
      this.selectedTab.click()
    }
  },

  middleware: ['auth', 'storage-ok']
}
</script>
