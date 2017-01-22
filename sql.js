module.exports = sql

// Constants (use this for strings to avoid typos)
const COMMA = ", "
const AND = " AND "
const SEMICOLON = ";"

// sql :: State -> SqlString
function sql (state) {
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
  )
  return sqlStatement
}

// Clauses

// selectClause :: [Selector] -> String
function selectClause (selectors) {
  return selectors && selectors.length ? `SELECT ${selectors
    .map(selector => compose(
      alias(selector.name),
      aggregate(selector.aggType),
      backtickify,
      qualifyTable(selector.tableAlias || selector.table),
      prop("value")
    )(selector))
    .join(COMMA)}` : ""
}

// fromClause :: [Selector] -> String
function fromClause (selectors) {
  return selectors && selectors.length ? `FROM ${selectors
    .map(compose(
      backtickify,
      prop("table")
    ))
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
    .map(prop("name"))
    .join(COMMA)}` : ""
}

// orderByClause :: [String] -> String
function orderByClause (aliases) { return aliases ? `ORDER BY ${aliases.join(COMMA)}` : "" }

// limitClause :: Number -> String
function limitClause (limit) { return limit ? `LIMIT ${limit}` : "" }

// Utilities

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
function backtickedTableColumn (filter) { return compose(backtickify, qualifyTable(filter.table), prop("column"))(filter) }

// between :: Filter -> String
function between (filter) { return `${backtickedTableColumn(filter)} BETWEEN ${quote(filter.operand[0])} AND ${quote(filter.operand[1])}` }

// prop :: K -> {K: V} -> V
function prop (key) { return obj => obj[key] }

// unique :: [a] -> a -> [a]
function unique (list, item) { return includes(list, item) ? list : list.concat(item) }

// includes :: [a] -> a -> Boolean
function includes (list, item) { return list.indexOf(item) >= 0 }

// aggregate :: String -> String -> String
function aggregate (aggName) { return column => aggName ? `${aggName.toUpperCase()}(${column})` : column }

// alias :: String -> String -> String
function alias (aliasName) { return column => aliasName ? `${column} AS ${aliasName}` : column }

// qualifyTable :: String -> String -> String
function qualifyTable (tableName) { return column => tableName ? `${tableName}.${column}` : `${column}` }

// compose :: [a -> a] -> (a -> a)
function compose () { return value => Array.apply(null, arguments).reverse().reduce((result, f) => f(result), value) }

// parenthesize :: String -> String
function parenthesize (string) { return `(${string})` }

// outEmptyStrings :: String -> Boolean
function outEmptyStrings (string) { return string !== "" }

// terminateSql :: String -> String
function terminateSql (string) { return `${string}${SEMICOLON}` }
