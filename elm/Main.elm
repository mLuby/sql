port module Main exposing (..)

import Json.Decode exposing (field, Value, Decoder, map2, string, decodeValue, list)
import List exposing (head, foldl, append, intersperse, map)


port input : (ChartJson -> msg) -> Sub msg


port output : Sql -> Cmd a


type alias Model =
    { lastSql : Sql }


type alias Sql =
    String


type alias ChartJson =
    Value


type alias SelectorJson =
    Value


type Msg
    = ChartRequestedOn ChartJson


type alias Chart =
    { selectors : List Selector }


type alias Selector =
    { expression : String, table : String }


chartDecoder : Decoder Chart
chartDecoder =
    Json.Decode.map Chart
        (field "selectors" (list selectorDecoder))


selectorDecoder : Decoder Selector
selectorDecoder =
    map2 Selector
        (field "expression" string)
        (field "table" string)


jsonToChart : ChartJson -> Result String Chart
jsonToChart json =
    decodeValue chartDecoder json


jsonToSelector : SelectorJson -> Result String Selector
jsonToSelector json =
    decodeValue selectorDecoder json



-- \x -> x lambda expression
-- ++ string concat operator
-- << composition operator
-- <| function application


chartToSql : ChartJson -> String
chartToSql chartResult =
    case jsonToChart chartResult of
        Err msg ->
            "Error: " ++ msg

        Ok chart ->
            "SELECT " ++ selectClause chart.selectors ++ " FROM " ++ fromClause chart.selectors ++ ";"



-- Clauses:


selectClause : List Selector -> String
selectClause selectors =
    foldl (++) "" <| intersperse ", " <| map (\selector -> backtick (selector.table ++ "." ++ selector.expression)) selectors


fromClause : List Selector -> String
fromClause selectors =
    foldl (++) "" <| intersperse ", " <| map (backtick << .table) selectors



-- Helpers:


join : String -> List String -> String
join conjunction strings =
    foldl (++) "" <| intersperse conjunction strings


backtick : String -> String
backtick a =
    "`" ++ a ++ "`"



-- Plumbing:


initialModel : Model
initialModel =
    Model ""


update : Msg -> Model -> ( Model, Cmd a )
update msg { lastSql } =
    case msg of
        ChartRequestedOn chart ->
            let
                sql =
                    chartToSql chart

                newModel =
                    Model sql
            in
                ( newModel, output sql )


subscriptions : Model -> Sub Msg
subscriptions doesntmatter =
    input ChartRequestedOn


main : Program Never Model Msg
main =
    Platform.program
        { init = ( initialModel, Cmd.none )
        , update = update
        , subscriptions = subscriptions
        }
