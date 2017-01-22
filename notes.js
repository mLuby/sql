/* TODO
- have a .sql prop on selectors and/or filters to allow custom? compose/set to pass it around?
- always alias and use them as reference? how to avoid name collisions?
- havingClause?
*/

// The following property/values are specific to measures
const measure = {
	col: '<column_name: str>*',
  table: '<table_name: str>*',
  type '<type_of_state: enum(dimension, filter, measure)>*',
  cast: '<type to cast column as: str>',

  name: '<name: str>',
  aggType: '<enum(avg,min,max,sum,#unique)>,   '
}

// The following property/values are specific to Dimensions.
const dimension = {
	col: '<column_name: str>*',
  table: '<table_name: str>*',
  type '<type_of_state: enum(dimension, filter, measure)>*',
  cast: '<type to cast column as: str>',

  name: '<name: str>',
  aggType: '<enum: avg,min,max,sum,#unique>*',
  isBinned: '<bool>*',
  binParams: {
		min_val: '<enum(num, date)>',
    max_val: '<enum(num, date)>',
    currentHigh: '<enum(num, date)>',
    currentLow: '<enum(num, date)>',
    numberOfBins: '<num'>
	}
}

// The following property/values are specific to filters
const filter = {
	col: '<column_name: str>*',
  table: '<table_name: str>*',
  type '<type_of_state: enum(dimension, filter, measure)>*',
  cast: '<type to cast column as: str>',

	dimension: '<dimension_to_filter_on: str>*',
  filter: '<array>*',
  operator: '<enum (">", "<", ">=", "<=", "=", "!=", ...)'>
}
