import React, { useState, useEffect, useCallback, useMemo } from "react";
import Fuse from "fuse.js";
import Header from "../components/Header";
import ToolCard from "../components/ToolCard";
import { useTranslation } from "../hooks/useTranslation";
import { usePageTransition } from "../hooks/usePageTransition";
import "../css/index.css";
import "../css/tool-card.css";

const API_BASE_URL = "https://web-tools-server.vercel.app";

const HomePage = () => {
	const { t, getTools, language } = useTranslation();
	const { triggerPageTransition } = usePageTransition();
	const [searchTerm, setSearchTerm] = useState("");
	const [tools, setTools] = useState(() => getTools().map((tool) => ({ ...tool, isLoading: true })));

	const fetchAndProcessTools = useCallback(async () => {
		const staticTools = getTools();
		try {
			const response = await fetch(`${API_BASE_URL}/api/tools/stats`);
			if (!response.ok) throw new Error("Stats fetch failed");
			const stats = await response.json();

			const suggestionTool = staticTools.find((tool) => tool.path === "/suggestions");
			const regularTools = staticTools.filter((tool) => tool.path !== "/suggestions");

			const toolsWithVisits = regularTools.map((tool) => ({
				...tool,
				visits: stats[tool.path] || 0,
			}));

			toolsWithVisits.sort((a, b) => (b.visits || 0) - (a.visits || 0));

			const processedTools = [...toolsWithVisits];
			if (suggestionTool) {
				processedTools.push(suggestionTool);
			}
			setTools(processedTools.map((tool) => ({ ...tool, isLoading: false })));
		} catch (error) {
			console.error("Failed to fetch tool stats, loading static data as fallback.", error);
			setTools(staticTools.map((tool) => ({ ...tool, isLoading: false })));
		}
	}, [getTools]);

	useEffect(() => {
		const title = t("pageTitle");
		//const description = t("homePageDescription") || t("defaultMetaDescription");
		document.title = title;
		document.documentElement.lang = language.startsWith("pt") ? "pt-BR" : "en";
	}, [t, language]);

	useEffect(() => {
		fetchAndProcessTools();
	}, [fetchAndProcessTools]);

	const handleSearchChange = (event) => {
		setSearchTerm(event.target.value);
	};

	const handleToolCardClick = (path) => {
		triggerPageTransition(path);
	};

	const fuse = useMemo(() => {
		const translatedTools = tools.map((tool) => ({
			...tool,
			title: t(tool.titleKey),
			description: t(tool.descriptionKey),
		}));
		return new Fuse(translatedTools, {
			keys: ["title", "description", "searchKeywords"],
			threshold: 0.4,
		});
	}, [tools, t]);

	const filteredTools = useMemo(() => {
		if (!searchTerm) {
			return tools;
		}
		return fuse.search(searchTerm).map((result) => result.item);
	}, [searchTerm, tools, fuse]);

	return (
		<>
			<div className="container">
				<Header onSearch={handleSearchChange} />
				<main>
					<div id="tools-grid" className="tools-grid">
						{filteredTools.map((tool, index) => (
							<ToolCard
								key={tool.path}
								tool={tool}
								onToolCardClick={handleToolCardClick}
								isLoading={tool.isLoading}
								index={index}
							/>
						))}
						{filteredTools.length === 0 && !tools.some((t) => t.isLoading) && (
							<p className="no-tools-message">{t("noToolsFound")}</p>
						)}
					</div>
				</main>
			</div>
		</>
	);
};

export default HomePage;
