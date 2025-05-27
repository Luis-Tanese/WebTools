import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import ToolCard from "../components/ToolCard";
import Footer from "../components/Footer";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { useTranslation } from "../hooks/useTranslation";
import "../css/index.css";
import SuggestToolPopup from "../components/SuggestToolPopup";

const HomePage = () => {
	const { t, getTools, language } = useTranslation();
	const [searchTerm, setSearchTerm] = useState("");
	const [allTools, setAllTools] = useState([]);
	const [filteredTools, setFilteredTools] = useState([]);

	useEffect(() => {
		const title = t("pageTitle");
		const description = t("homePageDescription") || t("defaultMetaDescription");
		document.title = title;

		let metaDescription = document.querySelector('meta[name="description"]');
		if (metaDescription) {
			metaDescription.setAttribute("content", description);
		} else {
			metaDescription = document.createElement("meta");
			metaDescription.name = "description";
			metaDescription.content = description;
			document.getElementsByTagName("head")[0].appendChild(metaDescription);
		}
		document.documentElement.lang = language.startsWith("pt") ? "pt-BR" : "en";
	}, [t, language]);

	useEffect(() => {
		const toolsForCurrentLang = getTools();
		setAllTools(toolsForCurrentLang);
		setFilteredTools(toolsForCurrentLang);
	}, [getTools, language, t]);

	useEffect(() => {
		if (!searchTerm) {
			setFilteredTools(allTools);
			return;
		}
		const lowerSearchTerm = searchTerm.toLowerCase();
		const results = allTools.filter((tool) => {
			const title = tool.title || t(tool.titleKey) || "";
			const description = tool.description || t(tool.descriptionKey) || "";

			const titleMatch = title.toLowerCase().includes(lowerSearchTerm);
			const descriptionMatch = description.toLowerCase().includes(lowerSearchTerm);
			const keywordsMatch =
				tool.searchKeywords &&
				tool.searchKeywords.some(
					(keyword) => typeof keyword === "string" && keyword.toLowerCase().includes(lowerSearchTerm)
				);
			return titleMatch || descriptionMatch || keywordsMatch;
		});
		setFilteredTools(results);
	}, [searchTerm, allTools, t]);

	const handleSearchChange = (event) => {
		setSearchTerm(event.target.value);
	};

	return (
		<>
			<LanguageSwitcher />
			<SuggestToolPopup />
			<div className="page-content-wrapper">
				<div className="container">
					<Header onSearch={handleSearchChange} />
					<main>
						<div id="tools-grid" className="tools-grid">
							{filteredTools.length > 0 ? (
								filteredTools.map((tool, index) => (
									<ToolCard key={tool.path + index + (tool.title || tool.titleKey)} tool={tool} />
								))
							) : (
								<p className="no-tools-message">{t("noToolsFound")}</p>
							)}
						</div>
					</main>
				</div>
			</div>
			<Footer />
		</>
	);
};

export default HomePage;
