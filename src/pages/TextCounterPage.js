import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "../hooks/useTranslation";
import "../css/text-counter.css"; 

const stopWordsDefault = {
	en: new Set([
		"a",
		"an",
		"and",
		"the",
		"is",
		"it",
		"in",
		"on",
		"of",
		"for",
		"to",
		"with",
		"by",
		"as",
		"at",
		"this",
		"that",
		"or",
		"but",
		"not",
		"from",
		"i",
		"you",
		"he",
		"she",
		"we",
		"they",
		"me",
		"him",
		"her",
		"us",
		"them",
		"my",
		"your",
		"his",
		"its",
		"our",
		"their",
		"was",
		"were",
		"be",
		"been",
		"has",
		"have",
		"had",
		"do",
		"does",
		"did",
		"will",
		"would",
		"should",
		"can",
		"could",
		"may",
		"might",
		"must",
		"am",
		"are",
	]),
	pt_BR: new Set([
		"a",
		"o",
		"e",
		"é",
		"um",
		"uma",
		"de",
		"do",
		"da",
		"em",
		"no",
		"na",
		"para",
		"por",
		"com",
		"como",
		"mas",
		"ou",
		"se",
		"que",
		"ele",
		"ela",
		"nós",
		"eles",
		"elas",
		"meu",
		"minha",
		"seu",
		"sua",
		"nosso",
		"nossa",
		"deles",
		"delas",
		"foi",
		"era",
		"ser",
		"ter",
		"estar",
		"tem",
		"tinha",
		"está",
		"estava",
		"fazer",
		"pode",
		"poderia",
		"deve",
		"eu",
		"você",
		"mim",
		"lhe",
		"nos",
		"lhes",
	]),
};

const formatTime = (totalSeconds, t) => {
	if (totalSeconds === 0) return `0 ${t("tcSecShort") || "sec"}`;
	const minutes = Math.floor(totalSeconds / 60);
	const seconds = totalSeconds % 60;
	let timeString = "";
	if (minutes > 0) {
		timeString += `${minutes} ${t("tcMinShort") || "min"}`;
	}
	if (seconds > 0) {
		if (minutes > 0) timeString += " ";
		timeString += `${seconds} ${t("tcSecShort") || "sec"}`;
	}
	return timeString || `0 ${t("tcSecShort") || "sec"}`;
};

