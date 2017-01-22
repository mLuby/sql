const sql = require("./sql")

// test :: Eq -> Eq -> IO ()
function test (actual, expected) { console.log(actual === expected ? `√ ${actual}` : `X ${actual} | ${expected}`) }

console.log("SELECT, FROM")
test(sql({selectors: [
  {value: "country", table: "tweets"}
]}), "SELECT `tweets.country` FROM `tweets`;")

test(sql({selectors: [
  {value: "lang", table: "tweets"},
  {value: "state", table: "contributions"}
]}), "SELECT `tweets.lang`, `contributions.state` FROM `tweets`, `contributions`;")

console.log("WHERE")
test(sql({selectors: [
  {value: "lang", table: "tweets"},
], filters: [
  {column: "lang", operand: [1, 3], operator: "between", table: "tweets"}
]}), "SELECT `tweets.lang` FROM `tweets` WHERE (`tweets.lang` BETWEEN 1 AND 3);")

test(sql({selectors: [
  {value: "lang", table: "tweets"},
], filters: [
  {column: "lang", operand: ["EN", "FR", "ES"], operator: "in", table: "tweets"}
]}), "SELECT `tweets.lang` FROM `tweets` WHERE (`tweets.lang` IN ('EN', 'FR', 'ES'));")

test(sql({selectors: [
  {value: "lang", table: "tweets"},
], filters: [
  {column: "lang", operand: [1, 3], operator: "between", table: "tweets"},
  {column: "lang", operand: ["EN", "FR", "ES"], operator: "in", table: "tweets"}
]}), "SELECT `tweets.lang` FROM `tweets` WHERE (`tweets.lang` BETWEEN 1 AND 3) AND (`tweets.lang` IN ('EN', 'FR', 'ES'));")

test(sql({selectors: [
  {value: "lang", table: "tweets"},
], filters: [
  {column: "lang", operand: ["EN", "FR", "ES"], operator: "in", table: "tweets"}
]}), "SELECT `tweets.lang` FROM `tweets` WHERE (`tweets.lang` IN ('EN', 'FR', 'ES'));")

console.log("GROUP BY")
test(sql({selectors: [
  {aggType: "Avg", name: "series_1", value: "lang", table: "tweets"},
]}), "SELECT AVG(`tweets.lang`) AS series_1 FROM `tweets` GROUP BY series_1;")

test(sql({selectors: [
  {aggType: "Avg", name: "series_1", value: "lang", table: "tweets"},
  {value: "country", table: "tweets"}
]}), "SELECT AVG(`tweets.lang`) AS series_1, `tweets.country` FROM `tweets` GROUP BY series_1;")

test(sql({selectors: [
  {aggType: "Avg", name: "series_1", value: "lang", table: "tweets"},
  {aggType: "Count", name: "series_2", value: "country", table: "tweets"},
]}), "SELECT AVG(`tweets.lang`) AS series_1, COUNT(`tweets.country`) AS series_2 FROM `tweets` GROUP BY series_1, series_2;")

console.log("ORDER BY")
test(sql({selectors: [
  {value: "lang", table: "tweets", name: "series_1"},
], order: ["series_1"]}), "SELECT `tweets.lang` AS series_1 FROM `tweets` ORDER BY series_1;")

console.log("LIMIT")
test(sql({selectors: [
  {value: "lang", table: "tweets"},
], limit: 10}), "SELECT `tweets.lang` FROM `tweets` LIMIT 10;")
