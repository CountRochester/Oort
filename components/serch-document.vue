<template>
  <div>
    <v-tooltip bottom>
      <template #activator="{ on: onn }">
        <v-btn
          :disabled="busy"
          :color="theme.tables.menuText"
          dark
          class="mb-2 mx-1"
          icon
          @click="open"
          v-on="onn"
        >
          <v-icon>mdi-magnify</v-icon>
        </v-btn>
      </template>
      <span>Найти документ</span>
    </v-tooltip>
    <v-dialog
      v-model="dialog"
      max-width="1500px"
      open-on-focus
      @keydown.enter.prevent="search"
      @keydown.esc.prevent="close"
    >
      <v-card>
        <v-card-title>Найти документ</v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="4">
              <v-select
                v-model="selectedType"
                :items="type"
                label="Тип документа"
              />
            </v-col>
            <v-col cols="4">
              <v-text-field
                v-model="docNumber"
                label="Номер документа"
              />
            </v-col>
          </v-row>
          <v-row>
            <v-data-table
              :headers="headers"
              :items="searchResult"
              :loading="busy"
              dense
              class="elevation-1"
              hide-default-footer
              loading-text="Загрузка"
            >
              <!-- <template #top>
              </template> -->
              <template #item.action="{ item }">
                <td @click.stop>
                  <v-tooltip bottom>
                    <template v-slot:activator="{ on }">
                      <v-icon :disabled="busy" small class="mr-2" v-on="on" @click="editItem(item)">
                        mdi-pencil
                      </v-icon>
                    </template>
                    <span>Редактирование</span>
                  </v-tooltip>
                  <v-icon v-if="checkPermiss(1)" :disabled="busy" small @click="deleteItem(item)">
                    mdi-delete
                  </v-icon>
                </td>
              </template>
            </v-data-table>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn :disabled="busy" :color="theme.tables.buttonColor" text @click="close">
            Отмена
          </v-btn>
          <v-btn :disabled="busy" :color="theme.tables.buttonColor" text @click="search">
            Найти
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style lang="scss" scoped>
  ::v-deep tbody tr {
    cursor: pointer
  }
</style>

<script>
import { mapGetters, mapActions } from 'vuex'
import { checkUserPermission } from '@/utils/permission'

export default {
  data () {
    return {
      type: ['Входящие документы', 'Исходящие документы'],
      dialog: false,
      docNumber: '',
      searchResult: [],
      selectedType: 'Входящие документы',
      headers: [
        {
          text: 'Номер документа',
          align: 'left',
          sortable: true,
          class: 'font-weight-medium subtitle-1',
          divider: true,
          width: 120,
          value: 'number'
        },
        {
          text: 'Дата',
          sortable: true,
          class: 'font-weight-medium subtitle-1',
          divider: true,
          width: 120,
          value: 'date'
        },
        {
          text: 'Краткое содержание',
          sortable: false,
          class: 'font-weight-medium subtitle-1',
          divider: true,
          width: 400,
          value: 'subject'
        },
        {
          text: 'Внутренний/внешний',
          sortable: false,
          class: 'font-weight-medium subtitle-1',
          divider: true,
          width: 400,
          value: 'incOut'
        },
        {
          text: 'Действия',
          sortable: false,
          class: 'font-weight-medium subtitle-1',
          divider: true,
          width: 80,
          value: 'action'
        }
      ]
    }
  },

  computed: {
    ...mapGetters({
      user: 'auth/getUser',
      usersDep: 'auth/getUserDep',
      selectedDep: 'auth/getSelectDep',
      userPermission: 'auth/getUserPermission',
      theme: 'navInterface/getTheme'
    }),
    busy: {
      get () {
        return this.$store.state.navInterface.busy
      },
      set (newVal) {
        if (newVal === true) {
          this.setBusy()
        } else if (newVal === false) {
          this.unsetBusy()
        }
      }
    },
    extIncomings () {
      return this.getter('extIncomings', 'items')
    },
    intIncomings () {
      return this.getter('intIncomings', 'items')
    },
    extOutgoings () {
      return this.getter('extOutgoings', 'items')
    },
    intOutgoings () {
      return this.getter('intOutgoings', 'items')
    },
    internals () {
      return this.getter('internals', 'items')
    },
    allIncs () {
      return [...this.extIncomings, ...this.intIncomings, this.internals]
    },
    allOuts () {
      return [...this.extOutgoings, ...this.intOutgoings]
    },
    items () {
      return this.selectedType === 'Входящие документы'
        ? this.allIncs
        : this.allOuts
    }
  },

  methods: {
    ...mapActions({
      setBusy: 'navInterface/setBusy',
      unsetBusy: 'navInterface/unsetBusy'
    }),
    getter (ent, type) {
      if (!this.storage) { return [] }
      if (this.storage[ent].synchronization) { return [] }
      return this.storage[ent][type]
    },
    checkPermiss (val) {
      return checkUserPermission(this.userPermission, val)
    },
    open () {
      this.dialog = true
    },
    close () {
      this.docNumber = ''
      this.dialog = false
    },
    editItem (item) {

    },
    deleteItem (item) {

    },
    search () {

    }
  }
}
</script>