const TextCounterPage = () => {
	const { t, language } = useTranslation();
	const [text, setText] = useState("");
	const [stats, setStats] = useState({
		words: 0,
		characters: 0,
		charsNoSpace: 0,
		sentences: 0,
		paragraphs: 0,
		lines: 0,
		readingTime: formatTime(0, t),
		speakingTime: formatTime(0, t),
		avgWordsPerSentence: 0,
		avgCharsPerWord: 0,
		uniqueWords: 0,
		topKeywords: [],
	});

	const [numKeywords, setNumKeywords] = useState(5);
	const [minKeywordLength, setMinKeywordLength] = useState(3);
	const [ignoreNumbersInKeywords, setIgnoreNumbersInKeywords] = useState(true);

	const calculateStats = useCallback(
		(inputText) => {
			if (!inputText.trim()) {
				setStats({
					words: 0,
					characters: 0,
					charsNoSpace: 0,
					sentences: 0,
					paragraphs: 0,
					lines: 0,
					readingTime: formatTime(0, t),
					speakingTime: formatTime(0, t),
					avgWordsPerSentence: 0,
					avgCharsPerWord: 0,
					uniqueWords: 0,
					topKeywords: [],
				});
				return;
			}

			const lines = inputText.split(/\r\n|\r|\n/).length;
			const wordsArray = inputText.match(/\b[-'\w\u00C0-\u00FF]+\b/gi) || [];
			const words = wordsArray.length;
			const characters = inputText.length;
			const charsNoSpace = inputText.replace(/\s/g, "").length;

			const sentencesArray = inputText.match(/[^.!?]+[.!?]+(\s+|$)/g) || [];
			const sentences = sentencesArray.length || (words > 0 ? 1 : 0);

			const paragraphs = inputText.split(/\n\s*\n/).filter((p) => p.trim() !== "").length || (words > 0 ? 1 : 0);

			const wordsPerMinuteRead = 225;
			const readingTimeTotalSeconds = words > 0 ? Math.ceil((words / wordsPerMinuteRead) * 60) : 0;
			const readingTime = formatTime(readingTimeTotalSeconds, t);

			const wordsPerMinuteSpeak = 130;
			const speakingTimeTotalSeconds = words > 0 ? Math.ceil((words / wordsPerMinuteSpeak) * 60) : 0;
			const speakingTime = formatTime(speakingTimeTotalSeconds, t);

			const avgWordsPerSentence = sentences > 0 ? parseFloat((words / sentences).toFixed(1)) : 0;
			const totalCharsInWords = wordsArray.reduce((acc, word) => acc + word.length, 0);
			const avgCharsPerWord = words > 0 ? parseFloat((totalCharsInWords / words).toFixed(1)) : 0;

			const currentStopWords = stopWordsDefault[language] || stopWordsDefault.en;
			const wordFrequencies = {};
			const uniqueWordSet = new Set();

			wordsArray.forEach((word) => {
				const lowerWord = word.toLowerCase();
				uniqueWordSet.add(lowerWord);

				const isNumeric = /^\d+$/.test(lowerWord);
				if (ignoreNumbersInKeywords && isNumeric) return;

				if (lowerWord.length >= minKeywordLength && !currentStopWords.has(lowerWord)) {
					wordFrequencies[lowerWord] = (wordFrequencies[lowerWord] || 0) + 1;
				}
			});
			const sortedKeywords = Object.entries(wordFrequencies)
				.sort(([, a], [, b]) => b - a)
				.slice(0, numKeywords)
				.map(([keyword, count]) => ({
					keyword,
					count,
					density: words > 0 ? parseFloat(((count / words) * 100).toFixed(2)) : 0,
				}));

			setStats({
				words,
				characters,
				charsNoSpace,
				sentences,
				paragraphs,
				lines,
				readingTime,
				speakingTime,
				avgWordsPerSentence,
				avgCharsPerWord,
				uniqueWords: uniqueWordSet.size,
				topKeywords: sortedKeywords,
			});
		},
		[t, language, numKeywords, minKeywordLength, ignoreNumbersInKeywords]
	);

	useEffect(() => {
		calculateStats(text);
	}, [text, calculateStats]);

	const handleInputChange = (event) => {
		setText(event.target.value);
	};

	const handleClearText = () => {
		setText("");
	};

	return (
		<div className="container tc-container">
			<header className="tool-header">
				<h1>{t("tcPageTitle")}</h1>
				<p className="subtitle">{t("tcPageSubtitle")}</p>
			</header>

			<main className="tc-main">
				<div className="tc-input-area">
					<textarea
						id="text-input-analyzer"
						rows="10"
						placeholder={t("tcInputPlaceholder")}
						value={text}
						onChange={handleInputChange}
					/>
					{text && (
						<button onClick={handleClearText} className="tool-btn-secondary clear-btn">
							<i className="fas fa-times-circle"></i> {t("tcClearText")}
						</button>
					)}
				</div>

				<div className="tc-options-area">
					<h2>{t("tcOptionsHeader")}</h2>
					<div className="tc-options-grid">
						<div className="tc-option-item">
							<label htmlFor="num-keywords">{t("tcNumKeywordsLabel")}</label>
							<input
								type="number"
								id="num-keywords"
								value={numKeywords}
								min="1"
								max="20"
								onChange={(e) => setNumKeywords(parseInt(e.target.value, 10))}
							/>
						</div>
						<div className="tc-option-item">
							<label htmlFor="min-keyword-length">{t("tcMinKeywordLengthLabel")}</label>
							<input
								type="number"
								id="min-keyword-length"
								value={minKeywordLength}
								min="1"
								max="10"
								onChange={(e) => setMinKeywordLength(parseInt(e.target.value, 10))}
							/>
						</div>
						<div className="tc-option-item tc-checkbox-option">
							<input
								type="checkbox"
								id="ignore-numbers"
								checked={ignoreNumbersInKeywords}
								onChange={(e) => setIgnoreNumbersInKeywords(e.target.checked)}
							/>
							<label htmlFor="ignore-numbers">{t("tcIgnoreNumbersLabel")}</label>
						</div>
					</div>
				</div>

				<div className="tc-stats-area">
					<h2>{t("tcStatsHeader")}</h2>
					<div className="stats-grid">
						<div className="stat-item">
							<span className="stat-label">{t("tcWords")}</span>
							<span className="stat-value">{stats.words}</span>
						</div>
						<div className="stat-item">
							<span className="stat-label">{t("tcChars")}</span>
							<span className="stat-value">{stats.characters}</span>
						</div>
						<div className="stat-item">
							<span className="stat-label">{t("tcCharsNoSpace")}</span>
							<span className="stat-value">{stats.charsNoSpace}</span>
						</div>
						<div className="stat-item">
							<span className="stat-label">{t("tcSentences")}</span>
							<span className="stat-value">{stats.sentences}</span>
						</div>
						<div className="stat-item">
							<span className="stat-label">{t("tcParagraphs")}</span>
							<span className="stat-value">{stats.paragraphs}</span>
						</div>
						<div className="stat-item">
							<span className="stat-label">{t("tcLines")}</span>
							<span className="stat-value">{stats.lines}</span>
						</div>
						<div className="stat-item">
							<span className="stat-label">{t("tcReadingTime")}</span>
							<span className="stat-value">{stats.readingTime}</span>
						</div>
						<div className="stat-item">
							<span className="stat-label">{t("tcSpeakingTime")}</span>
							<span className="stat-value">{stats.speakingTime}</span>
						</div>
					</div>
				</div>

				<div className="tc-stats-area">
					<h2>{t("tcAdvancedStatsHeader")}</h2>
					<div className="stats-grid">
						<div className="stat-item">
							<span className="stat-label">{t("tcAvgWordsPerSentence")}</span>
							<span className="stat-value">{stats.avgWordsPerSentence}</span>
						</div>
						<div className="stat-item">
							<span className="stat-label">{t("tcAvgCharsPerWord")}</span>
							<span className="stat-value">{stats.avgCharsPerWord}</span>
						</div>
						<div className="stat-item">
							<span className="stat-label">{t("tcUniqueWords")}</span>
							<span className="stat-value">{stats.uniqueWords}</span>
						</div>
					</div>
				</div>

				<div className="tc-keywords-area">
					<h2>{t("tcKeywordsHeader")}</h2>
					<ul className="top-keywords-list">
						{stats.topKeywords.length > 0 ? (
							stats.topKeywords.map(({ keyword, count, density }) => (
								<li key={keyword}>
									<span className="keyword-name">{keyword}</span>
									<div className="keyword-details">
										<span className="keyword-density">
											{t("tcKeywordDensity")}: {density}%
										</span>
										<span className="keyword-count">{count}</span>
									</div>
								</li>
							))
						) : (
							<li>{t("tcNoKeywords")}</li>
						)}
					</ul>
				</div>
			</main>
		</div>
	);
};

export default TextCounterPage;
