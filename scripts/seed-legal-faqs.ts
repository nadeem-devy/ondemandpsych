import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const legalPages = [
  {
    title: "Disclaimer and Medical Use Policy",
    slug: "disclaimer-and-medical",
    sortOrder: 1,
    content: `<h2>Overview</h2>
<p>The OnDemandPsychiatry App is a clinical decision-support tool exclusively for licensed healthcare professionals. The platform provides educational and informational resources designed to assist practitioners, not replace their independent judgment.</p>

<h2>Key Points</h2>

<h3>Intended Users</h3>
<p>Licensed healthcare professionals only — not patients or the general public.</p>

<h3>No Patient Treatment</h3>
<p>The app does not provide medical, psychiatric, psychological, or therapeutic advice to patients.</p>

<h3>Clinical Responsibility</h3>
<p>Users must exercise independent judgment, verify recommendations against clinical guidelines, and maintain compliance with healthcare regulations. The user assumes full responsibility for the accuracy, appropriateness, and consequences of medical decisions made using the platform.</p>

<h3>Co-Pilot Features</h3>
<p>Diagnostic guidance and medication calculators assist decision-making but don't replace clinical expertise. Users should validate outputs against authoritative guidelines and consider individual patient factors.</p>

<h3>Emergency Disclaimer</h3>
<p>The app is not an emergency service. Users experiencing psychiatric crises should contact 911 or local emergency services immediately.</p>

<h3>Data Accuracy</h3>
<p>While the company strives for reliability, medical and psychiatric knowledge evolves rapidly, and no guarantees exist regarding error-free content or continuous updates.</p>

<h3>No Doctor-Patient Relationship</h3>
<p>Using the app does not create a professional relationship between users and MTP Psychiatry LLC.</p>

<h3>Liability Limitations</h3>
<p>The company disclaims liability for clinical errors, diagnostic mistakes, or adverse outcomes resulting from app use.</p>

<h3>Compliance</h3>
<p>The platform adheres to HIPAA, FDA guidelines for clinical decision support, and telehealth regulations while not storing Protected Health Information.</p>`,
  },
  {
    title: "HIPAA Compliance Statement",
    slug: "hipaa-compliance",
    sortOrder: 2,
    content: `<p><strong>Effective Date:</strong> 01-09-2025 | <strong>Last Updated:</strong> 20-09-2025</p>
<p><strong>Organization:</strong> OnDemandPsychiatry, operated by MTP Psychiatry LLC | <strong>Founder:</strong> Dr. Tanveer Padder</p>

<h2>1. Commitment to Data Privacy and Security</h2>
<p>OnDemandPsych is a U.S.-based psychiatric and psychopharmacology platform that follows HIPAA standards and applicable federal and state data protection laws.</p>

<h2>2. HIPAA Compliance Overview</h2>
<p>The platform operates as a clinical decision-support and educational tool — not a direct patient care or data storage system.</p>
<ul>
<li>Does not store or transmit Protected Health Information unless de-identified</li>
<li>Uses secure encryption compliant with HIPAA Security Rule standards</li>
<li>Applies minimum necessary data access principles</li>
<li>Users are responsible for ensuring no identifiable patient information is entered</li>
</ul>

<h2>3. Data Security Measures</h2>
<ul>
<li>Advanced SSL/TLS encryption for data in transit and at rest</li>
<li>HIPAA-compliant U.S. data center hosting with continuous monitoring</li>
<li>Strict user authentication protocols</li>
<li>Regular vulnerability scans and compliance assessments</li>
<li>Data minimization practices</li>
<li>Automatic session timeouts for idle users</li>
</ul>

<h2>4. User Responsibilities</h2>
<ul>
<li>Maintain confidentiality of account credentials</li>
<li>Avoid entering identifiable patient information</li>
<li>Comply with HIPAA and institutional policies</li>
</ul>

<h2>5. Data Collection Practices</h2>
<p>Limited data collected includes account information, subscription/payment data (via PCI-compliant gateways), and anonymous usage analytics. The company never sells or shares data with third parties.</p>

<h2>6. Breach Notification Policy</h2>
<p>In case of data breach, the organization commits to immediate containment, timely user notification per HIPAA requirements, and preparation of corrective action reports.</p>

<h2>7. Third-Party Compliance</h2>
<p>Vendors must maintain HIPAA Business Associate Agreements and comparable security standards.</p>

<h2>8. International Users</h2>
<p>Users acknowledge data will be transferred, processed, and stored in accordance with U.S. privacy and data protection laws.</p>

<h2>9. Continuous Compliance Improvement</h2>
<p>Policies undergo regular review to maintain alignment with HIPAA, NIST standards, and healthcare technology best practices.</p>

<h2>10. Contact Information</h2>
<p><strong>Email:</strong> support@mtppsychiatry.com</p>`,
  },
  {
    title: "Privacy Policy",
    slug: "privacy-policy",
    sortOrder: 3,
    content: `<p><strong>Effective Date:</strong> 01-09-2025 | <strong>Last Updated:</strong> 20-09-2025 | <strong>Operator:</strong> MTP Psychiatry LLC (United States-based)</p>

<h2>1. Introduction</h2>
<p>This policy explains data collection and protection practices for the OnDemandPsychiatry App, designed primarily for licensed healthcare professionals, including psychiatrists, psychiatric nurse practitioners, physician assistants, residents, and other clinicians.</p>

<h2>2. Information Collected</h2>
<p><strong>Personal Information:</strong> Full name, email address, professional credentials, login details, payment/billing information.</p>
<p><strong>Professional and Usage Data:</strong> App usage patterns, searches, notes, device information, IP address, operating system, session times, error reports.</p>
<p><strong>Non-Identifiable Data:</strong> Anonymized analytics and performance data.</p>
<p><strong>Patient-Related Information:</strong> Users are responsible for ensuring de-identified data complies with HIPAA and applicable privacy laws.</p>

<h2>3. Data Usage</h2>
<p>The platform uses data to provide services, deliver insights, process payments, improve functionality, send educational content, ensure regulatory compliance, and prevent fraud.</p>

<h2>4. Legal Basis for Processing</h2>
<ul>
<li>Contractual necessity for service delivery</li>
<li>Legitimate business interests</li>
<li>Legal compliance obligations</li>
<li>User consent for optional communications</li>
</ul>

<h2>5. Data Protection and Security</h2>
<p>Industry-standard encryption (SSL/TLS), secure firewalls, and restricted access controls protect user data. Payment processing uses PCI-compliant third-party providers. Breach notifications follow applicable U.S. law requirements.</p>

<h2>6. HIPAA Compliance</h2>
<p>The platform adheres to HIPAA standards and does not store Protected Health Information unless de-identified by users.</p>

<h2>7. Data Retention</h2>
<p>Data is retained only as long as necessary for service delivery, legal compliance, or dispute resolution. Deleted accounts result in secure deletion or anonymization, unless legal requirements mandate retention.</p>

<h2>8. Information Sharing</h2>
<p>Data is not sold. Limited sharing occurs with service providers (payment processors, hosting), legal authorities (when required by law), and business transferees (in acquisitions or mergers). All third parties must comply with strict confidentiality obligations.</p>

<h2>9. User Rights and Choices</h2>
<p>Depending on jurisdiction, users may request access to personal information, correction of inaccurate data, deletion of personal information, marketing communication opt-out, and data portability.</p>
<p><strong>Contact:</strong> support@mtppsychiatry.com</p>

<h2>10. Cookies and Tracking</h2>
<p>The platform uses cookies and analytics for performance improvement. No third-party advertising cookies collect personal data for resale purposes.</p>

<h2>11. Children's Privacy</h2>
<p>The app targets adults 18+. No intentional collection of minor data occurs; violations should be reported immediately.</p>

<h2>12. International Users</h2>
<p>Users outside the U.S. consent to data transfer, processing, and storage in the United States under potentially different data protection standards.</p>

<h2>13. Policy Updates</h2>
<p>Updates are posted with revised effective dates. Continued app use indicates acceptance.</p>

<h2>14. Contact Information</h2>
<p><strong>Support Email:</strong> support@mtppsychiatry.com<br/><strong>Company:</strong> MTP Psychiatry LLC</p>`,
  },
  {
    title: "Refund & Cancellation Policy",
    slug: "refund-cancellation-policy",
    sortOrder: 4,
    content: `<h2>Overview</h2>
<p>OnDemandPsychiatry is a clinical support platform developed by psychiatric professionals that provides 24/7 decision support and automated documentation tools for mental health providers.</p>

<h2>Membership Options</h2>
<ul>
<li><strong>Free Trial:</strong> Limited evaluation access with no payment required</li>
<li><strong>Monthly Plan:</strong> Full access renewed every 30 days with automatic renewal</li>
<li><strong>Yearly Plan:</strong> 12-month access at a discounted rate with annual renewal</li>
</ul>

<h2>Payment Terms</h2>
<p>All payments occur in advance through secure processing. The platform accepts credit/debit cards, PayPal, and approved gateways. Applicable taxes are included in the stated currency.</p>

<h2>Refund Eligibility</h2>
<p>Users may request full refunds within 14 days of initial payment. No refunds after 14 days. No refunds on renewals or partial/prorated amounts.</p>

<h2>Refund Process</h2>
<p>Requests should be sent to <strong>support@mtppsychiatry.com</strong> with account details and transaction information. Approved refunds process within 7–10 business days.</p>

<h2>Cancellation</h2>
<p>Members can cancel anytime via account settings. Service continues through the paid term's end, and users may resubscribe later.</p>

<h2>Contact & Support</h2>
<p><strong>Email:</strong> support@mtppsychiatry.com — 24–48 business hour response times.</p>
<p>This policy was authorized by Dr. Tanveer Padder, the platform's founder.</p>`,
  },
  {
    title: "Terms & Conditions",
    slug: "terms-conditions",
    sortOrder: 5,
    content: `<h2>1. Introduction</h2>
<p>OnDemandPsychiatry is operated by MTP Psychiatry LLC, a U.S.-based psychiatric company created by Dr. Tanveer Padder, a triple-board certified psychiatrist. The platform serves licensed healthcare professionals including psychiatrists, nurse practitioners, physicians, residents, PAs, and therapists.</p>

<h2>2. Use of the App</h2>
<p>Users must be licensed healthcare professionals or individuals 18+ capable of forming contracts. Permitted uses include clinical support, professional workflow enhancement, and educational growth. Prohibited activities include illegal use, false data entry, hacking attempts, account sharing, and HIPAA violations.</p>

<h2>3. Account Registration and Security</h2>
<p>Users must provide accurate information and maintain credential confidentiality. The company reserves rights to suspend or terminate accounts for violations or illegal activities.</p>

<h2>4. Services Provided</h2>
<p>The platform offers membership-based access with AI tools, documentation automation, and clinical decision support. Generated materials like SOAP notes, psychiatric evaluations, and billing codes require user review before clinical use.</p>

<h2>5. Payments and Subscriptions</h2>
<p>Fees are displayed within the app. Some memberships auto-renew monthly or annually. No refunds are issued once digital access or services have been utilized, with exceptions for duplicate billing or technical issues.</p>

<h2>6. Privacy and Data Security</h2>
<p>User data supports service provision and security. The company employs encryption and firewalls but cannot guarantee absolute breach protection.</p>

<h2>7. Intellectual Property</h2>
<p>All algorithms, content, and app functionalities belong exclusively to MTP Psychiatry LLC under copyright and trademark law.</p>

<h2>8. Limitation of Liability</h2>
<p>The app is a clinical support tool, not a medical diagnosis substitute. The company disclaims liability for damages from app use or unavailability.</p>

<h2>9. Governing Law</h2>
<p>Maryland law governs disputes, resolved through Maryland courts.</p>

<p><strong>Contact:</strong> support@mtppsychiatry.com</p>`,
  },
  {
    title: "Data Protection & Security Notice",
    slug: "data-protection-security",
    sortOrder: 6,
    content: `<p><strong>Effective Date:</strong> January 1, 2026</p>

<h2>1. Introduction</h2>
<p>OnDemandPsych is committed to protecting the confidentiality, integrity, and availability of user information through our psychiatric co-pilot app and website.</p>

<h2>2. Information Collection</h2>
<p>The company collects user-provided data (account details, communications) and technical information (device identifiers, IP addresses, browser type, usage logs) to operate services. Mental health data receives heightened protection measures.</p>

<h2>3. Security Measures</h2>
<ul>
<li><strong>Encryption:</strong> TLS/HTTPS for transit; strong encryption for stored data</li>
<li><strong>Access Controls:</strong> Multi-factor authentication and logged access restrictions</li>
<li><strong>Infrastructure:</strong> Secure hosting with continuous monitoring and intrusion detection</li>
<li><strong>Data Minimization:</strong> Information retained only as necessary</li>
</ul>

<h2>4. Compliance</h2>
<p>OnDemandPsych voluntarily incorporates high standards of data protection. HIPAA may not automatically apply unless specific covered entity conditions exist.</p>

<h2>5. Data Sharing</h2>
<p>The company does not sell personal or health-related data. Limited sharing occurs with trusted service providers under confidentiality agreements.</p>

<h2>6. Incident Response</h2>
<p>The company maintains procedures for investigating, containing, and remediating security incidents with required legal notifications.</p>

<h2>7. User Rights</h2>
<p>Contact <strong>support@ondemandpsych.com</strong> to request data access, correction, deletion, or security practice inquiries.</p>`,
  },
  {
    title: "Cookie Policy",
    slug: "cookie-policy",
    sortOrder: 7,
    content: `<p><strong>Effective Date:</strong> January 1, 2026</p>
<p>This cookie policy explains how cookies and tracking technologies function across our website and application at https://copilot.ondemandpsych.com/.</p>

<h2>Strictly Necessary Cookies</h2>
<p>These enable essential functions like user authentication and secure access. They are set automatically and cannot be turned off via settings on the Site.</p>

<h2>Performance & Analytics Cookies</h2>
<p>The organization collects anonymized usage data about how visitors interact with the platform to enhance performance without gathering personally identifiable information.</p>

<h2>Functional Cookies</h2>
<p>These retain user preferences such as language settings and application configurations for a customized experience.</p>

<h2>Third-Party Cookies</h2>
<p>External service providers integrated into the platform may deploy their own cookies, which operate under those vendors' policies rather than OnDemandPsych's direct control.</p>

<h2>User Control & Consequences</h2>
<p>Most browsers permit cookie management through settings. However, disabling cookies may limit functionality or prevent full use of the App or Site.</p>

<h2>Contact Information</h2>
<p>Users with cookie-related questions can reach <strong>support@ondemandpsych.com</strong>.</p>`,
  },
];

