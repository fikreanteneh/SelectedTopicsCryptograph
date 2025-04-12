const GlowingBackground = () => {
    return (
        <div className="fixed inset-0 w-full h-full overflow-hidden bg-paint-3 z-[-1]">
            <div className="absolute w-24 h-24 transform -translate-x-1/2 -translate-y-1/2 rounded-full bg-paint-1 opacity-70 blur-2xl animate-pulseGlow top-1/2 left-1/2"></div>
            <div className="absolute w-24 h-24 transform -translate-x-1/2 -translate-y-1/2 rounded-full bg-paint-1 opacity-70 blur-2xl animate-pulseGlow top-1/3 left-1/4"></div>
            <div className="absolute w-24 h-24 transform -translate-x-1/2 -translate-y-1/2 rounded-full bg-paint-1 opacity-70 blur-2xl animate-pulseGlow top-2/3 left-3/4"></div>
        </div>
    );
};

export default GlowingBackground;