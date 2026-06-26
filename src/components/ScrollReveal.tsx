"use client";

import { useEffect, ReactNode } from "react";

export default function ScrollReveal({ children }: { children: ReactNode }) {
  useEffect(() => {
    const revealElements = document.querySelectorAll(".reveal-up");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );

    revealElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const nav = document.getElementById("nav");

    const handleScroll = () => {
      if (nav) {
        if (window.scrollY > 50) {
          nav.classList.add("scrolled");
        } else {
          nav.classList.remove("scrolled");
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const mobileToggle = document.getElementById("mobileToggle");
    const mobileMenu = document.getElementById("mobileMenu");

    if (mobileToggle && mobileMenu) {
      const handler = () => {
        mobileToggle.classList.toggle("active");
        mobileMenu.classList.toggle("active");
        document.body.style.overflow = mobileMenu.classList.contains("active")
          ? "hidden"
          : "";
      };

      mobileToggle.addEventListener("click", handler);

      mobileMenu.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
          mobileToggle.classList.remove("active");
          mobileMenu.classList.remove("active");
          document.body.style.overflow = "";
        });
      });

      return () => mobileToggle.removeEventListener("click", handler);
    }
  }, []);

  useEffect(() => {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", function (this: HTMLElement, e: Event) {
        const href = this.getAttribute("href");
        if (!href || href === "#") return;
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          const navHeight = 72;
          const targetPosition =
            target.getBoundingClientRect().top + window.scrollY - navHeight - 20;
          window.scrollTo({ top: targetPosition, behavior: "smooth" });
        }
      });
    });
  }, []);

  useEffect(() => {
    const statNumbers = document.querySelectorAll(".hero-stat-number[data-count]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            const target = parseInt(el.dataset.count || "0");
            const duration = 1200;
            const start = performance.now();

            const update = (currentTime: number) => {
              const elapsed = currentTime - start;
              const progress = Math.min(elapsed / duration, 1);
              const eased = 1 - Math.pow(1 - progress, 3);
              el.textContent = Math.round(target * eased).toString();
              if (progress < 1) requestAnimationFrame(update);
            };

            requestAnimationFrame(update);
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.5 }
    );

    statNumbers.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const cards = document.querySelectorAll(".product-card");
    cards.forEach((card) => {
      const el = card as HTMLElement;
      el.addEventListener("mousemove", (e: MouseEvent) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;
        el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
      });
      el.addEventListener("mouseleave", () => {
        el.style.transform = "";
      });
    });
  }, []);

  useEffect(() => {
    const voteBars = document.querySelectorAll(".vote-fill");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const bar = entry.target as HTMLElement;
            const width = bar.style.width;
            bar.style.width = "0%";
            setTimeout(() => {
              bar.style.width = width;
            }, 300);
            observer.unobserve(bar);
          }
        });
      },
      { threshold: 0.5 }
    );
    voteBars.forEach((bar) => observer.observe(bar));
    return () => observer.disconnect();
  }, []);

  return <>{children}</>;
}
