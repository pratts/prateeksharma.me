+++
title = '{{ replace .File.ContentBaseName "-" " " | title }}'
author = ''
date = {{ .Date }}
draft = true
status = 'want-to-read'    # want-to-read | reading | read | paused | abandoned
# rating = 5               # 1–5, once read
review = false             # set true and write the review in the body
# started = 'Jan 2026'
# finished = 'Feb 2026'
# priority = 1             # ordering on the reading list
# link = ''                # publisher / book page
description = ''
categories = ['Distributed Systems']
tags = []
# note = 'One-line note for the bookshelf / reading list.'
+++

Add a `cover.jpg` next to this file (page bundle:
`hugo new books/the-book/index.md`). Review sections are freeform — a single
paragraph is valid, or use headings like What I liked / Key ideas / Notes.
