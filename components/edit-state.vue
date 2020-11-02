<template>
  <v-dialog
    v-model="dialog"
    max-width="700px"
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
                  v-model="editedItem.name"
                  :rules="[rules.required, rules.rusLetDig]"
                  label="Название состояния"
                  placeholder="Название"
                  hint="Введите название состояния"
                />
              </v-col>
              <v-col cols="12" sm="6" md="6">
                <v-select
                  v-model="editedItem.parentStateId"
                  :items="filteredStates"
                  clearable
                  item-text="text"
                  item-value="id"
                  label="Предыдущее состояние"
                  persistent-hint
                  single-line
                />
              </v-col>
              <v-col cols="12" sm="6" md="6">
                <v-select
                  v-model="editedItem.type"
                  :items="types"
                  :rules="[rules.required]"
                  :disabled="!!editedItem.parentStateId"
                  label="Тип документа"
                  persistent-hint
                  single-line
                />
              </v-col>
            </v-row>
            <v-card
              v-if="editedItem.type"
              class="py-n5 pl-3 mb-0"
              flat
              outlined
              raised
              elevation="12"
            >
              <v-card-title>
                Условия перехода
              </v-card-title>
              <div v-if="editedItem.type === 'extInc' || editedItem.type === 'intInc' || editedItem.type === 'internal' ">
                <v-switch
                  v-for="(incItem, index) in incomingSwitchRequirements"
                  :key="incItem"
                  v-model="reqs"
                  :value="2**index"
                  :label="incItem"
                />
              </div>
              <div v-if="editedItem.type === 'extOut' || editedItem.type === 'intOut'">
                <v-switch
                  v-for="(outItem, index) in outgoingSwitchRequirements"
                  :key="outItem"
                  v-model="reqs"
                  :value="2**index"
                  :label="outItem"
                />
              </div>
            </v-card>
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
    },
    types: {
      type: Array,
      required: false,
      default: () => []
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
      editedIndex: -1,
      reqs: [],
      incomingSwitchRequirements: [
        'Переход по требованию пользователя',
        'Есть входящий номер',
        'Есть резолюция',
        'Принято к исполнению',
        'Запрос на отметку резолюции',
        'Все резолюции исполнены'
      ],
      outgoingSwitchRequirements: [
        'Переход по требованию пользователя',
        'Документ подписан',
        'Получен исходящий номер',
        'Документ разослан'
      ]
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
    states () {
      return this.getter('states', 'items')
    },
    state () {
      return this.getter('states', 'indexed')
    },
    filteredStates () {
      const items = this.states.filter(v => v.id !== this.editedItem.id)
      items.forEach((el) => {
        const type = this.types.find(elem => elem.value === el.type)
        el.text = `${el.name} (${type ? type.text : ''})`
      })
      return items
    },
    formTitle () {
      return this.editedIndex === -1 ? 'Новая запись' : 'Редактировать'
    },
    requirements () {
      return this.reqs.reduce((acc, val) => (acc += val), 0)
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

    open (item) {
      if (!item) { return }
      this.editedIndex = item.id || -1
      this.editedItem = item
      this.reqs = this.transformPropsToReqs(this.editedItem.props)
      this.dialog = true
    },

    transformPropsToReqs (props) {
      if (!props) { return [] }
      const bitProp = (+props).toString(2)
      const output = []
      for (let i = 0; i < bitProp.length; i++) {
        if (+bitProp[i]) { output.push(2 ** (bitProp.length - i - 1)) }
      }
      return output
    },

    async close () {
      this.dialog = false
      this.editedItem = this.defaultItem
      this.editedIndex = -1
      this.$refs.form.resetValidation()
      await this.initialize()
    },

    async save (item) {
      if (!this.$refs.form.validate()) {
        return
      }
      this.busy = true
      let prevState = 0
      if (this.editedItem.parentStateId) {
        if (this.editedItem.id) {
          prevState = this.editedItem.parentStateId === this.state[this.editedItem.id].parentStateId ? '' : this.editedItem.parentStateId
        } else {
          prevState = this.editedItem.parentStateId
        }
      }
      if (prevState === undefined) {
        prevState = 0
      }
      this.editedItem.props = this.requirements
      // Если нажата кнопка добавить
      if (this.editedIndex === -1) {
        let parent = ''
        if (prevState !== 0) {
          parent = `parentStateId: "${prevState}"`
        }
        const query = `
          mutation {
            addState (state: {
              name: "${this.editedItem.name}"
              type: "${this.editedItem.typeReqs}"
              ${parent}
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
            editState (id: "${this.editedItem.id}" state: {
              name: "${this.editedItem.name}"
              type: "${this.editedItem.typeReqs}"
              parentStateId: "${prevState}"
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
      // await this.fetchForce('States')
      this.$refs.form.resetValidation()
      this.busy = false
      await this.close()
    }
  }
}
</script>
