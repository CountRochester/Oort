export function removeDublicates (arr) {
  if (arr.length) {
    let output = [...arr]
    output = output.filter((item, index, self) =>
      index === self.findIndex(t => (t.id === item.id))
    )
    return output
  } else {
    return []
  }
}

export function removeDublicatesSimple (arr) {
  if (arr.length) {
    let output = [...arr]
    output = output.filter((item, index, self) =>
      index === self.findIndex(t => (t === item))
    )
    return output
  } else {
    return []
  }
}

export function reduceArr (arr, count) {
  const output = []
  if (count >= arr.length) {
    return arr
  }
  if (count <= 0) {
    return []
  }
  for (let i = 0; i < count; i++) {
    output[i] = arr[i]
  }
  return output
}

export function multisort (field, order) {
  let len = arguments.length
  if (len === 0) {
    return (a, b) => (a < b && -1) || (a > b && 1) || 0
  }
  if (len === 1) {
    switch (typeof field) {
      case 'number':
        return field < 0
          ? (a, b) => (a < b && 1) || (a > b && -1) || 0
          : (a, b) => (a < b && -1) || (a > b && 1) || 0
      case 'string':
        return (a, b) => (a[field] < b[field] && -1) || (a[field] > b[field] && 1) || 0
    }
  }
  if (len === 2 && typeof order === 'number') {
    return order < 0
      ? (a, b) => (a[field] < b[field] && 1) || (a[field] > b[field] && -1) || 0
      : (a, b) => (a[field] < b[field] && -1) || (a[field] > b[field] && 1) || 0
  }
  let fields, orders
  if (typeof field === 'object') {
    fields = Object.getOwnPropertyNames(field)
    orders = fields.map(key => field[key])
    len = fields.length
  } else {
    fields = new Array(len)
    orders = new Array(len)
    for (let i = len; i--;) {
      fields[i] = arguments[i]
      orders[i] = 1
    }
  }
  return (a, b) => {
    for (let i = 0; i < len; i++) {
      if (a[fields[i]] < b[fields[i]]) { return orders[i] }
      if (a[fields[i]] > b[fields[i]]) { return -orders[i] }
    }
    return 0
  }
  // // Использование
  // arr.sort(multisort()) // Обычная типобезопасная сортировка по возрастанию
  // arr.sort(multisort(-1)) // Обычная типобезопасная сортировка по убыванию
  // arr.sort(multisort('field')) // Сортировка по свойству field по возрастанию
  // arr.sort(multisort('field', -1)) // Сортировка по свойству field по убыванию
  // /* Сортировка сначала по полю field1
  //    при совпадении по полю field2, а если и оно совпало, то по полю field3
  //    все по возрастанию */
  // arr.sort(multisort('field1', 'field2', 'field3'))
  // /* Сортировка сначала по полю field1 по возрастанию
  //    при совпадении по полю field2 по убыванию */
  // arr.sort(multisort({
  //   field1: 1,
  //   field2: -1
  // }))
}
