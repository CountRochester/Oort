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
                  v-model="editedItem.name"
                  :rules="[rules.required, rules.rusLetDig]"
                  label="Название типа документа"
                  placeholder="Название"
                  hint="Введите название типа документа"
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
import { Type } from '@/Storage/ent-methods/types'
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
      defaultItem: new Type(),
      editedItem: new Type(),
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
      this.dialog = false
      this.editedItem = this.defaultItem
      this.editedIndex = -1
      this.$refs.form.resetValidation()
      await this.initialize()
    },

    async save (item) {
      // Если нажата кнопка добавить
      if (!this.$refs.form.validate()) {
        return
      }
      this.busy = true

      if (this.editedIndex === -1) {
        const query = `
          mutation {
            addType (type: {
              name: "${this.editedItem.name}"
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
        // Если нажата кнопка редактировать
        const query = `
          mutation {
            editType (id: "${this.editedItem.id}" type: {
              name: "${this.editedItem.name}"
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
