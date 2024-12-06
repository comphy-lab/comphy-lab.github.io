---
layout: default
title: Home
---

# Welcome to the CoMPhy Lab

The Computational Multiphase Physics Laboratory (CoMPhy Lab) is dedicated to advancing our understanding of complex multiphase systems through computational methods and theoretical physics.

## Our Mission

We strive to develop and apply cutting-edge computational techniques to solve challenging problems in multiphase physics, bridging fundamental theoretical understanding with practical applications.

## Research Highlights

- Multiphase Flow Dynamics
- Computational Fluid Dynamics (CFD)
- Interface Physics and Dynamics
- Advanced Numerical Methods
- Machine Learning in Multiphase Systems

[Learn more about our research](/research)

## Latest News

{% for post in site.posts limit:3 %}
- {{ post.date | date: "%B %d, %Y" }} - [{{ post.title }}]({{ post.url }})
{% endfor %}

[View all news](/news) 