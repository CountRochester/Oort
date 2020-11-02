<template>
  <div>
    <v-dialog
      v-model="viewDialog"
      max-width="1000px"
      @click:outside="close"
    >
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
                    v-if="editedItem.state"
                    ref="viewState"
                    :edited-item-id="editedItem.id"
                    :store-item="editedItem"
                    type="ExtOut"
                    @loaded="loadState"
                  />
                </v-col>
                <!-- ---------------------------Колонка основных данных о документе--------------------- -->
                <v-col v-if="editedItem" cols="12" sm="9" md="9" class="py-0 my-n3">
                  <v-row dense class="py-0 mt-n3 mb-1">
                    <v-col cols="12" sm="9" md="9">
                      <h3 class="caption">
                        Исходящий номер:
                      </h3>
                      <div class="w-100" />
                    </v-col>
                    <v-col cols="6" sm="5" md="5">
                      <v-text-field
                        v-model="editedItem.outDate"
                        prefix="от"
                        readonly
                        outlined
                        dense
                      />
                    </v-col>
                    <v-col cols="2" sm="2" md="2">
                      <v-text-field
                        v-model="editedItem.prefix"
                        prefix="№"
                        readonly
                        outlined
                        dense
                      />
                    </v-col>
                    <v-col cols="3" sm="3" md="3">
                      <v-text-field
                        v-model="editedItem.outNumber"
                        prefix="№"
                        readonly
                        outlined
                        dense
                      />
                    </v-col>
                    <note
                      ref="docNote"
                      :edited-item="editedItem"
                      type="ExtOut"
                    />
                  </v-row>
                  <v-row dense class="py-0 my-n5">
                    <v-col cols="12" sm="5" md="5">
                      <v-textarea
                        v-model="editedItem.organisations"
                        label="Организации"
                        readonly
                        no-resize
                        rows="5"
                        outlined
                      />
                    </v-col>
                    <v-col cols="12" sm="5" md="5">
                      <v-textarea
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
                        v-model="editedItem.type"
                        label="Тип документа"
                        outlined
                        readonly
                        dense
                      />
                    </v-col>
                    <v-col cols="12" sm="5" md="5">
                      <v-textarea
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
                        v-model="editedItem.podpisants"
                        label="Кто подписал"
                        rows="5"
                        no-resize
                        readonly
                        outlined
                      />
                    </v-col>
                  </v-row>
                  <v-row dense class="py-0 my-n5">
                    <v-col cols="12" sm="10" md="10">
                      <v-textarea
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
                        readonly
                        outlined
                        dense
                      />
                    </v-col>
                  </v-row>
                  <v-row dense class="pt-0 mt-n5">
                    <v-col cols="12" sm="10" md="10">
                      <v-textarea
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
                      cols="12"
                      sm="10"
                      md="10"
                      class="py-0 mb-0 mt-n5"
                    >
                      <files
                        ref="filesEdit"
                        :files-id-array="editedItem.filesId"
                        :edited-item-id="editedItem.id"
                        files-type="ExtOut"
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
import note from '@/components/note'
import { NullExtOutgoing } from '@/Storage/ent-methods/ext-outgoings'
import { dateConvert } from '../utils/date.js'
import files from './file-element'
import docStates from './doc-states'

export default {
  components: {
    files,
    docStates,
    note
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
      editedItem: new NullExtOutgoing()
    }
  },

  computed: {
    extOutgoing () {
      return this.getter('extOutgoings', 'indexed')
    },
    ...mapGetters({
      user: 'auth/getUser',
      selectedDep: 'auth/getSelectDep',
      theme: 'navInterface/getTheme'
    })
  },
  async mounted () {
    this.$emit('ready')
    if (this.editedItemId) {
      let item = this.extOutgoing[this.editedItemId]
      if (!item.isValid) {
        await this.storage.extOutgoings.fetchById(this.editedItemId)
        item = this.extOutgoing[this.editedItemId]
      }
      this.editedItem = item || new NullExtOutgoing()
    }
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
        this.editedItem = {}
        this.editedItem = this.extOutgoing[itemId]
        if (!this.editedItem.isValid) {
          await this.storage.extOutgoings.fetchById(itemId)
          this.editedItem = this.extOutgoing[itemId] || new NullExtOutgoing()
        }
        if (this.editedItem.outDate) {
          this.outDate = dateConvert(this.outDate)
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
