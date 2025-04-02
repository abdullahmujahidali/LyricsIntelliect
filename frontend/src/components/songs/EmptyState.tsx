import { Link } from "react-router";
import { Button } from "../ui/button";

export const EmptyState = () => (
  <div className="py-16 text-center text-muted-foreground">
    <p>You haven't analyzed any songs yet.</p>
    <Button variant="link" asChild>
      <Link to="/" className="mt-2">
        Analyze your first song
      </Link>
    </Button>
  </div>
);
