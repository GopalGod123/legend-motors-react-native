import React, { useState, useEffect, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Image,
    ScrollView,
    Platform,
    Modal,
    Alert,
    ActivityIndicator,
    Pressable,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import BackArrow from '../../../components/BackArrow';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'react-native-image-picker';
import { registerUser } from '../../../services/api';
import { useTheme } from 'src/context/ThemeContext';
import makeStyles from './FillProfileScreen.styles';
import defaultProfile from '../../../assets/images/default.png';
import EditQuare from '../../../assets/images/edit-square.png';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DatePickerModal from './DatePickerModal';

const FillProfileScreen = () => {
    const { THEME_COLORS, isDark } = useTheme();
    const navigation = useNavigation();
    const route = useRoute();
    const styles = makeStyles({ THEME_COLORS, isDark });

    const { email = '', registrationToken = '' } = route.params || {};

    const currentDate = new Date();
   const [secureEntry, setSecureEntry] = useState(true);
   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [profileImage, setProfileImage] = useState(null);
    const [showDateModal, setShowDateModal] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email,
        phone: '',
        location: '',
        dateOfBirth: currentDate,
        gender: '',
        password: '',
        confirmPassword: '',
    });

    const [datePickerValue, setDatePickerValue] = useState({
        day: currentDate.getDate(),
        month: currentDate.getMonth() + 1,
        year: currentDate.getFullYear(),
    });

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December',
    ].map((label, i) => ({ value: i + 1, label }));

    const years = Array.from({ length: 100 }, (_, i) => currentDate.getFullYear() - i);
    const getDaysInMonth = (month, year) => new Date(year, month, 0).getDate();

    const days = Array.from(
        { length: getDaysInMonth(datePickerValue.month, datePickerValue.year) },
        (_, i) => i + 1
    );

    const showAlert = (title, message) => Alert.alert(title, message);

    const validateForm = () => {
        const { firstName, lastName, email, password, confirmPassword } = formData;

        if (!firstName.trim()) return showAlert('Error', 'First name is required');
        if (!lastName.trim()) return showAlert('Error', 'Last name is required');
        if (!email.trim()) return showAlert('Error', 'Email is required');
        if (!password) return showAlert('Error', 'Password is required');
        if (password !== confirmPassword) return showAlert('Error', 'Passwords do not match');

        return true;
    };

    const handleImagePick = () => {
        ImagePicker.launchImageLibrary({ mediaType: 'photo', quality: 0.8 }, (response) => {
            if (response?.assets?.[0]) {
                setProfileImage(response.assets[0].uri);
            }
        });
    };

    const handleDateChange = () => {
        setShowDateModal(false);
        const selectedDate = new Date(datePickerValue.year, datePickerValue.month - 1, datePickerValue.day);
        setFormData(prev => ({ ...prev, dateOfBirth: selectedDate }));
    };

    const formatDate = (date) => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${month}/${day}/${year}`;
    };

    const formatPhone = (phone) => phone.startsWith('+') ? phone : `+${phone}`;

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            const {
                firstName, lastName, dateOfBirth, phone,
                location, gender, email, password
            } = formData;

            const payload = {
                firstName,
                lastName,
                dateOfBirth: dateOfBirth.toISOString().split('T')[0],
                phone: formatPhone(phone),
                location: location || null,
                gender: gender || null,
                email,
                password,
                registrationToken
            };

            console.log('Registration payload:', JSON.stringify(payload));

            const response = await registerUser(payload);
            console.log('Registration response:', response);

            showAlert(
                'Registration Successful',
                'Your account has been created successfully! Please login with your credentials.',
                [
                    {
                        text: 'OK',
                        onPress: () => navigation.replace('Login', {
                            email,
                            fromRegistration: true
                        })
                    }
                ]
            );
            navigation.navigate('Main')
        } catch (error) {
            console.error('Registration error:', error);
            showAlert('Registration Failed', error.toString());
        } finally {
            setLoading(false);
        }
    };

   const isFormValid = useMemo(() => {
    const { firstName, lastName, email, password, confirmPassword } = formData;
    return (
        firstName.trim() &&
        lastName.trim() &&
        email.trim() &&
        password &&
        confirmPassword &&
        password === confirmPassword
    );
}, [formData]);

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <BackArrow color={isDark ? THEME_COLORS.TEXT_LIGHT : THEME_COLORS.DARK_BACKGROUND} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Fill Your Profile</Text>
            </View>

            <View style={styles.imageContainer}>
                <TouchableOpacity onPress={handleImagePick} style={styles.profileEditIcon}>
                    <Image source={EditQuare} />
                </TouchableOpacity>
                {profileImage ? (
                    <Image source={{ uri: profileImage }} style={styles.profileImage} />
                ) : (
                    <View style={styles.placeholderImage}>
                        <Image source={defaultProfile} style={styles.profileImage} />
                    </View>
                )}
            </View>

            <View style={styles.form}>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="First Name *"
                        placeholderTextColor="#999"
                        value={formData.firstName}
                        onChangeText={(text) => setFormData(prev => ({ ...prev, firstName: text }))}
                    />
                </View>

                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Last Name *"
                        value={formData.lastName}
                        placeholderTextColor="#999"
                        onChangeText={(text) => setFormData(prev => ({ ...prev, lastName: text }))}
                    />
                </View>

                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        placeholderTextColor="#999"
                        keyboardType="email-address"
                        value={formData.email}
                        editable={false}
                        onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
                    />
                    <Ionicons name="mail" size={20} color={isDark ? THEME_COLORS.LAVENDER_GRAY : THEME_COLORS.TEXT_ACCENT} />
                </View>

                <View style={styles.phoneContainer}>
                    <Text style={styles.countryCode}>🇺🇸 +1</Text>
                    <TextInput
                        style={styles.phoneInput}
                        placeholder="Phone Number *"
                        placeholderTextColor="#999"
                        value={formData.phone}
                        onChangeText={(text) => setFormData(prev => ({ ...prev, phone: text }))}
                        keyboardType="phone-pad"
                    />
                </View>

                <TouchableOpacity
                    style={styles.inputContainer}
                    onPress={() => {/* TODO: Implement location picker */ }}>
                    <TextInput
                        style={styles.input}
                        placeholder="Location"
                        value={formData.location}
                        placeholderTextColor="#999"
                        editable={false}
                    />
                    {/* <Text style={styles.inputIcon}>📍</Text> */}
                </TouchableOpacity>

                <Pressable style={styles.inputContainer} onPress={() => setShowDateModal(true)}>
                    <TextInput
                        style={styles.input}
                        placeholderTextColor="#999"
                        placeholder="Date of Birth"
                        value={formatDate(formData.dateOfBirth)}
                        editable={false}
                    />
                    <Ionicons
                        name="calendar-outline"
                        size={22}
                        color={THEME_COLORS.PURPLE_DEEP}
                    />
                </Pressable>

                <View style={[styles.inputContainer, styles.dropdown]}>
                    <Picker
                        selectedValue={formData.gender}
                        style={styles.input}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}>
                        <Picker.Item label="Select Gender" value="" />
                        <Picker.Item label="Male" value="Male" />
                        <Picker.Item label="Female" value="Female" />
                        <Picker.Item label="Other" value="Other" />
                    </Picker>
                </View>

                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholderTextColor="#999"
                        placeholder="Password *"
                        value={formData.password}
                        secureTextEntry={secureEntry}
                        onChangeText={(text) => setFormData(prev => ({ ...prev, password: text }))}
                    />
                    <TouchableOpacity onPress={() => setSecureEntry(!secureEntry)}>
                        <Ionicons
                            name={secureEntry ? 'eye-off' : 'eye'}
                            size={20}
                            color={isDark ? THEME_COLORS.LAVENDER_GRAY : THEME_COLORS.TEXT_ACCENT}
                        />
                    </TouchableOpacity>
                </View>

                <View style={[styles.inputContainer]}>
                    <TextInput
                        style={styles.input}
                        placeholderTextColor="#999"
                        placeholder="Confirm Password *"
                        value={formData.confirmPassword}
                        secureTextEntry={showConfirmPassword}
                        onChangeText={(text) => setFormData(prev => ({ ...prev, confirmPassword: text }))}
                    />
                    <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                        <Ionicons
                            name={showConfirmPassword ? 'eye-off' : 'eye'}
                            size={20}
                            color={isDark ? THEME_COLORS.LAVENDER_GRAY : THEME_COLORS.TEXT_ACCENT}
                        />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={[styles.continueButton, { backgroundColor: isFormValid ? THEME_COLORS.SECONDARY_ORANGE : THEME_COLORS.DISABLED_GRAY }]}
                    onPress={handleSubmit}
                    disabled={loading}>
                    {loading ? (<ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (<Text style={styles.continueButtonText}>Continue</Text>)}
                </TouchableOpacity>
            </View>

            <DatePickerModal
                showDateModal={showDateModal}
                setShowDateModal={setShowDateModal}
                datePickerValue={datePickerValue}
                setDatePickerValue={setDatePickerValue}
                handleDateChange={handleDateChange}
                months={months}
                days={days}
                years={years}
            />

        </ScrollView>
    );
};



export default FillProfileScreen; 