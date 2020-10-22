
<template>
  <v-data-table
    :headers="headers"
    :items="extEmployees"
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
        ref="tableToolbar"
        :default-item="defaultItem"
        :reset="reset"
        :new-item="editItem"
      />
      <editExtEmployee
        ref="editForm"
        :lazy-form="lazy"
        :initialize="initialize"
      />
    </template>

    <template #item.position="{ item }">
      <v-list-item v-for="pos in item.ExtCurrentPositions" :key="`${pos.id}-${Math.random()}`" dense class="pl-0 ml-n2">
        <v-icon small>
          mdi-account-hard-hat
        </v-icon>
        <span class="pl-1">
          {{ pos.position + ' (' + pos.id + ')' }}
        </span>
      </v-list-item>
    </template>

    <template #item.organisation="{ item }">
      <v-list-item v-for="org in item.Organisations" :key="`${org.id}-${Math.random()}`" dense class="pl-0 ml-n2">
        <v-icon small>
          mdi-office-building
        </v-icon>
        <span class="pl-1">
          {{ org.orgName }}
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

import { mapActions, mapGetters } from 'vuex'
import consola from 'consola'
import { gQLRequestMessage } from '@/utils/gql-request'
import Rules from '@/utils/rules'
import { ExtEmployee } from '@/Storage/ent-methods/ext-employees'
import Messenger from '@/utils/messenger'
import tableToolbar from '@/components/table-toolbar'
import editExtEmployee from '@/components/edit-ext-employee'

export default {
  components: {
    tableToolbar,
    editExtEmployee
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
          width: 30,
          value: 'id'
        },

        {
          text: 'ФИО',
          sortable: true,
          class: 'font-weight-medium subtitle-1',
          divider: true,
          align: 'left',
          width: 200,
          value: 'nameFull'
        },

        {
          text: 'Должность',
          sortable: true,
          class: 'font-weight-medium subtitle-1',
          divider: true,
          align: 'left',
          width: 350,
          value: 'position'
        },

        {
          text: 'Организация',
          sortable: true,
          class: 'font-weight-medium subtitle-1',
          divider: true,
          align: 'center',
          width: 300,
          value: 'organisation'
        },

        {
          text: 'Телефон 1',
          sortable: true,
          class: 'font-weight-medium subtitle-1',
          divider: true,
          align: 'center',
          width: 150,
          value: 'phone1'
        },

        {
          text: 'Телефон 2',
          sortable: true,
          class: 'font-weight-medium subtitle-1',
          divider: true,
          align: 'center',
          width: 150,
          value: 'phone2'
        },

        {
          text: 'Факс',
          sortable: true,
          class: 'font-weight-medium subtitle-1',
          divider: true,
          align: 'center',
          width: 150,
          value: 'fax'
        },

        {
          text: 'E-mail 1',
          sortable: true,
          class: 'font-weight-medium subtitle-1',
          divider: true,
          align: 'center',
          width: 150,
          value: 'email1'
        },

        {
          text: 'E-mail 2',
          sortable: true,
          class: 'font-weight-medium subtitle-1',
          divider: true,
          align: 'center',
          width: 150,
          value: 'email2'
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
      editedItem: new ExtEmployee(),
      defaultItem: new ExtEmployee()
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
    extEmployees () {
      return this.getter('extEmployees', 'items')
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
    ...mapActions({
      setBusy: 'navInterface/setBusy',
      unsetBusy: 'navInterface/unsetBusy',
      setSearch: 'navInterface/setSearch'
    }),

    async initialize () {
      try {
        this.busy = true
        if (!this.storage.extEmployees.items.length || !this.storage.extCurrentPositions.items.length) {
          await Promise.all([
            this.storage.extEmployees.updateAll(),
            this.storage.organisations.updateAll(),
            this.storage.extCurrentPositions.updateAll()
          ])
        }
        this.busy = false
      } catch (err) {
        consola.error(err)
      }
    },

    async reset () {
      try {
        console.time('Reset ExtEmployee')
        this.busy = true
        await Promise.all([
          this.storage.extEmployees.updateAll(),
          this.storage.organisations.updateAll(),
          this.storage.extCurrentPositions.updateAll()
        ])
        this.busy = false
        console.timeEnd('Reset ExtEmployee')
      } catch (err) {
        consola.error(err)
      }
    },

    editItem (item) {
      this.editedIndex = item.id || -1
      this.editedItem = this.editedIndex >= 0
        ? this.storage.extEmployees.indexed[item.id].clone()
        : new ExtEmployee()
      this.$refs.editForm.open(this.editedItem)
    },

    async deleteItem (item) {
      const query = `
        mutation {
          deleteExtEmployee (id: ${item.id}) {
            type
            id
            text
            messageType
          }
        }
      `
      this.busy = true
      confirm(`Вы уверены, что хотите удалить внешнего респондента ${item.orgName}?`) && await gQLRequestMessage(this, query)
      this.busy = false
      // this.$refs.form.resetValidation()
      await this.initialize()
    }

  },
  middleware: ['auth']
}
</script>
