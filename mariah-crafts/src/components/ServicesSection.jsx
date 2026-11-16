
import { useState } from "react";
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
} from "lucide-react";

const services = [
  {
    id: "branding",
    title: "Graphic Design & Branding",
    description: "Visual identities with personality.",
    icon: Palette,
    details: [
      "Logo & Brand Identity",
      "Social Media Graphics",
      "Editorial & Print Design",
      "Marketing Materials",
    ],
  },
  {
    id: "uiux",
    title: "UI/UX Design",
    description: "Thoughtful digital experiences.",
    icon: PanelsTopLeft,
    details: [
      "Website & App Interfaces",
      "Wireframes & Prototypes",
      "Design Systems",
      "User Experience Design",
    ],
  },
  {
    id: "development",
    title: "Web Development",
    description: "Creative ideas brought to life with code.",
    icon: Code2,
    details: [
      "Responsive Websites",
      "Interactive Web Experiences",
      "Frontend Development",
      "Custom Web Interfaces",
    ],
  },
  {
    id: "games",
    title: "Game Design & Development",
    description: "Interactive worlds and playful experiments.",
    icon: Gamepad2,
    details: [
      "Game Concepts",
      "2D Game Art",
      "Gameplay Prototypes",
      "Interactive Storytelling",
    ],
  },
  {
    id: "motion",
    title: "Digital Art & Motion",
    description: "Visual storytelling beyond static design.",
    icon: Clapperboard,
    details: [
      "Digital Illustration",
      "2D Animation",
      "Motion Graphics",
      "Video Editing",
    ],
  },
  {
    id: "creative",
    title: "Creative Technology",
    description:
      "Where design, technology, and experimentation meet.",
    icon: Sparkles,
    details: [
      "Creative Coding",
      "Interactive Prototypes",
      "Digital Product Concepts",
      "Custom Creative Solutions",
    ],
  },
  {
    id: "ai-solutions",
    title: "AI Solutions",
    description:
      "Intelligent tools and automation designed to simplify digital experiences.",
    icon: BrainCircuit,
    details: [
      "AI-Powered Web Applications",
      "Workflow Automation",
      "AI Chatbot & Assistant Integration",
      "Custom AI Tools & Prototypes",
      "AI Integration & Experimentation",
    ],
  },
  {
    id: "it-consulting",
    title: "IT Consulting & Support",
    description:
      "Practical technology guidance, troubleshooting, and digital workflow support.",
    icon: MonitorCog,
    details: [
      "Technical Troubleshooting",
      "Software Setup & Configuration",
      "Technology Recommendations",
      "Digital Workflow Optimization",
      "IT Infrastructure Guidance",
    ],
  },
  {
    id: "devops",
    title: "Automation & DevOps Solutions",
    description:
      "Streamlining development workflows, automation, and digital infrastructure.",
    icon: Workflow,
    details: [
      "Development Workflow Automation",
      "CI/CD Pipeline Configuration",
      "Cloud Deployment Support",
      "Monitoring & Dashboard Solutions",
      "Developer Tool Integration",
    ],
  },
];

export default function ServicesSection({ onNavigate }) {
  const [expanded, setExpanded] = useState(null);

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
        {services.map((service) => {
          const Icon = service.icon;
          const isExpanded = expanded === service.id;

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
                    {service.details.map((detail) => (
                      <li key={detail}>{detail}</li>
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

