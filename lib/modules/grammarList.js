function grammarList(list, clause = 'and', sort = true) {
  if (sort) {
    list.sort((a, b) => {
      return a.localeCompare(b, 'en', {
        'sensitivity': 'base'
      });
    });
  }
  if (list.length > 1) {
    var end = list[list.length - 1]
    return list.slice(0, -1).join(', ') + `, ${clause} ` + end
  } else if (list.length === 1) {
    return list[0];
  }
  return ''
}

module.exports = grammarList
