import * as z from "zod";

export const songFormSchema = z.object({
  artist: z.string().min(1, "Artist name is required"),
  title: z.string().min(1, "Song title is required"),
});

export type SongFormValues = z.infer<typeof songFormSchema>;

export type SongAnalysisResult = {
  artist: string;
  title: string;
  summary: string;
  countries: string[];
};
