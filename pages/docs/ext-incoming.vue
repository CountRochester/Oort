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
    show-expand
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
    <template #expanded-item="{headers, item}">
      <td :colspan="headers.length">
        <v-expansion-panels
          accordion
          popout
          focusable
        >
          <v-expansion-panel>
            <v-expansion-panel-header>
              <strong>Кому адресовано или отписано</strong>
            </v-expansion-panel-header>
            <v-expansion-panel-content>
              <v-list>
                <v-list-item v-for="(el, i) in item.executantsId" :key="i">
                  <v-list-item-content>
                    {{ currentPosition
                      ? currentPosition[el]
                        ? currentPosition[el].posName
                        : 'Неизвестный исполнитель'
                      :'' }}
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-expansion-panel-content>
          </v-expansion-panel>

          <v-expansion-panel>
            <v-expansion-panel-header>
              <strong>Темы</strong>
            </v-expansion-panel-header>
            <v-expansion-panel-content>
              <v-list>
                <v-list-item v-for="(el, j) in item.temasId" :key="j">
                  <v-list-item-content>
                    {{ tema
                      ? tema[el]
                        ? tema[el].name
                        : 'Неизвестная тема'
                      : '' }}
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-expansion-panel-content>
          </v-expansion-panel>

          <v-list-item v-if="item.needAnswer && !item.answersId.length">
            <v-icon color="red">
              mdi-exclamation-thick
            </v-icon>
            <h3 class="pl-5">
              Требуется ответ
            </h3>
          </v-list-item>

          <v-expansion-panel v-if="item.answersId && item.answersId.length">
            <v-expansion-panel-header>
              <strong>Ответ</strong>
            </v-expansion-panel-header>
            <v-expansion-panel-content>
              <v-list>
                <v-list-item
                  v-for="(el, k) in item.answersId"
                  :key="k"
                  @click="viewExtOut(el)"
                >
                  <v-list-item-content>
                    {{ item.answers.length ? item.answers[k] : null }}
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
      </td>
    </template>
    <template #top>
      <tableToolbar
        ref="tableToolbar"
        :default-item="defaultItem"
        :reset="reset"
        :new-item="editItem"
      />
      <!-- ---------------------------------------------------------------------------------- -->
      <!-- ----------------------------Диалог редактирования документа----------------------- -->
      <!-- ---------------------------------------------------------------------------------- -->
      <editExtInc
        ref="editForm"
        :lazy-form="lazy"
        :initialize="initialize"
      />
      <!-- ---------------------------------------------------------------------------------------------------------------- -->
      <!-- -------------------------------------------Диалог просмотра документа------------------------------------------- -->
      <!-- ---------------------------------------------------------------------------------------------------------------- -->
      <viewExtInc ref="viewDialog" :edited-item-id="editedItem.id" />
      <viewExtOut ref="viewOutDialog" />
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

    <template #item.organisation="{ item }">
      <v-list-item v-for="orgId in item.organisationId" :key="orgId" dense class="pl-0 ml-n2">
        <v-icon small>
          mdi-office-building
        </v-icon>
        <span class="pl-1">
          {{ organisation
            ? organisation[orgId]
              ? organisation[orgId].orgName
              : ''
            :'' }}
        </span>
      </v-list-item>
    </template>

    <template #item.dateVx="{ item }">
      {{ item.incDate }}
    </template>

    <template #item.dateIsh="{ item }">
      {{ item.extDate }}
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
import { filter } from '@/utils/filter'
import viewExtInc from '@/components/view-ext-incoming'
import viewExtOut from '@/components/view-ext-outgoing'
import tableToolbar from '@/components/table-toolbar'
import editExtInc from '@/components/edit-ext-incoming'
import { checkUserPermission } from '@/utils/permission'
import { gQLRequestMessage } from '@/utils/gql-request'
import { getFormatedDate } from '@/utils/date.js'
import Rules from '@/utils/rules'
import Messenger from '@/utils/messenger'
import { ExtIncoming } from '@/Storage/ent-methods/ext-incomings'

moment.locale('ru')

export default {
  components: {
    viewExtInc,
    viewExtOut,
    tableToolbar,
    editExtInc
  },
  data () {
    return {
      // --------------------------------Общие-----------------------------------
      storage: this.$docs.buffer,
      messenger: Messenger.getInstance(),
      rules: Rules,
      headers: [
        {
          text: 'Входящий №',
          align: 'left',

          sortable: true,
          class: 'font-weight-medium subtitle-1',
          divider: true,
          width: 120,
          value: 'incNumber'
        },
        {
          text: 'Дата вх.',
          sortable: true,
          class: 'font-weight-medium subtitle-1',
          divider: true,
          width: 120,
          // value: 'incDate'
          value: 'dateVx'
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
          text: 'Откуда',
          sortable: true,
          class: 'font-weight-medium subtitle-1',
          divider: true,
          width: 250,
          value: 'organisations'
        },
        {
          text: 'Исходящий №',
          sortable: true,
          class: 'font-weight-medium subtitle-1',
          divider: true,
          width: 120,
          value: 'extNumber'
        },
        {
          text: 'Дата исх.',
          sortable: true,
          class: 'font-weight-medium subtitle-1',
          divider: true,
          width: 120,
          value: 'dateIsh'
        },
        {
          text: 'Состояние',
          sortable: true,
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
          width: 80,
          value: 'action'
        }
      ],
      editedIndex: -1,
      defaultItem: new ExtIncoming(),
      editedItem: new ExtIncoming(),
      lazy: false,
      editForm: null
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
      const output = filter(this.extIncomings)
      // const output = this.storage?.extIncomings.items || []
      return output
    },

    extIncomings () {
      return this.getter('extIncomings', 'items')
    },
    organisation () {
      return this.getter('organisations', 'indexed')
    },
    currentPosition () {
      return this.getter('currentPositions', 'indexed')
    },
    tema () {
      return this.getter('temas', 'indexed')
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
        this.$refs.editForm.addresseeDeps = []
        this.$refs.editForm.newState = null
        this.busy = false
      } catch (err) {
        throw err
      }
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
        this.$refs.editForm.addresseeDeps = []
        this.$refs.editForm.newState = null
        console.log(this.messenger.getMessages())
        this.busy = false
        console.timeEnd('reset')
        consola.success('Reset ExtIncomings: OK')
      } catch (err) {
        consola.error(err)
      }
    },

    editItem (item) {
      this.editedIndex = item.id || -1
      this.editedItem = this.editedIndex >= 0
        ? this.storage.extIncomings.indexed[item.id].clone()
        : new ExtIncoming()
      this.$refs.editForm.open(this.editedItem)
    },

    viewItem (item) {
      if (this.$refs.viewDialog) {
        this.$refs.viewDialog.viewItem(item.id)
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
