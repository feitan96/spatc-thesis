import type React from "react"
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from "react-native"
import { colors, shadows } from "../../../src/styles/styles"

interface FormButtonProps {
  title: string
  onPress: () => void
  variant?: "primary" | "secondary" | "outline"
  isLoading?: boolean
  disabled?: boolean
}

const FormButton: React.FC<FormButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  isLoading = false,
  disabled = false,
}) => {
  const getButtonStyle = () => {
    if (disabled) return [styles.button, styles.disabledButton]

    switch (variant) {
      case "secondary":
        return [styles.button, styles.secondaryButton]
      case "outline":
        return [styles.button, styles.outlineButton]
      default:
        return [styles.button, styles.primaryButton]
    }
  }

  const getTextStyle = () => {
    if (disabled) return [styles.buttonText, styles.disabledButtonText]

    switch (variant) {
      case "outline":
        return [styles.buttonText, styles.outlineButtonText]
      default:
        return [styles.buttonText, styles.primaryButtonText]
    }
  }

  return (
    <TouchableOpacity style={getButtonStyle()} onPress={onPress} disabled={isLoading || disabled} activeOpacity={0.8}>
      {isLoading ? (
        <ActivityIndicator color={variant === "outline" ? colors.primary : colors.white} size="small" />
      ) : (
        <Text style={getTextStyle()}>{title}</Text>
      )}
    </TouchableOpacity>
  )
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
  disabledButtonText: {
    color: "#94A3B8",
  },
})

export default FormButton

