import { NavBar } from "./NavBar"

import "./App.css"
import "./index.css"

export const Page = (props: {
    children: React.ReactNode
}) => {
    return (
        <div className="page">
            <NavBar />
            <div style={{ flex: "1", height: "100%" }}>
                {props.children}
            </div>
        </div>
    )
}
