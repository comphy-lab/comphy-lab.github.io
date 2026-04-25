---
layout: default
title: "News &amp; announcements"
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
    <article class="news-item news-item--{{ n.kind }}" data-kind="{{ n.kind }}">
      <div class="news-item__date">
        <span class="news-item__day">{{ d }}</span>
        <span class="news-item__mo">{{ mo }}</span>
      </div>

      <div class="news-item__body">
        {% if n.kind == "paper" %}
        <div class="news-item__thumb">
          {% if n.thumb %}<img src="{{ n.thumb }}" alt="" loading="lazy" decoding="async" onerror="this.style.display='none'" />{% endif %}
        </div>
        {% else %}
        <div class="news-item__avatar">{{ n.avatar | default: "·" }}</div>
        {% endif %}
        <div>
          <div class="news-item__kicker">
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
          <h3 class="news-item__title">{{ n.title }}</h3>
          <p class="news-item__meta">{{ n.meta }}</p>
        </div>
      </div>

      <a class="btn-ghost news-item__action" href="{{ n.action_href }}"
         {% if n.action_href contains "://" %}target="_blank" rel="noopener noreferrer"{% endif %}>
        {{ n.action_label }}
      </a>
    </article>
    {% endfor %}
  </div>
</main>

<style>
  .news-page {
    width: min(100% - 2rem, var(--maxw-page));
    margin: 0 auto;
    padding: var(--s-9) 0 var(--s-8);
    position: relative;
    z-index: 1;
  }
  .news-page__head {
    max-width: 68ch;
    margin: 0 auto var(--s-8);
    text-align: center;
  }
  .news-page__kicker {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    font-family: var(--t-sans);
    font-size: var(--t-eyebrow);
    font-weight: 600;
    letter-spacing: var(--t-track-wide);
    text-transform: uppercase;
    color: var(--fg-2);
    margin-bottom: var(--s-4);
  }
  .news-page__kicker .rule {
    width: 32px;
    height: 1px;
    background: var(--c-border-strong);
  }
  .news-page__title {
    font-family: var(--t-serif);
    font-weight: 600;
    font-size: clamp(32px, 4vw, 48px);
    line-height: 1.1;
    letter-spacing: -0.02em;
    color: var(--fg-strong);
    font-variation-settings: "opsz" 96;
    margin: 0 0 var(--s-4);
    text-wrap: balance;
  }
  .news-page__lede {
    font-family: var(--t-serif);
    font-weight: 400;
    font-size: var(--t-body-lg);
    line-height: 1.55;
    color: var(--fg-1);
    margin: 0 auto;
    max-width: 60ch;
    font-variation-settings: "opsz" 18;
  }
  .news-page .newsfeed {
    display: grid;
    gap: 0;
    border-top: 1px solid var(--c-border);
  }
  .news-page .news-item {
    display: grid;
    grid-template-columns: 90px 1fr auto;
    gap: var(--s-5);
    padding: var(--s-5) 0;
    border-bottom: 1px solid var(--c-border);
    align-items: start;
  }
  .news-page .news-item__date {
    display: grid; text-align: center;
    padding: var(--s-3) var(--s-2);
    background: color-mix(in srgb, var(--c-brand-purple) 6%, transparent);
    border: 1px solid color-mix(in srgb, var(--c-brand-purple) 15%, transparent);
    border-radius: var(--r-sm);
  }
  .news-page .news-item__day {
    font-family: var(--t-serif); font-weight: 700;
    font-size: 30px; line-height: 1;
    color: var(--c-brand-purple);
    letter-spacing: -0.02em;
    font-variation-settings: "opsz" 48;
  }
  [data-theme="dark"] .news-page .news-item__day { color: #d99adc; }
  .news-page .news-item__mo {
    font-family: var(--t-mono);
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: var(--t-track-wide);
    color: var(--fg-2);
    margin-top: 6px;
  }
  .news-page .news-item__kicker {
    display: inline-flex; align-items: center; gap: 6px;
    font-family: var(--t-sans);
    font-size: var(--t-eyebrow);
    font-weight: 700;
    letter-spacing: var(--t-track-wide);
    text-transform: uppercase;
    color: var(--fg-2);
    margin-bottom: 6px;
  }
  .news-page .news-item__kicker .swatch { width: 8px; height: 8px; border-radius: 2px; }
  .news-page .news-item[data-kind="paper"] .swatch { background: var(--c-brand-purple); }
  .news-page .news-item[data-kind="talk"] .swatch { background: var(--c-accent-coral); }
  .news-page .news-item[data-kind="people"] .swatch,
  .news-page .news-item[data-kind="move"] .swatch,
  .news-page .news-item[data-kind="award"] .swatch { background: var(--c-accent-teal); }
  .news-page .news-item__title {
    font-family: var(--t-serif);
    font-weight: 600;
    font-size: var(--t-body-lg);
    line-height: 1.35;
    color: var(--fg-strong);
    margin: 0 0 var(--s-2);
    letter-spacing: -0.005em;
    max-width: 58ch;
    font-variation-settings: "opsz" 24;
  }
  .news-page .news-item__meta {
    font-size: var(--t-small);
    color: var(--fg-2);
    line-height: 1.5;
    margin: 0;
    max-width: 68ch;
  }
  .news-page .news-item__meta em { font-family: var(--t-serif); font-variation-settings: "opsz" 14; }
  .news-page .news-item__meta strong { color: var(--c-accent-coral); font-weight: 600; }
  .news-page .news-item__action { align-self: center; }
  .news-page .news-item--paper .news-item__body {
    display: grid; grid-template-columns: 88px 1fr; gap: var(--s-4);
  }
  .news-page .news-item__thumb {
    width: 88px; height: 104px;
    border-radius: var(--r-xs);
    overflow: hidden;
    background: linear-gradient(135deg, var(--c-brand-purple), var(--c-brand-blue));
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .news-page .news-item__thumb img { width: 100%; height: 100%; object-fit: cover; }
  .news-page .news-item--people .news-item__body,
  .news-page .news-item--move .news-item__body,
  .news-page .news-item--award .news-item__body {
    display: grid; grid-template-columns: 56px 1fr; gap: var(--s-4); align-items: start;
  }
  .news-page .news-item__avatar {
    width: 56px; height: 56px; border-radius: 50%;
    background: linear-gradient(145deg, var(--c-accent-teal), var(--c-brand-purple));
    display: flex; align-items: center; justify-content: center;
    color: #fff; font-family: var(--t-serif); font-weight: 600; font-size: 20px;
    letter-spacing: -0.02em;
    flex-shrink: 0;
  }
  @media (max-width: 760px) {
    .news-page .news-item { grid-template-columns: 70px 1fr; }
    .news-page .news-item__action { grid-column: 1 / -1; justify-self: start; margin-top: var(--s-2); }
  }
</style>
