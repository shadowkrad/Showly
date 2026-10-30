"use client";

import React from "react";
import Link from "next/link";
import { TaaaacAddonId } from "@/lib/taaaac-client";

interface AddonModuleGuardProps {
  addonId: TaaaacAddonId;
  title: string;
  description: string;
  icon: string;
  children: React.ReactNode;
}

export default function AddonModuleGuard({
  addonId,
  title,
  description,
  icon,
  children,
}: AddonModuleGuardProps) {
  // Negli showroom Showly abilitato di default o espandibile
  return <>{children}</>;
}
