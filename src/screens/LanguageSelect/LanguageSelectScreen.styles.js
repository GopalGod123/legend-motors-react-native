import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  backButton: {
    marginBottom: 10,
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginVertical: 25,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#5E366D',
    marginBottom: 30,
    textAlign: 'center',
  },
  languageList: {
    flex: 1,
    backgroundColor: "#000"
  },
  languageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
  },
  languageText: {
    fontSize: 16,
    color: '#212121',
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ED8721',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: '#F4821F',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#F4821F',
  },
  nextButton: {
    backgroundColor: '#ED8721',
    paddingVertical: 15,
    borderRadius: 8,
    marginTop: 25
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
});
