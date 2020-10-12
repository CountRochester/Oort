import contracts from './contracts'
import currentPositions from './current-position'
import departments from './departments'
import employees from './employee'
import extCurrentPositions from './ext-currentposition'
import extEmployees from './ext-employee'
import subdivisions from './subdivision'
// import extIncFiles from './ext-inc-files'
// import extOutFiles from './ext-out-files'
// import intIncFiles from './int-inc-files'
// import intOutFiles from './int-out-files'
// import internalFiles from './internal-files'
import extIncomings from './ext-incomings'
import extOutgoings from './ext-outgoings'
import intIncomings from './int-incomings'
import intOutgoings from './int-outgoings'
import internals from './internals'
import resolutions from './resolutions'
import temas from './temas'
import organisations from './organisations'
import types from './types'
import states from './states'
import positions from './positions'

export default {
  ...contracts,
  ...currentPositions,
  ...departments,
  ...employees,
  ...extCurrentPositions,
  ...extEmployees,
  ...subdivisions,
  // ...extIncFiles,
  // ...extOutFiles,
  // ...intIncFiles,
  // ...intOutFiles,
  // ...internalFiles,
  ...extIncomings,
  ...extOutgoings,
  ...intIncomings,
  ...intOutgoings,
  ...internals,
  ...resolutions,
  ...positions,
  ...temas,
  ...organisations,
  ...types,
  ...states
}
