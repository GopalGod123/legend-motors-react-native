import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TextInput,
  FlatList,
  ActivityIndicator,
  Alert,
  Dimensions,
  Linking,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Svg, {Path, Circle} from 'react-native-svg';
import {getFaqCategories} from '../services/api';
import {useTheme, themeColors} from '../context/ThemeContext';
import SvgComponent from 'src/utils/icon/SvgComponent';

// Utility functions for handling HTML content
const parseHtmlContent = html => {
  if (!html) return '';

  // First, remove any script or style tags and their content
  let parsed = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

  // Replace common HTML entities
  parsed = parsed
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");

  // Replace <br>, <p>, </p>, <div>, </div> tags with newlines
  parsed = parsed
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<p[^>]*>/gi, '')
    .replace(/<div[^>]*>/gi, '');

  // Remove all other HTML tags but keep their content
  parsed = parsed.replace(/<[^>]*>/g, '');

  // Clean up excessive whitespace and newlines
  parsed = parsed.replace(/\n\s*\n/g, '\n').replace(/^\s+|\s+$/g, '');

  return parsed;
};

// Strip all HTML tags for search functionality
const stripHtmlTags = html => {
  if (!html) return '';
  return html.replace(/<\/?[^>]+(>|$)/g, '');
};

// Back Arrow Icon
const BackIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path
      d="M15 18L9 12L15 6"
      stroke="#212121"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Info Circle Icon
const InfoCircleIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke="#212121" strokeWidth="1.5" />
    <Path
      d="M12 7V12"
      stroke="#212121"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx="12" cy="16" r="1" fill="#212121" />
  </Svg>
);

