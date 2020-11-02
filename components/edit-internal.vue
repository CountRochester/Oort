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
                  type="Internal"
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
              <v-col cols="12" sm="6" md="6" class="py-0 my-n3">
                <!-- Вх/исх номера -->
                <v-row dense class="py-0 mt-n3 mb-n4">
                  <v-col cols="12" sm="9" md="9">
                    <h3 class="caption">
                      Номер документа:
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
                      v-model="editedItem.docNumberPrefix"
                      :rules="[rules.required]"
                      prefix="№"
                      outlined
                      dense
                    />
                  </v-col>
                  <v-col cols="4" sm="3" md="3">
                    <v-text-field
                      v-model="editedItem.docNumber"
                      :rules="[rules.required, rules.letDigSym]"
                      outlined
                      dense
                    />
                  </v-col>
                  <note
                    ref="docNote"
                    :edited-item="editedItem"
                    type="Internal"
                    editable
                  />
                </v-row>
                <incNum
                  ref="incNumber"
                  :edited-item="editedItem"
                  type="Internal"
                />
                <!-- Подписанты -->
                <v-row dense class="py-0 my-n4">
                  <v-col cols="12" sm="10" md="10">
                    <v-card class="py-n5 mb-8 pb-4" flat outlined raised>
                      <v-card-title class="pt-0 pb-6">
                        <h4>Подписанты</h4>
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
                          <v-autocomplete
                            v-model="editedItem.podpisantsId"
                            :items="filterPodpisants"
                            :menu-props="{ maxHeight: '400' }"
                            :rules="[rules.required]"
                            chips
                            small-chips
                            deletable-chips
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
                            label="Адресаты"
                            multiple
                            outlined
                            dense
                          />
                        </v-row>
                      </v-card-text>
                    </v-card>
                  </v-col>
                </v-row>
                <!-- Исполнитель -->
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
                  <v-col cols="12" sm="10" md="10" class="py-0 mb-0 mt-n5">
                    <files
                      ref="filesEdit"
                      :files-id-array="editedItem.filesId"
                      :edited-item-id="editedItem.id"
                      files-type="Internal"
                      add-files
                    />
                  </v-col>
                </v-row>
              </v-col>
              <!-- -------------------------------Колонка резолюций----------------------------------- -->
              <v-col cols="12" sm="4" md="4" class="py-0 my-n5" align-self="start">
                <v-row v-if="editedIndex !== -1" justify="center">
                  <resolutions
                    ref="editRes"
                    :edited-item="editedItem"
                    editable
                    type="Internal"
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
import { Internal } from '@/Storage/ent-methods/internals'
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
      parent: this.$parent.$parent.$parent.$parent.$parent,
      defaultItem: new Internal(),
      editedItem: new Internal(),
      dateMenu: false,
      newState: null,
      extDate: new Date().toISOString().substr(0, 10),
      podpisantsDeps: [],
      addresseeDeps: [],
      authorDep: null
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
    deps () {
      return this.getter('departments', 'items')
    },
    currentPositions () {
      return this.getter('currentPositions', 'items')
    },
    temas () {
      return this.getter('temas', 'items')
    },
    types () {
      return this.getter('types', 'items')
    },
    formTitle () {
      return this.editedIndex === -1 ? 'Новая запись' : 'Редактировать'
    },
    podpisants () {
      if (!this.storage) { return [] }
      let currentPositions = []
      if (this.storage.currentPositions.items.length &&
        this.storage.positions.items.length) {
        currentPositions = this.currentPositions.filter(el => this.storage.positions.indexed[el.PositionId].canSignIntDocs)
      }
      return currentPositions
    },
    filterPodpisants () {
      if (this.podpisantsDeps.length) {
        return this.podpisants.filter(podp => this.podpisantsDeps.includes(podp.DepartmentId))
      } else {
        return this.podpisants
      }
    },
    filterAddressees () {
      if (this.addresseeDeps.length) {
        return this.podpisants.filter(podp => this.addresseeDeps.includes(podp.DepartmentId))
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
    filteredStates () {
      return this.states.filter(item => item.type === 'internal')
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

    fillEmployeeProp (employeeArr = [], prop) {
      let idArr = []
      if (employeeArr.length) {
        idArr = employeeArr.reduce((acc, el) => [...acc, el[prop]], [])
        idArr = idArr.filter((item, index, self) =>
          index === self.findIndex(t => (t === item))
        )
      }
      return idArr
    },

    open (item) {
      if (!item) { return }
      this.editedIndex = item.id || -1
      this.editedItem = item
      if (this.editedItem.docDate) {
        this.extDate = dateConvert(this.editedItem.docDate)
      }
      if (this.$refs.editState) {
        this.$refs.editState.prepareItemData(this.editedItem.id)
      }
      // Заполнение поля отделы для подписантов
      this.podpisantsDeps = this.fillEmployeeProp(this.editedItem.Podpisants, 'DepartmentId')
      // Заполнение поля отделы для адресатов
      this.addresseeDeps = this.fillEmployeeProp(this.editedItem.Addressees, 'DepartmentId')
      // Заполнение поля отделы для исполнителя
      this.authorDep = this.editedItem.Author ? this.editedItem.Author.DepartmentId : undefined
      this.dialog = true
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
      console.time('Save internal')
      // Если нажата кнопка добавить
      if (!this.$refs.form.validate()) {
        return
      }
      this.messenger.purge()
      const request = {
        Internal: {
          subject: this.editedItem.subject,
          docNumber: this.editedItem.docNumber,
          docNumberPrefix: this.editedItem.docNumberPrefix,
          docDate: dateConvert(this.extDate),
          TypeId: this.editedItem.typeId,
          temaId: this.editedItem.temasId,
          podpisantId: this.editedItem.podpisantsId,
          authorId: this.editedItem.authorId,
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
      variables.subj = request.Internal.subject || undefined
      if (this.$refs.filesEdit) {
        request.Internal.filesId = this.$refs.filesEdit.getUploadedFiles()
      }
      const depData = formDepData(this, request, variables, 'Internal')
      const query = `
        mutation (${request.DepData.noteText ? '$txt: String, ' : ''}
          ${request.Internal.resolutions ? '$res: String, ' : ''}$subj: String) {
          publicateInternal(${this.editedItem.id ? 'id: "' + this.editedItem.id + '", ' : ''}
          publicateData: {
            Internal: {
              subject: $subj
              docNumber: "${request.Internal.docNumber}"
              docNumberPrefix: "${request.Internal.docNumberPrefix}"
              docDate: "${request.Internal.docDate}"
              TypeId: "${request.Internal.TypeId}"
              ${request.Internal.temaId.length ? 'temaId: [' + request.Internal.temaId + ']' : ''}
              authorId: "${request.Internal.authorId}"
              ${request.Internal.podpisantId ? 'podpisantId: [' + request.Internal.podpisantId + ']' : ''}
              ${request.Internal.addresseeId ? 'addresseeId: [' + request.Internal.addresseeId + ']' : ''}
              ${request.Internal.filesId ? 'filesId: [' + request.Internal.filesId + ']' : ''}
              ${request.Internal.resolutions ? 'resolutions: $res' : ''}
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
      this.busy = true
      if (this.$refs.incNumber) {
        await this.$refs.incNumber.deleteNumber()
      }
      gQLRequestMessage(this, query, variables)
      if (this.$refs.filesEdit) {
        this.$refs.filesEdit.deleteFiles()
      }
      console.timeEnd('Save internal')
      this.busy = false
      console.log(this.messenger.getMessages())
      await this.close()
    }
  }
}
</script>
