<template>
  <div>
    <v-row dense class="py-0 my-n5">
      <v-col cols="12" sm="9" md="9">
        <h3 class="caption">
          Входящий номер отдела:
        </h3>
      </v-col>
      <v-col cols="12" sm="5" md="5">
        <v-text-field
          :value="formatDate(showingIncDate)"
          prefix="от"
          dense
          readonly
          outlined
        />
      </v-col>
      <v-col cols="12" sm="5" md="5">
        <v-text-field
          :value="showingIncNumber"
          prefix="№"
          dense
          readonly
          outlined
        />
      </v-col>
      <div>
        <v-tooltip bottom>
          <template v-slot:activator="{ on: onn }">
            <v-btn
              :disabled="!checkPermiss(16)"
              color="primary"
              class="pt-0 mt-1"
              v-on="onn"
              @click="addIncNum"
            >
              <v-icon>{{ icon }}</v-icon>
            </v-btn>
          </template>
          <span>Добавить входящий номер</span>
        </v-tooltip>
      </div>
    </v-row>
    <v-dialog v-model="dialogIncNum" max-width="400px">
      <v-card>
        <v-card-title>
          <span class="headline">Входящий номер</span>
        </v-card-title>
        <v-container>
          <v-form ref="formIncNum" v-model="validIncNum" :lazy-validation="lazy">
            <v-row>
              <v-col>
                <v-menu
                  ref="dateMenu1"
                  v-model="dateMenuIncNum"
                  :close-on-content-click="false"
                  transition="scale-transition"
                  offset-y
                  min-width="290px"
                >
                  <template v-slot:activator="{ on }">
                    <v-text-field
                      :value="formatDate(newIncNum.incDate)"
                      :rules="[rules.required]"
                      prefix="от"
                      prepend-icon="mdi-calendar-month"
                      readonly
                      outlined
                      dense
                      v-on="on"
                    />
                  </template>
                  <v-date-picker
                    v-model="newIncNum.incDate"
                    locale="ru"
                    color="primary"
                    dark
                    no-title
                    scrollable
                    first-day-of-week="1"
                    @input="dateMenuIncNum = false"
                  />
                </v-menu>
              </v-col>
            </v-row>
            <v-row dense>
              <v-col cols="4">
                <v-text-field
                  v-model="newIncNum.prefix"
                  :prefix="`№`"
                  outlined
                  dense
                />
              </v-col>
              <v-col cols="8">
                <v-text-field
                  v-model="newIncNum.incNumber"
                  :rules="[rules.digit]"
                  outlined
                  dense
                />
              </v-col>
            </v-row>
          </v-form>
        </v-container>
        <v-card-actions>
          <v-spacer />
          <v-btn :disabled="busy" color="blue darken-1" text @click="deleteIncNum">
            Удалить
          </v-btn>
          <v-btn :disabled="busy" color="blue darken-1" text @click="closeIncNum">
            Отмена
          </v-btn>
          <v-btn :disabled="busy" color="blue darken-1" text @click="saveIncNum">
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
import moment from 'moment'
import { v1 as uuidv1 } from 'uuid'
import Rules from '@/utils/rules'
import Docs from '@/Storage/docs'
import { IncNumber } from '@/Storage/ent-methods/inc-numbers'
import { IntIncNumber } from '@/Storage/ent-methods/int-inc-numbers'
import { InternalIncNumber } from '@/Storage/ent-methods/internal-inc-numbers'
import { dateConvert, getFormatedDate } from '@/utils/date'
import { gQLRequestMessage } from '@/utils/gql-request'
import { checkUserPermission } from '@/utils/permission'
import _ from 'lodash'

moment.locale('ru')

