import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { usePolling } from "@/hooks/usePolling";
import { SongFormValues, songFormSchema } from "@/lib/schema";
import { songService } from "@/services/song";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  ArrowRight,
  Clock,
  Globe,
  Info,
  Music,
  Search,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router";

const HomePage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [songId, setSongId] = useState<string | null>(null);
  const [analysisComplete, setAnalysisComplete] = useState(false);

  const form = useForm<SongFormValues>({
    resolver: zodResolver(songFormSchema),
    defaultValues: {
      artist: "",
      title: "",
    },
  });

  const {
    data: songStatus,
    loading: pollingLoading,
    startPolling,
    stopPolling,
  } = usePolling({
    pollingFn: async () => {
      if (!songId) throw new Error("No song ID to check status");
      return await songService.getSongStatus(songId);
    },
    stopCondition: (data) => {
      return data.status === "completed" || data.status === "error";
    },
    onSuccess: () => {
      setAnalysisComplete(true);
    },
    enabled: false,
    interval: 2000,
  });

  const { data: songData, loading: songLoading } = usePolling({
    pollingFn: async () => {
      if (!songId) throw new Error("No song ID to fetch");
      return await songService.getSongById(songId);
    },
    stopCondition: () => true, // Only fetch once when needed
    enabled: false,
  });

  const onSubmit = async (values: SongFormValues) => {
    // Reset states
    setErrorMessage("");
    setSongId(null);
    setAnalysisComplete(false);
    stopPolling();

    setIsSubmitting(true);

    try {
      // Create a new song analysis
      const result = await songService.createSong({
        artist: values.artist,
        title: values.title,
      });

      setSongId(result.id);

      // Start polling for status if not already completed
      if (result.status !== "completed" && result.status !== "error") {
        startPolling();
      } else {
        setAnalysisComplete(true);
      }
    } catch (error) {
      console.error("Error analyzing song: ", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to analyze the song. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchSongDetails = async () => {
    if (songId && analysisComplete) {
      // Fetch the full song details once analysis is complete
      startPolling();
      stopPolling(); // Just fetch once
    }
  };

  // When analysis is complete, fetch the full song details
  if (analysisComplete && !songData && !songLoading) {
    fetchSongDetails();
  }

  const isLoading = isSubmitting || pollingLoading;
  const isAnalyzing = !analysisComplete && songId !== null;
  const analysisStatus = songStatus?.status || "pending";

  return (
    <div className="max-w-4xl mx-auto">
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
                          disabled={isLoading || isAnalyzing}
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
                          disabled={isLoading || isAnalyzing}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-left" />
                    </FormItem>
                  )}
                />

                {errorMessage && (
                  <Alert variant="destructive" className="text-sm">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{errorMessage}</AlertDescription>
                  </Alert>
                )}

                {songId && songStatus?.status === "error" && (
                  <Alert variant="destructive" className="text-sm">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Analysis Failed</AlertTitle>
                    <AlertDescription>{songStatus.message}</AlertDescription>
                  </Alert>
                )}

                {isAnalyzing && (
                  <div className="rounded-md bg-muted/50 p-3 flex items-center space-x-3">
                    <div className="relative">
                      <Clock className="h-5 w-5 text-primary animate-pulse" />
                    </div>
                    <div className="text-sm">
                      <p>
                        {analysisStatus === "pending" &&
                          "Waiting to begin analysis..."}
                        {analysisStatus === "processing" &&
                          "Analyzing song lyrics..."}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex flex-col space-y-2">
                  <Button
                    type="submit"
                    className="w-full h-11 text-sm font-medium transition-all"
                    disabled={isLoading || isAnalyzing}
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

        <Card
          className={`overflow-hidden ${
            !songData ? "border-muted bg-muted/5" : "border-primary/10"
          }`}
        >
          <div className="h-2 bg-gradient-to-r from-primary/60 to-primary"></div>
          <CardHeader className="space-y-1 pt-6">
            <CardTitle className="text-2xl flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" />
              Analysis Results
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Summary and country mentions from the lyrics
            </p>
          </CardHeader>
          <CardContent>
            {songLoading ? (
              <div className="flex flex-col items-center justify-center h-64 py-8">
                <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
                <p className="text-muted-foreground">
                  Loading analysis results...
                </p>
              </div>
            ) : songData ? (
              <div className="space-y-6">
                <div className="p-4 rounded-lg bg-muted/30 border border-border">
                  <h3 className="text-sm font-semibold mb-2 text-foreground/80 uppercase tracking-wide">
                    Song Details
                  </h3>
                  <p className="text-lg font-medium">
                    {songData.artist} - {songData.title}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold mb-3 text-foreground/80 uppercase tracking-wide flex items-center gap-1.5">
                    <span className="w-1 h-4 bg-primary rounded-full"></span>
                    Summary
                  </h3>
                  <div className="p-4 rounded-lg border bg-card">
                    <p className="italic">
                      {songData.summary || "No summary available"}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold mb-3 text-foreground/80 uppercase tracking-wide flex items-center gap-1.5">
                    <span className="w-1 h-4 bg-primary rounded-full"></span>
                    <Globe className="h-4 w-4" />
                    Countries Mentioned
                  </h3>
                  {songData.countries && songData.countries.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {songData.countries.map((country) => (
                        <span
                          key={country}
                          className="px-3 py-1.5 bg-secondary/60 text-secondary-foreground rounded-full text-sm font-medium"
                        >
                          {country}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">
                      No countries mentioned
                    </p>
                  )}
                </div>

                {songId && (
                  <div className="pt-4">
                    <Button asChild className="w-full">
                      <Link
                        to={`/songs/${songId}`}
                        className="flex items-center justify-center gap-2"
                      >
                        <Info className="h-4 w-4" />
                        View Full Details
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 py-8 text-muted-foreground">
                <div className="w-16 h-16 rounded-full bg-muted/20 flex items-center justify-center mb-4">
                  <Music className="h-8 w-8 text-muted-foreground opacity-40" />
                </div>
                <p className="text-center max-w-xs">
                  Enter a song to see its lyrical analysis and country mentions
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HomePage;
