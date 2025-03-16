import { StyleSheet, Platform } from "react-native"

// Base colors
export const colors = {
  primary: "#27374D",
  secondary: "#526D82",
  tertiary: "#9DB2BF",
  background: "#DDE6ED",
  white: "#FFFFFF",
  semiTransparent: "rgba(221, 230, 237, 0.1)",

  // Status colors
  success: "#10B981",
  successDark: "#059669",
  warning: "#F59E0B",
  warningDark: "#D97706",
  error: "#EF4444",
  errorDark: "#B91C1C",
  neutral: "#94A3B8",
  neutralDark: "#64748B",
}

// Trash level thresholds and status
export const trashLevels = {
  // Thresholds
  thresholds: {
    critical: 90,
    warning: 50,
    good: 0,
  },

  // Get status based on trash level
  getStatus: (level: number) => {
    if (level >= trashLevels.thresholds.critical) return "critical"
    if (level >= trashLevels.thresholds.warning) return "warning"
    return "good"
  },

  // Get status text based on trash level
  getStatusText: (level: number) => {
    if (level >= trashLevels.thresholds.critical) return "Critical"
    if (level >= trashLevels.thresholds.warning) return "Warning"
    return "Good"
  },

  // Get color based on trash level
  getColor: (level: number) => {
    if (level >= trashLevels.thresholds.critical) return colors.error
    if (level >= trashLevels.thresholds.warning) return colors.warning
    return colors.success
  },

  // Get gradient colors based on trash level
  getGradientColors: (level: number) => {
    if (level >= trashLevels.thresholds.critical) return [colors.error, colors.errorDark]
    if (level >= trashLevels.thresholds.warning) return [colors.warning, colors.warningDark]
    return [colors.success, colors.successDark]
  },
}

// Shadow styles for cross-platform consistency
export const shadows = {
  small: {
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  medium: {
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  large: {
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
      },
      android: {
        elevation: 8,
      },
    }),
  },
}

// Spacing constants for consistent layout
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
}

// Border radius constants
export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: 9999,
}

// Typography presets
export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: "bold",
    color: colors.primary,
  },
  h2: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.primary,
  },
  h3: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.primary,
  },
  body: {
    fontSize: 16,
    color: colors.primary,
  },
  caption: {
    fontSize: 14,
    color: colors.secondary,
  },
  small: {
    fontSize: 12,
    color: colors.secondary,
  },
}

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background, // Non-layout style
  },
  contentContainer: {
    padding: 16, // Layout style (moved from container)
    justifyContent: "flex-start", // Layout style (moved from container)
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center", // Center content vertically
    padding: 16, // Add padding
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 32,
    marginBottom: 24,
    textAlign: "center",
    color: colors.primary,
    fontWeight: "bold",
  },
  input: {
    height: 50,
    backgroundColor: colors.white,
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    color: colors.primary,
  },
  button: {
    backgroundColor: colors.secondary,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  buttonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "bold",
  },
  linkText: {
    textAlign: "center",
    color: colors.primary,
    fontSize: 16,
  },
  link: {
    color: colors.secondary,
    fontWeight: "bold",
  },
  shadow: {
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  text: {
    fontSize: 16,
    color: colors.primary,
  },
})

