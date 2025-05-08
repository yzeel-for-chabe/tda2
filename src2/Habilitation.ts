import { children_flattener } from "./core/childrenFlattener"

export interface HabilitationResponseBeforeParsing {
    userId: number
    oId: string
    cliId: string
    sfAccountId: string
    email: string
    industry: string
    dispatch: string
    mobilePhone: string
    firstName: string
    lastName: string
    subAccounts: SubAccountBeforeParsing[]
    rights: string[]
    contactId: string
  }
  
  export interface SubAccountBeforeParsing {
    cliId: string
    dispatch: string
  }

  export interface HabilitationResponse {
    userId: number
    oId: string
    cliId: string
    sfAccountId: string
    email: string
    industry: string
    dispatch: string
    mobilePhone: string
    firstName: string
    lastName: string
    subAccounts: SubAccount[]
    rights: string[]
    contactId: string
  }
  
  export interface SubAccount {
    cliId: number
    dispatch: string
  }

export class Habilitation {

    public static parseHabilitationResponse(response:string): HabilitationResponse {
        const data = JSON.parse(response) as HabilitationResponseBeforeParsing;

        // cliId is a string in the response, but we want it to be a number
        //  however, if it's still a number, we ignore the entry altogether
        //  because it means it's not found in Waynium

		const allelements = children_flattener<SubAccount>([data.account]);

        const subAccounts: SubAccount[] = allelements.map(subAccount => {
            const cliId = parseInt(subAccount.cliId);
            if (!isNaN(cliId)) {
                return { cliId, dispatch: subAccount.dispatch };
            }
            return null;
        })
        .filter(subAccount => subAccount !== null) as SubAccount[];

		const tags = data.rights;
		if(tags.includes("CustomerPortal.Access")) {
			document.querySelector("li:has(#nav-dashboard)").style.display = "block";
			document.querySelector("li:has(#nav-passenger)")!.style.display = "block";
		}

        return {
            ...data,
            subAccounts
        }

    }

}
