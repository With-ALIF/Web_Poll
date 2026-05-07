# Telegram Quiz Generator

An AI-powered web application that automatically generates multiple-choice quizzes from any text and sends them directly to your Telegram channel or group as native Telegram Polls.

## ✨ Features

- **🤖 AI Quiz Generation:** Paste any article, notes, or text, and let Google's Gemini AI automatically extract key information to create engaging multiple-choice questions.
- **✈️ Direct Telegram Integration:** Send generated quizzes directly to your Telegram channel or group using the Telegram Bot API.
- **💾 Export Quizzes:** Download your generated quizzes in **CSV** or **JSON** formats for offline use or importing into other platforms.
- **✏️ Quiz Management:** 
  - Edit questions, options, and explanations before sending.
  - Add or remove options dynamically.
  - Delete unwanted questions.
- **📦 Bulk Actions:** Select multiple quizzes to delete, or use the "Send All Pending" button to publish all generated quizzes to Telegram sequentially.
- **🎨 Custom Formatting:** Add custom prefixes (e.g., "Q:") to questions and suffixes (e.g., "@channelname") to explanations.
- **📊 Real-time Status:** Track the status of each quiz (Pending, Sending, Sent, Error) and view overall statistics (Total Generated, Total Sent).
- **🔐 User Authentication:** Securely sign in with **Google** or **Email** to access your profile and saved poll history.
- **👤 Profile Management:** View your account details and manage your generated content in one place.

## 🚀 How to Use

### 1. Telegram Setup
1. Open Telegram and search for **[@web_poll_bot](https://t.me/web_poll_bot)**.
2. Add the bot to your Telegram Channel or Group and grant it **Admin** privileges so it can send messages.
3. Send a message (like "hello" or `/id`) in your channel/group or directly to the bot to get your exact **Chat ID**. (Note: The bot only auto-replies to the first message to prevent spam. Use `/id` anytime to get it again).

### 2. App Configuration
1. Open the **Settings** (gear icon) in the app.
2. Paste your **Chat ID** into the designated field.
3. (Optional) Configure your preferred Question Prefix and Explanation Suffix.
4. Click **Save Configuration**.

### 3. Generate & Send
1. Paste your study material, article, or any text into the input area on the left.
2. Click **Generate Quiz**.
3. Review the generated questions on the right. You can edit them by clicking the pencil icon.
4. Click **Send to Channel** on individual quizzes, or click **Send All Pending** to publish them all at once!

## 🛠️ Tech Stack

- **Frontend:** React 18, TypeScript, Vite
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Animations:** Framer Motion
- **AI Integration:** Google Gemini API (`@google/genai`)
- **Telegram Integration:** Telegram Bot API (`sendPoll` method)

## 📝 Notes

- Telegram polls have a strict limit of **300 characters** for questions and **200 characters** for explanations. The app automatically truncates text that exceeds these limits to ensure successful delivery.
- A maximum of 10 options is allowed per poll by Telegram, though this app defaults to generating 4 options for optimal user experience.

## 👨‍💻 Developer

**Abdullah Al Khalid Alif**
- 📧 Email: [alifbrur16@gmail.com](mailto:alifbrur16@gmail.com)
- 🐙 GitHub: [With-ALIF](https://github.com/With-ALIF)
- ✈️ Telegram: [@ALIF1230](https://t.me/ALIF1230)
