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
// BETWEEN
test(sql({
  selectors: [{expression: "lang", table: "tweets"}],
  filter: {expression: "lang", operand: [1, 3], operator: "between", table: "tweets"}
}), "SELECT `tweets.lang` FROM `tweets` WHERE (`tweets.lang` BETWEEN 1 AND 3);")
// NOT BETWEEN
test(sql({
  selectors: [{expression: "lang", table: "tweets"}],
  filter: {expression: "lang", operand: [1, 3], operator: "not between", table: "tweets"}
}), "SELECT `tweets.lang` FROM `tweets` WHERE (`tweets.lang` NOT BETWEEN 1 AND 3);")
// IN
test(sql({
  selectors: [{expression: "lang", table: "tweets"}],
  filter: {expression: "lang", operand: ["EN", "FR", "ES"], operator: "in", table: "tweets"}
}), "SELECT `tweets.lang` FROM `tweets` WHERE (`tweets.lang` IN ('EN', 'FR', 'ES'));")
// NOT IN
test(sql({
  selectors: [{expression: "lang", table: "tweets"}],
  filter: {expression: "lang", operand: ["EN", "FR", "ES"], operator: "not in", table: "tweets"}
}), "SELECT `tweets.lang` FROM `tweets` WHERE (`tweets.lang` NOT IN ('EN', 'FR', 'ES'));")
// LIKE
test(sql({
  selectors: [{expression: "lang", table: "tweets"}],
  filter: {expression: "country", operand: "nited", operator: "like", table: "tweets"}
}), "SELECT `tweets.lang` FROM `tweets` WHERE (`tweets.country` LIKE '%nited%');")
// NOT LIKE
test(sql({
  selectors: [{expression: "lang", table: "tweets"}],
  filter: {expression: "country", operand: "nited", operator: "not like", table: "tweets"}
}), "SELECT `tweets.lang` FROM `tweets` WHERE (`tweets.country` NOT LIKE '%nited%');")
// ILIKE
test(sql({
  selectors: [{expression: "lang", table: "tweets"}],
  filter: {expression: "country", operand: "nited", operator: "ilike", table: "tweets"}
}), "SELECT `tweets.lang` FROM `tweets` WHERE (`tweets.country` ILIKE '%nited%');")
// NOT ILIKE
test(sql({
  selectors: [{expression: "lang", table: "tweets"}],
  filter: {expression: "country", operand: "nited", operator: "not ilike", table: "tweets"}
}), "SELECT `tweets.lang` FROM `tweets` WHERE (`tweets.country` NOT ILIKE '%nited%');")
// IS NULL
test(sql({
  selectors: [{expression: "lang", table: "tweets"}],
  filter: {operator: "is null", expression: "lang", table: "tweets"}
}), "SELECT `tweets.lang` FROM `tweets` WHERE (`tweets.lang` IS NULL);")
// IS NOT NULL
test(sql({
  selectors: [{expression: "lang", table: "tweets"}],
  filter: {operator: "is not null", expression: "lang", table: "tweets"}
}), "SELECT `tweets.lang` FROM `tweets` WHERE (`tweets.lang` IS NOT NULL);")
// =
test(sql({
  selectors: [{expression: "lang", table: "tweets"}],
  filter: {expression: "lang", operand: 1, operator: "=", table: "tweets"}
}), "SELECT `tweets.lang` FROM `tweets` WHERE (`tweets.lang` = 1);")
// !=
test(sql({
  selectors: [{expression: "lang", table: "tweets"}],
  filter: {expression: "lang", operand: 1, operator: "!=", table: "tweets"}
}), "SELECT `tweets.lang` FROM `tweets` WHERE (`tweets.lang` != 1);")
// >
test(sql({
  selectors: [{expression: "lang", table: "tweets"}],
  filter: {expression: "lang", operand: 1, operator: ">", table: "tweets"}
}), "SELECT `tweets.lang` FROM `tweets` WHERE (`tweets.lang` > 1);")
// >=
test(sql({
  selectors: [{expression: "lang", table: "tweets"}],
  filter: {expression: "lang", operand: 1, operator: ">=", table: "tweets"}
}), "SELECT `tweets.lang` FROM `tweets` WHERE (`tweets.lang` >= 1);")
// <
test(sql({
  selectors: [{expression: "lang", table: "tweets"}],
  filter: {expression: "lang", operand: 1, operator: "<", table: "tweets"}
}), "SELECT `tweets.lang` FROM `tweets` WHERE (`tweets.lang` < 1);")
// <=
test(sql({
  selectors: [{expression: "lang", table: "tweets"}],
  filter: {expression: "lang", operand: 1, operator: "<=", table: "tweets"}
}), "SELECT `tweets.lang` FROM `tweets` WHERE (`tweets.lang` <= 1);")
// AND
test(sql({
  selectors: [{expression: "lang", table: "tweets"}],
  filter: {
    operand: [
      {expression: "lang", operator: "=", operand: "EN", table: "tweets"},
      {expression: "lang", operator: "is not null", table: "tweets"},
      {expression: "country", operator: "!=", operand: "US", table: "tweets"}],
    operator: "and"
}}), "SELECT `tweets.lang` FROM `tweets` WHERE ((`tweets.lang` = 'EN') AND (`tweets.lang` IS NOT NULL) AND (`tweets.country` != 'US'));")
// OR
test(sql({
  selectors: [{expression: "lang", table: "tweets"}],
  filter: {
    operand: [
      {expression: "lang", operand: "EN", operator: "=", table: "tweets"},
      {expression: "lang", operand: "ES", operator: "=", table: "tweets"},
      {expression: "lang", operand: "FR", operator: "=", table: "tweets"}],
    operator: "or"
}}), "SELECT `tweets.lang` FROM `tweets` WHERE ((`tweets.lang` = 'EN') OR (`tweets.lang` = 'ES') OR (`tweets.lang` = 'FR'));")
// combination

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
