module.exports = sql

// Constants (use this for strings to avoid typos)
const COMMA = ", "
const AND = " AND "
const SEMICOLON = ";"

// sql :: State -> SqlString
function sql (state, isSubquery) {
  const sqlStatement = terminateSql(
    [
      selectClause(state.selectors),
      fromClause(state.selectors),
      whereClause(state.filters),
      groupByClause(state.selectors),
      orderByClause(state.order),
      limitClause(state.limit)
    ].filter(outEmptyStrings)
    .join(" ")
  , isSubquery)
  return sqlStatement
}

// Clauses

// selectClause :: [Selector] -> String
function selectClause (selectors) {
  return selectors && selectors.length ? `SELECT ${selectors
    .map(selector => compose(
      alias(selector.alias),
      aggregate(selector.aggType),
      // backtickify,
      // backtickify(qualifyTable(selector.tableAlias || selector.table)),
      subqueryOrQualifyTable(selector.tableAlias || selector.table),
      prop("expression")
    )(selector))
    .join(COMMA)}` : ""
}

// fromClause :: [Selector] -> String
function fromClause (selectors) {
  return selectors && selectors.length ? `FROM ${selectors
    .map(selector => compose(
      alias(selector.tableAlias),
      subqueryOrBacktickify,
      prop("table")
    )(selector))
    .reduce(unique, [])
    .join(COMMA)}` : ""
}

// whereClause :: [Filter] -> String
function whereClause (filters) {
  return filters && filters.length ? `WHERE ${filters
    .map(compose(
      parenthesize,
      chooseOperator
    ))
    .join(AND)}` : ""
}

// groupByClause :: [Selector] -> String
function groupByClause (selectors) {
  return selectors && selectors.filter(prop("aggType")).length ? `GROUP BY ${selectors
    .filter(prop("aggType"))
    .map(prop("alias"))
    .join(COMMA)}` : ""
}

// orderByClause :: [String] -> String
function orderByClause (aliases) { return aliases ? `ORDER BY ${aliases.join(COMMA)}` : "" }

// limitClause :: Number -> String
function limitClause (limit) { return limit ? `LIMIT ${limit}` : "" }

// Utilities

// log :: a -> IO a
function log (x) { console.log(x); return x }

// subqueryOrBacktickify :: State || String -> String
function subqueryOrBacktickify (maybeSubQuery) { return typeof maybeSubQuery === "object" ? parenthesize(sql(maybeSubQuery, true)) : backtickify(maybeSubQuery) }

// subqueryOrQualifyTable :: State || String -> String
function subqueryOrQualifyTable (tableAlias) { return maybeSubQuery => typeof maybeSubQuery === "object" ? parenthesize(sql(maybeSubQuery, true)) : backtickify(qualifyTable(tableAlias)(maybeSubQuery)) }

// chooseOperator :: Filter -> String
function chooseOperator (filter) {
  switch (filter.operator.toUpperCase()) {
  case "BETWEEN": return between(filter)
  case "IN": return inOperator(filter)
  default: throw new Error(`Invalid filter operator: ${filter.operator}`)
  }
}

// backtickify :: String -> String
function backtickify (string) { return `\`${string}\`` }

// inOperator :: Filter -> String -- `Operator` suffix because `in` is reserved.
function inOperator (filter) { return `${backtickedTableColumn(filter)} IN ${parenthesize(filter.operand.map(quote).join(COMMA))}` }

// quote :: String -> String
function quote (value) { return typeof value === "string" ? `'${value}'` : `${value}` }

// backtickedTableColumn :: Filter -> String
function backtickedTableColumn (filter) { return compose(backtickify, qualifyTable(filter.table), prop("expression"))(filter) }

// between :: Filter -> String
function between (filter) { return `${backtickedTableColumn(filter)} BETWEEN ${quote(filter.operand[0])} AND ${quote(filter.operand[1])}` }

// prop :: K -> {K: V} -> V
function prop (key) { return obj => obj[key] }

// unique :: [a] -> a -> [a]
function unique (list, item) { return includes(list, item) ? list : list.concat(item) }

// includes :: [a] -> a -> Boolean
function includes (list, item) { return list.indexOf(item) >= 0 }

// aggregate :: String -> String -> String
function aggregate (aggName) { return expression => aggName ? `${aggName.toUpperCase()}(${expression})` : expression }

// alias :: String -> String -> String
function alias (aliasName) { return expression => aliasName ? `${expression} AS ${aliasName}` : expression }

// qualifyTable :: String -> String -> String
function qualifyTable (tableName) { return expression => tableName ? `${tableName}.${expression}` : `${expression}` }

// compose :: [a -> a] -> (a -> a)
function compose () { return value => Array.apply(null, arguments).reverse().reduce((result, f) => f(result), value) }

// parenthesize :: String -> String
function parenthesize (string) { return `(${string})` }

// outEmptyStrings :: String -> Boolean
function outEmptyStrings (string) { return string !== "" }

// terminateSql :: String -> String
function terminateSql (string, isSubquery) { return `${string}${isSubquery ? "" : SEMICOLON}` }
