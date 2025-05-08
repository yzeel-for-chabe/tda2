export interface Root {
    MIS_ID: string
    MIS_COM_ID: string
    MIS_NUMERO: string
    MIS_VERSION: string
    MIS_DATE_DEBUT: string
    MIS_HEURE_DEBUT: any
    MIS_HEURE_FIN: any
    MIS_PAX: string
    MIS_VOI_ID: string
    MIS_CHU_ID: string
    MIS_SMI_ID: string
    MIS_PAR_ID: string
    MIS_NOTE_CHAUFFEUR: string
    MIS_REF_MISSION_CLIENT: string
    MIS_PANNEAU: any
    MIS_LISTE_PASSAGERS: any
    MIS_PJ: any
    MIS_HEURE_REEL_DEBUT: any
    MIS_HEURE_REEL_FIN: any
    MIS_KM_DEBUT: any
    MIS_KM_FIN: any
    MIS_PROGRAMME: any
    MIS_NOTE_INTERNE: any
    MIS_TSE_ID: string
    MIS_TVE_ID: string
    MIS_FLAG_CONTROL: string
    MIS_PC_NUM_TRANSPORT: any
    MIS_PC_HEURE_TRANSPORT: any
    MIS_DE_NUM_TRANSPORT: any
    MIS_DE_HEURE_TRANSPORT: any
    MIS_ITINERAIRE: string
    MIS_DATE_FLAG_CONTROL: any
    MIS_FLAG_MODIFIE: string
    MIS_INFO_FACTURE: any
    MIS_GOOGLE_KM_PREVU: any
    MIS_GOOGLE_HEURE_PREVU: any
    MIS_REPAS_QTE: any
    MIS_PEAGE: any
    MIS_DEBOURS: any
    MIS_PARKING: any
    MIS_COMMENTAIRE_CHAUFFEUR: any
    MIS_LMI_ID: string
    MIS_HEURE_INCLUS: any
    MIS_KM_INCLUS: any
    MIS_HEURE_DEPOSE: any
    MIS_HEURE_PRISE_EN_CHARGE: any
    MIS_TEL_PASSAGER: any
    MIS_ITINERAIRE_LABEL: string
    MIS_FLAG_INVISIBLE: string
    MIS_FLAG_NOSHOW: string
    MIS_MMI_ID: string
    MIS_FLAG_DA: string
    MIS_BAGAGE: string
    MIS_CMI: any
    MIS_VIRTUAL_PHONE_DRIVER: string
    MIS_HEURE_REEL_PAYEE: any
    MIS_MONTANT_NET_CHAUFFEUR: any
    MIS_MONTANT_STANDBY_CHAUFFEUR: any
    MIS_PICKUP_LIE_ID: string
    MIS_PAX_MAX: any
    MIS_ETAT: string
    MIS_CEL_PASSAGER_MODE_NORMAL: string
    MIS_LIE_ID_PICKUP_VEHICULE: any
    MIS_LIE_ID_DEPOSE_VEHICULE: any
    MIS_DO_LIENS_PJ: any
    MIS_PJ_INTERNAL: any
    MIS_URL_LOGO: any
    MIS_MIS_ID: any
    MIS_DECOUCHER: string
    MIS_TEMPS_PAUSE: any
    MIS_TEMPS_COUPURE: any
    C_EAR_CEATION_DATE: string
    C_Com_Commande: CComCommande
    C_Gen_EtapePresence: CGenEtapePresence[]
    C_Gen_Presence: CGenPresence[]
    C_Com_TypeService: CComTypeService
    C_Gen_Voiture: CGenVoiture
    C_Gen_TypeVehicule: CGenTypeVehicule
    C_Com_FraisMission: any[]
    C_Gen_Chauffeur: CGenChauffeur
  }
  
  export interface CComCommande {
    COM_ID: string
    COM_DATE_CREATION: string
    COM_SCO_ID: string
    COM_CLI_ID: string
    COM_COT_ID: string
    COM_FAC_ID: string
    COM_DEMANDE: any
    COM_COMMENTAIRE_INTERNE: any
    COM_CODE_EVENEMENT: string
    COM_GRI_ID: string
    COM_DATE_CONFIRMATION: string
    COM_COL_ID: string
    COM_MDE_ID: string
    COM_CONDITION: any
    COM_PAR_ID: string
    COM_TCO_ID: string
    COM_TDO_ID: string
    COM_COM_ID: any
    COM_FLAG_CGV_FACTURE: string
    COM_FLAG_HT: string
    COM_COMMISSION_MONTANT: string
    COM_DATE_DERNIERE_MODIFICATION: string
    COM_IBA_ID: string
    COM_EVN_ID: string
    COM_PJ: any
    C_Gen_Client: CGenClient
    C_Com_Facture: CComFacture
  }
  
  export interface CGenClient {
    CLI_ID: string
    CLI_TCC_ID: string
    CLI_SOCIETE: string
    CLI_GROUPE: string
    CLI_TEL_FIXE: string
    CLI_FAX: any
    CLI_SIRET: any
    CLI_TVA_INTRA: any
    CLI_IBAN: any
    CLI_DATE_INSCRIPTION: string
    CLI_COMMENTAIRE: string
    CLI_FACT_NOM: string
    CLI_FACT_ADRESSE: string
    CLI_FACT_ADRESSE_2: any
    CLI_FACT_ADRESSE_3: any
    CLI_FACT_CP: any
    CLI_FACT_VILLE: string
    CLI_FACT_PAY_ID: any
    CLI_NUM_COMPTA: string
    CLI_DELAI_REGLEMENT: any
    CLI_LOGO_PANNEAU: string
    CLI_MDE_ID: string
    CLI_MFA_ID: string
    CLI_PAR_ID: string
    CLI_CCL_ID: string
    CLI_COORDONNEE_BAS: string
    CLI_TCO_ID: string
    CLI_FLAG_MST_PC_1_PAS: string
    CLI_FLAG_MST_PC_AUTRE_PAS: string
    CLI_FLAG_MST_DE: string
    CLI_FLAG_MST_DEMARER: string
    CLI_FLAG_MST_EN_PLACE: string
    CLI_FLAG_HT: string
    CLI_NOTE_CHAUFFEUR: string
    CLI_FLAG_MST_ENVOYE: string
    CLI_FLAG_EXPORT: string
    CLI_TCM_ID: any
    CLI_EMAIL_LEGAL: any
    CLI_CODE_FISCAL: any
    CLI_CHORUS_ID: any
    CLI_CHORUS_SERVICE_CODE: any
    CLI_CHORUS_NUMERO_MARCHE: any
    CLI_CHORUS_NUMERO_ENGAGEMENT: any
    CLI_FLAG_FIN_MOIS: string
    CLI_IBA_ID: string
    CLI_RESA_NB_MINUTE_BEFORE: string
    CLI_FLAG_LOGO: string
    CLI_SMS_FROM: any
    CLI_FLAG_SMS_HEURE_FIXE: string
    CLI_FLAG_SMS_COORDONNE_CHAUFFEUR: string
    CLI_FLAG_SMS_POB_ENVOI_PASSAGER: string
    CLI_FLAG_SMS_PASSAGER_TERMINER: string
    CLI_FLAG_SMS_CLIENT_EN_PLACE: string
    CLI_FLAG_SMS_CLIENT_POB: string
    CLI_FLAG_SMS_CLIENT_DEPOSE: string
    CLI_PJ: any
  }
  
  export interface CComFacture {
    FAC_ID: string
    FAC_CLI_ID: string
    FAC_NUMERO: string
    FAC_DATE: any
    FAC_NOM: string
    FAC_ADRESSE: any
    FAC_ADRESSE_2: any
    FAC_ADRESSE_3: any
    FAC_CP: any
    FAC_VILLE: any
    FAC_PAY_ID: any
    FAC_COMMENTAIRE: any
    FAC_DATE_REGLEMENT_ATTENDUE: any
    FAC_MONTANT_TTC: string
    FAC_MONTANT_REGLER: string
    FAC_DATE_REGLEMENT: any
    FAC_FLAG_REGLE: string
    FAC_MONTANT_ECHEANCE: string
    FAC_FLAG_EXPORT: string
    FAC_ECO_ID: string
    FAC_MFA_ID: string
    FAC_CONDITION_REGLEMENT: any
    FAC_FAC_ID: any
    FAC_MONTANT_DEBOURS: string
    FAC_CHORUS_ID: any
    FAC_CHORUS_NUM: any
    FAC_CFS_ID: any
    FAC_BLOC_CHAINE: any
  }
  
  export interface CGenEtapePresence {
    EPR_ID: string
    EPR_LIE_ID: string
    EPR_MIS_ID: string
    EPR_TRI: string
    EPR_NUM_TRANSPORT?: string
    EPR_HEURE_TRANSPORT: any
    EPR_HEURE_ARRIVER: any
    EPR_HEURE_DEPART: any
    EPR_FLAG_ANNULER: string
    EPR_HEURE_DEBUT: any
    EPR_DECALAGE: any
    EPR_INFOS_VOL: any
    C_Geo_Lieu: CGeoLieu
  }
  
  export interface CGeoLieu {
    LIE_ID: string
    LIE_TLI_ID: string
    LIE_LIBELLE: string
    LIE_FORMATED: string
    LIE_INFO?: string
    LIE_VILLE: string
    LIE_CP: string
    LIE_PAY_ID?: string
    LIE_LAT: string
    LIE_LNG: string
    LIE_REF_EXTERNE?: string
    LIE_ETAT: string
    LIE_TIMEZONE: string
  }
  
  export interface CGenPresence {
    PRS_ID: string
    PRS_MIS_ID: string
    PRS_PAS_ID: string
    PRS_TRI: string
    PRS_PC_EPR_ID: string
    PRS_DE_EPR_ID: string
    PRS_TPP_ID: string
    PRS_PRS_ID: any
    PRS_BAGAGE: string
    PRS_CMI: string
    C_Gen_Passager: CGenPassager
  }
  
  export interface CGenPassager {
    PAS_ID: string
    PAS_CIV_ID?: string
    PAS_NOM: string
    PAS_PRENOM: string
    PAS_LAN_ID: string
    PAS_TELEPHONE: string
    PAS_TELEPHONE2: string
    PAS_TELEPHONE3: string
    PAS_TELEPHONE4: string
    PAS_INFO_CHAUFFEUR: string
    PAS_INFO_INTERNE: string
    PAS_FLAG_SMS: string
    PAS_FLAG_TPMR: string
    PAS_EMAIL: string
  }
  
  export interface CComTypeService {
    TSE_ID: string
    TSE_LIBELLE: string
    TSE_CODE: string
    TSE_FSE_ID: string
    TSE_COULEUR: string
    TSE_TRI: string
    TSE_DESCRIPTION: string
    TSE_PHOTO: string
    TSE_LIBELLE_SITE: string
    TSE_INTRO: string
    TSE_A_PARTIR: string
    TSE_MMI_ID: string
    TSE_FLAG_FORM_RESA: string
    TSE_DUREE: string
  }
  
  export interface CGenVoiture {
    VOI_ID: string
    VOI_LIBELLE: string
    VOI_KILOMETRAGE: string
    VOI_DATE_REVISION: any
    VOI_CARTE_GRISE: string
    VOI_DATE_ENTREE: string
    VOI_NUMERO_BADGE: any
    VOI_TAUX_CO2: any
    VOI_DATE_CONTROLE_TECHNIQUE: any
    VOI_INFOS: string
    VOI_TVE_ID: string
    VOI_PAR_ID: string
    VOI_GAR_ID: string
    VOI_PLACE: string
    VOI_TRI: any
    VOI_FLAG_PLANNING: string
    VOI_GEOLOC_ID: string
    VOI_VITESSE: string
    VOI_LAT: any
    VOI_LNG: any
    VOI_FLAG_TPMR: string
    VOI_ETAT: string
    VOI_MODELE: string
    VOI_CODE_INTERNE: string
    VOI_DATE_VALIDITE_CARTE_CARBURANT: any
    VOI_DATE_VALIDITE_CONTROLE_TECHNIQ: any
    VOI_DATE_VALIDITE_ETHYLOTEST: any
    VOI_DATE_VALIDITE_EXTINCTEUR: any
    VOI_DATE_VALIDITE_NUMERO_VTC: any
    VOI_DATE_VALIDITE_PHARMACIE: any
    VOI_NUMERO_CARTE_CARBURANT: any
    VOI_NUMERO_ETHYLOTEST: any
    VOI_NUMERO_EXTINCTEUR: any
    VOI_NUMERO_VTC: any
    VOI_DATE_VALIDITE_LIMITEUR_VITESSE: any
    VOI_NUMERO_CHRONO: any
    VOI_DATE_VALIDITE_CHRONO: any
    VOI_NUMERO_BADGE_AUTOROUTE: any
    VOI_DATE_VALIDITE_BADGE_AUTOROUTE: any
    VOI_NUMERO_GEOLOC: any
    VOI_DATE_VALIDITE_GEOLOC: any
    VOI_PJ: any
    VOI_REF_EXTERNE: any
  }
  
  export interface CGenTypeVehicule {
    TVE_ID: string
    TVE_LIBELLE: string
    TVE_CODE: string
    TVE_TRI: string
    TVE_LIBELLE_COURT: string
    TVE_PAX: string
    TVE_BAGAGE: string
  }
  
  export interface CGenChauffeur {
    CHU_ID: string
    CHU_ETAT: string
    CHU_PAR_ID: string
    CHU_NOM: string
    CHU_PRENOM: string
    CHU_CIV_ID: string
    CHU_EMAIL: string
    CHU_MATRICULE: any
    CHU_ADRESSE: any
    CHU_CODE_POSTAL: any
    CHU_VILLE: any
    CHU_TEL_FIXE: any
    CHU_TEL_MOBILE_1: string
    CHU_TEL_MOBILE_2: any
    CHU_DATE_NAISSANCE: any
    CHU_CODE_POSTAL_NAISSANCE: any
    CHU_VILLE_NAISSANCE: any
    CHU_PAY_NAISSANCE: any
    CHU_NATIONALITE: any
    CHU_LANGUE_PARLE: any
    CHU_CARTE_SEJOUR: any
    CHU_DATE_CARTE_SEJOUR: any
    CHU_NUMERO_PERMIS: any
    CHU_DATE_PERMIS: any
    CHU_NUMERO_CARTE_ID: any
    CHU_DATE_CARTE_ID: any
    CHU_NUMERO_CARTE_PRO: any
    CHU_DATE_CARTE_PRO: any
    CHU_TCE_ID: any
    CHU_COEFFICIENT: any
    CHU_DATE_DEBUT_CONTRAT: any
    CHU_DATE_FIN_CONTRAT: any
    CHU_DATE_EMBAUCHE: any
    CHU_DATE_CREATION: string
    CHU_NUMERO_SECU: any
    CHU_FLAG_INTERNE: string
    CHU_INFOS: string
    CHU_PJ: string
    CHU_TRI: string
    CHU_FLAG_PLANNING: string
    CHU_GOOGLE_TOKEN: any
    CHU_LAN_ID: string
    CHU_FLAG_BTN_HEURE_KM: string
    CHU_VOI_ID: string
    CHU_DATE_VISITE_MEDICALE: any
    CHU_PHOTO: string
    CHU_REFERENCE_WAYNIUM: string
    CHU_CARTE_QUALIFICATION_CONDUCTEUR: any
    CHU_DATE_VALIDITE_CARTE_CARBURANT: any
    CHU_DATE_VALIDITE_CARTE_QUALIFICAT: any
    CHU_DATE_VALIDITE_CARTE_VERTE: any
    CHU_DATE_VALIDITE_CHRONOTACHYGRAPH: any
    CHU_DATE_VALIDITE_FORMATION_SECOUR: any
    CHU_DATE_VALIDITE_VISITE_MEDICALE: any
    CHU_NOM_FORMATION_SECOURITE: any
    CHU_NUMERO_CARTE_CARBURANT: any
    CHU_NUMERO_CARTE_VERTE: any
    CHU_NUMERO_CHRONOTACHYGRAPHE: any
    CHU_DATE_VALIDITE_CB_PRO: any
    CHU_NUMERO_CHRONO: any
    CHU_DATE_VALIDITE_CHRONO: any
    CHU_FLAG_SMS_POINTAGE: string
    CHU_REF_EXTERNE: any
    CHU_NB_HEURE_MENSUEL: string
  }
  
export function WGetFirstLastLoc(w: Root) {


	const steps = w.C_Gen_EtapePresence;
	const sorted = steps.sort((a, b) => {
		return parseInt(a.EPR_TRI) - parseInt(b.EPR_TRI);
	});
	const filtered = sorted.filter((s) => {
		return s.EPR_FLAG_ANNULER != "1";
	});

	return {
		startLoc: filtered[0].C_Geo_Lieu,
		endLoc: filtered[filtered.length - 1].C_Geo_Lieu
	}
}
