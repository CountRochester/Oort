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
      <v-card outlined>
        <v-card-title>Найти документ</v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="3">
              <v-row class="mr-2">
                <v-col cols="12">
                  <v-text-field
                    v-model="docNumber"
                    label="Номер документа"
                  />
                </v-col>
              </v-row>
              <v-row>
                <v-checkbox
                  v-model="exactMatch"
                  label="Точное совпадение"
                  :false-value="false"
                  color="white"
                />
              </v-row>
            </v-col>
            <v-col cols="5">
              <v-row>
                <v-col cols="6">
                  <v-select
                    v-model="selectedTypes"
                    :items="type"
                    label="Тип документа"
                    multiple
                  />
                </v-col>
                <v-col cols="6">
                  <div class="mt-3">
                    <v-tooltip bottom>
                      <template #activator="{ on: onn }">
                        <v-btn
                          :disabled="busy"
                          :color="theme.tables.buttonColor"
                          dark
                          class="mb-2 mx-1"
                          @click="search"
                          v-on="onn"
                        >
                          <v-icon>mdi-magnify</v-icon>
                        </v-btn>
                      </template>
                      <span>Найти документ</span>
                    </v-tooltip>
                    <v-tooltip bottom>
                      <template #activator="{ on: onn }">
                        <v-btn
                          :disabled="busy"
                          :color="theme.tables.buttonColor"
                          dark
                          class="mb-2 mx-1"
                          @click="searchResult = []"
                          v-on="onn"
                        >
                          <v-icon>mdi-refresh</v-icon>
                        </v-btn>
                      </template>
                      <span>Сбросить результаты поиска</span>
                    </v-tooltip>
                  </div>
                </v-col>
              </v-row>
            </v-col>
          </v-row>
          <v-row>
            <v-container class="my-0 mx-0 px-0 py-0" fluid>
              <v-data-table
                :headers="headers"
                :items="searchResult"
                :loading="busy"
                dense
                class="elevation-1"
                locale="ru-RU"
                multi-sort
                loading-text="Загрузка"
                :footer-props="{
                  itemsPerPageText: 'Записей на странице',
                  itemsPerPageAllText: 'все',
                  itemsPerPageOptions: [20, 50, 100]
                }"
                @click:row="viewItem"
              >
                <template #top>
                  <v-toolbar flat color="light-blue darken-4" dense>
                    <h2>Результаты поиска</h2>
                  </v-toolbar>
                </template>
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
                    <v-icon v-if="checkPermiss(16)" :disabled="busy" small @click="deleteItem(item)">
                      mdi-delete
                    </v-icon>
                  </td>
                </template>
                <template #item.number="{ item }">
                  {{ getDocNumber(item) }}
                </template>
                <template #item.date="{ item }">
                  {{ getDocDate(item) }}
                </template>
                <template #item.incOut="{ item }">
                  {{ getDocType(item) }}
                </template>
              </v-data-table>
            </v-container>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn :disabled="busy" :color="theme.tables.buttonColor" text @click="close">
            Закрыть
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <viewExtInc ref="viewExtInc" :edited-item-id="editedItem.id" />
    <viewExtOut ref="viewExtOut" />
    <viewIntInc ref="viewIntInc" :edited-item-id="editedItem.id" />
    <viewIntOut ref="viewIntOut" />
    <viewInternal ref="viewInternal" :edited-item-id="editedItem.id" />
    <editExtInc ref="editExtInc" :initialize="initialize" />
    <editExtOut ref="editExtOut" :initialize="initialize" />
    <editIntInc ref="editIntInc" :initialize="initialize" />
    <editIntOut ref="editIntOut" :initialize="initialize" />
    <editInternal ref="editInternal" :initialize="initialize" />
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
import { gQLRequestMessage } from '@/utils/gql-request'
import { getFormatedDate } from '@/utils/date.js'
import { ExtIncoming } from '@/Storage/ent-methods/ext-incomings'
import { ExtOutgoing } from '@/Storage/ent-methods/ext-outgoings'
import { IntIncoming } from '@/Storage/ent-methods/int-incomings'
import { IntOutgoing } from '@/Storage/ent-methods/int-outgoings'
import { Internal } from '@/Storage/ent-methods/internals'
import viewExtInc from '@/components/view-ext-incoming'
import viewExtOut from '@/components/view-ext-outgoing'
import editExtInc from '@/components/edit-ext-incoming'
import editExtOut from '@/components/edit-ext-outgoing'
import viewIntInc from '@/components/view-int-incoming'
import viewIntOut from '@/components/view-int-outgoing'
import editIntInc from '@/components/edit-int-incoming'
import editIntOut from '@/components/edit-int-outgoing'
import viewInternal from '@/components/view-internal'
import editInternal from '@/components/edit-internal'

