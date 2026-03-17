# 🛡️ Neon Siege: Advanced Defense Protocol

**Neon Siege** is a high-octane, cyberpunk-themed Tower Defense game built with React and Firebase. Command your defenses against waves of rogue AI constructs, upgrade your arsenal, and climb the ranks of the Commander Library.

![Neon Siege Banner](https://picsum.photos/seed/neonsiege/1200/400?blur=2)

## 🚀 Features

### 🎮 Game Modes
- **Campaign Protocol**: Progress through 11 increasingly difficult sectors. Each sector features unique pathing and wave counts.
- **Endless Library**: Test your tactical endurance. Survive as long as possible on any unlocked map. Your sessions are synced to a global library for other Commanders to see.

### 🛠️ Tactical Arsenal
Deploy a variety of advanced turret systems, each with unique strengths:
- **Basic Turret**: Reliable, rapid-fire defense.
- **Sniper Railgun**: Long-range, high-damage precision.
- **Laser Array**: Continuous thermal damage.
- **Tesla Coil**: Chain lightning for crowd control.
- **Missile Battery**: Explosive area-of-effect damage.
- **Plasma Cannon**: Heavy armor-piercing rounds.

### 📈 Progression System
- **Commander Leveling**: Earn EXP from every wave survived to increase your rank.
- **Tech Tree**: Unlock permanent upgrades and new turret types as you progress.
- **Medals & Achievements**: Earn 9+ unique medals, including secret achievements for elite tactical feats.
- **Global Sync**: Your progress, unlocked tech, and endless sessions are securely saved to the cloud via Firebase.

## 🕹️ How to Play

1. **Deploy**: Select a turret from your inventory and place it on the grid.
2. **Manage Resources**: Earn **Credits** by destroying enemies. Use them to buy more turrets or upgrade existing ones.
3. **Protect Integrity**: Don't let enemies reach the end of the path. If your **Integrity** hits zero, the protocol fails.
4. **Upgrade**: Click on a placed turret to upgrade its damage, range, and fire rate.
5. **Scrap**: Need a change of plans? Scrap turrets to recover 50% of their value.

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, TypeScript
- **Styling**: Tailwind CSS (Modern "Neon" aesthetic)
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Backend**: Firebase (Firestore for real-time sync, Firebase Auth for Commander profiles)
- **Audio**: Custom synthesized sound effects for combat and UI.

## 🛠️ Development Setup

### Prerequisites
- Node.js (v18+)
- npm

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd neon-siege
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up Environment Variables:
   Create a `.env` file or use the platform's secret manager for:
   - `GEMINI_API_KEY` (Optional: for AI-driven lore generation)
   - Firebase configuration (see `src/firebase-applet-config.json`)

4. Start the development server:
   ```bash
   npm run dev
   ```

## 📜 Lore

> *"The Great Collapse wasn't a bang, but a synchronization error. Now, the Neon Grids are all that remain of the old world. As a Commander of the Siege Protocol, you are the last firewall between humanity's data-ghosts and the encroaching void."*

---

**Commander, the grid is under attack. Initialize Defense Protocol?**
