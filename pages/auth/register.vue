<template>
  <v-container fluid fill-height>
    <v-layout allign-center justify-center>
      <v-flex xs12 sm8 md6>
        <v-card class="elevation-12 pa-10" max-width="600px">
          <h2>Создание пользователя</h2>
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
            />

            <v-text-field
              v-model="retype"
              :append-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'"
              :rules="[rules.required, rules.min]"
              :type="show1 ? 'text' : 'password'"
              name="input-10-1"
              label="Повторите пароль"
              hint="Минимум 8 символов"
              counter
              @click:append="show1 = !show1"
            />

            <v-btn
              :disabled="!valid"
              color="success"
              class="mr-4 mt-4"
              @click="validate"
            >
              Создать
            </v-btn>

            <v-btn
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
    retype: '',
    rules: {
      required: value => !!value || 'Поле обязательно.',
      min: v => v.length >= 8 || 'Минимум 8 символов'
    },
    select: null,
    lazy: false
  }),

  methods: {
    async validate () {
      if (this.$refs.form.validate()) {
        console.log('Валидация успешна')
        this.loading = true
        try {
          const formData = {
            name: this.name,
            password: this.password
          }
          await this.$store.dispatch('auth/createUser', formData)
          this.$toast.success('Пользователь успешно создан')
          this.reset()
          this.loading = false
        } catch (err) {
          this.loading = false
          this.$toast.error('Ошибка при создании пользователя (' + err + ')')
        }
      }
    },
    reset () {
      this.name = ''
      this.password = ''
      this.retype = ''
    }
  }
}
</script>
