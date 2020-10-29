<template>
  <v-data-table
    ref="table"
    :headers="headers"
    :items="showingItems"
    :search="search"
    :footer-props="{
      itemsPerPageText: 'Записей на странице',
      itemsPerPageAllText: 'все',
      itemsPerPageOptions: [20, 50, 100]
    }"
    :loading="busy"
    multi-sort
    loading-text="Загрузка"
    locale="ru-RU"
    class="elevation-1"
    @click:row="viewItem"
  >
    <template #item.incNumber="{ item }">
      <v-icon v-if="item.needAnswer && !item.answersId.length" color="red">
        mdi-exclamation-thick
      </v-icon>
      {{ item.incNumber }}
    </template>
    <template #top>
      <tableToolbar
        ref="tableToolbar"
        :reset="reset"
      />
      <viewExtInc ref="viewExtInc" :edited-item-id="editedItem.id" />
      <viewExtOut ref="viewExtOut" />
      <viewIntInc ref="viewIntInc" :edited-item-id="editedItem.id" />
      <viewIntOut ref="viewIntOut" />
      <viewInternal ref="viewInternal" :edited-item-id="editedItem.id" />
      <editExtInc ref="editExtInc" :initialize="initialize" />
      <editIntInc ref="editIntInc" :initialize="initialize" />
      <editInternal ref="editInternal" :initialize="initialize" />
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
        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-icon v-if="checkPermiss(16)" :disabled="busy" small v-on="on" @click="deleteItem(item)">
              mdi-delete
            </v-icon>
          </template>
          <span>Удалить</span>
        </v-tooltip>
      </td>
    </template>

    <template #item.number="{ item }">
      <!-- {{ getDocNumber(item) }} -->
      {{ item.incNumber || item.prefix + item.outNumber }}
    </template>
    <template #item.date="{ item }">
      {{ getDocDate(item) }}
    </template>
    <template #item.category="{ item }">
      {{ getDocType(item) }}
    </template>

    <template #no-data>
      <v-btn :disabled="busy" :color="theme.mainTheme.primary" @click="initialize">
        Сбросить
      </v-btn>
    </template>
  </v-data-table>
</template>

<style lang="scss" scoped>
  ::v-deep tbody tr {
    cursor: pointer
  }
</style>

<script>
/* eslint-disable no-useless-escape */
import { mapGetters, mapActions } from 'vuex'
import consola from 'consola'
import moment from 'moment'
// import { filter } from '@/utils/filter'
import tableToolbar from '@/components/table-toolbar'
import { checkUserPermission } from '@/utils/permission'
import { gQLRequestMessage } from '@/utils/gql-request'
import { getFormatedDate } from '@/utils/date.js'
import Rules from '@/utils/rules'
import { ExtIncoming } from '@/Storage/ent-methods/ext-incomings'
import { ExtOutgoing } from '@/Storage/ent-methods/ext-outgoings'
import { IntIncoming } from '@/Storage/ent-methods/int-incomings'
import { IntOutgoing } from '@/Storage/ent-methods/int-outgoings'
import { Internal } from '@/Storage/ent-methods/internals'
import viewExtInc from '@/components/view-ext-incoming'
import viewExtOut from '@/components/view-ext-outgoing'
import editExtInc from '@/components/edit-ext-incoming'
import viewIntInc from '@/components/view-int-incoming'
import viewIntOut from '@/components/view-int-outgoing'
import editIntInc from '@/components/edit-int-incoming'
import viewInternal from '@/components/view-internal'
import editInternal from '@/components/edit-internal'

moment.locale('ru')

