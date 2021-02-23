(function() {
  let s = require('Storage').readJSON('univerzwelcome.json', 1) || {};
  if (!s.welcomed) {
    setTimeout(() => {
      require('Storage').write('univerzwelcome.json', {welcomed: true})
      load('univerzwelcome.app.js')
    })
  }
})()
