<template>
  <v-dialog
    v-model="dialog"
    max-width="1000px"
    open-on-focus
    @keydown.enter.prevent="save"
    @keydown.esc.prevent="close"
  >
    <v-card outlined>
      <v-card-title>
        <span class="headline">{{ formTitle }}</span>
      </v-card-title>
      <v-card-text>
        <v-form
          ref="form"
          v-model="valid"
          :lazy-validation="lazyForm"
        >
          <v-container>
            <!-- -----------------------------Колонка состояния документа--------------------------- -->
            <v-row dense>
              <v-col cols="12" sm="3" md="3" class="py-0 my-n3">
                <doc-states
                  v-if="editedItem.state"
                  ref="editState"
                  :edited-item-id="editedItem.id"
                  :store-item="editedItem"
                  type="IntOut"
                  :editable="checkPermiss(8)"
                  @loaded="loadState"
                />
                <v-select
                  v-if="editedIndex === -1 || !editedItem.state"
                  v-model="newState"
                  :items="filteredStates"
                  item-text="name"
                  item-value="id"
                  label="Состояние"
                  persistent-hint
                  outlined
                  single-line
                  dense
                />
              </v-col>
              <!-- ---------------------------Колонка основных данных о документе--------------------- -->
              <v-col cols="12" sm="9" md="9" class="py-0 my-n3">
                <v-row dense class="py-0 mt-n3 mb-1">
                  <v-col cols="12" sm="9" md="9">
                    <h3 class="caption">
                      Исходящий номер:
                    </h3>
                    <div class="w-100" />
                  </v-col>
                  <v-col cols="12" sm="5" md="5">
                    <v-text-field
                      :value="formatDate(editedItem.outDate)"
                      prefix="от"
                      dense
                      readonly
                      outlined
                    />
                  </v-col>
                  <v-col cols="12" sm="5" md="5">
                    <v-text-field
                      v-model="editedItem.outNumberDigit"
                      :prefix="`№${editedItem.prefix || ''}`"
                      dense
                      readonly
                      outlined
                    />
                  </v-col>
                  <div v-if="!editedItem.outNumber">
                    <v-tooltip bottom>
                      <template v-slot:activator="{ on: onn }">
                        <v-btn
                          :disabled="!checkPermiss(16) || busy"
                          :color="theme.mainTheme.primary"
                          class="pt-0 mt-1"
                          v-on="onn"
                          @click="addOutNum"
                        >
                          <v-icon>mdi-plus</v-icon>
                        </v-btn>
                      </template>
                      <span>Добавить исходящий номер</span>
                    </v-tooltip>
                  </div>
                  <div v-if="editedItem.outNumber">
                    <v-tooltip bottom>
                      <template v-slot:activator="{ on: onn }">
                        <v-btn
                          :disabled="!checkPermiss(16) || busy"
                          :color="theme.mainTheme.primary"
                          class="pt-0 mt-1"
                          v-on="onn"
                          @click="addOutNum"
                        >
                          <v-icon>mdi-lead-pencil</v-icon>
                        </v-btn>
                      </template>
                      <span>Редактировать исходящий номер</span>
                    </v-tooltip>
                  </div>
                </v-row>
                <v-row dense class="py-0 my-n4">
                  <v-col cols="12" sm="10" md="10">
                    <v-card class="py-n5 mb-8 pb-4" flat outlined raised>
                      <v-card-title class="pt-0 pb-6">
                        <h4>Адресаты</h4>
                      </v-card-title>
                      <v-card-text class="pb-n5 mb-n2">
                        <v-row dense class="py-0 my-n3">
                          <v-autocomplete
                            v-model="addresseeDeps"
                            :items="deps"
                            :menu-props="{ maxHeight: '400' }"
                            chips
                            small-chips
                            deletable-chips
                            item-text="shortName"
                            item-value="id"
                            label="Отдел"
                            multiple
                            outlined
                            dense
                          />
                        </v-row>
                        <v-row dense class="py-0 mt-n3 mb-n7">
                          <v-select
                            v-model="editedItem.addresseesId"
                            :items="filterAddressees"
                            :menu-props="{ maxHeight: '400' }"
                            :rules="[rules.required]"
                            item-text="posName"
                            item-value="id"
                            label="Получатели"
                            multiple
                            outlined
                            dense
                          />
                        </v-row>
                      </v-card-text>
                    </v-card>
                  </v-col>
                  <note
                    ref="docNote"
                    :edited-item="editedItem"
                    type="IntOut"
                    editable
                  />
                </v-row>
                <v-row dense class="py-0 my-n4">
                  <v-col cols="12" sm="10" md="10">
                    <v-card class="py-n5 mb-8 pb-4" flat outlined raised>
                      <v-card-title class="pt-0 pb-6">
                        <h4>От кого</h4>
                      </v-card-title>
                      <v-card-text class="pb-n5 mb-n2">
                        <v-row dense class="py-0 my-n3">
                          <v-autocomplete
                            v-model="podpisantsDeps"
                            :items="deps"
                            :menu-props="{ maxHeight: '400' }"
                            chips
                            small-chips
                            deletable-chips
                            item-text="shortName"
                            item-value="id"
                            label="Отдел"
                            multiple
                            outlined
                            dense
                          />
                        </v-row>
                        <v-row dense class="py-0 mt-n3 mb-n7">
                          <v-select
                            v-model="editedItem.podpisantsId"
                            :items="filterPodpisants"
                            :menu-props="{ maxHeight: '400' }"
                            :rules="[rules.required]"
                            item-text="posName"
                            item-value="id"
                            label="Подписанты"
                            multiple
                            outlined
                            dense
                          />
                        </v-row>
                      </v-card-text>
                    </v-card>
                  </v-col>
                </v-row>
                <v-row dense class="py-0 my-n4">
                  <v-col cols="12" sm="5" md="5">
                    <v-select
                      v-model="editedItem.typeId"
                      :items="types"
                      :rules="[rules.required]"
                      item-text="name"
                      item-value="id"
                      label="Тип документа"
                      persistent-hint
                      outlined
                      single-line
                      dense
                    />
                  </v-col>
                  <v-col cols="12" sm="5" md="5">
                    <v-autocomplete
                      v-model="editedItem.temasId"
                      :items="temas"
                      :menu-props="{ maxHeight: '400' }"
                      chips
                      small-chips
                      deletable-chips
                      item-text="name"
                      item-value="id"
                      label="Темы"
                      outlined
                      multiple
                      dense
                    />
                  </v-col>
                </v-row>
                <v-row dense class="py-0 my-n4">
                  <v-col cols="12" sm="10" md="10">
                    <v-autocomplete
                      v-model="editedItem.isAnswerOnId"
                      :items="intIncs"
                      label="Является ответом на"
                      chips
                      small-chips
                      deletable-chips
                      multiple
                      outlined
                      dense
                    />
                  </v-col>
                </v-row>
                <v-row dense class="py-0 my-n3">
                  <v-col cols="12" sm="10" md="10">
                    <v-autocomplete
                      v-model="editedItem.authorId"
                      :items="filteredEmployees"
                      :rules="[rules.required]"
                      item-text="posName"
                      item-value="id"
                      label="Исполнитель"
                      clearable
                      outlined
                      dense
                    />
                  </v-col>
                </v-row>
                <v-row dense class="pt-0 mt-n2">
                  <v-col cols="12" sm="10" md="10">
                    <v-textarea
                      v-model="editedItem.subject"
                      :rules="[rules.letDigSym2]"
                      label="Краткое содержание"
                      outlined
                      rows="6"
                    />
                  </v-col>
                </v-row>
                <v-row dense class="pt-0 mt-0">
                  <v-col
                    cols="12"
                    sm="10"
                    md="10"
                    class="py-0 mb-0 mt-n3"
                  >
                    <files
                      ref="filesEdit"
                      :files-id-array="editedItem.filesId"
                      :edited-item-id="editedItem.id"
                      files-type="IntOut"
                      add-files
                    />
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </v-container>
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <!-- <v-btn :disabled="validSend" :color="theme.tables.buttonColor" text @click="send(editedItem.id)"> -->
        <v-btn :disabled="true" :color="theme.tables.buttonColor" text @click="send(editedItem.id)">
          Отправить
        </v-btn>
        <v-btn :disabled="busy" :color="theme.tables.buttonColor" text @click="close">
          Отмена
        </v-btn>
        <v-btn :disabled="busy" :color="theme.tables.buttonColor" text @click="save">
          Сохранить
        </v-btn>
      </v-card-actions>
      <!-- ---------------------------------------------------------------------------------------------------------------- -->
      <!-- -------------------------------------------Диалог добавления исходящего номера----------------------------------- -->
      <!-- ---------------------------------------------------------------------------------------------------------------- -->
      <v-dialog v-model="dialogOutNum" max-width="400px">
        <v-card>
          <v-card-title>
            <span class="headline">Исходящий номер</span>
          </v-card-title>
          <v-container>
            <v-form ref="formOutNum" v-model="validOutNum" :lazy-validation="lazyForm">
              <v-row>
                <v-col>
                  <v-menu
                    ref="dateMenu1"
                    v-model="dateMenuOutNum"
                    :close-on-content-click="false"
                    transition="scale-transition"
                    offset-y
                    min-width="290px"
                  >
                    <template v-slot:activator="{ on }">
                      <v-text-field
                        :value="formatDate(newOutNum.outNumDate)"
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
                      v-model="newOutNum.outNumDate"
                      locale="ru"
                      :color="theme.mainTheme.primary"
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
                    v-model="newOutNum.prefix"
                    :prefix="`№`"
                    outlined
                    dense
                  />
                </v-col>
                <v-col cols="8">
                  <v-text-field
                    v-model="newOutNum.outNum"
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
            <v-btn :disabled="busy" :color="theme.tables.buttonColor" text @click="closeOutNum">
              Отмена
            </v-btn>
            <v-btn :disabled="busy" :color="theme.tables.buttonColor" text @click="saveOutNum">
              Сохранить
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-card>
  </v-dialog>
