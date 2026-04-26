// Quick action buttons component providing preset prompts for common AI assistant tasks

import { FaBug, FaBolt, FaFileAlt } from 'react-icons/fa'

// Predefined quick action configuration with icons, labels, and prompts
const QUICK_ACTIONS = [
    { icon: FaFileAlt, label: 'Write documentation', prompt: 'Help me write documentation for my projects' },
    { icon: FaBolt, label: 'Optimize performance', prompt: 'Help me optimize the performance of my code' },
    { icon: FaBug, label: 'Find and fix 3 bugs', prompt: 'Help me find and fix bugs in my code' },
]

const QuickActions = ({ onSelect }) => (
    <div className="text-center">
        {/* Section description */}
        <p className="text-zinc-400 text-sm mb-4">Try these examples to get started</p>
        {/* Quick action buttons grid */}
        <div className="flex flex-col justify-center gap-2 sm:flex-row sm:flex-wrap sm:gap-3">
            {QUICK_ACTIONS.map(({ icon: Icon, label, prompt}) => (
                <button key={label} onClick={() => onSelect(prompt)} className="group flex items-center justify-center gap-2 px-4 py-2.5 bg-linear-to-r from-zinc-900/80 to-zinc-800/80 hover:from-zinc-800/80 hover:text-zinc-200 transition-all duration-200 backdrop-blur-sm shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 sm:justify-start">
                    {/* Action icon with hover color change */}
                    <div className="text-blue-400 group-hover:text-blue-300 transition-colors">
                        <Icon className='w-4 h-5' />
                    </div>
                    {/* Action label */}
                    <span className="text-center sm:text-left">{label}</span>
                </button>
            ))}
        </div>
    </div>
)

export default QuickActions;