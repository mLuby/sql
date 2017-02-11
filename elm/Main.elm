port module Main exposing (..)

import Json.Decode exposing (..)


port input : (Value -> msg) -> Sub msg


port output : String -> Cmd a


type alias Model =
    { lastSql : String }


type Msg
    = ChartRequestedOn Value



-- chartDecoder : Decoder ChartSettings
-- chartDecoder =
--     map2 ChartSettings (field "table" string) (field "column" string)


column : Value -> String
column chart =
    case decodeValue (field "column" string) chart of
        Ok columnName ->
            columnName

        Err msg ->
            ("ERROR: " ++ msg)


table : Value -> String
table chart =
    case decodeValue (field "table" string) chart of
        Ok tableName ->
            tableName

        Err msg ->
            ("ERROR: " ++ msg)


chartToSql : Value -> String
chartToSql chart =
    "SELECT " ++ column chart ++ " FROM " ++ table chart ++ ";"


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
subscriptions chartModel =
    input ChartRequestedOn


main : Program Never Model Msg
main =
    Platform.program
        { init = ( initialModel, Cmd.none )
        , update = update
        , subscriptions = subscriptions
        }
