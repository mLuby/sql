const sql = require("./sql")

// test :: Eq -> Eq -> IO ()
function test (actual, expected) { console.log(actual === expected ? `√ ${actual}` : `X ${actual} | ${expected}`) }

console.log("SELECT, FROM")
test(sql({selectors: [
  {expression: "country", table: "tweets"}
]}), "SELECT `tweets.country` FROM `tweets`;")

test(sql({selectors: [
  {expression: "lang", table: "tweets"},
  {expression: "state", table: "contributions"}
]}), "SELECT `tweets.lang`, `contributions.state` FROM `tweets`, `contributions`;")

console.log("WHERE")
test(sql({selectors: [
  {expression: "lang", table: "tweets"},
], filters: [
  {expression: "lang", operand: [1, 3], operator: "between", table: "tweets"}
]}), "SELECT `tweets.lang` FROM `tweets` WHERE (`tweets.lang` BETWEEN 1 AND 3);")

test(sql({selectors: [
  {expression: "lang", table: "tweets"},
], filters: [
  {expression: "lang", operand: ["EN", "FR", "ES"], operator: "in", table: "tweets"}
]}), "SELECT `tweets.lang` FROM `tweets` WHERE (`tweets.lang` IN ('EN', 'FR', 'ES'));")

test(sql({selectors: [
  {expression: "lang", table: "tweets"},
], filters: [
  {expression: "lang", operand: [1, 3], operator: "between", table: "tweets"},
  {expression: "lang", operand: ["EN", "FR", "ES"], operator: "in", table: "tweets"}
]}), "SELECT `tweets.lang` FROM `tweets` WHERE (`tweets.lang` BETWEEN 1 AND 3) AND (`tweets.lang` IN ('EN', 'FR', 'ES'));")

test(sql({selectors: [
  {expression: "lang", table: "tweets"},
], filters: [
  {expression: "lang", operand: ["EN", "FR", "ES"], operator: "in", table: "tweets"}
]}), "SELECT `tweets.lang` FROM `tweets` WHERE (`tweets.lang` IN ('EN', 'FR', 'ES'));")

console.log("GROUP BY")
test(sql({selectors: [
  {aggType: "Avg", alias: "series_1", expression: "lang", table: "tweets"},
]}), "SELECT AVG(`tweets.lang`) AS series_1 FROM `tweets` GROUP BY series_1;")

test(sql({selectors: [
  {aggType: "Avg", alias: "series_1", expression: "lang", table: "tweets"},
  {expression: "country", table: "tweets"}
]}), "SELECT AVG(`tweets.lang`) AS series_1, `tweets.country` FROM `tweets` GROUP BY series_1;")

test(sql({selectors: [
  {aggType: "Avg", alias: "series_1", expression: "lang", table: "tweets"},
  {aggType: "Count", alias: "series_2", expression: "country", table: "tweets"},
]}), "SELECT AVG(`tweets.lang`) AS series_1, COUNT(`tweets.country`) AS series_2 FROM `tweets` GROUP BY series_1, series_2;")

console.log("ORDER BY")
test(sql({selectors: [
  {expression: "lang", table: "tweets", alias: "series_1"},
], order: ["series_1"]}), "SELECT `tweets.lang` AS series_1 FROM `tweets` ORDER BY series_1;")

console.log("LIMIT")
test(sql({selectors: [
  {expression: "lang", table: "tweets"},
], limit: 10}), "SELECT `tweets.lang` FROM `tweets` LIMIT 10;")

console.log("SUBQUERY")
test(sql({
  selectors: [{
    expression: "*",
    table: { // SUBQUERY
      selectors: [{
        expression: "country",
        table: "tweets"
      }]
    },
    tableAlias: "foo"
  }]
}), "SELECT `foo.*` FROM (SELECT `tweets.country` FROM `tweets`) AS foo;")

test(sql({
  selectors: [{
    expression: "*",
    table: { // SUBQUERY
      selectors: [{
        expression: "*",
        table: { // SUBQUERY
          selectors: [{expression: "*", table: "tweets"}]
        },
        tableAlias: "bar"
      }]
    },
    tableAlias: "foo"
  }]
}), "SELECT `foo.*` FROM (SELECT `bar.*` FROM (SELECT `tweets.*` FROM `tweets`) AS bar) AS foo;")

test(sql({
  selectors: [{
    expression: { // SUBQUERY
      selectors: [{
        expression: "country",
        table: "tweets"
      }]
    },
    alias: "foo",
    table: "tweets"
  }]
}), "SELECT (SELECT `tweets.country` FROM `tweets`) AS foo FROM `tweets`;")
