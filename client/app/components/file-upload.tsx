'use client'

import * as React from 'react'
import { Upload, FileText, Bot } from 'lucide-react'
import { motion } from 'framer-motion'

const FileUploadComponent: React.FC = () => {
  const [isDragging, setIsDragging] = React.useState(false)
  const [fileName, setFileName] = React.useState<string | null>(null)
  const [isUploading, setIsUploading] = React.useState(false)
  const [uploadSuccess, setUploadSuccess] = React.useState(false)

  const handleFileUpload = async (file: File) => {
    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file')
      return
    }

    setIsUploading(true)
    setFileName(file.name)
    
    try {
      const formData = new FormData()
      formData.append('pdf', file)

      await fetch('http://localhost:8000/upload/pdf', {
        method: 'POST',
        body: formData
      })
      
      setUploadSuccess(true)
      setTimeout(() => setUploadSuccess(false), 3000)
    } catch (error) {
      alert('Upload failed. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileInputClick = () => {
    const el = document.createElement('input')
    el.setAttribute('type', 'file')
    el.setAttribute('accept', 'application/pdf')
    el.addEventListener('change', (ev) => {
      if (el.files && el.files.length > 0) {
        handleFileUpload(el.files[0])
      }
    })
    el.click()
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0])
    }
  }

  return (
    <div className="min-h-screen w-screen bg-black flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Bot className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <h1 className="text-2xl font-semibold text-white mb-2">Upload a PDF to get started</h1>
          <p className="text-gray-400">Drag here</p>
        </div>

        <div
          onClick={handleFileInputClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`bg-gray-800 rounded-xl border-2 border-dashed p-8 mb-4 cursor-pointer transition-all ${
            isDragging ? 'border-blue-500 bg-gray-700' : 'border-gray-600'
          } ${uploadSuccess ? '!border-green-500' : ''}`}
        >
          <div className="flex flex-col items-center justify-center gap-3">
            <div className={`p-3 rounded-full ${
              uploadSuccess ? 'bg-green-500' : 'bg-gray-700'
            }`}>
              {uploadSuccess ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : isUploading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              ) : (
                <Upload className="h-6 w-6 text-white" />
              )}
            </div>
            
            <h3 className="text-lg font-medium text-white">
              {uploadSuccess ? 'Upload Successful!' : 'Upload your PDF'}
            </h3>
            <p className="text-sm text-gray-400 text-center">
              {uploadSuccess ? 'Your file is ready for processing' : 'Click to browse or drag & drop your file here'}
            </p>
            
            {fileName && (
              <div className="mt-3 flex items-center gap-2 text-sm text-gray-300">
                <FileText className="h-4 w-4" />
                <span className="truncate max-w-xs">{fileName}</span>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={handleFileInputClick}
          className="w-full py-2 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
        >
          Select File
        </button>

        {isUploading && (
          <div className="mt-4 w-full bg-gray-700 rounded-full h-1.5">
            <div className="bg-blue-500 h-1.5 rounded-full animate-pulse" style={{ width: '70%' }}></div>
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default FileUploadComponent