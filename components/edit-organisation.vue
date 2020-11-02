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
                  v-model="editedItem.orgName"
                  :rules="[rules.required, rules.letDigSym2]"
                  label="Наименование организации"
                  placeholder="Организация"
                  hint="Введите полное название организации"
                />
              </v-col>
              <v-col cols="12" sm="6" md="6">
                <v-text-field
                  v-model="editedItem.postNumber"
                  :rules="[rules.digit, rules.max6]"
                  label="Почтовый индекс"
                  placeholder="индекс"
                />
              </v-col>
              <v-col cols="12" sm="6" md="6">
                <v-text-field
                  v-model="editedItem.city"
                  :rules="[rules.required, rules.rusLetDig]"
                  label="Город"
                  placeholder="Город"
                  hint="Введите название без г."
                />
              </v-col>
              <v-col cols="12" sm="6" md="6">
                <v-text-field
                  v-model="editedItem.region"
                  :rules="[rules.rusLetDig]"
                  label="Область/регион"
                  placeholder="Область"
                />
              </v-col>
              <v-col cols="12" sm="6" md="6">
                <v-text-field
                  v-model="editedItem.street"
                  :rules="[rules.rusLetDig]"
                  label="Название улицы"
                  placeholder="Улица"
                />
              </v-col>
              <v-col cols="12" sm="6" md="6">
                <v-text-field
                  v-model="editedItem.building"
                  :rules="[rules.letDigSym]"
                  label="Дом/строение"
                  placeholder="Дом"
                  hint="Укажите также корпус, если имеется"
                />
              </v-col>
              <v-col cols="12" sm="6" md="6">
                <v-text-field
                  v-model="editedItem.phone"
                  :rules="[rules.phone]"
                  label="Контактный телефон канцелярии"
                  placeholder="Телефон"
                  hint="Укажите без кода страны и разделителей"
                  @input="insertPhone1"
                />
              </v-col>
              <v-col cols="12" sm="6" md="6">
                <v-text-field
                  v-model="editedItem.fax"
                  :rules="[rules.phone]"
                  label="Основной факс предприятия"
                  placeholder="Факс"
                  hint="Укажите без кода страны и разделителей"
                  @input="insertPhone2"
                />
              </v-col>
              <v-col cols="12" sm="6" md="6">
                <v-text-field
                  v-model="editedItem.email"
                  :rules="[rules.email]"
                  label="Официальный e-mail"
                  placeholder="e-mail"
                />
              </v-col>
            </v-row>
          </v-container>
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn :disabled="busy" :color="theme.mainTheme.primary" text @click="close">
          Отмена
        </v-btn>
        <v-btn :disabled="busy" :color="theme.mainTheme.primary" text @click="save">
          Сохранить
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import _ from 'lodash'
import Rules from '@/utils/rules'
import Messenger from '@/utils/messenger'
import { gQLRequestMessage } from '@/utils/gql-request'
import { Organisation } from '~/Storage/ent-methods/organisations'

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
      defaultItem: new Organisation(),
      editedItem: new Organisation(),
      editedIndex: -1
    }
  },

  computed: {
    ...mapGetters({
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
      return this.editedIndex === -1 ? 'Добавить новую организацию' : 'Редактировать существующую организацию'
    },
    organisations () {
      return this.getter('organisations', 'items')
    }
  },

  async mounted () {
    await this.initialize()
    this.$emit('ready')
  },

  methods: {
    getter (ent, type) {
      if (!this.storage) { return [] }
      if (this.storage[ent].synchronization) { return [] }
      return this.storage[ent][type]
    },
    ...mapActions({
      setEditedItemId: 'navInterface/setEditedItemId',
      setBusy: 'navInterface/setBusy',
      unsetBusy: 'navInterface/unsetBusy'
    }),

    open (item) {
      if (!item) { return }
      this.editedIndex = item.id || -1
      this.editedItem = item
      this.dialog = true
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
      this.insertPhone(value, this.editedItem, 'phone')
    },

    insertPhone2 (value) {
      this.insertPhone(value, this.editedItem, 'fax')
    },

    /* eslint-disable no-useless-escape */
    convertString (str) {
      return str.replace(/\x27/g, '\x22')
        .replace(/(\w)\x22(\w)/g, '$1\x27$2')
        .replace(/(^)\x22(\s)/g, '$1»$2').replace(/(^|\s|\()"/g, '$1«')
        .replace(/"(\;|\!|\?|\:|\.|\,|$|\)|\s)/g, '»$1')
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
      if (this.editedIndex === -1) {
        const query = `
          mutation {
            addOrganisation (organisation: {
              orgName: "${this.convertString(this.editedItem.orgName)}"
              postNumber: "${this.editedItem.postNumber}"
              city: "${this.editedItem.city}"
              region: "${this.editedItem.region}"
              street: "${this.editedItem.street}"
              building: "${this.editedItem.building}"
              phone: "${this.editedItem.phone}"
              fax: "${this.editedItem.fax}"
              email: "${this.editedItem.email}"
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
      } else {
        // Если нажата кнопка редактировать пользователя
        const query = `
          mutation {
            editOrganisation (id: "${this.editedItem.id}" organisation: {
              orgName: "${this.convertString(this.editedItem.orgName)}"
              postNumber: "${this.editedItem.postNumber}"
              city: "${this.editedItem.city}"
              region: "${this.editedItem.region}"
              street: "${this.editedItem.street}"
              building: "${this.editedItem.building}"
              phone: "${this.editedItem.phone}"
              fax: "${this.editedItem.fax}"
              email: "${this.editedItem.email}"
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
