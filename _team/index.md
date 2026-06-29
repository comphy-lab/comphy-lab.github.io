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
        {%- assign member_id = m.slug | default: m.name | slugify -%}
        <article class="t-member {% if m.is_pi %}t-member--pi{% endif %}" id="{{ member_id }}">
          <div class="t-member__photo {% unless m.photo %}t-member__photo--ph{% endunless %}">
            {% if m.photo %}
              <img src="{{ m.photo }}" alt="Portrait of {{ m.name }}" loading="lazy" decoding="async" />
            {% else %}
              {%- assign clean_name = m.name | replace: "Dr. ", "" | replace: "Prof. ", "" | replace: "Adj. Prof. ", "" -%}
              {%- assign name_words = clean_name | split: " " -%}
              {%- capture initials -%}
                {%- for word in name_words -%}
                  {%- assign first_char = word | slice: 0, 1 -%}
                  {%- unless first_char == "(" -%}{{ first_char }}{%- endunless -%}
                {%- endfor -%}
              {%- endcapture -%}
              {{ initials | strip | upcase | slice: 0, 2 }}
            {% endif %}
          </div>
          <div>
            <p class="t-member__name">
              {% if m.slug %}<a class="t-member__name-link" href="#{{ member_id }}">{{ m.name }}</a>{% else %}{{ m.name }}{% endif %}
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
      </header>
      <div class="roster-grid">
        {% for m in team.collaborators %}
        <article class="t-member" id="{{ m.slug | default: m.name | slugify }}">
          <div class="t-member__photo t-member__photo--ph">
            {%- assign clean_name = m.name | replace: "Dr. ", "" | replace: "Prof. ", "" | replace: "Adj. Prof. ", "" -%}
            {%- assign name_words = clean_name | split: " " -%}
            {%- capture initials -%}
              {%- for word in name_words -%}
                {%- assign first_char = word | slice: 0, 1 -%}
                {%- unless first_char == "(" -%}{{ first_char }}{%- endunless -%}
              {%- endfor -%}
            {%- endcapture -%}
            {{ initials | strip | upcase | slice: 0, 2 }}
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
            {%- assign clean_name = m.name | replace: "Dr. ", "" | replace: "Prof. ", "" | replace: "Adj. Prof. ", "" -%}
            {%- assign name_words = clean_name | split: " " -%}
            {%- capture initials -%}
              {%- for word in name_words -%}
                {%- assign first_char = word | slice: 0, 1 -%}
                {%- unless first_char == "(" -%}{{ first_char }}{%- endunless -%}
              {%- endfor -%}
            {%- endcapture -%}
            {{ initials | strip | upcase | slice: 0, 2 }}
          </div>
          <div>
            <p class="t-member__name">{{ m.name }}</p>
            <div class="t-member__role">{{ m.role }}</div>
          </div>
          <p class="t-member__bio">{{ m.bio }}</p>
          {% if m.thesis.href %}
          <a class="t-member__thesis" href="{{ m.thesis.href }}" target="_blank" rel="noopener noreferrer" title="{{ m.thesis.title }}">
            <i class="fa-solid fa-file-pdf"></i>
            <span>Thesis — <em>{{ m.thesis.title }}</em></span>
          </a>
          {% endif %}
          <div class="t-member__links">
            {% if m.links.github %}<a href="{{ m.links.github }}" target="_blank" rel="noopener noreferrer" title="GitHub"><i class="fa-brands fa-github"></i></a>{% endif %}
            {% if m.links.linkedin %}<a href="{{ m.links.linkedin }}" target="_blank" rel="noopener noreferrer" title="LinkedIn"><i class="fa-brands fa-linkedin"></i></a>{% endif %}
            {% if m.links.scholar %}<a href="{{ m.links.scholar }}" target="_blank" rel="noopener noreferrer" title="Google Scholar"><i class="ai ai-google-scholar"></i></a>{% endif %}
          </div>
        </article>
        {% endfor %}
      </div>
    </section>

    {% comment %} ---------------- World map ---------------- {% endcomment %}
    <section class="t-map" id="map" aria-labelledby="t-map-title">
      <header class="t-map__head">
        <span class="t-map__num">04 · Around the world</span>
        <h2 id="t-map-title" class="t-map__title">Team, collaborators, and conference visits</h2>
        <p class="t-map__sub">
          Locations meet one of four criteria, in this order of
          preference:
        </p>
        <ul class="t-map__legend" role="list">
          <li><span class="t-map__dot t-map__dot--hometown" aria-hidden="true"></span>
            <strong>Hometown</strong> of a team member or alum
          </li>
          <li><span class="t-map__dot t-map__dot--collab" aria-hidden="true"></span>
            <strong>Base</strong> of an active collaborator
          </li>
          <li><span class="t-map__dot t-map__dot--talk" aria-hidden="true"></span>
            <strong>Talks</strong> we've given
          </li>
          <li><span class="t-map__dot t-map__dot--visit" aria-hidden="true"></span>
            <strong>Places</strong> we've visited (no talk)
          </li>
        </ul>
      </header>

      <div class="t-map__frame" id="team-map">
        {% comment %} Lightweight placeholder until the iframe is lazy-loaded. {% endcomment %}
        <div class="t-map__placeholder">
          <span>Loading the world map…</span>
        </div>
      </div>
    </section>

  </div>
</main>

<script>
  /* Lazy-load the Google Map iframe only when it's about to enter
     the viewport — saves a heavy iframe + Google scripts on initial
     team-page load. Falls back to immediate load when
     IntersectionObserver isn't available. */
  (function () {
    var frame = document.getElementById('team-map');
    if (!frame) return;
    var loaded = false;
    function load() {
      if (loaded) return; loaded = true;
      frame.innerHTML =
        '<iframe ' +
        'src="https://www.google.com/maps/d/u/0/embed?mid=1hOfYTnnie_7Bx45e9uA4gLXaaKreTXc&ehbc=2E312F&noprof=1&z=3&ll=42,-10" ' +
        'title="CoMPhy Lab — team, collaborators, and conference visits" ' +
        'loading="lazy" allowfullscreen ' +
        'referrerpolicy="no-referrer-when-downgrade" ' +
        'sandbox="allow-scripts allow-same-origin allow-popups"></iframe>';
    }
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) { load(); io.disconnect(); } });
      }, { rootMargin: '300px' });
      io.observe(frame);
    } else {
      load();
    }
  })();
</script>
