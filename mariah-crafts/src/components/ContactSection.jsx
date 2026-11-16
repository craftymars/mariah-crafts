
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



import {
  socialLinks,
  contactDetails,
} from "../data/socialLinks";

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

export default function ContactSection() {
  const email = contactDetails?.email || "";
  const phone = contactDetails?.phone || "";

  const validEmail =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  return (
    <section
      className="contact-section"
      id="contact"
      aria-labelledby="contact-heading"
    >
      <div className="contact-heading">
        <p className="eyebrow">
          05 / FIND ME AROUND THE INTERNET
        </p>

        <h2 id="contact-heading">
          Connect With Me
          <span className="pink"> ✳</span>
        </h2>

        <p>
          From design experiments to game development,
          there's always something happening somewhere.
          Pick your favorite corner of the internet.
        </p>
      </div>

      <div className="social-directory">
        {socialLinks.map((social) => {
          const Icon = icons[social.icon] || ExternalLink;

          const hasLink =
            typeof social.url === "string" &&
            /^https?:\/\/.+/i.test(social.url);

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

      <div className="contact-professional">
        <div className="contact-professional-intro">
          <p className="eyebrow">
            BUSINESS & COLLABORATIONS
          </p>

          <h3>Have a project in mind?</h3>

          <p>
            I'm always interested in hearing about
            creative collaborations, technical projects,
            and new opportunities.
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
