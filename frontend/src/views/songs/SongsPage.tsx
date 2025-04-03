import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Search } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";
import useSWR from "swr";

import Loading from "@/components/Loading";
import { ActionsCell } from "@/components/songs/ActionCell";
import { EmptyState } from "@/components/songs/EmptyState";
import { StatusBadge } from "@/components/songs/StatusBadge";
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
import { API_ROUTES } from "@/config/api";
import { formatDate } from "@/lib/utils";
import { SongResponse, songService } from "@/services/song";

const SongsPage = () => {
  const [pollingSongs, setPollingSongs] = useState<Record<string, boolean>>({});

  const {
    data: songsResponse,
    mutate: refreshSongs,
    isLoading,
  } = useSWR(API_ROUTES.songs.base, {
    revalidateOnFocus: false,
    refreshInterval: 10000,
    dedupingInterval: 3000,
    errorRetryCount: 3,
    onError: (err) => {
      toast.error("Failed to load songs", {
        description: err.message || "Please try again later",
      });
    },
  });

  const songs = songsResponse?.results || [];

  const setupSongPolling = (songId: string) => {
    return {
      pollingFn: async () => {
        const status = await songService.getSongStatus(songId);
        return status;
      },
      stopCondition: (data) => {
        return data.status === "completed" || data.status === "error";
      },
      onSuccess: (data) => {
        if (data.status === "completed") {
          toast.success("Song analysis completed");
        } else if (data.status === "error") {
          toast.error("Song analysis failed", {
            description: data.message || "Please try again",
          });
        }
        setPollingSongs((prev) => ({
          ...prev,
          [songId]: false,
        }));
        refreshSongs();
      },
      interval: 2000,
      enabled: false,
    };
  };

  const handleReanalyze = async (songId: string) => {
    try {
      setPollingSongs((prev) => ({
        ...prev,
        [songId]: true,
      }));

      await songService.reanalyzeSong(songId);
      toast.success("Song queued for reanalysis");
      const { pollingFn, stopCondition, onSuccess, interval } =
        setupSongPolling(songId);
      const checkStatus = async () => {
        try {
          const status = await pollingFn();

          if (stopCondition(status)) {
            onSuccess(status);
          } else {
            setTimeout(checkStatus, interval);
          }
        } catch (error) {
          console.error("Polling error:", error);
          setPollingSongs((prev) => ({
            ...prev,
            [songId]: false,
          }));

          refreshSongs();

          toast.error("Failed to check song status", {
            description:
              error instanceof Error ? error.message : "Please try again",
          });
        }
      };
      checkStatus();
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

        toast.error("Failed to reanalyze song", {
          description: errorMessage,
        });
      } else {
        toast.error("Failed to reanalyze song");
      }
      setPollingSongs((prev) => ({
        ...prev,
        [songId]: false,
      }));
    }
  };

  const columns: ColumnDef<SongResponse>[] = [
    {
      accessorKey: "artist",
      header: "Artist",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("artist")}</div>
      ),
    },
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => <div>{row.getValue("title")}</div>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.getValue("status")} />,
    },
    {
      accessorKey: "created",
      header: "Created",
      cell: ({ row }) => (
        <div className="text-muted-foreground">
          {formatDate(row.getValue("created"))}
        </div>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => (
        <ActionsCell
          song={row.original}
          isPolling={!!pollingSongs[row.original.id]}
          onReanalyze={() => handleReanalyze(row.original.id)}
        />
      ),
    },
  ];

  const table = useReactTable({
    data: songs,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading && songs.length === 0) {
    return <Loading />;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Your Song Analyses
          </h1>
          <p className="text-muted-foreground mt-2">
            View and manage all your analyzed songs
          </p>
        </div>
        <Button asChild size="lg" className="px-4">
          <Link to="/" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            New Analysis
          </Link>
        </Button>
      </div>

      <Card className="overflow-hidden border shadow-sm rounded-lg">
        <CardHeader className="bg-white dark:bg-slate-950 border-b px-6 py-5">
          <CardTitle className="text-xl">Song Analysis History</CardTitle>
          <CardDescription>
            View all your previous song analyses and their results
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {songs.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="relative w-full overflow-auto">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow
                      key={headerGroup.id}
                      className="bg-muted/5 hover:bg-transparent border-b"
                    >
                      {headerGroup.headers.map((header) => (
                        <TableHead
                          key={header.id}
                          className="py-4 px-4 font-semibold text-foreground"
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows.length > 0 ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        className="hover:bg-muted/5 transition-colors border-b"
                        data-state={row.getIsSelected() && "selected"}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id} className="py-4 px-4">
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="h-24 text-center"
                      >
                        No results.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SongsPage;
