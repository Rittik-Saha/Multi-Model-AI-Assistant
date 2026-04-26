// Main form component for suer input, model selection, and file/image uploads

import { FaBrain, FaImage, FaFileAlt, FaPaperPlane, FaRobot, FaTimes, FaTrash } from 'react-icons/fa';

// Reusable upload button component with hidden file input 
const UploadButton = ({ Icon, inputRef, accept, onChange, title, iconClass }) => (
    <label className='inline-flex items-center gap-2 px-3 py-2 bg-zinc-900/80 border border-zinc-700/50 rounded-xl text-sm text-zinc-200 shadow-inner cursor-pointer shrink-0 self-start' title={title}>
        <Icon className={`w-4 h-4 ${iconClass || ''}`} />
        <input type="file" ref={inputRef} accept={accept} onChange={onChange} className='hidden' />
        <span className="sr-only">{title}</span>
    </label>
)

// Reusable remove/clear button component
const RemoveButton = ({ onClick }) => (
    <button className="p-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-zinc-300" type='button' onClick={onClick}>
        <FaTimes className='w-3 h-3' />
    </button>
)

// Main prompt form component with text input, file uploads, and model selection
const PromptForm = ({
    prompt,
    onPromptChange,
    onSubmit,
    onClearAll,
    models,
    selectedModel,
    onModelChange,
    isVisionModel,
    isNovaFileModel,
    onImageChange,
    onFilechange,
    imageData,
    fileAttachment,
    clearImage,
    clearFile,
    loading,
    imageInpuutRef,
    fileInputRef,
}) => {
    // Disable submit button if no valid content or currently loading
    const disableSubmit = (!prompt.trim() && !(isVisionModel && imageData) && !fileAttachment) || loading;
    // Disable clear button if nothing to clear
    const disableClear = !prompt.trim() && !imageData && !fileAttachment;

    return (
        <div className="bg-linear-to-br from-zinc-900/90 to-zinc-800/90 border border-zinc-700/50 rounded-2xl p-4 backdrop-blur-sm shadow-2xl sm:p-6">
            <form onSubmit={onSubmit}>
                <div className="relative">
                    {/* Main text input for user prompts */}
                    <textarea value={prompt} onChange={(e) => onPromptChange(e.target.value)} placeholder='Ask me anything... I can help you build, debug, optimize, and explore your code.' className='w-full bg-transparent border-none outline-none text-zinc-200 placeholder-zinc-500 resize-none text-sm leading-relaxed min-h-15 max-h-27.5 focus:placeholder-zinc-600 transition-colors sm:text-base sm:min-h-20' onKeyDown={(e) => e.key === 'Enter' && (e.metaKey || e.ctrlKey) && onSubmit(e)}></textarea>

                    {/* Update buttons section - conditionally shown based on model capabilities */}
                    <div className="mt-3 mb-2 flex flex-row items-center gap-3 flex-wrap">
                        {/* Image upload button - only for shown for visition-capable models */}
                        {isVisionModel && (
                           <UploadeButton Icon={FaImage} inputRef={imageInpuutRef} accept="image/*" onChange={onImageChange} title="Attach image" iconClass="text-blue-300" /> 
                        )}

                        {/* File upload button - only shown for Nova file model */}
                        {isNovaFileModel && (
                            <UploadButton Icon={FaFileAlt} inputRef={fileInputRef} accept=".text,.md,.markdown,.json,.csv,.logo,.yaml,.yml,.xml" onChange={onFilechange} title="Attach file (Nova only)" iconClass="text-amber-300" />
                        )}

                        {/* Image attachment preview */}
                        {imageData && (
                           <div className="flex items-center gap-2">
                            <div className="w-16 h-16 rounded-lg overflow-hidden border border-zinc-700 bg-zinc-900">
                                <img src={imageData} alt="Upload preview" className="w-full h-full object-cover"/>
                            </div>
                            <RemoveButton onClick={clearImage} />
                           </div> 
                        )}

                        {/* File attachment preview */}
                        {fileAttachment && (
                            <div className="flex items-center gap-2">
                                <div className="px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-xs text-zinc-300 max-w-50 truncate">
                                    {fileAttachment.name}
                                </div>
                                <RemoveButton onClick={clearFile} />
                            </div>
                        )}
                    </div>

                    {/* From fotter with model selector and action buttons */}
                    <div className="flex flex-col justify-between pt-4 border-t border-zinc-700/50 gap-3 sm:flex-row sm:items-center sm:gap-0">
                    {/* Left side: Model selector and keyboard shortcut hunt */}
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                        {/* Model selection dropdown */}
                        <label className="flex items-center gap-2 px-3 py-2 bg-zinc-900/89 border border-zinc-700/50 rounded-xl text-sm text-zinc-200 shadow-inner w-full sm:w-auto">
                        <FaBrain className='w-3 h-3 text-blue-400 shrink-0 sm:w-w4 h-4' />
                        <select value={selectedModel.id} onChange={(e) => onModelChange(e.target.value)} className='bg-transparent border-none focus:outline-none text-sm text-zinc-200 pr-2 cursor-pointer flex-1 min-w-0'>
                            {models.map((model) => (
                                <option value={model.id} key={model.id} className='bg-zinc-900 text-zinc-200'>
                                    {model.shortLabel}
                                </option>
                            ))}
                        </select>
                        </label>
                        {/* Keyboard shortcut hint (desktop only) */}
                        <div className="text-xs text-zinc-500 hidden sm:block">
                            Press <kbd className='px-1.5 py-0  bg-zinc-800 border border-zinc-700 rounded text-zinc-400'>Enter</kbd>{' '} to send 
                        </div>
                    </div>

                    {/* Right side: Action buttons */}
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        {/* Clear button */}
                        <button type='button' onClick={onClearAll} disabled={disableClear} className='flex-1 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 border border-zinc-700 rounded-xl text-zinc-400 hover:text-zinc-200 transition-all duration-200 disabled:cursor-not-allowed font-medium sm:flex-none sm:px-6' title='Clear'>
                            <div className="flex items-center justify-center gap-2">
                                <FaTrash className="w-4 h-4" />
                                <span className="hidden sm:inline">Clear</span>
                            </div>
                        </button>

                        {/* Submit button with loading state */}
                        <button type='submit' disabled={disableSubmit} className='flex-1 px-4 py-2 bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:from-zinc-700 disabled:to-zinc-800 disabled:opacity-50 border border-zinc-700 disabled:border-zinc-700 rounded-xl text-white font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed'>
                            {loading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <FaRobot className="w-4 h-4 animate-spin" />
                                    <span className="hidden sm:inline">Thinking...</span>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center gap-2">
                                    <FaPaperPlane className='w-4 h-4' />
                                     <span>Send</span>
                                </div>
                            )}
                        </button>
                    </div>
                    </div>
                </div>
            </form>
        </div>
    )
}

export default PromptForm;