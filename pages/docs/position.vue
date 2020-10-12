
<template>
  <v-data-table
    :headers="headers"
    :items="positions"
    :search="search"
    :footer-props="{
      itemsPerPageText: 'Записей на странице',
      itemsPerPageAllText: 'все',
      itemsPerPageOptions: [10, 20, 50, -1]
    }"
    :loading="busy"
    loading-text="Загрузка"
    sort-by="id"
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
      <editPosition
        ref="editForm"
        :lazy-form="lazy"
        :initialize="initialize"
      />
    </template>
    <template #item.canSignExtDocsT="{ item }">
      {{ item.canSignExtDocs ? 'имеется' : 'отсутствует' }}
    </template>
    <template #item.canSignIntDocsT="{ item }">
      {{ item.canSignIntDocsT ? 'имеется' : 'отсутствует' }}
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
    <template #no-data>
      <v-btn :disabled="busy" :color="theme.mainTheme.primary" @click="initialize()">
        Сбросить
      </v-btn>
    </template>
  </v-data-table>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import consola from 'consola'
import Rules from '@/utils/rules'
import { gQLRequestMessage } from '@/utils/gql-request'
import { Position } from '@/Storage/ent-methods/positions'
import Messenger from '@/utils/messenger'
import tableToolbar from '@/components/table-toolbar'
import editPosition from '@/components/edit-position'

export default {
  components: {
    tableToolbar,
    editPosition
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
          text: 'Наименование должности',
          sortable: true,
          class: 'font-weight-medium subtitle-1',
          divider: true,
          value: 'posName'
        },

        {
          text: 'Право внешней переписки',
          sortable: true,
          class: 'font-weight-medium subtitle-1',
          divider: true,
          value: 'canSignExtDocsT'
        },

        {
          text: 'Право внутренней переписки',
          sortable: true,
          class: 'font-weight-medium subtitle-1',
          divider: true,
          value: 'canSignIntDocsT'
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
      editedIndex: -1,
      editedItem: new Position(),
      defaultItem: new Position()
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
    positions () {
      return this.getter('positions', 'items')
    },
    ...mapGetters({
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
    ...mapActions({
      setBusy: 'navInterface/setBusy',
      unsetBusy: 'navInterface/unsetBusy',
      setSearch: 'navInterface/setSearch'
    }),

    async initialize () {
      try {
        this.busy = true
        await this.storage.positions.updateAll()
        this.busy = false
      } catch (err) {
        consola.error(err)
      }
    },

    async reset () {
      try {
        this.busy = true
        await this.storage.positions.updateAll()
        this.busy = false
      } catch (err) {
        consola.error(err)
      }
    },

    editItem (item) {
      this.editedIndex = item.id || -1
      this.editedItem = this.editedIndex >= 0
        ? this.storage.positions.indexed[item.id].clone()
        : new Position()
      this.$refs.editForm.open(this.editedItem)
    },

    async deleteItem (item) {
      const query = `
        mutation {
          deletePosition (id: ${item.id}) {
            type
            id
            text
            messageType
          }
        }
      `
      this.busy = true
      confirm(`Вы уверены, что хотите удалить должность ${item.posName}?`) && await gQLRequestMessage(this, query)
      // await this.fetchForce('Positions')
      this.$refs.form.resetValidation()
      this.busy = false
      await this.initialize()
    },

    async close () {
      this.dialog = false
      this.editedItem = this.defaultItem
      this.editedIndex = -1
      this.$refs.form.resetValidation()
      await this.initialize()
    },

    async save (item) {
      // Если нажата кнопка добавить пользователя
      if (!this.$refs.form.validate()) {
        return
      }
      this.busy = true
      const dat = this.editedItem.posNameDat.length ? `posNameDat: "${this.editedItem.posNameDat}"` : ''
      if (this.editedIndex === -1) {
        const query = `
          mutation {
            addPosition (position: {
              posName: "${this.editedItem.posName}"
              ${dat}
              canSignExtDocs: ${this.editedItem.canSignExtDocs}
              canSignIntDocs: ${this.editedItem.canSignIntDocs}
            }) {
              type
              id
              text
              messageType
              item
            }
          }
        `
        await gQLRequestMessage(this, query)
      } else {
        // Если нажата кнопка редактировать пользователя
        const query = `
          mutation {
            editPosition (id: "${this.editedItem.id}" position: {
              posName: "${this.editedItem.posName}"
              ${dat}
              canSignExtDocs: ${this.editedItem.canSignExtDocs}
              canSignIntDocs: ${this.editedItem.canSignIntDocs}
            }) {
              type
              id
              text
              messageType
              item
            }
          }
        `
        await gQLRequestMessage(this, query)
      }
      // await this.fetchForce('Positions')
      this.busy = false
      await this.close()
    }
  },
  middleware: ['auth']
}
</script>
