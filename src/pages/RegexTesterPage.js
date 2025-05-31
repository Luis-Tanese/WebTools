import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslation } from "../hooks/useTranslation";
import { useToast } from "../hooks/useToast";
import "../css/regex-tester.css";

const regexSamples = [
	{
		nameKey: "rtSampleEmail",
		pattern: "^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$",
		flags: "gm",
		testString: "silly@tanese.com\ninvalid-email\nsales.cat@domain.com.br\nsillycat@gmail.com",
	},
	{
		nameKey: "rtSampleUrl",
		pattern: "https?://[^\\s/$.?#].[^\\s]*",
		flags: "gi",
		testString: "Visit https://tanese.com or http://tools.tanese.com for more info.",
	},
	{ nameKey: "rtSampleDigits", pattern: "\\d+", flags: "g", testString: "There are 123 apples and 456 oranges." },
];

const cheatsheetData = [
	{ term: ".", descKey: "rtCheatDot" },
	{ term: "\\d", descKey: "rtCheatDigit" },
	{ term: "\\D", descKey: "rtCheatNonDigit" },
	{ term: "\\w", descKey: "rtCheatWordChar" },
	{ term: "\\W", descKey: "rtCheatNonWordChar" },
	{ term: "\\s", descKey: "rtCheatWhitespace" },
	{ term: "\\S", descKey: "rtCheatNonWhitespace" },
	{ term: "[abc]", descKey: "rtCheatCharSet" },
	{ term: "[^abc]", descKey: "rtCheatNegCharSet" },
	{ term: "[a-z]", descKey: "rtCheatRange" },
	{ term: "^", descKey: "rtCheatStartLine" },
	{ term: "$", descKey: "rtCheatEndLine" },
	{ term: "*", descKey: "rtCheatZeroOrMore" },
	{ term: "+", descKey: "rtCheatOneOrMore" },
	{ term: "?", descKey: "rtCheatZeroOrOne" },
	{ term: "{n}", descKey: "rtCheatExactlyN" },
	{ term: "{n,}", descKey: "rtCheatNOrMore" },
	{ term: "{n,m}", descKey: "rtCheatNToM" },
	{ term: "(...)", descKey: "rtCheatGroup" },
	{ term: "|", descKey: "rtCheatOr" },
];

