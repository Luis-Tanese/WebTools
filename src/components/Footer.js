import React from "react";
import { useTranslation } from "../hooks/useTranslation";
import "../css/index.css";

const Footer = ({ className }) => {
	const { t } = useTranslation();
	const footerClasses = `app-footer ${className || ""}`.trim();

	return (
		<footer className={footerClasses}>
			<div className="container">
				<p>
					<span>{t("footerMadeWith")}</span>
					<i className="fas fa-heart footer-heart-icon"></i>
					<span>{t("footerBy")}</span>
					<a
						href="https://github.com/Luis-Tanese/WebTools"
						target="_blank"
						rel="noopener noreferrer"
						className="footer-link"
					>
						<span>{t("footerGithubLink")}</span>
						<i className="fab fa-github github-icon"></i>
					</a>
				</p>
			</div>
		</footer>
	);
};

export default Footer;
