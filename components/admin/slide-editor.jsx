"use client";
import { ImagePlus } from "lucide-react";
import { SelectField, TextField } from "@/components/admin/form-fields";
import { FileActions } from "@/components/admin/media-field";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
} from "@/components/ui/field";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { slideGravities } from "@/lib/collections";
import { slideDeliveryUrl } from "@/lib/media";

const sliders = [
  { key: "x", label: "Position X", min: -600, max: 600 },
  { key: "y", label: "Position Y", min: -600, max: 600 },
  { key: "zoom", label: "Zoom", min: 1, max: 2, step: 0.05, fallback: 1 },
  { key: "brightness", label: "Brightness", min: -50, max: 50 },
  { key: "contrast", label: "Contrast", min: -50, max: 50 },
  { key: "saturation", label: "Saturation", min: -50, max: 50 },
  { key: "dim", label: "Caption dim", min: 0, max: 70 },
];

// Hero-slide editor: upload a photo, then crop/position/adjust it with a live
// preview. Edits are Cloudinary URL transformations — the original is untouched.
export default function SlideEditor({ form, update, upload }) {
  const transform = form.transform || {};
  const setTransform = (key, value) =>
    update("transform", { ...transform, [key]: value });
  const actions = (label) => (
    <FileActions
      accept="image/*"
      chooseLabel={label}
      onUploaded={(url) => update("image", url)}
      upload={upload}
    />
  );

  if (!form.image) {
    return (
      <div className="flex flex-col gap-4 sm:col-span-2">
        <Alert>
          <ImagePlus />
          <AlertTitle>Upload a photo to begin</AlertTitle>
          <AlertDescription>
            Choose a wide landscape photo. Once uploaded, crop, position and
            adjust it live — the preview is exactly what the homepage will show.
          </AlertDescription>
        </Alert>
        {upload.preview && (
          <img
            alt="Preview of the selected file"
            className="max-h-64 w-full border object-contain"
            src={upload.preview}
          />
        )}
        {actions("Choose image")}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 sm:col-span-2">
      <div className="relative aspect-16/11 w-full overflow-hidden border bg-muted">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${slideDeliveryUrl(form.image, transform)})`,
          }}
        />
        <div
          className="absolute inset-0 bg-navy"
          style={{ opacity: (transform.dim || 0) / 100 }}
        />
        {form.caption && (
          <span className="label-caps absolute bottom-3.5 left-3 max-w-[75%] bg-white/92 px-2.5 py-1.5 tracking-[0.08em] text-foreground">
            {form.caption}
          </span>
        )}
        <Badge className="label-caps absolute top-2.5 right-2.5 text-[0.5rem]">
          Live preview
        </Badge>
      </div>

      <div className="grid gap-x-5 gap-y-5 sm:grid-cols-2 xl:grid-cols-4">
        <SelectField
          format={(option) => option.replace(/_/g, " ")}
          label="Focus point"
          name="gravity"
          onChange={(value) => setTransform("gravity", value)}
          options={slideGravities}
          value={transform.gravity || "auto"}
        />
        {sliders.map(({ key, label, min, max, step = 1, fallback = 0 }) => {
          const value = transform[key] ?? fallback;
          return (
            <Field key={key}>
              <FieldLabel
                className="w-full justify-between"
                htmlFor={`slide-${key}`}
              >
                {label}
                <b className="font-medium text-brand">{value}</b>
              </FieldLabel>
              <Slider
                aria-label={label}
                className="py-3"
                id={`slide-${key}`}
                max={max}
                min={min}
                onValueChange={([next]) => setTransform(key, next)}
                step={step}
                value={[value]}
              />
            </Field>
          );
        })}
      </div>
      <p className="text-[11px] leading-[1.7] text-muted-foreground">
        Focus “auto” finds the subject by itself; a manual focus anchors the
        crop. Zoom in to make room for Position X/Y panning. Edits preview live
        and never modify the original file.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          name="caption"
          onChange={(value) => update("caption", value)}
          placeholder="Optional caption shown on the slide"
          value={form.caption}
        />
        <TextField
          label="Display order"
          name="number"
          onChange={(value) => update("number", value)}
          placeholder="e.g. 01, 02"
          value={form.number}
        />
      </div>
      <Field className="border bg-card p-3.5" orientation="horizontal">
        <FieldContent>
          <FieldLabel
            className="font-sans text-xs font-semibold tracking-normal text-foreground normal-case"
            htmlFor="slide-active"
          >
            Slide is live on the homepage
          </FieldLabel>
          <FieldDescription>
            Turn off to hide the slide without deleting it.
          </FieldDescription>
        </FieldContent>
        <Switch
          checked={form.active !== false}
          id="slide-active"
          onCheckedChange={(checked) => update("active", checked)}
        />
      </Field>
      {actions("Replace image")}
    </div>
  );
}
