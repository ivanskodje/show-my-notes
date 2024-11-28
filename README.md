# Show My Notes

This is a simple note **publishing** app, publishing markdown notes from a specific GitHub folder to the web. This is particulary useful when working with tools such as [Obsidian](https://obsidian.md/) that have setup automatic syncing with GitHub.

## What this is NOT

- This is not a note editor

## Features

- Automatically display your markdown notes from github.
- Search and notes by title and tags.

## Screenshots

Home Page:
![](/docs/images/homepage.png)

Note Page:
![](/docs/images/note-example-dark.png)

Note Page (Light Theme):
![](/docs/images/note-example-light.png)

Supports annotated comments:

```markdown
> [!info]
> This is an info block

> [!warning]
> This is a warning block

> [!error]
> This is an error block

> [!success]
> This is a success block
```

![](/docs/images/annotations-example.png)

Supports annotated comments with custom titles:

```markdown
> [!info] Custom Title
> This is an info block

> [!warning] Custom Warning Title
> This is a warning block

> [!error] Custom Error Title
> This is an error block

> [!success] Custom Success Title
> This is a success block
```

![](/docs/images/annotations-example-2.png)

## Getting Started

To get started, follow these steps:

1. Clone the repository:

```bash
git clone https://github.com/ivanskodje/show-my-notes.git
```

2. Install dependencies:

```bash
yarn install
```

1. Create a `.env` file in the root directory, by copying the `.env.example` file:

```bash
cp .env.example .env
```

2. Open the `.env` file and add your GitHub personal access token if your repo is private:

```bash
GITHUB_PERSONAL_ACCESS_TOKEN=your-github-personal-access-token
```

3. Start the development server:

```bash
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to view the app.

## Contributing

Contributions are welcome!

## License

This project is licensed under the **Apache License 2.0**.

You are free to use, modify, and distribute this project, even for commercial purposes, as long as you give proper credit to the original author and link back to this repository or website.

For full details, please see the [LICENSE](./LICENSE) file.
