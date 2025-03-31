This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

## Project structure

```bash
app/
├── components/
│   ├── Reader/
│   │   ├── ReaderView.tsx        # Server Component (main reader container)
│   │   ├── ReaderUI/
│   │   │   ├── UIBar.tsx         # Server Component
│   │   │   ├── ClientUIBar.tsx   # Client Component (interactive elements)
│   │   │   └── UIControls/       # Folder for individual UI controls
│   │   └── ReaderContent/
│   │       ├── Content.tsx       # Server Component
│   │       └── ClientContent.tsx # Client Component (interactive reader)
│   └── common/                   # Shared components
├── contexts/
│   └── theme/
│       ├── ThemeContext.tsx      # Client context
│       └── ThemeProvider.tsx     # Client provider
└── lib/
    └── reader/                   # Reader-specific utilities
```
