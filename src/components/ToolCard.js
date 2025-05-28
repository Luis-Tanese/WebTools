import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "../hooks/useTranslation";

const ToolCard = ({ tool, onToolCardClick }) => {
	const { t } = useTranslation();

	if (tool.isComingSoon) {
		return (
			<div className="tool-card coming-soon-card">
				<h3>
					{tool.icon && <i className={tool.icon}></i>}
					{t(tool.titleKey)}
				</h3>
				<p className="description">{t(tool.descriptionKey)}</p>
				<button className="open-tool-btn disabled-btn" disabled>
					<i className="fas fa-lock"></i> {t("comingSoonButton")}
				</button>
			</div>
		);
	}

	const buttonText = tool.buttonTextKey ? t(tool.buttonTextKey) : t("openToolButton");

	return (
		<div className="tool-card">
			<h3>
				{tool.icon && <i className={tool.icon}></i>}
				{tool.title}
			</h3>
			<p className="description">{tool.description}</p>
			<Link
				to={tool.path}
				className="open-tool-btn"
				onClick={(e) => {
					e.preventDefault();
					onToolCardClick(tool.path);
				}}
			>
				{buttonText}
			</Link>
		</div>
	);
};

export default ToolCard;
