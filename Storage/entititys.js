import * as CurrentPositions from './ent-methods/current-positions'
import * as ExtCurrentPositions from './ent-methods/ext-current-positions'
import * as Employees from './ent-methods/employees'
import * as ExtEmployees from './ent-methods/ext-employees'
import * as IntIncomings from './ent-methods/int-incomings'
import * as ExtIncomings from './ent-methods/ext-incomings'
import * as ExtOutgoings from './ent-methods/ext-outgoings'
import * as IntOutgoings from './ent-methods/int-outgoings'
import * as Internals from './ent-methods/internals'
import * as Contracts from './ent-methods/contracts'
import * as Resolutions from './ent-methods/resolutions'
import * as States from './ent-methods/states'
import * as Subdivisions from './ent-methods/subdivisions'
import * as Temas from './ent-methods/temas'
import * as Departments from './ent-methods/departments'
import * as Organisations from './ent-methods/organisations'
import * as Types from './ent-methods/types'
import * as Positions from './ent-methods/positions'
import * as IncNumbers from './ent-methods/inc-numbers'
import * as IntIncNumbers from './ent-methods/int-inc-numbers'
import * as InternalIncNumbers from './ent-methods/internal-inc-numbers'
import * as ExtIncStates from './ent-methods/ext-inc-states'
import * as IntIncStates from './ent-methods/int-inc-states'
import * as InternalIncStates from './ent-methods/internal-inc-states'
import * as ExtIncFiles from './ent-methods/ext-inc-files'
import * as ExtOutFiles from './ent-methods/ext-out-files'
import * as IntIncFiles from './ent-methods/int-inc-files'
import * as IntOutFiles from './ent-methods/int-out-files'
import * as InternalFiles from './ent-methods/internal-files'

// сущности размещены в порядке получения с сервера

