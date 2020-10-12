<template>
  <v-dialog
    v-model="dialog"
    max-width="700px"
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
                  v-model="editedItem.name"
                  :rules="[rules.required, rules.letDigSym2]"
                  label="Название темы"
                  placeholder="Тема"
                  hint="Введите название темы"
                />
              </v-col>
              <v-col cols="12" sm="6" md="6">
                <v-select
                  v-model="editedItem.ContractId"
                  :items="contracts"
                  :rules="[rules.required]"
                  item-text="numberDate"
                  item-value="id"
                  label="Номер контракта"
                  persistent-hint
                  single-line
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
import { Subdivision } from '@/Storage/ent-methods/subdivisions'
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
      defaultItem: new Subdivision(),
      editedItem: new Subdivision(),
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
    contracts () {
      return this.getter('contracts', 'items')
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
    getter (ent, type) {
      if (!this.storage) { return [] }
      if (this.storage[ent].synchronization) { return [] }
      return this.storage[ent][type]
    },

    /* eslint-disable no-useless-escape */
    convertString (str) {
      return str.replace(/\x27/g, '\x22')
        .replace(/(\w)\x22(\w)/g, '$1\x27$2')
        .replace(/(^)\x22(\s)/g, '$1»$2').replace(/(^|\s|\()"/g, '$1«')
        .replace(/"(\;|\!|\?|\:|\.|\,|$|\)|\s)/g, '»$1')
    },

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
            addTema (tema: {
              name: "${this.convertString(this.editedItem.name)}"
              ContractId: "${this.editedItem.ContractId}"
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
            editTema (id: "${this.editedItem.id}" tema: {
              name: "${this.convertString(this.editedItem.name)}"
              ContractId: "${this.editedItem.ContractId}"
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
