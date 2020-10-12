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
                    :edited-item-id="editedItem.id"
                    type="IntInc"
                    @loaded="loadState"
                  />
                </v-col>
                <v-col cols="12" sm="5" md="5" class="py-0 my-n3">
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
                        :prefix="`№${editedItem.extNumberPrefix}`"
                        readonly
                        outlined
                        dense
                      />
                    </v-col>
                    <v-tooltip bottom>
                      <template v-slot:activator="{ on: onn }">
                        <v-btn
                          :disabled="!editedItem.sourceOutgoingId || busy"
                          color="primary"
                          class="pt-0 mt-1"
                          v-on="onn"
                          @click="viewSource()"
                        >
                          <v-icon>mdi-file-document-outline</v-icon>
                        </v-btn>
                      </template>
                      <span>Посмотреть исходный документ</span>
                    </v-tooltip>
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
                    <note
                      ref="docNote"
                      :edited-item="editedItem"
                      type="IntInc"
                    />
                  </v-row>
                  <v-row dense class="py-0 my-n5">
                    <v-col cols="12" sm="10" md="10">
                      <v-textarea
                        v-model="editedItem.podpisants"
                        label="Подписанты"
                        outlined
                        readonly
                        rows="4"
                      />
                    </v-col>
                  </v-row>
                  <v-row dense class="py-0 my-n5">
                    <v-col cols="12" sm="10" md="10">
                      <v-textarea
                        v-model="editedItem.addressees"
                        label="Адресаты"
                        outlined
                        readonly
                        rows="5"
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
                      files-type="IntInc"
                    />
                  </v-col>
                </v-col>
                <v-col cols="12" sm="5" md="5" class="py-0 my-n3">
                  <resolutions
                    ref="viewRes"
                    :edited-item="editedItem"
                    type="IntInc"
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
    <viewIntOut
      ref="viewSource"
      :edited-item-id="editedItem.sourceOutgoingId"
    />
  </div>
</template>

<script>
/* eslint-disable no-useless-escape */
import { mapGetters } from 'vuex'
import note from '@/components/note'
import { NullIntIncoming } from '@/Storage/ent-methods/int-incomings'
import viewIntOut from './view-int-outgoing'
import files from './file-element'
import resolutions from './resolutions'
import docStates from './doc-states'

export default {
  components: {
    files,
    resolutions,
    docStates,
    viewIntOut,
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
      busy: false,
      editedItem: new NullIntIncoming()
    }
  },

  computed: {
    intIncoming () {
      return this.getter('intIncomings', 'indexed')
    },
    ...mapGetters({
      user: 'auth/getUser',
      selectedDep: 'auth/getSelectDep',
      theme: 'navInterface/getTheme'
    })
  },
  mounted () {
    this.$emit('ready')
    this.editedItem = this.intIncoming[this.editedItemId] || new NullIntIncoming()
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
    viewSource () {
      if (this.$refs.viewSource) {
        this.busy = true
        this.$refs.viewSource.viewItem(this.editedItem.sourceOutgoingId)
        this.busy = false
      }
    },
    async viewItem (itemId) {
      if (itemId) {
        this.editedItem = this.intIncoming[itemId]
        if (!this.editedItem.isValid) {
          await this.storage.intIncomings.fetchById(itemId)
          this.editedItem = this.intIncoming[itemId]
        }
        if (this.$refs.viewState) {
          // this.$refs.viewState.resetForce()
          this.$refs.viewState.init(itemId)
          this.$refs.viewState.prepareItemData(itemId)
        }
        this.viewDialog = true
      }
    },
    close () {
      // this.$refs.viewState.resetForce()
      this.viewDialog = false
    }
  }
}
</script>
