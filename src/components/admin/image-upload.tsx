"use client";

import { useEffect, useRef, useState } from "react";
import { checkImageFile, IMAGE_MIME_TYPES } from "@/lib/admin/validation";

// File input with a live preview and instant validation. The chosen file is rejected
// (and the input cleared) before submit if it's the wrong type or too large; the server
// action validates again because client checks can be bypassed.
export function ImageUpload({
  currentUrl,
  serverError,
}: {
  currentUrl?: string | null;
  serverError?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [removing, setRemoving] = useState(false);

  // Release the object URL when the preview changes or the component unmounts.
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  // React resets the form after each submit, which empties the file input: drop the stale preview.
  useEffect(() => {
    const form = inputRef.current?.form;
    const onReset = () => {
      setPreview(null);
      setFileName("");
      setRemoving(false);
    };
    form?.addEventListener("reset", onReset);
    return () => form?.removeEventListener("reset", onReset);
  }, []);

  function clearSelection() {
    if (inputRef.current) inputRef.current.value = "";
    setPreview(null);
    setFileName("");
  }

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return clearSelection();
    const problem = checkImageFile(file);
    if (problem) {
      clearSelection();
      return setError(problem);
    }
    setError(null);
    setRemoving(false);
    setFileName(file.name);
    setPreview(URL.createObjectURL(file));
  }

  const shown = preview ?? (removing ? null : currentUrl ?? null);
  const message = error ?? serverError;

  return (
    <div className="space-y-2">
      <label htmlFor="image" className="block text-sm font-medium text-forest">
        Product image
      </label>
      {shown && (
        <div className="flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element -- local blob/Storage preview */}
          <img src={shown} alt="Product image preview" className="size-32 rounded-2xl bg-sage object-cover" />
          {preview && (
            <div className="space-y-1 text-sm text-forest/70">
              <p className="break-all">{fileName}</p>
              <button type="button" onClick={clearSelection} className="font-medium text-forest underline">
                Discard selection
              </button>
            </div>
          )}
        </div>
      )}
      <input
        ref={inputRef}
        id="image"
        name="image"
        type="file"
        accept={IMAGE_MIME_TYPES.join(",")}
        onChange={onChange}
        aria-invalid={message ? true : undefined}
        aria-describedby={message ? "image-error" : undefined}
        className="block w-full text-sm text-forest file:mr-4 file:rounded-full file:border-0 file:bg-sage file:px-5 file:py-2 file:text-sm file:font-medium file:text-forest"
      />
      <p className="text-xs text-forest/60">JPG, PNG, WebP or AVIF, up to 5 MB.</p>
      {message && (
        <p id="image-error" role="alert" className="text-sm text-destructive">
          {message}
        </p>
      )}
      {currentUrl && (
        <label className="flex items-center gap-2 text-sm text-forest/80">
          <input
            type="checkbox"
            name="removeImage"
            checked={removing}
            onChange={(e) => setRemoving(e.target.checked)}
            className="size-4 accent-[var(--forest)]"
          />
          Remove current image
        </label>
      )}
    </div>
  );
}
