"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import {
  PenLine,
  Type,
  Calendar,
  User,
  Mail,
  Building2,
  Briefcase,
  AlignLeft,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

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

type SignatureMode = "draw" | "type";

const FIELD_TYPES = [
  { type: "SIGNATURE", label: "Signature", icon: PenLine, width: 200, height: 60 },
  { type: "INITIALS", label: "Initials", icon: Type, width: 80, height: 40 },
  { type: "DATE_SIGNED", label: "Date signed", icon: Calendar, width: 150, height: 30 },
  { type: "FULL_NAME", label: "Full name", icon: User, width: 180, height: 30 },
  { type: "EMAIL", label: "Email", icon: Mail, width: 200, height: 30 },
  { type: "COMPANY", label: "Company", icon: Building2, width: 180, height: 30 },
  { type: "TITLE", label: "Title", icon: Briefcase, width: 150, height: 30 },
  { type: "TEXT", label: "Text field", icon: AlignLeft, width: 200, height: 30 },
];

const SIGNER_COLORS = [
  "bg-blue-500",
  "bg-green-500",
  "bg-purple-500",
  "bg-orange-500",
  "bg-pink-500",
];

const SIGNER_BORDER_COLORS = [
  "border-blue-400",
  "border-green-400",
  "border-purple-400",
  "border-orange-400",
  "border-pink-400",
];

const SIGNER_BG_COLORS = [
  "bg-blue-50",
  "bg-green-50",
  "bg-purple-50",
  "bg-orange-50",
  "bg-pink-50",
];

const SIGNER_TEXT_COLORS = [
  "text-blue-700",
  "text-green-700",
  "text-purple-700",
  "text-orange-700",
  "text-pink-700",
];

type ResizeHandle = "nw" | "ne" | "sw" | "se";

