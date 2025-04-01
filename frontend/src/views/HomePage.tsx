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
import {
  SongAnalysisResult,
  SongFormValues,
  songFormSchema,
} from "@/lib/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Globe, Info, Music, Search } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

const Home = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [song, setSong] = useState<SongAnalysisResult | null>(null);

  const form = useForm<SongFormValues>({
    resolver: zodResolver(songFormSchema),
    defaultValues: {
      artist: "",
      title: "",
    },
  });

  const onSubmit = async (values: SongFormValues) => {
    setErrorMessage("");
    setSong(null);
    setIsLoading(true);

    try {
      // for now i am just simulating a delay to show api loading later when backend is ready it will be removed
      setTimeout(() => {
        setSong({
          artist: values.artist,
          title: values.title,
          summary:
            "This song explores themes of personal growth and resilience through difficult times.",
          countries: ["United States", "France", "Japan"],
        });
        setIsLoading(false);
      }, 1500);
    } catch (error) {
      console.error("Error analyzing song: ", error);
      setErrorMessage("Failed to analyze the song. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-blur:bg-background/60">
        <div className="container flex h-16 items-center px-4 md:px-6">
          <div className="flex items-center gap-2">
            <Music className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 text-transparent bg-clip-text">
              LyricsIntelliect
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 container py-10 md:py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              Discover what songs are really about
            </h1>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              Get instant lyric summaries and discover country references in
              your favorite songs
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

                    <Button
                      type="submit"
                      className="w-full h-11 text-sm font-medium transition-all"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <span className="flex items-center gap-2">
                          <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></span>
                          Analyzing...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Search className="h-4 w-4" />
                          Analyze Song
                        </span>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            <Card
              className={`overflow-hidden ${
                !song ? "border-muted bg-muted/5" : "border-primary/10"
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
                {song ? (
                  <div className="space-y-6">
                    <div className="p-4 rounded-lg bg-muted/30 border border-border">
                      <h3 className="text-sm font-semibold mb-2 text-foreground/80 uppercase tracking-wide">
                        Song Details
                      </h3>
                      <p className="text-lg font-medium">
                        {song.artist} - {song.title}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold mb-3 text-foreground/80 uppercase tracking-wide flex items-center gap-1.5">
                        <span className="w-1 h-4 bg-primary rounded-full"></span>
                        Summary
                      </h3>
                      <div className="p-4 rounded-lg border bg-card">
                        <p className="italic">{song.summary}</p>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold mb-3 text-foreground/80 uppercase tracking-wide flex items-center gap-1.5">
                        <span className="w-1 h-4 bg-primary rounded-full"></span>
                        <Globe className="h-4 w-4" />
                        Countries Mentioned
                      </h3>
                      {song.countries.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {song.countries.map((country) => (
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
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 py-8 text-muted-foreground">
                    <div className="w-16 h-16 rounded-full bg-muted/20 flex items-center justify-center mb-4">
                      <Music className="h-8 w-8 text-muted-foreground opacity-40" />
                    </div>
                    <p className="text-center max-w-xs">
                      Enter a song to see its lyrical analysis and country
                      mentions
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <footer className="border-t py-6 bg-muted/10">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} LyricsIntelliect. All rights
            reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
