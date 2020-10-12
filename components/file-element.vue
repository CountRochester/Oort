<template>
  <div>
    <v-card>
      <v-list>
        <v-list-item
          v-for="f1 in filesIdArray"
          :key="f1"
          :href="href(f1)"
          dense
          download
          @click.stop
        >
          <v-list-item-icon>
            <v-tooltip bottom>
              <template v-slot:activator="{ on: onn }">
                <v-btn
                  :href="href(f1)"
                  target="_blank"
                  icon
                  link
                  @click.self="href"
                  v-on="onn"
                >
                  <v-icon color="white">
                    mdi-magnify-plus-outline
                  </v-icon>
                </v-btn>
              </template>
              <span>Просмотр в браузере</span>
            </v-tooltip>
          </v-list-item-icon>
          <h3 v-if="filesIdToDelete.includes(f1)" class="red--text">
            <del>{{ fileName(f1) }}</del>
          </h3>
          <h3 v-if="!filesIdToDelete.includes(f1)" class="white--text">
            {{ fileName(f1) }}
          </h3>
          <v-spacer />
          <v-tooltip bottom>
            <template v-slot:activator="{ on: onn }">
              <v-btn
                v-if="addFiles"
                :disabled="busy"
                icon
                v-on="onn"
                @click.prevent="!filesIdToDelete.includes(f1) ? filesIdToDelete.push(f1) : delFile(f1)"
              >
                <v-icon>mdi-trash-can-outline</v-icon>
              </v-btn>
            </template>
            <span>Удалить файл</span>
          </v-tooltip>
        </v-list-item>

        <v-list-item
          v-for="file1 in uploadedFiles"
          :key="file1.index"
          :href="fileStorageUpload + '/' + file1.filename"
          dense
          download
          @click.stop
        >
          <v-list-item-icon>
            <v-btn
              :href="fileStorageUpload + '/' + file1.filename"
              target="_blank"
              icon
              link
              @click.self="href"
            >
              <v-icon color="white">
                mdi-magnify-plus-outline
              </v-icon>
            </v-btn>
          </v-list-item-icon>
          <h3 v-if="filesIdToDelete.includes(file1.id)" class="red--text">
            <del>{{ file1.filename }}</del>
          </h3>
          <h3 v-if="!filesIdToDelete.includes(file1.id)" class="white--text">
            {{ file1.filename }}
          </h3>
          <v-spacer />
          <v-btn
            :disabled="busy"
            icon
            @click.prevent="!filesIdToDelete.includes(file1.id) ? filesIdToDelete.push(file1.id) : delFile(file1.id)"
          >
            <v-icon>mdi-trash-can-outline</v-icon>
          </v-btn>
        </v-list-item>
      </v-list>
    </v-card>
    <!-- ------------------------------------------Добавление новых файлов------------------------------------- -->
    <form
      v-if="addFiles"
      ref="filesend"
      method="POST"
      type="file"
      enctype="multipart/form-data"
      prevent
      @submit.prevent
    >
      <v-row dense class="pt-0 mt-0">
        <v-col
          cols="12"
          sm="10"
          md="10"
        >
          <v-file-input ref="fileInput" :name="fileType" multiple label="Добавить файлы" />
        </v-col>
        <v-tooltip bottom>
          <template v-slot:activator="{ on: onn }">
            <v-btn
              :disabled="busy"
              :loading="loading"
              color="primary"
              dark
              class="pt-2 mt-4"
              @click="addFile"
              v-on="onn"
            >
              <v-icon>mdi-upload</v-icon>
            </v-btn>
          </template>
          <span>Загрузить файлы</span>
        </v-tooltip>
      </v-row>
    </form>
  </div>
</template>

<script>
/* eslint-disable no-useless-escape */
import { mapActions } from 'vuex'
import Docs from '@/Storage/docs'

import { gQLRequestMessage } from '@/utils/gql-request'
import { fileSend } from '@/utils/file'
import keys from '@/server/keys'

