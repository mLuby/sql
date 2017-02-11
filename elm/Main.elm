port module Main exposing (..)

import Json.Decode exposing (..)


port input : (ChartJson -> msg) -> Sub msg


port output : Sql -> Cmd a


type alias Model =
    { lastSql : Sql }


type alias Sql =
    String


type alias ChartJson =
    Value


type Msg
    = ChartRequestedOn ChartJson


type alias Chart =
    { column : String, table : String }


chartDecoder : Decoder Chart
chartDecoder =
    map2 Chart
        (field "column" string)
        (field "table" string)


jsonToChart : ChartJson -> Result String Chart
jsonToChart json =
    decodeValue chartDecoder json


chartToSql : ChartJson -> String
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
