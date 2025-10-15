'use client';

interface Template {
  id: string;
  title: string;
  description: string;
  icon: string;
}

const templates: Template[] = [
  {
    id: '1',
    title: 'DeFi Yield',
    description: 'Automated yield farming across protocols',
    icon: '💰',
  },
  {
    id: '2',
    title: 'Token Bridge',
    description: 'Cross-chain token transfers',
    icon: '🌉',
  },
  {
    id: '3',
    title: 'NFT Mint',
    description: 'Automated NFT minting workflow',
    icon: '🎨',
  },
];

export default function TemplateSidebar() {
  return (
    <div className="w-80 p-6 space-y-4 animate-slide-in-right">
      <h3 
        className="text-lg font-bold mb-4"
        style={{
          fontFamily: "'Orbitron', sans-serif",
          background: 'linear-gradient(to bottom, #ffffff 0%, #e0e8f0 50%, #9fb5cc 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        Templates
      </h3>

      {templates.map((template, index) => (
        <div
          key={template.id}
          className="rounded-lg p-4 cursor-pointer transition-all hover:scale-105 animate-scale-in"
          style={{
            background: 'linear-gradient(135deg, rgba(40, 40, 50, 0.5), rgba(20, 20, 30, 0.7))',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            boxShadow: `
              0 8px 24px rgba(0, 0, 0, 0.5),
              inset 0 1px 2px rgba(255, 255, 255, 0.1),
              0 0 20px rgba(100, 150, 200, 0.1)
            `,
            animationDelay: `${0.4 + index * 0.15}s`,
            animationFillMode: 'both',
          }}
        >
          <div className="flex items-start gap-3">
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
              style={{
                background: 'linear-gradient(135deg, rgba(100, 150, 200, 0.3), rgba(80, 120, 180, 0.4))',
                border: '1px solid rgba(150, 180, 220, 0.3)',
              }}
            >
              {template.icon}
            </div>
            <div className="flex-1">
              <h4 
                className="font-semibold mb-1"
                style={{
                  color: '#e0e8f0',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '14px',
                }}
              >
                {template.title}
              </h4>
              <p 
                className="text-xs"
                style={{
                  color: '#8a9fb5',
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                {template.description}
              </p>
            </div>
          </div>
        </div>
      ))}

      {/* Execute Button */}
      <button
        className="w-full mt-6 px-6 py-3 rounded-xl transition-all hover:scale-105 animate-slide-in-up"
        style={{
          fontFamily: "'Orbitron', sans-serif",
          background: 'linear-gradient(135deg, rgba(100, 150, 200, 0.5), rgba(80, 120, 180, 0.6))',
          border: '1px solid rgba(150, 180, 220, 0.4)',
          color: '#ffffff',
          backdropFilter: 'blur(15px)',
          boxShadow: `
            0 8px 24px rgba(80, 120, 180, 0.3),
            inset 0 1px 2px rgba(255, 255, 255, 0.2),
            0 0 30px rgba(100, 150, 200, 0.25)
          `,
          letterSpacing: '0.1em',
          fontWeight: '600',
          animationDelay: '1s',
          animationFillMode: 'both',
        }}
      >
        EXECUTE WORKFLOW
      </button>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes slide-in-right {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slide-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-scale-in {
          animation: scale-in 0.6s ease-out;
        }

        .animate-slide-in-right {
          animation: slide-in-right 0.7s ease-out;
        }

        .animate-slide-in-up {
          animation: slide-in-up 0.6s ease-out;
        }
      `}</style>
    </div>
  );
}

