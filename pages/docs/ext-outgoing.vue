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
                    {{ extCurrentPosition[el] ? `${extCurrentPosition[el].posName}` : 'Неизвестный адресат ' + el }}
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

          <v-expansion-panel v-if="item.isAnswerOnId">
            <v-expansion-panel-header>
              <strong>Ответ на</strong>
            </v-expansion-panel-header>
            <v-expansion-panel-content>
              <v-list>
                <v-list-item
                  @click="viewExtInc(item.isAnswerOnId)"
                >
                  <v-list-item-content>
                    {{ extIncoming[item.isAnswerOnId] ? `от ${extIncoming[item.isAnswerOnId].extDate} № ${extIncoming[item.isAnswerOnId].extNumber}` : null }}
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
        ref="tableBody"
        :default-item="defaultItem"
        :reset="reset"
        :new-item="editItem"
      />
      <editExtOut
        ref="editForm"
        :lazy-form="lazy"
        :initialize="initialize"
      />
      <!-- ---------------------------------------------------------------------------------------------------------------- -->
      <!-- -------------------------------------------Диалог просмотра документа------------------------------------------- -->
      <!-- ---------------------------------------------------------------------------------------------------------------- -->
      <viewExtOut
        ref="viewDialog"
        :edited-item-id="editedItem.id"
      />
      <viewExtInc ref="viewIncDialog" />
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

    <template #item.organisations="{ item }">
      <!-- <v-list-item v-for="orgId in item.organisationsId" :key="orgId" dense class="pl-0 ml-n2"> -->
      <v-list-item v-for="org in item.Organisations" :key="org.id" dense class="pl-0 ml-n2">
        <v-icon small>
          mdi-office-building
        </v-icon>
        <span class="pl-1">
          {{ org ? org.orgName : '' }}
        </span>
      </v-list-item>
    </template>

    <template #item.outNumber="{ item }">
      {{ item.prefix + item.outNumber }}
    </template>
    <template #item.dateIsh="{ item }">
      {{ item.outDate }}
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
import consola from 'consola'
import moment from 'moment'
import { checkUserPermission } from '@/utils/permission'
import { gQLRequestMessage } from '@/utils/gql-request'
import { getFormatedDate } from '@/utils/date.js'
import { filter } from '@/utils/filter'
import viewExtOut from '@/components/view-ext-outgoing'
import viewExtInc from '@/components/view-ext-incoming'
import Rules from '@/utils/rules'
import { ExtOutgoing } from '@/Storage/ent-methods/ext-outgoings'
import editExtOut from '@/components/edit-ext-outgoing'
import tableToolbar from '@/components/table-toolbar'

moment.locale('ru')

export default {
  components: {
    viewExtOut,
    viewExtInc,
    editExtOut,
    tableToolbar
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
          width: 120,
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
          text: 'Куда',
          sortable: true,
          class: 'font-weight-medium subtitle-1',
          divider: true,
          width: 300,
          value: 'organisations'
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
          width: 300,
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
      defaultItem: new ExtOutgoing(),
      editedItem: new ExtOutgoing(),
      newState: null,
      organisationsId: [],

      // -------------------Диалог добавления/редактирования---------------------
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
    showingItems () {
      return filter(this.extOutgoings)
    },
    extOutgoings () {
      return this.getter('extOutgoings', 'items')
    },
    extIncoming () {
      return this.getter('extIncomings', 'indexed')
    },
    tema () {
      return this.getter('temas', 'indexed')
    },
    extCurrentPosition () {
      return this.getter('extCurrentPositions', 'indexed')
    },
    ...mapGetters({
      user: 'auth/getUser',
      usersDep: 'auth/getUserDep',
      selectedDep: 'auth/getSelectDep',
      userPermission: 'auth/getUserPermission',
      theme: 'navInterface/getTheme'
    }),
    formTitle () {
      return this.editedIndex === -1 ? 'Новая запись' : 'Редактировать'
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
      setBusy: 'navInterface/setBusy',
      unsetBusy: 'navInterface/unsetBusy'
    }),

    async initialize () {
      try {
        this.busy = true
        if (!this.storage.extOutgoings.items.length || !this.storage.extOutFiles.items.length) {
          await this.$docs.updateEntitys([
            'extIncomings',
            'extOutgoings',
            'extIncFiles',
            'extOutFiles'
          ])
        }
        this.$refs.editForm.newState = null
        this.busy = false
      } catch (err) {
        consola.error(err)
      }
    },

    async viewExtInc (id) {
      await this.$refs.viewIncDialog.viewItem(id)
    },

    async reset () {
      try {
        this.busy = true
        await this.$docs.updateEntitys([
          'extIncomings',
          'extOutgoings',
          'temas',
          'organisations',
          'states',
          'extOutFiles',
          'types',
          'currentPositions'
        ])
        this.$refs.editForm.newState = null
        this.busy = false
      } catch (err) {
        throw err
      }
    },

    editItem (item) {
      this.editedIndex = item.id || -1
      this.editedItem = this.editedIndex >= 0
        ? this.storage.extOutgoings.indexed[item.id].clone()
        : new ExtOutgoing()
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
          deleteExtOutgoing (id: ${item.id}) {
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
