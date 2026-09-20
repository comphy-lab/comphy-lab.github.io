---
layout: default
title: "Project docs"
permalink: /projects/
body_class: projects-v2
description: >-
  Index of CoMPhy Lab project documentation sites hosted at
  comphy-lab.org/{Repo-Name}/.
---

{% assign project_items = site.data.project-docs.items | sort: "title" %}

<main class="projects-page">
  <header class="projects-page__head">
    <p class="projects-page__kicker">
      <span class="rule" aria-hidden="true"></span>
      <span>CoMPhy Lab · Documentation index</span>
      <span class="rule" aria-hidden="true"></span>
    </p>
    <h1 class="projects-page__title">Project docs</h1>
    <p class="projects-page__lede">
      Documentation sites for CoMPhy Lab repositories published under
      <code>comphy-lab.org/{Repo-Name}/</code>. Sorted alphabetically.
    </p>
  </header>

  <ul class="projects-list" role="list">
    {% for p in project_items %}
    <li class="projects-list__item">
      <div class="projects-list__body">
        <h2 class="projects-list__title">
          <a href="/{{ p.repo }}/">{{ p.title }}</a>
        </h2>
        {% if p.note %}
        <p class="projects-list__note">{{ p.note }}</p>
        {% endif %}
        <p class="projects-list__path">
          <span class="chip">/{{ p.repo }}/</span>
        </p>
      </div>
      <a class="btn-ghost projects-list__action" href="/{{ p.repo }}/"
         target="_blank" rel="noopener noreferrer">
        Open docs ↗
      </a>
    </li>
    {% endfor %}
  </ul>

  <p class="projects-page__foot">
    {{ project_items | size }} live documentation sites.
    To list a new repo, add it to
    <code>_data/project-docs.yml</code> after confirming
    <code>https://comphy-lab.org/{Repo-Name}/</code> returns HTTP 200.
  </p>
</main>
