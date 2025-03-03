const elements = {
    browserName: document.getElementById("browser-name"),
    browserVersion: document.getElementById("browser-version"),
    userAgent: document.getElementById("user-agent"),
    operatingSystem: document.getElementById("operating-system"),
    screenResolution: document.getElementById("screen-resolution"),
    windowSize: document.getElementById("window-size"),
    colorDepth: document.getElementById("color-depth"),
    cookiesEnabled: document.getElementById("cookies-enabled"),
    language: document.getElementById("language"),
    platform: document.getElementById("platform"),

    ipAddress: document.getElementById("ip-address"),
    country: document.getElementById("country"),
    region: document.getElementById("region"),
    city: document.getElementById("city"),
    timezone: document.getElementById("timezone"),
    isp: document.getElementById("isp"),

    webglSupport: document.getElementById("webgl-support"),
    canvasSupport: document.getElementById("canvas-support"),
    localStorage: document.getElementById("local-storage"),
    sessionStorage: document.getElementById("session-storage"),

    refreshBtn: document.getElementById("refresh-btn"),
    copyBtn: document.getElementById("copy-btn"),
};

const detectBrowser = () => {
    const userAgent = navigator.userAgent;
    let browserName = "Unknown";
    let browserVersion = "Unknown";

    if (userAgent.indexOf("Firefox") > -1) {
        browserName = "Mozilla Firefox";
        browserVersion =
            userAgent.match(/Firefox\/([0-9.]+)/)?.[1] || "Unknown";
    } else if (userAgent.indexOf("SamsungBrowser") > -1) {
        browserName = "Samsung Internet";
        browserVersion =
            userAgent.match(/SamsungBrowser\/([0-9.]+)/)?.[1] || "Unknown";
    } else if (
        userAgent.indexOf("Opera") > -1 ||
        userAgent.indexOf("OPR") > -1
    ) {
        browserName = "Opera";
        browserVersion =
            userAgent.indexOf("Opera") > -1
                ? userAgent.match(/Opera\/([0-9.]+)/)?.[1] || "Unknown"
                : userAgent.match(/OPR\/([0-9.]+)/)?.[1] || "Unknown";
    } else if (userAgent.indexOf("Edg") > -1) {
        browserName = "Microsoft Edge";
        browserVersion = userAgent.match(/Edg\/([0-9.]+)/)?.[1] || "Unknown";
    } else if (userAgent.indexOf("Chrome") > -1) {
        browserName = "Google Chrome";
        browserVersion = userAgent.match(/Chrome\/([0-9.]+)/)?.[1] || "Unknown";
    } else if (userAgent.indexOf("Safari") > -1) {
        browserName = "Apple Safari";
        browserVersion =
            userAgent.match(/Version\/([0-9.]+)/)?.[1] || "Unknown";
    } else if (
        userAgent.indexOf("MSIE") > -1 ||
        userAgent.indexOf("Trident") > -1
    ) {
        browserName = "Internet Explorer";
        browserVersion =
            userAgent.indexOf("MSIE") > -1
                ? userAgent.match(/MSIE ([0-9.]+)/)?.[1] || "Unknown"
                : userAgent.match(/rv:([0-9.]+)/)?.[1] || "Unknown";
    }

    return { browserName, browserVersion };
};

const detectOS = () => {
    const userAgent = navigator.userAgent;
    let os = "Unknown";

    if (userAgent.indexOf("Win") > -1) {
        os = "Windows";
        if (userAgent.indexOf("Windows NT 10.0") > -1) os = "Windows 10/11";
        else if (userAgent.indexOf("Windows NT 6.3") > -1) os = "Windows 8.1";
        else if (userAgent.indexOf("Windows NT 6.2") > -1) os = "Windows 8";
        else if (userAgent.indexOf("Windows NT 6.1") > -1) os = "Windows 7";
    } else if (userAgent.indexOf("Mac") > -1) {
        os = "macOS";
    } else if (userAgent.indexOf("Android") > -1) {
        os = "Android";
    } else if (
        userAgent.indexOf("iOS") > -1 ||
        userAgent.indexOf("iPhone") > -1 ||
        userAgent.indexOf("iPad") > -1
    ) {
        os = "iOS";
    } else if (userAgent.indexOf("Linux") > -1) {
        os = "Linux";
    }

    return os;
};

const checkFeatureSupport = () => {
    let webglSupport = "No";
    try {
        const canvas = document.createElement("canvas");
        webglSupport = !!(
            window.WebGLRenderingContext &&
            (canvas.getContext("webgl") ||
                canvas.getContext("experimental-webgl"))
        )
            ? "Yes"
            : "No";
    } catch (e) {
        webglSupport = "No";
    }

    let canvasSupport = "No";
    try {
        canvasSupport = !!document.createElement("canvas").getContext
            ? "Yes"
            : "No";
    } catch (e) {
        canvasSupport = "No";
    }

    let localStorageSupport = "No";
    try {
        localStorageSupport = !!window.localStorage ? "Yes" : "No";
    } catch (e) {
        localStorageSupport = "No";
    }

    let sessionStorageSupport = "No";
    try {
        sessionStorageSupport = !!window.sessionStorage ? "Yes" : "No";
    } catch (e) {
        sessionStorageSupport = "No";
    }

    return {
        webglSupport,
        canvasSupport,
        localStorageSupport,
        sessionStorageSupport,
    };
};

