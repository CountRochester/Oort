<template>
  <v-data-table
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
    <template #expanded-item="{headers, item}">
      <td :colspan="headers.length">
        <v-expansion-panels
          accordion
          popout
          focusable
        >
          <v-expansion-panel>
            <v-expansion-panel-header>
              <strong>Кому адресовано</strong>
            </v-expansion-panel-header>
            <v-expansion-panel-content>
              <v-list>
                <v-list-item v-for="(el, i) in item.addresseesId" :key="i">
                  <v-list-item-content>
                    {{ podpisant[el] ? `${podpisant[el].posName}` : 'Неизвестный адресат' }}
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
                    {{ tema[el] ? tema[el].name : 'Неизвестная тема' }}
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-expansion-panel-content>
          </v-expansion-panel>

          <v-expansion-panel v-if="item.isAnswerOnId.length">
            <v-expansion-panel-header>
              <strong>Ответ на</strong>
            </v-expansion-panel-header>
            <v-expansion-panel-content>
              <v-list>
                <v-list-item
                  v-for="(el, k) in item.isAnswerOnId"
                  :key="k"
                  @click="viewIntInc(el)"
                >
                  <v-list-item-content>
                    {{ item.isAnswerOn.length ? item.isAnswerOn[k] : null }}
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
      <editIntOut
        ref="editForm"
        :lazy-form="lazy"
        :initialize="initialize"
      />
      <!-- ---------------------------------------------------------------------------------------------------------------- -->
      <!-- -------------------------------------------Диалог просмотра документа------------------------------------------- -->
      <!-- ---------------------------------------------------------------------------------------------------------------- -->
      <viewIntOut
        ref="viewDialog"
        :edited-item-id="editedItem.id"
      />
      <viewIntInc
        ref="viewIncDialog"
      />
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
        <v-icon
          v-if="checkPermiss(16)"
          :disabled="busy"
          small
          @click="deleteItem(item)"
        >
          mdi-delete
        </v-icon>
      </td>
    </template>

    <template #item.dateIsh="{ item }">
      {{ item.outDate }}
    </template>

    <template #item.addressees="{ item }">
      <v-list-item v-for="adr in item.Addressees" :key="adr.id" dense class="pl-0 ml-n2">
        <v-icon small>
          mdi-google-street-view
        </v-icon>
        <span class="pl-1">
          {{ adr ? adr.employee : '' }}
        </span>
        <span class="pl-1">
          {{ adr ? `(${adr.department})` : '' }}
        </span>
      </v-list-item>
    </template>

    <template #item.podpisants="{ item }">
      <v-list-item v-for="podp in item.Podpisants" :key="podp.id" dense class="pl-0 ml-n2">
        <v-icon small>
          mdi-google-street-view
        </v-icon>
        <span class="pl-1">
          {{ podp ? podp.employee : '' }}
        </span>
        <span class="pl-1">
          {{ podp ? `(${podp.department})` : '' }}
        </span>
      </v-list-item>
    </template>

    <template #item.author="{ item }">
      {{ item.Author.employee }}
    </template>

    <template #no-data>
      <v-btn :disabled="busy" :color="theme.mainTheme.primary" @click="initialize">
        Сбросить
      </v-btn>
    </template>
  </v-data-table>
</template>

<script>
/* eslint-disable no-useless-escape */
import { mapGetters, mapActions } from 'vuex'
import moment from 'moment'
import { checkUserPermission } from '@/utils/permission'
import { gQLRequestMessage } from '@/utils/gql-request'
import { getFormatedDate } from '@/utils/date.js'
import { filter } from '@/utils/filter'
import viewIntInc from '@/components/view-int-incoming'
import Rules from '@/utils/rules'
import viewIntOut from '@/components/view-int-outgoing'
import { IntOutgoing } from '@/Storage/ent-methods/int-outgoings'
import editIntOut from '@/components/edit-int-outgoing'
import tableToolbar from '@/components/table-toolbar'

moment.locale('ru')

