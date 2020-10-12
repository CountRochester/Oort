import moment from 'moment'

moment.locale('ru')

export function dateConvert (date) {
  if (date) {
    const d = date.toString().split('.')
    if (d.length > 1) {
      if (d[2].length > 4 || d[1].length > 2 || d[0].length > 2) {
        return undefined
      }
      const dd = [d[2], d[1], d[0]].join('-')
      return dd
    } else {
      return date
    }
  } else {
    return null
  }
}

export function getFormatedDate (val) {
  if (moment(dateConvert(val)).isValid()) {
    return val ? moment(dateConvert(val)).format('L') : ''
  } else {
    return ''
  }
}
