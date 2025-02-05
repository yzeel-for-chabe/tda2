import { useTranslation } from 'react-i18next';
import { paths as geolocpaths } from '../../../../../generated/openapi_geolocation';

export const Eta = (props: {
        geolocation: geolocpaths['/v1/geolocation/missions/tda']['post']['responses']['200']['content']['application/json'][number]
}) => {

    const { t } = useTranslation()

    if(!props.geolocation?.mission.eta) {
        return <p style={{color: 'grey'}}>{t('unknownETA')}</p>
    }

    // If ETA < now+5min, display the remaining time in red
    const eta = new Date(props.geolocation?.mission.eta as unknown as string)
    const now = new Date()
    const diff = eta.getTime() - now.getTime()
    if(diff < 5*60*1000) {
        return <p style={{color: 'red'}}>{new Date(diff).toLocaleTimeString()}</p>
    }

    // Else, display the time
    return <p>{eta.toLocaleTimeString()}</p>
}
