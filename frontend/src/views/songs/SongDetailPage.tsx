import Loading from "@/components/Loading";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SongDetailResponse, songService } from "@/services/song";
import { AlertCircle, ArrowLeft, Clock, Globe, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";

const SongDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [song, setSong] = useState<SongDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reanalyzing, setReanalyzing] = useState(false);

  const fetchSong = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const data = await songService.getSongById(id);
      setSong(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load song details"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSong();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleReanalyze = async () => {
    if (!id) return;
    try {
      setReanalyzing(true);
      await songService.reanalyzeSong(id);
      fetchSong();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reanalyze song");
    } finally {
      setReanalyzing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600 dark:text-green-400";
      case "processing":
      case "pending":
        return "text-blue-600 dark:text-blue-400";
      case "error":
        return "text-red-600 dark:text-red-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  if (loading && !song) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <Button asChild variant="ghost" className="mb-6">
            <Link to="/songs" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to All Songs
            </Link>
          </Button>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!song) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <Button asChild variant="ghost" className="mb-6">
          <Link to="/songs" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to All Songs
          </Link>
        </Button>
      </div>

      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {song.artist} - {song.title}
          </h1>
          <div className="flex items-center mt-2 text-muted-foreground text-sm">
            <span
              className={`flex items-center gap-1 ${getStatusColor(
                song.status
              )}`}
            >
              <Clock className="h-4 w-4" />
              Status:{" "}
              {song.status.charAt(0).toUpperCase() + song.status.slice(1)}
            </span>
            <span className="mx-2">•</span>
            <span>Created: {new Date(song.created).toLocaleString()}</span>
          </div>
        </div>
        <Button
          onClick={handleReanalyze}
          disabled={
            reanalyzing ||
            song.status === "processing" ||
            song.status === "pending"
          }
        >
          {reanalyzing ? (
            <>
              <span className="animate-spin h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full"></span>
              Processing...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Reanalyze
            </>
          )}
        </Button>
      </div>

      {song.status === "error" && song.message && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Analysis Failed</AlertTitle>
          <AlertDescription>{song.message}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Analysis Results */}
        <Card>
          <CardHeader>
            <CardTitle>Analysis Results</CardTitle>
            <CardDescription>
              Summary and insights from the lyrics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {song.status === "completed" ? (
              <>
                <div>
                  <h3 className="text-sm font-semibold mb-2 text-foreground/80 uppercase tracking-wide">
                    Summary
                  </h3>
                  <div className="p-4 rounded-lg border bg-card">
                    <p className="italic">{song.summary}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold mb-3 text-foreground/80 uppercase tracking-wide flex items-center gap-1.5">
                    <Globe className="h-4 w-4" />
                    Countries Mentioned
                  </h3>
                  {song.countries && song.countries.length > 0 ? (
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
              </>
            ) : song.status === "processing" || song.status === "pending" ? (
              <div className="py-8 text-center">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-muted-foreground">
                  {song.status === "processing"
                    ? "Analyzing lyrics..."
                    : "Waiting to start analysis..."}
                </p>
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                <p>
                  {song.status === "error"
                    ? "Analysis failed. Please try reanalyzing."
                    : "No analysis results available."}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Lyrics */}
        <Card>
          <CardHeader>
            <CardTitle>Lyrics</CardTitle>
            <CardDescription>Lyrics used for the analysis</CardDescription>
          </CardHeader>
          <CardContent>
            {song.lyrics ? (
              <div className="whitespace-pre-line p-4 rounded-lg border bg-card h-[400px] overflow-auto">
                {song.lyrics}
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                <p>No lyrics available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Metadata */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Information</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <dt className="text-sm font-medium text-muted-foreground mb-1">
                Created By
              </dt>
              <dd>
                {song.createdBy?.fullName || song.createdBy?.email || "Unknown"}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground mb-1">
                Created At
              </dt>
              <dd>{new Date(song.created).toLocaleString()}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground mb-1">
                Last Updated
              </dt>
              <dd>{new Date(song.modified).toLocaleString()}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
};

export default SongDetailPage;
