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
    show-expand
    loading-text="Загрузка"
    multi-sort
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
              <strong>Кому адресовано или отписано</strong>
            </v-expansion-panel-header>
            <v-expansion-panel-content>
              <v-list>
                <v-list-item v-for="(el, i) in item.Addressees" :key="i">
                  <v-list-item-content>
                    {{ el ? el.posName : 'Неизвестный исполнитель' }}
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
                <v-list-item v-for="(el, j) in item.Temas" :key="j">
                  <v-list-item-content>
                    {{ el ? el.name : 'Неизвестная тема' }}
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
      <editInternal
        ref="editForm"
        :lazy-form="lazy"
        :initialize="initialize"
      />
      <!-- ---------------------------------------------------------------------------------------------------------------- -->
      <!-- -------------------------------------------Диалог просмотра документа------------------------------------------- -->
      <!-- ---------------------------------------------------------------------------------------------------------------- -->
      <viewInternal ref="viewDialog" :edited-item-id="editedItem.id" />
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

    <template #item.temas="{ item }">
      <v-list-item v-for="itemTema in item.Temas" :key="itemTema.id" dense class="pl-0 ml-n2">
        <v-icon small>
          mdi-label
        </v-icon>
        <span class="pl-1">
          {{ itemTema ? itemTema.name : '' }}
        </span>
      </v-list-item>
    </template>

    <template #item.action="{ item }">
      <td @click.stop>
        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-icon small class="mr-2" v-on="on" @click="editItem(item)">
              mdi-pencil
            </v-icon>
          </template>
          <span>Редактирование</span>
        </v-tooltip>
        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-icon v-if="checkPermiss(16)" small v-on="on" @click="deleteItem(item)">
              mdi-delete
            </v-icon>
          </template>
          <span>Удалить</span>
        </v-tooltip>
      </td>
    </template>
    <template #item.dateVx="{ item }">
      {{ item.incDate }}
    </template>
    <template #item.dateDoc="{ item }">
      {{ item.docDate }}
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
import Rules from '@/utils/rules'
import Messenger from '@/utils/messenger'
import { checkUserPermission } from '@/utils/permission'
import { gQLRequestMessage } from '@/utils/gql-request'
import { getFormatedDate } from '@/utils/date.js'
import { Internal } from '@/Storage/ent-methods/internals'
import viewInternal from '@/components/view-internal'
import editInternal from '@/components/edit-internal'
import tableToolbar from '@/components/table-toolbar'

moment.locale('ru')

export default {
  components: {
    tableToolbar,
    editInternal,
    viewInternal
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
          value: 'incNumber'
        },
        {
          text: 'Дата вх.',
          sortable: true,
          class: 'font-weight-medium subtitle-1',
          divider: true,
          value: 'dateVx'
        },
        {
          text: 'Краткое содержание',
          sortable: false,
          class: 'font-weight-medium subtitle-1',
          divider: true,
          value: 'subject'
        },
        {
          text: 'Подписанты',
          sortable: true,
          class: 'font-weight-medium subtitle-1',
          divider: true,
          value: 'podpisants'
        },
        {
          text: '№ документа',
          sortable: true,
          class: 'font-weight-medium subtitle-1',
          divider: true,
          value: 'docNumberWithPrefix'
        },
        {
          text: 'Дата документа',
          sortable: true,
          class: 'font-weight-medium subtitle-1',
          divider: true,
          value: 'dateDoc'
        },
        {
          text: 'Состояние',
          sortable: true,
          class: 'font-weight-medium subtitle-1',
          divider: true,
          value: 'state'
        },
        {
          text: 'Тема',
          sortable: true,
          class: 'font-weight-medium subtitle-1',
          divider: true,
          value: 'temas'
        },
        {
          text: 'Исполнитель',
          sortable: true,
          class: 'font-weight-medium subtitle-1',
          divider: true,
          value: 'author'
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
      editedItem: new Internal(),
      defaultItem: new Internal(),
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
    selectDep () {
      if (this.tableBody) {
        return this.tableBody.selectDep
      } else { return null }
    },
    showingItems () {
      return this.internals
    },
    ...mapGetters({
      user: 'auth/getUser',
      usersDep: 'auth/getUserDep',
      selectedDep: 'auth/getSelectDep',
      userPermission: 'auth/getUserPermission',
      theme: 'navInterface/getTheme'
    }),
    internals () {
      return this.getter('internals', 'items')
    }
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
      setEditedItemId: 'navInterface/setEditedItemId',
      setBusy: 'navInterface/setBusy',
      unsetBusy: 'navInterface/unsetBusy'
    }),

    async initialize () {
      try {
        this.busy = true
        if (!this.storage.internals.items.length || !this.storage.internalFiles.items.length) {
          await this.$docs.updateEntitys([
            'internals',
            'internalFiles'
          ])
        }
        this.$refs.editForm.newState = null
        this.$refs.editForm.podpisantsDeps = []
        this.$refs.editForm.addresseeDeps = []
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
        console.time('Reset')
        this.busy = true
        await this.$docs.updateEntitys([
          'internals',
          'internalFiles',
          'resolutions',
          'currentPositions',
          'temas',
          'states',
          'types',
          'employees',
          'departments'
        ])
        this.$refs.editForm.newState = null
        this.$refs.editForm.podpisantsDeps = []
        this.$refs.editForm.addresseeDeps = []
        console.timeEnd('Reset')
        this.busy = false
      } catch (err) {
        throw err
      }
    },

    editItem (item) {
      this.editedIndex = item.id || -1
      this.editedItem = this.editedIndex >= 0
        ? this.storage.internals.indexed[item.id].clone()
        : new Internal()
      this.$refs.editForm.open(this.editedItem)
    },
    viewItem (item) {
      if (this.$refs.viewDialog) {
        this.$refs.viewDialog.viewItem(item.id)
      }
    },

    async deleteItem (item) {
      const query = `
        mutation {
          deleteInternal (id: ${item.id}) {
            type
            id
            text
            messageType
          }
        }
      `
      this.busy = true
      confirm(
        `Вы уверены, что хотите удалить документ с исх. ${item.docNumber} от ${getFormatedDate(item.docDate)}?`
      ) && (await gQLRequestMessage(this, query))
      // await this.fetchForce('Internals')
      this.busy = false
      await this.initialize()
    }
  },
  middleware: ['auth']
}
</script>
