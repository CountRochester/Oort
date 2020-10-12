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
          :items="groups"
          :footer-props="{
            itemsPerPageText: 'Записей на странице',
            itemsPerPageAllText: 'все',
            itemsPerPageOptions: [10, 20, 50, -1]
          }"
          sort-by="id"
          class="elevation-1"
        >
          <template id="GroupT" v-slot:top>
            <v-toolbar flat color="amber darken-4">
              <v-toolbar-title>Группы</v-toolbar-title>
              <v-divider
                class="mx-4"
                inset
                vertical
              />
              <v-spacer />
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
                          <v-text-field v-model="editedItemG.name" label="Название группы" />
                        </v-col>
                      </v-row>
                      <v-row>
                        <v-col cols="12" sm="12" md="12">
                          <v-checkbox
                            v-for="item in checkbox"
                            :key="checkbox.indexOf(item)"
                            v-model="item.value"
                            :label="item.label"
                            :false-value="false"
                            color="white"
                          />
                          {{ permission }}
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
            <v-btn color="primary" @click="initializeG">
              Сбросить
            </v-btn>
          </template>
        </v-data-table>
      </v-container>
    </v-flex>
  </v-layout>
</template>

<script>
import { mapState, mapActions } from 'vuex'

const { gQLRequestMessage } = require('../../utils/gql-request')

export default {
  components: {
  },
  data () {
    return {
      dialog: false,
      checkbox: [
        {
          value: false,
          trueValue: 1,
          label: 'Добавление документа'
        },
        {
          value: false,
          trueValue: 2,
          label: 'Изменение документа'
        },
        {
          value: false,
          trueValue: 4,
          label: 'Руководитель'
        },
        {
          value: false,
          trueValue: 8,
          label: 'Изменение состояний документов'
        },
        {
          value: false,
          trueValue: 16,
          label: 'Работа с вх/исх номерами'
        },
        {
          value: false,
          trueValue: 32,
          label: 'Добавление и удаление внутренних данных'
        },
        {
          value: false,
          trueValue: 64,
          label: '---'
        },
        {
          value: false,
          trueValue: 128,
          label: 'Удаление записей'
        },
        {
          value: false,
          trueValue: 255,
          label: 'Администрирование'
        }
      ],
      headers: [
        {
          text: '№',
          align: 'left',
          sortable: true,
          value: 'id'
        },

        {
          text: 'Название группы',
          sortable: true,
          value: 'name'
        },

        {
          text: 'Разрешения',
          align: 'right',
          sortable: true,
          value: 'permissions'
        },

        {
          text: 'Изменён',
          sortable: true,
          value: 'updatedAt'
        },

        {
          text: 'Действия',
          sortable: false,
          value: 'action'
        }
      ],
      editedIndex: -1,
      editedItemG: {
        id: '',
        name: '',
        permissions: '',
        createdAt: '',
        updatedAt: ''
      },
      defaultItemG: {
        id: '',
        name: '',
        permissions: '',
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
    }
  },

  computed: {
    formTitle () {
      return this.editedIndex === -1 ? 'Новая запись' : 'Редактировать'
    },
    ...mapState('auth', {
      users: 'users',
      groups: 'groups',
      employees: 'employees'
    }),
    permission () {
      return this.checkbox.reduce((acc, item) => {
        acc = item.value
          ? acc | parseInt(item.trueValue, 10)
          : acc
        return acc
      }, 0)
    }
  },

  watch: {
    dialog (val) {
      val || this.close()
    }
  },

  created () {
    this.initializeG()
  },

  methods: {
    ...mapActions({
      fetchForce: 'fetchForce',
      fetch: 'fetch'
    }),
    async initializeG () {
      try {
        await this.fetch('Employees')
        await this.fetch('Users')
        await this.fetch('Groups')
        this.checkbox.forEach((item, index) => {
          item.value = false
        })
      } catch (err) {
        throw err
      }
    },

    editItem (item) {
      // Определение какая кнопка нажата
      this.editedIndex = this.groups.indexOf(item)
      // Связь полей формы редактирования с выбранной строчкой
      this.editedItemG = Object.assign({}, item)
      const permis = item.permissions.split('').reverse()
      this.checkbox.forEach((item, index) => {
        item.value = !!parseInt(permis[index], 10)
      })
      // Показ диалогового окна
      this.dialog = true
    },

    async deleteItem (item) {
      const query = `
        mutation {
            deleteGroup (id: "${item.id}") {
            type
            id
            text
            messageType
          }
        }
      `
      confirm(`Вы уверены, что хотите удалить группу ${item.name}?`) && await gQLRequestMessage(this, query)
      await this.fetchForce('Groups')
      this.initializeG()
    },

    close () {
      this.dialog = false
      setTimeout(() => {
        this.editedItemG = Object.assign({}, this.defaultItem)
        this.editedIndex = -1
      }, 300)
      this.initializeG()
    },

    async save (item) {
      // const permis = this.checkbox.reduce((acc, item) => {
      //   acc = item.value
      //     ? acc | parseInt(item.trueValue, 10)
      //     : acc
      //   return acc
      // })
      // console.log(permis)
      // const permis = parseInt(this.checkbox1, 10) | parseInt(this.checkbox2, 10) | parseInt(this.checkbox3, 10) | parseInt(this.checkbox4, 10)
      // Если нажата кнопка добавить пользователя
      if (this.editedIndex === -1) {
        const query = `
          mutation {
            addGroup (group: {
              name: "${this.editedItemG.name}"
              permissions: ${this.permission}
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
            editGroup (id: "${this.editedItemG.id}" group: {
              name: "${this.editedItemG.name}"
              permissions: ${this.permission}
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
      await this.fetchForce('Groups')
      this.close()
    }
  },
  middleware: ['auth', 'policy-admin']
}
</script>
