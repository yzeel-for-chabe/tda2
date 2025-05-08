import { PageHome } from "../pages/Home";
import { Header } from "./bs/Header";
import { Page } from "./bs/Page";

export const App = () => {
    return (
        <Page>
            <Header />
            <div
                style={{
                    display: "flex",
                    position: "absolute",
                    left: 56,
                    right: 0,
                    top: 80,
                    bottom: 0
                }}
            >
                <PageHome />
            </div>
        </Page>
    )
}

export default App;