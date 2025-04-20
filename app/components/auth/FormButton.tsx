import type React from "react"
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { colors, shadows } from "../../../src/styles/styles"

interface FormButtonProps {
  title: string
  onPress: () => void
  variant?: "primary" | "secondary" | "outline" | "error"
  isLoading?: boolean
  disabled?: boolean
  icon?: React.ReactNode
}

const FormButton: React.FC<FormButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  isLoading = false,
  disabled = false,
  icon,
}) => {
  const getButtonStyle = () => {
    if (disabled) return [styles.button, styles.disabledButton]

    switch (variant) {
      case "secondary":
        return [styles.button, styles.secondaryButton]
      case "outline":
        return [styles.button, styles.outlineButton]
      case "error":
        return [styles.button, styles.errorButton]
      default:
        return [styles.button, styles.primaryButton]
    }
  }

  const getTextStyle = () => {
    if (disabled) return [styles.buttonText, styles.disabledButtonText]

    switch (variant) {
      case "outline":
        return [styles.buttonText, styles.outlineButtonText]
      case "error":
        return [styles.buttonText, styles.errorButtonText]
      default:
        return [styles.buttonText, styles.primaryButtonText]
    }
  }

  const renderButtonContent = () => (
    <View style={styles.buttonContent}>
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      {isLoading ? (
        <ActivityIndicator color={colors.white} size="small" />
      ) : (
        <Text style={[getTextStyle(), icon ? styles.buttonTextWithIcon : null]}>{title}</Text>
      )}
    </View>
  )

  const renderButton = () => {
    if (disabled) {
      return (
        <TouchableOpacity style={getButtonStyle()} onPress={onPress} disabled={isLoading || disabled} activeOpacity={0.8}>
          {renderButtonContent()}
        </TouchableOpacity>
      )
    }

    if (variant === "primary") {
      return (
        <TouchableOpacity onPress={onPress} disabled={isLoading || disabled} activeOpacity={0.8}>
          <LinearGradient
            colors={[colors.primary, colors.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.button, styles.primaryButton]}
          >
            {renderButtonContent()}
          </LinearGradient>
        </TouchableOpacity>
      )
    }

    if (variant === "error") {
      return (
        <TouchableOpacity onPress={onPress} disabled={isLoading || disabled} activeOpacity={0.8}>
          <LinearGradient
            colors={[colors.error, colors.errorDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.button, styles.errorButton]}
          >
            {renderButtonContent()}
          </LinearGradient>
        </TouchableOpacity>
      )
    }

    return (
      <TouchableOpacity style={getButtonStyle()} onPress={onPress} disabled={isLoading || disabled} activeOpacity={0.8}>
        {renderButtonContent()}
      </TouchableOpacity>
    )
  }

  return renderButton()
}

const styles = StyleSheet.create({
  button: {
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 8,
    ...shadows.small,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer: {
    marginRight: 8,
  },
  buttonTextWithIcon: {
    marginLeft: 4,
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  secondaryButton: {
    backgroundColor: colors.secondary,
  },
  outlineButton: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: colors.primary,
  },
  errorButton: {
    backgroundColor: colors.error,
  },
  disabledButton: {
    backgroundColor: "#E2E8F0",
    borderWidth: 0,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  primaryButtonText: {
    color: colors.white,
  },
  outlineButtonText: {
    color: colors.primary,
  },
  errorButtonText: {
    color: colors.white,
  },
  disabledButtonText: {
    color: "#94A3B8",
  },
})

export default FormButton

