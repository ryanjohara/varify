define [
    'underscore'
    './workflows/analysis'
    './workflows/results'
], (_, mods...) ->

    _.extend {}, mods...
