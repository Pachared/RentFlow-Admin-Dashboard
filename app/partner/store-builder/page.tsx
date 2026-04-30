"use client";

import * as React from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Collapse,
  CircularProgress,
  Snackbar,
  Stack,
  Typography,
} from "@mui/material";
import { storefrontService } from "@/src/services/storefront/storefront.service";
import type {
  StorefrontBlock,
  StorefrontPage,
} from "@/src/services/storefront/storefront.types";
import {
  DEFAULT_STOREFRONT_THEME,
  cloneDefaultStorefrontBlocks,
} from "@/src/constants/storefront-defaults";
import { tenantService } from "@/src/services/tenant/tenant.service";
import type { PartnerTenant } from "@/src/services/tenant/tenant.types";

const emptyTheme: NonNullable<StorefrontPage["theme"]> = {
  ...DEFAULT_STOREFRONT_THEME,
};

const blockTemplates: Array<{
  label: string;
  helper: string;
  block: StorefrontBlock;
}> = [
  {
    label: "ส่วนหลัก",
    helper: "หัวข้อใหญ่บนหน้าแรก",
    block: {
      type: "hero",
      subtitle: "ข้อเสนอพิเศษของร้าน",
      title: "เช่ารถง่าย พร้อมเดินทางในไม่กี่คลิก",
      description: "แนะนำจุดเด่นของร้าน โปรโมชั่น หรือบริการหลักที่อยากให้ลูกค้าเห็นก่อน",
      buttonLabel: "ดูรถทั้งหมด",
      href: "/cars",
      tone: "dark",
      align: "center",
    },
  },
  {
    label: "โปรโมชัน",
    helper: "ประกาศดีลหรือแคมเปญ",
    block: {
      type: "promo",
      subtitle: "โปรโมชัน",
      title: "ส่วนลดพิเศษสำหรับการจองล่วงหน้า",
      description: "ใช้บล็อกนี้เพื่อสื่อสารโปรโมชัน เงื่อนไข หรือช่วงเวลาที่ลูกค้าควรรีบจอง",
      buttonLabel: "จองตอนนี้",
      href: "/cars",
      tone: "highlight",
      align: "left",
    },
  },
  {
    label: "จุดเด่น",
    helper: "บริการหรือข้อดีของร้าน",
    block: {
      type: "feature",
      subtitle: "จุดเด่นของร้าน",
      title: "รถพร้อมใช้งาน ดูแลก่อนส่งมอบทุกคัน",
      description: "เล่าข้อดีของร้าน เช่น รถใหม่ บริการรับส่ง เอกสารชัดเจน หรือทีมดูแลลูกค้า",
      buttonLabel: "ดูรถทั้งหมด",
      href: "/cars",
      tone: "default",
      align: "left",
    },
  },
  {
    label: "ขั้นตอน",
    helper: "อธิบายวิธีจอง",
    block: {
      type: "steps",
      subtitle: "ขั้นตอนการจอง",
      title: "เลือกวัน เลือกรถ แล้วส่งคำขอจอง",
      description: "อธิบายขั้นตอนสั้น ๆ ให้ลูกค้าเข้าใจว่าต้องทำอะไรต่อหลังเข้าหน้าร้าน",
      buttonLabel: "เริ่มจองรถ",
      href: "/cars",
      tone: "default",
      align: "left",
    },
  },
  {
    label: "รีวิว",
    helper: "เสียงจากลูกค้า",
    block: {
      type: "testimonial",
      subtitle: "เสียงจากลูกค้า",
      title: "บริการดี รถสะอาด และรับรถได้ตรงเวลา",
      description: "ใส่ข้อความรีวิวหรือคำชมสั้น ๆ เพื่อเพิ่มความมั่นใจให้ลูกค้าใหม่",
      buttonLabel: "อ่านรีวิวทั้งหมด",
      href: "/reviews",
      tone: "default",
      align: "left",
    },
  },
  {
    label: "FAQ",
    helper: "ตอบคำถามที่พบบ่อย",
    block: {
      type: "faq",
      subtitle: "คำถามที่พบบ่อย",
      title: "ต้องใช้เอกสารอะไรในการรับรถ?",
      description: "ใส่คำตอบสั้น ๆ เช่น บัตรประชาชน ใบขับขี่ และหลักฐานการจอง",
      buttonLabel: "ติดต่อร้าน",
      href: "/contact",
      tone: "default",
      align: "left",
    },
  },
  {
    label: "CTA",
    helper: "ปุ่มพาลูกค้าไปหน้าสำคัญ",
    block: {
      type: "cta",
      subtitle: "พร้อมออกเดินทาง",
      title: "เลือกคันที่ใช่ แล้วจองกับร้านได้เลย",
      description: "ใช้บล็อกนี้เพื่อพาลูกค้าไปหน้ารถทั้งหมด ติดต่อร้าน หรือหน้าโปรโมชัน",
      buttonLabel: "ดูรถทั้งหมด",
      href: "/cars",
      tone: "dark",
      align: "center",
    },
  },
];