const RegexTesterPage = () => {
	const { t } = useTranslation();
	const { showToast } = useToast();
	const [pattern, setPattern] = useState("\\b\\w{5,}\\b");
	const [flags, setFlags] = useState({ g: true, i: false, m: false, s: false, u: false, y: false });
	const [testString, setTestString] = useState(
		"A quick brown fox jumps over the lazy dog.\nRegular expressions are powerful."
	);
	const [matches, setMatches] = useState([]);

	const selectedFlags = useMemo(() => {
		return Object.entries(flags)
			.filter(([, value]) => value)
			.map(([key]) => key)
			.join("");
	}, [flags]);

	const processRegex = useCallback(() => {
		if (!pattern) {
			setMatches([]);
			return;
		}
		try {
			const regex = new RegExp(pattern, selectedFlags);
			let currentMatch;
			const foundMatches = [];

			if (selectedFlags.includes("g")) {
				while ((currentMatch = regex.exec(testString)) !== null) {
					foundMatches.push({
						fullMatch: currentMatch[0],
						index: currentMatch.index,
						groups: currentMatch.slice(1),
					});
					if (regex.lastIndex === currentMatch.index) {
						regex.lastIndex++;
					}
				}
			} else {
				currentMatch = regex.exec(testString);
				if (currentMatch) {
					foundMatches.push({
						fullMatch: currentMatch[0],
						index: currentMatch.index,
						groups: currentMatch.slice(1),
					});
				}
			}
			setMatches(foundMatches);
		} catch (e) {
			showToast(`${t("rtErrorInvalidRegex")}: ${e.message}`, "error");
			setMatches([]);
		}
	}, [pattern, selectedFlags, testString, t, showToast]);

	useEffect(() => {
		const handler = setTimeout(() => {
			processRegex();
		}, 300);
		return () => clearTimeout(handler);
	}, [pattern, selectedFlags, testString, processRegex]);

	const handleFlagChange = (flag) => {
		setFlags((prev) => ({ ...prev, [flag]: !prev[flag] }));
	};

	const loadSample = (sample) => {
		setPattern(sample.pattern);
		const newFlags = { g: false, i: false, m: false, s: false, u: false, y: false };
		for (const char of sample.flags) {
			if (newFlags.hasOwnProperty(char)) newFlags[char] = true;
		}
		setFlags(newFlags);
		setTestString(sample.testString);
	};

	const HighlightedText = ({ text, matches }) => {
		if (!matches || matches.length === 0 || !pattern) {
			return <>{text}</>;
		}

		let lastIndex = 0;
		const parts = [];
		const sortedMatches = [...matches].sort((a, b) => a.index - b.index);

		sortedMatches.forEach((match, i) => {
			if (match.index > lastIndex) {
				parts.push(text.substring(lastIndex, match.index));
			}
			parts.push(
				<span key={`match-${i}`} className="match">
					{match.fullMatch}
				</span>
			);
			lastIndex = match.index + match.fullMatch.length;
		});

		if (lastIndex < text.length) {
			parts.push(text.substring(lastIndex));
		}
		return <>{parts}</>;
	};

	return (
		<div className="container rt-container">
			<header className="tool-header">
				<h1>{t("rtPageTitle")}</h1>
				<p className="subtitle">{t("rtPageSubtitle")}</p>
			</header>

			<main className="rt-main">
				<div className="rt-regex-input-area">
					<div className="regex-field">
						<span className="regex-delimiter">/</span>
						<input
							type="text"
							id="regex-pattern"
							value={pattern}
							onChange={(e) => setPattern(e.target.value)}
							placeholder={t("rtRegexInputPlaceholder")}
							aria-label={t("rtRegexInputLabel")}
						/>
						<span className="regex-delimiter">/</span>
					</div>
					<div className="rt-regex-flags">
						{Object.keys(flags).map((flag) => (
							<label key={flag} title={t(`rtFlag_${flag}_title`)}>
								<input type="checkbox" checked={flags[flag]} onChange={() => handleFlagChange(flag)} />
								<span>{flag}</span>
							</label>
						))}
					</div>
				</div>

				<div className="rt-editor-preview-layout">
					<div className="rt-editor-column">
						<div className="rt-test-string-area">
							<h3>{t("rtTestStringHeader")}</h3>
							<div
								id="highlighted-test-area"
								className="highlighted-text-area"
								style={{
									minHeight:
										document.getElementById("regex-test-string")?.clientHeight + "px" || "150px",
								}}
							>
								<HighlightedText text={testString} matches={matches} />
							</div>
							<textarea
								id="regex-test-string"
								value={testString}
								onChange={(e) => setTestString(e.target.value)}
								placeholder={t("rtTestStringPlaceholder")}
								spellCheck="false"
								style={{ display: "none" }}
							/>
							<h4 style={{ marginTop: "10px", fontSize: "0.9em", opacity: "0.7" }}>
								{t("rtEditBelowLabel")}
							</h4>
							<textarea
								id="regex-test-string-editor"
								value={testString}
								onChange={(e) => setTestString(e.target.value)}
								placeholder={t("rtTestStringPlaceholder")}
								spellCheck="false"
								style={{
									width: "100%",
									minHeight: "150px",
									marginTop: "5px",
									padding: "10px",
									fontFamily: "var(--font-family)",
									fontSize: "1em",
									lineHeight: "1.6",
									border: "1px solid var(--color-border)",
									backgroundColor: "var(--color-background)",
									color: "var(--color-text)",
									borderRadius: "var(--border-radius)",
								}}
							/>
						</div>
					</div>

					<div className="rt-preview-column">
						<div className="rt-matches-area">
							<h3>
								{t("rtMatchesHeader")} ({matches.length})
							</h3>
							{matches.length > 0 ? (
								<ul className="rt-matches-list">
									{matches.map((match, index) => (
										<li key={index}>
											<span className="match-index">
												{t("rtMatchLabel")} {index + 1}:
											</span>
											<code>{match.fullMatch}</code>
											{match.groups && match.groups.length > 0 && (
												<div>
													{match.groups.map(
														(group, gIndex) =>
															group !== undefined && (
																<div key={gIndex} style={{ marginLeft: "20px" }}>
																	<span className="group-index">
																		{t("rtGroupLabel")} {gIndex + 1}:
																	</span>
																	<code>{group}</code>
																</div>
															)
													)}
												</div>
											)}
										</li>
									))}
								</ul>
							) : (
								<p className="no-matches">
									{pattern ? t("rtNoMatchesFound") : t("rtEnterRegexPrompt")}
								</p>
							)}
						</div>
					</div>
				</div>

				<div className="rt-samples-area">
					<h3>{t("rtSamplesHeader")}</h3>
					<div className="rt-samples-list">
						{regexSamples.map((sample) => (
							<button key={sample.nameKey} onClick={() => loadSample(sample)}>
								{t(sample.nameKey)}
							</button>
						))}
					</div>
				</div>

				<div className="rt-cheatsheet-area">
					<h3>{t("rtCheatsheetHeader")}</h3>
					<div className="rt-cheatsheet-content">
						<dl>
							{cheatsheetData.map((item) => (
								<React.Fragment key={item.term}>
									<dt>{item.term}</dt>
									<dd>{t(item.descKey)}</dd>
								</React.Fragment>
							))}
						</dl>
					</div>
				</div>
			</main>
		</div>
	);
};

export default RegexTesterPage;
