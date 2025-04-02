import Loading from "@/components/Loading";
import { EmptyState } from "@/components/songs/EmptyState";
import { ErrorMessage } from "@/components/songs/ErrorMessage";
import { SongRow } from "@/components/songs/Row";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { API_ROUTES } from "@/config/api";
import { SongResponse, songService } from "@/services/song";
import { Search } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import useSWR from "swr";

const SongsPage = () => {
  const [reanalyzingIds, setReanalyzingIds] = useState<Set<string>>(new Set());
  const [reanalyzeErrors, setReanalyzeErrors] = useState<
    Record<string, string>
  >({});

  const {
    data: songsResponse,
    error,
    mutate: refreshSongs,
    isLoading,
  } = useSWR(API_ROUTES.songs.base, {
    revalidateOnFocus: false,
    refreshInterval: 10000,
    dedupingInterval: 3000,
    errorRetryCount: 3,
  });

  const songs = songsResponse?.results || [];

  const handleReanalyze = async (songId: string) => {
    try {
      setReanalyzeErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[songId];
        return newErrors;
      });

      setReanalyzingIds((prev) => new Set(prev).add(songId));
      await songService.reanalyzeSong(songId);
      refreshSongs();
    } catch (err) {
      if (err instanceof Error) {
        let errorMessage = err.message;
        if (
          err.message.includes("No lyrics found") ||
          err.message.includes("Song not found") ||
          err.message.includes("Cannot reanalyze song")
        ) {
          errorMessage = "Song could not be found in the lyrics database";
        }

        setReanalyzeErrors((prev) => ({
          ...prev,
          [songId]: errorMessage,
        }));
      } else {
        setReanalyzeErrors((prev) => ({
          ...prev,
          [songId]: "Failed to reanalyze song",
        }));
      }
    } finally {
      setReanalyzingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(songId);
        return newSet;
      });
    }
  };

  if (isLoading && songs.length === 0) {
    return <Loading />;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Your Song Analyses
          </h1>
          <p className="text-muted-foreground mt-2">
            View and manage all your analyzed songs
          </p>
        </div>
        <Button asChild>
          <Link to="/" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            New Analysis
          </Link>
        </Button>
      </div>

      {error && (
        <ErrorMessage message={error.message || "Failed to load songs"} />
      )}

      <Card className="overflow-hidden border-primary/10">
        <CardHeader className="bg-muted/5">
          <CardTitle>Song Analysis History</CardTitle>
          <CardDescription>
            View all your previous song analyses and their results
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {songs.length === 0 ? (
            <EmptyState />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Artist</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {songs.map((song: SongResponse) => (
                  <SongRow
                    key={song.id}
                    song={song}
                    isReanalyzing={reanalyzingIds.has(song.id)}
                    reanalyzeError={reanalyzeErrors[song.id]}
                    onReanalyze={() => handleReanalyze(song.id)}
                  />
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SongsPage;