function createBlockFromTemplate(template: StorefrontBlock): StorefrontBlock {
  const randomId =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return {
    ...template,
    id: `block-${randomId}`,
  };
}

function normalizeStorefrontBlocksForSave(blocks: StorefrontBlock[]) {
  return blocks.map((block, index) => ({
    ...block,
    id: block.id || `block-${index + 1}`,
    buttonLabel: block.buttonLabel?.trim() || "ดูเพิ่มเติม",
    href: block.href?.trim() || "/cars",
  }));
}

function isUploadedFile(value: unknown): value is File {
  if (typeof File !== "undefined" && value instanceof File) {
    return true;
  }

  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as File;
  return (
    typeof candidate.name === "string" &&
    typeof candidate.type === "string" &&
    typeof candidate.size === "number" &&
    typeof candidate.arrayBuffer === "function"
  );
}

function isSupportedImageFile(file: File) {
  return (
    file.type.startsWith("image/") ||
    /\.(png|jpe?g|webp|gif)$/i.test(file.name)
  );
}

type BuilderImagePayload = {
  name?: string;
  type?: string;
  size?: number;
  dataUrl?: string;
};

function isBuilderImagePayload(value: unknown): value is BuilderImagePayload {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as BuilderImagePayload).dataUrl === "string" &&
    (value as BuilderImagePayload).dataUrl!.startsWith("data:image/")
  );
}

async function fileFromBuilderImagePayload(image: BuilderImagePayload) {
  const response = await fetch(image.dataUrl || "");
  const blob = await response.blob();
  const fileName = image.name?.trim() || `storefront-image-${Date.now()}`;
  const fileType = image.type?.trim() || blob.type || "image/png";
  return new File([blob], fileName, { type: fileType });
}

const STOREFRONT_PREVIEW_ORIGIN =
  process.env.NEXT_PUBLIC_STOREFRONT_PREVIEW_ORIGIN ||
  process.env.NEXT_PUBLIC_RENTFLOW_STOREFRONT_ORIGIN ||
  process.env.NEXT_PUBLIC_STOREFRONT_URL ||
  "";
const LOCAL_STOREFRONT_PORT = process.env.NEXT_PUBLIC_STOREFRONT_PORT || "3002";
const RENTFLOW_ROOT_DOMAIN =
  process.env.NEXT_PUBLIC_RENTFLOW_ROOT_DOMAIN || "rentflow.com";

function fillStorefrontPreviewTemplate(value: string, slug: string) {
  return value
    .trim()
    .replace(/\{shop\}/g, slug)
    .replace(/\{slug\}/g, slug)
    .replace(/__SHOP__/g, slug);
}

