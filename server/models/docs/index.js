const Sequelize = require('sequelize')
// require('sequelize-hierarchy')(Sequelize)
const dbDocs = require('../../db/docs')
const { matrix } = require('../../graphql/resolver/fetch-time/entity')
const fetchTime = require('../../graphql/resolver/fetch-time/module')
const fetchTimeArray = fetchTime.getInstance()
// ----------------------------------------------------------------------------------
// Подключение моделей
const OrganisationModel = require('./docs-parts/organisation')
const ExtEmployeeModel = require('./docs-parts/ext-employee')
const ExtIncomingModel = require('./docs-parts/ext-incoming')
const PositionModel = require('./docs-parts/position')
const EmployeeModel = require('./docs-parts/employee')
const DepartmentModel = require('./docs-parts/department')
const ExtOutgoingModel = require('./docs-parts/ext-outgoing')
const ExtIncFileModel = require('./docs-parts/ext-inc-file')
const ExtOutFileModel = require('./docs-parts/ext-out-file')
const IntIncFileModel = require('./docs-parts/int-inc-file')
const IntOutFileModel = require('./docs-parts/int-out-file')
const InternalFileModel = require('./docs-parts/internal-file')
const IntIncomingModel = require('./docs-parts/int-incoming')
const IntOutgoingModel = require('./docs-parts/int-outgoing')
const ContractModel = require('./docs-parts/contract')
const TemaModel = require('./docs-parts/tema')
const ResolutionModel = require('./docs-parts/resolution')
const TypeModel = require('./docs-parts/type')
const InternalModel = require('./docs-parts/internal')
const StateModel = require('./docs-parts/state')
const IncomingNumberModel = require('./docs-parts/incoming-number')
const IntIncomingNumberModel = require('./docs-parts/int-incoming-number')
const InternalIncomingNumberModel = require('./docs-parts/internal-incoming-number')
const ExtIncStateModel = require('./docs-parts/ext-inc-state')
const IntIncStateModel = require('./docs-parts/int-inc-state')
const InternalIncStateModel = require('./docs-parts/internal-inc-state')
const SubdivisionModel = require('./docs-parts/subdivision')
const CurrentPositionModel = require('./docs-parts/current-position')
const ExtCurrentPositionModel = require('./docs-parts/ext-current-position')
const ExtIncNoteModel = require('./docs-parts/ext-inc-note')
const IntIncNoteModel = require('./docs-parts/int-inc-note')
const InternalNoteModel = require('./docs-parts/internal-note')
// ----------------------------------------------------------------------------------
// Подключение вспомогательных моделей
const ExtDocModel = require('./docs-parts/service/ext-doc')
const ExtOutDocModel = require('./docs-parts/service/ext-out-doc')
const ExtOutEmpModel = require('./docs-parts/service/ext-out-emp')
const IntDocModel = require('./docs-parts/service/int-doc')
const ExtAnswerModel = require('./docs-parts/service/ext-answer')
const IntOutDocModel = require('./docs-parts/service/int-out-doc')
const IntAnswerModel = require('./docs-parts/service/int-answer')
const ResEmpModel = require('./docs-parts/service/res-emp')
const DocIntModel = require('./docs-parts/service/doc-int')
const IntEmpModel = require('./docs-parts/service/int-emp')
const IntTemaModel = require('./docs-parts/service/int-tema')
const ExtIncTemaModel = require('./docs-parts/service/ext-inc-tema')
const ExtIncDepModel = require('./docs-parts/service/ext-inc-dep')
const ExtOutTemaModel = require('./docs-parts/service/ext-out-tema')
const IntIncEmpModel = require('./docs-parts/service/int-inc-emp')
const IntIncTemaModel = require('./docs-parts/service/int-inc-tema')
const IntOutEmpModel = require('./docs-parts/service/int-out-emp')
const IntOutTemaModel = require('./docs-parts/service/int-out-tema')
const SubEmplModel = require('./docs-parts/service/sub-empl')
const IntIncAuthModel = require('./docs-parts/service/int-inc-auth')