export default {
  components: {
    viewExtInc,
    viewExtOut,
    viewIntInc,
    viewIntOut,
    editIntInc,
    viewInternal,
    editInternal,
    tableToolbar,
    editExtInc
  },
  data () {
    return {
      // --------------------------------Общие-----------------------------------
      storage: this.$docs.buffer,
      rules: Rules,
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
          text: 'Категория',
          sortable: false,
          class: 'font-weight-medium subtitle-1',
          divider: true,
          width: 400,
          value: 'category'
        },
        {
          text: 'Состояние',
          sortable: false,
          class: 'font-weight-medium subtitle-1',
          divider: true,
          width: 200,
          value: 'state'
        },
        {
          text: 'Действия',
          sortable: false,
          class: 'font-weight-medium subtitle-1',
          divider: true,
          value: 'action'
        }
      ],
      editedIndex: -1,
      editedItem: {},
      lazy: false
      // ------------------------------------------------------------------------
    }
  },

  computed: {
    search: {
      get () {
        return this.$store.state.navInterface.search
      },
      set (newVal) {
        this.setSearch(newVal)
      }
    },
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
    selectDep () {
      if (this.tableBody) {
        return this.tableBody.selectDep
      } else { return null }
    },
    showingItems () {
      const docsFilteredByExec = this.allIncs.filter(doc => this.getExecutants(doc).includes(this.user.employee.id))
      const output = docsFilteredByExec.filter(doc => doc.state !== 'Исполнено' && doc.state !== 'В деле')
      return output
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
    ...mapGetters({
      user: 'auth/getUser',
      usersDep: 'auth/getUserDep',
      selectedDep: 'auth/getSelectDep',
      userPermission: 'auth/getUserPermission',
      theme: 'navInterface/getTheme'
    })
  },

  async mounted () {
    await this.initialize()
    this.$emit('ready')
  },

  methods: {
    getter (ent, type) {
      if (!this.storage) { return [] }
      if (this.storage[ent].synchronization) { return [] }
      return this.storage[ent][type]
    },
    includesArray (sorceArr, needToFindArr) {
      let output = false
      needToFindArr.forEach((el) => {
        if (sorceArr.includes(el)) { output = true }
      })
      return output
    },
    checkPermiss (val) {
      return checkUserPermission(this.userPermission, val)
    },
    formatDate (val) {
      return getFormatedDate(val)
    },
    ...mapActions({
      setDep: 'auth/selectDep',
      setBusy: 'navInterface/setBusy',
      unsetBusy: 'navInterface/unsetBusy',
      setSearch: 'navInterface/setSearch'
    }),

    async initialize () {
      try {
        this.busy = true
        if (!this.storage.extIncomings.items.length || !this.storage.extIncFiles.items.length) {
          await this.$docs.updateEntitys([
            'extIncomings',
            'extOutgoings',
            'extIncFiles',
            'extOutFiles'
          ])
        }
        this.busy = false
      } catch (err) {
        throw err
      }
    },

    getItemType (item) {
      if (item instanceof ExtIncoming) {
        return {
          typeName: 'Внешний входящий',
          type: 'ExtIncoming',
          class: ExtIncoming,
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
          componentName: 'Internal',
          docNumber: item.incNumber,
          docDate: item.incDate
        }
      }
    },

    getExecutants (item) {
      return item.Resolutions.reduce((acc, res) => [...acc, ...res.executants], [])
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

    async reset () {
      try {
        if (this.selectedDep !== this.selectDep && this.selectDep) {
          this.setDep(this.selectDep)
        }
        console.time('reset')
        this.busy = true
        await this.$docs.updateEntitys([
          'extIncomings',
          'resolutions',
          'extIncStates',
          'extIncFiles',
          'incNumbers'
        ])
        this.busy = false
        console.timeEnd('reset')
        consola.success('Reset ExtIncomings: OK')
      } catch (err) {
        consola.error(err)
      }
    },

    editItem (item) {
      // this.editedIndex = item.id || -1
      // this.editedItem = this.editedIndex >= 0
      //   ? this.storage.extIncomings.indexed[item.id].clone()
      //   : new ExtIncoming()
      // // this.$refs.editForm.open(this.editedItem)
    },

    viewItem (item) {
      // if (this.$refs.viewDialog) {
      //   this.$refs.viewDialog.viewItem(item.id)
      // }
      this.editedItem = item.clone()
      const type = this.getItemType(item)
      const componentName = `view${type.component}`
      if (item instanceof ExtIncoming) {
        if (this.$refs.viewExtInc) {
          this.$refs.viewExtInc.viewItem(item.id)
        }
      } else if (item instanceof ExtOutgoing) {
        if (this.$refs.viewExtOut) {
          this.$refs.viewExtOut.viewItem(item.id)
        }
      } else if (item instanceof IntIncoming) {
        if (this.$refs.viewIntInc) {
          this.$refs.viewIntInc.viewItem(item.id)
        }
      } else if (item instanceof IntOutgoing) {
        if (this.$refs.viewIntOut) {
          this.$refs.viewIntOut.viewItem(item.id)
        }
      } else if (item instanceof Internal) {
        if (this.$refs.viewInternal) {
          this.$refs.viewInternal.viewItem(item.id)
        }
      }
    },

    async viewExtOut (id) {
      await this.$refs.viewOutDialog.viewItem(id)
    },

    async deleteItem (item) {
      const query = `
        mutation {
          deleteExtIncoming (id: ${item.id}) {
            type
            id
            text
            messageType
          }
        }
      `
      this.busy = true
      confirm(
        `Вы уверены, что хотите удалить документ с исх. ${
          item.extNumber
        } от ${getFormatedDate(item.extDate)}?`
      ) && (await gQLRequestMessage(this, query))
      this.busy = false
      await this.initialize()
    }
    // ------------------------------------------------------------------------------------------------------
  },
  middleware: ['auth']
}
</script>