// Search Icon
const SearchIcon = () => (
  <Svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <Path
      d="M8.25 14.25C11.5637 14.25 14.25 11.5637 14.25 8.25C14.25 4.93629 11.5637 2.25 8.25 2.25C4.93629 2.25 2.25 4.93629 2.25 8.25C2.25 11.5637 4.93629 14.25 8.25 14.25Z"
      stroke="#9E9E9E"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M15.75 15.75L12.75 12.75"
      stroke="#9E9E9E"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Chevron Down Icon
const ChevronDownIcon = () => (
  <Svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <Path
      d="M4.5 6.75L9 11.25L13.5 6.75"
      stroke="#424242"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Headphones Icon for Customer Service
const HeadphonesIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path
      d="M5.5 19C7.989 19 9 17.989 9 15.5V14C9 11.511 7.989 10.5 5.5 10.5C3.011 10.5 2 11.511 2 14V15.5C2 17.989 3.011 19 5.5 19Z"
      stroke="#F47B20"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M18.5 19C20.989 19 22 17.989 22 15.5V14C22 11.511 20.989 10.5 18.5 10.5C16.011 10.5 15 11.511 15 14V15.5C15 17.989 16.011 19 18.5 19Z"
      stroke="#F47B20"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M2 14V12C2 6.477 6.477 2 12 2C17.523 2 22 6.477 22 12V14"
      stroke="#F47B20"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Whatsapp Icon
const WhatsAppIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2C6.48 2 2 6.48 2 12C2 13.9 2.58 15.65 3.54 17.1L2.93 20.11C2.81 20.74 3.26 21.19 3.89 21.07L6.9 20.46C8.35 21.42 10.1 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z"
      stroke="#25D366"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M16.5 14.5C16.5 15.05 16.34 15.58 16.03 16.06C15.73 16.54 15.3 16.95 14.77 17.26C14.25 17.57 13.63 17.75 12.92 17.75C11.96 17.75 11.09 17.47 10.31 16.91L8 17.5L8.6 15.2C8.03 14.42 7.75 13.52 7.75 12.55C7.75 11.84 7.92 11.22 8.24 10.69C8.55 10.16 8.96 9.73 9.44 9.42C9.92 9.12 10.46 8.95 11.01 8.95H11.51C12.37 8.95 13.18 9.28 13.81 9.9C14.43 10.53 14.76 11.34 14.76 12.2V12.7C14.75 13.25 14.59 13.79 14.28 14.27C13.97 14.75 13.54 15.16 13.01 15.47C12.48 15.78 11.87 15.95 11.17 15.95C10.56 15.95 10.01 15.8 9.52 15.51C9.03 15.22 8.62 14.85 8.28 14.4L7.5 15.18C7.84 15.63 8.25 15.99 8.74 16.28C9.23 16.57 9.78 16.72 10.39 16.72C11.09 16.72 11.7 16.55 12.23 16.24C12.75 15.93 13.18 15.52 13.49 15.04C13.8 14.56 13.96 14.02 13.96 13.47V12.97C13.96 12.11 13.63 11.3 13.01 10.67C12.38 10.05 11.57 9.72 10.71 9.72H10.21C9.66 9.72 9.12 9.88 8.64 10.19C8.16 10.5 7.75 10.93 7.44 11.46C7.13 11.98 6.97 12.6 6.97 13.31C6.97 14.27 7.25 15.15 7.81 15.93L7.21 18.23L9.51 17.63C10.29 18.19 11.16 18.47 12.12 18.47C12.83 18.47 13.45 18.3 13.97 17.99C14.5 17.68 14.93 17.27 15.23 16.79C15.54 16.31 15.7 15.78 15.7 15.23V14.73C15.7 13.87 15.37 13.06 14.75 12.43C14.12 11.81 13.31 11.48 12.45 11.48H11.95C11.4 11.48 10.87 11.64 10.39 11.95C9.91 12.26 9.5 12.69 9.19 13.22C8.88 13.74 8.72 14.36 8.72 15.07C8.72 16.03 9 16.91 9.56 17.69L8.96 19.99L11.26 19.39C12.04 19.95 12.91 20.23 13.87 20.23C14.58 20.23 15.2 20.06 15.72 19.75C16.25 19.44 16.68 19.03 16.98 18.55C17.29 18.07 17.45 17.54 17.45 16.99V16.49C17.45 15.63 17.12 14.82 16.5 14.19C15.87 13.57 15.06 13.24 14.2 13.24H13.7C13.15 13.24 12.62 13.4 12.14 13.71C11.66 14.02 11.25 14.45 10.94 14.98C10.63 15.5 10.47 16.12 10.47 16.83C10.47 17.79 10.75 18.67 11.31 19.45L10.71 21.75L13.01 21.15C13.79 21.71 14.66 21.99 15.62 21.99C16.33 21.99 16.95 21.82 17.47 21.51C18 21.2 18.43 20.79 18.73 20.31C19.04 19.83 19.2 19.3 19.2 18.75V18.25C19.2 17.39 18.87 16.58 18.25 15.95C17.62 15.33 16.81 15 15.95 15H15.45C14.9 15 14.37 15.16 13.89 15.47C13.41 15.78 13 16.21 12.69 16.74C12.38 17.26 12.22 17.88 12.22 18.59C12.22 19.55 12.5 20.43 13.06 21.21L12.46 23.51L14.76 22.91C15.54 23.47 16.41 23.75 17.37 23.75C18.08 23.75 18.7 23.58 19.22 23.27C19.75 22.96 20.18 22.55 20.48 22.07C20.79 21.59 20.95 21.06 20.95 20.51V20.01C20.95 19.15 20.62 18.34 20 17.71"
      stroke="#25D366"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Website Icon
const WebsiteIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke="#F47B20" strokeWidth="1.5" />
    <Path
      d="M12 2C14.5013 4.73835 15.9228 8.29203 16 12C15.9228 15.708 14.5013 19.2616 12 22"
      stroke="#F47B20"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M12 2C9.49872 4.73835 8.07725 8.29203 8 12C8.07725 15.708 9.49872 19.2616 12 22"
      stroke="#F47B20"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M2.62988 8H21.3699"
      stroke="#F47B20"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M2.62988 16H21.3699"
      stroke="#F47B20"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Facebook Icon
const FacebookIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2C6.477 2 2 6.477 2 12C2 17.523 6.477 22 12 22C17.523 22 22 17.523 22 12C22 6.477 17.523 2 12 2Z"
      stroke="#1877F2"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M15 8H13C12.4696 8 11.9609 8.21071 11.5858 8.58579C11.2107 8.96086 11 9.46957 11 10V22"
      stroke="#1877F2"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M8 13H16"
      stroke="#1877F2"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Twitter Icon
const TwitterIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path
      d="M22 4.01C21.0424 4.68547 19.9821 5.20756 18.86 5.56C18.2577 4.8486 17.4573 4.35423 16.567 4.15458C15.6767 3.95494 14.7395 4.05832 13.9101 4.44807C13.0806 4.83783 12.4057 5.49591 11.9776 6.32754C11.5495 7.15916 11.3899 8.12061 11.52 9.06C9.7677 8.97137 8.0535 8.51017 6.48931 7.70881C4.92512 6.90745 3.54316 5.78523 2.44 4.42C2.04269 5.09533 1.85699 5.86449 1.90647 6.63837C1.95594 7.41226 2.23926 8.14556 2.71999 8.75C2.16799 8.73 1.62999 8.57 1.14999 8.28V8.33C1.14927 9.29281 1.47806 10.2281 2.08386 10.9887C2.68967 11.7493 3.53832 12.2952 4.48999 12.54C3.98337 12.6897 3.45309 12.7141 2.93499 12.61C3.17308 13.4379 3.6646 14.1691 4.34316 14.698C5.02173 15.2269 5.85652 15.5283 6.71999 15.56C5.85593 16.2309 4.86134 16.7293 3.79673 17.0227C2.73213 17.316 1.61864 17.3981 0.519989 17.264C2.40355 18.3641 4.57722 18.9461 6.78999 18.944C13.21 18.944 16.766 13.7 16.766 9.1C16.766 8.92 16.766 8.75 16.746 8.57C17.5867 7.95402 18.3074 7.19204 18.877 6.32C18.1044 6.667 17.2739 6.88785 16.424 6.97C17.3192 6.43286 18.0059 5.57892 18.338 4.57C17.5009 5.07293 16.5828 5.42553 15.628 5.61C14.7187 4.62824 13.3952 4.14987 12.0593 4.3207C10.7233 4.49152 9.54559 5.29504 8.8396 6.48331C8.13361 7.67159 7.96906 9.11764 8.39118 10.4455C8.81329 11.7733 9.77487 12.82 11.041 13.294C11.3937 13.4312 11.7612 13.5156 12.134 13.545C11.178 14.174 10.0406 14.4868 8.88136 14.4378C7.72212 14.3887 6.61891 13.9804 5.72999 13.273C5.72999 13.273 8.42999 18.944 16.766 9.1C14.8671 9.76764 14.867 4.33368 14.867 4.01"
      stroke="#1DA1F2"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Instagram Icon
const InstagramIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path
      d="M16 2H8C4.68629 2 2 4.68629 2 8V16C2 19.3137 4.68629 22 8 22H16C19.3137 22 22 19.3137 22 16V8C22 4.68629 19.3137 2 16 2Z"
      stroke="#E4405F"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M12 17C14.7614 17 17 14.7614 17 12C17 9.23858 14.7614 7 12 7C9.23858 7 7 9.23858 7 12C7 14.7614 9.23858 17 12 17Z"
      stroke="#E4405F"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M17.5 6.5H17.51"
      stroke="#E4405F"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// LinkedIn Icon
const LinkedInIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path
      d="M16 8C17.5913 8 19.1174 8.63214 20.2426 9.75736C21.3679 10.8826 22 12.4087 22 14V21H18V14C18 13.4696 17.7893 12.9609 17.4142 12.5858C17.0391 12.2107 16.5304 12 16 12C15.4696 12 14.9609 12.2107 14.5858 12.5858C14.2107 12.9609 14 13.4696 14 14V21H10V14C10 12.4087 10.6321 10.8826 11.7574 9.75736C12.8826 8.63214 14.4087 8 16 8Z"
      stroke="#0077B5"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M6 9H2V21H6V9Z"
      stroke="#0077B5"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M4 6C5.10457 6 6 5.10457 6 4C6 2.89543 5.10457 2 4 2C2.89543 2 2 2.89543 2 4C2 5.10457 2.89543 6 4 6Z"
      stroke="#0077B5"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// YouTube Icon
const YouTubeIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path
      d="M22.54 6.42C22.4212 5.94541 22.1793 5.51057 21.8387 5.15941C21.498 4.80824 21.0708 4.55318 20.6 4.42C18.88 4 12 4 12 4C12 4 5.12 4 3.4 4.46C2.92925 4.59318 2.50197 4.84824 2.16131 5.19941C1.82066 5.55057 1.57881 5.98541 1.46 6.46C1.14522 8.20556 0.991235 9.97631 1 11.75C0.988768 13.537 1.14276 15.3213 1.46 17.08C1.59096 17.5398 1.83831 17.9581 2.17814 18.2945C2.51798 18.6308 2.93882 18.8738 3.4 19C5.12 19.46 12 19.46 12 19.46C12 19.46 18.88 19.46 20.6 19C21.0708 18.8668 21.498 18.6118 21.8387 18.2606C22.1793 17.9094 22.4212 17.4746 22.54 17C22.8524 15.2676 23.0063 13.5103 23 11.75C23.0112 9.96295 22.8572 8.1787 22.54 6.42Z"
      stroke="#FF0000"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M9.75 15.02L15.5 11.75L9.75 8.48V15.02Z"
      stroke="#FF0000"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const HelpCenterScreen = () => {
  const navigation = useNavigation();
  const {theme, isDark} = useTheme();
  const [activeTab, setActiveTab] = useState('FAQ');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedItem, setExpandedItem] = useState(null);

  // Define static categories
  const staticCategories = [
    {id: 1, name: 'About Legend and New Brand Identity', active: true},
    {id: 2, name: 'About the website', active: false},
    {id: 3, name: 'Car Listings', active: false},
    {id: 4, name: 'Car Pricing', active: false},
    {id: 5, name: 'Inquiry Process', active: false},
    {id: 6, name: 'Offline Sales', active: false},
    {id: 7, name: 'Images & Specifications', active: false},
    {id: 8, name: 'Account & Notifications', active: false},
    {id: 9, name: 'Miscellaneous FAQs', active: false},
  ];

  // Static FAQ data
  const staticFaqData = [
    // About Legend and New Brand Identity
    {
      id: '1-1',
      categoryId: 1,
      question: 'Who are we?',
      answer: 'We are Legend Motors and have been providing Affordable & sustainable Mobility solutions since 2008 touching millions of lives around the World. Renowned for being a step ahead and making Today the future with our one of kind product assortment for over a decade now.',
      plainTextAnswer: 'We are Legend Motors and have been providing Affordable & sustainable Mobility solutions since 2008 touching millions of lives around the World. Renowned for being a step ahead and making Today the future with our one of kind product assortment for over a decade now.'
    },
    {
      id: '1-2',
      categoryId: 1,
      question: 'What changes have been made in legend?',
      answer: 'We have undergone a complete transformation and have embraced a new identity. We changed our previous logo and branding to a new one encapsulating Purple, a color of strength, intelligence, and strategic vision and Orange, a symbol of energy, ambition, and progress. The Legend logo is a bold representation of transformation, unity and boundless growth, brought to life through a carefully chosen color palette. We are the Old legend bringing new freshness to our customers without compromising our quality.',
      plainTextAnswer: 'We have undergone a complete transformation and have embraced a new identity. We changed our previous logo and branding to a new one encapsulating Purple, a color of strength, intelligence, and strategic vision and Orange, a symbol of energy, ambition, and progress. The Legend logo is a bold representation of transformation, unity and boundless growth, brought to life through a carefully chosen color palette. We are the Old legend bringing new freshness to our customers without compromising our quality.'
    },
    {
      id: '1-3',
      categoryId: 1,
      question: 'Who is Legend\'s official Ambassador?',
      answer: 'Meet Lumo — The Guardian and Guide of Legend. Lumo is more than just an ambassador or a mascot — it\'s the guardian spirit and intelligent guide of Legend. Born from a vision to unite innovation, sustainability, and human connection, Lumo embodies the values that drive Legend forward in the world of mobility, energy, and technology.',
      plainTextAnswer: 'Meet Lumo — The Guardian and Guide of Legend. Lumo is more than just an ambassador or a mascot — it\'s the guardian spirit and intelligent guide of Legend. Born from a vision to unite innovation, sustainability, and human connection, Lumo embodies the values that drive Legend forward in the world of mobility, energy, and technology.'
    },
    
    // About the website
    {
      id: '2-1',
      categoryId: 2,
      question: 'What is Legend website about?',
      answer: 'Legend\'s website allows you to browse a wide range of cars available for sale. You can send inquiries to our sales team, who will assist you offline. You can select the cars of your choice from a wide range of vehicles. We have cars from top brands of the world and helps you buy the car seamlessly.',
      plainTextAnswer: 'Legend\'s website allows you to browse a wide range of cars available for sale. You can send inquiries to our sales team, who will assist you offline. You can select the cars of your choice from a wide range of vehicles. We have cars from top brands of the world and helps you buy the car seamlessly.'
    },
    {
      id: '2-2',
      categoryId: 2,
      question: 'Do I need an account to browse cars?',
      answer: 'No, you can browse cars without an account. However, creating an account allows you to view the best prices, save your favorite cars and track your inquiries.',
      plainTextAnswer: 'No, you can browse cars without an account. However, creating an account allows you to view the best prices, save your favorite cars and track your inquiries.'
    },
    {
      id: '2-3',
      categoryId: 2,
      question: 'How do I send an inquiry about a car?',
      answer: 'Simply click the "Inquire Now" button on the car\'s detail page, that will send the inquiry details and our sales team will contact you shortly. If you are a non-registered user, You might need to fill in the forms for us to connect with you.',
      plainTextAnswer: 'Simply click the "Inquire Now" button on the car\'s detail page, that will send the inquiry details and our sales team will contact you shortly. If you are a non-registered user, You might need to fill in the forms for us to connect with you.'
    },
    {
      id: '2-4',
      categoryId: 2,
      question: 'Can I test drive a car listed on your website?',
      answer: 'Once you send an inquiry, our sales team will arrange a test drive for you based on availability.',
      plainTextAnswer: 'Once you send an inquiry, our sales team will arrange a test drive for you based on availability.'
    },
    
    // Car Listings
    {
      id: '3-1',
      categoryId: 3,
      question: 'Are the car listings updated regularly?',
      answer: 'Yes, Absolutely, we update our inventory frequently to ensure you see the latest cars available for sale with the best prices available in the market.',
      plainTextAnswer: 'Yes, Absolutely, we update our inventory frequently to ensure you see the latest cars available for sale with the best prices available in the market.'
    },
    {
      id: '3-2',
      categoryId: 3,
      question: 'Can I filter cars by brand, model, or price range?',
      answer: 'Totally! Use our advanced filters to narrow down your search based on brand, model, price range, and other features.',
      plainTextAnswer: 'Totally! Use our advanced filters to narrow down your search based on brand, model, price range, and other features.'
    },
    {
      id: '3-3',
      categoryId: 3,
      question: 'Are all cars listed new, or do you also sell used cars?',
      answer: 'Legend Global website helps you to buy brand new cars hitting the market.',
      plainTextAnswer: 'Legend Global website helps you to buy brand new cars hitting the market.'
    },
    
    // Car pricing
    {
      id: '4-1',
      categoryId: 4,
      question: 'Are the prices listed negotiable?',
      answer: 'Prices are indicative and may be negotiable depending on the car and the offers we provide. The offers are subject to changes according to the business requirements and market status. Our sales team can provide more details when they contact you.',
      plainTextAnswer: 'Prices are indicative and may be negotiable depending on the car and the offers we provide. The offers are subject to changes according to the business requirements and market status. Our sales team can provide more details when they contact you.'
    },
    {
      id: '4-2',
      categoryId: 4,
      question: 'Are taxes or registration fees included in the listed price?',
      answer: 'No, the listed price is exclusive of taxes and registration fees. Our sales team will help you understand the total cost during discussions. Note: All Prices Mentioned in the App are Ex Works jebel Ali (Export Prices). Selected Models are available to be Registered in the UAE. (Import Duty/Customs/other Charges will be additional) Products are subject to availability. Getting offer for the car does not promise car availability until a Deposit is received.',
      plainTextAnswer: 'No, the listed price is exclusive of taxes and registration fees. Our sales team will help you understand the total cost during discussions. Note: All Prices Mentioned in the App are Ex Works jebel Ali (Export Prices). Selected Models are available to be Registered in the UAE. (Import Duty/Customs/other Charges will be additional) Products are subject to availability. Getting offer for the car does not promise car availability until a Deposit is received.'
    },
    {
      id: '4-3',
      categoryId: 4,
      question: 'How does Legend Motors price the car listed on the platform?',
      answer: 'The Prices are listed based on the Supply & Demand of the particular make and model. We try to keep ourselves updated to ensure we offer the most competitive rates possible.',
      plainTextAnswer: 'The Prices are listed based on the Supply & Demand of the particular make and model. We try to keep ourselves updated to ensure we offer the most competitive rates possible.'
    },
    
    // Inquiry Process
    {
      id: '5-1',
      categoryId: 5,
      question: 'How long does it take for the sales team to respond to my inquiry?',
      answer: 'Our sales team typically responds within 24 hours of receiving your inquiry.',
      plainTextAnswer: 'Our sales team typically responds within 24 hours of receiving your inquiry.'
    },
    {
      id: '5-2',
      categoryId: 5,
      question: 'Can I inquire about multiple cars at once?',
      answer: 'Yes, you can send inquiries for multiple cars by visiting their respective pages. We are at your service to help you find your dream car.',
      plainTextAnswer: 'Yes, you can send inquiries for multiple cars by visiting their respective pages. We are at your service to help you find your dream car.'
    },
    
    // Offline Sales Process
    {
      id: '6-1',
      categoryId: 6,
      question: 'What happens after I send an inquiry?',
      answer: 'After receiving your inquiry, our sales team will contact you via phone or email to discuss further details about the car, pricing, and the next steps.',
      plainTextAnswer: 'After receiving your inquiry, our sales team will contact you via phone or email to discuss further details about the car, pricing, and the next steps.'
    },
    {
      id: '6-2',
      categoryId: 6,
      question: 'Can I visit your showroom to see the car in person?',
      answer: 'Yes! Once our sales team contacts you, they can arrange a visit to our showroom or to be nearest to you. It is highly advised to contact our team before you arrive if you have any specific inquiry.',
      plainTextAnswer: 'Yes! Once our sales team contacts you, they can arrange a visit to our showroom or to be nearest to you. It is highly advised to contact our team before you arrive if you have any specific inquiry.'
    },
    {
      id: '6-3',
      categoryId: 6,
      question: 'Where are your cars located?',
      answer: 'Most of the cars in our catalog are located in Jebel Ali, Dubai and few cars in branches. Once you purchase any car online, You can arrange to pickup from our Location in Dubai. For B2B customers, some of our vehicles are also available in other countries, where we conduct our rigorous vehicle inspection process. We also Offer to ship it to the port closest to you or deliver it right to your doorstep.',
      plainTextAnswer: 'Most of the cars in our catalog are located in Jebel Ali, Dubai and few cars in branches. Once you purchase any car online, You can arrange to pickup from our Location in Dubai. For B2B customers, some of our vehicles are also available in other countries, where we conduct our rigorous vehicle inspection process. We also Offer to ship it to the port closest to you or deliver it right to your doorstep.'
    },
    
    // Images & Specifications
    {
      id: '7-1',
      categoryId: 7,
      question: 'Are there detailed images of each car?',
      answer: 'Yes, every car listing includes high-quality images showcasing both interior and exterior views. Also, we provide you the option to view specific highlights and features of the car as well.',
      plainTextAnswer: 'Yes, every car listing includes high-quality images showcasing both interior and exterior views. Also, we provide you the option to view specific highlights and features of the car as well.'
    },
    {
      id: '7-2',
      categoryId: 7,
      question: 'Where can I find technical specifications for each car?',
      answer: 'Each car listing includes detailed technical specifications like engine type, mileage, features, and more.',
      plainTextAnswer: 'Each car listing includes detailed technical specifications like engine type, mileage, features, and more.'
    },
    
    // Account & Notifications
    {
      id: '8-1',
      categoryId: 8,
      question: 'Will I receive updates on new listings if I register an account?',
      answer: 'Yes! Registered users can opt-in for email or push notifications about new car listings and offers. We provide you with a lot of information in addition to helping you stay informed about the latest offers and prices.',
      plainTextAnswer: 'Yes! Registered users can opt-in for email or push notifications about new car listings and offers. We provide you with a lot of information in addition to helping you stay informed about the latest offers and prices.'
    },
    {
      id: '8-2',
      categoryId: 8,
      question: 'Can I save my favorite cars for later?',
      answer: 'Yes! Create an account to save your favorite cars and access them anytime.',
      plainTextAnswer: 'Yes! Create an account to save your favorite cars and access them anytime.'
    },
    
    // Miscellaneous FAQs
    {
      id: '9-1',
      categoryId: 9,
      question: 'Do you offer financing options for purchasing cars?',
      answer: 'Financing options are not available directly through our website but may be discussed with our sales team offline.',
      plainTextAnswer: 'Financing options are not available directly through our website but may be discussed with our sales team offline.'
    }
  ];

  const [faqCategories, setFaqCategories] = useState(staticCategories);
  const [activeCategoryId, setActiveCategoryId] = useState(1);
  const [faqs, setFaqs] = useState(staticFaqData);
  const [filteredFaqs, setFilteredFaqs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filter FAQs when search query or active category changes
  useEffect(() => {
    filterFaqs();
  }, [searchQuery, activeCategoryId]);

  // Initialize with filtered faqs based on first category
  useEffect(() => {
    filterFaqs();
  }, []);

  const filterFaqs = () => {
    let filtered = [...faqs];

    // Filter by active category
    if (activeCategoryId) {
      filtered = filtered.filter(faq => faq.categoryId === activeCategoryId);
    }

    // Filter by search query using plain text versions
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        faq =>
          faq.question.toLowerCase().includes(query) ||
          (faq.plainTextAnswer &&
            faq.plainTextAnswer.toLowerCase().includes(query)),
      );
    }

    setFilteredFaqs(filtered);
  };

  const handleCategoryPress = categoryId => {
    setActiveCategoryId(categoryId);

    // Update active status in faqCategories
    const updatedCategories = faqCategories.map(category => ({
      ...category,
      active: category.id === categoryId,
    }));

    setFaqCategories(updatedCategories);
  };

  const toggleExpandItem = id => {
    if (expandedItem === id) {
      setExpandedItem(null);
    } else {
      setExpandedItem(id);
    }
  };

  const handleSearch = text => {
    setSearchQuery(text);
  };

  // Handle opening external links
  const handleOpenLink = async (url) => {
    if (!url) {
      Alert.alert('Error', 'Invalid link');
      return;
    }
    
    try {
      // Check if the link can be opened
      const canOpen = await Linking.canOpenURL(url);
      
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        console.warn(`Cannot open URL: ${url}`);
        
        // Custom handling based on URL type
        if (url.startsWith('tel:')) {
          Alert.alert(
            'Cannot Make Call',
            'Your device doesn\'t support making calls or the phone app is not available.',
            [{ text: 'OK' }]
          );
        } else {
          Alert.alert(
            'Cannot Open Link',
            'Your device cannot open this type of link. Please try again later or contact customer service.',
            [{ text: 'OK' }]
          );
        }
      }
    } catch (error) {
      console.error('Error opening URL:', error);
      Alert.alert(
        'Error',
        'Could not open the link. Please try again later.',
        [{ text: 'OK' }]
      );
    }
  };

  // Define contact items for Contact Us tab with their respective URLs
  const contactItems = [
    {
      id: '1', 
      name: 'Customer Service', 
      icon: <HeadphonesIcon />,
      url: 'tel:+971 50 966 0888'
    },
    {
      id: '2', 
      name: 'WhatsApp', 
      icon: <WhatsAppIcon />,
      url: 'https://api.whatsapp.com/send/?phone=971509660888&text&type=phone_number&app_absent=0'
    },
    {
      id: '3', 
      name: 'Website', 
      icon: <WebsiteIcon />,
      url: 'https://legendmotorsglobal.com'
    },
    {
      id: '4', 
      name: 'Facebook', 
      icon: <FacebookIcon />,
      url: 'https://www.facebook.com/legendmotorsglobal'
    },
    {
      id: '5', 
      name: 'Twitter', 
      icon: <TwitterIcon />,
      url: 'https://twitter.com/legendmotorsdxb'
    },
    {
      id: '6', 
      name: 'Instagram', 
      icon: <InstagramIcon />,
      url: 'https://www.instagram.com/legendmotorsglobal/'
    },
    {
      id: '7',
      name: 'LinkedIn',
      icon: <LinkedInIcon />,
      url: 'https://www.linkedin.com/company/legendmotors/'
    },
    {
      id: '8',
      name: 'YouTube',
      icon: <YouTubeIcon />,
      url: 'https://www.youtube.com/@legendmotorsgroup7502'
    }
  ];

  const renderFAQTab = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#F47B20" />
          <Text style={[styles.loadingText, {color: themeColors[theme].text}]}>
            Loading FAQs...
          </Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, {color: themeColors[theme].text}]}>
            {error}
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.tabContent}>
        {/* FAQ Categories - Vertical Layout */}
        <View style={styles.categoriesVerticalContainer}>
          {faqCategories.map(category => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButtonVertical,
                category.active && styles.activeCategoryButtonVertical,
                {
                  backgroundColor: category.active 
                    ? (isDark ? '#FF8C00' : '#F47B20') 
                    : (isDark ? '#333333' : '#F5F5F5'),
                }
              ]}
              onPress={() => handleCategoryPress(category.id)}>
              <Text
                style={[
                  styles.categoryTextVertical,
                  {
                    color: category.active 
                      ? '#FFFFFF' 
                      : (isDark ? '#FFFFFF' : '#333333'),
                  },
                ]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Search Bar */}
        <View
          style={[
            styles.searchContainer,
            {
              borderColor: themeColors[theme].border,
              backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF',
            },
          ]}>
          <View style={styles.searchIcon}>
            <SearchIcon />
          </View>
          <TextInput
            style={[
              styles.searchInput,
              {
                color: isDark ? '#FFFFFF' : themeColors[theme].text,
              },
            ]}
            placeholder="Search for help"
            placeholderTextColor={isDark ? '#888888' : '#666666'}
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>

        {/* FAQ Items */}
        {filteredFaqs.length > 0 ? (
          <View style={styles.faqItemsContainer}>
            {filteredFaqs.map(item => (
              <View key={item.id} style={styles.faqItem}>
                <TouchableOpacity
                  style={styles.faqQuestion}
                  onPress={() => toggleExpandItem(item.id)}>
                  <Text
                    style={[
                      styles.questionText,
                      {color: isDark ? '#FFFFFF' : '#212121'},
                    ]}>
                    {item.question}
                  </Text>
                  <View
                    style={
                      expandedItem === item.id
                        ? styles.chevronUp
                        : styles.chevronDown
                    }>
                    <ChevronDownIcon />
                  </View>
                </TouchableOpacity>
                {expandedItem === item.id && item.answer && (
                  <View style={styles.answerContainer}>
                    <Text
                      style={[
                        styles.answerText,
                        {color: isDark ? '#FFFFFF' : '#757575'},
                      ]}>
                      {item.answer}
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.noResultsContainer}>
            <Text style={styles.noResultsText}>
              {searchQuery.trim()
                ? 'No FAQs found matching your search. Try different keywords.'
                : 'No FAQs available for this category.'}
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderContactTab = () => {
    return (
      <View style={styles.tabContent}>
        <Text style={styles.contactHeaderText}>
          Connect with Legend Motors through any of these channels:
        </Text>
        <View style={styles.contactItemsContainer}>
          {contactItems.map(item => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.contactItem,
                {
                  borderBottomColor: themeColors[theme].border,
                  backgroundColor: isDark ? '#333333' : '#F5F5F5',
                },
              ]}
              onPress={() => handleOpenLink(item.url)}>
              <View style={styles.contactIcon}>{item.icon}</View>
              <Text
                style={[
                  styles.contactName,
                  {color: isDark ? '#FFFFFF' : '#212121'},
                ]}>
                {item.name}
              </Text>
              <View style={styles.contactArrow}>
                <Svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <Path
                    d="M6 12L10 8L6 4"
                    stroke={isDark ? '#FFFFFF' : '#212121'}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        {backgroundColor: isDark ? '#2D2D2D' : themeColors[theme].background},
      ]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.backButton, {color: isDark ? '#FFFFFF' : '#2D2D2D'}]}
          onPress={() => navigation.goBack()}>
          <SvgComponent />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, {color: themeColors[theme].text}]}>
          Help Center
        </Text>
        <TouchableOpacity style={styles.infoButton}>
          <View style={styles.infoIconContainer}>
            <Text style={styles.infoIconDot}>...</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View
        style={[
          styles.tabsContainer,
          {borderBottomColor: themeColors[theme].border},
        ]}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'FAQ' && styles.activeTabButton,
          ]}
          onPress={() => setActiveTab('FAQ')}>
          <Text
            style={[
              styles.tabText,
              {
                color:
                  activeTab === 'FAQ'
                    ? themeColors[theme].primary
                    : themeColors[theme].text,
              },
            ]}>
            FAQ
          </Text>
          {activeTab === 'FAQ' && (
            <View
              style={[
                styles.activeTabIndicator,
                {backgroundColor: themeColors[theme].primary},
              ]}
            />
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'Contact' && styles.activeTabButton,
          ]}
          onPress={() => setActiveTab('Contact')}>
          <Text
            style={[
              styles.tabText,
              {
                color:
                  activeTab === 'Contact'
                    ? themeColors[theme].primary
                    : themeColors[theme].text,
              },
            ]}>
            Contact us
          </Text>
          {activeTab === 'Contact' && (
            <View
              style={[
                styles.activeTabIndicator,
                {backgroundColor: themeColors[theme].primary},
              ]}
            />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'FAQ' ? renderFAQTab() : renderContactTab()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding:24
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  infoButton: {
    padding: 4,
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    position: 'relative',
  },
  activeTabButton: {
    borderBottomWidth: 0,
  },
  tabText: {
    fontSize: 16,
  },
  activeTabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 24,
    right: 24,
    height: 2,
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: 16,
  },
  categoriesVerticalContainer: {
    marginBottom: 16,
    width: '100%',
  },
  categoryButtonVertical: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 8,
    width: '100%',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#F47B20',
  },
  activeCategoryButtonVertical: {
    backgroundColor: '#F47B20',
  },
  categoryTextVertical: {
    fontSize: 16,
    fontWeight: '500',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 16,
    height: 50,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
  },
  faqItemsContainer: {
    marginBottom: 16,
  },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingVertical: 12,
  },
  faqQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  questionText: {
    fontSize: 18,
    flex: 1,
    paddingRight: 8,
  },
  chevronUp: {
    transform: [{rotate: '180deg'}],
  },
  chevronDown: {
    // Default orientation, no transformation needed
  },
  answerContainer: {
    marginTop: 8,
    paddingHorizontal: 4,
  },
  answerText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  htmlParagraph: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 8,
    lineHeight: 20,
  },
  htmlStrong: {
    fontWeight: 'bold',
    color: '#424242',
  },
  htmlSpan: {
    fontSize: 14,
    lineHeight: 20,
  },
  htmlListItem: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 4,
    lineHeight: 20,
  },
  htmlList: {
    marginTop: 4,
    marginBottom: 8,
    paddingLeft: 16,
  },
  contactItemsContainer: {
    marginTop: 8,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderRadius: 8,
    marginBottom: 8,
  },
  contactIcon: {
    marginRight: 16,
  },
  contactName: {
    fontSize: 16,
    flex: 1,
  },
  contactArrow: {
    marginLeft: 8,
  },
  contactHeaderText: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
    color: '#666666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: 300,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#212121',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: 300,
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#F47B20',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  noResultsContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 150,
  },
  noResultsText: {
    fontSize: 16,
    color: '#9E9E9E',
    textAlign: 'center',
  },
});

export default HelpCenterScreen;
