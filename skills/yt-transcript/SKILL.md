---
name: yt-transcript
description: Fetch YouTube video transcripts and save them as markdown files. Use when user provides YouTube URLs and wants transcripts, captions, subtitles, or video text content. Supports youtube.com/watch, youtu.be, and embed URLs.
---

# YouTube Transcript Fetcher

Fetch transcripts from YouTube videos via the yt-transcript CLI.

## Usage

Pipe YouTube URLs to the CLI via stdin:

```bash
echo "https://www.youtube.com/watch?v=VIDEO_ID" | bun run /home/thierry/Work/Sideprojects/yt-transcript/index.ts
```

Multiple URLs (one per line):

```bash
echo -e "https://www.youtube.com/watch?v=ID1\nhttps://youtu.be/ID2" | bun run /home/thierry/Work/Sideprojects/yt-transcript/index.ts
```

Custom output directory:

```bash
echo "URL" | bun run /home/thierry/Work/Sideprojects/yt-transcript/index.ts --output-dir ./my-transcripts
```

## Output

Transcripts are saved as markdown with YAML frontmatter:

```markdown
---
title: "Video Title"
url: "https://www.youtube.com/watch?v=..."
---

[0:00] First line of transcript

[0:05] Second line of transcript
```

The CLI outputs the absolute path to the results folder on the last line. Read the generated `.md` files to access transcript content.

## Workflow

1. Collect YouTube URLs from user
2. Pipe URLs to the CLI via stdin
3. Parse the output to get the results folder path (last line)
4. Read the generated markdown files to show transcripts
