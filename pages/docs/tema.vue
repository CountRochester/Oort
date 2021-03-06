
<template>
  <v-data-table
    :headers="headers"
    :items="temas"
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
      <editTema
        ref="editForm"
        :lazy-form="lazy"
        :initialize="initialize"
      />
    </template>
    <template v-slot:item.action="{ item }">
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
    <template #item.contract="{ item }">
      {{ item.contract }}
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

import { mapActions, mapGetters } from 'vuex'
import consola from 'consola'
import { gQLRequestMessage } from '@/utils/gql-request'
import Rules from '@/utils/rules'
import { Tema } from '@/Storage/ent-methods/temas'
import Messenger from '@/utils/messenger'
import tableToolbar from '@/components/table-toolbar'
import editTema from '@/components/edit-tema'

export default {
  components: {
    tableToolbar,
    editTema
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
          text: 'Название темы',
          sortable: true,
          class: 'font-weight-medium subtitle-1',
          divider: true,
          value: 'name'
        },

        {
          text: 'Номер контракта',
          sortable: true,
          class: 'font-weight-medium subtitle-1',
          divider: true,
          value: 'contract'
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
      editedItem: new Tema(),
      defaultItem: new Tema()
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
    temas () {
      return this.getter('temas', 'items')
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
    ...mapActions({
      setBusy: 'navInterface/setBusy',
      unsetBusy: 'navInterface/unsetBusy',
      setSearch: 'navInterface/setSearch'
    }),

    async initialize () {
      try {
        this.busy = true
        if (!this.storage.temas.items.length) {
          await this.storage.temas.updateAll()
        }
        this.busy = false
      } catch (err) {
        consola.error(err)
      }
    },

    async reset () {
      try {
        this.busy = true
        await this.storage.temas.updateAll()
        this.busy = false
      } catch (err) {
        consola.error(err)
      }
    },

    editItem (item) {
      this.editedIndex = item.id || -1
      this.editedItem = this.editedIndex >= 0
        ? this.storage.temas.indexed[item.id].clone()
        : new Tema()
      this.$refs.editForm.open(this.editedItem)
    },

    async deleteItem (item) {
      const query = `
        mutation {
          deleteTema (id: ${item.id}) {
            type
            id
            text
            messageType
          }
        }
      `
      this.busy = true
      confirm(`Вы уверены, что хотите удалить тему ${item.name}?`) && await gQLRequestMessage(this, query)
      this.$refs.form.resetValidation()
      this.busy = false
      await this.initialize()
    }
  },
  middleware: ['auth']
}
</script>