function buildStorefrontPreviewHref(tenant: PartnerTenant | null) {
  const slug = tenant?.domainSlug?.trim().toLowerCase();
  if (!slug) return "";

  const configuredPreview = fillStorefrontPreviewTemplate(
    STOREFRONT_PREVIEW_ORIGIN,
    slug
  );

  if (configuredPreview) {
    try {
      const url = new URL(configuredPreview);
      const isLocalHost =
        url.hostname === "localhost" ||
        url.hostname === "127.0.0.1" ||
        url.hostname.endsWith(".localhost");

      if (
        isLocalHost &&
        !STOREFRONT_PREVIEW_ORIGIN.includes("{shop}") &&
        !STOREFRONT_PREVIEW_ORIGIN.includes("{slug}") &&
        !STOREFRONT_PREVIEW_ORIGIN.includes("__SHOP__")
      ) {
        url.hostname = `${slug}.localhost`;
      }

      return url.toString();
    } catch {
      return configuredPreview;
    }
  }

  if (typeof window !== "undefined") {
    const host = window.location.hostname.toLowerCase();
    const isLocalHost =
      host === "localhost" ||
      host === "127.0.0.1" ||
      host.endsWith(".localhost");

    if (isLocalHost) {
      return `${window.location.protocol}//${slug}.localhost:${LOCAL_STOREFRONT_PORT}/`;
    }
  }

  const publicDomain = tenant?.publicDomain
    ? tenant.publicDomain.replace(/^https?:\/\//, "").replace(/\/$/, "")
    : `${slug}.${RENTFLOW_ROOT_DOMAIN}`;
  return `https://${publicDomain}/`;
}

function buildBuilderPreviewHref(previewHref: string) {
  if (!previewHref) return "";

  try {
    const url = new URL(previewHref);
    url.searchParams.set("rfBuilder", "1");
    return url.toString();
  } catch {
    const separator = previewHref.includes("?") ? "&" : "?";
    return `${previewHref}${separator}rfBuilder=1`;
  }
}

function StorefrontFramePreview({
  previewHref,
  publicHref,
  previewKey,
  isPublished,
  usingDefault,
  frameHeight,
  onRefresh,
  iframeRef,
  onFrameLoad,
}: {
  previewHref: string;
  publicHref: string;
  previewKey: number;
  isPublished: boolean;
  usingDefault: boolean;
  frameHeight: number;
  onRefresh: () => void;
  iframeRef: React.RefObject<HTMLIFrameElement | null>;
  onFrameLoad: () => void;
}) {

  return (
    <Box className="grid gap-4 rounded-[30px] bg-slate-50 p-5">
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        className="items-start justify-between"
      >
        <Box>
          <Typography className="text-xl font-black text-slate-950">
            พรีวิวหน้าร้านจริง
          </Typography>
          <Typography className="mt-1 text-sm text-slate-500">
            แสดง RentFlow-Web-App จริงแบบเดียวกับที่ลูกค้าเห็น คลิกข้อความบนพรีวิวเพื่อแก้ไขได้ทันที
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} className="flex-wrap">
          {usingDefault ? (
            <Chip
              label="โครงหน้าเว็บหลัก"
              className="bg-blue-50! text-sm! font-bold! text-blue-700!"
            />
          ) : null}
          <Chip
            label={isPublished ? "เผยแพร่" : "ยังไม่เผยแพร่"}
            className={
              isPublished
                ? "bg-emerald-50! text-sm! font-bold! text-emerald-700!"
                : "bg-amber-50! text-sm! font-bold! text-amber-700!"
            }
          />
          {previewHref ? (
            <>
              <Button
                variant="outlined"
                onClick={onRefresh}
                className="h-10 rounded-full! px-5! text-sm! font-bold!"
              >
                โหลดพรีวิวใหม่
              </Button>
              <Button
                component="a"
                href={publicHref || previewHref}
                target="_blank"
                rel="noreferrer"
                variant="contained"
                className="h-10 rounded-full! bg-slate-950! px-5! text-sm! font-bold!"
              >
                เปิดหน้าร้านจริง
              </Button>
            </>
          ) : null}
        </Stack>
      </Stack>

      {previewHref ? (
        <Box className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.12)]">
          <Box className="flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4">
            <Stack direction="row" spacing={1}>
              <Box className="h-3 w-3 rounded-full bg-red-400" />
              <Box className="h-3 w-3 rounded-full bg-amber-400" />
              <Box className="h-3 w-3 rounded-full bg-emerald-400" />
            </Stack>
            <Typography className="truncate px-4 text-sm font-bold text-slate-500">
              {publicHref || previewHref}
            </Typography>
            <Box className="h-3 w-12 rounded-full bg-slate-100" />
          </Box>
          <iframe
            ref={iframeRef}
            key={previewKey}
            title="พรีวิวหน้าร้านจริง"
            src={previewHref}
            onLoad={onFrameLoad}
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
            scrolling="no"
            className="w-full border-0 bg-white transition-[height] duration-300 ease-out"
            style={{ height: `${frameHeight}px` }}
          />
        </Box>
      ) : (
        <Box className="rounded-[28px] bg-white p-8 text-center shadow-sm">
          <Typography className="text-lg font-black text-slate-950">
            ยังไม่พบโดเมนร้านสำหรับพรีวิว
          </Typography>
          <Typography className="mx-auto mt-2 max-w-xl text-sm text-slate-500">
            ตั้งค่าชื่อร้านและโดเมนก่อน จากนั้นระบบจะแสดงหน้าร้านจริงตรงนี้ให้ทันที
          </Typography>
        </Box>
      )}
    </Box>
  );
}

