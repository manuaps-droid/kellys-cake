"use client";

import { useState } from "react";

export function useImageUpload() {
  const [uploading, setUploading] =
    useState(false);

  async function upload<T>(
    callback: () => Promise<T>
  ) {
    setUploading(true);

    try {
      return await callback();
    } finally {
      setUploading(false);
    }
  }

  return {
    uploading,
    upload,
  };
}