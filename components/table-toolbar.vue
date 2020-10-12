<template>
  <v-toolbar flat :color="theme.tables.searchPanel">
    <v-divider class="mx-4" inset vertical />
    <v-text-field
      v-model="search"
      append-icon="mdi-magnify"
      label="Поиск"
      single-line
      hide-details
    />
    <v-spacer />
    <v-tooltip bottom>
      <template #activator="{ on: onn }">
        <v-btn
          :disabled="busy"
          :color="theme.tables.menuText"
          dark
          class="mb-2 mx-1"
          icon
          @click="reset"
          v-on="onn"
        >
          <v-icon>mdi-refresh</v-icon>
        </v-btn>
      </template>
      <span>Обновить таблицу</span>
    </v-tooltip>
    <v-tooltip bottom>
      <template v-slot:activator="{ on: onn }">
        <div v-on="onn">
          <v-btn
            :disabled="busy"
            :color="theme.tables.menuText"
            dark
            class="mb-2"
            icon
            @click="newItem(defaultItem)"
          >
            <v-icon>mdi-plus</v-icon>
          </v-btn>
        </div>
      </template>
      <span>Добавить запись</span>
    </v-tooltip>
    <v-col v-if="departmentSelect" cols="6" md="2">
      <v-select
        v-model="selectDep"
        :items="usersDep"
        item-text="shortName"
        item-value="id"
        class="mt-2"
        label="Отдел"
        single-line
        dense
      />
    </v-col>
  </v-toolbar>
</template>

<script>
import { mapGetters, mapState, mapActions } from 'vuex'

export default {
  props: {
    defaultItem: {
      type: Object,
      required: true,
      default: () => {}
    },
    reset: {
      type: Function,
      required: false,
      default: () => {}
    },
    newItem: {
      type: Function,
      required: false,
      default: () => {}
    },
    departmentSelect: {
      type: Boolean,
      required: false,
      default: true
    }
  },
  data () {
    return {
      selectDep: null
    }
  },

  computed: {
    search: {
      get () {
        return this.searchState
      },
      set (newVal) {
        this.setSearch(newVal)
      }
    },
    ...mapState('navInterface', {
      busy: 'busy',
      searchState: 'search'
    }),
    ...mapGetters({
      user: 'auth/getUser',
      usersDep: 'auth/getUserDep',
      selectedDep: 'auth/getSelectDep',
      userPermission: 'auth/getUserPermission',
      theme: 'navInterface/getTheme'
    }),

    formTitle () {
      return this.editedIndex === -1 ? 'Новая запись' : 'Редактировать'
    }
  },

  watch: {
    selectDep (val) {
      this.setDep(val)
    }
  },

  methods: {
    ...mapActions({
      setSearch: 'navInterface/setSearch',
      setDep: 'auth/selectDep'
    })
  }
}
</script>