const entititys = [
  { entitity: 'config', storageName: 'Config', type: 'service' },
  { entitity: 'fetchTime', storageName: 'LastFetchTime', type: 'service' },
  // --------------------------------------------------------------------------------------------
  // --------------------- Справочные сущности --------------------------------------------------
  {
    entitity: 'contracts',
    name: 'Контрактов',
    storageName: 'Contracts',
    type: 'Docs',
    form: Contracts.formContracts,
    _editItem: Contracts.editContract,
    addItem: Contracts.addContracts,
    deleteItem: Contracts.deleteContracts,
    editItem: Contracts.editContracts,
    NullClass: Contracts.NullContract
  },
  {
    entitity: 'temas',
    name: 'Тем',
    storageName: 'Temas',
    type: 'Docs',
    form: Temas.formTemas,
    _editItem: Temas.editTema,
    addItem: Temas.addTema,
    deleteItem: Temas.deleteTemas,
    editItem: Temas.editTemas,
    NullClass: Temas.NullTema
  },
  {
    entitity: 'organisations',
    name: 'Организаций',
    storageName: 'Organisations',
    type: 'Docs',
    form: Organisations.formOrganisations,
    _editItem: Organisations.editOrganisation,
    addItem: Organisations.addOrganisation,
    deleteItem: Organisations.deleteOrganisations,
    editItem: Organisations.editOrganisations,
    NullClass: Organisations.NullOrganisation
  },
  {
    entitity: 'states',
    name: 'Состояний',
    storageName: 'States',
    type: 'Docs',
    form: States.formStates,
    _editItem: States.editState,
    addItem: States.addState,
    deleteItem: States.deleteStates,
    editItem: States.editStates,
    NullClass: States.NullState
  },
  {
    entitity: 'types',
    name: 'Типов документов',
    storageName: 'Types',
    type: 'Docs',
    form: Types.formTypes,
    _editItem: Types.editType,
    addItem: Types.addType,
    deleteItem: Types.deleteTypes,
    editItem: Types.editTypes,
    NullClass: Types.NullType
  },
  {
    entitity: 'positions',
    name: 'Должностей',
    storageName: 'Positions',
    type: 'Docs',
    form: Positions.formPositions,
    _editItem: Positions.editPosition,
    addItem: Positions.addPosition,
    deleteItem: Positions.deletePositions,
    editItem: Positions.editPositions,
    NullClass: Positions.NullPosition
  },
  {
    entitity: 'departments',
    name: 'Отделов',
    storageName: 'Departments',
    type: 'Docs',
    form: Departments.formDepartments,
    _editItem: Departments.editDepartment,
    addItem: Departments.addDepartment,
    deleteItem: Departments.deleteDepartments,
    editItem: Departments.editDepartments,
    NullClass: Departments.NullDepartment
  },
  {
    entitity: 'subdivisions',
    name: 'Подразделений',
    storageName: 'Subdivisions',
    type: 'Docs',
    form: Subdivisions.formSubdivisions,
    _editItem: Subdivisions.editSubdivision,
    addItem: Subdivisions.addSubdivision,
    deleteItem: Subdivisions.deleteSubdivisions,
    editItem: Subdivisions.editSubdivisions,
    NullClass: Subdivisions.NullSubdivision
  },
  // --------------------------------------------------------------------------------------------
  // --------------------------------- Должности ------------------------------------------------
  {
    entitity: 'currentPositions',
    name: 'Штатных единиц',
    storageName: 'CurrentPositions',
    type: 'Docs',
    form: CurrentPositions.formCurrentPositions,
    _editItem: CurrentPositions.editCurrentPosition,
    addItem: CurrentPositions.addCurrentPosition,
    deleteItem: CurrentPositions.deleteCurrentPositions,
    editItem: CurrentPositions.editCurrentPositions,
    NullClass: CurrentPositions.NullCurrentPosition
  },
  {
    entitity: 'extCurrentPositions',
    name: 'Внешних штатных единиц',
    storageName: 'ExtCurrentPositions',
    type: 'Docs',
    form: ExtCurrentPositions.formExtCurrentPositions,
    _editItem: ExtCurrentPositions.editExtCurrentPosition,
    addItem: ExtCurrentPositions.addExtCurrentPosition,
    deleteItem: ExtCurrentPositions.deleteExtCurrentPositions,
    editItem: ExtCurrentPositions.editExtCurrentPositions,
    NullClass: ExtCurrentPositions.NullExtCurrentPosition
  },
  // --------------------------------------------------------------------------------------------
  // ----------------------------------- Служащие -----------------------------------------------
  {
    entitity: 'employees',
    name: 'Работников',
    storageName: 'Employees',
    type: 'Docs',
    form: Employees.formEmployees,
    _editItem: Employees.editEmployee,
    addItem: Employees.addEmployee,
    deleteItem: Employees.deleteEmployees,
    editItem: Employees.editEmployees,
    NullClass: Employees.NullEmployee
  },
  {
    entitity: 'extEmployees',
    name: 'Внешних работников',
    storageName: 'ExtEmployees',
    type: 'Docs',
    form: ExtEmployees.formExtEmployees,
    _editItem: ExtEmployees.editExtEmployee,
    addItem: ExtEmployees.addExtEmployee,
    deleteItem: ExtEmployees.deleteExtEmployees,
    editItem: ExtEmployees.editExtEmployees,
    NullClass: ExtEmployees.NullExtEmployee
  },
  // --------------------------------------------------------------------------------------------
  {
    entitity: 'extIncomings',
    name: 'Внешних входящих документов',
    storageName: 'ExtIncomings',
    type: 'Docs',
    form: ExtIncomings.formExtIncomings,
    sort: ExtIncomings.sortExtIncomings,
    _editItem: ExtIncomings.editExtIncoming,
    addItem: ExtIncomings.addExtIncoming,
    deleteItem: ExtIncomings.deleteExtIncomings,
    editItem: ExtIncomings.editExtIncomings,
    NullClass: ExtIncomings.NullExtIncoming
  },
  {
    entitity: 'extOutgoings',
    name: 'Внешних исходящих документов',
    storageName: 'ExtOutgoings',
    type: 'Docs',
    form: ExtOutgoings.formExtOutgoings,
    sort: ExtOutgoings.sortExtOutgoings,
    _editItem: ExtOutgoings.editExtOutgoing,
    addItem: ExtOutgoings.addExtOutgoing,
    deleteItem: ExtOutgoings.deleteExtOutgoings,
    editItem: ExtOutgoings.editExtOutgoings,
    NullClass: ExtOutgoings.NullExtOutgoing
  },
  {
    entitity: 'intIncomings',
    name: 'Внутренних входящих документов',
    storageName: 'IntIncomings',
    type: 'Docs',
    form: IntIncomings.formIntIncomings,
    sort: IntIncomings.sortIntIncomings,
    _editItem: IntIncomings.editIntIncoming,
    addItem: IntIncomings.addIntIncoming,
    deleteItem: IntIncomings.deleteIntIncomings,
    editItem: IntIncomings.editIntIncomings,
    NullClass: IntIncomings.NullIntIncoming
  },
  {
    entitity: 'intOutgoings',
    name: 'Внутренних исходящих документов',
    storageName: 'IntOutgoings',
    type: 'Docs',
    form: IntOutgoings.formIntOutgoings,
    sort: IntOutgoings.sortIntOutgoings,
    _editItem: IntOutgoings.editIntOutgoing,
    addItem: IntOutgoings.addIntOutgoing,
    deleteItem: IntOutgoings.deleteIntOutgoings,
    editItem: IntOutgoings.editIntOutgoings,
    NullClass: IntOutgoings.NullIntOutgoing
  },
  {
    entitity: 'internals',
    name: 'Внутренних прочих документов',
    storageName: 'Internals',
    type: 'Docs',
    form: Internals.formInternals,
    sort: Internals.sortInternals,
    _editItem: Internals.editInternal,
    addItem: Internals.addInternal,
    deleteItem: Internals.deleteInternals,
    editItem: Internals.editInternals,
    NullClass: Internals.NullInternal
  },
  // --------------------------------------------------------------------------------------------
  {
    entitity: 'incNumbers',
    name: 'Входящих номеров на внешние документы',
    storageName: 'IncNumbers',
    type: 'Docs',
    form: IncNumbers.formIncNumbers,
    _editItem: IncNumbers.editIncNumber,
    addItem: IncNumbers.addIncNumber,
    deleteItem: IncNumbers.deleteIncNumbers,
    editItem: IncNumbers.editIncNumbers,
    NullClass: IncNumbers.NullIncNumber
  },
  {
    entitity: 'intIncNumbers',
    name: 'Входящих номеров на внутренние документы',
    storageName: 'IntIncNumbers',
    type: 'Docs',
    form: IntIncNumbers.formIntIncNumbers,
    _editItem: IntIncNumbers.editIntIncNumber,
    addItem: IntIncNumbers.addIntIncNumber,
    deleteItem: IntIncNumbers.deleteIntIncNumbers,
    editItem: IntIncNumbers.editIntIncNumbers,
    NullClass: IntIncNumbers.NullIntIncNumber
  },
  {
    entitity: 'internalIncNumbers',
    name: 'Входящих номеров на внутренние прочие документы',
    storageName: 'InternalIncNumbers',
    type: 'Docs',
    form: InternalIncNumbers.formInternalIncNumbers,
    _editItem: InternalIncNumbers.editInternalIncNumber,
    addItem: InternalIncNumbers.addInternalIncNumber,
    deleteItem: InternalIncNumbers.deleteInternalIncNumbers,
    editItem: InternalIncNumbers.editInternalIncNumbers,
    NullClass: InternalIncNumbers.NullInternalIncNumber
  },
  // --------------------------------------------------------------------------------------------
  {
    entitity: 'extIncFiles',
    name: 'Файлов внешних входящих',
    storageName: 'ExtIncFiles',
    type: 'Docs',
    form: ExtIncFiles.formExtIncFiles,
    _editItem: ExtIncFiles.editExtIncFile,
    addItem: ExtIncFiles.addExtIncFile,
    deleteItem: ExtIncFiles.deleteExtIncFiles,
    editItem: ExtIncFiles.editExtIncFiles,
    NullClass: ExtIncFiles.NullExtIncFile
  },
  {
    entitity: 'extOutFiles',
    name: 'Файлов внешних исходящих',
    storageName: 'ExtOutFiles',
    type: 'Docs',
    form: ExtOutFiles.formExtOutFiles,
    _editItem: ExtOutFiles.editExtOutFile,
    addItem: ExtOutFiles.addExtOutFile,
    deleteItem: ExtOutFiles.deleteExtOutFiles,
    editItem: ExtOutFiles.editExtOutFiles,
    NullClass: ExtOutFiles.NullExtOutFile
  },
  {
    entitity: 'intIncFiles',
    name: 'Файлов внутренних входящих',
    storageName: 'IntIncFiles',
    type: 'Docs',
    form: IntIncFiles.formIntIncFiles,
    _editItem: IntIncFiles.editIntIncFile,
    addItem: IntIncFiles.addIntIncFile,
    deleteItem: IntIncFiles.deleteIntIncFiles,
    editItem: IntIncFiles.editIntIncFiles,
    NullClass: IntIncFiles.NullIntIncFile
  },
  {
    entitity: 'intOutFiles',
    name: 'Файлов внутренних исходящих',
    storageName: 'IntOutFiles',
    type: 'Docs',
    form: IntOutFiles.formIntOutFiles,
    _editItem: IntOutFiles.editIntOutFile,
    addItem: IntOutFiles.addIntOutFile,
    deleteItem: IntOutFiles.deleteIntOutFiles,
    editItem: IntOutFiles.editIntOutFiles,
    NullClass: IntOutFiles.NullIntOutFile
  },
  {
    entitity: 'internalFiles',
    name: 'Файлов внутренних прочих',
    storageName: 'InternalFiles',
    type: 'Docs',
    form: InternalFiles.formInternalFiles,
    _editItem: InternalFiles.editInternalFile,
    addItem: InternalFiles.addInternalFile,
    deleteItem: InternalFiles.deleteInternalFiles,
    editItem: InternalFiles.editInternalFiles,
    NullClass: InternalFiles.NullInternalFile
  },
  // --------------------------------------------------------------------------------------------
  {
    entitity: 'extIncStates',
    name: 'Состояний внешних входящих',
    storageName: 'ExtIncStates',
    type: 'Docs',
    form: ExtIncStates.formExtIncStates,
    _editItem: ExtIncStates.editExtIncState,
    addItem: ExtIncStates.addExtIncState,
    deleteItem: ExtIncStates.deleteExtIncStates,
    editItem: ExtIncStates.editExtIncStates,
    NullClass: ExtIncStates.NullExtIncState
  },
  {
    entitity: 'intIncStates',
    name: 'Состояний внутренних входящих',
    storageName: 'IntIncStates',
    type: 'Docs',
    form: IntIncStates.formIntIncStates,
    _editItem: IntIncStates.editIntIncState,
    addItem: IntIncStates.addIntIncState,
    deleteItem: IntIncStates.deleteIntIncStates,
    editItem: IntIncStates.editIntIncStates,
    NullClass: IntIncStates.NullIntIncState
  },
  {
    entitity: 'internalIncStates',
    name: 'Состояний внутренних прочих входящих',
    storageName: 'InternalIncStates',
    type: 'Docs',
    form: InternalIncStates.formInternalIncStates,
    _editItem: InternalIncStates.editInternalIncState,
    addItem: InternalIncStates.addInternalIncState,
    deleteItem: InternalIncStates.deleteInternalIncStates,
    editItem: InternalIncStates.editInternalIncStates,
    NullClass: InternalIncStates.NullInternalIncState
  },
  // --------------------------------------------------------------------------------------------
  // --------------------------------------------------------------------------------------------
  {
    entitity: 'resolutions',
    name: 'Резолюций',
    storageName: 'Resolutions',
    type: 'Docs',
    form: Resolutions.formResolutions,
    _editItem: Resolutions.editResolution,
    addItem: Resolutions.addResolution,
    deleteItem: Resolutions.deleteResolutions,
    editItem: Resolutions.editResolutions,
    NullClass: Resolutions.NullResolution
  }

]

export default entititys
