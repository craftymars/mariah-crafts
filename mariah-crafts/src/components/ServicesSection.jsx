
import { useEffect, useState } from "react";
import {
  Palette,
  PanelsTopLeft,
  Code2,
  Gamepad2,
  Clapperboard,
  Sparkles,
  BrainCircuit,
  ArrowUpRight,
  ChevronDown,
  MonitorCog,
  Workflow,
  Package,
  Camera,
  Film,
  ShieldCheck,
  Cloud,
  Cpu,
  PenTool,
  Smartphone,
  Globe,
  Database,
  Bot,
} from "lucide-react";

import { supabase } from "../lib/supabase";

const ICONS = {
  "palette": Palette,
  "panels-top-left": PanelsTopLeft,
  "code-2": Code2,
  "gamepad-2": Gamepad2,
  "clapperboard": Clapperboard,
  "sparkles": Sparkles,
  "brain-circuit": BrainCircuit,
  "monitor-cog": MonitorCog,
  "workflow": Workflow,
  "package": Package,
  "camera": Camera,
  "film": Film,
  "shield-check": ShieldCheck,
  "cloud": Cloud,
  "cpu": Cpu,
  "pen-tool": PenTool,
  "smartphone": Smartphone,
  "globe": Globe,
  "database": Database,
  "bot": Bot,
};

export default function ServicesSection({ onNavigate }) {
  const [services, setServices] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadServices() {
      const { data, error: loadError } = await supabase
        .from("portfolio_services")
        .select(
          "id,title,description,icon,details,sort_order"
        )
        .eq("published", true)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true });

      if (!active) return;

      if (loadError) {
        console.error("Services load error:", loadError);
        setError("Services are temporarily unavailable.");
      } else {
        setServices(data || []);
        setError("");
      }

      setLoading(false);
    }

    loadServices();

    return () => {
      active = false;
    };
  }, []);

  const goToContact = () => {
    if (typeof onNavigate === "function") {
      onNavigate("contact");
    }
  };

  return (
    <section
      className="services-section"
      id="services"
      aria-labelledby="services-title"
    >
      {/* SERVICES HEADER */}
      <div className="services-heading">
        <p className="eyebrow">04 / WHAT I CREATE</p>

        <h2 id="services-title">
          Creative Services
          <span className="pink"> ✳</span>
        </h2>

        <p>
          From the first sketch to the final interaction,
          I bring creative and technical ideas together.
        </p>
      </div>

      {/* SERVICES GRID */}
      <div className="services-grid">
        {loading && (
          <p role="status">Loading services... ♡</p>
        )}

        {error && (
          <p role="alert">{error}</p>
        )}

        {!loading &&
          !error &&
          services.map((service) => {
            const Icon = ICONS[service.icon] || Sparkles;
            const isExpanded = expanded === service.id;

            const details = Array.isArray(service.details)
              ? service.details
              : [];

            return (
              <article
                className={`service-card ${
                  isExpanded ? "service-card-active" : ""
                }`}
                key={service.id}
              >
                <div className="service-icon">
                  <Icon size={28} strokeWidth={1.5} />
                </div>

                <h3>{service.title}</h3>
                <p>{service.description}</p>

                {/* EXPAND BUTTON */}
                <button
                  type="button"
                  className="service-expand"
                  aria-expanded={isExpanded}
                  aria-controls={`service-details-${service.id}`}
                  onClick={() =>
                    setExpanded(
                      isExpanded ? null : service.id
                    )
                  }
                >
                  {isExpanded
                    ? "Show Less"
                    : "Explore Services"}

                  <ChevronDown
                    size={18}
                    className={isExpanded ? "rotate" : ""}
                  />
                </button>

                {/* EXPANDED DETAILS */}
                {isExpanded && (
                  <div
                    className="service-details"
                    id={`service-details-${service.id}`}
                  >
                    <ul>
                      {details.map((detail, index) => (
                        <li key={`${service.id}-${index}`}>
                          {detail}
                        </li>
                      ))}
                    </ul>

                    {/* WORKING INQUIRY BUTTON */}
                    <button
                      type="button"
                      className="service-inquire"
                      onClick={goToContact}
                    >
                      Inquire About This
                      <ArrowUpRight size={17} />
                    </button>
                  </div>
                )}
              </article>
            );
          })}
      </div>

      {/* BOTTOM CALL TO ACTION */}
      <div className="services-bottom">
        <div>
          <p className="eyebrow">
            HAVE SOMETHING IN MIND?
          </p>

          <h3>Let's make it happen.</h3>

          <p>
            Have a creative idea or project that doesn't
            fit neatly into one category? Let's talk.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={goToContact}
        >
          Start a Conversation
          <ArrowUpRight size={18} />
        </button>
      </div>
    </section>
  );
}
