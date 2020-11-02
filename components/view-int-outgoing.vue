<template>
  <div>
    <v-dialog v-model="viewDialog" max-width="1000px">
      <v-card outlined>
        <v-card-title>
          <span class="headline">Просмотр данных внешненго исходящего документа</span>
        </v-card-title>
        <v-card-text>
          <v-form
            ref="formView"
          >
            <v-container>
              <!-- -----------------------------Колонка состояния документа--------------------------- -->
              <v-row dense>
                <v-col cols="12" sm="3" md="3" class="py-0 my-n3">
                  <doc-states
                    v-if="editedItem ? editedItem.state : null"
                    id="viewState"
                    ref="viewState"
                    :edited-item-id="editedItem.id"
                    :store-item="editedItem"
                    type="IntOut"
                    @loaded="loadState"
                  />
                </v-col>
                <!-- ---------------------------Колонка основных данных о документе--------------------- -->
                <v-col cols="12" sm="9" md="9" class="py-0 my-n3">
                  <v-row dense class="py-0 mt-n3 mb-1">
                    <v-col cols="12" sm="9" md="9">
                      <h3 class="caption">
                        Исходящий номер:
                      </h3>
                      <div class="w-100" />
                    </v-col>
                    <v-col cols="6" sm="5" md="5">
                      <v-text-field
                        v-if="editedItem"
                        v-model="editedItem.outDate"
                        prefix="от"
                        readonly
                        outlined
                        dense
                      />
                    </v-col>
                    <v-col cols="6" sm="5" md="5">
                      <v-text-field
                        v-if="editedItem"
                        v-model="editedItem.outNumber"
                        prefix="№"
                        readonly
                        outlined
                        dense
                      />
                    </v-col>
                  </v-row>
                  <v-row dense class="py-0 my-n5">
                    <v-col cols="12" sm="10" md="10">
                      <v-textarea
                        v-if="editedItem"
                        v-model="editedItem.addressees"
                        label="Получатели"
                        multiple
                        rows="5"
                        no-resize
                        readonly
                        outlined
                      />
                    </v-col>
                  </v-row>
                  <v-row dense class="py-0 my-n5">
                    <v-col cols="12" sm="5" md="5">
                      <v-text-field
                        v-if="editedItem"
                        v-model="editedItem.type"
                        label="Тип документа"
                        outlined
                        readonly
                        dense
                      />
                    </v-col>
                    <v-col cols="12" sm="5" md="5">
                      <v-textarea
                        v-if="editedItem"
                        v-model="editedItem.temas"
                        label="Темы"
                        rows="5"
                        no-resize
                        outlined
                        readonly
                      />
                    </v-col>
                  </v-row>
                  <v-row dense class="py-0 my-n5">
                    <v-col cols="12" sm="10" md="10">
                      <v-textarea
                        v-if="editedItem"
                        v-model="editedItem.podpisants"
                        label="Кто подписал"
                        rows="4"
                        no-resize
                        readonly
                        outlined
                      />
                    </v-col>
                  </v-row>
                  <v-row dense class="py-0 my-n5">
                    <v-col cols="12" sm="10" md="10">
                      <v-textarea
                        v-if="editedItem"
                        v-model="editedItem.isAnswerOn"
                        label="Является ответом на"
                        rows="5"
                        no-resize
                        readonly
                        outlined
                      />
                    </v-col>
                  </v-row>
                  <v-row dense class="py-0 my-n5">
                    <v-col cols="12" sm="10" md="10">
                      <v-text-field
                        v-model="editedItem.author"
                        label="Исполнитель"
                        outlined
                        readonly
                      />
                    </v-col>
                  </v-row>
                  <v-row dense class="pt-0 mt-n5">
                    <v-col cols="12" sm="10" md="10">
                      <v-textarea
                        v-if="editedItem"
                        v-model="editedItem.subject"
                        label="Краткое содержание"
                        readonly
                        no-resize
                        outlined
                        rows="6"
                      />
                    </v-col>
                  </v-row>
                  <v-row dense class="pt-0 mt-0">
                    <v-col
                      v-if="editedItem"
                      cols="12"
                      sm="10"
                      md="10"
                      class="py-0 mb-0 mt-n5"
                    >
                      <files
                        ref="filesEdit"
                        :files-id-array="editedItem.filesId"
                        :edited-item-id="editedItem.id"
                        files-type="IntOut"
                      />
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
            </v-container>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn :color="theme.tables.buttonColor" text @click="close">
            Закрыть
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
/* eslint-disable no-useless-escape */
import { mapGetters } from 'vuex'
import { dateConvert } from '@/utils/date.js'
import { NullIntOutgoing } from '@/Storage/ent-methods/int-outgoings'
import files from './file-element'
import docStates from './doc-states'

export default {
  components: {
    files,
    docStates
  },
  props: {
    editedItemId: {
      type: [String, Number],
      required: false,
      default: null
    }
  },
  data () {
    return {
      storage: this.$docs.buffer,
      viewDialog: false,
      editedItem: new NullIntOutgoing()
    }
  },

  computed: {
    intOutgoing () {
      return this.getter('intOutgoings', 'indexed')
    },
    ...mapGetters({
      user: 'auth/getUser',
      selectedDep: 'auth/getSelectDep',
      theme: 'navInterface/getTheme'
    })
  },
  async mounted () {
    console.time('view IntOut init')
    if (this.editedItemId) {
      let item = this.intOutgoing[this.editedItemId]
      if (!item.isValid) {
        await this.storage.intOutgoings.fetchById(this.editedItemId)
        item = this.intOutgoing[this.editedItemId]
      }
      this.editedItem = item || new NullIntOutgoing()
    }
    console.timeEnd('view IntOut init')
  },
  methods: {
    getter (ent, type) {
      if (!this.storage) { return [] }
      if (this.storage[ent].synchronization) { return [] }
      return this.storage[ent][type]
    },
    loadState () {
      this.$refs.viewState.prepareItemData(this.editedItem.id)
    },
    async viewItem (itemId) {
      if (itemId) {
        this.editedItem = this.intOutgoing[itemId]
        if (this.editedItem) {
          if (this.editedItem.outDate) {
            this.outDate = dateConvert(this.outDate)
          }
        } else {
          await this.storage.intOutgoings.fetchById(itemId)
          this.editedItem = this.intOutgoing[itemId] || new NullIntOutgoing()
        }
        if (this.$refs.viewState) {
          this.$refs.viewState.resetForce()
          await this.$refs.viewState.init(itemId)
          this.$refs.viewState.prepareItemData(itemId)
        }
        this.viewDialog = true
      }
    },
    close () {
      this.viewDialog = false
    }
  }
}
</script>