// ----------------------------------------------------------------------------------
// Регистрация моделей
const Organisation = OrganisationModel(dbDocs, Sequelize)
const ExtEmployee = ExtEmployeeModel(dbDocs, Sequelize)
const ExtIncoming = ExtIncomingModel(dbDocs, Sequelize)
const Position = PositionModel(dbDocs, Sequelize)
const Employee = EmployeeModel(dbDocs, Sequelize)
const Department = DepartmentModel(dbDocs, Sequelize)
const ExtOutgoing = ExtOutgoingModel(dbDocs, Sequelize)
const ExtIncFile = ExtIncFileModel(dbDocs, Sequelize)
const ExtOutFile = ExtOutFileModel(dbDocs, Sequelize)
const IntIncFile = IntIncFileModel(dbDocs, Sequelize)
const IntOutFile = IntOutFileModel(dbDocs, Sequelize)
const InternalFile = InternalFileModel(dbDocs, Sequelize)
const IntIncoming = IntIncomingModel(dbDocs, Sequelize)
const IntOutgoing = IntOutgoingModel(dbDocs, Sequelize)
const Contract = ContractModel(dbDocs, Sequelize)
const Tema = TemaModel(dbDocs, Sequelize)
const Resolution = ResolutionModel(dbDocs, Sequelize)
const Type = TypeModel(dbDocs, Sequelize)
const Internal = InternalModel(dbDocs, Sequelize)
const State = StateModel(dbDocs, Sequelize)
const IncomingNumber = IncomingNumberModel(dbDocs, Sequelize)
const IntIncomingNumber = IntIncomingNumberModel(dbDocs, Sequelize)
const InternalIncomingNumber = InternalIncomingNumberModel(dbDocs, Sequelize)
const ExtIncState = ExtIncStateModel(dbDocs, Sequelize)
const IntIncState = IntIncStateModel(dbDocs, Sequelize)
const InternalIncState = InternalIncStateModel(dbDocs, Sequelize)
const Subdivision = SubdivisionModel(dbDocs, Sequelize)
const CurrentPosition = CurrentPositionModel(dbDocs, Sequelize)
const ExtCurrentPosition = ExtCurrentPositionModel(dbDocs, Sequelize)
const ExtIncNote = ExtIncNoteModel(dbDocs, Sequelize)
const IntIncNote = IntIncNoteModel(dbDocs, Sequelize)
const InternalNote = InternalNoteModel(dbDocs, Sequelize)
// ----------------------------------------------------------------------------------
// Регистрация вспомогательных моделей
const ExtDoc = ExtDocModel(dbDocs, Sequelize)
const ExtOutDoc = ExtOutDocModel(dbDocs, Sequelize)
const ExtOutEmp = ExtOutEmpModel(dbDocs, Sequelize)
const IntDoc = IntDocModel(dbDocs, Sequelize)
const ExtAnswer = ExtAnswerModel(dbDocs, Sequelize)
const IntOutDoc = IntOutDocModel(dbDocs, Sequelize)
const IntAnswer = IntAnswerModel(dbDocs, Sequelize)
const ResEmp = ResEmpModel(dbDocs, Sequelize)
const DocInt = DocIntModel(dbDocs, Sequelize)
const IntEmp = IntEmpModel(dbDocs, Sequelize)
const IntTema = IntTemaModel(dbDocs, Sequelize)
const ExtIncTema = ExtIncTemaModel(dbDocs, Sequelize)
const ExtIncDep = ExtIncDepModel(dbDocs, Sequelize)
const ExtOutTema = ExtOutTemaModel(dbDocs, Sequelize)
const IntIncEmp = IntIncEmpModel(dbDocs, Sequelize)
const IntIncTema = IntIncTemaModel(dbDocs, Sequelize)
const IntOutEmp = IntOutEmpModel(dbDocs, Sequelize)
const IntOutTema = IntOutTemaModel(dbDocs, Sequelize)
const SubEmpl = SubEmplModel(dbDocs, Sequelize)
const IntIncAuth = IntIncAuthModel(dbDocs, Sequelize)
// ----------------------------------------------------------------------------------
// Регистрация связей моделей
// Служащий работает в конкретной организации:
// ExtEmployee.belongsTo(Organisation)
// // В организации много служащих
// Organisation.hasMany(ExtEmployee)
// ----------------------------------------------------------------------------------
// Резолюция может относится к нескольким служащим
Resolution.belongsToMany(CurrentPosition, {
  through: ResEmp,
  as: 'executant'
})
// Каждому служащему может относится несколько резолюций
CurrentPosition.belongsToMany(Resolution, { through: ResEmp })
// Автором резолючии может быть один служащий
Resolution.belongsTo(CurrentPosition, { as: 'author' })

