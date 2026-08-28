/**
 * PremiumBackground — A reusable animated deep-blue background with floating orbs.
 * 
 * Usage: Place <PremiumBackground /> as the first child inside any page wrapper.
 * The parent should have `position: relative` and `overflow: hidden`.
 */
export default function PremiumBackground() {
    return (
        <>
            {/* Fixed ambient background */}
            <div className="fixed inset-0 -z-10 pointer-events-none" aria-hidden="true">
                {/* Base gradient: deep navy → indigo → dark blue */}
                <div className="absolute inset-0" style={{
                    background: 'linear-gradient(135deg, #282118 0%, #332b1e 25%, #463a26 50%, #55452c 75%, #332b1e 100%)'
                }} />

                {/* Animated floating orbs */}
                <div className="pm-orb pm-orb-1" />
                <div className="pm-orb pm-orb-2" />
                <div className="pm-orb pm-orb-3" />
                <div className="pm-orb pm-orb-4" />

                {/* Radial mesh overlay for depth */}
                <div className="absolute inset-0" style={{
                    background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(139,92,246,0.2) 0%, transparent 70%), radial-gradient(ellipse 60% 50% at 80% 100%, rgba(124,58,237,0.15) 0%, transparent 60%)'
                }} />

                {/* Subtle grain texture */}
                <div className="absolute inset-0 opacity-[0.018] mix-blend-overlay" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'repeat',
                    backgroundSize: '128px 128px'
                }} />
            </div>

            {/* Inline keyframes for the orbs */}
            <style dangerouslySetInnerHTML={{
                __html: `
                .pm-orb {
                    position: absolute;
                    border-radius: 50%;
                    filter: blur(80px);
                    opacity: 0;
                    will-change: transform, opacity;
                }
                .pm-orb-1 {
                    width: 500px; height: 500px;
                    top: -10%; left: -5%;
                    background: radial-gradient(circle, rgba(99,102,241,0.2) 0%, rgba(79,70,229,0.08) 60%, transparent 100%);
                    animation: pm-float-1 18s ease-in-out infinite;
                }
                .pm-orb-2 {
                    width: 400px; height: 400px;
                    bottom: -5%; right: -8%;
                    background: radial-gradient(circle, rgba(139,92,246,0.18) 0%, rgba(124,58,237,0.06) 60%, transparent 100%);
                    animation: pm-float-2 22s ease-in-out infinite;
                }
                .pm-orb-3 {
                    width: 300px; height: 300px;
                    top: 40%; left: 50%;
                    background: radial-gradient(circle, rgba(14,165,233,0.12) 0%, rgba(6,182,212,0.04) 60%, transparent 100%);
                    animation: pm-float-3 25s ease-in-out infinite;
                }
                .pm-orb-4 {
                    width: 250px; height: 250px;
                    top: 20%; right: 20%;
                    background: radial-gradient(circle, rgba(168,85,247,0.1) 0%, transparent 70%);
                    animation: pm-float-4 20s ease-in-out infinite;
                }

                @keyframes pm-float-1 {
                    0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.7; }
                    33% { transform: translate(40px, 30px) scale(1.1); opacity: 0.9; }
                    66% { transform: translate(-20px, 50px) scale(0.95); opacity: 0.6; }
                }
                @keyframes pm-float-2 {
                    0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.6; }
                    40% { transform: translate(-50px, -40px) scale(1.15); opacity: 0.85; }
                    70% { transform: translate(30px, -20px) scale(0.9); opacity: 0.55; }
                }
                @keyframes pm-float-3 {
                    0%, 100% { transform: translate(-50%, 0) scale(1); opacity: 0.5; }
                    50% { transform: translate(-50%, -40px) scale(1.2); opacity: 0.75; }
                }
                @keyframes pm-float-4 {
                    0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.4; }
                    35% { transform: translate(-30px, 25px) scale(1.1); opacity: 0.7; }
                    65% { transform: translate(20px, -15px) scale(0.9); opacity: 0.5; }
                }
            `}} />
        </>
    );
}
