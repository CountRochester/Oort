<template>
  <v-navigation-drawer
    v-model="rightDrawer.drawer"
    :right="right"
    fixed
  >
    <v-list>
      <v-list-item>
        <v-list-item-action>
          <v-btn
            icon
            @click.stop="closeRightDrawer"
          >
            <v-icon dark>
              mdi-close
            </v-icon>
          </v-btn>
        </v-list-item-action>
        <v-list-item-title>Фильтр записей</v-list-item-title>
      </v-list-item>

      <!-- Интервал дат -->
      <v-list-group
        v-if="isDocs"
      >
        <template #activator>
          <v-list-item-title>Интервал дат</v-list-item-title>
        </template>
        <v-list-item class="mt-0 mb-n6 py-0">
          <v-list-item-content>
            <v-menu
              ref="dateFrom"
              v-model="dateFromMenu"
              :close-on-content-click="false"
              transition="scale-transition"
              offset-y
              min-width="290px"
            >
              <template #activator="{ on }">
                <v-text-field
                  :value="formatDate(dateFrom)"
                  label="От"
                  clearable
                  readonly
                  outlined
                  dense
                  v-on="on"
                  @click:clear="setDefaultDateFrom"
                />
              </template>
              <v-date-picker
                v-model="dateFrom"
                locale="ru"
                color="primary"
                dark
                no-title
                scrollable
                first-day-of-week="1"
                @input="dateFromMenu = false"
              />
            </v-menu>
          </v-list-item-content>
        </v-list-item>
        <v-list-item class="mt-n6 py-0">
          <v-list-item-content>
            <v-menu
              ref="dateTo"
              v-model="dateToMenu"
              :close-on-content-click="false"
              transition="scale-transition"
              offset-y
              min-width="290px"
            >
              <template #activator="{ on }">
                <v-text-field
                  :value="formatDate(dateTo)"
                  label="До"
                  clearable
                  readonly
                  outlined
                  dense
                  v-on="on"
                  @click:clear="setDefaultDateTo"
                />
              </template>
              <v-date-picker
                v-model="dateTo"
                locale="ru"
                color="primary"
                dark
                no-title
                scrollable
                first-day-of-week="1"
                @input="dateToMenu = false"
              />
            </v-menu>
          </v-list-item-content>
        </v-list-item>
      </v-list-group>

      <!-- Откуда  #extIncoming / Куда #extOutgoing-->
      <v-list-group
        v-if="selectedTab==='#extIncoming' || selectedTab==='#extOutgoing'"
      >
        <template #activator>
          <v-list-item-title>{{ orgTitle }}</v-list-item-title>
        </template>
        <v-list-item>
          <v-autocomplete
            v-model="org"
            :items="organisations"
            :menu-props="{ maxHeight: '400' }"
            chips
            small-chips
            deletable-chips
            item-text="orgName"
            item-value="id"
            label="Организации"
            multiple
            outlined
            dense
          />
        </v-list-item>
        <v-list-item v-if="selectedTab==='#extOutgoing'">
          <v-autocomplete
            v-model="addressees"
            :items="podpisants"
            :menu-props="{ maxHeight: '400' }"
            chips
            small-chips
            deletable-chips
            item-text="posName"
            item-value="id"
            label="Кому"
            multiple
            outlined
            dense
          />
        </v-list-item>
      </v-list-group>

      <!-- Откуда  #intIncoming / Куда #intOutgoing-->

      <v-list-group
        v-if="selectedTab==='#intIncoming' || selectedTab==='#intOutgoing'"
      >
        <template #activator>
          <v-list-item-title>{{ fromToTitle }}</v-list-item-title>
        </template>
        <v-list-item v-if="selectedTab==='#intIncoming'">
          <v-autocomplete
            v-model="selectedDeps"
            :items="deps"
            :menu-props="{ maxHeight: '400' }"
            chips
            small-chips
            deletable-chips
            item-text="shortName"
            item-value="id"
            label="Отдел"
            multiple
            outlined
            dense
          />
        </v-list-item>
        <v-list-item v-if="selectedTab==='#intOutgoing'">
          <v-autocomplete
            v-model="selectedExecDeps"
            :items="deps"
            :menu-props="{ maxHeight: '400' }"
            chips
            small-chips
            deletable-chips
            item-text="shortName"
            item-value="id"
            label="Отдел"
            multiple
            outlined
            dense
          />
        </v-list-item>
        <v-list-item v-if="selectedTab==='#intIncoming'">
          <v-autocomplete
            v-model="selectedPodpisants"
            :items="selectedCurPos"
            :menu-props="{ maxHeight: '400' }"
            chips
            small-chips
            deletable-chips
            item-text="employee"
            item-value="id"
            label="Подписант"
            multiple
            outlined
            dense
          />
        </v-list-item>
        <v-list-item v-if="selectedTab==='#intOutgoing'">
          <v-autocomplete
            v-model="selectedExecs"
            :items="selectedExecCurPos"
            :menu-props="{ maxHeight: '400' }"
            chips
            small-chips
            deletable-chips
            item-text="employee"
            item-value="id"
            label="Адресат"
            multiple
            outlined
            dense
          />
        </v-list-item>
      </v-list-group>

      <!-- Исходящий номер -->
      <v-list-group
        v-if="isIncoming"
      >
        <template #activator>
          <v-list-item-title>Исходящий номер</v-list-item-title>
        </template>
        <v-list-item v-if="selectedTab==='#intIncoming'">
          <v-text-field
            v-model="selectedOutNumPrefix"
            label="Префикс"
            outlined
            dense
          />
        </v-list-item>
        <v-list-item>
          <v-text-field
            v-model="selectedOutNum"
            label="№"
            outlined
            dense
          />
        </v-list-item>
        <v-list-item>
          <v-list-item-content>
            <v-menu
              ref="dateFrom"
              v-model="outDateMenu"
              :close-on-content-click="false"
              transition="scale-transition"
              offset-y
              min-width="290px"
            >
              <template #activator="{ on }">
                <v-text-field
                  :value="formatDate(outDate)"
                  label="От"
                  clearable
                  readonly
                  outlined
                  dense
                  v-on="on"
                  @click:clear="outDate = null"
                />
              </template>
              <v-date-picker
                v-model="outDate"
                locale="ru"
                color="primary"
                dark
                no-title
                scrollable
                first-day-of-week="1"
                @input="outDateMenu = false"
              />
            </v-menu>
          </v-list-item-content>
        </v-list-item>
      </v-list-group>

      <!-- Состояние -->
      <v-list-group
        v-if="isDocs"
      >
        <template #activator>
          <v-list-item-title>Состояние</v-list-item-title>
        </template>
        <v-list-item>
          <v-autocomplete
            v-model="selectedState"
            :items="currentStates"
            :menu-props="{ maxHeight: '400' }"
            chips
            small-chips
            deletable-chips
            item-text="name"
            item-value="id"
            label="Состояние"
            multiple
            outlined
            dense
          />
        </v-list-item>
      </v-list-group>

      <!-- Подписанты -->
      <v-list-group
        v-if="selectedTab==='#extIncoming' || selectedTab==='#extOutgoing'"
      >
        <template #activator>
          <v-list-item-title>Подписанты</v-list-item-title>
        </template>
        <v-list-item v-if="selectedTab==='#extIncoming'">
          <v-autocomplete
            v-model="selectedPodpisants"
            :items="podpisants"
            :menu-props="{ maxHeight: '400' }"
            chips
            small-chips
            deletable-chips
            item-text="posName"
            item-value="id"
            label="Подписанты"
            multiple
            outlined
            dense
          />
        </v-list-item>
        <v-list-item v-if="selectedTab==='#extOutgoing'">
          <v-autocomplete
            v-model="selectedDeps"
            :items="deps"
            :menu-props="{ maxHeight: '400' }"
            chips
            small-chips
            deletable-chips
            item-text="shortName"
            item-value="id"
            label="Отдел"
            multiple
            outlined
            dense
          />
        </v-list-item>
        <v-list-item v-if="selectedTab==='#extOutgoing'">
          <v-autocomplete
            v-model="selectedSubdivisions"
            :items="selectSubdiv"
            :menu-props="{ maxHeight: '400' }"
            chips
            small-chips
            deletable-chips
            item-text="name"
            item-value="id"
            label="Подразделение"
            multiple
            outlined
            dense
          />
        </v-list-item>
        <v-list-item v-if="selectedTab==='#extOutgoing'">
          <v-autocomplete
            v-model="selectedPodpisants"
            :items="selectedCurPos"
            :menu-props="{ maxHeight: '400' }"
            chips
            small-chips
            deletable-chips
            item-text="employee"
            item-value="id"
            label="Подписанты"
            multiple
            outlined
            dense
          />
        </v-list-item>
      </v-list-group>
      <v-list-group
        v-if="selectedTab==='#intOutgoing'"
      >
        <template #activator>
          <v-list-item-title>Подписанты</v-list-item-title>
        </template>
        <v-list-item>
          <v-autocomplete
            v-model="selectedDeps"
            :items="deps"
            :menu-props="{ maxHeight: '400' }"
            chips
            small-chips
            deletable-chips
            item-text="shortName"
            item-value="id"
            label="Отдел"
            multiple
            outlined
            dense
          />
        </v-list-item>
        <v-list-item>
          <v-autocomplete
            v-model="selectedPodpisants"
            :items="selectedCurPos"
            :menu-props="{ maxHeight: '400' }"
            chips
            small-chips
            deletable-chips
            item-text="employee"
            item-value="id"
            label="Подписант"
            multiple
            outlined
            dense
          />
        </v-list-item>
      </v-list-group>

      <!-- Тип документа -->
      <v-list-group
        v-if="isDocs"
      >
        <template #activator>
          <v-list-item-title>Тип документа</v-list-item-title>
        </template>
        <v-list-item>
          <v-autocomplete
            v-model="selectedType"
            :items="types"
            :menu-props="{ maxHeight: '400' }"
            chips
            small-chips
            deletable-chips
            item-text="name"
            item-value="id"
            label="Тип"
            multiple
            outlined
            dense
          />
        </v-list-item>
      </v-list-group>

      <!-- Требуется ли ответ -->
      <v-list-group
        v-if="isIncoming"
      >
        <template #activator>
          <v-list-item-title>Требуется ли ответ</v-list-item-title>
        </template>
        <v-list-item>
          <v-autocomplete
            v-model="selectedNeedAnswer"
            :items="needAnswer"
            :menu-props="{ maxHeight: '400' }"
            clearable
            item-text="name"
            item-value="value"
            label="Ответ"
            outlined
            dense
          />
        </v-list-item>
      </v-list-group>

      <!-- Имеется ли ответ -->
      <v-list-group
        v-if="isIncoming"
      >
        <template #activator>
          <v-list-item-title>Имеется ли ответ</v-list-item-title>
        </template>
        <v-list-item>
          <v-autocomplete
            v-model="selectedHasAnswer"
            :items="needAnswer"
            :menu-props="{ maxHeight: '400' }"
            clearable
            item-text="name"
            item-value="value"
            label="Ответ"
            outlined
            dense
          />
        </v-list-item>
      </v-list-group>

      <!-- Тема -->
      <v-list-group
        v-if="isDocs"
      >
        <template #activator>
          <v-list-item-title>Тема</v-list-item-title>
        </template>
        <v-list-item>
          <v-autocomplete
            v-model="selectedTema"
            :items="temas"
            :menu-props="{ maxHeight: '400' }"
            chips
            small-chips
            deletable-chips
            item-text="name"
            item-value="id"
            label="Тема"
            multiple
            outlined
            dense
          />
        </v-list-item>
      </v-list-group>

      <!-- Исполнитель -->
      <v-list-group
        v-if="isOutgoing"
      >
        <template #activator>
          <v-list-item-title>Исполнитель</v-list-item-title>
        </template>
        <v-list-item>
          <v-autocomplete
            v-model="selectedAuthor"
            :items="curPos"
            :menu-props="{ maxHeight: '400' }"
            chips
            small-chips
            deletable-chips
            item-text="employee"
            item-value="id"
            label="Исполнитель"
            multiple
            outlined
            dense
          />
        </v-list-item>
      </v-list-group>

      <!-- Кому адресовано ВХ -->
      <v-list-group
        v-if="isIncoming"
      >
        <template #activator>
          <v-list-item-title>Кому адресовано</v-list-item-title>
        </template>
        <v-list-item v-if="selectedTab==='#extIncoming'">
          <v-autocomplete
            v-model="selectedDeps"
            :items="deps"
            :menu-props="{ maxHeight: '400' }"
            chips
            small-chips
            deletable-chips
            item-text="shortName"
            item-value="id"
            label="Отдел"
            multiple
            outlined
            dense
          />
        </v-list-item>
        <v-list-item v-if="selectedTab==='#intIncoming'">
          <v-autocomplete
            v-model="selectedExecDeps"
            :items="deps"
            :menu-props="{ maxHeight: '400' }"
            chips
            small-chips
            deletable-chips
            item-text="shortName"
            item-value="id"
            label="Отдел"
            multiple
            outlined
            dense
          />
        </v-list-item>
        <v-list-item>
          <v-autocomplete
            v-model="selectedSubdivisions"
            :items="selectExecSubdiv"
            :menu-props="{ maxHeight: '400' }"
            chips
            small-chips
            deletable-chips
            item-text="name"
            item-value="id"
            label="Подразделение"
            multiple
            outlined
            dense
          />
        </v-list-item>
        <v-list-item>
          <v-autocomplete
            v-model="selectedExecs"
            :items="selectedExecCurPos"
            :menu-props="{ maxHeight: '400' }"
            chips
            small-chips
            deletable-chips
            item-text="employee"
            item-value="id"
            label="адресат"
            multiple
            outlined
            dense
          />
        </v-list-item>
      </v-list-group>

      <!-- Является ответом на -->
      <v-list-group
        v-if="isOutgoing"
      >
        <template #activator>
          <v-list-item-title>Является ответом на</v-list-item-title>
        </template>
        <v-list-item v-if="selectedTab==='#extOutgoing'">
          <v-autocomplete
            v-model="answerOrg"
            :items="organisations"
            :menu-props="{ maxHeight: '400' }"
            chips
            small-chips
            deletable-chips
            item-text="orgName"
            item-value="id"
            label="Организации"
            multiple
            outlined
            dense
          />
        </v-list-item>
        <v-list-item v-if="selectedTab==='#intOutgoing'">
          <v-autocomplete
            v-model="selectedAnswerDep"
            :items="deps"
            :menu-props="{ maxHeight: '400' }"
            chips
            small-chips
            deletable-chips
            item-text="shortName"
            item-value="id"
            label="Отдел"
            multiple
            outlined
            dense
          />
        </v-list-item>
        <v-list-item class="mt-0 mb-n6 py-0">
          <v-list-item-content>
            <v-menu
              ref="dateFrom"
              v-model="answerDateFromMenu"
              :close-on-content-click="false"
              transition="scale-transition"
              offset-y
              min-width="290px"
            >
              <template #activator="{ on }">
                <v-text-field
                  :value="formatDate(answerDateFrom)"
                  label="От"
                  clearable
                  readonly
                  outlined
                  dense
                  v-on="on"
                  @click:clear="setDefaultDateFrom"
                />
              </template>
              <v-date-picker
                v-model="answerDateFrom"
                locale="ru"
                color="primary"
                dark
                no-title
                scrollable
                first-day-of-week="1"
                @input="answerDateFromMenu = false"
              />
            </v-menu>
          </v-list-item-content>
        </v-list-item>
        <v-list-item class="mt-n6 py-0">
          <v-list-item-content>
            <v-menu
              ref="dateTo"
              v-model="answerDateToMenu"
              :close-on-content-click="false"
              transition="scale-transition"
              offset-y
              min-width="290px"
            >
              <template #activator="{ on }">
                <v-text-field
                  :value="formatDate(answerDateTo)"
                  label="До"
                  clearable
                  readonly
                  outlined
                  dense
                  v-on="on"
                  @click:clear="setDefaultDateTo"
                />
              </template>
              <v-date-picker
                v-model="answerDateTo"
                locale="ru"
                color="primary"
                dark
                no-title
                scrollable
                first-day-of-week="1"
                @input="answerDateToMenu = false"
              />
            </v-menu>
          </v-list-item-content>
        </v-list-item>
        <v-list-item v-if="selectedTab==='#extOutgoing'">
          <v-autocomplete
            v-model="selectedIsAnswerOn"
            :items="filteredExtIncomings"
            :menu-props="{ maxHeight: '400' }"
            chips
            small-chips
            deletable-chips
            item-text="extNumber"
            item-value="id"
            label="№"
            multiple
            outlined
            dense
          />
        </v-list-item>
        <!-- <v-list-item v-if="selectedTab==='#intOutgoing'">
          <v-text-field
            v-model="selectedOutNumPrefix"
            label="Префикс"
            outlined
            dense
          />
        </v-list-item>
        <v-list-item v-if="selectedTab==='#intOutgoing'">
          <v-text-field
            v-model="selectedOutNum"
            label="№"
            outlined
            dense
          />
        </v-list-item> -->
      </v-list-group>
    </v-list>
  </v-navigation-drawer>
