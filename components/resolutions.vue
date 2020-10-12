<template>
  <div>
    <v-card
      outlined
      dense
      elevation="6"
      class="mx-auto"
      max-width="400"
      min-width="355"
    >
      <template
        v-for="res1 in originResolutions"
      >
        <div :key="res1.id">
          <v-toolbar
            :color="res1.color"
            :dark="res1.darkText"
            :light="!res1.darkText"
            dense
          >
            <v-toolbar-title>
              <v-tooltip left>
                <template #activator="{ on: onn }">
                  <div v-on="onn">
                    {{ (res1 && currentPosition[res1.author]) ? currentPosition[res1.author].employee : null }}
                  </div>
                </template>
                <span>{{ (res1 && currentPosition[res1.author]) ? currentPosition[res1.author].employee : null }}</span>
                <br>
                <span>{{ (res1 && currentPosition[res1.author]) ? currentPosition[res1.author].position : null }}</span>
                <br>
                <span>{{ (res1 && currentPosition[res1.author]) ? '(' + currentPosition[res1.author].department + ')': null }}</span>
              </v-tooltip>
            </v-toolbar-title>
          </v-toolbar>
          <v-card-text>
            <h3
              v-for="item1 in res1.executants"
              :key="item1"
            >
              <v-tooltip left>
                <template #activator="{ on: onn }">
                  <div v-on="onn">
                    {{ currentPosition[item1] ? currentPosition[item1].employeeDat : null }}
                  </div>
                </template>
                <span>{{ currentPosition[item1] ? currentPosition[item1].employee : null }}</span>
                <br>
                <span>{{ currentPosition[item1] ? currentPosition[item1].position : null }}</span>
                <br>
                <span>{{ currentPosition[item1] ? '(' + currentPosition[item1].department + ')': null }}</span>
              </v-tooltip>
            </h3>
            <v-divider />
            {{ res1.text }}
            <div v-if="res1.expirationDate">
              <strong class="red--text text--lighten-1">{{ formatDate(res1.expirationDate) }}</strong>
            </div>
            <v-spacer />
            <v-row justify="end">
              <v-icon v-if="res1.complete" color="green">
                mdi-check-bold
              </v-icon>
              <v-tooltip bottom>
                <template #activator="{ on: onn }">
                  <v-btn
                    v-if="!res1.complete && editable"
                    :disabled="!canCompleteRes(res1) || busy"
                    color="success"
                    class="pt-0 mt-1"
                    small
                    v-on="onn"
                    @click="completeRes(res1)"
                  >
                    <v-icon>mdi-check-bold</v-icon>
                  </v-btn>
                </template>
                <span>Отметить как выполненную</span>
              </v-tooltip>
              <v-spacer />

              <v-tooltip bottom>
                <template #activator="{ on: onn }">
                  <v-btn
                    v-if="editable"
                    :disabled="!canDeleteRes(res1) || busy"
                    color="success"
                    class="pt-0 mt-1"
                    small
                    v-on="onn"
                    @click="resDialogOpen(res1)"
                  >
                    <v-icon>mdi-lead-pencil</v-icon>
                  </v-btn>
                </template>
                <span>Редактировать резолюцию</span>
              </v-tooltip>

              <v-tooltip bottom>
                <template #activator="{ on: onn }">
                  <v-btn
                    v-if="editable"
                    :disabled="!canDeleteRes(res1) || busy"
                    color="error"
                    class="pt-0 mt-1"
                    small
                    v-on="onn"
                    @click="deleteRes(res1)"
                  >
                    <v-icon>mdi-trash-can-outline</v-icon>
                  </v-btn>
                </template>
                <span>Удалить резолюцию</span>
              </v-tooltip>
            </v-row>
          </v-card-text>
        </div>
      </template>
    </v-card>
    <v-card
      outlined
      dense
      elevation="6"
      class="mx-auto"
      max-width="400"
      min-width="355"
    >
      <template v-for="resNew in resolutionsChanged">
        <div :key="resNew.newId">
          <v-toolbar
            :color="resNew.color"
            :dark="resNew.darkText"
            :light="!resNew.darkText"
            dense
          >
            <v-toolbar-title>
              <v-tooltip left>
                <template #activator="{ on: onn }">
                  <div v-on="onn">
                    {{ (resNew && currentPosition[resNew.author]) ? currentPosition[resNew.author].employee : null }}
                  </div>
                </template>
                <span>{{ (resNew && currentPosition[resNew.author]) ? currentPosition[resNew.author].employee : null }}</span>
                <br>
                <span>{{ (resNew && currentPosition[resNew.author]) ? currentPosition[resNew.author].position : null }}</span>
                <br>
                <span>{{ (resNew && currentPosition[resNew.author]) ? '(' + currentPosition[resNew.author].department + ')': null }}</span>
              </v-tooltip>
            </v-toolbar-title>
          </v-toolbar>
          <v-card-text>
            <h3
              v-for="itemNew in resNew.executants"
              :key="itemNew"
            >
              <v-tooltip left>
                <template #activator="{ on: onn }">
                  <div v-on="onn">
                    {{ currentPosition[itemNew] ? currentPosition[itemNew].employeeDat : null }}
                  </div>
                </template>
                <span>{{ currentPosition[itemNew] ? currentPosition[itemNew].employee : null }}</span>
                <br>
                <span>{{ currentPosition[itemNew] ? currentPosition[itemNew].position : null }}</span>
                <br>
                <span>{{ currentPosition[itemNew] ? '(' + currentPosition[itemNew].department + ')': null }}</span>
              </v-tooltip>
            </h3>
            <v-divider />
            {{ resNew.text }}
            <div v-if="resNew.expirationDate">
              <strong class="red--text text--lighten-1">{{ formatDate(resNew.expirationDate) }}</strong>
            </div>
            <v-spacer />
            <v-row justify="end">
              <v-icon v-if="resNew.complete" color="green">
                mdi-check-bold
              </v-icon>
              <v-spacer />
              <v-tooltip bottom>
                <template #activator="{ on: onn }">
                  <v-btn
                    :disabled="!canDeleteRes(resNew) || busy"
                    color="primary"
                    class="pt-0 mt-1"
                    small
                    @click="resDialogOpen(resNew)"
                    v-on="onn"
                  >
                    <v-icon>mdi-lead-pencil</v-icon>
                  </v-btn>
                </template>
                <span>Редактировать резолюцию</span>
              </v-tooltip>

              <v-tooltip bottom>
                <template #activator="{ on: onn }">
                  <v-btn
                    :disabled="!canDeleteRes(resNew) || busy"
                    color="error"
                    class="pt-0 mt-1"
                    small
                    @click="deleteRes(resNew)"
                    v-on="onn"
                  >
                    <v-icon>mdi-trash-can-outline</v-icon>
                  </v-btn>
                </template>
                <span>Удалить резолюцию</span>
              </v-tooltip>
            </v-row>
          </v-card-text>
        </div>
      </template>
    </v-card>
    <div justify="center">
      <v-tooltip bottom>
        <template #activator="{ on: onn }">
          <v-btn
            v-if="editable"
            :disabled="busy"
            color="primary"
            class="pt-0 mt-1"
            min-width="355"
            v-on="onn"
            @click="resDialogOpen(null)"
          >
            <v-icon>mdi-plus</v-icon>
          </v-btn>
        </template>
        <span>Добавить резолюцию</span>
      </v-tooltip>
    </div>
    <!-- -------------------------------------------Диалог добавления резолюции------------------------------------------ -->
    <!-- ---------------------------------------------------------------------------------------------------------------- -->
    <!-- ---------------------------------------------------------------------------------------------------------------- -->
    <v-dialog v-model="dialogResolution" max-width="400px">
      <v-card>
        <v-card-title>
          <span class="headline">{{ formTitleRes }}</span>
        </v-card-title>
        <v-container>
          <v-form
            ref="formRes"
            v-model="validRes"
            :lazy-validation="lazy"
          >
            <v-autocomplete
              v-model="editedRes.executants"
              :items="filteredEmployeesRes"
              :menu-props="{ maxHeight: '400' }"
              :rules="[rules.required]"
              chips
              small-chips
              deletable-chips
              item-text="nameAndDep"
              item-value="id"
              label="Исполнители"
              multiple
              outlined
              dense
            />
            <v-textarea
              v-model="editedRes.text"
              :rules="[rules.required, rules.letDigSym2]"
              label="Текст резолюции"
              outlined
              rows="6"
            />
            <v-menu
              v-model="datePickResolution"
              :close-on-content-click="false"
              transition="scale-transition"
              offset-y
              min-width="290px"
            >
              <template #activator="{ on }">
                <v-text-field
                  :value="formatDate(editedRes.expirationDate)"
                  prefix="срок:"
                  prepend-icon="mdi-calendar-month"
                  readonly
                  outlined
                  dense
                  v-on="on"
                />
              </template>
              <v-date-picker
                v-model="editedRes.expirationDate"
                locale="ru"
                color="primary"
                dark
                no-title
                scrollable
                first-day-of-week="1"
                @input="datePickResolution = false"
              />
            </v-menu>
            <v-checkbox
              v-model="editedRes.complete"
              dark
              false-value="false"
              true-value="true"
              :color="theme.tables.menuText"
              label="Резолюция исполнена"
            />
          </v-form>
        </v-container>
        <v-card-actions>
          <v-spacer />
          <v-btn :disabled="busy" :color="theme.tables.buttonColor" text @click="closeRes">
            Отмена
          </v-btn>
          <v-btn :disabled="busy" :color="theme.tables.buttonColor" text @click="addResolution">
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
import { dateConvert, getFormatedDate } from '@/utils/date'
import { gQLRequestMessage } from '@/utils/gql-request'
import { Resolution } from '@/Storage/ent-methods/resolutions'
import { NullCurrentPosition } from '@/Storage/ent-methods/current-positions'

