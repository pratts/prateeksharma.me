---
title: Audio Cloning
date: 2025-06-23
draft: false
featured: false
description: "A patched fork of OpenVoice that clones a speaker's voice for short subtitle lines and runs on CPU: the TTS stage of the Video Translator pipeline."
status: experiment
categories: [Programming]
tags: [Python, OpenVoice, MeloTTS, TTS, Voice Cloning]
tech: [Python, OpenVoice, MeloTTS]
code: https://github.com/pratts/OpenVoice
related:
  - /projects/video-translator/
  - /open-source/openvoice-short-clip-patch/
---

This is an extension of the [Video Translator](/projects/video-translator/) tool
that generates cloned audio for short subtitles, improving the quality of the
dubbed output. It uses [OpenVoice](https://github.com/myshell-ai/OpenVoice) and
[MeloTTS](https://github.com/myshell-ai/MeloTTS) to clone the original speaker's
voice.

## Challenges

1. **Library compatibility.** The libraries weren't functional on Python 3.12,
   which I was using; they worked on 3.10. So the TTS stage couldn't live in the
   same script as the rest of the pipeline.
2. **Short subtitles.** The libraries needed a longer sample to clone a voice
   well, and very short lines (`hello`, `hi`, `bye`) errored out.

## What I changed in the fork

- `openvoice/se_extractor.py` had a check that discarded audio segments shorter
  than 1.5 seconds. Words like `hello` fall under that. I relaxed the check to
  allow segments down to ~0.5 seconds, and added a skip for lines too short to
  process.
- Added `melo-tts` to `requirements.txt` (the docs mention it but don't pin it).
- Added a driver script that points at a `video-translator` output folder and
  runs cloning across every generated audio file.
- Patched the library to run on CPU for Apple M1.

The fork is at [github.com/pratts/OpenVoice](https://github.com/pratts/OpenVoice);
`test1.py` runs the cloning over the translator's output.
