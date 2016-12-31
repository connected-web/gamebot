const missionActions = {
  success: {
    name: 'Success',
    icon: ':success:'
  },
  fail: {
    name: 'Fail',
    icon: ':fail:'
  },
  reverse: {
    name: 'Reverse',
    icon: ':reverse:'
  }
};

missionActions.getAction = function (name) {
  return missionActions[(name + '').toLowerCase()] || false;
}

module.exports = missionActions;
