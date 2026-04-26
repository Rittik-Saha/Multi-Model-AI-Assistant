// Main application component for an Ai assistant interface
// Handels user interactions, API calls to Openrouter, and state management

import { useEffect, useMemo, useRef, useState } from 'react';
import { API_URL, fallbackHeaders, MAX_FILE_CHARS } from './constants/api'
import { MODELS, NOVA_FILE_MODEL_ID, VISION_MODEL_IDS } from './constants/models'
import AssistantResponse from './components/AssistantResponse'
import ErrorBanner from './components/ErrorBanner'
import Header from './components/Header'
import PromptFrom from './components/PromptForm'
import QuickActions from './components/QuickActions'

function App() {
    // State management for AI assistant interface

    // Model selection and configaration
    const [selectedModel, setSelectedModel] = useState(MODELS[0])

    // User input and AI response
    const [prompt, setPrompt] = useState('')
    const [answer, setAnswer] = useState('')
    const [displayedAnswer, setDisplayedAnswer] = useState('')

    // File and image attachments
    const [imageData, setImageData] = useState(null)
    const [fileAttachment, setFileAttachment] = useState(null)

    // Dom reference for file inputs
    const imageInputRef = useRef(null)
    const fileInputRef = useRef(null)

    // UI state
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    // Prepare API headers with autohorization and referrer information
    const apiHeaders = useMemo(() => {
        const key = import.meta.env.VITE_OPENROUTER_API_KEY
        const referer = typeof window !== 'undefined' ? window.location.origin : ''
        return {
            ...fallbackHeaders,
            ...(referer ? { 'HTTP-Referer': referer} : {}),
            ...(key ? { Authorization: `Bearer ${key}` } : {}),
        }
    }, [])

    // Determine model capabilities based on selected 
    const isVisionModel = useMemo(() => VISION_MODEL_IDS.has(selectedModel.id), [selectedModel.id])
    const isNovaFileModel = useMemo(() => selectedModel.id === NOVA_FILE_MODEL_ID, [selectedModel.id])

    // Helper functions for managing attachments

    const clearImage = () => {
        setImageData(null)
        if (imageInputRef.current) imageInputRef.current.value = ''
    }

    const clearFile = () => {
        setFileAttachment(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    const resetAttachment = () => {
        clearImage()
        clearFile()
    }

    const clearAll = () => {
        setPrompt('')
        resetAttachment()
    }

    // File and image handling function

    const handleImageChange = (event) => {
        const file = event.target.files?.[0]
        if (!file) return
        const reader = new FileReader()
        reader.onloadend = () => setImageData(reader.result)
        reader.readAsDataURL(file)
    }

    // Process text file attachment with size and length validation
    const handleFileChange = (event) => {
        const file = event.target.files?.[0]
        if(!file) return

        // Check file size limite (2MB)
        if (file.size > 2 * 1024 * 1024) {
            setError('File too large. Please attach a file under 2MB')
            return
        }

        // Read file content and truncaate if necessary
       const reader = new FileReader()
       reader.onload = () => {
        const content = typeof reader.result === 'string' ? reader.result : ''
        const truncated = content.slice(0, MAX_FILE_CHARS)
        const notice = content.length > MAX_FILE_CHARS ? '\n\n[Content truncated to avoid exceeding model limits.]' : ''

        setFileAttachment({
            name: file.name,
            content: `${truncated}${notice}`
        })
        setError('')
       }
       reader.readAsText(file)
    }

    // Clear file attachment when switching away from Nova file model
    useEffect(() => {
        if (!isNovaFileModel) {
            clearFile()
        }
    }, [isNovaFileModel])

    // Main function to handle form submission and API call to OpenRouter
    const handleSubmit = async (event) => {
        event.preventDefault()

        // Check what content the user has provided
        const hasText = !!prompt.trim()
        const hasImage = !!imageData
        const hasFile = isNovaFileModel && !!fileAttachment?.content;
        const fallbackText = !hasText && (hasAttachment || hasFile) ? 'Please analyze the attachment items(s)' : ''
        
        // Prevent submission if already loading or no valid content
        if (loading) return
        if (!hasText && !hasFile && (!isVisionModel || !hasImage)) return

        // Reset state for new request
        setError('')
        setAnswer('')
        setDisplayedAnswer('')

        // Check for API key
        if (!apiHeaders.Authorization) {
            setError('Add VITE_OPENROUTER_API_KEY to your .env file to call the model.')
            return
        }

        setLoading(true)
        try{
            // Build message content based on available inputs (text, image, file)
            const parts = []
            const hasAttachment = isVisionModel && hasImage
            const fallbackText = !hasText && (hasAttachment || hasfile) ? 'Please analyze the attachment items(s)' : ''

            // Add text content (user prpmpt or fallback)
            if (hasText || fallbackText) {
                parts.push({
                    type: 'text',
                    text: hasText ? prompt.trim() : fallbackText
                })
            }

            // Add image content for vision models
            if (isVisionModel && hasImage) {
                parts.push({
                    type: 'image_url',
                    image_url: {
                        url: imageData,
                    },
                })
            }

            // Add file content for Nova file models
            if (hasFile) {
                parts.push({
                    type: 'text',
                    text: `File: ${fileAttachment.name}\n\n${fileAttachment.content}`,
                })
            }

            const messageContent = parts.length > 0 ? parts : [{ type: 'text', text: prompt.trim() }]

            // Make API calls to OpenRouter
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: apiHeaders,
                body: JSON.stringify({
                    model: selectedModel.id,
                    messages: [
                        {
                            role: 'user',
                            content: messageContent,
                        },
                    ],
                    stream: false,
                }),
            })

            // Handle HTTPS error
            if (!response.ok) {
                const errJson = await response.json().catch(() => null)
                const errMsg = errJson ?.error?.message || response.statusText || 'Request failed'
                throw new Error(errMsg)
            }

            // Parse successful response
            const data = await response.json()
            const choice = data?.choices?.[0]

            // Handle API-level errors
            if (choice?.error?.message) {
                throw new Error(choice.error.message)
            }

            // Process and normalize the response content
            let reply = choice?.message?.content
            if (Array.isArray(reply)) {
                // Handle array responses (some models return content as arrays)
                reply = reply.map((part) => {
                    if (typeof part === 'string') return part
                    if (part?.text) return part.text
                    if(part?.output_text) return part.output_text
                    return ''
                }).filter(Boolean).join('\n')
            }

            // Validate response content
            if (!reply || (typeof reply === 'string' && reply.trim() === '')) {
                const  backendError = data?.error?.message || 'No  response from model (empty content'
                throw new Error(backendError)
            }

            // Success - update state and clear attachment
            setAnswer(reply)
            resetAttachment()
        } catch (err) {
            // Handle and display errors
            setError(err?.message || 'Something went wrong. Check your API key and try again.')
        } finally {
            // Always stop loading state
            setLoading(false)
        }
    }

    // Typing animation effect - displays answer character by character
    useEffect(() => {
        if (!answer) {
            setDisplayedAnswer('')
            return;
        }

        let i = 0;
        const id = setInterval(() => {
            i += 1;
            setDisplayedAnswer(answer.slice(0, i));
            if (i >= answer.length) {
                clearInterval(id);
            }
        }, 12); // ~83 characters oer second

        return () => clearInterval(id);
    }, [answer]);

    // Handler functions for user interactions

    // Update selected model when user changes model selection
    const handleModelChange = (modelId) => {
        const nextModel = MODELS.find((model) => model.id === modelId)
        if (nextModel) setSelectedModel(nextModel)
    }

    // Set prompt text when user selected a quick action
    const handleQuickActionSelect = (text) => setPrompt(text)

    return (
        <div className="min-h-screen bg-zinc-950 text-white relative overflow-hidden">
            <div className="relative z-10 flex flex-col min-h-screen">
                <Header selectedModel={selectedModel} />

                <main className='flex-1 flex items-center justify-center p-4 sm:p-6'>
                    <div className="w-full max-w-4xl space-y-4 sm:space-y-6">
                        <ErrorBanner message={error} />

                        <AssistantResponse answer={answer} displayedAnswer={displayedAnswer} selectedModel={selectedModel} />

                        <PromptFrom prompt={prompt} onPromptChange={setPrompt} onSubmit={handleSubmit} onClearAll={clearAll} models={MODELS} selectedModel={selectedModel} onModelChange={handleModelChange} isVisionModel={isVisionModel} isNovaFileModel={isNovaFileModel} onImageChange={handleImageChange} onFilechange={handleFileChange} imageData={imageData} fileAttachment={fileAttachment} clearImage={clearImage} clearFile={clearFile} loading={loading} imageInpuutRef={imageInputRef} fileInputRef={fileInputRef} />

                        <QuickActions onSelect={handleQuickActionSelect} />
                    </div>
                </main>
            </div>
        </div>
    )
}

export default App;
