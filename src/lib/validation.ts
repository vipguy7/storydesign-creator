import { z } from "zod";
import { PostType, PostTone } from "./constants";

// Form validation schema
export const postGeneratorSchema = z.object({
  postType: z.nativeEnum(PostType, {
    errorMap: () => ({ message: "ပို့စ်အမျိုးအစား ရွေးချယ်ပါ" }),
  }),
  postTone: z.nativeEnum(PostTone, {
    errorMap: () => ({ message: "စာရေးပုံစံ ရွေးချယ်ပါ" }),
  }),
  products: z
    .array(z.string())
    .min(1, "အနည်းဆုံး ထုတ်ကုန် (၁)ခု ရွေးချယ်ပါ")
    .max(10, "ထုတ်ကုန် အများဆုံး (၁၀)ခု သာ ရွေးချယ်နိုင်ပါသည်"),
  additionalInfo: z
    .string()
    .max(1000, "အချက်အလက်သည် စာလုံး ၁၀၀၀ မပိုရပါ")
    .optional(),
});

export type PostGeneratorInput = z.infer<typeof postGeneratorSchema>;

// Validate user input
export const validatePostInput = (data: unknown) => {
  return postGeneratorSchema.safeParse(data);
};
