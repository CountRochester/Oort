<template>
  <v-container fluid fill-height>
    <v-layout allign-center justify-center>
      <v-flex xs12 sm8 md6>
        <v-card class="elevation-12 pa-10" max-width="600px">
          <v-form
            ref="form"
            v-model="valid"
            :lazy-validation="lazy"
          >
            <v-text-field
              v-model="name"
              :counter="15"
              :rules="nameRules"
              label="Имя"
              required
              @keydown.enter.prevent="validate"
            />

            <v-text-field
              v-model="password"
              :append-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'"
              :rules="[rules.required, rules.min]"
              :type="show1 ? 'text' : 'password'"
              name="input-10-1"
              label="Введите пароль"
              hint="Минимум 8 символов"
              counter
              @click:append="show1 = !show1"
              @keydown.enter.prevent="validate"
            />

            <v-btn
              :disabled="!valid"
              :loading="loading"
              color="success"
              class="mr-4 mt-4"
              @click="validate"
            >
              Войти
            </v-btn>

            <v-btn
              :disabled="loading"
              color="error"
              class="mr-4 mt-4"
              @click="reset"
            >
              Очистить
            </v-btn>
          </v-form>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
// import socket from '../../plugins/socket.io'
import { mapState } from 'vuex'

import { loginRequest } from '@/utils/gql-request'

export default {
  data: () => ({
    valid: true,
    name: '',
    nameRules: [
      v => !!v || 'Введите имя',
      v => (v && v.length <= 15 && v.length > 5) || 'Имя должно быть от 5 до 15 символов'
    ],
    show1: false,
    password: '',
    rules: {
      required: value => !!value || 'Required.',
      min: v => v.length >= 8 || 'Минимум 8 символов'
    },
    select: null,
    lazy: false,
    loading: false
  }),
  computed: {
    ...mapState('auth', {
      users: 'users',
      groups: 'groups'
      // deps: 'deps',
      // employees: 'employees'
    })
  },
  mounted () {
    const { message } = this.$route.query
    switch (message) {
      case 'login':
        this.$toast.error('Для начала войдите в систему')
        break
      case 'logout':
        this.$toast.success('Вы успешно вышли из системы')
        break
    }
  },

  methods: {
    async validate () {
      const query = `
        mutation {
          login(user: {name: "${this.name}" password: "${this.password}"}) {
            type
            text
            messageType
            token
            UserId
          }
        }
      `
      if (this.$refs.form.validate()) {
        this.loading = true
        await loginRequest(this, query)
        // await this.$docs.initSync()
        this.loading = false
        // this.$docs.sync()
        this.$router.push('/main')
      }
    },
    reset () {
      this.name = ''
      this.password = ''
    }
  }
}
</script>
