'use client'

import { useState } from 'react'
import { X, Download, ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DocumentViewerProps {
  documentUrl: string
  documentName: string
  onClose: () => void
}

export function DocumentViewer({ documentUrl, documentName, onClose }: DocumentViewerProps) {
  const [zoom, setZoom] = useState(100)
  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = 1 // TODO: Get from PDF metadata

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 25, 200))
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 25, 50))

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
      <div className="relative w-full h-full max-w-7xl mx-auto flex flex-col bg-white">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <div className="flex items-center gap-4">
            <h3 className="font-semibold text-gray-900 truncate max-w-md">
              {documentName}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {/* Zoom Controls */}
            <div className="flex items-center gap-2 px-3 py-1 bg-white border rounded-lg">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleZoomOut}
                disabled={zoom <= 50}
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="text-sm font-medium w-12 text-center">{zoom}%</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleZoomIn}
                disabled={zoom >= 200}
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
            </div>

            {/* Page Navigation */}
            <div className="flex items-center gap-2 px-3 py-1 bg-white border rounded-lg">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm font-medium">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Download */}
            <Button variant="outline" size="sm" asChild>
              <a href={documentUrl} download={documentName}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </a>
            </Button>

            {/* Close */}
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* PDF Viewer */}
        <div className="flex-1 overflow-auto bg-gray-100 p-8">
          <div className="max-w-4xl mx-auto bg-white shadow-lg">
            {/* Placeholder for PDF rendering */}
            {/* In production, use a library like react-pdf or pdf.js */}
            <div className="aspect-[8.5/11] flex items-center justify-center border">
              <div className="text-center">
                <p className="text-gray-600 mb-4">Anteprima documento PDF</p>
                <p className="text-sm text-gray-500">
                  Per visualizzare il PDF completo, scarica il documento
                </p>
                <Button variant="outline" className="mt-4" asChild>
                  <a href={documentUrl} download={documentName}>
                    <Download className="w-4 h-4 mr-2" />
                    Scarica PDF
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
