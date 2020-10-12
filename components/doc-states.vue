<template>
  <div>
    <v-stepper
      v-model="currentStateIdInArray"
      vertical
    >
      <!-- <template v-for=" (value,index) in statesNameArray"> -->
      <template v-for=" (value,index) in statesArray">
        <v-stepper-step
          :key="index"
          :complete="currentStateIdInArray >= index"
          :step="index"
          :editable="editable && !busy"
        >
          <!-- {{ statesNameArray[index] }} -->
          {{ statesArray[index].name }}
        </v-stepper-step>
      </template>
    </v-stepper>
  </div>
</template>

<script>
/* eslint-disable no-useless-escape */
import { mapGetters } from 'vuex'

// Входящие:
// propsItems:  111111
//   0 - переход по требованию пользователя (1)
//   1 - есть входящий номер (2)
//   2 - есть резолюция (4)
//   3 - принято к исполнению (8)
//   4 - запрос на отметку резолюции (16)
//   5 - все резолюции исполнены (32)
// Исходящие:
// propsItems: 1111
//   0 - переход по требованию пользователя (1)
//   1 - документ подписан (2)
//   2 - получен исходящий номер (4)
//   3 - документ разослан (8)

// const PENDING_REQ = 1
const INC_NUM_REQ = 2
const RES_REQ = 4
// const EXEC_REQ = 8
// const ASK_COMPLETE_REQ = 16
const COMPLETE_ALL_REQ = 32

