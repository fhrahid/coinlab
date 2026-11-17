"use client";
import { useState } from "react";
import { ImagePlus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  BioEditor,
  CitationParser,
  SelectField,
  TextField,
  WingPicker,
} from "@/components/admin/form-fields";
import MediaField from "@/components/admin/media-field";
import SlideEditor from "@/components/admin/slide-editor";
import { useUpload } from "@/components/admin/use-upload";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { api } from "@/lib/api";
import { slugify } from "@/lib/citation";
import {
  collections,
  jobLocations,
  jobTypes,
  recordTitle,
  toFormRecord,
} from "@/lib/collections";
import { labRoles } from "@/lib/roles";

// Editor for one record. The parent remounts it (via `key`) whenever another
// record or collection is chosen, so all state here starts fresh.
export default function RecordForm({
  collection,
  record,
  wingOptions,
  onChanged,
}) {
  const config = collections[collection];
  const [form, setForm] = useState(() => toFormRecord(collection, record));
  const [saving, setSaving] = useState(false);
  const upload = useUpload();
  const originalSlug = record?.slug || "";
  const update = (key, value) =>
    setForm((current) => ({ ...current, [key]: value }));
  const field = (name, extra = {}) => (
    <TextField
      key={name}
      name={name}
      onChange={(value) => update(name, value)}
      value={form[name]}
      {...extra}
    />
  );

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    const slug =
      String(form.slug || "").trim() ||
      (collection === "slides"
        ? `slide-${Date.now()}`
        : slugify(form.name || form.title));
    const { ok, status, data } = await api("/api/content", {
      method: "POST",
      body: {
        ...form,
        collection,
        originalSlug: originalSlug || undefined,
        slug,
      },
    });
    setSaving(false);
    if (!ok) {
      toast.error(
        status === 0
          ? "Network error — the record was not saved."
          : data?.error || "Could not save.",
      );
      return;
    }
    toast.success("Saved. Your content is now available on the site.");
    onChanged();
  };

  const remove = async () => {
    const { ok, data } = await api("/api/content", {
      method: "DELETE",
      body: { collection, slug: originalSlug },
    });
    if (!ok) {
      toast.error(data?.error || "Could not delete.");
      return;
    }
    toast.success("Record deleted.");
    onChanged();
  };

  const applyCitation = (parsed) =>
    setForm((current) => ({
      ...current,
      title: parsed.title || current.title,
      authors: parsed.authors || current.authors,
      year: parsed.year || current.year,
      venue: parsed.venue || current.venue,
      doi: parsed.doi || current.doi,
      slug: current.slug || slugify(parsed.title),
    }));

  const saveLabel = saving ? (
    <>
      <Spinner data-icon="inline-start" /> Saving…
    </>
  ) : (
    <>
      <Save data-icon="inline-start" /> Save
    </>
  );

  return (
    <Card className="[--card-spacing:--spacing(4)] sm:[--card-spacing:--spacing(5)]">
      <form className="contents" onSubmit={save}>
        <CardHeader className="border-b">
          <CardDescription className="label-caps text-[0.5625rem]">
            {originalSlug ? "Editing" : "New"} · {config.label}
          </CardDescription>
          <CardTitle className="truncate text-xl font-bold tracking-[-0.03em]">
            {recordTitle(form) || `New ${config.singular}`}
          </CardTitle>
          <CardAction className="flex gap-2">
            {originalSlug && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="lg" type="button" variant="destructive">
                    <Trash2 data-icon="inline-start" />{" "}
                    <span className="max-sm:sr-only">Delete</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Delete this record permanently?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      “{recordTitle(record) || originalSlug}” will be removed
                      from the site. Attached files are also removed from
                      Cloudinary storage. This cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={remove} variant="destructive">
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            <Button
              className="max-sm:hidden"
              disabled={saving}
              size="lg"
              type="submit"
            >
              {saveLabel}
            </Button>
          </CardAction>
        </CardHeader>

        <CardContent>
          <FieldGroup className="grid gap-4 sm:grid-cols-2">
            {collection === "slides" && (
              <SlideEditor form={form} update={update} upload={upload} />
            )}

            {collection === "people" && (
              <>
                {field("name", {
                  placeholder: "Full name, e.g. Prof. A. K. M. Masum, PhD",
                })}
                <SelectField
                  name="role"
                  onChange={(value) => update("role", value)}
                  options={labRoles}
                  value={form.role || "Research Assistant"}
                />
                {field("slug", {
                  placeholder: "Auto-generated from name if left blank",
                  className: "sm:col-span-2",
                })}
                <BioEditor
                  onChange={(value) => update("bio", value)}
                  value={form.bio}
                />
                <WingPicker
                  onChange={(value) => update("wingSlugs", value)}
                  value={form.wingSlugs}
                  wings={wingOptions}
                />
              </>
            )}

            {collection === "papers" && (
              <>
                <CitationParser onParsed={applyCitation} />
                {field("title", { rows: 2, placeholder: "Paper title" })}
                {field("authors", {
                  rows: 2,
                  placeholder: "Author names separated by commas",
                })}
                {field("year", { inputMode: "numeric" })}
                {field("venue", { placeholder: "Journal or conference name" })}
                {field("doi", {
                  label: "DOI",
                  placeholder:
                    "DOI or full link, e.g. 10.1016/j.compag.2023.108700",
                })}
                {field("slug", {
                  placeholder: "Auto-generated from title if left blank",
                })}
                {field("abstract", {
                  rows: 5,
                  placeholder: "Optional summary",
                })}
                <WingPicker
                  onChange={(value) => update("wingSlugs", value)}
                  value={form.wingSlugs}
                  wings={wingOptions}
                />
              </>
            )}

            {collection === "wings" && (
              <>
                {field("title")}
                {field("number", { placeholder: "01–05" })}
                {field("shortTitle")}
                {field("slug", {
                  placeholder: "Auto-generated from title if left blank",
                })}
                {field("description", { rows: 3 })}
                {field("longDescription", { rows: 5 })}
                {field("focusPoints", {
                  rows: 5,
                  placeholder: "One focus point per line",
                })}
              </>
            )}

            {collection === "partners" && (
              <>
                {field("name", { placeholder: "Institution name" })}
                {field("abbr", {
                  label: "Abbreviation",
                  placeholder: "Short form, e.g. UIU",
                })}
                {field("number", {
                  label: "Display order",
                  placeholder: "01–04",
                })}
                {field("slug", {
                  placeholder: "Auto-generated from name if left blank",
                })}
                {field("logoUrl", {
                  label: "Logo URL",
                  placeholder: "Paste a logo URL, or upload below",
                  className: "sm:col-span-2",
                })}
              </>
            )}

            {collection === "jobs" && (
              <>
                {field("title", {
                  placeholder: "e.g. Research Assistant — AI in Healthcare",
                  className: "sm:col-span-2",
                })}
                <SelectField
                  name="type"
                  label="Employment type"
                  onChange={(value) => update("type", value)}
                  options={jobTypes}
                  value={form.type || jobTypes[0]}
                />
                <SelectField
                  name="location"
                  onChange={(value) => update("location", value)}
                  options={jobLocations}
                  value={form.location || jobLocations[0]}
                />
                {field("deadline", {
                  label: "Application deadline",
                  placeholder: "",
                  type: "date",
                })}
                {field("salary", {
                  label: "Salary / support",
                  placeholder: "Optional, e.g. BDT 25,000–35,000 per month",
                })}
                {field("slug", {
                  placeholder: "Auto-generated from title if left blank",
                  className: "sm:col-span-2",
                })}
                {field("summary", {
                  rows: 2,
                  placeholder:
                    "One or two sentences shown on the job card in the listing",
                })}
                <BioEditor
                  label="Description"
                  name="description"
                  placeholder="About the role — what the person will do and why it matters. The toolbar adds headings, bold, italic, lists and links."
                  onChange={(value) => update("description", value)}
                  value={form.description}
                />
                {field("requirements", {
                  rows: 5,
                  placeholder:
                    "One requirement per line, e.g.\nBSc in CSE or a related field\nExperience with Python and PyTorch",
                })}
                {field("applyInfo", {
                  label: "How to apply",
                  rows: 3,
                  placeholder:
                    "e.g. Email your CV and a short cover letter to coinlab@seu.edu.bd with the job title in the subject line.",
                })}
                <WingPicker
                  onChange={(value) => update("wingSlugs", value)}
                  value={form.wingSlugs}
                  wings={wingOptions}
                />
                <div className="flex items-center gap-3 sm:col-span-2">
                  <Switch
                    aria-label="Accepting applications"
                    checked={form.active !== false}
                    id="field-job-active"
                    onCheckedChange={(value) => update("active", value)}
                  />
                  <label
                    className="text-sm font-medium"
                    htmlFor="field-job-active"
                  >
                    Accepting applications
                    <span className="block text-xs font-normal text-muted-foreground">
                      Turn off to mark the posting as closed without deleting
                      it.
                    </span>
                  </label>
                </div>
              </>
            )}

            {collection !== "slides" && collection !== "jobs" && (
              <div className="flex flex-col gap-4 sm:col-span-2">
                <MediaField
                  accept={config.accept}
                  isPdf={collection === "papers"}
                  label={config.mediaLabel}
                  onChange={(value, message) => {
                    update(config.mediaField, value);
                    if (message) toast.info(message);
                  }}
                  upload={upload}
                  value={form[config.mediaField]}
                />
                <Alert className="bg-accent">
                  <ImagePlus />
                  <AlertTitle>Secure media storage</AlertTitle>
                  <AlertDescription>
                    Files are uploaded directly to Cloudinary with a short-lived
                    server signature. Save the record after upload to keep the
                    attachment.
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </FieldGroup>
        </CardContent>

        <CardFooter className="justify-end">
          <Button
            className="max-sm:w-full"
            disabled={saving}
            size="xl"
            type="submit"
          >
            {saveLabel}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
