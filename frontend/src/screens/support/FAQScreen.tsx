/**
 * FAQ Screen
 * Comprehensive FAQ for FirstAidTag / MedID customers
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Smartphone,
  Shield,
  Lightbulb,
  Settings,
  Cpu,
  Rocket,
  ShoppingCart,
  Heart,
  Wrench,
  Users,
  DollarSign,
  HelpCircle,
} from 'lucide-react-native';

import { SEMANTIC, GRAY, PRIMARY } from '@/constants/colors';
import { spacing } from '@/theme/theme';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  items: FAQItem[];
}

const FAQ_DATA: FAQSection[] = [
  {
    id: 'product-basics',
    title: 'Product Basics',
    icon: <Smartphone size={20} color={PRIMARY[600]} />,
    items: [
      {
        question: 'What is MedID / FirstAidTag?',
        answer: 'MedID is a discreet wearable safety system that starts as a digital medical ID bracelet and evolves into a smart safety platform. Our Founder\'s Edition bracelet provides instant medical information access, with AI safety features activating via app updates.',
      },
      {
        question: 'How is this different from a regular medical ID bracelet?',
        answer: 'Traditional medical IDs have static, engraved information. MedID has a QR code/NFC chip that links to your digital medical profile that you can update anytime via our app. No need to buy a new bracelet when your medications change.',
      },
      {
        question: 'What\'s included in my purchase?',
        answer: 'Each Founder\'s Edition includes:\n\n1. Medical-grade silicone bracelet with stainless steel plate\n2. Unique QR code/NFC chip\n3. Access to the MedID mobile app\n4. Lifetime medical profile hosting\n5. Future upgrade priority to our smart bracelet',
      },
    ],
  },
  {
    id: 'privacy-security',
    title: 'Privacy & Security',
    icon: <Shield size={20} color={PRIMARY[600]} />,
    items: [
      {
        question: 'Who can see my medical information?',
        answer: 'Only people you authorize. By default, only first responders who physically scan your bracelet can see your medical profile. You control which details are visible and can grant temporary access to family/friends via the app.',
      },
      {
        question: 'Is my data encrypted?',
        answer: 'Yes. All medical data is encrypted both in transit and at rest. We use HIPAA-compliant encryption standards for health information.',
      },
      {
        question: 'What happens if I lose my bracelet?',
        answer: 'Immediately use our app to deactivate the QR code. The link will show "This bracelet has been reported lost" instead of your medical information. You can then order a replacement and transfer your profile.',
      },
      {
        question: 'Can strangers track me with the QR code?',
        answer: 'No. The QR code only shows your medical profile when scanned - it does not transmit location or any tracking data. Each scan shows the scan location/time to your emergency contacts (with your permission).',
      },
    ],
  },
  {
    id: 'features',
    title: 'Features & Functionality',
    icon: <Lightbulb size={20} color={PRIMARY[600]} />,
    items: [
      {
        question: 'Does the bracelet have GPS tracking?',
        answer: 'The Founder\'s Edition (V1.0) does not have GPS. However, when someone scans your QR code during an emergency, the scan location is immediately sent to your emergency contacts. Our upcoming V2.0 smart bracelet will include optional location sharing during emergencies.',
      },
      {
        question: 'Does it detect falls or have an SOS button?',
        answer: 'The Founder\'s Edition is a passive medical ID. Our V2.0 smart bracelet (launching later this year) will include fall detection, an SOS button, and automatic emergency alerts. Founder\'s Edition owners receive upgrade priority and discounts.',
      },
      {
        question: 'What AI features are included?',
        answer: 'Starting approximately 30 days after launch, our app will include AI safety coordination: if an emergency contact triggers an alert, our AI will call you to check if you\'re okay, and if no response, coordinate with your other contacts. This works with your current bracelet.',
      },
      {
        question: 'How does the QR code work for first responders?',
        answer: 'Paramedics, police, or good Samaritans can scan your bracelet with any smartphone camera (no app needed). It opens a secure webpage showing your critical medical information, emergency contacts, and "last updated" timestamp.',
      },
      {
        question: 'What if there\'s no internet when my bracelet is scanned?',
        answer: 'The QR code displays the most critical information (allergies, conditions, ICE contacts) directly in the URL preview on modern smartphones. For full details, internet is required.',
      },
    ],
  },
  {
    id: 'app-setup',
    title: 'App & Setup',
    icon: <Settings size={20} color={PRIMARY[600]} />,
    items: [
      {
        question: 'Do I need a smartphone to use MedID?',
        answer: 'For setup and profile management, yes. However, once set up, your bracelet works independently - anyone can scan it to see your medical information, regardless of whether you have your phone with you.',
      },
      {
        question: 'What smartphones are supported?',
        answer: 'Currently Android with iOS coming soon. Any smartphone made in the last 5 years can scan the QR code, but app features require Android 10+ initially.',
      },
      {
        question: 'How do I set up my medical profile?',
        answer: '1. Download our app\n2. Scan your bracelet\'s QR code\n3. Create your account\n4. Fill in your medical information\n5. Add emergency contacts\n\nThe whole process takes about 10 minutes.',
      },
      {
        question: 'Can family members manage my profile?',
        answer: 'Yes, with your permission. You can designate "guardians" in the app who can update your profile - perfect for elderly parents or children.',
      },
      {
        question: 'How often should I update my profile?',
        answer: 'We recommend reviewing your profile every 3 months or whenever your medications, conditions, or emergency contacts change. You\'ll get reminder notifications from the app.',
      },
    ],
  },
  {
    id: 'technical',
    title: 'Technical Details',
    icon: <Cpu size={20} color={PRIMARY[600]} />,
    items: [
      {
        question: 'Does the bracelet need charging?',
        answer: 'No. The Founder\'s Edition has no batteries or electronics. It\'s always active. Our V2.0 smart bracelet will have a 12+ month battery life.',
      },
      {
        question: 'Is it waterproof?',
        answer: 'Yes, the Founder\'s Edition is waterproof for daily wear (showering, swimming). The silicone band and sealed stainless steel plate withstand normal water exposure.',
      },
      {
        question: 'What\'s the bracelet made of?',
        answer: 'Medical-grade silicone (hypoallergenic) with a 316L stainless steel faceplate. Suitable for sensitive skin.',
      },
      {
        question: 'Can I wear it 24/7?',
        answer: 'Yes, the bracelet is designed for continuous wear. The silicone band is breathable and comfortable for long-term use.',
      },
    ],
  },
  {
    id: 'future-upgrades',
    title: 'Future Upgrades & Roadmap',
    icon: <Rocket size={20} color={PRIMARY[600]} />,
    items: [
      {
        question: 'What\'s the difference between Founder\'s Edition and future versions?',
        answer: 'Founder\'s Edition is our digital medical ID. V2.0 (coming later this year) adds active features: fall detection, SOS button, and optional location sharing. Founder\'s owners get special upgrade pricing.',
      },
      {
        question: 'When will fall detection be available?',
        answer: 'Our smart bracelet with fall detection is scheduled for release in 3-6 months. We\'re currently in development and certification. Founder\'s Edition owners will be first in line.',
      },
      {
        question: 'Will my Founder\'s Edition become obsolete?',
        answer: 'Never. Your Founder\'s Edition will always work as a digital medical ID. You can choose to upgrade to the smart bracelet when available, but your current bracelet remains fully functional.',
      },
      {
        question: 'What\'s your AI roadmap?',
        answer: 'Month 1: AI safety coordination in app\nMonth 3: AI-enhanced fall detection algorithms\nMonth 6: Natural language processing for emergency calls\n\nAll updates are free for Founder\'s Edition owners.',
      },
    ],
  },
  {
    id: 'ordering',
    title: 'Ordering & Shipping',
    icon: <ShoppingCart size={20} color={PRIMARY[600]} />,
    items: [
      {
        question: 'Why is it called "Founder\'s Edition"?',
        answer: 'This is our very first production batch. Founder\'s Edition owners get lifetime profile hosting, upgrade priorities, and become part of our safety community.',
      },
      {
        question: 'How long does shipping take?',
        answer: '3-5 business days within Canada/US. International shipping available with 7-14 day delivery.',
      },
      {
        question: 'Can I buy multiple bracelets for my family?',
        answer: 'Yes! We offer family packs and volume discounts. You can manage multiple profiles from one app account.',
      },
      {
        question: 'Do you offer subscriptions?',
        answer: 'Founder\'s Edition includes free lifetime medical profile hosting. Future premium features (extended location history, advanced AI) may have optional subscriptions, but core medical ID functionality remains free.',
      },
    ],
  },
  {
    id: 'medical-emergency',
    title: 'Medical & Emergency',
    icon: <Heart size={20} color={PRIMARY[600]} />,
    items: [
      {
        question: 'Are you HIPAA compliant?',
        answer: 'Yes, we comply with HIPAA for protected health information in the US and PIPEDA in Canada. We treat your medical data with the highest security standards.',
      },
      {
        question: 'Do you share my data with anyone?',
        answer: 'Never without your explicit consent. We don\'t sell, share, or monetize your medical data. The only exceptions are:\n\n1. When you or your emergency contacts trigger an alert\n2. When a first responder scans your bracelet\n3. As required by law with proper legal process',
      },
      {
        question: 'What should I put in my medical profile?',
        answer: 'Critical information: severe allergies, chronic conditions (diabetes, epilepsy), current medications, blood type, primary doctor contact, and emergency contacts. The app guides you through what\'s most important for first responders.',
      },
      {
        question: 'How do first responders know to scan my bracelet?',
        answer: 'We provide wallet cards and phone stickers that say "Scan for medical info." We also recommend telling family/friends about your bracelet. Our V2.0 will be more recognizable as a safety device.',
      },
      {
        question: 'What if I\'m unconscious and alone?',
        answer: 'Founder\'s Edition relies on someone finding and scanning you. Our V2.0 smart bracelet will automatically detect falls and alert contacts even if you\'re alone and unconscious.',
      },
    ],
  },
  {
    id: 'care-maintenance',
    title: 'Bracelet Care & Maintenance',
    icon: <Wrench size={20} color={PRIMARY[600]} />,
    items: [
      {
        question: 'How long does the bracelet last?',
        answer: 'The physical bracelet should last 2-3 years with daily wear. The QR code/NFC chip is rated for 10+ years. If your bracelet wears out, you can transfer your profile to a new bracelet.',
      },
      {
        question: 'Can the QR code fade or get damaged?',
        answer: 'The QR code is laser-etched into stainless steel, so it won\'t fade. The silicone band may discolor over time with heavy sun/chemical exposure. Replacement bands will be available.',
      },
      {
        question: 'What if I need a different size?',
        answer: 'Contact us within 30 days for a free exchange. We offer standard adult sizes. Custom sizing available for special needs.',
      },
      {
        question: 'Can I wear it during medical procedures?',
        answer: 'Always inform medical staff about your bracelet. For MRI/X-rays, you may need to remove it as it contains metal. The silicone band can be cut off in emergencies if needed.',
      },
    ],
  },
  {
    id: 'family-multi-user',
    title: 'Family & Multi-User',
    icon: <Users size={20} color={PRIMARY[600]} />,
    items: [
      {
        question: 'Can I manage profiles for my children or elderly parents?',
        answer: 'Yes! One app account can manage multiple bracelets. Perfect for families, caregivers, or children with medical conditions.',
      },
      {
        question: 'Is there a children\'s version?',
        answer: 'The current bracelet fits teens and adults. We\'re developing a smaller version for children. Founder\'s Edition owners will get early access.',
      },
      {
        question: 'Can emergency contacts see each other\'s information?',
        answer: 'No. Each person only sees what you\'ve shared with them. You control exactly who sees what information.',
      },
      {
        question: 'What if my emergency contact doesn\'t have the app?',
        answer: 'They don\'t need it. Emergency alerts go via SMS/email/call. They only need the app if they want to manage your profile or become a guardian.',
      },
    ],
  },
  {
    id: 'pricing',
    title: 'Pricing & Value',
    icon: <DollarSign size={20} color={PRIMARY[600]} />,
    items: [
      {
        question: 'Why does it cost more than a regular medical ID?',
        answer: 'You\'re not just buying jewelry - you\'re getting:\n\n1. Lifetime digital profile hosting\n2. Free AI safety features (coming soon)\n3. Upgrade path to smart features\n4. HIPAA-compliant security\n5. Continuous updates and improvements',
      },
      {
        question: 'Are there any hidden fees?',
        answer: 'No. Founder\'s Edition includes lifetime medical profile hosting. Future premium features will be clearly marked as optional. We\'re transparent about all costs.',
      },
      {
        question: 'Do you offer discounts for medical conditions?',
        answer: 'We offer special programs for organizations supporting people with specific conditions (diabetes, epilepsy, Alzheimer\'s). Contact us for partnership information.',
      },
      {
        question: 'Can I use my HSA/FSA funds?',
        answer: 'Yes, MedID qualifies as a medical expense under most HSA/FSA plans. We provide receipts suitable for reimbursement.',
      },
    ],
  },
  {
    id: 'troubleshooting',
    title: 'Troubleshooting',
    icon: <HelpCircle size={20} color={PRIMARY[600]} />,
    items: [
      {
        question: 'The QR code won\'t scan - what do I do?',
        answer: '1. Ensure good lighting\n2. Clean the bracelet surface\n3. Try a different smartphone camera\n4. If still not working, contact support for a replacement',
      },
      {
        question: 'I\'m locked out of my account.',
        answer: 'Use the "Forgot password" link. If you no longer have access to your email/phone, contact support with your bracelet serial number for identity verification.',
      },
      {
        question: 'My emergency contacts aren\'t getting alerts.',
        answer: 'Check:\n\n1. They\'re not in your phone\'s block list\n2. They\'ve confirmed their contact info\n3. Your app has notification permissions\n4. Test the system using our "Test Alert" feature',
      },
      {
        question: 'The app won\'t recognize my bracelet.',
        answer: 'Ensure you\'re scanning the correct QR code (not the packaging). If problems persist, contact support with photos of your bracelet and error messages.',
      },
    ],
  },
];

export default function FAQScreen() {
  const navigation = useNavigation();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const toggleItem = (itemId: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft size={24} color={SEMANTIC.text.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>FAQ</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Intro */}
        <View style={styles.introCard}>
          <Text style={styles.introTitle}>Frequently Asked Questions</Text>
          <Text style={styles.introText}>
            Find answers to common questions about MedID, your digital medical ID bracelet and safety platform.
          </Text>
        </View>

        {/* FAQ Sections */}
        {FAQ_DATA.map((section) => (
          <View key={section.id} style={styles.section}>
            {/* Section Header */}
            <Pressable
              style={styles.sectionHeader}
              onPress={() => toggleSection(section.id)}
            >
              <View style={styles.sectionTitleContainer}>
                <View style={styles.sectionIcon}>{section.icon}</View>
                <Text style={styles.sectionTitle}>{section.title}</Text>
              </View>
              {expandedSections.has(section.id) ? (
                <ChevronUp size={20} color={GRAY[500]} />
              ) : (
                <ChevronDown size={20} color={GRAY[500]} />
              )}
            </Pressable>

            {/* Section Items */}
            {expandedSections.has(section.id) && (
              <View style={styles.sectionContent}>
                {section.items.map((item, index) => {
                  const itemId = `${section.id}-${index}`;
                  const isExpanded = expandedItems.has(itemId);

                  return (
                    <View key={itemId} style={styles.faqItem}>
                      <Pressable
                        style={styles.questionContainer}
                        onPress={() => toggleItem(itemId)}
                      >
                        <Text style={styles.question}>{item.question}</Text>
                        {isExpanded ? (
                          <ChevronUp size={18} color={PRIMARY[600]} />
                        ) : (
                          <ChevronDown size={18} color={GRAY[400]} />
                        )}
                      </Pressable>
                      {isExpanded && (
                        <Text style={styles.answer}>{item.answer}</Text>
                      )}
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        ))}

        {/* Contact Support */}
        <View style={styles.supportCard}>
          <Text style={styles.supportTitle}>Still have questions?</Text>
          <Text style={styles.supportText}>
            {"Contact our support team and we'll be happy to help."}
          </Text>
          <Pressable
            style={styles.supportButton}
            onPress={() => navigation.navigate('Help' as never)}
          >
            <Text style={styles.supportButtonText}>Contact Support</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SEMANTIC.background.default,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: SEMANTIC.border.light,
    backgroundColor: '#fff',
  },
  backButton: {
    padding: spacing[2],
    marginLeft: -spacing[2],
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: SEMANTIC.text.primary,
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing[4],
    paddingBottom: spacing[8],
  },
  introCard: {
    backgroundColor: `${PRIMARY[600]}10`,
    borderRadius: 12,
    padding: spacing[4],
    marginBottom: spacing[4],
    borderLeftWidth: 4,
    borderLeftColor: PRIMARY[600],
  },
  introTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: SEMANTIC.text.primary,
    marginBottom: spacing[2],
  },
  introText: {
    fontSize: 14,
    color: SEMANTIC.text.secondary,
    lineHeight: 20,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: spacing[3],
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing[4],
    backgroundColor: '#fff',
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sectionIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: `${PRIMARY[600]}10`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: SEMANTIC.text.primary,
  },
  sectionContent: {
    borderTopWidth: 1,
    borderTopColor: SEMANTIC.border.light,
  },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: SEMANTIC.border.light,
  },
  questionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing[4],
    paddingLeft: spacing[5],
  },
  question: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: SEMANTIC.text.primary,
    marginRight: spacing[2],
    lineHeight: 20,
  },
  answer: {
    fontSize: 14,
    color: SEMANTIC.text.secondary,
    lineHeight: 22,
    paddingHorizontal: spacing[5],
    paddingBottom: spacing[4],
    backgroundColor: GRAY[50],
  },
  supportCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: spacing[5],
    alignItems: 'center',
    marginTop: spacing[2],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  supportTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: SEMANTIC.text.primary,
    marginBottom: spacing[2],
  },
  supportText: {
    fontSize: 14,
    color: SEMANTIC.text.secondary,
    textAlign: 'center',
    marginBottom: spacing[4],
  },
  supportButton: {
    backgroundColor: PRIMARY[600],
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[3],
    borderRadius: 8,
  },
  supportButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});
