module.exports = sql

// Constants (use this for strings to avoid typos)
const COMMA = ", "
const AND = " AND "
const OR = " OR "
const SEMICOLON = ";"

// sql :: State -> SqlString
function sql (state, isSubquery) {
  const sqlStatement = terminateSql(
    [
      selectClause(state.selectors),
      fromClause(state.selectors),
      whereClause(state.filter),
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

// whereClause :: Filter -> String
function whereClause (filter) {
  return filter ? `WHERE ${subFilter(filter)}` : ""
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

// wildcardify :: String -> String
function wildcardify (string) { return `%${string}%`}

// subFilter :: Filter || String -> String
function subFilter (maybeSubFilter) { return typeof maybeSubFilter === "object" ? compose(parenthesize, chooseOperator)(maybeSubFilter) : maybeSubFilter }

// chooseOperator :: Filter -> String
function chooseOperator (filter) {
  switch (filter.operator.toUpperCase()) {
  case "BETWEEN": return `${backtickedTableColumn(filter)} BETWEEN ${quote(filter.operand[0])} AND ${quote(filter.operand[1])}`
  case "NOT BETWEEN": return `${backtickedTableColumn(filter)} NOT BETWEEN ${quote(filter.operand[0])} AND ${quote(filter.operand[1])}`
  case "IN": return `${backtickedTableColumn(filter)} IN ${parenthesize(filter.operand.map(quote).join(COMMA))}`
  case "NOT IN": return `${backtickedTableColumn(filter)} NOT IN ${parenthesize(filter.operand.map(quote).join(COMMA))}`
  case "LIKE": return `${backtickedTableColumn(filter)} LIKE ${quote(wildcardify(filter.operand))}`
  case "NOT LIKE": return `${backtickedTableColumn(filter)} NOT LIKE ${quote(wildcardify(filter.operand))}`
  case "ILIKE": return `${backtickedTableColumn(filter)} ILIKE ${quote(wildcardify(filter.operand))}`
  case "NOT ILIKE": return `${backtickedTableColumn(filter)} NOT ILIKE ${quote(wildcardify(filter.operand))}`
  case "IS NULL": return `${backtickedTableColumn(filter)} IS NULL`
  case "IS NOT NULL": return `${backtickedTableColumn(filter)} IS NOT NULL`
  case "=": return `${backtickedTableColumn(filter)} = ${quote(filter.operand)}`
  case "!=": return `${backtickedTableColumn(filter)} != ${quote(filter.operand)}`
  case ">": return `${backtickedTableColumn(filter)} > ${quote(filter.operand)}`
  case ">=": return `${backtickedTableColumn(filter)} >= ${quote(filter.operand)}`
  case "<": return `${backtickedTableColumn(filter)} < ${quote(filter.operand)}`
  case "<=": return `${backtickedTableColumn(filter)} <= ${quote(filter.operand)}`
  case "AND": return filter.operand.map(subFilter).join(AND)
  case "OR": return filter.operand.map(subFilter).join(OR)
  default: throw new Error(`Invalid filter operator: ${filter.operator}`)
  }
}

// backtickify :: String -> String
function backtickify (string) { return `\`${string}\`` }

// quote :: String -> String
function quote (value) { return typeof value === "string" ? `'${value}'` : `${value}` }

// backtickedTableColumn :: Filter -> String
function backtickedTableColumn (filter) { return compose(backtickify, qualifyTable(filter.table), prop("expression"))(filter) }

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
