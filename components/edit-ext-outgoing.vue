<template>
  <v-dialog
    v-model="dialog"
    max-width="1000px"
    open-on-focus
    @keydown.enter.prevent="save"
    @keydown.esc.prevent="close"
  >
    <v-card>
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
                  type="ExtOut"
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
                  <v-col cols="6" sm="5" md="5">
                    <v-menu
                      ref="dateMenu1"
                      v-model="dateMenu"
                      :close-on-content-click="false"
                      transition="scale-transition"
                      offset-y
                      min-width="290px"
                    >
                      <template v-slot:activator="{ on }">
                        <v-text-field
                          :value="formatDate(outDate)"
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
                        v-model="outDate"
                        locale="ru"
                        color="primary"
                        dark
                        no-title
                        scrollable
                        first-day-of-week="1"
                        @input="dateMenu = false"
                      />
                    </v-menu>
                  </v-col>
                  <v-col cols="2" sm="2" md="2">
                    <v-text-field
                      v-model="editedItem.prefix"
                      :rules="[rules.required, rules.letDigSym]"
                      prefix="№"
                      outlined
                      dense
                    />
                  </v-col>
                  <v-col cols="3" sm="3" md="3">
                    <v-text-field
                      v-model="editedItem.outNumber"
                      :rules="[rules.required, rules.letDigSym]"
                      outlined
                      dense
                    />
                  </v-col>
                  <note
                    ref="docNote"
                    :edited-item="editedItem"
                    type="ExtOut"
                    editable
                  />
                </v-row>
                <v-row dense class="py-0 my-n2">
                  <v-col cols="12" sm="10" md="10">
                    <v-autocomplete
                      v-model="organisationsId"
                      :items="organisations"
                      :menu-props="{ maxHeight: '400' }"
                      :rules="[rules.required]"
                      chips
                      small-chips
                      deletable-chips
                      item-text="orgName"
                      item-value="id"
                      label="Организации"
                      multiple
                      outlined
                      dense
                    />
                  </v-col>
                </v-row>
                <v-row dense class="py-0 my-n2">
                  <v-col cols="12" sm="10" md="10">
                    <v-select
                      v-model="editedItem.addresseesId"
                      :items="filterExtEmployees"
                      :menu-props="{ maxHeight: '400' }"
                      :rules="[rules.required]"
                      item-text="extEmployee"
                      item-value="id"
                      label="Получатели"
                      multiple
                      outlined
                      dense
                    />
                  </v-col>
                </v-row>
                <v-row dense class="py-0 my-n2">
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
                <v-row dense class="py-0 my-n2">
                  <v-col cols="12" sm="10" md="10">
                    <v-autocomplete
                      v-model="editedItem.podpisantsId"
                      :items="podpisants"
                      :rules="[rules.required]"
                      chips
                      small-chips
                      deletable-chips
                      item-text="posName"
                      item-value="id"
                      label="Кто подписал"
                      multiple
                      outlined
                      dense
                    />
                  </v-col>
                </v-row>
                <v-row dense class="py-0 my-n2">
                  <v-col cols="12" sm="10" md="10">
                    <v-autocomplete
                      v-model="editedItem.isAnswerOnId"
                      :items="extIncs"
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
                <v-row dense class="py-0 my-n2">
                  <v-col cols="12" sm="10" md="10">
                    <v-autocomplete
                      v-model="editedItem.authorId"
                      :items="filteredEmployees"
                      :rules="[rules.required]"
                      item-text="employee"
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
                <v-row dense class="pt-0 mt-1">
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
                      files-type="ExtOut"
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
        <v-btn :disabled="busy" :color="theme.tables.buttonColor" text @click="close">
          Отмена
        </v-btn>
        <v-btn :disabled="busy" :color="theme.tables.buttonColor" text @click="save">
          Сохранить
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import files from '@/components/file-element'
import docStates from '@/components/doc-states'
import { checkUserPermission } from '@/utils/permission'
import { gQLRequestMessage } from '@/utils/gql-request'
import Messenger from '@/utils/messenger'
import { dateConvert, getFormatedDate } from '@/utils/date.js'
import note from '@/components/note'
import Rules from '@/utils/rules'
import { ExtOutgoing } from '@/Storage/ent-methods/ext-outgoings'

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
      outDate: new Date().toISOString().substr(0, 10),
      organisationsId: [],
      defaultItem: new ExtOutgoing(),
      editedItem: new ExtOutgoing()
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

    states () {
      return this.getter('states', 'items')
    },
    organisations () {
      return this.getter('organisations', 'items')
    },
    extEmployees () {
      return this.getter('extCurrentPositions', 'items')
    },
    podpisants () {
      if (!this.storage) { return [] }
      let currentPositions = []
      if (this.storage.currentPositions.items.length &&
        this.storage.positions.items.length) {
        // for (const item of this.storage.currentPositions.items) {
        //   const pos = this.storage.positions.items.find(el => el.id === item.PositionId) || {}
        //   if (pos.canSignExtDocs) {
        //     currentPositions.push(item)
        //   }
        // }
        currentPositions = this.storage.currentPositions.items.filter(item => this.storage.positions.indexed[item.PositionId].canSignExtDocs)
      }
      return currentPositions
    },
    temas () {
      return this.getter('temas', 'items')
    },
    deps () {
      return this.getter('departments', 'items')
    },
    types () {
      return this.getter('types', 'items')
    },
    currentPosition () {
      return this.getter('currentPositions', 'indexed')
    },
    department () {
      return this.getter('departments', 'indexed')
    },
    currentPositions () {
      return this.getter('currentPositions', 'items')
    },
    extIncomings () {
      return this.getter('extIncomings', 'items')
    },
    extIncs () {
      let extIncs = []
      if (this.extIncomings.length) {
        extIncs = this.extIncomings.map(item => ({
          text: `№${item.extNumber} от ${item.extDate}`,
          value: item.id
        }))
      }
      return extIncs
    },
    formTitle () {
      return this.editedIndex === -1 ? 'Новая запись' : 'Редактировать'
    },
    filteredStates () {
      return this.states.filter(item => item.type === 'extOut') || []
    },
    filterExtEmployees () {
      if (this.organisationsId.length) {
        return this.extEmployees.filter(empl => this.organisationsId.includes(empl.OrganisationId))
      } else {
        return this.extEmployees
      }
    },
    filteredEmployees () {
      let empls = []
      if (this.user && this.deps && this.selectedDep) {
        const childDeps = this.department[this.selectedDep].childDepsId
        empls = this.currentPositions.filter(pos => pos.DepartmentId === this.selectedDep || childDeps.includes(pos.DepartmentId))
      }
      return empls
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
      this.organisationsId = this.editedItem.organisationsId
      this.dialog = true
    },

    async close () {
      this.busy = true
      this.organisationsId = []
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
          ExtOutgoing: {
            subject: this.editedItem.subject,
            outNumber: this.editedItem.outNumber,
            prefix: this.editedItem.prefix,
            outDate: dateConvert(this.outDate),
            authorId: this.editedItem.authorId,
            TypeId: this.editedItem.typeId,
            StateId: null,
            temaId: this.editedItem.temasId,
            addresseesId: this.editedItem.addresseesId,
            podpisantId: this.editedItem.podpisantsId,
            answerId: this.editedItem.isAnswerOnId,
            note: this.$refs.docNote ? this.$refs.docNote.getNewNote() : '',
            filesId: this.$refs.filesEdit ? this.$refs.filesEdit.getUploadedFiles() : null,
            stateChanged: this.$refs.editState ? this.$refs.editState.getChangedState() : null
          }
        }
      }
      const variables = {}
      variables.subj = request.publicateData.ExtOutgoing.subject || undefined
      variables.noteText = request.publicateData.ExtOutgoing.note || undefined
      if (this.editedIndex === -1) {
        request.publicateData.ExtOutgoing.StateId = this.newState
      } else {
        request.id = this.editedItem.id
        if (this.$refs.editState) {
          const currentState = this.$refs.editState.getCurrentState()
          if (currentState) {
            request.publicateData.ExtOutgoing.StateId = currentState.id
          }
        } else if (this.newState) {
          request.publicateData.ExtOutgoing.StateId = this.newState
        } else {
          request.publicateData.ExtOutgoing.StateId = this.editedItem.stateId
        }
      }
      const query = `
        mutation (${variables.noteText ? '$noteText: String, ' : ''}$subj: String) {
          publicateExtOutgoing(${request.id ? 'id: "' + request.id + '",' : ''}, publicateData: {
            ExtOutgoing: {
              subject: $subj
              outNumber: "${request.publicateData.ExtOutgoing.outNumber}"
              prefix: "${request.publicateData.ExtOutgoing.prefix}"
              outDate: "${request.publicateData.ExtOutgoing.outDate}"
              authorId: "${request.publicateData.ExtOutgoing.authorId}"
              TypeId: "${request.publicateData.ExtOutgoing.TypeId}"
              ${request.publicateData.ExtOutgoing.StateId ? 'StateId: "' + request.publicateData.ExtOutgoing.StateId + '"' : ''}
              ${request.publicateData.ExtOutgoing.temaId ? 'temaId: [' + request.publicateData.ExtOutgoing.temaId + ']' : ''}
              addresseesId: [${request.publicateData.ExtOutgoing.addresseesId}]
              podpisantId: [${request.publicateData.ExtOutgoing.podpisantId}]
              ${request.publicateData.ExtOutgoing.answerId ? 'answerId: [' + request.publicateData.ExtOutgoing.answerId + ']' : ''}
              ${variables.noteText ? 'note: $noteText' : ''}
              ${request.publicateData.ExtOutgoing.filesId ? 'filesId: [' + request.publicateData.ExtOutgoing.filesId + ']' : ''}
              ${request.publicateData.ExtOutgoing.stateChanged ? 'stateChanged: ' + request.publicateData.ExtOutgoing.stateChanged : ''}
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
