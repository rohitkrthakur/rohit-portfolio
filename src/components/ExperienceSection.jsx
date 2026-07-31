import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';

const experiences = [
  {
    company: 'Jina Code Systems',
    role: 'Software Engineer L1 (Intern)',
    duration: 'Sept 2025 – Mar 2026',
    location: 'Gurgaon, On-site',
    points: [
      'Built SAAR — a production real-time WhatsApp Chatbot Admin Panel using WebSockets & long-polling, serving 1,000+ daily conversations.',
      'Architected Admin Dashboard with JWT auth, token refresh, RBAC, and 100% protected routes — zero security incidents in 6 months.',
      'Integrated 40+ REST APIs from Swagger specs, cutting integration time by 40%.',
      'Deployed 4+ Next.js apps on AWS EC2 with PM2, Nginx, Docker, and CI/CD — zero-downtime releases.'
    ]
  },
  {
    company: 'Inphynitics',
    role: 'Full Stack Developer (Freelance)',
    duration: 'Mar 2025 – Jun 2025',
    location: 'Remote',
    points: [
      'Built a physics animation platform using React/Next.js with Three.js 3D visuals — cut page load by 30%, boosted session duration by 40%.',
      'Implemented authentication, online quiz/exam flow, and course management across 5+ Next.js pages.',
      'Built a reusable Tailwind CSS component library — accelerated design-to-code delivery by 25%.'
    ]
  },
  {
    company: 'Undual Analytics',
    role: 'Frontend Developer',
    duration: 'Mar 2024 – Mar 2025',
    location: 'Remote',
    points: [
      'Developed REST APIs for Spaneshiya (eCommerce) and Gold Mani (FinTech), supporting OTP login and real-time price tracking for 1,000+ daily users.',
      'Built admin dashboards for product listing, order management, and inventory control.',
      'Optimized frontend performance via lazy loading and memoization — improved task completion by 25%.'
    ]
  }
];

export default function ExperienceSection() {
  const containerRef = useRef(null);

  useGSAP(() => {
    const cards = containerRef.current.querySelectorAll('.exp-card');
    const line = containerRef.current.querySelector('.exp-line-fill');

    gsap.set(cards, { autoAlpha: 0, y: 40 });
    gsap.set(line, { scaleY: 0, transformOrigin: 'top' });

    cards.forEach((card) => {
      gsap.to(card, {
        autoAlpha: 1,
        y: 0,
        duration: 0.7,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: card,
          start: 'top 85%',
          toggleActions: 'play none none reverse'
        }
      });
    });

    gsap.to(line, {
      scaleY: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 70%',
        end: 'bottom 60%',
        scrub: 1
      }
    });
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="max-w-4xl mx-auto px-6 md:px-10 relative pb-16 md:pb-24">
      <div className="absolute left-6 md:left-10 top-0 bottom-0 w-[2px] bg-black/10">
        <div className="exp-line-fill w-full h-full bg-[#5227FF]" />
      </div>

      <div className="flex flex-col gap-10 md:gap-14">
        {experiences.map((exp, i) => (
          <div key={i} className="exp-card relative pl-16 md:pl-24">
            <div className="absolute left-[19px] md:left-[35px] top-2 w-3 h-3 rounded-full bg-[#5227FF] ring-4 ring-white" />

            <div className="bg-[#F7F7F9] border border-black/5 rounded-2xl p-6 md:p-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-1 mb-3">
                <h3 className="text-xl md:text-2xl font-bold text-black">{exp.role}</h3>
                <span className="text-sm text-[#5227FF] font-semibold">{exp.duration}</span>
              </div>
              <p className="text-black/50 text-sm mb-4">{exp.company} · {exp.location}</p>
              <ul className="space-y-2">
                {exp.points.map((point, j) => (
                  <li key={j} className="text-black/70 text-sm md:text-base leading-relaxed flex gap-2">
                    <span className="text-[#5227FF] shrink-0">—</span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}