export default {
  components: {
    viewExtInc,
    viewExtOut,
    viewIntInc,
    viewIntOut,
    viewInternal,
    editExtInc,
    editExtOut,
    editIntInc,
    editIntOut,
    editInternal
  },
  data () {
    return {
      type: ['Входящие документы', 'Исходящие документы'],
      dialog: false,
      docNumber: '',
      exactMatch: false,
      storage: this.$docs.buffer,
      selectedTypes: [],
      searchResult: [],
      editedItem: {},
      editedIndex: -1,
      headers: [
        {
          text: 'Номер документа',
          align: 'left',
          sortable: true,
          class: 'font-weight-medium subtitle-1',
          divider: true,
          width: 180,
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
          sortable: true,
          class: 'font-weight-medium subtitle-1',
          divider: true,
          width: 600,
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
      return [...this.extIncomings, ...this.intIncomings, ...this.internals]
    },
    allOuts () {
      return [...this.extOutgoings, ...this.intOutgoings]
    },
    allDocs () {
      return [...this.allIncs, ...this.allOuts]
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
    initialize () {
      this.editedItem = {}
      this.editedIndex = -1
    },
    getItemType (item) {
      if (item instanceof ExtIncoming) {
        return {
          typeName: 'Внешний входящий',
          type: 'ExtIncoming',
          class: ExtIncoming,
          execs: 'executantsId',
          componentName: 'ExtInc',
          docNumber: item.incNumber,
          docDate: item.incDate
        }
      }
      if (item instanceof ExtOutgoing) {
        return {
          typeName: 'Внешний исходящий',
          type: 'ExtOutgoing',
          class: ExtOutgoing,
          execs: 'addresseesId',
          componentName: 'ExtOut',
          docNumber: item.prefix + item.outNumber,
          docDate: item.outDate
        }
      }
      if (item instanceof IntIncoming) {
        return {
          typeName: 'Внутренний входящий',
          type: 'IntIncoming',
          class: IntIncoming,
          execs: 'addresseesId',
          componentName: 'IntInc',
          docNumber: item.incNumber,
          docDate: item.incDate
        }
      }
      if (item instanceof IntOutgoing) {
        return {
          typeName: 'Внутренний исходящий',
          type: 'IntOutgoing',
          class: IntOutgoing,
          execs: 'addresseesId',
          componentName: 'IntOut',
          docNumber: item.outNumber,
          docDate: item.outDate
        }
      }
      if (item instanceof Internal) {
        return {
          typeName: 'Прочие',
          type: 'Internal',
          class: Internal,
          execs: 'addresseesId',
          componentName: 'Internal',
          docNumber: item.incNumber,
          docDate: item.incDate
        }
      }
    },
    getDocType (item) {
      const itemType = this.getItemType(item)
      return itemType ? itemType.typeName : 'Неизвестный тип документа'
    },
    getDocNumber (item) {
      const itemType = this.getItemType(item)
      return itemType ? itemType.docNumber : 'Неизвестный тип документа'
    },
    getDocDate (item) {
      const itemType = this.getItemType(item)
      return itemType ? itemType.docDate : 'Неизвестный тип документа'
    },
    open () {
      this.dialog = true
    },
    close () {
      this.initialize()
      this.selectedTypes = []
      this.searchResult = []
      this.exactMatch = false
      this.docNumber = ''
      this.dialog = false
    },
    async deleteItem (item) {
      const itemType = this.getItemType(item)
      if (!itemType) { return }
      const query = `
        mutation {
          delete${itemType.type} (id: ${item.id}) {
            type
            id
            text
            messageType
          }
        }
      `
      this.busy = true
      confirm(
        `Вы уверены, что хотите удалить документ ${itemType.docNumber} от ${getFormatedDate(itemType.docDate)}?`
      ) && (await gQLRequestMessage(this, query))
      this.busy = false
      this.initialize()
    },
    viewItem (item) {
      this.editedItem = item.clone()
      const type = this.getItemType(item)
      const componentName = `view${type.componentName}`
      if (type !== 'Неизвестный тип документа') {
        if (this.$refs[componentName]) {
          this.$refs[componentName].viewItem(item.id)
        }
      }
    },
    editItem (item) {
      this.editedItem = item.clone()
      this.editedIndex = item.id || -1
      const type = this.getItemType(item)
      const componentName = `edit${type.componentName}`
      if (type !== 'Неизвестный тип документа') {
        if (this.$refs[componentName]) {
          this.$refs[componentName].open(this.editedItem)
        }
      }
    },
    search () {
      this.busy = true
      const output = []
      let arrayToSearchIn = []
      if (this.selectedTypes.length === 1) {
        if (this.selectedTypes[0] === 'Входящие документы') {
          arrayToSearchIn = this.allIncs
        } else {
          arrayToSearchIn = this.allOuts
        }
      } else {
        arrayToSearchIn = this.allDocs
      }
      if (!this.exactMatch) {
        for (let i = 0; i < arrayToSearchIn.length; i++) {
          const item = arrayToSearchIn[i]
          if (item.incNumber && item.incNumber.includes(this.docNumber)) {
            output.push(item)
          } else if (item.outNumber && item.outNumber.includes(this.docNumber)) {
            output.push(item)
          }
        }
      } else {
        for (let i = 0; i < arrayToSearchIn.length; i++) {
          const item = arrayToSearchIn[i]
          if (item.incNumber && item.incNumber === this.docNumber) {
            output.push(item)
          } else if (item.outNumber && item.outNumber === this.docNumber) {
            output.push(item)
          }
        }
      }
      this.busy = false
      this.searchResult = output
    }
  }
}
</script>
