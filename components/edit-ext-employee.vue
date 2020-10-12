<template>
  <v-dialog
    v-model="dialog"
    max-width="900px"
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
              <v-col cols="12" sm="6" md="6">
                <v-text-field
                  v-model="editedItem.secondName"
                  :rules="[rules.required, rules.rusLetters]"
                  label="Фамилия"
                  placeholder="Фамилия"
                  @input="insert"
                />
              </v-col>
              <v-col cols="12" sm="6" md="6">
                <v-text-field
                  v-model="editedItem.secondNameDat"
                  :rules="[rules.rusLetters]"
                  label="Фамилия в дательном падеже"
                  placeholder="Фамилия в дательном падеже"
                />
              </v-col>
              <v-col cols="12" sm="6" md="6">
                <v-text-field
                  v-model="editedItem.firstName"
                  :rules="[rules.required, rules.rusLetters]"
                  label="Имя"
                  placeholder="Имя"
                />
              </v-col>
              <v-col cols="12" sm="6" md="6">
                <v-text-field
                  v-model="editedItem.middleName"
                  :rules="[rules.rusLetters]"
                  label="Отчество"
                  placeholder="Отчество"
                />
              </v-col>
              <v-col cols="12" sm="6" md="6">
                <v-text-field
                  v-model="editedItem.phone1"
                  :rules="[rules.phone]"
                  label="Контактный телефон"
                  placeholder="Телефон"
                  hint="Укажите без кода страны и разделителей"
                  @input="insertPhone1"
                />
              </v-col>
              <v-col cols="12" sm="6" md="6">
                <v-text-field
                  v-model="editedItem.phone2"
                  :rules="[rules.phone]"
                  label="Запасной телефон"
                  placeholder="Телефон"
                  hint="Укажите без кода страны и разделителей"
                  @input="insertPhone2"
                />
              </v-col>
              <v-col cols="12" sm="6" md="6">
                <v-text-field
                  v-model="editedItem.fax"
                  :rules="[rules.phone]"
                  label="Факс"
                  placeholder="Телефон"
                  hint="Укажите в случае отличия от центрального и без кода страны и разделителей"
                  @input="insertPhone3"
                />
              </v-col>
              <v-col cols="12" sm="6" md="6">
                <v-text-field
                  v-model="editedItem.email1"
                  :rules="[rules.email]"
                  label="Основной e-mail"
                  placeholder="e-mail"
                />
              </v-col>
              <v-col cols="12" sm="6" md="6">
                <v-text-field
                  v-model="editedItem.email2"
                  :rules="[rules.email]"
                  label="Запасной e-mail"
                  placeholder="e-mail"
                />
              </v-col>
              <v-col cols="12" sm="12" md="12">
                <extCurrentPosition
                  ref="curPos"
                  :ext-employee-id="editedItem.id"
                />
              </v-col>
            </v-row>
          </v-container>
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn :disabled="busy" color="blue darken-1" text @click="close">
          Отмена
        </v-btn>
        <v-btn :disabled="busy" color="blue darken-1" text @click="save">
          Сохранить
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import _ from 'lodash'
import extCurrentPosition from '@/components/ext-current-position'
import { Employee } from '@/Storage/ent-methods/employees'
import Rules from '@/utils/rules'
import Messenger from '@/utils/messenger'
import { gQLRequestMessage } from '@/utils/gql-request'

export default {
  components: {
    extCurrentPosition
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
      defaultItem: new Employee(),
      editedItem: new Employee(),
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

    insert (value) {
      const input = _.trim(value).split(' ')
      if (input.length > 1) {
        this.editedItem.secondName = input[0][0].toUpperCase() + input[0].slice(1).toLowerCase()
        this.editedItem.firstName = input[1][0].toUpperCase() + input[1].slice(1).toLowerCase()
        this.editedItem.middleName = input[2][0].toUpperCase() + input[2].slice(1).toLowerCase()
      }
      const familia = this.editedItem.secondName
      if (familia.endsWith('в') || familia.endsWith('н')) {
        this.editedItem.secondNameDat = familia + 'у'
      } else if (familia.endsWith('о')) {
        this.editedItem.secondNameDat = familia
      } else if (familia.endsWith('ва') || familia.endsWith('на')) {
        this.editedItem.secondNameDat = familia.slice(0, -1) + 'ой'
      } else if (familia.endsWith('кий')) {
        this.editedItem.secondNameDat = familia.slice(0, -2) + 'ому'
      } else if (familia.endsWith('кая')) {
        this.editedItem.secondNameDat = familia.slice(0, -2) + 'ой'
      }
    },

    insertPhone (value, obj, field) {
      const input = _.trim(_.replace(value, /[ ()-]+/g, ''))
      obj[field] = input
      const output = input.split('')
      if (output.length === 10) {
        output.unshift('8')
        obj[field] = output.join('')
      }
      if (output.length === 11) {
        const contryCode = output[0]
        const code = output.slice(1, 4).join('')
        const n1 = output.slice(4, 7).join('')
        const n2 = output.slice(7, 9).join('')
        const n3 = output.slice(-2).join('')
        const phone = contryCode + '(' + code + ')' + n1 + '-' + n2 + '-' + n3
        obj[field] = phone
      }
    },

    insertPhone1 (value) {
      this.insertPhone(value, this.editedItem, 'phone1')
    },

    insertPhone2 (value) {
      this.insertPhone(value, this.editedItem, 'phone2')
    },

    insertPhone3 (value) {
      this.insertPhone(value, this.editedItem, 'fax')
    },

    async close () {
      this.editedItem = this.defaultItem
      this.editedIndex = -1
      if (this.$refs.form) {
        this.$refs.form.resetValidation()
      }
      this.dialog = false
      await this.initialize()
    },

    async save (item) {
      // Если нажата кнопка добавить пользователя
      if (!this.$refs.form.validate()) {
        return
      }
      this.busy = true
      const nameDat = this.editedItem.secondNameDat ? `secondNameDat: "${this.editedItem.secondNameDat}"` : ''
      if (this.editedIndex === -1) {
        const query = `
          mutation {
            addExtEmployee (extEmployee: {
              firstName: "${this.editedItem.firstName}"
              middleName: "${this.editedItem.middleName}"
              secondName: "${this.editedItem.secondName}"
              ${nameDat}
              phone1: "${this.editedItem.phone1}"
              phone2: "${this.editedItem.phone2}"
              fax: "${this.editedItem.fax}"
              email1: "${this.editedItem.email1}"
              email2: "${this.editedItem.email2}"
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
        await Promise.all([
        // Если нужно добавить должности
          this.$refs.curPos.addNewPosition(mes[0]),
          // Если нужно редактировать должности
          this.$refs.curPos.editPosition(mes[0]),
          // если нужно удалить должности
          this.$refs.curPos.deletePositions()
        ])
      } else {
        // Если нажата кнопка редактировать пользователя
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
            editExtEmployee (id: "${this.editedItem.id}" extEmployee: {
              firstName: "${this.editedItem.firstName}"
              middleName: "${this.editedItem.middleName}"
              secondName: "${this.editedItem.secondName}"
              ${nameDat}
              phone1: "${this.editedItem.phone1}"
              phone2: "${this.editedItem.phone2}"
              fax: "${this.editedItem.fax}"
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

      this.$refs.form.resetValidation()
      this.busy = false
      await this.close()
    }
  }
}
</script>
