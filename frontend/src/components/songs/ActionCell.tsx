import { Eye, RefreshCw } from "lucide-react";
import { Link } from "react-router";

import { Button } from "@/components/ui/button";
import { SongResponse } from "@/services/song";

export const ActionsCell = ({
  song,
  isPolling,
  onReanalyze,
}: {
  song: SongResponse;
  isPolling: boolean;
  onReanalyze: () => void;
}) => {
  return (
    <div className="flex items-center space-x-2 justify-end">
      <Button
        variant="outline"
        size="sm"
        asChild
        className="h-8 px-3 text-sm font-medium"
      >
        <Link to={`/songs/${song.id}`} className="flex items-center gap-1.5">
          <Eye className="h-4 w-4" />
          View
        </Link>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={onReanalyze}
        disabled={
          isPolling || song.status === "processing" || song.status === "pending"
        }
        className="h-8 px-3 text-sm font-medium"
      >
        {isPolling ? (
          <>
            <span className="animate-spin h-4 w-4 mr-1.5 border-2 border-current border-t-transparent rounded-full"></span>
            Processing...
          </>
        ) : (
          <>
            <RefreshCw className="h-4 w-4 mr-1.5" />
            Reanalyze
          </>
        )}
      </Button>
    </div>
  );
};
