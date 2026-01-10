"use client"

import { useState, useRef, type ChangeEvent } from "react"
import { Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ImageUploadProps {
  value?: string
  onChange: (value: string) => void
  label?: string
  optional?: boolean
}

export function ImageUpload({ value, onChange, label = "Foto", optional = false }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | undefined>(value)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setPreview(result)
        onChange(result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemove = () => {
    setPreview(undefined)
    onChange("")
    if (inputRef.current) {
      inputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        {label} {optional && <span className="text-muted-foreground">(Opcional)</span>}
      </label>
      <div className="flex items-start gap-4">
        {preview ? (
          <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-border">
            <img src={preview || "/placeholder.svg"} alt="Preview" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 hover:opacity-90 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            className="w-32 h-32 flex flex-col items-center justify-center gap-2 bg-transparent"
            onClick={() => inputRef.current?.click()}
          >
            <Upload className="w-6 h-6" />
            <span className="text-xs">Upload</span>
          </Button>
        )}
        <input ref={inputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
      </div>
    </div>
  )
}
