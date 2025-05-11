import {StyleSheet} from 'react-native';

export default ({ THEME_COLORS, isDark }) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDark ? THEME_COLORS.DARK_BACKGROUND : THEME_COLORS.TEXT_LIGHT,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  headerTitle: {
    fontSize: 14,
    color: '#888888',
    fontWeight: '400',
  },
  profileContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: isDark ? THEME_COLORS.TEXT_LIGHT: THEME_COLORS.TEXT_DARK,
  },
  editIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: isDark ? THEME_COLORS.TEXT_LIGHT: THEME_COLORS.TEXT_DARK,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editIconText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginTop: -8,
  },
  profileInfoContainer: {
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 5
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 82,
    height: 82,
    borderRadius: 41,
  },
  badgeContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F47B20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeIcon: {
    width: 12,
    height: 8,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: 'white',
    transform: [{rotate: '-45deg'}],
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  userPhone: {
    fontSize: 14,
    color: '#888888',
    marginBottom: 16,
  },
  menuContainer: {
    width: '100%',
    marginTop: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    // borderBottomWidth: 1,
    // borderBottomColor: '#F5F5F5',
  },
  menuIconContainer: {
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#333333',
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageValue: {
    fontSize: 14,
    color: '#7A40C6',
    marginRight: 8,
  },
  profileSubHeader: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  logo: {
    width: 30,
    height: 30
  },
  logoutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 4,
  },
  logoutIconContainer: {
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutText: {
    fontSize: 16,
    color: '#FF3B30',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#212121',
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // paddingHorizontal: 16,
    paddingVertical: 12,
    // borderBottomWidth: 1,
    // borderBottomColor: '#E0E0E0',
  },

  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8, // or use marginRight
  },
  toggleLabel: {
    fontSize: 16,
    color: '#212121',
  },
});
