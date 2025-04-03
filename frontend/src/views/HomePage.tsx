import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

import { API_ROUTES } from "@/config/api";
import axiosInstance from "@/lib/axios";
import { SongFormValues, songFormSchema } from "@/lib/schema";
import { songService } from "@/services/song";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle,
  Clock,
  Loader2,
  Music,
  Search,
} from "lucide-react";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import useSWR from "swr";

const HomePage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [songId, setSongId] = useState<string | null>(null);
  const [showProcessingModal, setShowProcessingModal] = useState(false);
  const [startPolling, setStartPolling] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>(
    "Preparing analysis..."
  );

  const pollingAttemptsRef = useRef<number>(0);

  const form = useForm<SongFormValues>({
    resolver: zodResolver(songFormSchema),
    defaultValues: {
      artist: "",
      title: "",
    },
  });

  const statusFetcher = async (url: string) => {
    try {
      pollingAttemptsRef.current += 1;
      if (pollingAttemptsRef.current <= 3) {
        setStatusMessage("Preparing analysis...");
      } else {
        setStatusMessage("Analyzing lyrics...");
      }
      console.log("url: ", url);

      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        if (pollingAttemptsRef.current <= 5) {
          return { status: "pending", message: "Preparing analysis..." };
        }
      }
      throw error;
    }
  };

  const { data: songStatus } = useSWR(
    startPolling && songId ? `${API_ROUTES.songs.status(songId)}` : null,
    statusFetcher,
    {
      refreshInterval: 2000,
      revalidateOnFocus: false,
      dedupingInterval: 1000,
      errorRetryCount: 5,
      onSuccess: (data) => {
        if (data.status === "pending") {
          setStatusMessage("Waiting to begin analysis...");
        } else if (data.status === "processing") {
          setStatusMessage("Analyzing lyrics...");
        } else if (data.status === "completed") {
          setStatusMessage("Analysis complete!");
          setTimeout(() => {
            navigate(`/songs/${songId}`);
          }, 1500);
        } else if (data.status === "error") {
          setStatusMessage(data.message || "Analysis failed");
        }
      },
      onError: (err) => {
        console.error("Error polling song status:", err);

        if (pollingAttemptsRef.current > 5) {
          setStatusMessage(
            "Error checking status. The analysis may still be in progress."
          );
        }
      },
    }
  );

  const onSubmit = async (values: SongFormValues) => {
    setSongId(null);
    setStartPolling(false);
    pollingAttemptsRef.current = 0;

    setIsSubmitting(true);

    try {
      const result = await songService.createSong({
        artist: values.artist,
        title: values.title,
      });

      setSongId(result.id);

      if (result.status === "completed") {
        navigate(`/songs/${result.id}`);
        return;
      }
      if (result.status === "error") {
        toast.error(result.message || "Analysis failed");
        setIsSubmitting(false);
        return;
      }
      setShowProcessingModal(true);
      setTimeout(() => {
        setStartPolling(true);
      }, 1500);
      form.reset();
    } catch (error) {
      console.error("Error analyzing song: ", error);
      if (error instanceof Error) {
        if (
          error.message.includes("No lyrics found") ||
          error.message.includes("Song not found")
        ) {
          toast.error(
            `We couldn't find "${values.artist} - ${values.title}" in our database. Please check the spelling or try another song.`
          );
        } else {
          toast.error(error.message);
        }
      } else {
        toast.error("Failed to analyze the song. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const ProcessingModal = () => {
    const artist = form.getValues().artist;
    const title = form.getValues().title;
    const status = songStatus?.status || "pending";

    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-card border rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
          <div className="text-center space-y-4">
            <h3 className="text-xl font-semibold mb-2">
              {status === "completed"
                ? "Analysis Complete!"
                : status === "error"
                ? "Analysis Failed"
                : "Analyzing Song"}
            </h3>

            <div className="py-4">
              <p className="text-muted-foreground mb-1">
                {artist} - {title}
              </p>

              {status === "completed" ? (
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
              ) : status === "error" ? (
                <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
              ) : (
                <Loader2 className="h-12 w-12 text-primary mx-auto animate-spin" />
              )}
            </div>

            <div className="text-sm text-center">
              {status === "completed" ? (
                <p className="text-green-600 dark:text-green-400">
                  Redirecting to results...
                </p>
              ) : status === "error" ? (
                <p className="text-destructive">
                  {songStatus?.message || "Unable to analyze this song"}
                </p>
              ) : (
                <p className="text-muted-foreground">{statusMessage}</p>
              )}
            </div>

            {status === "error" && (
              <div className="space-y-2 mt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowProcessingModal(false);
                  }}
                >
                  Close
                </Button>
                {songId && (
                  <Button
                    variant="ghost"
                    className="ml-2"
                    onClick={() => navigate(`/songs/${songId}`)}
                  >
                    View Details
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {showProcessingModal && <ProcessingModal />}

      <div className=" mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Discover what songs are really about
          </h1>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            Get instant lyric summaries and discover country references in your
            favorite songs
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:gap-12">
          <Card className="overflow-hidden border-primary/10">
            <div className="h-2 bg-gradient-to-r from-primary to-primary/60"></div>
            <CardHeader className="space-y-1 pt-6">
              <CardTitle className="text-2xl flex items-center gap-2">
                <Search className="h-5 w-5 text-primary" />
                Analyze a Song
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Enter an artist and song title to analyze the lyrics
              </p>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-5"
                >
                  <FormField
                    control={form.control}
                    name="artist"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          Artist
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter artist name"
                            className="h-11 transition-colors focus-visible:ring-primary"
                            disabled={isSubmitting}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-left" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          Song Title
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter song title"
                            className="h-11 transition-colors focus-visible:ring-primary"
                            disabled={isSubmitting}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-left" />
                      </FormItem>
                    )}
                  />

                  <div className="flex flex-col space-y-2">
                    <Button
                      type="submit"
                      className="w-full h-11 text-sm font-medium transition-all"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center gap-2">
                          <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></span>
                          Submitting...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Search className="h-4 w-4" />
                          Analyze Song
                        </span>
                      )}
                    </Button>

                    <Button
                      variant="outline"
                      type="button"
                      asChild
                      className="w-full h-11"
                    >
                      <Link
                        to="/songs"
                        className="flex items-center justify-center gap-2"
                      >
                        <ArrowRight className="h-4 w-4" />
                        View All Analyses
                      </Link>
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-muted bg-muted/5">
            <div className="h-2 bg-gradient-to-r from-primary/60 to-primary"></div>
            <CardHeader className="space-y-1 pt-6">
              <CardTitle className="text-2xl flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                How It Works
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Understand the lyrics analysis process
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-primary font-semibold">1</span>
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Enter Song Details</h3>
                      <p className="text-sm text-muted-foreground">
                        Provide the artist name and song title you want to
                        analyze.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-primary font-semibold">2</span>
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Lyrics Processing</h3>
                      <p className="text-sm text-muted-foreground">
                        Our system fetches the lyrics and analyzes them using
                        advanced AI.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-primary font-semibold">3</span>
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">View Results</h3>
                      <p className="text-sm text-muted-foreground">
                        Get a concise summary and discover all countries
                        mentioned in the lyrics.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 bg-muted/30 rounded-lg p-4 border border-border">
                  <div className="flex items-center gap-3">
                    <Music className="h-8 w-8 text-muted-foreground/70" />
                    <div>
                      <h3 className="font-medium">Try Popular Songs</h3>
                      <p className="text-sm text-muted-foreground">
                        Not sure what to analyze? Try songs like "Imagine" by
                        John Lennon or "Bohemian Rhapsody" by Queen.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default HomePage;
