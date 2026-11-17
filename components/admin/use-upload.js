"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";

// Holds a file the editor picked but has not uploaded yet, and uploads it
// straight to Cloudinary using a short-lived signature from /api/uploads.
export function useUpload() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const previewRef = useRef("");

  const setPreviewUrl = useCallback((url) => {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    previewRef.current = url;
    setPreview(url);
  }, []);

  useEffect(
    () => () => {
      if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    },
    [],
  );

  const clear = useCallback(() => {
    setFile(null);
    setPreviewUrl("");
  }, [setPreviewUrl]);

  const choose = useCallback(
    (next) => {
      if (!next) return;
      setFile(next);
      setPreviewUrl(
        next.type.startsWith("image/") ? URL.createObjectURL(next) : "",
      );
    },
    [setPreviewUrl],
  );

  // Resolves to the uploaded file's URL, or null when the upload failed.
  const upload = useCallback(async () => {
    if (!file) return null;
    setUploading(true);
    const toastId = toast.loading("Uploading to Cloudinary…");
    const fail = (message) => {
      toast.error(message, { id: toastId });
      setUploading(false);
      return null;
    };

    const signed = await api("/api/uploads", {
      method: "POST",
      body: {
        filename: file.name,
        contentType: file.type || "application/octet-stream",
      },
    });
    if (!signed.ok) return fail(signed.data?.error || "Upload setup failed.");
    const { apiKey, cloudName, publicId, resourceType, signature, timestamp } =
      signed.data;

    const body = new FormData();
    body.append("file", file);
    body.append("api_key", apiKey);
    body.append("timestamp", timestamp);
    body.append("public_id", publicId);
    body.append("signature", signature);
    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
        { method: "POST", body },
      );
      const uploaded = res.ok ? await res.json() : null;
      if (!uploaded?.secure_url) return fail("Upload failed.");
      toast.success(
        "Upload complete. Save the record to keep the file attached.",
        { id: toastId },
      );
      setUploading(false);
      clear();
      return uploaded.secure_url;
    } catch {
      return fail("Upload failed — check your connection.");
    }
  }, [file, clear]);

  return { file, preview, uploading, choose, clear, upload };
}
