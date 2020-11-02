<template>
  <div>
    <v-dialog v-model="viewDialog" max-width="1500px">
      <v-card outlined>
        <v-card-title>
          <span class="headline">Просмотр данных внутреннего документа</span>
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
                    :store-item="editedItem"
                    type="Internal"
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
                        v-model="editedItem.docDate"
                        prefix="от"
                        readonly
                        outlined
                        dense
                      />
                    </v-col>
                    <v-col cols="6" sm="5" md="5">
                      <v-text-field
                        v-model="editedItem.docNumber"
                        :prefix="`№${editedItem.docNumberPrefix}`"
                        readonly
                        outlined
                        dense
                      />
                    </v-col>
                    <note
                      ref="docNote"
                      :edited-item="editedItem"
                      type="Internal"
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
                      <v-tooltip right>
                        <template v-slot:activator="{ on: onn }">
                          <v-text-field
                            v-model="editedItem.author"
                            label="Исполнитель"
                            outlined
                            readonly
                            v-on="onn"
                          />
                        </template>
                        <span>{{ (currentPosition[editedItem.authorId]) ? currentPosition[editedItem.authorId].Employee.nameFull : null }}</span>
                        <br>
                        <span>{{ (currentPosition[editedItem.authorId]) ? currentPosition[editedItem.authorId].Position.posName : null }}</span>
                        <br>
                        <span>{{ (currentPosition[editedItem.authorId]) ? '(' + currentPosition[editedItem.authorId].Department.depName + ')': null }}</span>
                      </v-tooltip>
                    </v-col>
                  </v-row>
                  <v-row dense class="py-0 my-n5">
                    <v-col cols="12" sm="5" md="5">
                      <v-textarea
                        v-model="editedItem.type"
                        label="Тип документа"
                        outlined
                        readonly
                        rows="5"
                      />
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
                      files-type="Internal"
                    />
                  </v-col>
                </v-col>
                <v-col cols="12" sm="5" md="5" class="py-0 my-n3">
                  <resolutions
                    ref="viewRes"
                    :edited-item="editedItem"
                    type="Internal"
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
import { NullInternal } from '@/Storage/ent-methods/internals'
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
      busy: false,
      editedItem: new NullInternal()
    }
  },

  computed: {
    internal () {
      return this.getter('internals', 'indexed')
    },
    currentPosition () {
      return this.getter('currentPositions', 'indexed')
    },
    ...mapGetters({
      user: 'auth/getUser',
      selectedDep: 'auth/getSelectDep',
      theme: 'navInterface/getTheme'
    })
  },
  async mounted () {
    this.$emit('ready')
    this.editedItem = this.internal[this.editedItemId]
    if (!this.editedItem.isValid) {
      await this.storage.internals.fetchById(this.editedItemId)
      this.editedItem = this.internal[this.editedItemId] || new NullInternal()
    }
  },
  methods: {
    loadState () {
      this.$refs.viewState.prepareItemData(this.editedItem.id)
    },
    getter (ent, type) {
      if (!this.storage) { return [] }
      if (this.storage[ent].synchronization) { return [] }
      return this.storage[ent][type]
    },
    async viewItem (itemId) {
      if (itemId) {
        this.editedItem = this.internal[itemId]
        if (!this.editedItem.isValid) {
          await this.storage.internals.fetchById(itemId)
          this.editedItem = this.internal[itemId] || new NullInternal()
        }
        if (this.$refs.viewState) {
          this.$refs.viewState.init(itemId)
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