function StorefrontTemplatePicker({
  open,
  pickerRef,
  onSelect,
}: {
  open: boolean;
  pickerRef: React.RefObject<HTMLDivElement | null>;
  onSelect: (template: StorefrontBlock) => void;
}) {
  return (
    <Collapse in={open} timeout={320} unmountOnExit>
      <Box
        ref={pickerRef}
        className="scroll-mt-28 rounded-[30px] bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)]"
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          className="items-start justify-between md:items-end"
        >
          <Box>
            <Typography className="text-xl font-black text-slate-950">
              เลือกเทมเพลตส่วนเนื้อหา
            </Typography>
            <Typography className="mt-1 text-sm text-slate-500">
              เลือกแบบที่ใกล้กับสิ่งที่ต้องการ แล้วค่อยแก้ข้อความและรูปในพรีวิวได้ทันที
            </Typography>
          </Box>
          <Chip
            label="เลือก 1 แบบเพื่อเพิ่มลงหน้าร้าน"
            className="bg-blue-50! text-sm! font-bold! text-blue-700!"
          />
        </Stack>

        <Box className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {blockTemplates.map((template) => (
            <Button
              key={template.label}
              onClick={() => onSelect(template.block)}
              className="min-h-[138px]! items-start! justify-start! rounded-[26px]! border border-slate-200! bg-slate-50! p-5! text-left! normal-case! text-slate-950! shadow-none! transition-all hover:-translate-y-0.5 hover:bg-white!"
            >
              <Box>
                <Typography className="text-base font-black text-slate-950">
                  {template.label}
                </Typography>
                <Typography className="mt-2 text-sm font-normal leading-6 text-slate-500">
                  {template.helper}
                </Typography>
                <Typography className="mt-4 text-xs font-bold text-blue-700">
                  เพิ่มส่วนนี้
                </Typography>
              </Box>
            </Button>
          ))}
        </Box>
      </Box>
    </Collapse>
  );
}

