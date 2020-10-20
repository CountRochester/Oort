<template>
  <div>
    <v-card>
      <v-data-table
        :headers="headers"
        :items="allPos"
        :item-key="'id' + 'newId'"
        :loading="busy"
        dense
        sort-by="DepartmentId"
        class="elevation-1"
        hide-default-footer
        loading-text="Загрузка"
      >
        <template #top>
          <v-toolbar flat color="light-blue darken-4" dense>
            <h2>Должности</h2>
            <v-spacer />
            <v-btn
              :disabled="busy||(!editable)"
              :color="theme.tables.menuText"
              dark
              class="mb-2"
              icon
              @click="editItem(null)"
            >
              <v-icon>mdi-plus</v-icon>
            </v-btn>
          </v-toolbar>
        </template>
        <template #item.action="{ item }">
          <v-icon
            :disabled="busy||(!editable)"
            small
            class="mr-2"
            @click="editItem(item)"
          >
            mdi-pencil
          </v-icon>
          <v-icon
            :disabled="busy||(!editable)"
            small
            @click="delPos(item)"
          >
            mdi-delete
          </v-icon>
        </template>
      </v-data-table>
    </v-card>
    <!-- ------------------------------------------Добавление новых должностей------------------------------------- -->
    <v-dialog v-model="dialog" max-width="800px" @keydown.enter.prevent="save">
      <v-card>
        <v-form
          ref="form"
          v-model="valid"
          :lazy-validation="lazy"
        >
          <v-container>
            <v-row>
              <v-col cols="12" sm="6" md="6">
                <v-autocomplete
                  ref="Dep"
                  v-model="editedItem.DepartmentId"
                  :items="deps"
                  :menu-props="{ maxHeight: '400' }"
                  item-text="shortName"
                  item-value="id"
                  label="Отдел"
                />
              </v-col>
              <v-col cols="12" sm="6" md="6">
                <v-autocomplete
                  ref="Pos"
                  v-model="editedItem.PositionId"
                  :items="positions"
                  :menu-props="{ maxHeight: '400' }"
                  item-text="posName"
                  item-value="id"
                  label="Должность"
                />
              </v-col>
              <v-col cols="12" sm="6" md="6">
                <v-text-field
                  v-model="editedItem.extPrefix"
                  :rules="[rules.rusLetDig]"
                  label="Дополнительный префикс во внешних документах"
                  hint="Укажите значение без /"
                />
              </v-col>
              <v-col cols="12" sm="6" md="6">
                <v-text-field
                  v-model="editedItem.intPrefix"
                  :rules="[rules.rusLetDig]"
                  label="Дополнительный префикс во внутренних документах"
                  hint="Укажите значение без /"
                />
              </v-col>
              <v-col cols="12" sm="6" md="6">
                <v-menu
                  ref="dateMenu1"
                  v-model="dateMenu1"
                  :close-on-content-click="false"
                  transition="scale-transition"
                  offset-y
                  min-width="290px"
                >
                  <template v-slot:activator="{ on }">
                    <v-text-field
                      :value="formatDate(editedItem.startDate)"
                      label="Дата назначения"
                      prepend-icon="mdi-calendar-month"
                      readonly
                      v-on="on"
                    />
                  </template>
                  <v-date-picker
                    v-model="editedItem.startDate"
                    locale="ru"
                    :color="theme.mainTheme.primary"
                    dark
                    no-title
                    scrollable
                    first-day-of-week="1"
                    @input="dateMenu1 = false"
                  />
                </v-menu>
              </v-col>
              <v-col cols="12" sm="6" md="6">
                <v-menu
                  ref="dateMenu2"
                  v-model="dateMenu2"
                  :close-on-content-click="false"
                  transition="scale-transition"
                  offset-y
                  min-width="290px"
                >
                  <template v-slot:activator="{ on }">
                    <v-text-field
                      :value="formatDate(editedItem.endDate)"
                      label="Дата перевода"
                      prepend-icon="mdi-calendar-month"
                      readonly
                      v-on="on"
                    />
                  </template>
                  <v-date-picker
                    v-model="editedItem.endDate"
                    locale="ru"
                    :color="theme.mainTheme.primary"
                    dark
                    no-title
                    scrollable
                    first-day-of-week="1"
                    @input="dateMenu2 = false"
                  />
                </v-menu>
              </v-col>
              <v-col cols="6" sm="6" md="6">
                <v-select
                  v-model="selectedSubdiv"
                  :items="subdivisionsInDep"
                  item-text="name"
                  item-value="id"
                  label="Подразделения"
                  multiple
                  clearable
                />
              </v-col>
            </v-row>
          </v-container>
        </v-form>
        <v-card-actions>
          <v-spacer />
          <v-btn :disabled="busy" :color="theme.tables.buttonColor" text @click="close">
            Отмена
          </v-btn>
          <v-btn :disabled="busy" :color="theme.tables.buttonColor" text @click="save">
            Сохранить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