// ----------------------------------------------------------------------------------
// !!! Внешний входящий документ !!!
// Внешний входящий документ подписан одним или несколькими служащими
ExtIncoming.belongsToMany(ExtCurrentPosition, { through: ExtDoc })
// Служащий может написать несколько внешних документов
ExtCurrentPosition.belongsToMany(ExtIncoming, { through: ExtDoc })
// Внешний входящий документ может иметь несколько файлов
ExtIncoming.hasMany(ExtIncFile)
// Файл принадлежит одному документу
ExtIncFile.belongsTo(ExtIncoming)
// Внешний входящий документ может иметь несколько тем
ExtIncoming.belongsToMany(Tema, { through: ExtIncTema })
// Внешний входящий документ может иметь несколько резолюций
ExtIncoming.hasMany(Resolution)
// Внешний входящий документ принадлежит к одному из типов
ExtIncoming.belongsTo(Type)
// Внешний входящий документ может иметь одно состояние
// ExtIncoming.belongsTo(State)
// Внешний входящий документ может иметь несколько ответов
ExtIncoming.belongsToMany(ExtOutgoing, {
  through: ExtAnswer
})
// Внешний входящий документ может иметь несколько входящих номеров для различных отделов
ExtIncoming.hasMany(IncomingNumber)

// Внешний входящий документ может иметь несколько примечаний
ExtIncoming.hasMany(ExtIncNote)
// Примечание принадлежит к одному внешнему входящему документу
ExtIncNote.belongsTo(ExtIncoming)
// В отделе может быть несколько примечаний
Department.hasMany(ExtIncNote)
// Примечание принадлежит к одному отделу
ExtIncNote.belongsTo(Department)
// ----------------------------------------------------------------------------------
// Входящий номер принадлежит одному внешнему входящему документу
IncomingNumber.belongsTo(ExtIncoming)
// Входящий номер принадлежит одному отделу
IncomingNumber.belongsTo(Department)
// В отделе может быть несколько входящих номеров
Department.hasMany(IncomingNumber)
// ----------------------------------------------------------------------------------
// Для каждого отдела своё состояние внешнего входящего документа
ExtIncState.belongsTo(Department)
// В отделе может быть несколько состояний внешних входящих документов
Department.hasMany(ExtIncState)
// Каждое состояние внешнего входящего документа принадлежит одному документу
ExtIncState.belongsTo(ExtIncoming)
// Для каждого внешнего входящего документа может быть несколько состояний
ExtIncoming.hasMany(ExtIncState)
// Каждое состояние внешнего входящего документа принадлежит одному состоянию
ExtIncState.belongsTo(State)
// Для каждого состояния может быть несколько состояний внешнего входящего документа
State.hasMany(ExtIncState)
// ----------------------------------------------------------------------------------

// ----------------------------------------------------------------------------------
// Внешний входящий документ может быть направлен нескольком отделам
ExtIncoming.belongsToMany(CurrentPosition, {
  through: ExtIncDep,
  as: 'executant'
})
// В отдел можут придти несколько внешних входящих документов
CurrentPosition.belongsToMany(ExtIncoming, { through: ExtIncDep })
// Отдел (подразделение) может подчиняться какому-либо вышестоящему подразделению
Department.belongsTo(Department, {
  // foreignKey: 'parentDepartmentId',
  // target: 'id'
  as: 'parentDepartment'
})

// ----------------------------------------------------------------------------------
// !!! Внешний исходящий документ !!!
// Внешний исходящий документ может быть подписан несколькими служащими
ExtOutgoing.belongsToMany(CurrentPosition, {
  through: ExtOutDoc,
  as: 'podpisant'
})
// Служащий может подписать несколько внешних исходящих документов
CurrentPosition.belongsToMany(ExtOutgoing, {
  through: ExtOutDoc
})

