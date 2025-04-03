import { Music, Search } from "lucide-react";
import { Link } from "react-router";
import { Button } from "../ui/button";

export const EmptyState = () => (
  <div className="py-20 text-center text-muted-foreground flex flex-col items-center">
    <div className="rounded-full bg-primary/10 p-5 mb-4">
      <Music className="h-10 w-10 text-primary/70" />
    </div>
    <h3 className="text-lg font-medium mb-2">No songs analyzed yet</h3>
    <p className="mb-4 text-muted-foreground max-w-md">
      Start by analyzing your first song to see lyric summaries and country
      mentions
    </p>
    <Button asChild variant="default" size="lg" className="mt-2">
      <Link to="/" className="flex items-center gap-2">
        <Search className="h-4 w-4" />
        Analyze Your First Song
      </Link>
    </Button>
  </div>
);
