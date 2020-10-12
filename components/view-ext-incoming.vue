<template>
  <div>
    <v-dialog v-model="viewDialog" max-width="1500px">
      <v-card>
        <v-card-title>
          <span class="headline">Просмотр данных внешненго входящего документа</span>
        </v-card-title>
        <v-card-text>
          <v-form
            ref="formView"
          >
            <v-container>
              <v-row dense class="pa-0 ma-0">
                <v-col cols="12" sm="2" md="2" class="py-0 my-n3">
                  <doc-states
                    ref="viewState"
                    :edited-item-id="editedItemId"
                    @loaded="loadState"
                  />
                </v-col>
                <v-col v-if="editedItem" cols="12" sm="5" md="5" class="py-0 my-n3">
                  <v-row dense class="py-0 mt-n3 mb-n5">
                    <v-col cols="12" sm="9" md="9">
                      <h3 class="caption">
                        Исходящий номер:
                      </h3>
                      <div class="w-100" />
                    </v-col>
                    <v-col cols="6" sm="5" md="5">
                      <v-text-field
                        v-model="editedItem.extDate"
                        prefix="от"
                        readonly
                        outlined
                        dense
                      />
                    </v-col>
                    <v-col cols="6" sm="5" md="5">
                      <v-text-field
                        v-model="editedItem.extNumber"
                        prefix="№"
                        readonly
                        outlined
                        dense
                      />
                    </v-col>
                    <note
                      ref="docNote"
                      :edited-item="editedItem"
                      type="ExtInc"
                    />
                  </v-row>
                  <v-row dense class="py-0 my-n5">
                    <v-col cols="12" sm="9" md="9">
                      <h3 class="caption">
                        Входящий номер отдела:
                      </h3>
                    </v-col>
                    <v-col cols="12" sm="5" md="5">
                      <v-text-field
                        v-model="editedItem.incDate"
                        prefix="от"
                        dense
                        outlined
                        readonly
                      />
                    </v-col>
                    <v-col cols="12" sm="5" md="5">
                      <v-text-field
                        v-model="editedItem.incNumber"
                        prefix="№"
                        dense
                        outlined
                        readonly
                      />
                    </v-col>
                  </v-row>
                  <v-row dense class="py-0 my-n5">
                    <v-col cols="12" sm="5" md="5">
                      <v-textarea
                        v-model="editedItem.organisations"
                        label="Организация"
                        outlined
                        height="80px"
                        readonly
                        rows="3"
                      />
                    </v-col>
                    <v-col cols="12" sm="5" md="5">
                      <v-textarea
                        v-model="editedItem.authors"
                        label="Подписант"
                        outlined
                        height="80px"
                        readonly
                        rows="3"
                      />
                    </v-col>
                  </v-row>
                  <v-row dense class="py-0 my-n5">
                    <v-col cols="12" sm="5" md="5">
                      <v-text-field
                        v-model="editedItem.type"
                        dense
                        outlined
                        readonly
                      />
                      <h3 v-if="editedItem.needAnswer" class="text-center">
                        Требуется ответ
                      </h3>
                    </v-col>
                    <v-col cols="12" sm="5" md="5">
                      <v-textarea
                        v-model="editedItem.temas"
                        label="Темы"
                        outlined
                        readonly
                        rows="5"
                      />
                    </v-col>
                  </v-row>
                  <v-row dense class="py-0 my-n5">
                    <v-col cols="12" sm="10" md="10">
                      <v-textarea
                        v-model="editedItem.subject"
                        label="Краткое содержание"
                        outlined
                        readonly
                        rows="6"
                      />
                    </v-col>
                  </v-row>
                  <v-col cols="12" sm="10" md="10" class="py-0 my-n5">
                    <files
                      ref="filesView"
                      :files-id-array="editedItem.filesId"
                      :edited-item-id="editedItem.id"
                      files-type="ExtInc"
                    />
                  </v-col>
                </v-col>
                <v-col cols="12" sm="5" md="5" class="py-0 my-n3">
                  <resolutions
                    ref="viewRes"
                    :edited-item="editedItem"
                  />
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
import { NullExtIncoming } from '@/Storage/ent-methods/ext-incomings'
import { dateConvert } from '../utils/date.js'
import files from './file-element'
import resolutions from './resolutions'
import docStates from './doc-states'

export default {
  components: {
    files,
    resolutions,
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
      showState: false,
      editedItem: new NullExtIncoming()
    }
  },

  computed: {
    extIncoming () {
      return this.getter('extIncomings', 'indexed')
    },
    ...mapGetters({
      user: 'auth/getUser',
      selectedDep: 'auth/getSelectDep',
      theme: 'navInterface/getTheme'
    })
  },
  mounted () {
    this.$emit('ready')
    if (this.editedItemId) {
      this.editedItem = this.extIncoming[this.editedItemId] || new NullExtIncoming()
      this.showState = true
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
        this.editedItem = this.extIncoming[itemId]
        if (!this.editedItem) {
          await this.storage.extIncomings.fetchById(itemId)
          this.editedItem = this.extIncoming[itemId] || new NullExtIncoming()
          this.showState = true
        }
        if (this.editedItem.extDate) {
          this.extDate = dateConvert(this.extDate)
        }
        if (this.$refs.viewState) {
          this.$refs.viewState.prepareItemData(this.editedItem.id)
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