export function FieldPlacement({
  fileData,
  signers,
  fields,
  onFieldsChange,
}: {
  fileData: ArrayBuffer | null;
  signers: Signer[];
  fields: PlacedField[];
  onFieldsChange: (fields: PlacedField[]) => void;
}) {
  const [selectedSigner, setSelectedSigner] = useState(signers[0]?.id || "");
  const [draggingType, setDraggingType] = useState<string | null>(null);
  const [movingField, setMovingField] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const [pageHeight, setPageHeight] = useState<number>(0);
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Zoom state
  const [zoom, setZoom] = useState(1);
  const ZOOM_MIN = 0.5;
  const ZOOM_MAX = 2.5;
  const ZOOM_STEP = 0.15;

  // Ghost position for dragging new fields from sidebar
  const [ghostPos, setGhostPos] = useState<{ x: number; y: number } | null>(null);

  // Resize state
  const resizingRef = useRef<{
    fieldId: string;
    handle: ResizeHandle;
    startMouseX: number;
    startMouseY: number;
    startPosX: number;
    startPosY: number;
    startWidth: number;
    startHeight: number;
  } | null>(null);
  const [isResizing, setIsResizing] = useState(false);

  // Optimized drag: direct DOM manipulation via refs for 60fps movement
  const movingRef = useRef<{
    fieldId: string;
    offsetX: number;
    offsetY: number;
    startPosX: number;
    startPosY: number;
    element: HTMLElement;
    lastClientX: number;
    lastClientY: number;
    rafId: number;
  } | null>(null);

  // Signature modal for "Me" signer
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [pendingFieldId, setPendingFieldId] = useState<string | null>(null);
  const [signatureMode, setSignatureMode] = useState<SignatureMode>("draw");
  const [typedSignature, setTypedSignature] = useState("");
  const [savedSignature, setSavedSignature] = useState<string | null>(null);
  const signatureCanvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);

  // Wrap ArrayBuffer for react-pdf Document component
  const pdfSource = fileData ? { data: fileData } : null;

  // Track canvas content dimensions
  useEffect(() => {
    if (!canvasRef.current) return;
    let rafId: number;
    const observer = new ResizeObserver((entries) => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        for (const entry of entries) {
          const w = Math.floor(entry.contentRect.width);
          const h = Math.floor(entry.contentRect.height);
          setContainerWidth((prev) => (Math.abs(prev - w) > 1 ? w : prev));
          if (h > 0) setPageHeight(h);
        }
      });
    });
    observer.observe(canvasRef.current);
    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, []);

  const stableWidth = Math.floor(containerWidth) || undefined;

  // Helper: get percentage coordinates from mouse event on canvas
  const getCanvasPct = useCallback(
    (e: MouseEvent | React.MouseEvent) => {
      if (!canvasRef.current || !containerWidth || !pageHeight) return null;
      const rect = canvasRef.current.getBoundingClientRect();
      const style = getComputedStyle(canvasRef.current);
      const borderLeft = parseFloat(style.borderLeftWidth) || 0;
      const borderTop = parseFloat(style.borderTopWidth) || 0;
      // Account for zoom: the visual rect is scaled, so divide by zoom
      const pixelX = (e.clientX - rect.left - borderLeft) / zoom;
      const pixelY = (e.clientY - rect.top - borderTop) / zoom;
      return {
        pctX: (pixelX / containerWidth) * 100,
        pctY: (pixelY / pageHeight) * 100,
      };
    },
    [containerWidth, pageHeight, zoom]
  );

  // Document-level resize + move handler
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Handle resize
      const r = resizingRef.current;
      if (r && containerWidth && pageHeight) {
        const deltaPctX = ((e.clientX - r.startMouseX) / zoom / containerWidth) * 100;
        const deltaPctY = ((e.clientY - r.startMouseY) / zoom / pageHeight) * 100;

        const minW = 3;
        const minH = 1.5;

        let posX = r.startPosX;
        let posY = r.startPosY;
        let width = r.startWidth;
        let height = r.startHeight;

        switch (r.handle) {
          case "se":
            width = Math.max(minW, r.startWidth + deltaPctX);
            height = Math.max(minH, r.startHeight + deltaPctY);
            break;
          case "sw":
            posX = r.startPosX + deltaPctX;
            width = Math.max(minW, r.startWidth - deltaPctX);
            height = Math.max(minH, r.startHeight + deltaPctY);
            if (width <= minW) posX = r.startPosX + r.startWidth - minW;
            break;
          case "ne":
            posY = r.startPosY + deltaPctY;
            width = Math.max(minW, r.startWidth + deltaPctX);
            height = Math.max(minH, r.startHeight - deltaPctY);
            if (height <= minH) posY = r.startPosY + r.startHeight - minH;
            break;
          case "nw":
            posX = r.startPosX + deltaPctX;
            posY = r.startPosY + deltaPctY;
            width = Math.max(minW, r.startWidth - deltaPctX);
            height = Math.max(minH, r.startHeight - deltaPctY);
            if (width <= minW) posX = r.startPosX + r.startWidth - minW;
            if (height <= minH) posY = r.startPosY + r.startHeight - minH;
            break;
        }

        onFieldsChange(
          fields.map((f) =>
            f.id === r.fieldId ? { ...f, posX: posX, posY: posY, width, height } : f
          )
        );
        return;
      }

      // Handle smooth field moving via direct DOM + rAF (no React re-renders)
      const m = movingRef.current;
      if (m) {
        m.lastClientX = e.clientX;
        m.lastClientY = e.clientY;
        if (!m.rafId) {
          m.rafId = requestAnimationFrame(() => {
            const mr = movingRef.current;
            if (!mr || !canvasRef.current || !containerWidth || !pageHeight) return;
            const rect = canvasRef.current.getBoundingClientRect();
            const style = getComputedStyle(canvasRef.current);
            const borderLeft = parseFloat(style.borderLeftWidth) || 0;
            const borderTop = parseFloat(style.borderTopWidth) || 0;
            const pctX = (((mr.lastClientX - rect.left - borderLeft) / zoom) / containerWidth) * 100;
            const pctY = (((mr.lastClientY - rect.top - borderTop) / zoom) / pageHeight) * 100;
            const deltaX = ((pctX - mr.offsetX - mr.startPosX) / 100) * containerWidth;
            const deltaY = ((pctY - mr.offsetY - mr.startPosY) / 100) * pageHeight;
            mr.element.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
            mr.rafId = 0;
          });
        }
        return;
      }

      // Handle ghost position for dragging new field from sidebar
      if (draggingType) {
        setGhostPos({ x: e.clientX, y: e.clientY });
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (resizingRef.current) {
        resizingRef.current = null;
        setIsResizing(false);
        return;
      }

      if (movingRef.current) {
        const mr = movingRef.current;
        cancelAnimationFrame(mr.rafId);
        mr.element.style.transform = '';
        mr.element.style.willChange = '';
        const pos = getCanvasPct(e);
        if (pos) {
          onFieldsChange(
            fields.map((f) =>
              f.id === mr.fieldId
                ? { ...f, posX: pos.pctX - mr.offsetX, posY: pos.pctY - mr.offsetY }
                : f
            )
          );
        }
        movingRef.current = null;
        setMovingField(null);
        return;
      }

      // Drop a new field from sidebar
      if (draggingType && canvasRef.current) {
        const pos = getCanvasPct(e);
        if (pos) {
          const fieldDef = FIELD_TYPES.find((f) => f.type === draggingType);
          if (fieldDef && containerWidth && pageHeight) {
            const widthPct = (fieldDef.width / containerWidth) * 100;
            const heightPct = (fieldDef.height / pageHeight) * 100;

            const newFieldId = crypto.randomUUID();
            const isSelfSigner = signers.find((s) => s.id === selectedSigner)?.isSelf;
            const isSignatureType = draggingType === "SIGNATURE" || draggingType === "INITIALS";

            let prefillValue: string | undefined;
            if (isSelfSigner && isSignatureType && savedSignature) {
              prefillValue = savedSignature;
            }

            const newField: PlacedField = {
              id: newFieldId,
              type: draggingType,
              signerId: selectedSigner,
              page: currentPage,
              posX: Math.max(0, Math.min(100 - widthPct, pos.pctX - widthPct / 2)),
              posY: Math.max(0, Math.min(100 - heightPct, pos.pctY - heightPct / 2)),
              width: widthPct,
              height: heightPct,
              value: prefillValue,
            };

            onFieldsChange([...fields, newField]);
            setSelectedField(newFieldId);

            if (isSelfSigner && isSignatureType && !savedSignature) {
              setPendingFieldId(newFieldId);
              setShowSignatureModal(true);
              setSignatureMode("draw");
              setTypedSignature("");
            }
          }
        }
        setDraggingType(null);
        setGhostPos(null);
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, containerWidth, pageHeight, fields, onFieldsChange, draggingType, getCanvasPct, zoom, selectedSigner, signers, savedSignature, currentPage]);

  // Canvas click - deselect field if clicking on empty area
  const handleCanvasClick = useCallback(
    (e: React.MouseEvent) => {
      if (!draggingType && !movingField) {
        setSelectedField(null);
      }
    },
    [draggingType, movingField]
  );

  function removeField(id: string) {
    onFieldsChange(fields.filter((f) => f.id !== id));
    if (selectedField === id) setSelectedField(null);
  }

  function startMoveField(
    e: React.MouseEvent,
    fieldId: string,
    fieldPctX: number,
    fieldPctY: number
  ) {
    e.stopPropagation();
    if (!canvasRef.current || !containerWidth || !pageHeight) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const style = getComputedStyle(canvasRef.current);
    const borderLeft = parseFloat(style.borderLeftWidth) || 0;
    const borderTop = parseFloat(style.borderTopWidth) || 0;
    const clickPctX = (((e.clientX - rect.left - borderLeft) / zoom) / containerWidth) * 100;
    const clickPctY = (((e.clientY - rect.top - borderTop) / zoom) / pageHeight) * 100;
    const element = e.currentTarget as HTMLElement;
    element.style.willChange = 'transform';
    movingRef.current = {
      fieldId,
      offsetX: clickPctX - fieldPctX,
      offsetY: clickPctY - fieldPctY,
      startPosX: fieldPctX,
      startPosY: fieldPctY,
      element,
      lastClientX: e.clientX,
      lastClientY: e.clientY,
      rafId: 0,
    };
    setMovingField(fieldId);
  }

  function startResize(e: React.MouseEvent, fieldId: string, handle: ResizeHandle) {
    e.stopPropagation();
    e.preventDefault();
    const field = fields.find((f) => f.id === fieldId);
    if (!field) return;

    resizingRef.current = {
      fieldId,
      handle,
      startMouseX: e.clientX,
      startMouseY: e.clientY,
      startPosX: field.posX,
      startPosY: field.posY,
      startWidth: field.width,
      startHeight: field.height,
    };
    setIsResizing(true);
  }

  function getSignerIndex(signerId: string) {
    return signers.findIndex((s) => s.id === signerId);
  }

  function getFieldLabel(type: string) {
    return FIELD_TYPES.find((f) => f.type === type)?.label || type;
  }

  function getFieldIcon(type: string) {
    return FIELD_TYPES.find((f) => f.type === type)?.icon || AlignLeft;
  }

  // Signature canvas helpers
  function initSignatureCanvas() {
    const canvas = signatureCanvasRef.current;
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
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  }

  function draw(e: React.MouseEvent<HTMLCanvasElement>) {
    if (!isDrawingRef.current) return;
    const canvas = signatureCanvasRef.current;
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

    if (signatureMode === "draw" && signatureCanvasRef.current) {
      signatureValue = signatureCanvasRef.current.toDataURL("image/png");
    } else if (signatureMode === "type" && typedSignature) {
      signatureValue = `typed:${typedSignature}`;
    }

    if (signatureValue && pendingFieldId) {
      setSavedSignature(signatureValue);
      // Update the pending field and any other self-signer signature fields without values
      const selfSigner = signers.find((s) => s.isSelf);
      onFieldsChange(
        fields.map((f) => {
          if (f.id === pendingFieldId) {
            return { ...f, value: signatureValue };
          }
          // Also fill other unfilled self-signer signature fields
          if (
            selfSigner &&
            f.signerId === selfSigner.id &&
            (f.type === "SIGNATURE" || f.type === "INITIALS") &&
            !f.value
          ) {
            return { ...f, value: signatureValue };
          }
          return f;
        })
      );
    }
    setShowSignatureModal(false);
    setPendingFieldId(null);
  }

  const currentPageFields = fields.filter((f) => f.page === currentPage);
  const stablePageKey = `page_${currentPage}`;

  return (
    <div className="flex gap-4">
      {/* Left sidebar */}
      <div className="w-56 flex-shrink-0 space-y-4">
        {/* Signer selector */}
        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Assigning fields to
          </p>
          <div className="space-y-1">
            {signers.map((signer, i) => (
              <button
                key={signer.id}
                onClick={() => setSelectedSigner(signer.id)}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-all",
                  selectedSigner === signer.id
                    ? `${SIGNER_BG_COLORS[i % SIGNER_BG_COLORS.length]} ${SIGNER_BORDER_COLORS[i % SIGNER_BORDER_COLORS.length]} border shadow-sm`
                    : "hover:bg-slate-50 border border-transparent"
                )}
              >
                <div
                  className={cn(
                    "h-3 w-3 rounded-full flex-shrink-0",
                    SIGNER_COLORS[i % SIGNER_COLORS.length]
                  )}
                />
                <span className={cn(
                  "truncate font-medium",
                  selectedSigner === signer.id
                    ? SIGNER_TEXT_COLORS[i % SIGNER_TEXT_COLORS.length]
                    : ""
                )}>
                  {signer.isSelf ? "Me (now)" : signer.name || `Signer ${i + 1}`}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Field types */}
        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Drag fields onto document
          </p>
          <div className="space-y-0.5">
            {FIELD_TYPES.map((field) => {
              const Icon = field.icon;
              return (
                <button
                  key={field.type}
                  onMouseDown={() => setDraggingType(field.type)}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-all hover:bg-slate-100 cursor-grab active:cursor-grabbing active:bg-slate-200 active:scale-[0.98]"
                >
                  <Icon className="h-4 w-4 text-slate-500" />
                  <span className="font-medium text-slate-700">{field.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Summary */}
        <div className="rounded-lg border bg-slate-50/50 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Fields placed
          </p>
          {signers.map((signer, i) => {
            const count = fields.filter((f) => f.signerId === signer.id).length;
            return (
              <div key={signer.id} className="flex items-center justify-between py-1 text-sm">
                <div className="flex items-center gap-2">
                  <div className={cn("h-2.5 w-2.5 rounded-full", SIGNER_COLORS[i % SIGNER_COLORS.length])} />
                  <span className="truncate text-slate-600">
                    {signer.isSelf ? "Me (now)" : signer.name || `Signer ${i + 1}`}
                  </span>
                </div>
                <span className="font-medium text-slate-500">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* PDF Canvas area */}
      <div className="flex-1">
        {/* Toolbar: page nav + zoom */}
        <div className="mb-3 flex items-center justify-between">
          {/* Page navigation */}
          <div className="flex items-center gap-2">
            {numPages > 1 && (
              <>
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border bg-white text-sm transition-colors hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-sm font-medium text-muted-foreground">
                  Page {currentPage} of {numPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(numPages, p + 1))}
                  disabled={currentPage === numPages}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border bg-white text-sm transition-colors hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </>
            )}
          </div>

          {/* Zoom controls */}
          <div className="flex items-center gap-1.5 rounded-lg border bg-white px-2 py-1 shadow-sm">
            <button
              onClick={() => setZoom((z) => Math.max(ZOOM_MIN, z - ZOOM_STEP))}
              disabled={zoom <= ZOOM_MIN}
              className="flex h-7 w-7 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
              title="Zoom out"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <span className="min-w-[3rem] text-center text-xs font-medium text-slate-600">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.min(ZOOM_MAX, z + ZOOM_STEP))}
              disabled={zoom >= ZOOM_MAX}
              className="flex h-7 w-7 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
              title="Zoom in"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            {zoom !== 1 && (
              <button
                onClick={() => setZoom(1)}
                className="flex h-7 w-7 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
                title="Reset zoom"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className="overflow-auto rounded-xl" style={{ maxHeight: "75vh" }}>
        <div style={{ height: zoom !== 1 && pageHeight ? `${pageHeight * zoom}px` : undefined }}>
        <div
          ref={canvasRef}
          onClick={handleCanvasClick}
          className={cn(
            "relative border-2 bg-white shadow-sm overflow-hidden transition-colors",
            draggingType || movingField
              ? "border-primary/50 cursor-crosshair"
              : "border-slate-200",
            zoom === 1 ? "rounded-xl" : ""
          )}
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: "top left",
            width: zoom !== 1 ? `${100 / zoom}%` : undefined,
          }}
        >
          {/* PDF rendering */}
          {!pdfSource ? (
            <div className="flex items-center justify-center" style={{ aspectRatio: "8.5/11" }}>
              <p className="text-muted-foreground">No document uploaded</p>
            </div>
          ) : (
            <div key={stablePageKey} className="page-flip" style={{ minHeight: pageHeight || undefined, aspectRatio: pageHeight ? undefined : "8.5/11" }}>
              {containerWidth > 0 && (
                <Document
                  file={pdfSource}
                  onLoadSuccess={({ numPages: n }) => setNumPages(n)}
                  loading={
                    <div className="flex items-center justify-center" style={{ aspectRatio: "8.5/11" }}>
                      <p className="text-muted-foreground">Loading PDF...</p>
                    </div>
                  }
                  error={
                    <div className="flex items-center justify-center" style={{ aspectRatio: "8.5/11" }}>
                      <p className="text-red-500">Failed to load PDF</p>
                    </div>
                  }
                >
                  <Page
                    pageNumber={currentPage}
                    width={stableWidth}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                  />
                </Document>
              )}
            </div>
          )}

          {/* Placed fields */}
          {currentPageFields.map((field) => {
            const signerIdx = getSignerIndex(field.signerId);
            const Icon = getFieldIcon(field.type);
            const isSelected = selectedField === field.id;
            const isSignatureType = field.type === "SIGNATURE" || field.type === "INITIALS";
            const hasSignaturePreview = isSignatureType && field.value;
            const signer = signers.find((s) => s.id === field.signerId);

            return (
              <div
                key={field.id}
                className={cn(
                  "absolute rounded border-2 text-xs font-medium shadow-sm select-none transition-shadow",
                  isSelected
                    ? "border-primary ring-2 ring-primary/20 z-20"
                    : cn(
                        SIGNER_BORDER_COLORS[signerIdx % SIGNER_BORDER_COLORS.length],
                        "z-10"
                      ),
                  SIGNER_BG_COLORS[signerIdx % SIGNER_BG_COLORS.length],
                  !isResizing && "cursor-move"
                )}
                style={{
                  left: `${field.posX}%`,
                  top: `${field.posY}%`,
                  width: `${field.width}%`,
                  height: `${field.height}%`,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedField(field.id);
                }}
                onMouseDown={(e) => {
                  if (isResizing) return;
                  setSelectedField(field.id);
                  startMoveField(e, field.id, field.posX, field.posY);
                }}
              >
                {/* Field content */}
                <div className="flex h-full items-center gap-1 overflow-hidden px-1.5">
                  {hasSignaturePreview ? (
                    field.value!.startsWith("typed:") ? (
                      <span className="w-full text-center italic text-sm truncate">
                        {field.value!.replace("typed:", "")}
                      </span>
                    ) : (
                      <img
                        src={field.value!}
                        alt="Signature"
                        className="h-full w-full object-contain"
                        draggable={false}
                      />
                    )
                  ) : (
                    <>
                      <Icon className="h-3 w-3 flex-shrink-0 opacity-60" />
                      <span className="truncate">
                        {getFieldLabel(field.type)}
                        {signer?.isSelf ? " (me)" : ""}
                      </span>
                    </>
                  )}
                </div>

                {/* Delete button - always visible on hover, always on selected */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeField(field.id);
                  }}
                  className={cn(
                    "absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white shadow transition-opacity",
                    isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                  )}
                  style={{ opacity: isSelected ? 1 : undefined }}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <Trash2 className="h-3 w-3" />
                </button>

                {/* Resize handles - visible when selected */}
                {isSelected && (
                  <>
                    {(["nw", "ne", "sw", "se"] as ResizeHandle[]).map((handle) => (
                      <div
                        key={handle}
                        className={cn(
                          "absolute h-3 w-3 rounded-full border-2 border-primary bg-white shadow-sm z-30",
                          handle === "nw" && "-left-1.5 -top-1.5 cursor-nw-resize",
                          handle === "ne" && "-right-1.5 -top-1.5 cursor-ne-resize",
                          handle === "sw" && "-left-1.5 -bottom-1.5 cursor-sw-resize",
                          handle === "se" && "-right-1.5 -bottom-1.5 cursor-se-resize"
                        )}
                        onMouseDown={(e) => startResize(e, field.id, handle)}
                      />
                    ))}
                  </>
                )}
              </div>
            );
          })}

          {/* Drop indicator */}
          {(draggingType || movingField) && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-primary/[0.02]">
              <p className="rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary backdrop-blur-sm">
                Drop field here
              </p>
            </div>
          )}
        </div>
        </div>
        </div>
      </div>

      {/* Signature Modal for "Me" signer */}
      {showSignatureModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="mb-1 text-lg font-semibold">Add your signature</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              This signature will be saved and applied to all your signature fields.
            </p>

            {/* Mode tabs */}
            <div className="mb-4 flex gap-1 rounded-lg bg-slate-100 p-1">
              {(["draw", "type"] as SignatureMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setSignatureMode(mode)}
                  className={cn(
                    "flex-1 rounded-md px-3 py-2 text-sm font-medium transition-all",
                    signatureMode === mode
                      ? "bg-white shadow-sm"
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
                    (signatureCanvasRef as React.MutableRefObject<HTMLCanvasElement | null>).current = el;
                    if (el) initSignatureCanvas();
                  }}
                  width={400}
                  height={150}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  className="w-full cursor-crosshair rounded-lg border-2 border-dashed border-slate-300 bg-slate-50/50"
                />
                <button
                  onClick={initSignatureCanvas}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
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
                  autoFocus
                />
                {typedSignature && (
                  <div className="flex h-20 items-center justify-center rounded-lg bg-slate-50 border text-2xl italic text-slate-700">
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
                onClick={() => {
                  setShowSignatureModal(false);
                  // Remove the pending field if no signature
                  if (pendingFieldId) {
                    onFieldsChange(fields.filter((f) => f.id !== pendingFieldId));
                    setPendingFieldId(null);
                  }
                }}
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

      {/* Ghost element following cursor while dragging new field from sidebar */}
      {draggingType && ghostPos && (
        <div
          className="pointer-events-none fixed z-50 rounded border-2 border-primary/60 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary shadow-lg backdrop-blur-sm"
          style={{
            left: ghostPos.x + 12,
            top: ghostPos.y + 12,
          }}
        >
          {getFieldLabel(draggingType)}
        </div>
      )}
    </div>
  );
}
