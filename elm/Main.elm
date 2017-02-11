port module Main exposing (..)

import Json.Decode exposing (..)


port input : (Value -> msg) -> Sub msg


port output : String -> Cmd a


type alias Model =
    { lastSql : String }


type Msg
    = ChartRequestedOn Value


type alias Chart =
    { column : String, table : String }


chartDecoder : Decoder Chart
chartDecoder =
    map2 Chart
        (field "column" string)
        (field "table" string)


jsonToChart : Value -> Result String Chart
jsonToChart json =
    decodeValue chartDecoder json


chartToSql : Value -> String
chartToSql chartResult =
    case jsonToChart chartResult of
        Err msg ->
            "Error: " ++ msg

        Ok chart ->
            "SELECT " ++ chart.column ++ " FROM " ++ chart.table ++ ";"


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

                lastSql =
                    sql

                newModel =
                    Model lastSql
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
