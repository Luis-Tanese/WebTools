import { useContext } from "react";
import { LanguageContext } from "../contexts/LanguageContext";

export const useTranslation = () => {
	return useContext(LanguageContext);
};
