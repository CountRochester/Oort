<template>
  <v-dialog
    v-model="dialog"
    max-width="900px"
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
            <v-row>
              <v-col cols="12" sm="6" md="6">
                <v-text-field
                  v-model="editedItem.depName"
                  :rules="[rules.required, rules.rusLetDig]"
                  label="Полное название отдела"
                />
              </v-col>
              <v-col cols="12" sm="6" md="6">
                <v-text-field
                  v-model="editedItem.depNumber"
                  :rules="[rules.required, rules.digit]"
                  label="Номер отдела"
                />
              </v-col>
              <v-col cols="12" sm="6" md="6">
                <v-text-field
                  v-model="editedItem.shortName"
                  :rules="[rules.required, rules.rusLetDig]"
                  label="Сокращённое название отдела"
                />
              </v-col>
              <v-col cols="12" sm="6" md="6">
                <v-text-field
                  v-model="editedItem.depPrefix"
                  label="Префикс в документах"
                />
              </v-col>
              <v-col cols="12" sm="6" md="6">
                <v-autocomplete
                  ref="In"
                  v-model="editedItem.parentDepartmentId"
                  :items="filteredDeps"
                  item-text="shortName"
                  item-value="id"
                  clearable
                  label="В какое подразделение входит"
                  persistent-hint
                  single-line
                />
              </v-col>
              <v-col cols="12" sm="6" md="6">
                <v-autocomplete
                  ref="Include"
                  v-model="editedItem.childDepsId"
                  :items="filteredDeps"
                  :menu-props="{ maxHeight: '400' }"
                  chips
                  small-chips
                  deletable-chips
                  item-text="shortName"
                  item-value="id"
                  label="Подчинённые подразделения"
                  multiple
                  hint="Можно выбрать несколько подразделений"
                  persistent-hint
                />
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
import { Department } from '@/Storage/ent-methods/departments'
import Rules from '@/utils/rules'
import Messenger from '@/utils/messenger'
import { getFormatedDate } from '@/utils/date.js'
import { gQLRequestMessage } from '@/utils/gql-request'

export default {
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
      storage: this.$docs.buffer,
      messenger: Messenger.getInstance(),
      rules: Rules,
      dateMenu: false,
      valid: true,
      dialog: false,
      contDate: new Date().toISOString().substr(0, 10),
      defaultItem: new Department(),
      editedItem: new Department(),
      editedIndex: -1
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
    deps () {
      return this.getter('departments', 'items')
    },
    filteredDeps () {
      return this.deps.filter(dep => dep.id !== this.editedItem.id)
    },
    formTitle () {
      return this.editedIndex === -1 ? 'Новая запись' : 'Редактировать'
    }
  },

  async mounted () {
    await this.initialize()
    this.$emit('ready')
  },

  methods: {
    ...mapActions({
      setEditedItemId: 'navInterface/setEditedItemId',
      setBusy: 'navInterface/setBusy',
      unsetBusy: 'navInterface/unsetBusy'
    }),

    getter (ent, type) {
      if (!this.storage) { return [] }
      if (this.storage[ent].synchronization) { return [] }
      return this.storage[ent][type]
    },

    formatDate (val) {
      return getFormatedDate(val)
    },

    open (item) {
      if (!item) { return }
      this.editedIndex = item.id || -1
      this.editedItem = item
      this.dialog = true
    },

    /* eslint-disable no-useless-escape */
    convertString (str) {
      return str.replace(/\x27/g, '\x22')
        .replace(/(\w)\x22(\w)/g, '$1\x27$2')
        .replace(/(^)\x22(\s)/g, '$1»$2').replace(/(^|\s|\()"/g, '$1«')
        .replace(/"(\;|\!|\?|\:|\.|\,|$|\)|\s)/g, '»$1')
    },

    async close () {
      this.$refs.form.resetValidation()
      this.editedItem = this.defaultItem
      this.editedIndex = -1
      this.dialog = false
      await this.initialize()
    },
    async save (item) {
      // Если нажата кнопка добавить
      this.busy = true
      if (!this.$refs.form.validate()) {
        this.busy = false
        return
      }
      if (this.editedIndex === -1) {
        const parDep = this.editedItem.parentDepartmentId
          ? `parentDepartmentId: "${this.editedItem.parentDepartmentId}"`
          : ''
        let query = `
          mutation {
            addDepartment (department: {
              depName: "${this.convertString(this.editedItem.depName)}"
              depNumber: "${this.editedItem.depNumber}"
              shortName: "${this.convertString(this.editedItem.shortName)}"
              depPrefix: "${this.editedItem.depPrefix}"
              ${parDep}
            }) {
              type
              text
              messageType
              id
              item
            }
          }
        `
        const mes = await gQLRequestMessage(this, query)
        if (this.editedItem.childDepsId.length) {
          const newId = mes[0]
          const parDep = this.editedItem.parentDepartmentId.length ? `parentId: "${this.editedItem.parentDepartmentId}"` : ''
          query = `
          mutation {
            editDepartmentChilds (id: "${newId}" ${parDep} childId: [${this.editedItem.childDepsId}]){
              type
              text
              messageType
              id
              }
            }
          `
          await gQLRequestMessage(this, query)
        }
      } else {
        // Если нажата кнопка редактировать
        const parDep = this.editedItem.parentDepartmentId
          ? `parentDepartmentId: "${this.editedItem.parentDepartmentId}"`
          : ''
        const query = `
          mutation {
            editDepartment (id: "${this.editedItem.id}" department: {
              depName: "${this.convertString(this.editedItem.depName)}"
              depNumber: "${this.editedItem.depNumber}"
              shortName: "${this.convertString(this.editedItem.shortName)}"
              depPrefix: "${this.editedItem.depPrefix}"
              ${parDep}
            }) {
              type
              text
              messageType
              id
              item
            }
            editDepartmentChilds (id: "${this.editedItem.id}" parentId: "${this.editedItem.parentDepartmentId}" childId: [${this.editedItem.childDepsId}]){
              type
              text
              messageType
              id
            }
          }
        `
        await gQLRequestMessage(this, query)
      }
      this.busy = false
      await this.close()
    }
  }
}
</script>