export default {
  components: {
    tableToolbar,
    editIntOut,
    viewIntOut,
    viewIntInc
  },
  data () {
    return {

      // --------------------------------Общие-----------------------------------
      storage: this.$docs.buffer,
      rules: Rules,
      headers: [
        {
          text: 'Исходящий №',
          align: 'left',
          sortable: true,
          class: 'font-weight-medium subtitle-1',
          divider: true,
          width: 100,
          value: 'outNumber'
        },

        {
          text: 'Дата исх.',
          sortable: true,
          class: 'font-weight-medium subtitle-1',
          divider: true,
          width: 100,
          value: 'dateIsh'
        },

        {
          text: 'Краткое содержание',
          sortable: false,
          class: 'font-weight-medium subtitle-1',
          divider: true,
          width: 300,
          value: 'subject'
        },

        {
          text: 'Кому',
          sortable: true,
          class: 'font-weight-medium subtitle-1',
          divider: true,
          width: 250,
          value: 'addressees'
        },

        {
          text: 'Ответ на',
          sortable: true,
          class: 'font-weight-medium subtitle-1',
          divider: true,
          width: 150,
          value: 'isAnswerOn'
        },

        {
          text: 'Кто подписал',
          sortable: true,
          class: 'font-weight-medium subtitle-1',
          divider: true,
          width: 220,
          value: 'podpisants'
        },

        {
          text: 'Исполнитель',
          sortable: true,
          class: 'font-weight-medium subtitle-1',
          divider: true,
          width: 100,
          value: 'author'
        },

        {
          text: 'Состояние',
          sortable: true,
          class: 'font-weight-medium subtitle-1',
          divider: true,
          width: 100,
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
      defaultItem: new IntOutgoing(),
      editedItem: new IntOutgoing(),
      // -------------------Диалог добавления/редактирования---------------------
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
    showingItems () {
      return filter(this.intOutgoings)
    },
    intOutgoings () {
      return this.getter('intOutgoings', 'items')
    },
    tema () {
      return this.getter('temas', 'indexed')
    },
    podpisant () {
      return this.getter('currentPositions', 'indexed')
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
    checkPermiss (val) {
      return checkUserPermission(this.userPermission, val)
    },
    getter (ent, type) {
      if (!this.storage) { return [] }
      if (this.storage[ent].synchronization) { return [] }
      return this.storage[ent][type]
    },
    formatDate (val) {
      return getFormatedDate(val)
    },
    ...mapActions({
      setDep: 'auth/selectDep',
      setEditedItemId: 'navInterface/setEditedItemId',
      setBusy: 'navInterface/setBusy',
      unsetBusy: 'navInterface/unsetBusy'
    }),

    async initialize () {
      try {
        console.time('Init intOut')
        this.busy = true
        if (!this.storage.intOutgoings.items.length || !this.storage.intOutFiles.items.length) {
          // await Promise.all([
          //   this.storage.intIncomings.updateAll(),
          //   this.storage.intOutgoings.updateAll(),
          //   this.storage.intIncFiles.updateAll(),
          //   this.storage.intOutFiles.updateAll()
          // ])
          await this.$docs.updateEntitys([
            'intIncomings',
            'intOutgoings',
            'intIncFiles',
            'intOutFiles'
          ])
        }
        this.$refs.editForm.newState = null
        this.$refs.editForm.addresseeDeps = []
        this.$refs.editForm.podpisantsDeps = []
        this.$refs.editForm.podpisantsDeps.push(this.selectedDep)
        this.busy = false
        console.timeEnd('Init intOut')
      } catch (err) {
        throw err
      }
    },

    async viewIntInc (id) {
      await this.$refs.viewIncDialog.viewItem(id)
    },

    async reset () {
      try {
        this.busy = true
        await this.$docs.updateEntitys([
          'intIncomings',
          'intOutgoings',
          'intIncFiles',
          'intOutFiles',
          'resolutions',
          'currentPositions',
          'temas',
          'states',
          'types',
          'employees',
          'departments'
        ])
        this.$refs.editForm.newState = null
        this.$refs.editForm.addresseeDeps = []
        this.$refs.editForm.podpisantsDeps = []
        this.$refs.editForm.podpisantsDeps.push(this.selectedDep)
        this.busy = false
      } catch (err) {
        throw err
      }
    },

    editItem (item) {
      this.editedIndex = item.id || -1
      this.editedItem = this.editedIndex >= 0
        ? this.storage.intOutgoings.indexed[item.id].clone()
        : new IntOutgoing()
      this.$refs.editForm.open(this.editedItem)
    },

    viewItem (item) {
      console.log('int-outgoing', item)
      if (this.$refs.viewDialog) {
        this.$refs.viewDialog.viewItem(item.id)
      }
    },

    async deleteItem (item) {
      const query = `
        mutation {
          deleteIntOutgoing (id: ${item.id}) {
            type
            id
            text
            messageType
          }
        }
      `
      this.busy = true
      confirm(
        `Вы уверены, что хотите удалить документ с исх. ${item.outNumber} от ${getFormatedDate(item.outDate)}?`
      ) && (await gQLRequestMessage(this, query))
      this.busy = false
      await this.initialize()
    }
  },
  middleware: ['auth']
}
</script>