</template>

<script>
import moment from 'moment'
import { mapGetters, mapActions } from 'vuex'
import files from '@/components/file-element'
import docStates from '@/components/doc-states'
import { checkUserPermission } from '@/utils/permission'
import { gQLRequestMessage } from '@/utils/gql-request'
import Messenger from '@/utils/messenger'
import { dateConvert, getFormatedDate } from '@/utils/date.js'
import note from '@/components/note'
import Rules from '@/utils/rules'
import { IntOutgoing } from '@/Storage/ent-methods/int-outgoings'

moment.locale('ru')

export default {
  components: {
    files,
    docStates,
    note
  },
  props: {
    lazyForm: {
      type: Boolean,
      required: false,
      default: true
    },
    initialize: {
      type: Function,
      required: false,
      default: () => {}
    }
  },
  data () {
    return {
      valid: false,
      dialog: false,
      messenger: Messenger.getInstance(),
      rules: Rules,
      editedIndex: -1,
      storage: this.$docs.buffer,
      newState: null,
      dateMenu: false,
      // -------------------Диалог исходящего номера--------------------------
      dialogOutNum: false,
      validOutNum: true,
      dateMenuOutNum: false,
      newOutNum: {
        outNumDate: new Date().toISOString().substr(0, 10),
        outNum: null,
        prefix: this.depPrefix
      },
      // ---------------------------------------------------------------------
      addresseeDeps: [],
      podpisantsDeps: [],
      defaultItem: new IntOutgoing(),
      editedItem: new IntOutgoing()
    }
  },

  computed: {
    ...mapGetters({
      user: 'auth/getUser',
      usersDep: 'auth/getUserDep',
      selectedDep: 'auth/getSelectDep',
      userPermission: 'auth/getUserPermission',
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
    formTitle () {
      return this.editedIndex === -1 ? 'Новая запись' : 'Редактировать'
    },
    states () {
      return this.getter('states', 'items')
    },
    intOutgoings () {
      return this.getter('intOutgoings', 'items')
    },
    deps () {
      return this.getter('departments', 'items')
    },
    dep () {
      return this.getter('departments', 'indexed')
    },
    types () {
      return this.getter('types', 'items')
    },
    temas () {
      return this.getter('temas', 'items')
    },
    intIncomings () {
      return this.getter('intIncomings', 'items')
    },
    podpisant () {
      return this.getter('currentPositions', 'indexed')
    },
    currentPositions () {
      return this.getter('currentPositions', 'items')
    },
    podpisants () {
      if (!this.storage) { return [] }
      let currentPositions = []
      if (this.storage.currentPositions.items.length &&
        this.storage.positions.items.length) {
        currentPositions = this.currentPositions.filter(item => this.storage.positions.indexed[item.PositionId].canSignIntDocs)
      }
      return currentPositions
    },
    depPrefix () {
      if (this.dep && this.selectedDep) {
        return this.dep[this.selectedDep]
          ? this.dep[this.selectedDep].depPrefix
          : ''
      }
      return ''
    },
    intIncs () {
      if (this.intIncomings.length) {
        return this.intIncomings.map(item => ({
          text: `№${item.extNumber} от ${item.extDate}`,
          value: item.id
        }))
      }
      return []
    },
    outNumbers () {
      return this.intOutgoings.map((el) => {
        if (el.departmentId === this.selectedDep) {
          return {
            outNumber: el.outNumber,
            outNumberDigit: el.outNumberDigit,
            outDate: el.outDate,
            prefix: el.prefix
          }
        }
      })
    },
    filteredStates () {
      return this.states.filter(item => item.type === 'intOut') || []
    },
    filterAddressees () {
      if (this.addresseeDeps.length && this.podpisants.length) {
        return this.podpisants.filter(podp => this.addresseeDeps.includes(podp.DepartmentId))
      }
      return []
    },
    filterPodpisants () {
      if (this.podpisantsDeps.length && this.podpisants.length) {
        return this.podpisants.filter(podp => this.podpisantsDeps.includes(podp.DepartmentId))
      }
      return []
    },
    filteredEmployees () {
      const empls = []
      if (this.user && this.deps && this.selectedDep) {
        const childDeps = this.dep[this.selectedDep].childDepsId
        return this.currentPositions.filter(pos => pos.DepartmentId === this.selectedDep || childDeps.includes(pos.DepartmentId))
      }
      return empls
    },

    validSend () {
      if (this.newOutNum.outNum || this.editedItem.outNumber) {
        return !(this.valid || this.checkPermiss(16))
      } else {
        return true
      }
    },
    outDate: {
      get () {
        const val = this.editedItem ? this.editedItem.outDate || new Date().toISOString().substr(0, 10) : new Date().toISOString().substr(0, 10)
        return dateConvert(val)
      },
      set (val) {
        this.editedItem.outDate = dateConvert(val)
      }
    }

  },

  mounted () {
    this.$emit('ready')
  },

  methods: {
    ...mapActions({
      setBusy: 'navInterface/setBusy',
      unsetBusy: 'navInterface/unsetBusy'
    }),
    getter (ent, type) {
      if (!this.storage) { return [] }
      if (this.storage[ent].synchronization) { return [] }
      return this.storage[ent][type]
    },
    checkPermiss (val) {
      return checkUserPermission(this.userPermission, val)
    },
    formatDate (val) {
      return getFormatedDate(val)
    },
    loadState () {
      this.$refs.editState.prepareItemData(this.editedItem.id)
    },

    async send (id) {
      const query = `
          mutation {
            sendIntOutgoing(id: "${id}") {
              text
              messageType
            }
          }
        `
      await gQLRequestMessage(this, query)
      await this.close()
    },

    // ------------------------------------------------------------------------------------------------------
    // -------------------Входящий номер---------------------------------------------------------------------
    addOutNum (item) {
      if (this.editedItem.outNumber) {
        this.newOutNum = {
          outNumDate: dateConvert(this.editedItem.outDate),
          outNum: this.editedItem.outNumberDigit,
          prefix: this.editedItem.prefix
        }
      } else {
        const thisYearOutNums = []
        for (const num of this.outNumbers) {
          if (
            moment(dateConvert(num.outDate)).get('year') === moment().get('year') &&
            num.prefix === this.depPrefix
          ) {
            thisYearOutNums.push(num)
          }
        }
        let nextNum = 0
        for (const num of thisYearOutNums) {
          if (num.outNumberDigit > nextNum) {
            nextNum = num.outNumberDigit
          }
        }
        this.newOutNum.outNum = +nextNum + 1
        this.newOutNum.prefix = this.depPrefix
      }
      this.dialogOutNum = true
    },

    closeOutNum () {
      this.newOutNum = {
        outNumDate: new Date().toISOString().substr(0, 10),
        outNum: null
      }
      this.dialogOutNum = false
      this.$refs.formOutNum.resetValidation()
    },

    saveOutNum () {
      if (!this.$refs.formOutNum.validate()) {
        return
      }
      this.dialogOutNum = false
      this.editedItem.outNumber = this.newOutNum.outNum
      this.editedItem.outNumberDigit = this.newOutNum.outNum
      this.editedItem.outDate = this.newOutNum.outNumDate
      this.editedItem.prefix = this.newOutNum.prefix
      this.$refs.formOutNum.resetValidation()
    },
    // ------------------------------------------------------------------------------------------------------

    open (item) {
      if (!item) { return }
      this.editedIndex = item.id || -1
      this.editedItem = item
      if (this.editedItem.extDate) {
        this.extDate = dateConvert(this.extDate)
      }
      if (this.$refs.editState) {
        this.$refs.editState.prepareItemData(this.editedItem.id)
      }
      // Заполнение поля отделы для подписантов
      if (this.editedItem.podpisantsId.length) {
        this.editedItem.podpisantsId.forEach((podp) => {
          const depId = this.podpisant[podp].DepartmentId
          if (depId) {
            this.podpisantsDeps.push(depId)
          }
        })
        this.podpisantsDeps = this.podpisantsDeps.filter((item, index, self) =>
          index === self.findIndex(t => (t === item))
        )
      }
      // Заполнение поля отделы для адресатов
      if (this.editedItem.addresseesId.length) {
        this.editedItem.addresseesId.forEach((addr) => {
          const depId = this.podpisant[addr].DepartmentId
          if (depId) {
            this.addresseeDeps.push(depId)
          }
        })
        this.addresseeDeps = this.addresseeDeps.filter((item, index, self) =>
          index === self.findIndex(t => (t === item))
        )
      }
      this.dialog = true
    },

    async close () {
      this.busy = true
      if (this.$refs.filesEdit) {
        await this.$refs.filesEdit.reset()
      }
      if (this.$refs.editRes) {
        this.$refs.editRes.reset()
      }
      this.outDate = new Date().toISOString().substr(0, 10)
      this.editedItem = this.defaultItem
      this.editedIndex = -1
      if (this.$refs.form) {
        this.$refs.form.resetValidation()
      }
      this.dialog = false
      this.busy = false
      await this.initialize()
    },
    // ----------------------------------------------------------------------------------
    async save (item) {
      if (!this.$refs.form.validate()) {
        return
      }
      this.busy = true
      const request = {
        id: null,
        publicateData: {
          IntOutgoing: {
            outNumber: this.editedItem.outNumberDigit,
            outDate: dateConvert(this.outDate),
            prefix: this.editedItem.prefix,
            subject: this.editedItem.subject,
            authorId: this.editedItem.authorId,
            TypeId: this.editedItem.typeId,
            StateId: null,
            temaId: this.editedItem.temasId,
            addresseeId: this.editedItem.addresseesId,
            podpisantId: this.editedItem.podpisantsId,
            answerId: this.editedItem.isAnswerOnId,
            note: this.$refs.docNote ? this.$refs.docNote.getNewNote() : '',
            filesId: this.$refs.filesEdit ? this.$refs.filesEdit.getUploadedFiles() : null,
            stateChanged: this.$refs.editState ? this.$refs.editState.getChangedState() : null
          }
        }
      }
      const variables = {}
      variables.subj = request.publicateData.IntOutgoing.subject || undefined
      variables.noteText = request.publicateData.IntOutgoing.note || undefined
      if (this.editedIndex === -1) {
        request.publicateData.IntOutgoing.StateId = this.newState
      } else {
        request.id = this.editedItem.id
        if (this.$refs.editState) {
          const currentState = this.$refs.editState.getCurrentState()
          if (currentState) {
            request.publicateData.IntOutgoing.StateId = currentState.id
          }
        } else if (this.newState) {
          request.publicateData.IntOutgoing.StateId = this.newState
        } else {
          request.publicateData.IntOutgoing.StateId = this.editedItem.stateId
        }
      }
      const query = `
        mutation (${variables.noteText ? '$noteText: String, ' : ''}$subj: String) {
          publicateIntOutgoing(${request.id ? 'id: "' + request.id + '",' : ''} publicateData: {
            IntOutgoing: {
              subject: $subj
              outNumber: ${request.publicateData.IntOutgoing.outNumber || '0'}
              prefix: "${request.publicateData.IntOutgoing.prefix}"
              outDate: "${request.publicateData.IntOutgoing.outDate}"
              authorId: "${request.publicateData.IntOutgoing.authorId}"
              TypeId: "${request.publicateData.IntOutgoing.TypeId}"
              ${request.publicateData.IntOutgoing.StateId ? 'StateId: "' + request.publicateData.IntOutgoing.StateId + '"' : ''}
              ${request.publicateData.IntOutgoing.temaId ? 'temaId: [' + request.publicateData.IntOutgoing.temaId + ']' : ''}
              addresseeId: [${request.publicateData.IntOutgoing.addresseeId}]
              podpisantId: [${request.publicateData.IntOutgoing.podpisantId}]
              ${request.publicateData.IntOutgoing.answerId ? 'answerId: [' + request.publicateData.IntOutgoing.answerId + ']' : ''}
              ${variables.noteText ? 'note: $noteText' : ''}
              ${request.publicateData.IntOutgoing.filesId ? 'filesId: [' + request.publicateData.IntOutgoing.filesId + ']' : ''}
              ${request.publicateData.IntOutgoing.stateChanged ? 'stateChanged: ' + request.publicateData.IntOutgoing.stateChanged : ''}
            }
          }) {
            type
            text
            messageType
            id
            item
          }
        }
      `
      gQLRequestMessage(this, query, variables)
      if (this.$refs.filesEdit) {
        this.$refs.filesEdit.deleteFiles()
      }
      this.busy = false
      await this.close()
    }
  }
}
</script>
