---
layout: default
title: "News & announcements"
permalink: /news/
body_class: news-v2
description: >-
  Full news archive for the CoMPhy Lab — papers, talks, and
  announcements, most recent first.
---

{% assign news_items = site.data.news.items | sort: "date" | reverse %}

<main class="news-page">
  <header class="news-page__head">
    <p class="news-page__kicker">
      <span class="rule" aria-hidden="true"></span>
      <span>CoMPhy Lab · News archive</span>
      <span class="rule" aria-hidden="true"></span>
    </p>
    <h1 class="news-page__title">News &amp; announcements</h1>
    <p class="news-page__lede">Papers, talks, arrivals, and awards.</p>
  </header>

  <div class="newsfeed newsfeed--archive">
    {% for n in news_items %}
    {% assign d = n.date | date: "%-d" %}
    {% assign mo = n.date | date: "%b %y" %}
    <article class="news-row news-row--{{ n.kind }}" data-kind="{{ n.kind }}">
      <div class="news-row__date">
        <span class="news-row__day">{{ d }}</span>
        <span class="news-row__mo">{{ mo }}</span>
      </div>

      <div class="news-row__body">
        {% if n.kind == "paper" %}
        <div class="news-row__thumb">
          {% if n.thumb %}<img src="{{ n.thumb }}" alt="" loading="lazy" decoding="async" data-image-state="hide-on-error" />{% endif %}
        </div>
        {% else %}
        <div class="news-row__avatar">{{ n.avatar | default: "·" }}</div>
        {% endif %}
        <div class="news-row__copy">
          <div class="news-row__kicker">
            <span class="swatch" aria-hidden="true"></span>
            {% case n.kind %}
              {% when "paper" %}Paper
              {% when "talk" %}Talk
              {% when "people" %}People
              {% when "move" %}Announcement
              {% when "award" %}Award
              {% else %}Update
            {% endcase %}
          </div>
          <h2 class="news-row__title">{{ n.title }}</h2>
          <p class="news-row__meta">{{ n.meta }}</p>
        </div>
      </div>

      <a class="btn-ghost news-row__action" href="{{ n.action_href }}"
         {% if n.action_href contains "://" %}target="_blank" rel="noopener noreferrer"{% endif %}
         {% if n.action_label == "Read more" %}aria-label="Read more about {{ n.title | strip_html | escape }}"{% endif %}>
        {{ n.action_label }}
        {% if n.action_label == "Read more" %}
        <span class="visually-hidden"> about {{ n.title | strip_html }}</span>
        {% endif %}
      </a>
    </article>
    {% endfor %}
  </div>
</main>
