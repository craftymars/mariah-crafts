
import "./cmsPixelBackground.css";

const hearts = [
  { left: "5%", top: "12%", size: 13, delay: "0s", duration: "7s" },
  { left: "18%", top: "72%", size: 10, delay: "-2s", duration: "9s" },
  { left: "31%", top: "25%", size: 15, delay: "-4s", duration: "8s" },
  { left: "46%", top: "85%", size: 11, delay: "-1s", duration: "10s" },
  { left: "58%", top: "15%", size: 14, delay: "-3s", duration: "7.5s" },
  { left: "69%", top: "60%", size: 10, delay: "-5s", duration: "9s" },
  { left: "82%", top: "30%", size: 16, delay: "-2.5s", duration: "8s" },
  { left: "93%", top: "78%", size: 12, delay: "-6s", duration: "10s" },
  { left: "74%", top: "92%", size: 9, delay: "-1.5s", duration: "7s" },
  { left: "39%", top: "49%", size: 12, delay: "-4.5s", duration: "9s" },
];

export default function CMSPixelBackground() {
  return (
    <div className="cms-pixel-background" aria-hidden="true">
      <div className="cms-pixel-grid" />

      {hearts.map((heart, index) => (
        <span
          key={index}
          className="cms-floating-heart"
          style={{
            left: heart.left,
            top: heart.top,
            fontSize: `${heart.size}px`,
            animationDelay: heart.delay,
            animationDuration: heart.duration,
          }}
        >
          ♥
        </span>
      ))}
    </div>
  );
}
