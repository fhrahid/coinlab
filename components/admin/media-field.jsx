"use client";
import { useRef } from "react";
import { FileText, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

const previewBox =
  "flex size-24 shrink-0 flex-col items-center justify-center gap-1.5 overflow-hidden rounded-xl border bg-card p-2 text-center text-muted-foreground";

// Choose / upload / cancel / remove buttons shared by every upload spot.
export function FileActions({
  accept,
  chooseLabel = "Choose file",
  upload,
  onUploaded,
  onRemove,
}) {
  const inputRef = useRef(null);
  const send = async () => {
    const url = await upload.upload();
    if (url) onUploaded(url);
  };
  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        accept={accept}
        className="sr-only"
        onChange={(e) => {
          upload.choose(e.target.files?.[0]);
          e.target.value = "";
        }}
        ref={inputRef}
        tabIndex={-1}
        type="file"
      />
      <Button onClick={() => inputRef.current?.click()} size="lg" type="button">
        <Upload data-icon="inline-start" /> {chooseLabel}
      </Button>
      {upload.file && (
        <>
          <Button
            disabled={upload.uploading}
            onClick={send}
            size="lg"
            type="button"
            variant="secondary"
          >
            {upload.uploading && <Spinner data-icon="inline-start" />} Upload
            now
          </Button>
          <Button
            disabled={upload.uploading}
            onClick={upload.clear}
            size="lg"
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
        </>
      )}
      {!upload.file && onRemove && (
        <Button
          onClick={onRemove}
          size="lg"
          type="button"
          variant="destructive"
        >
          Remove
        </Button>
      )}
    </div>
  );
}

// The attachment box at the bottom of a record form (cover, photo, logo, PDF).
export default function MediaField({
  label,
  accept,
  value,
  isPdf,
  upload,
  onChange,
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border bg-background p-3.5 sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 flex-col gap-2.5">
        <div className="min-w-0">
          <strong className="block text-xs">{label}</strong>
          <span className="mt-1 block truncate text-[11px] text-muted-foreground">
            {upload.file ? upload.file.name : value || "No file attached"}
          </span>
        </div>
        <FileActions
          accept={accept}
          onRemove={
            value
              ? () =>
                  onChange("", "Attachment removed. Save the record to apply.")
              : undefined
          }
          onUploaded={(url) => onChange(url)}
          upload={upload}
        />
      </div>
      {upload.file ? (
        upload.preview ? (
          <img
            alt="Preview of the selected file"
            className="size-24 shrink-0 rounded-xl border bg-card object-cover"
            src={upload.preview}
          />
        ) : (
          <div className={previewBox}>
            <FileText aria-hidden="true" className="size-5" />
            <b className="text-[9px] font-semibold break-all text-brand">
              {upload.file.name}
            </b>
          </div>
        )
      ) : value ? (
        isPdf ? (
          <a
            className={`${previewBox} hover:border-brand`}
            href={value}
            rel="noreferrer"
            target="_blank"
          >
            <FileText aria-hidden="true" className="size-5" />
            <b className="text-[9px] font-semibold text-brand">Open PDF</b>
          </a>
        ) : (
          <img
            alt="Currently attached file"
            className="size-24 shrink-0 rounded-xl border bg-card object-cover"
            src={value}
          />
        )
      ) : null}
    </div>
  );
}
