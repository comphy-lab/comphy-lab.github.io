---
layout: teaching-course
title: "Basilisk for Multiphase Flow Simulations"
permalink: /teaching/2025-Basilisk101nano-ECS
---

<div class="course-image">
  <img src="/assets/images/teaching/basilisk-madrid-banner.jpg" alt="Basilisk for Multiphase Flow Simulations" loading="lazy" class="light-mode-img">
  <img src="/assets/images/teaching/courseBanner-dark.jpg" alt="Basilisk for Multiphase Flow Simulations" loading="lazy" class="dark-mode-img">
</div>

<script>
  // Function to update image visibility based on theme
  function updateBannerImages() {
    const theme = document.documentElement.getAttribute('data-theme') || 'light';
    const lightImages = document.querySelectorAll('.light-mode-img');
    const darkImages = document.querySelectorAll('.dark-mode-img');

    if (theme === 'dark') {
      lightImages.forEach(img => img.style.display = 'none');
      darkImages.forEach(img => img.style.display = 'block');
    } else {
      lightImages.forEach(img => img.style.display = 'block');
      darkImages.forEach(img => img.style.display = 'none');
    }
  }
  
  // Run on page load
  document.addEventListener('DOMContentLoaded', updateBannerImages);
  
  // Watch for theme changes
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.attributeName === 'data-theme') {
        updateBannerImages();
      }
    });
  });
  
  observer.observe(document.documentElement, { attributes: true });
</script>

# Basilisk for Multiphase Flow Simulations

<div class="course-details">
  <div class="course-details__item">
    <h4><i class="fa-solid fa-calendar-days"></i> Date</h4>
    <p>September 15, 2025</p>
  </div>
  <div class="course-details__item">
    <h4><i class="fa-solid fa-location-dot"></i> Location</h4>
    <p>European Coating Symposium 2025</p>
  </div>
  <div class="course-details__item">
    <h4><i class="fa-solid fa-clock"></i> Duration</h4>
    <p>3 hours (9:30 AM - 12:30 PM)</p>
  </div>
</div>

## What will you learn?

- **Think before you compute!** Physics-first approach to multiphase flow simulation
- **Run Basilisk simulations** Compile and execute your first high-fidelity simulations
- **Interface tracking methods** Volume-of-Fluid (VOF) approach for two-phase flows
- **Coating applications** Landau-Levich dip coating and droplet dynamics
- **Real-world connections** From simulation results to physical understanding

## Course Description

This intensive 3-hour pre-conference training provides a focused introduction to high-fidelity multiphase flow simulation using Basilisk C, a powerful open-source framework. Designed for ECS 2025 participants with intermediate CFD background, the course emphasizes practical applications to coating processes while building foundational skills in adaptive mesh refinement and interface dynamics.

The hands-on format combines theoretical insights with live coding demonstrations, enabling participants to immediately apply concepts. Through three carefully selected examples—basic heat conduction, drop impact dynamics, and Landau-Levich dip coating—attendees will gain practical experience with Basilisk's approach to conservation equations, interface tracking, and complex physics modeling relevant to coating applications.

## Course Schedule

### Hour 1: Foundations and First Steps (9:30-10:30)

#### Think before you compute

- **9:30-9:45** &nbsp;|&nbsp; **Opening & Philosophy**
  - Conservation laws and the "physics-first" approach to simulation
  - Why adaptive mesh refinement matters for coating flows
- **9:45-10:00** &nbsp;|&nbsp; **Example 0: Basic Conduction**
  - Setting up a simple heat diffusion problem
  - Understanding Basilisk's syntax and structure. Basilisk C [website](http://basilisk.fr) is your best friend.
