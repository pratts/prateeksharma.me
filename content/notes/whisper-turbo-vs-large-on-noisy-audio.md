---
title: "Whisper's turbo model beat large on noisy audio, in practice"
date: 2026-08-31
draft: false
tags: [Python, Whisper, Audio]
related:
  - /projects/video-translator/
---

Building the [Video Translator](/projects/video-translator/), the assumption
going in was that OpenAI Whisper's larger model would transcribe more
accurately. In practice, on clips with loud background music, the `turbo` model
did noticeably better than `large`. It seems to tolerate messy audio better,
rather than just being a faster, lower-quality option. Separating vocals from
background music first (with demucs) didn't help as much as expected either;
Whisper handled the mixed track better on its own. Worth trying `turbo` first
rather than assuming bigger is more accurate.
