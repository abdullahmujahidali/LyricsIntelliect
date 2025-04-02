import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { SongResponse } from "@/services/song";
import { AlertCircle, Eye, RefreshCw } from "lucide-react";
import { Link } from "react-router";

const StatusBadge = ({ status }: { status: string }) => {
  const getBadgeClass = (status: string) => {
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

  return (
    <span
      className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getBadgeClass(
        status
      )}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

export const SongRow = ({
  song,
  isReanalyzing,
  reanalyzeError,
  onReanalyze,
}: {
  song: SongResponse;
  isReanalyzing: boolean;
  reanalyzeError?: string;
  onReanalyze: () => void;
}) => (
  <TableRow>
    <TableCell className="font-medium">{song.artist}</TableCell>
    <TableCell>{song.title}</TableCell>
    <TableCell>
      <StatusBadge status={song.status} />
    </TableCell>
    <TableCell>{new Date(song.created).toLocaleDateString()}</TableCell>
    <TableCell>
      <div className="flex flex-col gap-2">
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
            onClick={onReanalyze}
            disabled={
              isReanalyzing ||
              song.status === "processing" ||
              song.status === "pending"
            }
          >
            {isReanalyzing ? (
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

        {reanalyzeError && (
          <div className="text-xs text-destructive flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {reanalyzeError}
          </div>
        )}
      </div>
    </TableCell>
  </TableRow>
);
