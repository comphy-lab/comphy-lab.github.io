---
layout: default
title: Team
permalink: /team/
body_class: team-v2
description: >-
  The people in the room — present team, collaborators, and alumni
  of the CoMPhy Lab at Durham University.
---

{% assign team = site.data.team %}

<main class="team-page">

  <header class="team-page__head">
    <p class="team-page__kicker">
      <span class="rule" aria-hidden="true"></span>
      <span>CoMPhy Lab · People</span>
      <span class="rule" aria-hidden="true"></span>
    </p>
    <h1 class="team-page__title">The people in the room</h1>
    <p class="team-page__lede">
      Three groups, hard-separated. Present team and collaborators work
      weekly; alumni are welcome back for coffee. Two-sentence bios
      on every card — the long version lives on each person's page.
    </p>
  </header>

  <div class="roster">

    {% comment %} ---------------- Present ---------------- {% endcomment %}
    <section class="roster__group" id="present">
      <header class="roster__group-head">
        <h2>Present team</h2>
        <span>· {{ team.present | size }} members</span>
      </header>
      <div class="roster-grid">
        {% for m in team.present %}
        <article class="t-member {% if m.is_pi %}t-member--pi{% endif %}" id="{{ m.slug | default: m.name | slugify }}">
          <div class="t-member__photo {% unless m.photo %}t-member__photo--ph{% endunless %}">
            {% if m.photo %}
              <img src="{{ m.photo }}" alt="Portrait of {{ m.name }}" loading="lazy" decoding="async" />
            {% else %}
              {{ m.name | replace: "Dr. ", "" | replace: "Prof. ", "" | split: " " | map: "first" | join: "" | upcase | slice: 0, 2 }}
            {% endif %}
          </div>
          <div>
            <p class="t-member__name">
              {% if m.slug %}<a class="t-member__name-link" href="#{{ m.slug }}">{{ m.name }}</a>{% else %}{{ m.name }}{% endif %}
            </p>
            <div class="t-member__role">{{ m.role }}{% if m.affiliation %} · {{ m.affiliation }}{% endif %}</div>
          </div>
          <p class="t-member__bio">{{ m.bio }}</p>
          <div class="t-member__links">
            {% if m.links.email %}<a href="{{ m.links.email }}" title="Email" aria-label="Email {{ m.name }}"><i class="fa-solid fa-envelope"></i></a>{% endif %}
            {% if m.links.scholar %}<a href="{{ m.links.scholar }}" target="_blank" rel="noopener noreferrer" title="Google Scholar" aria-label="Google Scholar profile"><i class="ai ai-google-scholar"></i></a>{% endif %}
            {% if m.links.github %}<a href="{{ m.links.github }}" target="_blank" rel="noopener noreferrer" title="GitHub" aria-label="GitHub profile"><i class="fa-brands fa-github"></i></a>{% endif %}
            {% if m.links.bluesky %}<a href="{{ m.links.bluesky }}" target="_blank" rel="noopener noreferrer" title="Bluesky" aria-label="Bluesky profile"><i class="fa-brands fa-bluesky"></i></a>{% endif %}
            {% if m.links.orcid %}<a href="{{ m.links.orcid }}" target="_blank" rel="noopener noreferrer" title="ORCID" aria-label="ORCID profile"><i class="fa-brands fa-orcid"></i></a>{% endif %}
            {% if m.links.site %}<a href="{{ m.links.site }}" target="_blank" rel="noopener noreferrer" title="Personal site" aria-label="Personal website"><i class="fa-solid fa-globe"></i></a>{% endif %}
          </div>
        </article>
        {% endfor %}
      </div>
    </section>

    {% comment %} ---------------- Collaborators ---------------- {% endcomment %}
    <section class="roster__group" id="collaborators">
      <header class="roster__group-head">
        <h2>Collaborators</h2>
        <span>· {{ team.collaborators | size }} principal</span>
      </header>
      <div class="roster-grid">
        {% for m in team.collaborators %}
        <article class="t-member" id="{{ m.slug | default: m.name | slugify }}">
          <div class="t-member__photo t-member__photo--ph">
            {{ m.name | replace: "Dr. ", "" | replace: "Prof. ", "" | replace: "Adj. Prof. ", "" | split: " " | map: "first" | join: "" | upcase | slice: 0, 2 }}
          </div>
          <div>
            <p class="t-member__name">{{ m.name }}</p>
            <div class="t-member__role">{{ m.role }}</div>
          </div>
          <p class="t-member__bio">{{ m.bio }}</p>
          <div class="t-member__links">
            {% if m.links.email %}<a href="{{ m.links.email }}" title="Email" aria-label="Email {{ m.name }}"><i class="fa-solid fa-envelope"></i></a>{% endif %}
            {% if m.links.scholar %}<a href="{{ m.links.scholar }}" target="_blank" rel="noopener noreferrer" title="Google Scholar"><i class="ai ai-google-scholar"></i></a>{% endif %}
            {% if m.links.orcid %}<a href="{{ m.links.orcid }}" target="_blank" rel="noopener noreferrer" title="ORCID"><i class="fa-brands fa-orcid"></i></a>{% endif %}
            {% if m.links.site %}<a href="{{ m.links.site }}" target="_blank" rel="noopener noreferrer" title="Personal site"><i class="fa-solid fa-globe"></i></a>{% endif %}
          </div>
        </article>
        {% endfor %}
      </div>
    </section>

    {% comment %} ---------------- Alumni ---------------- {% endcomment %}
    <section class="roster__group" id="alumni">
      <header class="roster__group-head">
        <h2>Alumni</h2>
        <span>· last seven years</span>
      </header>
      <div class="roster-grid">
        {% for m in team.alumni %}
        <article class="t-member" id="{{ m.slug | default: m.name | slugify }}">
          <div class="t-member__photo t-member__photo--ph">
            {{ m.name | replace: "Dr. ", "" | replace: "Prof. ", "" | split: " " | map: "first" | join: "" | upcase | slice: 0, 2 }}
          </div>
          <div>
            <p class="t-member__name">{{ m.name }}</p>
            <div class="t-member__role">{{ m.role }}</div>
          </div>
          <p class="t-member__bio">{{ m.bio }}</p>
          <div class="t-member__links">
            {% if m.links.github %}<a href="{{ m.links.github }}" target="_blank" rel="noopener noreferrer" title="GitHub"><i class="fa-brands fa-github"></i></a>{% endif %}
            {% if m.links.linkedin %}<a href="{{ m.links.linkedin }}" target="_blank" rel="noopener noreferrer" title="LinkedIn"><i class="fa-brands fa-linkedin"></i></a>{% endif %}
            {% if m.links.scholar %}<a href="{{ m.links.scholar }}" target="_blank" rel="noopener noreferrer" title="Google Scholar"><i class="ai ai-google-scholar"></i></a>{% endif %}
          </div>
        </article>
        {% endfor %}
      </div>
    </section>

  </div>
</main>
