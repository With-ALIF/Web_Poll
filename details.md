# TeleQuiz Project Documentation

## 1. Introduction
TeleQuiz is a comprehensive, full-stack web application designed to streamline the creation, management, and deployment of quiz polls to Telegram channels. It leverages AI for content generation and provides robust tools for organizing and exporting quiz data.

## 2. Core Features

### 2.1. AI Quiz Generation & Workflow
- **AI-Powered Creation**: TeleQuiz utilizes **Google's Gemini Pro** model through the `@google/genai` SDK. Users can provide raw text, and the AI parses it into structured JSON matching the `QuizQuestion` schema.
- **Context Preservation**: The system remembers the last input text to allow for "Generate More" functionality without re-pasting content.
- **Manual Editor**: A robust interface to fine-tune AI-generated questions. Features include real-time validation of correct option indices and mandatory explanation fields.
- **Image Integration**:
  - **URL-based**: Direct linking to cloud-hosted images.
  - **Storage-based**: Integration with Firebase Storage or external hosting providers.
- **Dynamic Bulk Operations**:
  - **Batch Topic Assignment**: Updates the `topic` field across selected Firestore documents in a single transaction or batch.
  - **Telegram Queueing**: Parallelized sending logic with rate-limit awareness to prevent bot throttling.
  - **Sync-to-Draft**: Instant status update from `pending` to `draft`, triggering real-time UI updates via listener hooks.

### 2.2. Draft & Poll Management
- **Drafts Page**: A dedicated workspace for questions not yet ready for publication.
  - **Persistence**: Drafts are stored in Firestore, ensuring they persist across sessions.
  - **Workflow**: Drafts can be sent directly to Telegram. Upon successful sending, they are moved to the "Sent Polls" list.
- **Sent Polls Page**: A historical archive of all polls successfully deployed to Telegram channels.
- **Real-time Sync**: The application uses Firestore's `onSnapshot` to provide real-time updates across all devices.

### 2.3. Utility Tools
- **CSV Modifier**: A specialized tool to modify CSV exports. It allows users to append custom suffixes to question sections.
- **Enhanced CSV Export**: The CSV export logic has been refined. From the suffix input, `Type` is now strictly set to `1`, while the `Section` is dynamically set based on the user's input (e.g., `bm`, `bn`, `p`, `c`).
- **QBS (Question Bank System)**: A new integration currently in development ("Coming Soon"). It is designed to allow users to store and manage a centralized bank of questions using Firestore. Access is managed by admins.

### 2.4. Role-Based Access Control (RBAC) & Admin Tools
- **Hierarchical Access**:
  - **Admins**: Have full system visibility, including global statistics, user directory management, and feature toggle authority.
  - **Regular Users**: Access is strictly limited to authorized "Pages" (Features).
- **Admin Dashboard**:
  - **User Management**: Admins can create, delete, and modify user permissions.
  - **Granular Permissions**: Access is granted per feature (`polls`, `drafts`, `qbs`, `csv-modifier`, `formats`).
- **Admin Stats**: Real-time aggregated data showing total users, total polls sent, and system activity logs.
- **Feature Directory**: A central hub where admins can visualize and test new integrations before rolling them out to users.

### 2.5. Telegram & Bot Execution Logic
- **Secured Credentials**: Bot tokens and Channel IDs are stored in user-specific Firestore settings, never exposed in client-side code repositories.
- **Poll Construction**: The application converts internal question objects into Telegram `sendPoll` or `sendPhoto` + `sendPoll` method calls depending on image presence.
- **Message Templates**: Supports dynamic injection of prefixes/suffixes (e.g., `[Topic] Question?`).

### 2.6. Exam Paper Footer Customization
- **Dynamic Footer**: Users can now customize the footer of generated exam papers with a name and a clickable hyperlink for better branding and attribution.

