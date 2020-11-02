<template>
  <div>
    <v-card>
      <v-data-table
        :headers="headers"
        :items="allPos"
        :item-key="'id' + 'newId'"
        :loading="busy"
        :items-per-page="100"
        dense
        sort-by="DepartmentId"
        class="elevation-1"
        hide-default-footer
        loading-text="Загрузка"
      >
        <template #top>
          <v-toolbar flat :color="theme.tables.subPanel" dense>
            <h2>Должности</h2>
            <v-spacer />
            <v-btn
              :disabled="busy"
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
            :disabled="busy"
            small
            class="mr-2"
            @click="editItem(item)"
          >
            mdi-pencil
          </v-icon>
          <v-icon
            :disabled="busy"
            small
            @click="delPos(item)"
          >
            mdi-delete
          </v-icon>
        </template>
      </v-data-table>
    </v-card>
    <!-- ------------------------------------------Добавление новых должностей------------------------------------- -->
    <v-dialog
      v-model="dialog"
      max-width="800px"
      @keydown.enter.prevent="save"
      @keydown.esc.prevent="close"
    >
      <v-card outlined>
        <v-form
          ref="form"
          v-model="valid"
          :lazy-validation="lazy"
        >
          <v-container>
            <v-row>
              <v-col cols="12" sm="6" md="6">
                <v-autocomplete
                  ref="Org"
                  v-model="editedItem.OrganisationId"
                  :items="organisations"
                  :menu-props="{ maxHeight: '400' }"
                  clearable
                  item-text="orgName"
                  item-value="id"
                  label="Организация"
                />
              </v-col>
              <v-col cols="12" sm="6" md="6">
                <v-autocomplete
                  ref="Pos"
                  v-model="editedItem.PositionId"
                  :items="positions"
                  :menu-props="{ maxHeight: '400' }"
                  clearable
                  item-text="posName"
                  item-value="id"
                  label="Должность"
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
                  <template #activator="{ on }">
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
                    color="primary"
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
                  <template #activator="{ on }">
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
                    color="primary"
                    dark
                    no-title
                    scrollable
                    first-day-of-week="1"
                    @input="dateMenu2 = false"
                  />
                </v-menu>
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
import { v1 as uuidv1 } from 'uuid'
import Rules from '@/utils/rules'
import { ExtCurrentPosition } from '@/Storage/ent-methods/ext-current-positions'
import { gQLRequestMessage } from '@/utils/gql-request'
import { dateConvert, getFormatedDate } from '@/utils/date'

