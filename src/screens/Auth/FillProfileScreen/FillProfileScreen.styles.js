import { StyleSheet } from "react-native";

export default ({ THEME_COLORS, isDark }) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDark ? THEME_COLORS.DARK_BACKGROUND : THEME_COLORS.TEXT_LIGHT,
  },
  dropdown: {
    borderRadius: 10,
    padding: 20
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: isDark ? THEME_COLORS.TEXT_LIGHT : THEME_COLORS.DARK_BORDER,
    marginLeft: 10,
  },
  imageContainer: {
    alignItems: 'center',
    marginVertical: 15,
    position: 'relative'
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  placeholderImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIcon: {
    fontSize: 40,
    color: '#F4821F',
  },
  form: {
    padding: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderWidth: 1,
    // borderColor: THEME_COLORS.BORDER_DEFAULT,
    borderColor: isDark ? THEME_COLORS.ICON_DEFAULT : THEME_COLORS.BORDER_LIGHT,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: isDark ? THEME_COLORS.TEXT_LIGHT :  THEME_COLORS.TEXT_DARK,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 15
  },
  countryCode: {
    padding: 12,
    borderRightWidth: 1,
    borderRightColor: '#E0E0E0',
    backgroundColor: '#F5F5F5',
  },
  phoneInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: '#333333',
  },
  continueButton: {
    backgroundColor: '#CCCCCC',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  activeButton: {
    backgroundColor: '#F4821F',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  closeButton: {
    fontSize: 18,
    color: '#666666',
  },
  datePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pickerColumn: {
    flex: 1,
    marginHorizontal: 5,
  },
  pickerLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 5,
    textAlign: 'center',
  },
  picker: {
    height: 150,
  },
  confirmButton: {
    backgroundColor: '#F4821F',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  profileEditIcon: {
    position: 'absolute',
    bottom: '-10%',
    right: '35%',
    zIndex: 1000
  }

  
});