export default function Page() {
  const iframeRef = React.useRef<HTMLIFrameElement | null>(null);
  const templatePickerRef = React.useRef<HTMLDivElement | null>(null);
  const blocksRef = React.useRef<StorefrontBlock[]>([]);
  const [blocks, setBlocks] = React.useState<StorefrontBlock[]>([]);
  const [theme, setTheme] =
    React.useState<NonNullable<StorefrontPage["theme"]>>(emptyTheme);
  const [isPublished, setIsPublished] = React.useState(true);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const [usingDefault, setUsingDefault] = React.useState(false);
  const [tenant, setTenant] = React.useState<PartnerTenant | null>(null);
  const [previewKey, setPreviewKey] = React.useState(0);
  const [frameHeight, setFrameHeight] = React.useState(1200);
  const [showTemplatePicker, setShowTemplatePicker] = React.useState(false);
  const previewHref = React.useMemo(
    () => buildStorefrontPreviewHref(tenant),
    [tenant]
  );
  const builderPreviewHref = React.useMemo(
    () => buildBuilderPreviewHref(previewHref),
    [previewHref]
  );

  React.useEffect(() => {
    blocksRef.current = blocks;
  }, [blocks]);

  const postDraftToFrame = React.useCallback(() => {
    iframeRef.current?.contentWindow?.postMessage(
      {
        type: "rentflow:builder:draft",
        blocks,
        theme,
        isPublished,
      },
      "*"
    );
  }, [blocks, isPublished, theme]);

  React.useEffect(() => {
    let cancelled = false;

    async function loadPage() {
      const [pageResult, tenantResult] = await Promise.allSettled([
        storefrontService.getHomePage(),
        tenantService.getMyTenant(),
      ]);

      if (cancelled) return;

      if (pageResult.status === "fulfilled") {
        const page = pageResult.value;
        const hasSavedPage = Boolean(page.id);
        setUsingDefault(!hasSavedPage);
        setBlocks(
          hasSavedPage ? page.blocks || [] : cloneDefaultStorefrontBlocks()
        );
        setTheme({
          ...emptyTheme,
          ...(page.theme || {}),
        });
        setIsPublished(page.isPublished ?? true);
      } else {
        setBlocks(cloneDefaultStorefrontBlocks());
        setTheme(emptyTheme);
        setIsPublished(true);
        setUsingDefault(true);
      }

      if (tenantResult.status === "fulfilled") {
        setTenant(tenantResult.value);
      }

      setLoading(false);
    }

    loadPage();

    return () => {
      cancelled = true;
    };
  }, []);

  React.useEffect(() => {
    postDraftToFrame();
  }, [postDraftToFrame, previewKey]);

  const scrollToTemplatePicker = React.useCallback(() => {
    setShowTemplatePicker(true);
    window.setTimeout(() => {
      window.requestAnimationFrame(() => {
        templatePickerRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    }, 80);
  }, []);

  const addBlock = React.useCallback((template: StorefrontBlock) => {
    setUsingDefault(false);
    setBlocks((current) => [...current, createBlockFromTemplate(template)]);
    setShowTemplatePicker(false);
    setMessage("เพิ่มส่วนเนื้อหาแล้ว แก้ไขต่อได้ในพรีวิว");
  }, []);

  const moveBlock = React.useCallback((fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return;
    setUsingDefault(false);
    setBlocks((current) => {
      if (fromIndex >= current.length || toIndex >= current.length) {
        return current;
      }
      const next = [...current];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  }, []);

  const uploadBlockImage = React.useCallback(
    async (index: number, file: File) => {
      if (!isSupportedImageFile(file)) {
        setMessage("รองรับเฉพาะไฟล์รูปภาพเท่านั้น");
        return;
      }

      if (!blocksRef.current[index]) {
        setMessage("ไม่พบส่วนเนื้อหาที่ต้องการใส่รูป");
        return;
      }

      try {
        const uploaded = await storefrontService.uploadBlockImage(file);
        const nextBlocks = blocksRef.current.map((block, blockIndex) =>
          blockIndex === index
            ? {
                ...block,
                imageUrl: uploaded.imageUrl,
                imageAlt: block.imageAlt || block.title || "รูปภาพหน้าร้าน",
              }
            : block
        );

        blocksRef.current = nextBlocks;
        setUsingDefault(false);
        setBlocks(nextBlocks);

        await storefrontService.saveHomePage({
          blocks: normalizeStorefrontBlocksForSave(nextBlocks),
          theme,
          isPublished,
        });

        setPreviewKey((current) => current + 1);
        setMessage("อัปโหลดและบันทึกรูปภาพสำเร็จ");
      } catch (error: unknown) {
        setMessage(
          error instanceof Error ? error.message : "อัปโหลดรูปภาพไม่สำเร็จ"
        );
      }
    },
    [isPublished, theme]
  );

  React.useEffect(() => {
    function handleBuilderMessage(event: MessageEvent) {
      if (event.source !== iframeRef.current?.contentWindow) return;

      const data = event.data as
        | {
            type?: string;
            index?: number;
            patch?: Partial<StorefrontBlock>;
            height?: number;
            file?: File;
            image?: BuilderImagePayload;
          }
        | undefined;

      if (!data?.type?.startsWith("rentflow:builder:")) return;

      if (data.type === "rentflow:builder:ready") {
        postDraftToFrame();
        return;
      }

      if (
        data.type === "rentflow:builder:height" &&
        typeof data.height === "number"
      ) {
        setFrameHeight(Math.max(900, Math.ceil(data.height)));
        return;
      }

      if (
        data.type === "rentflow:builder:update-block" &&
        typeof data.index === "number" &&
        data.patch
      ) {
        setUsingDefault(false);
        setBlocks((current) =>
          current.map((block, blockIndex) =>
            blockIndex === data.index ? { ...block, ...data.patch } : block
          )
        );
        return;
      }

      if (data.type === "rentflow:builder:add") {
        scrollToTemplatePicker();
        return;
      }

      if (
        data.type === "rentflow:builder:upload-image" &&
        typeof data.index === "number"
      ) {
        if (isBuilderImagePayload(data.image)) {
          void fileFromBuilderImagePayload(data.image)
            .then((file) => uploadBlockImage(data.index as number, file))
            .catch(() => setMessage("ไม่สามารถอ่านไฟล์รูปภาพได้"));
          return;
        }

        if (!isUploadedFile(data.file)) {
          setMessage("ไม่พบไฟล์รูปภาพที่ต้องการอัปโหลด");
          return;
        }

        void uploadBlockImage(data.index, data.file);
        return;
      }

      if (data.type === "rentflow:builder:delete" && typeof data.index === "number") {
        setUsingDefault(false);
        setBlocks((current) =>
          current.filter((_, blockIndex) => blockIndex !== data.index)
        );
        return;
      }

      if (
        (data.type === "rentflow:builder:move-up" ||
          data.type === "rentflow:builder:move-down") &&
        typeof data.index === "number"
      ) {
        const targetIndex =
          data.type === "rentflow:builder:move-up"
            ? data.index - 1
            : data.index + 1;
        moveBlock(data.index, targetIndex);
      }
    }

    window.addEventListener("message", handleBuilderMessage);
    return () => window.removeEventListener("message", handleBuilderMessage);
  }, [moveBlock, postDraftToFrame, scrollToTemplatePicker, uploadBlockImage]);

  async function save() {
    setUsingDefault(false);
    setSaving(true);
    try {
      await storefrontService.saveHomePage({
        blocks: normalizeStorefrontBlocksForSave(blocks),
        theme,
        isPublished,
      });
      setPreviewKey((current) => current + 1);
      setMessage("บันทึกหน้าเว็บเรียบร้อยแล้ว");
    } catch (error: unknown) {
      setMessage(error instanceof Error ? error.message : "บันทึกหน้าเว็บไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  }

  function resetToDefault() {
    setUsingDefault(true);
    setBlocks(cloneDefaultStorefrontBlocks());
    setTheme(emptyTheme);
    setIsPublished(true);
  }

  return (
    <Box className="partner-page">
      <Box className="sticky top-0 z-20 mb-5 rounded-[30px] bg-white/90 p-4 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl">
        <Stack
          direction={{ xs: "column", lg: "row" }}
          spacing={2}
          className="items-start justify-between lg:items-center"
        >
          <Box className="min-w-0">
            <Typography className="partner-page-title">
              จัดหน้าเว็บร้าน
            </Typography>
            <Typography className="partner-page-subtitle">
              แก้ข้อความบนหน้าพรีวิวได้โดยตรง คลิกหัวข้อ คำอธิบาย หรือปุ่มในหน้าพรีวิวแล้วพิมพ์ได้เลย
            </Typography>
          </Box>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.25}
            className="w-full sm:w-auto"
          >
            <Button
              variant="outlined"
              onClick={scrollToTemplatePicker}
              className="h-11 rounded-full! px-5! text-sm! font-bold! max-sm:w-full"
            >
              เพิ่มส่วนเนื้อหา
            </Button>
            <Button
              variant="outlined"
              onClick={resetToDefault}
              className="h-11 rounded-full! px-5! text-sm! font-bold! max-sm:w-full"
            >
              คืนค่าเริ่มต้นของหน้าเว็บ
            </Button>
            <Button
              variant="contained"
              onClick={save}
              disabled={saving}
              className="h-11 rounded-full! bg-slate-950! px-7! text-sm! font-bold! max-sm:w-full"
            >
              {saving ? "กำลังบันทึก" : "บันทึกหน้าเว็บ"}
            </Button>
          </Stack>
        </Stack>
      </Box>

      {loading ? (
        <Card elevation={0} className="partner-card rounded-[34px]!">
          <CardContent>
            <Box className="flex min-h-[320px] items-center justify-center">
              <CircularProgress />
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Box className="grid gap-4">
          <StorefrontTemplatePicker
            open={showTemplatePicker}
            pickerRef={templatePickerRef}
            onSelect={addBlock}
          />

          <StorefrontFramePreview
            previewHref={builderPreviewHref}
            publicHref={previewHref}
            previewKey={previewKey}
            isPublished={isPublished}
            usingDefault={usingDefault}
            frameHeight={frameHeight}
            onRefresh={() => setPreviewKey((current) => current + 1)}
            iframeRef={iframeRef}
            onFrameLoad={postDraftToFrame}
          />

          <Box className="rounded-[26px] bg-white p-4 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={1.5}
              className="items-start justify-between md:items-center"
            >
              <Box>
                <Typography className="text-base font-black text-slate-950">
                  วิธีแก้ไข
                </Typography>
                <Typography className="mt-1 text-sm text-slate-500">
                  คลิกข้อความบนพรีวิวเพื่อแก้ไข กดปุ่มเพิ่มส่วนเนื้อหาในพรีวิวเพื่อเพิ่มส่วนใหม่ แล้วกดบันทึกหน้าเว็บเมื่อเรียบร้อย
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Box>
      )}

      <Snackbar
        open={Boolean(message)}
        autoHideDuration={2200}
        onClose={() => setMessage("")}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity={message.includes("ไม่สำเร็จ") ? "error" : "success"}>{message}</Alert>
      </Snackbar>
    </Box>
  );
}
