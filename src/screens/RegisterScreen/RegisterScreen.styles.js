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
    // borderColor: THEME_COLORS.BORDER_DEFAULT,
    borderColor: isDark ? THEME_COLORS.ICON_DEFAULT : THEME_COLORS.BORDER_LIGHT,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: isDark ? THEME_COLORS.TEXT_LIGHT :  THEME_COLORS.TEXT_DARK,
  },
  primaryButton: {
    backgroundColor: isDark ? THEME_COLORS.ACCENT_ORANGE : THEME_COLORS.PRIMARY,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  primaryButtonText: {
    // color: THEME_COLORS.TEXT_LIGHT,
    color: isDark ? THEME_COLORS.TEXT_DARK : THEME_COLORS.TEXT_LIGHT,
    fontSize: 16,
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 20
  },
  loginTextRegular: {
    fontSize: 14,
    color: '#666',
  },
  loginTextLink: {
    fontSize: 14,
    color: THEME_COLORS.PRIMARY,
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
  guestButton: {
    width: '90%',
    marginLeft: '5%',
    marginVertical: 10,
    height: 50,
    borderWidth: 1,
    // borderColor: THEME_COLORS.PRIMARY_LIGHT,
    borderColor: isDark ? THEME_COLORS.ICON_DEFAULT : THEME_COLORS.PRIMARY_LIGHT,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: THEME_COLORS.BACKGROUND_SECONDARY
    backgroundColor: isDark ? THEME_COLORS.CHARCOAL : THEME_COLORS.BACKGROUND_SECONDARY
  },
  guestButtonText: {
    fontSize: 16,
    color: isDark? THEME_COLORS.ACCENT_ORANGE : THEME_COLORS.PRIMARY,
    fontWeight: '600',
  },
});
