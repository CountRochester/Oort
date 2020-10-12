
<template>
  <v-data-table
    ref="table"
    :headers="headers"
    :items="states"
    :search="search"
    :footer-props="{
      itemsPerPageText: 'Записей на странице',
      itemsPerPageAllText: 'все',
      itemsPerPageOptions: [10, 20, 50, -1]
    }"
    :loading="busy"
    loading-text="Загрузка"
    sort-by.sync="id"
    class="elevation-1"
  >
    <template #top>
      <tableToolbar
        ref="tableBody"
        :default-item="defaultItem"
        :reset="reset"
        :new-item="editItem"
        :department-select="false"
      />
      <editState
        ref="editForm"
        :lazy-form="lazy"
        :initialize="initialize"
        :types="types"
      />
    </template>
    <template #item.action="{ item }">
      <v-tooltip bottom>
        <template #activator="{ on }">
          <v-icon
            :disabled="busy"
            small
            class="mr-2"
            v-on="on"
            @click="editItem(item)"
          >
            mdi-pencil
          </v-icon>
        </template>
        <span>Редактирование</span>
      </v-tooltip>
      <v-tooltip bottom>
        <template #activator="{ on }">
          <v-icon
            :disabled="busy"
            small
            v-on="on"
            @click="deleteItem(item)"
          >
            mdi-delete
          </v-icon>
        </template>
        <span>Удалить запись</span>
      </v-tooltip>
    </template>
    <template #item.typeName="{ item }">
      <v-list-item>
        <span>
          {{ getType(item) }}
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
import { gQLRequestMessage } from '@/utils/gql-request'
import Rules from '@/utils/rules'
import { State } from '@/Storage/ent-methods/states'
import Messenger from '@/utils/messenger'
import tableToolbar from '@/components/table-toolbar'
import editState from '@/components/edit-state'

export default {
  components: {
    tableToolbar,
    editState
  },
  data () {
    return {
      storage: this.$docs.buffer,
      messenger: Messenger.getInstance(),
      rules: Rules,
      lazy: false,
      headers: [
        {
          text: '№',
          align: 'left',
          sortable: true,
          class: 'font-weight-medium subtitle-1',
          divider: true,
          value: 'id'
        },

        {
          text: 'Название состояния',
          sortable: true,
          class: 'font-weight-medium subtitle-1',
          divider: true,
          value: 'name'
        },

        {
          text: 'Тип документа',
          sortable: true,
          class: 'font-weight-medium subtitle-1',
          divider: true,
          value: 'typeName'
        },

        {
          text: 'Предыдущее состояние',
          sortable: true,
          class: 'font-weight-medium subtitle-1',
          divider: true,
          value: 'prevState'
        },

        {
          text: 'Следующее состояние',
          sortable: true,
          class: 'font-weight-medium subtitle-1',
          divider: true,
          value: 'nextState'
        },

        {
          text: 'Дата последнего изменения',
          sortable: true,
          class: 'font-weight-medium subtitle-1',
          divider: true,
          value: 'updatedAt'
        },

        {
          text: 'Действия',
          sortable: false,
          class: 'font-weight-medium subtitle-1',
          divider: true,
          value: 'action'
        }
      ],
      types: [
        { text: 'Внешние входящие документы', value: 'extInc' },
        { text: 'Внешние исходящие документы', value: 'extOut' },
        { text: 'Внутренние входящие документы', value: 'intInc' },
        { text: 'Внутренние исходящие документы', value: 'intOut' },
        { text: 'Внутренние документы', value: 'internal' }
      ],
      editedIndex: -1,
      editedItem: new State(),
      defaultItem: new State()

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
    ...mapGetters({
      theme: 'navInterface/getTheme'
    }),
    states () {
      return this.getter('states', 'items')
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

    getType (item) {
      const type = this.types.find(it => it.value === item.type)
      return type ? type.text : ''
    },

    ...mapActions({
      setBusy: 'navInterface/setBusy',
      unsetBusy: 'navInterface/unsetBusy',
      setSearch: 'navInterface/setSearch'
    }),
    async initialize () {
      try {
        this.busy = true
        if (!this.storage.states.items.length) {
          await this.storage.states.updateAll()
        }
        this.busy = false
      } catch (err) {
        consola.error(err)
      }
    },

    async reset () {
      try {
        this.busy = true
        await this.storage.states.updateAll()
        this.busy = false
      } catch (err) {
        consola.error(err)
      }
    },

    editItem (item) {
      this.editedIndex = item.id || -1
      this.editedItem = this.editedIndex >= 0
        ? this.storage.states.indexed[item.id].clone()
        : new State()
      this.$refs.editForm.open(this.editedItem)
    },

    async deleteItem (item) {
      const query = `
        mutation {
          deleteState (id: ${item.id}) {
            type
            id
            text
            messageType
          }
        }
      `
      this.busy = true
      confirm(`Вы уверены, что хотите удалить состояние ${item.name}?`) && await gQLRequestMessage(this, query)
      this.busy = false
      await this.initialize()
    }
  },
  middleware: ['auth']
}
</script>
