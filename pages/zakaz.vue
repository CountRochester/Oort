<template>
  <v-layout
    column
    justify-left
    align-left
  >
    <v-flex
      xs12
      sm8
      md6
    >
      <v-container>
        <h1>Заказы в производстве</h1>
      </v-container>
    </v-flex>
  </v-layout>
</template>

<script>
export default {
  middleware: ['auth']
}
</script>