- **10:00-10:30** &nbsp;|&nbsp; **First Basilisk Code**
  - Implementing transport equations in practice
  - Compilation workflow and debugging basics
  - _Hands-on exercise: modify and run your first simulation_
  - Conduction: [Live demo](https://blogs.comphy-lab.org/Lecture-Notes/Basilisk101/1st-workingAssignment) & [Takeaways](https://blogs.comphy-lab.org/Lecture-Notes/Basilisk101/1-conduction-takeaways)

### Hour 2: Interface Dynamics (10:30-11:30)

#### Multiphase flow fundamentals

- **10:30-10:50** &nbsp;|&nbsp; **Volume-of-Fluid Method**
  - Interface tracking for two-phase flows
  - Surface tension implementation in Basilisk
  - Adaptive refinement at fluid interfaces
- **10:50-11:10** &nbsp;|&nbsp; **Example 1: Drop Impact**
  - Wetting condition?
  - _Live demonstration with parameter variations_
  - [Drop impact assignment](https://blogs.comphy-lab.org/Lecture-Notes/Basilisk101/3rd-workingAssignment)
- **11:10-11:30** &nbsp;|&nbsp; **Interactive Workshop**
  - Modify bulk properties and see immediate results.
  - Explore impact velocity effects on maximum force and spreading.
  - _Group exercise: predict and test outcomes_

### Hour 3: Coating Applications (11:30-12:30)

#### Contact line dynamics

- **11:30-12:15** &nbsp;|&nbsp; **Example 2: Landau-Levich Dip Coating**
  - Contact line dynamics in coating processes.
  - Multiscale nature of the contact line problem.
  - Need for subgrid models.
  - Landau-Levich dip coating assignment.
- **12:15-12:30** &nbsp;|&nbsp; **Q&A and Next Steps**
  - Discussion of participant-specific applications.
  - Resources for continued learning.
  - Community support and collaboration opportunities.

---

## Prerequisites

- Intermediate knowledge of fluid mechanics and CFD concepts
- Basic programming experience (C preferred, but any language acceptable)
- Understanding of partial differential equations
- Laptop with Unix-like environment (Linux/Mac/WSL for Windows)

## Pre-Course Setup

**Required Software Installation:**

This installation is tested on Ubuntu 22.04 and macOS 15.XX.

```bash
# Essential tools
sudo apt-get install gcc make gawk git

# Basilisk framework
git clone https://github.com/comphy-lab/Basilisk-101nano.git
cd Basilisk-101nano
chmod +x ./reset_install_requirements.sh
./reset_install_requirements.sh --hard
```

For some known issues, please refer to: [Basilisk-C issues](https://github.com/comphy-lab/basilisk-C/issues) and [Issue #3](https://github.com/comphy-lab/basilisk-C/issues/3).
Darcs is not supported in the latest version of Ubuntu using apt-get. Please see: [Darcs website](https://darcs.net/) for more information on how to install Darcs. You can also install Basilisk without Darcs. Please follow the instructions here: [Basilisk INSTALL](http://basilisk.fr/src/INSTALL).

## Registration & Resources

Registration for this pre-conference session is handled through [ECS 2025](https://ecs2025.org/program/#program).

**Technical Support:**

<div class="email-container">
  <span class="email-text">vatsal.sanjay@comphy-lab.org</span>
  <div class="email-actions">
    <a class="email-link" href="mailto:vatsal.sanjay@comphy-lab.org" aria-label="Email vatsal.sanjay@comphy-lab.org">
      <i class="fa-regular fa-envelope"></i>
    </a>
    <button class="copy-btn" data-text="vatsal.sanjay@comphy-lab.org" onclick="copyEmail(this)" aria-label="Copy email address vatsal.sanjay@comphy-lab.org">
      <i class="fa-regular fa-copy"></i>
    </button>
    <div aria-live="polite" aria-atomic="true" style="position: absolute; left: -10000px; width: 1px; height: 1px; overflow: hidden;"></div>
  </div>
</div>


<div style="margin-top: 2rem; text-align: center;">
  <a href="https://github.com/comphy-lab/Basilisk-101nano" class="course-card__link" target="_blank" rel="noopener noreferrer" aria-label="Course GitHub Repository">
    <i class="fa-brands fa-github" style="margin-right: 0.5rem; font-style: normal;"></i>Course Examples & Resources
  </a>
</div>

## Expected Outcomes

By the end of this intensive 3-hour session, participants will:

- **Execute Basilisk simulations** confidently on their own systems
- **Modify key parameters** to explore different physical scenarios
- **Understand VOF methodology** for interface tracking in multiphase flows
- **Apply to coating processes** through the Landau-Levich example
- **Connect theory to practice** by relating simulation results to physical phenomena

This training provides the foundation for applying high-fidelity simulation techniques to coating research, with immediate practical skills and clear pathways for advanced applications.