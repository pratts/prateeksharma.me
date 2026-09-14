---
title: "Patched OpenVoice for short-clip cloning and CPU inference"
date: 2025-06-20
draft: false
contribution_type: other
project: myshell-ai/OpenVoice
link: https://github.com/pratts/OpenVoice
status: "Personal fork, not submitted upstream"
description: "Relaxed the minimum-segment-length check in se_extractor.py so sub-1.5s lines can be cloned, and made the pipeline run on CPU (Apple M1)."
categories: [Programming]
tags: [Python, OpenVoice, TTS, Voice Cloning]
related:
  - /projects/audio-cloning/
---

While building the [Audio Cloning](/projects/audio-cloning/) stage of my
video-translator pipeline, I hit two blockers in [OpenVoice](https://github.com/myshell-ai/OpenVoice):

- `openvoice/se_extractor.py` discarded audio segments shorter than 1.5 seconds,
  which meant short subtitle lines (`hello`, `hi`, `bye`) couldn't be cloned at
  all. I relaxed the threshold to ~0.5 seconds and added an explicit skip for
  lines too short to process.
- The library assumed a CUDA GPU. I patched it to run on CPU so it worked on
  Apple M1.

The changes live in my fork at
[github.com/pratts/OpenVoice](https://github.com/pratts/OpenVoice). They were
scoped to my use case and haven't been proposed upstream.
