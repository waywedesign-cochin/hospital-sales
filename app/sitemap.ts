import { MetadataRoute } from "next";

const BASE_URL = "https://www.novesse.in";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    // ── Core pages ──────────────────────────────────────────
    { url: `${BASE_URL}/`, changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE_URL}/about`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/blog`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/contact`, changeFrequency: "monthly", priority: 0.7 },

    // ── Skin Treatments ─────────────────────────────────────
    {
      url: `${BASE_URL}/treatments/acne`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/treatments/facial-rejuvenation`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/treatments/laser-toning`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/treatments/laser-hair-reduction`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/treatments/hollywood-peel`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/treatments/chemical-peels`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/treatments/hydrafacial`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/treatments/vampire-facial`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/treatments/under-eye`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/treatments/anti-ageing`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/treatments/hifu`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/treatments/skin-tightening`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/treatments/skin-boosters`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/treatments/thread-lift`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/treatments/fillers`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/treatments/botox`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/treatments/personalized-skin-rejuvenation`,
      changeFrequency: "monthly",
      priority: 0.7,
    },

    // ── Hair Treatments ─────────────────────────────────────
    {
      url: `${BASE_URL}/treatments/alopecia`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/treatments/pattern-hair-loss`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/treatments/laser-hair-remove`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/treatments/exosome`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/treatments/mesotherapy`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/treatments/hair-spa`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/treatments/gfc`,
      changeFrequency: "monthly",
      priority: 0.7,
    },

    // ── Dermatology Services ────────────────────────────────
    {
      url: `${BASE_URL}/dermatology/general-dermatology`,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/dermatology/paediatric`,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/dermatology/allergy`,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/dermatology/mole-removal`,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/dermatology/skin-tag`,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/dermatology/keloid`,
      changeFrequency: "monthly",
      priority: 0.6,
    },

    // ── Wellness & Advanced Care ────────────────────────────
    {
      url: `${BASE_URL}/wellness/iv-therapy`,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/wellness/antioxidant`,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/wellness/signature-wellness`,
      changeFrequency: "monthly",
      priority: 0.6,
    },

    // ── Concerns ────────────────────────────────────────────
    {
      url: `${BASE_URL}/concerns/acne`,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/concerns/melasma`,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/concerns/uneven-tone`,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/concerns/pigmentation`,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/concerns/sagging-skin`,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/concerns/stretch-marks`,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/concerns/enlarged-pores`,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/concerns/ageing-skin`,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/concerns/scars`,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/concerns/dark-circles`,
      changeFrequency: "monthly",
      priority: 0.6,
    },

    // ── Blog posts (add new ones here as you publish) ───────
    {
      url: `${BASE_URL}/blog/non-surgical-face-lifts`,
      changeFrequency: "yearly",
      priority: 0.5,
    },
  ];
}
