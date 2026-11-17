
import { useEffect, useState } from "react";
import { Settings } from "lucide-react";
import { supabase } from "../../lib/supabase";
import "./adminQuickAccess.css";

export default function AdminQuickAccess() {
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    let active = true;
    let requestId = 0;

    async function checkAdmin() {
      const currentRequest = ++requestId;

      // Check the authenticated session.
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (!active || currentRequest !== requestId) {
        return;
      }

      if (authError || !user) {
        setAuthorized(false);
        return;
      }

      // Use the same admin_users table as AdminGate.
      const { data, error } = await supabase
        .from("admin_users")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!active || currentRequest !== requestId) {
        return;
      }

      setAuthorized(!error && Boolean(data));
    }

    checkAdmin();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      // Defer Supabase calls outside the auth callback.
      setTimeout(checkAdmin, 0);
    });

    return () => {
      active = false;
      requestId++;
      subscription.unsubscribe();
    };
  }, []);

  if (!authorized) return null;

  return (
    <a
      href="/admin"
      className="admin-quick-access"
      aria-label="Open Mariah Crafts Control Center"
      title="Open Control Center ♡"
    >
      <Settings size={23} strokeWidth={2.2} />
    </a>
  );
}
