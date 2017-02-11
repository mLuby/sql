const elmPorts = require('./built-elm-app.js').Main.worker().ports

function test (chartJson, expected) {
  elmPorts.input.send(chartJson)
  elmPorts.output.subscribe(actual => console.log(actual === expected ? `√ ${actual}` : `X ${actual} | ${expected}`))
}

test({selectors: [
  {expression: "country", table: "tweets"}
]}, "SELECT `tweets.country` FROM `tweets`;")
