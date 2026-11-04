---
title: Subtitles Generator
date: 2026-10-31
draft: false
featured: false
lastmod: 2026-11-04T09:57:14Z
description: "A CLI that generates word-timed subtitles for any video and translates them into any language, using Whisper for transcription and a choice of GPT or Google Translate."
status: experiment
categories: [Programming, Developer Tools]
tags: [Python, Whisper, Translation, CLI]
tech: [Python, WhisperX, FFmpeg, OpenAI, Google Cloud Translation]
code: https://github.com/pratts/subtitles-generator
---

[Subtitles Generator](https://github.com/pratts/subtitles-generator) turns a
video into subtitles with one command: `subtitle video.mp4 --to en,fr`
detects the spoken language, transcribes it with Whisper, times every word
to the audio, and writes `.srt` files in the original language and in
however many other languages you ask for.

It's a spin-off of [Video Translator](/projects/video-translator/), stripped
down to just the subtitle half of that pipeline: no voice cloning or dubbing,
just accurate, well-timed text in as many languages as needed.

## Per-word timing, not per-sentence

Whisper's own timestamps are per-segment, which tends to produce subtitle
lines that start too early or linger after the speaker has moved on. Each
word is aligned to the audio separately, so a line's start and end match the
speech, and long sentences split between words rather than wherever Whisper
happened to end a segment.

## A glossary so names survive transcription and translation

Whisper regularly mangles names and place names, and a plain translation
mangles them again. A JSON glossary maps a source term to how it should
read in the target language; its source-language spellings are fed to
Whisper as a prompt so it transcribes them correctly in the first place
(for Japanese and Chinese, this also tends to improve punctuation and line
breaks), and the same glossary keeps every target language's translator
consistent about how it renders those names afterward.

## Two translators, different trade-offs

`gpt` (OpenAI, or a local model through Ollama) uses the glossary and a
one-line description of the video to translate naturally, with neighbouring
lines as context. `google` translates literally, line by line, without
either. GPT costs more per language but reads better; Google is cheaper and
needs a Google Cloud service account instead of an OpenAI key.

## Resumable by design

Every finished step is recorded per video, so re-running the same command to
add another language only runs translation, not transcription and alignment
again. An interrupted run picks up where it left off instead of starting
over.

The [repo README](https://github.com/pratts/subtitles-generator) has the
full setup and usage instructions, including an optional `--separate` step
that strips music and background noise before transcription.