ExtOutgoing.belongsTo(CurrentPosition, {
  as: 'author',
  foreignKey: 'authorId'
})
// Внешний исходящий документ может являться ответом на несколько внешних входящих документов
ExtOutgoing.belongsToMany(ExtIncoming, {
  through: ExtAnswer,
  as: 'answer',
  foreignKey: 'answerId'
})
ExtIncoming.belongsToMany(ExtOutgoing, { through: ExtAnswer })
// Внешний исходящий документ может иметь несколько файлов
ExtOutgoing.hasMany(ExtOutFile)
ExtOutFile.belongsTo(ExtOutgoing)
// Внешний исходящий документ может иметь несколько тем
ExtOutgoing.belongsToMany(Tema, { through: ExtOutTema })
// Внешний исходящий документ принадлежит к одному из типов
ExtOutgoing.belongsTo(Type)
// Внешний исходящий документ может иметь одно состояние
ExtOutgoing.belongsTo(State)
// Внешний исходящий документ может быть адресован одному или несколькими служащими
ExtOutgoing.belongsToMany(ExtCurrentPosition, { through: ExtOutEmp })
// Служащим может быть адресовано несколько внешних исходящих документов
ExtCurrentPosition.belongsToMany(ExtOutgoing, { through: ExtOutEmp })

// ----------------------------------------------------------------------------------
// !!! Внутренний входящий документ !!!
// Внутренний входящий документ может быть направлен нескольким служащим
IntIncoming.belongsToMany(CurrentPosition, {
  through: IntDoc,
  as: 'addressee'
})
// Служащему может прийти несколько внутренних входящих документов
CurrentPosition.belongsToMany(IntIncoming, { through: IntDoc })
// Внутренний входящий документ может иметь несколько файлов
IntIncoming.hasMany(IntIncFile)
// Внутренний входящий документ может подписать несколько служащих
IntIncoming.belongsToMany(CurrentPosition, {
  through: IntIncEmp,
  as: 'podpisant'
})
CurrentPosition.belongsToMany(IntIncoming, { through: IntIncEmp })
IntIncoming.belongsToMany(CurrentPosition, {
  through: IntIncAuth,
  as: 'author'
})
CurrentPosition.belongsToMany(IntIncoming, { through: IntIncAuth })

// Служащие могут подписать несколько внутренних входящих документов
CurrentPosition.belongsToMany(IntIncoming, { through: IntIncEmp })
// Employee.belongsToMany(IntIncoming, { through: IntIncEmp })

// Внутренний входящий документ может являться ответом на несколько внутренних исходящих документов
IntIncoming.belongsToMany(IntOutgoing, { through: IntAnswer })
// Внутренний входящий документ может иметь несколько файлов
IntIncFile.belongsTo(IntIncoming)
// Внутренний входящий документ может иметь несколько тем
IntIncoming.belongsToMany(Tema, { through: IntIncTema })
// Внутренний входящий документ может иметь несколько резолюций
IntIncoming.hasMany(Resolution)
// Внутренний входящий документ принадлежит к одному из типов
IntIncoming.belongsTo(Type)
// // Внутренний входящий документ может иметь одно состояние
// IntIncoming.belongsTo(State)
// Внутренний входящий документ может являться исходящим в другом отделе
IntIncoming.belongsTo(IntOutgoing, { as: 'source' })

// Внутренний входящий документ может иметь несколько примечаний
IntIncoming.hasMany(IntIncNote)
// Примечание принадлежит к одному внутреннему входящему документу
IntIncNote.belongsTo(IntIncoming)
// В отделе может быть несколько примечаний
Department.hasMany(IntIncNote)
// Примечание принадлежит к одному отделу
IntIncNote.belongsTo(Department)

