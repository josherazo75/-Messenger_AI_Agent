export type PackageBrandTier = "standard" | "upgraded";

export interface CameraPackage {
  id: string;
  name: string;
  cameraCount: number;
  startsAt: number;
  includesInstallation: boolean;
  includesCameras: boolean;
  brandTier: PackageBrandTier;
  brands: string[];
  positioning: string;
  goodFor: string[];
}

export const CAMERA_PACKAGES: CameraPackage[] = [
  {
    id: "standard-4",
    name: "Standard 4 Camera Package",
    cameraCount: 4,
    startsAt: 700,
    includesInstallation: true,
    includesCameras: true,
    brandTier: "standard",
    brands: ["Annke", "Zosi"],
    positioning: "Reliable budget-friendly option for most homes",
    goodFor: ["home", "small property", "basic coverage"],
  },
  {
    id: "reolink-4",
    name: "Reolink 4 Camera Package",
    cameraCount: 4,
    startsAt: 0,
    includesInstallation: true,
    includesCameras: true,
    brandTier: "upgraded",
    brands: ["Reolink"],
    positioning: "Upgraded option with cleaner app experience and stronger equipment",
    goodFor: ["home", "business", "customers asking for better quality"],
  },
];

export const PACKAGE_RULES = {
  standardFourCameraStartsAt: 700,
  standardFourCameraIncludesInstallation: true,
  standardFourCameraIncludesCameras: true,

  smallJobsPossible: true,
  smallJobsNote:
    "2-3 camera jobs may be possible depending on location, layout, and travel distance",

  twoCameraPossible: true,
  threeCameraPossible: true,

  estimatedReductionPerMissingCamera: 50,
  smallJobPriceDifferenceNote:
    "For 2 or 3 cameras, the price may be a little lower, but usually not by a huge amount because the work, travel, setup, and installation are still there.",

  largerJobsNeedCustomQuote: true,
} as const;