import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import NotFoundPage from "./pages/NotFoundPage";
import QRCodeGeneratorPage from "./pages/QRCodeGeneratorPage";
import MarkdownEditorPage from "./pages/MarkdownEditorPage";
import Base64ConverterPage from "./pages/Base64ConverterPage";
import TextCounterPage from "./pages/TextCounterPage";
import JsonFormatterPage from "./pages/JsonFormatterPage";
import ImageConverterPage from "./pages/ImageConverterPage";
import RegexTesterPage from "./pages/RegexTesterPage";
import BrowserInfoPage from "./pages/BrowserInfoPage";
import DataConverterPage from "./pages/DataConverterPage";
import UnitConverterPage from "./pages/UnitConverterPage";
import ColorConverterPage from "./pages/ColorConverterPage";
import SubnetCalculatorPage from "./pages/SubnetCalculatorPage";
import LoremIpsumGeneratorPage from "./pages/LoremIpsumGeneratorPage";
import FaviconGeneratorPage from "./pages/FaviconGeneratorPage";
import HashGeneratorPage from "./pages/HashGeneratorPage";
import UrlShortenerPage from "./pages/UrlShortenerPage";
import UniversalBaseConverterPage from "./pages/UniversalBaseConverterPage";
import ManiaDanCalculatorPage from "./pages/ManiaDanCalculatorPage";
import AudioConverterPage from "./pages/AudioConverterPage";
import LoadingScreen from "./components/LoadingScreen";
import SuggestionPage from "./pages/SuggestionPage";
import { LanguageProvider } from "./contexts/LanguageContext";
import { ToastProvider } from "./contexts/ToastContext";
import ToastContainer from "./components/ToastContainer";
import { TransitionProvider } from "./contexts/TransitionContext";
import RootLayout from "./components/RootLayout";
import ScrollToTop from "./components/ScrollToTop";

