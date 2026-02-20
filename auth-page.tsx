@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Space+Grotesk:wght@300;400;500;600;700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  /* Modern Dark Crypto Palette - Deep Space & Neon */
  --background: 224 71% 4%;
  --foreground: 210 40% 98%;

  --card: 224 71% 6%;
  --card-foreground: 210 40% 98%;

  --popover: 224 71% 6%;
  --popover-foreground: 210 40% 98%;

  --primary: 263 70% 50%;
  --primary-foreground: 210 40% 98%;

  --secondary: 217 19% 27%;
  --secondary-foreground: 210 40% 98%;

  --muted: 217 19% 27%;
  --muted-foreground: 215 20% 65%;

  --accent: 175 80% 40%; /* Cyan/Teal for crypto feel */
  --accent-foreground: 210 40% 98%;

  --destructive: 0 62% 30%;
  --destructive-foreground: 210 40% 98%;

  --border: 217 19% 27%;
  --input: 217 19% 27%;
  --ring: 263 70% 50%;

  --radius: 1rem;

  --font-sans: 'Inter', sans-serif;
  --font-display: 'Space Grotesk', sans-serif;
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground antialiased font-sans selection:bg-primary/30;
    background-image: 
      radial-gradient(at 0% 0%, hsla(263, 70%, 50%, 0.15) 0px, transparent 50%),
      radial-gradient(at 100% 0%, hsla(175, 80%, 40%, 0.1) 0px, transparent 50%);
    background-attachment: fixed;
  }
  
  h1, h2, h3, h4, h5, h6 {
    @apply font-display tracking-tight;
  }
}

/* Custom Utilities */
@layer utilities {
  .glass-card {
    @apply bg-card/60 backdrop-blur-xl border border-white/10 shadow-xl;
  }
  
  .text-gradient {
    @apply bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/70;
  }
  
  .text-gradient-primary {
    @apply bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-400 to-accent;
  }

  .neon-glow {
    box-shadow: 0 0 20px -5px hsl(var(--primary) / 0.5);
  }
}

/* Animations */
@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
}

.animate-float {
  animation: float 6s ease-in-out infinite;
}