### 2.7. Specialized Content Creation Tools
- **Exam Paper Generator**: Enables the creation of professional, printable 2-column MCQ exam papers. Features include automated question formatting, difficulty level toggling, watermark support, and editable question management within the UI.
- **Photocard Editor**: A sophisticated tool for generating branded promotional images ("photocards"). Features include customizable layouts, logo positioning, background image selection, social media handle placement, and preset management for consistent branding.
- **OCR/Data Processing**: Utilities to extract text or structured data from mixed-format sources to prepopulate content for both the Quiz Generation and Exam Paper tools, reducing manual data entry.
- **Smart Note (AI Note Formatter & Release System)**: A high-fidelity module that leverages Gemini AI (`gemini-3.5-flash`) via a full-stack secure API proxy to refine raw ideas, list points, facts, or questions into beautifully structured, comprehensive study sheets.
  - **Structured Formatting & Styles**: Formats raw text into elegant markdown styled with sequential Bengali headings, bulleted sub-lists, and clear layouts.
  - **Dynamic Tables**: Auto-evaluates units, scaling prefixes, dimensions, or physical variables lists and renders them in sleek Markdown tables.
  - **Branded & Styled Cards**: Prepares educational highlights with visual spotlight banners such as *মনে রাখো* (Remember line info), *Admission Tip* blocks, and mnemonic *Shortcut Lines*.
  - **Smart A4 PDF Page-Breaking Engine**: Incorporates a client-side layout parser that dynamically measures component heights to partition markdown content into A4 pages cleanly. Inserts a decorative meta header card, custom creator metadata, dynamic page numbers, and custom bottom footers without clipping elements.
  - **Telegram Integration**: Posts full notes directly to designated Telegram channels, prepended with a beautiful metadata card block containing the title, creator profile, and release date.

### 2.8. UI/UX Layout Optimization
- **Responsive Toolbar Design**: The `QuizListToolbar` and `QuizListHeader` have been optimized for high-density information display. On desktop, typography is scaled up for better legibility (e.g., larger select fields and labels), while on mobile, a vertical "stacked" layout is used to prevent horizontal clipping.
- **Improved Information Hierarchy**: Stats cards (Generated/Sent) and configuration previews (Prefix/Suffix) now feature subtle shadows, refined indigo/purple color palettes, and clear uppercase labels for a professional, "dashboard-like" aesthetic.
- **Action-Oriented Workflow**: The main "Send All" button is now more prominent and consistently positioned at the bottom of the toolbar configuration on mobile or as a clear CTA on desktop.

## 3. Branding
- **Logo**: The application features a custom logo (Purple/White Playful Quiz Time branding) used as the favicon, Apple touch icon, and in the authentication headers.
- **App Name**: TeleQuiz.

## 4. Technical Architecture

### 4.1. Frontend
- **Framework**: React 18+ with Vite.
- **Styling**: Tailwind CSS for responsive, utility-first design.
- **State Management**: React Hooks (`useState`, `useEffect`) and custom feature-specific hooks.
- **Animations**: `motion` (framer-motion) for smooth UI transitions.
- **Icons**: `lucide-react`.

### 4.2. Backend & Infrastructure
- **Database**: Firebase Firestore (NoSQL).
- **Authentication**: Firebase Authentication (Google Login).
- **Security**: Firestore Security Rules enforce data ownership (users can only access their own quizzes, drafts, and settings).
- **Deployment**: Deployed on Google Cloud Run.

## 5. Project Structure

- `/src/features/`: Contains feature-based modules.
  - `quiz/`: Quiz generation, editing, listing, and bulk actions.
  - `draft/`: Draft management logic and components.
  - `qbs/`: Question Bank System placeholder.
  - `auth/`: Authentication flow.
  - `settings/`: Telegram bot and channel configuration.
  - `profile/`: User profile management.
  - `admin/`: User and system management for admins.
  - `note/`: Smart Note formatting, client-side PDF pagination processor, and Telegram release dispatcher.
- `/src/components/`: Shared UI components (Header, Footer, Navigation, ProtectedRoute).
- `/src/lib/`: Utility functions (e.g., `firestoreUtils.ts` for error handling).
- `/src/app/`: Application entry points (`App.tsx`, `AppRoutes.tsx`, `useAppInit.ts`).

## 6. Data Models & Schemas

### 6.1. QuizQuestion
```typescript
{
  id: string; // Firestore Auto-ID
  question: string; // Max 300 chars (Telegram limit)
  options: string[]; // 2-10 options
  correctOptionIndex: number; // 0-based
  explanation: string; // Max 200 chars (Telegram limit)
  status: 'pending' | 'sending' | 'sent' | 'error';
  image?: string; // Optional URL
  topic?: string; // Used for organization
  userId: string; // Relational link to User
  createdAt: Timestamp; // Server side timestamp
}
```

### 6.2. User (AdminUser)
```typescript
{
  id: string; // Firebase Auth UID
  email: string;
  displayName: string;
  role: 'admin' | 'user';
  permissions: string[]; // ['qbs', 'polls', etc.]
  lastActive: Timestamp;
}
```