const faqs = [
  { category: "About the Psychiatry Clinical Co-Pilot", question: "What is a psychiatry clinical co-pilot?", answer: "It's a clinician-in-the-loop decision-support system designed to provide psychiatric assistance at medical facilities, supporting diagnostic assessment, medication selection, risk evaluation, and documentation while clinicians retain full authority." },
  { category: "About the Psychiatry Clinical Co-Pilot", question: "How is a psychiatry clinical co-pilot different from a chatbot?", answer: "The system operates through established medical psychiatric procedures involving direct patient assessment and provides structured reasoning, safety awareness, and defensible documentation capabilities, unlike standard chatbots offering only conversational responses." },
  { category: "About the Psychiatry Clinical Co-Pilot", question: "Is this considered AI replacing clinicians?", answer: "No. The system doesn't function autonomously. The clinician maintains complete authority for all clinical decisions, which includes evaluating patients and making medical choices." },
  { category: "Clinical Use & Decision Support", question: "How can the Psychiatry Clinical Co-Pilot assist a patient?", answer: "It supports clinicians throughout encounters — preparation, clinical reasoning, treatment planning, and documentation — particularly in complex, high-risk, or time-sensitive situations." },
  { category: "Clinical Use & Decision Support", question: "What kinds of clinical judgments does it support?", answer: "Common applications include follow-up planning, admission/discharge decisions, psychopharmacology choices, polypharmacy review, suicide and violence risk assessment, and diagnostic formulation." },
  { category: "Clinical Use & Decision Support", question: "Is it suitable for use in high-acuity or emergency situations?", answer: "Yes. It supports emergency psychiatry, crisis stabilization, inpatient care, consultation-liaison psychiatry, and other high-risk situations requiring prompt, safe decision-making." },
  { category: "Medication & Psychopharmacology", question: "Does the Clinical Co-Pilot help with complex medication management?", answer: "Yes. It assists clinicians considering medication sequencing, interactions, monitoring considerations, tapering strategies, and treatment-resistant cases, promoting safer prescribing." },
  { category: "Medication & Psychopharmacology", question: "Does the Psychiatric Co-Pilot assist in making decisions about polypharmacy?", answer: "Yes. It organizes reasoning around polypharmacy, including risk mitigation, interaction awareness, and logical simplification, without prescribing treatment." },
  { category: "Medication & Psychopharmacology", question: "Does the Co-Pilot take the place of training in clinical pharmacology?", answer: "No. It enhances clinician expertise and experience in complicated or novel situations rather than replacing clinical training." },
  { category: "Documentation & Workflow", question: "How does the psychiatry clinical co-pilot help with documentation?", answer: "It generates clear, structured, chart-ready psychiatric documentation that captures clinical reasoning, risk assessments, and treatment decisions while the encounter is still fresh." },
  { category: "Documentation & Workflow", question: "Does it reduce documentation time?", answer: "Clinicians commonly report significantly faster documentation and reduced after-hours charting, though actual time savings vary by setting and workflow." },
  { category: "Documentation & Workflow", question: "Does it interfere with existing workflows?", answer: "No. OnDemand Psychiatry is designed to support real-world psychiatry workflows without forcing changes to how clinicians practice." },
  { category: "Compliance, Privacy & Standards", question: "Does On-Demand Psychiatry adhere to HIPAA regulations?", answer: "It uses HIPAA-aligned design principles for safe clinical use, though clinicians remain accountable for appropriate use per their organization's policies." },
  { category: "Compliance, Privacy & Standards", question: "Does it adhere to CMS documentation standards and DSM-5-TR?", answer: "Yes. The system supports CMS-appropriate clinical documentation procedures and DSM-5-TR-aligned diagnostic reasoning." },
  { category: "Compliance, Privacy & Standards", question: "Does On-Demand Psychiatry offer billing or legal advice?", answer: "No. It doesn't replace legal, compliance, or billing expertise; rather, it enhances clinical reasoning and documentation." },
  { category: "EMR & Technical Questions", question: "Does On-Demand Psychiatry integrate with EMRs?", answer: "No EMR integration is required. The system functions independently across multiple systems, sites, or organizations." },
  { category: "EMR & Technical Questions", question: "Can On-Demand Psychiatry be used across different practice settings?", answer: "Yes. It's used in telepsychiatry, residential programs, emergency rooms, outpatient clinics, inpatient units, and integrated care settings." },
  { category: "Who Uses the Psychiatry Clinical Co-Pilot?", question: "Who is On-Demand Psychiatry designed for?", answer: "The psychiatric clinical co-pilot is used by psychiatrists, psychiatric nurse practitioners (PMHNPs), primary care clinicians managing mental health conditions, behavioral health teams, and clinicians in training." },
  { category: "Who Uses the Psychiatry Clinical Co-Pilot?", question: "Is it suitable for clinicians under supervision or trainees?", answer: "Yes. It serves as a teaching and supervised decision-support tool that preserves faculty or attending oversight while clarifying clinical reasoning." },
  { category: "Evidence, Experience & Trust", question: "Who built On-Demand Psychiatry?", answer: "Dr. Tanveer A. Padder, a triple board-certified psychiatrist with 25+ years leading emergency, inpatient, outpatient, and addiction psychiatry programs, created it." },
  { category: "Evidence, Experience & Trust", question: "Is the psychiatric clinical co-pilot based on real clinical experience?", answer: "Yes. It's informed by real-world psychiatric practice, structured clinical frameworks, and extensive frontline clinical experience." },
  { category: "Access, Trials & Getting Started", question: "Can I try the psychiatry clinical co-pilot before committing?", answer: "Yes. Clinicians can access free trials or brief demonstrations to assess platform suitability." },
  { category: "Access, Trials & Getting Started", question: "How do I contact the On-Demand Psychiatry team with questions?", answer: "Contact via the Contact Us page or email support@mtppsychiatry.com for inquiries about clinical use cases, membership, or technical support." },
  { category: "Access, Trials & Getting Started", question: "Can I talk to someone before I start with On-Demand Psychiatry?", answer: "Yes. Interested clinicians can contact the support team at support@mtppsychiatry.com to request demonstrations or initial consultations." },
];

async function main() {
  console.log("Seeding legal pages...");
  for (const page of legalPages) {
    await prisma.legalPage.upsert({
      where: { slug: page.slug },
      update: { title: page.title, content: page.content, sortOrder: page.sortOrder },
      create: page,
    });
    console.log(`  ✓ ${page.title}`);
  }

  console.log("\nSeeding FAQs...");
  // Clear existing FAQs first
  await prisma.fAQ.deleteMany();
  for (let i = 0; i < faqs.length; i++) {
    await prisma.fAQ.create({
      data: { ...faqs[i], sortOrder: i + 1 },
    });
    console.log(`  ✓ ${faqs[i].question.slice(0, 60)}...`);
  }

  console.log(`\nDone! Seeded ${legalPages.length} legal pages and ${faqs.length} FAQs.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
