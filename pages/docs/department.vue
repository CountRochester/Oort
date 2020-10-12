
<template>
  <v-data-table
    :headers="headers"
    :items="deps"
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
      <editDepartment
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
            v-if="checkPermiss(255)"
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
import { mapGetters, mapActions } from 'vuex'
import consola from 'consola'
import { checkUserPermission } from '@/utils/permission'
import Rules from '@/utils/rules'
import { gQLRequestMessage } from '@/utils/gql-request'
import { Department } from '@/Storage/ent-methods/departments'
import tableToolbar from '@/components/table-toolbar'
import editDepartment from '@/components/edit-department'

export default {
  components: {
    tableToolbar,
    editDepartment
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
          text: 'Полное название',
          sortable: true,
          class: 'font-weight-medium subtitle-1',
          divider: true,
          align: 'left',
          width: 500,
          value: 'depName'
        },

        {
          text: 'Номер отдела',
          sortable: true,
          class: 'font-weight-medium subtitle-1',
          divider: true,
          align: 'center',
          width: 80,
          value: 'depNumber'
        },

        {
          text: 'Краткое название',
          sortable: true,
          class: 'font-weight-medium subtitle-1',
          divider: true,
          align: 'center',
          width: 300,
          value: 'shortName'
        },

        {
          text: 'Префикс',
          sortable: true,
          class: 'font-weight-medium subtitle-1',
          divider: true,
          align: 'center',
          width: 80,
          value: 'depPrefix'
        },

        {
          text: 'Куда входит',
          sortable: false,
          class: 'font-weight-medium subtitle-1',
          divider: true,
          align: 'center',
          width: 200,
          value: 'parentDepartment'
        },

        {
          text: 'Подчинённые подразделения',
          sortable: false,
          class: 'font-weight-medium subtitle-1',
          divider: true,
          align: 'center',
          value: 'childDeps'
        },

        {
          text: 'Действия',
          sortable: false,
          class: 'font-weight-medium subtitle-1',
          divider: true,
          align: 'center',
          width: 80,
          value: 'action'
        }
      ],
      editedIndex: -1,
      editedItem: new Department(),
      defaultItem: new Department()
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
    formTitle () {
      return this.editedIndex === -1 ? 'Новая запись' : 'Редактировать'
    },
    deps () {
      return this.getter('departments', 'items')
    },
    ...mapGetters({
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
    ...mapActions({
      setDep: 'auth/selectDep',
      setEditedItemId: 'navInterface/setEditedItemId',
      setBusy: 'navInterface/setBusy',
      unsetBusy: 'navInterface/unsetBusy'
    }),
    getter (ent, type) {
      if (!this.storage) { return [] }
      if (this.storage[ent].synchronization) { return [] }
      return this.storage[ent][type]
    },
    async initialize () {
      try {
        this.busy = true
        if (!this.storage.departments.items.length || !this.storage.employees.items.length) {
          await Promise.all([
            this.storage.employees.updateAll(),
            this.storage.departments.updateAll()
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
          this.storage.departments.updateAll()
        ])
        this.busy = false
      } catch (err) {
        consola.error(err)
      }
    },

    editItem (item) {
      this.editedIndex = item.id || -1
      this.editedItem = this.editedIndex >= 0
        ? this.storage.departments.indexed[item.id].clone()
        : new Department()
      this.$refs.editForm.open(this.editedItem)
    },

    async deleteItem (item) {
      const query = `
        mutation {
          deleteDepartment (id: ${item.id}) {
            type
            text
            messageType
            id
          }
        }
      `
      this.busy = true
      confirm(`Вы уверены, что хотите удалить отдел ${item.shortName}?`) && await gQLRequestMessage(this, query)
      this.busy = false
      await this.initialize()
    }
  },
  middleware: ['auth']
}
</script>
