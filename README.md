<div align="center">
  <img src="public/dark-logo.png" alt="Hesabi Logo" width="150" />

### Know Where Your Money Goes

A modern, intuitive personal finance management application built with Next.js

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-black?logo=next.js)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Turso](https://img.shields.io/badge/Turso-SQLite-4FF8D2?logo=turso)](https://turso.tech/)

[Live Demo](https://hesabi.vercel.app) · [Report Bug](https://github.com/ahabibidev/hesabi/issues) · [Request Feature](https://github.com/ahabibidev/hesabi/issues)

  <img src="public/screenshots/dashboard.png" alt="Hesabi Dashboard" width="800" />
</div>

---

## ✨ Features

### 📊 **Dashboard**

- Real-time overview of your financial health
- Income vs. expense visualization
- Recent transactions at a glance
- Budget progress tracking

### 💳 **Transaction Management**

- Track income and expenses
- Categorize transactions with custom categories
- Search, filter, and sort transactions
- Recurring transaction support

### 📈 **Budgets**

- Create monthly, weekly, or yearly budgets
- Visual progress bars
- Category-based budget tracking
- Overspending alerts

### 🐷 **Savings Pots**

- Set savings goals
- Track progress towards targets
- Add or withdraw money
- Custom colors and icons

### 🔐 **Authentication**

- Email/password registration
- Google OAuth integration
- GitHub OAuth integration
- Email verification with OTP
- Secure session management

### 🎨 **User Experience**

- Beautiful, responsive design
- Dark and light mode support
- Customizable avatars
- Multi-currency support (USD, EUR, GBP, AFN, IRR, INR, PKR)

### 💱 **Multiple Currencies at Once**

- Pick a **main currency** — every balance, budget and total is reported in it
- Enter any transaction in another currency; it is converted on the way in
- Savings pots hold a currency of their own, with the main-currency value
  shown underneath
- Your own exchange rates, editable per entry for the rate you actually got

> **Why the rate is stored on each record:** the rate is frozen when you save.
> A single global rate would mean that updating it silently rewrote what your
> past spending was worth — a 6,500 AFN grocery run from March would quietly
> change value every time the rate moved. Here it keeps the rate it was made at.
>
> Pot balances are never converted on write either, so a rate change cannot make
> it look like money moved in or out of your savings.

Run `node scripts/migrate-multi-currency.js` once to add the columns. It is
additive and safe to re-run.

### 📱 **Installable App (PWA)**

- Install to your home screen or desktop and launch in a standalone window
- App shortcuts straight to Transactions, Budgets, Pots and Recurring Bills
- Assets are served from a service worker cache for instant repeat loads
- A branded offline page when the connection drops
- In-app prompt when a new version has been deployed

> **Privacy note:** the service worker never caches page HTML or `/api` responses.
> Balances, transactions and session data always come from the network, so no
> readable copy of your finances is left behind on a shared device.

---

## 🛠️ Tech Stack

| Category           | Technology                                      |
| ------------------ | ----------------------------------------------- |
| **Framework**      | [Next.js](https://nextjs.org/) (App Router)     |
| **Language**       | JavaScript (ES6+)                               |
| **Styling**        | [Tailwind CSS](https://tailwindcss.com/)        |
| **Database**       | [Turso](https://turso.tech/) (Edge SQLite)      |
| **Authentication** | [NextAuth.js](https://next-auth.js.org/)        |
| **Charts**         | [Recharts](https://recharts.org/)               |
| **Icons**          | [Lucide React](https://lucide.dev/)             |
| **Email**          | [Brevo](https://www.brevo.com/)                 |
| **Animations**     | [Framer Motion](https://www.framer.com/motion/) |
| **Deployment**     | [Vercel](https://vercel.com/)                   |
| **PWA**            | Web App Manifest + custom service worker        |

---

# 🚀 Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm or yarn
- Turso account (for database)
- Google/GitHub OAuth credentials (optional)
- Brevo account (for email verification)

### Installation

1. **Clone the repository**
   ```
   git clone https://github.com/ahabibidev/hesabi.git
   cd hesabi
   ```
2. **Install dependencies**
   ```
   npm install
   ```
3. **Set up environment variables**

   Create a `.env.local` file with the following content:

```
 NEXTAUTH_URL=http://localhost:3000
 NEXTAUTH_SECRET=your-secret-key
 TURSO_DATABASE_URL=your-turso-url
 TURSO_AUTH_TOKEN=your-turso-token
 GOOGLE_CLIENT_ID=your-google-id
 GOOGLE_CLIENT_SECRET=your-google-secret
 GITHUB_CLIENT_ID=your-github-id
 GITHUB_CLIENT_SECRET=your-github-secret
BREVO_API_KEY=your-brevo-key
```

4. **Run migrations:**

```
npm run migrate:turso
```

5. **Run the development server:**

```
npm run dev
```

6. Open your browser and navigate to [http://localhost:3000](http://localhost:3000)

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

- Fork the repository.
- Create your feature branch (`git checkout -b feature/AmazingFeature`).
- Commit your changes (`git commit -m 'Add some AmazingFeature'`).
- Push to the branch (`git push origin feature/AmazingFeature`).
- Open a Pull Request.

## Author

<div align="center">

**Ali Reza Habibi** — Software Engineer

[![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/ahabibidev)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/ali-reza-habibi)
[![Portfolio](https://img.shields.io/badge/Portfolio-FF5722?style=for-the-badge&logo=google-chrome&logoColor=white)](https://ahabibi.dev)

</div>

---

## Acknowledgments

- [Next.js](https://nextjs.org/) — The React Framework
- [Turso](https://turso.tech/) — Edge Database
- [Tailwind CSS](https://tailwindcss.com/) — Utility-first CSS
- [Lucide](https://lucide.dev/) — Beautiful Icons
- [Recharts](https://recharts.org/) — Chart Library

---

## 📄 License

This project is licensed under the **GNU Affero General Public License v3.0** - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  
Made with ❤️ by [Ali Reza Habibi](https://ahabibi.dev)

⭐ Star this repository if you find it helpful!

</div>
