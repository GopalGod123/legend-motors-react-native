import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useTheme, themeColors} from '../context/ThemeContext';

const PrivacyPolicyScreen = () => {
  const navigation = useNavigation();
  const {theme, isDark} = useTheme();

  return (
    <SafeAreaView
      style={[
        styles.container,
        {backgroundColor: isDark ? '#2D2D2D' : themeColors[theme].background},
      ]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}>
              <Text style={[styles.backButtonText, {color: themeColors[theme].primary}]}>
                ← Back
              </Text>
            </TouchableOpacity>
            <Text style={[styles.headerTitle, {color: themeColors[theme].text}]}>
              Privacy Policy
            </Text>
          </View>
          <Text style={[styles.lastUpdated, {color: themeColors[theme].primary}]}>
            Last Updated: 5th May 2025
          </Text>
        </View>

        <View style={styles.content}>
          <Text style={[styles.paragraph, {color: themeColors[theme].text}]}>
            Legend Motors ("we," "us," or "our") is committed to protecting your privacy. 
            This Privacy Policy explains how we collect, use, disclose, and safeguard your 
            personal information when you visit our website https://legendmotorsglobal.com/ 
            and use our services.
          </Text>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, {color: themeColors[theme].text}]}>
              1. Information We Collect
            </Text>
            <Text style={[styles.paragraph, {color: themeColors[theme].text}]}>
              We collect the following types of personal information:
            </Text>
            <Text style={[styles.bulletPoint, {color: themeColors[theme].text}]}>
              • Contact Details: Name, email address, phone number, and location (country/city).
            </Text>
            <Text style={[styles.bulletPoint, {color: themeColors[theme].text}]}>
              • Usage Data: Pages visited, time spent, clicks, and other behavioral data.
            </Text>
            <Text style={[styles.bulletPoint, {color: themeColors[theme].text}]}>
              • Device & Technical Data: IP address, browser type, device information, and cookies.
            </Text>
            <Text style={[styles.bulletPoint, {color: themeColors[theme].text}]}>
              • Other Information: Any other information you voluntarily provide via forms or correspondence.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, {color: themeColors[theme].text}]}>
              2. How We Collect Information
            </Text>
            <Text style={[styles.paragraph, {color: themeColors[theme].text}]}>
              We collect information in the following ways:
            </Text>
            <Text style={[styles.bulletPoint, {color: themeColors[theme].text}]}>
              • Directly from you: When you fill out forms, contact us, or interact with our website features.
            </Text>
            <Text style={[styles.bulletPoint, {color: themeColors[theme].text}]}>
              • Automatically: Through cookies and analytics tools (Google Analytics, CleverTap) that track user behavior and technical data.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, {color: themeColors[theme].text}]}>
              3. How We Use Your Information
            </Text>
            <Text style={[styles.paragraph, {color: themeColors[theme].text}]}>
              We use your information to:
            </Text>
            <Text style={[styles.bulletPoint, {color: themeColors[theme].text}]}>
              • Provide and improve our services.
            </Text>
            <Text style={[styles.bulletPoint, {color: themeColors[theme].text}]}>
              • Respond to your inquiries and requests.
            </Text>
            <Text style={[styles.bulletPoint, {color: themeColors[theme].text}]}>
              • Personalize your experience on our website.
            </Text>
            <Text style={[styles.bulletPoint, {color: themeColors[theme].text}]}>
              • Analyze website usage and user behavior for optimization.
            </Text>
            <Text style={[styles.bulletPoint, {color: themeColors[theme].text}]}>
              • Send you updates, offers, or information (with your consent).
            </Text>
            <Text style={[styles.bulletPoint, {color: themeColors[theme].text}]}>
              • Comply with legal obligations.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, {color: themeColors[theme].text}]}>
              4. Sharing Your Information
            </Text>
            <Text style={[styles.paragraph, {color: themeColors[theme].text}]}>
              We may share your information with:
            </Text>
            <Text style={[styles.bulletPoint, {color: themeColors[theme].text}]}>
              • Service Providers: Such as analytics and marketing partners (Google Analytics, Clever Tap) who help us operate and improve our website.
            </Text>
            <Text style={[styles.bulletPoint, {color: themeColors[theme].text}]}>
              • Legal Authorities: If required by law or to protect our rights and safety.
            </Text>
            <Text style={[styles.bulletPoint, {color: themeColors[theme].text}]}>
              • Business Transfers: In the event of a merger, acquisition, or sale of assets, your information may be transferred as permitted by law.
            </Text>
            <Text style={[styles.paragraph, {color: themeColors[theme].text, marginTop: 8}]}>
              We do not sell your personal information to third parties.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, {color: themeColors[theme].text}]}>
              5. Data Retention
            </Text>
            <Text style={[styles.paragraph, {color: themeColors[theme].text}]}>
              We retain your personal information only as long as necessary to fulfill the purposes described in this policy or as required by law.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, {color: themeColors[theme].text}]}>
              6. Your Rights
            </Text>
            <Text style={[styles.paragraph, {color: themeColors[theme].text}]}>
              Depending on your location (including the EU and UAE), you have the right to:
            </Text>
            <Text style={[styles.bulletPoint, {color: themeColors[theme].text}]}>
              • Access, correct, or delete your personal information.
            </Text>
            <Text style={[styles.bulletPoint, {color: themeColors[theme].text}]}>
              • Withdraw consent for data processing at any time.
            </Text>
            <Text style={[styles.bulletPoint, {color: themeColors[theme].text}]}>
              • Object to or restrict certain processing activities.
            </Text>
            <Text style={[styles.bulletPoint, {color: themeColors[theme].text}]}>
              • Request data portability.
            </Text>
            <Text style={[styles.bulletPoint, {color: themeColors[theme].text}]}>
              • Lodge a complaint with supervisory authority.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, {color: themeColors[theme].text}]}>
              7. Data Security
            </Text>
            <Text style={[styles.paragraph, {color: themeColors[theme].text}]}>
              We implement appropriate technical and organizational measures to protect your personal information from unauthorized access, disclosure, alteration, or destruction.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, {color: themeColors[theme].text}]}>
              8. International Transfers
            </Text>
            <Text style={[styles.paragraph, {color: themeColors[theme].text}]}>
              Your data may be transferred to and processed in countries outside your own. We ensure appropriate safeguards are in place to protect your information in accordance with applicable laws.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, {color: themeColors[theme].text}]}>
              9. Children's Privacy
            </Text>
            <Text style={[styles.paragraph, {color: themeColors[theme].text}]}>
              Our website is not intended for children under the age of 16. We do not knowingly collect personal information from children.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, {color: themeColors[theme].text}]}>
              10. Updates to This Policy
            </Text>
            <Text style={[styles.paragraph, {color: themeColors[theme].text}]}>
              We may update this Privacy Policy from time to time. Changes will be posted on this page, and significant updates will be communicated via email or website notification.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, {color: themeColors[theme].text}]}>
              11. Contact Us
            </Text>
            <Text style={[styles.paragraph, {color: themeColors[theme].text}]}>
              If you have any questions or requests regarding this Privacy Policy or your personal information, please contact us at:
            </Text>
            <Text style={[styles.paragraph, {color: themeColors[theme].text, marginTop: 8}]}>
              Legend Motors
            </Text>
            <Text style={[styles.paragraph, {color: themeColors[theme].text}]}>
              Email: support@legendmotorsuae.com
            </Text>
            <Text style={[styles.paragraph, {color: themeColors[theme].text}]}>
              Website: https://legendmotorsglobal.com
            </Text>
          </View>

          <View style={styles.footer}>
            <Text style={[styles.footerText, {color: themeColors[theme].primary}]}>
              Note: This policy is compliant with the EU General Data Protection Regulation (GDPR), UAE Federal Decree-Law No. 45/2021, and other applicable privacy laws.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding:12
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
  },
  lastUpdated: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 8,
  },
  bulletPoint: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 4,
    paddingLeft: 8,
  },
  footer: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#CCCCCC',
  },
  footerText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
});

export default PrivacyPolicyScreen; 