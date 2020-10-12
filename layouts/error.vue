<template>
  <v-app dark>
    <v-card class="mx-auto my-16 pa-16">
      <h1 v-if="error.statusCode === 404" class="mb-5 text-h3">
        {{ pageNotFound }}
      </h1>
      <h1 v-else>
        {{ otherError }}
      </h1>
      <v-btn color="primary" class="mx-auto d-flex" nuxt to="/" width="350px">
        Вернуться на главную страницу
      </v-btn>
    </v-card>
  </v-app>
</template>

<script>
export default {
  layout: 'empty',
  props: {
    error: {
      type: Object,
      default: null
    }
  },
  data () {
    return {
      pageNotFound: 'Ошибка 404: Страница не найдена',
      otherError: 'Мне жаль, но произошла ошибка =('
    }
  },
  head () {
    const title =
      this.error.statusCode === 404 ? this.pageNotFound : this.otherError
    return {
      title
    }
  }
}
</script>
