<template>
  <div>
    <div>
      <v-tooltip bottom>
        <template v-slot:activator="{ on: onn }">
          <v-btn
            color="primary"
            class="pt-0 mt-1"
            v-on="onn"
            @click="addNote"
          >
            <v-icon>mdi-file-document-edit-outline</v-icon>
          </v-btn>
        </template>
        <span>Примечания</span>
      </v-tooltip>
    </div>
    <v-dialog
      v-model="dialogNote"
      max-width="800px"
      @click:outside="closeNote"
    >
      <v-card outlined>
        <v-card-title>
          <span class="headline">Примечания</span>
        </v-card-title>
        <v-container>
          <v-textarea
            v-model="tempNote.text"
            :readonly="!editable"
            auto-grow
            full-width
            outlined
          />
        </v-container>
        <v-card-actions>
          <v-spacer />
          <v-btn :disabled="busy" color="blue darken-1" text @click="closeNote">
            {{ btnCaption }}
          </v-btn>
          <v-btn v-if="editable" :disabled="busy" color="blue darken-1" text @click="saveNote">
            Сохранить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
/* eslint-disable no-useless-escape */
import { mapGetters, mapActions } from 'vuex'
import Rules from '@/utils/rules'
import Docs from '@/Storage/docs'
import { gQLRequestMessage } from '../utils/gql-request'

