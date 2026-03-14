import { useEffect } from "react";
import { Briefcase, Home, LogOut, Search, Users } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/lib/auth-store";
import { useSearchStore } from "@/lib/search-store";
import { toast } from "sonner";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const signOut = useAuthStore((s) => s.signOut);
  const query = useSearchStore((s) => s.query);
  const setQuery = useSearchStore((s) => s.setQuery);

  // Clear search query on route change
  useEffect(() => {
    setQuery("");
  }, [location.pathname, setQuery]);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/login");
    } catch {
      toast.error("Failed to sign out.");
    }
  };

  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Briefcase, label: "Jobs", path: "/jobs" },
    { icon: Users, label: "Candidates", path: "/candidates" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
      <div className="max-w-[1128px] mx-auto px-4 flex items-center justify-between h-[52px]">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg text-foreground hidden sm:block">
              JobFit AI
            </span>
          </Link>
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search jobs, candidates..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 pr-4 py-1.5 bg-secondary rounded text-sm w-[280px] outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
        <div className="flex items-center gap-1">
          {navItems.map((item) => {
            const isActive =
              item.path === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.label}
                to={item.path}
                className={`flex flex-col items-center px-4 py-1 text-xs transition-colors ${
                  isActive
                    ? "text-foreground border-b-2 border-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="hidden sm:block mt-0.5">{item.label}</span>
              </Link>
            );
          })}
          <button
            onClick={handleSignOut}
            className="flex flex-col items-center px-4 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors ml-2"
          >
            <LogOut className="w-5 h-5" />
            <span className="hidden sm:block mt-0.5">Sign Out</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
