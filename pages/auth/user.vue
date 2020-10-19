<template>
  <v-container fluid fill-height>
    <v-layout allign-center justify-center>
      <v-flex xs12 sm8 md6>
        <v-card class="elevation-12 pa-10" max-width="1200px">
          <h2>{{ currentUser.name }}</h2>
          <v-form
            ref="form"
            v-model="valid"
            :lazy-validation="true"
          >
            <v-row>
              <v-col cols="6">
                <v-card
                  height="450"
                  class="mx-auto"
                  :img="avatarHref"
                >
                  <v-card-text>
                    <v-icon
                      v-if="!currentUser.avatar && !uploadedFile"
                      x-large
                    >
                      mdi-alien-outline
                    </v-icon>
                  </v-card-text>
                </v-card>
                <form
                  ref="filesend"
                  method="POST"
                  type="file"
                  enctype="multipart/form-data"
                  prevent
                  @submit.prevent
                >
                  <v-row>
                    <v-col cols="9">
                      <v-file-input
                        ref="fileInput"
                        name="avatar"
                        accept="image/*"
                        label="Загрузить фото"
                      />
                    </v-col>
                    <v-col cols="1">
                      <v-tooltip bottom>
                        <template v-slot:activator="{ on: onn }">
                          <v-btn
                            :disabled="busy"
                            color="primary"
                            dark
                            class="pt-2 mt-4"
                            @click="addFile"
                            v-on="onn"
                          >
                            <v-icon>mdi-upload</v-icon>
                          </v-btn>
                        </template>
                        <span>Загрузить фото</span>
                      </v-tooltip>
                    </v-col>
                  </v-row>
                </form>
              </v-col>
              <v-col cols="6">
                <v-row>
                  <v-text-field
                    v-model="userName"
                    label="Имя пользователя"
                    :rules="[rules.required, rules.latLetters]"
                  />
                </v-row>
                <v-row>
                  <v-text-field
                    :value="employeeName"
                    label="ФИО работника"
                    disabled
                  />
                  <v-tooltip bottom>
                    <template v-slot:activator="{ on: onn }">
                      <v-btn
                        color="primary"
                        dark
                        class="pt-2 mt-3"
                        @click="editEmployee(editedItem)"
                        v-on="onn"
                      >
                        <v-icon>mdi-lead-pencil</v-icon>
                      </v-btn>
                    </template>
                    <span>Редактировать работника</span>
                  </v-tooltip>
                </v-row>
                <v-row>
                  <v-text-field
                    v-model="pass"
                    :disabled="!changePassword"
                    label="Пароль"
                    type="password"
                  />
                </v-row>
                <v-row>
                  <v-text-field
                    v-model="passRep"
                    :disabled="!changePassword"
                    label="Повторите пароль"
                    type="password"
                    :rules="[checkPass]"
                  />
                </v-row>
                <v-btn
                  :color="!changePassword ? 'primary' : 'error'"
                  class="my-2"
                  @click="changePassword = !changePassword"
                >
                  {{ !changePassword ? 'Сменить пароль' : 'Отмена' }}
                </v-btn>
              </v-col>
            </v-row>
            <editEmployee ref="editEmpl" />
          </v-form>
          <v-card-actions>
            <v-spacer />
            <v-btn :disabled="busy" :color="theme.tables.buttonColor" text @click="close">
              Закрыть
            </v-btn>
            <v-btn :disabled="busy" :color="theme.tables.buttonColor" text @click="save">
              Сохранить
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import Rules from '@/utils/rules'
import { NullEmployee, Employee } from '@/Storage/ent-methods/employees'
import editEmployee from '@/components/edit-employee'
import { fileSend } from '@/utils/file'
import keys from '@/server/keys'
import { gQLRequestMessage } from '@/utils/gql-request'

export default {
  components: {
    editEmployee
  },
  data () {
    return {
      valid: true,
      editedItem: new NullEmployee(),
      storage: this.$docs.buffer,
      rules: Rules,
      pass: '',
      passRep: '',
      changePassword: false,
      uploadedFile: null,
      avatarStorage: keys.AVATAR_STORAGE,
      userName: '',
      currentUser: {}
    }
  },

  computed: {
    ...mapGetters({
      user: 'auth/getUser',
      usersDep: 'auth/getUserDep',
      selectedDep: 'auth/getSelectDep',
      userPermission: 'auth/getUserPermission',
      getUserById: 'auth/getUserById',
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
    employee () {
      return this.getter('employees', 'indexed')
    },
    employeeName () {
      return `${this.user.employee.secondName} ${this.user.employee.firstName} ${this.user.employee.middleName}`
    },
    avatarHref () {
      return this.uploadedFile
        ? `${keys.UPLOAD_STORAGE}/${this.uploadedFile}`
        : this.currentUser.avatar
          ? `${this.avatarStorage}/${this.currentUser.avatar}`
          : ''
    }
  },

  mounted () {
    this.setTitle('Данные пользователя')
    this.editedItem = this.employee[this.user.employee.id].clone()
    this.changePassword = false
    this.currentUser = this.getUserById[this.user.id]
    this.userName = this.currentUser.name
  },

  methods: {
    ...mapActions({
      setBusy: 'navInterface/setBusy',
      unsetBusy: 'navInterface/unsetBusy',
      setTitle: 'navInterface/setTitle'
    }),
    getter (ent, type) {
      if (!this.storage) { return [] }
      if (this.storage[ent].synchronization) { return [] }
      return this.storage[ent][type]
    },

    checkPass () {
      return this.pass === this.passRep || 'Пароль должен совпадать'
    },
    // TODO Удаление загруженных файлов, если загружают повторно
    async addFile () {
      this.busy = true
      const files = await fileSend(this.$refs.filesend)
      this.uploadedFile = files[0]?.filename
      this.$refs.fileInput.clearableCallback()
      this.busy = false
    },

    editEmployee (item) {
      this.editedIndex = item.id || -1
      this.editedItem = this.editedIndex >= 0
        ? this.storage.employees.indexed[item.id].clone()
        : new Employee()
      this.$refs.editEmpl.open(this.editedItem)
    },

    close () {
      // Удалить загруженные файлы
      this.uploadedFile = null
      this.$router.push('/main')
    },
    async save () {
      if (!this.$refs.form.validate()) {
        this.busy = false
        return
      }
      this.busy = true
      const queryAvatar = this.uploadedFile
        ? `avatar: "${this.uploadedFile}"`
        : ''
      const queryPass = this.passRep
        ? `password: "${this.passRep}"`
        : 'password: ""'
      const query = `
        mutation {
          editUser (id: ${this.user.id} user: {
            name: "${this.userName}"
            ${queryPass}
            employeeId: "${this.editedItem.id}"
            ${queryAvatar}
          }) {
            text
            type
            id
            messageType
            item
          }
        }
      `
      await gQLRequestMessage(this, query)
      this.busy = false
      this.uploadedFile = null
    }
  }
}
</script>
