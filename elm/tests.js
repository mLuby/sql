const Elm = require('./built-elm-app.js').Main

function test (chartJson, expected) {
  const ports = Elm.worker().ports
  ports.output.subscribe(actual => {
    console.log(actual === expected ? `√ ${actual}` : `X ${actual} | ${expected}`)
  })
  ports.input.send(chartJson)
}

test({selectors: [
  {expression: "country", table: "tweets"}
]}, "SELECT `tweets.country` FROM `tweets`;")

test({selectors: [
  {expression: "lang", table: "tweets"},
  {expression: "state", table: "contributions"}
]}, "SELECT `tweets.lang`, `contributions.state` FROM `tweets`, `contributions`;")
