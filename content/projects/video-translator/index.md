---
title: Video Translator
date: 2025-06-23
draft: false
featured: false
description: "A local AI dubbing pipeline that transcribes a video's audio, translates it, and re-synthesizes speech in the target language using open-source models."
status: experiment
categories: [Programming, Developer Tools]
tags: [Python, Whisper, FFmpeg, Translation, Demucs, TTS]
tech: [Python, OpenAI Whisper, FFmpeg, demucs]
code: https://github.com/pratts/video-translator
related:
  - /projects/audio-cloning/
---

I always wanted to watch Japanese anime and other foreign-language films in
English without living in the subtitles. During a break I decided to see how far
open-source models could get me, and built a script that:

1. Extracts the background audio from the video.
2. Transcribes it to a subtitle file in the original language.
3. Translates each subtitle to English.
4. Converts the translated subtitles to audio.
5. Merges the translated audio with the background track.
6. Muxes the final audio back into the video.

I wanted to lean on open-source tooling and minimize paid services:

- [OpenAI Whisper](https://github.com/openai/whisper): transcription. The
  `turbo` model worked better than `large` for my clips.
- [FFmpeg](https://ffmpeg.org/): all the audio/video muxing.
- [demucs](https://github.com/facebookresearch/demucs): vocal/background
  separation.
- [srt](https://pypi.org/project/srt/): reading/writing subtitle files.
- ChatGPT / Google Translate API: translation, with an option to pick between
  them (Google is more literal; ChatGPT adds a human touch).

## What was actually hard

1. **Transcription with loud background music.** Separating vocals with demucs
   didn't help much in my cases. Whisper was trained on messy audio and did
   better on the raw track.
2. **Translation quality vs. tone.** Google Translate was the most accurate;
   ChatGPT read more naturally. The script lets you choose.
3. **Open-source TTS quality.** Bark produced distorted output on some lines. I
   moved to voice cloning with OpenVoice + MeloTTS, which became its own project,
   [Audio Cloning](/projects/audio-cloning/).
4. **Audio length drift.** Translated speech is often longer than the original,
   which breaks the mux. Some lines need trimming.
5. **Apple M1.** The libraries assume CUDA; running on CPU was slow and needed
   OpenVoice patched to not require a GPU.

The [repo README](https://github.com/pratts/video-translator) has the full
run instructions.