export default {
  props: {
    editedItemId: {
      type: [String, Number],
      required: true,
      default: null
    },
    storeItem: {
      type: [Object],
      required: false,
      default: () => {}
    },
    editable: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      default: 'ExtInc',
      validator: (value) => {
        // Значение должно соответствовать одной из этих строк
        return ['ExtInc', 'ExtOut', 'IntInc', 'IntOut', 'Internal'].includes(value)
      }
    },
    lazy: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      // --------------------------------Общие-----------------------------------
      storage: this.$docs.buffer,
      currentState: {
        id: 0,
        name: '',
        parentStateId: null,
        updatedAt: ''
      },
      // statesNameArray: [],
      // statesIdArray: [],
      currentStateIdInArray: [],
      editedItem: {},
      statesArray: [],
      state: [],
      states: [],
      count: 0,
      currentReqs: [],
      busy: false,
      entitys: [
        { type: 'ExtInc', entity: 'extIncoming' },
        { type: 'ExtOut', entity: 'extOutgoing' },
        { type: 'IntInc', entity: 'intIncoming' },
        { type: 'IntOut', entity: 'intOutgoing' },
        { type: 'Internal', entity: 'internal' }
      ]
    }
  },
  computed: {
    ...mapGetters({
      user: 'auth/getUser',
      userDep: 'auth/getUserDep',
      selectedDep: 'auth/getSelectDep'
    }),
    origStates () {
      return this.getter('states', 'items')
    },
    origState () {
      return this.getter('states', 'indexed')
    },
    extIncStates () {
      return this.getter('extIncStates', 'items')
    },
    extIncomings () {
      return this.getter('extIncomings', 'items')
    },
    extIncoming () {
      return this.getter('extIncomings', 'indexed')
    },
    extOutgoing () {
      return this.getter('extOutgoings', 'indexed')
    },
    intIncoming () {
      return this.getter('intIncomings', 'indexed')
    },
    resolution () {
      return this.getter('resolutions', 'indexed')
    },
    intOutgoing () {
      return this.getter('intOutgoings', 'indexed')
    },
    internal () {
      return this.getter('internals', 'indexed')
    },
    deps () {
      return this.getter('departments', 'items')
    },
    employees () {
      return this.getter('employees', 'items')
    },
    employee () {
      return this.getter('employees', 'indexed')
    },
    department () {
      return this.getter('departments', 'indexed')
    },

    currentIncNumber () {
      return this.storeItem.incNumber
    },
    currentRes () {
      return this.storeItem.resolutions.length
    },
    completeRes () {
      return this.storeItem.Resolutions.every(res => res.complete)
    }
  },
  watch: {
    editedItemId: async (val) => {
      if (this) {
        this.prepareState()
        await this.prepareItemData(val)
      }
    },
    currentIncNumber (newVal) {
      if (newVal && !this.currentReqs.includes(INC_NUM_REQ)) {
        this.currentReqs.push(INC_NUM_REQ)
      }
    },
    currentRes (newVal) {
      if (newVal && !this.currentReqs.includes(RES_REQ)) {
        this.currentReqs.push(RES_REQ)
      }
    },
    completeRes (newVal) {
      if (newVal && !this.currentReqs.includes(COMPLETE_ALL_REQ)) {
        this.currentReqs.push(COMPLETE_ALL_REQ)
      }
    }
  },
  beforeDestroy () {
    this.reset()
    this.editedItem = null
  },

  async mounted () {
    this.count = 0
    this.prepareState()
    await this.prepareItemData(this.editedItemId)
    this.$emit('loaded')
  },
  methods: {
    getter (ent, type) {
      if (!this.storage) { return [] }
      if (this.storage[ent].synchronization) { return [] }
      return this.storage[ent][type]
    },

    async init (id) {
      this.count = 0
      this.prepareState()
      await this.prepareItemData(id)
    },

    reset () {
      this.currentState = {
        id: 0,
        name: '',
        parentStateId: null,
        updatedAt: ''
      }
      // this.statesNameArray = []
      // this.statesIdArray = []
      this.statesArray = []
      this.currentStateIdInArray = []
      const currentEntity = this.entitys.find(el => el.type === this.type).entity
      this.editedItem = this[currentEntity][this.editedItemId]
    },

    resetForce () {
      this.reset()
      this.states = []
      this.currentState = {}
      this.editedItem = null
    },
    // -------------------Состояния---------------------------------------------------------------------
    prepareState () {
      const typeName = this.type[0].toLowerCase() + this.type.slice(1)
      this.origStates.forEach((el) => {
        if (el.type === typeName) {
          this.states.push(el)
          this.state[el.id] = el
        }
      })
    },

    async prepareItemData (itemId) {
      this.reset()
      switch (this.type) {
        case 'ExtInc': {
          this.editedItem = itemId ? this.extIncoming[itemId] : this.storeItem
          if (this.states.length) {
            this.currentState = this.states.find(el => el.name === this.editedItem.state)
          }
          break
        }
        case 'ExtOut': {
          this.editedItem = itemId ? this.extOutgoing[itemId] : this.storeItem
          if (this.states.length) {
            this.currentState = this.state[this.editedItem.stateId]
          }
          break
        }
        case 'IntInc': {
          this.editedItem = itemId ? this.intIncoming[itemId] : this.storeItem
          if (this.states.length) {
            this.currentState = this.states.find(el => el.name === this.editedItem.state)
          }
          break
        }
        case 'IntOut': {
          this.editedItem = itemId ? this.intOutgoing[itemId] : this.storeItem
          // Если не удаётся найти документ, то идёт обращение к базе
          if (!this.editedItem && itemId && this.count < 1) {
            this.busy = true
            await this.storage.intOutgoing.fetchById(itemId)
            this.busy = false
            this.count++
          }
          if (this.states.length) {
            this.currentState = this.state[this.editedItem.stateId]
          }
          break
        }
        case 'Internal': {
          this.editedItem = itemId ? this.internal[itemId] : this.storeItem
          if (this.states.length) {
            const currentInternalState = this.editedItem.InternalStates.find(el => el.id === this.editedItem.stateId)
            if (currentInternalState) {
              this.currentState = this.state[currentInternalState.StateId]
            }
          }
          break
        }
      }
      // определение первоначального состояния

      if (this.currentState) {
        if (this.states.length && this.currentState.id !== 0) {
          let root
          if (this.currentState.parentStateId) {
            root = this.state[this.currentState.id]
            for (let i = 1; true; i++) {
              if (!root.parentStateId) {
                break
              }
              root = this.state[root.parentStateId]
            }
          } else {
            root = this.currentState
          }
          let end = root
          for (let i = 1; true; i++) {
            this.statesArray.push(end)
            const item = this.states.find(el => el.parentStateId === end.id)
            if (item) {
              end = item
            } else {
              break
            }
          }
        }
        // определение положения текущего состояния в упорядоченном массиве имён
        if (this.statesArray.length) {
          this.currentStateIdInArray = this.statesArray.findIndex(el => el === this.currentState)
        }
      }
    },

    getChangedState () {
      const state = this.states.find(el => el.name === this.statesNameArray[this.currentStateIdInArray])
      const stateOr = this.states.find(el => el.name === this.editedItem.state)
      const editedState = {
        orderedIndex: this.currentStateIdInArray,
        name: this.statesNameArray[this.currentStateIdInArray],
        id: state ? state.id : null
      }
      const originState = {
        orderedIndex: stateOr ? this.statesIdArray.findIndex(el => el === stateOr.id) : null,
        name: this.editedItem.state,
        id: stateOr ? stateOr.id : null
      }
      return originState.orderedIndex - editedState.orderedIndex
    },

    getCurrentState () {
      return this.currentState
    }
  }
}
</script>