// ----------------------------------------------------------------------------------
// Входящий номер принадлежит одному внутреннему входящему документу
IntIncomingNumber.belongsTo(IntIncoming)
IntIncoming.hasMany(IntIncomingNumber)
// Входящий номер принадлежит одному отделу
IntIncomingNumber.belongsTo(Department)
// В отделе может быть несколько входящих номеров
Department.hasMany(IntIncomingNumber)
// ----------------------------------------------------------------------------------
// Для каждого отдела своё состояние внутреннего входящего документа
IntIncState.belongsTo(Department)
// В отделе может быть несколько состояний внутренних входящих документов
Department.hasMany(IntIncState)
// Каждое состояние внутреннего входящего документа принадлежит одному документу
IntIncState.belongsTo(IntIncoming)
// Для каждого внутреннего входящего документа может быть несколько состояний
IntIncoming.hasMany(IntIncState)
// Каждое состояние внутреннего входящего документа принадлежит одному состоянию
IntIncState.belongsTo(State)
// Для каждого состояния может быть несколько состояний внутреннего входящего документа
State.hasMany(IntIncState)
// ----------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------
// !!! Внутренний исходящий документ !!!
// Внутренний исходящий документ может быть направлен нескольким служащим
IntOutgoing.belongsToMany(CurrentPosition, {
  through: IntOutDoc,
  as: 'addressee'
})
// От служащего могут уйти несколько внутренних исходящих документов
CurrentPosition.belongsToMany(IntOutgoing, { through: IntOutDoc })
// Внутренний исходящий документ может подписать несколько служащих
IntOutgoing.belongsToMany(CurrentPosition, {
  through: IntOutEmp,
  as: 'podpisant'
})
// Служащие могут подписать несколько внутренних исходящих документов
CurrentPosition.belongsToMany(IntOutgoing, { through: IntOutEmp })
// Employee.belongsToMany(IntOutgoing, { through: IntOutEmp })
// У документа есть один исполнитель
IntOutgoing.belongsTo(CurrentPosition, { as: 'author' })
// Один исполнитель может быть автором нескольких документов
CurrentPosition.hasMany(IntOutgoing)
// Внутренний исходящий документ может являться ответом на несколько внутренних входящих документов
IntOutgoing.belongsToMany(IntIncoming, {
  through: IntAnswer,
  as: 'answer',
  foreignKey: 'answerId'
})
// Внутренний исходящий документ может иметь несколько файлов
IntOutgoing.hasMany(IntOutFile)
IntOutFile.belongsTo(IntOutgoing)
// Внутренний исходящий документ может иметь несколько тем
IntOutgoing.belongsToMany(Tema, { through: IntOutTema })
// Внутренний исходящий документ принадлежит к одному из типов
IntOutgoing.belongsTo(Type)
// Внутренний исходящий документ может иметь одно состояние
IntOutgoing.belongsTo(State)
// Внутренний исходящий документ может являться входящими документами в других отделах
IntOutgoing.hasMany(IntIncoming)

// ----------------------------------------------------------------------------------
// Каждый контракт может иметь несколько тем
Contract.hasMany(Tema)
// Каждая тема принадлежит одному из контракту
Tema.belongsTo(Contract)

// ----------------------------------------------------------------------------------
// !!! Внутренний документ !!!
// Внутренний документ может быть направлен в несколько отделов
Internal.belongsToMany(CurrentPosition, {
  through: DocInt,
  as: 'addressee'
})
// Из отдела могут уйти несколько внутренних документов
CurrentPosition.belongsToMany(Internal, { through: DocInt })
// Внутренний  документ может подписать несколько служащих
Internal.belongsToMany(CurrentPosition, {
  through: IntEmp,
  as: 'podpisant',
  foreignKey: 'podpisantId'
})
// Внутренний  документ может иметь одного автора
Internal.belongsTo(CurrentPosition, { as: 'author' })
CurrentPosition.hasMany(Internal)
// Служащие могут подписать несколько внутренних документов
CurrentPosition.belongsToMany(Internal, { through: IntEmp })
// Внутренний  документ может иметь несколько тем
Internal.belongsToMany(Tema, { through: IntTema })
// Внутренний документ принадлежит к одному из типов
Internal.belongsTo(Type)
// Внутренний документ может иметь одно состояние
Internal.belongsTo(State)
// Внутренний  документ может иметь несколько резолюций
Internal.hasMany(Resolution)
// Внутренний документ может иметь несколько файлов
Internal.hasMany(InternalFile)
InternalFile.belongsTo(Internal)

// Внутренний документ может иметь несколько примечаний
Internal.hasMany(InternalNote)
// Примечание принадлежит к одному внутреннему документу
InternalNote.belongsTo(Internal)
// В отделе может быть несколько примечаний
Department.hasMany(InternalNote)
// Примечание принадлежит к одному отделу
InternalNote.belongsTo(Department)
// ----------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------
// Входящий номер принадлежит одному внутреннему входящему документу
InternalIncomingNumber.belongsTo(Internal)
Internal.hasMany(InternalIncomingNumber)
// Входящий номер принадлежит одному отделу
InternalIncomingNumber.belongsTo(Department)
// В отделе может быть несколько входящих номеров
Department.hasMany(InternalIncomingNumber)
// ----------------------------------------------------------------------------------
// Для каждого отдела своё состояние внутреннего входящего документа
InternalIncState.belongsTo(Department)
// В отделе может быть несколько состояний внутренних входящих документов
Department.hasMany(InternalIncState)
// Каждое состояние внутреннего входящего документа принадлежит одному документу
InternalIncState.belongsTo(Internal)
// Для каждого внутреннего входящего документа может быть несколько состояний
Internal.hasMany(InternalIncState)
// Каждое состояние внутреннего входящего документа принадлежит одному состоянию
InternalIncState.belongsTo(State)
// Для каждого состояния может быть несколько состояний внутреннего входящего документа
State.hasMany(InternalIncState)
// ----------------------------------------------------------------------------------

