/* TODO
- have a .sql prop on selectors and/or filters to allow custom? compose/set to pass it around?
- always alias and use them as reference? how to avoid name collisions?
- havingClause?
*/

const selector = {
  cast: '<type to cast column as: str>',
	col: '<column_name: str>*',
  table: '<table_name: str>*',
  type '<type_of_state: enum(dimension, filter, measure)>*',

  name: '<name: str>', // TODO is this an alias?
  aggType: '<enum: avg,min,max,sum,#unique>*',
  isBinned: '<bool>*', // dimension only NOTE: existence of binParams should be enough?
  binParams: { // dimension only
		min_val: '<enum(num, date)>',
    max_val: '<enum(num, date)>',
    currentHigh: '<enum(num, date)>',
    currentLow: '<enum(num, date)>',
    numberOfBins: '<num'>
	}
}

// The following property/values are specific to filters
const filter = {
  cast: '<type to cast column as: str>',
	col: '<column_name: str>*',
  table: '<table_name: str>*',
  type '<type_of_state: enum(dimension, filter, measure)>*',

	dimension: '<dimension_to_filter_on: str>*',
  filter: '<array>*',
  operator: '<enum (">", "<", ">=", "<=", "=", "!=", ...)'>
}

// What this uses.
{
  selectors: [{
    aggType: "Avg", // optional TODO what if multiple?
    alias: "series_1", // optional
    table: "tweets", // required; usually a table, can be a subquery
    expression: "lang", // required; usually a column, can be constant or subquery
  }],
  filters: [{
    expression: "lang", // required; usually a column, can be constant or subquery
    operand: ["EN", "FR", "ES"], // required
    operator: "in", // required
    table: "tweets", // required; usually a table, can be a subquery
  }]
}
