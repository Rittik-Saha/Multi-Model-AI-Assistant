// Header component displaying the app title, logo, and current model selection

import { FaBolt } from 'react-icons/fa'

const Header = ({ selectedModel }) => (
    <header className="border-b border-zinc-800/50 backdrop-blur-sm bg-zinc-900/30">
        <div className="max-w-4xl mx-auto px-4 py-4 sm:px-6">
            <div className="flex items-center justify-between">
                {/* Logo and title section */}
                <div className="flex items-center gap-2 sm:gap-3">
                    {/* Animated logo with gradient background */}
                    <div className="w-7 h-7 bg-linear-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg sm:w-8 sm:h-8">
                        <FaBolt className='w-6 h-3 text-white sm:w-4 sm:h-4' />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold bg-linear-to-r from-white to-zinc-300 bg-clip-text text-transparent sm:text-xl">
                            RittikProg AI Assistant
                        </h1>
                        <p className="text-xs text-zinc-500">Powered By OpenRouter</p>
                    </div>
                </div>

                {/* Model status and indicator */}
                <div className="flex items-center gap-2">
                    {/* Current selected model badge */}
                    <div className="px-2 py-1 bg-zinc-800/60 border border-zinc-700/50 rounded-full text-xs text-zinc-400 backdrop-blur-sm sm:px-3 sm:py-1.5">
                    <span className="hidden sm:inline">{selectedModel?.shortLabel}</span>
                    <span className="sm:hidden">{selectedModel?.shortLabel?.split(' ')[0]}</span>
                    </div>
                    {/* Online Status indicator */}
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
                </div>
            </div>
        </div>
    </header>
)

export default Header;