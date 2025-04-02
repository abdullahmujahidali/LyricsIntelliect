import Loading from "@/components/Loading";
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
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SongResponse, songService } from "@/services/song";
import { Eye, RefreshCw, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router";

const SongsPage = () => {
  const [songs, setSongs] = useState<SongResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reanalyzingIds, setReanalyzingIds] = useState<Set<string>>(new Set());

  const loadSongs = async () => {
    try {
      setError(null);
      setLoading(true);
      const response = await songService.getSongs();
      setSongs(response.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load songs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSongs();
  }, []);

  const handleReanalyze = async (songId: string) => {
    try {
      setReanalyzingIds((prev) => new Set(prev).add(songId));
      await songService.reanalyzeSong(songId);

      // Refresh the songs list
      await loadSongs();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reanalyze song");
    } finally {
      setReanalyzingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(songId);
        return newSet;
      });
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "processing":
      case "pending":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "error":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  if (loading && songs.length === 0) {
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
        <div className="p-4 rounded-md bg-destructive/15 text-destructive">
          {error}
        </div>
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
            <div className="py-16 text-center text-muted-foreground">
              <p>You haven't analyzed any songs yet.</p>
              <Button variant="link" asChild>
                <Link to="/" className="mt-2">
                  Analyze your first song
                </Link>
              </Button>
            </div>
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
                {songs.map((song) => (
                  <TableRow key={song.id}>
                    <TableCell className="font-medium">{song.artist}</TableCell>
                    <TableCell>{song.title}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(
                          song.status
                        )}`}
                      >
                        {song.status.charAt(0).toUpperCase() +
                          song.status.slice(1)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {new Date(song.created).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" asChild>
                          <Link to={`/songs/${song.id}`}>
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Link>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReanalyze(song.id)}
                          disabled={
                            reanalyzingIds.has(song.id) ||
                            song.status === "processing" ||
                            song.status === "pending"
                          }
                        >
                          {reanalyzingIds.has(song.id) ? (
                            <>
                              <span className="animate-spin h-4 w-4 mr-1 border-2 border-current border-t-transparent rounded-full"></span>
                              Processing...
                            </>
                          ) : (
                            <>
                              <RefreshCw className="h-4 w-4 mr-1" />
                              Reanalyze
                            </>
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
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
