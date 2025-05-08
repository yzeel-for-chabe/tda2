import { createContext, useContext } from "react";

export type UserSelectionContextType = {
    selectedMission: number | null;
    hasUserMovedMap: boolean;
    textfilter: string;
    onlyShowCancelled: boolean;
    onlyShowMeetGreets: boolean;
    showTraffic: boolean;
    setSelectedMission: (missionId: number | null) => void;
    setHasUserMovedMap: (hasUserMovedMap: boolean) => void;
    setTextFilter: (textFilter: string) => void;
    setOnlyShowCancelled: (onlyShowCancelled: boolean) => void;
    setOnlyShowMeetGreets: (onlyShowMeetGreets: boolean) => void;
    setShowTraffic: (showTraffic: boolean) => void;
};

const UserSelectionContext = createContext<UserSelectionContextType | null>(null);

export const useUserSelectionContext = () => {
    const context = useContext(UserSelectionContext);
    if (!context) {
        throw new Error("UserSelectionContext must be used within a UserSelectionContext.Provider");
    }
    return context;
}

export default UserSelectionContext;