function App() {
	const [isLoading, setIsLoading] = useState(true);
	const [isFadingOut, setIsFadingOut] = useState(false);

	useEffect(() => {
		const displayDuration = 700;
		const fadeOutDuration = 300;

		const fadeTimer = setTimeout(() => {
			setIsFadingOut(true);
		}, displayDuration);

		const loadTimer = setTimeout(() => {
			setIsLoading(false);
		}, displayDuration + fadeOutDuration);

		return () => {
			clearTimeout(fadeTimer);
			clearTimeout(loadTimer);
		};
	}, []);

	if (isLoading) {
		return <LoadingScreen fadingOut={isFadingOut} />;
	}

	return (
		<ToastProvider>
			<Router>
				<ScrollToTop />
				<TransitionProvider>
					<LanguageProvider>
						<Routes>
							<Route path="/" element={<RootLayout />}>
								<Route index element={<HomePage />} />
								<Route
									element={
										<Layout pageTitleKey="qrPageTitle" pageDescriptionKey="qrPageDescription" />
									}
								>
									<Route path="tools/qr-generator" element={<QRCodeGeneratorPage />} />
								</Route>
								<Route
									element={
										<Layout pageTitleKey="mdPageTitle" pageDescriptionKey="mdPageDescription" />
									}
								>
									<Route path="tools/markdown-editor" element={<MarkdownEditorPage />} />
								</Route>
								<Route
									element={
										<Layout pageTitleKey="b64PageTitle" pageDescriptionKey="b64PageDescription" />
									}
								>
									<Route path="tools/base64-converter" element={<Base64ConverterPage />} />
								</Route>
								<Route
									element={
										<Layout pageTitleKey="tcPageTitle" pageDescriptionKey="tcPageDescription" />
									}
								>
									<Route path="tools/text-counter" element={<TextCounterPage />} />
								</Route>
								<Route
									element={
										<Layout pageTitleKey="jfPageTitle" pageDescriptionKey="jfPageDescription" />
									}
								>
									<Route path="tools/json-formatter" element={<JsonFormatterPage />} />
								</Route>
								<Route
									element={
										<Layout pageTitleKey="icPageTitle" pageDescriptionKey="icPageDescription" />
									}
								>
									<Route path="tools/image-converter" element={<ImageConverterPage />} />
								</Route>
								<Route
									element={
										<Layout pageTitleKey="rtPageTitle" pageDescriptionKey="rtPageDescription" />
									}
								>
									<Route path="tools/regex-tester" element={<RegexTesterPage />} />
								</Route>
								<Route
									element={
										<Layout pageTitleKey="biPageTitle" pageDescriptionKey="biPageDescription" />
									}
								>
									<Route path="tools/browser-info" element={<BrowserInfoPage />} />
								</Route>
								<Route
									element={
										<Layout pageTitleKey="dcPageTitle" pageDescriptionKey="dcPageDescription" />
									}
								>
									<Route path="tools/data-converter" element={<DataConverterPage />} />
								</Route>
								<Route
									element={
										<Layout pageTitleKey="ucPageTitle" pageDescriptionKey="ucPageDescription" />
									}
								>
									<Route path="tools/unit-converter" element={<UnitConverterPage />} />
								</Route>
								<Route
									element={
										<Layout pageTitleKey="ccPageTitle" pageDescriptionKey="ccPageDescription" />
									}
								>
									<Route path="tools/color-converter" element={<ColorConverterPage />} />
								</Route>
								<Route
									element={
										<Layout pageTitleKey="scPageTitle" pageDescriptionKey="scPageDescription" />
									}
								>
									<Route path="tools/subnet-calculator" element={<SubnetCalculatorPage />} />
								</Route>
								<Route
									element={
										<Layout pageTitleKey="lipPageTitle" pageDescriptionKey="lipPageDescription" />
									}
								>
									<Route path="tools/lorem-ipsum-generator" element={<LoremIpsumGeneratorPage />} />
								</Route>
								<Route
									element={
										<Layout pageTitleKey="fgPageTitle" pageDescriptionKey="fgPageDescription" />
									}
								>
									<Route path="tools/favicon-generator" element={<FaviconGeneratorPage />} />
								</Route>
								<Route
									element={
										<Layout pageTitleKey="hgPageTitle" pageDescriptionKey="hgPageDescription" />
									}
								>
									<Route path="tools/hash-generator" element={<HashGeneratorPage />} />
								</Route>
								<Route
									element={
										<Layout pageTitleKey="usPageTitle" pageDescriptionKey="usPageDescription" />
									}
								>
									<Route path="tools/url-shortener" element={<UrlShortenerPage />} />
								</Route>
								<Route
									element={
										<Layout pageTitleKey="ubcPageTitle" pageDescriptionKey="ubcPageDescription" />
									}
								>
									<Route
										path="tools/universal-base-converter"
										element={<UniversalBaseConverterPage />}
									/>
								</Route>
								<Route
									element={
										<Layout pageTitleKey="mdcPageTitle" pageDescriptionKey="mdcPageDescription" />
									}
								>
									<Route path="tools/mania-dan-calculator" element={<ManiaDanCalculatorPage />} />
								</Route>
								<Route
									path="/tools/audio-converter"
									element={<Layout pageTitleKey="acPageTitle" pageDescriptionKey="acPageSubtitle" />}
								>
									<Route index element={<AudioConverterPage />} />
								</Route>
								<Route
									element={
										<Layout
											pageTitleKey="suggestionsPageTitle"
											pageDescriptionKey="suggestionsPageDescription"
										/>
									}
								>
									<Route path="suggestions" element={<SuggestionPage />} />
								</Route>
								<Route path="*" element={<NotFoundPage />} />
							</Route>
						</Routes>
					</LanguageProvider>
				</TransitionProvider>
			</Router>
			<ToastContainer />
			<div className={`transition-overlay ${isFadingOut ? "fade-out" : isLoading ? "active" : ""}`}></div>
		</ToastProvider>
	);
}

export default App;