export default {
  props: {
    filesIdArray: {
      type: Array,
      required: true,
      default: () => []
    },
    filesType: {
      type: String,
      default: 'ExtInc',
      validator: (value) => {
        // Значение должно соответствовать одной из этих строк
        return ['ExtInc', 'ExtOut', 'IntInc', 'IntOut', 'Internal'].includes(value)
      }
    },
    editedItemId: {
      type: [String, Number],
      required: false,
      default: null
    },
    addFiles: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      storage: null,
      busy: false,
      loading: false,
      // --------------------------------Общие-----------------------------------
      fileStorageUpload: keys.UPLOAD_STORAGE, //          '/file-storage/upload/',
      extIncFileStorage: keys.EXT_INC_FILE_STORAGE, //    '/file-storage/ext-inc/',
      extOutFileStorage: keys.EXT_OUT_FILE_STORAGE, //    '/file-storage/ext-out',
      intIncFileStorage: keys.INT_INC_FILE_STORAGE, //    '/file-storage/int-inc',
      intOutFileStorage: keys.INT_OUT_FILE_STORAGE, //    '/file-storage/int-out',
      internalFileStorage: keys.INTERNAL_FILE_STORAGE, // '/file-storage/int'

      uploadedFiles: [],
      filesIdToDelete: []
    }
  },
  computed: {
    // ...mapState('docs', {
    //   extIncFiles: 'extIncFiles',
    //   extOutFiles: 'extOutFiles',
    //   intIncFiles: 'intIncFiles',
    //   intOutFiles: 'intOutFiles',
    //   internalFiles: 'internalFiles'
    // }),
    // ...mapGetters({
    //   extIncFile: 'docs/getExtIncFileById',
    //   extOutFile: 'docs/getExtOutFileById',
    //   intIncFile: 'docs/getIntIncFileById',
    //   intOutFile: 'docs/getIntOutFileById',
    //   internalFile: 'docs/getInternalFileById'
    // }),
    extIncFiles () {
      return this.storage ? this.storage.extIncFiles.items : []
    },
    extIncFile () {
      return this.storage ? this.storage.extIncFiles.indexed : []
    },
    extOutFiles () {
      return this.storage ? this.storage.extOutFiles.items : []
    },
    extOutFile () {
      return this.storage ? this.storage.extOutFiles.indexed : []
    },
    intIncFiles () {
      return this.storage ? this.storage.intIncFiles.items : []
    },
    intIncFile () {
      return this.storage ? this.storage.intIncFiles.indexed : []
    },
    intOutFiles () {
      return this.storage ? this.storage.intOutFiles.items : []
    },
    intOutFile () {
      return this.storage ? this.storage.intOutFiles.indexed : []
    },
    internalFiles () {
      return this.storage ? this.storage.internalFiles.items : []
    },
    internalFile () {
      return this.storage ? this.storage.internalFiles.indexed : []
    },
    fileType () {
      return this.filesType.replace(/[A-Z]/, letter => `${letter.toLowerCase()}`) + 'File'
    }
  },
  async created () {
    const docs = await Docs.getInstance()
    this.storage = await docs.buffer
    console.log('File element OK')
    await this.initialize()
  },
  // async mounted () {
  // },
  methods: {
    ...mapActions({
      fetchForce: 'fetchForce',
      fetch: 'fetch'
    }),
    async reset () {
      this.busy = true
      if (this.uploadedFiles.length) {
        for (const file of this.uploadedFiles) {
          this.filesIdToDelete.push(file.id)
          await this.deleteFiles()
        }
      }
      this.busy = false
      this.uploadedFiles = []
      this.filesIdToDelete = []
    },
    async initialize () {
      try {
        console.time('File-element init')
        this.busy = true
        // await Promise.all([
        //   this.fetch('ExtIncFiles'),
        //   this.fetch('ExtOutFiles'),
        //   this.fetch('IntIncFiles'),
        //   this.fetch('IntOutFiles'),
        //   this.fetch('InternalFiles')
        // ])
        switch (this.filesType) {
          case 'ExtInc': {
            // await this.fetch('ExtIncFiles')
            await this.storage.extIncFiles.updateAll()
            break
          }
          case 'ExtOut': {
            await this.storage.extOutFiles.updateAll()
            // await this.fetch('ExtOutFiles')
            break
          }
          case 'IntInc': {
            await this.storage.intIncFiles.updateAll()
            // await this.fetch('IntIncFiles')
            break
          }
          case 'IntOut': {
            await this.storage.intOutFiles.updateAll()
            // await this.fetch('IntOutFiles')
            break
          }
          case 'Internal': {
            await this.storage.internalFiles.updateAll()
            // await this.fetch('InternalFiles')
            break
          }
        }
        this.busy = false
        console.timeEnd('File-element init')
      } catch (err) {
        throw err
      }
    },
    href (fId) {
      switch (this.filesType) {
        case 'ExtInc': {
          if (this.extIncFiles) {
            return this.extIncFile[fId] ? this.extIncFileStorage + '/' + this.extIncFile[fId].file : null
          } else {
            return null
          }
        }
        case 'ExtOut': {
          if (this.extOutFiles) {
            return this.extOutFile[fId] ? this.extOutFileStorage + '/' + this.extOutFile[fId].file : null
          } else {
            return null
          }
        }
        case 'IntInc': {
          if (this.intIncFiles) {
            return this.intIncFile[fId] ? this.intIncFileStorage + '/' + this.intIncFile[fId].file : null
          } else {
            return null
          }
        }
        case 'IntOut': {
          if (this.intOutFiles) {
            return this.intOutFile[fId] ? this.intOutFileStorage + '/' + this.intOutFile[fId].file : null
          } else {
            return null
          }
        }
        case 'Internal': {
          if (this.internalFiles) {
            return this.internalFile[fId] ? this.internalFileStorage + '/' + this.internalFile[fId].file : null
          } else {
            return null
          }
        }
      }
    },
    fileName (fId) {
      switch (this.filesType) {
        case 'ExtInc': {
          if (this.extIncFiles) {
            return this.extIncFile[fId] ? this.extIncFile[fId].file : null
          } else {
            return null
          }
        }
        case 'ExtOut': {
          if (this.extOutFiles) {
            return this.extOutFile[fId] ? this.extOutFile[fId].file : null
          } else {
            return null
          }
        }
        case 'IntInc': {
          if (this.intIncFiles) {
            return this.intIncFile[fId] ? this.intIncFile[fId].file : null
          } else {
            return null
          }
        }
        case 'IntOut': {
          if (this.intOutFiles) {
            return this.intOutFile[fId] ? this.intOutFile[fId].file : null
          } else {
            return null
          }
        }
        case 'Internal': {
          if (this.internalFiles) {
            return this.internalFile[fId] ? this.internalFile[fId].file : null
          } else {
            return null
          }
        }
      }
    },
    async deleteFiles () {
      this.busy = true
      if (this.filesIdToDelete.length) {
        const query = `
            mutation {
              delete${this.filesType}Files (id: [${this.filesIdToDelete}]) {
                text
                type
                id
                messageType
              }
            }
          `
        await gQLRequestMessage(this, query)
        this.busy = false
        this.filesIdToDelete = []
      }
    },

    delFile (id) {
      if (this.filesIdToDelete.length) {
        this.filesIdToDelete = this.filesIdToDelete.filter(v => v !== id)
      }
    },

    async addFile () {
      this.busy = true
      this.uploadedFiles = [...this.uploadedFiles, ...await fileSend(this.$refs.filesend)]
      this.$refs.fileInput.clearableCallback()
      this.busy = false
    },

    async uploadFiles (id) {
      this.loading = true
      if (this.uploadedFiles.length) {
        const fileIds = []
        let docId = ''
        for (const file of this.uploadedFiles) {
          fileIds.push(file.id)
        }
        switch (this.filesType) {
          case 'ExtInc': {
            docId = 'extIncId'
            break
          }
          case 'ExtOut': {
            docId = 'extOutId'
            break
          }
          case 'IntInc': {
            docId = 'intIncId'
            break
          }
          case 'IntOut': {
            docId = 'intOutId'
            break
          }
          case 'Internal': {
            docId = 'internalId'
            break
          }
        }
        const query = `
          mutation {
            attachFilesTo${this.filesType}(fileIds: [${fileIds}] ${docId}: "${this.editedItemId ? this.editedItemId : id}") {
              text
              type
              id
              messageType
            }
          }
        `
        await gQLRequestMessage(this, query)
        this.uploadedFiles = []
      }
      this.loading = false
    },

    getUploadedFiles () {
      if (this.uploadedFiles.length) {
        const fileIds = []
        for (const file of this.uploadedFiles) {
          fileIds.push(file.id)
        }
        this.uploadedFiles = []
        return fileIds
      }
    }
  }
}
</script>
