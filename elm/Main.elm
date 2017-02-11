port module Main exposing (input, output)

import Json.Decode as Json exposing (..)
import List exposing (..)


port input : (ChartJson -> msg) -> Sub msg


port output : Sql -> Cmd a



-- Types


type Msg
    = ChartRequestedOn ChartJson


type alias Model =
    { lastSql : Sql }


type alias Sql =
    String


type alias ChartJson =
    Value


type alias SelectorJson =
    Value


type alias Chart =
    { selectors : List Selector }


type alias Selector =
    { expression : String, table : String }



-- JSON Decoders


chartDecoder : Decoder Chart
chartDecoder =
    Json.map Chart
        (field "selectors" (list selectorDecoder))


selectorDecoder : Decoder Selector
selectorDecoder =
    Json.map2 Selector
        (field "expression" string)
        (field "table" string)


jsonToChart : ChartJson -> Result String Chart
jsonToChart json =
    decodeValue chartDecoder json


jsonToSelector : SelectorJson -> Result String Selector
jsonToSelector json =
    decodeValue selectorDecoder json



-- \x -> x lambda expression
-- ++ string concat operator: "a" ++ "b" == "ab"
-- << composition operator: (f << g) x == f(g(x))
-- <| function application: f <| g x == f(g x)


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
    join ", " <| List.map (\selector -> backtick (join "." [ selector.expression, selector.table ])) <| reverse selectors


fromClause : List Selector -> String
fromClause selectors =
    join ", " <| List.map (backtick << .table) <| reverse selectors



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
