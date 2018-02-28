/**
 * Created by:tm  Date:2018/2/28
 */
require('babel-core/register')({
  'presets': [
    'env',
    'stage-3'
  ]
})

require('babel-polyfill')
require('./server')