export default {
  props: {
    editedItem: {
      type: Object,
      required: false,
      default: () => ({})
    },
    editable: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      default: 'ExtInc',
      validator: (value) => {
        // Значение должно соответствовать одной из этих строк
        return ['ExtInc', 'IntInc', 'Internal'].includes(value)
      }
    },
    lazy: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      // --------------------------------Общие-----------------------------------
      storage: this.$docs.buffer,
      rules: Rules,
      // --------------------------Диалог резолюций------------------------------
      validRes: true,
      dialogResolution: false,
      datePickResolution: false,
      dateResolution: '',
      resEdit: false,
      editedRes: new Resolution(),
      resolutionsToAdd: [],
      resolutionsToDelete: [],
      resolutionsToEdit: []
    }
  },
  computed: {
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
    currentPositions () {
      return this.getter('currentPositions', 'items')
    },
    department () {
      return this.getter('departments', 'indexed')
    },
    currentPosition () {
      return this.getter('currentPositions', 'indexed')
    },
    ...mapGetters({
      user: 'auth/getUser',
      selectedDep: 'auth/getSelectDep',
      theme: 'navInterface/getTheme'
    }),
    resAuthor () {
      const usersEmployeeId = this.user.employee ? this.user.employee.id : null
      const author = this.currentPositions.find(el => (el.EmployeeId === usersEmployeeId) && (el.DepartmentId === this.selectedDep))
      return author || new NullCurrentPosition()
    },

    originResolutions () {
      let resolutions = []
      if (this.editedItem.Resolutions.length) {
        resolutions = this.editedItem.Resolutions.filter(item => !this.getResolutionToEdit(item.id) && !this.getResolutionsToDelete(item.id))
      }
      return resolutions
    },

    formTitleRes () {
      return this.resEdit ? 'Редактирование резолюции' : 'Добавление резолюции'
    },
    filteredEmployeesRes () {
      let empls = []
      if (this.user && this.storage.departments.items.length && this.selectedDep) {
        if (this.department[this.selectedDep]) {
          const childDeps = this.department[this.selectedDep].childDepsId
          empls = this.currentPositions.filter(curPos => curPos.DepartmentId === this.selectedDep || childDeps.includes(curPos.DepartmentId))
            .map(el => ({
              id: el.id,
              dep: el.DepartmentId,
              nameAndDep: el.posName
            }))
        }
      }
      return empls
    },
    resolutionsChanged () {
      return [...this.resolutionsToAdd, ...this.resolutionsToEdit]
    }
  },

  mounted () {
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
      setDep: 'auth/selectDep',
      setEditedItemId: 'navInterface/setEditedItemId',
      setBusy: 'navInterface/setBusy',
      unsetBusy: 'navInterface/unsetBusy'
    }),
    reset () {
      this.validRes = true
      this.dialogResolution = false
      this.datePickResolution = false
      this.dateResolution = ''
      this.resEdit = false
      this.editedRes = new Resolution()
      this.editedRes.author = this.resAuthor.id
      this.resolutionsToAdd = []
      this.resolutionsToDelete = []
      this.resolutionsToEdit = []
    },
    canDeleteRes (item) {
      return item.author === this.resAuthor.id
    },
    canCompleteRes (item) {
      return item.author === this.resAuthor.id || item.executants.includes(this.resAuthor.id)
    },

    getResolutionToEdit (id) {
      if (this.resolutionsToEdit.length) {
        return this.resolutionsToEdit.find(el => el.id === id) || null
      }
      return null
    },
    getResolutionsToDelete (id) {
      if (this.resolutionsToDelete.length) {
        return this.resolutionsToDelete.find(el => el.id === id) || null
      }
      return null
    },

    resDialogOpen (item) {
      if (item) {
        this.editedRes = item.clone()
        this.resEdit = true
      } else {
        this.resEdit = false
      }
      this.editedRes.author = this.resAuthor.id
      switch (this.type) {
        case 'ExtInc': {
          this.editedRes.extIncoming = this.editedItem.id
          break
        }
        case 'IntInc': {
          this.editedRes.intIncoming = this.editedItem.id
          break
        }
        case 'Internal': {
          this.editedRes.internal = this.editedItem.id
          break
        }
      }
      this.dialogResolution = true
    },
    completeRes (item) {
      if (item) {
        this.editedRes = item.clone()
        this.resEdit = true
        switch (this.type) {
          case 'ExtInc': {
            this.editedRes.extIncoming = this.editedItem.id
            break
          }
          case 'IntInc': {
            this.editedRes.intIncoming = this.editedItem.id
            break
          }
          case 'Internal': {
            this.editedRes.internal = this.editedItem.id
            break
          }
        }
        this.editedRes.complete = true
        this.resolutionsToEdit.push(this.editedRes)
        this.editedRes = new Resolution()
      } else {
        this.resEdit = false
      }
    },
    addResolution () {
      if (!this.$refs.formRes.validate()) {
        return
      }
      const candidate1 = this.resolutionsToAdd.find(el => el.newId === this.editedRes.newId)
      const candidate2 = this.resolutionsToEdit.find(el => el.newId === this.editedRes.newId)
      if (this.resEdit) {
        if (candidate1) {
          candidate1.text = this.editedRes.text
          candidate1.expirationDate = dateConvert(this.editedRes.expirationDate)
          candidate1.executants = this.editedRes.executants
          candidate1.complete = this.editedRes.complete
        } else if (candidate2) {
          candidate2.text = this.editedRes.text
          candidate2.expirationDate = dateConvert(this.editedRes.expirationDate)
          candidate2.executants = this.editedRes.executants
          candidate2.complete = this.editedRes.complete
        } else {
          this.resolutionsToEdit.push(this.editedRes.clone())
        }
      } else {
        this.editedRes.author = this.resAuthor.id
        this.editedRes.darkText = true
        this.editedRes.color = 'primary'
        this.editedRes.newId = uuidv1()
        this.resolutionsToAdd.push(this.editedRes.clone())
      }
      this.closeRes()
    },
    deleteRes (item) {
      const candidate1 = this.resolutionsToAdd.find(el => el.newId === item.newId)
      const candidate2 = this.resolutionsToEdit.find(el => el.newId === item.newId)
      if (candidate1) {
        this.resolutionsToAdd = this.resolutionsToAdd.filter(el => el !== candidate1)
      } else if (candidate2) {
        this.resolutionsToEdit = this.resolutionsToEdit.filter(el => el !== candidate2)
      } else {
        this.resolutionsToDelete.push(item.clone())
      }
    },
    closeRes () {
      this.dialogResolution = false
      this.datePickResolution = false
      this.dateResolution = ''
      this.resEdit = false
      this.editedRes = new Resolution()
      this.editedRes.author = this.resAuthor.id
      this.$refs.formRes.resetValidation()
    },

    async sendResToDep (res) {
      const filteredEmployeesResIds = this.filteredEmployeesRes.reduce((acc, empl) => [...acc, empl.id], [])
      let execsId = res.executants.filter(el => filteredEmployeesResIds.includes(el))
      // for (const item of res.executants) {
      //   const curPos = this.filteredEmployeesRes.find(el => el.id === item)
      //   if (curPos) {
      //     execsId.push(curPos.id)
      //   }
      // }
      execsId = execsId.filter((item, index, self) =>
        index === self.findIndex(t => (t === item))
      )
      let query = ''
      switch (this.type) {
        case 'ExtInc': {
          query = `
            mutation {
              sendExtIncomingToExecs (id: "${res.extIncoming}" execsId: [${execsId}]) {
                  text
                  type
                  id
                  messageType
                }
            }
          `
          break
        }
        case 'IntInc': {
          query = `
            mutation {
              sendIntIncomingToExecs (id: "${res.intIncoming}" execsId: [${execsId}]) {
                  text
                  type
                  id
                  messageType
                }
            }
          `
          break
        }
        case 'Internal': {
          query = `
            mutation {
              sendInternalToExecs (id: "${res.internal}" execsId: [${execsId}]) {
                  text
                  type
                  id
                  messageType
                }
            }
          `
          break
        }
      }
      this.busy = true
      await gQLRequestMessage(this, query)
      this.busy = false
    },

    async addNewResolution () {
      if (this.resolutionsToAdd.length) {
        const idProp = this.type === 'ExtInc'
          ? 'ExtIncomingId'
          : this.type === 'IntInc'
            ? 'IntIncomingId'
            : 'InternalId'
        for (const res of this.resolutionsToAdd) {
          let date = ''
          if (res.expirationDate) {
            date = `expirationDate: "${dateConvert(res.expirationDate)}"`
          }
          const query = `
                mutation {
                  addResolution (resolution: {
                    text: "${res.text}"
                    ${date}
                    ${idProp}: "${res.extIncoming}"
                    authorId: "${res.author}"
                    complete: ${res.complete}
                  } executantsId: [${res.executants}]) {
                    text
                    type
                    id
                    messageType
                    item
                  }
                }
              `
          this.busy = true
          await gQLRequestMessage(this, query)
          this.busy = false

          await this.sendResToDep(res)
        }
        this.resolutionsToAdd = []
      }
    },
    getResolutionsToAdd () {
      if (this.resolutionsToAdd.length) {
        const output = this.resolutionsToAdd.map(res => ({
          text: res.text,
          expirationDate: res.expirationDate ? dateConvert(res.expirationDate) : null,
          authorId: res.author,
          complete: res.complete,
          executantsId: res.executants
        }))
        this.resolutionsToAdd = []
        return output
      }
    },
    async editResolution () {
      if (this.resolutionsToEdit.length) {
        const idProp = this.type === 'ExtInc'
          ? 'ExtIncomingId'
          : this.type === 'IntInc'
            ? 'IntIncomingId'
            : 'InternalId'
        for (const res of this.resolutionsToEdit) {
          let date = ''
          if (res.expirationDate) {
            date = `expirationDate: "${dateConvert(res.expirationDate)}"`
          }
          const query = `
                mutation {
                  editResolution (id: "${res.id}" resolution: {
                    text: "${res.text}"
                    ${date}
                    ${idProp}: "${res.extIncoming}"
                    authorId: "${res.author}"
                    complete: ${res.complete}
                  } executantsId: [${res.executants}]) {
                    text
                    type
                    id
                    messageType
                    item
                  }
                }
              `
          this.busy = true
          await gQLRequestMessage(this, query)
          this.busy = false
          await this.sendResToDep(res)
        }
        this.resolutionsToEdit = []
      }
    },
    getResolutionsToEdit () {
      if (this.resolutionsToEdit.length) {
        const output = this.resolutionsToEdit.map(res => ({
          id: res.id,
          text: res.text,
          expirationDate: res.expirationDate ? dateConvert(res.expirationDate) : null,
          authorId: res.author,
          complete: res.complete,
          executantsId: res.executants
        }))
        this.resolutionsToEdit = []
        return output
      }
    },
    async deleteResolution () {
      this.busy = true
      if (this.resolutionsToDelete.length) {
        for (const res of this.resolutionsToDelete) {
          const query = `
              mutation {
                deleteResolution (id: "${res.id}") {
                  text
                  type
                  id
                  messageType
                }
              }
            `
          await gQLRequestMessage(this, query)
        }
        this.resolutionsToDelete = []
      }
      this.busy = false
    },
    getResolutionsIdToDelete () {
      if (this.resolutionsToDelete.length) {
        const output = this.resolutionsToDelete.reduce((acc, item) => [...acc, item.id], [])
        this.resolutionsToDelete = []
        return output
      }
    }
  }
}
</script>
