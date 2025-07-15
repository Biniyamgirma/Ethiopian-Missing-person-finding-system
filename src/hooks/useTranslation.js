import { useContext } from "react";
import { AppContext } from "@/contexts/AppContext";
import { translate } from "@/utils/translations"; // Assuming you have a translate function in utils

export function useTranslation() {
    const { language } = useContext(AppContext);

    return {
        t: (key)=>{
            translate(key, language);
        },
        language
    };
}