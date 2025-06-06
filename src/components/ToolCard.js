import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "../hooks/useTranslation";
import "../css/tool-card.css";

const ToolCard = ({ tool, onToolCardClick, isLoading, index }) => {
	const { t } = useTranslation();

	const formatVisits = (num) => {
		if (num >= 1000000) {
			return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "m";
		}
		if (num >= 1000) {
			return (num / 1000).toFixed(1).replace(/\.0$/, "") + "k";
		}
		return num;
	};

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
	const cardClasses = `tool-card ${!isLoading ? "loaded" : ""}`;
	const contentStyle = !isLoading ? { transitionDelay: `${index * 50}ms` } : {};

	return (
		<div className={cardClasses}>
			<div className="tool-card-content-grid">
				<div className="tool-card-skeleton" style={contentStyle}>
					<div className="skeleton-line skeleton-title"></div>
					<div className="skeleton-line skeleton-description"></div>
					<div className="skeleton-line skeleton-description short"></div>
				</div>

				<div className="tool-card-content" style={contentStyle}>
					{typeof tool.visits === "number" && tool.path !== "/suggestions" && (
						<div className="tool-card-stats" title={t("toolVisits")}>
							<i className="fas fa-eye"></i>
							<span>{formatVisits(tool.visits)}</span>
						</div>
					)}
					<h3>
						{tool.icon && <i className={tool.icon}></i>}
						{t(tool.titleKey)}
					</h3>
					<p className="description">{t(tool.descriptionKey)}</p>
				</div>
			</div>

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
