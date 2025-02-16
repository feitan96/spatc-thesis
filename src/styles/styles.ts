// src/styles.ts
import { StyleSheet, Platform } from 'react-native';

export const colors = {
  primary: '#27374D',
  secondary: '#526D82',
  tertiary: '#9DB2BF',
  background: '#DDE6ED',
  white: '#FFFFFF',
  semiTransparent: 'rgba(221, 230, 237, 0.1)',
};

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 32,
    marginBottom: 24,
    textAlign: 'center',
    color: colors.primary,
    fontWeight: 'bold',
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
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkText: {
    textAlign: 'center',
    color: colors.primary,
    fontSize: 16,
  },
  link: {
    color: colors.secondary,
    fontWeight: 'bold',
  },shadow: {
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
});