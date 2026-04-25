---
layout: teaching-course
title: "High-Fidelity Simulations Using Basilisk C"
permalink: /teaching/2025-Basilisk101-Madrid
body_class: teaching-v2
description: >-
  Four-day Basilisk C course on conservation laws, interface tracking,
  and non-Newtonian flow exercises.
---

<div class="course-image">
  <img src="/assets/images/teaching/basilisk-madrid-banner.jpg" alt="High-Fidelity Simulations Using Basilisk C" loading="lazy" class="light-mode-img">
  <img src="/assets/images/teaching/courseBanner-dark.jpg" alt="High-Fidelity Simulations Using Basilisk C" loading="lazy" class="dark-mode-img">
</div>

<div class="course-details">
  <div class="course-details__item">
    <h4><i class="fa-solid fa-calendar-days"></i> Dates</h4>
    <p>March 10-13, 2025</p>
  </div>
  <div class="course-details__item">
    <h4><i class="fa-solid fa-location-dot"></i> Location</h4>
    <p>Universidad Carlos III de Madrid, Spain</p>
  </div>
  <div class="course-details__item">
    <h4><i class="fa-solid fa-clock"></i> Duration</h4>
    <p>4 days, full-time</p>
  </div>
</div>

## What will you learn?

- **Think before you compute!** Understanding the physics before implementation
- **Writing the first code in Basilisk C** Getting comfortable with the framework
- **Solving conservation equations** Numerical approaches to fluid dynamics
- **Interface tracking methods** Capturing multiphase phenomena accurately
- **Non-Newtonian flows** Modeling complex rheological behaviors

## Course Description

This four-day course teaches Basilisk C through the equations and
numerics used in multiphase-flow DNS: conservation laws, transport,
interface tracking, and non-Newtonian rheology.

Lectures stay close to implementation. Participants write and modify
working Basilisk cases during the course, then use those cases as
templates for their own simulations.

## Course Schedule

### Monday: Foundations

#### Think before you compute

- **10:00-11:30** &nbsp;|&nbsp; **Lecture (1a)**
  - Conservation laws and the numerical solution of the Navier–Stokes equations
- **11:45-13:00** &nbsp;|&nbsp; **Lecture (1b)**
  - Transport equations
  - _Brief intro to Basilisk coding framework_

#### First coding steps

- **15:00-18:00** &nbsp;|&nbsp; **Hybrid Session**
  - Implementing basic transport equations in Basilisk C.
  - Using headers in Basilisk, modular code structure, problem setup, and compilation
  - _Whiteboard + coding_
  - [1st Working Assignment](https://blogs.comphy-lab.org/Lecture-Notes/Basilisk101/1st-workingAssignment)

### Tuesday: Advanced Implementation

#### Coding like a pro

- **10:00-11:15** &nbsp;|&nbsp; **Hackathon (1c)**
  - Solving Navier–Stokes equations in Basilisk C.
  - [2nd Working Assignment](https://blogs.comphy-lab.org/Lecture-Notes/Basilisk101/2nd-workingAssignment)
- **11:30-13:00** &nbsp;|&nbsp; **Hackathon Continued**
  - Expanding on the morning tasks and code debugging

### Wednesday: Interface Dynamics

#### Interface tracking methods

- **10:00-11:30** &nbsp;|&nbsp; **Lecture (2a)**
  - Interface tracking methods (VoF, level set, phase-field approaches) and numerical strategies
- **11:45-13:00** &nbsp;|&nbsp; **Hackathon (2b)**
  - Hands-on tutorial with interface-tracking to a simple two-phase problem
  - [3rd Working Assignment](https://blogs.comphy-lab.org/Lecture-Notes/Basilisk101/3rd-workingAssignment)

#### Seminar

- **13:30-14:00** &nbsp;|&nbsp; **Department seminar (2c)**
  - A note on the thrust of airfoils by [José Manuel Gordillo](https://scholar.google.com/citations?user=14wOsewAAAAJ&hl=en&inst=5726176096060060532&oi=ao)

#### Non-Newtonian flows

- **15:00-16:00** &nbsp;|&nbsp; **Lecture (3a)**
  - Non-Newtonian flows: viscoelasticity.
- **16:15-18:00** &nbsp;|&nbsp; **Hackathon (3b)**
  - Coding exercises for viscoelastic fluids.
  - [4th Working Assignment](https://blogs.comphy-lab.org/Lecture-Notes/Basilisk101/4th-workingAssignment)

### Thursday: Special Topics

#### Special topics

- **10:00-11:30** &nbsp;|&nbsp; **Lecture (4a)**
  - Review and catching up on [4th Working Assignment](https://blogs.comphy-lab.org/Lecture-Notes/Basilisk101/4th-workingAssignment).
  - Special Topics: Three-phase flows,
- **11:45-13:00** &nbsp;|&nbsp; **Hackathon (4b)**
  - Special Topics: Holey Sheets, Contact line dynamics.
- **15:00-16:30** &nbsp;|&nbsp; **Lecture (4c)**
  - Open discussion, deeper dives into advanced features, final code reviews, and next steps.

---

## Prerequisites

- Basic knowledge of fluid mechanics
- Experience with programming (any language, C preferred)
- Understanding of partial differential equations
- Laptop with ability to compile C code

## Registration

For registration details, please contact

<div class="email-container">
    <span class="email-text">bubbles@ing.uc3m.es</span>
    <button class="copy-btn" onclick="copyEmail(this)" data-text="bubbles@ing.uc3m.es" aria-label="Copy email address bubbles@ing.uc3m.es">
        <i class="fas fa-copy"></i>
    </button>
</div>
<div class="email-container">
    <span class="email-text">vatsal.sanjay@durham.ac.uk</span>
    <button class="copy-btn" onclick="copyEmail(this)" data-text="vatsal.sanjay@durham.ac.uk" aria-label="Copy email address vatsal.sanjay@durham.ac.uk">
        <i class="fas fa-copy"></i>
    </button>
</div>

<div style="margin-top: 2rem; text-align: center;">
  <a href="https://github.com/comphy-lab/Basilisk-101" class="course-card__link" target="_blank" rel="noopener noreferrer" aria-label="Course GitHub Repository">
    <i class="fa-brands fa-github" style="margin-right: 0.5rem; font-style: normal;"></i>Course GitHub Repository
  </a>
</div>
