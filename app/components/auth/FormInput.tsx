"use client"

import type React from "react"
import { useState } from "react"
import { View, TextInput, StyleSheet, Text, TouchableOpacity } from "react-native"
import { colors } from "../../../src/styles/styles"
import { Eye, EyeOff } from "lucide-react-native"

interface FormInputProps {
  label: string
  value: string
  onChangeText: (text: string) => void
  placeholder?: string
  secureTextEntry?: boolean
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad"
  autoCapitalize?: "none" | "sentences" | "words" | "characters"
  icon?: React.ReactNode
  error?: string
  multiline?: boolean
  numberOfLines?: number
}

const FormInput: React.FC<FormInputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = "default",
  autoCapitalize = "none",
  icon,
  error,
  multiline = false,
  numberOfLines = 1,
}) => {
  const [isFocused, setIsFocused] = useState(false)
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible)
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputContainerFocused,
          error && styles.inputContainerError,
          multiline && styles.multilineContainer,
        ]}
      >
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <TextInput
          style={[styles.input, icon && styles.inputWithIcon, multiline && styles.multilineInput]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.tertiary}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines : 1}
        />
        {secureTextEntry && (
          <TouchableOpacity style={styles.visibilityToggle} onPress={togglePasswordVisibility}>
            {isPasswordVisible ? (
              <EyeOff size={20} color={colors.secondary} />
            ) : (
              <Eye size={20} color={colors.secondary} />
            )}
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.tertiary,
    borderRadius: 12,
    backgroundColor: colors.white,
    height: 56,
    paddingHorizontal: 16,
  },
  inputContainerFocused: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  inputContainerError: {
    borderColor: "#e74c3c",
  },
  multilineContainer: {
    height: "auto",
    minHeight: 100,
    alignItems: "flex-start",
  },
  iconContainer: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.primary,
    height: "100%",
  },
  inputWithIcon: {
    paddingLeft: 0,
  },
  multilineInput: {
    textAlignVertical: "top",
    paddingTop: 16,
  },
  visibilityToggle: {
    padding: 4,
  },
  errorText: {
    color: "#e74c3c",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
})

export default FormInput

