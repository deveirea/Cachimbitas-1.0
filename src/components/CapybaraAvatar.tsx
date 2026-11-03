import React from 'react';
import { OutfitId, CapyMood, CapySkin } from '../types';

interface CapybaraAvatarProps {
  outfit: OutfitId;
  skin?: CapySkin;
  mood?: CapyMood;
  size?: number;
  className?: string;
  onClick?: () => void;
  isDancing?: boolean;
}

export const CapybaraAvatar: React.FC<CapybaraAvatarProps> = ({
  outfit = 'none',
  skin = 'classic',
  mood = 'ok',
  size = 80,
  className = '',
  onClick,
  isDancing = false,
}) => {
  // Palette according to skin
  const getSkinColors = (skinType: CapySkin) => {
    switch (skinType) {
      case 'chocolate':
        return {
          dark: '#4A2E1B',
          body: '#5D3B23',
          head: '#72492D',
          snout: '#885837',
          snoutNose: '#4A2E1B',
          nostril: '#2E1C10',
          blush: '#C77966',
        };
      case 'matcha':
        return {
          dark: '#556B2F',
          body: '#6B8E23',
          head: '#7FA034',
          snout: '#95B845',
          snoutNose: '#556B2F',
          nostril: '#33441A',
          blush: '#F08080',
        };
      case 'strawberry':
        return {
          dark: '#D87093',
          body: '#E88CA6',
          head: '#F4A6BE',
          snout: '#FDC4D4',
          snoutNose: '#D87093',
          nostril: '#A34866',
          blush: '#FF69B4',
        };
      case 'golden':
        return {
          dark: '#B45309',
          body: '#D97706',
          head: '#F59E0B',
          snout: '#FBBF24',
          snoutNose: '#92400E',
          nostril: '#78350F',
          blush: '#F87171',
        };
      case 'classic':
      default:
        return {
          dark: '#A86F45',
          body: '#B98056',
          head: '#D7A474',
          snout: '#DFA979',
          snoutNose: '#B98056',
          nostril: '#8F542A',
          blush: '#fca5a5',
        };
    }
  };

  const colors = getSkinColors(skin);

  // Render specific facial expressions based on mood
  const renderFace = () => {
    switch (mood) {
      case 'great':
      case 'happy':
        return (
          <g id="face-happy">
            <path d="M38 65 Q42 60 46 65" stroke="#1a1a2e" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M54 65 Q58 60 62 65" stroke="#1a1a2e" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M44 76 Q50 82 56 76" stroke={colors.nostril} strokeWidth="2.2" fill="none" strokeLinecap="round" />
            <circle cx="35" cy="69" r="4.5" fill={colors.blush} opacity="0.6" />
            <circle cx="65" cy="69" r="4.5" fill={colors.blush} opacity="0.6" />
            <path d="M22 36 L25 33 L28 36 L25 39 Z" fill="#FBBF24" />
            <path d="M74 32 L76 29 L78 32 L76 35 Z" fill="#FBBF24" />
          </g>
        );

      case 'scared':
      case 'bad':
        return (
          <g id="face-scared">
            <ellipse cx="42" cy="66" rx="6" ry="6.5" fill="#fff" />
            <ellipse cx="58" cy="66" rx="6" ry="6.5" fill="#fff" />
            <circle cx="42" cy="67" r="3.8" fill="#1a1a2e" />
            <circle cx="58" cy="67" r="3.8" fill="#1a1a2e" />
            <circle cx="43" cy="65.5" r="1.4" fill="#fff" />
            <circle cx="59" cy="65.5" r="1.4" fill="#fff" />
            <path d="M43 78 Q47 74 50 78 Q53 82 57 77" stroke={colors.nostril} strokeWidth="2" fill="none" strokeLinecap="round" />
            <ellipse cx="72" cy="50" rx="3.5" ry="4.5" fill="#60A5FA" opacity="0.85" />
          </g>
        );

      case 'sleep':
        return (
          <g id="face-sleep">
            <path d="M38 67 Q42 63 46 67" stroke="#1a1a2e" strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M54 67 Q58 63 62 67" stroke="#1a1a2e" strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M46 76 Q50 78 54 76" stroke={colors.nostril} strokeWidth="1.8" fill="none" strokeLinecap="round" />
            <text x="66" y="38" fontSize="10" fill={colors.dark} fontFamily="Outfit, sans-serif" fontWeight="800">z</text>
            <text x="73" y="28" fontSize="13" fill={colors.dark} fontFamily="Outfit, sans-serif" fontWeight="800">z</text>
            <text x="81" y="18" fontSize="16" fill={colors.dark} fontFamily="Outfit, sans-serif" fontWeight="800">Z</text>
          </g>
        );

      case 'empty':
      case 'good':
      case 'ok':
      default:
        return (
          <g id="face-neutral">
            <ellipse cx="42" cy="66" rx="4.5" ry="5" fill="#fff" />
            <ellipse cx="58" cy="66" rx="4.5" ry="5" fill="#fff" />
            <circle cx="42" cy="67" r="2.8" fill="#1a1a2e" />
            <circle cx="58" cy="67" r="2.8" fill="#1a1a2e" />
            <circle cx="43" cy="66" r="1.1" fill="#fff" />
            <circle cx="59" cy="66" r="1.1" fill="#fff" />
            <path d="M46 76 Q50 78 54 76" stroke={colors.nostril} strokeWidth="1.8" fill="none" strokeLinecap="round" />
            <circle cx="36" cy="70" r="3" fill={colors.blush} opacity="0.4" />
            <circle cx="64" cy="70" r="3" fill={colors.blush} opacity="0.4" />
          </g>
        );
    }
  };

  // Render accessories / outfits
  const renderOutfit = () => {
    switch (outfit) {
      case 'grad':
        return (
          <g id="outfit-grad">
            <polygon points="50,22 84,34 50,44 16,34" fill="#1e293b" stroke="#0f172a" strokeWidth="1.5" />
            <rect x="36" y="38" width="28" height="10" rx="3" fill="#334155" />
            <circle cx="50" cy="33" r="2.5" fill="#f59e0b" />
            <path d="M50 33 Q68 38 72 50" stroke="#f59e0b" strokeWidth="2" fill="none" />
            <rect x="70" y="50" width="4" height="7" rx="1.5" fill="#d97706" />
          </g>
        );

      case 'glasses':
        return (
          <g id="outfit-glasses">
            <rect x="34" y="61" width="14" height="11" rx="4" fill="rgba(255,255,255,0.4)" stroke="#1e293b" strokeWidth="2" />
            <rect x="52" y="61" width="14" height="11" rx="4" fill="rgba(255,255,255,0.4)" stroke="#1e293b" strokeWidth="2" />
            <line x1="48" y1="66" x2="52" y2="66" stroke="#1e293b" strokeWidth="2" />
            <line x1="34" y1="65" x2="28" y2="62" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
            <line x1="66" y1="65" x2="72" y2="62" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
          </g>
        );

      case 'coffee':
        return (
          <g id="outfit-coffee">
            <rect x="70" y="78" width="14" height="20" rx="3" fill="#e0e7ff" stroke="#6366f1" strokeWidth="1.5" />
            <path d="M84 83 Q89 88 84 93" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" />
            <rect x="72" y="85" width="10" height="7" rx="1" fill="#4f46e5" />
            <path d="M75 75 Q77 71 75 67" stroke="#a5b4fc" strokeWidth="1.2" fill="none" strokeLinecap="round" />
            <path d="M79 74 Q81 70 79 66" stroke="#a5b4fc" strokeWidth="1.2" fill="none" strokeLinecap="round" />
          </g>
        );

      case 'crown':
        return (
          <g id="outfit-crown">
            <polygon points="26,48 34,34 42,44 50,28 58,44 66,34 74,48" fill="#FBBF24" stroke="#D97706" strokeWidth="1.5" />
            <rect x="26" y="46" width="48" height="8" rx="3" fill="#F59E0B" stroke="#D97706" strokeWidth="1" />
            <circle cx="50" cy="33" r="3.5" fill="#EF4444" />
            <circle cx="35" cy="40" r="2.5" fill="#3B82F6" />
            <circle cx="65" cy="40" r="2.5" fill="#10B981" />
          </g>
        );

      case 'party':
        return (
          <g id="outfit-party">
            <polygon points="50,22 36,52 64,52" fill="#F43F5E" stroke="#be123c" strokeWidth="1" />
            <circle cx="50" cy="20" r="4.5" fill="#FBBF24" />
            <circle cx="38" cy="40" r="2.5" fill="#FBBF24" />
            <circle cx="60" cy="38" r="2.5" fill="#38BDF8" />
            <circle cx="44" cy="48" r="2" fill="#34D399" />
            <circle cx="56" cy="48" r="2" fill="#FB7185" />
          </g>
        );

      case 'headphones':
        return (
          <g id="outfit-headphones">
            {/* Top Headband */}
            <path d="M22 60 Q50 30 78 60" stroke="#10b981" strokeWidth="4.5" fill="none" strokeLinecap="round" />
            <path d="M24 60 Q50 33 76 60" stroke="#059669" strokeWidth="2" fill="none" strokeLinecap="round" />
            {/* Ear Cups */}
            <rect x="18" y="55" width="8" height="18" rx="4" fill="#0f172a" stroke="#10b981" strokeWidth="1.5" />
            <rect x="74" y="55" width="8" height="18" rx="4" fill="#0f172a" stroke="#10b981" strokeWidth="1.5" />
          </g>
        );

      case 'pizza':
        return (
          <g id="outfit-pizza">
            {/* Pizza slice in hand */}
            <polygon points="50,86 40,104 60,104" fill="#f59e0b" stroke="#d97706" strokeWidth="1" />
            {/* Crust */}
            <path d="M38 104 Q50 106 62 104" stroke="#b45309" strokeWidth="3.5" fill="none" strokeLinecap="round" />
            {/* Pepperoni dots */}
            <circle cx="47" cy="94" r="2" fill="#dc2626" />
            <circle cx="54" cy="99" r="2.5" fill="#dc2626" />
            <circle cx="46" cy="101" r="1.8" fill="#dc2626" />
          </g>
        );

      case 'backpack':
        return (
          <g id="outfit-backpack">
            {/* Backpack straps over shoulders */}
            <path d="M34 76 Q30 88 35 100" stroke="#0284c7" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M66 76 Q70 88 65 100" stroke="#0284c7" strokeWidth="3" fill="none" strokeLinecap="round" />
            <rect x="42" y="86" width="16" height="12" rx="3" fill="#0369a1" stroke="#0284c7" strokeWidth="1" />
          </g>
        );

      case 'scarf':
        return (
          <g id="outfit-scarf">
            {/* Cozy university scarf */}
            <ellipse cx="50" cy="80" rx="22" ry="7" fill="#b91c1c" />
            <ellipse cx="50" cy="80" rx="20" ry="5.5" fill="#dc2626" />
            {/* Striped tail hanging down */}
            <path d="M54 82 L58 102 L66 101 L62 82 Z" fill="#b91c1c" />
            <line x1="56" y1="88" x2="64" y2="87" stroke="#f59e0b" strokeWidth="2.5" />
            <line x1="57" y1="95" x2="65" y2="94" stroke="#f59e0b" strokeWidth="2.5" />
          </g>
        );



      case 'tutu':
        return (
          <g id="outfit-tutu">
            <ellipse cx="50" cy="91" rx="26" ry="7" fill="#ec4899" opacity="0.95" />
            <ellipse cx="50" cy="88" rx="22" ry="5.5" fill="#f472b6" opacity="0.9" />
            <ellipse cx="50" cy="85" rx="18" ry="4" fill="#ec4899" opacity="0.85" />
          </g>
        );

      case 'tie':
        return (
          <g id="outfit-tie">
            <path d="M44 79 L47 76.5 L50 76 L53 76.5 L56 79" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1" />
            <polygon points="46.5,76.5 53.5,76.5 52.5,80 50,81 47.5,80" fill="#dc2626" />
            <polygon points="47.5,80 52.5,80 54,98 50,102 46,98" fill="#ef4444" />
          </g>
        );

      case 'astro':
        return (
          <g id="outfit-astro">
            <circle cx="50" cy="65" r="25" fill="rgba(199, 210, 254, 0.2)" stroke="#93c5fd" strokeWidth="2.2" />
            <ellipse cx="50" cy="63" rx="14" ry="11" fill="rgba(96, 165, 250, 0.25)" stroke="#60a5fa" strokeWidth="1.2" />
            <ellipse cx="43" cy="58" rx="4" ry="2.5" fill="rgba(255, 255, 255, 0.45)" />
          </g>
        );

      case 'sunglasses':
        return (
          <g id="outfit-sunglasses">
            <rect x="33.5" y="62.5" width="13" height="8.5" rx="4.2" fill="#0f172a" opacity="0.95" />
            <rect x="53.5" y="62.5" width="13" height="8.5" rx="4.2" fill="#0f172a" opacity="0.95" />
            <line x1="46.5" y1="66.5" x2="53.5" y2="66.5" stroke="#334155" strokeWidth="2" />
            <line x1="33.5" y1="66" x2="26" y2="63" stroke="#334155" strokeWidth="2" strokeLinecap="round" />
            <line x1="66.5" y1="66" x2="74" y2="63" stroke="#334155" strokeWidth="2" strokeLinecap="round" />
            <line x1="36" y1="65" x2="43" y2="68" stroke="#94a3b8" strokeWidth="1" strokeLinecap="round" opacity="0.8" />
            <line x1="56" y1="65" x2="63" y2="68" stroke="#94a3b8" strokeWidth="1" strokeLinecap="round" opacity="0.8" />
          </g>
        );

      case 'none':
      default:
        return null;
    }
  };

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center justify-center select-none cursor-pointer ${
        isDancing ? 'animate-capy-wiggle' : ''
      } ${className}`}
      style={{ width: size, height: (size * 110) / 100 }}
      title="¡Toca a la Capi para cambiar su look!"
    >
      <svg
        width={size}
        height={(size * 110) / 100}
        viewBox="0 0 100 110"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md hover:scale-105 transition-transform duration-200"
      >
        {/* Soft ground shadow */}
        <ellipse cx="50" cy="104" rx="30" ry="5" fill="rgba(0,0,0,0.12)" />

        {/* Lower Body */}
        <ellipse cx="50" cy="88" rx="29" ry="19" fill={colors.dark} />
        <ellipse cx="50" cy="88" rx="27" ry="17" fill={colors.body} />

        {/* Paws */}
        <ellipse cx="38" cy="102" rx="7" ry="5.5" fill={colors.dark} />
        <ellipse cx="62" cy="102" rx="7" ry="5.5" fill={colors.dark} />

        {/* Upper Head / Main Face Structure */}
        <ellipse cx="50" cy="67" rx="27" ry="24" fill={colors.head} />

        {/* Ears */}
        <ellipse cx="36" cy="52" rx="9" ry="7.5" fill={colors.head} />
        <ellipse cx="64" cy="52" rx="9" ry="7.5" fill={colors.head} />
        <ellipse cx="36" cy="52" rx="6" ry="5" fill={colors.dark} />
        <ellipse cx="64" cy="52" rx="6" ry="5" fill={colors.dark} />

        {/* Snout Area */}
        <ellipse cx="50" cy="72" rx="19" ry="17" fill={colors.snout} />
        <ellipse cx="50" cy="77" rx="7.5" ry="4" fill={colors.snoutNose} />
        <ellipse cx="47" cy="76" rx="2.2" ry="1.8" fill={colors.nostril} />
        <ellipse cx="53" cy="76" rx="2.2" ry="1.8" fill={colors.nostril} />

        {/* Mood Face Expressions */}
        {renderFace()}

        {/* Accessories / Outfits Layer */}
        {renderOutfit()}
      </svg>
    </div>
  );
};
