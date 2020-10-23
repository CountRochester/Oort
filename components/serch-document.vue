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
              <v-row>
                <v-text-field
                  v-model="docNumber"
                  label="Номер документа"
                />
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
              </v-row>
            </v-col>
          </v-row>
          <v-row>
            <v-data-table
              :headers="headers"
              :items="searchResult"
              :loading="busy"
              dense
              class="elevation-1"
              locale="ru-RU"
              loading-text="Загрузка"
              :footer-props="{
                itemsPerPageText: 'Записей на странице',
                itemsPerPageAllText: 'все',
                itemsPerPageOptions: [20, 50, 100]
              }"
            >
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
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn :disabled="busy" :color="theme.tables.buttonColor" text @click="close">
            Закрыть
          </v-btn>
          <!-- <v-btn :disabled="busy" :color="theme.tables.buttonColor" text @click="search">
            Найти
          </v-btn> -->
        </v-card-actions>
      </v-card>
    </v-dialog>
    <viewExtInc ref="viewExtInc" :edited-item-id="editedItem.id" />
    <viewExtOut ref="viewExtOut" />
    <viewInternal ref="viewInternal" :edited-item-id="editedItem.id" />
    <editExtInc ref="editExtInc" :initialize="initialize" />
    <editExtOut ref="editExtOut" :initialize="initialize" />
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
      storage: this.$docs.buffer,
      searchResult: [],
      selectedType: 'Входящие документы',
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
          sortable: false,
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
          // width: 80,
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
    getDocType (item) {
      if (item instanceof ExtIncoming) { return 'Внешний входящий' }
      if (item instanceof ExtOutgoing) { return 'Внешний исходящий' }
      if (item instanceof IntIncoming) { return 'Внутренний входящий' }
      if (item instanceof IntOutgoing) { return 'Внутренний входящий' }
      if (item instanceof Internal) { return 'Прочие' }
      return 'Неизвестный тип документа'
    },
    getDocNumber (item) {
      if (item instanceof ExtIncoming) { return item.incNumber }
      if (item instanceof ExtOutgoing) { return item.prefix + item.outNumber }
      if (item instanceof IntIncoming) { return item.incNumber }
      if (item instanceof IntOutgoing) { return item.outNumber }
      if (item instanceof Internal) { return item.incNumber }
      return 'Неизвестный тип документа'
    },
    getDocDate (item) {
      if (item instanceof ExtIncoming) { return item.incDate }
      if (item instanceof ExtOutgoing) { return item.outDate }
      if (item instanceof IntIncoming) { return item.incDate }
      if (item instanceof IntOutgoing) { return item.outDate }
      if (item instanceof Internal) { return item.incDate }
      return 'Неизвестный тип документа'
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
      this.busy = true
      const output = []
      let rowName
      let arrayToSearchIn
      if (this.type === 'Входящие документы') {
        arrayToSearchIn = this.allIncs
        rowName = 'incNumber'
      } else {
        arrayToSearchIn = this.allOuts
        rowName = 'outNumber'
      }
      for (let i = 0; i < arrayToSearchIn.length; i++) {
        const item = arrayToSearchIn[i]
        if (item[rowName].includes(this.docNumber)) {
          output.push(item)
        }
      }
      this.busy = false
      console.log('output', output)
      this.searchResult = output
    }
  }
}
</script>
