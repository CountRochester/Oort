<template>
  <v-data-table
    :headers="headers"
    :items="employees"
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
      <editEmployee
        ref="editForm"
        :lazy-form="lazy"
        :initialize="initialize"
      />
    </template>

    <template #item.Positions="{ item }">
      <v-list-item v-for="pos in item.CurrentPositions" :key="`${pos}-${Math.random()}`" dense class="pl-0 ml-n2">
        <v-icon small>
          mdi-account-hard-hat
        </v-icon>
        <span class="pl-1">
          {{ pos.position + ' (' + pos.department + ')' }}
        </span>
      </v-list-item>
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
import Rules from '@/utils/rules'
import { gQLRequestMessage } from '@/utils/gql-request'
import { Employee } from '@/Storage/ent-methods/employees'
import tableToolbar from '@/components/table-toolbar'
import editEmployee from '@/components/edit-employee'

export default {
  components: {
    tableToolbar,
    editEmployee
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
          value: 'id'
        },

        {
          text: 'ФИО',
          sortable: true,
          class: 'font-weight-medium subtitle-1',
          divider: true,
          value: 'nameFull'
        },

        {
          text: 'Должности',
          sortable: true,
          class: 'font-weight-medium subtitle-1',
          divider: true,
          value: 'Positions'
        },

        {
          text: 'Подразделения',
          sortable: true,
          class: 'font-weight-medium subtitle-1',
          divider: true,
          value: 'subdivisions'
        },

        {
          text: 'Телефон',
          sortable: true,
          class: 'font-weight-medium subtitle-1',
          divider: true,
          value: 'phone1'
        },

        {
          text: 'Email',
          sortable: false,
          class: 'font-weight-medium subtitle-1',
          divider: true,
          value: 'email1'
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
      editedItem: new Employee(),
      defaultItem: new Employee()
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
    employees () {
      return this.getter('employees', 'items')
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
      setDep: 'auth/selectDep',
      setBusy: 'navInterface/setBusy',
      unsetBusy: 'navInterface/unsetBusy',
      setSearch: 'navInterface/setSearch'
    }),

    async initialize () {
      try {
        this.busy = true
        if (!this.storage.departments.items.length || !this.employees.length ||
          !this.storage.positions.items.length || !this.storage.currentPositions.items.length) {
          await Promise.all([
            this.storage.employees.updateAll(),
            this.storage.departments.updateAll(),
            this.storage.positions.updateAll(),
            this.storage.currentPositions.updateAll()
          ])
        }
        this.busy = false
      } catch (err) {
        consola.error(err)
      }
    },

    async reset () {
      try {
        this.busy = true
        await Promise.all([
          this.storage.employees.updateAll(),
          this.storage.departments.updateAll(),
          this.storage.positions.updateAll(),
          this.storage.currentPositions.updateAll()
        ])
        this.editedIndex = -1
        this.busy = false
      } catch (err) {
        consola.error(err)
      }
    },

    editItem (item) {
      this.editedIndex = item.id || -1
      this.editedItem = this.editedIndex >= 0
        ? this.storage.employees.indexed[item.id].clone()
        : new Employee()
      this.$refs.editForm.open(this.editedItem)
    },

    async deleteItem (item) {
      const query = `
        mutation {
          deleteEmployee (id: ${item.id}) {
            type
            id
            text
            messageType
          }
        }
      `
      this.busy = true
      confirm(`Вы уверены, что хотите удалить работника ${item.name}?`) && await gQLRequestMessage(this, query)
      this.busy = false
      await this.initialize()
    }
  },
  middleware: ['auth']
}
</script>
