import type { AvatarOption } from "@3dworld/contracts";

/**
 * Body archetypes shared by players and residents. Residents pick the closest
 * archetype from their `look`; bespoke resident models can replace these later
 * without touching the schema.
 *
 * `model` paths are served by apps/web from /avatars/. Until the realistic
 * rigged bodies land (realism track), the web app renders a stand-in figure
 * for any model it cannot load.
 */
const body = (
  id: string,
  label: string,
  presentation: AvatarOption["presentation"],
): AvatarOption => ({
  id,
  label,
  presentation,
  model: `/avatars/${id}.glb`,
  credit: "3D World stand-in",
});

export const AVATARS: AvatarOption[] = [
  body("body-f-young", "Young woman", "feminine"),
  body("body-f-adult", "Woman", "feminine"),
  body("body-f-senior", "Older woman", "feminine"),
  body("body-m-young", "Young man", "masculine"),
  body("body-m-adult", "Man", "masculine"),
  body("body-m-senior", "Older man", "masculine"),
  body("body-n-adult", "Androgynous adult", "neutral"),
];

export const DEFAULT_AVATAR_ID = "body-n-adult";