const fetchIPInfo = async () => {
    try {
        const response = await fetch("https://ipapi.co/json/");
        if (!response.ok) {
            throw new Error("Failed to fetch IP information");
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching IP information:", error);
        return {
            ip: "Failed to load",
            country_name: "Failed to load",
            region: "Failed to load",
            city: "Failed to load",
            timezone: "Failed to load",
            org: "Failed to load",
        };
    }
};

const updateBrowserInfo = () => {
    const { browserName, browserVersion } = detectBrowser();
    const os = detectOS();
    const features = checkFeatureSupport();

    elements.browserName.textContent = browserName;
    elements.browserVersion.textContent = browserVersion;
    elements.userAgent.textContent = navigator.userAgent;
    elements.operatingSystem.textContent = os;
    elements.screenResolution.textContent = `${window.screen.width} x ${window.screen.height}`;
    elements.windowSize.textContent = `${window.innerWidth} x ${window.innerHeight}`;
    elements.colorDepth.textContent = `${window.screen.colorDepth} bits`;
    elements.cookiesEnabled.textContent = navigator.cookieEnabled
        ? "Yes"
        : "No";
    elements.language.textContent =
        navigator.language || navigator.userLanguage || "Unknown";
    elements.platform.textContent = navigator.platform || "Unknown";

    elements.webglSupport.textContent = features.webglSupport;
    elements.canvasSupport.textContent = features.canvasSupport;
    elements.localStorage.textContent = features.localStorageSupport;
    elements.sessionStorage.textContent = features.sessionStorageSupport;
};

const updateIPInfo = async () => {
    const ipInfo = await fetchIPInfo();

    elements.ipAddress.textContent = ipInfo.ip || "Failed to load";
    elements.country.textContent = ipInfo.country_name || "Failed to load";
    elements.region.textContent = ipInfo.region || "Failed to load";
    elements.city.textContent = ipInfo.city || "Failed to load";
    elements.timezone.textContent = ipInfo.timezone || "Failed to load";
    elements.isp.textContent = ipInfo.org || "Failed to load";
};

const copyAllInfo = () => {
    let infoText = "BROWSER INFORMATION\n\n";

    infoText += "Browser Details:\n";
    infoText += `Browser Name: ${elements.browserName.textContent}\n`;
    infoText += `Browser Version: ${elements.browserVersion.textContent}\n`;
    infoText += `User Agent: ${elements.userAgent.textContent}\n`;
    infoText += `Operating System: ${elements.operatingSystem.textContent}\n`;
    infoText += `Screen Resolution: ${elements.screenResolution.textContent}\n`;
    infoText += `Window Size: ${elements.windowSize.textContent}\n`;
    infoText += `Color Depth: ${elements.colorDepth.textContent}\n`;
    infoText += `Cookies Enabled: ${elements.cookiesEnabled.textContent}\n`;
    infoText += `Language: ${elements.language.textContent}\n`;
    infoText += `Platform: ${elements.platform.textContent}\n\n`;

    infoText += "IP Information:\n";
    infoText += `IP Address: ${elements.ipAddress.textContent}\n`;
    infoText += `Country: ${elements.country.textContent}\n`;
    infoText += `Region: ${elements.region.textContent}\n`;
    infoText += `City: ${elements.city.textContent}\n`;
    infoText += `Timezone: ${elements.timezone.textContent}\n`;
    infoText += `ISP: ${elements.isp.textContent}\n\n`;

    infoText += "Feature Detection:\n";
    infoText += `WebGL Support: ${elements.webglSupport.textContent}\n`;
    infoText += `Canvas Support: ${elements.canvasSupport.textContent}\n`;
    infoText += `Local Storage: ${elements.localStorage.textContent}\n`;
    infoText += `Session Storage: ${elements.sessionStorage.textContent}\n`;

    navigator.clipboard
        .writeText(infoText)
        .then(() => {
            alert("Information copied to clipboard!");
        })
        .catch((err) => {
            console.error("Failed to copy information: ", err);
            alert("Failed to copy information to clipboard.");
        });
};

const init = () => {
    updateBrowserInfo();

    updateIPInfo();

    elements.refreshBtn.addEventListener("click", () => {
        updateBrowserInfo();
        updateIPInfo();
    });

    elements.copyBtn.addEventListener("click", copyAllInfo);

    window.addEventListener("resize", () => {
        elements.windowSize.textContent = `${window.innerWidth} x ${window.innerHeight}`;
    });
};

document.addEventListener("DOMContentLoaded", init);