export default {
  props: {
    type: {
      type: String,
      default: 'ExtInc',
      validator: (value) => {
        // Значение должно соответствовать одной из этих строк
        return ['ExtInc', 'IntInc', 'Internal'].includes(value)
      }
    },
    editedItem: {
      type: [Object],
      required: true,
      default: null
    }
  },
  data () {
    return {
      storage: null,
      rules: Rules,
      lazy: false,
      busy: false,
      validIncNum: true,
      dateMenuIncNum: false,
      dialogIncNum: false,
      defaultItem: this.type === 'ExtInc'
        ? new IncNumber({
          id: null,
          incNumber: undefined,
          incDate: new Date().toISOString().substr(0, 10),
          prefix: this.depPrefix,
          DepartmentId: this.selectedDep,
          [this.incNumberId]: this.editedItem.id
        })
        : this.type === 'IntInc'
          ? new IntIncNumber({
            id: null,
            incNumber: undefined,
            incDate: new Date().toISOString().substr(0, 10),
            prefix: this.depPrefix,
            DepartmentId: this.selectedDep,
            [this.incNumberId]: this.editedItem.id
          })
          : new InternalIncNumber({
            id: null,
            incNumber: undefined,
            incDate: new Date().toISOString().substr(0, 10),
            prefix: this.depPrefix,
            DepartmentId: this.selectedDep,
            [this.incNumberId]: this.editedItem.id
          }),
      newIncNum: this.type === 'ExtInc'
        ? new IncNumber({
          id: null,
          incNumber: undefined,
          incDate: new Date().toISOString().substr(0, 10),
          prefix: this.depPrefix,
          DepartmentId: this.selectedDep,
          [this.incNumberId]: this.editedItem.id
        })
        : this.type === 'IntInc'
          ? new IntIncNumber({
            id: null,
            incNumber: undefined,
            incDate: new Date().toISOString().substr(0, 10),
            prefix: this.depPrefix,
            DepartmentId: this.selectedDep,
            [this.incNumberId]: this.editedItem.id
          })
          : new InternalIncNumber({
            id: null,
            incNumber: undefined,
            incDate: new Date().toISOString().substr(0, 10),
            prefix: this.depPrefix,
            DepartmentId: this.selectedDep,
            [this.incNumberId]: this.editedItem.id
          }),
      incNumChanged: false,
      originIncNumber: null,
      editedIncNumber: null,
      // tempEditedItem: {},
      incNumToDelete: null
    }
  },
  computed: {
    icon () {
      return this.editedItem.incNumber
        ? 'mdi-lead-pencil'
        : 'mdi-plus'
    },
    incNumberId () {
      return `${this.type === 'ExtInc' ? 'ExtIncomingId'
          : this.type === 'IntInc' ? 'IntIncomingId'
          : 'InternalId'}`
    },
    incNumberArrayName () {
      return `${this.type === 'ExtInc' ? 'incNumbers'
          : this.type === 'IntInc' ? 'intIncNumbers'
          : 'internalIncNumbers'}`
    },
    showingIncNumber () {
      return this.incNumChanged
        ? `${this.editedIncNumber.prefix || ''}${this.editedIncNumber.incNumber}`
        : this.editedItem.incNumber
    },
    showingIncDate () {
      return this.incNumChanged
        ? this.editedIncNumber.incDate
        : this.editedItem.incDate
    },
    allIncNumbers () {
      return this.storage ? this.storage.incNumbers.items : []
    },
    allIntIncNumbers () {
      return this.storage ? this.storage.intIncNumbers.items : []
    },
    allInternalIncNumbers () {
      return this.storage ? this.storage.internalIncNumbers.items : []
    },
    currentPositions () {
      return this.storage ? this.storage.currentPositions.items : []
    },
    deps () {
      return this.storage ? this.storage.departments.items : []
    },
    employees () {
      return this.storage ? this.storage.employees.items : []
    },
    employee () {
      return this.storage ? this.storage.employees.indexed : []
    },
    extIncoming () {
      return this.storage ? this.storage.extIncomings.indexed : []
    },
    intIncoming () {
      return this.storage ? this.storage.intIncomings.indexed : []
    },
    internal () {
      return this.storage ? this.storage.internals.indexed : []
    },
    incNumbers () {
      if (!this.storage) { return [] }
      if (this.storage.incNumbers.items.length) {
        const arr = []
        if (this.user) {
          for (const item of this.storage.incNumbers.items) {
            if (item.DepartmentId === this.user.selectedDep) {
              arr.push(item)
            }
          }
          return arr
        }
        return []
      } else {
        return []
      }
    },
    intIncNumbers () {
      if (!this.storage) { return [] }
      if (this.storage.intIncNumbers.items.length) {
        const arr = []
        if (this.user) {
          for (const item of this.storage.intIncNumbers.items) {
            if (item.DepartmentId === this.user.selectedDep) {
              arr.push(item)
            }
          }
          return arr
        }
        return []
      } else {
        return []
      }
    },
    internalIncNumbers () {
      if (!this.storage) { return [] }
      if (this.storage.internalIncNumbers.items.length) {
        const arr = []
        if (this.user) {
          for (const item of this.storage.internalIncNumbers.items) {
            if (item.DepartmentId === this.user.selectedDep) {
              arr.push(item)
            }
          }
          return arr
        }
        return []
      } else {
        return []
      }
    },
    currentPosition () {
      return this.storage ? this.storage.currentPositions.indexed : []
    },
    dep () {
      return this.storage ? this.storage.departments.indexed : []
    },
    ...mapGetters({
      user: 'auth/getUser',
      usersDep: 'auth/getUserDep',
      selectedDep: 'auth/getSelectDep',
      userPermission: 'auth/getUserPermission'
    }),
    depPrefix () {
      if (this.dep && this.selectedDep) {
        return this.dep[this.selectedDep]
          ? this.dep[this.selectedDep].depPrefix
          : ''
      }
      return ''
    }
  },
  async created () {
    const docs = await Docs.getInstance()
    this.storage = await docs.buffer
    await this.initialize()
  },

  methods: {
    checkPermiss (val) {
      return checkUserPermission(this.userPermission, val)
    },
    formatDate (val) {
      return getFormatedDate(val)
    },
    ...mapActions({
      fetchForce: 'fetchForce',
      fetch: 'fetch',
      setSelectDep: 'auth/selectDep'
    }),

    async initialize () {
      try {
        this.busy = true
        if (!this.storage.incNumbers.items.length ||
          !this.storage.intIncNumbers.items.length ||
          !this.storage.internalIncNumbers.items.length) {
          await Promise.all([
            this.storage.incNumbers.updateAll(),
            this.storage.intIncNumbers.updateAll(),
            this.storage.internalIncNumbers.updateAll()
          ])
        }
        this.busy = false
      } catch (err) {
        throw err
      }
    },

    reset () {
      this.newIncNum = this.defaultItem
      this.incNumChanged = false
      this.incNumToDelete = null
    },
    addIncNum () {
      // this.tempEditedItem = this.editedItem.clone()
      const allIncNums = [...this.incNumbers, ...this.intIncNumbers, ...this.internalIncNumbers]
      let incNumArray = []
      const numId = this.editedItem.incNumberId
      incNumArray = this[this.incNumberArrayName]
      if (!this.newIncNum.incDate) {
        this.newIncNum.incDate = new Date().toISOString().substr(0, 10)
      }
      // Если происходит редактирование:
      if (numId) {
        const currentIncNum = incNumArray.find(
          el => el.id === numId
        ) || {}
        this.originIncNumber = currentIncNum
        this.editedIncNumber = currentIncNum
        if (!this.newIncNum.id) {
          this.newIncNum.incDate = dateConvert(this.editedItem.incDate)
          this.newIncNum.prefix = currentIncNum.prefix ? currentIncNum.prefix : this.depPrefix
          this.newIncNum.incNumber = currentIncNum.incNumber
        } else {
          this.newIncNum.incDate = dateConvert(this.editedIncNumber.incDate)
          this.newIncNum.prefix = this.editedIncNumber.prefix
          this.newIncNum.incNumber = this.editedIncNumber.incNumber
        }

      // Если создаётся новый входящий номер, то определяется следующий незанятый номер в этом году:
      } else {
        const thisYearIncNums = []
        for (const num of allIncNums) {
          if (
            moment(dateConvert(num.incDate)).get('year') ===
            moment().get('year')
          ) {
            thisYearIncNums.push(num)
          }
        }
        let nextNum = 0
        for (const num of thisYearIncNums) {
          if (num.incNumber > nextNum) {
            nextNum = num.incNumber
          }
        }
        this.newIncNum.incNumber = +nextNum + 1
        this.newIncNum.prefix = this.depPrefix
        this.newIncNum.DepartmentId = this.selectedDep
        this.newIncNum[this.incNumberId] = this.editedItem.id
      }
      this.dialogIncNum = true
    },

    closeIncNum () {
      this.newIncNum = this.defaultItem
      if (this.originIncNumber && !this.incNumToDelete) {
        this.editedItem.incNumberId = this.originIncNumber.id
      }
      this.dialogIncNum = false
      this.$refs.formIncNum.resetValidation()
    },

    async saveIncNum () {
      if (!this.$refs.formIncNum.validate()) { return }
      this.dialogIncNum = false
      this.newIncNum.id = this.newIncNum.id || uuidv1()
      await this.storage[this.incNumberArrayName].addItem(this.newIncNum)
      this.editedItem.incNumberId = this.newIncNum.id
      this.incNumChanged = true
      this.editedIncNumber = this.newIncNum
      this.$refs.formIncNum.resetValidation()
    },

    async addNewIncNumber () {
      let numId = null
      let incNumArray = []
      let command = ''
      let obj = ''
      let incId = ''
      switch (this.type) {
        case 'ExtInc': {
          numId = this.editedItem.extIncNumberId
          incNumArray = this.incNumbers
          command = 'IncomingNumber'
          obj = 'incomingNumber'
          incId = 'ExtIncomingId'
          // entitity = 'IncNumbers'
          break
        }
        case 'IntInc': {
          numId = this.editedItem.incNumberId
          incNumArray = this.intIncNumbers
          command = 'IntIncomingNumber'
          obj = 'intIncomingNumber'
          incId = 'IntIncomingId'
          // entitity = 'IntIncNumbers'
          break
        }
        case 'Internal': {
          numId = this.editedItem.incNumberId
          incNumArray = this.internalIncNumbers
          command = 'InternalIncomingNumber'
          obj = 'internalIncomingNumber'
          incId = 'InternalId'
          // entitity = 'InternalIncNumbers'
          break
        }
      }
      const originIncNumber = numId
        ? incNumArray.find(el => el.id === numId)
        : null
      const editedIncNum = this.editedItem.incNumberDigit
      this.busy = true
      if (!originIncNumber) {
        const query = `
          mutation {
            add${command} (${obj}: {
              incNumber: ${this.newIncNum.incNumber}
              incDate: "${dateConvert(this.newIncNum.incDate)}"
              prefix: "${this.newIncNum.prefix}"
              DepartmentId: "${this.selectedDep}"
              ${incId}: "${this.editedItem.id}"
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
        // await this.fetchForce(entitity)
      } else if (
        originIncNumber.incNumber !== editedIncNum ||
        originIncNumber.incDate !== dateConvert(this.editedItem.incDate)
      ) {
        // если требуется изменения во входящем номере
        const query = `
          mutation {
            edit${command} (id: "${originIncNumber.id}" ${obj}: {
              incNumber: ${editedIncNum}
              incDate: "${dateConvert(this.editedItem.incDate)}"
              prefix: "${this.newIncNum.prefix}"
              DepartmentId: "${this.selectedDep}"
              ${incId}: "${this.editedItem.id}"
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
    },

    isNumberNew (incNum) {
      if (!incNum) { return false }
      const symbols = _.replace(incNum.id, /[\d]+/g, '')
      return symbols.length > 0
    },

    getNewIncNumberData () {
      let numId = null
      let incNumArray = []
      const output = {
        incNumber: null,
        incDate: null,
        prefix: ''
      }
      numId = this.editedItem.incNumberId
      incNumArray = this[this.incNumberArrayName]
      const originIncNumber = numId
        ? incNumArray.find(el => el.id === numId)
        : null
      if (this.isNumberNew(originIncNumber)) {
        originIncNumber.new = true
      }
      const editedIncNum = this.editedItem.incNumberDigit
      this.busy = true
      if (!originIncNumber) {
        output.incNumber = this.newIncNum.incNumber
        output.incDate = dateConvert(this.newIncNum.incDate)
        output.prefix = this.newIncNum.prefix
      } else if (
        originIncNumber.incNumber !== editedIncNum ||
        dateConvert(originIncNumber.incDate) !== dateConvert(this.editedItem.incDate) ||
        originIncNumber.new
      ) {
        // если требуется изменения во входящем номере
        output.incNumber = editedIncNum
        output.incDate = dateConvert(this.editedItem.incDate)
        output.prefix = this.newIncNum.prefix
      } else {
        // если ничего неменялось
        output.incNumber = null
        output.incDate = null
        output.prefix = null
      }
      this.busy = false
      return output
    },

    deleteIncNum () {
      this.incNumChanged = true
      this.editedIncNumber = this.newIncNum
      this.editedIncNumber.incDate = ''
      this.editedIncNumber.incNumber = ''
      this.editedIncNumber.prefix = ''
      this.incNumToDelete = this.editedItem.incNumberId
      this.editedItem.incNumberId = ''
      this.closeIncNum()
    },

    async deleteNumber () {
      if (!this.incNumToDelete) { return }
      let command
      switch (this.type) {
        case 'ExtInc': {
          command = 'deleteIncomingNumber'
          break
        }
        case 'IntInc': {
          command = 'deleteIntIncomingNumber'
          break
        }
        case 'Internal': {
          command = 'deleteInternalIncomingNumber'
          break
        }
      }
      const query = `
          mutation {
            ${command} (id: "${this.incNumToDelete}") {
              text
              type
              id
              messageType
              item
            }
          }
          `
      await gQLRequestMessage(this, query)
      this.incNumToDelete = null
    },

    async deleteTempIncNum () {
      if (this.incNumChanged) {
        if (this.editedIncNumber.id) {
          await this.storage[this.incNumberArrayName].deleteItem(this.editedIncNumber.id)
        }
        this.editedIncNumber = null
        this.incNumChanged = false
      }
    }
  }
}
</script>
