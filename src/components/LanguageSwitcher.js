import React from "react";
import { useTranslation } from "../hooks/useTranslation";
import "../css/index.css";

const LanguageSwitcher = () => {
	const { language, setLanguage } = useTranslation();

	return (
		<div className="language-switcher">
			<button onClick={() => setLanguage("en")} className={language === "en" ? "active" : ""}>
				EN
			</button>
			<button onClick={() => setLanguage("pt_BR")} className={language === "pt_BR" ? "active" : ""}>
				PT-BR
			</button>
		</div>
	);
};

export default LanguageSwitcher;
