import React, { createContext, useState, useEffect, useCallback } from "react";
import enStrings from "../locales/en.json";
import ptBRStrings from "../locales/pt_BR.json";
import enTools from "../locales/tools_en.js";
import ptBRTools from "../locales/tools_pt_BR.js";

export const LanguageContext = createContext();

const translations = {
	en: { strings: enStrings, tools: enTools },
	pt_BR: { strings: ptBRStrings, tools: ptBRTools },
};

export const LanguageProvider = ({ children }) => {
	const [language, setLanguage] = useState(localStorage.getItem("preferredLang") || "en");

	useEffect(() => {
		localStorage.setItem("preferredLang", language);
	}, [language]);

	const t = useCallback(
		(key, options = {}) => {
			let translation = translations[language]?.strings[key] || translations.en.strings[key] || key;

			if (typeof translation === "string" && options) {
				Object.keys(options).forEach((optionKey) => {
					const regex = new RegExp(`{{${optionKey}}}`, "g");
					translation = translation.replace(regex, options[optionKey]);
				});
			}
			return translation;
		},
		[language]
	);

	const getTools = useCallback(() => {
		return translations[language]?.tools || translations.en.tools;
	}, [language]);

	return (
		<LanguageContext.Provider value={{ language, setLanguage, t, getTools }}>{children}</LanguageContext.Provider>
	);
};
