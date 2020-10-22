<template>
  <v-layout
    column
    justify-left
    align-left
  >
    <v-flex
      xs12
      sm8
      md6
    >
      <v-container>
        <h1>Администрирование пользователей</h1>
        <v-data-table
          :headers="headers"
          :items="users"
          :search="search"
          :footer-props="{
            itemsPerPageText: 'Записей на странице',
            itemsPerPageAllText: 'все',
            itemsPerPageOptions: [10, 20, 50, -1]
            // pageText: 'ddd'
          }"
          sort-by="id"
          class="elevation-1"
        >
          <template v-slot:top>
            <v-toolbar flat color="amber darken-4">
              <v-toolbar-title>Пользователи</v-toolbar-title>
              <v-divider
                class="mx-4"
                inset
                vertical
              />
              <v-spacer />
              <v-text-field
                v-model="search"
                append-icon="mdi-magnify"
                label="Поиск"
                single-line
                hide-details
              />
              <v-dialog v-model="dialog" max-width="600px" @keydown.enter.prevent="save">
                <template v-slot:activator="{ on }">
                  <v-btn color="primary" dark class="mb-2" v-on="on">
                    Добавить
                  </v-btn>
                </template>
                <v-card>
                  <v-card-title>
                    <span class="headline">{{ formTitle }}</span>
                  </v-card-title>

                  <v-card-text>
                    <v-container>
                      <v-row>
                        <v-col cols="12" sm="6" md="6">
                          <v-text-field v-model="editedItem.name" label="Имя" />
                        </v-col>
                        <v-col cols="12" sm="6" md="6">
                          <v-text-field v-model="editedItem.password" type="password" label="Пароль" />
                        </v-col>
                        <v-col cols="12" sm="6" md="6">
                          <v-autocomplete
                            v-model="editedItem.employeeId"
                            :items="employees"
                            item-text="name"
                            item-value="id"
                            label="Работник"
                            persistent-hint
                            single-line
                          />
                        </v-col>
                        <v-col cols="12" sm="6" md="6">
                          <v-select
                            v-model="editedItem.groups"
                            :items="groups"
                            :menu-props="{ maxHeight: '400' }"
                            item-text="name"
                            item-value="id"
                            label="Группы"
                            multiple
                            hint="Укажите группы, где состоит пользователь"
                            persistent-hint
                          />
                        </v-col>
                      </v-row>
                    </v-container>
                  </v-card-text>

                  <v-card-actions>
                    <v-spacer />
                    <v-btn color="blue darken-1" text @click="close">
                      Отмена
                    </v-btn>
                    <v-btn color="blue darken-1" text @click="save">
                      Сохранить
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
            </v-toolbar>
          </template>
          <template v-slot:item.action="{ item }">
            <v-icon
              small
              class="mr-2"
              @click="editItem(item)"
            >
              mdi-pencil
            </v-icon>
            <v-icon
              small
              @click="deleteItem(item)"
            >
              mdi-delete
            </v-icon>
          </template>
          <template v-slot:no-data>
            <v-btn color="primary" @click="initialize">
              Сбросить
            </v-btn>
          </template>
        </v-data-table>
      </v-container>
    </v-flex>
  </v-layout>
</template>

<script>
import { mapGetters, mapState, mapActions } from 'vuex'

const { gQLRequestMessage } = require('../../utils/gql-request')

