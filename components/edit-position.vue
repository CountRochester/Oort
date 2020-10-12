<template>
  <v-dialog
    v-model="dialog"
    max-width="600px"
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
            <v-row>
              <v-col cols="12" sm="12" md="12">
                <v-text-field
                  v-model="editedItem.posName"
                  :rules="[rules.required, rules.rusLetDig]"
                  label="Наименование должности"
                  placeholder="Должность"
                  hint="Введите полное название должности"
                />
              </v-col>
              <v-col cols="12" sm="12" md="12">
                <v-text-field
                  v-model="editedItem.posNameDat"
                  :rules="[rules.rusLetDig]"
                  label="Наименование должности в дательном падеже"
                  placeholder="Должность"
                  hint="Введите полное название должности"
                />
              </v-col>
              <v-col cols="12" sm="6" md="6">
                <v-checkbox v-model="editedItem.canSignExtDocs" :label="`Право внешней переписки`" :true-value="true" :false-value="false" color="white" />
                <v-checkbox v-model="editedItem.canSignIntDocs" :label="`Право внутренней переписки`" :true-value="true" :false-value="false" color="white" />
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
import { Position } from '@/Storage/ent-methods/positions'
import Rules from '@/utils/rules'
import Messenger from '@/utils/messenger'
import { gQLRequestMessage } from '@/utils/gql-request'

export default {
  components: {
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
      storage: this.$docs.buffer,
      messenger: Messenger.getInstance(),
      rules: Rules,
      valid: true,
      dialog: false,
      defaultItem: new Position(),
      editedItem: new Position(),
      editedIndex: -1
    }
  },

  computed: {
    ...mapGetters({
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
    }
  },

  async mounted () {
    await this.initialize()
    this.$emit('ready')
  },

  methods: {
    ...mapActions({
      setBusy: 'navInterface/setBusy',
      unsetBusy: 'navInterface/unsetBusy'
    }),

    open (item) {
      if (!item) { return }
      this.editedIndex = item.id || -1
      this.editedItem = item
      this.dialog = true
    },

    async close () {
      this.editedItem = this.defaultItem
      this.editedIndex = -1
      if (this.$refs.form) {
        this.$refs.form.resetValidation()
      }
      if (this.$refs.curPos) {
        this.$refs.curPos.reset()
      }
      this.dialog = false
      await this.initialize()
    },

    async save (item) {
      // Если нажата кнопка добавить пользователя
      if (!this.$refs.form.validate()) {
        this.busy = false
        return
      }
      this.busy = true
      if (this.editedIndex === -1) {
        let dat = ''
        if (this.editedItem.secondNameDat.length) {
          dat = `secondNameDat: "${this.editedItem.secondNameDat}"`
        }
        const query = `
          mutation {
            addEmployee (employee: {
              firstName: "${this.editedItem.firstName}"
              secondName: "${this.editedItem.secondName}"
              ${dat}
              middleName: "${this.editedItem.middleName}"
              tabelNumber: "${this.editedItem.tabelNumber}"
              phone1: "${this.editedItem.phone1}"
              phone2: "${this.editedItem.phone2}"
              phone3: "${this.editedItem.phone3}"
              email1: "${this.editedItem.email1}"
              email2: "${this.editedItem.email2}"
            } ) {
              type
              text
              messageType
              id
              item
            }
          }
        `
        const message = await gQLRequestMessage(this, query)
        await Promise.all([
          // Если нужно добавить должности
          this.$refs.curPos.addNewPosition(message[0]),
          // Если нужно редактировать должности
          this.$refs.curPos.editPosition(message[0]),
          // если нужно удалить должности
          this.$refs.curPos.deletePositions()
        ])
      } else {
        // Если нажата кнопка редактировать пользователя
        let dat = ''
        if (this.editedItem.secondNameDat.length) {
          dat = `secondNameDat: "${this.editedItem.secondNameDat}"`
        }
        await Promise.all([
          // Если нужно добавить должности
          this.$refs.curPos.addNewPosition(this.editedItem.id),
          // Если нужно редактировать должности
          this.$refs.curPos.editPosition(this.editedItem.id),
          // если нужно удалить должности
          this.$refs.curPos.deletePositions()
        ])
        const query = `
          mutation {
            editEmployee (id: "${this.editedItem.id}" employee: {
              firstName: "${this.editedItem.firstName}"
              secondName: "${this.editedItem.secondName}"
              ${dat}
              middleName: "${this.editedItem.middleName}"
              tabelNumber: "${this.editedItem.tabelNumber}"
              phone1: "${this.editedItem.phone1}"
              phone2: "${this.editedItem.phone2}"
              phone3: "${this.editedItem.phone3}"
              email1: "${this.editedItem.email1}"
              email2: "${this.editedItem.email2}"
            }) {
              type
              id
              text
              messageType
              item
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
