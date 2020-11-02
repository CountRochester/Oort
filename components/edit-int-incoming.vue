<template>
  <v-dialog
    v-model="dialog"
    max-width="1500px"
    open-on-focus
    @keydown.enter.prevent="save"
    @keydown.esc.prevent="close"
  >
    <v-card outlined>
      <v-card-title>
        <span class="headline">{{ formTitle }}</span>
      </v-card-title>
      <v-card-text>
        <v-form ref="form" v-model="valid" :lazy-validation="lazyForm">
          <v-container>
            <!-- -----------------------------Колонка состояния документа--------------------------- -->
            <v-row dense>
              <v-col cols="12" sm="2" md="2" class="py-0 my-n3">
                <doc-states
                  v-if="editedItem.state"
                  ref="editState"
                  :edited-item-id="editedItem.id"
                  :store-item="editedItem"
                  :editable="checkPermiss(8)"
                  type="IntInc"
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
              <v-col cols="12" sm="5" md="5" class="py-0 my-n3">
                <!-- Вх/исх номера -->
                <v-row dense class="py-0 mt-n3 mb-n4">
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
                          :value="formatDate(extDate)"
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
                        v-model="extDate"
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
                      v-model="editedItem.extNumberPrefix"
                      :rules="[rules.required]"
                      prefix="№"
                      outlined
                      dense
                    />
                  </v-col>
                  <v-col cols="4" sm="3" md="3">
                    <v-text-field
                      v-model="editedItem.extNumber"
                      :rules="[rules.required, rules.letDigSym]"
                      outlined
                      dense
                    />
                  </v-col>
                  <note
                    ref="docNote"
                    :edited-item="editedItem"
                    type="IntInc"
                    editable
                  />
                </v-row>
                <incNum
                  ref="incNumber"
                  :edited-item="editedItem"
                  type="IntInc"
                />
                <!-- Подписанты -->
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
                            @input="updatePrefix"
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
                <!-- Адресаты -->
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
                            :rules="[rules.required, addresseesValid]"
                            item-text="posName"
                            item-value="id"
                            label="Адресат"
                            multiple
                            outlined
                            dense
                          />
                        </v-row>
                      </v-card-text>
                    </v-card>
                  </v-col>
                </v-row>
                <!-- Исполнители -->
                <v-row dense class="py-0 my-n4">
                  <v-col cols="12" sm="10" md="10">
                    <v-card class="py-n5 mb-8 pb-4" flat outlined raised>
                      <v-card-title class="pt-0 pb-6">
                        <h4>Исполнитель</h4>
                      </v-card-title>
                      <v-card-text class="pb-n5 mb-n2">
                        <v-row dense class="py-0 my-n3">
                          <v-autocomplete
                            v-model="authorDep"
                            :items="deps"
                            :menu-props="{ maxHeight: '400' }"
                            chips
                            small-chips
                            deletable-chips
                            item-text="shortName"
                            item-value="id"
                            label="Отдел"
                            outlined
                            dense
                          />
                        </v-row>
                        <v-row dense class="py-0 mt-n3 mb-n7">
                          <v-autocomplete
                            v-model="editedItem.authorId"
                            :items="filterAuthors"
                            :menu-props="{ maxHeight: '400' }"
                            :rules="[rules.required]"
                            item-text="employee"
                            item-value="id"
                            label="Исполнитель"
                            outlined
                            dense
                          />
                        </v-row>
                      </v-card-text>
                    </v-card>
                  </v-col>
                </v-row>
                <!-- Общие сведения -->
                <v-row dense class="py-0 my-n4">
                  <v-col cols="12" sm="10" md="10">
                    <v-card class="py-n5 mb-8" flat outlined raised>
                      <v-card-text class="pb-n5 mb-n2">
                        <v-row dense class="py-0 my-0">
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
                        </v-row>
                        <v-row dense class="py-0 my-n4">
                          <v-col cols="12" sm="7" md="7">
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
                            <v-checkbox
                              v-model="editedItem.needAnswer"
                              class="mt-1"
                              dark
                              color="white"
                              label="Требуется ответ"
                            />
                          </v-col>
                        </v-row>
                      </v-card-text>
                    </v-card>
                  </v-col>
                </v-row>
                <!-- Краткое содержание -->
                <v-row dense class="pt-0 mt-n4">
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
                <!-- Файлы -->
                <v-row dense class="pt-0 mt-0">
                  <v-col cols="12" sm="10" md="10" class="py-0 mb-0 mt-n3">
                    <files
                      ref="filesEdit"
                      :files-id-array="editedItem.filesId"
                      :edited-item-id="editedItem.id"
                      files-type="IntInc"
                      add-files
                    />
                  </v-col>
                </v-row>
              </v-col>
              <!-- -------------------------------Колонка резолюций----------------------------------- -->
              <v-col cols="12" sm="5" md="5" class="py-0 my-n5" align-self="start">
                <v-row v-if="editedIndex !== -1" justify="center">
                  <resolutions
                    ref="editRes"
                    :edited-item="editedItem"
                    editable
                    type="IntInc"
                  />
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
import resolutions from '@/components/resolutions'
import docStates from '@/components/doc-states'
import incNum from '@/components/inc-numbers'
import { checkUserPermission } from '@/utils/permission'
import { gQLRequestMessage } from '@/utils/gql-request'
import Messenger from '@/utils/messenger'
import { dateConvert, getFormatedDate } from '@/utils/date.js'
import note from '@/components/note'
import Rules from '@/utils/rules'
import { IntIncoming } from '@/Storage/ent-methods/int-incomings'
import { formDepData } from '@/utils/docs-common'

