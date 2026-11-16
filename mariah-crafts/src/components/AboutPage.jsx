
import {
  ArrowUpRight,
  Download,
  Code2,
  Palette,
  Sparkles,
  Award,
  GraduationCap,
} from "lucide-react";

const skills = [
  "Graphic Design",
  "UI/UX Design",
  "Web Development",
  "Game Design",
  "Creative Coding",
  "Brand Identity",
  "Digital Art",
  "Interactive Experiences",
];

const credentials = [
  {
    icon: Award,
    title: "JavaScript Specialist",
    detail: "Professional Certification",
  },
  {
    icon: GraduationCap,
    title: "Tech901",
    detail: "IT & Technology Training",
  },
];

export default function AboutPage({ onNavigate }) {
  return (
    <section className="about-page" id="about">
      {/* PAGE HEADING */}
      <div className="about-page-heading">
        <p className="eyebrow">03 / BEHIND THE SCREEN</p>

        <h2>
          Meet the <span className="pink">Creator.</span>
        </h2>

        <p>
          Designer. Developer. Creative Technologist.
          A little bit of everything, all connected by curiosity.
        </p>
      </div>

      <div className="about-layout">
        {/* PHOTO SECTION */}
        <div className="about-photo-card">
          <div className="creator-photo-effects">
            {/* FLOATING DECORATIONS */}
            <div
              className="creator-photo-sparkles"
              aria-hidden="true"
            >
              <span className="photo-sparkle sparkle-one">
                ♥
              </span>
              <span className="photo-sparkle sparkle-two">
                ✦
              </span>
              <span className="photo-sparkle sparkle-three">
                ♡
              </span>
              <span className="photo-sparkle sparkle-four">
                ✧
              </span>
              <span className="photo-sparkle sparkle-five">
                ♥
              </span>
            </div>

            {/* ACTUAL PHOTO FRAME */}
            <div className="creator-photo-frame">
              <div className="about-photo-placeholder">
                <span>YOUR PHOTO HERE</span>
                <span className="about-photo-star">
                  ✳
                </span>
              </div>
            </div>

            {/* STATUS LABEL */}
            <div className="creator-photo-status">
              <span className="creator-photo-status-dot" />
              ♡ creator online
            </div>
          </div>

          {/* PHOTO CAPTION */}
          <div className="about-photo-caption">
            <span>MARIAH / CREATIVE TECHNOLOGIST</span>
            <Sparkles size={18} />
          </div>
        </div>

        {/* ABOUT STORY */}
        <div className="about-story">
          <div className="about-window-bar">
            <span className="about-window-dot" />
            <span>about_mariah.txt</span>
            <span>✳</span>
          </div>

          <div className="about-story-content">
            <p className="eyebrow">HELLO, WORLD!</p>

            <h3>
              I'm Mariah, and I love creating things
              that live between{" "}
              <span>art and technology.</span>
            </h3>

            <p>
              I'm a creative technologist with interests
              spanning graphic design, UI/UX, web development,
              game design, and interactive digital experiences.
            </p>

            <p>
              My work is driven by experimentation, storytelling,
              and the idea that technology can be both functional
              and expressive.
            </p>

            <p>
              Through Mariah Crafts, I'm building a creative
              space where I can explore new ideas, share my
              projects, and collaborate with others.
            </p>

            <button
              type="button"
              className="about-contact-link"
              onClick={() => onNavigate?.("contact")}
            >
              Let's Create Something
              <ArrowUpRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* CREATIVE TOOLKIT */}
      <div className="about-skills-section">
        <div className="about-subheading">
          <Code2 size={21} />
          <h3>My Creative Toolkit</h3>
        </div>

        <div className="about-skills-grid">
          {skills.map((skill) => (
            <span className="about-skill" key={skill}>
              ✳ {skill}
            </span>
          ))}
        </div>
      </div>

      {/* CREDENTIALS */}
      <div className="about-credentials-section">
        <div className="about-subheading">
          <Palette size={21} />
          <h3>Credentials & Learning</h3>
        </div>

        <div className="about-credentials-grid">
          {credentials.map((item) => {
            const Icon = item.icon;

            return (
              <div
                className="about-credential"
                key={item.title}
              >
                <Icon size={25} />
                <h4>{item.title}</h4>
                <p>{item.detail}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* RESUME */}
      <div className="about-resume">
        <div>
          <p className="eyebrow">
            WANT THE PROFESSIONAL VERSION?
          </p>

          <h3>Explore My Experience</h3>

          <p>
            Take a closer look at my background,
            qualifications, and creative work.
          </p>
        </div>

        <a
          href="/resume.pdf"
          className="about-resume-button"
          download="Mariah_Resume.pdf"
        >
          <Download size={19} />
          Download Resume
        </a>
      </div>
    </section>
  );
}
