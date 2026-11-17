
import { useEffect, useState } from "react";
import {
  Camera,
  Video,
  BriefcaseBusiness,
  Music2,
  Tv,
  MessagesSquare,
  MessageCircle,
  AtSign,
  Coffee,
  ShoppingBag,
  Mail,
  Phone,
  ArrowUpRight,
  ExternalLink,
  GitBranch,
} from "lucide-react";

import { supabase } from "../lib/supabase";

const icons = {
  instagram: Camera,
  message: MessageCircle,
  music: Music2,
  youtube: Video,
  twitch: Tv,
  discord: MessagesSquare,
  twitter: AtSign,
  coffee: Coffee,
  shopping: ShoppingBag,
  linkedin: BriefcaseBusiness,
  github: GitBranch,
};

const DEFAULT_CONTACT = {
  heading: "Connect With Me",
  intro:
    "From design experiments to game development, there's always something happening somewhere. Pick your favorite corner of the internet.",
  business_heading: "Have a project in mind?",
  business_description:
    "I'm always interested in hearing about creative collaborations, technical projects, and new opportunities.",
  email: "",
  phone: "",
};

function isValidUrl(value) {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol);
  } catch {
    return false;
  }
}

export default function ContactSection() {
  const [socialLinks, setSocialLinks] = useState([]);
  const [contactDetails, setContactDetails] =
    useState(DEFAULT_CONTACT);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadContact() {
      const [socialResult, contactResult] = await Promise.all([
        supabase
          .from("portfolio_social_links")
          .select("id,name,category,icon,url,sort_order")
          .eq("published", true)
          .order("sort_order", { ascending: true })
          .order("created_at", { ascending: true }),

        supabase.rpc("get_portfolio_public_contact"),
      ]);

      if (!active) return;

      if (socialResult.error || contactResult.error) {
        console.error(
          "Contact load error:",
          socialResult.error || contactResult.error
        );
        setError("Contact information is temporarily unavailable.");
      } else {
        setSocialLinks(socialResult.data || []);

        const publicContact = Array.isArray(contactResult.data)
          ? contactResult.data[0]
          : contactResult.data;

        setContactDetails({
          ...DEFAULT_CONTACT,
          ...(publicContact || {}),
        });

        setError("");
      }

      setLoading(false);
    }

    loadContact();

    return () => {
      active = false;
    };
  }, []);

  const email = contactDetails.email || "";
  const phone = contactDetails.phone || "";

  const validEmail =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  return (
    <section
      className="contact-section"
      id="contact"
      aria-labelledby="contact-heading"
    >
      {/* CONTACT HEADER */}
      <div className="contact-heading">
        <p className="eyebrow">
          05 / FIND ME AROUND THE INTERNET
        </p>

        <h2 id="contact-heading">
          {contactDetails.heading}
          <span className="pink"> ✳</span>
        </h2>

        <p>{contactDetails.intro}</p>
      </div>

      {/* SOCIAL DIRECTORY */}
      <div className="social-directory">
        {loading && (
          <p role="status">Loading connections... ♡</p>
        )}

        {error && (
          <p role="alert">{error}</p>
        )}

        {!loading &&
          !error &&
          socialLinks.map((social) => {
            const Icon = icons[social.icon] || ExternalLink;
            const hasLink = isValidUrl(social.url);

            const content = (
              <>
                <div className="social-icon">
                  <Icon size={25} strokeWidth={1.6} />
                </div>

                <div className="social-information">
                  <h3>{social.name}</h3>
                  <p>{social.category}</p>
                </div>

                {hasLink ? (
                  <ArrowUpRight
                    size={18}
                    className="social-arrow"
                  />
                ) : (
                  <span className="social-soon">
                    Coming Soon
                  </span>
                )}
              </>
            );

            return hasLink ? (
              <a
                key={social.id}
                className="social-card"
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Visit my ${social.name}`}
              >
                {content}
              </a>
            ) : (
              <div
                key={social.id}
                className="social-card social-card-disabled"
              >
                {content}
              </div>
            );
          })}
      </div>

      {/* PROFESSIONAL CONTACT */}
      <div className="contact-professional">
        <div className="contact-professional-intro">
          <p className="eyebrow">
            BUSINESS & COLLABORATIONS
          </p>

          <h3>
            {contactDetails.business_heading}
          </h3>

          <p>
            {contactDetails.business_description}
          </p>
        </div>

        <div className="contact-methods">
          {validEmail ? (
            <a
              className="contact-method"
              href={`mailto:${email}`}
            >
              <Mail size={22} />

              <div>
                <span>Email</span>
                <strong>{email}</strong>
              </div>

              <ArrowUpRight size={18} />
            </a>
          ) : (
            <div className="contact-method">
              <Mail size={22} />

              <div>
                <span>Email</span>
                <strong>Coming Soon</strong>
              </div>
            </div>
          )}

          {phone && (
            <div className="contact-method">
              <Phone size={22} />

              <div>
                <span>Business Phone</span>
                <strong>{phone}</strong>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