export default {
  props: {
    extEmployeeId: {
      type: [String, Number],
      required: true,
      default: null
    }
  },
  data () {
    return {
      storage: this.$docs.buffer,
      rules: Rules,
      headers: [
        {
          text: 'Организация',
          sortable: true,
          align: 'center',
          value: 'organisation'
        },
        {
          text: 'Должность',
          sortable: true,
          align: 'center',
          value: 'position'
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
      lazy: true,
      valid: true,
      dateMenu1: false,
      dateMenu2: false,
      editedItem: new ExtCurrentPosition(),
      defaultItem: new ExtCurrentPosition(),
      posToAdd: [],
      posToDelete: [],
      posToEdit: [],
      posEdit: false,
      selectedItem: null
    }
  },
  computed: {
    ...mapGetters({
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
    organisations () {
      return this.getter('organisations', 'items')
    },
    positions () {
      return this.getter('positions', 'items')
    },
    extEmployeeCurrentPositions () {
      if (!this.storage) { return [] }
      return this.storage.extEmployees.indexed[this.extEmployeeId].ExtCurrentPositions
    },

    originPositions () {
      if (this.extEmployeeCurrentPositions.length) {
        return this.extEmployeeCurrentPositions.filter(item => !this.getPosToEdit(item.id) && !this.getPosToDelete(item.id))
      }
      return []
    },

    allPos () {
      return [...this.originPositions, ...this.posToEdit, ...this.posToAdd]
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

    async initialize () {
      try {
        this.busy = true
        if (!this.storage.extCurrentPositions.items.length ||
          !this.storage.organisations.items.length) {
          await Promise.all([
            this.storage.extCurrentPositions.updateAll(),
            this.storage.organisations.updateAll()
          ])
        }
        this.busy = false
      } catch (err) {
        throw err
      }
    },

    reset () {
      this.posToAdd = []
      this.posToDelete = []
      this.posToEdit = []
      this.editedItem = this.defaultItem
      if (this.$refs.form) {
        this.$refs.form.resetValidation()
      }
    },
    getPosToEdit (id) {
      return this.posToEdit.find(el => el.id === id) || null
    },
    getPosToDelete (id) {
      return this.posToDelete.find(el => el.id === id) || null
    },
    editItem (item) {
      // Определение какая кнопка нажата
      this.editedIndex = this.allPos.indexOf(item)
      // Если нажата редактировать
      if (item) {
        this.editedItem = item.clone()
        this.selectedItem = item
        this.posEdit = true
      // Если нажата добавить
      } else {
        this.posEdit = false
        this.editedItem = new ExtCurrentPosition({
          ExtEmployeeId: this.extEmployeeId
        })
      }
      this.editedItem.startDate = dateConvert(this.editedItem.startDate)
      this.editedItem.endDate = dateConvert(this.editedItem.endDate)
      this.dialog = true
    },

    async close () {
      this.editedItem.startDate = dateConvert(this.editedItem.startDate)
      this.editedItem.endDate = dateConvert(this.editedItem.endDate)
      this.dialog = false
      this.editedItem = this.defaultItem
      this.selectedItem = null
      this.editedIndex = -1
      await this.initialize()
      this.$refs.form.resetValidation()
      this.$refs.Org.lazySearch = null
      this.$refs.Pos.lazySearch = null
    },

    async save (item) {
      // Если нажата кнопка добавить
      if (!this.$refs.form.validate()) {
        return
      }
      if (this.editedIndex === -1) {
        this.editedItem.newId = uuidv1()
        this.editedItem.startDate = getFormatedDate(this.editedItem.startDate)
        this.editedItem.endDate = getFormatedDate(this.editedItem.endDate)
        // Добавление копии объекта для исключение мутаций
        this.posToAdd.push(this.editedItem)
      } else {
        // Если нажата кнопка редактировать
        const candidate1 = this.posToAdd.find(el => el.newId === this.editedItem.newId)
        const candidate2 = this.posToEdit.find(el => el.newId === this.editedItem.newId)
        if (candidate1) {
          // Если идёт редактирование добавленной вновь должности
          candidate1.startDate = getFormatedDate(this.editedItem.startDate)
          candidate1.endDate = getFormatedDate(this.editedItem.endDate)
          candidate1.PositionId = this.editedItem.PositionId
          candidate1.OrganisationId = this.editedItem.OrganisationId
        } else if (candidate2) {
          // Если идёт редактирование уже имеющейся должности
          candidate2.startDate = getFormatedDate(this.editedItem.startDate)
          candidate2.endDate = getFormatedDate(this.editedItem.endDate)
          candidate2.PositionId = this.editedItem.PositionId
          candidate2.OrganisationId = this.editedItem.OrganisationId
        } else {
          // Если вводится должность впервые
          if (!this.editedItem.newId) {
            this.editedItem.newId = uuidv1()
          }
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
        const emp = id ? `ExtEmployeeId: "${id}"` : `ExtEmployeeId: "${item.ExtEmployeeId}"`
        const query = `
          mutation {
            addExtCurrentPosition(extCurrentPosition: {
              ${start}
              ${end}
              ${emp}
              PositionId: "${item.PositionId}"
              OrganisationId: "${item.OrganisationId}"
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
      this.busy = false
      this.posToAdd = []
    },

    async editPosition (id) {
      if (!this.posToEdit.length) { return }
      this.busy = true
      for (const item of this.posToEdit) {
        const start = item.startDate ? `startDate: "${dateConvert(item.startDate)}"` : ''
        const end = item.endDate ? `endDate: "${dateConvert(item.endDate)}"` : ''
        const emp = id ? `ExtEmployeeId: "${id}"` : `ExtEmployeeId: "${item.ExtEmployeeId}"`
        const query = `
          mutation {
            editExtCurrentPosition(id: "${item.id}" extCurrentPosition: {
              ${start}
              ${end}
              ${emp}
              PositionId: "${item.PositionId}"
              OrganisationId: "${item.OrganisationId}"
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
      this.busy = false
      this.posToEdit = []
    },

    async deletePositions () {
      if (!this.posToDelete.length) { return }
      this.busy = true
      for (const item of this.posToDelete) {
        const query = `
            mutation {
              deleteExtCurrentPosition (id: "${item.id}") {
                text
                type
                id
                messageType
              }
            }
          `
        await gQLRequestMessage(this, query)
      }
      this.busy = false
      this.posToDelete = []
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
