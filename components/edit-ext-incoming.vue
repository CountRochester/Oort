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
            <v-row dense>
              <!-- -----------------------------Колонка состояния документа--------------------------- -->
              <v-col cols="12" sm="2" md="2" class="py-0 my-n3">
                <doc-states
                  v-if="editedItem.state"
                  ref="editState"
                  :edited-item-id="editedItem.id"
                  :store-item="editedItem"
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
                        :color="theme.mainTheme.primary"
                        dark
                        no-title
                        scrollable
                        first-day-of-week="1"
                        @input="dateMenu = false"
                      />
                    </v-menu>
                  </v-col>
                  <v-col cols="6" sm="5" md="5">
                    <v-text-field
                      v-model="editedItem.extNumber"
                      :rules="[rules.required, rules.letDigSym]"
                      prefix="№"
                      outlined
                      dense
                    />
                  </v-col>
                  <note
                    ref="docNote"
                    :edited-item="editedItem"
                    type="ExtInc"
                    editable
                  />
                </v-row>
                <incNum
                  ref="incNumber"
                  :edited-item="editedItem"
                  type="ExtInc"
                />
                <!-- Подписанты -->
                <v-row dense class="py-0 my-n4">
                  <v-col cols="12" sm="10" md="10">
                    <v-card class="py-n5 mb-8" flat outlined raised>
                      <v-card-title class="pt-0 pb-6">
                        <h4>От кого</h4>
                      </v-card-title>
                      <v-card-text class="pb-n5 mb-n2">
                        <v-row dense class="py-0 mt-n4 mb-n1">
                          <v-autocomplete
                            v-model="orgs"
                            :items="organisations"
                            :menu-props="{ maxHeight: '400' }"
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
                        </v-row>
                        <v-row dense class="py-0 mt-0 mb-n3">
                          <v-autocomplete
                            v-model="editedItem.authorsId"
                            :items="filterExtEmployees"
                            :menu-props="{ maxHeight: '400' }"
                            :rules="[rules.required]"
                            item-text="extEmployee"
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
                    <v-card class="py-n5 mb-8" flat outlined raised>
                      <v-card-title class="pt-0 pb-6">
                        <h4>Адресаты</h4>
                      </v-card-title>
                      <v-card-text class="pb-n5 mb-n2">
                        <v-row dense class="py-0 mt-n4 mb-n1">
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
                        <v-row dense class="py-0 mt-0 mb-n3">
                          <v-select
                            v-model="editedItem.executantsId"
                            :items="filterAddressees"
                            :menu-props="{ maxHeight: '400' }"
                            :rules="[rules.required, executantsValid]"
                            item-text="posName"
                            item-value="id"
                            label="Адресаты и исполнители"
                            multiple
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
                              :color="theme.tables.menuText"
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
                  <v-col cols="12" sm="10" md="10" class="py-0 mb-0 mt-n1">
                    <files
                      ref="filesEdit"
                      :files-id-array="editedItem.filesId"
                      :edited-item-id="editedItem.id"
                      files-type="ExtInc"
                      add-files
                    />
                  </v-col>
                </v-row>
              </v-col>
              <!-- -------------------------------Колонка резолюций----------------------------------- -->
              <v-col cols="12" sm="5" md="5" class="py-0 my-n5" align-self="start">
                <v-row v-if="editedIndex !== -1" justify="center">
                  <resolutions ref="editRes" :edited-item="editedItem" editable />
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
import { ExtIncoming } from '@/Storage/ent-methods/ext-incomings'
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
      dialog: false,
      valid: false,
      messenger: Messenger.getInstance(),
      rules: Rules,
      editedIndex: -1,
      storage: this.$docs.buffer,
      newState: null,
      dateMenu: false,
      orgs: [],
      addresseeDeps: [],
      defaultItem: new ExtIncoming(),
      editedItem: new ExtIncoming()
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
    organisations () {
      return this.getter('organisations', 'items')
    },
    extEmployees () {
      return this.getter('extCurrentPositions', 'items')
    },
    deps () {
      return this.getter('departments', 'items')
    },
    addressees () {
      if (!this.storage) { return [] }
      if (this.storage.currentPositions.synchronization) { return [] }
      let currentPositions = []
      if (this.storage.currentPositions.items.length &&
        this.storage.positions.items.length) {
        currentPositions = this.storage.currentPositions.items.filter(item => this.storage.positions.indexed[item.PositionId].canSignIntDocs)
      }
      return currentPositions
    },
    temas () {
      return this.getter('temas', 'items')
    },
    types () {
      return this.getter('types', 'items')
    },
    currentPosition () {
      return this.getter('currentPositions', 'indexed')
    },
    formTitle () {
      return this.editedIndex === -1 ? 'Новая запись' : 'Редактировать'
    },
    filteredStates () {
      return this.states.filter(item => item.type === 'extInc') || []
    },
    filterExtEmployees () {
      if (this.orgs.length) {
        return this.extEmployees.filter(empl => this.orgs.includes(empl.OrganisationId))
      } else {
        return this.extEmployees
      }
    },
    filterAddressees () {
      if (this.addresseeDeps.length) {
        return this.addressees.filter(addr => this.addresseeDeps.includes(addr.DepartmentId))
      } else {
        return this.addressees
      }
    }
  },

  watch: {
    dialog (val) {
      if (val) {
        this.$emit('dialogOpen')
      } else {
        this.$emit('dialogClose')
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
      this.$refs.editState.prepareItemData()
      console.log('States LOADED!')
      // this.$refs.editState.prepareItemData(this.editedItem.id)
    },
    executantsValid () {
      const valid = this.editedItem.Executants.filter(el => el.DepartmentId === this.selectedDep).length
      return !!valid || 'Исполнителем обязательно должен быть в том числе и сотрудник вашего отдела'
    },

    open (item) {
      if (!item) { return }
      this.editedIndex = item.id || -1
      this.editedItem = item
      if (this.editedItem.extDate) {
        this.extDate = dateConvert(this.extDate)
      }
      if (this.$refs.editState) {
        this.$refs.editState.prepareItemData()
        // this.$refs.editState.prepareItemData(this.editedItem.id)
      }
      // Заполнение поля отделы для адресатов
      this.orgs = this.editedItem.organisationsId
      if (this.editedItem.executantsId.length) {
        this.editedItem.executantsId.forEach((podp) => {
          const depId = this.currentPosition[podp]
            ? this.currentPosition[podp].DepartmentId
            : null
          this.addresseeDeps.push(depId)
        })
        this.addresseeDeps = this.addresseeDeps.filter(
          (item, index, self) => index === self.findIndex(t => t === item)
        )
      }
      this.dialog = true
    },

    async close () {
      if (this.$refs.incNumber) {
        this.$refs.incNumber.deleteTempIncNum()
        this.$refs.incNumber.reset()
      }
      if (this.$refs.filesEdit) {
        await this.$refs.filesEdit.deleteFiles()
        await this.$refs.filesEdit.reset()
      }
      if (this.$refs.editRes) {
        this.$refs.editRes.reset()
      }
      this.extDate = new Date().toISOString().substr(0, 10)
      this.editedItem = this.defaultItem
      this.editedIndex = -1
      this.orgs = []
      if (this.$refs.form) {
        this.$refs.form.resetValidation()
      }
      this.dialog = false
      await this.initialize()
    },
    // ----------------------------------------------------------------------------------

    async save (item) {
      // Если нажата кнопка добавить
      console.time('Save extIncoming')
      if (!this.$refs.form.validate()) {
        return
      }
      this.busy = true
      this.messenger.purge()
      if (!this.editedItem.needAnswer) {
        this.editedItem.needAnswer = false
      }
      const request = {
        ExtIncoming: {
          extNumber: this.editedItem.extNumber,
          extDate: dateConvert(this.extDate),
          subject: this.editedItem.subject,
          needAnswer: this.editedItem.needAnswer,
          TypeId: this.editedItem.typeId,
          temaId: this.editedItem.temasId,
          authorId: this.editedItem.authorsId,
          execId: this.editedItem.executantsId,
          filesId: this.$refs.filesEdit.getUploadedFiles() || null,
          resolutions: null
        },
        DepData: {
          DepartmentId: this.selectedDep,
          incNumber: null,
          incDate: '',
          prefix: '',
          state: '',
          noteText: '',
          changedState: null
        }
      }
      const variables = {}
      variables.subj = request.ExtIncoming.subject || undefined
      const depData = formDepData(this, request, variables, 'ExtIncoming')
      const query = `
          mutation (${request.DepData.noteText ? '$txt: String, ' : ''}
          ${request.ExtIncoming.resolutions ? '$res: String, ' : ''}$subj: String) {
            publicateExtIncoming(id: "${this.editedItem.id}",
            publicateData: {
              ExtIncoming: {
                extNumber: "${request.ExtIncoming.extNumber}"
                extDate: "${request.ExtIncoming.extDate}"
                subject: $subj
                needAnswer: ${request.ExtIncoming.needAnswer}
                ${request.ExtIncoming.TypeId ? 'TypeId: "' + request.ExtIncoming.TypeId + '"' : ''}
                ${request.ExtIncoming.temaId.length ? 'temaId: [' + request.ExtIncoming.temaId + ']' : ''}
                authorId: "${request.ExtIncoming.authorId}"
                ${request.ExtIncoming.execId.length ? 'execId: [' + request.ExtIncoming.execId + ']' : ''}
                ${request.ExtIncoming.filesId ? 'filesId: [' + request.ExtIncoming.filesId + ']' : ''}
                ${request.ExtIncoming.resolutions ? 'resolutions: $res' : ''}
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
      this.busy = false
      console.log(this.messenger.getMessages())
      console.timeEnd('Save extIncoming')
      await this.close()
    }
  }
}
</script>
