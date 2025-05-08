import { Button } from "@mui/material";
import { Retry, RetryHelperFx, wait } from "./Retry";

const Try = new Retry("test")
    .add(() => {
        // Try something
        throw "fail 1"
    })
    .add(() => {
        // Try differently
        throw "fail 2"
    })
    .add(RetryHelperFx.ReloadPage) // Reload the page because why not
    .add(() => {
        // Try again after done reloading the page
        alert("ok")
    })

export const C = () => {
    return <Button onClick={async () => {
        Try.run()
    }
    }>
        Lol
    </Button>
}