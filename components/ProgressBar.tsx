interface ProgressBarProps {
  current: number;
  total: number;
}

export default function ProgressBar({ current, total }: ProgressBarProps) {
  const progress = (current / total) * 100;

  return (
    <div className="relative w-full h-[4px] bg-gray-200 rounded-full overflow-hidden">
      {/* Progress fill with smooth transition */}
      <div
        className="h-full bg-black rounded-full relative overflow-hidden transition-all duration-700 ease-out"
        style={{ width: `${progress}%` }}
      >
        {/* Shimmer effect */}
        <div 
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          style={{
            animation: 'shimmer 2s infinite',
            backgroundSize: '200% 100%',
          }}
        />
      </div>
    </div>
  );
}
