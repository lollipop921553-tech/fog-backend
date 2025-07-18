import React from 'react';

interface PieChartProps {
    data: { name: string; value: number; color: string }[];
}

const PieChart: React.FC<PieChartProps> = ({ data }) => {
    const total = data.reduce((acc, d) => acc + d.value, 0);
    const formattedTotal = total >= 1000 ? `$${(total / 1000).toFixed(1)}k` : `$${total}`;

    const radius = 40;
    const circumference = 2 * Math.PI * radius;

    let cumulativeOffset = 0;

    return (
        <div className="w-full h-full flex flex-col sm:flex-row items-center justify-center sm:justify-around gap-6 p-2">
            <div className="relative w-36 h-36 flex-shrink-0">
                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                    <circle
                        cx="50"
                        cy="50"
                        r={radius}
                        fill="transparent"
                        strokeWidth="15"
                        className="stroke-gray-200 dark:stroke-slate-700"
                    />
                    {data.map((d, i) => {
                        const arcLength = (d.value / total) * circumference;
                        const offset = cumulativeOffset;
                        cumulativeOffset += arcLength;
                        
                        return (
                            <circle
                                key={i}
                                cx="50"
                                cy="50"
                                r={radius}
                                fill="transparent"
                                stroke={d.color}
                                strokeWidth="15"
                                strokeDasharray={`${arcLength} ${circumference}`}
                                strokeDashoffset={-offset}
                                className="transition-all duration-500"
                            />
                        );
                    })}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-3xl font-bold text-fog-dark dark:text-fog-light">{formattedTotal}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Total Earnings</span>
                </div>
            </div>

            <div className="w-full sm:w-auto flex-shrink-0 sm:max-w-[180px]">
                <ul className="space-y-2">
                    {data.map(d => (
                        <li key={d.name} className="flex items-center justify-between">
                            <div className="flex items-center gap-2 flex-grow min-w-0">
                                <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }}></span>
                                <span className="text-sm text-fog-dark dark:text-fog-light truncate">{d.name}</span>
                            </div>
                            <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 flex-shrink-0 ml-4">
                               {((d.value / total) * 100).toFixed(0)}%
                            </span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default PieChart;