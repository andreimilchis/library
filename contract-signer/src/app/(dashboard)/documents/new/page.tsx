"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  Users,
  Layout,
  Send,
  ArrowLeft,
  ArrowRight,
  X,
  Plus,
  FileText,
  CheckCircle2,
  Trash2,
  UserCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { FieldPlacement } from "@/components/field-placement";

type Signer = {
  id: string;
  name: string;
  email: string;
  isSelf?: boolean;
};

type PlacedField = {
  id: string;
  type: string;
  signerId: string;
  page: number;
  posX: number;
  posY: number;
  width: number;
  height: number;
  value?: string;
};

const STEPS = [
  { id: 1, label: "Upload", icon: Upload },
  { id: 2, label: "Signers", icon: Users },
  { id: 3, label: "Fields", icon: Layout },
  { id: 4, label: "Review", icon: Send },
];

export default function NewDocumentPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [sending, setSending] = useState(false);

  // Current user info
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string; email: string } | null>(null);

  // Step 1 - Document
  const [file, setFile] = useState<File | null>(null);
  const [fileDataUrl, setFileDataUrl] = useState<string | null>(null);
  const [documentName, setDocumentName] = useState("");
  const [dragOver, setDragOver] = useState(false);

  // Step 2 - Signers
  const [includeSelf, setIncludeSelf] = useState(true);
  const selfSignerId = "self-signer";
  const [signers, setSigners] = useState<Signer[]>([
    { id: crypto.randomUUID(), name: "", email: "" },
  ]);

  // Step 3 - Fields
  const [fields, setFields] = useState<PlacedField[]>([]);

  // Step 4 - Message
  const [message, setMessage] = useState("");

  // Fetch current user info
  useEffect(() => {
    fetch("/api/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.name) setCurrentUser(data);
      })
      .catch(() => {});
  }, []);

  // Build the complete signers list including self
  const allSigners: Signer[] = includeSelf && currentUser
    ? [
        { id: selfSignerId, name: currentUser.name, email: currentUser.email, isSelf: true },
        ...signers,
      ]
    : signers;

  // File handling
  const readAndSetFile = useCallback(
    (f: File) => {
      setFile(f);
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setFileDataUrl(reader.result);
        }
      };
      reader.readAsDataURL(f);
      if (!documentName) {
        setDocumentName(f.name.replace(".pdf", ""));
      }
    },
    [documentName]
  );

  const handleFileDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile?.type === "application/pdf") {
        readAndSetFile(droppedFile);
      }
    },
    [readAndSetFile]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile?.type === "application/pdf") {
        readAndSetFile(selectedFile);
      }
    },
    [readAndSetFile]
  );

  // Signer handling
  function addSigner() {
    setSigners([
      ...signers,
      { id: crypto.randomUUID(), name: "", email: "" },
    ]);
  }

  function removeSigner(id: string) {
    setSigners(signers.filter((s) => s.id !== id));
    setFields(fields.filter((f) => f.signerId !== id));
  }

  function updateSigner(id: string, field: "name" | "email", value: string) {
    setSigners(
      signers.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  }

  function toggleSelf() {
    if (includeSelf) {
      // Remove self - also remove fields assigned to self
      setFields(fields.filter((f) => f.signerId !== selfSignerId));
    }
    setIncludeSelf(!includeSelf);
  }

  // Validation
  function canProceed() {
    switch (step) {
      case 1:
        return file !== null && documentName.trim() !== "";
      case 2:
        return (
          allSigners.length > 0 &&
          signers.every((s) => s.name.trim() && s.email.trim()) &&
          (includeSelf ? !!currentUser : true)
        );
      case 3:
        return fields.length > 0;
      case 4:
        return true;
      default:
        return false;
    }
  }

  // Submit
  async function handleSend() {
    if (!file) return;
    setSending(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("name", documentName);
      formData.append("message", message);
      formData.append("signers", JSON.stringify(allSigners));
      formData.append("fields", JSON.stringify(fields));

      const res = await fetch("/api/documents", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        router.push(`/documents/${data.id}`);
      } else {
        const errData = await res.json().catch(() => null);
        alert(errData?.error || "Failed to send document. Please try again.");
        setSending(false);
      }
    } catch (err) {
      console.error("Send document error:", err);
      alert("An error occurred. Please try again.");
      setSending(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Send for signature
          </h1>
          <p className="text-sm text-muted-foreground">
            Upload, configure, and send your contract
          </p>
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex items-center justify-center gap-1">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center">
            <button
              onClick={() => {
                if (s.id < step) setStep(s.id);
              }}
              className={cn(
                "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                step === s.id
                  ? "bg-primary text-primary-foreground"
                  : s.id < step
                    ? "bg-green-100 text-green-700"
                    : "bg-muted text-muted-foreground"
              )}
            >
              {s.id < step ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <s.icon className="h-4 w-4" />
              )}
              {s.label}
            </button>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  "mx-1 h-px w-8",
                  s.id < step ? "bg-green-300" : "bg-muted"
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="min-h-[400px]">
        {/* STEP 1: Upload */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Document name</Label>
              <Input
                value={documentName}
                onChange={(e) => setDocumentName(e.target.value)}
                placeholder="e.g. Marketing Services Agreement"
              />
            </div>

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleFileDrop}
              className={cn(
                "flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed p-12 transition-colors",
                dragOver
                  ? "border-primary bg-primary/5"
                  : file
                    ? "border-green-300 bg-green-50"
                    : "border-muted-foreground/20 hover:border-primary/40"
              )}
            >
              {file ? (
                <>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
                    <FileText className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { setFile(null); setFileDataUrl(null); }}
                  >
                    <X className="mr-1 h-3 w-3" />
                    Remove
                  </Button>
                </>
              ) : (
                <>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                    <Upload className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium">Drop your PDF here</p>
                    <p className="text-sm text-muted-foreground">
                      or click to browse from your computer
                    </p>
                  </div>
                  <label>
                    <input
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                    <Button variant="outline" asChild>
                      <span>Choose file</span>
                    </Button>
                  </label>
                </>
              )}
            </div>
          </div>
        )}

        {/* STEP 2: Signers */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Add signers</h2>
                <p className="text-sm text-muted-foreground">
                  Add the people who need to sign this document
                </p>
              </div>
              <Button variant="outline" onClick={addSigner} className="gap-2">
                <Plus className="h-4 w-4" />
                Add signer
              </Button>
            </div>

            {/* Self-signer toggle */}
            <Card className={cn(
              "transition-colors",
              includeSelf ? "border-blue-300 bg-blue-50/50" : ""
            )}>
              <CardContent className="flex items-center gap-4 p-4">
                <div className={cn(
                  "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full transition-colors",
                  includeSelf ? "bg-blue-100" : "bg-slate-100"
                )}>
                  <UserCircle className={cn(
                    "h-5 w-5",
                    includeSelf ? "text-blue-600" : "text-slate-400"
                  )} />
                </div>
                <div className="flex-1">
                  <p className="font-medium">
                    {currentUser ? currentUser.name : "Loading..."}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {includeSelf
                      ? "You will sign this document before sending"
                      : "Click to add yourself as a signer"}
                  </p>
                </div>
                <Button
                  variant={includeSelf ? "default" : "outline"}
                  size="sm"
                  onClick={toggleSelf}
                  className="gap-2"
                >
                  {includeSelf ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Me (now)
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      I need to sign
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* External signers */}
            <div className="space-y-3">
              {signers.map((signer, index) => (
                <Card key={signer.id}>
                  <CardContent className="flex items-start gap-4 p-4">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                      {(includeSelf ? index + 2 : index + 1)}
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Full name</Label>
                          <Input
                            value={signer.name}
                            onChange={(e) =>
                              updateSigner(signer.id, "name", e.target.value)
                            }
                            placeholder="John Smith"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Email address</Label>
                          <Input
                            type="email"
                            value={signer.email}
                            onChange={(e) =>
                              updateSigner(signer.id, "email", e.target.value)
                            }
                            placeholder="john@example.com"
                          />
                        </div>
                      </div>
                    </div>
                    {signers.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="flex-shrink-0"
                        onClick={() => removeSigner(signer.id)}
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: Place Fields */}
        {step === 3 && (
          <FieldPlacement
            fileDataUrl={fileDataUrl}
            signers={allSigners}
            fields={fields}
            onFieldsChange={setFields}
          />
        )}

        {/* STEP 4: Review & Send */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold">Review & send</h2>
              <p className="text-sm text-muted-foreground">
                Review the details before sending
              </p>
            </div>

            <div className="space-y-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                      <FileText className="h-5 w-5 text-slate-500" />
                    </div>
                    <div>
                      <p className="font-medium">{documentName}</p>
                      <p className="text-sm text-muted-foreground">
                        {file?.name} - {((file?.size || 0) / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 space-y-3">
                  <p className="text-sm font-medium text-muted-foreground">
                    SIGNERS ({allSigners.length})
                  </p>
                  {allSigners.map((signer, i) => (
                    <div
                      key={signer.id}
                      className="flex items-center gap-3 rounded-lg bg-slate-50 p-3"
                    >
                      <div className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold",
                        signer.isSelf
                          ? "bg-blue-100 text-blue-700"
                          : "bg-primary/10 text-primary"
                      )}>
                        {signer.isSelf ? (
                          <UserCircle className="h-4 w-4" />
                        ) : (
                          i + 1
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {signer.name}
                          {signer.isSelf && (
                            <span className="ml-2 text-xs font-normal text-blue-600">
                              (me - signs now)
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {signer.email}
                        </p>
                      </div>
                      <div className="ml-auto text-xs text-muted-foreground">
                        {fields.filter((f) => f.signerId === signer.id).length}{" "}
                        fields
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <div className="space-y-2">
                <Label>Message (optional)</Label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Add a message to include in the signing email..."
                  rows={3}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between border-t pt-4">
        <Button
          variant="outline"
          onClick={() => (step === 1 ? router.back() : setStep(step - 1))}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {step === 1 ? "Cancel" : "Back"}
        </Button>

        {step < 4 ? (
          <Button
            onClick={() => setStep(step + 1)}
            disabled={!canProceed()}
          >
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={handleSend}
            disabled={sending}
            size="lg"
            className="gap-2"
          >
            <Send className="h-4 w-4" />
            {sending ? "Sending..." : "Send for signature"}
          </Button>
        )}
      </div>
    </div>
  );
}
