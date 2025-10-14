interface LoadingGameProps {
  isAccessibilityMode?: boolean;
  label: string;
}

export default function LoadingGame({ isAccessibilityMode = false, label }: LoadingGameProps) {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {!isAccessibilityMode && (
        <>
          <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-emerald-500/15 to-transparent rounded-full blur-xl"></div>
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-r from-purple-500/15 to-transparent rounded-full blur-xl"></div>
        </>
      )}
      <div className="text-center glass-card p-8 rounded-xl relative z-10">
        <div className={`rounded-full h-12 w-12 border-4 border-transparent mx-auto mb-4 ${
          isAccessibilityMode
            ? 'border-t-white animate-spin'
            : 'border-t-emerald-400 border-r-purple-400 border-b-orange-400 animate-spin'
        }`}></div>
        <p className="text-white/90 text-lg">{label}</p>
      </div>
    </div>
  )
}
