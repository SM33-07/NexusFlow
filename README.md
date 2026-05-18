# 🌌 NexusFlow | The Enterprise Goal Canvas

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![React Flow](https://img.shields.io/badge/React_Flow-Interactive-FF0072?style=for-the-badge&logo=react)](https://reactflow.dev/)
[![Zustand](https://img.shields.io/badge/Zustand-State_Management-informational?style=for-the-badge)](https://zustand-demo.pmnd.rs/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Hackathon](https://img.shields.io/badge/ATOMQUEST-Hackathon_1.0-purple?style=for-the-badge)](#)

> **Reimagining enterprise performance management through a visual, intelligent, and gamified goal orchestration platform.**

---

# 🧠 What is NexusFlow?

Modern enterprises still depend on spreadsheets, disconnected KPIs, and static appraisal systems that fail to create alignment between employees and organizational goals.

**NexusFlow** transforms this workflow into an interactive visual ecosystem.

Instead of filling rows in a spreadsheet, employees create interconnected goal nodes on a dynamic canvas. Managers gain real-time visibility into performance progress, while HR teams receive structured reporting and compliance-ready data exports.

The platform combines:

- 🎯 Goal planning
- 🧩 Visual hierarchy mapping
- ⚡ Real-time performance tracking
- 🤖 AI-assisted SMART goal generation
- 🔒 Strict enterprise rule enforcement
- 🎮 Gamified UX interactions

---

# 🚨 The Problem

Traditional goal management systems suffer from:

- Fragmented Excel sheets and offline tracking
- Poor visibility into employee progress
- Manual appraisal consolidation
- Low employee engagement
- Inconsistent KPI structures
- Delayed managerial feedback cycles
- Weak alignment with organizational thrust areas

This creates operational blind spots and turns performance reviews into administrative overhead.

---

# 💡 Our Solution

NexusFlow introduces a **visual enterprise goal canvas** that makes organizational planning intuitive, enforceable, and collaborative.

Employees build objectives as draggable nodes connected through dependencies and weightages.

Managers monitor performance through live dashboards and structured review systems.

HR/Admin teams receive standardized exports and enterprise-ready reporting pipelines.

---

# ✨ Core Features

---

## 🎯 1. Interactive Goal Canvas

The centerpiece of NexusFlow.

Employees create and organize objectives visually using a node-based graph powered by React Flow.

### Capabilities

- Drag-and-drop node creation
- Goal dependency visualization
- Dynamic edge connections
- Expandable node hierarchy
- Real-time canvas updates
- Smooth animated interactions

### Why it matters

Transforms abstract performance planning into a spatial, intuitive workflow.

---

## 🔒 2. Enterprise BRD Enforcement Engine

NexusFlow strictly follows enterprise business rules directly at the UI layer.

### Rules Enforced

✅ Total goal weightage must equal **exactly 100%**  
✅ Every goal node must maintain a minimum **10% weightage**  
✅ Invalid submissions are physically blocked  
✅ Live validation indicators update instantly

### Result

Zero ambiguity. Zero invalid submissions.

---

## 🤖 3. AI Pathfinder (Hackathon Bonus)

A simulated AI co-pilot that assists employees in generating structured SMART goals.

### AI Suggestions Include

- Goal Title
- Measurable Targets
- Unit of Measurement (UoM)
- Suggested timelines
- Thrust-area alignment

### Example

**Input:**  
> “Customer Experience Improvement”

**Generated Goal:**  
> “Increase customer satisfaction score from 78% to 90% by Q4 through workflow optimization.”

---

## 📊 4. Manager PulseBoard

A command-center dashboard designed for L1/L2 managers.

### Features

- Planned vs actual achievement tracking
- Team-wide progress monitoring
- KPI distribution visibility
- Goal completion analytics
- Real-time performance snapshots

---

## 📝 5. Quarterly Check-ins & Reviews

Integrated review workflows eliminate fragmented feedback collection.

### Includes

- Slide-over feedback panels
- Quarterly review notes
- Structured manager observations
- Continuous performance documentation

---

## 📁 6. Instant Reporting Engine

One-click export system for HR and administrative workflows.

### Supported Outputs

- CSV exports
- Goal achievement summaries
- Team performance reports
- KPI tracking sheets

---

## 🎨 7. Immersive UI/UX System

NexusFlow is designed with a futuristic enterprise aesthetic.

### Design Philosophy

- Cyberpunk-inspired Neon-Night interface
- Glassmorphism components
- Floating micro-interactions
- Dynamic gradient pipelines
- High-contrast accessibility
- Adaptive light/dark theming

---

# 🧱 System Architecture

```txt
┌──────────────────────────────┐
│         Next.js App          │
├──────────────────────────────┤
│ React Flow Interactive Layer │
├──────────────────────────────┤
│ Zustand Global State Store   │
├──────────────────────────────┤
│ Validation + BRD Engine      │
├──────────────────────────────┤
│ Reporting & Analytics Layer  │
└──────────────────────────────┘
```

---

# 🛠️ Technology Stack

| Category | Technology |
|---|---|
| Frontend Framework | Next.js 14 |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Node Engine | React Flow |
| State Management | Zustand |
| Icons | Lucide React |
| Theme System | next-themes |
| Animations | Framer Motion |
| Deployment | Vercel |

---

# ⚡ Performance Highlights

- Instant UI updates with Zustand
- Minimal re-renders
- Optimized graph rendering
- Responsive canvas interactions
- Smooth animations at scale
- Fully client-side interactive experience

---

# 🧩 Folder Structure

```bash
src/
├── app/
├── components/
│   ├── canvas/
│   ├── dashboard/
│   ├── nodes/
│   ├── modals/
│   └── ui/
├── store/
├── hooks/
├── lib/
├── styles/
└── utils/
```

---

# 🚀 Local Development Setup

## 1️⃣ Clone the Repository

```bash
git clone https://github.com/yourusername/nexusflow.git
cd nexusflow
```

---

## 2️⃣ Install Dependencies

Using npm:

```bash
npm install
```

Using pnpm:

```bash
pnpm install
```

Using yarn:

```bash
yarn install
```

---

## 3️⃣ Run Development Server

```bash
npm run dev
```

Application will be available at:

```txt
http://localhost:3000
```

---

# 🧪 Available Scripts

```bash
npm run dev       # Start development server
npm run build     # Production build
npm run start     # Start production server
npm run lint      # Run ESLint
```

---

# 🌗 Theme Support

NexusFlow includes fully adaptive themes:

| Theme | Description |
|---|---|
| Neon-Night | Cyberpunk-inspired immersive dark mode |
| Cyber-Day | High-contrast futuristic light mode |

Theme persistence is managed using `next-themes`.

---

# 🔐 Enterprise Rule Validation Example

```ts
const totalWeightage = nodes.reduce(
  (sum, node) => sum + node.weightage,
  0
);

const isValid =
  totalWeightage === 100 &&
  nodes.every((node) => node.weightage >= 10);
```

---

# 📸 Recommended Screenshots

Add these sections once UI is finalized:

```md
## 📷 Goal Canvas
[screenshot]

## 📷 Manager Dashboard
[screenshot]

## 📷 AI Goal Generator
[screenshot]

## 📷 Reporting Module
[screenshot]
```

---

# 🏆 Hackathon Innovation Highlights

### Why NexusFlow Stands Out

✅ Visual-first enterprise planning  
✅ Real-time BRD enforcement  
✅ Gamified performance management  
✅ AI-assisted goal structuring  
✅ Modern scalable frontend architecture  
✅ Enterprise-ready UX patterns  

---

# 🔮 Future Roadmap

### Planned Enhancements

- 🔗 Real backend integration
- 🧠 LLM-powered goal intelligence
- 📈 Predictive performance analytics
- 👥 Collaborative multi-user editing
- 🔔 Real-time notifications
- ☁️ Cloud sync & persistence
- 📱 Mobile-responsive optimization
- 🧬 Org hierarchy visualization
- 🏢 Department-wide analytics

---

# 🤝 Contributing

Contributions, ideas, and feedback are welcome.

## Steps

1. Fork the repository
2. Create a feature branch

```bash
git checkout -b feature/amazing-feature
```

3. Commit your changes

```bash
git commit -m "Add amazing feature"
```

4. Push to your branch

```bash
git push origin feature/amazing-feature
```

5. Open a Pull Request

---

# 📄 License

This project was built for educational and hackathon purposes.

You may adapt and extend it with attribution.

---

# 👨‍💻 Team NexusFlow

Built with precision, creativity, and caffeine during **ATOMQUEST HACKATHON 1.0** ⚡

---

# ⭐ Final Note

NexusFlow is not just a dashboard.

It is an attempt to redesign how organizations think about alignment, ownership, and performance — replacing static systems with interactive operational intelligence.