export default {
  components: {
    files,
    resolutions,
    docStates,
    incNum,
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
      dateMenu: false,
      orgs: [],
      newState: null,
      addresseeDeps: [],
      podpisantsDeps: [],
      parent: this.$parent.$parent.$parent.$parent.$parent,
      defaultItem: new IntIncoming(),
      editedItem: new IntIncoming(),
      authorDep: null,
      // ------------------------Диалог входящего номера-------------------------
      newIncNum: {
        id: null,
        incNumDate: new Date().toISOString().substr(0, 10),
        incNum: null
      }
      // ------------------------------------------------------------------------
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
    extDate: {
      get () {
        const val = this.editedItem
          ? this.editedItem.extDate || new Date().toISOString().substr(0, 10)
          : new Date().toISOString().substr(0, 10)
        return dateConvert(val)
      },
      set (val) {
        this.editedItem.extDate = dateConvert(val)
      }
    },
    states () {
      return this.getter('states', 'items')
    },
    deps () {
      return this.getter('departments', 'items')
    },
    dep () {
      return this.getter('departments', 'indexed')
    },
    temas () {
      return this.getter('temas', 'items')
    },
    types () {
      return this.getter('types', 'items')
    },
    currentPositions () {
      return this.getter('currentPositions', 'items')
    },
    currentPosition () {
      return this.getter('currentPositions', 'indexed')
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
    formTitle () {
      return this.editedIndex === -1 ? 'Новая запись' : 'Редактировать'
    },
    filteredStates () {
      return this.states.filter(item => item.type === 'intInc') || []
    },
    filterPodpisants () {
      if (this.podpisantsDeps.length) {
        return this.podpisants.filter(podp => this.podpisantsDeps.includes(podp.DepartmentId))
      } else {
        return this.podpisants
      }
    },
    filterAuthors () {
      if (this.authorDep) {
        return this.currentPositions.filter(auth => auth.DepartmentId === this.authorDep)
      } else {
        return this.currentPositions
      }
    },
    filterAddressees () {
      if (this.addresseeDeps.length) {
        return this.podpisants.filter(podp => this.addresseeDeps.includes(podp.DepartmentId))
      } else {
        return this.podpisants
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
    addresseesValid () {
      const valid = this.editedItem.Addressees.filter(el => el.DepartmentId === this.selectedDep).length
      return !!valid || 'Адресатом обязательно должен быть в том числе и сотрудник вашего отдела'
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
      // Заполнение поля отделы для подписантов
      if (this.editedItem.podpisantsId.length) {
        this.editedItem.podpisantsId.forEach((podp) => {
          const depId = this.currentPosition[podp] ? this.currentPosition[podp].DepartmentId : null
          this.podpisantsDeps.push(depId)
        })
        this.podpisantsDeps = this.podpisantsDeps.filter((item, index, self) =>
          index === self.findIndex(t => (t === item))
        )
        if (!this.editedItem.extNumberPrefix) {
          this.editedItem.extNumberPrefix = this.dep[this.podpisantsDeps[0]].depPrefix
        }
      }
      // Заполнение поля отделы для адресатов
      if (this.editedItem.addresseesId.length) {
        this.editedItem.addresseesId.forEach((addr) => {
          const depId = this.currentPosition[addr] ? this.currentPosition[addr].DepartmentId : null
          this.addresseeDeps.push(depId)
        })
        this.addresseeDeps = this.addresseeDeps.filter((item, index, self) =>
          index === self.findIndex(t => (t === item))
        )
      }
      // Заполнение поля отделы для исполнителя
      if (this.editedItem.authorId) {
        this.authorDep = this.currentPosition[this.editedItem.authorId].DepartmentId
      }
      // Заполнение входящего номера
      if (this.editedItem.incNumber) {
        this.newIncNum = {
          id: null,
          incNumDate: dateConvert(this.editedItem.incDate),
          incNum: this.editedItem.incNumberDigit
        }
      }
      this.dialog = true
    },

    updatePrefix (value) {
      if (value.length) {
        this.editedItem.extNumberPrefix = this.dep[value[0]].depPrefix
      }
    },

    async close () {
      this.busy = true
      if (this.$refs.incNumber) {
        this.$refs.incNumber.deleteTempIncNum()
        this.$refs.incNumber.reset()
      }
      if (this.$refs.filesEdit) {
        await this.$refs.filesEdit.reset()
      }
      if (this.$refs.editRes) {
        this.$refs.editRes.reset()
      }
      this.extDate = new Date().toISOString().substr(0, 10)
      this.addresseeDeps = []
      this.podpisantsDeps = []
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
      console.time('Save intInc')
      // Если нажата кнопка добавить
      if (!this.$refs.form.validate()) {
        return
      }
      this.busy = true
      this.messenger.purge()
      const request = {
        IntIncoming: {
          subject: this.editedItem.subject,
          extNumber: +this.editedItem.extNumber,
          extNumberPrefix: this.editedItem.extNumberPrefix,
          extDate: dateConvert(this.extDate),
          needAnswer: this.editedItem.needAnswer,
          TypeId: this.editedItem.typeId,
          temaId: this.editedItem.temasId,
          authorId: this.editedItem.authorId,
          podpisantId: this.editedItem.podpisantsId,
          addresseeId: this.editedItem.addresseesId,
          filesId: null,
          resolutions: null
        },
        DepData: {
          DepartmentId: this.selectedDep,
          incNumber: null,
          incDate: '',
          prefix: '',
          state: this.newState || '',
          noteText: '',
          changedState: null
        }
      }
      const variables = {}
      variables.subj = request.IntIncoming.subject || undefined
      if (this.$refs.filesEdit) {
        request.IntIncoming.filesId = this.$refs.filesEdit.getUploadedFiles()
      }
      variables.txt = request.DepData.noteText || undefined
      const depData = formDepData(this, request, variables, 'IntIncoming')
      const query = `
        mutation (${request.DepData.noteText ? '$txt: String, ' : ''}
          ${request.IntIncoming.resolutions ? '$res: String, ' : ''}$subj: String) {
          publicateIntIncoming(${this.editedItem.id ? 'id: "' + this.editedItem.id + '", ' : ''}
          publicateData: {
            IntIncoming: {
              subject: $subj
              extNumber: ${request.IntIncoming.extNumber}
              extNumberPrefix: "${request.IntIncoming.extNumberPrefix}"
              extDate: "${request.IntIncoming.extDate}"
              needAnswer: ${request.IntIncoming.needAnswer}
              TypeId: "${request.IntIncoming.TypeId}"
              ${request.IntIncoming.temaId.length ? 'temaId: [' + request.IntIncoming.temaId + ']' : ''}
              authorId: "${request.IntIncoming.authorId}"
              ${request.IntIncoming.podpisantId ? 'podpisantId: [' + request.IntIncoming.podpisantId + ']' : ''}
              ${request.IntIncoming.addresseeId ? 'addresseeId: [' + request.IntIncoming.addresseeId + ']' : ''}
              ${request.IntIncoming.filesId ? 'filesId: [' + request.IntIncoming.filesId + ']' : ''}
              ${request.IntIncoming.resolutions ? 'resolutions: $res' : ''}
            }
            ${depData}
          }) {
            type
            text
            messageType
            id
            item
          }
        }
      `
      if (this.$refs.incNumber) {
        await this.$refs.incNumber.deleteNumber()
      }
      gQLRequestMessage(this, query, variables)
      if (this.$refs.filesEdit) {
        this.$refs.filesEdit.deleteFiles()
      }
      console.timeEnd('Save intInc')
      this.busy = false
      await this.close()
    }
  }
}
</script>
