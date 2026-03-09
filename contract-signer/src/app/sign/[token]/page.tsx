"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import {
  FileText,
  PenLine,
  CheckCircle2,
  Type,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

type SigningData = {
  document: {
    id: string;
    name: string;
    originalPdfUrl: string;
  };
  signer: {
    id: string;
    name: string;
    email: string;
    status: string;
  };
  fields: {
    id: string;
    type: string;
    page: number;
    posX: number;
    posY: number;
    width: number;
    height: number;
    value: string | null;
    required: boolean;
    placeholder: string | null;
  }[];
};

type SignatureMode = "draw" | "type" | "upload";

export default function SigningPage() {
  const params = useParams();
  const [data, setData] = useState<SigningData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [signing, setSigning] = useState(false);
  const [signed, setSigned] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [activeFieldId, setActiveFieldId] = useState("");
  const [signatureMode, setSignatureMode] = useState<SignatureMode>("draw");
  const [typedSignature, setTypedSignature] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const [numPages, setNumPages] = useState(0);
  const [pdfContainerWidth, setPdfContainerWidth] = useState(0);
  const pdfContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!pdfContainerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setPdfContainerWidth(Math.floor(entry.contentRect.width));
      }
    });
    observer.observe(pdfContainerRef.current);
    return () => observer.disconnect();
  }, [data]);

  useEffect(() => {
    fetchSigningData();
  }, [params.token]);

  async function fetchSigningData() {
    try {
      const res = await fetch(`/api/sign/${params.token}`);
      if (res.ok) {
        const d = await res.json();
        setData(d);
        if (d.signer.status === "SIGNED") {
          setSigned(true);
        }
        // Pre-fill known values
        const values: Record<string, string> = {};
        d.fields.forEach((f: SigningData["fields"][0]) => {
          if (f.type === "FULL_NAME") values[f.id] = d.signer.name;
          if (f.type === "EMAIL") values[f.id] = d.signer.email;
          if (f.type === "DATE_SIGNED")
            values[f.id] = new Date().toLocaleDateString("en-US");
          if (f.value) values[f.id] = f.value;
        });
        setFieldValues(values);
      } else {
        setError("Invalid or expired signing link.");
      }
    } catch {
      setError("Failed to load document.");
    } finally {
      setLoading(false);
    }
  }

  function openSignatureModal(fieldId: string) {
    setActiveFieldId(fieldId);
    setShowSignatureModal(true);
    setSignatureMode("draw");
    setTypedSignature("");
  }

  function initCanvas() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#1a1a1a";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }

  function startDrawing(e: React.MouseEvent<HTMLCanvasElement>) {
    isDrawingRef.current = true;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  }

  function draw(e: React.MouseEvent<HTMLCanvasElement>) {
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  }

  function stopDrawing() {
    isDrawingRef.current = false;
  }

  function applySignature() {
    let signatureValue = "";

    if (signatureMode === "draw" && canvasRef.current) {
      signatureValue = canvasRef.current.toDataURL("image/png");
    } else if (signatureMode === "type") {
      signatureValue = `typed:${typedSignature}`;
    }

    if (signatureValue) {
      setFieldValues({ ...fieldValues, [activeFieldId]: signatureValue });
    }
    setShowSignatureModal(false);
  }

  async function handleSign() {
    if (!data) return;

    // Check all required fields
    const missingFields = data.fields.filter(
      (f) => f.required && !fieldValues[f.id]
    );
    if (missingFields.length > 0) {
      alert("Please fill in all required fields before signing.");
      return;
    }

    setSigning(true);
    try {
      const res = await fetch(`/api/sign/${params.token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fieldValues }),
      });

      if (res.ok) {
        setSigned(true);
      } else {
        alert("Failed to sign document. Please try again.");
      }
    } catch {
      alert("An error occurred. Please try again.");
    } finally {
      setSigning(false);
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-muted-foreground">Loading document...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center space-y-3">
          <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
          <p className="font-medium text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  // Already signed
  if (signed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="mx-auto max-w-sm text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold">Document signed!</h1>
          <p className="text-muted-foreground">
            Thank you, {data?.signer.name}. Your signature has been recorded and
            the sender has been notified.
          </p>
          <div className="rounded-lg bg-slate-100 p-4 text-sm text-muted-foreground">
            You can close this window.
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const completedFields = data.fields.filter((f) => fieldValues[f.id]).length;
  const totalFields = data.fields.length;
  const allFieldsFilled = completedFields === totalFields;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-white shadow-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900">
              <FileText className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold">NETkyu Contract Signer</p>
              <p className="text-xs text-muted-foreground">
                {data.document.name}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              {completedFields}/{totalFields} fields
            </span>
            <Button
              onClick={handleSign}
              disabled={!allFieldsFilled || signing}
              className="gap-2"
            >
              <PenLine className="h-4 w-4" />
              {signing ? "Signing..." : "Complete signing"}
            </Button>
          </div>
        </div>
      </header>

      {/* Document area */}
      <div className="mx-auto max-w-4xl p-6">
        <div className="mb-4 rounded-lg bg-blue-50 border border-blue-200 p-4">
          <p className="text-sm text-blue-800">
            <strong>{data.signer.name}</strong>, please review the document and
            fill in the required fields below, then click &quot;Complete signing&quot;.
          </p>
        </div>

        {/* PDF viewer with fields */}
        <div
          ref={pdfContainerRef}
          className="relative rounded-xl border-2 border-slate-200 bg-white shadow-sm overflow-hidden"
        >
          <Document
            file={data.document.originalPdfUrl}
            onLoadSuccess={({ numPages }) => setNumPages(numPages)}
            loading={
              <div
                className="flex min-h-[700px] items-center justify-center"
                style={{ aspectRatio: "8.5/11" }}
              >
                <p className="text-muted-foreground">Loading PDF...</p>
              </div>
            }
            error={
              <div
                className="flex min-h-[700px] items-center justify-center"
                style={{ aspectRatio: "8.5/11" }}
              >
                <p className="text-red-500">Failed to load PDF. The document may not be a valid PDF file.</p>
              </div>
            }
          >
            {Array.from(new Array(numPages), (_, index) => (
              <Page
                key={`page_${index + 1}`}
                pageNumber={index + 1}
                width={pdfContainerWidth || undefined}
                renderTextLayer={false}
                renderAnnotationLayer={false}
              />
            ))}
          </Document>

          {/* Interactive fields overlaid on PDF */}
          {data.fields.map((field) => {
            const value = fieldValues[field.id];
            const isSignature = field.type === "SIGNATURE" || field.type === "INITIALS";
            const hasValue = !!value;

            return (
              <div
                key={field.id}
                className={cn(
                  "absolute flex items-center rounded border-2 px-2 py-1 text-xs transition-all",
                  hasValue
                    ? "border-green-400 bg-green-50"
                    : "border-blue-400 bg-blue-50 cursor-pointer hover:bg-blue-100"
                )}
                style={{
                  left: field.posX,
                  top: field.posY,
                  minWidth: field.width,
                  minHeight: field.height,
                }}
                onClick={() => {
                  if (isSignature && !hasValue) {
                    openSignatureModal(field.id);
                  }
                }}
              >
                {isSignature ? (
                  hasValue ? (
                    value.startsWith("typed:") ? (
                      <span className="font-signature text-lg italic">
                        {value.replace("typed:", "")}
                      </span>
                    ) : (
                      <span className="text-green-600 font-medium">Signed</span>
                    )
                  ) : (
                    <span className="text-blue-600">
                      <PenLine className="mr-1 inline h-3 w-3" />
                      Click to sign
                    </span>
                  )
                ) : field.type === "DATE_SIGNED" ? (
                  <span className="text-sm">{value || "Date"}</span>
                ) : (
                  <input
                    type={field.type === "EMAIL" ? "email" : "text"}
                    value={value || ""}
                    onChange={(e) =>
                      setFieldValues({
                        ...fieldValues,
                        [field.id]: e.target.value,
                      })
                    }
                    placeholder={field.placeholder || field.type.replace("_", " ").toLowerCase()}
                    className="w-full bg-transparent text-sm outline-none"
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Signature Modal */}
      {showSignatureModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-semibold">Add your signature</h3>

            {/* Mode tabs */}
            <div className="mb-4 flex gap-1 rounded-lg bg-slate-100 p-1">
              {(["draw", "type"] as SignatureMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setSignatureMode(mode)}
                  className={cn(
                    "flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    signatureMode === mode
                      ? "bg-white shadow"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {mode === "draw" ? "Draw" : "Type"}
                </button>
              ))}
            </div>

            {/* Draw mode */}
            {signatureMode === "draw" && (
              <div className="space-y-3">
                <canvas
                  ref={(el) => {
                    (canvasRef as React.MutableRefObject<HTMLCanvasElement | null>).current = el;
                    if (el) initCanvas();
                  }}
                  width={400}
                  height={150}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  className="w-full cursor-crosshair rounded-lg border-2 border-dashed border-slate-300"
                />
                <button
                  onClick={initCanvas}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Clear
                </button>
              </div>
            )}

            {/* Type mode */}
            {signatureMode === "type" && (
              <div className="space-y-3">
                <Input
                  value={typedSignature}
                  onChange={(e) => setTypedSignature(e.target.value)}
                  placeholder="Type your full name"
                  className="text-lg"
                />
                {typedSignature && (
                  <div className="flex h-20 items-center justify-center rounded-lg bg-slate-50 text-2xl italic">
                    {typedSignature}
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="mt-6 flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowSignatureModal(false)}
              >
                Cancel
              </Button>
              <Button className="flex-1" onClick={applySignature}>
                Apply signature
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
