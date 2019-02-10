exports.arrayContainsArray = (superset, subset) => {
  if (0 === subset.length) {
    return false;
  }
  return subset.every(function (value) {
    return (superset.indexOf(value) >= 0);
  });
}

exports.stripProjectDirectory = (dir) => {
  let dirs = dir.split('/')
  return dirs[dirs.length - 1]
}