/* eslint-disable no-useless-escape */
import { mapGetters, mapActions } from 'vuex'
import consola from 'consola'
import { v1 as uuidv1 } from 'uuid'
import Rules from '@/utils/rules'
import { CurrentPosition } from '@/Storage/ent-methods/current-positions'
import { gQLRequestMessage } from '@/utils/gql-request'
import { dateConvert, getFormatedDate } from '@/utils/date'

export default {
  props: {
    employeeId: {
      type: String,
      required: false,
      default: ''
    },
    editable: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  data () {
    return {
      storage: this.$docs.buffer,
      rules: Rules,
      headers: [
        {
          text: 'Должность',
          sortable: true,
          align: 'center',
          value: 'position'
        },
        {
          text: 'Отдел',
          sortable: true,
          align: 'center',
          value: 'department'
        },
        {
          text: 'Подразделение',
          sortable: true,
          align: 'center',
          value: 'subdivisions'
        },
        {
          text: 'Дата назначения',
          sortable: true,
          align: 'center',
          value: 'startDate'
        },
        {
          text: 'Дата окончания',
          sortable: true,
          align: 'center',
          value: 'endDate'
        },
        {
          text: 'Действия',
          divider: true,
          align: 'center',
          value: 'action'
        }
      ],
      dialog: false,
      lazy: false,
      valid: true,
      dateMenu1: false,
      dateMenu2: false,
      editedItem: new CurrentPosition(),
      defaultItem: new CurrentPosition(),
      posToAdd: [],
      posToDelete: [],
      posToEdit: [],
      selectedSubdiv: [],
      selectedEmployee: null,
      posEdit: false,
      selectedItem: null
    }
  },
  computed: {
    ...mapGetters({
      user: 'auth/getUser',
      theme: 'navInterface/getTheme'
    }),
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
    deps () {
      return this.getter('departments', 'items')
    },
    positions () {
      return this.getter('positions', 'items')
    },
    subdivisions () {
      return this.getter('subdivisions', 'items')
    },
    employee () {
      return this.getter('employees', 'indexed')
    },
    subdivision () {
      return this.getter('subdivisions', 'indexed')
    },
    subdivisionsInDep () {
      let subs = []
      subs = [...this.subdivisions.filter(el => el.DepartmentId === this.editedItem.DepartmentId)]
      return subs
    },

    originPositions () {
      const curPos = this.selectedEmployee?.CurrentPositions || []
      if (curPos.length) {
        return curPos.filter(item => !this.getPosToEdit(item.id) && !this.getPosToDelete(item.id))
      }
      return []
    },
    allPos () {
      return [...this.originPositions, ...this.posToEdit, ...this.posToAdd]
    },
    posChanged () {
      return [...this.posToAdd, ...this.posToEdit]
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
    formatDate (val) {
      return getFormatedDate(val)
    },
    ...mapActions({
      setBusy: 'navInterface/setBusy',
      unsetBusy: 'navInterface/unsetBusy'
    }),

    async initialize (id) {
      try {
        this.busy = true
        if (!this.storage.currentPositions.items.length || !this.storage.subdivisions.items.length) {
          await Promise.all([
            this.storage.subdivisions.updateAll(),
            this.storage.currentPositions.updateAll()
          ])
        }
        this.selectedSubdiv = []
        this.selectedEmployee = this.employee[id || this.employeeId].clone()
        this.busy = false
      } catch (err) {
        consola.error(err)
        throw err
      }
    },

    reset () {
      this.posToAdd = []
      this.posToDelete = []
      this.posToEdit = []
      this.selectedSubdiv = []
      this.editedItem = this.defaultItem
      if (this.$refs.form) {
        this.$refs.form.resetValidation()
      }
    },
    getPosToEdit (id) {
      let item = null
      if (this.posToEdit.length) {
        item = this.posToEdit.find(el => el.id === id)
      }
      return item
    },
    getPosToDelete (id) {
      let item = null
      if (this.posToDelete.length) {
        item = this.posToDelete.find(el => el.id === id)
      }
      return item
    },
    editItem (item) {
      this.editedIndex = this.allPos.indexOf(item)
      if (item) {
        this.editedItem = item.clone()
        this.selectedItem = item
        this.posEdit = true
      } else {
        this.posEdit = false
        this.editedItem = new CurrentPosition({
          EmployeeId: this.employeeId
        })
      }
      if (this.editedItem.SubdivisionId.length) {
        this.selectedSubdiv = this.editedItem.SubdivisionId
      }
      this.dialog = true
    },

    async close () {
      this.$refs.form.resetValidation()
      this.editedItem.startDate = dateConvert(this.editedItem.startDate)
      this.editedItem.endDate = dateConvert(this.editedItem.endDate)
      this.dialog = false
      this.editedItem = this.defaultItem
      this.selectedItem = null
      this.editedIndex = -1
      await this.initialize()
      this.$refs.form.resetValidation()
      this.$refs.Dep.lazySearch = null
      this.$refs.Pos.lazySearch = null
    },

    async save (item) {
      // Если нажата кнопка добавить
      if (!this.$refs.form.validate()) {
        return
      }
      console.log('this.editedIndex', this.editedIndex)
      if (this.editedIndex === -1) {
        this.editedItem.newId = uuidv1()
        this.editedItem.startDate = getFormatedDate(this.editedItem.startDate)
        this.editedItem.endDate = getFormatedDate(this.editedItem.endDate)
        this.editedItem.SubdivisionId = this.selectedSubdiv
        this.posToAdd.push(this.editedItem)
      } else {
        // Если нажата кнопка редактировать
        const candidate1 = this.posToAdd.find(el => el.newId === this.editedItem.newId)
        const candidate2 = this.posToEdit.find(el => el.newId === this.editedItem.newId)
        console.log('candidate1:', candidate1)
        console.log('candidate2:', candidate2)
        if (candidate1) {
          // Если идёт редактирование добавленной вновь должности
          candidate1.startDate = getFormatedDate(this.editedItem.startDate)
          candidate1.endDate = getFormatedDate(this.editedItem.endDate)
          candidate1.PositionId = this.editedItem.PositionId
          candidate1.DepartmentId = this.editedItem.DepartmentId
          candidate1.extPrefix = this.editedItem.extPrefix
          candidate1.intPrefix = this.editedItem.intPrefix
          candidate1.SubdivisionId = this.selectedSubdiv
        } else if (candidate2) {
          // Если идёт редактирование уже имеющейся должности
          candidate2.startDate = getFormatedDate(this.editedItem.startDate)
          candidate2.endDate = getFormatedDate(this.editedItem.endDate)
          candidate2.PositionId = this.editedItem.PositionId
          candidate2.DepartmentId = this.editedItem.DepartmentId
          candidate2.extPrefix = this.editedItem.extPrefix
          candidate2.intPrefix = this.editedItem.intPrefix
          candidate2.SubdivisionId = this.selectedSubdiv
        } else {
          // Если вводится должность впервые или редактируется впервые
          if (!this.editedItem.newId) {
            this.editedItem.newId = uuidv1()
          }
          this.editedItem.SubdivisionId = this.selectedSubdiv
          console.log('this.editedItem:', this.editedItem)
          this.posToEdit.push(this.editedItem)
        }
      }
      await this.close()
    },

    async addNewPosition (id) {
      if (!this.posToAdd.length) { return }
      this.busy = true
      for (const item of this.posToAdd) {
        const start = item.startDate ? `startDate: "${dateConvert(item.startDate)}"` : ''
        const end = item.endDate ? `endDate: "${dateConvert(item.endDate)}"` : ''
        const emp = id ? `EmployeeId: "${id}"` : `EmployeeId: "${item.EmployeeId}"`
        const extPrefix = item.extPrefix ? `extPrefix: "${item.extPrefix}"` : ''
        const intPrefix = item.intPrefix ? `intPrefix: "${item.intPrefix}"` : ''
        const subdiv = item.SubdivisionId
          ? item.SubdivisionId.length
            ? `SubdivisionId: [${item.SubdivisionId}]`
            : ''
          : ''
        const query = `
          mutation {
            addCurrentPosition(currentPosition: {
              ${start}
              ${end}
              ${emp}
              PositionId: "${item.PositionId}"
              DepartmentId: "${item.DepartmentId}"
              ${subdiv}
              ${extPrefix}
              ${intPrefix}
            }) {
              text
              type
              id
              messageType
              item
            }
          }
        `
        await gQLRequestMessage(this, query)
      }
      this.posToAdd = []
      this.busy = false
    },

    async editPosition (id) {
      if (!this.posToEdit.length) { return }
      this.busy = true
      for (const item of this.posToEdit) {
        const start = item.startDate ? `startDate: "${dateConvert(item.startDate)}"` : ''
        const end = item.endDate ? `endDate: "${dateConvert(item.endDate)}"` : ''
        const emp = id ? `EmployeeId: "${id}"` : `EmployeeId: "${item.EmployeeId}"`
        const extPrefix = item.extPrefix ? `extPrefix: "${item.extPrefix}"` : ''
        const intPrefix = item.intPrefix ? `intPrefix: "${item.intPrefix}"` : ''
        const subdiv = item.SubdivisionId
          ? item.SubdivisionId.length
            ? `SubdivisionId: [${item.SubdivisionId}]`
            : ''
          : ''
        const query = `
          mutation {
            editCurrentPosition(id: "${item.id}" currentPosition: {
              ${start}
              ${end}
              ${emp}
              PositionId: "${item.PositionId}"
              DepartmentId: "${item.DepartmentId}"
              ${subdiv}
              ${extPrefix}
              ${intPrefix}
            }) {
              text
              type
              id
              messageType
              item
            }
          }
        `
        await gQLRequestMessage(this, query)
      }
      this.posToEdit = []
      this.busy = false
    },

    async deletePositions () {
      if (!this.posToDelete.length) { return }
      const ids = this.posToDelete.reduce((acc, item) => [...acc, item.id], [])
      this.busy = true
      // for (const item of this.posToDelete) {
      const query = `
          mutation {
            deleteCurrentPosition (ids: [${ids}]) {
              text
              type
              id
              messageType
            }
          }
        `
      await gQLRequestMessage(this, query)
      // }
      this.posToDelete = []
      this.busy = false
    },

    delPos (item) {
      const candidate1 = this.posToAdd.find(el => el.newId === item.newId)
      const candidate2 = this.posToEdit.find(el => el.newId === item.newId)
      if (candidate1) {
        this.posToAdd = this.posToAdd.filter(el => el !== candidate1)
      } else if (candidate2) {
        this.posToEdit = this.posToEdit.filter(el => el !== candidate2)
      } else {
        this.posToDelete.push(item)
      }
    }

  }
}
</script>
