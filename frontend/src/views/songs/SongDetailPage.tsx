import Loading from "@/components/Loading";
import { StatusBadge } from "@/components/songs/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { SongDetailResponse, songService } from "@/services/song";
import { ArrowLeft, Clock, Eye, Globe, Music } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { toast } from "sonner";

const CountryBadge = ({ country }: { country: string }) => (
  <span className="px-3 py-1.5 bg-secondary/60 text-secondary-foreground rounded-full text-sm font-medium">
    {country}
  </span>
);

const SongDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [song, setSong] = useState<SongDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSong = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await songService.getSongById(id);
      setSong(data);
    } catch (err) {
      let errorMessage = "Failed to load song details";
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      toast.error("Error loading song details", {
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSong();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading && !song) {
    return <Loading />;
  }

  if (!song) {
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost" className="group">
          <Link
            to="/songs"
            className="flex items-center gap-2 transition-transform group-hover:-translate-x-1"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to All Songs
          </Link>
        </Button>

        <StatusBadge status={song.status} />
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {song.artist} - {song.title}
          </h1>
          <div className="flex items-center mt-2 text-muted-foreground text-sm">
            <Clock className="h-4 w-4 mr-1" />
            <span>Created: {formatDate(song.created)}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="overflow-hidden border shadow-sm rounded-lg">
          <CardHeader className="bg-white dark:bg-slate-950 border-b px-6 py-5">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Eye className="h-5 w-5 text-primary" />
              Analysis Results
            </CardTitle>
            <CardDescription>
              Summary and insights from the lyrics
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {song.status === "completed" && (
              <>
                <div>
                  <h3 className="text-sm font-semibold mb-3 text-foreground/80 uppercase tracking-wide">
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
                        <CountryBadge key={country} country={country} />
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">
                      No countries mentioned
                    </p>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="overflow-hidden border shadow-sm rounded-lg">
          <CardHeader className="bg-white dark:bg-slate-950 border-b px-6 py-5">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Music className="h-5 w-5 text-primary" />
              Lyrics
            </CardTitle>
            <CardDescription>Lyrics used for the analysis</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {song.lyrics ? (
              <div className="whitespace-pre-line p-4 rounded-lg border bg-card h-[400px] overflow-auto font-mono text-sm">
                {song.lyrics}
              </div>
            ) : (
              <div className="py-16 flex flex-col items-center justify-center text-muted-foreground">
                <div className="rounded-full bg-muted/30 p-4 mb-4">
                  <Music className="h-8 w-8 text-muted-foreground/60" />
                </div>
                <p>No lyrics available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden border shadow-sm rounded-lg">
        <CardHeader className="bg-white dark:bg-slate-950 border-b px-6 py-5">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Clock className="h-5 w-5 text-primary" />
            Additional Information
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <dl className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-muted/10 p-4 rounded-lg">
              <dt className="text-sm font-medium text-muted-foreground mb-1">
                Created By
              </dt>
              <dd className="font-medium">
                {song.createdBy?.fullName || song.createdBy?.email || "Unknown"}
              </dd>
            </div>
            <div className="bg-muted/10 p-4 rounded-lg">
              <dt className="text-sm font-medium text-muted-foreground mb-1">
                Created At
              </dt>
              <dd className="font-medium">{formatDate(song.created)}</dd>
            </div>
            <div className="bg-muted/10 p-4 rounded-lg">
              <dt className="text-sm font-medium text-muted-foreground mb-1">
                Last Updated
              </dt>
              <dd className="font-medium">{formatDate(song.modified)}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
};

export default SongDetailPage;