</template>

<script>

import { mapState, mapActions, mapGetters } from 'vuex'
import { getFormatedDate, dateConvert } from '@/utils/date.js'
import { app } from '@/utils/is-client'

export default {
  data () {
    return {
      right: true,
      storage: null,
      items: [
        {
          icon: 'mdi-home',
          title: 'Главная',
          to: '/'
        }
      ],
      dateFromMenu: false,
      dateToMenu: false,
      firstInit: false,
      answerDateFromMenu: false,
      answerDateToMenu: false,
      outDateMenu: false,
      needAnswer: [
        { name: 'Да', value: true },
        { name: 'Нет', value: false }
      ]
    }
  },
  computed: {
    ...mapState('navInterface', {
      rightDrawer: 'rightDrawer',
      selectedTab: 'selectedDocsTab',
      selectedFilters: 'selectedFilters'
    }),
    currentStates () {
      let type
      switch (this.selectedTab) {
        case '#extIncoming': {
          type = 'extInc'
          break
        }
        case '#extOutgoing': {
          type = 'extOut'
          break
        }
        case '#intIncoming': {
          type = 'intInc'
          break
        }
        case '#intOutgoing': {
          type = 'intOut'
          break
        }
        case '#internal': {
          type = 'internal'
          break
        }
      }
      return this.states.filter(el => el.type === type)
    },
    podpisants () {
      return this.org.length
        ? this.extEmployees.filter((el) => {
          let found = false
          this.org.forEach((item) => {
            if (el.OrganisationId === item) {
              found = true
            }
          })
          return found
        })
        : this.extEmployees
    },
    selectSubdiv () {
      return this.selectedDeps.length
        ? this.subdivisions.filter((el) => {
          let found = false
          this.selectedDeps.forEach((item) => {
            if (el.DepartmentId === item) {
              found = true
            }
          })
          return found
        })
        : this.subdivisions
    },
    selectExecSubdiv () {
      return this.selectedExecDeps.length
        ? this.subdivisions.filter((el) => {
          let found = false
          this.selectedExecDeps.forEach((item) => {
            if (el.DepartmentId === item) {
              found = true
            }
          })
          return found
        })
        : this.subdivisions
    },
    selectedCurPos () {
      if (this.selectedDeps.length) {
        if (this.selectedSubdivisions.length) {
          const filteredByDeps = this.curPos.filter((el) => {
            let found = false
            this.selectedDeps.forEach((item) => {
              if (el.DepartmentId === item) {
                found = true
              }
            })
            return found
          })
          return filteredByDeps.filter((el) => {
            let found = false
            this.selectedSubdivisions.forEach((item) => {
              if (el.SubdivisionId === item) {
                found = true
              }
            })
            return found
          })
        } else {
          return this.curPos.filter((el) => {
            let found = false
            this.selectedDeps.forEach((item) => {
              if (el.DepartmentId === item) {
                found = true
              }
            })
            return found
          })
        }
      } else if (this.selectedSubdivisions.length) {
        return this.curPos.filter((el) => {
          let found = false
          this.selectedSubdivisions.forEach((item) => {
            if (el.SubdivisionId === item) {
              found = true
            }
          })
          return found
        })
      } else {
        return this.curPos
      }
    },
    selectedExecCurPos () {
      if (this.selectedExecDeps.length) {
        if (this.selectedSubdivisions.length) {
          const filteredByDeps = this.curPos.filter((el) => {
            let found = false
            this.selectedExecDeps.forEach((item) => {
              if (el.DepartmentId === item) {
                found = true
              }
            })
            return found
          })
          return filteredByDeps.filter((el) => {
            let found = false
            this.selectedSubdivisions.forEach((item) => {
              if (el.SubdivisionId === item) {
                found = true
              }
            })
            return found
          })
        } else {
          return this.curPos.filter((el) => {
            let found = false
            this.selectedExecDeps.forEach((item) => {
              if (el.DepartmentId === item) {
                found = true
              }
            })
            return found
          })
        }
      } else if (this.selectedSubdivisions.length) {
        return this.curPos.filter((el) => {
          let found = false
          this.selectedSubdivisions.forEach((item) => {
            if (el.SubdivisionId === item) {
              found = true
            }
          })
          return found
        })
      } else {
        return this.curPos
      }
    },
    dateFrom: {
      get () {
        const date = new Date(this.selectedFilters.dateFrom)
        return date.toISOString().substr(0, 10)
      },
      set (val) {
        const date = new Date(val)
        this.setDateFrom(+date)
      }
    },
    dateTo: {
      get () {
        const date = new Date(this.selectedFilters.dateTo)
        return date.toISOString().substr(0, 10)
      },
      set (val) {
        const date = new Date(val)
        this.setDateTo(+date)
      }
    },
    org: {
      get () {
        return this.selectedFilters.organisation
      },
      set (val) {
        this.setOrganisation(val)
      }
    },
    selectedState: {
      get () {
        return this.selectedFilters.state
      },
      set (val) {
        this.setSelectState(val)
      }
    },
    selectedPodpisants: {
      get () {
        return this.selectedFilters.podpisants
      },
      set (val) {
        this.setPodpisants(val)
      }
    },
    selectedType: {
      get () {
        return this.selectedFilters.type
      },
      set (val) {
        this.setType(val)
      }
    },
    selectedNeedAnswer: {
      get () {
        return this.selectedFilters.needAnswer
      },
      set (val) {
        this.setNeedAnswer(val)
      }
    },
    selectedHasAnswer: {
      get () {
        return this.selectedFilters.hasAnswer
      },
      set (val) {
        this.setHasAnswer(val)
      }
    },
    selectedTema: {
      get () {
        return this.selectedFilters.tema
      },
      set (val) {
        this.setTema(val)
      }
    },
    selectedDeps: {
      get () {
        return this.selectedFilters.deps
      },
      set (val) {
        this.setDeps(val)
      }
    },
    selectedExecDeps: {
      get () {
        return this.selectedFilters.execDeps
      },
      set (val) {
        this.setExecDeps(val)
      }
    },
    selectedSubdivisions: {
      get () {
        return this.selectedFilters.subdivision
      },
      set (val) {
        this.setSubdivision(val)
      }
    },
    selectedExecs: {
      get () {
        return this.selectedFilters.executants
      },
      set (val) {
        this.setExecutants(val)
      }
    },
    selectedIsAnswerOn: {
      get () {
        return this.selectedFilters.isAnswerOn
      },
      set (val) {
        this.setIsAnswerOn(val)
      }
    },
    addressees: {
      get () {
        return this.selectedFilters.addressees
      },
      set (val) {
        this.setAddressees(val)
      }
    },
    selectedAuthor: {
      get () {
        return this.selectedFilters.author
      },
      set (val) {
        this.setAuthor(val)
      }
    },
    answerOrg: {
      get () {
        return this.selectedFilters.answerOrg
      },
      set (val) {
        this.setAnswerOrg(val)
      }
    },
    answerDateFrom: {
      get () {
        const date = new Date(this.selectedFilters.answerDateFrom)
        return date.toISOString().substr(0, 10)
      },
      set (val) {
        const date = new Date(val)
        this.setAnswerDateFrom(+date)
      }
    },
    answerDateTo: {
      get () {
        const date = new Date(this.selectedFilters.answerDateTo)
        return date.toISOString().substr(0, 10)
      },
      set (val) {
        const date = new Date(val)
        this.setAnswerDateTo(+date)
      }
    },
    selectedOutNumPrefix: {
      get () {
        return this.selectedFilters.outNumPrefix
      },
      set (val) {
        this.setOutNumPrefix(val)
      }
    },
    selectedOutNum: {
      get () {
        return this.selectedFilters.outNum
      },
      set (val) {
        this.setOutNum(val)
      }
    },
    selectedAnswerDep: {
      get () {
        return this.selectedFilters.answerDep
      },
      set (val) {
        this.setAnswerDep(val)
      }
    },
    outDate: {
      get () {
        return dateConvert(this.selectedFilters.outDate)
      },
      set (val) {
        const date = val ? getFormatedDate(val) : ''
        this.setOutDate(date)
      }
    },
    types () {
      return this.getter('types', 'items')
    },
    states () {
      return this.getter('states', 'items')
    },
    extEmployees () {
      return this.getter('extCurrentPositions', 'items')
    },
    organisations () {
      return this.getter('organisations', 'items')
    },
    curPos () {
      return this.getter('currentPositions', 'items')
    },
    subdivisions () {
      return this.getter('subdivisions', 'items')
    },
    temas () {
      return this.getter('temas', 'items')
    },
    extOutgoings () {
      return this.getter('extOutgoings', 'items')
    },
    extIncomings () {
      return this.getter('extIncomings', 'items')
    },
    intIncomings () {
      return this.getter('intIncomings', 'items')
    },
    deps () {
      return this.getter('departments', 'items')
    },
    organisation () {
      return this.getter('organisations', 'indexed')
    },
    currentPosition () {
      return this.getter('currentPositions', 'indexed')
    },
    tema () {
      return this.getter('temas', 'indexed')
    },
    dep () {
      return this.getter('departments', 'indexed')
    },
    // ...mapState('docs', {
    //   types: 'types',
    //   states: 'states',
    //   extEmployees: 'extCurrentPositions',
    //   organisations: 'organisations',
    //   curPos: 'currentPositions',
    //   subdivisions: 'subdivisions',
    //   temas: 'temas',
    //   extOutgoings: 'extOutgoings',
    //   extIncomings: 'extIncomings',
    //   intIncomings: 'intIncomings'
    // }),
    // ...mapState('auth', {
    //   deps: 'deps'
    // }),
    ...mapGetters({
      // organisation: 'docs/getOrganisationById',
      // currentPosition: 'docs/getCurrentPositionById',
      // tema: 'docs/getTemasById',
      usersDep: 'auth/getUserDep',
      // dep: 'auth/getDepById',
      selectedDep: 'auth/getSelectDep'
    }),
    isDocs () {
      return this.selectedTab === '#extIncoming' ||
      this.selectedTab === '#extOutgoing' ||
      this.selectedTab === '#intIncoming' ||
      this.selectedTab === '#intOutgoing' ||
      this.selectedTab === '#internal'
    },
    isIncoming () {
      return this.selectedTab === '#extIncoming' ||
      this.selectedTab === '#intIncoming'
    },
    isOutgoing () {
      return this.selectedTab === '#extOutgoing' ||
      this.selectedTab === '#intOutgoing'
    },
    orgTitle () {
      if (this.selectedTab === '#extIncoming') {
        return 'Откуда'
      } else if (this.selectedTab === '#extOutgoing') {
        return 'Куда'
      } else {
        return ''
      }
    },
    fromToTitle () {
      if (this.selectedTab === '#intIncoming') {
        return 'Откуда'
      } else if (this.selectedTab === '#intOutgoing') {
        return 'Куда'
      } else {
        return ''
      }
    },
    filteredExtIncomings () {
      if (this.selectedFilters.answerOrg.length) {
        const filteredByOrg = this.extIncomings.filter((el) => {
          let found = false
          this.answerOrg.forEach((item) => {
            if (el.organisationsId.includes(item)) {
              found = true
            }
          })
          return found
        })
        return filteredByOrg.filter((el) => {
          const extDate = +(new Date(dateConvert(el.extDate)))
          const dateFrom = +(new Date(this.answerDateFrom))
          const dateTo = +(new Date(this.answerDateTo))
          return ((extDate >= dateFrom) && (extDate <= dateTo))
        })
      } else {
        return this.extIncomings.filter((el) => {
          const extDate = +(new Date(dateConvert(el.extDate)))
          const dateFrom = +(new Date(this.answerDateFrom))
          const dateTo = +(new Date(this.answerDateTo))
          return ((extDate >= dateFrom) && (extDate <= dateTo))
        })
      }
    }
  },

  watch: {
    async firstInit (val) {
      if (val) {
        // this.$nuxt.$loading.start()
        await this.$docs.updateAll()
        // this.$nuxt.$loading.finish()
      }
    }
  },
  mounted () {
    const _app = app()
    this.storage = _app.$docs.buffer
    this.firstInit = _app.$docs.firstInit.init
    // this.$nextTick(async () => {
    //   this.$nuxt.$loading.start()
    //   if (!_app.$docs.firstInit.init) { await _app.$docs.updateAll() }
    //   this.$nuxt.$loading.finish()
    // })
  },

  methods: {
    getter (ent, type) {
      if (!this.storage) { return [] }
      if (this.storage[ent].synchronization) { return [] }
      return this.storage[ent][type]
    },
    ...mapActions({
      closeRightDrawer: 'navInterface/closeRightDrawer',
      setDateFrom: 'navInterface/setDateFrom',
      setDateTo: 'navInterface/setDateTo',
      setOrganisation: 'navInterface/setOrganisation',
      setSelectState: 'navInterface/setSelectState',
      setPodpisants: 'navInterface/setPodpisants',
      setType: 'navInterface/setType',
      setNeedAnswer: 'navInterface/setNeedAnswer',
      setHasAnswer: 'navInterface/setHasAnswer',
      setTema: 'navInterface/setTema',
      setExecutants: 'navInterface/setExecutants',
      setDeps: 'navInterface/setDeps',
      setSubdivision: 'navInterface/setSubdivision',
      setIsAnswerOn: 'navInterface/setIsAnswerOn',
      setAddressees: 'navInterface/setAddressees',
      setAuthor: 'navInterface/setAuthor',
      setAnswerOrg: 'navInterface/setAnswerOrg',
      setAnswerDateFrom: 'navInterface/setAnswerDateFrom',
      setAnswerDateTo: 'navInterface/setAnswerDateTo',
      setOutNum: 'navInterface/setOutNum',
      setOutNumPrefix: 'navInterface/setOutNumPrefix',
      setOutDate: 'navInterface/setOutDate',
      setExecDeps: 'navInterface/setExecDeps',
      setAnswerDep: 'navInterface/setAnswerDep'
    }),
    formatDate (val) {
      return getFormatedDate(val)
    },
    setDefaultDateFrom () {
      const defaultDateFrom = new Date('2016-01-01')
      this.setDateFrom(+defaultDateFrom)
    },
    setDefaultDateTo () {
      const defaultDateTo = new Date()
      this.setDateTo(+defaultDateTo)
    }

  }
}
</script>