Resolution.belongsTo(Internal)
Resolution.belongsTo(ExtIncoming)
Resolution.belongsTo(IntIncoming)
// ----------------------------------------------------------------------------------
// В каком-то одном состоянии может находится несколько документов
// State.hasMany(ExtIncoming)
State.hasMany(IntIncoming)
State.hasMany(ExtOutgoing)
State.hasMany(IntOutgoing)
// У состояния может быть предшествующее состояние
State.belongsTo(State, { as: 'parentState' })

// ----------------------------------------------------------------------------------
Tema.belongsToMany(ExtIncoming, { through: ExtIncTema })
Tema.belongsToMany(ExtOutgoing, { through: ExtOutTema })
Tema.belongsToMany(IntOutgoing, { through: IntOutTema })
Tema.belongsToMany(IntIncoming, { through: IntIncTema })
Tema.belongsToMany(Internal, { through: IntTema })
// ----------------------------------------------------------------------------------
// Подразделение принадлежит отделу
Subdivision.belongsTo(Department)
// В отделе может быть несколько подразделений
Department.hasMany(Subdivision)
// В подразделение может быть несколько работников
Subdivision.belongsToMany(CurrentPosition, { through: SubEmpl })
// Работник может быть в нескольких подразделениях
CurrentPosition.belongsToMany(Subdivision, { through: SubEmpl })
// ----------------------------------------------------------------------------------
// Каждая текущая должность принадлежит одному сотруднику
CurrentPosition.belongsTo(Employee)
// У сотрудника может быть одновременно несколько должностей
Employee.hasMany(CurrentPosition)
// Кадой текущей должности соответствует название должности
CurrentPosition.belongsTo(Position)
// Для каждой должности может быть несколько текущих должностей
Position.hasMany(CurrentPosition)
// Текущая должность принадлежит одному отделу
CurrentPosition.belongsTo(Department)
// В отделе может быть несколько текущих должностей
Department.hasMany(CurrentPosition)
// ----------------------------------------------------------------------------------
// Каждая текущая должность принадлежит одному сотруднику
ExtCurrentPosition.belongsTo(ExtEmployee)
// У сотрудника может быть одновременно несколько должностей
ExtEmployee.hasMany(ExtCurrentPosition)
// Кадой текущей должности соответствует название должности
ExtCurrentPosition.belongsTo(Position)
// Для каждой должности может быть несколько текущих должностей
Position.hasMany(ExtCurrentPosition)
// Текущая должность принадлежит одному отделу
ExtCurrentPosition.belongsTo(Organisation)
// В отделе может быть несколько текущих должностей
Organisation.hasMany(ExtCurrentPosition)
// ----------------------------------------------------------------------------------

const Docs = {
  dbDocs,
  Sequelize,
  Organisation,
  ExtEmployee,
  ExtIncoming,
  Position,
  Employee,
  Department,
  ExtOutgoing,
  ExtIncFile,
  ExtOutFile,
  IntIncFile,
  IntOutFile,
  InternalFile,
  IntIncoming,
  IntOutgoing,
  Contract,
  Tema,
  Type,
  Internal,
  Resolution,
  State,
  IncomingNumber,
  ExtIncState,
  Subdivision,
  CurrentPosition,
  ExtCurrentPosition,
  IntIncomingNumber,
  IntIncState,
  InternalIncomingNumber,
  InternalIncState,
  ExtIncNote,
  IntIncNote,
  InternalNote
}

const changeTracker = entity => (instance, options) => {
  fetchTimeArray[entity] = (+Date.now()).toString()
}

for (const entity in matrix) {
  Docs[matrix[entity]].afterCreate(changeTracker(entity))
  Docs[matrix[entity]].afterDestroy(changeTracker(entity))
  Docs[matrix[entity]].afterSave(changeTracker(entity))
  Docs[matrix[entity]].afterUpdate(changeTracker(entity))
  Docs[matrix[entity]].afterBulkDestroy(changeTracker(entity))
}

module.exports = Docs
