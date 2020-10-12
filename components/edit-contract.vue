<template>
  <v-dialog
    v-model="dialog"
    max-width="800px"
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
              <v-col cols="12" sm="6" md="6">
                <v-text-field
                  v-model="editedItem.number"
                  :rules="[rules.required, rules.letDigSym]"
                  label="Номер контракта"
                  placeholder="Номер"
                  hint="Введите номер контракта"
                />
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <v-menu
                  ref="dateMenu"
                  v-model="dateMenu"
                  :close-on-content-click="false"
                  transition="scale-transition"
                  offset-y
                  min-width="290px"
                >
                  <template v-slot:activator="{ on }">
                    <v-text-field
                      :value="formatDate(contDate)"
                      :rules="[rules.required]"
                      label="Дата подписания"
                      prepend-icon="mdi-calendar-month"
                      readonly
                      v-on="on"
                    />
                  </template>
                  <v-date-picker
                    v-model="contDate"
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
            </v-row>
          </v-container>
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn
          :disabled="busy"
          :color="theme.tables.buttonColor"
          text
          @click="close"
        >
          Отмена
        </v-btn>
        <v-btn
          :disabled="busy"
          :color="theme.tables.buttonColor"
          text
          @click="save"
        >
          Сохранить
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { Contract } from '@/Storage/ent-methods/contracts'
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
      defaultItem: new Contract(),
      editedItem: new Contract(),
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

    formatDate (val) {
      return getFormatedDate(val)
    },

    open (item) {
      if (!item) { return }
      this.editedIndex = item.id || -1
      this.editedItem = item
      this.dialog = true
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
      this.editedItem.date = this.contDate
      if (this.editedIndex === -1) {
        const query = `
          mutation {
            addContract (contract: {
              number: "${this.editedItem.number}"
              date: "${this.editedItem.date}"
            }) {
              type
              text
              messageType
              id
              item
            }
          }
        `
        await gQLRequestMessage(this, query)
      } else {
        // Если нажата кнопка редактировать
        const query = `
          mutation {
            editContract (id: "${this.editedItem.id}" contract: {
              number: "${this.editedItem.number}"
              date: "${this.editedItem.date}"
            }) {
              type
              text
              messageType
              id
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
