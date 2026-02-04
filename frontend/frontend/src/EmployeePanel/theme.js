export const EMP_THEME = {
    lilacMist: "#E6C7E6",       // Backgrounds
    softViolet: "#A3779D",      // Secondary elements, borders, muted text
    royalAmethyst: "#663399",   // Primary buttons, headings, active states
    midnightPlum: "#2E1A47",    // Sidebar, dark text, contrast backgrounds
    deepPlum: "#1D102D",        // Main background
    gold: "#FBBF24",
    white: "#FFFFFF"
};

export const COMMON_STYLES = {
    pageContainer: {
        minHeight: "100vh",
        background: EMP_THEME.lilacMist,
        padding: "2rem",
        fontFamily: "'Inter', sans-serif",
        color: EMP_THEME.midnightPlum
    },
    card: {
        background: EMP_THEME.white,
        borderRadius: "20px",
        border: `1px solid ${EMP_THEME.lilacMist}`,
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)"
    },
    gradientHeader: `linear-gradient(135deg, ${EMP_THEME.royalAmethyst} 0%, ${EMP_THEME.softViolet} 100%)`
};
