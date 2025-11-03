import { useEffect, useState } from "react";
import * as React from "react";
const { useEffect, useState } = React;
import { Link } from "react-router-dom";
import { Star, Home } from "lucide-react";
import TopRightControls from "@/components/TopRightControls";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface FavoriteItem {
  id: string;
  system_name: string;
  error_code: string;
  created_at: string;
}

const Favorites = () => {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const { toast } = useToast();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id);
      if (user?.id) {
        loadFavorites(user.id);
      } else {
        setLoading(false);
      }
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id);
      if (session?.user?.id) {
        loadFavorites(session.user.id);
      } else {
        setFavorites([]);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadFavorites = async (uid: string) => {
    try {
      const { data, error } = await (supabase as any)
        .from("favorites")
        .select("*")
        .eq("user_id", uid)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setFavorites(data || []);
    } catch (error) {
      console.error("Error loading favorites:", error);
      toast({
        title: "Error",
        description: "Failed to load favorites",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (id: string) => {
    try {
      const { error } = await (supabase as any)
        .from("favorites")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setFavorites((prev) => prev.filter((fav) => fav.id !== id));
      toast({
        title: "Removed from favorites",
      });
    } catch (error) {
      console.error("Error removing favorite:", error);
      toast({
        title: "Error",
        description: "Failed to remove favorite",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="page-container">
      <TopRightControls />

      <main>
        <h1 className="header">My Favorites</h1>

        <nav className="w-full max-w-md space-y-4">
          <Link to="/" className="nav-button block">
            <Home className="inline mr-2" size={20} />
            Home
          </Link>
        </nav>

        <div className="w-full max-w-md space-y-4 mt-8">
          {loading && (
            <div className="text-center text-muted-foreground">
              Loading favorites...
            </div>
          )}

          {!loading && !userId && (
            <Card className="p-6 text-center">
              <p className="text-muted-foreground">
                Please sign in to view your favorites
              </p>
            </Card>
          )}

          {!loading && userId && favorites.length === 0 && (
            <Card className="p-6 text-center">
              <Star size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">
                No favorites yet. Start adding error codes to your favorites!
              </p>
            </Card>
          )}

          {!loading && favorites.map((fav) => (
            <Card
              key={fav.id}
              className="p-6 bg-secondary/50 border-[hsl(var(--button-border))] border relative"
            >
              <Button
                onClick={() => removeFavorite(fav.id)}
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2"
              >
                <Star size={20} className="fill-yellow-400 text-yellow-400" />
              </Button>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground">
                    System
                  </h3>
                  <p className="text-lg">{fav.system_name}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground">
                    Error Code
                  </h3>
                  <p className="text-2xl font-bold">{fav.error_code}</p>
                </div>
                <Link
                  to={`/${fav.system_name.toLowerCase().replace(/\s+/g, "-")}`}
                  className="block"
                >
                  <Button variant="outline" className="w-full">
                    View Details
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Favorites;