export default {
  data () {
    return {
      dialog: false,
      storage: this.$docs.buffer,
      headers: [
        {
          text: '№',
          align: 'left',
          sortable: true,
          value: 'id'
        },
        {
          text: 'Имя пользователя',
          sortable: true,
          value: 'name'
        },
        {
          text: 'Состоит в группах',
          sortable: true,
          value: 'groups'
        },
        {
          text: 'Изменён',
          sortable: true,
          value: 'updatedAt'
        },
        {
          text: 'Работник',
          sortable: true,
          value: 'employee'
        },
        {
          text: 'Действия',
          sortable: false,
          value: 'action'
        }
      ],
      editedIndex: -1,
      editedItem: {
        id: '',
        name: '',
        password: '',
        employeeId: '',
        groups: [],
        createdAt: '',
        updatedAt: ''
      },
      defaultItem: {
        id: '',
        name: '',
        password: '',
        employeeId: '',
        groups: [],
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
    }
  },

  computed: {
    formTitle () {
      return this.editedIndex === -1 ? 'Новая запись' : 'Редактировать'
    },
    employees () {
      return this.getter('employees', 'items')
    },
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
      user: 'auth/getUser',
      usersDep: 'auth/getUserDep'
    }),
    ...mapState('auth', {
      users: 'users',
      groups: 'groups'
    })
  },

  watch: {
    dialog (val) {
      val || this.close()
    }
  },

  created () {
    this.initialize()
  },

  methods: {
    ...mapActions({
      fetchForce: 'fetchForce',
      fetch: 'fetch',
      setBusy: 'navInterface/setBusy',
      setSearch: 'navInterface/setSearch',
      unsetBusy: 'navInterface/unsetBusy'
    }),
    getter (ent, type) {
      if (!this.storage) { return [] }
      if (this.storage[ent].synchronization) { return [] }
      return this.storage[ent][type]
    },
    async initialize () {
      try {
        await this.fetch('Users')
        await this.fetch('Groups')
      } catch (err) {
        throw err
      }
    },

    editItem (item) {
      // Определение какая кнопка нажата
      this.editedIndex = this.users.indexOf(item)
      // Связь полей формы редактирования с выбранной строчкой
      this.editedItem = Object.assign({}, item)
      this.editedItem.password = ''
      // Отмечание галочками групп, в которых выбранный пользователь уже состоит
      // Находим из массива пользователя выбранного
      const selectedUser = this.users.find(user => user.id === this.editedItem.id)
      // Парсим в массив название групп
      let groupNames = []
      if (selectedUser.groups) {
        groupNames = selectedUser.groups.split('; ')
      }
      // Создаём массив id выбранных групп
      const groupIds = []
      for (const item of groupNames) {
        groupIds.push(this.groups.find(group => group.name === item).id)
      }
      // присваиваем массив id редактируемому элементу
      this.editedItem.groups = groupIds
      // Показ диалогового окна
      this.dialog = true
    },

    async deleteItem (item) {
      const query = `
        mutation {
          deleteUser(id: ${item.id}) {
            id
            type
            text
            messageType
          }
        }
      `
      confirm(`Вы уверены, что хотите удалить пользователя ${item.name}?`) && await gQLRequestMessage(this, query)
      await this.fetchForce('Users')
      this.initialize()
    },

    close () {
      this.dialog = false
      setTimeout(() => {
        this.editedItem = Object.assign({}, this.defaultItem)
        this.editedIndex = -1
      }, 300)
      this.initialize()
    },

    async save (item) {
      // Если нажата кнопка добавить пользователя
      if (this.editedIndex === -1) {
        let employeeId = ''
        if (this.editedItem.employeeId) {
          employeeId = `employeeId: "${this.editedItem.employeeId}"`
        }
        let query = `
          mutation {
            addUser(user: {name: "${this.editedItem.name}" password: "${this.editedItem.password}" ${employeeId}}) {
              type
              id
              text
              messageType
              item
            }
          }
        `
        await gQLRequestMessage(this, query)
        await this.fetchForce('Users')
        if (this.editedItem.groups.length) {
          const newUser = this.users.find(user => user.name === this.editedItem.name)
          query = `
            mutation {
              assignUserToGroups (userId: "${newUser.id}" groupId: [${this.editedItem.groups}]) {
                type
                id
                text
                messageType
              }
            }
          `
          await gQLRequestMessage(this, query)
          await this.fetchForce('Users')
        }
      } else {
        // Если нажата кнопка редактировать пользователя
        let employeeId = ''
        if (this.editedItem.employeeId) {
          employeeId = `employeeId: "${this.editedItem.employeeId}"`
        }
        let assign = ''
        if (this.editedItem.groups.length) {
          assign = `
            assignUserToGroups (userId: "${this.editedItem.id}" groupId: [${this.editedItem.groups}]) {
              type
              id
              text
              messageType
            }
          `
        }
        const query = `
          mutation {
            editUser(id: "${this.editedItem.id}" user: {name: "${this.editedItem.name}" password: "${this.editedItem.password}" ${employeeId}}) {
              type
              id
              text
              messageType
              item
            }
            removeUserFromAllGroups (id: "${this.editedItem.id}") {
              type
              id
              text
              messageType
            }
            ${assign}
          }
        `
        await gQLRequestMessage(this, query)
        await this.fetchForce('Users')
      }
      this.close()
    }
  },
  middleware: ['auth', 'policy-admin']
}
</script>
