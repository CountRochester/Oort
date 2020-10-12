<template>
  <v-data-table
    :headers="headers"
    :items="contracts"
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
      <editContract
        ref="editForm"
        :lazy-form="lazy"
        :initialize="initialize"
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
    <template #no-data>
      <v-btn :disabled="busy" :color="theme.mainTheme.primary" @click="initialize()">
        Сбросить
      </v-btn>
    </template>
  </v-data-table>
</template>

<script>
/* eslint-disable no-useless-escape */
import { mapActions, mapGetters } from 'vuex'
import consola from 'consola'
import Rules from '@/utils/rules'
import { Contract } from '@/Storage/ent-methods/contracts'
import { gQLRequestMessage } from '@/utils/gql-request'
import tableToolbar from '@/components/table-toolbar'
import editContract from '@/components/edit-contract'

export default {
  components: {
    tableToolbar,
    editContract
  },
  data () {
    return {
      storage: this.$docs.buffer,
      rules: Rules,
      lazy: false,
      headers: [
        {
          text: '№',
          align: 'left',
          sortable: true,
          class: 'font-weight-medium subtitle-1',
          divider: true,
          width: 70,
          value: 'id'
        },

        {
          text: 'Номер контракта',
          sortable: true,
          class: 'font-weight-medium subtitle-1',
          divider: true,
          value: 'number'
        },

        {
          text: 'Дата подписания',
          sortable: true,
          class: 'font-weight-medium subtitle-1',
          divider: true,
          value: 'date'
        },

        {
          text: 'Дата последнего изменения',
          sortable: true,
          class: 'font-weight-medium subtitle-1',
          divider: true,
          width: 250,
          value: 'updatedAt'
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
      editedItem: new Contract(),
      defaultItem: new Contract()
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
    contracts () {
      return this.storage ? this.storage.contracts.items : []
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
    ...mapActions({
      setDep: 'auth/selectDep',
      setEditedItemId: 'navInterface/setEditedItemId',
      setBusy: 'navInterface/setBusy',
      unsetBusy: 'navInterface/unsetBusy'
    }),
    async initialize () {
      try {
        this.busy = true
        await this.storage.contracts.updateAll()
        this.busy = false
      } catch (err) {
        consola.error(err)
      }
    },

    async reset () {
      try {
        this.busy = true
        await this.storage.contracts.updateAll()
        this.busy = false
      } catch (err) {
        consola.error(err)
      }
    },

    editItem (item) {
      this.editedIndex = item.id || -1
      this.editedItem = this.editedIndex >= 0
        ? this.storage.contracts.indexed[item.id].clone()
        : new Contract()
      this.$refs.editForm.open(this.editedItem)
    },

    async deleteItem (item) {
      const query = `
        mutation {
          deleteContract (id: ${item.id}) {
            type
            text
            messageType
            id
          }
        }
      `
      this.busy = true
      confirm(`Вы уверены, что хотите удалить должность ${item.posName}?`) && await gQLRequestMessage(this, query)
      this.busy = false
      await this.initialize()
    }
  },
  middleware: ['auth']
}
</script>
