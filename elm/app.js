const elmPorts = require('./built-elm-app.js').Main.worker().ports

const chartJson = {column: "foo", table: "bar"}

elmPorts.output.subscribe(sql => console.log(sql))
elmPorts.input.send(chartJson)
