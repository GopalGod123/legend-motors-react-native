import { StyleSheet } from 'react-native';

export default ({ THEME_COLORS, isDark }) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDark ? THEME_COLORS.DARK_BACKGROUND : THEME_COLORS.TEXT_LIGHT,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  logo: {
    width: 150,
    height: 60,
    alignSelf: 'center',
    marginVertical: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginVertical: 25,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
    // color: THEME_COLORS.TEXT_ACCENT
    color: isDark ? THEME_COLORS.LIGHT_GRAY : THEME_COLORS.TEXT_ACCENT
  },
   inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    borderColor: isDark ? THEME_COLORS.ICON_DEFAULT : THEME_COLORS.BORDER_DEFAULT,
    backgroundColor: isDark ? THEME_COLORS.DARK_INPUT_BG : 'transparent',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: isDark ? THEME_COLORS.TEXT_LIGHT :  THEME_COLORS.TEXT_DARK,
  },
  rememberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: THEME_COLORS.SECONDARY_ORANGE,
    borderRadius: 4,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: THEME_COLORS.SECONDARY_ORANGE,
    borderColor: THEME_COLORS.SECONDARY_ORANGE,
  },
  rememberText: {
    fontSize: 14,
    color: THEME_COLORS.TEXT_MEDIUM,
  },
  loginButton: {
    backgroundColor: THEME_COLORS.SECONDARY_ORANGE,
    paddingVertical: 15,
    borderRadius: 8,
    marginBottom: 16,
  },
  loginButtonText: {
    color: isDark ? THEME_COLORS.TEXT_DARK : THEME_COLORS.TEXT_LIGHT,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  forgotPassword: {
    alignItems: 'center',
    marginBottom: 15,
  },
  forgotPasswordText: {
    color: THEME_COLORS.TEXT_MEDIUM,
    color: isDark ? THEME_COLORS.ACCENT_PURPLE_DARK : THEME_COLORS.TEXT_MEDIUM,
    fontSize: 16,
    fontWeight: 600
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 32,
  },
  registerText: {
    color: THEME_COLORS.TEXT_MEDIUM,
    fontSize: 15,
  },
  registerLink: {
    color: THEME_COLORS.SECONDARY_ORANGE,
    fontSize: 14,
    fontWeight: '600',
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderWidth: 1,
    // borderColor: THEME_COLORS.BORDER_LIGHT,
    borderColor: isDark ? THEME_COLORS.ICON_DEFAULT : THEME_COLORS.BORDER_LIGHT,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginVertical: 10,
  },
  socialIcon: {
    marginRight: 10,
  },
  socialButtonText: {
    fontSize: 16,
    // color: THEME_COLORS.TEXT_DARK,
    color: isDark ? THEME_COLORS.TEXT_LIGHT : THEME_COLORS.TEXT_DARK,
  },
});