### 6.3. UserSettings
```typescript
{
  botToken: string;
  activeChannelId: string;
  channels: Array<{ id: string; name: string }>;
  formatting: {
    questionPrefix: string;
    explanationSuffix: string;
    // ... other flags
  }
}

### 6.4. Note
```typescript
{
  id: string; // Firestore Document ID
  userId: string; // Relational link to User
  title: string; // Title of the study note
  rawInput: string; // Raw input material
  formattedContent: string; // Rendered markdown note response from Gemini
  status: 'draft' | 'sending' | 'sent' | 'error';
  createdAt?: Timestamp; // Server side timestamp
  updatedAt?: Timestamp; // Server side timestamp
}
```

**Smart Note এর প্রধান কাজসমূহ (Key Capabilities):**
1. **AI-ভিত্তিক নোট সাজানো**: যেকোনো অগোছালো Raw Text বা ক্লাসের টপিকগুলোকে Gemini AI-এর মাধ্যমে নিখুঁত ও চমৎকার বাংলা বা ইংরেজি রেডি-মেড স্টাডি শিট ও লেকচার নোটে রূপান্তর করে।
2. **চমৎকার ফরম্যাটিং ও হাইলাইট**: গুরুত্বপূর্ণ পয়েন্টগুলোর জন্য বিশেষভাবে *মনে রাখো*, *Admission Tip*, এবং গাণিতিক সূত্রের জন্য *Shortcut Line* সংবলিত আকর্ষণীয় ভিজ্যুয়াল কার্ড ও বক্স তৈরি করে।
3. **ফর্মুলা ও ডাটা টেবিল জেনারেশন**: বিজ্ঞানের একক, সংকেত, মাত্রা ও বিভিন্ন সমীকরণ বা তথ্যকে নিখুঁত কলাম এবং সুন্দর সারি বিশিষ্ট টেবিল ফরম্যাটে রূপান্তর করে।
4. **স্মার্ট A4 পিডিএফ পেজ-ব্রেকার**: তৈরি হওয়া নোটে যেন কোনো কন্টেন্ট বা লাইন পেজের শেষে কেটে না যায়, তার জন্য স্ক্রিনের সাইজ মেপে স্বয়ংক্রিয়ভাবে সুন্দর হেডার, ফুটার এবং পেজ নাম্বারসহ পৃষ্ঠা বিভাজন করে।
5. **টেলিগ্রাম ডিসপ্যাচ বা রিলিজ**: এক ক্লিকেই সম্পূর্ণ গোছানো নোটটি স্টুডেন্টদের চ্যানেলে সুন্দর ডিজাইনের টাইটেল ইমেজ/হেডার ও মেটা কার্ড বিবরণী সহ সরাসরি পাবলিশ করে।

```

```
## 7. Security & Validation
- **Firestore Rules**: Strict rules ensure that users can only read/write their own data (`userId` matching `request.auth.uid`).
- **Error Handling**: Custom error boundaries and Firestore error handlers (`handleFirestoreError`) ensure that permission issues are logged and surfaced to the user.

## 8. Development Guidelines

### 8.1. Component Development
- All `.tsx` files should be kept under 120 lines of code for modularity (extended to accommodate rich UI components).
- Use functional components and hooks.
- Use Tailwind CSS for all styling.

### 8.2. State Management
- Prefer primitive values in dependency arrays for `useEffect`.
- Avoid infinite re-renders by not updating state directly in the component body.

### 8.3. Firebase Integration
- Use `firebase-applet-config.json` for configuration.
- Always use `onSnapshot()` for real-time data fetching.
- Implement robust error handling for all Firestore operations.

## 9. Future Improvements
- Complete QBS (Question Bank System) integration with Firestore.
- Add support for more Telegram poll types (e.g., quiz, regular poll).
- Implement advanced analytics for sent polls.
- Add support for more AI models for content generation.
- Enhance CSV Modifier with more advanced data transformation options.
- Implement unit and integration tests for core features.
- Optimize Firestore queries for better performance.
- Add support for custom themes in quiz generation.
- Enhance Telegram channel formatting options.
- Add support for user-defined quiz templates.

## 10. Conclusion
TeleQuiz is designed to be a scalable, secure, and user-friendly platform for Telegram quiz management. By leveraging modern web technologies and Firebase, it provides a seamless experience for creators to generate, manage, and deploy content efficiently. The modular architecture ensures that new features can be added with minimal friction, making it a robust solution for content creators.

---
 