export default {
  props: {
    type: {
      type: String,
      default: 'ExtInc',
      validator: (value) => {
        // Значение должно соответствовать одной из этих строк
        return ['ExtInc', 'ExtOut', 'IntInc', 'IntOut', 'Internal'].includes(value)
      }
    },
    editedItem: {
      type: [Object],
      required: true,
      default: null
    },
    editable: {
      type: Boolean,
      default: false,
      required: false
    }
  },
  data () {
    return {
      storage: null,
      rules: Rules,
      lazy: false,
      busy: false,
      dialogNote: false,
      newNote: {
        id: null,
        DepartmentId: null,
        text: ''
      },
      defaultNote: {
        id: null,
        DepartmentId: this.selectedDep,
        text: ''
      },
      tempNote: {
        id: null,
        DepartmentId: null,
        text: ''
      }
    }
  },
  computed: {
    currentPositions () {
      return this.storage ? this.storage.currentPositions.items : []
    },
    deps () {
      return this.storage ? this.storage.departments.items : []
    },
    employees () {
      return this.storage ? this.storage.employees.items : []
    },
    employee () {
      return this.storage ? this.storage.employees.indexed : []
    },
    extIncoming () {
      return this.storage ? this.storage.extIncomings.indexed : []
    },
    intIncoming () {
      return this.storage ? this.storage.intIncomings.indexed : []
    },
    internal () {
      return this.storage ? this.storage.internals.indexed : []
    },
    currentPosition () {
      return this.storage ? this.storage.currentPositions.indexed : []
    },
    dep () {
      return this.storage ? this.storage.departments.indexed : []
    },
    // ...mapState('docs', {
    //   currentPositions: 'currentPositions'
    // }),
    // ...mapState('auth', {
    //   deps: 'deps',
    //   employees: 'employees'
    // }),
    ...mapGetters({
      user: 'auth/getUser',
      // employee: 'auth/getEmployeeById',
      // extIncoming: 'docs/getExtIncomingById',
      // intIncoming: 'docs/getIntIncomingById',
      // internal: 'docs/getInternalById',
      // currentPosition: 'docs/getCurrentPositionById',
      usersDep: 'auth/getUserDep',
      // dep: 'auth/getDepById',
      selectedDep: 'auth/getSelectDep',
      userPermission: 'auth/getUserPermission'
    }),
    btnCaption () {
      return this.editable
        ? 'Отмена'
        : 'Закрыть'
    }
  },
  async created () {
    const docs = await Docs.getInstance()
    this.storage = await docs.buffer
  },

  methods: {
    ...mapActions({
      fetchForce: 'fetchForce',
      fetch: 'fetch'
    }),
    reset () {
      this.newNote = {
        id: null,
        DepartmentId: null,
        text: ''
      }
    },
    addNote (item) {
      if (!this.newNote.text) {
        switch (this.type) {
          case 'ExtInc':
          case 'IntInc':
          case 'Internal': {
            const currentNote = this.editedItem.notes.find(el => el.DepartmentId === this.selectedDep)
            this.tempNote = { ...currentNote } || { ...this.defaultNote }
            this.tempNote.DepartmentId = this.selectedDep
            break
          }
          case 'ExtOut':
          case 'IntOut': {
            // console.log(this.editedItem)
            this.tempNote = {
              id: null,
              DepartmentId: null,
              text: this.editedItem.note
            }
            break
          }
        }
      } else {
        this.tempNote = { ...this.newNote }
      }

      this.dialogNote = true
    },

    closeNote () {
      this.tempNote = {
        id: null,
        DepartmentId: null,
        text: ''
      }
      this.dialogNote = false
    },

    saveNote () {
      this.newNote = { ...this.tempNote }
      this.dialogNote = false
    },

    async addNewNote () {
      if (this.newNote) {
        const currentNote = this.editedItem.notes ? this.editedItem.notes.find(el => el.DepartmentId === this.selectedDep) || {} : {}
        if (((this.newNote.text !== this.editedItem.note) && ((this.newNote.text !== currentNote.text) && currentNote.text)) || (!currentNote.text)) {
          let obj = ''
          let incId = ''
          let entitity = ''
          switch (this.type) {
            case 'ExtInc': {
              obj = 'extIncNote'
              incId = 'ExtIncomingId'
              break
            }
            case 'IntInc': {
              obj = 'intIncNote'
              incId = 'IntIncomingId'
              break
            }
            case 'Internal': {
              obj = 'internalNote'
              incId = 'InternalId'
              break
            }
            case 'ExtOut': {
              entitity = 'ExtOutgoing'
              break
            }
            case 'IntOut': {
              entitity = 'IntOutgoing'
              break
            }
          }
          this.busy = true
          let query = ''
          switch (this.type) {
            case 'ExtInc':
            case 'IntInc':
            case 'Internal': {
              if (!this.newNote.id) {
                query = `
              mutation ($txt: String!) {
                add${this.type}Note (${obj}: {
                  text: $txt
                  DepartmentId: "${this.selectedDep}"
                  ${incId}: "${this.editedItem.id}"
                }) {
                  text
                  type
                  id
                  messageType
                  item
                }
              }
            `
              } else {
                // если требуется изменения в примечании
                query = `
              mutation ($txt: String!) {
                edit${this.type}Note (id: "${this.newNote.id}" ${obj}: {
                  text: $txt
                  DepartmentId: "${this.selectedDep}"
                  ${incId}: "${this.editedItem.id}"
                }) {
                  text
                  type
                  id
                  messageType
                  item
                }
              }
            `
              }
              break
            }
            case 'ExtOut':
            case 'IntOut': {
              query = `
            mutation ($txt: String!) {
              addNoteTo${entitity} (id: ${this.editedItem.id}, note: $txt)
              {
                text
                type
                id
                messageType
                item
              }
            }
          `
              break
            }
          }
          const variables = {
            txt: this.newNote.text
          }
          await gQLRequestMessage(this, query, variables)
          this.busy = false
        }
      }
    },

    getNewNote () {
      if (this.newNote) {
        const currentNote = this.editedItem.notes ? this.editedItem.notes.find(el => el.DepartmentId === this.selectedDep) || {} : {}
        if (((this.newNote.text !== this.editedItem.note) && ((this.newNote.text !== currentNote.text) && currentNote.text)) || (!currentNote.text)) {
          return this.newNote.text
        }
      }
    }
  }
}
</script>
