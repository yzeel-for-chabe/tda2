
import { CarTwoTone } from '@ant-design/icons';

export const NavBar = () => {
    return (
        <nav id="navbar" className="navbar-chabe">
            <menu>
                {/* <li style={{ display: "none" }}>
                    <a
                        id="nav-dashboard"
                        className="nav-link"
                        href="https://agreeable-hill-038a64303.4.azurestaticapps.net/dashboard"
                        aria-current="page"

                    >
                        <img
                            src="https://agreeable-hill-038a64303.4.azurestaticapps.net//static/media/nav-home-icon.e0d99f32dc8c1b2787e29f865cbf6da1.svg"
                            alt="Clickable Dashboard button side navigation bar"
                        />
                    </a>
                </li>
                <li style={{ display: "none" }}>
                    <a
                        id="nav-passenger"
                        className="nav-link"
                        href="https://agreeable-hill-038a64303.4.azurestaticapps.net/passenger"
                    >
                        <img
                            src="https://agreeable-hill-038a64303.4.azurestaticapps.net//static/media/passenger-icon.c910ce52b2c01a277e279004e67c770e.svg"
                            alt="Clickable Dashboard button side navigation bar"
                        />
                    </a>
                </li> */}
                <li>
                    <a
                        id="nav-tda"
                        className="nav-link is-active"
                        href="/"
                        aria-current="page"
                        style={{
                            backgroundColor: "#001c40",
                            color: "white",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                        }}
                    >
                        <CarTwoTone size={40} />
                    </a>
                </li>
            </menu>
            <img
                className="navbar-logo"
                src="https://agreeable-hill-038a64303.4.azurestaticapps.net//static/media/chabe-logo.d6fdbca61b47529a918259752dada744.svg"
                alt="Chabé logo side navigation bar"
            />
        </nav>
    )
}