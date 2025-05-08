
import { useRef, useState } from 'react';
import I18 from '../../i18n'
import { Menu, MenuItem } from '@mui/material';
import { useMsal } from '@azure/msal-react';
import i18next from '../../i18n';
import { useMsalToken } from '../../hooks/useMsalToken';

export const Header = () => {

	const t = I18.t;
    const [disconnectOpen, setDisconnectOpen] = useState(false);
    const disconnectBtnRef = useRef<HTMLDivElement>(null);

    const {instance} = useMsal();
    const {msalResponse} = useMsalToken(instance);

    return (
        <div
            id="header"
            data-testid="header"
            className="header-chabe"
        >
            <div className="header-item d-flex justify-content-between">
                <li id="header-home" className="header-home">
                    <img
                        src="https://agreeable-hill-038a64303.4.azurestaticapps.net//static/media/logo-chabe.999d8b4d8a3a06fc5c11f4740d647335.svg"
                        alt="Chabé logo header"
                    />
                </li>
                <li>
                    <div
                        className="account-menu"
                        data-testid="account-menu"
                        onMouseOver={() => setDisconnectOpen(true)}
                        style={{
                            cursor: 'pointer', padding: 5, aspectRatio: '1/1',
                            display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: '50%',
                            color: 'white'
                        }}
                    >
                        <div
                            ref={disconnectBtnRef}
                            className="MuiAvatar-root MuiAvatar-circular MuiAvatar-colorDefault account-avatar css-7yrfzp"
                            id="btn-account-menu"
                            data-testid="btn-account-menu"
                            title={msalResponse?.account?.name || "Aucun nom"}
                        >
                            {/* @ts-expect-error */}
                            {msalResponse?.account?.idTokenClaims?.given_name?.[0] || ""}
                            {/* @ts-expect-error */}
                            {msalResponse?.account?.idTokenClaims?.family_name?.[0] || ""}
                        </div>
                    </div>
                    <Menu
                        open={disconnectOpen}
                        anchorEl={disconnectBtnRef.current}
                        onClose={() => setDisconnectOpen(false)}
                    >
                        <MenuItem
                            onClick={() => {
                                i18next.changeLanguage("fr");
                                document.title = "Chabé | Tableau des arrivées";
                                setDisconnectOpen(false);
                            }}
                        >
                            FR
                        </MenuItem>
                        <MenuItem
                            onClick={() => {
                                i18next.changeLanguage("en");
                                document.title = "Chabé | Arrival Board";
                                setDisconnectOpen(false);
                            }}
                        >
                            EN
                        </MenuItem>
                        {/* <MenuDivider /> */}
                        <MenuItem onClick={() => {
                            instance.logout({
                                postLogoutRedirectUri: "/",
                                account: null,
                            })
                        }}>{t("logout")}</MenuItem>
                    </Menu>
                </li>
            </div>
        </div>
    )
}
